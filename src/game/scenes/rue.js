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
var introMonologue = [
  { texte: "Violette : Ah oui c'est vrai, il y a Martin qui est toujours là.", moi: "moi_triste", perso: false },
  { texte: "Violette : Peut-être qu'il a déjà vu quelque chose...", moi: "moi_triste", perso: false },
];

var dialogueMartin = [
  { texte: "Violette : Vous connaissiez Adrien ?", moi: "moi_heureuse", perso: "perso_heureuse" },
  { texte: "Martin : Tout le monde connaissait Adrien ici.", moi: "moi_heureuse", perso: "perso_triste" },
  { texte: "Violette : Je cherche à comprendre ce qui lui est arrivé.", moi: "moi_colere", perso: "perso_triste" },
  { texte: "Martin : Vous devriez peut-être demander à Grégoire.", moi: "moi_heureuse", perso: "perso_colere" },
  { texte: "Violette : Grégoire ?", moi: "moi_colere", perso: "perso_triste" },
  { texte: "Martin : Ils se disputaient beaucoup ces derniers temps.", moi: "moi_colere", perso: "perso_triste" },
  { texte: "Martin : Il y avait aussi Victor qui l'accompagnait.", moi: "moi_colere", perso: "perso_triste" },
  // NOUVEAU : amène le monologue sur les freins
  { texte: "Martin : Et puis Adrien se plaignait des freins de sa voiture, ces derniers temps.", moi: "moi_triste", perso: "perso_triste" },
  { texte: "Martin : Si la police a récupéré les vidéos de surveillance de l'immeuble, elles pourraient vous aider.", moi: "moi_heureuse", perso: "perso_heureuse" },
];

var dialogueMartinRepete = [
  { texte: "Martin : Je vous ai dit tout ce que je savais.", moi: "moi_heureuse", perso: "perso_triste" },
];

var monologueApresMartin = [
  { texte: "Violette : Je ne savais pas qu'Adrien avait des problèmes avec les freins de sa voiture.", moi: "moi_triste", perso: false },
  { texte: "Violette : Pourtant sa voiture a passé le contrôle technique il n'y a pas longtemps.", moi: "moi_colere", perso: false },
  { texte: "Violette : Si, dans le dossier, les policiers ont récupéré les vidéos de surveillance de l'immeuble, elles sont sur mon ordinateur.", moi: "moi_heureuse", perso: false },
  { texte: "Violette : Il faut que je rentre chez moi pour les regarder.", moi: "moi_heureuse", perso: false },
];

const CLE_INTRO = "intro_gendarmerie3_joue";

export default class rue extends Phaser.Scene {
  constructor() {
    super({ key: "rue" });
  }

  preload() {}

