# Vendetta 2026 — collecte des candidatures

La page [`vendetta.html`](../vendetta.html) recueille les candidatures et les écrit
directement dans une feuille Google Sheets, via un Web App Apps Script.

C'est le même mécanisme que `m/evenement.html`. Le site étant 100 % statique, il n'y
a pas de serveur : la page poste en `no-cors` vers une URL Apps Script, qui est le
seul composant à héberger quoi que ce soit.

---

## 1. L'ordre des colonnes

La feuille doit avoir cette **ligne 1**, cellule par cellule, en majuscules :

| A | B | C | D | E | F | G | H | I | J | K | L | M |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `NAME` | `SURNAME` | `CLUB` | `COUNTRY` | `WEIGHT (kg)` | `AGE (years)` | `EXPERIENCE` | `HEIGHT (cm)` | `BICEPS (cm)` | `ARM` | `PALMARES` | `EMAIL` | `SUBMITTED_AT` |

> **La plage d'import a changé.** `ARM` est insérée en **J**, ce qui décale
> `PALMARES` en **K**. La plage **A:J** ne correspond donc plus au format
> d'origine : elle se termine maintenant par `ARM`, et un import figé sur A:J
> récupère le bras à la place du palmarès. **Étendre la plage à A:K.**

`EMAIL` et `SUBMITTED_AT` restent volontairement en fin de ligne : ce sont des
données de gestion, jamais reprises dans l'import sportif.

### Colonnes d'inscription (septembre 2026)

La page n'est plus une simple candidature d'athlète : elle inscrit aussi les
spectateurs. Cinq colonnes de gestion s'ajoutent **à la suite**, pour ne pas
décaler la plage d'import A:K :

| N | O | P | Q | R |
|---|---|---|---|---|
| `TYPE` | `PHONE` | `IF_NOT_SELECTED` | `WAITLIST` | `PAID` |

- `WAITLIST` : `Oui` pour une inscription reçue après la clôture du 20 octobre
  2026 à 23 h 59 (heure de Luxembourg), vide sinon. La bascule est automatique :
  constante `CLOSE_AT` du bloc `CONFIG`. Une personne en liste d'attente ne voit
  aucune instruction de paiement.
- `TYPE` : `Spectateur` ou `Athlète`.
- `PHONE` : téléphone, texte libre.
- `IF_NOT_SELECTED` : rempli pour un athlète seulement. `Vient quand même`
  (il paie tout de suite et vient de toute façon) ou `Seulement si match`
  (il ne paie qu'une fois retenu — l'écran de confirmation ne lui affiche pas
  les instructions de paiement).
- `PAID` : **jamais envoyée par la page.** Colonne remplie à la main à
  réception du paiement. Le script laisse la cellule vide.

**Un spectateur laisse vides toutes les colonnes sportives** (`CLUB`,
`WEIGHT (kg)`, `EXPERIENCE`, `HEIGHT (cm)`, `BICEPS (cm)`, `ARM`, `PALMARES`).
L'import sportif doit donc filtrer sur `TYPE` = `Athlète`, sinon il récupère
des lignes sans mesures. Les lignes antérieures à ce changement ont un `TYPE`
vide : ce sont toutes des athlètes.

La communication de virement affichée au payeur est `VENDETTA NOM PRENOM`,
construite à partir de `SURNAME` et `NAME` — c'est la clé de rapprochement avec
la feuille. Paiement par virement uniquement : IBAN, BIC et bénéficiaire se règlent dans le bloc `CONFIG`
de [`vendetta.html`](../vendetta.html).

Le formulaire est en étapes (choix, coordonnées, profil d'athlète). Les nombres
saisis avec une virgule (`82,5`) sont envoyés avec un point (`82.5`).

### Vidéo d'introduction

Le cadre vidéo existe sous le compte à rebours mais reste masqué tant que la
constante `VIDEO_SRC` du bloc `CONFIG` est vide. Pour l'activer : déposer le
fichier à la racine du dépôt (par exemple `vendetta-intro.mp4`, format 16:9),
renseigner `VIDEO_SRC`, et si possible `VIDEO_POSTER` (image affichée avant
lecture).

Le script associe chaque valeur à sa colonne **par le nom de l'en-tête**, pas par la
position. Réordonner les colonnes ou en ajouter une ne casse donc rien — mais
renommer un en-tête vide la colonne correspondante.

`EXPERIENCE` contient un **nombre d'années de pratique** (`0` pour un débutant).

`ARM` contient le bras choisi par le candidat : `Droit`, `Gauche` ou `Les deux`.
C'est du texte — rien à ajouter au tableau `NUMERIC` du script.

Exemple de ligne (valeurs synthétiques) :

```
Jean | Dupont | AC Exemple | Belgique | 82.5 | 24 | 3 | 178 | 38 | Droit | Aucun | exemple@exemple.com | 2026-08-31T14:32:07.145Z
```

### Ajouter un champ au formulaire

Créer **d'abord** l'en-tête dans la feuille, **ensuite** publier la page.

Dans l'ordre inverse, toute candidature reçue entre les deux perd la valeur sans
le moindre message d'erreur : le script ignore une clé absente de la ligne 1, et
la page poste en `no-cors` — elle reçoit une réponse opaque qu'elle ne peut pas
lire, donc elle affiche « envoyé » quoi qu'il arrive.

Le script lui-même n'a pas à être modifié ni redéployé : il relit la ligne
d'en-tête à chaque appel.

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

La case de consentement de la page couvre l'usage « organisation de la Vendetta
2026 et sélection des participants » — ces adresses et numéros de téléphone ne
peuvent pas servir à autre chose sans un nouveau consentement.
