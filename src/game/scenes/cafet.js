import * as Phaser from "phaser";

var player; // désigne le sprite du joueur
var groupe_plateformes; // contient toutes les plateformes
var clavier; // pour la gestion du clavier
var cursors;
var dude2;
var exclamation;
var telephone;
var dialogueText; // Déclaration de la variable de texte
var interactionActive = false;
var dialogueIndex = 0;
var dialogues = [
  "Biance : Coucou Hervet ! Comment ça va ?",
  "Hervet : Désolé Bianca, je suis un peu occupé en ce moment. Je ne peux pas parler longtemps.",
  "Bianca : Je sais que c'est à cause de l'affaire du meurtre. Je ne l'ai pas tué et je vais le prouver. Es tc eque tu peux me dire si Adrien est venu dans ce bar il y a âs lontgtemps ??",
  "Hervet : Oui hier soir, il est venu avec un ami. Je ne sais pas ce qu'il faisait là-bas, mais il semblait nerveux. Il a laissé des affaires je les ai laissé sur le contoir",
  "Bianca : Hier c'est bizarre il m'a dit qu'il avait du travail à finir et qu'il rentrai plus tard. Je peux voir les affaires",
  "Hervet : Oui si tu veux c'est derrière le contoir mais c'est rien de spécial, juste des papiers et un stylo. Je ne sais pas si ça peut t'aider. Tu peux aussi regarder il était sur la table 4 en bas a droite de la pièce.",

];

export default class cafet extends Phaser.Scene {
  constructor() {
    super({ key: "cafet" }); // mettre le meme nom que le nom de la classe
  }

  preload() {}

  create(data) {
     const carteDuNiveau = this.add.tilemap("carte3");
            // chargement du jeu de tuiles
    const tileset = carteDuNiveau.addTilesetImage(
            "barthe",
            "Phaser_tuilesdejeu3"
    );

            // chargement du second calque "calque_backgroung"
    const sol= carteDuNiveau.createLayer("sol", tileset);
    const fond= carteDuNiveau.createLayer("fond", tileset);
    const fond2 = carteDuNiveau.createLayer("fond2", tileset);
    const bois = carteDuNiveau.createLayer("bois", tileset);
    const objet4 = carteDuNiveau.createLayer("objet4", tileset);
    const objet5 = carteDuNiveau.createLayer("objet5", tileset);
    const arbre = carteDuNiveau.createLayer("arbre", tileset);
    const interdiction = carteDuNiveau.createLayer("interdiction", tileset);

    arbre.depth=100;

    this.dude2 = this.physics.add.sprite(398, 387, "img_perso2");



    fond2.setCollisionByProperty({ estSolide: true });
    objet4.setCollisionByProperty({ estSolide: true });
    objet5.setCollisionByProperty({ estSolide: true });
    interdiction.setCollisionByProperty({ estSolide: true });




    // création du personnage de jeu et positionnement
    player = this.physics.add.sprite(350, 500, "img_perso");


            const chat = this.physics.add.staticSprite(552, 325, "chat");

            this.porte = this.physics.add.staticSprite(600, 570, "porte_balthazar");
            this.porte.setScale(0.5);
            this.porte.setAlpha(0);

            this.porte2 = this.physics.add.staticSprite(700, 570, "porte_balthazar");
            this.porte2.setScale(0.5);
            this.porte2.setAlpha(0);

            this.porte3 = this.physics.add.staticSprite(650, 570, "porte_balthazar");
            this.porte3.setScale(0.5);
            this.porte3.setAlpha(0);

            this.porte4 = this.physics.add.staticSprite(750, 570, "porte_balthazar");
            this.porte4.setScale(0.5);
            this.porte4.setAlpha(0);



            // ajout du modèle de collision entre le personnage et les plates-formes

            // ajout du modèle de collision entre le personnage et le monde
            player.setCollideWorldBounds(true);
            // Collisions avec les calques de collision
            this.physics.add.collider(player, fond2);
            this.physics.add.collider(player, objet4);
            this.physics.add.collider(player, objet5);
            this.physics.add.collider(player, interdiction);
            this.physics.add.collider(player, chat);



            // animation pour tourner à gauche
            this.anims.create({
            key: "cat",
            frames: this.anims.generateFrameNumbers("chat", { start: 0, end: 3 }),
            frameRate: 2,
            repeat: -1,
            });


            clavier = this.input.keyboard.createCursorKeys();
            chat.anims.play("cat", true);

            // création d'un écouteur sur le clavier
            cursors = this.input.keyboard.createCursorKeys();
            // redimentionnement du monde avec les dimensions calculées via tiled
            this.physics.world.setBounds(0, 0, 1280, 640);
            //  ajout du champs de la caméra de taille identique à celle du monde
            this.cameras.main.setBounds(0, 0, 1280, 640);
            // ancrage de la caméra sur le joueur
            this.cameras.main.startFollow(player);

                // Créez un texte avec un fond de couleur
               dialogueText = this.add.text(0, 450, "", {
      font: "20px Arial",
      fill: "#ffffff",
      backgroundColor: "rgba(0, 0, 0, 0.7)",
      align: "left",
      padding: {
        left: 50, // Espacement à gauche
        right: 500, // Espacement à droite
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
        width: 200,
      },
    });

    dialogueText.setScrollFactor(0);
    dialogueText.setDepth(1);
    dialogueText.setWordWrapWidth(700);
    dialogueText.setVisible(false);

                  // PRENDRE LA DISTANCE ENTRE LES EPRSONNAGES POUR ENSUITE LES FAIRE APPARAITRENT AVEC E
                  this.input.keyboard.on("keydown-E", () => {
                    // Si le téléphone est déjà ouvert (scène en pause), on ignore la touche E ici
                    if (this.scene.isPaused()) return;
              
                    var distanceDude2 = Phaser.Math.Distance.Between(
                      player.x,
                      player.y,
                      this.dude2.x,
                      this.dude2.y
                    );
            
            
              
                    if (distanceDude2 < 125) {
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
                  //POUR GARDER LE DIALOGUE
                  this.input.keyboard.on("keyup-E", () => {});
              
        }

            update() {
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
                if (Phaser.Input.Keyboard.JustDown(clavier.space) == true ) {
                    if (this.physics.overlap(player, this.levier3) == true) {
                        this.developperCount1++;
                        console.log(this.developperCount1);
                            this.scene.switch("textecvklaibi");
                        }
                    else if (this.physics.overlap(player, this.levier4) == true) {
                        this.developperCount1++;
                        console.log(this.developperCount1);
                        this.scene.switch("texteproces");
                    }                    
                    else if (this.physics.overlap(player, this.porte) == true) {
                        this.scene.start("selectWorld");
                    } 
                    else if (this.physics.overlap(player, this.porte2) == true) {
                        this.scene.start("selectWorld");
                    } 
                    else if (this.physics.overlap(player, this.porte3) == true) {
                        this.scene.start("selectWorld");
                    } 
                    else if (this.physics.overlap(player, this.porte4) == true) {
                        this.scene.start("selectWorld");
                    }
                }
                if (this.developperCount1 === 2) {
            this.developperCount1 = 0;
            this.showDevelopperImage();
        }
    }
}