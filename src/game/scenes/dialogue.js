import * as Phaser from "phaser";

/* ============================================================
 *  MODULE DIALOGUE (avec portraits) — version "jeu vidéo"
 *  ------------------------------------------------------------
 *  - portrait du joueur à gauche, portrait du PNJ à droite (inchangés)
 *  - boîte de texte style RPG, avec une plaque au nom du personnage
 *  - le texte s'écrit lettre par lettre, avec un petit "bip" par lettre
 *    (hauteur du son variable selon la lettre, pauses sur la ponctuation)
 *  - le bip ne sonne QUE pendant que le texte s'écrit
 *
 *  Chaque réplique est un objet :
 *  { texte: "Nom : ...", moi: "moi_heureuse", perso: "perso_triste" }
 *  Si le texte commence par "Nom : ", le nom passe sur la plaque et
 *  disparaît du corps du texte (rien à changer dans tes dialogues).
 * ============================================================ */

/* ------------------------------------------------------------
 *  RÉGLAGES (tout se règle ici)
 * ------------------------------------------------------------ */
const VITESSE_LETTRE = 34; // ms entre deux lettres (plus petit = plus rapide)
const PAUSE_FIN_PHRASE = 260; // ms de pause après . ! ? …
const PAUSE_VIRGULE = 130; // ms de pause après , ; :

// --- le bip ---
const BIP_CLE = "bip"; // clé donnée dans this.load.audio(...)
const BIP_DEBUT = 0; // seconde où commence le 1er bip dans ton fichier
const BIP_DUREE = 0.07; // durée (s) de la tranche jouée à chaque lettre
const BIP_VOLUME = 0.35;
// Notes (en demi-tons) utilisées pour faire varier la hauteur selon la lettre
const GAMME = [-5, -3, 0, 2, 4, 7, 9];
const VOYELLES = "aeiouyàâäéèêëîïôöùûü";

// --- couleurs de la boîte ---
const COULEUR_FOND = 0x10163a;
const COULEUR_BORDURE_INTERIEURE = 0x6ea8ff;
const COULEUR_PLAQUE_VIOLETTE = 0x8e44ad;
const COULEUR_PLAQUE_AUTRES = 0xd9822b;

