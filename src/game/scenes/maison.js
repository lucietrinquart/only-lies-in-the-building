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
  { texte: "Marguerite : Tu n'as pas dormi. Encore.", moi: "moi_triste", perso: "marguerite_triste" },
  {
    texte: "Violette : Grégoire mentait pour une autre raison. Jessica aimait Adrien. Et quelqu'un a touché à la voiture d'Adrien.",
    moi: "moi_colere",
    perso: "marguerite_colere",
  },
  { texte: "Marguerite : Et tu en es où ?", moi: "moi_colere", perso: "marguerite_colere" },
  {
    texte: "Violette : Quelqu'un de proche. Quelqu'un qu'il laissait entrer. Quelqu'un qui savait où nous trouver.",
    moi: "moi_colere",
    perso: "marguerite_colere",
  },
  {
    texte: "Marguerite : Je ne dis pas que je sais. Je dis que moi, j'aurais regardé qui savait toujours où tu étais.",
    moi: "moi_triste",
    perso: "marguerite_triste",
  },
  { texte: "Violette : Marguerite…", moi: "moi_triste", perso: "marguerite_triste" },
  { texte: "Marguerite : Je ne te dis rien d'autre. Tu ne m'écouterais pas.", moi: "moi_colere", perso: "marguerite_triste" },
];

