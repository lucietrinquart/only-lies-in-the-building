import * as Phaser from "phaser";
import menu from "./game/scenes/menu.js";
import telephone from "./game/scenes/telephone.js";
import mon_telephone from "./game/scenes/mon_telephone.js";
import bar from "./game/scenes/bar.js";
import bd from "./game/scenes/bd.js";
import bd2 from "./game/scenes/bd2.js";
import hall from "./game/scenes/hall.js";
import entreprise_gregoire from "./game/scenes/entreprise_gregoire.js";
import cafoutche from "./game/scenes/cafoutche.js";
import entreprise_gregoire2 from "./game/scenes/entreprise_gregoire2.js";
import instruction from "./game/scenes/instruction.js";
import credit from "./game/scenes/credit.js";
import maison from "./game/scenes/maison.js";
import rue from "./game/scenes/rue.js";
import couloir from "./game/scenes/couloir.js";
import victor_maison from "./game/scenes/victor_maison.js";
import victor_secret from "./game/scenes/victor_secret.js";
import gendarmerie2 from "./game/scenes/gendarmerie2.js";
import bd_victor from "./game/scenes/bd_victor.js";
import bd_jessica from "./game/scenes/bd_jessica.js";
import bd_marguerite from "./game/scenes/bd_marguerite.js";
import bd_gregoire from "./game/scenes/bd_gregoire.js";









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
        bd,
        bd2,
        maison,
        telephone,
        bar,
        hall,
        entreprise_gregoire,
        cafoutche,
        entreprise_gregoire2,
        instruction,
        credit,
        rue,
        couloir,
        victor_maison,
        victor_secret,
        mon_telephone,
        gendarmerie2,
        bd_victor,
        bd_jessica,
        bd_marguerite,
        bd_gregoire
    ],

    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    }
};

var game = new Phaser.Game(config);
game.scene.start("menu");