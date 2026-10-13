/* ============================================================
 *  MODULE UI — CHOIX DU COUPABLE
 *  ------------------------------------------------------------
 *  4 portraits cliquables côte à côte (suspicion_victor,
 *  suspicion_jessica, suspicion_gregoire, suspicion_marguerite).
 *  Le joueur clique sur le suspect qu'il accuse -> onChoix(id) est
 *  appelé puis l'UI se ferme. C'est ensuite à la scène de gérer le
 *  fondu et le changement de scène (voir choisirCoupable() dans
 *  gendarmerie2.js).
 * ============================================================ */
export class UiCoupableUI {
  /**
   * @param {Phaser.Scene} scene
   * @param {Object} config
   * @param {Array<{id:string, image:string, nom?:string}>} config.suspects  exactement 4 suspects
   * @param {Function} config.onChoix  appelé avec l'id du suspect choisi
   * @param {string} [config.titre]
   */
  constructor(scene, config) {
    this.scene = scene;
    this.suspects = config.suspects;
    this.onChoix = typeof config.onChoix === "function" ? config.onChoix : () => {};
    this.titre = config.titre || "Qui est le coupable ?";

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

    const voile = scene.add.rectangle(cx, cy, largeur, hauteur, 0x000000, 0.85).setScrollFactor(0).setInteractive();
    this.conteneur.add(voile);

    const titre = scene.add
      .text(cx, cy - 170, this.titre, { font: "bold 20px Arial", color: "#ffffff" })
      .setOrigin(0.5)
      .setScrollFactor(0);
    this.conteneur.add(titre);

    // NOUVEAU : 4 portraits côte à côte -> ajuste "taille" et "espacement"
    // selon la taille réelle de tes images suspicion_*
    const taille = 130; // largeur/hauteur affichée de chaque portrait
    const espacement = 30;
    const largeurTotale = this.suspects.length * taille + (this.suspects.length - 1) * espacement;
    const debutX = cx - largeurTotale / 2 + taille / 2;

    this.suspects.forEach((suspect, index) => {
      const x = debutX + index * (taille + espacement);
      const y = cy;

      const image = scene.add.image(x, y, suspect.image).setScrollFactor(0).setInteractive({ useHandCursor: true });
      const ratio = Math.min(taille / image.width, taille / image.height);
      image.setScale(ratio);

      const cadre = scene.add
        .rectangle(x, y, taille + 10, taille + 10, 0xffffff, 0)
        .setStrokeStyle(2, 0xffffff, 0.6)
        .setScrollFactor(0);

      image.on("pointerover", () => cadre.setStrokeStyle(3, 0xff6b6b, 1));
      image.on("pointerout", () => cadre.setStrokeStyle(2, 0xffffff, 0.6));
      image.on("pointerdown", () => this.choisir(suspect.id));

      this.conteneur.add([cadre, image]);

      if (suspect.nom) {
        const nom = scene.add
          .text(x, y + taille / 2 + 16, suspect.nom, { font: "13px Arial", color: "#ffffff" })
          .setOrigin(0.5)
          .setScrollFactor(0);
        this.conteneur.add(nom);
      }
    });
  }

  choisir(id) {
    this.fermer();
    this.onChoix(id);
  }
}