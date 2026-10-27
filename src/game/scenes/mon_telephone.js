import TelephoneBase from "./telephone_base.js";

const CLE_VICTOR_RECU = "victor_message_recu";
const CLE_VICTOR_LU = "victor_message_lu";

const contactVictor = {
  nom: "Victor",
  apercu: "Tu peux venir quand tu veux",
  heure: "Maintenant",
  horodatage: "Aujourd'hui 18:40",
  couleur: 0x34c759,
  messages: [
    { expediteur: "Victor", texte: "Je sens qu'en ce moment tu ne te sens pas très bien" },
    { expediteur: "Victor", texte: "Tu sais que tu as les clés de chez moi" },
    { expediteur: "Victor", texte: "Tu peux venir quand tu veux" },
  ],
};

// Conversations de Violette
const contacts = [
  {
    nom: "Michel",
    apercu: "Rejoins moi tu sais où avec...",
    heure: "Hier",
    horodatage: "Hier 18:32",
    couleur: 0x5e5ce6,
    messages: [
      { expediteur: "Michel", texte: "Ne m'oblige pas à me répéter" },
      { expediteur: "Michel", texte: "Tu viens à 19h avec le paquet" },
      { expediteur: "moi", texte: "Oui oui désolé je serais là" },
      { expediteur: "Michel", texte: "Rejoins moi tu sais où avec tu sais quoi" },
    ],
  },
  {
    nom: "Elisa",
    apercu: "Oublie pas de prendre le...",
    heure: "08:12",
    horodatage: "Aujourd'hui 08:12",
    couleur: 0xff9f0a,
    messages: [
      { expediteur: "moi", texte: "Coucou comment ça va ?" },
      { expediteur: "moi", texte: "J'ai pas voulu te reveiller je vais au boulot" },
      { expediteur: "Elisa", texte: "Pas de soucis par contre il pleut" },
      { expediteur: "Elisa", texte: "Oublie pas de prendre le parapluie" },
    ],
  },
  {
    nom: "Maman",
    apercu: "Oublie pas de prendre le...",
    heure: "Dim.",
    horodatage: "Dimanche 10:20",
    couleur: 0xff375f,
    messages: [
      { expediteur: "moi", texte: "Coucou comment ça va ?" },
      { expediteur: "moi", texte: "J'ai pas voulu te reveiller je vais au boulot" },
      { expediteur: "Elisa", texte: "Pas de soucis par contre il pleut" },
      { expediteur: "Elisa", texte: "Oublie pas de prendre le parapluie" },
    ],
  },
  {
    nom: "Papa",
    apercu: "Oublie pas de prendre le...",
    heure: "Sam.",
    horodatage: "Samedi 17:45",
    couleur: 0x30b0c7,
    messages: [
      { expediteur: "moi", texte: "Coucou comment ça va ?" },
      { expediteur: "moi", texte: "J'ai pas voulu te reveiller je vais au boulot" },
      { expediteur: "Elisa", texte: "Pas de soucis par contre il pleut" },
      { expediteur: "Elisa", texte: "Oublie pas de prendre le parapluie" },
    ],
  },
];

export default class mon_telephone extends TelephoneBase {
  constructor() {
    super("mon_telephone", {
      proprietaire: "Violette",
      etiquette: "Téléphone de Violette",
      couleurProprietaire: 0xe0559b, // couleur de l'avatar de Violette
      couleurCoque: 0xf06fa6, // coque rose
      couleurMetal: 0xd9a7b8,
      // Pour lui donner SON fond d'écran, remplace par :
      //   fondEcran: "fond_ecran_violette",
      //   fondEcranFichier: "./assets/fond_ecran_violette.png",
      //   teinteFond: null,
      fondEcran: "fond_ecran",
      teinteFond: 0xffc4e1, // teinte rose tant qu'on partage le fond d'écran d'Adrien
      heure: "18:42",
      sceneParenteParDefaut: null,
      contacts,
    });
  }

  // Victor passe en tête de liste dès que son message est arrivé
  obtenirLignes() {
    const lignes = [];
    if (this.registry.get(CLE_VICTOR_RECU)) {
      lignes.push({ contact: contactVictor, nonLu: !this.registry.get(CLE_VICTOR_LU) });
    }
    this.reglages.contacts.forEach((c) => lignes.push({ contact: c, nonLu: false }));
    return lignes;
  }

  // Ouvrir la conversation de Victor = message lu
  auOuvertureConversation(contact) {
    if (contact === contactVictor) this.registry.set(CLE_VICTOR_LU, true);
  }

  // Badge rouge sur l'icône Messages
  messagesNonLus() {
    const recu = this.registry.get(CLE_VICTOR_RECU) || false;
    const lu = this.registry.get(CLE_VICTOR_LU) || false;
    return recu && !lu ? 1 : 0;
  }
}