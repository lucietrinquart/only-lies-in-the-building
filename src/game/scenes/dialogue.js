import * as Phaser from "phaser";

/* ============================================================
 *  MODULE DIALOGUE (avec portraits)
 *  ------------------------------------------------------------
 *  Affiche une "scène de dialogue" façon visual novel :
 *  - portrait du joueur à gauche
 *  - portrait du PNJ à droite
 *  - texte au centre/bas
 *  - fond assombri pour l'effet "zoom"
 *
 *  Chaque réplique est un objet :
 *  { texte: "...", moi: "moi_heureuse", perso: "perso_triste" }
 *  où "moi" et "perso" sont des CLÉS DE TEXTURE (sans extension),
 *  donc les images doivent être chargées dans le preload global
 *  avec ces clés exactes (ex: this.load.image("moi_heureuse", "assets/moi_heureuse.png")).
 * ============================================================ */
export class DialogueUI {
  constructor(scene, options = {}) {
    this.scene = scene;

    const largeur = scene.cameras.main.width;
    const hauteur = scene.cameras.main.height;

    this.conteneur = scene.add.container(0, 0);
    this.conteneur.setScrollFactor(0);
    this.conteneur.setDepth(1000); // sous l'inventaire/carte/tâches (2000+), au-dessus du jeu
    this.conteneur.setVisible(false);

    // ---- Voile sombre derrière, pour l'effet "zoom" cinématique ----
    const voile = scene.add
      .rectangle(largeur / 2, hauteur / 2, largeur, hauteur, 0x000000, 0.55)
      .setScrollFactor(0);
    this.conteneur.add(voile);

    // ---- Dimensions des portraits ----
    this.taillePortrait = options.taillePortrait || Math.min(largeur * 0.42, hauteur * 0.6);
    const zoneTexteHauteur = options.zoneTexteHauteur || 110;
    const yPortrait = hauteur - zoneTexteHauteur - this.taillePortrait / 2 - 10;

    // ---- Portrait du joueur (MOI), à gauche ----
    // On utilise le premier moi_* passé en option comme texture initiale (sinon rien tant
    // qu'aucune réplique n'a été affichée -> pas grave, elle est cachée au départ)
    this.portraitMoi = scene.add
      .image(largeur * 0.24, yPortrait, options.moiParDefaut || "moi_triste")
      .setScrollFactor(0);
    this.conteneur.add(this.portraitMoi);

    // ---- Portrait du PNJ, à droite ----
    this.portraitPerso = scene.add
      .image(largeur * 0.76, yPortrait, options.persoParDefaut || "perso_triste")
      .setScrollFactor(0);
    this.conteneur.add(this.portraitPerso);

    this.redimensionnerPortrait(this.portraitMoi);
    this.redimensionnerPortrait(this.portraitPerso);

    // ---- Fond de la zone de texte, en bas ----
    const fondTexte = scene.add
      .rectangle(largeur / 2, hauteur - zoneTexteHauteur / 2 - 10, largeur - 40, zoneTexteHauteur, 0x000000, 0.8)
      .setScrollFactor(0)
      .setStrokeStyle(2, 0xffffff, 0.25);
    this.conteneur.add(fondTexte);

    // ---- Le texte lui-même ----
    this.texte = scene.add
      .text(largeur / 2, hauteur - zoneTexteHauteur - 10 + 16, "", {
        font: "18px Arial",
        fill: "#ffffff",
        align: "center",
        wordWrap: { width: largeur - 90 },
      })
      .setOrigin(0.5, 0)
      .setScrollFactor(0);
    this.conteneur.add(this.texte);
  }

  // Redimensionne un portrait pour qu'il tienne dans le cadre sans se déformer
  redimensionnerPortrait(image) {
    const ratio = Math.min(
      this.taillePortrait / image.width,
      this.taillePortrait / image.height
    );
    image.setScale(ratio);
  }

  /**
   * Affiche une réplique.
   * @param {Object} ligne - { texte, moi, perso }
   *   "moi" et "perso" sont optionnels : si omis, le portrait précédent reste affiché.
   */
  afficherLigne(ligne) {
    this.texte.setText(ligne.texte);

    if (ligne.moi && this.scene.textures.exists(ligne.moi)) {
      this.portraitMoi.setTexture(ligne.moi);
      this.redimensionnerPortrait(this.portraitMoi);
    }

    if (ligne.perso && this.scene.textures.exists(ligne.perso)) {
      this.portraitPerso.setTexture(ligne.perso);
      this.redimensionnerPortrait(this.portraitPerso);
    }

    this.conteneur.setVisible(true);
  }

  // Cache toute la scène de dialogue (portraits + texte)
  masquer() {
    this.conteneur.setVisible(false);
  }

  // Pratique pour les tests du type "if (this.dialogueUI.visible) return;"
  get visible() {
    return this.conteneur.visible;
  }
}