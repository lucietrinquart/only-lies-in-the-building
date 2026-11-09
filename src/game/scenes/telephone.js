import TelephoneBase from "./telephone_base.js";

// Conversations d'Adrien
const contacts = [
  {
    nom: "V",
    apercu: "Ne le dis à...",
    heure: "Hier",
    horodatage: "Hier 18:32",
    couleur: 0x5e5ce6,
    messages: [
      { expediteur: "V", texte: "Bon maintenant que tu sais tout il faut qu'on s'explique" },
      { expediteur: "V", texte: "Tu devras faire le bon choix." },
      { expediteur: "moi", texte: "Cette fois-ci tu m'expliqueras tout." },
      { expediteur: "V", texte: "Ne le dis à personne. Rejoins moi au Bar La gorge Fraîche." },
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
    apercu: "Rentrez bien bi...",
    heure: "Dim.",
    horodatage: "Dimanche 10:20",
    couleur: 0xff375f,
    messages: [
      { expediteur: "moi", texte: "Coucou, merci pour le gâteau." },
      { expediteur: "moi", texte: "Violette a adoré!" },
      { expediteur: "Elisa", texte: "Rentrez bien bisous" },
    ],
  },
  {
    nom: "Papa",
    apercu: "Oui elle me l'...",
    heure: "Sam.",
    horodatage: "Samedi 17:45",
    couleur: 0x30b0c7,
    messages: [
      { expediteur: "Elisa", texte: "Maman t'as donné le cadeau" },
      { expediteur: "moi", texte: "Oui elle me l'a donné avant de partir" },
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