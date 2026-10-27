import * as Phaser from "phaser";

/* ============================================================
 *  TÉLÉPHONE (style iPhone), CLASSE DE BASE
 *  Telephone.js (Adrien) et mon_telephone.js (Violette) héritent de
 *  cette classe : le design est ici, une seule fois.
 *  Chaque téléphone donne ses "reglages" (propriétaire, couleurs,
 *  contacts...) via le constructeur.
 * ============================================================ */

const POLICE =
  "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Helvetica, Arial, sans-serif";

// Couleurs iOS
const BLEU_IOS = 0x007aff;
const GRIS_BULLE = 0xe9e9eb;
const GRIS_BARRE = 0xf6f6f6;
const GRIS_LIGNE = 0xd1d1d6;
const GRIS_TEXTE = "#8e8e93";

export default class TelephoneBase extends Phaser.Scene {
  constructor(cle, reglages) {
    super({ key: cle });
    this.reglages = reglages;
  }

  // scène à relancer à la fermeture (sinon celle donnée par le téléphone)
  init(data) {
    this.sceneParente =
      (data && data.sceneParente) || this.reglages.sceneParenteParDefaut || null;
  }

  preload() {
    // À ADAPTER : chemins / extensions de tes images
    this.load.image("fond_ecran", "./assets/fond_ecran.png");
    this.load.image("icon_snake", "./assets/icon_snake.png");
    this.load.image("icon_messages", "./assets/icon_messages.png");
    this.load.image("icon_gallery", "./assets/icon_gallery.png");
    this.load.image("icon_setting", "./assets/icon_setting.png");
    this.load.image("icon_save", "./assets/icon_save.png");
    this.load.image("icon_social", "./assets/icon_social.png");

    // fond d'écran propre à ce téléphone (optionnel)
    if (this.reglages.fondEcranFichier) {
      this.load.image(this.reglages.fondEcran, this.reglages.fondEcranFichier);
    }
  }

  /* ============================================================
   *  POINTS D'EXTENSION (surchargés par mon_telephone.js)
   * ============================================================ */

  // lignes de la liste : [{ contact, nonLu }]
  obtenirLignes() {
    return this.reglages.contacts.map((c) => ({ contact: c, nonLu: false }));
  }

  // appelé à l'ouverture d'une conversation
  auOuvertureConversation(contact) {}

  // nombre affiché dans la pastille rouge de l'icône Messages (0 = cachée)
  messagesNonLus() {
    return 0;
  }

  create() {
    this.scene.bringToTop();

    this.decalage = 0;
    this.ecranCourant = "accueil";

    const L = this.cameras.main.width; // 800
    const H = this.cameras.main.height; // 608

    // ============================================================
    //  TAILLE DU TÉLÉPHONE : retouche ici si besoin
    //  SW/SH = zone d'écran visible, R = rayon des coins de l'écran,
    //  cadre = épaisseur du contour noir
    // ============================================================
    const SW = 272;
    const SH = 540;
    const R = 30;
    this.cadre = 14;

    const sx = Math.round((L - SW) / 2);
    const sy = Math.round((H - SH) / 2);
    this.ecranTel = { x: sx, y: sy, largeur: SW, hauteur: SH, rayon: R };

    // Voile sombre derrière le téléphone
    this.add.rectangle(L / 2, H / 2, L, H, 0x000000, 0.6).setDepth(0);

    this.dessinerCoque();

    // Les 3 écrans (un seul visible à la fois)
    this.ecranAccueil = this.add.container(0, 0).setDepth(2);
    this.ecranListe = this.add.container(0, 0).setDepth(2).setVisible(false);
    this.ecranConversation = this.add.container(0, 0).setDepth(2).setVisible(false);

    this.construireAccueil();

    // Éléments toujours au-dessus des écrans
    this.dessinerCoins();
    this.creerBarreStatut();
    this.creerIleDynamique();
    this.creerIndicateurAccueil();
    this.creerToast();

    // Bouton fermer (position absolue dans le coin du jeu)
    const boutonFermer = this.add
      .text(L - 20, 20, "✕", { font: "28px Arial", fill: "#ffffff" })
      .setOrigin(1, 0)
      .setDepth(10000)
      .setScrollFactor(0)
      .setInteractive({ useHandCursor: true });
    boutonFermer.on("pointerdown", () => this.fermerTelephone());

    // Échap ferme aussi le téléphone
    this.input.keyboard.on("keydown-ESC", () => this.fermerTelephone());

    // Molette : fait défiler une longue conversation
    this.input.on("wheel", (pointer, objets, dx, dy) => {
      if (this.ecranCourant === "conversation") {
        this.appliquerDecalage(this.decalage - dy * 0.5);
      }
    });

    this.afficherEcran("accueil");
  }

