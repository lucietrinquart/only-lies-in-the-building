import * as Phaser from "phaser";
// NOUVEAU : on importe le module d'inventaire (+ ajouterObjet et afficherMessage pour la récompense)
import { InventaireUI, ObjetRamassable, possedeObjet, retirerObjet, ajouterObjet, afficherMessage } from "./inventaire.js";
// NOUVEAU : on importe le module carte
import { CarteUI } from "./carte.js";
// NOUVEAU : on importe le module tâches (+ terminerTache et tachesToutesTerminees pour Shella/Barbar)
import { TachesUI, ajouterTaches, estTacheTerminee, terminerTache, tachesToutesTerminees } from "./taches.js";

import { DialogueUI } from "./dialogue.js";


var player; // désigne le sprite du joueur
var groupe_plateformes; // contient toutes les plateformes
var clavier; // pour la gestion du clavier
var cursors;
var dude2;
var shella;

var exclamation;
var telephone;
var livre;
var bibliotheque;
var dialogueText; // Déclaration de la variable de texte
var interactionActive = false;

// NOUVEAU : monologue d'introduction de Violette en arrivant au bar (une seule
// fois, comme dans gendarmerie2 -> voir CLE_INTRO_CAFET dans create()).
var introMonologueCafet = [
  { texte: "Violette : Me voilà au bar. C'est ici que je vais peut-être trouver des réponses.", moi: "moi_triste", perso: false },
  { texte: "Violette : Il faut que j'aille parler aux gens qui traînent ici, ils savent sûrement quelque chose.", moi: "moi_colere", perso: false },
];

// NOUVEAU : monologue joué une fois qu'on a parlé à Shella ET à Barbar
var monologueVersAccueil = [
  { texte: "Violette : J'en sais assez pour l'instant... Il faut que je retourne à l'accueil pour faire le point.", moi: "moi_heureuse", perso: false },
];

// NOUVEAU : clé du registry pour ne jamais rejouer l'intro de cette scène
const CLE_INTRO_CAFET = "intro_cafet_joue";

var dialogueIndex = 0;
var dialogueIndex2 = 0;
var dialogueIndex3 = 0;


// NOUVEAU : la série de répliques affichée dans LA conversation en cours (Hervet).
// Elle change selon l'état (intro / en attente / récompense / résolu) -> voir obtenirDialogueActuel()
var dialoguesActuels = [];

// NOUVEAU : la série de répliques affichée pour Shella. Contrairement à Hervet,
// elle n'a qu'UNE seule réplique fixe, toujours la même -> voir obtenirDialogueShella()
var dialoguesActuels2 = [];
var dialoguesActuels3 = [];



// NOUVEAU : les 3 tâches qu'Hervet attend, pour vérifier plus tard qu'elles sont TOUTES finies
var idsTachesHervet = ["recuperer_ticket", "parler_gendarme", "recuperer_livre"];

// CORRIGÉ : "moi_hereuse" / "perso_hereuse" -> "moi_heureuse" / "perso_heureuse"
// (il manquait le "u" d'"heureuse" ; vérifie que ça correspond à l'orthographe EXACTE
// de tes clés dans this.load.image(...) du preload global)
var dialogues = [
  {
    texte:
      "Gendarme : Bienvenue, Bianca. Nous avons besoin de vos compétences de détective pour résoudre un meurtre mystérieux à l opéra.",
    moi: "moi_heureuse",
    perso: "perso_triste",
  },
  {
    texte: "Bianca : Un meurtre à l opéra ? Quelle est la situation exacte ?",
    moi: "moi_triste",
    perso: "perso_heureuse",
  },
  {
    texte:
      "Gendarme : Un acteur de l opéra a été retrouvé assassiné, et les circonstances entourant sa mort sont encore inconnues. L incident a semé la panique parmi les artistes, et l opéra est plongé dans le chaos.",
    moi: "moi_colere",
    perso: "perso_colere",
  },
  {
    texte:
      "Bianca : Je vais me rendre à l opéra immédiatement. Je ferai tout ce qui est en mon pouvoir pour résoudre cette affaire.",
    moi: "moi_heureuse",
    perso: "perso_colere",
  },
  {
    texte: "Gendarme : Nous comptons sur vous, Bianca. Soyez prudente et bonne chance.",
    moi: "moi_heureuse",
    perso: "perso_heureuse",
  },
  {
    texte:
      "Gendarme : Je veux bien te donner un indice si tu arrives à m'aider à résoudre cette enquête de meurtre.",
    moi: "moi_heureuse",
    perso: "perso_heureuse",
  },
];

