# Spec — App événement « Club × ATC » (collecte des perfs + classement)

**Date :** 2026-06-18
**Statut :** design validé, prêt à construire
**Repo :** `armwrestling-club-strassen` (site statique, GitHub Pages)

---

## 1. Objectif

Créer une **page web événement** intégrée au site mobile du club, accessible via un
**bouton dédié sur la home mobile** (`m/index.html`). Chaque participant ouvre la page
sur son téléphone, saisit son identité + son poids de corps, puis **le poids max réussi
à chaque exercice**. Les données partent dans un **Google Sheet** central qui calcule
**deux classements** : Absolu (perf brute) et Relatif (perf ÷ poids de corps).

Contexte de l'événement : duel amical de force entre les pongistes de bras du club et
les powerlifters de la salle **ATC (Koerich)**. Format : ~20-30 participants, gratuit,
ouvert au public, classement individuel, 1ʳᵉ édition prévue dans 1-2 mois.

---

## 2. Décisions actées

| Sujet | Choix |
|---|---|
| Classement | Individuel, **2 titres** : Champion Absolu + Champion Relatif |
| Saisie des scores | **Auto-saisie** : chaque athlète entre ses perfs sur son tél (déclaratif) |
| Collecte des données | **Google Sheet + Google Apps Script** (gratuit, sans serveur) |
| Nb d'exercices | **Configurable** — 6 aujourd'hui |
| Type de perf | Un **nombre par exo** (poids max en kg) |
| Hébergement | Même repo / même domaine GitHub Pages que le site |
| Public | Ouvert (supporters bienvenus) |

---

## 3. Ce qu'il faut savoir de l'existant (contexte technique)

