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
// NOUVEAU : réaction de Violette en voyant Victor, juste avant qu'il ne
// s'approche. Monologue solo -> perso: false.
var monologueDecouvreVictor = [
  { texte: "Violette : Oh... Victor ?", moi: "moi_triste", perso: false },
  { texte: "Violette : Qu'est-ce qu'il fait là ?", moi: "moi_colere", perso: false },
];

// NOUVEAU : le dialogue avec Victor, à 2 portraits (comme dans maison.js)
var dialogueVictor = [
  { texte: "Victor : Christine. Je passais dans le coin.", moi: "moi_triste", perso: "victor_hereuse" },
  { texte: "Violette : Dans le coin ? Tu habites à l'autre bout de la ville.", moi: "moi_colere", perso: "victor_hereuse" },
  {
    texte: "Victor : (sourire) J'avais besoin de marcher. Tiens, je t'ai pris un café. Tu n'as pas dû dormir beaucoup.",
    moi: "moi_colere",
    perso: "victor_hereue",
  },
  { texte: "Violette : Merci.", moi: "moi_triste", perso: "victor_hereuse" },
  { texte: "Victor : Tu avances ? Dans… ce que tu fais ?", moi: "moi_triste", perso: "victor_triste" },
  { texte: "Violette : Un peu.", moi: "moi_triste", perso: "victor_triste" },
  {
    texte: "Victor : Si tu veux que je t'accompagne, tu me le dis. Je ne veux pas que tu sois seule avec tout ça.",
    moi: "moi_triste",
    perso: "victor_triste",
  },
  { texte: "Violette : Je préfère y aller seule pour l'instant.", moi: "moi_colere", perso: "victor_colere" },
  {
    texte: "Victor : D'accord. (un temps) Dis à Marguerite que je ne lui en veux pas, pour l'autre fois.",
    moi: "moi_colere",
    perso: "victor_colere",
  },
  { texte: "Violette : Elle s'en remettra.", moi: "moi_colere", perso: "victor_colere" },
  { texte: "Victor : Appelle-moi. N'importe quand.", moi: "moi_triste", perso: "victor_hereuse" },
];

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
  { texte: "Martin : Et puis Adrien se plaignait des freins de sa voiture, ces derniers temps.", moi: "moi_triste", perso: "perso_triste" },  
  { texte: "Martin : Il n'en avait parlé qu'à moi. Il avait honte de ne pas pouvoir les faire réparer.", moi: "moi_triste", perso: "perso_triste" },
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
// NOUVEAU : Victor ne vient qu'une seule fois dans cette scène
const CLE_VICTOR = "victor_rue_rencontre_joue";

// ============================================================
//  VICTOR : sens de marche + parcours
// ============================================================
const VITESSE_VICTOR = 120; // pixels par seconde

const DIRECTIONS_VICTOR = {
  gauche: { axe: "x", anim: "victor_gauche", idle: "victor_idle_gauche" },
  droite: { axe: "x", anim: "victor_droite", idle: "victor_idle_droite" },
  haut:   { axe: "y", anim: "victor_haut",   idle: "victor_idle_dos" },
  bas:    { axe: "y", anim: "victor_bas",    idle: "victor_idle_face" }, // "tout droit" = vers l'avant
};

export default class rue extends Phaser.Scene {
  constructor() {
    super({ key: "rue" });
  }

  preload() {}

