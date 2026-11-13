import * as Phaser from "phaser";
import { InventaireUI } from "./inventaire.js";
import { CarteUI } from "./carte.js";
import { TachesUI, terminerTache } from "./taches.js";
import { DialogueUI } from "./dialogue.js";
// NOUVEAU : le carnet-énigme de Grégoire (phrases à remettre dans l'ordre)
import { EnigmeCarnetUI } from "./enigme_carnet.js";
import { ReglagesUI } from "./reglage.js";


var player;
var cursors;

/* ============================================================
 *  TEXTES
 * ============================================================ */
// NOUVEAU : les 7 phrases du carnet, DANS LE BON ORDRE. La classe
// EnigmeCarnetUI les mélange elle-même pour l'affichage -> ne pas les
// réordonner ici, c'est la solution attendue.

var phrasesCarnet = [
  "« Alors, je commence à comprendre. »",
  "« Bien plus proche que je ne le pensais. »",
  "« Certainement, il sait toujours où elle est. »",
  "« Décidément, je ne peux pas écrire son nom ici. »",
  "« Évidemment, tu sais qui. »",
  "« Franchement, je pensais pouvoir lui faire confiance. »",
  "« Grâce à moi, un message est programmé pour C. »",
];

var monologueCarnetReussi = [
  { texte: "Violette : Qui est ce « tu sais qui » ?", moi: "moi_colere", perso: false },
  { texte: "Violette : Il faut que je retourne chez moi pour mieux comprendre.", moi: "moi_triste", perso: false },
];

var monologueCarnetRate = [
  { texte: "Violette : Je ne comprends pas le sens de cette phrase.", moi: "moi_triste", perso: false },
  {
    texte: "Violette : Je pense que je n'ai pas mis les phrases dans le bon ordre... je devrais réessayer.",
    moi: "moi_colere",
    perso: false,
  },
];

export default class cafoutche extends Phaser.Scene {
  // constructeur de la classe
  constructor() {
    super({
      key: "cafoutche",
    });
  }
  preload() {}

  create() {
          this.reglagesUI = new ReglagesUI(this);

    this.monologue = null;

    this.dialogueUI = new DialogueUI(this, {
      moiParDefaut: "moi_heureuse",
      persoParDefaut: "perso_triste",
    });

    this.inventaireUI = new InventaireUI(this);
    this.carteUI = new CarteUI(this);
    this.tachesUI = new TachesUI(this);

    // NOUVEAU : le carnet -> remettre les 7 phrases dans l'ordre
    this.enigmeCarnet = new EnigmeCarnetUI(this, {
      id: "enigme_carnet_gregoire",
      titre: "Carnet de Grégoire",
      instruction: "Remets les phrases dans le bon ordre, puis clique sur Vérifier.",
      phrases: phrasesCarnet,
      onReponseCorrecte: () => {
        this.lancerMonologue(monologueCarnetReussi, () => {
          terminerTache(this, "decouvrir_secret");
          this.scene.start("rue");
        });
      },
      onReponseIncorrecte: () => {
        this.lancerMonologue(monologueCarnetRate);
      },
    });

    const carteDuNiveau = this.add.tilemap("carte18");

    // chargement du jeu de tuiles
    const tileset = carteDuNiveau.addTilesetImage("tilesetcafouche", "Phaser_tuilesdejeu18");

    /***************************
     *  CREATION DES CALQUES *
     ****************************/

    const mur = carteDuNiveau.createLayer("mur", tileset);
    const surlemur = carteDuNiveau.createLayer("surlemur", tileset);
    const sol = carteDuNiveau.createLayer("sol", tileset);
    const table = carteDuNiveau.createLayer("table", tileset);
    const surlesol = carteDuNiveau.createLayer("surlesol", tileset);
    const objet = carteDuNiveau.createLayer("objet", tileset);
    const surobjet = carteDuNiveau.createLayer("surobjet", tileset);
    const fond = carteDuNiveau.createLayer("fond", tileset);
    const contourmur = carteDuNiveau.createLayer("contourmur", tileset);

    /***************************
     *  CREATION DES OBJETS *
     ****************************/
    player = this.physics.add.sprite(420, 650, "img_perso");

    // NOUVEAU : le carnet-énigme. ⚠️ Position provisoire -> ajuste-la selon
    // ton plan de la scène.
    this.carnet = this.physics.add.sprite(250, 250, "carnet_enigme_gregoire");
    this.carnet.setScale(0.02);

    this.indiceCarnet = this.add
      .text(this.carnet.x, this.carnet.y - 30, "E", {
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


    mur.setCollisionByProperty({ estSolide: true });
    surlemur.setCollisionByProperty({ estSolide: true });
    sol.setCollisionByProperty({ estSolide: true });
    table.setCollisionByProperty({ estSolide: true });
    surlesol.setCollisionByProperty({ estSolide: true });
    objet.setCollisionByProperty({ estSolide: true });
    surobjet.setCollisionByProperty({ estSolide: true });
    fond.setCollisionByProperty({ estSolide: true });
    contourmur.setCollisionByProperty({ estSolide: true });

    this.physics.add.collider(player, mur);
    this.physics.add.collider(player, surlemur);
    this.physics.add.collider(player, sol);
    this.physics.add.collider(player, table);
    this.physics.add.collider(player, surlesol);
    this.physics.add.collider(player, objet);
    this.physics.add.collider(player, surobjet);
    this.physics.add.collider(player, fond);
    this.physics.add.collider(player, contourmur);

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
            if (this.dialogueUI.visible && this.dialogueUI.completerSiEnCours()) return;

      // NOUVEAU : si le carnet est ouvert, on ignore E ici (c'est la souris qui gère tout)
      if (this.enigmeCarnet.estOuverte()) return;

      if (this.monologue) {
        this.avancerMonologue();
        return;
      }

      const distanceCarnet = Phaser.Math.Distance.Between(player.x, player.y, this.carnet.x, this.carnet.y);
      if (distanceCarnet < 70) {
        this.enigmeCarnet.ouvrir();
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
    // pendant un monologue ou le carnet ouvert, le joueur est figé
    if (this.monologue || this.enigmeCarnet.estOuverte()) {
      player.setVelocity(0, 0);
      player.anims.play("turn");
      return;
    }

    const distCarnetMaj = Phaser.Math.Distance.Between(player.x, player.y, this.carnet.x, this.carnet.y);
    this.indiceCarnet.setVisible(distCarnetMaj < 70);

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