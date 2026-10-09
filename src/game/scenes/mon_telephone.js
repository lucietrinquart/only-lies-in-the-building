import * as Phaser from "phaser";

// ============================================
//  DONNÉES DES CONVERSATIONS
//  (tu peux ajouter d'autres contacts ici facilement)
// ============================================
const contacts = [
  {
    nom: "Michel",
    apercu: "Rejoins moi tu sais où avec...",
    messages: [
      { expediteur: "Michel", texte: "Ne m'oblige pas à me répéter" },
      { expediteur: "Michel", texte: "Tu viens à 19h avec le paquet" },
      { expediteur: "moi", texte: "Oui oui désolé je serais là" },
      { expediteur: "Michel", texte: "Rejoins moi tu sais où avec tu sais quoi" },
    ],
  },
];
const contacts2 = [
  {
    nom: "Elisa",
    apercu: "Oublie pas de prendre le...",
    messages: [
      { expediteur: "moi", texte: "Coucou comment ça va ?" },
      { expediteur: "moi", texte: "J'ai pas voulu te reveiller je vais au boulot" },
      { expediteur: "Elisa", texte: "Pas de soucis par contre il pleut" },
      { expediteur: "Elisa", texte: "Oublie pas de prendre le parapluie" },
    ],
  },
];

const contacts3 = [
  {
    nom: "Maman",
    apercu: "Oublie pas de prendre le...",
    messages: [
      { expediteur: "moi", texte: "Coucou comment ça va ?" },
      { expediteur: "moi", texte: "J'ai pas voulu te reveiller je vais au boulot" },
      { expediteur: "Elisa", texte: "Pas de soucis par contre il pleut" },
      { expediteur: "Elisa", texte: "Oublie pas de prendre le parapluie" },
    ],
  },
];

const contacts4 = [
  {
    nom: "Papa",
    apercu: "Oublie pas de prendre le...",
    messages: [
      { expediteur: "moi", texte: "Coucou comment ça va ?" },
      { expediteur: "moi", texte: "J'ai pas voulu te reveiller je vais au boulot" },
      { expediteur: "Elisa", texte: "Pas de soucis par contre il pleut" },
      { expediteur: "Elisa", texte: "Oublie pas de prendre le parapluie" },
    ],
  },
];

const CLE_VICTOR_RECU = "victor_message_recu";
const CLE_VICTOR_LU = "victor_message_lu";

const contactVictor = {
  nom: "Victor",
  apercu: "Tu peux venir quand tu veux",
  messages: [
    { expediteur: "Victor", texte: "Je sens qu'en ce moment tu ne te sens pas très bien" },
    { expediteur: "Victor", texte: "Tu sais que tu as les clés de chez moi" },
    { expediteur: "Victor", texte: "Tu peux venir quand tu veux" },
  ],
};

export default class mon_telephone extends Phaser.Scene {
  constructor() {
    super({ key: "mon_telephone" });
  }

  preload() {
    this.load.image("fond_telephone", "./assets/telephone_fond.png");
    this.load.image("icone_message", "./assets/icone_message.png");
    this.load.image("icone_message2", "./assets/icone_message.png");

  }

