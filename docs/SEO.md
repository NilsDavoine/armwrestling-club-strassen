# SEO — règles et configuration

## Configuration mobile : une seule page d'accueil (depuis le 2026-11-12)

`index.html` est la page d'accueil sur ordinateur **et** sur téléphone. Sur téléphone, elle passe en une colonne qui défile (`accueil.css`). Il n'y a plus de redirection vers `/m/`, ni de balise `rel="alternate" media`. Décision de Nils du 2026-11-12 : `docs/superpowers/specs/2026-11-12-refonte-accueil-open-vendetta-design.md`.

Ce qu'il faut garder :

- **`/m/index.html` reste en place**, comme simple renvoi vers `/` (balise `refresh`, `location.replace('/')`, `canonical` vers `/`, `index, follow`). Ne pas le supprimer et ne pas y mettre `noindex` : pendant des mois, Google a lu cette adresse à la place de l'accueil.
- `m/evenement.html` ne change pas.
- Les questions affichées dans `index.html` et celles du bloc `FAQPage` restent identiques, mot pour mot.
- Les ancres `#about`, `#entrainement`, `#licence`, `#contact`, `#inscriptions` et `#tournoi` sont utilisées par les autres pages : ne pas les renommer.
- `index.html` porte les liens vers les 8 guides, les 3 pages locales, la page allemande, `club-demenage-cnam-strassen.html`, `open-vendetta.html`, `articles.html`, `tournament.html`, `duel.html` et `m/evenement.html`. En retirer un fait perdre un lien entrant à la page visée.

### Avant le 2026-11-12 : URLs séparées (m-dot), pour mémoire

Le site utilisait la configuration **« URLs séparées »** documentée par Google, et non le responsive design.

```
/          →  version desktop, responsive (11 media queries dans style.css)
/m/        →  version mobile, carrousel plein écran
```

#### Comment ça fonctionnait

`index.html` ligne 5 contient une redirection JavaScript :

```js
if(/Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) location.replace('/m/');
```

Elle s'applique aussi à **Googlebot Smartphone**, dont l'user-agent contient `Android` et `Mobile`. Google indexant en mobile-first, il explore donc `/m/` et non `/`.

#### Les quatre conditions qu'il fallait respecter

Cette configuration n'est valide que si les quatre points suivants sont réunis. En casser un a déjà provoqué une désindexation complète de la page d'accueil.

| Condition | Où |
|---|---|
| `/m/index.html` est indexable (`index, follow`) | `m/index.html` |
| `/m/index.html` a un `rel="canonical"` vers `/` | `m/index.html` |
| `/index.html` a un `rel="alternate" media` vers `/m/` | `index.html` |
| **Parité totale** entre `/` et `/m/` | les deux |

La parité couvre : le `title`, la `meta description`, les données structurées JSON-LD, et le contenu textuel.

#### Incident de référence — juillet 2026

`m/index.html` était en `noindex, nofollow`. Google, redirigé vers cette page, a appliqué le `noindex` à la page d'accueil.

Conséquences mesurées sur 90 jours :
- CTR de la home : 4,33 % → 2,10 %
- Clics : −25 % malgré +54 % d'impressions
- Requête de marque « armwrestling club strassen » : position 1,4 → 5,6
- Le `nofollow` bloquait la découverte : 11 des 15 pages inspectées étaient « URL is unknown to Google »

**Leçon : toute modification de `m/index.html` doit être vérifiée comme si elle s'appliquait à la page d'accueil. C'est le cas.**


## Checklist d'une nouvelle page publique

```html
<title>…</title>                                    <!-- 50-60 caractères -->
<meta name="description" content="…">                <!-- 120-160 caractères -->
<meta name="robots" content="index, follow">
<link rel="canonical" href="https://armwrestlingclubstrassen.com/LA-PAGE.html">
```

- **un seul** `<h1>`, puis une hiérarchie `<h2>`/`<h3>` réelle
- un bloc JSON-LD : `Article` pour un article, `SportsClub` pour une page locale, plus `BreadcrumbList`
- une entrée dans `sitemap.xml` avec `lastmod` à jour
- **au moins 3 liens entrants** depuis des pages existantes, avec ancres descriptives

## Maillage interne

Une page sans lien entrant n'est jamais découverte, même présente dans le sitemap.

Pages pivots à utiliser pour lier une nouveauté :
- `articles.html` — hub principal, 23 liens sortants
- `index.html` — bloc « Le club près de chez vous »
- `index.html` — la liste « Huit guides » et la ligne des pages locales, lues par Google depuis le 2026-11-12 (avant, il lisait `/m/`)

Éviter les ancres génériques (« cliquez ici », « lire l'article »). Préférer l'intention de recherche visée : « le calendrier des compétitions de bras de fer au Luxembourg ».

## hreflang

Trois pages portent les annotations, réciproques et cohérentes :

```html
<link rel="alternate" hreflang="fr-LU" href="https://armwrestlingclubstrassen.com/"/>
<link rel="alternate" hreflang="de" href="https://armwrestlingclubstrassen.com/armwrestling-luxemburg.html"/>
<link rel="alternate" hreflang="x-default" href="https://armwrestlingclubstrassen.com/"/>
```

Toute nouvelle page allemande doit être ajoutée des deux côtés.

## Vérifications rapides

```bash
# Statut HTTP de toutes les URLs du sitemap
for u in $(grep -o 'https://[^<]*' sitemap.xml); do
  echo "$(curl -s -o /dev/null -w '%{http_code}' "$u") $u"
done

# Liens entrants d'une page
grep -l 'href="\(\.\./\)\?LA-PAGE.html"' *.html m/*.html | wc -l

# Pages sans données structurées
for f in *.html; do grep -q 'ld+json' "$f" || echo "SANS SCHEMA: $f"; done
```

## Search Console

Propriété : `https://armwrestlingclubstrassen.com/`, vérifiée par le fichier `googlef15ead266a634737.html` à la racine — **ne pas supprimer**.
