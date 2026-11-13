import PlancheBD from "./planche-bd.js";

/* ============================================================
 *  PLANCHE DE BD N°1
 *  ------------------------------------------------------------
 *  C'est ICI et SEULEMENT ici que tu configures cette planche :
 *  positions des vignettes, tailles, sons. Le reste (fondu, délai,
 *  flèche...) est géré automatiquement par PlancheBD.
 * ============================================================ */
export default class bd_victor extends PlancheBD {
  constructor() {
    super("bd_victor"); // clé de la scène (à utiliser dans this.scene.start("bd_victor"))
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
          cle: "bulle1_victor",
          x: 230,
          y: 100,
          largeur: 330,
          hauteur: 150,
        },
        {
          cle: "bulle2_victor",
          x: 580,
          y: 100,
          largeur: 330,
          hauteur: 150,
          // pas de "son" ici -> aucun bruitage pour cette vignette
        },
        {
          cle: "bulle3_victor",
          x: 230,
          y: 270,
          largeur: 330,
          hauteur: 150,
        },
        {
          cle: "bulle4_victor",
          x: 580,
          y: 270,
          largeur: 330,
          hauteur: 150,
        },
        {
          cle: "bulle5_victor",
          x: 400,
          y: 470,
          largeur: 300,
          hauteur: 200,
        }
      ],
    };
  }
}