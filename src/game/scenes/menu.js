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
this.load.image("telephone", "./assets/telephone.png");
this.load.image("telephone_fond", "./assets/telephone_fond.png");

this.load.image("exclamation", "./assets/exclamation.png");



this.load.spritesheet("img_perso2", "./assets/dude.png", {
    frameWidth: 40,
    frameHeight: 35
});

this.load.image("img_porte1", "./assets/door1.png");

//scene cafe
 this.load.image("porte_balthazar", "./assets/porte_balthazar.png");

            this.load.spritesheet("chat", "./assets/chat.png", {
            frameWidth: 32,
            frameHeight: 48,
            });

            // chargement tuiles de jeu
            this.load.image("Phaser_tuilesdejeu3", "./assets/barthe.png");

            // chargement de la carte
            this.load.tilemapTiledJSON("carte3", "assets/cafethe.json");


            this.load.image("ticket", "./assets/ticket.png");
            this.load.image("sac", "./assets/sac.png");

            this.load.image("carte", "./assets/carte.png");   // l'icône
            this.load.image("map", "./assets/map.jpg");       // la grande carte
            this.load.image("perso", "./assets/perso.webp");   // la tête du personnage

            this.load.image("livre", "./assets/livre.png");   
            this.load.image("bibliotheque", "./assets/bibliotheque.png"); 





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