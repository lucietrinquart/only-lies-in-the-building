import * as Phaser from "phaser";
import { InventaireUI } from "./inventaire.js";
import { CarteUI } from "./carte.js";
import { TachesUI, ajouterTache, terminerTache, estTacheTerminee } from "./taches.js";
import { DialogueUI } from "./dialogue.js";

var player;
var cursors;
var dialogueIndex = 0;
var dialoguesActuels = [];

/* ============================================================
 *  TEXTES
 * ============================================================ */
// NOUVEAU : dialogue avec Jessica, la secrétaire. Même système à 2 portraits
// que dans maison.js (moi = Violette à gauche, perso = l'autre personnage à
// droite). La dernière réplique est une pensée de Violette en "voix off" ->
// perso: false, comme un monologue solo, mais elle enchaîne directement
// après la dernière phrase de Jessica.
var dialogueJessica = [
  { texte: "Jessica : Violette. Je ne pensais pas te revoir ici.", moi: "moi_triste", perso: "perso_heureuse" },
  { texte: "Violette : Moi non plus.", moi: "moi_triste", perso: "perso_heureuse" },
  {
    texte: "Jessica : Je voulais te dire... Je n'ai jamais cru ce qu'on racontait. Adrien parlait de toi tout le temps.",
    moi: "moi_triste",
    perso: "perso_triste",
  },
  { texte: "Violette : Merci. Je cherche Grégoire.", moi: "moi_colere", perso: "perso_triste" },
  {
    texte: "Jessica : A l'escalier à droite. Si tu as besoin de quoi que ce soit, je suis là. Vraiment.",
    moi: "moi_colere",
    perso: "perso_heureuse",
  },
  // NOUVEAU : pensée de Violette en voix off -> pas de portrait PNJ (perso: false)
  { texte: "Violette (voix off) : Jessica. Toujours impeccable. Toujours là quand Adrien...", moi: "moi_triste", perso: false },
];

// NOUVEAU : si on reparle à Jessica après cette première fois (et avant que
// l'objectif "Parler à Jessica" ne soit actif), une réplique courte suffit
var dialogueJessicaRepete = [
  { texte: "Jessica : Grégoire est à l'escalier, sur la droite.", moi: "moi_heureuse", perso: "perso_heureuse" },
];

// NOUVEAU : la grande conversation de révélation, jouée quand l'objectif
// "Parler à Jessica" est actif (déclenché par l'appel de Victor dans
// maison.js -> voir CLE_JESSICA_OBJECTIF, qui doit rester identique dans les
// deux fichiers). Violette lui montre le mot trouvé sur le bureau d'Adrien.
var dialogueJessicaRevelation = [
  { texte: "Violette : J'ai trouvé ça dans le bureau d'Adrien. (elle montre le mot)", moi: "moi_colere", perso: "perso_triste" },
  { texte: "Jessica : (elle le lit, silence) Tu l'as gardé.", moi: "moi_colere", perso: "perso_triste" },
  { texte: "Violette : « Tu n'as pas à choisir ce soir. » Choisir quoi, Jessica ?", moi: "moi_colere", perso: "perso_triste" },
  {
    texte: "Jessica : Entre toi et moi. (un temps) Je l'aimais, Violette. Assez pour que ça fasse mal.",
    moi: "moi_triste",
    perso: "perso_triste",
  },
  { texte: "Violette : Et lui ?", moi: "moi_triste", perso: "perso_triste" },
  { texte: "Jessica : Il m'a dit non. Trois jours avant. Poliment. Il t'aimait, toi.", moi: "moi_triste", perso: "perso_triste" },
  { texte: "Violette : Et tu as accepté ?", moi: "moi_colere", perso: "perso_triste" },
  {
    texte: "Jessica : Non. Je lui ai dit que j'attendrais. (elle rit sans joie) Ça fait de moi une coupable, je suppose.",
    moi: "moi_colere",
    perso: "perso_colere",
  },
  { texte: "Violette : Où étais-tu cette nuit-là ?", moi: "moi_colere", perso: "perso_colere" },
  {
    texte: "Jessica : Chez moi. Seule. Personne pour le confirmer. Je sais ce que ça donne.",
    moi: "moi_triste",
    perso: "perso_triste",
  },
  { texte: "Violette : Adrien avait un problème de freins. Tu le savais ?", moi: "moi_colere", perso: "perso_triste" },
  {
    texte: "Jessica : Ses freins ? Il ne m'en a jamais parlé. Je ne savais même pas qu'il y avait un problème avec sa voiture.",
    moi: "moi_triste",
    perso: "perso_triste",
  },
  {
    texte: "Violette : Tu en as parlé à quelqu'un ? De ce que tu ressentais ?",
    moi: "moi_colere",
    perso: "perso_triste",
  },
  {
    texte:
      "Jessica : À Victor. Il a été gentil avec moi. Il m'a dit que si je ressentais quelque chose, je devais le dire à Adrien. Que ce serait mieux pour tout le monde.",
    moi: "moi_triste",
    perso: "perso_triste",
  },
  { texte: "Violette : Victor t'a dit ça ?", moi: "moi_colere", perso: "perso_triste" },
  { texte: "Jessica : Je l'ai écouté. J'aurais dû me taire.", moi: "moi_triste", perso: "perso_triste" },
  // NOUVEAU : pensées de Violette en voix off, pour conclure -> pas de portrait PNJ
  { texte: "Violette (voix off) : Elle avait aimé mon mari.", moi: "moi_triste", perso: false },
  {
    texte: "Violette (voix off) : Bon, je n'ai plus rien à faire ici. Il faut que j'aille parler à Marguerite. Je suis perdue.",
    moi: "moi_triste",
    perso: false,
  },
];

