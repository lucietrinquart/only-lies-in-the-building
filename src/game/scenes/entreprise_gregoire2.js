import * as Phaser from "phaser";
import { InventaireUI } from "./inventaire.js";
import { CarteUI } from "./carte.js";
import { TachesUI, ajouterTache, terminerTache, estTacheTerminee } from "./taches.js";
import { DialogueUI } from "./dialogue.js";
import { ReglagesUI } from "./reglage.js";


var player;
var cursors;
var dialogueIndex = 0;
var dialoguesActuels = [];

/* ============================================================
 *  TEXTES
 * ============================================================ */
var dialogueGregoire = [
  { texte: "Violette : Cette lettre. C'était quoi ?", moi: "moi_colere", perso: "gregoire_hereuse" },
  { texte: "Grégoire : Adrien avait découvert quelque chose.", moi: "moi_colere", perso: "gregoire_hereuse" },
  { texte: "Violette : Quelque chose sur vous ?", moi: "moi_colere", perso: "gregoire_hereuse" },
  { texte: "Grégoire : Oui.", moi: "moi_triste", perso: "gregoire_hereuse" },
  { texte: "Grégoire : Je ne voulais pas que ma femme le sache.", moi: "moi_triste", perso: "gregoire_hereuse" },
];

var dialogueGregoireRepete = [
  { texte: "Grégoire : Je n'ai plus rien à vous dire.", moi: "moi_triste", perso: "gregoire_hereuse" },
];

var monologueFinGregoire = [
  { texte: "Violette : Je n'en peux plus, je n'ai plus aucune piste...", moi: "moi_triste", perso: false },
  { texte: "Violette : Il faut que je retourne chez moi pour mieux comprendre certains éléments.", moi: "moi_triste", perso: false },
];

export default class entreprise_gregoire2 extends Phaser.Scene {
  constructor() {
    super({ key: "entreprise_gregoire2" });
  }

  preload() {}

