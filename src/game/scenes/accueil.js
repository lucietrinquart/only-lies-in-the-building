import * as Phaser from "phaser";
// NOUVEAU : on importe le module d'inventaire
import { InventaireUI, ObjetRamassable, possedeObjet, retirerObjet } from "./inventaire.js";
// NOUVEAU : on importe le module carte
import { CarteUI } from "./carte.js";

// NOUVEAU : on importe le module tâches
import { TachesUI, ajouterTaches } from "./taches.js";

import { DialogueUI } from "./dialogue.js";
// NOUVEAU : on importe le module énigme (pour la bibliothèque) et mail (pour l'ordinateur)
import { EnigmeUI } from "./enigme.js";
import { MailUI } from "./mail.js";

var cursors;
var player; // désigne le sprite du joueur
var groupe_plateformes; // contient toutes les plateformes
var clavier; // pour la gestion du clavier
var calque_plateformes;
var exclamation1;
var dude2;
var bureau;
var ordinateur;
var bibliotheque;


var poubelle;

var secretaire;
var dialogueText; // Déclaration de la variable de texte
var interactionActive = false;
var dialogueIndex = 0;
var dialogueIndex2 = 0;
var dialoguesActuels = [];

// CORRIGÉ : il y avait DEUX "var dialogues" dans ce fichier -> le second
// (répliques du gendarme, copiées-collées d'un autre fichier) écrasait le
// premier (la secrétaire) à cause du "var" qui autorise la redéclaration.
// Voici le VRAI dialogue de dude2 pour cette scène, propre et unique.
var dialoguesDude2 = [
  {
    texte: "Dude2 : Ah, Violette... je ne pensais pas te croiser ici.",
    moi: "moi_heureuse",
    perso: "perso_triste",
  },
  {
    texte: "Violette : Je pourrais te dire la même chose. Qu'est-ce que tu fais là ?",
    moi: "moi_colere",
    perso: "perso_triste",
  },
  {
    texte: "Dude2 : Rien de spécial... Écoute, je dois vraiment y aller.",
    moi: "moi_triste",
    perso: "perso_colere",
  },
  {
    texte: "Dude2 : Et ne va surtout pas fouiller par ici, c'est hors de question.",
    moi: "moi_triste",
    perso: "perso_colere",
  },
  // NOUVEAU : dude2 a déjà tourné les talons à ce moment -> "perso: false"
  {
    texte: "Violette : ...Il a quelque chose à cacher, j'en suis sûre.",
    moi: "moi_colere",
    perso: false,
  },
];

