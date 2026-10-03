import * as Phaser from "phaser";

/* ============================================================
 *  MODULE MAIL (messagerie de l'ordinateur)
 *  ------------------------------------------------------------
 *  Même principe que ordinateur.js : 2 écrans, une liste de mails
 *  puis le contenu d'un mail ouvert. Croix "< Retour" pour revenir
 *  à la liste, croix "✕" pour quitter l'ordinateur entièrement.
 * ============================================================ */
export class MailUI {
  /**
   * @param {Phaser.Scene} scene
   * @param {Object} config
   * @param {Array} config.mails - [{ expediteur, objet, corps }, ...]
   */
  constructor(scene, config = {}) {
    this.scene = scene;
    this.mails = config.mails || [];

    this.conteneur = scene.add.container(0, 0);
    this.conteneur.setScrollFactor(0);
    this.conteneur.setDepth(4000);
    this.conteneur.setVisible(false);
  }

  get visible() {
    return this.conteneur.visible;
  }

  ouvrir() {
    this.construireListe();
    this.conteneur.setVisible(true);
    this.scene.physics.pause();
  }

  fermer() {
    this.conteneur.setVisible(false);
    this.scene.physics.resume();
  }

  /* ------------------------------------------------------------
   *  ÉCRAN 1 : LISTE DES MAILS
   * ------------------------------------------------------------ */
  construireListe() {
    this.conteneur.removeAll(true);

    const scene = this.scene;
    const largeur = scene.cameras.main.width;
    const hauteur = scene.cameras.main.height;
    const cx = largeur / 2;
    const cy = hauteur / 2;

    const voile = scene.add
      .rectangle(cx, cy, largeur, hauteur, 0x000000, 0.8)
      .setScrollFactor(0)
      .setInteractive();
    this.conteneur.add(voile);

    const ecranLargeur = Math.min(largeur * 0.75, 520);
    const ecranHauteur = Math.min(hauteur * 0.75, 480);

    const fond = scene.add
      .rectangle(cx, cy, ecranLargeur, ecranHauteur, 0x0d1117, 0.98)
      .setScrollFactor(0)
      .setStrokeStyle(2, 0x30363d);
    this.conteneur.add(fond);

    const barreHauteur = 40;
    const barreY = cy - ecranHauteur / 2 + barreHauteur / 2;

    const barre = scene.add
      .rectangle(cx, barreY, ecranLargeur, barreHauteur, 0x161b22)
      .setScrollFactor(0);
    this.conteneur.add(barre);

    const titre = scene.add
      .text(cx - ecranLargeur / 2 + 16, barreY, "Messagerie", {
        font: "bold 15px Arial",
        fill: "#ffffff",
      })
      .setOrigin(0, 0.5)
      .setScrollFactor(0);
    this.conteneur.add(titre);

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

    const debutListeY = barreY + barreHauteur / 2 + 30;
    const espacementLigne = 56;

    if (this.mails.length === 0) {
      const vide = scene.add
        .text(cx, cy, "Boîte de réception vide", { font: "14px Arial", fill: "#8b949e" })
        .setOrigin(0.5)
        .setScrollFactor(0);
      this.conteneur.add(vide);
      return;
    }

    this.mails.forEach((mail, index) => {
      const y = debutListeY + index * espacementLigne;

      const ligneFond = scene.add
        .rectangle(cx, y, ecranLargeur - 30, 46, 0x21262d, 0)
        .setScrollFactor(0)
        .setInteractive({ useHandCursor: true });
      this.conteneur.add(ligneFond);

      const icone = scene.add
        .text(cx - ecranLargeur / 2 + 24, y, "✉", { font: "20px Arial", fill: "#58a6ff" })
        .setOrigin(0, 0.5)
        .setScrollFactor(0);
      this.conteneur.add(icone);

      const expediteurTexte = scene.add
        .text(cx - ecranLargeur / 2 + 55, y - 11, mail.expediteur, {
          font: "bold 13px Arial",
          fill: "#58a6ff",
        })
        .setOrigin(0, 0.5)
        .setScrollFactor(0);
      this.conteneur.add(expediteurTexte);

      const objetTexte = scene.add
        .text(cx - ecranLargeur / 2 + 55, y + 10, mail.objet, {
          font: "12px Arial",
          fill: "#9a9a9a",
        })
        .setOrigin(0, 0.5)
        .setScrollFactor(0);
      this.conteneur.add(objetTexte);

      ligneFond.on("pointerover", () => ligneFond.setFillStyle(0x21262d, 0.7));
      ligneFond.on("pointerout", () => ligneFond.setFillStyle(0x21262d, 0));
      ligneFond.on("pointerdown", () => this.lireMail(mail));
    });
  }