- **Site statique** hébergé sur **GitHub Pages** (présence d'un `CNAME`, liens `github.io`).
  → Aucun backend : la collecte de données passe forcément par un service externe
  (ici Apps Script + Sheet).
- **Site mobile** = `m/index.html` : un **deck de slides « swipe »** mono-fichier
  (CSS + JS inline), nav par points en bas. 7 slides aujourd'hui.
- **Pattern déjà en place** : le slide « Tournoi » pointe vers une mini-app externe
  (`nilsdavoine.github.io/tournament_registration/`). On reproduit le même principe,
  mais **en interne** (page dans le même repo).
- **Charte graphique** (à réutiliser à l'identique) :
  - Couleurs : `--red #c0392b`, `--red-light #e74c3c`, `--black #050304`,
    `--white #f0ede8`, `--grey #9a9090`.
  - Polices : **Barlow Condensed** (titres, 700-900, uppercase) + **Barlow** (texte).
  - Composants existants réutilisables : `.btn`, `.btn-red`, `.btn-ghost`, `.tag`,
    `.line`, `.pill`, `.card`.

---

## 4. Architecture

Page **autonome mono-fichier** `evenement.html` (CSS + JS inline, comme `m/index.html`),
placée à la racine du repo. Reliée depuis la home mobile par un nouveau bouton/slide.

```
m/index.html (home mobile)
   └─ bouton/slide « Événement ATC »  ──►  evenement.html
                                              │  (parcours athlète)
                                              ▼
                                         fetch POST  ──►  Apps Script (doPost)
                                                                │
                                                                ▼
                                                         Google Sheet « Réponses »
                                                                │
                                              formules de classement (2 onglets)
                                                                ▼
                                                  Leaderboard Absolu + Relatif
```

**Principe d'isolation :** l'app event est un concern séparé du site marketing.
Un seul fichier, une seule responsabilité (collecter + envoyer une perf), aucune
dépendance au reste du site sauf la charte.

---

## 5. Parcours utilisateur (écrans de `evenement.html`)

1. **Accueil event** — branding *Club × ATC*, date + lieu, bouton « Commencer ».
2. **Identité** — Nom, Prénom, Club (Strassen / ATC / autre), **Poids de corps (kg)**.
   → mémorisé en `localStorage` (pas de re-saisie si la page est rouverte).
3. **Exercices** — un écran (ou bloc) par exo : **photo + nom + champ « poids max (kg) »**.
   Navigation suivant/précédent. 6 exos (configurable).
4. **Récap** — récapitulatif des valeurs saisies, possibilité de corriger.
5. **Envoi** — `fetch` POST vers l'Apps Script → **écran de confirmation**.
   Un flag `localStorage` (`event_atc_submitted`) évite le double envoi.

**Config en tête de fichier** (un seul endroit à éditer) :

```js
const EVENT = {
  titre: "Club × ATC — Duel de Force",
  date: "À confirmer",
  lieu: "ATC, Koerich",
  endpoint: "https://script.google.com/macros/s/XXXX/exec", // URL du Web App
  exos: [
    { id: "exo1", nom: "Exercice 1", photo: "event/exo1.webp", unite: "kg" },
    { id: "exo2", nom: "Exercice 2", photo: "event/exo2.webp", unite: "kg" },
    { id: "exo3", nom: "Exercice 3", photo: "event/exo3.webp", unite: "kg" },
    { id: "exo4", nom: "Exercice 4", photo: "event/exo4.webp", unite: "kg" },
    { id: "exo5", nom: "Exercice 5", photo: "event/exo5.webp", unite: "kg" },
    { id: "exo6", nom: "Exercice 6", photo: "event/exo6.webp", unite: "kg" }
  ]
};
```

Ajouter/retirer un exo = ajouter/retirer une ligne dans `exos`. Le reste s'adapte.

---

## 6. Modèle de données

Une ligne par athlète dans le Google Sheet (onglet **« Reponses »**) :

| Colonne | Contenu |
|---|---|
| A `timestamp` | date/heure d'envoi (générée par le script) |
| B `nom` | Nom |
| C `prenom` | Prénom |
| D `club` | Strassen / ATC / autre |
| E `poids` | Poids de corps (kg) |
| F…K `exo1…exo6` | Poids max réussi par exo (kg) |

Payload JSON envoyé par la page (valeurs synthétiques) :

```json
{
  "nom": "Dupont", "prenom": "Marc", "club": "ATC", "poids": 92.5,
  "exo1": 180, "exo2": 60, "exo3": 140, "exo4": 0, "exo5": 100, "exo6": 75
}
```

(`0` ou vide = exo non réalisé → 0 point sur cet exo.)

---

## 7. Backend — Google Apps Script

Web App déployé en mode **« Exécuter en tant que moi / Accès : tout le monde »**.

```js
function doPost(e) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Reponses");
  const d = JSON.parse(e.postData.contents);
  sheet.appendRow([
    new Date(), d.nom, d.prenom, d.club, d.poids,
    d.exo1, d.exo2, d.exo3, d.exo4, d.exo5, d.exo6
  ]);
  return ContentService
    .createTextOutput(JSON.stringify({ ok: true }))
    .setMimeType(ContentService.MimeType.JSON);
}
```

**Gotcha CORS à respecter côté page :** envoyer le POST **sans en-tête custom**
(`Content-Type` par défaut `text/plain`) pour éviter le *preflight* OPTIONS que
Apps Script ne gère pas :

```js
await fetch(EVENT.endpoint, { method: "POST", body: JSON.stringify(payload) });
```

(Le script lit quand même `e.postData.contents`.) En cas de blocage de lecture de
réponse, fallback `mode: "no-cors"` + message de succès local.

---

## 8. Le Google Sheet & le calcul des classements

3 onglets :

### `Reponses` (données brutes)
En-têtes ligne 1 : `timestamp | nom | prenom | club | poids | exo1 … exo6`.
Alimenté automatiquement par le script.

### `Classement_Absolu`
Pour chaque exo, points par place = `Nb_participants − rang + 1`
(le meilleur sur l'exo marque le max de points ; égalités = même rang = mêmes points).

Formule type pour les points d'un exo (perf dans la colonne `Reponses!F:F`) :

```
= COUNT(Reponses!$F$2:$F) - RANK(Reponses!F2, Reponses!$F$2:$F, 0) + 1
```

Total Absolu = somme des points des 6 exos → tri décroissant → podium.

### `Classement_Relatif`
Mêmes points, mais calculés sur `perf ÷ poids` (colonnes auxiliaires
`rel_exoN = exoN / poids`), puis `RANK` sur ces valeurs relatives.
Total → podium relatif.

**Départage des égalités au total :** plus grand nombre de victoires d'exo, sinon
une épreuve « signature » désignée comme tie-break.

> Livrable : je fournis le Sheet **déjà formulé** (les 2 onglets prêts), tu n'auras
> qu'à le copier dans ton Drive et coller l'URL du Web App.

---

## 9. Le bouton sur la home mobile

Ajout sur le slide d'accueil (`s1`) de `m/index.html`, dans le bloc `.ctas`, un bouton
mis en avant qui ouvre la page event :

```html
<a href="../evenement.html" class="btn btn-red">🏆 Événement Club × ATC</a>
```

(ou un slide dédié type `s7` « Tournoi » si tu préfères une page entière de teasing —
à décider au moment du build.)

---

## 10. Fichiers à créer / modifier

| Fichier | Action |
|---|---|
| `evenement.html` | **créer** — l'app event complète (parcours + envoi) |
| `event/exo1.webp … exo6.webp` | **à fournir** — tes photos d'exos |
| `m/index.html` | **modifier** — ajouter le bouton/slide « Événement ATC » |
| Apps Script (`Code.gs`) | **à créer dans ton Drive** — fourni dans ce spec |
| Google Sheet modèle | **à créer dans ton Drive** — fourni prêt à l'emploi |

---

## 11. Dépendances côté Nils (pour finaliser)

1. **Photos + noms des 6 exos** → je build d'abord avec emplacements vides, tu déposes
   les `.webp` dans `event/` et tu remplis les `nom` dans la config.
2. **Compte Google** → créer le Sheet + déployer le Web App (procédure pas-à-pas fournie,
   ~5 min), récupérer l'URL et la coller dans `EVENT.endpoint`.
3. **Date + lieu définitifs** (calés avec Mark) → à mettre dans la config.

---

## 12. Hors scope (YAGNI pour la 1ʳᵉ édition)

- Mode « juge / validation » des perfs (auto-saisie déclarative assumée).
- Leaderboard live affiché sur écran pendant l'event (Supabase) — possible plus tard.
- Comptes / authentification des participants.
- Catégories de poids séparées (on garde Absolu + Relatif).

---

## 13. Étapes de mise en ligne (résumé)

1. Construire `evenement.html` + le bouton sur `m/index.html` (avec emplacements exos).
2. Créer le Google Sheet (3 onglets) depuis le modèle fourni.
3. Coller le script Apps Script, déployer en Web App, récupérer l'URL.
4. Coller l'URL dans `EVENT.endpoint`, remplir noms + photos des exos.
5. Tester un envoi de bout en bout (1 ligne arrive dans le Sheet, classements OK).
6. Commit + push → la page est en ligne sur le domaine GitHub Pages.
