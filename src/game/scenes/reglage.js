/* ============================================================
 *  MODULE RÉGLAGES (volume de la musique et des bruitages)
 *  ------------------------------------------------------------
 *  Une icône de roue crantée (image "reglage") reste affichée en
 *  permanence, comme la carte et l'inventaire. Un clic ouvre une
 *  petite fenêtre avec 2 jauges :
 *     - MUSIQUES   : tous les sons du tableau MUSIQUES
 *     - BRUITAGES  : tous les sons du tableau BRUITAGES
 *  Chaque jauge peut aussi être coupée complètement (bouton "Couper").
 *
 *  COMMENT ÇA MARCHE
 *  Le volume que tu donnes dans ton code (ex: volume 0.2 pour la musique)
 *  reste le volume "de base". Les réglages le multiplient :
 *      volume final = volume de base x jauge
 *  Tu n'as donc RIEN à changer dans tes this.sound.play(...) existants.
 *  Un son qui n'est dans aucun des deux tableaux est considéré comme un
 *  bruitage.
 *
 *  UTILISATION (dans le create() de CHAQUE scène) :
 *     import { ReglagesUI } from "./reglage.js";
 *     ...
 *     this.reglagesUI = new ReglagesUI(this);
 *
 *  + dans le preload du menu :
 *     this.load.image("reglage", "./assets/reglage.png");
 *
 *  Les réglages sont mémorisés dans le navigateur (localStorage) : le
 *  joueur les retrouve même après avoir rechargé la page.
 * ============================================================ */

/* ------------------------------------------------------------
 *  TABLEAU 1 : LES MUSIQUES
 *  Ajoute une ligne par musique : { cle: clé du this.load.audio, nom: texte affiché }
 * ------------------------------------------------------------ */
export const MUSIQUES = [
  { cle: "musique_gendarmerie", nom: "Musique d'ambiance" },
  // { cle: "musique_bar", nom: "Musique du bar" },
];

/* ------------------------------------------------------------
 *  TABLEAU 2 : LES BRUITAGES
 *  Ajoute une ligne par bruitage : { cle: clé du this.load.audio, nom: texte affiché }
 * ------------------------------------------------------------ */
export const BRUITAGES = [
  { cle: "bip", nom: "Bip des dialogues" },
  { cle: "gaps", nom: "Gaps" },
  { cle: "orage", nom: "Orage" },
  { cle: "marteau_justice", nom: "Marteau de justice" },
  { cle: "brouha", nom: "Brouhaha" },
  { cle: "vibration_telephone", nom: "Vibration du téléphone" },
];

/* ------------------------------------------------------------
 *  APPARENCE (positions, tailles, couleurs)
 * ------------------------------------------------------------ */
const ICONE_X = 40; // position de la roue crantée (en haut à gauche)
const ICONE_Y = 40;
const ICONE_TAILLE = 44;
const COULEUR_JAUGE = 0x4aa3ff;
const COULEUR_JAUGE_COUPEE = 0x777777;

/* ------------------------------------------------------------
 *  ÉTAT DES RÉGLAGES (partagé par toutes les scènes + sauvegardé)
 * ------------------------------------------------------------ */
const CLE_STOCKAGE = "violette_reglages";

const etat = {
  musique: { volume: 1, muet: false },
  bruitages: { volume: 1, muet: false },
};
let etatCharge = false;

function borner(v) {
  return Math.min(1, Math.max(0, v));
}

function chargerEtat() {
  if (etatCharge) return;
  etatCharge = true;
  try {
    const brut = localStorage.getItem(CLE_STOCKAGE);
    if (!brut) return;
    const donnees = JSON.parse(brut);
    for (const cat of ["musique", "bruitages"]) {
      if (donnees && donnees[cat]) {
        const v = Number(donnees[cat].volume);
        if (Number.isFinite(v)) etat[cat].volume = borner(v);
        etat[cat].muet = !!donnees[cat].muet;
      }
    }
  } catch (e) {
    // localStorage indisponible : pas grave, on garde les valeurs par défaut
  }
}