  /* ============================================================
   *  OUTILS
   * ============================================================ */
  creerTexte(x, y, contenu, style = {}) {
    return this.add.text(x, y, contenu, { fontFamily: POLICE, resolution: 2, ...style });
  }

  creerAvatar(cx, cy, rayon, contact) {
    const g = this.add.graphics();
    g.fillStyle(contact.couleur, 1);
    g.fillCircle(cx, cy, rayon);
    const initiale = this.creerTexte(cx, cy, contact.nom.charAt(0).toUpperCase(), {
      fontSize: Math.round(rayon * 0.95) + "px",
      fontStyle: "bold",
      color: "#ffffff",
    }).setOrigin(0.5);
    return [g, initiale];
  }

  /* ============================================================
   *  COQUE, COINS, BARRE D'ÉTAT, ÎLE DYNAMIQUE
   * ============================================================ */
  dessinerCoque() {
    const { x, y, largeur, hauteur, rayon } = this.ecranTel;
    const { couleurCoque, couleurMetal } = this.reglages;
    const C = this.cadre;
    const ox = x - C;
    const oy = y - C;
    const ow = largeur + C * 2;
    const oh = hauteur + C * 2;
    const or = rayon + C;

    const g = this.add.graphics().setDepth(1);

    // ombre portée
    g.fillStyle(0x000000, 0.35);
    g.fillRoundedRect(ox - 8, oy + 4, ow + 16, oh + 16, or + 8);

    // coque colorée (c'est elle qui distingue les deux téléphones)
    g.fillStyle(couleurCoque, 1);
    g.fillRoundedRect(ox - 8, oy - 8, ow + 16, oh + 16, or + 8);
    g.lineStyle(1.5, 0xffffff, 0.18);
    g.strokeRoundedRect(ox - 7.25, oy - 7.25, ow + 14.5, oh + 14.5, or + 7.25);

    // cadre métallique
    g.fillStyle(couleurMetal, 1);
    g.fillRoundedRect(ox - 3, oy - 3, ow + 6, oh + 6, or + 3);
    g.fillStyle(0x1c1c1e, 1);
    g.fillRoundedRect(ox - 1, oy - 1, ow + 2, oh + 2, or + 1);

    // corps noir (le contour autour de l'écran)
    g.fillStyle(0x000000, 1);
    g.fillRoundedRect(ox, oy, ow, oh, or);

    // boutons latéraux (de la couleur de la coque)
    g.fillStyle(couleurCoque, 1);
    g.fillRoundedRect(ox - 11, oy + 92, 4, 26, 2);
    g.fillRoundedRect(ox - 11, oy + 134, 4, 46, 2);
    g.fillRoundedRect(ox - 11, oy + 190, 4, 46, 2);
    g.fillRoundedRect(ox + ow + 7, oy + 150, 4, 74, 2);
  }

