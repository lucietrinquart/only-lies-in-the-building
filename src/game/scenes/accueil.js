import * as Phaser from "phaser";
// NOUVEAU : on importe le module d'inventaire
import { InventaireUI, ObjetRamassable, possedeObjet, retirerObjet } from "./inventaire.js";
// NOUVEAU : on importe le module carte
import { CarteUI } from "./carte.js";

// NOUVEAU : on importe le module tâches
import { TachesUI, ajouterTaches } from "./taches.js";

import { DialogueUI } from "./dialogue.js";
var cursors;
var player; // désigne le sprite du joueur
var groupe_plateformes; // contient toutes les plateformes
var clavier; // pour la gestion du clavier
var calque_plateformes;
var exclamation1;
var secretaire;
var dialogueText; // Déclaration de la variable de texte
var interactionActive = false;
var dialogueIndex = 0;
var dialogues = [
  "Secrétaire : Bianca, le directeur vous attend dans son bureau. Vous le trouverez en montant les escaliers à droite.",
  "Bianca : D'accord, je vais le voir tout de suite. Merci.",
];

export default class accueil extends Phaser.Scene {
  // constructeur de la classe
  constructor() {
    super({
      key: "accueil", //  ici on précise le nom de la classe en tant qu'identifiant
    });
  }
  preload() {}