// NOUVEAU : si on revient parler à Jessica après la révélation (objectif déjà validé)
var dialogueJessicaApresRevelation = [
  { texte: "Jessica : Maintenant que je t'ai tout dit, laisse-moi s'il te plaît.", moi: "moi_triste", perso: "perso_triste" },
];

const CLE_DIALOGUE_JESSICA = "dialogue_jessica_hall_joue";

// NOUVEAU : ces 2 clés sont partagées avec maison.js -> elles doivent être
// identiques dans les deux fichiers.
const CLE_JESSICA_OBJECTIF = "objectif_parler_jessica_actif";
const CLE_MARGUERITE_OBJECTIF = "objectif_parler_marguerite_actif";

export default class hall extends Phaser.Scene {
  // constructeur de la classe
  constructor() {
    super({
      key: "hall",
    });
  }
  preload() {}

  create() {
    this.monologue = null; // NOUVEAU : état du monologue solo en cours (inutilisé pour l'instant, prêt si besoin)
    dialogueIndex = 0; // NOUVEAU : repart de zéro si on quitte la scène en plein dialogue

    this.dialogueUI = new DialogueUI(this, {
      moiParDefaut: "moi_heureuse",
      persoParDefaut: "perso_triste",
    });

    this.inventaireUI = new InventaireUI(this);
    this.carteUI = new CarteUI(this);
    this.tachesUI = new TachesUI(this);

    const carteDuNiveau = this.add.tilemap("carte8");

    // chargement du jeu de tuiles
    const tileset = carteDuNiveau.addTilesetImage("sprite_accueil", "Phaser_tuilesdejeu8");

    /***************************
     *  CREATION DES CALQUES *
     ****************************/
    carteDuNiveau.createLayer("background", tileset);
    carteDuNiveau.createLayer("sol", tileset);
    carteDuNiveau.createLayer("tapis", tileset);
    const mur = carteDuNiveau.createLayer("mur", tileset);
    carteDuNiveau.createLayer("deco_murale", tileset);
    const meuble = carteDuNiveau.createLayer("meuble", tileset);
    const deco_meuble = carteDuNiveau.createLayer("deco_meuble", tileset);
    const murs_porteurs = carteDuNiveau.createLayer("murs_porteurs", tileset);
    carteDuNiveau.createLayer("escalier", tileset);

    /***************************
     *  CREATION DES OBJETS *
     ****************************/
    player = this.physics.add.sprite(420, 650, "img_perso");
    this.secretaire = this.physics.add.sprite(410, 450, "secretaire");

    // NOUVEAU : la "porte" vers l'escalier qui mène à entreprise_gregoire.
    // Invisible, comme les autres portes du jeu -> seul un indice "E"
    // apparaît quand on s'approche. Plus de téléportation automatique au
    // contact : il faut appuyer sur E.
    this.porteEscalier = this.physics.add.staticSprite(720, 350, "img_porte1");
    this.porteEscalier.setAlpha(0);

    this.indiceEscalier = this.add
      .text(this.porteEscalier.x, this.porteEscalier.y - 26, "E", {
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
    this.physics.add.collider(player, mur);

    player.setCollideWorldBounds(true); // le player se cognera contre les bords du monde
    this.physics.world.enable(player);

    /***************************
     *  CREATION DES ANIMATIONS *
     ****************************/
    const creerAnim = (config) => {
      if (!this.anims.exists(config.key)) this.anims.create(config);
    };
    creerAnim({ key: "left", frames: this.anims.generateFrameNumbers("img_perso", { start: 0, end: 3 }), frameRate: 10, repeat: -1 });
    creerAnim({ key: "turn", frames: [{ key: "img_perso", frame: 4 }], frameRate: 20 });
    creerAnim({ key: "right", frames: this.anims.generateFrameNumbers("img_perso", { start: 5, end: 8 }), frameRate: 10, repeat: -1 });
    creerAnim({ key: "haut", frames: this.anims.generateFrameNumbers("img_perso", { start: 12, end: 14 }), frameRate: 10, repeat: -1 });
    creerAnim({ key: "bas", frames: this.anims.generateFrameNumbers("img_perso", { start: 9, end: 11 }), frameRate: 10, repeat: -1 });

    /***********************
     *  TOUCHE E *
     ************************/
    this.input.keyboard.on("keydown-E", () => {
      // un monologue en cours est prioritaire sur tout
      if (this.monologue) {
        this.avancerMonologue();
        return;
      }

      const distanceJessica = Phaser.Math.Distance.Between(player.x, player.y, this.secretaire.x, this.secretaire.y);

      if (distanceJessica < 125) {
        // NOUVEAU : au tout début d'une conversation, on choisit quelle série
        // de répliques utiliser (grande révélation si l'objectif est actif,
        // sinon la grande la 1ère fois, une courte ensuite)
        if (dialogueIndex === 0) {
          dialoguesActuels = this.obtenirDialogueJessica();
        }

        if (dialogueIndex < dialoguesActuels.length) {
          this.dialogueUI.afficherLigne(dialoguesActuels[dialogueIndex]);
          dialogueIndex++;
          this.physics.pause();
        } else {
          this.dialogueUI.masquer();
          dialogueIndex = 0;
          this.physics.resume();
          this.apresDialogueJessica();
        }
        return;
      }

      // NOUVEAU : l'escalier -> on ne part vers entreprise_gregoire que si on
      // est assez proche ET qu'on appuie sur E (plus de téléportation au contact)
      const distanceEscalier = Phaser.Math.Distance.Between(player.x, player.y, this.porteEscalier.x, this.porteEscalier.y);
      if (distanceEscalier < 70) {
        this.scene.start("entreprise_gregoire");
      }
    });

    this.input.keyboard.on("keyup-E", () => {
      // Laisser le texte affiché jusqu'à ce qu'E soit relâchée
    });

    cursors = this.input.keyboard.createCursorKeys();

    this.physics.world.setBounds(0, 0, 800, 608);
    //  ajout du champs de la caméra de taille identique à celle du monde
    this.cameras.main.setBounds(0, 0, 800, 608);
    // ancrage de la caméra sur le joueur
    this.cameras.main.startFollow(player);
  }

  // Choisit la bonne série de répliques pour Jessica selon l'avancée de l'enquête
  obtenirDialogueJessica() {
    if (estTacheTerminee(this, "parler_jessica")) return dialogueJessicaApresRevelation;
    if (this.registry.get(CLE_JESSICA_OBJECTIF)) return dialogueJessicaRevelation;
    return this.registry.get(CLE_DIALOGUE_JESSICA) ? dialogueJessicaRepete : dialogueJessica;
  }

  // Appelé quand la conversation avec Jessica se ferme
  apresDialogueJessica() {
    this.registry.set(CLE_DIALOGUE_JESSICA, true);

    // NOUVEAU : si c'est la conversation de révélation qui vient de se
    // terminer (objectif actif, pas encore validé), on la valide et on
    // enchaîne sur l'objectif suivant : parler à Marguerite (dans maison.js)
    if (this.registry.get(CLE_JESSICA_OBJECTIF) && !estTacheTerminee(this, "parler_jessica")) {
      ajouterTache(this, "parler_jessica", "Parler à Jessica"); // sécurité si elle n'existait pas
      terminerTache(this, "parler_jessica");

      this.registry.set(CLE_MARGUERITE_OBJECTIF, true);
      ajouterTache(this, "parler_marguerite", "Parler à Marguerite");
    }
  }

  /* ============================================================
   *  SYSTÈME DE MONOLOGUE SOLO (identique aux autres scènes)
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

  update() {
    // pendant un monologue, le joueur est figé
    if (this.monologue) {
      player.setVelocity(0, 0);
      player.anims.play("turn");
      return;
    }

    // NOUVEAU : indice "E" de l'escalier, visible seulement à proximité
    const distEscalierMaj = Phaser.Math.Distance.Between(player.x, player.y, this.porteEscalier.x, this.porteEscalier.y);
    this.indiceEscalier.setVisible(distEscalierMaj < 70);

    /***************************
     *  DEPLACEMENT DU JOUEUR *
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
      player.setVelocityX(0);
    }

    if (!cursors.up.isDown && !cursors.down.isDown && !cursors.left.isDown && !cursors.right.isDown) {
      player.anims.play("turn");
    }
  }
}