import * as Phaser from "phaser";

export default class instruction extends Phaser.Scene {
    constructor() {
        super({ key: "instruction" });
    }

    preload() {}

    create() {
        // Image de fond
        var img = this.add.image(0, 0, "menu_instruction")
            .setOrigin(0)
            .setDepth(0);

        // Texte des instructions
        this.add.text(400, 200,
            "COMMENT JOUER ?\n\n" +
            "⬆ ⬇ ⬅ ➡  : Se déplacer\n\n" +
            "E : Interagir avec les objets,\n" +
            "parler aux personnages et examiner\n" +
            "les éléments du décor.",
            {
                fontSize: "22px",
                fontFamily: "Arial",
                color: "#ffffff",
                align: "center",
                fontStyle: "bold",
                stroke: "#000000",
                strokeThickness: 4,
                lineSpacing: 8
            }
        )
        .setOrigin(0.5)
        .setDepth(1);

        // Bouton Continuer
        var bouton_play = this.add
            .image(400, 450, "imageBoutonContinuer")
            .setDepth(1);

        // Bouton interactif
        bouton_play.setInteractive();

        // Lancement du niveau 1
        bouton_play.on("pointerup", () => {
            this.scene.start("bd");
        });
    }
}