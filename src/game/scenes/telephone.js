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

export default class Telephone extends Phaser.Scene {
  constructor() {
    super({ key: "Telephone" });
  }

  preload() {
    this.load.image("fond_telephone", "./assets/telephone_fond.png");
    this.load.image("icone_message", "./assets/icone_message.png");
  }

  create() {
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
    const formeMasque = this.make.graphics();
    formeMasque.fillRect(
      this.ecranTel.x,
      this.ecranTel.y,
      this.ecranTel.largeur,
      this.ecranTel.hauteur
    );
    const masque = formeMasque.createGeometryMask();
    this.ecranAccueil.setMask(masque);
    this.ecranListe.setMask(masque);
    this.ecranConversation.setMask(masque);

    // ---------------------------------
    // BOUTON FERMER LE TÉLÉPHONE (en dehors de l'écran, sur la coque, donc PAS masqué)
    // ---------------------------------
    const boutonFermer = this.add
      .text(this.fond.x + largeurTelephone / 2 +50, this.fond.y - hauteurTelephone / 2, "✕", {
        font: "28px Arial",
        fill: "#ffffff",
      })
      .setInteractive({ useHandCursor: true });

    boutonFermer.on("pointerdown", () => this.fermerTelephone());

    this.afficherEcran("accueil");
  }

  // Construit dynamiquement la liste des contacts (une seule fois, au create())
  construireListeConversations() {
    const { x, y, largeur } = this.ecranTel;
    const padding = 12;

    const boutonRetourAccueil = this.add
      .text(x + padding, y + padding, "< Accueil", { font: "14px Arial", fill: "#ffffff" })
      .setInteractive({ useHandCursor: true });
    boutonRetourAccueil.on("pointerdown", () => this.afficherEcran("accueil"));
    this.ecranListe.add(boutonRetourAccueil);

    const largeurLigne = largeur - padding * 2;
    const centreXEcran = x + largeur / 2;

    contacts.forEach((contact, index) => {
      const ligneY = y + 60 + index * 65;

      const fondLigne = this.add
        .rectangle(centreXEcran, ligneY, largeurLigne, 55, 0x1c1c1e)
        .setInteractive({ useHandCursor: true });

      const nomTexte = this.add.text(x + padding + 6, ligneY - 16, contact.nom, {
        font: "bold 14px Arial",
        fill: "#ffffff",
      });

      const apercuTexte = this.add.text(x + padding + 6, ligneY + 3, contact.apercu, {
        font: "11px Arial",
        fill: "#9a9a9a",
        wordWrap: { width: largeurLigne - padding * 2 },
      });

      fondLigne.on("pointerdown", () => this.ouvrirConversation(contact));

      this.ecranListe.add([fondLigne, nomTexte, apercuTexte]);
    });
    contacts2.forEach((contact, index) => {
      const ligneY = y + 120 + index * 65;

      const fondLigne = this.add
        .rectangle(centreXEcran, ligneY, largeurLigne, 55, 0x1c1c1e)
        .setInteractive({ useHandCursor: true });

      const nomTexte = this.add.text(x + padding + 6, ligneY - 16, contact.nom, {
        font: "bold 14px Arial",
        fill: "#ffffff",
      });

      const apercuTexte = this.add.text(x + padding + 6, ligneY + 3, contact.apercu, {
        font: "11px Arial",
        fill: "#9a9a9a",
        wordWrap: { width: largeurLigne - padding * 2 },
      });

      fondLigne.on("pointerdown", () => this.ouvrirConversation(contact));

      this.ecranListe.add([fondLigne, nomTexte, apercuTexte]);
    });

    contacts3.forEach((contact, index) => {
      const ligneY = y + 180 + index * 65;

      const fondLigne = this.add
        .rectangle(centreXEcran, ligneY, largeurLigne, 55, 0x1c1c1e)
        .setInteractive({ useHandCursor: true });

      const nomTexte = this.add.text(x + padding + 6, ligneY - 16, contact.nom, {
        font: "bold 14px Arial",
        fill: "#ffffff",
      });

      const apercuTexte = this.add.text(x + padding + 6, ligneY + 3, contact.apercu, {
        font: "11px Arial",
        fill: "#9a9a9a",
        wordWrap: { width: largeurLigne - padding * 2 },
      });

      fondLigne.on("pointerdown", () => this.ouvrirConversation(contact));

      this.ecranListe.add([fondLigne, nomTexte, apercuTexte]);
    });

    contacts4.forEach((contact, index) => {
      const ligneY = y + 240 + index * 65;

      const fondLigne = this.add
        .rectangle(centreXEcran, ligneY, largeurLigne, 55, 0x1c1c1e)
        .setInteractive({ useHandCursor: true });

      const nomTexte = this.add.text(x + padding + 6, ligneY - 16, contact.nom, {
        font: "bold 14px Arial",
        fill: "#ffffff",
      });

      const apercuTexte = this.add.text(x + padding + 6, ligneY + 3, contact.apercu, {
        font: "11px Arial",
        fill: "#9a9a9a",
        wordWrap: { width: largeurLigne - padding * 2 },
      });

      fondLigne.on("pointerdown", () => this.ouvrirConversation(contact));

      this.ecranListe.add([fondLigne, nomTexte, apercuTexte]);
    });
  }

  // Reconstruit l'écran de conversation à chaque ouverture
  ouvrirConversation(contact) {
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
    this.ecranAccueil.setVisible(nom === "accueil");
    this.ecranListe.setVisible(nom === "liste");
    this.ecranConversation.setVisible(nom === "conversation");
  }

  fermerTelephone() {
    this.scene.stop();
    this.scene.resume("gendarmerie");
  }
}