  create() {
    const carteDuNiveau = this.add.tilemap("carte4");
    this.carteUI = new CarteUI(this);
    this.inventaireUI = new InventaireUI(this);


    // chargement du jeu de tuiles
    const tileset = carteDuNiveau.addTilesetImage(
      "sprite_accueil",
      "Phaser_tuilesdejeu4"
    );

    /***************************
     *  CREATION DES CALQUES *
     ****************************/
    const background1 = carteDuNiveau.createLayer("background", tileset);

    const sol = carteDuNiveau.createLayer("sol", tileset);

    const tapis = carteDuNiveau.createLayer("tapis", tileset);

    const mur = carteDuNiveau.createLayer("mur", tileset);

    const deco_murale = carteDuNiveau.createLayer("deco_murale", tileset);
    const meuble = carteDuNiveau.createLayer("meuble", tileset);

    const deco_meuble = carteDuNiveau.createLayer("deco_meuble", tileset);

    const murs_porteurs = carteDuNiveau.createLayer("murs_porteurs", tileset);

    const escalier = carteDuNiveau.createLayer("escalier", tileset);

    /***************************
     *  CREATION DES OBJETS *
     ****************************/
    clavier = this.input.keyboard.createCursorKeys();
    cursors = this.input.keyboard.createCursorKeys();
    player = this.physics.add.sprite(420, 650, "img_perso");
    secretaire = this.physics.add.sprite(410, 450, "secretaire");

    this.porte_ville = this.physics.add.staticSprite(380, 560, "img_porte1");
    this.porte_ville.setAlpha(0);
    this.porte_labyrinthe = this.physics.add.staticSprite(
      720,
      350,
      "img_porte1"
    );
    this.porte_labyrinthe.setAlpha(0);
    exclamation1 = this.physics.add.sprite(410, 418, "exclamation");
    exclamation1.setScale(0.03);

    /***************************
     *  CREATION DES COLISIONS *
     ****************************/
    deco_meuble.setCollisionByProperty({ estSolide: true });
    meuble.setCollisionByProperty({ estSolide: true });
    murs_porteurs.setCollisionByProperty({ estSolide: true });
    mur.setCollisionByProperty({ estSolide: true });

    this.physics.add.collider(player, deco_meuble);
    this.physics.add.collider(player, murs_porteurs);
    this.physics.add.collider(player, meuble);
    this.physics.add.collider(player, deco_meuble);
    this.physics.add.collider(player, mur);

    player.setCollideWorldBounds(true); // le player se cognera contre les bords du monde
    this.physics.world.enable(player);

    /***************************
     *  CREATION DES ANIMATIONS *
     ****************************/
    this.anims.create({
      key: "left",
      frames: this.anims.generateFrameNumbers("dude", { start: 0, end: 3 }),
      frameRate: 10,
      repeat: -1,
    });

    // animation lorsque le personnage n'avance pas
    this.anims.create({
      key: "turn",
      frames: [{ key: "dude", frame: 4 }],
      frameRate: 20,
    });

    // animation pour tourner à droite
    this.anims.create({
      key: "right",
      frames: this.anims.generateFrameNumbers("dude", { start: 5, end: 8 }),
      frameRate: 10,
      repeat: -1,
    });
    this.anims.create({
      key: "haut",
      frames: this.anims.generateFrameNumbers("img_perso", {
        start: 12,
        end: 14,
      }),
      frameRate: 10,
      repeat: -1,
    });

    this.anims.create({
      key: "bas",
      frames: this.anims.generateFrameNumbers("img_perso", {
        start: 9,
        end: 11,
      }),
      frameRate: 10,
      repeat: -1,
    });

    /***************************
     *  CREATION DES DIALOGUES *
     ****************************/
    // Créez un texte avec un fond de couleur
    dialogueText = this.add.text(10, 450, "", {
      font: "20px Arial",
      fill: "#ffffff",
      backgroundColor: "rgba(0, 0, 0, 0.7)",
      padding: {
        left: 20, // Espacement à gauche
        right: 400, // Espacement à droite
        top: 20, // Espacement en haut
        bottom: 20,
      },
      shadow: {
        offsetX: 2,
        offsetY: 2,
        blur: 4,
        color: "#000000",
      },
      wordWrap: {
        width: 460, // Ajustez la largeur en conséquence
      },
    });

    dialogueText.setScrollFactor(0);
    dialogueText.setDepth(1);
    dialogueText.setWordWrapWidth(700);
    dialogueText.setVisible(false);

    this.input.keyboard.on("keydown-E", () => {
      // Vérifiez si dude2 est à proximité pour l'interaction
      var distance = Phaser.Math.Distance.Between(
        player.x,
        player.y,
        secretaire.x,
        secretaire.y
      );

      // Gestion de l'interaction avec dude2
      if (distance < 200) {
        if (dialogueIndex < dialogues.length) {
          dialogueText.setText(dialogues[dialogueIndex]);
          dialogueText.setVisible(true);
          interactionActive = true;
          dialogueIndex++;
          this.physics.pause();
        } else {
          dialogueText.setVisible(false);
          dialogueIndex = 0;
          this.physics.resume();
        }
      }
    });

       this.anims.create({
      key: "left",
      frames: this.anims.generateFrameNumbers("img_perso", {
        start: 0,
        end: 3,
      }),
      frameRate: 10,
      repeat: -1,
    });

    // animation lorsque le personnage n'avance pas
    this.anims.create({
      key: "turn",
      frames: [{ key: "img_perso", frame: 4 }],
      frameRate: 20,
    });

    // animation pour tourner à droite
    this.anims.create({
      key: "right",
      frames: this.anims.generateFrameNumbers("img_perso", {
        start: 5,
        end: 8,
      }),
      frameRate: 10,
      repeat: -1,
    });
    // animation va en haut
    this.anims.create({
      key: "haut",
      frames: this.anims.generateFrameNumbers("img_perso", {
        start: 12,
        end: 14,
      }),
      frameRate: 10,
      repeat: -1,
    });
    // animation va en bas
    this.anims.create({
      key: "bas",
      frames: this.anims.generateFrameNumbers("img_perso", {
        start: 9,
        end: 11,
      }),
      frameRate: 10,
      repeat: -1,
    });

    /***********************
     *  CREATION DU CLAVIER *
     ************************/

    clavier = this.input.keyboard.createCursorKeys();

    cursors = this.input.keyboard.createCursorKeys();

    this.physics.world.setBounds(0, 0, 800, 608);
    //  ajout du champs de la caméra de taille identique à celle du monde
    this.cameras.main.setBounds(0, 0, 800, 608);
    // ancrage de la caméra sur le joueur
    this.cameras.main.startFollow(player);

    this.input.keyboard.on("keyup-E", () => {
      // Laisser le texte affiché jusqu'à ce qu'E soit relâchée
    });
  }

  update() {
    /***************************
     *  CREATION DES ANIMATIONS *
     ****************************/
if (cursors.up.isDown) {
      player.setVelocityY(-160);
      player.anims.play("bas", true);
    } else if (cursors.down.isDown) {
      player.setVelocityY(160);
      player.anims.play("haut", true);
    } else {
      player.setVelocityY(0);
    }

    if (cursors.left.isDown) {
      player.setVelocityX(-160);
      player.anims.play("left", true);
    } else if (cursors.right.isDown) {
      player.setVelocityX(160);
      player.anims.play("right", true);
    } else {
      // Si aucune touche de déplacement n'est enfoncée, arrête le personnage
      player.setVelocityX(0);
    }

    if (
      !cursors.up.isDown &&
      !cursors.down.isDown &&
      !cursors.left.isDown &&
      !cursors.right.isDown
    ) {
      player.anims.play("turn");
    }
    /***************************
     *  TELEPORTATION AVEC LES PORTES *
     ****************************/

    if (this.physics.overlap(player, this.porte_labyrinthe)) {
      this.scene.start("labyrinthe");
    }
  }
}