function sauvegarderEtat() {
  try {
    localStorage.setItem(CLE_STOCKAGE, JSON.stringify(etat));
  } catch (e) {
    // idem
  }
}

/* ------------------------------------------------------------
 *  APPLICATION DU VOLUME AUX SONS
 * ------------------------------------------------------------ */
function categorie(cle) {
  return MUSIQUES.some((m) => m.cle === cle) ? "musique" : "bruitages";
}

// Multiplicateur (0 à 1) à appliquer à un son selon sa clé
export function multiplicateurVolume(cle) {
  const e = etat[categorie(cle)];
  return e.muet ? 0 : e.volume;
}

// volume final = volume de base du son x multiplicateur
function appliquerASon(son) {
  if (!son || typeof son.setVolume !== "function") return;
  // Un son détruit (ex: le bip du dialogue quand on quitte une scène) reste
  // quelques instants dans la liste du gestionnaire, mais ses "nœuds audio"
  // sont à null -> on l'ignore, sinon "Cannot set properties of null".
  if (son.pendingRemove || !son.manager) return;
  try {
    if (son.__baseVolume === undefined) son.__baseVolume = son.volume;
    son.setVolume(son.__baseVolume * multiplicateurVolume(son.key));
  } catch (e) {
    // son en cours de destruction : on l'ignore
  }
}

function appliquerATous(game) {
  const liste = game.sound && game.sound.sounds ? game.sound.sounds : [];
  liste.forEach(appliquerASon);
}

// Branche les réglages sur le gestionnaire de sons du jeu (une seule fois) :
// chaque son créé ou joué est automatiquement ajusté, sans toucher à ton code.
export function installerReglages(game) {
  const gestionnaire = game.sound;
  if (!gestionnaire || gestionnaire.__reglagesInstalles) return;
  gestionnaire.__reglagesInstalles = true;

  const habiller = (son) => {
    if (!son || son.__reglagesHabille) return son;
    son.__reglagesHabille = true;
    const jouerOriginal = son.play.bind(son);
    son.play = (...args) => {
      const resultat = jouerOriginal(...args);
      // après play(), son.volume = le volume demandé par ton code (la base)
      son.__baseVolume = son.volume;
      appliquerASon(son);
      return resultat;
    };
    return son;
  };

  const ajouterOriginal = gestionnaire.add.bind(gestionnaire);
  gestionnaire.add = (cle, config) => {
    const son = ajouterOriginal(cle, config);
    habiller(son);
    appliquerASon(son);
    return son;
  };

  // les sons déjà créés avant l'installation
  (gestionnaire.sounds || []).forEach(habiller);
}

/* ============================================================
 *  L'INTERFACE : roue crantée + fenêtre de réglages
 * ============================================================ */
const SECTIONS = [
  { cat: "musique", titre: "Musique", table: MUSIQUES },
  { cat: "bruitages", titre: "Bruitages", table: BRUITAGES },
];