// NOUVEAU : le dialogue avec Marguerite, la coloc qui rentre des courses juste
// avant que Violette ne parte. "moi" = portrait de Violette, "perso" = portrait
// de Marguerite (perso_triste / perso_heureuse / perso_colere).
var dialogueMarguerite = [
  { texte: "Marguerite : Tu sors ? À cette heure-ci ?", moi: "moi_triste", perso: "marguerite_triste" },
  { texte: "Violette : Je vais voir quelqu'un. Adrien avait laissé des notes. Je veux comprendre.", moi: "moi_colere", perso: "marguerite_triste" },
  { texte: "Marguerite : Tu en as parlé à quelqu'un ? À Victor, par exemple ?", moi: "moi_colere", perso: "marguerite_triste" },
  { texte: "Violette : Pas encore. Pourquoi ?", moi: "moi_triste", perso: "marguerite_triste" },
  { texte: "Marguerite : Parce que je ne l'aime pas, Violette. Je ne l'ai jamais aimé.", moi: "moi_triste", perso: "marguerite_colere" },
  { texte: "Violette : (elle rit) Marguerite...", moi: "moi_heureuse", perso: "marguerite_colere" },
  { texte: "Marguerite : Je suis sérieuse. Il y a quelque chose chez lui qui cloche.", moi: "moi_heureuse", perso: "marguerite_colere" },
  { texte: "Violette : Tu dis ça parce qu'il t'a dit non.", moi: "moi_colere", perso: "marguerite_colere" },
  { texte: "Marguerite : Ça n'a rien à voir avec ça.", moi: "moi_colere", perso: "marguerite_colere" },
  {
    texte: "Violette : Bien sûr que si. Tu lui as fait des avances, il t'a repoussée, et depuis tu lui trouves tous les défauts.",
    moi: "moi_colere",
    perso: "marguerite_colere",
  },
  { texte: "Marguerite : Il te regarde comme s'il t'attendait. Tu ne l'as jamais remarqué ?", moi: "moi_triste", perso: "marguerite_triste" },
  {
    texte: "Violette : C'est le meilleur ami d'Adrien. Il m'a soutenue quand tout le monde me tournait le dos.",
    moi: "moi_colere",
    perso: "marguerite_triste",
  },
  { texte: "Marguerite : (un temps) D'accord. Laisse tomber. Fais attention à toi.", moi: "moi_triste", perso: "marguerite_triste" },
  { texte: "Violette : Bon, je vais au bar. Je ferai attention à moi, promis. Bisous, on se voit plus tard !", moi: "moi_heureuse", perso: "marguerite_heureuse" },
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

/* ============================================================
 *  MARGUERITE (sprite "pnj_fille") : TOUS LES RÉGLAGES ICI
 *  ------------------------------------------------------------
 *  Frames du spritesheet "pnj_fille" :
 *    0 à 3   : immobile, elle respire (boucle)
 *    4 à 6   : marche vers la droite
 *    7 à 9   : marche vers la gauche
 *    10 à 11 : marche vers le haut
 *    12      : immobile (image fixe)
 *    13 à 14 : marche vers le bas
 * ============================================================ */
const ECHELLE_MARGUERITE = 1; // taille du sprite (1 = taille d'origine)
const VITESSE_MARGUERITE = 110; // pixels par seconde pendant la marche
const DELAI_AVANT_DEPART = 2000; // ms : elle reste immobile après être apparue

// Sens de marche utilisables dans un parcours ("attendre" = pause immobile)
const DIRECTIONS_MARGUERITE = {
  haut: { vx: 0, vy: -1, anim: "marguerite_haut" },
  bas: { vx: 0, vy: 1, anim: "marguerite_bas" },
  gauche: { vx: -1, vy: 0, anim: "marguerite_gauche" },
  droite: { vx: 1, vy: 0, anim: "marguerite_droite" },
  attendre: { vx: 0, vy: 0, anim: "marguerite_idle" },
};

// Parcours de Marguerite selon le DERNIER objet ramassé par le joueur.
//  - depart : où elle apparaît
//  - etapes : liste dans l'ordre, { direction, duree en ms }
// Distance parcourue par étape = VITESSE_MARGUERITE x duree / 1000
// (ex. 60 px/s pendant 3000 ms = 180 px). Parcours provisoires : à adapter.
const PARCOURS_MARGUERITE = {
  // dernier objet = le sac (le joueur est vers 700, 420)
  sac: {
    depart: { x: 800, y: 540 },
    etapes: [
      { direction: "gauche", duree: 400 },
      { direction: "haut", duree: 1000 },
    ],
  },
  // dernier objet = la carte (le joueur est vers 200, 150)
  carte: {
    depart: { x: 800, y: 540 },
    etapes: [
      { direction: "gauche", duree: 3000 },
      { direction: "haut", duree: 1800 },
      { direction: "gauche", duree: 2000 },
      { direction: "haut", duree: 800 },

    ],
  },
};


/* ============================================================
 *  TUTORIELS (sac + carte) : TOUS LES RÉGLAGES ICI
 *  ------------------------------------------------------------
 *  Quand on ramasse le sac, on lance le tuto "sac". Quand on ramasse
 *  la carte, on lance le tuto "carte". Chaque tuto se déroule ainsi :
 *    1) monologue "avant"
 *    2) un rond rouge pulse sur l'icône + une consigne en haut
 *       (le joueur ne peut pas bouger, il doit CLIQUER sur l'icône)
 *    3) le panneau s'ouvre, le joueur le referme
 *    4) monologue "après"
 *  Pour le DERNIER objet ramassé, la petite cinématique de pnj_fille
 *  (Marguerite) ne démarre qu'une fois le tuto terminé.
 * ============================================================ */
const TUTO_COULEUR = 0xff0000; // couleur du rond
const TUTO_RAYON = 40; // rayon du rond autour de l'icône (l'icône fait 55 px)
const TUTO_Y_CONSIGNE = 130; // hauteur du texte de consigne (en haut de l'écran)
const TUTO_DELAI_DEBUT = 900; // ms avant le début du tuto (le temps de lire "récupéré")

const TUTOS = {
  sac: {
    ui: "inventaireUI",
    consigne: "Clique avec ta souris pour ouvrir l'inventaire",
    consigneFermer: "Clique à nouveau sur le sac pour refermer l'inventaire",
    monologueAvant: [
      { texte: "Violette : Maintenant, je peux récupérer des objets !", moi: "moi_heureuse", perso: false },
    ],
    monologueApres: [
      { texte: "Violette : Pour l'instant mon sac est vide, mais il pourra se remplir.", moi: "moi_triste", perso: false },
      {
        texte: "Violette : En cliquant sur un objet dans mon inventaire, j'aurai des informations en plus sur lui. Il faudra que j'essaye quand j'en aurai un.",
        moi: "moi_heureuse",
        perso: false,
      },
    ],
  },
  carte: {
    ui: "carteUI",
    consigne: "Clique avec ta souris sur la carte",
    consigneFermer: "Clique n'importe où pour refermer la carte",
    monologueAvant: [
      { texte: "Violette : Je peux maintenant me déplacer de lieu en lieu !", moi: "moi_heureuse", perso: false },
    ],
    monologueApres: [
      { texte: "Violette : Pour l'instant je n'ai que le point de la maison.", moi: "moi_triste", perso: false },
      {
        texte: "Violette : Mais au fur et à mesure des lieux que je vais rencontrer, des points vont apparaître et je vais pouvoir aller de lieu en lieu.",
        moi: "moi_heureuse",
        perso: false,
      },
    ],
  },
};

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
    this.tutoEnCours = false; // NOUVEAU : vrai pendant un tuto (joueur figé, seule l'icône est cliquable)
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
      this, 700, 420, "sac_a_main", "Sac à main",
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
          // NOUVEAU : tuto du sac, PUIS (si c'est le dernier objet) la cinématique de Marguerite
          this.lancerTuto("sac", () => this.verifierPreparatifs("sac"));
        },
      }
    );

    this.carteObjet = new ObjetRamassable(
      this, 200, 150, "carte2", "Carte",
      "Une carte de la ville et de ses environs.",
      {
        taille: 40,
        message: "Carte récupérée",
        perimetre: 100,
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
          // NOUVEAU : tuto de la carte, PUIS (si c'est le dernier objet) la cinématique de Marguerite
          this.lancerTuto("carte", () => this.verifierPreparatifs("carte"));
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
// Plus loin :
const tileset = carteDuNiveau.addTilesetImage(
  "tileset_32",
  "Phaser_tuilesdejeu1"
);
    carteDuNiveau.createLayer("sol", tileset);
    const careenoir = carteDuNiveau.createLayer("careenoir", tileset);
    const mur = carteDuNiveau.createLayer("mur", tileset);
    carteDuNiveau.createLayer("surlemur", tileset);
    const surlesol = carteDuNiveau.createLayer("surlesol", tileset);
    const chaises = carteDuNiveau.createLayer("chaises", tileset);
    const objet = carteDuNiveau.createLayer("objet", tileset);
    const porte = carteDuNiveau.createLayer("porte", tileset);
    const contourmur = carteDuNiveau.createLayer("contourmur", tileset);
    const surobjet = carteDuNiveau.createLayer("surobjet", tileset);
    const chat = carteDuNiveau.createLayer("chat", tileset);
        const dessous = carteDuNiveau.createLayer("dessous", tileset);
    const dessus = carteDuNiveau.createLayer("dessus", tileset);



    /***************************
     *  CREATION DES OBJETS *
     ****************************/
    groupe_plateformes = this.physics.add.staticGroup();
    player = this.physics.add.sprite(800, 530, "img_perso");
    telephone = this.physics.add.sprite(250, 800, "telephone");
    telephone.setScale(0.03);
    this.telephone = telephone;

// NOUVEAU : animations de Marguerite (sprite "pnj_fille"), réglages en haut du fichier
this.creerAnimationsMarguerite();
this.cinematiqueEnCours = false;


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


          telephone2 = this.physics.add.sprite(300, 530, "telephone");
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

            this.ordinateur = this.physics.add.staticSprite(130, 210, "ordinateur");
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
    this.cadrePhoto = this.physics.add.staticSprite(445, 280, "image_letrio"); // NOUVEAU : ajuste la position sur le mur
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
      // NOUVEAU : Marguerite = sprite "pnj_fille" (animation immobile en boucle)
      // NOUVEAU : ajuste la position selon ton plan de l'appartement
      this.margueriteMaison = this.creerSpriteMarguerite(700, 540);

      this.indiceMarguerite = this.add
        .text(this.margueriteMaison.x, this.margueriteMaison.y - this.margueriteMaison.displayHeight / 2 - 12, "E", {
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


    careenoir.setCollisionByProperty({ estSolide: true });
    surlesol.setCollisionByProperty({ estSolide: true });
    mur.setCollisionByProperty({ estSolide: true });
    chaises.setCollisionByProperty({ estSolide: true });
    objet.setCollisionByProperty({ estSolide: true });
    porte.setCollisionByProperty({ estSolide: true });
    contourmur.setCollisionByProperty({ estSolide: true });
    surobjet.setCollisionByProperty({ estSolide: true });
    chat.setCollisionByProperty({ estSolide: true });



    this.physics.add.collider(player, careenoir);
    this.physics.add.collider(player, mur);
        dessous.setDepth(30);

     // ordre d'affichage : sol/murs (0) < personnages et objets (0-10) < "dessus" (40) < "E" (50) < interfaces (1000+)
dessus.setDepth(40);

    this.physics.add.collider(player, surlesol);
    this.physics.add.collider(player, chaises);
    this.physics.add.collider(player, objet);
    this.physics.add.collider(player, porte);
    this.physics.add.collider(player, contourmur);
    this.physics.add.collider(player, surobjet);
    this.physics.add.collider(player, chat);

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

      // NOUVEAU : pendant la petite cinématique de Marguerite, E ne fait rien
      // (sauf pour faire avancer le dialogue, géré juste au-dessus)
      if (this.cinematiqueEnCours) return;

      // NOUVEAU : pendant un tuto, E ne fait rien (on joue à la souris)
      if (this.tutoEnCours) return;

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

if (distTel < 75) {
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
        const pres = (x, y) => Phaser.Math.Distance.Between(player.x, player.y, x, y) < 100;
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

// Taille réelle de la pièce : 25 x 31 tuiles de 32 px
const LARGEUR_PIECE = 25 * 32; // 800
const HAUTEUR_PIECE = 31 * 32; // 992

this.physics.world.setBounds(0, 0, LARGEUR_PIECE, HAUTEUR_PIECE);
this.cameras.main.setBounds(0, 0, LARGEUR_PIECE, HAUTEUR_PIECE);
this.cameras.main.startFollow(player, true, 0.1, 0.1);
this.cameras.main.roundPixels = true;


    // MONOLOGUE D'INTRODUCTION (une seule fois)
if (!this.registry.get(CLE_INTRO)) {
  this.lancerMonologue(introMonologue, () => {
    this.registry.set(CLE_INTRO, true);
  });
} else if (
  estTacheTerminee(this, "parler_gregoire") &&
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

    // NOUVEAU : pendant un monologue (ou la cinématique de Marguerite), le joueur est figé
    if (this.monologue || this.cinematiqueEnCours || this.tutoEnCours) {
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
    this.indiceTelephone.setVisible(distTel < 75);

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

  /* ============================================================
   *  NOUVEAU : TUTORIELS (sac / carte)
   * ============================================================ */

  // type = "sac" ou "carte" (voir TUTOS en haut du fichier).
  // "apres" est appelé tout à la fin (sert à enchaîner sur Marguerite).
  lancerTuto(type, apres) {
    const cfg = TUTOS[type];
    if (!cfg) {
      if (apres) apres();
      return;
    }

    // le joueur est figé dès maintenant (flèches et E bloqués)
    this.tutoEnCours = true;

    this.time.delayedCall(TUTO_DELAI_DEBUT, () => {
      this.lancerMonologue(cfg.monologueAvant, () => {
        this.montrerIndicationIcone(cfg, () => {
          this.lancerMonologue(cfg.monologueApres, () => {
            this.tutoEnCours = false;
            if (apres) apres();
          });
        });
      });
    });
  }

  // Rond rouge qui pulse sur l'icône + consigne en haut. Attend le clic sur
  // l'icône, puis que le joueur referme le panneau, puis appelle onFin.
  montrerIndicationIcone(cfg, onFin) {
    const ui = this[cfg.ui];
    const icone = ui.icone;
    const largeur = this.cameras.main.width;

    // on bloque l'AUTRE icône pour que le joueur ne clique que sur la bonne
    const autre = cfg.ui === "inventaireUI" ? this.carteUI : this.inventaireUI;
    if (autre && autre.icone && autre.icone.input) autre.icone.input.enabled = false;

    // Le rond rouge (non cliquable : le clic passe à travers jusqu'à l'icône)
    const rond = this.add
      .circle(icone.x, icone.y, TUTO_RAYON, TUTO_COULEUR, 0.18)
      .setStrokeStyle(5, TUTO_COULEUR, 1)
      .setScrollFactor(0)
      .setDepth(2100);
    const tweenRond = this.tweens.add({
      targets: rond,
      scale: 1.3,
      alpha: 0.55,
      duration: 550,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });

    // La consigne, en haut de l'écran (au-dessus de la carte et de l'inventaire)
    const texte = this.add
      .text(largeur / 2, TUTO_Y_CONSIGNE, cfg.consigne, {
        font: "bold 20px Arial",
        color: "#ffffff",
        backgroundColor: "rgba(0, 0, 0, 0.85)",
        padding: { left: 20, right: 20, top: 12, bottom: 12 },
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(3500);

    let ouvertVu = false;
    let attenteFermeture = null;

    const terminer = () => {
      if (attenteFermeture) attenteFermeture.remove();
      if (autre && autre.icone && autre.icone.input) autre.icone.input.enabled = true;
      texte.destroy();
      onFin();
    };

    // Un clic sur l'icône : le panneau s'ouvre (géré par inventaire.js / carte.js)
    const surClic = () => {
      icone.off("pointerdown", surClic);
      tweenRond.stop();
      rond.destroy();
      texte.setText(cfg.consigneFermer);

      // on surveille la fermeture du panneau par le joueur
      attenteFermeture = this.time.addEvent({
        delay: 100,
        loop: true,
        callback: () => {
          if (ui.ouvert) {
            ouvertVu = true;
          } else if (ouvertVu) {
            terminer();
          }
        },
      });
    };
    icone.on("pointerdown", surClic);
  }

  // Appelé après chaque ramassage : si sac ET carte sont pris -> on fait
  // arriver Marguerite puis on enchaîne sur leur dialogue (voir plus bas)
  // "dernierObjet" = "sac" ou "carte" : l'objet qui vient d'être ramassé. Si c'est
  // le dernier des deux, c'est lui qui décide du parcours de Marguerite.
  verifierPreparatifs(dernierObjet) {
    if (this.departProgramme) return;
    if (!tachesToutesTerminees(this, ["recuperer_sac", "recuperer_carte"])) return;

    this.departProgramme = true;
    // petit délai pour laisser le message "récupéré" s'afficher
    this.time.delayedCall(1200, () => {
      this.fairearriverMarguerite(dernierObjet);
    });
  }

  /* ============================================================
   *  NOUVEAU : ARRIVÉE DE MARGUERITE + SON DIALOGUE
   * ============================================================
   *  Sa sprite apparaît en fondu (comme si elle rentrait des courses),
   *  puis le dialogue à deux voix se lance tout seul. À la fin, elle
   *  disparaît et on part pour le bar.
   */
  fairearriverMarguerite(dernierObjet) {
    // Parcours choisi selon le dernier objet ramassé (voir PARCOURS_MARGUERITE)
    const parcours = PARCOURS_MARGUERITE[dernierObjet] || PARCOURS_MARGUERITE.sac;

    // Le joueur est figé pendant toute la cinématique
    this.cinematiqueEnCours = true;

    this.marguerite = this.creerSpriteMarguerite(parcours.depart.x, parcours.depart.y);
    this.marguerite.setAlpha(0);

    // 1) elle apparaît en fondu, 2) immobile (elle respire) pendant DELAI_AVANT_DEPART,
    // 3) elle suit son parcours, 4) elle s'arrête et le dialogue se lance
    this.tweens.add({
      targets: this.marguerite,
      alpha: 1,
      duration: 600,
      onComplete: () => {
        this.time.delayedCall(DELAI_AVANT_DEPART, () => {
          this.jouerParcoursMarguerite(parcours.etapes, 0, () => {
            this.lancerMonologue(dialogueMarguerite, () => {
              // Dialogue terminé -> Marguerite s'efface, on part au bar
              if (this.marguerite) {
                this.marguerite.destroy();
                this.marguerite = null;
              }
              this.scene.start("couloir");
            });
          });
        });
      },
    });
  }

  // Joue les étapes d'un parcours une par une, puis appelle onFin
  jouerParcoursMarguerite(etapes, index, onFin) {
    if (!this.marguerite) return;

    if (index >= etapes.length) {
      // fin du parcours : elle s'arrête et reprend son animation immobile
      this.marguerite.setVelocity(0, 0);
      this.marguerite.anims.play("marguerite_idle", true);
      onFin();
      return;
    }

    const etape = etapes[index];
    const dir = DIRECTIONS_MARGUERITE[etape.direction] || DIRECTIONS_MARGUERITE.attendre;

    this.marguerite.setVelocity(dir.vx * VITESSE_MARGUERITE, dir.vy * VITESSE_MARGUERITE);
    this.marguerite.anims.play(dir.anim, true);

    this.time.delayedCall(etape.duree, () => {
      this.jouerParcoursMarguerite(etapes, index + 1, onFin);
    });
  }

  // Crée un sprite de Marguerite (spritesheet "pnj_fille") avec l'animation immobile
  creerSpriteMarguerite(x, y) {
    const sprite = this.physics.add.sprite(x, y, "pnj_fille");
    sprite.setScale(ECHELLE_MARGUERITE);
    sprite.setDepth(5); // comme le joueur, sous le calque "dessus" (40)
    sprite.setImmovable(true);
    sprite.body.allowGravity = false;
    sprite.anims.play("marguerite_idle", true);
    return sprite;
  }

  // Animations du spritesheet "pnj_fille" (créées une seule fois pour tout le jeu)
  creerAnimationsMarguerite() {
    const creer = (key, start, end, frameRate) => {
      if (this.anims.exists(key)) return;
      this.anims.create({
        key,
        frames: this.anims.generateFrameNumbers("pnj_fille", { start, end }),
        frameRate,
        repeat: -1,
      });
    };

    creer("marguerite_idle", 0, 3, 2); // respire
    creer("marguerite_droite", 4, 6, 6);
    creer("marguerite_gauche", 7, 9, 6);
    creer("marguerite_haut", 10, 11, 4);
    creer("marguerite_fixe", 12, 12, 1); // image fixe (disponible si besoin)
    creer("marguerite_bas", 13, 14, 4);
  }
}