  create() {
          this.reglagesUI = new ReglagesUI(this);

    this.monologue = null;
    dialogueIndex = 0;

    const carteDuNiveau = this.add.tilemap("carte4");
    this.carteUI = new CarteUI(this);
    this.inventaireUI = new InventaireUI(this);

    this.dialogueUI = new DialogueUI(this, {
      moiParDefaut: "moi_heureuse",
      persoParDefaut: "perso_triste",
    });
            const tileset = carteDuNiveau.addTilesetImage("tileset_bureau", "Phaser_tuilesdejeu4");


    const sol = carteDuNiveau.createLayer("sol", tileset);
    const surlesol = carteDuNiveau.createLayer("surlesol", tileset);
    const mur = carteDuNiveau.createLayer("mur", tileset);
    const surlemur = carteDuNiveau.createLayer("surlemur", tileset);
    const chaise = carteDuNiveau.createLayer("chaise", tileset);
    const tableune = carteDuNiveau.createLayer("tableune", tileset);
    const ordinateur_tuile = carteDuNiveau.createLayer("ordinateur_tuile", tileset);
    const separateur = carteDuNiveau.createLayer("separateur", tileset);
    const objet = carteDuNiveau.createLayer("objet", tileset);
    const surobjet = carteDuNiveau.createLayer("surobjet", tileset);
    const contourmur = carteDuNiveau.createLayer("contourmur", tileset);


    /***************************
     *  DÉCOR (non interactif)
     ****************************/
    const decor = (x, y, cle, echelle) => {
      if (!this.textures.exists(cle)) return null;
      return this.add.image(x, y, cle).setScale(echelle);
    };
    const tiroirOuvert = this.registry.get("accueil_tiroir_ouvert") || false;
    decor(tiroirOuvert ? 530 : 530, 900, "bureau", 0.03);
    decor(110, 400, "poubelle", 0.03);
    decor(460, 700, "ordinateur", 0.1);
    decor(490, 50, "bibliotheque", 0.2);



    /***************************
     *  JOUEUR + GRÉGOIRE
     ****************************/
    player = this.physics.add.sprite(800, 290, "img_perso");

    // Grégoire est revenu à son poste, légèrement décalé par rapport à la 1re visite
    const textureGregoire = this.textures.exists("gregoire") ? "gregoire" : "gregoire";
    this.gregoire = this.physics.add.staticSprite(575, 400, textureGregoire, 12);
    this.gregoire.setScale(0.7); 



    this.indiceGregoire = this.add
      .text(this.gregoire.x, this.gregoire.y - this.gregoire.displayHeight / 2 - 12, "E", {
        font: "bold 16px Arial",
        color: "#ffffff",
        backgroundColor: "#000000",
        padding: { x: 7, y: 3 },
      })
      .setOrigin(0.5)
      .setDepth(50)
      .setVisible(false);

    this.tachesUI = new TachesUI(this);



    /***************************
     *  COLLISIONS *
     ****************************/
    sol.setCollisionByProperty({ estsolide: true });
    surlesol.setCollisionByProperty({ estsolide: true });
    mur.setCollisionByProperty({ estsolide: true });
    surlemur.setCollisionByProperty({ estsolide: true });
    chaise.setCollisionByProperty({ estsolide: true });
    tableune.setCollisionByProperty({ estsolide: true });
    ordinateur_tuile.setCollisionByProperty({ estsolide: true });
    separateur.setCollisionByProperty({ estsolide: true });
    objet.setCollisionByProperty({ estsolide: true });
    surobjet.setCollisionByProperty({ estsolide: true });
    contourmur.setCollisionByProperty({ estsolide: true });

    this.physics.add.collider(player, sol);
    this.physics.add.collider(player, surlesol);
    this.physics.add.collider(player, mur);
    this.physics.add.collider(player, surlemur);
    this.physics.add.collider(player, chaise);
    this.physics.add.collider(player, tableune);
    this.physics.add.collider(player, ordinateur_tuile);
    this.physics.add.collider(player, separateur);
    this.physics.add.collider(player, objet);
    this.physics.add.collider(player, surobjet);
    this.physics.add.collider(player, contourmur);

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

    this.physics.world.setBounds(0, 0, 1024, 1024);
    this.cameras.main.setBounds(0, 0, 1024, 1024);
    this.cameras.main.startFollow(player);

    /***************************
     *  TOUCHE E
     ****************************/
    this.input.keyboard.on("keydown-E", () => {
            if (this.dialogueUI.visible && this.dialogueUI.completerSiEnCours()) return;

      if (this.monologue) {
        this.avancerMonologue();
        return;
      }

      const dist = Phaser.Math.Distance.Between(player.x, player.y, this.gregoire.x, this.gregoire.y);

      if (dist < 100) {
        if (dialogueIndex === 0) {
          dialoguesActuels = this.obtenirDialogueGregoire();
        }

        if (dialogueIndex < dialoguesActuels.length) {
          this.dialogueUI.afficherLigne(dialoguesActuels[dialogueIndex]);
          dialogueIndex++;
          this.physics.pause();
        } else {
          this.dialogueUI.masquer();
          dialogueIndex = 0;
          this.physics.resume();
          this.apresDialogueGregoire();
        }
      }
    });
  }

  update() {
    if (this.scene.isPaused()) return;

    if (this.monologue) {
      player.setVelocity(0, 0);
      player.anims.play("turn");
      this.indiceGregoire.setVisible(false);
      return;
    }

    const dist = Phaser.Math.Distance.Between(player.x, player.y, this.gregoire.x, this.gregoire.y);
    this.indiceGregoire.setVisible(dist < 100 && !this.dialogueUI.visible);

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

  obtenirDialogueGregoire() {
    return estTacheTerminee(this, "parler_gregoire") ? dialogueGregoireRepete : dialogueGregoire;
  }

  apresDialogueGregoire() {
    if (estTacheTerminee(this, "parler_gregoire")) return;

    ajouterTache(this, "parler_gregoire", "Parler à Grégoire"); // sécurité
    terminerTache(this, "parler_gregoire");

    this.lancerMonologue(monologueFinGregoire);
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