  /* ------------------------------------------------------------
   *  ÉCRAN 2 : LECTURE D'UN MAIL
   * ------------------------------------------------------------ */
  lireMail(mail) {
    this.conteneur.removeAll(true);

    const scene = this.scene;
    const largeur = scene.cameras.main.width;
    const hauteur = scene.cameras.main.height;
    const cx = largeur / 2;
    const cy = hauteur / 2;

    const voile = scene.add
      .rectangle(cx, cy, largeur, hauteur, 0x000000, 0.85)
      .setScrollFactor(0)
      .setInteractive();
    this.conteneur.add(voile);

    const ecranLargeur = Math.min(largeur * 0.75, 520);
    const ecranHauteur = Math.min(hauteur * 0.75, 480);

    const fond = scene.add
      .rectangle(cx, cy, ecranLargeur, ecranHauteur, 0x0d1117, 0.98)
      .setScrollFactor(0)
      .setStrokeStyle(2, 0x30363d);
    this.conteneur.add(fond);

    const hautEcran = cy - ecranHauteur / 2;

    // ---- Croix 1 : retour à la liste ----
    const boutonRetour = scene.add
      .text(cx - ecranLargeur / 2 + 16, hautEcran + 20, "< Retour", {
        font: "14px Arial",
        fill: "#ffffff",
      })
      .setOrigin(0, 0.5)
      .setScrollFactor(0)
      .setInteractive({ useHandCursor: true });
    boutonRetour.on("pointerdown", () => this.construireListe());
    this.conteneur.add(boutonRetour);

    // ---- Croix 2 : quitter l'ordinateur entièrement ----
    const boutonFermer = scene.add
      .text(cx + ecranLargeur / 2 - 24, hautEcran + 20, "✕", {
        font: "20px Arial",
        fill: "#ffffff",
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setInteractive({ useHandCursor: true });
    boutonFermer.on("pointerdown", () => this.fermer());
    this.conteneur.add(boutonFermer);

    const expediteurTexte = scene.add
      .text(cx, hautEcran + 58, "De : " + mail.expediteur, {
        font: "bold 14px Arial",
        fill: "#58a6ff",
      })
      .setOrigin(0.5)
      .setScrollFactor(0);
    this.conteneur.add(expediteurTexte);

    const objetTexte = scene.add
      .text(cx, hautEcran + 84, mail.objet, {
        font: "bold 16px Arial",
        fill: "#ffffff",
      })
      .setOrigin(0.5)
      .setScrollFactor(0);
    this.conteneur.add(objetTexte);

    const ligne = scene.add
      .rectangle(cx, hautEcran + 104, ecranLargeur - 60, 1, 0x30363d)
      .setScrollFactor(0);
    this.conteneur.add(ligne);

    const corpsTexte = scene.add
      .text(cx, hautEcran + 124, mail.corps, {
        font: "13px Arial",
        fill: "#c9d1d9",
        align: "left",
        wordWrap: { width: ecranLargeur - 60 },
      })
      .setOrigin(0.5, 0)
      .setScrollFactor(0);
    this.conteneur.add(corpsTexte);
  }
}