  create() {
    this.scene.bringToTop(); // NOUVEAU : s'assure d'être affichée par-dessus la scène parente
    const largeurJeu = this.cameras.main.width; // 800
    const hauteurJeu = this.cameras.main.height; // 608

    // Fond semi-transparent derrière le téléphone
    this.add.rectangle(largeurJeu / 2, hauteurJeu / 2, largeurJeu, hauteurJeu, 0x000000, 0.6);

    // Image du téléphone (la coque + l'écran, en un seul PNG)
    const largeurTelephone = largeurJeu * 0.9;
    const hauteurTelephone = hauteurJeu * 1.2;
    this.fond = this.add
      .image(largeurJeu / 2, hauteurJeu / 2, "fond_telephone")
      .setDisplaySize(largeurTelephone, hauteurTelephone);

    // ============================================================
    //  ZONE D'ÉCRAN DU TÉLÉPHONE — C'EST ICI QUE TU AJUSTES TOUT !
    // ============================================================
    // Ce sont les 4 valeurs à retoucher pour que le contenu colle
    // pile à l'écran noir visible sur ton PNG. Elles sont exprimées
    // en % de la largeur/hauteur du sprite "fond_telephone".
    // Exemple : si sur ton image l'écran commence à 8% du bord gauche,
    // finit à 92%, commence à 6% du haut et finit à 88% du bas :
    const MARGE_GAUCHE = 0.35;
    const MARGE_DROITE = 0.37;
    const MARGE_HAUT = 0.23;
    const MARGE_BAS = 0.4;

    this.ecranTel = {
      x: this.fond.x - largeurTelephone / 2 + largeurTelephone * MARGE_GAUCHE,
      y: this.fond.y - hauteurTelephone / 2 + hauteurTelephone * MARGE_HAUT,
      largeur: largeurTelephone * (1 - MARGE_GAUCHE - MARGE_DROITE),
      hauteur: hauteurTelephone * (1 - MARGE_HAUT - MARGE_BAS),
    };
    // this.ecranTel.x/.y = coin HAUT-GAUCHE de l'écran (pas le centre !)

    // Petit rectangle de debug pour VISUALISER la zone d'écran pendant les réglages.
    // Mets DEBUG_ZONE à false une fois que ça te convient.

    // ---------------------------------
    // ÉCRAN 1 : ACCUEIL DU TÉLÉPHONE
    // ---------------------------------
    this.ecranAccueil = this.add.container(0, 0);

    const centreX = this.ecranTel.x + this.ecranTel.largeur / 2;
    const centreY = this.ecranTel.y + this.ecranTel.hauteur / 2;

    this.iconeMessages = this.add
      .image(centreX, centreY, "icone_message")
      .setInteractive({ useHandCursor: true });
    // On force la taille de l'icône à une fraction de l'écran plutôt qu'un setScale fixe,
    // comme ça elle s'adapte automatiquement si tu changes la taille du téléphone.
    this.iconeMessages.setDisplaySize(this.ecranTel.largeur * 0.35, this.ecranTel.largeur * 0.35);

    this.iconeMessages.on("pointerdown", () => this.afficherEcran("liste"));
    this.ecranAccueil.add(this.iconeMessages);

    this.badge = this.add.circle(
  this.iconeMessages.x + this.iconeMessages.displayWidth / 2 - 4,
  this.iconeMessages.y - this.iconeMessages.displayHeight / 2 + 4,
  7,
  0xff3b30
);
this.ecranAccueil.add(this.badge);

    // ---------------------------------
    // ÉCRAN 2 : LISTE DES CONVERSATIONS
    // ---------------------------------
    this.ecranListe = this.add.container(0, 0);
    this.ecranListe.setVisible(false);
    this.construireListeConversations();

    // ---------------------------------
    // ÉCRAN 3 : CONVERSATION OUVERTE
    // ---------------------------------
    this.ecranConversation = this.add.container(0, 0);
    this.ecranConversation.setVisible(false);

    // ---------------------------------
    // MASQUE : coupe tout ce qui dépasserait de la zone d'écran
    // ---------------------------------
  const formeMasque = this.make.graphics({ add: false });
  formeMasque.fillStyle(0xffffff);
  formeMasque.fillRect(
    this.ecranTel.x,
    this.ecranTel.y,
    this.ecranTel.largeur,
    this.ecranTel.hauteur
  );

  [this.ecranAccueil, this.ecranListe, this.ecranConversation].forEach((conteneur) => {
    try {
      conteneur.enableFilters();
      conteneur.filters.internal.addMask(formeMasque);
    } catch (e) {
      console.warn("Masque du téléphone non appliqué :", e);
    }
  });

    // ---------------------------------
    // BOUTON FERMER LE TÉLÉPHONE
    // ---------------------------------
    // CORRIGÉ : avant, la position utilisait "+ largeurTelephone" et
    // "- hauteurTelephone" (la largeur/hauteur ENTIÈRE du téléphone, pas la
    // moitié) -> le bouton se retrouvait très loin en dehors du canvas.
    // Comme ton téléphone dépasse même de l'écran (hauteurTelephone = 120%
    // de la hauteur du jeu), le plus fiable est de fixer la croix à une
    // position ABSOLUE dans le coin de l'écran, indépendante de la taille
    // de l'image du téléphone -> elle reste toujours visible et cliquable.
    const boutonFermer = this.add
      .text(largeurJeu - 20, 20, "✕", {
        font: "28px Arial",
        fill: "#ffffff",
      })
      .setOrigin(1, 0) // ancré par son coin haut-droit -> reste bien dans l'écran
      .setDepth(10000) // NOUVEAU : toujours au-dessus de tout le reste du téléphone
      .setScrollFactor(0)
      .setInteractive({ useHandCursor: true });

    boutonFermer.on("pointerdown", () => this.fermerTelephone());

    this.afficherEcran("accueil");
  }

construireListeConversations() {
  this.ecranListe.removeAll(true);

  const { x, y, largeur } = this.ecranTel;
  const padding = 12;

  const boutonRetourAccueil = this.add
    .text(x + padding, y + padding, "< Accueil", { font: "14px Arial", fill: "#ffffff" })
    .setInteractive({ useHandCursor: true });
  boutonRetourAccueil.on("pointerdown", () => this.afficherEcran("accueil"));
  this.ecranListe.add(boutonRetourAccueil);

  const victorRecu = this.registry.get(CLE_VICTOR_RECU) || false;
  const victorLu = this.registry.get(CLE_VICTOR_LU) || false;

  const lignes = [];
  if (victorRecu) lignes.push({ contact: contactVictor, nonLu: !victorLu });
  [...contacts, ...contacts2, ...contacts3, ...contacts4].forEach((c) =>
    lignes.push({ contact: c, nonLu: false })
  );

  const largeurLigne = largeur - padding * 2;
  const centreXEcran = x + largeur / 2;

  lignes.forEach(({ contact, nonLu }, index) => {
    const ligneY = y + 56 + index * 48;

    const fondLigne = this.add
      .rectangle(centreXEcran, ligneY, largeurLigne, 42, nonLu ? 0x2c2c2e : 0x1c1c1e)
      .setInteractive({ useHandCursor: true });

    const nomTexte = this.add.text(x + padding + 6, ligneY - 14, contact.nom, {
      font: nonLu ? "bold 14px Arial" : "14px Arial",
      fill: "#ffffff",
    });

    const apercuTexte = this.add.text(x + padding + 6, ligneY + 2, contact.apercu, {
      font: nonLu ? "bold 11px Arial" : "11px Arial",
      fill: nonLu ? "#ffffff" : "#9a9a9a",
      wordWrap: { width: largeurLigne - padding * 2 },
    });

    fondLigne.on("pointerdown", () => this.ouvrirConversation(contact));
    this.ecranListe.add([fondLigne, nomTexte, apercuTexte]);

    if (nonLu) {
      this.ecranListe.add(this.add.circle(x + largeur - padding - 10, ligneY, 5, 0x0b93f6));
    }
  });
}

