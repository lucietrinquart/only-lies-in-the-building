import PlancheBD from "./planche-bd.js";


/* ============================================================
 *  PLANCHE DE BD N°1
 *  ------------------------------------------------------------
 *  C'est ICI et SEULEMENT ici que tu configures cette planche :
 *  positions des vignettes, tailles, sons. Le reste (fondu, délai,
 *  flèche...) est géré automatiquement par PlancheBD.
 * ============================================================ */
export default class bd_gregoire extends PlancheBD {
  constructor() {
    super("bd_gregoire"); // clé de la scène (à utiliser dans this.scene.start("bd_gregoire"))
  }

  obtenirConfig() {
    return {
      // NOUVEAU : change cette valeur (en millisecondes) pour accélérer/ralentir
      // l'apparition des vignettes. 5000 = 5 secondes entre chaque vignette.
      delaiEntreVignettes: 1000,

      // Scène lancée quand on clique sur la flèche, une fois toutes les vignettes affichées
      sceneSuivante: "menu",

      // ============================================================
      //  LES VIGNETTES -- une ligne par vignette, dans l'ordre d'apparition
      // ============================================================
      //  cle       : la clé de texture (chargée dans le preload global)
      //  x, y      : position du CENTRE de la vignette à l'écran
      //  largeur/hauteur : taille d'affichage voulue (ajuste librement)
      //  son       : (optionnel) clé du bruitage à jouer à l'apparition -> enlève la ligne si pas de son
      vignettes: [
        {
          cle: "bulle1_autre",
          x: 160,
          y: 150,
          largeur: 280,
          hauteur: 170,
        },
        {
          cle: "bulle2_autre",
          x: 430,
          y: 150,
          largeur: 210,
          hauteur: 170,
          // pas de "son" ici -> aucun bruitage pour cette vignette
        },
        {
          cle: "bulle3_autre",
          x: 660,
          y: 150,
          largeur: 200,
          hauteur: 170,
          son: "brouha",
        },
        {
          cle: "bulle4_autre",
          x: 230,
          y: 400,
          largeur: 420,
          hauteur: 200,
        },
        {
          cle: "bulle5_autre",
          x: 590,
          y: 400,
          largeur: 200,
          hauteur: 180,
        },
      ],
    };
  }
}