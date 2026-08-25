# Duel Mode — spécification

Outil de gestion d'un événement en **duels indépendants** (vendetta), en complément du
tournoi par catégories de `tournament.html`. Chaque duel oppose deux athlètes en
**Best of 5** (3 manches gagnantes), avec afficheur temps réel pour le public.

Statut : spécification validée, implémentation à faire.

---

## 1. Décision d'architecture

**Un nouveau fichier `duel.html` à la racine**, et non une extension de `tournament.html`.

| Raison | Détail |
|---|---|
| Modèles incompatibles | Le tournoi manipule catégories / brackets / 3 sections parallèles. Le duel manipule une liste ordonnée de duels 1 contre 1. Fusionner impose une logique de migration et de bascule. |
| Isolation de l'état | Clé `localStorage` et canal `BroadcastChannel` distincts. Une session de duels ne peut pas corrompre un tournoi sauvegardé, et inversement. |
| Non-régression | `tournament.html` fait 2239 lignes et fonctionne. La seule modification qu'il subit est l'ajout d'un bouton dans son en-tête. |
| Taille de fichier | Fusionner mènerait à ~3500 lignes dans un seul fichier. |

L'effet « mode » demandé est obtenu par un bouton d'échange dans les deux en-têtes :
`⇄ DUEL MODE` dans `tournament.html`, `⇄ TOURNAMENT` dans `duel.html`.

`duel.html` reprend le CSS, l'en-tête et les conventions de `tournament.html` à
l'identique : palette noir et blanc, `--red` réservé au destructif, polices
Barlow / Barlow Condensed.

### Paramètres techniques

| Élément | Valeur |
|---|---|
| Clé `localStorage` | `acs_duel_v1` |
| Canal `BroadcastChannel` | `acs_duel` |
| Afficheur | `duel.html#display` — même fichier, `<div id="A">` masqué, `<div id="D">` affiché |
| Indexation | `noindex, follow` — outil interne, comme `tournament.html` |

---

## 2. Modèle de données

Chaque ligne du tableau **est** un duel, avec les deux athlètes embarqués.
Pas de table d'athlètes normalisée : la réutilisation se fait par copie explicite
depuis la fenêtre d'édition (voir §4).

```js
S = {
  duels: [ Duel ],
  cur:   { idx: 0, screen: 'intro' },   // 'intro' | 'match' | 'result' | 'final'
  seq:   1
}

Duel = {
  id:     Number,
  arm:    'left' | 'right',   // les deux athlètes font le même bras
  home:   Athlete,
  opp:    Athlete,
  events: [ Event ]
}

Athlete = {
  ln, fn,                     // NOM, Prénom — seul ln est obligatoire
  photo,                      // data URL JPEG, redimensionnée (voir §7)
  club, country,              // country = code ISO 2 lettres, drapeau via flagcdn
  weight, age, exp,           // kg, années, années de pratique
  height, reach,              // cm, cm
  palmares                    // texte libre
}

Event = { t, side, at }
// t    : 'warn' | 'foul' | 'round' | 'falsestart' | 'slip' | 'grip'
// side : 'home' | 'opp'   — absent pour 'slip' et 'grip' (annonces neutres)
// at   : Date.now()
```

### Le match est un journal rejoué

`events` est la **source de vérité unique** du match. Le score, les warnings et les
fautes de la manche en cours ne sont jamais stockés : ils sont recalculés par une
fonction pure `computeMatch(events)` à chaque rendu.

Conséquence recherchée : **annuler = retirer le dernier événement**, puis recalculer.
Aucune pile d'annulation à maintenir, donc aucune possibilité de désynchronisation
entre l'affichage et l'état réel. C'est plus robuste que la pile `pushUndo` de
`tournament.html`.

`computeMatch(events)` retourne :

