import PlancheBD from "./planche-bd.js";

/* ============================================================
 *  PLANCHE DE BD N°1
 *  ------------------------------------------------------------
 *  C'est ICI et SEULEMENT ici que tu configures cette planche :
 *  positions des vignettes, tailles, sons. Le reste (fondu, délai,
 *  flèche...) est géré automatiquement par PlancheBD.
 * ============================================================ */
export default class bd2 extends PlancheBD {
  constructor() {
    super("bd2"); // clé de la scène (à utiliser dans this.scene.start("bd"))
  }

  obtenirConfig() {
    return {
      // NOUVEAU : change cette valeur (en millisecondes) pour accélérer/ralentir
      // l'apparition des vignettes. 5000 = 5 secondes entre chaque vignette.
      delaiEntreVignettes: 1000,

      // Scène lancée quand on clique sur la flèche, une fois toutes les vignettes affichées
      sceneSuivante: "maison",

      // ============================================================
      //  LES VIGNETTES -- une ligne par vignette, dans l'ordre d'apparition
      // ============================================================
      //  cle       : la clé de texture (chargée dans le preload global)
      //  x, y      : position du CENTRE de la vignette à l'écran
      //  largeur/hauteur : taille d'affichage voulue (ajuste librement)
      //  son       : (optionnel) clé du bruitage à jouer à l'apparition -> enlève la ligne si pas de son
      vignettes: [
        {
          cle: "bulle6",
          x: 210,
          y: 150,
          largeur: 350,
          hauteur: 232,
          son: "marteau_justice", // NOUVEAU : bruitage joué à l'apparition de cette vignette
        },
        {
          cle: "bulle7",
          x: 580,
          y: 150,
          largeur: 350,
          hauteur: 232,
          // pas de "son" ici -> aucun bruitage pour cette vignette
        },
        {
          cle: "bulle8",
          x: 160,
          y: 390,
          largeur: 250,
          hauteur: 232,
          son: "brouha",
        },
        {
          cle: "bulle9",
          x: 420,
          y: 390,
          largeur: 200,
          hauteur: 232,
        },
        {
          cle: "bulle10",
          x: 650,
          y: 390,
          largeur: 200,
          hauteur: 232,
        },
      ],
    };
  }
}