  // Reconstruit l'écran de conversation à chaque ouverture
  ouvrirConversation(contact) {
    if (contact === contactVictor) this.registry.set(CLE_VICTOR_LU, true);
    this.ecranConversation.removeAll(true);

    const { x, y, largeur } = this.ecranTel;
    const padding = 12;
    const centreXEcran = x + largeur / 2;

    const boutonRetour = this.add
      .text(x + padding, y + padding, "<", { font: "14px Arial", fill: "#ffffff" })
      .setInteractive({ useHandCursor: true });
    boutonRetour.on("pointerdown", () => this.afficherEcran("liste"));
    this.ecranConversation.add(boutonRetour);

    const titre = this.add
      .text(centreXEcran, y + padding, contact.nom, {
        font: "bold 15px Arial",
        fill: "#ffffff",
      })
      .setOrigin(0.5, 0);
    this.ecranConversation.add(titre);

    let curseurY = y + 55;
    const centreGauche = x + largeur * 0.28;
    const centreDroite = x + largeur * 0.72;
    const largeurMaxBulle = largeur * 0.55;

    contact.messages.forEach((msg) => {
      const estMoi = msg.expediteur === "moi";
      const couleurBulle = estMoi ? 0x0b93f6 : 0x3a3a3c;
      const posX = estMoi ? centreDroite : centreGauche;

      const texte = this.add
        .text(0, 0, msg.texte, {
          font: "12px Arial",
          fill: "#ffffff",
          wordWrap: { width: largeurMaxBulle - 20 },
        })
        .setOrigin(0.5);

      const largeurBulle = texte.width + 20;
      const hauteurBulle = texte.height + 14;

      const bulle = this.add
        .rectangle(posX, curseurY, largeurBulle, hauteurBulle, couleurBulle)
        .setOrigin(0.5);

      texte.setPosition(posX, curseurY);

      this.ecranConversation.add([bulle, texte]);

      curseurY += hauteurBulle + 12;
    });

    this.afficherEcran("conversation");
  }

afficherEcran(nom) {
  if (nom === "liste") this.construireListeConversations(); // met à jour gras / ordre
  this.ecranAccueil.setVisible(nom === "accueil");
  this.ecranListe.setVisible(nom === "liste");
  this.ecranConversation.setVisible(nom === "conversation");

  if (this.badge) {
    const recu = this.registry.get(CLE_VICTOR_RECU) || false;
    const lu = this.registry.get(CLE_VICTOR_LU) || false;
    this.badge.setVisible(recu && !lu);
  }
}

  fermerTelephone() {
    this.scene.stop();
  }
}