// NOUVEAU : dialogue de Shella -- une SEULE réplique fixe, toujours la même, à
// chaque fois qu'on lui parle (pas de machine à états, pas de tâches, rien à
// faire évoluer). Change juste le texte et les portraits comme tu veux ici.
var dialogueShella = [
  {
    texte: "Violette : Vous connaissiez Adrien ?",
    moi: "moi_hereuse",
    perso: "perso_hereuse",
  },
    {
    texte: "Shella: Tout le monde connaissait Adrien ici.",
    moi: "moi_hereuse",
    perso: "perso_triste",
  },
  {
    texte: "Violette: Je cherche à comprendre ce qui lui est arrivé.",
    moi: "moi_colere",
    perso: "perso_triste",
  },
    {
    texte: "Shella: Vous devriez peut-être demander à Grégoire.",
    moi: "moi_hereuse",
    perso: "perso_colere",
  },
   {
    texte: "Violette: Grégoire ?",
    moi: "moi_colere",
    perso: "perso_triste",
  },
    {
    texte: "Shella: Ils se disputaient beaucoup ces derniers temps.",
    moi: "moi_colere",
    perso: "perso_triste",
  },
      {
    texte: "Shella: Il y avait aussi Victor qui l'accompagné",
    moi: "moi_colere",
    perso: "perso_triste",
  },
     {
    texte: "Violette: Je devrais aller voir Grégoire il doit en savoir plus",
    moi: "moi_colere",
    perso: false,
  },
];

var dialogueGregoire = [
  {
    texte: "Violette : Vous connaissiez Adrien ?",
    moi: "moi_hereuse",
    perso: "perso_hereuse",
  },
    {
    texte: "Barbar: Adrien ? Oui. Je l'ai vu quelques jours avant sa mort.",
    moi: "moi_hereuse",
    perso: "perso_triste",
  },
  {
    texte: "Violette: Avec quelqu'un ?",
    moi: "moi_colere",
    perso: "perso_triste",
  },
    {
    texte: "Barbar: Grégoire.",
    moi: "moi_hereuse",
    perso: "perso_colere",
  },
   {
    texte: "Violette: Qu'est-ce qu'ils se disaient ?",
    moi: "moi_colere",
    perso: "perso_triste",
  },
    {
    texte: "Barbar: Une histoire d'argent.",
    moi: "moi_colere",
    perso: "perso_triste",
  },
      {
    texte: "Violette: Et Victor ?",
    moi: "moi_colere",
    perso: "perso_triste",
  },
     {
    texte: "Barbar: Lui ? Toujours dans les parages.",
    moi: "moi_colere",
    perso: "perso_triste",
  },
   {
    texte: "Barbar: C'était son meilleur ami, après tout.",
    moi: "moi_colere",
    perso: "perso_triste",
  },
  {
    texte: "Violette: Je dois savoir où est ce Grégoire.",
    moi: "moi_hereuse",
    perso: "perso_triste",
  },
  {
    texte: "Barbar: C'est assez simple il est toujours fouré à son travail.",
    moi: "moi_hereuse",
    perso: "perso_triste",
  },
  {
    texte: "Barbar: Il va peut être enfin l'avoir sa foutu augmente maintenant qu'il est mort l'autre",
    moi: "moi_hereuse",
    perso: "perso_triste",
  },
   {
    texte: "Barbar: Cela en arrange certains",
    moi: "moi_hereuse",
    perso: "perso_triste",
  },
  {
    texte: "Violette: C'est bizarre tout ça il faut que je trouve Grégoire pour en savoir plus",
    moi: "moi_hereuse",
    perso: false,
  },
];

export default class cafet extends Phaser.Scene {
  constructor() {
    super({ key: "cafet" }); // mettre le meme nom que le nom de la classe
  }

  preload() {}

