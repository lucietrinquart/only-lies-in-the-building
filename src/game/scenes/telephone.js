import TelephoneBase from "./telephone_base.js";

// Conversations d'Adrien
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

export default class Telephone extends TelephoneBase {
  constructor() {
    super("Telephone", {
      proprietaire: "Adrien",
      etiquette: "Téléphone d'Adrien",
      couleurProprietaire: 0x3a6ea5, // couleur de l'avatar d'Adrien
      couleurCoque: 0x1d2b4f, // coque bleu nuit
      couleurMetal: 0x3a3a3c,
      fondEcran: "fond_ecran",
      teinteFond: null, // aucune teinte : fond d'écran d'origine
      heure: "18:42",
      sceneParenteParDefaut: "gendarmerie", // pour l'ancienne scène gendarmerie.js
      contacts,
    });
  }
}