export class ReglagesUI {
  constructor(scene, options = {}) {
    chargerEtat();
    installerReglages(scene.game);
    appliquerATous(scene.game);

    this.scene = scene;
    this.ouvert = false;
    this.glisse = null; // section dont on est en train de tirer la jauge

    const largeur = scene.cameras.main.width;
    const hauteur = scene.cameras.main.height;
    const x = options.x !== undefined ? options.x : ICONE_X;
    const y = options.y !== undefined ? options.y : ICONE_Y;
    const taille = options.taille !== undefined ? options.taille : ICONE_TAILLE;

    /* ---------- L'ICÔNE (toujours visible, fixe à l'écran) ---------- */
    if (scene.textures.exists("reglage")) {
      this.icone = scene.add.image(x, y, "reglage");
      this.icone.setScale(taille / Math.max(this.icone.width, this.icone.height));
    } else {
      // secours si l'image n'est pas chargée
      this.icone = scene.add.text(x, y, "⚙", { font: `${taille}px Arial`, fill: "#ffffff" }).setOrigin(0.5);
    }
    this.icone.setScrollFactor(0).setDepth(3000).setInteractive({ useHandCursor: true });
    this.icone.on("pointerdown", () => {
      scene.tweens.add({ targets: this.icone, angle: this.icone.angle + 90, duration: 250, ease: "Sine.easeOut" });
      this.basculer();
    });

    /* ---------- LA FENÊTRE (cachée au départ) ---------- */
    this.panneau = scene.add.container(0, 0).setScrollFactor(0).setDepth(4000).setVisible(false);

    // voile sombre : cliquer à côté de la fenêtre la ferme
    const voile = scene.add
      .rectangle(largeur / 2, hauteur / 2, largeur, hauteur, 0x000000, 0.55)
      .setScrollFactor(0)
      .setInteractive();
    voile.on("pointerdown", () => this.fermer());
    this.panneau.add(voile);

    const L = 500;
    const H = 340;
    const cx = largeur / 2;
    const cy = hauteur / 2;
    const gauche = cx - L / 2;
    const haut = cy - H / 2;

    // fond de la fenêtre (cliquable pour ne pas fermer en cliquant dedans)
    const fond = scene.add.rectangle(cx, cy, L, H, 0x10163a, 0.97).setScrollFactor(0).setStrokeStyle(4, 0xffffff, 1);
    fond.setInteractive();
    this.panneau.add(fond);
    const cadreInterieur = scene.add.rectangle(cx, cy, L - 14, H - 14).setScrollFactor(0).setStrokeStyle(2, 0x6ea8ff, 0.8);
    this.panneau.add(cadreInterieur);

    const titre = scene.add
      .text(cx, haut + 30, "Réglages", { font: "bold 24px Arial", fill: "#ffffff" })
      .setOrigin(0.5)
      .setScrollFactor(0);
    this.panneau.add(titre);

    const croix = scene.add
      .text(gauche + L - 28, haut + 28, "✕", { font: "bold 22px Arial", fill: "#ffffff" })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setInteractive({ useHandCursor: true });
    croix.on("pointerdown", () => this.fermer());
    this.panneau.add(croix);

    /* ---------- LES 2 JAUGES ---------- */
    const piste = { x0: cx - 150, largeur: 300 };
    this.piste = piste;
    this.sections = SECTIONS.map((def, i) => {
      const y0 = haut + 80 + i * 125; // ligne du titre de la section
      const yJauge = y0 + 42;

      const label = scene.add
        .text(gauche + 30, y0, def.titre, { font: "bold 20px Arial", fill: "#ffffff" })
        .setOrigin(0, 0.5)
        .setScrollFactor(0);
      this.panneau.add(label);

      // bouton Couper / Réactiver
      const bouton = scene.add
        .rectangle(gauche + L - 95, y0, 120, 30, 0x2b3563, 1)
        .setScrollFactor(0)
        .setStrokeStyle(2, 0xffffff, 0.7)
        .setInteractive({ useHandCursor: true });
      this.panneau.add(bouton);
      const texteBouton = scene.add
        .text(bouton.x, bouton.y, "", { font: "bold 14px Arial", fill: "#ffffff" })
        .setOrigin(0.5)
        .setScrollFactor(0);
      this.panneau.add(texteBouton);

      // la jauge (dessinée dans un Graphics, redessiné à chaque changement)
      const dessin = scene.add.graphics().setScrollFactor(0);
      this.panneau.add(dessin);

      const pourcentage = scene.add
        .text(piste.x0 + piste.largeur + 30, yJauge, "", { font: "bold 16px Arial", fill: "#ffffff" })
        .setOrigin(0, 0.5)
        .setScrollFactor(0);
      this.panneau.add(pourcentage);

      // zone cliquable un peu plus grande que la jauge
      const zone = scene.add
        .rectangle(piste.x0 + piste.largeur / 2, yJauge, piste.largeur + 30, 40, 0xffffff, 0)
        .setScrollFactor(0)
        .setInteractive({ useHandCursor: true });
      this.panneau.add(zone);

      // liste des sons contrôlés par cette jauge
      const liste = scene.add
        .text(gauche + 30, yJauge + 30, def.table.map((t) => t.nom).join(", "), {
          font: "italic 12px Arial",
          fill: "#9a9a9a",
          wordWrap: { width: L - 60 },
        })
        .setOrigin(0, 0)
        .setScrollFactor(0);
      this.panneau.add(liste);

      const section = { def, yJauge, dessin, pourcentage, texteBouton };

      zone.on("pointerdown", (pointer) => {
        this.glisse = section;
        this.deplacer(section, pointer.x, piste);
      });
      bouton.on("pointerdown", () => {
        etat[def.cat].muet = !etat[def.cat].muet;
        this.changementFait(section, piste);
      });

      this.dessiner(section, piste);
      return section;
    });

    // glisser la jauge : suivi de la souris tant que le bouton est enfoncé
    this.surDeplacement = (pointer) => {
      if (this.glisse && pointer.isDown) this.deplacer(this.glisse, pointer.x, piste);
    };
    this.surRelache = () => {
      this.glisse = null;
    };
    scene.input.on("pointermove", this.surDeplacement);
    scene.input.on("pointerup", this.surRelache);
    scene.events.once("shutdown", () => {
      scene.input.off("pointermove", this.surDeplacement);
      scene.input.off("pointerup", this.surRelache);
    });
  }

