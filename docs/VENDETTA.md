# Vendetta 2026 — collecte des candidatures

La page [`vendetta.html`](../vendetta.html) recueille les candidatures et les écrit
directement dans une feuille Google Sheets, via un Web App Apps Script.

C'est le même mécanisme que `m/evenement.html`. Le site étant 100 % statique, il n'y
a pas de serveur : la page poste en `no-cors` vers une URL Apps Script, qui est le
seul composant à héberger quoi que ce soit.

---

## 1. L'ordre des colonnes

La feuille doit avoir cette **ligne 1**, cellule par cellule, en majuscules :

| A | B | C | D | E | F | G | H | I | J | K | L |
|---|---|---|---|---|---|---|---|---|---|---|---|
| `NAME` | `SURNAME` | `CLUB` | `COUNTRY` | `WEIGHT (kg)` | `AGE (years)` | `EXPERIENCE` | `HEIGHT (cm)` | `BICEPS (cm)` | `PALMARES` | `EMAIL` | `SUBMITTED_AT` |

Les colonnes **A à J** sont exactement le format d'import existant — ne pas les
déplacer. `EMAIL` et `SUBMITTED_AT` sont volontairement placées **après**
`PALMARES` : un import qui ne lit que A:J les ignore sans rien décaler.

Le script associe chaque valeur à sa colonne **par le nom de l'en-tête**, pas par la
position. Réordonner les colonnes ou en ajouter une ne casse donc rien — mais
renommer un en-tête vide la colonne correspondante.

`EXPERIENCE` contient un **nombre d'années de pratique** (`0` pour un débutant).

Exemple de ligne (valeurs synthétiques) :

```
Jean | Dupont | AC Exemple | Belgique | 82.5 | 24 | 3 | 178 | 38 | Aucun | exemple@exemple.com | 2026-08-31T14:32:07.145Z
```

---

## 2. Créer le Web App

1. Créer la feuille Google Sheets, la nommer — par exemple `Vendetta 2026`.
2. Renommer l'onglet en **`Candidatures`** et saisir la ligne d'en-tête ci-dessus.
3. `Extensions` → `Apps Script`. Effacer le contenu par défaut, coller le script
   de la section 3.
4. `Déployer` → `Nouveau déploiement` → type **Application Web**.
   - *Exécuter en tant que* : **moi**
   - *Qui a accès* : **Tout le monde**
5. Copier l'URL générée — elle se termine par `/exec`.
6. Coller cette URL dans [`vendetta.html`](../vendetta.html), bloc `CONFIG` en tête
   du `<script>` :

```js
var ENDPOINT = "https://script.google.com/macros/s/AKfy…/exec";
```

Tant que `ENDPOINT` est vide, le formulaire affiche
« Formulaire pas encore activé (endpoint à configurer) » et n'envoie rien.

> Après **toute** modification du script, il faut redéployer
> (`Déployer` → `Gérer les déploiements` → crayon → *Nouvelle version*).
> Sans ça, l'ancienne version continue de tourner.

---

## 3. Le script à coller

```javascript
const SHEET_NAME = 'Candidatures';

// Colonnes a ecrire en nombre plutot qu'en texte, pour que le tri et les
// filtres de la feuille fonctionnent.
const NUMERIC = [
  'WEIGHT (kg)', 'AGE (years)', 'EXPERIENCE', 'HEIGHT (cm)', 'BICEPS (cm)'
];

function doPost(e) {
  // Deux candidatures simultanees ecriraient sur la meme ligne sans ce verrou.
  const lock = LockService.getScriptLock();
  lock.waitLock(30000);

  try {
    const data = JSON.parse(e.postData.contents);
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
    if (!sheet) throw new Error('Onglet introuvable : ' + SHEET_NAME);

    // On lit la ligne d'en-tete a chaque appel : l'ordre des colonnes de la
    // feuille fait autorite, le script n'a pas sa propre copie a maintenir.
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];

    const row = headers.map(function (header) {
      const key = String(header).trim();
      const value = data[key];
      if (value === undefined || value === null || value === '') return '';
      if (NUMERIC.indexOf(key) !== -1) {
        const n = parseFloat(String(value).replace(',', '.'));
        return isNaN(n) ? value : n;
      }
      return value;
    });

    sheet.appendRow(row);

    return ContentService
      .createTextOutput(JSON.stringify({ ok: true }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ ok: false, error: String(err) }))
      .setMimeType(ContentService.MimeType.JSON);

  } finally {
    lock.releaseLock();
  }
}
```

---

## 4. Vérifier que ça marche

Ouvrir `vendetta.html`, remplir le formulaire avec des valeurs de test, envoyer.
Une ligne doit apparaître dans la feuille en quelques secondes.

La page poste en `mode: "no-cors"` parce qu'Apps Script ne renvoie pas d'en-tête
CORS. **Conséquence importante : la réponse est opaque.** La page affiche l'écran
de confirmation dès que la requête part, sans pouvoir lire si le script a réussi.
Un `doPost` cassé produit donc une candidature perdue *silencieusement*, côté
candidat comme côté page.

D'où la seule vraie vérification : **regarder la feuille**. Après un changement de
script ou de déploiement, envoyer une candidature de test et confirmer que la ligne
est écrite.

Si rien n'arrive :

| Symptôme | Cause probable |
|---|---|
| Aucune ligne, aucune erreur visible | Déploiement pas mis à jour après modification du script |
| Aucune ligne | *Qui a accès* ≠ « Tout le monde » |
| Ligne écrite, colonnes vides | En-tête renommé — le nom doit correspondre au caractère près |
| « Formulaire pas encore activé » | `ENDPOINT` vide dans `vendetta.html` |

Les exécutions et leurs erreurs sont consultables dans Apps Script → `Exécutions`.

---

## 5. Données personnelles

La feuille contient des noms, âges, mesures corporelles et adresses email de
mineurs à partir de 14 ans. Garder le partage du document restreint aux personnes
qui font la sélection, et supprimer les candidatures non retenues une fois
l'événement passé.

La case de certification de la page couvre l'usage « sélection des participants à
la Vendetta 2026 » — ces adresses ne peuvent pas servir à autre chose sans un
nouveau consentement.
