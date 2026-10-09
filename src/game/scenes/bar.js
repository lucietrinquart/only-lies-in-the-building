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
var shella;

var exclamation;
var telephone;
var livre;
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

export default class bar extends Phaser.Scene {
  constructor() {
    super({ key: "bar" }); // mettre le meme nom que le nom de la classe
  }

  preload() {}

  create(data) {
    // CORRECTION : ce compteur n'était jamais initialisé (il valait undefined)
    this.developperCount1 = 0;
    // CORRIGÉ : on lit l'état depuis le registry (survit au changement de scène)
    // au lieu de toujours repartir à false.

     const carteDuNiveau = this.add.tilemap("carte3");
            // chargement du jeu de tuiles
    const tileset = carteDuNiveau.addTilesetImage(
            "sprite_bar",
            "Phaser_tuilesdejeu3"
    );

            // chargement du second calque "calque_backgroung"
    const sol= carteDuNiveau.createLayer("sol", tileset);
    const dehors= carteDuNiveau.createLayer("dehors", tileset);
    const murs_contour = carteDuNiveau.createLayer("murs_contour", tileset);
    const mur_du_haut = carteDuNiveau.createLayer("mur_du_haut", tileset);
    const decor_bas_de_mur = carteDuNiveau.createLayer("decor_bas_de_mur", tileset);
    const enseignes_etagere_du_fond = carteDuNiveau.createLayer("enseignes_etagere_du_fond", tileset);
    const comptoir = carteDuNiveau.createLayer("comptoir", tileset);
    const reserve_vide = carteDuNiveau.createLayer("reserve_vide", tileset);
    const etagere = carteDuNiveau.createLayer("etagere", tileset);
    const banquettes_tabourets_tables_rondes = carteDuNiveau.createLayer("banquettes_tabourets_tables_rondes", tileset);
    const grandes_tables_tabourets_tableau = carteDuNiveau.createLayer("grandes_tables_tabourets_tableau", tileset);
    const verres_bouteilles = carteDuNiveau.createLayer("verres_bouteilles", tileset);
    const lumiere = carteDuNiveau.createLayer("lumiere", tileset);
    const personnages = carteDuNiveau.createLayer("personnages", tileset);

    this.shella = this.physics.add.sprite(580, 200, "shella");
    this.gregoire = this.physics.add.sprite(200, 200, "gregoire");


    // NOUVEAU : état du monologue en cours (null = aucun) + garde-fou pour ne
    // lancer le monologue de fin qu'une seule fois
    this.monologue = null;
    this.departProgramme = false;
    this.departAccueilProgramme = false;
        this.dialogueUI = new DialogueUI(this, {
      moiParDefaut: "moi_heureuse",
      persoParDefaut: "perso_triste",
    });



    sol.setCollisionByProperty({ estSolide: true });
    dehors.setCollisionByProperty({ estSolide: true });
    murs_contour.setCollisionByProperty({ estSolide: true });
    mur_du_haut.setCollisionByProperty({ estSolide: true });
    decor_bas_de_mur.setCollisionByProperty({ estSolide: true });
    enseignes_etagere_du_fond.setCollisionByProperty({ estSolide: true });
    comptoir.setCollisionByProperty({ estSolide: true });
    reserve_vide.setCollisionByProperty({ estSolide: true });
    etagere.setCollisionByProperty({ estSolide: true });
    banquettes_tabourets_tables_rondes.setCollisionByProperty({ estSolide: true });
    grandes_tables_tabourets_tableau.setCollisionByProperty({ estSolide: true });
    verres_bouteilles.setCollisionByProperty({ estSolide: true });
    personnages.setCollisionByProperty({ estSolide: true });




    // création du personnage de jeu et positionnement


            const chat = this.physics.add.staticSprite(552, 325, "chat");

            this.dialogueUI = new DialogueUI(this, {
              moiParDefaut: "moi_heureuse",
              persoParDefaut: "perso_triste",
            });


            player = this.physics.add.sprite(430, 550, "img_perso");


            // ajout du modèle de collision entre le personnage et les plates-formes

            // ajout du modèle de collision entre le personnage et le monde
            player.setCollideWorldBounds(true);
            // Collisions avec les calques de collision
            this.physics.add.collider(player, sol);
            this.physics.add.collider(player, dehors);
            this.physics.add.collider(player, murs_contour);
            this.physics.add.collider(player, mur_du_haut);
            this.physics.add.collider(player, decor_bas_de_mur);
            this.physics.add.collider(player, enseignes_etagere_du_fond);
            this.physics.add.collider(player, comptoir);
            this.physics.add.collider(player, reserve_vide);
            this.physics.add.collider(player, etagere);
            this.physics.add.collider(player, banquettes_tabourets_tables_rondes);
            this.physics.add.collider(player, grandes_tables_tabourets_tableau);
            this.physics.add.collider(player, verres_bouteilles);
            this.physics.add.collider(player, personnages);



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
            
            
              
                     
                     // CORRIGÉ : avant, appelait this.obtenirDialogueActuel() (celui d'HERVET),
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
                this.scene.start("entreprise_gregoire");
            });
        });
    }


}