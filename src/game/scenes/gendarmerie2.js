import * as Phaser from "phaser";
import { InventaireUI, ObjetRamassable, afficherMessage } from "./inventaire.js";
import { CarteUI } from "./carte.js";
import { TachesUI, ajouterTache, ajouterTaches, terminerTache, tachesToutesTerminees, estTacheTerminee } from "./taches.js";
import { DialogueUI } from "./dialogue.js";
import { OrdinateurUI } from "./ordinateur.js";


var player;
var groupe_plateformes;
var clavier;
var cursors;
var telephone;

/* ============================================================
 *  TEXTES
 * ============================================================ */
var introMonologue = [
  { texte: "Violette : Me voilà chez moi... Je ne sais plus quoi faire.", moi: "moi_triste", perso: false },
  { texte: "Violette : Même avec un non-lieu, personne ne veut me croire... Je n'ai plus personne.", moi: "moi_triste", perso: false },
  { texte: "Violette : Non Violette il ne faut pas désespérer ! Je suis la meilleure journaliste !", moi: "moi_colere", perso: false },
  { texte: "Violette : Je vais réussir à m'innocenter et à trouver le vrai coupable de ce meurtre.", moi: "moi_colere", perso: false },
  { texte: "Violette : Pour ça il faut d'abord que je trouve des indices pour mieux comprendre l'histoire.", moi: "moi_heureuse", perso: false },
  // NOUVEAU : pousse le joueur vers le téléphone
  { texte: "Violette : Tiens, mon téléphone vient de vibrer... Il est là-bas, je devrais regarder.", moi: "moi_triste", perso: false },
];

// NOUVEAU : monologue joué quand on ferme le téléphone
var monologueTelephone = [
  { texte: "Violette : Ces messages sont bizarres... À qui devait-il donner quelque chose ?", moi: "moi_triste", perso: false },
  { texte: "Violette : L'adresse indique le bar à côté de chez moi. Il faut que j'y aille.", moi: "moi_colere", perso: false },
  { texte: "Violette : Mais avant ça, il me faut la carte pour me repérer, et mon sac pour garder certains objets.", moi: "moi_heureuse", perso: false },
];

var monologueApresOrdinateur = [
  { texte: "Violette : J'entends du bruit dans les couloirs... Il faut que j'aille voir ce qu'il se passe.", moi: "moi_triste", perso: false },
];

// NOUVEAU : monologue joué quand sac + carte sont récupérés
var monologueDepart = [
  { texte: "Violette : Maintenant je suis prête, allons au bar !", moi: "moi_heureuse", perso: false },
];

// NOUVEAU : clés du registry (mémoire du jeu, survit aux changements de scène)
const CLE_INTRO = "intro_gendarmerie2_joue";
const CLE_TEL = "telephone_consulte_gendarmerie2";

export default class gendarmerie2 extends Phaser.Scene {
  constructor() {
    super({ key: "gendarmerie2" });
  }

  preload() {}

