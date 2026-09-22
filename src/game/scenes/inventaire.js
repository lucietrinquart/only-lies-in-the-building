import * as Phaser from "phaser";
import { terminerTache } from "./taches.js";

/* ============================================================
 *  MODULE INVENTAIRE
 *  ------------------------------------------------------------
 *  Le contenu de l'inventaire est stocké dans le REGISTRY de Phaser
 *  (this.registry), qui appartient au JEU et non à la scène.
 *  Résultat : l'inventaire survit aux changements de scène
 *  (cafet -> gendarmerie -> ville...) sans aucun effort.
 *
 *  Chaque objet est un simple objet JS :
 *  { cle: "preuve_ticket", nom: "Ticket", description: "..." }
 *  où "cle" est la CLÉ DE TEXTURE de l'image chargée dans Phaser.
 * ============================================================ */

// Récupère le tableau de l'inventaire (le crée s'il n'existe pas encore)
export function getInventaire(scene) {
  let inv = scene.registry.get("inventaire");
  if (!inv) {
    inv = [];
    scene.registry.set("inventaire", inv);
  }
  return inv;
}

// Est-ce que le joueur possède déjà cet objet ?
export function possedeObjet(scene, cle) {
  return getInventaire(scene).some((objet) => objet.cle === cle);
}

// Ajoute un objet à l'inventaire (ne fait rien s'il y est déjà)
export function ajouterObjet(scene, cle, nom, description) {
  const inv = getInventaire(scene);
  if (possedeObjet(scene, cle)) return false;
  inv.push({ cle, nom, description });
  scene.registry.set("inventaire", inv);
  return true;
}

// NOUVEAU : retire un objet de l'inventaire (ex: quand on le "pose" quelque part)
export function retirerObjet(scene, cle) {
  const inv = getInventaire(scene);
  const nouvelInventaire = inv.filter((objet) => objet.cle !== cle);
  scene.registry.set("inventaire", nouvelInventaire);
  return nouvelInventaire.length !== inv.length; // true si quelque chose a été retiré
}

/* ------------------------------------------------------------
 *  MESSAGE TEMPORAIRE ("Ticket récupéré" pendant 5 secondes)
 * ------------------------------------------------------------ */
export function afficherMessage(scene, texte, duree = 5000) {
  const largeur = scene.cameras.main.width;

  const message = scene.add
    .text(largeur / 2, 60, texte, {
      font: "bold 20px Arial",
      fill: "#ffffff",
      backgroundColor: "rgba(0, 0, 0, 0.8)",
      padding: { left: 20, right: 20, top: 12, bottom: 12 },
    })
    .setOrigin(0.5)
    .setScrollFactor(0) // reste fixe à l'écran même si la caméra bouge
    .setDepth(2000);

  // Disparition en fondu à la fin de la durée
  scene.tweens.add({
    targets: message,
    alpha: 0,
    duration: 600,
    delay: duree - 600,
    onComplete: () => message.destroy(),
  });
}

/* ============================================================
 *  INTERFACE DE L'INVENTAIRE (icône sac + panneau)
 *  À instancier dans le create() de CHAQUE scène où tu veux
 *  que l'inventaire soit accessible.
 * ============================================================ */
export class InventaireUI {
  constructor(scene) {
    this.scene = scene;
    this.ouvert = false;
    this.vueActuelle = null; // référence vers la vue "objet en grand" actuellement ouverte, s'il y en a une

    const largeur = scene.cameras.main.width;
    const hauteur = scene.cameras.main.height;

    // ---- ICÔNE SAC, fixe en bas à droite ----
    this.icone = scene.add
      .image(largeur - 50, hauteur - 50, "sac")
      .setScrollFactor(0) // <- c'est ça qui la "colle" à l'écran
      .setDepth(2000)
      .setInteractive({ useHandCursor: true });

    this.icone.setDisplaySize(55, 55); // ajuste ici la taille de l'icône

    this.icone.on("pointerdown", () => this.basculer());

    // ---- PANNEAU DE L'INVENTAIRE (caché au départ) ----
    this.panneau = scene.add.container(0, 0);
    this.panneau.setDepth(2001);
    this.panneau.setVisible(false);
  }

  // Ouvre / ferme le panneau
  basculer() {
    this.ouvert = !this.ouvert;
    if (this.ouvert) {
      this.construirePanneau();
      this.panneau.setVisible(true);
    } else {
      this.panneau.setVisible(false);
    }
  }

  // Ferme juste le panneau (liste des objets), sans toucher à la vue "en grand"
  fermerInventaire() {
    this.ouvert = false;
    this.panneau.setVisible(false);
  }

