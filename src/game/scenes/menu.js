import * as Phaser from "phaser";

export default class menu extends Phaser.Scene {
    constructor() {
        super({ key: "menu" });
    }

  preload() {
this.load.image("menu_fond", "./assets/menu_fond.png");
this.load.image("imageBoutonPlay", "./assets/button_play.png");

this.load.spritesheet("img_perso", "./assets/dude.png", {
    frameWidth: 40,
    frameHeight: 60
});

this.load.image("Phaser_tuilesdejeu1", "./assets/sprite_police.png");
this.load.tilemapTiledJSON("carte1", "./assets/map_police.json");

this.load.image("img_plateforme", "./assets/platform.png");

this.load.spritesheet("img_perso2", "./assets/dude.png", {
    frameWidth: 40,
    frameHeight: 35
});

this.load.image("img_porte1", "./assets/door1.png");

  }

  create() {
    // on place les éléments de fond
    var img = this.add.image(0, 0, "menu_fond").setOrigin(0).setDepth(0);

    //on ajoute un bouton de clic, nommé bouton_play
    var bouton_play = this.add.image(400, 450, "imageBoutonPlay").setDepth(1);

    //=========================================================
    //on rend le bouton interratif
    bouton_play.setInteractive();
    //Cas ou la sourris clique sur le bouton play :
    // on lance le niveau 1
    bouton_play.on("pointerup", () => {
        this.scene.start("gendarmerie");
      });
  }
}