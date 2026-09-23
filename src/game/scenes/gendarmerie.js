import * as Phaser from "phaser";
// en haut du fichier
import { InventaireUI } from "./inventaire.js";
import { CarteUI } from "./carte.js";
// NOUVEAU : on importe le module tâches
import { TachesUI, terminerTache } from "./taches.js";
// NOUVEAU : on importe le module énigme
import { EnigmeUI } from "./enigme.js";


// dans create(), n'importe où

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
// NOUVEAU : la série de répliques affichée dans LA conversation en cours.
// Elle change selon l'état (intro / à réessayer / résolu) -> voir obtenirDialogueActuel()
var dialoguesActuels = [];
var dialogues = [
  "Gendarme : Bienvenue, Bianca. Nous avons besoin de vos compétences de détective pour résoudre un meurtre mystérieux à l opéra.",
  "Bianca : Un meurtre à l opéra ? Quelle est la situation exacte ?",
  "Gendarme : Un acteur de l opéra a été retrouvé assassiné, et les circonstances entourant sa mort sont encore inconnues. L incident a semé la panique parmi les artistes, et l opéra est plongé dans le chaos.",
  "Bianca : Je vais me rendre à l opéra immédiatement. Je ferai tout ce qui est en mon pouvoir pour résoudre cette affaire.",
  "Gendarme : Nous comptons sur vous, Bianca. Soyez prudente et bonne chance.",
  // NOUVEAU : dernière réplique -> propose l'énigme une fois le dialogue terminé
  "Gendarme : Je veux bien te donner un indice si tu arrives à m'aider à résoudre cette enquête de meurtre.",
];

export default class gendarmerie extends Phaser.Scene {
  constructor() {
    super({ key: "gendarmerie" }); // mettre le meme nom que le nom de la classe
  }

  preload() {}

