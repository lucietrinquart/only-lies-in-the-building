import * as Phaser from "phaser";

export default class menu extends Phaser.Scene {
    constructor() {
        super({ key: "menu" });
    }

  preload() {
    this.load.image("menu_fond", "../src/assets/menu_fond.png");
    this.load.image("imageBoutonPlay", "../src/assets/button_play.png");
    this.load.spritesheet("img_perso", "src/assets/dude.png", {
        frameWidth: 40,
        frameHeight: 60
      });

      //gendarmerie
      this.load.image("Phaser_tuilesdejeu1", "src/assets/sprite_police.png");
    this.load.tilemapTiledJSON("carte1", "src/assets/map_police.json");


    this.load.image("img_plateforme", "src/assets/platform.png");
    this.load.spritesheet("img_perso", "src/assets/dude.png", {
      frameWidth: 40,
      frameHeight: 60
    });
    this.load.spritesheet("img_perso2", "src/assets/dude.png", {
      frameWidth: 40,
      frameHeight: 35
    });
    this.load.spritesheet("img_perso3", "src/assets/dude.png", {
      frameWidth: 40,
      frameHeight: 60
    });
    this.load.spritesheet("perso3", "src/assets/dude.png", {
      frameWidth: 40,
      frameHeight: 60
    });
    this.load.spritesheet("perso4", "src/assets/dude.png", {
      frameWidth: 40,
      frameHeight: 60
    });
    this.load.spritesheet("perso5", "src/assets/dude.png", {
      frameWidth: 40,
      frameHeight: 60
    });

    this.load.image("img_porte1", "src/assets/door1.png");

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