  create(data) {
    // CORRECTION : ce compteur n'était jamais initialisé (il valait undefined)
    this.developperCount1 = 0;
    // CORRIGÉ : on lit l'état depuis le registry (survit au changement de scène)
    // au lieu de toujours repartir à false.
    this.bibliothequeOuverte = this.registry.get("cafet_bibliotheque_ouverte") || false;

     const carteDuNiveau = this.add.tilemap("carte3");
            // chargement du jeu de tuiles
    const tileset = carteDuNiveau.addTilesetImage(
            "barthe",
            "Phaser_tuilesdejeu3"
    );

            // chargement du second calque "calque_backgroung"
    const sol= carteDuNiveau.createLayer("sol", tileset);
    const fond= carteDuNiveau.createLayer("fond", tileset);
    const fond2 = carteDuNiveau.createLayer("fond2", tileset);
    const bois = carteDuNiveau.createLayer("bois", tileset);
    const objet4 = carteDuNiveau.createLayer("objet4", tileset);
    const objet5 = carteDuNiveau.createLayer("objet5", tileset);
    const arbre = carteDuNiveau.createLayer("arbre", tileset);
    const interdiction = carteDuNiveau.createLayer("interdiction", tileset);

    arbre.depth=100;

    this.dude2 = this.physics.add.sprite(398, 387, "img_perso2");
    this.shella = this.physics.add.sprite(700, 500, "shella");
    this.gregoire = this.physics.add.sprite(1000, 500, "gregoire");


    // NOUVEAU : état du monologue en cours (null = aucun) + garde-fou pour ne
    // lancer le monologue de fin qu'une seule fois
    this.monologue = null;
    this.departProgramme = false;
    this.departAccueilProgramme = false;
        this.dialogueUI = new DialogueUI(this, {
      moiParDefaut: "moi_heureuse",
      persoParDefaut: "perso_triste",
    });



    fond2.setCollisionByProperty({ estSolide: true });
    objet4.setCollisionByProperty({ estSolide: true });
    objet5.setCollisionByProperty({ estSolide: true });
    interdiction.setCollisionByProperty({ estSolide: true });




    // création du personnage de jeu et positionnement


            const chat = this.physics.add.staticSprite(552, 325, "chat");

            this.porte = this.physics.add.staticSprite(600, 570, "porte_balthazar");
            this.porte.setScale(0.5);
            this.porte.setAlpha(0);

            this.porte2 = this.physics.add.staticSprite(700, 570, "porte_balthazar");
            this.porte2.setScale(0.5);
            this.porte2.setAlpha(0);

            this.porte3 = this.physics.add.staticSprite(650, 570, "porte_balthazar");
            this.porte3.setScale(0.5);
            this.porte3.setAlpha(0);

            this.porte4 = this.physics.add.staticSprite(750, 570, "porte_balthazar");
            this.porte4.setScale(0.5);
            this.porte4.setAlpha(0);

            this.porte5 = this.physics.add.staticSprite(1000, 100, "porte_balthazar");
            this.porte5.setScale(0.5);

            this.dialogueUI = new DialogueUI(this, {
              moiParDefaut: "moi_heureuse",
              persoParDefaut: "perso_triste",
            });

            this.bibliotheque = this.physics.add.staticSprite(
              this.bibliothequeOuverte ? 1120 : 1000, // CORRIGÉ : si déjà ouverte, on la recrée directement décalée
              100,
              "bibliotheque"
            );
            this.bibliotheque.setScale(0.2);
            player = this.physics.add.sprite(350, 500, "img_perso");


            // ajout du modèle de collision entre le personnage et les plates-formes

            // ajout du modèle de collision entre le personnage et le monde
            player.setCollideWorldBounds(true);
            // Collisions avec les calques de collision
            this.physics.add.collider(player, fond2);
            this.physics.add.collider(player, objet4);
            this.physics.add.collider(player, objet5);
            this.physics.add.collider(player, interdiction);
            this.physics.add.collider(player, chat);




            // animation pour tourner à gauche
            this.anims.create({
            key: "cat",
            frames: this.anims.generateFrameNumbers("chat", { start: 0, end: 3 }),
            frameRate: 2,
            repeat: -1,
            });


            clavier = this.input.keyboard.createCursorKeys();
            chat.anims.play("cat", true);

            // création d'un écouteur sur le clavier
            cursors = this.input.keyboard.createCursorKeys();
            // redimentionnement du monde avec les dimensions calculées via tiled
            this.physics.world.setBounds(0, 0, 1280, 640);
            //  ajout du champs de la caméra de taille identique à celle du monde
            this.cameras.main.setBounds(0, 0, 1280, 640);
            // ancrage de la caméra sur le joueur
            this.cameras.main.startFollow(player);

            

    /* ============================================================
     *  NOUVEAU : L'OBJET À RAMASSER (le ticket)
     * ============================================================ */
    // Place-le où tu veux sur la map (ici près de la table 4, à ajuster)
    this.ticket = new ObjetRamassable(
      this,
      900,            // position x
      480,            // position y
      "ticket", // clé de la texture (voir preload global)
      "Ticket",        // nom affiché dans l'inventaire
      "Un ticket de caisse retrouvé sur la table 4. La date est celle du soir du meurtre.",
      {
        taille: 40,    // taille affichée au sol (en pixels)
        message: "Ticket récupéré",
        perimetre: 60, // distance à laquelle on peut le ramasser
        idTache: "recuperer_ticket", // NOUVEAU : termine cette tâche au ramassage
      }
    );

      // CORRIGÉ : si le livre a déjà été posé dans la bibliothèque, on ne le
      // recrée pas au sol (sinon il "réapparaîtrait" à chaque retour dans cafet)
      this.livre = this.bibliothequeOuverte
        ? null
        : new ObjetRamassable(
            this,
            900,            // position x
            300,            // position y
            "livre", // clé de la texture (voir preload global)
            "Livre",        // nom affiché dans l'inventaire
            "Un livre retrouvé sur la table 4. La date est celle du soir du meurtre.",
            {
              taille: 40,    // taille affichée au sol (en pixels)
              message: "Livre récupéré",
              perimetre: 60, // distance à laquelle on peut le ramasser
              idTache: "recuperer_livre", // NOUVEAU : termine cette tâche au ramassage
            }
          );

    /* ============================================================
     *  NOUVEAU : L'INTERFACE D'INVENTAIRE (icône sac en bas à droite)
     * ============================================================ */
    this.inventaireUI = new InventaireUI(this);

    /* ============================================================
     *  NOUVEAU : L'INTERFACE CARTE (icône à gauche de l'inventaire)
     * ============================================================ */
    this.carteUI = new CarteUI(this);

    /* ============================================================
     *  NOUVEAU : L'INTERFACE DES TÂCHES (liste en haut à droite)
     * ============================================================ */
    this.tachesUI = new TachesUI(this);

                  // PRENDRE LA DISTANCE ENTRE LES EPRSONNAGES POUR ENSUITE LES FAIRE APPARAITRENT AVEC E
                  this.input.keyboard.on("keydown-E", () => {
                    // Si le téléphone est déjà ouvert (scène en pause), on ignore la touche E ici
                    if (this.scene.isPaused()) return;

                    // NOUVEAU : un monologue en cours (intro ou fin d'enquête) est
                    // prioritaire sur TOUT le reste (ramassage, dialogues, etc.)
                    if (this.monologue) {
                      this.avancerMonologue();
                      return;
                    }

                    // NOUVEAU : on tente d'abord de ramasser le ticket.
                    // Si ça marche, on s'arrête là (pas de dialogue en même temps).
                    // CORRIGÉ : this.livre peut être null si le livre a déjà été posé
                    if (this.ticket.tenterRamassage(player) || (this.livre && this.livre.tenterRamassage(player))) return;

                    var distanceDude2 = Phaser.Math.Distance.Between(
                      player.x,
                      player.y,
                      this.dude2.x,
                      this.dude2.y
                    );

                     var distanceShella = Phaser.Math.Distance.Between(
                      player.x,
                      player.y,
                      this.shella.x,
                      this.shella.y
                    );
            

                     var distanceGregoire = Phaser.Math.Distance.Between(
                      player.x,
                      player.y,
                      this.gregoire.x,
                      this.gregoire.y
                    );
            
            
              
                      if (distanceDude2 < 125) {
                        // NOUVEAU : au tout début d'une conversation (dialogueIndex === 0),
                        // on choisit QUELLE série de répliques utiliser selon l'état actuel
                        if (dialogueIndex === 0) {
                          dialoguesActuels = this.obtenirDialogueActuel();
                        }

                        if (dialogueIndex < dialoguesActuels.length) {
                          // NOUVEAU : on affiche la réplique AVEC ses portraits (joueur à gauche, PNJ à droite)
                          this.dialogueUI.afficherLigne(dialoguesActuels[dialogueIndex]);
                          interactionActive = true;
                          dialogueIndex++;
                          this.physics.pause();
                      } else {
                          this.dialogueUI.masquer();
                          dialogueIndex = 0;
                          this.physics.resume();

                          // NOUVEAU : on réagit à la fin de CETTE conversation précise
                          // (ajoute les tâches la 1ère fois, donne la récompense une fois
                          // toutes finies, ou ne fait rien de plus le reste du temps)
                          this.apresDialogueHervet();
                      }
                    }
                     // CORRIGÉ : avant, appelait this.obtenirDialogueActuel() (celui d'HERVET),
                     // ce qui affichait TOUJOURS le dialogue de Dude2/Hervet quand on parlait à
                     // Shella. Elle a maintenant sa propre méthode, séparée et beaucoup plus simple.
                     if (distanceShella < 125) {

                       if (dialogueIndex2 === 0) {
                          dialoguesActuels2 = this.obtenirDialogueShella();
                        }

                        if (dialogueIndex2 < dialoguesActuels2.length) {
                          this.dialogueUI.afficherLigne(dialoguesActuels2[dialogueIndex2]);
                          interactionActive = true;
                          dialogueIndex2++;
                          this.physics.pause();
                      } else {
                          this.dialogueUI.masquer();
                          dialogueIndex2 = 0;
                          this.physics.resume();
                          // NOUVEAU : on marque la tâche "parler à Shella" comme terminée,
                          // puis on vérifie si l'enquête au bar est bouclée (Shella + Barbar)
                          terminerTache(this, "parler_shella");
                          this.verifierEnqueteCafeTerminee();
                      }
                    }

                    if (distanceGregoire < 125) {

                       if (dialogueIndex3 === 0) {
                          dialoguesActuels3 = this.obtenirDialogueGregoire();
                        }

                        if (dialogueIndex3 < dialoguesActuels3.length) {
                          this.dialogueUI.afficherLigne(dialoguesActuels3[dialogueIndex3]);
                          interactionActive = true;
                          dialogueIndex3++;
                          this.physics.pause();
                      } else {
                          this.dialogueUI.masquer();
                          dialogueIndex3 = 0;
                          this.physics.resume();
                          // NOUVEAU : on marque la tâche "parler à Barbar" comme terminée,
                          // puis on vérifie si l'enquête au bar est bouclée (Shella + Barbar)
                          terminerTache(this, "parler_barbar");
                          this.verifierEnqueteCafeTerminee();
                      }
                    }
                  });
                  //POUR GARDER LE DIALOGUE
                  this.input.keyboard.on("keyup-E", () => {});

    // NOUVEAU : MONOLOGUE D'INTRODUCTION DE VIOLETTE (une seule fois, comme
    // dans gendarmerie2) -> à la fermeture, on ajoute les 2 tâches
    if (!this.registry.get(CLE_INTRO_CAFET)) {
      this.lancerMonologue(introMonologueCafet, () => {
        this.registry.set(CLE_INTRO_CAFET, true);
        ajouterTaches(this, [
          { id: "parler_shella", texte: "Aller parler à Shella" },
          { id: "parler_barbar", texte: "Aller parler à Barbar" },
        ]);
      });
    }

        }

