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
var telephone2;


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

// NOUVEAU : ce monologue sert maintenant à DEUX moments : (1) la première
// fois que le téléphone se met à vibrer après l'enquête sur Grégoire (voir
// CLE_APPEL_VICTOR_SONNE), et (2) une seconde fois après la conversation
// avec Marguerite, où il redonne la main au système déjà existant
// (CLE_MONO_TEL2 / CLE_VICTOR_RECU / "regarder_telephone").
var monologueTelephoneSonne = [
  { texte: "Violette : Mon téléphone sonne... J'ai dû recevoir un message.", moi: "moi_triste", perso: false },
  { texte: "Violette : C'est vrai j'ai oublié mon téléphone ici...", moi: "moi_triste", perso: false },
];

var monologueApresMessageVictor = [
  { texte: "Violette : Oui, il a raison... Ça me ferait du bien d'aller le voir.", moi: "moi_heureuse", perso: false },
  { texte: "Violette : Il a toujours les bons mots pour me faire aller mieux.", moi: "moi_heureuse", perso: false },
];

// NOUVEAU : l'appel téléphonique de Victor, juste après que Violette ait fini
// d'enquêter sur Grégoire. Pas de portrait pour Victor -> on ne le voit pas,
// on l'entend seulement (perso: false sur toutes les lignes).
var dialogueAppelVictor = [
  { texte: "Victor : Violette ? Je ne te réveille pas ?", moi: "moi_triste", perso: false },
  { texte: "Violette : Non. Je ne dormais pas.", moi: "moi_triste", perso: false },
  { texte: "Victor : Tu es à la maison ? (un temps) Bien. Je préfère savoir que tu es chez toi.", moi: "moi_triste", perso: false },
  { texte: "Violette : Victor, je vais bien.", moi: "moi_colere", perso: false },
  { texte: "Victor : Je sais. Mais je m'inquiète. Alors, tu as vu du monde ?", moi: "moi_colere", perso: false },
  { texte: "Violette : Martin. Il m'a parlé de la voiture d'Adrien.", moi: "moi_triste", perso: false },
  { texte: "Victor : Ses freins, oui. Il m'en avait parlé aussi, qu'ils grinçaient.", moi: "moi_triste", perso: false },
  { texte: "Violette : Et il y a Grégoire. Il devait de l'argent à Adrien.", moi: "moi_colere", perso: false },
  { texte: "Victor : L'argent, ça rend les gens capables de beaucoup de choses. Et puis il y a Jessica.", moi: "moi_colere", perso: false },
  { texte: "Violette : Jessica ?", moi: "moi_triste", perso: false },
  { texte: "Victor : Elle l'aimait, Violette. Tout le monde le voyait, sauf toi. Une femme comme ça n'accepte pas de perdre.", moi: "moi_triste", perso: false },
  { texte: "Violette : Tu penses vraiment que…", moi: "moi_colere", perso: false },
  { texte: "Victor : Je ne pense rien. Je te dis de faire attention. Je suis là, tu sais. Toujours.", moi: "moi_colere", perso: false },
  { texte: "Violette : Merci, Victor.", moi: "moi_heureuse", perso: false },
  { texte: "Victor : Dors un peu.", moi: "moi_heureuse", perso: false },
];

// NOUVEAU : la conversation avec Marguerite, de retour à l'appartement pour
// cette étape de l'enquête (distincte du dialogue de départ pour le bar
// ci-dessous, qui reste inchangé).
var dialogueMargueriteRevelation = [
  { texte: "Marguerite : Tu n'as pas dormi. Encore.", moi: "moi_triste", perso: "perso_triste" },
  {
    texte: "Violette : Grégoire mentait pour une autre raison. Jessica aimait Adrien. Et quelqu'un a touché à la voiture d'Adrien.",
    moi: "moi_colere",
    perso: "perso_triste",
  },
  { texte: "Marguerite : Et tu en es où ?", moi: "moi_colere", perso: "perso_triste" },
  {
    texte: "Violette : Quelqu'un de proche. Quelqu'un qu'il laissait entrer. Quelqu'un qui savait où nous trouver.",
    moi: "moi_colere",
    perso: "perso_colere",
  },
  {
    texte: "Marguerite : Je ne dis pas que je sais. Je dis que moi, j'aurais regardé qui savait toujours où tu étais.",
    moi: "moi_triste",
    perso: "perso_colere",
  },
  { texte: "Violette : Marguerite…", moi: "moi_triste", perso: "perso_colere" },
  { texte: "Marguerite : Je ne te dis rien d'autre. Tu ne m'écouterais pas.", moi: "moi_colere", perso: "perso_triste" },
];

