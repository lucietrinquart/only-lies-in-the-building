import * as Phaser from "phaser";

/* ============================================================
 *  CLASSE DE BASE : PLANCHE DE BD
 *  ------------------------------------------------------------
 *  Gère tout le mécanisme générique d'une "planche" de BD :
 *  - fond noir
 *  - vignettes qui apparaissent une par une en fondu (alpha 0 -> 1)
 *  - un délai (configurable) entre chaque vignette
 *  - un bruitage optionnel par vignette
 *  - une flèche qui apparaît à la fin, pour passer à la scène suivante
 *
 *  CHAQUE SCÈNE CONCRÈTE (bd.js, bd2.js, bd3.js...) HÉRITE DE CETTE
 *  CLASSE ET NE FOURNIT QUE SA CONFIGURATION via obtenirConfig().
 *  C'est fait exprès : tu ne touches JAMAIS ce fichier pour ajouter
 *  une planche, seulement pour changer le comportement général.
 * ============================================================ */
export default class PlancheBD extends Phaser.Scene {
  constructor(cleScene) {
    super({ key: cleScene });
  }

  /**
   * À SURCHARGER dans chaque scène concrète. Doit retourner :
   * {
   *   delaiEntreVignettes: 5000,       // en millisecondes, entre l'apparition de 2 vignettes
   *   sceneSuivante: "bd2",            // clé de la scène lancée au clic sur la flèche
   *   vignettes: [
   *     { cle: "bulle1", x: 400, y: 300, largeur: 600, hauteur: 400, son: "orage" },
   *     { cle: "bulle2", x: 400, y: 300, largeur: 600, hauteur: 400 }, // pas de son -> on omet "son"
   *     ...
   *   ]
   * }
   */
  obtenirConfig() {
    return { vignettes: [], sceneSuivante: null, delaiEntreVignettes: 5000 };
  }

  create() {
    const config = this.obtenirConfig();
    this.vignettes = config.vignettes || [];
    this.sceneSuivante = config.sceneSuivante || null;
    // NOUVEAU : c'est CETTE valeur qui contrôle le rythme -> change-la dans
    // obtenirConfig() de bd.js / bd2.js si tu veux accélérer ou ralentir.
    this.delaiEntreVignettes =
      config.delaiEntreVignettes !== undefined ? config.delaiEntreVignettes : 5000;

    // Fond noir
    this.cameras.main.setBackgroundColor("#000000");

    this.indexVignetteActuelle = 0;
    this.fleche = null;

    this.afficherVignetteSuivante();
  }

  // Affiche la vignette suivante de la liste, ou la flèche si on est arrivé au bout
  afficherVignetteSuivante() {
    if (this.indexVignetteActuelle >= this.vignettes.length) {
      this.afficherFleche();
      return;
    }

    const vignette = this.vignettes[this.indexVignetteActuelle];

    const image = this.add.image(vignette.x, vignette.y, vignette.cle);
    image.setAlpha(0); // on part de invisible, pour le fondu

    // Taille : soit une taille exacte (largeur/hauteur), soit une échelle (echelle), soit rien (taille native)
    if (vignette.largeur && vignette.hauteur) {
      image.setDisplaySize(vignette.largeur, vignette.hauteur);
    } else if (vignette.echelle) {
      image.setScale(vignette.echelle);
    }

    if (vignette.angle) image.setAngle(vignette.angle);

    // ---- Fondu en douceur : opacité 0 -> 100% ----
    this.tweens.add({
      targets: image,
      alpha: 1,
      duration: vignette.dureeFondu !== undefined ? vignette.dureeFondu : 800,
      ease: "Sine.easeIn",
    });

    // ---- Bruitage optionnel, propre à CETTE vignette ----
    if (vignette.son) {
      this.sound.play(vignette.son, {
        volume: vignette.volumeSon !== undefined ? vignette.volumeSon : 1,
      });
    }

    this.indexVignetteActuelle++;

    // On programme l'apparition de la vignette suivante après le délai configuré
    this.time.delayedCall(this.delaiEntreVignettes, () => this.afficherVignetteSuivante());
  }

  // Affiche la flèche (en bas à droite) une fois toutes les vignettes affichées
  afficherFleche() {
    const largeur = this.cameras.main.width;
    const hauteur = this.cameras.main.height;

    this.fleche = this.add
      .image(largeur - 60, hauteur - 60, "fleche")
      .setInteractive({ useHandCursor: true })
      .setAlpha(0)
      .setScale(0.1); // NOUVEAU : ajuste cette valeur pour la taille de la flèche

    this.tweens.add({
      targets: this.fleche,
      alpha: 1,
      duration: 500,
    });

    this.fleche.on("pointerdown", () => {
      if (this.sceneSuivante) {
        this.scene.start(this.sceneSuivante);
      }
    });
  }
}