// On réutilise ajouterObjet et afficherMessage : la récompense de l'énigme
// est un objet d'inventaire classique, exactement comme le ticket ou le livre.
import { ajouterObjet, afficherMessage } from "./inventaire.js";

/* ============================================================
 *  MODULE ÉNIGME
 *  ------------------------------------------------------------
 *  Fenêtre de puzzle avec une question + un clavier numérique
 *  cliquable (pas de vrai <input> HTML, tout est en Phaser/souris).
 *
 *  L'état "résolue ou non" est stocké dans le registry, comme
 *  l'inventaire et les tâches : ça survit au changement de scène,
 *  et une fois résolue, l'énigme ne se repropose plus jamais —
 *  seul un petit message de félicitations s'affiche.
 * ============================================================ */
export class EnigmeUI {
  /**
   * @param {Phaser.Scene} scene
   * @param {Object} config
   * @param {string} config.id               identifiant unique de l'énigme (ex: "enigme_gendarme")
   * @param {string} config.question          texte de l'énigme affiché en haut
   * @param {string|number} config.reponseCorrecte  la bonne réponse (nombre)
   * @param {Object} config.recompense        { cle, nom, description } -> objet donné à la résolution
   * @param {string} [config.messageSucces]
   * @param {string} [config.messageErreur]
   * @param {string} [config.messageDejaResolue]
   */
  constructor(scene, config) {
    this.scene = scene;
    this.id = config.id;
    this.question = config.question;
    this.reponseCorrecte = String(config.reponseCorrecte);
    this.recompense = config.recompense;

    this.messageDejaResolue = config.messageDejaResolue || "Tu es vraiment doué(e) pour les enquêtes !";

    // NOUVEAU : callbacks appelés juste après la fermeture du panneau, pour laisser
    // la SCÈNE décider de la réaction du PNJ (dialogue, animation, etc.)
    this.onReponseCorrecte = typeof config.onReponseCorrecte === "function" ? config.onReponseCorrecte : () => {};
    this.onReponseIncorrecte = typeof config.onReponseIncorrecte === "function" ? config.onReponseIncorrecte : () => {};

    this.saisie = ""; // ce que le joueur a tapé jusqu'ici, sous forme de texte
    this.cleResolue = "enigme_" + this.id + "_resolue"; // clé utilisée dans le registry

    this.panneau = scene.add.container(0, 0);
    this.panneau.setDepth(4000);
    this.panneau.setVisible(false);

    this.boutonsChiffres = []; // pour pouvoir les désactiver après une réussite
  }

  // L'énigme a-t-elle déjà été résolue (même lors d'une session précédente) ?
  estResolue() {
    return this.scene.registry.get(this.cleResolue) || false;
  }

  // À appeler quand le joueur déclenche l'énigme (ex: fin du dialogue du gendarme)
  ouvrir() {
    if (this.estResolue()) {
      // Déjà résolue : on ne repropose plus le puzzle, juste un petit message
      afficherMessage(this.scene, this.messageDejaResolue, 4000);
      return;
    }

    this.saisie = "";
    this.construirePanneau();
    this.panneau.setVisible(true);

    // On met le jeu en pause pendant que le puzzle est ouvert (comme le dialogue)
    this.scene.physics.pause();
  }

  fermer() {
    this.panneau.setVisible(false);
    this.scene.physics.resume();
  }