// NOUVEAU : monologue solo quand on interagit avec le bureau (tant que le
// tiroir n'est pas ouvert)
var monologueBureau = [
  {
    texte: "Violette : Le tiroir est fermé... il doit y avoir une clé quelque part.",
    moi: "moi_triste",
    perso: false,
  },
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

    // CORRIGÉ : this.dialogueUI n'était jamais créé -> afficherLigne() aurait
    // planté dès le premier appui sur E près de dude2.
    this.dialogueUI = new DialogueUI(this, {
      moiParDefaut: "moi_heureuse",
      persoParDefaut: "perso_triste",
    });

    // NOUVEAU : état du monologue solo en cours (bureau, etc.)
    this.monologue = null;

    // NOUVEAU : le tiroir du bureau -> on lit l'état depuis le registry pour
    // qu'il reste ouvert si on repasse par cette scène plus tard
    this.tiroirOuvert = this.registry.get("accueil_tiroir_ouvert") || false;

    // NOUVEAU : l'énigme de la bibliothèque (donne la clé)
    this.enigmeBibliotheque = new EnigmeUI(this, {
      id: "enigme_bibliotheque_accueil",
      question:
        "Je suis plus grand que 10 et plus petit que 20. Je suis un nombre pair. La somme de mes chiffres vaut 9. Quel nombre suis-je ?",
      reponseCorrecte: "18", // NOUVEAU : change cette valeur si tu changes l'énigme
      recompense: {
        cle: "cle",
        nom: "Clé",
        description:
          "Une vieille clé trouvée dans un livre de la bibliothèque. Elle doit ouvrir quelque chose quelque part.",
      },
    });

    // NOUVEAU : la messagerie de l'ordinateur -> adapte les mails comme tu veux
    this.mailUI = new MailUI(this, {
      mails: [
        {
          expediteur: "Grégoire",
          objet: "Urgent - rendez-vous annulé",
          corps:
            "Désolé pour hier soir, je n'ai pas pu venir. On se voit demain au bureau, j'ai des choses à te dire sur Adrien.",
        },
        {
          expediteur: "Banque Centrale",
          objet: "Relevé de compte",
          corps:
            "Votre solde a été débité de 5000€ le 12/09. Si vous n'êtes pas à l'origine de cette opération, contactez-nous immédiatement.",
        },
        {
          expediteur: "Victor",
          objet: "RE: RE: Silence",
          corps:
            "Arrête de m'envoyer des messages, quelqu'un pourrait les voir. On en parle de vive voix, pas par écrit.",
        },
      ],
    });


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

    // NOUVEAU : la porte secrète derrière le bureau -> invisible, exactement
    // comme porte_ville/porte_labyrinthe ci-dessus. Créée AVANT le bureau pour
    // qu'elle soit "en dessous" de lui tant qu'il ne s'est pas déplacé.
    this.porteSecrete = this.physics.add.staticSprite(100, 250, "img_porte1");

    bureau = this.physics.add.sprite(
      this.tiroirOuvert ? 100 + 120 : 100, // CORRIGÉ : si déjà ouvert, on le recrée directement décalé
      250,
      "bureau"
    );
     bureau.setScale(0.03);

      poubelle = this.physics.add.sprite(110, 400, "poubelle");
     poubelle.setScale(0.03);

     ordinateur = this.physics.add.sprite(280, 550, "ordinateur");
          ordinateur.setScale(0.1);


     bibliotheque = this.physics.add.sprite(500, 200, "bibliotheque");
     bibliotheque.setScale(0.2);

    // NOUVEAU : dude2 ne réapparaît pas une fois qu'il est "parti" (registry,
    // comme le reste du jeu -> ça survit à un retour dans cette scène)
    const dude2DejaParti = this.registry.get("dude2_accueil_parti") || false;
    if (!dude2DejaParti) {
      this.dude2 = this.physics.add.sprite(600, 387, "img_perso2");
    } else {
      this.dude2 = null;
    }

    // NOUVEAU : la lettre dans la poubelle -> ObjetRamassable classique,
    // verrouillé tant que dude2 n'est pas parti (voir "verrouille" plus bas)
    this.lettre = new ObjetRamassable(
      this,
      poubelle.x,
      poubelle.y - 18, // légèrement au-dessus de la poubelle, comme si elle en dépassait
      "lettre",
      "Lettre",
      "Une lettre froissée trouvée dans la poubelle. Elle pourrait contenir des informations utiles.",
      {
        taille: 28,
        message: "Lettre récupérée",
        perimetre: 60,
      }
    );
    // NOUVEAU : verrouillé tant que dude2 n'est pas parti -> pas de "E", pas de ramassage possible
    this.lettre.verrouille = !this.objetsDebloques();

    // NOUVEAU : les indices "E" des 4 objets (cachés tant que verrouillés)
    this.indiceBureau = this.add
      .text(bureau.x, bureau.y - 26, "E", {
        font: "bold 16px Arial",
        color: "#ffffff",
        backgroundColor: "#000000",
        padding: { x: 7, y: 3 },
      })
      .setOrigin(0.5)
      .setDepth(50)
      .setVisible(false);

    this.indiceOrdinateur = this.add
      .text(ordinateur.x, ordinateur.y - 36, "E", {
        font: "bold 16px Arial",
        color: "#ffffff",
        backgroundColor: "#000000",
        padding: { x: 7, y: 3 },
      })
      .setOrigin(0.5)
      .setDepth(50)
      .setVisible(false);

    this.indiceBibliotheque = this.add
      .text(bibliotheque.x, bibliotheque.y - 36, "E", {
        font: "bold 16px Arial",
        color: "#ffffff",
        backgroundColor: "#000000",
        padding: { x: 7, y: 3 },
      })
      .setOrigin(0.5)
      .setDepth(50)
      .setVisible(false);

    // NOUVEAU : indice de la porte secrète -> ne s'affichera QUE si le tiroir est ouvert
    this.indicePorteSecrete = this.add
      .text(this.porteSecrete.x, this.porteSecrete.y - 26, "E", {
        font: "bold 16px Arial",
        color: "#ffffff",
        backgroundColor: "#000000",
        padding: { x: 7, y: 3 },
      })
      .setOrigin(0.5)
      .setDepth(50)
      .setVisible(false);


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
        this.tachesUI = new TachesUI(this);


    this.input.keyboard.on("keydown-E", () => {
      // NOUVEAU : si l'énigme ou l'ordinateur sont ouverts, on ignore E ici
      if (this.enigmeBibliotheque.panneau.visible || this.mailUI.visible) return;

      // NOUVEAU : un monologue solo (ex: le bureau) est prioritaire sur tout
      if (this.monologue) {
        this.avancerMonologue();
        return;
      }

      // Vérifiez si dude2 est à proximité pour l'interaction
      var distance = Phaser.Math.Distance.Between(
        player.x,
        player.y,
        secretaire.x,
        secretaire.y
      );

      // CORRIGÉ : dude2 peut valoir null une fois parti -> on ne calcule la
      // distance et on ne traite le dialogue QUE s'il existe encore.
      if (this.dude2) {
        var distanceDude2 = Phaser.Math.Distance.Between(
          player.x,
          player.y,
          this.dude2.x,
          this.dude2.y
        );

        if (distanceDude2 < 125) {
          // NOUVEAU : au tout début d'une conversation (dialogueIndex === 0),
          // on choisit QUELLE série de répliques utiliser
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

            // NOUVEAU : dude2 s'en va, la tâche se lance -> voir apresDialogueDude2()
            this.apresDialogueDude2();
          }
          return; // NOUVEAU : on ne traite rien d'autre cette fois-ci
        }
      }

      // ============================================================
      //  NOUVEAU : LES 4 OBJETS DE LA PIÈCE (verrouillés tant que
      //  dude2 n'est pas parti -> this.objetsDebloques())
      // ============================================================
      if (this.objetsDebloques()) {
        const PERIMETRE_OBJETS = 70;

        const distBureau = Phaser.Math.Distance.Between(player.x, player.y, bureau.x, bureau.y);
        const distPorteSecrete = Phaser.Math.Distance.Between(
          player.x,
          player.y,
          this.porteSecrete.x,
          this.porteSecrete.y
        );
        const distOrdinateur = Phaser.Math.Distance.Between(player.x, player.y, ordinateur.x, ordinateur.y);
        const distBibliotheque = Phaser.Math.Distance.Between(
          player.x,
          player.y,
          bibliotheque.x,
          bibliotheque.y
        );

        // La porte secrète (seulement visible/utilisable une fois le tiroir ouvert)
        if (this.tiroirOuvert && distPorteSecrete < PERIMETRE_OBJETS) {
          this.scene.start("gendarmerie3");
          return;
        }

        // Le bureau (tant que le tiroir n'est pas ouvert -> simple monologue)
        if (!this.tiroirOuvert && distBureau < PERIMETRE_OBJETS) {
          this.lancerMonologue(monologueBureau);
          return;
        }

        // L'ordinateur -> ouvre la messagerie
        if (distOrdinateur < PERIMETRE_OBJETS) {
          this.mailUI.ouvrir();
          return;
        }

        // La bibliothèque -> ouvre l'énigme
        if (distBibliotheque < PERIMETRE_OBJETS) {
          this.enigmeBibliotheque.ouvrir();
          return;
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

  // Retourne la série de répliques pour dude2 (une seule série ici, pas de
  // machine à états : une fois le dialogue fait, il disparaît pour de bon)
  obtenirDialogueActuel() {
    return dialoguesDude2;
  }

  // NOUVEAU : appelée juste après la fermeture du dialogue avec dude2
  apresDialogueDude2() {
    // On marque "parti" pour toujours -> il ne réapparaîtra plus jamais,
    // même si on quitte la scène et qu'on y revient.
    this.registry.set("dude2_accueil_parti", true);

    ajouterTaches(this, [
      { id: "decouvrir_secret", texte: "Découvrir ce qu'il cache" },
    ]);

    // NOUVEAU : on débloque immédiatement la lettre (les 3 autres objets se
    // débloquent tout seuls au prochain update(), via objetsDebloques())
    if (this.lettre) this.lettre.verrouille = false;

    // Disparition en fondu, puis destruction réelle du sprite
    if (this.dude2) {
      this.tweens.add({
        targets: this.dude2,
        alpha: 0,
        duration: 600,
        onComplete: () => {
          if (this.dude2) {
            this.dude2.destroy();
            this.dude2 = null;
          }
        },
      });
    }
  }

  // NOUVEAU : vrai une fois que dude2 est parti -> débloque bureau/ordinateur/
  // bibliothèque/lettre. Centralisé ici pour ne pas répéter le registry.get()
  // partout.
  objetsDebloques() {
    return this.registry.get("dude2_accueil_parti") || false;
  }

  /* ============================================================
   *  NOUVEAU : SYSTÈME DE MONOLOGUE SOLO (identique à cafet.js/gendarmerie2.js)
   * ============================================================ */
  lancerMonologue(lignes, onFin) {
    this.monologue = { lignes, index: 1, onFin };
    this.dialogueUI.afficherLigne(lignes[0]);
    this.physics.pause();
  }

  avancerMonologue() {
    const m = this.monologue;
    if (m.index < m.lignes.length) {
      this.dialogueUI.afficherLigne(m.lignes[m.index]);
      m.index++;
    } else {
      this.dialogueUI.masquer();
      this.monologue = null;
      this.physics.resume();
      if (m.onFin) m.onFin();
    }
  }

  /* ============================================================
   *  NOUVEAU : ACTIONS CONTEXTUELLES DE L'INVENTAIRE (la clé)
   * ============================================================ */
  obtenirActionsObjet(cle) {
    const actions = [];

    if (cle === "cle" && !this.tiroirOuvert && possedeObjet(this, "cle")) {
      const PERIMETRE_BUREAU = 120; // ajuste selon la distance souhaitée
      const distance = Phaser.Math.Distance.Between(player.x, player.y, bureau.x, bureau.y);

      if (distance < PERIMETRE_BUREAU) {
        actions.push({
          texte: "Ouvrir le tiroir",
          executer: () => this.ouvrirTiroirBureau(),
        });
      }
    }

    return actions;
  }

  /* ============================================================
   *  NOUVEAU : OUVRIR LE TIROIR DU BUREAU
   * ============================================================
   *  - Consomme la clé (elle disparaît de l'inventaire)
   *  - Fait glisser le bureau vers la droite (tween), révélant la porte
   *  - Autorise désormais l'interaction avec la porte secrète (E)
   */
  ouvrirTiroirBureau() {
    retirerObjet(this, "cle"); // NOUVEAU : la clé est consommée, elle disparaît de l'inventaire

    this.tiroirOuvert = true;
    this.registry.set("accueil_tiroir_ouvert", true);

    this.tweens.add({
      targets: bureau,
      x: bureau.x + 120, // vers la droite ; ajuste la distance si besoin
      duration: 800,
      ease: "Cubic.easeInOut",
    });
  }

  update() {
    // NOUVEAU : pendant un monologue solo, le joueur est figé
    if (this.monologue) {
      player.setVelocity(0, 0);
      player.anims.play("turn");
      return;
    }

    // NOUVEAU : indice "E" de la lettre (gère lui-même son verrouillage)
    if (this.lettre) this.lettre.update(player);

    // NOUVEAU : indices "E" des 4 objets, uniquement une fois débloqués
    if (this.objetsDebloques()) {
      const distBureauMaj = Phaser.Math.Distance.Between(player.x, player.y, bureau.x, bureau.y);
      const distOrdinateurMaj = Phaser.Math.Distance.Between(player.x, player.y, ordinateur.x, ordinateur.y);
      const distBibliothequeMaj = Phaser.Math.Distance.Between(
        player.x,
        player.y,
        bibliotheque.x,
        bibliotheque.y
      );
      const distPorteSecreteMaj = Phaser.Math.Distance.Between(
        player.x,
        player.y,
        this.porteSecrete.x,
        this.porteSecrete.y
      );

      this.indiceBureau.setVisible(!this.tiroirOuvert && distBureauMaj < 70);
      this.indiceOrdinateur.setVisible(distOrdinateurMaj < 70);
      this.indiceBibliotheque.setVisible(distBibliothequeMaj < 70);
      this.indicePorteSecrete.setVisible(this.tiroirOuvert && distPorteSecreteMaj < 70);
    } else {
      this.indiceBureau.setVisible(false);
      this.indiceOrdinateur.setVisible(false);
      this.indiceBibliotheque.setVisible(false);
      this.indicePorteSecrete.setVisible(false);
    }

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