import * as Phaser from "phaser";

/* ============================================================
 *  MODULE ORDINATEUR (vidéosurveillance)
 *  ------------------------------------------------------------
 *  Affiche un "écran d'ordinateur" avec 2 sous-écrans :
 *  1. La liste des fichiers vidéo (nom affiché + icône)
 *  2. Le lecteur vidéo (avec 2 croix : fermer la vidéo / quitter l'ordinateur)
 *
 *  Les vidéos doivent être chargées dans le preload global avec
 *  this.load.video(cle, "assets/xxx.mp4"), puis passées ici par leur clé.
 * ============================================================ */
export class OrdinateurUI {
  /**
   * @param {Phaser.Scene} scene
   * @param {Object} config
   * @param {Array} config.videos - [{ nomAffiche: "video-541-06-09-2026-10:20", cle: "video_surveillance1" }, ...]
   */
  constructor(scene, config = {}) {
    this.scene = scene;
    this.videos = config.videos || [];

    this.conteneur = scene.add.container(0, 0);
    this.conteneur.setScrollFactor(0);
    this.conteneur.setDepth(4000);
    this.conteneur.setVisible(false);

    this.videoActuelle = null; // référence vers l'objet Vidéo Phaser en cours de lecture
  }

  // À appeler quand le joueur interagit avec l'ordinateur (touche E)
  ouvrir() {
    this.construireEcranAccueil();
    this.conteneur.setVisible(true);
    this.scene.physics.pause();
  }

  // Ferme complètement l'ordinateur (liste ou vidéo, peu importe l'écran actuel)
  fermer() {
    this.arreterVideo();
    this.conteneur.setVisible(false);
    this.scene.physics.resume();
  }

  arreterVideo() {
    if (this.videoActuelle) {
      this.videoActuelle.stop();
      this.videoActuelle.destroy();
      this.videoActuelle = null;
    }
  }

  get visible() {
    return this.conteneur.visible;
  }