  // Arrondit les 4 coins de l'écran en posant une petite pièce noire
  // dans chaque coin (aucun masque nécessaire).
  dessinerCoins() {
    const { x, y, largeur: w, hauteur: h, rayon: r } = this.ecranTel;
    const g = this.add.graphics().setDepth(10);
    g.fillStyle(0x000000, 1);

    // haut-gauche
    g.beginPath();
    g.moveTo(x, y);
    g.lineTo(x + r, y);
    g.arc(x + r, y + r, r, Math.PI * 1.5, Math.PI, true);
    g.closePath();
    g.fillPath();

    // haut-droite
    g.beginPath();
    g.moveTo(x + w, y);
    g.lineTo(x + w - r, y);
    g.arc(x + w - r, y + r, r, Math.PI * 1.5, Math.PI * 2, false);
    g.closePath();
    g.fillPath();

    // bas-droite
    g.beginPath();
    g.moveTo(x + w, y + h);
    g.lineTo(x + w, y + h - r);
    g.arc(x + w - r, y + h - r, r, 0, Math.PI * 0.5, false);
    g.closePath();
    g.fillPath();

    // bas-gauche
    g.beginPath();
    g.moveTo(x, y + h);
    g.lineTo(x + r, y + h);
    g.arc(x + r, y + h - r, r, Math.PI * 0.5, Math.PI, false);
    g.closePath();
    g.fillPath();
  }

  creerBarreStatut() {
    const { x, y } = this.ecranTel;
    this.txtHeure = this.creerTexte(x + 34, y + 22, this.reglages.heure || "18:42", {
      fontSize: "13px",
      fontStyle: "bold",
      color: "#ffffff",
    })
      .setOrigin(0, 0.5)
      .setDepth(8);
    this.gfxStatut = this.add.graphics().setDepth(8);
  }

  // clair = true -> éléments blancs (fond d'écran), sinon noirs (apps claires)
  majBarreStatut(clair) {
    const { x, y, largeur } = this.ecranTel;
    const couleur = clair ? 0xffffff : 0x000000;
    this.txtHeure.setColor(clair ? "#ffffff" : "#000000");

    const g = this.gfxStatut;
    g.clear();
    g.fillStyle(couleur, 1);

    // batterie
    const batX = x + largeur - 54;
    const batY = y + 17;
    g.lineStyle(1, couleur, 0.45);
    g.strokeRoundedRect(batX, batY, 22, 11, 3.5);
    g.fillRoundedRect(batX + 2, batY + 2, 16, 7, 2);
    g.fillRect(batX + 23, batY + 3.5, 1.5, 4);

    // réseau (4 barres)
    const sigX = batX - 24;
    [4, 6, 8, 10].forEach((hh, i) => {
      g.fillRoundedRect(sigX + i * 5, batY + 11 - hh, 3, hh, 1);
    });
  }

  creerIleDynamique() {
    const { x, y, largeur } = this.ecranTel;
    const g = this.add.graphics().setDepth(11);
    g.fillStyle(0x000000, 1);
    g.fillRoundedRect(x + largeur / 2 - 44, y + 10, 88, 25, 12.5);
    g.fillStyle(0x16161e, 1);
    g.fillCircle(x + largeur / 2 + 28, y + 22.5, 4.5);
    g.fillStyle(0x2a2a40, 1);
    g.fillCircle(x + largeur / 2 + 28, y + 22.5, 2);
  }

  creerIndicateurAccueil() {
    const { x, y, largeur, hauteur } = this.ecranTel;
    this.gfxIndicateur = this.add.graphics().setDepth(8);

    // zone cliquable : revient à l'accueil du téléphone
    this.zoneAccueil = this.add
      .zone(x + largeur / 2, y + hauteur - 14, 140, 28)
      .setDepth(9)
      .setInteractive({ useHandCursor: true });
    this.zoneAccueil.on("pointerdown", () => {
      if (this.ecranCourant !== "accueil") this.afficherEcran("accueil");
    });
  }

  majIndicateur(clair) {
    const { x, y, largeur, hauteur } = this.ecranTel;
    const g = this.gfxIndicateur;
    g.clear();
    g.fillStyle(clair ? 0xffffff : 0x000000, clair ? 0.9 : 0.85);
    g.fillRoundedRect(x + largeur / 2 - 54, y + hauteur - 12, 108, 4.5, 2.25);
  }