```js
{
  roundsWon: { home, opp },       // 0..3
  round:     Number,              // numéro de la manche en cours, 1..5
  warn:      { home, opp },       // 0..1 dans la manche en cours
  foul:      { home, opp },       // 0..1 dans la manche en cours
  winner:    'home' | 'opp' | null,
  history:   [ { round, winner, reason } ]   // reason : 'pin' | 'fouls'
}
```

---

## 3. Règles du duel

Best of 5 — le premier à **3 manches gagnées** remporte le duel.

**Warnings et fautes sont remis à zéro au début de chaque manche.**

| Déclencheur | Effet |
|---|---|
| 2ᵉ warning dans la manche | Les warnings retombent à 0, +1 faute pour cet athlète |
| 2ᵉ faute dans la manche | Manche perdue, la manche est attribuée à l'adversaire |
| Bouton `WIN ROUND` | Manche attribuée manuellement (`reason: 'pin'`) |
| 3 manches gagnées | Duel terminé |

`FALSE START` est enregistré comme un événement distinct mais compte **comme un
warning** dans le calcul — il a seulement son propre libellé à l'écran.

`SLIP — RE-STRAP` et `REFEREE'S GRIP` sont des **annonces pures** : aucun effet sur
le score, aucun effet sur les compteurs. Elles sont enregistrées dans `events` pour
pouvoir être annulées, et pour figurer dans le journal du match.

### Temporisation de 5 secondes

Quand un événement provoque une conversion (2ᵉ warning → faute, ou 2ᵉ faute → manche),
**l'état change immédiatement** ; c'est uniquement l'affichage qui révèle en deux temps.

1. `t = 0 s` — l'afficheur montre les **deux cercles pleins** de l'état franchi
   (deux ronds oranges pour les warnings, deux ronds rouges pour les fautes)
2. `t = 5 s` — l'afficheur bascule sur l'état consolidé (une faute de plus, ou la
   manche attribuée)

L'afficheur déduit la phase de `Date.now() - lastEvent.at` et programme un
`setTimeout` pour se redessiner à 5 s.

Ce choix est délibéré : geler l'état pendant 5 secondes rendrait l'annulation
impossible pendant la fenêtre exacte où l'arbitre est le plus susceptible de se
raviser. Ici l'annulation reste disponible à tout instant.

---

## 4. Onglet Participants

Tableau, une ligne par duel, colonne adversaire compacte :

```
№ │ PHOTO │ NOM      │ Prénom │ vs │ ADVERSAIRE      │ BRAS  │ ACTIONS
──┼───────┼──────────┼────────┼────┼─────────────────┼───────┼────────
 1│  👤   │ DAVOINE  │ Nils   │ vs │ 👤 MULLER Jan   │ RIGHT │ + ✎ 🗑
 2│  👤   │ SCHMIT   │ Luc    │ vs │ 👤 WEBER Tom    │ LEFT  │ + ✎ 🗑
```

| Action | Comportement |
|---|---|
| `+` | Insère un duel **juste après cette ligne** et ouvre la fenêtre d'édition |
| `✎` | Édite le duel |
| `🗑` | Supprime le duel, avec confirmation |
| Glisser-déposer | Réordonne les duels — l'ordre du tableau est l'ordre de passage |
| `+ ADD DUEL` | Ajoute un duel en fin de liste |
| `IMPORT` | Collage Excel (voir §6) |
| `EXPORT CSV` | Exporte le tableau, photos exclues |

### Fenêtre d'édition

Deux colonnes côte à côte, **les deux athlètes du duel remplis d'un coup**. Le bras
est un champ unique en haut, commun aux deux.

Chaque colonne porte un menu **« reprendre un athlète déjà saisi »** qui recopie tous
les champs d'un athlète présent dans un autre duel, photo comprise. C'est la réponse
au cas où un même athlète du club enchaîne plusieurs duels : il n'est saisi qu'une fois.

Champs par athlète : `NOM` (obligatoire), `Prénom`, `Photo`, `Club`, `Pays`, `Poids`,
`Âge`, `Années d'expérience`, `Taille`, `Tour de bras`, `Palmarès`.

