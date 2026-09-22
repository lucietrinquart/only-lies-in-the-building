import * as Phaser from "phaser";

/* ============================================================
 *  MODULE TÂCHES / OBJECTIFS
 *  ------------------------------------------------------------
 *  Même principe que l'inventaire : la liste des tâches est
 *  stockée dans this.registry, donc elle survit aux changements
 *  de scène. Une tâche est : { id, texte, terminee }
 *  "id" sert à la retrouver depuis n'importe quelle scène
 *  (ex: pour la marquer terminée quand on ramasse un objet).
 * ============================================================ */

// Récupère le tableau de tâches (le crée s'il n'existe pas encore)
function getTaches(scene) {
  let taches = scene.registry.get("taches");
  if (!taches) {
    taches = [];
    scene.registry.set("taches", taches);
  }
  return taches;
}

// Existe-t-elle déjà (peu importe si elle est terminée ou non) ?
export function tacheExiste(scene, id) {
  return getTaches(scene).some((t) => t.id === id);
}

// Ajoute une tâche (ne fait rien si son id existe déjà)
export function ajouterTache(scene, id, texte) {
  if (tacheExiste(scene, id)) return false;
  const taches = getTaches(scene);
  taches.push({ id, texte, terminee: false });
  // .set() redéclenche l'évènement "changedata-taches", ce qui rafraîchit
  // automatiquement l'affichage dans TOUTES les scènes qui ont un TachesUI actif
  scene.registry.set("taches", taches);
  return true;
}

// Ajoute plusieurs tâches d'un coup (pratique à la fin d'un dialogue)
export function ajouterTaches(scene, listeTaches) {
  // listeTaches : [{ id, texte }, { id, texte }, ...]
  listeTaches.forEach((t) => ajouterTache(scene, t.id, t.texte));
}

// Marque une tâche comme terminée. Elle reste affichée (barrée) 2 secondes
// puis disparaît toute seule de la liste.
export function terminerTache(scene, id) {
  const taches = getTaches(scene);
  const tache = taches.find((t) => t.id === id);
  if (!tache || tache.terminee) return false;

  tache.terminee = true;
  scene.registry.set("taches", taches);

  // On capture la référence au registry (objet global du jeu, pas de la scène)
  // pour pouvoir l'utiliser même si la scène a changé entre-temps.
  const registry = scene.registry;
  setTimeout(() => {
    const actuelles = registry.get("taches") || [];
    const restantes = actuelles.filter((t) => t.id !== id);
    registry.set("taches", restantes);
  }, 2000);

  return true;
}

/* ============================================================
 *  INTERFACE DES TÂCHES (liste en haut à droite)
 *  À instancier dans le create() de CHAQUE scène.
 * ============================================================ */
export class TachesUI {
  constructor(scene) {
    this.scene = scene;

    this.conteneur = scene.add.container(0, 0);
    this.conteneur.setScrollFactor(0);
    this.conteneur.setDepth(1500);

    // Fonction liée à "this" pour pouvoir l'ajouter/retirer comme écouteur
    this.rafraichir = this.rafraichir.bind(this);

    // Le registry émet "changedata-taches" à chaque scene.registry.set("taches", ...)
    // même si l'appel vient d'une AUTRE scène (ex: ramassage d'objet dans cafet
    // pendant qu'on... non, mais surtout : le prochain create() de gendarmerie
    // affichera direct le bon état car getTaches() relit le registry à jour).
    scene.registry.events.on("changedata-taches", this.rafraichir);

    // Nettoyage : on arrête d'écouter quand la scène se ferme, sinon l'évènement
    // continuerait d'essayer de mettre à jour des textes déjà détruits.
    scene.events.once("shutdown", () => {
      scene.registry.events.off("changedata-taches", this.rafraichir);
    });

    this.rafraichir();
  }

  rafraichir() {
    this.conteneur.removeAll(true);

    const taches = this.scene.registry.get("taches") || [];
    if (taches.length === 0) return; // rien à afficher

    const largeurJeu = this.scene.cameras.main.width;
    const marge = 16;
    const largeurPanneau = 250;

    // Hauteur du panneau selon le nombre de tâches (une ligne ~26px + titre)
    const hauteurPanneau = 40 + taches.length * 26 + 14;

    const fond = this.scene.add
      .rectangle(
        largeurJeu - marge - largeurPanneau / 2,
        marge + hauteurPanneau / 2,
        largeurPanneau,
        hauteurPanneau,
        0x000000,
        0.65
      )
      .setStrokeStyle(1, 0xffffff, 0.25);
    this.conteneur.add(fond);

    const titre = this.scene.add.text(
      largeurJeu - marge - largeurPanneau + 12,
      marge + 8,
      "Objectifs",
      { font: "bold 14px Arial", fill: "#ffffff" }
    );
    this.conteneur.add(titre);

    taches.forEach((tache, index) => {
      const y = marge + 34 + index * 26;
      const couleur = tache.terminee ? "#4caf50" : "#ffffff";
      const puce = tache.terminee ? "✓ " : "• ";

      const texte = this.scene.add.text(
        largeurJeu - marge - largeurPanneau + 12,
        y,
        puce + tache.texte,
        {
          font: "13px Arial",
          fill: couleur,
          wordWrap: { width: largeurPanneau - 24 },
        }
      );

      // Petit effet barré manuel pour les tâches terminées : on superpose
      // une ligne horizontale au milieu du texte.
      if (tache.terminee) {
        const ligne = this.scene.add.rectangle(
          texte.x + texte.width / 2,
          y + texte.height / 2,
          texte.width,
          1,
          0x4caf50
        );
        this.conteneur.add(ligne);
      }

      this.conteneur.add(texte);
    });
  }
}