import * as Phaser from "phaser";
import { ReglagesUI } from "./reglage.js";

export default class credit extends Phaser.Scene {
    constructor() {
        super({ key: "credit" });
    }

    preload() {}

    create() {
        // Image de fond
        var img = this.add.image(0, 0, "menu_instruction")
            .setOrigin(0)
            .setDepth(0);

        // Titre des crédits
        this.add.text(400, 100, "CRÉDITS", {
            fontSize: "36px",
            fontFamily: "Arial",
            color: "#ffffff",
            fontStyle: "bold",
            stroke: "#000000",
            strokeThickness: 5
        }).setOrigin(0.5).setDepth(1);

        // Membres du groupe
        this.add.text(400, 230,
            "ÉQUIPE DE DÉVELOPPEMENT\n\n" +
            "Théo\n" +
            "Helvina\n" +
            "Lucie",
            {
                fontSize: "24px",
                fontFamily: "Arial",
                color: "#ffffff",
                align: "center",
                fontStyle: "bold",
                stroke: "#000000",
                strokeThickness: 4,
                lineSpacing: 8
            }
        ).setOrigin(0.5).setDepth(1);

        // Crédits des ressources
        this.add.text(400, 400,
            "RESSOURCES DU JEU\n\n" +
            "Musiques : [Nom de la source / auteur]\n" +
            "Assets : [Nom de la source / auteur]",
            {
                fontSize: "18px",
                fontFamily: "Arial",
                color: "#ffffff",
                align: "center",
                fontStyle: "bold",
                stroke: "#000000",
                strokeThickness: 4,
                lineSpacing: 8
            }
        ).setOrigin(0.5).setDepth(1);

        // Bouton Continuer
        var bouton_play = this.add
            .image(400, 500, "imageBoutonContinuer")
            .setDepth(1);

        // Bouton interactif
        bouton_play.setInteractive();

        // Retour au menu
        bouton_play.on("pointerup", () => {
            this.scene.start("menu");
        });
    }
}