**Un champ laissé vide n'apparaît pas à l'écran.** L'afficheur ne réserve pas de place
pour les informations absentes et ne laisse aucun trou dans la mise en page.

---

## 5. Onglet Duel Control

### Enchaînement des écrans

```
duel 1  INTRO ──Next──▶ MATCH ──Next──▶ RESULT ──Next──┐
                                                       │
duel 2  INTRO ◀────────────────────────────────────────┘
        ...
duel N  RESULT ──Next──▶ FINAL
```

`MATCH` n'avance pas tout seul quand un athlète atteint 3 manches : l'écran reste en
place, le vainqueur est annoncé, et c'est l'opérateur qui clique `Next` pour passer
au `RESULT`. Un bouton `Previous` permet de revenir d'un écran, et un sélecteur permet
de sauter directement à un duel donné.

| Écran | Contenu affiché |
|---|---|
| `INTRO` | Tale of the tape — photos, noms, drapeaux, clubs, et toutes les infos renseignées des deux athlètes, en vis-à-vis |
| `MATCH` | Scoreboard (voir §5.2) |
| `RESULT` | Récap succinct : photos, noms, score des manches en très grand, mention `WINNER` sous le vainqueur |
| `FINAL` | Liste de tous les duels : `NOM Prénom  3 — 1  NOM Prénom`, sans photos |

### 5.1 Boutons de contrôle

Par côté (gauche = home, droite = opp) :

`WARNING` · `FOUL` · `WIN ROUND` · `FALSE START`

Au centre, annonces neutres :

`SLIP — RE-STRAP` · `REFEREE'S GRIP`

Et un `↶ UNDO` unique qui retire le dernier événement, quel qu'il soit.

Un journal du match liste les événements dans l'ordre, avec l'heure — même principe
que le Match Log de `tournament.html`.

### 5.2 Afficheur — écran de match

Photos visibles en permanence, score des manches au centre, warnings et fautes sous
chaque athlète.

```
╔═══════════════════════════════════════════════╗
║  MATCH 3 / 8              RIGHT ARM           ║
╠══════════════════════╦════════════════════════╣
║      ┌────────┐      ║      ┌────────┐        ║
║      │ PHOTO  │      ║      │ PHOTO  │        ║
║      └────────┘      ║      └────────┘        ║
║      DAVOINE         ║      MULLER            ║
║      Nils            ║      Jan               ║
║                      ║                        ║
║         2     ROUNDS     1                    ║
║                      ║                        ║
║   WARN  ● ○          ║      WARN  ● ●         ║
║   FOUL  ⬤ ○          ║      FOUL  ○ ○         ║
╠══════════════════════╩════════════════════════╣
║              F O U L  —  MULLER               ║
╚═══════════════════════════════════════════════╝
```

**Pastilles.** Deux cercles warning et deux cercles faute par athlète.

| État | Rendu |
|---|---|
| Warning vide | Petit cercle, contour gris, fond transparent |
| Warning acquis | Petit cercle **plein orange** |
| Faute vide | Grand cercle, contour gris, fond transparent |
| Faute acquise | Grand cercle **plein rouge** |

Les cercles de faute sont nettement plus grands que ceux de warning, pour que la
gravité se lise instantanément et de loin.

### 5.3 Annonces à l'écran — tous les textes en anglais

Bandeau affiché environ 4 secondes. « Côté » signifie du côté de l'athlète concerné,
« centre » signifie en travers de l'écran.

