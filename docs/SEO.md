# SEO — règles et configuration

## Configuration mobile : URLs séparées (m-dot)

Le site utilise la configuration **« URLs séparées »** documentée par Google, et non le responsive design.

```
/          →  version desktop, responsive (11 media queries dans style.css)
/m/        →  version mobile, carrousel plein écran
```

### Comment ça fonctionne

`index.html` ligne 5 contient une redirection JavaScript :

```js
if(/Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) location.replace('/m/');
```

Elle s'applique aussi à **Googlebot Smartphone**, dont l'user-agent contient `Android` et `Mobile`. Google indexant en mobile-first, il explore donc `/m/` et non `/`.

### Les quatre conditions à respecter impérativement

Cette configuration n'est valide que si les quatre points suivants sont réunis. En casser un a déjà provoqué une désindexation complète de la page d'accueil.

| Condition | Où |
|---|---|
| `/m/index.html` est indexable (`index, follow`) | `m/index.html` |
| `/m/index.html` a un `rel="canonical"` vers `/` | `m/index.html` |
| `/index.html` a un `rel="alternate" media` vers `/m/` | `index.html` |
| **Parité totale** entre `/` et `/m/` | les deux |

La parité couvre : le `title`, la `meta description`, les données structurées JSON-LD, et le contenu textuel.

### Incident de référence — juillet 2026

`m/index.html` était en `noindex, nofollow`. Google, redirigé vers cette page, a appliqué le `noindex` à la page d'accueil.

Conséquences mesurées sur 90 jours :
- CTR de la home : 4,33 % → 2,10 %
- Clics : −25 % malgré +54 % d'impressions
- Requête de marque « armwrestling club strassen » : position 1,4 → 5,6
- Le `nofollow` bloquait la découverte : 11 des 15 pages inspectées étaient « URL is unknown to Google »

**Leçon : toute modification de `m/index.html` doit être vérifiée comme si elle s'appliquait à la page d'accueil. C'est le cas.**

### Alternative envisagée

Fusionner `/m/` dans `/` via `scroll-snap` CSS — une seule URL, le carrousel conservé sur mobile par media query :

```css
@media (max-width: 640px) {
  html { scroll-snap-type: y mandatory; }
  section { scroll-snap-align: start; min-height: 100dvh; overflow-y: auto; }
}
```

Supprime définitivement la classe de risque ci-dessus. Non appliqué à ce jour : demande une passe éditoriale, les textes de `/m/` étant écrits courts pour tenir dans une slide.

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
- `m/index.html` — 10 liens contextuels dans les slides (**seuls liens que Googlebot voit depuis la home**)

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
