import * as Phaser from "phaser";

/* ============================================================
 *  MODULE CARTE
 *  ------------------------------------------------------------
 *  Icône carte disponible dans chaque scène. Au clic, affiche
 *  map.png en grand avec un point par lieu. Le lieu courant est
 *  marqué par la tête du personnage (perso.png) sous son point.
 *  Cliquer sur un autre point y téléporte le joueur.
 *
 *  NOUVEAU : un point n'apparaît sur la carte QUE SI le joueur a déjà
 *  visité ce lieu au moins une fois (voir "LIEUX DÉJÀ VISITÉS" plus bas).
 * ============================================================ */

/* ------------------------------------------------------------
 *  LISTE DES LIEUX — C'EST ICI QUE TU AJOUTES TES SCÈNES
 * ------------------------------------------------------------
 *  - scene : la CLÉ de la scène (celle du super({ key: "..." }))
 *  - nom   : le nom affiché à côté du point
 *  - x, y  : position du point sur la carte, en POURCENTAGE (0 à 1)
 *            x = 0 -> bord gauche de la carte, x = 1 -> bord droit
 *            y = 0 -> haut de la carte,        y = 1 -> bas
 *
 *  Pour ajouter un lieu plus tard : une seule ligne à rajouter ici,
 *  et le point apparaîtra automatiquement (une fois ce lieu visité).
 * ------------------------------------------------------------ */
export const lieux = [
  { scene: "gendarmerie2", nom: "Gendarmerie", x: 0.30, y: 0.40 },
  { scene: "cafet", nom: "Café", x: 0.65, y: 0.60 },
  { scene: "accueil", nom: "Accueil", x: 0.55, y: 0.30 },
  { scene: "gendarmerie3", nom: "Rue", x: 0.30, y: 0.70 },


  // { scene: "ville", nom: "Ville", x: 0.50, y: 0.25 },
  // { scene: "opera", nom: "Opéra", x: 0.80, y: 0.30 },
];

/* ------------------------------------------------------------
 *  LIEUX DÉJÀ VISITÉS
 * ------------------------------------------------------------
 *  Stockés dans le registry (comme l'inventaire), donc ça survit à
 *  tous les changements de scène et c'est acquis pour toujours.
 * ------------------------------------------------------------ */

// Retourne la liste des clés de scène déjà visitées
function obtenirLieuxVisites(scene) {
  return scene.registry.get("lieux_visites") || [];
}

// Marque un lieu comme visité (ne fait rien s'il l'est déjà)
function marquerLieuVisite(scene, cleScene) {
  const visites = obtenirLieuxVisites(scene);
  if (!visites.includes(cleScene)) {
    visites.push(cleScene);
    scene.registry.set("lieux_visites", visites);
  }
}

/* ------------------------------------------------------------
 *  MODE PLACEMENT
 *  Mets-le à true : quand tu cliques sur la carte, les coordonnées
 *  en pourcentage s'affichent à l'écran ET dans la console (F12).
 *  Tu n'as plus qu'à les recopier dans le tableau "lieux" ci-dessus.
 *  Remets false une fois tes points placés.
 * ------------------------------------------------------------ */
const MODE_PLACEMENT = true;

export class CarteUI {
  constructor(scene, options = {}) {
    this.scene = scene;
    this.ouvert = false;
    // Clé de la scène courante, pour savoir où placer la tête du perso
    this.sceneActuelle = scene.scene.key;

    // NOUVEAU : le simple fait d'arriver dans cette scène marque son lieu
    // comme "visité" pour toujours -> il pourra apparaître sur la carte.
    marquerLieuVisite(scene, this.sceneActuelle);

    const largeur = scene.cameras.main.width;
    const hauteur = scene.cameras.main.height;

    // ---- ICÔNE CARTE, fixe à l'écran ----
    // Par défaut en bas à droite, à gauche de l'icône inventaire.
    const posX = options.x !== undefined ? options.x : largeur - 120;
    const posY = options.y !== undefined ? options.y : hauteur - 50;

    this.icone = scene.add
      .image(posX, posY, "carte")
      .setScrollFactor(0) // reste collée à l'écran
      .setDepth(2000)
      .setInteractive({ useHandCursor: true });

    this.icone.setDisplaySize(70, 55); // ajuste la taille de l'icône ici

    this.icone.on("pointerdown", () => this.basculer());

    // NOUVEAU : l'icône est cachée tant que la carte n'a pas été débloquée
    // (ramassage de l'objet carte). Une fois débloquée, ça reste vrai pour
    // toujours (registry -> survit à tous les changements de scène).
    const debloquee = scene.registry.get("carte_debloquee") || false;
    this.icone.setVisible(debloquee);

    // ---- CONTENEUR DE LA CARTE (caché au départ) ----
    this.panneau = scene.add.container(0, 0);
    this.panneau.setDepth(2500);
    this.panneau.setVisible(false);
  }

  // NOUVEAU : débloque la carte pour de bon (à appeler au ramassage de l'objet carte)
  debloquer() {
    this.scene.registry.set("carte_debloquee", true);
    this.icone.setVisible(true);
  }

  basculer() {
    this.ouvert = !this.ouvert;
    if (this.ouvert) {
      this.construireCarte();
      this.panneau.setVisible(true);
    } else {
      this.panneau.setVisible(false);
    }
  }

  fermer() {
    this.ouvert = false;
    this.panneau.setVisible(false);
  }