  creerToast() {
    const { x, y, largeur, hauteur } = this.ecranTel;
    this.toast = this.add.container(x + largeur / 2, y + hauteur - 70).setDepth(12).setAlpha(0);
    const fond = this.add.graphics();
    fond.fillStyle(0x1c1c1e, 0.92);
    fond.fillRoundedRect(-95, -16, 190, 32, 16);
    this.toastTexte = this.creerTexte(0, 0, "", { fontSize: "12px", color: "#ffffff" }).setOrigin(0.5);
    this.toast.add([fond, this.toastTexte]);
  }

  montrerToast(message) {
    this.toastTexte.setText(message);
    this.tweens.killTweensOf(this.toast);
    this.toast.setAlpha(0);
    this.tweens.add({ targets: this.toast, alpha: 1, duration: 150, hold: 1200, yoyo: true });
  }

  secouer(objet, xBase) {
    this.tweens.killTweensOf(objet);
    objet.setX(xBase);
    this.tweens.add({
      targets: objet,
      x: xBase + 4,
      duration: 45,
      yoyo: true,
      repeat: 3,
      onComplete: () => objet.setX(xBase),
    });
  }

  /* ============================================================
   *  ÉCRAN D'ACCUEIL : fond d'écran + carte du propriétaire + icônes
   * ============================================================ */
  construireAccueil() {
    const { x, y, largeur, hauteur } = this.ecranTel;
    const { proprietaire, etiquette, couleurProprietaire, fondEcran, teinteFond } = this.reglages;
    this.ecranAccueil.removeAll(true);

    // --- fond d'écran, recadré pour remplir l'écran sans se déformer ---
    const cleFond = this.textures.exists(fondEcran) ? fondEcran : "fond_ecran";
    if (this.textures.exists(cleFond)) {
      const img = this.add.image(0, 0, cleFond).setOrigin(0, 0);
      const iw = img.width;
      const ih = img.height;
      const echelle = Math.max(largeur / iw, hauteur / ih);
      const cw = largeur / echelle;
      const ch = hauteur / echelle;
      const cx = (iw - cw) / 2;
      const cy = (ih - ch) / 2;

      try {
        img.setScale(echelle);
        img.setPosition(x - cx * echelle, y - cy * echelle);
        img.setCrop(cx, cy, cw, ch);
      } catch (e) {
        // secours : l'image est simplement étirée à la taille de l'écran
        img.setCrop();
        img.setScale(1);
        img.setDisplaySize(largeur, hauteur);
        img.setPosition(x, y);
      }

      // teinte de secours quand le téléphone partage le fond d'écran commun
      if (teinteFond && cleFond === "fond_ecran") img.setTint(teinteFond);

      this.ecranAccueil.add(img);
    } else {
      const fond = this.add.graphics();
      fond.fillStyle(0x1f2a44, 1);
      fond.fillRect(x, y, largeur, hauteur);
      this.ecranAccueil.add(fond);
    }

    // léger voile pour que les textes restent lisibles
    const voile = this.add.graphics();
    voile.fillStyle(0x000000, 0.12);
    voile.fillRect(x, y, largeur, hauteur);
    this.ecranAccueil.add(voile);

    // --- carte du propriétaire (on voit tout de suite à qui est le téléphone) ---
    const wx = x + 14;
    const wy = y + 56;
    const wl = largeur - 28;
    const wh = 62;
    const widget = this.add.graphics();
    widget.fillStyle(0xffffff, 0.22);
    widget.fillRoundedRect(wx, wy, wl, wh, 18);
    widget.lineStyle(1, 0xffffff, 0.3);
    widget.strokeRoundedRect(wx, wy, wl, wh, 18);
    this.ecranAccueil.add(widget);

    const avatarProprio = this.creerAvatar(wx + 34, wy + wh / 2, 20, {
      nom: proprietaire,
      couleur: couleurProprietaire,
    });
    const nomProprio = this.creerTexte(wx + 66, wy + 14, proprietaire, {
      fontSize: "17px",
      fontStyle: "bold",
      color: "#ffffff",
    }).setShadow(0, 1, "#000000", 3, false, true);
    const etiquetteProprio = this.creerTexte(wx + 66, wy + 37, etiquette, {
      fontSize: "11px",
      color: "#ffffff",
    })
      .setAlpha(0.85)
      .setShadow(0, 1, "#000000", 3, false, true);
    this.ecranAccueil.add([...avatarProprio, nomProprio, etiquetteProprio]);

    // --- icônes ---
    const apps = [
      { cle: "icon_messages", nom: "Messages", actif: true },
      { cle: "icon_gallery", nom: "Photos" },
      { cle: "icon_snake", nom: "Snake" },
      { cle: "icon_setting", nom: "Réglages" },
      { cle: "icon_social", nom: "Social" },
      { cle: "icon_save", nom: "Sauvegarde" },
    ];

    const COLONNES = 4;
    const TAILLE = 54;
    const pasX = largeur / COLONNES;
    const debutY = y + 144;
    const pasY = 94;

    apps.forEach((app, i) => {
      const col = i % COLONNES;
      const ligne = Math.floor(i / COLONNES);
      const cx = x + pasX * (col + 0.5);
      const cy = debutY + ligne * pasY + TAILLE / 2;

      const appC = this.add.container(cx, cy);

      if (this.textures.exists(app.cle)) {
        appC.add(this.add.image(0, 0, app.cle).setDisplaySize(TAILLE, TAILLE));
      } else {
        // carré arrondi de secours si l'image n'est pas chargée
        const g = this.add.graphics();
        g.fillStyle(app.actif ? 0x34c759 : 0x636366, 1);
        g.fillRoundedRect(-TAILLE / 2, -TAILLE / 2, TAILLE, TAILLE, 12);
        appC.add(g);
      }

      appC.add(
        this.creerTexte(0, TAILLE / 2 + 6, app.nom, { fontSize: "11px", color: "#ffffff" })
          .setOrigin(0.5, 0)
          .setShadow(0, 1, "#000000", 3, false, true)
      );

      // pastille rouge "messages non lus" sur l'icône Messages
      if (app.actif) {
        const fondBadge = this.add.circle(0, 0, 9, 0xff3b30).setStrokeStyle(1.5, 0xffffff, 0.9);
        this.badgeTexte = this.creerTexte(0, 0, "1", {
          fontSize: "11px",
          fontStyle: "bold",
          color: "#ffffff",
        }).setOrigin(0.5);
        this.badgeMessages = this.add.container(TAILLE / 2 - 3, -TAILLE / 2 + 3, [
          fondBadge,
          this.badgeTexte,
        ]);
        appC.add(this.badgeMessages);
      }

      const zone = this.add.zone(0, 9, TAILLE + 10, 80).setInteractive({ useHandCursor: true });
      zone.on("pointerdown", () => appC.setScale(0.92));
      zone.on("pointerout", () => appC.setScale(1));
      zone.on("pointerup", () => {
        appC.setScale(1);
        if (app.actif) {
          this.afficherEcran("liste");
        } else {
          this.secouer(appC, cx);
          this.montrerToast("Application indisponible");
        }
      });
      appC.add(zone);

      this.ecranAccueil.add(appC);
    });
  }

