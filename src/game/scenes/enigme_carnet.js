// On réutilise afficherMessage pour le petit message "déjà résolu", comme
// pour les autres énigmes (voir enigme.js).
import { afficherMessage } from "./inventaire.js";

/* ============================================================
 *  MODULE ÉNIGME — CARNET (remettre des phrases dans le bon ordre)
 *  ------------------------------------------------------------
 *  Fenêtre interactive : en haut, des emplacements numérotés (1 à N) ;
 *  en bas, les phrases mélangées, cliquables. Cliquer une phrase du
 *  "pool" la place dans le prochain emplacement libre. Cliquer un
 *  emplacement déjà rempli la libère et la renvoie dans le pool.
 *
 *  Le bouton "Vérifier" compare l'ordre choisi par le joueur à l'ordre
 *  attendu (config.phrases, donné DANS LE BON ORDRE). Dans les deux cas
 *  (bonne ou mauvaise réponse), le panneau se ferme et c'est la SCÈNE
 *  qui décide de la suite via les callbacks onReponseCorrecte /
 *  onReponseIncorrecte (monologue, changement de scène, tâche...).
 * ============================================================ */
export class EnigmeCarnetUI {
  /**
   * @param {Phaser.Scene} scene
   * @param {Object} config
   * @param {string} config.id                     identifiant unique (ex: "enigme_carnet_gregoire")
   * @param {string} [config.titre]
   * @param {string} [config.instruction]
   * @param {string[]} config.phrases               les phrases, DANS LE BON ORDRE
   * @param {Function} [config.onReponseCorrecte]
   * @param {Function} [config.onReponseIncorrecte]
   * @param {string} [config.messageDejaResolue]
   */
  constructor(scene, config) {
    this.scene = scene;
    this.id = config.id;
    this.titre = config.titre || "Carnet";
    this.instruction = config.instruction || "Remets les phrases dans le bon ordre.";
    this.ordreCorrect = config.phrases.slice(); // copie, dans le bon ordre

    this.onReponseCorrecte = typeof config.onReponseCorrecte === "function" ? config.onReponseCorrecte : () => {};
    this.onReponseIncorrecte = typeof config.onReponseIncorrecte === "function" ? config.onReponseIncorrecte : () => {};
    this.messageDejaResolue = config.messageDejaResolue || "Tu as déjà tout compris sur ce carnet.";

    this.cleResolue = "enigme_" + this.id + "_resolue"; // clé registry -> survit au changement de scène

    this.emplacements = []; // emplacements[i] = index dans this.pool, ou null si vide
    this.pool = []; // { texte, placee }

    this.panneau = scene.add.container(0, 0);
    this.panneau.setDepth(4000);
    this.panneau.setVisible(false);
  }

  // L'énigme a-t-elle déjà été résolue (même lors d'une session précédente) ?
  estResolue() {
    return this.scene.registry.get(this.cleResolue) || false;
  }

  // NOUVEAU : pratique pour que la scène sache si elle doit ignorer la touche E
  estOuverte() {
    return this.panneau.visible;
  }

  // À appeler quand le joueur interagit avec le carnet (touche E à proximité)
  ouvrir() {
    if (this.estResolue()) {
      afficherMessage(this.scene, this.messageDejaResolue, 4000);
      return;
    }

    // NOUVEAU : on mélange les phrases à chaque ouverture (une nouvelle
    // tentative ne retombe pas forcément sur le même mélange)
    const melange = this.ordreCorrect
      .map((texte) => ({ texte, tri: Math.random() }))
      .sort((a, b) => a.tri - b.tri)
      .map((x) => x.texte);

    this.pool = melange.map((texte) => ({ texte, placee: false }));
    this.emplacements = new Array(this.ordreCorrect.length).fill(null);

    this.construirePanneau();
    this.panneau.setVisible(true);
    this.scene.physics.pause();
  }

  fermer() {
    this.panneau.setVisible(false);
    this.scene.physics.resume();
  }

