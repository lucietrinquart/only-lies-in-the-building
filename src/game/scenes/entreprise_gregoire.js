import * as Phaser from "phaser";
// NOUVEAU : on importe le module d'inventaire
import { InventaireUI, ObjetRamassable, possedeObjet, retirerObjet } from "./inventaire.js";
// NOUVEAU : on importe le module carte
import { CarteUI } from "./carte.js";

// NOUVEAU : on importe le module tâches
import { TachesUI, ajouterTaches, terminerTache } from "./taches.js";

import { DialogueUI } from "./dialogue.js";
// NOUVEAU : on importe le module énigme (pour la bibliothèque) et mail (pour l'ordinateur)
import { EnigmeUI } from "./enigme.js";
import { MailUI } from "./mail.js";

var cursors;
var player; // désigne le sprite du joueur
var groupe_plateformes; // contient toutes les plateformes
var clavier; // pour la gestion du clavier
var calque_plateformes;
var bureau;
var ordinateur;
var bibliotheque;

var poubelle;

var dialogueText; // Déclaration de la variable de texte
var interactionActive = false;
var dialogueIndex = 0;
var dialogueIndex2 = 0;
var dialoguesActuels = [];

// NOUVEAU : le dialogue de Grégoire (renommé, c'était "dude2" avant). Un
// seul "var dialogues" propre ici -> plus de doublon qui en écrasait un autre.
var dialogueGregoire = [
  {
    texte: "Grégoire : Ah, Violette... je ne pensais pas te croiser ici.",
    moi: "moi_heureuse",
    perso: "perso_triste",
  },
  {
    texte: "Violette : Je pourrais te dire la même chose. Qu'est-ce que tu fais là ?",
    moi: "moi_colere",
    perso: "perso_triste",
  },
  {
    texte: "Grégoire : Rien de spécial... Écoute, je dois vraiment y aller.",
    moi: "moi_triste",
    perso: "perso_colere",
  },
  {
    texte: "Grégoire : Et ne va surtout pas fouiller par ici, c'est hors de question.",
    moi: "moi_triste",
    perso: "perso_colere",
  },
  // NOUVEAU : Grégoire a déjà tourné les talons à ce moment -> "perso: false"
  {
    texte: "Violette : ...Il a quelque chose à cacher, j'en suis sûre.",
    moi: "moi_colere",
    perso: false,
  },
];

// NOUVEAU : monologue solo quand on interagit avec le bureau de Grégoire
// (tant que le tiroir n'est pas ouvert)
var monologueBureau = [
  {
    texte: "Violette : Le tiroir est fermé... il doit y avoir une clé quelque part.",
    moi: "moi_triste",
    perso: false,
  },
];

// NOUVEAU : monologue joué si on essaie de passer la porte secrète sans avoir
// tout fouillé (lettre pas encore prise, tiroir pas ouvert, et/ou note
// d'Adrien pas encore vue)
var monologueSecretIncomplet = [
  {
    texte: "Violette : J'ai l'impression de ne pas avoir tout regardé ici...",
    moi: "moi_triste",
    perso: false,
  },
];

// NOUVEAU : petit monologue d'intro pour faire comprendre à l'utilisateur
// qu'on est dans un open space avec, d'un côté, le bureau de Grégoire, et de
// l'autre, celui d'Adrien.
var introOpenSpace = [
  {
    texte: "Violette : Un open space... Le bureau de Grégoire doit être par là, et celui d'Adrien de l'autre côté.",
    moi: "moi_triste",
    perso: false,
  },
];

// NOUVEAU : monologue joué quand on ferme la note d'Adrien (vue en gros plan)
var dialogueNoteAdrien = [
  { texte: "Violette : « J. »… « Je peux attendre. »", moi: "moi_triste", perso: false },
  { texte: "Violette : Attendre quoi ?", moi: "moi_colere", perso: false },
];

const CLE_INTRO_OPEN_SPACE = "intro_entreprise_gregoire_joue";

export default class entreprise_gregoire extends Phaser.Scene {
  // constructeur de la classe
  constructor() {
    super({
      key: "entreprise_gregoire", //  ici on précise le nom de la classe en tant qu'identifiant
    });
  }
  preload() {}

