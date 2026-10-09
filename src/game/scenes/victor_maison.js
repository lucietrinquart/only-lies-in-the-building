import * as Phaser from "phaser";
import { InventaireUI, ObjetRamassable, ajouterObjet, afficherMessage } from "./inventaire.js";
import { CarteUI } from "./carte.js";
import { TachesUI } from "./taches.js";
import { DialogueUI } from "./dialogue.js";

var player;
var cursors;

/* ============================================================
 *  CODE SECRET : chaque objet porte un chiffre
 * ============================================================ */
const NUM_PHOTO = 1;
const NUM_BRACELET = 4;
const NUM_BROSSE = 6;
const CODE_SECRET = `${NUM_PHOTO}${NUM_BRACELET}${NUM_BROSSE}`;

const INDICE_CODE =
  "Un mot est glissé entre les livres : « Dans l'ordre : ce qui se regarde, ce qui se porte, ce qui se coiffe. »";

/* ============================================================
 *  TEXTES
 * ============================================================ */
var introMonologue = [
  { texte: "Violette : Il n'est toujours pas là...", moi: "moi_triste", perso: false },
  { texte: "Violette : Je pourrais en profiter pour découvrir un peu son appartement.", moi: "moi_heureuse", perso: false },
  { texte: "Violette : C'est vrai que je ne l'ai jamais vraiment fait.", moi: "moi_heureuse", perso: false },
];

var monologueBracelet = [
  { texte: "Violette : Wow... Ce bracelet, je le cherche depuis si longtemps !", moi: "moi_heureuse", perso: false },
  { texte: "Violette : Mais pourquoi est-il chez lui ?", moi: "moi_colere", perso: false },
];

var monologueBrosse = [
  { texte: "Violette : C'est bizarre... C'est ma brosse aussi.", moi: "moi_triste", perso: false },
];

/* ============================================================
 *  PAVÉ DE CODE (petite interface cliquable)
 * ============================================================ */
class CodeUI {
  constructor(scene, { indice, code, onReussite }) {
    this.scene = scene;
    this.code = code;
    this.onReussite = onReussite;
    this.saisie = "";
    this.bloque = false;

    const L = scene.cameras.main.width;
    const H = scene.cameras.main.height;
    const cx = L / 2;
    const cy = H / 2;

    this.conteneur = scene.add.container(0, 0).setScrollFactor(0).setDepth(3000).setVisible(false);

    const voile = scene.add.rectangle(cx, cy, L, H, 0x000000, 0.7).setScrollFactor(0).setInteractive();
    const panneau = scene.add
      .rectangle(cx, cy, 400, 480, 0x1c1c1e)
      .setStrokeStyle(2, 0xffffff, 0.3)
      .setScrollFactor(0);
    const titre = scene.add
      .text(cx, cy - 215, "Code à " + code.length + " chiffres", { font: "bold 18px Arial", color: "#ffffff" })
      .setOrigin(0.5)
      .setScrollFactor(0);
    const texteIndice = scene.add
      .text(cx, cy - 185, indice, {
        font: "italic 13px Arial",
        color: "#cccccc",
        align: "center",
        wordWrap: { width: 350 },
      })
      .setOrigin(0.5, 0)
      .setScrollFactor(0);
    this.affichage = scene.add
      .text(cx, cy - 95, "", { font: "bold 36px Arial", color: "#ffffff" })
      .setOrigin(0.5)
      .setScrollFactor(0);
    this.retour = scene.add
      .text(cx, cy + 195, "", { font: "14px Arial", color: "#ff6b6b" })
      .setOrigin(0.5)
      .setScrollFactor(0);

    this.conteneur.add([voile, panneau, titre, texteIndice, this.affichage, this.retour]);

    const touches = [["1", "2", "3"], ["4", "5", "6"], ["7", "8", "9"], ["⌫", "0", ""]];
    touches.forEach((ligne, r) =>
      ligne.forEach((t, c) => {
        if (!t) return;
        this.creerBouton(cx + (c - 1) * 80, cy - 40 + r * 54, t, 70, 44, () =>
          t === "⌫" ? this.effacer() : this.ajouter(t)
        );
      })
    );

    this.creerBouton(cx + 175, cy - 215, "✕", 34, 30, () => this.fermer());
    this.rafraichir();
  }

  creerBouton(x, y, label, l, h, action) {
    const fond = this.scene.add.rectangle(x, y, l, h, 0x3a3a3c).setScrollFactor(0).setInteractive({ useHandCursor: true });
    const txt = this.scene.add
      .text(x, y, label, { font: "bold 20px Arial", color: "#ffffff" })
      .setOrigin(0.5)
      .setScrollFactor(0);
    fond.on("pointerdown", action);
    fond.on("pointerover", () => fond.setFillStyle(0x5a5a5e));
    fond.on("pointerout", () => fond.setFillStyle(0x3a3a3c));
    this.conteneur.add([fond, txt]);
  }

