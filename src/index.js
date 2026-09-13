import * as Phaser from "phaser";
import menu from "./game/scenes/menu.js";
import gendarmerie from "./game/scenes/gendarmerie.js";


var config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,

    physics: {
        default: "arcade",
        arcade: {
            gravity: {
                y: 0
            },
            debug: false
        }
    },

    scene: [
        menu,
        gendarmerie
    ],

    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    }
};

var game = new Phaser.Game(config);
game.scene.start("menu");