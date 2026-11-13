import * as Phaser from "phaser";
import { DialogueUI } from "./dialogue.js";
import { ReglagesUI } from "./reglage.js";


var player;

var monologueArrivee = [
  { texte: "Violette : Quoi ?! Mais tous ces objets sont à moi... Je ne comprends pas.", moi: "moi_triste", perso: false },
  { texte: "Violette : Cela commence vraiment à me faire peur.", moi: "moi_triste", perso: false },
];

var dialogueVictor = [
  { texte: "Victor : Tu n'aurais pas dû venir ici.", moi: "moi_triste", perso: "victor_colere" },
  { texte: "Violette : C'était toi.", moi: "moi_colere", perso: "victor_triste" },
  { texte: "Victor : Non.", moi: "moi_colere", perso: "victor_triste" },
  { texte: "Violette : Adrien avait confié cette clé à quelqu'un en qui il avait confiance.", moi: "moi_colere", perso: "victor_colere" },
  { texte: "Victor : Ça ne prouve rien.", moi: "moi_colere", perso: "victor_colere" },
  { texte: "Violette : Il écrivait qu'il avait découvert quelque chose sur quelqu'un de proche.", moi: "moi_colere", perso: "victor_colere" },
  { texte: "Violette : À 23h47, quelqu'un quittait les lieux.", moi: "moi_colere", perso: "victor_colere" },
  { texte: "Victor : Tu ne sais pas qui c'était.", moi: "moi_triste", perso: "victor_colere" },
  { texte: "Violette : Non.", moi: "moi_triste", perso: "victor_triste" },
  { texte: "Violette : Mais toi, tu sais.", moi: "moi_colere", perso: "victor_colere" },
  { texte: "Violette : Adrien avait des problèmes avec ses freins.", moi: "moi_colere", perso: "victor_colere" },
  { texte: "Violette : Et ça ?", moi: "moi_colere", perso: "victor_triste" },
  { texte: "Victor : Je ne voulais pas le tuer.", moi: "moi_triste", perso: "victor_triste" },
  { texte: "Victor : Il allait tout raconter.", moi: "moi_triste", perso: "victor_colere" },
  { texte: "Violette : Ta collection ?", moi: "moi_triste", perso: "victor_triste" },
  { texte: "Victor : Il ne comprenait pas.", moi: "moi_triste", perso: "victor_colere" },
  { texte: "Victor : Je voulais seulement protéger ce qui comptait pour moi.", moi: "moi_triste", perso: "victor_amoureux" },
  { texte: "Violette : Je ne t'appartiens pas.", moi: "moi_colere", perso: "victor_triste" },
];

export default class victor_secret extends Phaser.Scene {
  constructor() {
    super({ key: "victor_secret" });
  }

  preload() {}

  create() {
          this.reglagesUI = new ReglagesUI(this);

    this.monologue = null;
    this.sceneTerminee = false;

    this.dialogueUI = new DialogueUI(this, {
      moiParDefaut: "moi_heureuse",
      persoParDefaut: "victor",
    });

    // décor : base reprise de ta copie (carte3)
    const carteDuNiveau = this.add.tilemap("carte15");
    const tileset = carteDuNiveau.addTilesetImage("tilesetpiecesecrete", "Phaser_tuilesdejeu15");

    carteDuNiveau.createLayer("fond", tileset);
    const fond2 = carteDuNiveau.createLayer("sol", tileset);
    carteDuNiveau.createLayer("surlesol", tileset);
    const mur = carteDuNiveau.createLayer("mur", tileset);
    const surlemur = carteDuNiveau.createLayer("surlemur", tileset);
    const objet = carteDuNiveau.createLayer("objet", tileset);
    const surobjet = carteDuNiveau.createLayer("surobjet", tileset);
    const contourmur = carteDuNiveau.createLayer("contourmur", tileset);
    const chaise = carteDuNiveau.createLayer("chaise", tileset);


    fond2.setCollisionByProperty({ estSolide: true });
    mur.setCollisionByProperty({ estSolide: true });
    surlemur.setCollisionByProperty({ estSolide: true });
    objet.setCollisionByProperty({ estSolide: true });
    surobjet.setCollisionByProperty({ estSolide: true });
    contourmur.setCollisionByProperty({ estSolide: true });
    chaise.setCollisionByProperty({ estSolide: true });

    player = this.physics.add.sprite(350, 500, "img_perso");
    player.setCollideWorldBounds(true);
    
    this.physics.add.collider(player, fond2);
    this.physics.add.collider(player, mur);
    this.physics.add.collider(player, surlemur);
    this.physics.add.collider(player, objet);
    this.physics.add.collider(player, surobjet);
    this.physics.add.collider(player, contourmur);
    this.physics.add.collider(player, chaise);

    if (!this.anims.exists("turn")) {
      this.anims.create({ key: "turn", frames: [{ key: "img_perso", frame: 4 }], frameRate: 20 });
    }

    this.physics.world.setBounds(0, 0, 1280, 640);
    this.cameras.main.setBounds(0, 0, 1280, 640);
    this.cameras.main.startFollow(player);

    this.input.keyboard.on("keydown-E", () => {
            if (this.dialogueUI.visible && this.dialogueUI.completerSiEnCours()) return;

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

  // fondu au noir, puis la scène finale chez les gendarmes (choix du coupable)
  finDeScene() {
    if (this.sceneTerminee) return;
    this.sceneTerminee = true;

    this.cameras.main.once("camerafadeoutcomplete", () => {
      // NOUVEAU : Victor vient de se confier -> on part directement vers le
      // commissariat (gendarmerie2.js) et son choix du coupable, au lieu de
      // l'ancienne scène "bd" générique.
      this.scene.start("gendarmerie2");
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