  rafraichir() {
    this.affichage.setText(
      Array.from({ length: this.code.length }, (_, i) => this.saisie[i] || "_").join(" ")
    );
  }

  ajouter(chiffre) {
    if (this.bloque || this.saisie.length >= this.code.length) return;
    this.saisie += chiffre;
    this.retour.setText("");
    this.rafraichir();
    if (this.saisie.length === this.code.length) this.valider();
  }

  effacer() {
    if (this.bloque) return;
    this.saisie = this.saisie.slice(0, -1);
    this.rafraichir();
  }

  valider() {
    this.bloque = true;
    if (this.saisie === this.code) {
      this.retour.setColor("#4caf50").setText("Déclic... quelque chose a bougé.");
      this.scene.time.delayedCall(900, () => {
        this.bloque = false;
        this.fermer();
        this.retour.setColor("#ff6b6b");
        this.onReussite();
      });
    } else {
      this.retour.setColor("#ff6b6b").setText("Ce n'est pas le bon code.");
      this.scene.time.delayedCall(700, () => {
        this.saisie = "";
        this.bloque = false;
        this.rafraichir();
      });
    }
  }

  ouvrir() {
    this.saisie = "";
    this.retour.setText("");
    this.rafraichir();
    this.conteneur.setVisible(true);
  }

  fermer() {
    this.conteneur.setVisible(false);
  }

  get visible() {
    return this.conteneur.visible;
  }
}

/* ============================================================
 *  SCÈNE
 * ============================================================ */
export default class victor_maison extends Phaser.Scene {
  constructor() {
    super({ key: "victor_maison" });
  }

  preload() {}