  construirePanneau() {
    this.panneau.removeAll(true);
    this.boutonsChiffres = [];

    const scene = this.scene;
    const largeurJeu = scene.cameras.main.width;
    const hauteurJeu = scene.cameras.main.height;

    // ---- Voile sombre derrière le panneau ----
    const voile = scene.add
      .rectangle(largeurJeu / 2, hauteurJeu / 2, largeurJeu, hauteurJeu, 0x000000, 0.75)
      .setScrollFactor(0)
      .setInteractive();
    this.panneau.add(voile);

    // ---- Cadre du panneau ----
    const panneauLargeur = 340;
    const panneauHauteur = 430;
    const centreX = largeurJeu / 2;
    const centreY = hauteurJeu / 2;
    const hautPanneau = centreY - panneauHauteur / 2;

    const fond = scene.add
      .rectangle(centreX, centreY, panneauLargeur, panneauHauteur, 0x1c1c1e, 0.97)
      .setScrollFactor(0)
      .setStrokeStyle(2, 0xffffff, 0.3);
    this.panneau.add(fond);

    // ---- Bouton fermer (toujours disponible, abandon possible) ----
    const boutonFermer = scene.add
      .text(centreX + panneauLargeur / 2 - 24, hautPanneau + 14, "✕", {
        font: "20px Arial",
        fill: "#ffffff",
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setInteractive({ useHandCursor: true });
    boutonFermer.on("pointerdown", () => this.fermer());
    this.panneau.add(boutonFermer);

    // ---- Titre ----
    const titre = scene.add
      .text(centreX, hautPanneau + 18, "Énigme du gendarme", {
        font: "bold 16px Arial",
        fill: "#ffffff",
      })
      .setOrigin(0.5, 0)
      .setScrollFactor(0);
    this.panneau.add(titre);

    // ---- Question (avec retour à la ligne automatique) ----
    const texteQuestion = scene.add
      .text(centreX, hautPanneau + 50, this.question, {
        font: "14px Arial",
        fill: "#ffffff",
        align: "center",
        wordWrap: { width: panneauLargeur - 40 },
      })
      .setOrigin(0.5, 0)
      .setScrollFactor(0);
    this.panneau.add(texteQuestion);

    // ---- Champ d'affichage de la saisie (le "faux input") ----
    const yChampSaisie = hautPanneau + 50 + texteQuestion.height + 20;

    const fondSaisie = scene.add
      .rectangle(centreX, yChampSaisie, panneauLargeur - 60, 40, 0x000000, 0.5)
      .setScrollFactor(0)
      .setStrokeStyle(1, 0xffffff, 0.4);
    this.panneau.add(fondSaisie);

    this.texteSaisie = scene.add
      .text(centreX, yChampSaisie, "", {
        font: "bold 18px Arial",
        fill: "#ffffff",
      })
      .setOrigin(0.5)
      .setScrollFactor(0);
    this.panneau.add(this.texteSaisie);
    this.rafraichirAffichageSaisie();

    // ---- Clavier numérique (grille 3 colonnes) ----
    const chiffres = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "effacer", "0", "valider"];
    const tailleBouton = 60;
    const espacement = 8;
    const largeurGrille = 3 * tailleBouton + 2 * espacement;
    const debutGrilleX = centreX - largeurGrille / 2 + tailleBouton / 2;
    const debutGrilleY = yChampSaisie + 40;

    chiffres.forEach((valeur, index) => {
      const colonne = index % 3;
      const ligne = Math.floor(index / 3);
      const x = debutGrilleX + colonne * (tailleBouton + espacement);
      const y = debutGrilleY + ligne * (tailleBouton + espacement);

      const estAction = valeur === "effacer" || valeur === "valider";
      const couleurFond = valeur === "valider" ? 0x2e7d32 : valeur === "effacer" ? 0x8d3a3a : 0x3a3a3c;

      const bouton = scene.add
        .rectangle(x, y, tailleBouton, tailleBouton, couleurFond)
        .setScrollFactor(0)
        .setInteractive({ useHandCursor: true });

      const libelle = estAction ? (valeur === "effacer" ? "⌫" : "✓") : valeur;
      const texteBouton = scene.add
        .text(x, y, libelle, { font: "bold 18px Arial", fill: "#ffffff" })
        .setOrigin(0.5)
        .setScrollFactor(0);

      bouton.on("pointerdown", () => {
        if (valeur === "effacer") this.effacer();
        else if (valeur === "valider") this.valider();
        else this.ajouterChiffre(valeur);
      });

      this.panneau.add([bouton, texteBouton]);
      this.boutonsChiffres.push(bouton); // pour pouvoir les désactiver après réussite
    });
  }

  // Met à jour l'affichage du "faux champ de saisie"
  rafraichirAffichageSaisie() {
    this.texteSaisie.setText(this.saisie.length > 0 ? this.saisie : "_");
  }

  ajouterChiffre(chiffre) {
    if (this.saisie.length >= 5) return; // on limite la longueur, au cas où
    this.saisie += chiffre;
    this.rafraichirAffichageSaisie();
  }

  effacer() {
    this.saisie = this.saisie.slice(0, -1);
    this.rafraichirAffichageSaisie();
  }

  valider() {
    const scene = this.scene;
    const reponseCorrecte = this.saisie === this.reponseCorrecte;

    if (reponseCorrecte) {
      // On donne la récompense, exactement comme un objet ramassé au sol
      ajouterObjet(scene, this.recompense.cle, this.recompense.nom, this.recompense.description);
      afficherMessage(scene, this.recompense.nom + " récupéré", 5000);

      // On marque l'énigme comme résolue pour toujours (registry -> survit aux scènes)
      scene.registry.set(this.cleResolue, true);
    }

    // NOUVEAU : le panneau se ferme TOUT DE SUITE, quelle que soit la réponse.
    // C'est ensuite à la scène (via les callbacks ci-dessous) de décider quoi
    // afficher comme réaction du PNJ (dialogue, message, etc.)
    this.fermer();

    if (reponseCorrecte) this.onReponseCorrecte();
    else this.onReponseIncorrecte();
  }
}