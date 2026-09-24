import * as Phaser from "phaser";
// en haut du fichier
import { InventaireUI } from "./inventaire.js";
import { CarteUI } from "./carte.js";
// NOUVEAU : on importe le module tâches
import { TachesUI, terminerTache } from "./taches.js";
// NOUVEAU : on importe le module énigme
import { EnigmeUI } from "./enigme.js";
// NOUVEAU : on importe le module dialogue avec portraits
import { DialogueUI } from "./dialogue.js";

import { OrdinateurUI } from "./ordinateur.js";

var player; // désigne le sprite du joueur
var groupe_plateformes; // contient toutes les plateformes
var clavier; // pour la gestion du clavier
var cursors;
var dude2;
var exclamation;
var telephone;
var interactionActive = false;
var dialogueIndex = 0;
// NOUVEAU : la série de répliques affichée dans LA conversation en cours.
// Elle change selon l'état (intro / à réessayer / résolu) -> voir obtenirDialogueActuel()
var dialoguesActuels = [];

// NOUVEAU : chaque réplique est un objet { texte, moi, perso }
// - "moi"   -> clé de texture pour TON portrait (moi_colere / moi_heureuse / moi_triste, en .png)
// - "perso" -> clé de texture pour le portrait du PNJ (perso_colere / perso_heureuse / perso_triste, en .webp)
// Change librement les émotions ligne par ligne, c'est fait pour ça !
var dialogues = [
  {
    texte:
      "Gendarme : Bienvenue, Bianca. Nous avons besoin de vos compétences de détective pour résoudre un meurtre mystérieux à l opéra.",
    moi: "moi_hereuse",
    perso: "perso_triste",
  },
  {
    texte: "Bianca : Un meurtre à l opéra ? Quelle est la situation exacte ?",
    moi: "moi_triste",
    perso: "perso_hereuse",
  },
  {
    texte:
      "Gendarme : Un acteur de l opéra a été retrouvé assassiné, et les circonstances entourant sa mort sont encore inconnues. L incident a semé la panique parmi les artistes, et l opéra est plongé dans le chaos.",
    moi: "moi_colere",
    perso: "perso_colere",
  },
  {
    texte:
      "Bianca : Je vais me rendre à l opéra immédiatement. Je ferai tout ce qui est en mon pouvoir pour résoudre cette affaire.",
    moi: "moi_hereuse",
    perso: "perso_colere",
  },
  {
    texte: "Gendarme : Nous comptons sur vous, Bianca. Soyez prudente et bonne chance.",
    moi: "moi_hereuse",
    perso: "perso_hereuse",
  },
  // NOUVEAU : dernière réplique -> propose l'énigme une fois le dialogue terminé
  {
    texte:
      "Gendarme : Je veux bien te donner un indice si tu arrives à m'aider à résoudre cette enquête de meurtre.",
    moi: "moi_hereuse",
    perso: "perso_hereuse",
  },
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
          {
            texte: "Gendarme : Wow, tu es vraiment forte ! Voici la preuve.",
            moi: "moi_hereuse",
            perso: "perso_hereuse",
          },
          4000
        );
      },
      onReponseIncorrecte: () => {
        this.afficherReponseGendarme(
          {
            texte: "Gendarme : Non, ce n'est pas logique.",
            moi: "moi_triste",
            perso: "perso_colere",
          },
          3000
        );
      },
    });

    // NOUVEAU : l'interface de dialogue avec portraits (joueur à gauche, PNJ à droite)
    this.dialogueUI = new DialogueUI(this, {
      moiParDefaut: "moi_heureuse",
      persoParDefaut: "perso_triste",
    });

    this.ordinateurUI = new OrdinateurUI(this, {
  videos: [
    { nomAffiche: "video-541-06-09-2026-10:20", cle: "video_surveillance1" },
    { nomAffiche: "video-233-06-09-2026-14:47", cle: "video_surveillance2" },
    { nomAffiche: "video-089-06-09-2026-23:05", cle: "video_surveillance3" },
  ],
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

    this.ordinateur = this.physics.add.staticSprite(150, 350, "ordinateur");
    this.ordinateur.setScale(0.1);



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

    // PRENDRE LA DISTANCE ENTRE LES EPRSONNAGES POUR ENSUITE LES FAIRE APPARAITRENT AVEC E
    this.input.keyboard.on("keydown-E", () => {
      // Si le téléphone est déjà ouvert (scène en pause), on ignore la touche E ici
      if (this.scene.isPaused()) return;
      // NOUVEAU : on ignore aussi la touche E si le panneau d'énigme est ouvert
      if (this.enigmeGendarme.panneau.visible) return;
      if (this.ordinateurUI.visible) return;

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

      var distanceOrdinateur = Phaser.Math.Distance.Between(
  player.x,
  player.y,
  this.ordinateur.x, // adapte "this.ordinateur" au nom réel de ton sprite
  this.ordinateur.y
);

var PERIMETRE_ORDINATEUR = 60; // ajuste selon la taille de ton sprite
if (distanceOrdinateur < PERIMETRE_ORDINATEUR) {
  this.ordinateurUI.ouvrir();
  return;
}

      if (distanceDude2 < 125) {
        // NOUVEAU : au tout début d'une conversation (dialogueIndex === 0),
        // on choisit QUELLE série de répliques utiliser selon l'état actuel
        // (intro jamais faite / en attente de réessai / déjà résolu)
        if (dialogueIndex === 0) {
          dialoguesActuels = this.obtenirDialogueActuel();
        }

        if (dialogueIndex < dialoguesActuels.length) {
          // NOUVEAU : on affiche la réplique AVEC ses portraits (joueur à gauche, PNJ à droite)
          this.dialogueUI.afficherLigne(dialoguesActuels[dialogueIndex]);
          interactionActive = true;
          dialogueIndex++;
          this.physics.pause();
        } else {
          this.dialogueUI.masquer();
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
   *  MACHINE À ÉTATS DU DIALOGUE AVEC LE GENDARME
   * ============================================================
   *  États possibles (déduits, pas besoin de tout stocker) :
   *  - "intro"           : l'introduction complète n'a jamais été jouée
   *  - "attente_reessai"  : l'intro est terminée, l'énigme pas encore résolue
   *  - "resolu"           : l'énigme a été résolue (this.enigmeGendarme.estResolue())
   */

  // Retourne la série de répliques à utiliser pour la conversation qui commence
  obtenirDialogueActuel() {
    if (this.enigmeGendarme.estResolue()) {
      return [{ texte: "Gendarme : Merci beaucoup.", moi: "moi_hereuse", perso: "perso_hereuse" }];
    }

    const introTerminee = this.registry.get("gendarme_intro_terminee") || false;

    if (!introTerminee) {
      return dialogues; // la grande introduction (se termine par l'offre d'indice)
    }

    // Intro déjà faite, énigme pas encore résolue -> réplique de relance avant de rouvrir l'énigme
    return [
      {
        texte: "Gendarme : Ah oui, tu veux vraiment cette preuve ? Vas-y, je te laisse une autre chance.",
        moi: "moi_triste",
        perso: "perso_colere",
      },
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
  // "ligne" est un objet { texte, moi, perso }, comme pour le reste du dialogue.
  afficherReponseGendarme(ligne, duree = 3500) {
    this.dialogueUI.afficherLigne(ligne);
    this.physics.pause();

    this.time.delayedCall(duree, () => {
      this.dialogueUI.masquer();
      this.physics.resume();
    });
  }
}