  majBadge() {
    if (!this.badgeMessages) return;
    const n = this.messagesNonLus();
    this.badgeMessages.setVisible(n > 0);
    this.badgeTexte.setText(String(n));
  }

  /* ============================================================
   *  APP MESSAGES : LISTE DES CONVERSATIONS
   * ============================================================ */
  construireListe() {
    const { x, y, largeur, hauteur } = this.ecranTel;
    const { proprietaire, couleurProprietaire } = this.reglages;
    this.ecranListe.removeAll(true);

    const fond = this.add.graphics();
    fond.fillStyle(0xffffff, 1);
    fond.fillRect(x, y, largeur, hauteur);
    this.ecranListe.add(fond);

    const retour = this.creerTexte(x + 14, y + 52, "‹ Accueil", {
      fontSize: "16px",
      color: "#007aff",
    }).setInteractive({ useHandCursor: true });
    retour.on("pointerdown", () => this.afficherEcran("accueil"));

    // pastille du propriétaire (en haut à droite)
    const nomProprio = this.creerTexte(x + largeur - 14, y + 61, proprietaire, {
      fontSize: "12px",
      fontStyle: "bold",
      color: GRIS_TEXTE,
    }).setOrigin(1, 0.5);
    const miniAvatar = this.creerAvatar(x + largeur - 14 - nomProprio.width - 12, y + 61, 9, {
      nom: proprietaire,
      couleur: couleurProprietaire,
    });

    const titre = this.creerTexte(x + 16, y + 76, "Messages", {
      fontSize: "30px",
      fontStyle: "bold",
      color: "#000000",
    });

    // barre de recherche
    const recherche = this.add.graphics();
    recherche.fillStyle(GRIS_BULLE, 1);
    recherche.fillRoundedRect(x + 14, y + 120, largeur - 28, 34, 10);
    recherche.lineStyle(1.6, 0x8e8e93, 1);
    recherche.strokeCircle(x + 30, y + 136, 5);
    recherche.beginPath();
    recherche.moveTo(x + 34, y + 140);
    recherche.lineTo(x + 38, y + 144);
    recherche.strokePath();
    const placeholder = this.creerTexte(x + 46, y + 137, "Rechercher", {
      fontSize: "14px",
      color: GRIS_TEXTE,
    }).setOrigin(0, 0.5);

    this.ecranListe.add([retour, nomProprio, ...miniAvatar, titre, recherche, placeholder]);

    // lignes de conversation
    const debut = y + 168;
    const hauteurLigne = 66;

    this.obtenirLignes().forEach(({ contact, nonLu }, i) => {
      const ry = debut + i * hauteurLigne;

      const zone = this.add
        .rectangle(x + largeur / 2, ry + hauteurLigne / 2, largeur, hauteurLigne, 0xd1d1d6, 0)
        .setInteractive({ useHandCursor: true });
      zone.on("pointerover", () => zone.setFillStyle(0xd1d1d6, 0.45));
      zone.on("pointerout", () => zone.setFillStyle(0xd1d1d6, 0));
      zone.on("pointerdown", () => this.ouvrirConversation(contact));

      const avatar = this.creerAvatar(x + 14 + 22, ry + hauteurLigne / 2, 22, contact);

      const nom = this.creerTexte(x + 70, ry + 11, contact.nom, {
        fontSize: "15px",
        fontStyle: "bold",
        color: "#000000",
      });
      const heure = this.creerTexte(x + largeur - 28, ry + 12, contact.heure || "", {
        fontSize: "13px",
        color: GRIS_TEXTE,
      }).setOrigin(1, 0);
      const chevron = this.creerTexte(x + largeur - 14, ry + 9, "›", {
        fontSize: "18px",
        color: "#c7c7cc",
      }).setOrigin(1, 0);
      const apercu = this.creerTexte(x + 70, ry + 31, contact.apercu, {
        fontSize: "13px",
        fontStyle: nonLu ? "bold" : "normal",
        color: nonLu ? "#000000" : GRIS_TEXTE,
        wordWrap: { width: largeur - 90 },
        maxLines: 2,
      });
      const separateur = this.add.rectangle(
        x + 70 + (largeur - 70) / 2,
        ry + hauteurLigne - 0.5,
        largeur - 70,
        1,
        GRIS_LIGNE
      );

      const elements = [zone, ...avatar, nom, heure, chevron, apercu, separateur];

      // point bleu "non lu" à gauche de l'avatar, comme sur iPhone
      if (nonLu) {
        elements.push(this.add.circle(x + 7, ry + hauteurLigne / 2, 4.5, BLEU_IOS));
      }

      this.ecranListe.add(elements);
    });
  }

