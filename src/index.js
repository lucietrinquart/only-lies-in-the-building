import * as Phaser from "phaser";
import menu from "./game/scenes/menu.js";
import gendarmerie from "./game/scenes/gendarmerie.js";
import telephone from "./game/scenes/telephone.js";
import cafet from "./game/scenes/cafet.js";
import bd from "./game/scenes/bd.js";
import bd2 from "./game/scenes/bd2.js";
import accueil from "./game/scenes/accueil.js";
import instruction from "./game/scenes/instruction.js";
import credit from "./game/scenes/credit.js";
import gendarmerie2 from "./game/scenes/gendarmerie2.js";
import gendarmerie3 from "./game/scenes/gendarmerie3.js";









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
        gendarmerie,
        telephone,
        cafet,
        bd,
        bd2,
        accueil,
        instruction,
        credit,
        gendarmerie2,
        gendarmerie3
    ],

    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    }
};

var game = new Phaser.Game(config);
game.scene.start("menu");