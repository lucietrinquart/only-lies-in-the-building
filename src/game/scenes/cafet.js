import * as Phaser from "phaser";
// NOUVEAU : on importe le module d'inventaire
import { InventaireUI, ObjetRamassable, possedeObjet, retirerObjet } from "./inventaire.js";
// NOUVEAU : on importe le module carte
import { CarteUI } from "./carte.js";
// NOUVEAU : on importe le module tâches
import { TachesUI, ajouterTaches } from "./taches.js";

var player; // désigne le sprite du joueur
var groupe_plateformes; // contient toutes les plateformes
var clavier; // pour la gestion du clavier
var cursors;
var dude2;
var exclamation;
var telephone;
var livre;
var bibliotheque;
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
    // CORRECTION : ce compteur n'était jamais initialisé (il valait undefined)
    this.developperCount1 = 0;
    // CORRIGÉ : on lit l'état depuis le registry (survit au changement de scène)
    // au lieu de toujours repartir à false.
    this.bibliothequeOuverte = this.registry.get("cafet_bibliotheque_ouverte") || false;

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

            this.porte5 = this.physics.add.staticSprite(1000, 100, "porte_balthazar");
            this.porte5.setScale(0.5);





            this.bibliotheque = this.physics.add.staticSprite(
              this.bibliothequeOuverte ? 1120 : 1000, // CORRIGÉ : si déjà ouverte, on la recrée directement décalée
              100,
              "bibliotheque"
            );
            this.bibliotheque.setScale(0.2);
                player = this.physics.add.sprite(350, 500, "img_perso");


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

    /* ============================================================
     *  NOUVEAU : L'OBJET À RAMASSER (le ticket)
     * ============================================================ */
    // Place-le où tu veux sur la map (ici près de la table 4, à ajuster)
    this.ticket = new ObjetRamassable(
      this,
      900,            // position x
      480,            // position y
      "ticket", // clé de la texture (voir preload global)
      "Ticket",        // nom affiché dans l'inventaire
      "Un ticket de caisse retrouvé sur la table 4. La date est celle du soir du meurtre.",
      {
        taille: 40,    // taille affichée au sol (en pixels)
        message: "Ticket récupéré",
        perimetre: 60, // distance à laquelle on peut le ramasser
        idTache: "recuperer_ticket", // NOUVEAU : termine cette tâche au ramassage
      }
    );

      // CORRIGÉ : si le livre a déjà été posé dans la bibliothèque, on ne le
      // recrée pas au sol (sinon il "réapparaîtrait" à chaque retour dans cafet)
      this.livre = this.bibliothequeOuverte
        ? null
        : new ObjetRamassable(
            this,
            900,            // position x
            300,            // position y
            "livre", // clé de la texture (voir preload global)
            "Livre",        // nom affiché dans l'inventaire
            "Un livre retrouvé sur la table 4. La date est celle du soir du meurtre.",
            {
              taille: 40,    // taille affichée au sol (en pixels)
              message: "Livre récupéré",
              perimetre: 60, // distance à laquelle on peut le ramasser
              idTache: "recuperer_livre", // NOUVEAU : termine cette tâche au ramassage
            }
          );

    /* ============================================================
     *  NOUVEAU : L'INTERFACE D'INVENTAIRE (icône sac en bas à droite)
     * ============================================================ */
    this.inventaireUI = new InventaireUI(this);

    /* ============================================================
     *  NOUVEAU : L'INTERFACE CARTE (icône à gauche de l'inventaire)
     * ============================================================ */
    this.carteUI = new CarteUI(this);

    /* ============================================================
     *  NOUVEAU : L'INTERFACE DES TÂCHES (liste en haut à droite)
     * ============================================================ */
    this.tachesUI = new TachesUI(this);

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

                    // NOUVEAU : on tente d'abord de ramasser le ticket.
                    // Si ça marche, on s'arrête là (pas de dialogue en même temps).
                    // CORRIGÉ : this.livre peut être null si le livre a déjà été posé
                    if (this.ticket.tenterRamassage(player) || (this.livre && this.livre.tenterRamassage(player))) return;

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

                        // NOUVEAU : le dialogue vient de se terminer -> on ajoute les 2 tâches
                        ajouterTaches(this, [
                          { id: "recuperer_ticket", texte: "Récupérer le ticket" },
                          { id: "parler_gendarme", texte: "Aller parler au gendarme" },
                          { id: "recuperer_livre", texte: "Récupérer le livre" },

                        ]);
                      }
                    }
                  });
                  //POUR GARDER LE DIALOGUE
                  this.input.keyboard.on("keyup-E", () => {});
              
        }

            update() {
                // NOUVEAU : affiche/cache l'indice "E" au-dessus du ticket
                this.ticket.update(player);
                // CORRIGÉ : this.livre peut être null si le livre a déjà été posé
                if (this.livre) this.livre.update(player);

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
                    // CORRECTION : this.levier3 et this.levier4 n'existent pas dans cette scène.
                    // Les tests ont été retirés pour éviter un plantage.
                    // Si tu veux les remettre, il faut d'abord créer les sprites dans create().
                    if (this.physics.overlap(player, this.porte) == true) {
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
                    // NOUVEAU : la porte derrière la bibliothèque n'est utilisable
                    // que si la bibliothèque a déjà été déplacée (livre posé)
                    else if (this.bibliothequeOuverte && this.physics.overlap(player, this.porte5) == true) {
                        this.scene.start("gendarmerie");
                    }
                }
    }

    /* ============================================================
     *  NOUVEAU : ACTIONS CONTEXTUELLES DE L'INVENTAIRE
     * ============================================================
     *  Appelée automatiquement par InventaireUI quand le joueur ouvre
     *  un objet en grand. On retourne un tableau d'actions possibles
     *  POUR CET OBJET DANS LE CONTEXTE ACTUEL (ici : la proximité de
     *  la bibliothèque). Si rien n'est possible, on retourne [].
     */
    obtenirActionsObjet(cle) {
        const actions = [];

        if (cle === "livre" && !this.bibliothequeOuverte && possedeObjet(this, "livre")) {
            const PERIMETRE_BIBLIOTHEQUE = 120; // ajuste selon la distance souhaitée
            const distance = Phaser.Math.Distance.Between(
                player.x,
                player.y,
                this.bibliotheque.x,
                this.bibliotheque.y
            );

            if (distance < PERIMETRE_BIBLIOTHEQUE) {
                actions.push({
                    texte: "Poser le livre dans la bibliothèque",
                    executer: () => this.poserLivreDansBibliotheque(),
                });
            }
        }

        return actions;
    }

    /* ============================================================
     *  NOUVEAU : POSER LE LIVRE DANS LA BIBLIOTHÈQUE
     * ============================================================
     *  - Retire le livre de l'inventaire
     *  - Fait glisser la bibliothèque vers la DROITE (tween)
     *  - Autorise désormais l'interaction avec porte5 (espace)
     *  Le retour à la scène de jeu (fermeture de l'inventaire) est
     *  déjà géré par InventaireUI.fermerTout() avant l'appel ici.
     */
    poserLivreDansBibliotheque() {
        retirerObjet(this, "livre");

        this.bibliothequeOuverte = true;
        // CORRIGÉ : on sauvegarde l'état dans le registry (survit au changement de scène),
        // sinon revenir de gendarmerie remettait tout à zéro.
        this.registry.set("cafet_bibliotheque_ouverte", true);

        this.tweens.add({
            targets: this.bibliotheque,
            x: this.bibliotheque.x + 120, // vers la droite ; ajuste la distance si besoin
            duration: 800,
            ease: "Cubic.easeInOut",
        });
    }
}