  /* ------------------------------------------------------------
   *  ÉCRAN 1 : LISTE DES FICHIERS
   * ------------------------------------------------------------ */
  construireEcranAccueil() {
    this.conteneur.removeAll(true);
    this.arreterVideo();

    const scene = this.scene;
    const largeur = scene.cameras.main.width;
    const hauteur = scene.cameras.main.height;
    const cx = largeur / 2;
    const cy = hauteur / 2;

    // ---- Voile sombre derrière ----
    const voile = scene.add
      .rectangle(cx, cy, largeur, hauteur, 0x000000, 0.8)
      .setScrollFactor(0)
      .setInteractive();
    this.conteneur.add(voile);

    // ---- Cadre "écran d'ordinateur" (carré sombre, façon terminal) ----
    const ecranLargeur = Math.min(largeur * 0.75, 520);
    const ecranHauteur = Math.min(hauteur * 0.75, 480);

    const fond = scene.add
      .rectangle(cx, cy, ecranLargeur, ecranHauteur, 0x0d1117, 0.98)
      .setScrollFactor(0)
      .setStrokeStyle(2, 0x30363d);
    this.conteneur.add(fond);

    // ---- Barre de titre ----
    const barreHauteur = 40;
    const barreY = cy - ecranHauteur / 2 + barreHauteur / 2;

    const barre = scene.add
      .rectangle(cx, barreY, ecranLargeur, barreHauteur, 0x161b22)
      .setScrollFactor(0);
    this.conteneur.add(barre);

    const titre = scene.add
      .text(cx - ecranLargeur / 2 + 16, barreY, "Vidéosurveillance", {
        font: "bold 15px Arial",
        fill: "#ffffff",
      })
      .setOrigin(0, 0.5)
      .setScrollFactor(0);
    this.conteneur.add(titre);

    // ---- Bouton fermer (quitte l'ordinateur entièrement) ----
    const boutonFermer = scene.add
      .text(cx + ecranLargeur / 2 - 24, barreY, "✕", {
        font: "20px Arial",
        fill: "#ffffff",
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setInteractive({ useHandCursor: true });
    boutonFermer.on("pointerdown", () => this.fermer());
    this.conteneur.add(boutonFermer);

    // ---- Liste des fichiers vidéo ----
    const debutListeY = barreY + barreHauteur / 2 + 30;
    const espacementLigne = 46;

    if (this.videos.length === 0) {
      const vide = scene.add
        .text(cx, cy, "Aucun fichier disponible", { font: "14px Arial", fill: "#8b949e" })
        .setOrigin(0.5)
        .setScrollFactor(0);
      this.conteneur.add(vide);
      return;
    }

    this.videos.forEach((video, index) => {
      const y = debutListeY + index * espacementLigne;

      // Zone cliquable de toute la ligne
      const ligneFond = scene.add
        .rectangle(cx, y, ecranLargeur - 30, 36, 0x21262d, 0)
        .setScrollFactor(0)
        .setInteractive({ useHandCursor: true });
      this.conteneur.add(ligneFond);

      const icone = scene.add
        .text(cx - ecranLargeur / 2 + 24, y, "🎬", { font: "18px Arial" })
        .setOrigin(0, 0.5)
        .setScrollFactor(0);
      this.conteneur.add(icone);

      const nomTexte = scene.add
        .text(cx - ecranLargeur / 2 + 55, y, video.nomAffiche, {
          font: "14px Courier New",
          fill: "#58a6ff",
        })
        .setOrigin(0, 0.5)
        .setScrollFactor(0);
      this.conteneur.add(nomTexte);

      // Petit effet de survol
      ligneFond.on("pointerover", () => ligneFond.setFillStyle(0x21262d, 0.7));
      ligneFond.on("pointerout", () => ligneFond.setFillStyle(0x21262d, 0));
      ligneFond.on("pointerdown", () => this.lireVideo(video));
    });
  }

  /* ------------------------------------------------------------
   *  ÉCRAN 2 : LECTURE DE LA VIDÉO
   * ------------------------------------------------------------ */
  lireVideo(video) {
    this.conteneur.removeAll(true);
    this.arreterVideo();

    const scene = this.scene;
    const largeur = scene.cameras.main.width;
    const hauteur = scene.cameras.main.height;
    const cx = largeur / 2;
    const cy = hauteur / 2;

    // ---- Voile sombre derrière ----
    const voile = scene.add
      .rectangle(cx, cy, largeur, hauteur, 0x000000, 0.9)
      .setScrollFactor(0)
      .setInteractive();
    this.conteneur.add(voile);

    const largeurVideo = Math.min(largeur * 0.2, 640);
    const hauteurVideo = Math.min(hauteur * 0.22, 360);

    // ---- Lecture de la vidéo (en boucle) ----
    const videoObjet = scene.add.video(cx, cy, video.cle).setScrollFactor(0);
    videoObjet.play(true); // true = en boucle
    videoObjet.setDisplaySize(largeurVideo, hauteurVideo);
    this.conteneur.add(videoObjet);
    this.videoActuelle = videoObjet;

    // ---- Nom du fichier au-dessus de la vidéo ----
    const titre = scene.add
      .text(cx, cy - hauteurVideo / 2 - 90, video.nomAffiche, {
        font: "bold 14px Courier New",
        fill: "#a2bcda",
      })
      .setOrigin(0.5)
      .setScrollFactor(0);
    this.conteneur.add(titre);

    // ---- Croix 1 : fermer SEULEMENT la vidéo -> retour à la liste ----
    const boutonRetourListe = scene.add
      .text(cx - largeurVideo / 2-50, cy - hauteurVideo / 2 - 70, "✕ Fermer la vidéo", {
        font: "13px Arial",
        fill: "#ffffff",
        backgroundColor: "#21262d",
        padding: { left: 10, right: 10, top: 6, bottom: 6 },
      })
      .setOrigin(0, 0.5)
      .setScrollFactor(0)
      .setInteractive({ useHandCursor: true });
    boutonRetourListe.on("pointerdown", () => this.construireEcranAccueil());
    this.conteneur.add(boutonRetourListe);

    // ---- Croix 2 : quitter l'ordinateur ENTIÈREMENT ----
    const boutonQuitterTout = scene.add
      .text(cx + largeurVideo / 2 + 100, cy - hauteurVideo / 2 - 70, "✕ Quitter l'ordinateur", {
        font: "13px Arial",
        fill: "#ffffff",
        backgroundColor: "#21262d",
        padding: { left: 10, right: 10, top: 6, bottom: 6 },
      })
      .setOrigin(1, 0.5)
      .setScrollFactor(0)
      .setInteractive({ useHandCursor: true });
    boutonQuitterTout.on("pointerdown", () => this.fermer());
    this.conteneur.add(boutonQuitterTout);
  }
}