            update() {
                // NOUVEAU : pendant un monologue (intro ou fin d'enquête), le joueur est
                // figé, comme dans gendarmerie2 -> on ne traite rien d'autre.
                if (this.monologue) {
                  player.setVelocity(0, 0);
                  player.anims.play("turn");
                  return;
                }

                // NOUVEAU : affiche/cache l'indice "E" au-dessus du ticket
                this.ticket.update(player);
                // CORRIGÉ : this.livre peut être null si le livre a déjà été posé
                if (this.livre) this.livre.update(player);

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
                // Si aucune touche de déplacement n'est enfoncée, arrête le personnage
                player.setVelocityX(0);
                }

                if (
                !cursors.up.isDown &&
                !cursors.down.isDown &&
                !cursors.left.isDown &&
                !cursors.right.isDown
                ) {
                player.anims.play("turn");
                }
                if (Phaser.Input.Keyboard.JustDown(clavier.space) == true ) {
                    // CORRECTION : this.levier3 et this.levier4 n'existent pas dans cette scène.
                    // Les tests ont été retirés pour éviter un plantage.
                    // Si tu veux les remettre, il faut d'abord créer les sprites dans create().
                    if (this.physics.overlap(player, this.porte) == true) {
                        this.scene.start("accueil");
                    } 
                    else if (this.physics.overlap(player, this.porte2) == true) {
                        this.scene.start("accueil");
                    } 
                    else if (this.physics.overlap(player, this.porte3) == true) {
                        this.scene.start("accueil");
                    } 
                    else if (this.physics.overlap(player, this.porte4) == true) {
                        this.scene.start("accueil");
                    }
                    // NOUVEAU : la porte derrière la bibliothèque n'est utilisable
                    // que si la bibliothèque a déjà été déplacée (livre posé)
                    else if (this.bibliothequeOuverte && this.physics.overlap(player, this.porte5) == true) {
                        this.scene.start("gendarmerie");
                    }
                }
    }

    /* ============================================================
     *  MACHINE À ÉTATS DU DIALOGUE AVEC HERVET
     * ============================================================
     *  États possibles (déduits, pas besoin de tout stocker) :
     *  - "intro"           : la grande introduction n'a jamais été jouée
     *  - "attente_taches"  : intro faite, mais les 3 tâches ne sont pas toutes finies
     *  - "recompense"      : intro faite, les 3 tâches sont finies, récompense pas encore donnée
     *  - "resolu"          : la récompense a déjà été donnée
     */

    // Retourne la série de répliques à utiliser pour la conversation qui commence
    obtenirDialogueActuel() {
        const recompenseDonnee = this.registry.get("hervet_recompense_donnee") || false;
        if (recompenseDonnee) {
            return [{ texte: "Hervet : Merci pour ton aide.", moi: "moi_heureuse", perso: "perso_heureuse" }];
        }

        const introTerminee = this.registry.get("hervet_intro_terminee") || false;
        if (!introTerminee) {
            return dialogues; // la grande introduction (ajoute les 3 tâches à la fin)
        }

        // NOUVEAU : on vérifie l'HISTORIQUE des tâches (jamais effacé), pas la liste
        // affichée (qui, elle, se vide 2 secondes après chaque tâche terminée)
        const toutesTerminees = idsTachesHervet.every((id) => estTacheTerminee(this, id));

        if (toutesTerminees) {
            return [
                {
                    texte: "Hervet : Merci beaucoup, je t'offre ça pour te remercier !",
                    moi: "moi_heureuse",
                    perso: "perso_heureuse",
                },
            ];
        }

        // Intro faite, mais il manque encore au moins une tâche
        return [
            {
                texte: "Hervet : Reviens quand tu auras fait ce que je t'ai demandé.",
                moi: "moi_triste",
                perso: "perso_colere",
            },
        ];
    }

    // Appelée juste après que la conversation en cours se soit fermée
    apresDialogueHervet() {
        const recompenseDonnee = this.registry.get("hervet_recompense_donnee") || false;
        if (recompenseDonnee) {
            // "Merci pour ton aide." vient de s'afficher, rien d'autre à faire
            return;
        }

        const introTerminee = this.registry.get("hervet_intro_terminee") || false;
        if (!introTerminee) {
            // On vient de finir la grande introduction -> on ajoute les 3 tâches
            this.registry.set("hervet_intro_terminee", true);
            ajouterTaches(this, [
                { id: "recuperer_ticket", texte: "Récupérer le ticket" },
                { id: "parler_gendarme", texte: "Aller parler au gendarme" },
                { id: "recuperer_livre", texte: "Récupérer le livre" },
            ]);
            return;
        }

        const toutesTerminees = idsTachesHervet.every((id) => estTacheTerminee(this, id));
        if (toutesTerminees) {
            // On vient de fermer le message de remerciement -> on donne la récompense,
            // une seule fois (le flag empêche de la redonner à la prochaine conversation)
            ajouterObjet(
                this,
                "billet_de_train",
                "Billet de train",
                "Un billet de train offert par Hervet pour te remercier de ton aide."
            );
            afficherMessage(this, "Billet de train récupéré", 5000);
            this.registry.set("hervet_recompense_donnee", true);
            return;
        }

        // Sinon, on vient juste de fermer "Reviens quand tu auras fait ce que je t'ai
        // demandé." -> rien de plus à faire, on retentera à la prochaine conversation
    }

    // NOUVEAU : dialogue de Shella -- toujours la MÊME réplique fixe, à chaque
    // fois qu'on lui parle. Aucune condition, aucun état à vérifier : on renvoie
    // simplement le tableau (à une seule ligne) défini en haut du fichier.
    obtenirDialogueShella() {
        return dialogueShella;
    }

        obtenirDialogueGregoire() {
        return dialogueGregoire;
    }

    /* ============================================================
     *  NOUVEAU : SYSTÈME DE MONOLOGUE SOLO (identique à gendarmerie2)
     * ============================================================
     *  "lignes" : tableau de répliques { texte, moi, perso }
     *  "onFin"  : callback appelé une fois la dernière ligne fermée
     */
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

    // NOUVEAU : une fois qu'on a parlé à Shella ET à Barbar (dans n'importe quel
    // ordre), on lance le monologue de fin puis on part vers la scène "accueil"
    verifierEnqueteCafeTerminee() {
        if (this.departAccueilProgramme) return;
        if (!tachesToutesTerminees(this, ["parler_shella", "parler_barbar"])) return;

        this.departAccueilProgramme = true;
        // petit délai pour laisser le dialogue se refermer proprement avant d'enchaîner
        this.time.delayedCall(800, () => {
            this.lancerMonologue(monologueVersAccueil, () => {
                this.scene.start("accueil");
            });
        });
    }

    /* ============================================================
     *  NOUVEAU : ACTIONS CONTEXTUELLES DE L'INVENTAIRE
     * ============================================================
     *  Appelée automatiquement par InventaireUI quand le joueur ouvre
     *  un objet en grand. On retourne un tableau d'actions possibles
     *  POUR CET OBJET DANS LE CONTEXTE ACTUEL (ici : la proximité de
     *  la bibliothèque). Si rien n'est possible, on retourne [].
     */
    obtenirActionsObjet(cle) {
        const actions = [];

        if (cle === "livre" && !this.bibliothequeOuverte && possedeObjet(this, "livre")) {
            const PERIMETRE_BIBLIOTHEQUE = 120; // ajuste selon la distance souhaitée
            const distance = Phaser.Math.Distance.Between(
                player.x,
                player.y,
                this.bibliotheque.x,
                this.bibliotheque.y
            );

            if (distance < PERIMETRE_BIBLIOTHEQUE) {
                actions.push({
                    texte: "Poser le livre dans la bibliothèque",
                    executer: () => this.poserLivreDansBibliotheque(),
                });
            }
        }

        return actions;
    }

    /* ============================================================
     *  NOUVEAU : POSER LE LIVRE DANS LA BIBLIOTHÈQUE
     * ============================================================
     *  - Retire le livre de l'inventaire
     *  - Fait glisser la bibliothèque vers la DROITE (tween)
     *  - Autorise désormais l'interaction avec porte5 (espace)
     *  Le retour à la scène de jeu (fermeture de l'inventaire) est
     *  déjà géré par InventaireUI.fermerTout() avant l'appel ici.
     */
    poserLivreDansBibliotheque() {
        retirerObjet(this, "livre");

        this.bibliothequeOuverte = true;
        // CORRIGÉ : on sauvegarde l'état dans le registry (survit au changement de scène),
        // sinon revenir de gendarmerie remettait tout à zéro.
        this.registry.set("cafet_bibliotheque_ouverte", true);

        this.tweens.add({
            targets: this.bibliotheque,
            x: this.bibliotheque.x + 120, // vers la droite ; ajuste la distance si besoin
            duration: 800,
            ease: "Cubic.easeInOut",
        });
    }
}