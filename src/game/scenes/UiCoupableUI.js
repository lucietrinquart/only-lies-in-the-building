
/* ============================================================
 * MODULE UI — CHOIX DU COUPABLE
 * 4 portraits agrandissables avec curseur de réglage
 * ============================================================ */

export class UiCoupableUI {
  constructor(scene, config) {
    this.scene = scene;
    this.suspects = config.suspects;
    this.onChoix = typeof config.onChoix === "function" ? config.onChoix : () => {};
    this.titre = config.titre || "Qui est le coupable ?";

    // Taille réglable
    this.taillePortrait = config.taillePortrait || 280;
    this.tailleMin = config.tailleMin || 150;
    this.tailleMax = config.tailleMax || 400;

    this.conteneur = scene.add.container(0, 0);
    this.conteneur.setDepth(4000);
    this.conteneur.setVisible(false);
  }

  estOuverte() {
    return this.conteneur.visible;
  }

  ouvrir() {
    this.construire();
    this.conteneur.setVisible(true);
  }

  fermer() {
    this.conteneur.setVisible(false);
  }

  construire() {
    this.conteneur.removeAll(true);

    const scene = this.scene;
    const largeur = scene.cameras.main.width;
    const hauteur = scene.cameras.main.height;
    const cx = largeur / 2;
    const cy = hauteur / 2;

    // Fond sombre
    const voile = scene.add.rectangle(
      cx, cy, largeur, hauteur, 0x000000, 0.88
    ).setScrollFactor(0).setInteractive();

    this.conteneur.add(voile);

    // Titre
    const titre = scene.add.text(
      cx, 55, this.titre,
      {
        font: "bold 26px Arial",
        color: "#ffffff"
      }
    ).setOrigin(0.5).setScrollFactor(0);

    this.conteneur.add(titre);

    // Curseur de taille
    const texteTaille = scene.add.text(
      cx, 105,
      `Taille des portraits : ${this.taillePortrait}px`,
      {
        font: "16px Arial",
        color: "#ffffff"
      }
    ).setOrigin(0.5).setScrollFactor(0);

    this.conteneur.add(texteTaille);

    const largeurCurseur = Math.min(300, largeur * 0.5);
    const xDebut = cx - largeurCurseur / 2;
    const yCurseur = 140;

    const fondCurseur = scene.add.rectangle(
      cx, yCurseur, largeurCurseur, 6, 0x888888
    ).setScrollFactor(0);

    const progression = scene.add.rectangle(
      xDebut, yCurseur,
      1, 6, 0xffffff
    ).setOrigin(0, 0.5).setScrollFactor(0);

    const curseur = scene.add.circle(
      xDebut, yCurseur, 10, 0xffffff
    ).setScrollFactor(0).setInteractive({
      useHandCursor: true,
      draggable: true
    });

    this.conteneur.add([
      fondCurseur,
      progression,
      curseur
    ]);

    const actualiserCurseur = (pointer) => {
      const x = Phaser.Math.Clamp(
        pointer.x,
        xDebut,
        xDebut + largeurCurseur
      );

      const proportion = (x - xDebut) / largeurCurseur;

      this.taillePortrait = Math.round(
        this.tailleMin +
        proportion * (this.tailleMax - this.tailleMin)
      );

      curseur.x = x;
      progression.width = x - xDebut;

      texteTaille.setText(
        `Taille des portraits : ${this.taillePortrait}px`
      );

      this.afficherPortraits();
    };

    curseur.on("drag", (pointer) => {
      actualiserCurseur(pointer);
    });

    // Permet aussi de cliquer sur la barre
    fondCurseur.setInteractive();

    fondCurseur.on("pointerdown", (pointer) => {
      actualiserCurseur(pointer);
    });

    // Position initiale du curseur
    const proportionInitiale =
      (this.taillePortrait - this.tailleMin) /
      (this.tailleMax - this.tailleMin);

    const xInitial = xDebut + proportionInitiale * largeurCurseur;

    curseur.x = xInitial;
    progression.width = xInitial - xDebut;

    // Conteneur des portraits
    this.zonePortraits = scene.add.container(0, 0);
    this.conteneur.add(this.zonePortraits);

    this.afficherPortraits();
  }

  afficherPortraits() {
    if (!this.zonePortraits) return;

    this.zonePortraits.removeAll(true);

    const scene = this.scene;
    const largeur = scene.cameras.main.width;
    const hauteur = scene.cameras.main.height;

    const taille = this.taillePortrait;
    const espacement = 25;

    // On conserve les proportions des images.
    // Les portraits sont adaptés à la hauteur disponible.
    const largeurDisponible = largeur - 50;
    const hauteurDisponible = hauteur - 230;

    const largeurParPortrait =
      (largeurDisponible - espacement * 3) / 4;

    const largeurAffichee = Math.min(
      taille,
      largeurParPortrait
    );

    const hauteurAffichee = Math.min(
      largeurAffichee * (556 / 223),
      hauteurDisponible
    );

    const largeurFinale = hauteurAffichee * (223 / 556);

    const largeurTotale =
      4 * largeurFinale + 3 * espacement;

    const debutX = largeur / 2 - largeurTotale / 2;

    const y = hauteur / 2 + 30;

    this.suspects.forEach((suspect, index) => {
      const x = debutX +
        index * (largeurFinale + espacement) +
        largeurFinale / 2;

      const image = scene.add.image(
        x, y, suspect.image
      ).setScrollFactor(0);

      image.setDisplaySize(
        largeurFinale,
        hauteurAffichee
      );

      image.setInteractive({
        useHandCursor: true
      });

      // Cadre adapté à la taille réelle
      const cadre = scene.add.rectangle(
        x,
        y,
        largeurFinale + 10,
        hauteurAffichee + 10,
        0xffffff,
        0
      ).setStrokeStyle(3, 0xffffff, 0.7)
        .setScrollFactor(0);

      image.on("pointerover", () => {
        cadre.setStrokeStyle(4, 0xff6b6b, 1);
      });

      image.on("pointerout", () => {
        cadre.setStrokeStyle(3, 0xffffff, 0.7);
      });

      image.on("pointerdown", () => {
        this.choisir(suspect.id);
      });

      this.zonePortraits.add([cadre, image]);

      if (suspect.nom) {
        const nom = scene.add.text(
          x,
          y + hauteurAffichee / 2 + 15,
          suspect.nom,
          {
            font: "bold 16px Arial",
            color: "#ffffff"
          }
        ).setOrigin(0.5).setScrollFactor(0);

        this.zonePortraits.add(nom);
      }
    });
  }

  choisir(id) {
    this.fermer();
    this.onChoix(id);
  }
}