  construirePanneau() {
    this.panneau.removeAll(true);

    const scene = this.scene;
    const largeurJeu = scene.cameras.main.width;
    const hauteurJeu = scene.cameras.main.height;

    // ---- Voile sombre derrière le panneau ----
    const voile = scene.add
      .rectangle(largeurJeu / 2, hauteurJeu / 2, largeurJeu, hauteurJeu, 0x000000, 0.8)
      .setScrollFactor(0)
      .setInteractive();
    this.panneau.add(voile);

    // ---- Cadre du panneau ----
    const panneauLargeur = 460;
    const panneauHauteur = 580;
    const centreX = largeurJeu / 2;
    const centreY = hauteurJeu / 2;
    const hautPanneau = centreY - panneauHauteur / 2;

    const fond = scene.add
      .rectangle(centreX, centreY, panneauLargeur, panneauHauteur, 0x1c1c1e, 0.97)
      .setScrollFactor(0)
      .setStrokeStyle(2, 0xffffff, 0.3);
    this.panneau.add(fond);

    // ---- Bouton fermer (abandon possible à tout moment) ----
    const boutonFermer = scene.add
      .text(centreX + panneauLargeur / 2 - 24, hautPanneau + 14, "✕", { font: "20px Arial", fill: "#ffffff" })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setInteractive({ useHandCursor: true });
    boutonFermer.on("pointerdown", () => this.fermer());
    this.panneau.add(boutonFermer);

    // ---- Titre + instruction ----
    const titre = scene.add
      .text(centreX, hautPanneau + 16, this.titre, { font: "bold 16px Arial", fill: "#ffffff" })
      .setOrigin(0.5, 0)
      .setScrollFactor(0);
    this.panneau.add(titre);

    const instruction = scene.add
      .text(centreX, hautPanneau + 40, this.instruction, {
        font: "12px Arial",
        fill: "#cccccc",
        align: "center",
        wordWrap: { width: panneauLargeur - 40 },
      })
      .setOrigin(0.5, 0)
      .setScrollFactor(0);
    this.panneau.add(instruction);

    /***************************
     *  EMPLACEMENTS (1 à N) *
     ****************************/
    const yEmplacements = hautPanneau + 70;
    const hauteurLigne = 26;

    this.textesEmplacements = [];
    this.emplacements.forEach((_, index) => {
      const y = yEmplacements + index * hauteurLigne;

      const fondCase = scene.add
        .rectangle(centreX, y, panneauLargeur - 40, hauteurLigne - 4, 0x000000, 0.5)
        .setScrollFactor(0)
        .setStrokeStyle(1, 0xffffff, 0.4)
        .setInteractive({ useHandCursor: true });

      const texteCase = scene.add
        .text(centreX - (panneauLargeur - 40) / 2 + 8, y, index + 1 + ". ____", {
          font: "12px Arial",
          fill: "#ffffff",
        })
        .setOrigin(0, 0.5)
        .setScrollFactor(0);

      // NOUVEAU : cliquer une case remplie la vide (la phrase revient au pool)
      fondCase.on("pointerdown", () => this.retirerEmplacement(index));

      this.panneau.add([fondCase, texteCase]);
      this.textesEmplacements.push(texteCase);
    });

    /***************************
     *  PHRASES MÉLANGÉES (pool) *
     ****************************/
    const yPool = yEmplacements + this.emplacements.length * hauteurLigne + 16;
    const hauteurLignePool = 30;

    this.textesPool = [];
    this.fondsPool = [];
    this.pool.forEach((item, index) => {
      const y = yPool + index * hauteurLignePool;

      const fondItem = scene.add
        .rectangle(centreX, y, panneauLargeur - 40, hauteurLignePool - 4, 0x3a3a3c, 1)
        .setScrollFactor(0)
        .setInteractive({ useHandCursor: true });

      const texteItem = scene.add
        .text(centreX, y, item.texte, { font: "12px Arial", fill: "#ffffff" })
        .setOrigin(0.5)
        .setScrollFactor(0);

      fondItem.on("pointerdown", () => this.placerPhrase(index));

      this.panneau.add([fondItem, texteItem]);
      this.fondsPool.push(fondItem);
      this.textesPool.push(texteItem);
    });

    /***************************
     *  BOUTON VERIFIER *
     ****************************/
    const yBouton = yPool + this.pool.length * hauteurLignePool + 20;

    this.boutonVerifier = scene.add
      .rectangle(centreX, yBouton, panneauLargeur - 120, 36, 0x2e7d32)
      .setScrollFactor(0)
      .setInteractive({ useHandCursor: true });

    this.texteBoutonVerifier = scene.add
      .text(centreX, yBouton, "Vérifier", { font: "bold 14px Arial", fill: "#ffffff" })
      .setOrigin(0.5)
      .setScrollFactor(0);

    this.boutonVerifier.on("pointerdown", () => this.valider());

    this.panneau.add([this.boutonVerifier, this.texteBoutonVerifier]);

    this.rafraichirAffichage();
  }

  // Place la phrase 'indexPool' du pool dans le prochain emplacement libre
  placerPhrase(indexPool) {
    const item = this.pool[indexPool];
    if (item.placee) return; // déjà placée -> grisée, un clic ne fait rien

    const emplacementLibre = this.emplacements.findIndex((e) => e === null);
    if (emplacementLibre === -1) return; // plus de place libre

    this.emplacements[emplacementLibre] = indexPool;
    item.placee = true;

    this.rafraichirAffichage();
  }

  // Clique sur une case déjà remplie -> on la vide, la phrase revient au pool
  retirerEmplacement(index) {
    const indexPool = this.emplacements[index];
    if (indexPool === null) return;

    this.pool[indexPool].placee = false;
    this.emplacements[index] = null;

    this.rafraichirAffichage();
  }

  estComplet() {
    return this.emplacements.every((e) => e !== null);
  }

  rafraichirAffichage() {
    // Emplacements : affiche la phrase placée, ou "____" si vide
    this.emplacements.forEach((indexPool, i) => {
      const texte = indexPool === null ? i + 1 + ". ____" : i + 1 + ". " + this.pool[indexPool].texte;
      this.textesEmplacements[i].setText(texte);
    });

    // Pool : grisé si déjà placée
    this.pool.forEach((item, i) => {
      this.fondsPool[i].setFillStyle(item.placee ? 0x2a2a2c : 0x3a3a3c, 1);
      this.textesPool[i].setAlpha(item.placee ? 0.35 : 1);
    });

    // Bouton Vérifier : estompé tant que tous les emplacements ne sont pas remplis
    if (this.boutonVerifier) {
      const complet = this.estComplet();
      this.boutonVerifier.setAlpha(complet ? 1 : 0.4);
    }
  }

  valider() {
    if (!this.estComplet()) return; // rien à vérifier tant que ce n'est pas complet

    const ordreJoueur = this.emplacements.map((indexPool) => this.pool[indexPool].texte);
    const correct = ordreJoueur.every((texte, i) => texte === this.ordreCorrect[i]);

    if (correct) {
      this.scene.registry.set(this.cleResolue, true);
    }

    // Le panneau se ferme TOUT DE SUITE, bonne ou mauvaise réponse -> c'est
    // ensuite à la scène de décider de la réaction (monologue, etc.)
    this.fermer();

    if (correct) this.onReponseCorrecte();
    else this.onReponseIncorrecte();
  }
}