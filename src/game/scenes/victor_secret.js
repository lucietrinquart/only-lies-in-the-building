import * as Phaser from "phaser";
import { DialogueUI } from "./dialogue.js";

var player;

var monologueArrivee = [
  { texte: "Violette : Quoi ?! Mais tous ces objets sont à moi... Je ne comprends pas.", moi: "moi_triste", perso: false },
  { texte: "Violette : Cela commence vraiment à me faire peur.", moi: "moi_triste", perso: false },
];

var dialogueVictor = [
  { texte: "Victor : Tu n'aurais pas dû venir ici.", moi: "moi_triste", perso: "victor" },
  { texte: "Violette : C'était toi.", moi: "moi_colere", perso: "victor" },
  { texte: "Victor : Non.", moi: "moi_colere", perso: "victor" },
  { texte: "Violette : Adrien avait confié cette clé à quelqu'un en qui il avait confiance.", moi: "moi_colere", perso: "victor" },
  { texte: "Victor : Ça ne prouve rien.", moi: "moi_colere", perso: "victor" },
  { texte: "Violette : Il écrivait qu'il avait découvert quelque chose sur quelqu'un de proche.", moi: "moi_colere", perso: "victor" },
  { texte: "Violette : À 23h47, quelqu'un quittait les lieux.", moi: "moi_colere", perso: "victor" },
  { texte: "Victor : Tu ne sais pas qui c'était.", moi: "moi_triste", perso: "victor" },
  { texte: "Violette : Non.", moi: "moi_triste", perso: "victor" },
  { texte: "Violette : Mais toi, tu sais.", moi: "moi_colere", perso: "victor" },
  { texte: "Violette : Adrien avait des problèmes avec ses freins.", moi: "moi_colere", perso: "victor" },
  { texte: "Violette : Et ça ?", moi: "moi_colere", perso: "victor" },
  { texte: "Victor : Je ne voulais pas le tuer.", moi: "moi_triste", perso: "victor" },
  { texte: "Victor : Il allait tout raconter.", moi: "moi_triste", perso: "victor" },
  { texte: "Violette : Ta collection ?", moi: "moi_triste", perso: "victor" },
  { texte: "Victor : Il ne comprenait pas.", moi: "moi_triste", perso: "victor" },
  { texte: "Victor : Je voulais seulement protéger ce qui comptait pour moi.", moi: "moi_triste", perso: "victor" },
  { texte: "Violette : Je ne t'appartiens pas.", moi: "moi_colere", perso: "victor" },
];

export default class victor_secret extends Phaser.Scene {
  constructor() {
    super({ key: "victor_secret" });
  }

  preload() {}

  create() {
    this.monologue = null;
    this.sceneTerminee = false;

    this.dialogueUI = new DialogueUI(this, {
      moiParDefaut: "moi_heureuse",
      persoParDefaut: "victor",
    });

    // décor : base reprise de ta copie (carte3)
    const carteDuNiveau = this.add.tilemap("carte9");
    const tileset = carteDuNiveau.addTilesetImage("barthe", "Phaser_tuilesdejeu9");

    carteDuNiveau.createLayer("sol", tileset);
    carteDuNiveau.createLayer("fond", tileset);
    const fond2 = carteDuNiveau.createLayer("fond2", tileset);
    carteDuNiveau.createLayer("bois", tileset);
    const objet4 = carteDuNiveau.createLayer("objet4", tileset);
    const objet5 = carteDuNiveau.createLayer("objet5", tileset);
    const arbre = carteDuNiveau.createLayer("arbre", tileset);
    const interdiction = carteDuNiveau.createLayer("interdiction", tileset);
    arbre.depth = 100;

    fond2.setCollisionByProperty({ estSolide: true });
    objet4.setCollisionByProperty({ estSolide: true });
    objet5.setCollisionByProperty({ estSolide: true });
    interdiction.setCollisionByProperty({ estSolide: true });

    player = this.physics.add.sprite(350, 500, "img_perso");
    player.setCollideWorldBounds(true);
    this.physics.add.collider(player, fond2);
    this.physics.add.collider(player, objet4);
    this.physics.add.collider(player, objet5);
    this.physics.add.collider(player, interdiction);

    if (!this.anims.exists("turn")) {
      this.anims.create({ key: "turn", frames: [{ key: "img_perso", frame: 4 }], frameRate: 20 });
    }

    this.physics.world.setBounds(0, 0, 1280, 640);
    this.cameras.main.setBounds(0, 0, 1280, 640);
    this.cameras.main.startFollow(player);

    this.input.keyboard.on("keydown-E", () => {
      if (this.monologue) this.avancerMonologue();
    });

    // monologue d'arrivée, puis Victor apparaît dans la discussion
    this.lancerMonologue(monologueArrivee, () => {
      this.lancerMonologue(dialogueVictor, () => this.finDeScene());
    });
  }

  update() {
    // la scène est une cinématique : le joueur ne bouge pas
    player.setVelocity(0, 0);
    player.anims.play("turn");
  }

  // fondu au noir, puis scène bd
  finDeScene() {
    if (this.sceneTerminee) return;
    this.sceneTerminee = true;

    this.cameras.main.once("camerafadeoutcomplete", () => {
      this.scene.start("bd");
    });
    this.cameras.main.fadeOut(1500, 0, 0, 0);
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