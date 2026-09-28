import * as Phaser from "phaser";

export default class credit extends Phaser.Scene {
    constructor() {
        super({ key: "credit" });
    }
  //on charge les images
  preload() {}

  create() {
    // on place les éléments de fond
    var img = this.add.image(0, 0, "menu_instruction").setOrigin(0).setDepth(0);

    //on ajoute un bouton de clic, nommé bouton_play
    var bouton_play = this.add
      .image(400, 450, "imageBoutonContinuer")
      .setDepth(1);

    //=========================================================
    //on rend le bouton interratif
    bouton_play.setInteractive();
    //Cas ou la sourris clique sur le bouton play :
    // on lance le niveau 1
    bouton_play.on("pointerup", () => {
      this.scene.start("menu");
    });
  }
}