// NOUVEAU : le dialogue avec Marguerite, la coloc qui rentre des courses juste
// avant que Violette ne parte. "moi" = portrait de Violette, "perso" = portrait
// de Marguerite (perso_triste / perso_heureuse / perso_colere).
var dialogueMarguerite = [
  { texte: "Marguerite : Tu sors ? À cette heure-ci ?", moi: "moi_triste", perso: "perso_triste" },
  { texte: "Violette : Je vais voir quelqu'un. Adrien avait laissé des notes. Je veux comprendre.", moi: "moi_colere", perso: "perso_triste" },
  { texte: "Marguerite : Tu en as parlé à quelqu'un ? À Victor, par exemple ?", moi: "moi_colere", perso: "perso_triste" },
  { texte: "Violette : Pas encore. Pourquoi ?", moi: "moi_triste", perso: "perso_triste" },
  { texte: "Marguerite : Parce que je ne l'aime pas, Violette. Je ne l'ai jamais aimé.", moi: "moi_triste", perso: "perso_colere" },
  { texte: "Violette : (elle rit) Marguerite...", moi: "moi_heureuse", perso: "perso_colere" },
  { texte: "Marguerite : Je suis sérieuse. Il y a quelque chose chez lui qui cloche.", moi: "moi_heureuse", perso: "perso_colere" },
  { texte: "Violette : Tu dis ça parce qu'il t'a dit non.", moi: "moi_colere", perso: "perso_colere" },
  { texte: "Marguerite : Ça n'a rien à voir avec ça.", moi: "moi_colere", perso: "perso_colere" },
  {
    texte: "Violette : Bien sûr que si. Tu lui as fait des avances, il t'a repoussée, et depuis tu lui trouves tous les défauts.",
    moi: "moi_colere",
    perso: "perso_colere",
  },
  { texte: "Marguerite : Il te regarde comme s'il t'attendait. Tu ne l'as jamais remarqué ?", moi: "moi_triste", perso: "perso_triste" },
  {
    texte: "Violette : C'est le meilleur ami d'Adrien. Il m'a soutenue quand tout le monde me tournait le dos.",
    moi: "moi_colere",
    perso: "perso_triste",
  },
  { texte: "Marguerite : (un temps) D'accord. Laisse tomber. Fais attention à toi.", moi: "moi_triste", perso: "perso_triste" },
  { texte: "Violette : Bon, je vais au bar. Je ferai attention à moi, promis. Bisous, on se voit plus tard !", moi: "moi_heureuse", perso: "perso_heureuse" },
];

// NOUVEAU : clés du registry (mémoire du jeu, survit aux changements de scène)
const CLE_INTRO = "intro_gendarmerie2_joue";
const CLE_TEL = "telephone_consulte_gendarmerie2";

const CLE_MONO_TEL2 = "monologue_telephone_sonne_gendarmerie2";

const CLE_VICTOR_RECU = "victor_message_recu"; // Mon_Telephone affiche le message de Victor
const CLE_VICTOR_LU = "victor_message_lu";     // posée par Mon_Telephone quand on ouvre la conversation

// NOUVEAU : l'appel de Victor après l'enquête sur Grégoire
const CLE_APPEL_VICTOR_SONNE = "telephone2_sonne_victor"; // le téléphone vibre, en attente de réponse
const CLE_APPEL_VICTOR_FAIT = "appel_victor_decouvrir_secret_fait"; // l'appel a été décroché

// NOUVEAU : ces 2 clés sont partagées avec hall.js -> elles doivent être
// identiques dans les deux fichiers.
const CLE_JESSICA_OBJECTIF = "objectif_parler_jessica_actif";
const CLE_MARGUERITE_OBJECTIF = "objectif_parler_marguerite_actif";


export default class maison extends Phaser.Scene {
  constructor() {
    super({ key: "maison" });
  }

  preload() {}