  /* ============================================================
   *  APP MESSAGES : UNE CONVERSATION (bulles façon iMessage)
   * ============================================================ */
  ouvrirConversation(contact) {
    this.auOuvertureConversation(contact);

    const { x, y, largeur, hauteur } = this.ecranTel;
    this.ecranConversation.removeAll(true);

    const HAUT = 96; // hauteur de l'en-tête (barre d'état comprise)
    const BAS = 82; // barre de saisie + indicateur d'accueil
    const zoneHaut = y + HAUT + 8;
    const zoneBas = y + hauteur - BAS - 6;
    this.zoneMessages = { haut: zoneHaut, bas: zoneBas };

    // fond blanc
    const fond = this.add.graphics();
    fond.fillStyle(0xffffff, 1);
    fond.fillRect(x, y, largeur, hauteur);
    this.ecranConversation.add(fond);

    // --- les bulles (dans un conteneur qu'on peut faire défiler) ---
    this.contenuMessages = this.add.container(0, 0);
    this.ecranConversation.add(this.contenuMessages);
    this.itemsMessages = [];

    const largeurMaxBulle = largeur * 0.72;
    const rempH = 12;
    const rempV = 8;
    let curseur = zoneHaut;

    // horodatage centré
    const stamp = this.creerTexte(x + largeur / 2, curseur, contact.horodatage || "Aujourd'hui", {
      fontSize: "11px",
      color: GRIS_TEXTE,
    }).setOrigin(0.5, 0);
    this.contenuMessages.add(stamp);
    this.itemsMessages.push({ haut: curseur, bas: curseur + 14, objets: [stamp] });
    curseur += 14 + 10;

    contact.messages.forEach((msg, i) => {
      const estMoi = msg.expediteur === "moi";
      const suivant = contact.messages[i + 1];
      const dernierDuGroupe = !suivant || suivant.expediteur !== msg.expediteur;

      const texte = this.creerTexte(0, 0, msg.texte, {
        fontSize: "14px",
        color: estMoi ? "#ffffff" : "#000000",
        wordWrap: { width: largeurMaxBulle - rempH * 2 },
      }).setLineSpacing(2);

      const l = Math.max(texte.width + rempH * 2, 36);
      const h = texte.height + rempV * 2;
      const bx = estMoi ? x + largeur - 12 - l : x + 12;
      const rayon = Math.min(18, h / 2);
      const petit = dernierDuGroupe ? 4 : rayon; // la "queue" de la bulle

      const g = this.add.graphics();
      g.fillStyle(estMoi ? BLEU_IOS : GRIS_BULLE, 1);
      g.fillRoundedRect(bx, curseur, l, h, {
        tl: rayon,
        tr: rayon,
        bl: estMoi ? rayon : petit,
        br: estMoi ? petit : rayon,
      });
      texte.setPosition(bx + rempH, curseur + rempV);

      this.contenuMessages.add([g, texte]);
      const objets = [g, texte];
      const item = { haut: curseur, bas: curseur + h, objets };
      this.itemsMessages.push(item);

      // "Distribué" sous le dernier message envoyé
      if (estMoi && !suivant) {
        const distribue = this.creerTexte(x + largeur - 14, curseur + h + 2, "Distribué", {
          fontSize: "10px",
          color: GRIS_TEXTE,
        }).setOrigin(1, 0);
        this.contenuMessages.add(distribue);
        objets.push(distribue);
        item.bas = curseur + h + 14;
        curseur += 14;
      }

      curseur += h + (dernierDuGroupe ? 10 : 3);
    });

    // apparition progressive des bulles
    this.itemsMessages.forEach((item, i) => {
      item.objets.forEach((o) => {
        o.setAlpha(0);
        this.tweens.add({ targets: o, alpha: 1, duration: 180, delay: i * 70 });
      });
    });

    // défilement : si ça dépasse, on affiche le bas de la conversation
    this.decalageMin = Math.min(0, zoneBas - 4 - curseur);
    this.decalage = this.decalageMin;
    this.appliquerDecalage(this.decalage);

    // --- en-tête (dessiné APRÈS les bulles pour les recouvrir) ---
    const entete = this.add.graphics();
    entete.fillStyle(GRIS_BARRE, 1);
    entete.fillRect(x, y, largeur, HAUT);
    entete.fillStyle(GRIS_LIGNE, 1);
    entete.fillRect(x, y + HAUT - 1, largeur, 1);
    this.ecranConversation.add(entete);

    const retour = this.creerTexte(x + 10, y + 62, "‹ Messages", {
      fontSize: "16px",
      color: "#007aff",
    })
      .setOrigin(0, 0.5)
      .setInteractive({ useHandCursor: true });
    retour.on("pointerdown", () => this.afficherEcran("liste"));
    this.ecranConversation.add(retour);

    const avatar = this.creerAvatar(x + largeur / 2, y + 62, 16, contact);
    this.ecranConversation.add(avatar);

    const nomEntete = this.creerTexte(x + largeur / 2, y + 80, contact.nom, {
      fontSize: "11px",
      color: "#000000",
    }).setOrigin(0.5, 0);
    this.ecranConversation.add(nomEntete);

    // --- barre de saisie (décorative) ---
    const barre = this.add.graphics();
    const barreY = y + hauteur - BAS;
    const centreBarre = barreY + 27;
    barre.fillStyle(0xffffff, 1);
    barre.fillRect(x, barreY, largeur, BAS);
    barre.fillStyle(GRIS_LIGNE, 1);
    barre.fillRect(x, barreY, largeur, 1);

    // bouton "+"
    barre.fillStyle(GRIS_BULLE, 1);
    barre.fillCircle(x + 26, centreBarre, 14);
    barre.lineStyle(2, 0x8e8e93, 1);
    barre.beginPath();
    barre.moveTo(x + 20, centreBarre);
    barre.lineTo(x + 32, centreBarre);
    barre.moveTo(x + 26, centreBarre - 6);
    barre.lineTo(x + 26, centreBarre + 6);
    barre.strokePath();

    // champ de texte
    barre.lineStyle(1, 0xc7c7cc, 1);
    barre.strokeRoundedRect(x + 48, centreBarre - 16, largeur - 62, 32, 16);
    const champ = this.creerTexte(x + 62, centreBarre, "iMessage", {
      fontSize: "14px",
      color: "#c7c7cc",
    }).setOrigin(0, 0.5);

    this.ecranConversation.add([barre, champ]);

    this.afficherEcran("conversation");
  }