| Action signalée | Texte affiché | Position |
|---|---|---|
| Warning | `WARNING` | côté |
| 2ᵉ warning | `SECOND WARNING — FOUL` | côté |
| Foul | `FOUL` | côté |
| 2ᵉ faute | `SECOND FOUL — POINT {NOM}` | centre |
| Faux départ | `FALSE START` | côté |
| Slip | `SLIP — RE-STRAP` | centre |
| Referee's grip | `REFEREE'S GRIP` | centre |
| Manche gagnée | `ROUND {n} — {NOM}` | côté |
| Duel gagné | `WINNER — {NOM}` | centre |
| Annulation warning | `DECISION REVERSED — WARNING CANCELLED` | centre |
| Annulation faute | `DECISION REVERSED — FOUL CANCELLED` | centre |
| Annulation manche | `DECISION REVERSED — ROUND CANCELLED` | centre |
| Annulation faux départ | `DECISION REVERSED — FALSE START CANCELLED` | centre |
| Annulation slip | `DECISION REVERSED — SLIP CANCELLED` | centre |
| Annulation grip | `DECISION REVERSED — REFEREE'S GRIP CANCELLED` | centre |

Toute l'interface de l'afficheur est en anglais. L'interface d'administration reste
en anglais elle aussi, par cohérence avec `tournament.html`.

---

## 6. Import par collage Excel

Zone de texte dans laquelle l'opérateur colle des cellules copiées depuis Excel ou
Google Sheets. **Une ligne = un duel.** Séparateur tabulation, point-virgule ou virgule.

La première ligne est une ligne d'en-tête. Les colonnes sont reconnues **par leur nom**,
insensible à la casse et aux accents, dans n'importe quel ordre. Les colonnes absentes
sont simplement ignorées.

| Colonne | Contenu |
|---|---|
| `BRAS` | `gauche` / `left` / `L`, ou `droite` / `right` / `R` |
| `NOM` | Obligatoire |
| `PRENOM`, `CLUB`, `PAYS`, `POIDS`, `AGE`, `EXPERIENCE`, `TAILLE`, `TOUR DE BRAS`, `PALMARES` | Athlète du club |
| `NOM ADV` | Obligatoire |
| `PRENOM ADV`, `CLUB ADV`, `PAYS ADV`, `POIDS ADV`, `AGE ADV`, `EXPERIENCE ADV`, `TAILLE ADV`, `TOUR DE BRAS ADV`, `PALMARES ADV` | Adversaire |

Une ligne dont `NOM` ou `NOM ADV` est vide est rejetée, et signalée à l'opérateur
avec son numéro de ligne. Les autres lignes sont importées.

Un bouton **`COPIER LE GABARIT`** place la ligne d'en-tête complète dans le
presse-papiers, pour construire la feuille Excel avec les bons intitulés.

Les photos ne passent pas par l'import : elles sont ajoutées ensuite, duel par duel.

---

## 7. Contraintes techniques

### Photos

Les photos sont **redimensionnées avant stockage** : contenues dans 500 × 600 px,
JPEG qualité 0.82, via un `<canvas>` hors écran.

C'est nécessaire ici : `tournament.html` stocke les data URL brutes issues du
`FileReader`, ce qui passe parce que les vignettes y sont petites. En mode duel les
photos occupent une moitié d'écran et le quota `localStorage` (~5 Mo) serait atteint
en une dizaine de duels.

### Synchronisation admin / afficheur

Identique à `tournament.html` : chaque `save()` écrit dans `localStorage` puis
rediffuse l'état complet sur `BroadcastChannel('acs_duel')`. La fenêtre afficheur
réécrit son état et se redessine à réception. Une relecture unique après 2 secondes
couvre le cas où l'afficheur est ouvert avant que l'admin ait sauvegardé.

### Sources externes

Drapeaux via `flagcdn.com`, polices via Google Fonts — mêmes dépendances que
`tournament.html`. L'outil fonctionne sans réseau, drapeaux et polices en moins.

---

## 8. Hors périmètre

Explicitement **non** prévu, pour rester sur le besoin réel :

- Pas de catégories, pas de brackets, pas de sections parallèles — c'est le rôle de `tournament.html`
- Pas de lecteur de code-barres ni d'impression de badges
- Pas de classement calculé ni de podium : le récap final liste les duels et leurs scores, rien de plus
- Pas de chronomètre de manche
- Pas de partage d'état avec `tournament.html`