  // NOUVEAU : ferme TOUT (la vue "objet en grand" ET le panneau) d'un coup.
  // C'est ce qu'on utilise quand une action contextuelle (ex: "poser le livre")
  // doit nous ramener directement à la scène de jeu.
  fermerTout() {
    if (this.vueActuelle) {
      this.vueActuelle.destroy(true);
      this.vueActuelle = null;
    }
    this.fermerInventaire();
  }

  // Reconstruit le contenu du panneau à chaque ouverture
  // (comme ça il est toujours à jour avec le contenu du registry)
  construirePanneau() {
    this.panneau.removeAll(true); // on vide l'ancien contenu

    const scene = this.scene;
    const largeur = scene.cameras.main.width;
    const hauteur = scene.cameras.main.height;

    // Dimensions du panneau
    const panneauLargeur = 320;
    const panneauHauteur = 220;
    const panneauX = largeur - panneauLargeur / 2 - 30;
    const panneauY = hauteur - panneauHauteur / 2 - 100;

    const fond = scene.add
      .rectangle(panneauX, panneauY, panneauLargeur, panneauHauteur, 0x1c1c1e, 0.95)
      .setScrollFactor(0)
      .setStrokeStyle(2, 0xffffff, 0.4);
    this.panneau.add(fond);

    const titre = scene.add
      .text(panneauX, panneauY - panneauHauteur / 2 + 15, "Inventaire", {
        font: "bold 16px Arial",
        fill: "#ffffff",
      })
      .setOrigin(0.5, 0)
      .setScrollFactor(0);
    this.panneau.add(titre);

    const inventaire = getInventaire(scene);

    // Cas où l'inventaire est vide
    if (inventaire.length === 0) {
      const vide = scene.add
        .text(panneauX, panneauY, "(vide)", {
          font: "14px Arial",
          fill: "#9a9a9a",
        })
        .setOrigin(0.5)
        .setScrollFactor(0);
      this.panneau.add(vide);
      return;
    }

    // Affichage des objets en grille
    const debutX = panneauX - panneauLargeur / 2 + 50;
    const debutY = panneauY - 20;
    const espacement = 75;

    inventaire.forEach((objet, index) => {
      const x = debutX + (index % 4) * espacement;
      const y = debutY + Math.floor(index / 4) * espacement;

      // Case de fond
      const case_ = scene.add
        .rectangle(x, y, 60, 60, 0x3a3a3c)
        .setScrollFactor(0)
        .setInteractive({ useHandCursor: true });

      // Miniature de l'objet
      const vignette = scene.add
        .image(x, y, objet.cle)
        .setScrollFactor(0);
      vignette.setDisplaySize(48, 48);

      // Nom sous la vignette
      const nom = scene.add
        .text(x, y + 38, objet.nom, {
          font: "11px Arial",
          fill: "#ffffff",
        })
        .setOrigin(0.5)
        .setScrollFactor(0);

      // Clic sur l'objet -> vue en grand
      case_.on("pointerdown", () => this.afficherObjetEnGrand(objet));

      this.panneau.add([case_, vignette, nom]);
    });
  }