  // Déplace les bulles et cache celles qui sortiraient de la zone visible
  appliquerDecalage(valeur) {
    if (!this.contenuMessages || !this.zoneMessages) return;

    this.decalage = Phaser.Math.Clamp(valeur, this.decalageMin, 0);
    this.contenuMessages.y = this.decalage;

    const { haut, bas } = this.zoneMessages;
    this.itemsMessages.forEach((item) => {
      const visible = item.haut + this.decalage >= haut - 2 && item.bas + this.decalage <= bas + 2;
      item.objets.forEach((o) => o.setVisible(visible));
    });
  }

  /* ============================================================
   *  NAVIGATION
   * ============================================================ */
  afficherEcran(nom) {
    this.ecranCourant = nom;

    if (nom === "liste") this.construireListe(); // met à jour ordre / non lus
    if (nom === "accueil") this.majBadge();

    this.ecranAccueil.setVisible(nom === "accueil");
    this.ecranListe.setVisible(nom === "liste");
    this.ecranConversation.setVisible(nom === "conversation");

    const clair = nom === "accueil"; // texte blanc sur le fond d'écran
    this.majBarreStatut(clair);
    this.majIndicateur(clair);
  }

  fermerTelephone() {
    const parent = this.sceneParente;
    this.scene.stop();
    // on relance la scène d'origine seulement si elle est bien en pause
    if (parent && this.scene.get(parent) && this.scene.isPaused(parent)) {
      this.scene.resume(parent);
    }
  }
}