export class DialogueUI {
  constructor(scene, options = {}) {
    this.scene = scene;

    const largeur = scene.cameras.main.width;
    const hauteur = scene.cameras.main.height;

    this.conteneur = scene.add.container(0, 0);
    this.conteneur.setScrollFactor(0);
    this.conteneur.setDepth(1000); // sous l'inventaire/carte/tâches (2000+), au-dessus du jeu
    this.conteneur.setVisible(false);

    // ---- Voile sombre derrière, pour l'effet "zoom" cinématique ----
    const voile = scene.add
      .rectangle(largeur / 2, hauteur / 2, largeur, hauteur, 0x000000, 0.55)
      .setScrollFactor(0);
    this.conteneur.add(voile);

    // ---- Dimensions des portraits (INCHANGÉES) ----
    this.taillePortrait = options.taillePortrait || Math.min(largeur * 0.42, hauteur * 0.6);
    const zoneTexteHauteur = options.zoneTexteHauteur || 110;
    const yPortrait = hauteur - zoneTexteHauteur - this.taillePortrait / 2 - 10;

    // ---- Portrait du joueur (MOI), à gauche ----
    this.portraitMoi = scene.add
      .image(largeur * 0.24, yPortrait, options.moiParDefaut || "moi_triste")
      .setScrollFactor(0);
    this.conteneur.add(this.portraitMoi);

    // ---- Portrait du PNJ, à droite ----
    this.portraitPerso = scene.add
      .image(largeur * 0.76, yPortrait, options.persoParDefaut || "perso_triste")
      .setScrollFactor(0);
    this.conteneur.add(this.portraitPerso);

    this.redimensionnerPortrait(this.portraitMoi);
    this.redimensionnerPortrait(this.portraitPerso);

    // ---- LA BOÎTE DE TEXTE (même emplacement qu'avant) ----
    const boxX = 20;
    const boxW = largeur - 40;
    const boxH = zoneTexteHauteur;
    const boxY = hauteur - zoneTexteHauteur - 10;
    this.boxX = boxX;
    this.boxY = boxY;

    const boite = scene.add.graphics().setScrollFactor(0);
    // ombre portée
    boite.fillStyle(0x000000, 0.45);
    boite.fillRoundedRect(boxX + 4, boxY + 5, boxW, boxH, 16);
    // fond
    boite.fillStyle(COULEUR_FOND, 0.94);
    boite.fillRoundedRect(boxX, boxY, boxW, boxH, 16);
    // bordure blanche extérieure
    boite.lineStyle(4, 0xffffff, 1);
    boite.strokeRoundedRect(boxX, boxY, boxW, boxH, 16);
    // fine bordure colorée intérieure
    boite.lineStyle(2, COULEUR_BORDURE_INTERIEURE, 0.8);
    boite.strokeRoundedRect(boxX + 7, boxY + 7, boxW - 14, boxH - 14, 11);
    this.conteneur.add(boite);

    // ---- Plaque du nom (au-dessus de la boîte, à gauche) ----
    this.plaque = scene.add.graphics().setScrollFactor(0);
    this.conteneur.add(this.plaque);

    this.texteNom = scene.add
      .text(0, 0, "", {
        font: "bold 17px Arial",
        fill: "#ffffff",
        shadow: { offsetX: 1, offsetY: 1, color: "#000000", fill: true },
      })
      .setOrigin(0.5)
      .setScrollFactor(0);
    this.conteneur.add(this.texteNom);

    // ---- Le texte lui-même (aligné à gauche, écrit lettre par lettre) ----
    this.texte = scene.add
      .text(boxX + 30, boxY + 22, "", {
        font: "bold 18px Arial",
        fill: "#ffffff",
        align: "left",
        wordWrap: { width: boxW - 30 * 2 - 24 },
        lineSpacing: 4,
        shadow: { offsetX: 2, offsetY: 2, color: "#000000", fill: true },
      })
      .setOrigin(0, 0)
      .setScrollFactor(0);
    this.conteneur.add(this.texte);

    // ---- Petite flèche "▼" qui rebondit quand la réplique est finie ----
    this.fleche = scene.add
      .text(boxX + boxW - 34, boxY + boxH - 42, "▼", {
        font: "bold 18px Arial",
        fill: "#ffd54a",
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setVisible(false);
    this.conteneur.add(this.fleche);
    scene.tweens.add({
      targets: this.fleche,
      y: this.fleche.y + 5,
      duration: 380,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });

    // ---- Indication "Appuyer sur E pour continuer" (visible quand c'est fini) ----
    this.texteIndication = scene.add
      .text(largeur - 30, hauteur - 18, "Appuyer sur E pour continuer", {
        font: "italic 12px Arial",
        fill: "#9a9a9a",
      })
      .setOrigin(1, 1)
      .setScrollFactor(0)
      .setVisible(false);
    this.conteneur.add(this.texteIndication);

    // ---- Écriture lettre par lettre : état ----
    this.ecriture = false; // vrai tant que le texte est en train de s'écrire
    this.texteAffiche = ""; // le texte complet (déjà coupé en lignes)
    this.index = 0;
    this.minuteur = null;
    this.decalageVoix = 0;

    // ---- Le bip : on joue juste une courte "tranche" du fichier à chaque lettre ----
    this.sonBip = null;
    if (scene.cache.audio.exists(BIP_CLE)) {
      this.sonBip = scene.sound.add(BIP_CLE);
      this.sonBip.addMarker({ name: "bip", start: BIP_DEBUT, duration: BIP_DUREE });
    }

    // nettoyage quand la scène s'arrête
    scene.events.once("shutdown", () => {
      this.arreterEcriture();
      if (this.sonBip) {
        this.sonBip.destroy();
        this.sonBip = null;
      }
    });
  }

  // Redimensionne un portrait pour qu'il tienne dans le cadre sans se déformer
  redimensionnerPortrait(image) {
    const ratio = Math.min(
      this.taillePortrait / image.width,
      this.taillePortrait / image.height
    );
    image.setScale(ratio);
  }

  /**
   * Affiche une réplique (le texte s'écrit lettre par lettre).
   * @param {Object} ligne - { texte, moi, perso }
   *   "moi" et "perso" sont optionnels : si omis, le portrait précédent reste affiché.
   *   Passer "perso: false" (ou "moi: false") cache complètement ce portrait.
   */
  afficherLigne(ligne) {
    this.arreterEcriture();

    // Portraits (inchangé)
    if (ligne.moi === false) {
      this.portraitMoi.setVisible(false);
    } else if (ligne.moi && this.scene.textures.exists(ligne.moi)) {
      this.portraitMoi.setVisible(true);
      this.portraitMoi.setTexture(ligne.moi);
      this.redimensionnerPortrait(this.portraitMoi);
    }

    if (ligne.perso === false) {
      this.portraitPerso.setVisible(false);
    } else if (ligne.perso && this.scene.textures.exists(ligne.perso)) {
      this.portraitPerso.setVisible(true);
      this.portraitPerso.setTexture(ligne.perso);
      this.redimensionnerPortrait(this.portraitPerso);
    }

    const { nom, corps } = this.separerNom(ligne.texte || "");
    this.afficherPlaque(nom);
    this.preparerTexte(corps);

    this.conteneur.setVisible(true);
    this.demarrerEcriture(nom);
  }

  // Cache toute la scène de dialogue (portraits + texte)
  masquer() {
    this.arreterEcriture();
    this.conteneur.setVisible(false);
  }

  // Pratique pour les tests du type "if (this.dialogueUI.visible) return;"
  get visible() {
    return this.conteneur.visible;
  }

  // Vrai si le texte est en train de s'écrire
  get enTrainDEcrire() {
    return this.ecriture;
  }

  /**
   * Si le texte est encore en train de s'écrire, l'affiche en entier tout de suite
   * et renvoie true. Sinon renvoie false.
   * Pour que le 1er appui sur E termine la phrase (et le 2e passe à la suivante),
   * ajoute au début de la gestion de E dans une scène :
   *     if (this.dialogueUI.visible && this.dialogueUI.completerSiEnCours()) return;
   */
  completerSiEnCours() {
    if (!this.ecriture) return false;
    this.arreterMinuteur();
    this.finirEcriture();
    return true;
  }

  /* ------------------------------------------------------------
   *  Nom du personnage -> plaque
   * ------------------------------------------------------------ */
  // "Violette : Bonjour" -> { nom: "Violette", corps: "Bonjour" }
  separerNom(texte) {
    const m = /^([A-ZÀ-Ý][\p{L}'’\- ]{0,24}?(?:\s\([^)]{1,20}\))?)\s?:\s*([\s\S]+)$/u.exec(texte);
    if (m && m[1].trim().split(/\s+/).length <= 3) {
      return { nom: m[1].trim(), corps: m[2] };
    }
    return { nom: "", corps: texte };
  }

  afficherPlaque(nom) {
    this.plaque.clear();
    if (!nom) {
      this.texteNom.setVisible(false);
      return;
    }
    this.texteNom.setText(nom).setVisible(true);

    const largeurPlaque = this.texteNom.width + 40;
    const hauteurPlaque = 34;
    const x = this.boxX + 22;
    const y = this.boxY - 22;
    const couleur = /^Violette/i.test(nom) ? COULEUR_PLAQUE_VIOLETTE : COULEUR_PLAQUE_AUTRES;

    this.plaque.fillStyle(0x000000, 0.4);
    this.plaque.fillRoundedRect(x + 3, y + 4, largeurPlaque, hauteurPlaque, 10);
    this.plaque.fillStyle(couleur, 1);
    this.plaque.fillRoundedRect(x, y, largeurPlaque, hauteurPlaque, 10);
    this.plaque.lineStyle(3, 0xffffff, 1);
    this.plaque.strokeRoundedRect(x, y, largeurPlaque, hauteurPlaque, 10);

    this.texteNom.setPosition(x + largeurPlaque / 2, y + hauteurPlaque / 2);
  }

  /* ------------------------------------------------------------
   *  Écriture lettre par lettre
   * ------------------------------------------------------------ */
  // Coupe le texte en lignes à l'avance (sinon les mots "sautent" de ligne
  // pendant l'écriture) et réduit un peu la police si c'est très long.
  preparerTexte(corps) {
    const tailles = [
      [18, 3],
      [16, 4],
      [14, 99],
    ];
    let lignes = [corps];
    for (const [taille, maxLignes] of tailles) {
      this.texte.setFontSize(taille);
      lignes = this.texte.getWrappedText(corps);
      if (lignes.length <= maxLignes) break;
    }
    this.texteAffiche = lignes.join("\n");
    this.texte.setText("");
  }

  demarrerEcriture(nom) {
    this.index = 0;
    this.ecriture = true;
    this.fleche.setVisible(false);
    this.texteIndication.setVisible(false);
    this.decalageVoix = this.calculerDecalageVoix(nom);
    this.etapeEcriture();
  }

  etapeEcriture() {
    if (this.index >= this.texteAffiche.length) {
      this.finirEcriture();
      return;
    }

    const c = this.texteAffiche[this.index];
    const suivant = this.texteAffiche[this.index + 1] || "";
    this.index++;
    this.texte.setText(this.texteAffiche.slice(0, this.index));

    // rythme légèrement irrégulier, comme dans les jeux
    let delai = VITESSE_LETTRE * (0.85 + Math.random() * 0.35);

    if (/[\p{L}\p{N}]/u.test(c)) {
      this.jouerBip(c);
      if (VOYELLES.includes(c.toLowerCase())) delai *= 1.15;
    } else if (c === "." || c === "!" || c === "?" || c === "…") {
      // pauses (courtes si la ponctuation se répète : "...", "?!")
      delai += /[.!?…]/.test(suivant) ? 90 : PAUSE_FIN_PHRASE;
    } else if (c === "," || c === ";" || c === ":") {
      delai += PAUSE_VIRGULE;
    }

    this.minuteur = this.scene.time.delayedCall(delai, () => this.etapeEcriture());
  }

  finirEcriture() {
    this.ecriture = false;
    this.texte.setText(this.texteAffiche);
    if (this.sonBip) this.sonBip.stop();
    this.fleche.setVisible(true);
    this.texteIndication.setVisible(true);
  }

  arreterMinuteur() {
    if (this.minuteur) {
      this.minuteur.remove(false);
      this.minuteur = null;
    }
  }

  arreterEcriture() {
    this.arreterMinuteur();
    this.ecriture = false;
    if (this.sonBip) this.sonBip.stop();
  }

  /* ------------------------------------------------------------
   *  Le bip
   * ------------------------------------------------------------ */
  // Voix plus aiguë pour Violette, plus grave (et différente) pour les autres
  calculerDecalageVoix(nom) {
    if (!nom) return 0;
    if (/^Violette/i.test(nom)) return 3;
    let somme = 0;
    for (const ch of nom) somme += ch.charCodeAt(0);
    return -2 - (somme % 3);
  }

  jouerBip(lettre) {
    if (!this.sonBip) return;
    const minuscule = lettre.toLowerCase();
    let demiTons = GAMME[minuscule.charCodeAt(0) % GAMME.length] + this.decalageVoix;
    if (VOYELLES.includes(minuscule)) demiTons += 2;
    const rate = Math.pow(2, demiTons / 12); // 12 demi-tons = une octave
    this.sonBip.play("bip", { rate, volume: BIP_VOLUME });
  }
}