  create() {
    this.monologue = null;
    dialogueIndex = 0; // NOUVEAU : repart de zéro si on quitte la scène en plein dialogue

    this.dialogueUI = new DialogueUI(this, {
      moiParDefaut: "moi_heureuse",
      persoParDefaut: "perso_triste",
    });

    this.inventaireUI = new InventaireUI(this);

    const carteDuNiveau = this.add.tilemap("carte7");
    this.carteUI = new CarteUI(this);
    this.tachesUI = new TachesUI(this);

    // tuiles
    const tileset = carteDuNiveau.addTilesetImage("sprite_police", "Phaser_tuilesdejeu7");
    carteDuNiveau.createLayer("background", tileset);
    carteDuNiveau.createLayer("sol", tileset);
    const murs_porteurs = carteDuNiveau.createLayer("murs_porteurs", tileset);
    const cloison = carteDuNiveau.createLayer("cloison", tileset);
    carteDuNiveau.createLayer("tapis", tileset);
    const meuble = carteDuNiveau.createLayer("meuble", tileset);
    carteDuNiveau.createLayer("deco_meuble", tileset);
    const deco = carteDuNiveau.createLayer("deco", tileset);

    /***************************
     *  OBJETS *
     ****************************/
    player = this.physics.add.sprite(350, 500, "img_perso");


    // NOUVEAU : Martin (remplace Shella). Si l'image "martin" n'est pas chargée,
    // on utilise provisoirement img_perso2 pour que la scène ne plante pas.
    const textureMartin = this.textures.exists("martin") ? "martin" : "img_perso2";
    this.martin = this.physics.add.staticSprite(700, 500, textureMartin);

    /***************************
     *  COLLISIONS *
     ****************************/
    deco.setCollisionByProperty({ estSolide: true });
    meuble.setCollisionByProperty({ estSolide: true });
    murs_porteurs.setCollisionByProperty({ estSolide: true });
    cloison.setCollisionByProperty({ estSolide: true });

    this.physics.add.collider(player, deco);
    this.physics.add.collider(player, meuble);
    this.physics.add.collider(player, murs_porteurs);
    this.physics.add.collider(player, cloison);

    player.setCollideWorldBounds(true);

    /***************************
     *  TOUCHE E
     ****************************/
    this.input.keyboard.on("keydown-E", () => {
      // un monologue en cours est prioritaire sur tout
      if (this.monologue) {
        this.avancerMonologue();
        return;
      }

      const distanceMartin = Phaser.Math.Distance.Between(player.x, player.y, this.martin.x, this.martin.y);

      if (distanceMartin < 125) {
        if (dialogueIndex === 0) {
          dialoguesActuels = this.obtenirDialogueMartin();
        }

        if (dialogueIndex < dialoguesActuels.length) {
          this.dialogueUI.afficherLigne(dialoguesActuels[dialogueIndex]);
          dialogueIndex++;
          this.physics.pause();
        } else {
          this.dialogueUI.masquer();
          dialogueIndex = 0;
          this.physics.resume();
          this.apresDialogueMartin(); // NOUVEAU
        }
      }
    });

    /***************************
     *  ANIMATIONS *
     ****************************/
    const creerAnim = (config) => {
      if (!this.anims.exists(config.key)) this.anims.create(config);
    };
    creerAnim({ key: "left", frames: this.anims.generateFrameNumbers("img_perso", { start: 0, end: 3 }), frameRate: 10, repeat: -1 });
    creerAnim({ key: "turn", frames: [{ key: "img_perso", frame: 4 }], frameRate: 20 });
    creerAnim({ key: "right", frames: this.anims.generateFrameNumbers("img_perso", { start: 5, end: 8 }), frameRate: 10, repeat: -1 });
    creerAnim({ key: "haut", frames: this.anims.generateFrameNumbers("img_perso", { start: 12, end: 14 }), frameRate: 10, repeat: -1 });
    creerAnim({ key: "bas", frames: this.anims.generateFrameNumbers("img_perso", { start: 9, end: 11 }), frameRate: 10, repeat: -1 });

    cursors = this.input.keyboard.createCursorKeys();

    this.physics.world.setBounds(0, 0, 800, 608);
    this.cameras.main.setBounds(0, 0, 800, 608);
    this.cameras.main.startFollow(player);

    // MONOLOGUE D'INTRODUCTION (une seule fois) -> puis objectif "Parler à Martin"
    if (!this.registry.get(CLE_INTRO)) {
      this.lancerMonologue(introMonologue, () => {
        this.registry.set(CLE_INTRO, true);
        ajouterTache(this, "parler_martin", "Parler à Martin");
      });
    }
  }

  update() {
    if (this.scene.isPaused()) return;

    // pendant un monologue, le joueur est figé
    if (this.monologue) {
      player.setVelocity(0, 0);
      player.anims.play("turn");
      return;
    }

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

  /* ============================================================
   *  OUTILS
   * ============================================================ */

  // Première fois : le grand dialogue. Ensuite : une courte réplique.
  obtenirDialogueMartin() {
    return estTacheTerminee(this, "parler_martin") ? dialogueMartinRepete : dialogueMartin;
  }

  // Appelé quand la conversation avec Martin se ferme
  apresDialogueMartin() {
    if (estTacheTerminee(this, "parler_martin")) return; // déjà fait : rien de plus

    ajouterTache(this, "parler_martin", "Parler à Martin"); // sécurité si elle n'existait pas
    terminerTache(this, "parler_martin");

    this.lancerMonologue(monologueApresMartin, () => {
      // Nouvel objectif : le joueur doit rentrer chez lui via la carte
      ajouterTache(this, "voir_videos", "Regarder les vidéos chez moi");
    });
  }

  lancerMonologue(lignes, onFin) {
    this.monologue = { lignes, index: 1, onFin };
    this.dialogueUI.afficherLigne(lignes[0]);
  }

  avancerMonologue() {
    const m = this.monologue;
    if (m.index < m.lignes.length) {
      this.dialogueUI.afficherLigne(m.lignes[m.index]);
      m.index++;
    } else {
      this.dialogueUI.masquer();
      this.monologue = null;
      if (m.onFin) m.onFin();
    }
  }
}