  basculer() {
    if (this.ouvert) this.fermer();
    else this.ouvrir();
  }

  ouvrir() {
    this.ouvert = true;
    this.sections.forEach((s) => this.dessiner(s, this.piste));
    this.panneau.setVisible(true);
  }

  fermer() {
    this.ouvert = false;
    this.glisse = null;
    this.panneau.setVisible(false);
  }

  // convertit la position de la souris en volume (0 à 1)
  deplacer(section, pointerX, piste) {
    const valeur = borner((pointerX - piste.x0) / piste.largeur);
    etat[section.def.cat].volume = Math.round(valeur * 100) / 100;
    if (valeur > 0) etat[section.def.cat].muet = false; // toucher la jauge réactive le son
    this.changementFait(section, piste);
  }

  changementFait(section, piste) {
    this.piste = piste;
    sauvegarderEtat();
    appliquerATous(this.scene.game);
    this.dessiner(section, piste);
  }

  dessiner(section, piste) {
    this.piste = piste;
    const e = etat[section.def.cat];
    const g = section.dessin;
    const y = section.yJauge;
    const couleur = e.muet ? COULEUR_JAUGE_COUPEE : COULEUR_JAUGE;

    g.clear();
    // rail
    g.fillStyle(0x3a3f5c, 1);
    g.fillRoundedRect(piste.x0, y - 5, piste.largeur, 10, 5);
    // partie remplie
    if (e.volume > 0) {
      g.fillStyle(couleur, 1);
      g.fillRoundedRect(piste.x0, y - 5, Math.max(10, piste.largeur * e.volume), 10, 5);
    }
    // poignée
    const hx = piste.x0 + piste.largeur * e.volume;
    g.fillStyle(0xffffff, 1);
    g.fillCircle(hx, y, 11);
    g.lineStyle(3, couleur, 1);
    g.strokeCircle(hx, y, 11);

    section.pourcentage.setText(e.muet ? "Coupé" : `${Math.round(e.volume * 100)} %`);
    section.texteBouton.setText(e.muet ? "Réactiver" : "Couper");
  }
}