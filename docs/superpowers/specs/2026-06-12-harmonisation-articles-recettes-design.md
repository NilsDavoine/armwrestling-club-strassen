# Harmonisation des articles — système à 3 recettes

**Date :** 2026-06-12
**Statut :** validé (concept) — implémentation en cours
**Projet :** armwrestling-club-strassen

## Problème

Les articles et pages locales ont un design hétérogène : fonds répétitifs (toujours
les mêmes rouges), sections trop basiques, CTA « essai » structuré différemment à
chaque page, pas de table des matières, des emojis, et — surtout — un **schéma
récurrent de textes illisibles** (trop petits, opacité trop basse, ou colorés en
petit). L'objectif : une présentation cohérente, soignée et lisible partout, avec
3 « recettes » réutilisables.

## Objectifs

1. Une **ossature commune** identique sur tous les articles.
2. Une **règle de lisibilité** qui élimine le texte petit/transparent/peu visible.
3. **3 recettes** (fond + couleurs d'accent + agencement) réutilisables, ancrées
   dans le design existant.
4. Démontrer les 3 recettes sur 3 pages vitrines, puis déployer sur les ~12 autres.

## Non-objectifs

- Réécrire le contenu rédactionnel (on garde le texte, on retouche la présentation).
- Toucher à `style.css` (tokens globaux) ou au `<head>` SEO/schema des pages.
- Modifier la nav, le footer, le bloc « Articles liés ».

---

## 1. Socle commun (toutes les recettes)

| Élément | Source de référence |
|---|---|
| Titres `<h1>/<h2>` blanc + `<span>` en couleur d'accent | guide-debutant |
| **Table des matières** (bandeau « Dans ce guide », 2 col, numérotée) | guide-debutant / comment-gagner |
| **Cadres spotlight** suiveurs de curseur (`.tip-card`) | comment-gagner (« Les 3 clés absolues ») |
| **FAQ en accordéon** déplianlable (`.accordion` + `toggleAcc`) | guide-debutant |
| **CTA harmonisé** `.cta-mid` (milieu) + `.cta-final` (fin), libellé « Planifier mon essai » | guide-debutant |
| Bloc « Articles liés » | inchangé |
| **Zéro emoji** — remplacés par index numérotés / pastilles colorées | — |

## 2. Règle de lisibilité (partout)

- Texte courant : ≥ **1rem**, opacité **≥ .80** ; texte secondaire opacité **≥ .72**.
- **Aucun paragraphe** sous opacité `.62` ni sous `.92rem`.
- La couleur (rouge/bleu/vert/or) ne s'applique qu'à des **titres/labels courts en
  gras** — jamais à un long paragraphe.
- Petits labels : ≥ `.72rem`, gras + majuscules + couleur d'accent (pas gris clair).
- Légendes/méta : opacité ≥ **.45** (au lieu de .28–.35).

## 3. Les 3 recettes

### Recette 1 — « PANORAMA » (multi-accent, d'après sport-de-force)
- **Fond** : near-black teinté **par section** (bleu nuit `#02040e`, vert `#010a07`,
  ambre `#0a0501`, rouge `#090303`).
- **Accents** : bleu `#7aadda` · vert `#25c494` · or `#d4a017` · rouge `#c0392b`.
  L'eyebrow, le `<span>` du titre et le cadre spotlight prennent la couleur de section.
- **Agencement** : cartes-piliers color-codées, index numérotés (pas d'emoji), étapes
  en liste numérotée, tableau comparatif si pertinent.
- **Vitrine** : `club-bras-de-fer-debutant-luxembourg.html`.

### Recette 2 — « BRASIER » (rouge cinéma, d'après comment-gagner / guide-debutant)
- **Fond** : rouge dramatique — `bg-cinema`, `bg-red-walls`, `bg-inferno` (lave montante).
- **Accents** : rouge + blanc, contrastes forts.
- **Agencement** : frise chronologique verticale, cartes spotlight rouges, bande
  « statement » pleine largeur (`.strap-block`), split photo.
- **Vitrine** : `entrainement-bras-de-fer-strassen.html`.

### Recette 3 — « HORIZON » (or chaud, premium/calme)
- **Fond** : chaud — `bg-horizon` (lueur dorée montant du bas), `bg-motion`.
- **Accents** : or `#d4a017` (chiffres/eyebrows), rouge pour les CTA.
- **Agencement** : cartes d'accès sans emoji (pastille dorée), grille « communes
  proches » en tableau clair, bandeau de stats doré.
- **Vitrine** : `bras-de-fer-luxembourg-ville.html`.

## 4. Attribution page ↔ recette (déploiement ultérieur, indicatif)

- **R1 Panorama** : sport-de-force (déjà), nutrition, regles-officielles, champions.
- **R2 Brasier** : comment-gagner (déjà), guide-debutant (déjà), technique-prise,
  competition-luxembourg, premier-tournoi, entrainement-maison.
- **R3 Horizon** : histoire, recuperation-tendinites, blessures, preparation-competition.

## 5. Déroulé

1. Construire **Club débutant (R1)** comme aperçu réel → validation visuelle.
2. Appliquer **R2** à Entraînement Strassen et **R3** à Luxembourg-ville.
3. Déployer recette par recette sur les autres articles.

## Critères de réussite

- Les 3 vitrines partagent le socle commun (TOC, cadres, accordéon, CTA identique).
- Aucun emoji ; aucun texte sous les seuils de lisibilité.
- Les 3 recettes sont visuellement distinctes (fond + couleur + agencement).