  // Affiche l'objet en grand, au centre de l'écran
  afficherObjetEnGrand(objet) {
    const scene = this.scene;
    const largeur = scene.cameras.main.width;
    const hauteur = scene.cameras.main.height;

    const vue = scene.add.container(0, 0).setDepth(3000);
    this.vueActuelle = vue; // NOUVEAU : on garde la référence pour fermerTout()

    // Fond sombre cliquable pour fermer
    const voile = scene.add
      .rectangle(largeur / 2, hauteur / 2, largeur, hauteur, 0x000000, 0.8)
      .setScrollFactor(0)
      .setInteractive();
    vue.add(voile);

    // L'image en grand
    const image = scene.add
      .image(largeur / 2, hauteur / 2 - 20, objet.cle)
      .setScrollFactor(0);

    // On redimensionne l'image pour qu'elle tienne à l'écran sans se déformer
    const tailleMax = Math.min(largeur * 0.6, hauteur * 0.6);
    const ratio = Math.min(tailleMax / image.width, tailleMax / image.height);
    image.setScale(ratio);
    vue.add(image);

    // On garde la trace du bas de ce qu'on a déjà affiché, pour empiler
    // proprement description puis boutons d'action sans qu'ils se chevauchent.
    let curseurY = hauteur / 2 + tailleMax / 2 + 10;

    // Description de l'objet
    if (objet.description) {
      const desc = scene.add
        .text(largeur / 2, curseurY, objet.description, {
          font: "15px Arial",
          fill: "#ffffff",
          align: "center",
          wordWrap: { width: largeur * 0.6 },
        })
        .setOrigin(0.5, 0)
        .setScrollFactor(0);
      vue.add(desc);
      curseurY += desc.height + 20;
    }

    // ============================================================
    //  NOUVEAU : ACTIONS CONTEXTUELLES
    //  Si la scène définit une méthode obtenirActionsObjet(cle), on lui
    //  demande s'il y a des actions spéciales disponibles POUR CET OBJET
    //  DANS LE CONTEXTE ACTUEL (ex: "Poser le livre dans la bibliothèque"
    //  seulement si le joueur est près de la bibliothèque).
    //  Chaque action : { texte: "...", executer: () => { ... } }
    // ============================================================
    if (typeof scene.obtenirActionsObjet === "function") {
      const actions = scene.obtenirActionsObjet(objet.cle) || [];

      actions.forEach((action) => {
        const bouton = scene.add
          .text(largeur / 2, curseurY, action.texte, {
            font: "bold 14px Arial",
            fill: "#ffffff",
            backgroundColor: "#0b93f6",
            align: "center",
            padding: { left: 16, right: 16, top: 10, bottom: 10 },
          })
          .setOrigin(0.5, 0)
          .setScrollFactor(0)
          .setInteractive({ useHandCursor: true });

        bouton.on("pointerdown", (pointer, x, y, event) => {
          // Empêche le clic de remonter jusqu'au voile (qui fermerait sans exécuter l'action)
          if (event) event.stopPropagation();
          this.fermerTout(); // on referme direct la vue + le panneau -> retour à la scène
          action.executer();
        });

        vue.add(bouton);
        curseurY += bouton.height + 12;
      });
    }

    const fermer = scene.add
      .text(largeur / 2, 40, "Cliquer pour fermer", {
        font: "14px Arial",
        fill: "#9a9a9a",
      })
      .setOrigin(0.5)
      .setScrollFactor(0);
    vue.add(fermer);

    voile.on("pointerdown", () => {
      vue.destroy(true);
      this.vueActuelle = null;
    });
  }
}

/* ============================================================
 *  OBJET RAMASSABLE
 *  Crée un objet au sol qui disparaît quand on le ramasse.
 *  Si le joueur le possède déjà, l'objet n'est même pas créé.
 * ============================================================ */
export class ObjetRamassable {
  constructor(scene, x, y, cle, nom, description, options = {}) {
    this.scene = scene;
    this.cle = cle;
    this.nom = nom;
    this.description = description;
    this.perimetre = options.perimetre || 60;
    this.messageRamassage = options.message || nom + " récupéré";
    // NOUVEAU : id de la tâche à terminer automatiquement au ramassage (optionnel)
    this.idTache = options.idTache || null;
    this.sprite = null;

    // Si l'objet est déjà dans l'inventaire, on ne l'affiche pas au sol
    if (possedeObjet(scene, cle)) return;

    this.sprite = scene.physics.add.sprite(x, y, cle);
    if (options.echelle) this.sprite.setScale(options.echelle);
    if (options.taille) this.sprite.setDisplaySize(options.taille, options.taille);
    this.sprite.setDepth(options.depth !== undefined ? options.depth : 50);

    // Petite indication visuelle "appuie sur E" (cachée au départ)
    this.indice = scene.add
      .text(x, y - 30, "E", {
        font: "bold 16px Arial",
        fill: "#ffff00",
        backgroundColor: "rgba(0,0,0,0.6)",
        padding: { left: 6, right: 6, top: 3, bottom: 3 },
      })
      .setOrigin(0.5)
      .setDepth(51)
      .setVisible(false);
  }

  // À appeler dans le update() de la scène : affiche/cache l'indice "E"
  update(player) {
    if (!this.sprite) return;
    const distance = Phaser.Math.Distance.Between(
      player.x,
      player.y,
      this.sprite.x,
      this.sprite.y
    );
    this.indice.setVisible(distance < this.perimetre);
  }

  // À appeler quand le joueur appuie sur E
  // Retourne true si l'objet a bien été ramassé
  tenterRamassage(player) {
    if (!this.sprite) return false;

    const distance = Phaser.Math.Distance.Between(
      player.x,
      player.y,
      this.sprite.x,
      this.sprite.y
    );
    if (distance > this.perimetre) return false;

    ajouterObjet(this.scene, this.cle, this.nom, this.description);
    afficherMessage(this.scene, this.messageRamassage, 5000);

    // NOUVEAU : si une tâche était liée à cet objet, on la termine automatiquement
    if (this.idTache) {
      terminerTache(this.scene, this.idTache);
    }

    this.sprite.destroy();
    this.sprite = null;
    this.indice.destroy();

    return true;
  }
}