  construireCarte() {
    this.panneau.removeAll(true); // on repart d'une carte vide

    const scene = this.scene;
    const largeurJeu = scene.cameras.main.width;
    const hauteurJeu = scene.cameras.main.height;

    // NOUVEAU : la liste des lieux qu'on a le droit d'afficher sur cette carte
    const visites = obtenirLieuxVisites(scene);

    // ---- Voile sombre derrière la carte (clic = fermer) ----
    const voile = scene.add
      .rectangle(largeurJeu / 2, hauteurJeu / 2, largeurJeu, hauteurJeu, 0x000000, 0.75)
      .setScrollFactor(0)
      .setInteractive();
    voile.on("pointerdown", () => this.fermer());
    this.panneau.add(voile);

    // ---- L'image de la carte, centrée et redimensionnée sans déformation ----
    const carte = scene.add
      .image(largeurJeu / 2, hauteurJeu / 2, "map")
      .setScrollFactor(0);

    // On calcule l'échelle pour que la carte tienne dans l'écran
    const ratio = Math.min(
      (largeurJeu * 0.85) / carte.width,
      (hauteurJeu * 0.85) / carte.height
    );
    carte.setScale(ratio);
    this.panneau.add(carte);

    // Dimensions et coin haut-gauche de la carte affichée.
    // C'est la base de tous les calculs de position des points.
    const carteLargeur = carte.displayWidth;
    const carteHauteur = carte.displayHeight;
    const carteX = carte.x - carteLargeur / 2;
    const carteY = carte.y - carteHauteur / 2;

    // ---- Titre ----
    const titre = scene.add
      .text(largeurJeu / 2, carteY - 30, "Carte", {
        font: "bold 22px Arial",
        fill: "#ffffff",
      })
      .setOrigin(0.5)
      .setScrollFactor(0);
    this.panneau.add(titre);

    const aide = scene.add
      .text(largeurJeu / 2, carteY + carteHauteur + 12, "Clique sur un lieu pour t'y rendre", {
        font: "13px Arial",
        fill: "#9a9a9a",
      })
      .setOrigin(0.5, 0)
      .setScrollFactor(0);
    this.panneau.add(aide);

    // ---- MODE PLACEMENT : affiche les coordonnées au clic sur la carte ----
    if (MODE_PLACEMENT) {
      carte.setInteractive({ useHandCursor: true });

      const lecture = scene.add
        .text(largeurJeu / 2, carteY - 55, "Mode placement : clique sur la carte", {
          font: "13px Arial",
          fill: "#ffff00",
        })
        .setOrigin(0.5)
        .setScrollFactor(0);
      this.panneau.add(lecture);

      carte.on("pointerdown", (pointer, x, y, event) => {
        // Empêche le clic de se propager au voile (qui fermerait la carte)
        if (event) event.stopPropagation();

        // On convertit la position du clic en pourcentage de la carte
        const px = (pointer.x - carteX) / carteLargeur;
        const py = (pointer.y - carteY) / carteHauteur;
        const texte = "x: " + px.toFixed(3) + ", y: " + py.toFixed(3);
        lecture.setText(texte);
        console.log("Position carte -> " + texte);
      });
    }

    // ---- LES POINTS DES LIEUX ----
    lieux.forEach((lieu) => {
      // NOUVEAU : on ne dessine RIEN pour un lieu pas encore visité -> il
      // n'existe tout simplement pas sur la carte tant qu'on n'y est pas allé.
      if (!visites.includes(lieu.scene)) return;

      // Conversion pourcentage -> pixels à l'écran
      const pointX = carteX + lieu.x * carteLargeur;
      const pointY = carteY + lieu.y * carteHauteur;

      const estIci = lieu.scene === this.sceneActuelle;

      // Zone de clic un peu plus large que le point, pour viser facilement
      const zoneClic = scene.add
        .circle(pointX, pointY, 18, 0xffffff, 0)
        .setScrollFactor(0)
        .setInteractive({ useHandCursor: true });
      this.panneau.add(zoneClic);

      // Halo autour du point
      const halo = scene.add
        .circle(pointX, pointY, 12, estIci ? 0xffff00 : 0xff0000, 0.25)
        .setScrollFactor(0);
      this.panneau.add(halo);

      // Le point lui-même (jaune si c'est là qu'on est, rouge sinon)
      const point = scene.add
        .circle(pointX, pointY, 7, estIci ? 0xffff00 : 0xff0000)
        .setScrollFactor(0)
        .setStrokeStyle(2, 0xffffff);
      this.panneau.add(point);

      // Nom du lieu au-dessus du point
      const nom = scene.add
        .text(pointX, pointY - 28, lieu.nom, {
          font: "bold 13px Arial",
          fill: "#ffffff",
          backgroundColor: "rgba(0,0,0,0.65)",
          padding: { left: 6, right: 6, top: 3, bottom: 3 },
        })
        .setOrigin(0.5)
        .setScrollFactor(0);
      this.panneau.add(nom);

      // ---- TÊTE DU PERSONNAGE sous le point où l'on se trouve ----
      if (estIci) {
        const tete = scene.add
          .image(pointX, pointY + 26, "perso")
          .setScrollFactor(0);
        tete.setDisplaySize(34, 34);
        this.panneau.add(tete);

        // Petite animation pour attirer l'oeil sur sa position
        scene.tweens.add({
          targets: halo,
          scale: 1.6,
          alpha: 0,
          duration: 1200,
          repeat: -1,
        });
      }

      // ---- CLIC SUR UN POINT ----
      zoneClic.on("pointerdown", (pointer, x, y, event) => {
        // Empêche le clic de se propager au voile (qui fermerait la carte)
        if (event) event.stopPropagation();

        if (estIci) return; // on est déjà là, on ne fait rien

        this.fermer();
        scene.scene.start(lieu.scene);
      });

      // Effet visuel au survol
      zoneClic.on("pointerover", () => point.setScale(1.4));
      zoneClic.on("pointerout", () => point.setScale(1));
    });
  }
}