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
  { texte: "Violette : Mais oui ! Je devrais aller parler à Cunégonde, elle doit en savoir plus.", moi: "moi_heureuse", perso: false },
];

var dialogueCunegonde = [
  { texte: "Cunégonde : Je crois que vous vous trompez sur Grégoire.", moi: "moi_triste", perso: "perso_colere" },
  { texte: "Violette : Pourquoi ?", moi: "moi_colere", perso: "perso_triste" },
  { texte: "Cunégonde : Parce qu'il n'était pas avec Adrien ce soir-là.", moi: "moi_colere", perso: "perso_heureuse" },
  { texte: "Violette : Comment le savez-vous ?", moi: "moi_colere", perso: "perso_heureuse" },
  { texte: "Cunégonde : Parce qu'il était avec quelqu'un d'autre.", moi: "moi_triste", perso: "perso_heureuse" },
  // dernière réplique : Violette pense à voix haute (portrait de Cunégonde caché)
  { texte: "Violette : Je ne comprends pas... Il faut que j'aille voir Grégoire pour mieux comprendre la situation.", moi: "moi_triste", perso: false },
];

var dialogueCunegondeRepete = [
  { texte: "Cunégonde : Allez donc voir Grégoire, ma petite. Moi, je n'ai rien dit !", moi: "moi_heureuse", perso: "perso_heureuse" },
];

const CLE_INTRO = "intro_gendarmerie4_joue";

export default class couloir extends Phaser.Scene {
  constructor() {
    super({ key: "couloir" });
  }

  preload() {}

  create() {
    this.monologue = null;
    dialogueIndex = 0;

    this.dialogueUI = new DialogueUI(this, {
      moiParDefaut: "moi_heureuse",
      persoParDefaut: "perso_triste",
    });

    this.inventaireUI = new InventaireUI(this);

    // À REMPLACER par la carte du couloir quand elle sera prête
    const carteDuNiveau = this.add.tilemap("carte6");
    this.carteUI = new CarteUI(this);
    this.tachesUI = new TachesUI(this);

    const tileset = carteDuNiveau.addTilesetImage("sprite_couloir", "Phaser_tuilesdejeu6");
    carteDuNiveau.createLayer("sol", tileset);
    const cote_paillasson = carteDuNiveau.createLayer("cote_paillasson", tileset);
    const partie_noir = carteDuNiveau.createLayer("partie_noir", tileset);
    const escalier = carteDuNiveau.createLayer("escalier", tileset);
    const mur_vert = carteDuNiveau.createLayer("mur_vert", tileset);
    const porte = carteDuNiveau.createLayer("porte", tileset);
    const lambris = carteDuNiveau.createLayer("lambris", tileset);
    const porte_deco = carteDuNiveau.createLayer("porte_deco", tileset);

    /***************************
     *  OBJETS *
     ****************************/
    player = this.physics.add.sprite(350, 400, "img_perso");

    // portes vers l'appartement (invisibles)
    this.porte_ville = this.physics.add.staticSprite(300, 570, "img_porte1").setAlpha(0);
    this.porte_ville1 = this.physics.add.staticSprite(350, 570, "img_porte1").setAlpha(0);
    this.porte_ville2 = this.physics.add.staticSprite(400, 570, "img_porte1").setAlpha(0);
    this.porte_ville3 = this.physics.add.staticSprite(450, 570, "img_porte1").setAlpha(0);

    // Cunégonde (image "cunegonde" si elle est chargée, sinon img_perso2 en attendant)
    const textureCunegonde = this.textures.exists("cunegonde") ? "cunegonde" : "img_perso2";
    this.cunegonde = this.physics.add.staticSprite(300, 300, textureCunegonde);

    // le "E" au-dessus de Cunégonde
    this.indiceCunegonde = this.add
      .text(this.cunegonde.x, this.cunegonde.y - this.cunegonde.displayHeight / 2 - 12, "E", {
        font: "bold 16px Arial",
        color: "#ffffff",
        backgroundColor: "#000000",
        padding: { x: 7, y: 3 },
      })
      .setOrigin(0.5)
      .setDepth(50)
      .setVisible(false);

    /***************************
     *  COLLISIONS *
     ****************************/

    partie_noir.setCollisionByProperty({ estSolide: true });
    mur_vert.setCollisionByProperty({ estSolide: true });
    escalier.setCollisionByProperty({ estSolide: true });
    porte.setCollisionByProperty({ estSolide: true });
    lambris.setCollisionByProperty({ estSolide: true });
    porte_deco.setCollisionByProperty({ estSolide: true });

    this.physics.add.collider(player, cote_paillasson);
    this.physics.add.collider(player, partie_noir);
    this.physics.add.collider(player, mur_vert);
    this.physics.add.collider(player, escalier);
    this.physics.add.collider(player, porte);
    this.physics.add.collider(player, lambris);
    this.physics.add.collider(player, porte_deco);

    player.setCollideWorldBounds(true);

    /***************************
     *  TOUCHE E
     ****************************/
    this.input.keyboard.on("keydown-E", () => {
      if (this.monologue) {
        this.avancerMonologue();
        return;
      }

      const dist = Phaser.Math.Distance.Between(player.x, player.y, this.cunegonde.x, this.cunegonde.y);

      if (dist < 125) {
        if (dialogueIndex === 0) {
          dialoguesActuels = this.obtenirDialogueCunegonde();
        }

        if (dialogueIndex < dialoguesActuels.length) {
          this.dialogueUI.afficherLigne(dialoguesActuels[dialogueIndex]);
          dialogueIndex++;
          this.physics.pause();
        } else {
          this.dialogueUI.masquer();
          dialogueIndex = 0;
          this.physics.resume();
          this.apresDialogueCunegonde();
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

    // MONOLOGUE D'ARRIVÉE (une seule fois) -> objectif "Parler à Cunégonde"
    if (!this.registry.get(CLE_INTRO)) {
      this.lancerMonologue(introMonologue, () => {
        this.registry.set(CLE_INTRO, true);
        ajouterTache(this, "parler_cunegonde", "Parler à Cunégonde");
      });
    }
  }

  update() {
    if (this.scene.isPaused()) return;

    if (this.monologue) {
      player.setVelocity(0, 0);
      player.anims.play("turn");
      this.indiceCunegonde.setVisible(false);
      return;
    }

    const dist = Phaser.Math.Distance.Between(player.x, player.y, this.cunegonde.x, this.cunegonde.y);
    this.indiceCunegonde.setVisible(dist < 125 && !this.dialogueUI.visible);

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

    if (
      this.physics.overlap(player, this.porte_ville) ||
      this.physics.overlap(player, this.porte_ville1) ||
      this.physics.overlap(player, this.porte_ville2) ||
      this.physics.overlap(player, this.porte_ville3)
    ) {
      this.scene.start("gendarmerie2");
    }
  }

  /* ============================================================
   *  OUTILS
   * ============================================================ */

  obtenirDialogueCunegonde() {
    return estTacheTerminee(this, "parler_cunegonde") ? dialogueCunegondeRepete : dialogueCunegonde;
  }

  // Fin de la conversation : on valide l'objectif, on lance le suivant et on part chez Grégoire
  apresDialogueCunegonde() {
    if (estTacheTerminee(this, "parler_cunegonde")) return;

    ajouterTache(this, "parler_cunegonde", "Parler à Cunégonde"); // sécurité
    terminerTache(this, "parler_cunegonde");
    ajouterTache(this, "parler_gregoire", "Parler à Grégoire");

    this.scene.start("entreprise_gregoire2");
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