  create() {
    this.monologue = null;
    this.porteOuverte = this.registry.get("victor_porte_ouverte") || false;

    const carteDuNiveau = this.add.tilemap("carte8");
    this.carteUI = new CarteUI(this);
    this.inventaireUI = new InventaireUI(this);

    this.dialogueUI = new DialogueUI(this, {
      moiParDefaut: "moi_heureuse",
      persoParDefaut: "perso_triste",
    });

    // décor (même base que accueil)
    const tileset = carteDuNiveau.addTilesetImage("sprite_accueil", "Phaser_tuilesdejeu8");
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
     *  OBJETS DE LA PIÈCE *
     ****************************/
    // la porte secrète est créée AVANT la bibliothèque : elle est cachée dessous
    this.porteSecrete = this.physics.add.staticSprite(500, 200, "img_porte1");

    this.bibliotheque = this.add.image(this.porteOuverte ? 620 : 500, 200, "bibliotheque").setScale(0.2);
    this.bureau = this.add.image(100, 250, "bureau").setScale(0.03);

    // alias de texture pour la photo (évite le conflit de clé avec la lettre d'accueil)
    if (!this.textures.exists("photo_victor") && this.textures.exists("lettre")) {
      try {
        this.textures.addImage("photo_victor", this.textures.get("lettre").getSourceImage());
      } catch (e) {
        console.warn("Alias photo_victor non créé :", e);
      }
    }

    this.photo = this.registry.get("victor_photo_prise")
      ? null
      : new ObjetRamassable(
          this, 640, 430, "photo_victor", "Photo",
          `Une photo d'Adrien et Victor, souriants. Au dos, un chiffre est écrit au stylo : ${NUM_PHOTO}.`,
          {
            taille: 40,
            message: "Photo récupérée",
            perimetre: 60,
            onRamasse: () => this.registry.set("victor_photo_prise", true),
          }
        );

    this.bracelet = this.registry.get("victor_bracelet_pris")
      ? null
      : new ObjetRamassable(
          this, 240, 470, "bracelet", "Bracelet",
          `Un bracelet que Violette cherchait depuis longtemps. Pour une raison inconnue, un chiffre est gravé à l'intérieur : ${NUM_BRACELET}.`,
          {
            taille: 40,
            message: "Bracelet récupéré",
            perimetre: 60,
            onRamasse: () => {
              this.registry.set("victor_bracelet_pris", true);
              this.lancerMonologue(monologueBracelet);
            },
          }
        );

    // les "E" (photo et bracelet gèrent le leur)
    const creerIndice = (x, y) =>
      this.add
        .text(x, y, "E", {
          font: "bold 16px Arial",
          color: "#ffffff",
          backgroundColor: "#000000",
          padding: { x: 7, y: 3 },
        })
        .setOrigin(0.5)
        .setDepth(50)
        .setVisible(false);

    this.indiceBureau = creerIndice(this.bureau.x, this.bureau.y - 26);
    this.indiceBibliotheque = creerIndice(500, 200 - 40);
    this.indicePorte = creerIndice(this.porteSecrete.x, this.porteSecrete.y - 26);

    // pavé de code de la bibliothèque
    this.codeUI = new CodeUI(this, {
      indice: INDICE_CODE,
      code: CODE_SECRET,
      onReussite: () => this.ouvrirBibliotheque(),
    });

    /***************************
     *  JOUEUR + COLLISIONS *
     ****************************/
    player = this.physics.add.sprite(420, 650, "img_perso");

    deco_meuble.setCollisionByProperty({ estSolide: true });
    meuble.setCollisionByProperty({ estSolide: true });
    murs_porteurs.setCollisionByProperty({ estSolide: true });
    mur.setCollisionByProperty({ estSolide: true });

    this.physics.add.collider(player, deco_meuble);
    this.physics.add.collider(player, murs_porteurs);
    this.physics.add.collider(player, meuble);
    this.physics.add.collider(player, mur);

    player.setCollideWorldBounds(true);

    this.tachesUI = new TachesUI(this);

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

    /***************************
     *  TOUCHE E
     ****************************/
    this.input.keyboard.on("keydown-E", () => {
      if (this.codeUI.visible) return; // pavé ouvert

      if (this.monologue) {
        this.avancerMonologue();
        return;
      }

      // ramassage de la photo / du bracelet
      if (
        (this.photo && this.photo.tenterRamassage(player)) ||
        (this.bracelet && this.bracelet.tenterRamassage(player))
      ) {
        return;
      }

      const PERIMETRE = 70;
      const dist = (o) => Phaser.Math.Distance.Between(player.x, player.y, o.x, o.y);

      // la porte secrète (une fois la bibliothèque déplacée)
      if (this.porteOuverte && dist(this.porteSecrete) < PERIMETRE) {
        this.scene.start("victor_secret");
        return;
      }

      // le bureau -> la brosse à cheveux
      if (dist(this.bureau) < PERIMETRE) {
        if (!this.registry.get("victor_brosse_prise")) {
          this.prendreBrosse();
        } else {
          afficherMessage(this, "Il n'y a plus rien d'utile dans ce bureau.", 3000);
        }
        return;
      }

      // la bibliothèque -> le pavé de code
      if (!this.porteOuverte && dist(this.bibliotheque) < PERIMETRE) {
        this.codeUI.ouvrir();
        return;
      }
    });

    // MONOLOGUE D'ARRIVÉE (une seule fois)
    if (!this.registry.get("victor_maison_intro_joue")) {
      this.lancerMonologue(introMonologue, () => {
        this.registry.set("victor_maison_intro_joue", true);
      });
    }
  }

  update() {
    if (this.codeUI.visible || this.monologue) {
      player.setVelocity(0, 0);
      player.anims.play("turn");
      this.indiceBureau.setVisible(false);
      this.indiceBibliotheque.setVisible(false);
      this.indicePorte.setVisible(false);
      return;
    }

    if (this.photo) this.photo.update(player);
    if (this.bracelet) this.bracelet.update(player);

    const dist = (o) => Phaser.Math.Distance.Between(player.x, player.y, o.x, o.y);
    this.indiceBureau.setVisible(!this.registry.get("victor_brosse_prise") && dist(this.bureau) < 70);
    this.indiceBibliotheque.setVisible(!this.porteOuverte && dist(this.bibliotheque) < 70);
    this.indicePorte.setVisible(this.porteOuverte && dist(this.porteSecrete) < 70);

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
  prendreBrosse() {
    this.registry.set("victor_brosse_prise", true);
    ajouterObjet(
      this,
      "brosse",
      "Brosse à cheveux",
      `Une brosse à cheveux. Un chiffre est gravé sur le manche : ${NUM_BROSSE}.`
    );
    afficherMessage(this, "Brosse à cheveux récupérée", 4000);
    this.lancerMonologue(monologueBrosse);
  }

  // Code juste : la bibliothèque glisse et révèle la porte
  ouvrirBibliotheque() {
    this.porteOuverte = true;
    this.registry.set("victor_porte_ouverte", true);
    afficherMessage(this, "La bibliothèque a bougé : un passage est apparu.", 4000);

    this.tweens.add({
      targets: this.bibliotheque,
      x: this.bibliotheque.x + 120,
      duration: 800,
      ease: "Cubic.easeInOut",
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