  create() {
    const carteDuNiveau = this.add.tilemap("carte4");
    this.carteUI = new CarteUI(this);
    this.inventaireUI = new InventaireUI(this);

    // CORRIGÉ : this.dialogueUI n'était jamais créé -> afficherLigne() aurait
    // planté dès le premier appui sur E près de Grégoire.
    this.dialogueUI = new DialogueUI(this, {
      moiParDefaut: "moi_heureuse",
      persoParDefaut: "perso_triste",
    });

    // NOUVEAU : état du monologue solo en cours (bureau, note d'Adrien, etc.)
    this.monologue = null;

    // NOUVEAU : état de la note d'Adrien affichée en gros plan
    this.noteOuverte = false;

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
        description: "Une vieille clé trouvée dans un livre de la bibliothèque. Elle doit ouvrir quelque chose quelque part.",
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
          corps: "Arrête de m'envoyer des messages, quelqu'un pourrait les voir. On en parle de vive voix, pas par écrit.",
        },
      ],
    });

    // chargement du jeu de tuiles
    const tileset = carteDuNiveau.addTilesetImage("sprite_travail", "Phaser_tuilesdejeu4");

    /***************************
     *  CREATION DES CALQUES *
     ****************************/
    const sol_parquet = carteDuNiveau.createLayer("sol_parquet", tileset);
    const dehors = carteDuNiveau.createLayer("dehors", tileset);
    const murs_contour = carteDuNiveau.createLayer("murs_contour", tileset);
    const mur_du_haut = carteDuNiveau.createLayer("mur_du_haut", tileset);
    const plinth_boiserie = carteDuNiveau.createLayer("plinth_boiserie", tileset);
    const fenetres = carteDuNiveau.createLayer("fenetres", tileset);
    const kitchenette = carteDuNiveau.createLayer("kitchenette", tileset);
    const bureaux_salon_d_attente = carteDuNiveau.createLayer("bureaux_salon_d_attente", tileset);

    /***************************
     *  CREATION DES OBJETS *
     ****************************/
    clavier = this.input.keyboard.createCursorKeys();
    cursors = this.input.keyboard.createCursorKeys();
    player = this.physics.add.sprite(420, 650, "img_perso");

    // NOUVEAU : la porte secrète derrière le bureau de Grégoire -> invisible.
    // Créée AVANT le bureau pour qu'elle soit "en dessous" de lui tant qu'il
    // ne s'est pas déplacé.
    this.porteSecrete = this.physics.add.staticSprite(100, 250, "img_porte1");

    bureau = this.physics.add.sprite(
      this.tiroirOuvert ? 100 + 120 : 100, // CORRIGÉ : si déjà ouvert, on le recrée directement décalé
      250,
      "bureau"
    );
    bureau.setScale(0.03);

    // NOUVEAU : petite étiquette au-dessus du bureau de Grégoire, pour que le
    // joueur comprenne tout de suite à qui il appartient.
    this.labelBureauGregoire = this.add
      .text(bureau.x, bureau.y - 46, "Bureau de Grégoire", {
        font: "12px Arial",
        color: "#ffffff",
        backgroundColor: "#000000",
        padding: { x: 5, y: 2 },
      })
      .setOrigin(0.5)
      .setDepth(40);

    poubelle = this.physics.add.sprite(110, 400, "poubelle");
    poubelle.setScale(0.03);

    ordinateur = this.physics.add.sprite(280, 550, "ordinateur");
    ordinateur.setScale(0.1);

    bibliotheque = this.physics.add.sprite(500, 200, "bibliotheque");
    bibliotheque.setScale(0.2);

    // NOUVEAU : le bureau d'Adrien, de l'autre côté de l'open space.
    // ⚠️ Coordonnées provisoires -> ajuste-les pour qu'elles correspondent
    // au vrai plan de la pièce sur ton tileset.
    this.bureauAdrien = this.physics.add.sprite(300, 400, "bureau");
    this.bureauAdrien.setScale(0.03);

    this.labelBureauAdrien = this.add
      .text(this.bureauAdrien.x, this.bureauAdrien.y - 46, "Bureau d'Adrien", {
        font: "12px Arial",
        color: "#ffffff",
        backgroundColor: "#000000",
        padding: { x: 5, y: 2 },
      })
      .setOrigin(0.5)
      .setDepth(40);

    // NOUVEAU : Grégoire (remplace dude2). Si l'image "gregoire" n'est pas
    // chargée, on utilise provisoirement img_perso2 pour que la scène ne plante pas.
    const gregoireDejaParti = this.registry.get("gregoire_entreprise_parti") || false;
    if (!gregoireDejaParti) {
      const textureGregoire = this.textures.exists("gregoire") ? "gregoire" : "img_perso2";
      this.gregoire = this.physics.add.sprite(600, 387, "gregoire", 12);
          this.gregoire.setScale(0.7); 

    } else {
      this.gregoire = null;
    }

    // NOUVEAU : la lettre dans la poubelle -> ObjetRamassable classique,
    // verrouillé tant que Grégoire n'est pas parti (voir "verrouille" plus bas)
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
    // NOUVEAU : verrouillée tant que Grégoire n'est pas parti -> pas de "E", pas de ramassage possible
    this.lettre.verrouille = !this.objetsDebloques();
    // NOUVEAU : l'image de la lettre elle-même reste invisible -> seul le "E"
    // (et le ramassage) sont actifs près de la poubelle, rien ne se voit au sol.
    if (this.lettre.sprite) this.lettre.sprite.setAlpha(0);

    // NOUVEAU : la note d'Adrien, posée bien visible sur son bureau.
    // Verrouillée tant qu'on n'a pas parlé à Grégoire. Une fois ramassée,
    // elle part dans l'inventaire ET s'affiche directement en gros plan
    // (voir afficherNoteAdrien()).
    this.noteAdrien = new ObjetRamassable(
      this,
      this.bureauAdrien.x,
      this.bureauAdrien.y - 18,
      "note_adrien",
      "Note d'Adrien",
      "Une note griffonnée, posée sur le bureau d'Adrien.",
      {
        taille: 22,
        message: "Note récupérée",
        perimetre: 60,
        ajouterAInventaire: true,
        onRamasse: () => this.afficherNoteAdrien(),
      }
    );
    this.noteAdrien.verrouille = !this.objetsDebloques();

    // NOUVEAU : les indices "E" des objets (cachés tant que verrouillés)
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
    dehors.setCollisionByProperty({ estSolide: true });
    murs_contour.setCollisionByProperty({ estSolide: true });
    mur_du_haut.setCollisionByProperty({ estSolide: true });
    fenetres.setCollisionByProperty({ estSolide: true });
    kitchenette.setCollisionByProperty({ estSolide: true });
    bureaux_salon_d_attente.setCollisionByProperty({ estSolide: true });

    this.physics.add.collider(player, dehors);
    this.physics.add.collider(player, murs_contour);
    this.physics.add.collider(player, mur_du_haut);
    this.physics.add.collider(player, fenetres);
    this.physics.add.collider(player, kitchenette);
    this.physics.add.collider(player, bureaux_salon_d_attente);

    player.setCollideWorldBounds(true); // le player se cognera contre les bords du monde
    this.physics.world.enable(player);

    /***************************
     *  CREATION DES ANIMATIONS *
     ****************************/
    this.anims.create({
      key: "left",
      frames: this.anims.generateFrameNumbers("img_perso", { start: 0, end: 3 }),
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
      frames: this.anims.generateFrameNumbers("img_perso", { start: 5, end: 8 }),
      frameRate: 10,
      repeat: -1,
    });
    this.anims.create({
      key: "haut",
      frames: this.anims.generateFrameNumbers("img_perso", { start: 12, end: 14 }),
      frameRate: 10,
      repeat: -1,
    });

    this.anims.create({
      key: "bas",
      frames: this.anims.generateFrameNumbers("img_perso", { start: 9, end: 11 }),
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
        left: 20,
        right: 400,
        top: 20,
        bottom: 20,
      },
      shadow: {
        offsetX: 2,
        offsetY: 2,
        blur: 4,
        color: "#000000",
      },
      wordWrap: {
        width: 460,
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

      // NOUVEAU : la note d'Adrien en gros plan se ferme uniquement via la
      // croix -> on ignore E tant qu'elle est affichée
      if (this.noteOuverte) return;

      // NOUVEAU : un monologue solo (ex: le bureau, la note) est prioritaire sur tout
      if (this.monologue) {
        this.avancerMonologue();
        return;
      }

      // CORRIGÉ (le bug !) : on tentait d'afficher le "E" au-dessus de la
      // lettre (via this.lettre.update() dans update()), mais on n'appelait
      // jamais this.lettre.tenterRamassage() ici -> rien ne se passait à
      // l'appui sur E. tenterRamassage() gère déjà tout seul la distance et
      // le verrouillage (verrouille === true -> renvoie false sans rien faire).
      if (this.lettre && this.lettre.tenterRamassage(player)) return;

      // NOUVEAU : la note d'Adrien se ramasse de la même façon
      if (this.noteAdrien && this.noteAdrien.tenterRamassage(player)) return;

      // CORRIGÉ : Grégoire peut valoir null une fois parti -> on ne calcule la
      // distance et on ne traite le dialogue QUE s'il existe encore.
      if (this.gregoire) {
        var distanceGregoire = Phaser.Math.Distance.Between(player.x, player.y, this.gregoire.x, this.gregoire.y);

        if (distanceGregoire < 125) {
          // NOUVEAU : au tout début d'une conversation (dialogueIndex === 0),
          // on choisit QUELLE série de répliques utiliser
          if (dialogueIndex === 0) {
            dialoguesActuels = this.obtenirDialogueGregoire();
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

            // NOUVEAU : Grégoire s'en va, les tâches se lancent -> voir apresDialogueGregoire()
            this.apresDialogueGregoire();
          }
          return; // NOUVEAU : on ne traite rien d'autre cette fois-ci
        }
      }

      // ============================================================
      //  NOUVEAU : LES OBJETS DE LA PIÈCE (verrouillés tant que
      //  Grégoire n'est pas parti -> this.objetsDebloques())
      // ============================================================
      if (this.objetsDebloques()) {
        const PERIMETRE_OBJETS = 70;

        const distBureau = Phaser.Math.Distance.Between(player.x, player.y, bureau.x, bureau.y);
        const distPorteSecrete = Phaser.Math.Distance.Between(player.x, player.y, this.porteSecrete.x, this.porteSecrete.y);
        const distOrdinateur = Phaser.Math.Distance.Between(player.x, player.y, ordinateur.x, ordinateur.y);
        const distBibliotheque = Phaser.Math.Distance.Between(player.x, player.y, bibliotheque.x, bibliotheque.y);

        // La porte secrète (seulement visible/utilisable une fois le tiroir ouvert)
        if (this.tiroirOuvert && distPorteSecrete < PERIMETRE_OBJETS) {
          // NOUVEAU : on bloque le passage tant que la lettre ET la note
          // d'Adrien n'ont pas aussi été trouvées
          if (this.secretEntierementDecouvert()) {
            this.scene.start("cafoutche");
          } else {
            this.lancerMonologue(monologueSecretIncomplet);
          }
          return;
        }

        // Le bureau de Grégoire (tant que le tiroir n'est pas ouvert -> simple monologue)
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

    // NOUVEAU : petit monologue d'intro (une seule fois) pour faire
    // comprendre à l'utilisateur la disposition de l'open space.
    if (!this.registry.get(CLE_INTRO_OPEN_SPACE)) {
      this.lancerMonologue(introOpenSpace, () => {
        this.registry.set(CLE_INTRO_OPEN_SPACE, true);
      });
    }
  }

  // Retourne la série de répliques pour Grégoire (une seule série ici, pas de
  // machine à états : une fois le dialogue fait, il disparaît pour de bon)
  obtenirDialogueGregoire() {
    return dialogueGregoire;
  }

  // NOUVEAU : appelée juste après la fermeture du dialogue avec Grégoire
  apresDialogueGregoire() {
    // On marque "parti" pour toujours -> il ne réapparaîtra plus jamais,
    // même si on quitte la scène et qu'on y revient.
    this.registry.set("gregoire_entreprise_parti", true);

    // NOUVEAU : les 2 objectifs annoncés par l'utilisateur
    ajouterTaches(this, [
      { id: "decouvrir_secret", texte: "Comprendre ce que cache Grégoire" },
      { id: "regarder_bureau_adrien", texte: "Regarder le bureau d'Adrien" },
    ]);

    // NOUVEAU : on débloque immédiatement la lettre et la note d'Adrien (les
    // autres objets se débloquent tout seuls au prochain update(), via
    // objetsDebloques())
    if (this.lettre) this.lettre.verrouille = false;
    if (this.noteAdrien) this.noteAdrien.verrouille = false;

    // Disparition en fondu, puis destruction réelle du sprite
    if (this.gregoire) {
      this.tweens.add({
        targets: this.gregoire,
        alpha: 0,
        duration: 600,
        onComplete: () => {
          if (this.gregoire) {
            this.gregoire.destroy();
            this.gregoire = null;
          }
        },
      });
    }
  }

  // NOUVEAU : vrai une fois que Grégoire est parti -> débloque bureau/ordinateur/
  // bibliothèque/lettre/note d'Adrien. Centralisé ici pour ne pas répéter le
  // registry.get() partout.
  objetsDebloques() {
    return this.registry.get("gregoire_entreprise_parti") || false;
  }

  // NOUVEAU : vrai seulement quand la lettre a été prise, le tiroir ouvert ET
  // la note d'Adrien vue en gros plan -> condition pour accéder à la porte secrète
  secretEntierementDecouvert() {
    return possedeObjet(this, "lettre") && this.tiroirOuvert && (this.registry.get("note_adrien_vue") || false);
  }

  /* ============================================================
   *  NOUVEAU : LA NOTE D'ADRIEN (gros plan, fermeture par la croix uniquement)
   * ============================================================ */
  afficherNoteAdrien() {
    if (this.noteOuverte) return;
    this.noteOuverte = true;
    this.physics.pause();

    const largeurJeu = this.cameras.main.width;
    const hauteurJeu = this.cameras.main.height;

    const voile = this.add.rectangle(largeurJeu / 2, hauteurJeu / 2, largeurJeu, hauteurJeu, 0x000000, 0.8).setScrollFactor(0);

    const image = this.add.image(largeurJeu / 2, hauteurJeu / 2, "note_adrien").setScrollFactor(0);
    // on adapte la taille pour qu'elle tienne bien à l'écran, sans la déformer
    const echelle = Math.min((largeurJeu * 0.7) / image.width, (hauteurJeu * 0.7) / image.height);
    image.setScale(echelle);

    const boutonFermer = this.add
      .text(largeurJeu / 2 + image.displayWidth / 2 + 10, hauteurJeu / 2 - image.displayHeight / 2 - 10, "✕", {
        font: "bold 22px Arial",
        color: "#ffffff",
        backgroundColor: "#000000",
        padding: { x: 8, y: 4 },
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setInteractive({ useHandCursor: true });

    boutonFermer.on("pointerdown", () => this.fermerNoteAdrien());

    this.vueNoteAdrien = this.add.container(0, 0, [voile, image, boutonFermer]);
    this.vueNoteAdrien.setDepth(3000);
  }

  fermerNoteAdrien() {
    if (this.vueNoteAdrien) {
      this.vueNoteAdrien.destroy(true);
      this.vueNoteAdrien = null;
    }
    this.noteOuverte = false;

    // NOUVEAU : enchaîne directement sur le petit monologue de Violette,
    // puis valide la tâche "regarder_bureau_adrien"
    this.lancerMonologue(dialogueNoteAdrien, () => {
      terminerTache(this, "regarder_bureau_adrien");
      this.registry.set("note_adrien_vue", true);
    });
  }

  /* ============================================================
   *  SYSTÈME DE MONOLOGUE SOLO (identique à cafet.js/maison.js)
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

    // NOUVEAU : pendant que la note d'Adrien est affichée en gros plan, le
    // joueur est figé lui aussi (fermeture uniquement via la croix)
    if (this.noteOuverte) {
      player.setVelocity(0, 0);
      player.anims.play("turn");
      return;
    }

    // NOUVEAU : indice "E" de la lettre et de la note (gèrent eux-mêmes leur verrouillage)
    if (this.lettre) this.lettre.update(player);
    if (this.noteAdrien) this.noteAdrien.update(player);

    // NOUVEAU : indices "E" des autres objets, uniquement une fois débloqués
    if (this.objetsDebloques()) {
      const distBureauMaj = Phaser.Math.Distance.Between(player.x, player.y, bureau.x, bureau.y);
      const distOrdinateurMaj = Phaser.Math.Distance.Between(player.x, player.y, ordinateur.x, ordinateur.y);
      const distBibliothequeMaj = Phaser.Math.Distance.Between(player.x, player.y, bibliotheque.x, bibliotheque.y);
      const distPorteSecreteMaj = Phaser.Math.Distance.Between(player.x, player.y, this.porteSecrete.x, this.porteSecrete.y);

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

    if (!cursors.up.isDown && !cursors.down.isDown && !cursors.left.isDown && !cursors.right.isDown) {
      player.anims.play("turn");
    }
  }
}