  create() {
    this.monologue = null;
    // NOUVEAU : fige le joueur pendant toute la cinématique Victor (y compris
    // pendant les tweens de déplacement, entre deux monologues)
    this.victorCutscene = false;
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
            if (this.dialogueUI.visible && this.dialogueUI.completerSiEnCours()) return;

      // un monologue en cours est prioritaire sur tout -> CORRIGÉ : ce test
      // doit passer AVANT le garde-fou "victorCutscene" (qui reste vrai
      // pendant toute la cinématique, y compris pendant les monologues).
      // Dans l'ancien ordre, "victorCutscene" coupait court avant même
      // d'atteindre ce test, donc E ne faisait jamais avancer le dialogue
      // "Oh... Victor ?" -> la scène semblait bloquée.
      if (this.monologue) {
        this.avancerMonologue();
        return;
      }

      // NOUVEAU : pendant les tweens de déplacement de Victor (où il n'y a
      // pas de monologue affiché), on ignore quand même E pour ne pas
      // déclencher Martin par accident.
      if (this.victorCutscene) return;

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

        // Animations de Victor
    creerAnim({ key: "victor_idle_gauche", frames: [{ key: "victor", frame: 0 }], frameRate: 1 });
    creerAnim({ key: "victor_gauche", frames: this.anims.generateFrameNumbers("victor", { start: 1, end: 3 }), frameRate: 8, repeat: -1 });
    creerAnim({ key: "victor_idle_droite", frames: [{ key: "victor", frame: 5 }], frameRate: 1 });
    creerAnim({ key: "victor_droite", frames: this.anims.generateFrameNumbers("victor", { start: 6, end: 7 }), frameRate: 8, repeat: -1 });
    creerAnim({ key: "victor_idle_dos", frames: [{ key: "victor", frame: 9 }], frameRate: 1 });
    creerAnim({ key: "victor_haut", frames: this.anims.generateFrameNumbers("victor", { start: 10, end: 11 }), frameRate: 8, repeat: -1 });
    creerAnim({ key: "victor_idle_face", frames: [{ key: "victor", frame: 12 }], frameRate: 1 });
    creerAnim({ key: "victor_bas", frames: this.anims.generateFrameNumbers("victor", { start: 13, end: 14 }), frameRate: 8, repeat: -1 });

    cursors = this.input.keyboard.createCursorKeys();

    this.physics.world.setBounds(0, 0, 800, 608);
    this.cameras.main.setBounds(0, 0, 800, 608);
    this.cameras.main.startFollow(player);

    // NOUVEAU : Victor n'apparaît qu'une seule fois, dès l'arrivée dans la
    // scène -> ensuite il ne revient plus jamais.
    const victorDejaRencontre = this.registry.get(CLE_VICTOR) || false;

    if (!victorDejaRencontre) {
      this.victor = this.physics.add.sprite(600, 450, "victor");
      this.victor.setScale(0.7);
      this.victor.anims.play("victor_idle_gauche"); // il regarde vers Violette

      this.victorCutscene = true;
      // (le reste ne change pas)     

      this.victorCutscene = true;

      // petit temps avant que Violette ne réagisse, pour laisser le joueur
      // remarquer Victor à l'écran
      this.time.delayedCall(500, () => {
        this.lancerMonologue(monologueDecouvreVictor, () => {
          this.victorSApproche();
        });
      });
    } else {
      this.victor = null;

      // MONOLOGUE D'INTRODUCTION (une seule fois) -> puis objectif "Parler à Martin"
      if (!this.registry.get(CLE_INTRO)) {
        this.lancerMonologue(introMonologue, () => {
          this.registry.set(CLE_INTRO, true);
          ajouterTache(this, "parler_martin", "Parler à Martin");
        });
      }
    }
  }

  // NOUVEAU : Victor marche jusqu'à Violette, puis la conversation démarre
  victorSApproche() {
    const xCible = player.x + 70;
    const yCible = player.y;

    this.tweens.add({
      targets: this.victor,
      x: xCible,
      y: yCible,
      duration: 900,
      ease: "Sine.easeInOut",
      onComplete: () => {
        this.lancerMonologue(dialogueVictor, () => {
          this.victorSEnVa();
        });
      },
    });
  }

  // Victor marche jusqu'à Violette : d'abord à gauche, puis tout droit (vers le bas)
  victorSApproche() {
    const parcours = [
      { direction: "gauche", vers: player.x + 70 },
      { direction: "bas", vers: player.y },
    ];

    this.victorSuivreParcours(parcours, () => {
      this.victor.anims.play("victor_idle_gauche"); // face à Violette
      this.lancerMonologue(dialogueVictor, () => {
        this.victorSEnVa();
      });
    });
  }

  // Victor repart vers la droite en fondu
  victorSEnVa() {
    this.tweens.add({
      targets: this.victor,
      alpha: 0,
      delay: 500,
      duration: 1500,
    });

    this.victorSuivreParcours([{ direction: "droite", vers: this.victor.x + 300 }], () => {
      if (this.victor) {
        this.victor.destroy();
        this.victor = null;
      }
      this.registry.set(CLE_VICTOR, true);

      if (!this.registry.get(CLE_INTRO)) {
        this.lancerMonologue(introMonologue, () => {
          this.registry.set(CLE_INTRO, true);
          ajouterTache(this, "parler_martin", "Parler à Martin");
          this.victorCutscene = false;
        });
      } else {
        this.victorCutscene = false;
      }
    });
  }

  // Enchaîne les étapes d'un parcours, une par une
  victorSuivreParcours(etapes, onFin, i = 0) {
    if (i >= etapes.length) {
      if (onFin) onFin();
      return;
    }
    const etape = etapes[i];
    this.victorMarcher(etape.direction, etape.vers, () => {
      this.victorSuivreParcours(etapes, onFin, i + 1);
    });
  }

  // Une étape : marche dans une direction jusqu'à la coordonnée "cible"
  victorMarcher(direction, cible, onFin) {
    const d = DIRECTIONS_VICTOR[direction];
    const distance = Math.abs(cible - this.victor[d.axe]);

    this.victor.anims.play(d.anim, true);
    this.tweens.add({
      targets: this.victor,
      [d.axe]: cible,
      duration: (distance / VITESSE_VICTOR) * 1000,
      ease: "Linear",
      onComplete: () => {
        this.victor.anims.play(d.idle);
        if (onFin) onFin();
      },
    });
  }

  update() {
    if (this.scene.isPaused()) return;

    // pendant un monologue, ou pendant la cinématique Victor (tweens compris), le joueur est figé
    if (this.monologue || this.victorCutscene) {
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