  create(data) {
    this.inventaireUI = new InventaireUI(this);

    const carteDuNiveau = this.add.tilemap("carte1");
    this.carteUI = new CarteUI(this);

    // NOUVEAU : l'interface des tâches (liste en haut à droite)
    this.tachesUI = new TachesUI(this);

    // NOUVEAU : l'énigme du gendarme (question, bonne réponse, récompense)
    this.enigmeGendarme = new EnigmeUI(this, {
      id: "enigme_gendarme",
      question:
        "Trois suspects étaient présents le soir du meurtre, mais un seul n'a pas d'alibi vérifié. Combien de suspects reste-t-il vraiment à interroger ?",
      reponseCorrecte: "3", // NOUVEAU : change cette valeur si tu changes l'énigme
      recompense: {
        cle: "papier", // clé de texture -> doit correspondre à papier.webp chargé dans le preload global
        nom: "Indice",
        description:
          "Un bout de papier griffonné retrouvé par le gendarme. Un indice de plus pour ton enquête.",
      },
      // NOUVEAU : réaction automatique du gendarme selon la réponse donnée
      onReponseCorrecte: () => {
        this.afficherReponseGendarme(
          "Gendarme : Wow, tu es vraiment forte ! Voici la preuve.",
          4000
        );
      },
      onReponseIncorrecte: () => {
        this.afficherReponseGendarme("Gendarme : Non, ce n'est pas logique.", 3000);
      },
    });

    // chargement du jeu de tuiles
    const tileset = carteDuNiveau.addTilesetImage(
      "sprite_police",
      "Phaser_tuilesdejeu1"
    );
    const background = carteDuNiveau.createLayer("background", tileset);

    const sol = carteDuNiveau.createLayer("sol", tileset);

    const murs_porteurs = carteDuNiveau.createLayer("murs_porteurs", tileset);

    const cloison = carteDuNiveau.createLayer("cloison", tileset);

    const tapis = carteDuNiveau.createLayer("tapis", tileset);

    const meuble = carteDuNiveau.createLayer("meuble", tileset);

    const deco_meuble = carteDuNiveau.createLayer("deco_meuble", tileset);

    const deco = carteDuNiveau.createLayer("deco", tileset);

    /***************************
     *  CREATION DES OBJETS *
     ****************************/

    groupe_plateformes = this.physics.add.staticGroup();
    player = this.physics.add.sprite(350, 500, "img_perso");
    exclamation = this.physics.add.sprite(398, 355, "exclamation");
    exclamation.setScale(0.03);
    telephone = this.physics.add.sprite(530, 400, "telephone");
    telephone.setScale(0.03);


    this.porte_ville = this.physics.add.staticSprite(300, 570, "img_porte1");
    this.porte_ville.setAlpha(0);
    this.porte_ville1 = this.physics.add.staticSprite(350, 570, "img_porte1");
    this.porte_ville1.setAlpha(0);
    this.porte_ville2 = this.physics.add.staticSprite(400, 570, "img_porte1");
    this.porte_ville2.setAlpha(0);
    this.porte_ville3 = this.physics.add.staticSprite(450, 570, "img_porte1");
    this.porte_ville3.setAlpha(0);

    this.dude2 = this.physics.add.sprite(398, 387, "img_perso2");

    // on garde une référence sur le sprite du téléphone pour l'utiliser dans update()
    this.telephone = telephone;

    /***************************
     *  CREATION DES COLISIONS *
     ****************************/
    deco.setCollisionByProperty({ estSolide: true });
    meuble.setCollisionByProperty({ estSolide: true });
    murs_porteurs.setCollisionByProperty({ estSolide: true });
    cloison.setCollisionByProperty({ estSolide: true });

    this.physics.add.collider(player, deco);
    this.physics.add.collider(player, meuble);
    this.physics.add.collider(player, murs_porteurs);
    this.physics.add.collider(player, cloison);
    this.physics.add.collider(player, groupe_plateformes);

    this.physics.world.enable(player);
    this.dude2.refreshBody();
    player.setCollideWorldBounds(true); // le player se cognera contre les bords du monde

    /***************************
     *  CREATION DES DIALOGUES *
     ****************************/
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
      // NOUVEAU : on ignore aussi la touche E si le panneau d'énigme est ouvert
      if (this.enigmeGendarme.panneau.visible) return;

      var distanceDude2 = Phaser.Math.Distance.Between(
        player.x,
        player.y,
        this.dude2.x,
        this.dude2.y
      );

      var distanceTelephone = Phaser.Math.Distance.Between(
        player.x,
        player.y,
        this.telephone.x,
        this.telephone.y
      );

      // NOUVEAU : interaction avec le téléphone (priorité si on est plus proche du tel que du gendarme)
      var PERIMETRE_TELEPHONE = 60; // ajuste cette valeur selon la taille de ta map/sprite
      if (distanceTelephone < PERIMETRE_TELEPHONE) {
        this.scene.launch("Telephone"); // on lance la scène téléphone par-dessus
        this.scene.pause(); // on met en pause gendarmerie (le joueur ne bouge plus)
        return; // on n'exécute pas le dialogue du gendarme en même temps
      }

      if (distanceDude2 < 125) {
        // NOUVEAU : au tout début d'une conversation (dialogueIndex === 0),
        // on choisit QUELLE série de répliques utiliser selon l'état actuel
        // (intro jamais faite / en attente de réessai / déjà résolu)
        if (dialogueIndex === 0) {
          dialoguesActuels = this.obtenirDialogueActuel();
        }

        if (dialogueIndex < dialoguesActuels.length) {
          dialogueText.setText(dialoguesActuels[dialogueIndex]);
          dialogueText.setVisible(true);
          interactionActive = true;
          dialogueIndex++;
          this.physics.pause();
        } else {
          dialogueText.setVisible(false);
          dialogueIndex = 0;
          this.physics.resume();

          // NOUVEAU : on réagit à la fin de CETTE conversation précise
          // (peut déclencher l'énigme, la boucle de réessai, ou ne rien faire de plus)
          this.apresDialogueGendarme();
        }
      }
    });
    //POUR GARDER LE DIALOGUE
    this.input.keyboard.on("keyup-E", () => {});

    /***************************
     *  CREATION DES ANIMATIONS *
     ****************************/

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

    //  Collide the player and the groupe_etoiles with the groupe_plateformes
  }

  update() {
    // Si la scène est en pause (téléphone ouvert), on ne traite pas les déplacements
    if (this.scene.isPaused()) return;

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
     *  TELEPORTATION POUR LES PORTES *
     ****************************/

    if (this.physics.overlap(player, this.porte_ville))
      this.scene.start("cafet");
    if (this.physics.overlap(player, this.porte_ville1))
      this.scene.start("cafet");
    if (this.physics.overlap(player, this.porte_ville2))
      this.scene.start("cafet");
    if (this.physics.overlap(player, this.porte_ville3))
      this.scene.start("cafet");
  }

  /* ============================================================
   *  NOUVEAU : MACHINE À ÉTATS DU DIALOGUE AVEC LE GENDARME
   * ============================================================
   *  États possibles (déduits, pas besoin de tout stocker) :
   *  - "intro"          : l'introduction complète n'a jamais été jouée
   *  - "attente_reessai": l'intro est terminée, l'énigme pas encore résolue
   *  - "resolu"          : l'énigme a été résolue (this.enigmeGendarme.estResolue())
   */

  // Retourne la série de répliques à utiliser pour la conversation qui commence
  obtenirDialogueActuel() {
    if (this.enigmeGendarme.estResolue()) {
      return ["Gendarme : Merci beaucoup."];
    }

    const introTerminee = this.registry.get("gendarme_intro_terminee") || false;

    if (!introTerminee) {
      return dialogues; // la grande introduction (se termine par l'offre d'indice)
    }

    // Intro déjà faite, énigme pas encore résolue -> réplique de relance avant de rouvrir l'énigme
    return [
      "Gendarme : Ah oui, tu veux vraiment cette preuve ? Vas-y, je te laisse une autre chance.",
    ];
  }

  // Appelée juste après que la conversation en cours se soit fermée
  apresDialogueGendarme() {
    if (this.enigmeGendarme.estResolue()) {
      // Énigme déjà résolue : "Merci beaucoup." vient de s'afficher, rien d'autre à faire
      return;
    }

    const introTerminee = this.registry.get("gendarme_intro_terminee") || false;

    if (!introTerminee) {
      // On vient de finir l'introduction (qui se termine par l'offre d'indice)
      this.registry.set("gendarme_intro_terminee", true);
      terminerTache(this, "parler_gendarme");
      this.enigmeGendarme.ouvrir();
      return;
    }

    // Intro déjà faite : on vient de fermer la réplique de relance -> on rouvre l'énigme
    this.enigmeGendarme.ouvrir();
  }

  // Affiche une réplique automatique du gendarme (réaction à une réponse), sans
  // attendre d'appui sur E : elle se ferme toute seule après "duree" millisecondes.
  afficherReponseGendarme(texte, duree = 3500) {
    dialogueText.setText(texte);
    dialogueText.setVisible(true);
    this.physics.pause();

    this.time.delayedCall(duree, () => {
      dialogueText.setVisible(false);
      this.physics.resume();
    });
  }
}