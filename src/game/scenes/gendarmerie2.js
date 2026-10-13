import * as Phaser from "phaser";
import { DialogueUI } from "./dialogue.js";
// NOUVEAU : l'UI de choix du coupable (4 portraits cliquables)
import { UiCoupableUI } from "./UiCoupableUI.js";

var player;
var cursors;

/* ============================================================
 *  TEXTES
 * ============================================================ */
// NOUVEAU : scène finale -> plus aucun objet, plus de téléphone, plus
// d'énigme. Juste Violette et le gendarme, et une seule discussion.
var dialogueFinal = [
  { texte: "Violette : Je sais qui c'est, maintenant.", moi: "moi_colere", perso: "perso_triste" },
  { texte: "Gendarme : Vous en êtes sûre ?", moi: "moi_colere", perso: "perso_triste" },
  { texte: "Violette : Certaine. Il est temps d'en finir.", moi: "moi_colere", perso: "perso_colere" },
];

export default class gendarmerie2 extends Phaser.Scene {
  constructor() {
    super({ key: "gendarmerie2" }); // mettre le meme nom que le nom de la classe
  }

  preload() {}

  create() {
    this.monologue = null;

    this.dialogueUI = new DialogueUI(this, {
      moiParDefaut: "moi_colere",
      persoParDefaut: "perso_triste",
    });

    // NOUVEAU : décor minimal conservé pour que la pièce reste reconnaissable,
    // mais plus aucun objet interactif (téléphone, ordinateur, sac, carte,
    // énigme, portes) : il ne reste que le gendarme.
    const carteDuNiveau = this.add.tilemap("carte7");
    const tileset = carteDuNiveau.addTilesetImage("sprite_police", "Phaser_tuilesdejeu7");
    carteDuNiveau.createLayer("background", tileset);
    carteDuNiveau.createLayer("sol", tileset);
    const murs_porteurs = carteDuNiveau.createLayer("murs_porteurs", tileset);
    const cloison = carteDuNiveau.createLayer("cloison", tileset);
    carteDuNiveau.createLayer("tapis", tileset);
    const meuble = carteDuNiveau.createLayer("meuble", tileset);
    carteDuNiveau.createLayer("deco_meuble", tileset);
    const deco = carteDuNiveau.createLayer("deco", tileset);

    deco.setCollisionByProperty({ estSolide: true });
    meuble.setCollisionByProperty({ estSolide: true });
    murs_porteurs.setCollisionByProperty({ estSolide: true });
    cloison.setCollisionByProperty({ estSolide: true });

    player = this.physics.add.sprite(350, 500, "img_perso");
    // NOUVEAU : le gendarme -> remplace "img_perso2" par ta texture si tu en as une
    this.gendarme = this.physics.add.sprite(398, 387, "img_perso2");

    this.physics.add.collider(player, deco);
    this.physics.add.collider(player, meuble);
    this.physics.add.collider(player, murs_porteurs);
    this.physics.add.collider(player, cloison);

    player.setCollideWorldBounds(true);

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

    // NOUVEAU : l'UI de choix du coupable -> 4 portraits côte à côte
    this.uiCoupable = new UiCoupableUI(this, {
      titre: "Qui est le coupable ?",
      suspects: [
        { id: "victor", image: "suspicion_victor" },
        { id: "jessica", image: "suspicion_jessica" },
        { id: "gregoire", image: "suspicion_gregoire" },
        { id: "marguerite", image: "suspicion_marguerite" },
      ],
      onChoix: (id) => this.choisirCoupable(id),
    });

    this.input.keyboard.on("keydown-E", () => {
      if (this.uiCoupable.estOuverte()) return;
      if (this.monologue) {
        this.avancerMonologue();
      }
    });

    // NOUVEAU : la scène n'est qu'une discussion -> elle se joue
    // automatiquement à l'arrivée, puis ouvre le choix du coupable
    this.lancerMonologue(dialogueFinal, () => {
      this.uiCoupable.ouvrir();
    });
  }

  update() {
    // pendant le dialogue ou le choix du coupable, le joueur est figé
    if (this.monologue || this.uiCoupable.estOuverte()) {
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

  // NOUVEAU : appelé quand le joueur clique sur un des 4 portraits
  choisirCoupable(id) {
    this.cameras.main.once("camerafadeoutcomplete", () => {
      // NOUVEAU : les bd_* existent déjà et ramènent elles-mêmes à menu.js
      this.scene.start("bd_" + id);
    });
    this.cameras.main.fadeOut(1200, 0, 0, 0);
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