  create(data) {

        if (!this.sound.get("musique_gendarmerie")) {
      this.sound.play("musique_gendarmerie", { loop: true, volume: 0.2 });
    }
    // NOUVEAU : état du monologue en cours (null = aucun)
    this.monologue = null;
    this.departProgramme = false;
        this.dialogueUI = new DialogueUI(this, {
      moiParDefaut: "moi_heureuse",
      persoParDefaut: "perso_triste",
    });

    this.inventaireUI = new InventaireUI(this);

    const carteDuNiveau = this.add.tilemap("carte1");
    this.carteUI = new CarteUI(this);
    this.tachesUI = new TachesUI(this);




    /* ============================================================
     *  SAC + CARTE
     *  Ils sont toujours là, mais ne sont ramassables (et n'affichent
     *  leur "E") qu'après avoir consulté le téléphone -> voir update()
     *  et le keydown-E.
     * ============================================================ */
    this.sacAMain = new ObjetRamassable(
      this, 250, 450, "sac_a_main", "Sac à main",
      "Un sac à main abandonné. Il pourrait servir à ranger des objets utiles à l'enquête.",
      {
        taille: 40,
        message: "Sac à main récupéré",
        perimetre: 60,
        ajouterAInventaire: false,
        cleDejaRamasse: "inventaire_debloque",
        onRamasse: () => {
          this.inventaireUI.debloquer();
          afficherMessage(this, "Vous avez maintenant un inventaire !", 5000);
          terminerTache(this, "recuperer_sac"); // NOUVEAU
          this.verifierPreparatifs(); // NOUVEAU
        },
      }
    );

    this.carteObjet = new ObjetRamassable(
      this, 600, 450, "carte2", "Carte",
      "Une carte de la ville et de ses environs.",
      {
        taille: 40,
        message: "Carte récupérée",
        perimetre: 60,
        ajouterAInventaire: false,
        cleDejaRamasse: "carte_debloquee",
        onRamasse: () => {
          this.carteUI.debloquer();
          afficherMessage(
            this,
            "Vous pouvez maintenant utiliser la carte pour aller dans les endroits déjà explorés.",
            5000
          );
          terminerTache(this, "recuperer_carte"); // NOUVEAU
          this.verifierPreparatifs(); // NOUVEAU
        },
      }
    );

    this.ordinateurUI = new OrdinateurUI(this, {
  videos: [
    { nomAffiche: "video-541-06-09-2026-10:20", cle: "video_surveillance1" },
    { nomAffiche: "video-233-06-09-2026-14:47", cle: "video_surveillance2" },
    { nomAffiche: "video-089-06-09-2026-23:05", cle: "video_surveillance3" },
  ],
});

    // tuiles
    const tileset = carteDuNiveau.addTilesetImage("sprite_police", "Phaser_tuilesdejeu1");
    carteDuNiveau.createLayer("background", tileset);
    carteDuNiveau.createLayer("sol", tileset);
    const murs_porteurs = carteDuNiveau.createLayer("murs_porteurs", tileset);
    const cloison = carteDuNiveau.createLayer("cloison", tileset);
    carteDuNiveau.createLayer("tapis", tileset);
    const meuble = carteDuNiveau.createLayer("meuble", tileset);
    carteDuNiveau.createLayer("deco_meuble", tileset);
    const deco = carteDuNiveau.createLayer("deco", tileset);

    /***************************
     *  CREATION DES OBJETS *
     ****************************/
    groupe_plateformes = this.physics.add.staticGroup();
    player = this.physics.add.sprite(350, 500, "img_perso");
    telephone = this.physics.add.sprite(530, 400, "telephone");
    telephone.setScale(0.03);
    this.telephone = telephone;

    // NOUVEAU : la lettre "E" au-dessus du téléphone
    this.indiceTelephone = this.add
      .text(telephone.x, telephone.y - 22, "E", {
        font: "bold 16px Arial",
        color: "#ffffff",
        backgroundColor: "#000000",
        padding: { x: 7, y: 3 },
      })
      .setOrigin(0.5)
      .setDepth(50)
      .setVisible(false);

            this.ordinateur = this.physics.add.staticSprite(150, 350, "ordinateur");
    this.ordinateur.setScale(0.1);

    this.ordinateurEtaitOuvert = false;

// le "E" au-dessus de l'ordinateur (visible seulement quand il est utilisable)
this.indiceOrdinateur = this.add
  .text(this.ordinateur.x, this.ordinateur.y - this.ordinateur.displayHeight / 2 - 12, "E", {
    font: "bold 16px Arial",
    color: "#ffffff",
    backgroundColor: "#000000",
    padding: { x: 7, y: 3 },
  })
  .setOrigin(0.5)
  .setDepth(50)
  .setVisible(false);

    this.porte_ville = this.physics.add.staticSprite(300, 570, "img_porte1").setAlpha(0);
    this.porte_ville1 = this.physics.add.staticSprite(350, 570, "img_porte1").setAlpha(0);
    this.porte_ville2 = this.physics.add.staticSprite(400, 570, "img_porte1").setAlpha(0);
    this.porte_ville3 = this.physics.add.staticSprite(450, 570, "img_porte1").setAlpha(0);

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
    this.physics.add.collider(player, groupe_plateformes);

    player.setCollideWorldBounds(true);

    /***************************
     *  TOUCHE E
     ****************************/
    this.input.keyboard.on("keydown-E", () => {
      // téléphone ouvert (scène en pause) -> on ignore
      if (this.scene.isPaused()) return;
      if (this.ordinateurUI.visible) return;


      // NOUVEAU : un monologue en cours est prioritaire sur tout
      if (this.monologue) {
        this.avancerMonologue();
        return;
      }

      const distOrd = Phaser.Math.Distance.Between(player.x, player.y, this.ordinateur.x, this.ordinateur.y);
if (distOrd < 60) {
  if (this.ordinateurDebloque()) {
    this.ordinateurUI.ouvrir();
  } else {
    afficherMessage(this, "Je n'ai aucune raison d'allumer mon ordinateur pour l'instant.", 3000);
  }
  return;
}

      const telOk = this.telephoneConsulte();
      const distTel = Phaser.Math.Distance.Between(player.x, player.y, this.telephone.x, this.telephone.y);

      // NOUVEAU : on ne peut ramasser qu'APRÈS avoir consulté le téléphone
      if (telOk && (this.sacAMain.tenterRamassage(player) || this.carteObjet.tenterRamassage(player))) {
        return;
      }

if (distTel < 60) {
  this.scene.launch("Telephone", { sceneParente: "gendarmerie2" });
  this.scene.bringToTop("Telephone");

  // NOUVEAU : quand le téléphone s'arrête, on relance cette scène nous-mêmes
  this.scene.get("Telephone").events.once("shutdown", () => {
    this.scene.resume();
  });

  this.scene.pause();
  return;
}

      // NOUVEAU : petit rappel si le joueur essaie de ramasser trop tôt
      if (!telOk) {
        const pres = (x, y) => Phaser.Math.Distance.Between(player.x, player.y, x, y) < 60;
        if (pres(250, 450) || pres(600, 450)) {
          afficherMessage(this, "Mon téléphone vient de vibrer, je devrais d'abord regarder.", 3000);
        }
      }
    });

    // NOUVEAU : quand le téléphone se ferme, la scène est "resumed"
    this.events.on("resume", this.auRetourDuTelephone, this);
    this.events.once("shutdown", () => {
      this.events.off("resume", this.auRetourDuTelephone, this);
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

    clavier = this.input.keyboard.createCursorKeys();
    cursors = this.input.keyboard.createCursorKeys();

    this.physics.world.setBounds(0, 0, 800, 608);
    this.cameras.main.setBounds(0, 0, 800, 608);
    this.cameras.main.startFollow(player);

    // MONOLOGUE D'INTRODUCTION (une seule fois)
    if (!this.registry.get(CLE_INTRO)) {
      this.lancerMonologue(introMonologue, () => {
        this.registry.set(CLE_INTRO, true);
      });
    }
  }

  update() {
    if (this.scene.isPaused()) return;

    // détecte la fermeture de l'UI de l'ordinateur
const ordinateurOuvert = this.ordinateurUI.visible;
if (this.ordinateurEtaitOuvert && !ordinateurOuvert) {
  this.apresOrdinateur();
}
this.ordinateurEtaitOuvert = ordinateurOuvert;

    // NOUVEAU : pendant un monologue, le joueur est figé
    if (this.monologue) {
      this.indiceOrdinateur.setVisible(false);
      player.setVelocity(0, 0);
      player.anims.play("turn");
      this.indiceTelephone.setVisible(false);
      return;
    }

    const distOrd = Phaser.Math.Distance.Between(player.x, player.y, this.ordinateur.x, this.ordinateur.y);
this.indiceOrdinateur.setVisible(this.ordinateurDebloque() && !ordinateurOuvert && distOrd < 60);

    // NOUVEAU : "E" du téléphone
    const distTel = Phaser.Math.Distance.Between(player.x, player.y, this.telephone.x, this.telephone.y);
    this.indiceTelephone.setVisible(distTel < 60);

    // NOUVEAU : les "E" du sac/carte n'apparaissent qu'après le téléphone
    if (this.telephoneConsulte()) {
      this.sacAMain.update(player);
      this.carteObjet.update(player);
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

    /***************************
     *  PORTES *
     ****************************/
    if (
      this.physics.overlap(player, this.porte_ville) ||
      this.physics.overlap(player, this.porte_ville1) ||
      this.physics.overlap(player, this.porte_ville2) ||
      this.physics.overlap(player, this.porte_ville3)
    ) {
      this.scene.start("gendarmerie");
    }
  }

  /* ============================================================
   *  NOUVEAU : OUTILS
   * ============================================================ */
// L'ordinateur n'est utilisable qu'après avoir parlé à Martin
ordinateurDebloque() {
  return estTacheTerminee(this, "parler_martin");
}

// Appelé quand l'UI de l'ordinateur se ferme
apresOrdinateur() {
  if (estTacheTerminee(this, "voir_videos")) return; // déjà fait : on ne rejoue pas

  ajouterTache(this, "voir_videos", "Regarder les vidéos chez moi"); // sans effet si elle existe déjà
  terminerTache(this, "voir_videos");

  this.lancerMonologue(monologueApresOrdinateur, () => {
    this.scene.start("accueil");
  });
}
  telephoneConsulte() {
    return this.registry.get(CLE_TEL) || false;
  }

  // Lance un monologue : "lignes" = tableau de répliques, "onFin" = appelé après la dernière
  lancerMonologue(lignes, onFin) {
    this.monologue = { lignes, index: 1, onFin };
    this.dialogueUI.afficherLigne(lignes[0]);
  }

  // Appelé à chaque appui sur E pendant un monologue
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

  // Appelé quand le téléphone se ferme
  auRetourDuTelephone() {
    if (this.telephoneConsulte()) return; // déjà fait : on ne rejoue pas

    this.registry.set(CLE_TEL, true);
    this.lancerMonologue(monologueTelephone, () => {
      ajouterTaches(this, [
        { id: "recuperer_sac", texte: "Récupérer le sac" },
        { id: "recuperer_carte", texte: "Récupérer la carte" },
      ]);
    });
  }

  // Appelé après chaque ramassage : si sac ET carte sont pris -> départ pour le bar
  verifierPreparatifs() {
    if (this.departProgramme) return;
    if (!tachesToutesTerminees(this, ["recuperer_sac", "recuperer_carte"])) return;

    this.departProgramme = true;
    // petit délai pour laisser le message "récupéré" s'afficher
    this.time.delayedCall(1200, () => {
      this.lancerMonologue(monologueDepart, () => {
        this.scene.start("gendarmerie3");
      });
    });
  }
}