  create(data) {

        if (!this.sound.get("musique_gendarmerie")) {
      this.sound.play("musique_gendarmerie", { loop: true, volume: 0.2 });
    }
    // NOUVEAU : état du monologue en cours (null = aucun)
    this.monologue = null;
    this.departProgramme = false;
    // NOUVEAU : état de la vue "photo en grand"
    this.photoOuverte = false;
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
      this, 250, 240, "sac_a_main", "Sac à main",
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
      this, 540, 190, "carte2", "Carte",
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
    const tileset = carteDuNiveau.addTilesetImage("sprite_maison", "Phaser_tuilesdejeu1");
    carteDuNiveau.createLayer("sol", tileset);
    const dehors = carteDuNiveau.createLayer("dehors", tileset);
    const mur = carteDuNiveau.createLayer("mur", tileset);
    carteDuNiveau.createLayer("mur_2d", tileset);
    const Sol_et_objet_sur_le_mur = carteDuNiveau.createLayer("Sol_et_objet_sur_le_mur", tileset);
    carteDuNiveau.createLayer("boiserie_mur_fond", tileset);
    const mur_et_meuble = carteDuNiveau.createLayer("mur_et_meuble", tileset);
    const meuble_cuisine = carteDuNiveau.createLayer("meuble_cuisine", tileset);
    const meuble_salon_chambre_et_douche = carteDuNiveau.createLayer("meuble_salon_chambre_et_douche", tileset);
    const meuble = carteDuNiveau.createLayer("meuble", tileset);
    const paillasson = carteDuNiveau.createLayer("paillasson", tileset);
    const etalonnage_chaud = carteDuNiveau.createLayer("etalonnage_chaud", tileset);
    const vignette = carteDuNiveau.createLayer("vignette", tileset);


    /***************************
     *  CREATION DES OBJETS *
     ****************************/
    groupe_plateformes = this.physics.add.staticGroup();
    player = this.physics.add.sprite(450, 530, "img_perso");
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


          telephone2 = this.physics.add.sprite(250, 430, "telephone");
    telephone2.setScale(0.03);
    this.telephone2 = telephone2;

    // NOUVEAU : la lettre "E" au-dessus du téléphone
    this.indiceTelephone1 = this.add
      .text(telephone2.x, telephone2.y - 22, "E", {
        font: "bold 16px Arial",
        color: "#ffffff",
        backgroundColor: "#000000",
        padding: { x: 7, y: 3 },
      })
      .setOrigin(0.5)
      .setDepth(50)
      .setVisible(false);

    // NOUVEAU : l'appel de Victor -> si le téléphone sonnait déjà avant de
    // quitter la scène (et qu'on n'a toujours pas répondu), la vibration
    // reprend automatiquement.
    this.tweenVibrationTelephone2 = null;
    this.sonVibration = null;
    if (this.appelVictorEnCours()) {
      this.demarrerVibrationTelephone2();
    }

            this.ordinateur = this.physics.add.staticSprite(300, 350, "ordinateur");
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

    // ============================================================
    //  NOUVEAU : LE CADRE PHOTO (Adrien, Violette et Victor)
    //  Purement optionnel pour le joueur -> pas de tâche, pas d'inventaire,
    //  juste une image en grand à regarder, fermée par une croix.
    // ============================================================
    this.cadrePhoto = this.physics.add.staticSprite(150, 300, "image_letrio"); // NOUVEAU : ajuste la position sur le mur
    this.cadrePhoto.setDisplaySize(36, 26); // petit cadre, comme accroché au mur

    this.indiceCadrePhoto = this.add
      .text(this.cadrePhoto.x, this.cadrePhoto.y - 22, "E", {
        font: "bold 16px Arial",
        color: "#ffffff",
        backgroundColor: "#000000",
        padding: { x: 7, y: 3 },
      })
      .setOrigin(0.5)
      .setDepth(50)
      .setVisible(false);

    // ============================================================
    //  NOUVEAU : MARGUERITE, DE RETOUR À L'APPARTEMENT
    //  Apparaît une fois l'enquête sur Grégoire terminée (distincte du
    //  dialogue de départ pour le bar, géré par fairearriverMarguerite()
    //  plus bas, qui reste inchangé).
    // ============================================================
    this.margueriteDisponible = estTacheTerminee(this, "decouvrir_secret");
    if (this.margueriteDisponible) {
      const textureMargueriteMaison = this.textures.exists("marguerite") ? "marguerite" : "img_perso2";
      // NOUVEAU : ajuste la position selon ton plan de l'appartement
      this.margueriteMaison = this.physics.add.sprite(350, 300, textureMargueriteMaison);

      this.indiceMarguerite = this.add
        .text(this.margueriteMaison.x, this.margueriteMaison.y - 26, "E", {
          font: "bold 16px Arial",
          color: "#ffffff",
          backgroundColor: "#000000",
          padding: { x: 7, y: 3 },
        })
        .setOrigin(0.5)
        .setDepth(50)
        .setVisible(false);
    }


    /***************************
     *  COLLISIONS *
     ****************************/
    dehors.setCollisionByProperty({ estSolide: true });
    meuble.setCollisionByProperty({ estSolide: true });
    mur.setCollisionByProperty({ estSolide: true });
    Sol_et_objet_sur_le_mur.setCollisionByProperty({ estSolide: true });
    mur_et_meuble.setCollisionByProperty({ estSolide: true });
    meuble_cuisine.setCollisionByProperty({ estSolide: true });
    meuble_salon_chambre_et_douche.setCollisionByProperty({ estSolide: true });
    paillasson.setCollisionByProperty({ estSolide: true });
    etalonnage_chaud.setCollisionByProperty({ estSolide: true });
    vignette.setCollisionByProperty({ estSolide: true });


    this.physics.add.collider(player, dehors);
    this.physics.add.collider(player, meuble);
    this.physics.add.collider(player, Sol_et_objet_sur_le_mur);
    this.physics.add.collider(player, mur);
    this.physics.add.collider(player, mur_et_meuble);
    this.physics.add.collider(player, meuble_cuisine);
    this.physics.add.collider(player, meuble_salon_chambre_et_douche);
    this.physics.add.collider(player, paillasson);
    this.physics.add.collider(player, etalonnage_chaud);
    this.physics.add.collider(player, vignette);

    player.setCollideWorldBounds(true);

    /***************************
     *  TOUCHE E
     ****************************/
    this.input.keyboard.on("keydown-E", () => {
      // téléphone ouvert (scène en pause) -> on ignore
      if (this.scene.isPaused()) return;
      if (this.ordinateurUI.visible) return;
      // NOUVEAU : si la photo est affichée en grand, E ne fait rien
      // (seule la croix la referme)
      if (this.photoOuverte) return;


      // NOUVEAU : un monologue en cours est prioritaire sur tout
      if (this.monologue) {
        this.avancerMonologue();
        return;
      }

      // NOUVEAU : le cadre photo -> complètement optionnel, juste une vue en grand
      const distPhoto = Phaser.Math.Distance.Between(player.x, player.y, this.cadrePhoto.x, this.cadrePhoto.y);
      if (distPhoto < 60) {
        this.afficherCadrePhoto();
        return;
      }

      // NOUVEAU : Marguerite, de retour à l'appartement
      if (this.margueriteDisponible && this.margueriteMaison) {
        const distMarguerite = Phaser.Math.Distance.Between(player.x, player.y, this.margueriteMaison.x, this.margueriteMaison.y);
        if (distMarguerite < 100) {
          this.parlerAMarguerite();
          return;
        }
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
const distTel2 = Phaser.Math.Distance.Between(player.x, player.y, this.telephone2.x, this.telephone2.y);

// on ne peut ramasser qu'APRÈS avoir consulté le premier téléphone
if (telOk && (this.sacAMain.tenterRamassage(player) || this.carteObjet.tenterRamassage(player))) {
  return;
}

if (distTel < 60) {
  this.ouvrirTelephone("Telephone");
  return;
}

if (distTel2 < 60) {
  // NOUVEAU : si l'appel de Victor est en train de sonner, on décroche au
  // lieu d'ouvrir l'écran "mon_telephone" habituel
  if (this.appelVictorEnCours()) {
    this.repondreAppelVictor();
  } else {
    this.ouvrirTelephone("mon_telephone");
  }
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
} else if (
  estTacheTerminee(this, "decouvrir_secret") &&
  !this.registry.get(CLE_APPEL_VICTOR_SONNE) &&
  !this.registry.get(CLE_APPEL_VICTOR_FAIT)
) {
  // NOUVEAU : étape 1 -> Violette réalise que son téléphone vibre, puis il
  // se met vraiment à vibrer (voir telephone2) jusqu'à ce qu'on réponde.
  // NOUVEAU : objectif visible pour le joueur -> "Répondre au téléphone"
  this.lancerMonologue(monologueTelephoneSonne, () => {
    this.registry.set(CLE_APPEL_VICTOR_SONNE, true);
    this.demarrerVibrationTelephone2();
    ajouterTache(this, "repondre_telephone_victor", "Répondre au téléphone");
  });
} else if (estTacheTerminee(this, "parler_marguerite") && !this.registry.get(CLE_MONO_TEL2)) {
  // NOUVEAU : sécurité -> si on a quitté la scène juste après Marguerite
  // sans voir ce monologue, il se rejoue ici (sinon il est déjà déclenché
  // directement par parlerAMarguerite())
  this.lancerMonologue(monologueTelephoneSonne, () => {
    this.registry.set(CLE_MONO_TEL2, true);
    this.registry.set(CLE_VICTOR_RECU, true);
    ajouterTache(this, "regarder_telephone", "Regarder mon téléphone");
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
      this.indiceCadrePhoto.setVisible(false);
      if (this.indiceMarguerite) this.indiceMarguerite.setVisible(false);
      player.setVelocity(0, 0);
      player.anims.play("turn");
      this.indiceTelephone.setVisible(false);
      this.indiceTelephone1.setVisible(false);

      return;
    }

    // NOUVEAU : pendant que la photo est affichée en grand, le joueur est figé aussi
    if (this.photoOuverte) {
      player.setVelocity(0, 0);
      player.anims.play("turn");
      return;
    }

    const distOrd = Phaser.Math.Distance.Between(player.x, player.y, this.ordinateur.x, this.ordinateur.y);
this.indiceOrdinateur.setVisible(this.ordinateurDebloque() && !ordinateurOuvert && distOrd < 60);

    // NOUVEAU : "E" du cadre photo
    const distPhotoMaj = Phaser.Math.Distance.Between(player.x, player.y, this.cadrePhoto.x, this.cadrePhoto.y);
    this.indiceCadrePhoto.setVisible(distPhotoMaj < 60);

    // NOUVEAU : "E" de Marguerite
    if (this.margueriteDisponible && this.margueriteMaison && this.indiceMarguerite) {
      const distMargMaj = Phaser.Math.Distance.Between(player.x, player.y, this.margueriteMaison.x, this.margueriteMaison.y);
      this.indiceMarguerite.setVisible(distMargMaj < 100);
    }

    // NOUVEAU : "E" du téléphone
    const distTel = Phaser.Math.Distance.Between(player.x, player.y, this.telephone.x, this.telephone.y);
    this.indiceTelephone.setVisible(distTel < 60);

     const distTel2 = Phaser.Math.Distance.Between(player.x, player.y, this.telephone2.x, this.telephone2.y);
    this.indiceTelephone1.setVisible(distTel2 < 60);

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


  }

  /* ============================================================
   *  NOUVEAU : LE CADRE PHOTO
   * ============================================================ */
  afficherCadrePhoto() {
    if (this.photoOuverte) return;
    this.photoOuverte = true;

    const largeur = this.cameras.main.width;
    const hauteur = this.cameras.main.height;
    const cx = largeur / 2;
    const cy = hauteur / 2;

    this.vuePhoto = this.add.container(0, 0).setDepth(5000);

    // Voile sombre derrière (pas cliquable pour fermer -> seule la croix ferme,
    // comme demandé)
    const voile = this.add
      .rectangle(cx, cy, largeur, hauteur, 0x000000, 0.85)
      .setScrollFactor(0);
    this.vuePhoto.add(voile);

    // L'image en grand, redimensionnée pour tenir à l'écran sans se déformer
    const image = this.add.image(cx, cy, "image_letrio").setScrollFactor(0);
    const tailleMax = Math.min(largeur * 0.7, hauteur * 0.7);
    const ratio = Math.min(tailleMax / image.width, tailleMax / image.height);
    image.setScale(ratio);
    this.vuePhoto.add(image);

    // Croix pour fermer -> seul moyen de faire disparaître la photo
    const boutonFermer = this.add
      .text(cx + image.displayWidth / 2 + 10, cy - image.displayHeight / 2 - 10, "✕", {
        font: "24px Arial",
        fill: "#ffffff",
        backgroundColor: "#000000",
        padding: { x: 8, y: 4 },
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setInteractive({ useHandCursor: true });
    boutonFermer.on("pointerdown", () => this.fermerCadrePhoto());
    this.vuePhoto.add(boutonFermer);
  }

  fermerCadrePhoto() {
    if (this.vuePhoto) {
      this.vuePhoto.destroy(true);
      this.vuePhoto = null;
    }
    this.photoOuverte = false;
  }

  /* ============================================================
   *  NOUVEAU : L'APPEL TÉLÉPHONIQUE DE VICTOR
   * ============================================================ */

  // Vrai tant que le téléphone sonne et qu'on n'a pas encore décroché
  appelVictorEnCours() {
    return (this.registry.get(CLE_APPEL_VICTOR_SONNE) || false) && !(this.registry.get(CLE_APPEL_VICTOR_FAIT) || false);
  }

  // Fait "vibrer" telephone2 (petit aller-retour en boucle) + son de
  // vibration en boucle si l'asset audio existe déjà
  demarrerVibrationTelephone2() {
    if (this.tweenVibrationTelephone2) return; // déjà en cours

    const xBase = telephone2.x;
    this.tweenVibrationTelephone2 = this.tweens.add({
      targets: telephone2,
      x: xBase + 3,
      duration: 70,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });

    // NOUVEAU : son de vibration en boucle -> branche-le dès que tu as
    // l'asset (ex: this.load.audio("vibration_telephone", "..."))
    if (!this.sonVibration && this.cache.audio.exists("vibration_telephone")) {
      this.sonVibration = this.sound.add("vibration_telephone", { loop: true, volume: 0.4 });
      this.sonVibration.play();
    }
  }

  arreterVibrationTelephone2() {
    if (this.tweenVibrationTelephone2) {
      this.tweenVibrationTelephone2.stop();
      this.tweenVibrationTelephone2 = null;
      telephone2.x = 250; // position de base fixée à la création
    }
    if (this.sonVibration) {
      this.sonVibration.stop();
      this.sonVibration = null;
    }
  }

  // Appelé quand on appuie sur E près de telephone2 pendant qu'il sonne
  repondreAppelVictor() {
    this.arreterVibrationTelephone2();

    const largeur = this.cameras.main.width;
    const hauteur = this.cameras.main.height;

    // NOUVEAU : l'image d'appel avec Victor, affichée pendant toute la
    // conversation (pas de croix -> l'appel se termine tout seul, comme un
    // vrai appel qui raccroche à la fin de la conversation)
    const image = this.add.image(largeur / 2, hauteur / 2, "telephone_victor").setScrollFactor(0).setDepth(900);
    const tailleMax = Math.min(largeur * 0.6, hauteur * 0.6);
    const ratio = Math.min(tailleMax / image.width, tailleMax / image.height);
    image.setScale(ratio);
    this.vueAppelVictor = image;

    this.lancerMonologue(dialogueAppelVictor, () => {
      if (this.vueAppelVictor) {
        this.vueAppelVictor.destroy();
        this.vueAppelVictor = null;
      }
      this.registry.set(CLE_APPEL_VICTOR_FAIT, true);
      // NOUVEAU : objectif "Répondre au téléphone" coché maintenant que l'appel a eu lieu
      ajouterTache(this, "repondre_telephone_victor", "Répondre au téléphone"); // sécurité si pas déjà présente
      terminerTache(this, "repondre_telephone_victor");

      // NOUVEAU : objectif suivant -> aller parler à Jessica (dans hall.js).
      // On ne téléporte pas le joueur : il y va lui-même via la carte.
      this.registry.set(CLE_JESSICA_OBJECTIF, true);
      ajouterTache(this, "parler_jessica", "Parler à Jessica");
    });
  }

  // NOUVEAU : parler à Marguerite, de retour à l'appartement
  parlerAMarguerite() {
    if (estTacheTerminee(this, "parler_marguerite")) {
      afficherMessage(this, "Marguerite : Je t'ai dit tout ce que je savais.", 3000);
      return;
    }

    if (!this.registry.get(CLE_MARGUERITE_OBJECTIF)) {
      // Rien de particulier à se dire pour l'instant (objectif pas encore actif)
      afficherMessage(this, "Marguerite range des affaires sans rien dire de particulier.", 2500);
      return;
    }

    this.lancerMonologue(dialogueMargueriteRevelation, () => {
      terminerTache(this, "parler_marguerite");

      // NOUVEAU : enchaîne directement sur le téléphone qui sonne encore une
      // fois -> puis on retrouve exactement le comportement déjà existant
      // (CLE_MONO_TEL2 / CLE_VICTOR_RECU / "regarder_telephone")
      this.lancerMonologue(monologueTelephoneSonne, () => {
        this.registry.set(CLE_MONO_TEL2, true);
        this.registry.set(CLE_VICTOR_RECU, true);
        ajouterTache(this, "regarder_telephone", "Regarder mon téléphone");
      });
    });
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
    this.scene.start("couloir");
  });
}
  telephoneConsulte() {
    return this.registry.get(CLE_TEL) || false;
  }

  telephoneConsulte2() {
    return this.registry.get(CLE_TEL2) || false;
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

ouvrirTelephone(cle) {
  const scenePhone = this.scene.get(cle);
  if (!scenePhone) {
    console.error(`La scène "${cle}" n'est pas enregistrée dans main.js`);
    return;
  }

  this.telephoneOuvert = cle;
  this.scene.launch(cle, { sceneParente: "gendarmerie2" });
  this.scene.bringToTop(cle);
  scenePhone.events.once("shutdown", () => {
    this.scene.resume();
  });
  this.scene.pause();
}

auRetourDuTelephone() {
  const quel = this.telephoneOuvert;
  this.telephoneOuvert = null;

  // Téléphone n°1 : seulement l'intro du début
  if (quel === "Telephone") {
    if (!this.telephoneConsulte()) {
      this.registry.set(CLE_TEL, true);
      this.lancerMonologue(monologueTelephone, () => {
        ajouterTaches(this, [
          { id: "recuperer_sac", texte: "Récupérer le sac" },
          { id: "recuperer_carte", texte: "Récupérer la carte" },
        ]);
      });
    }
    return;
  }

  // mon_telephone : validé seulement si le message de Victor a été ouvert
  if (quel === "mon_telephone") {
    const messageLu = this.registry.get(CLE_VICTOR_LU) || false;
    if (messageLu && !estTacheTerminee(this, "regarder_telephone")) {
      ajouterTache(this, "regarder_telephone", "Regarder mon téléphone"); // sécurité
      terminerTache(this, "regarder_telephone");
      this.lancerMonologue(monologueApresMessageVictor, () => {
        this.scene.start("victor_maison");
      });
    }
  }
}

  // Appelé après chaque ramassage : si sac ET carte sont pris -> on fait
  // arriver Marguerite puis on enchaîne sur leur dialogue (voir plus bas)
  verifierPreparatifs() {
    if (this.departProgramme) return;
    if (!tachesToutesTerminees(this, ["recuperer_sac", "recuperer_carte"])) return;

    this.departProgramme = true;
    // petit délai pour laisser le message "récupéré" s'afficher
    this.time.delayedCall(1200, () => {
      this.fairearriverMarguerite();
    });
  }

  /* ============================================================
   *  NOUVEAU : ARRIVÉE DE MARGUERITE + SON DIALOGUE
   * ============================================================
   *  Sa sprite apparaît en fondu (comme si elle rentrait des courses),
   *  puis le dialogue à deux voix se lance tout seul. À la fin, elle
   *  disparaît et on part pour le bar.
   */
  fairearriverMarguerite() {
    // NOUVEAU : si l'image "marguerite" n'est pas encore chargée, on retombe
    // provisoirement sur img_perso2 pour que la scène ne plante pas.
    const textureMarguerite = this.textures.exists("marguerite") ? "marguerite" : "img_perso2";

    // NOUVEAU : position d'arrivée -> ajuste selon l'entrée de ton appartement
    this.marguerite = this.physics.add.sprite(420, 560, textureMarguerite);
    this.marguerite.setAlpha(0);

    this.tweens.add({
      targets: this.marguerite,
      alpha: 1,
      duration: 600,
      onComplete: () => {
        this.lancerMonologue(dialogueMarguerite, () => {
          // Dialogue terminé -> Marguerite s'efface, on part au bar
          if (this.marguerite) {
            this.marguerite.destroy();
            this.marguerite = null;
          }
          this.scene.start("bar");
        });
      },
    });
  }
}