import PlancheBD from "./planche-bd.js";

/* ============================================================
 *  PLANCHE DE BD N°1
 *  ------------------------------------------------------------
 *  C'est ICI et SEULEMENT ici que tu configures cette planche :
 *  positions des vignettes, tailles, sons. Le reste (fondu, délai,
 *  flèche...) est géré automatiquement par PlancheBD.
 * ============================================================ */
export default class bd extends PlancheBD {
  constructor() {
    super("bd"); // clé de la scène (à utiliser dans this.scene.start("bd"))
  }

  obtenirConfig() {
    return {
      // NOUVEAU : change cette valeur (en millisecondes) pour accélérer/ralentir
      // l'apparition des vignettes. 5000 = 5 secondes entre chaque vignette.
      delaiEntreVignettes: 1000,

      // Scène lancée quand on clique sur la flèche, une fois toutes les vignettes affichées
      sceneSuivante: "bd2",

      // ============================================================
      //  LES VIGNETTES -- une ligne par vignette, dans l'ordre d'apparition
      // ============================================================
      //  cle       : la clé de texture (chargée dans le preload global)
      //  x, y      : position du CENTRE de la vignette à l'écran
      //  largeur/hauteur : taille d'affichage voulue (ajuste librement)
      //  son       : (optionnel) clé du bruitage à jouer à l'apparition -> enlève la ligne si pas de son
      vignettes: [
        {
          cle: "bulle1",
          x: 150,
          y: 100,
          largeur: 300,
          hauteur: 150,
          son: "orage", // NOUVEAU : bruitage joué à l'apparition de cette vignette
        },
        {
          cle: "bulle2",
          x: 390,
          y: 100,
          largeur: 300,
          hauteur: 150,
          // pas de "son" ici -> aucun bruitage pour cette vignette
        },
        {
          cle: "bulle3",
          x: 640,
          y: 100,
          largeur: 300,
          hauteur: 150,
          son: "gaps",
        },
        {
          cle: "bulle4",
          x: 230,
          y: 300,
          largeur: 420,
          hauteur: 200,
        },
        {
          cle: "bulle5",
          x: 590,
          y: 300,
          largeur: 420,
          hauteur: 200,
        },
      ],
    };
  }
}