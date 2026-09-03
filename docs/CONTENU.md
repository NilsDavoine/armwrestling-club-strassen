# Contenu — ajouter une page ou un article

## Principe

Une page = **une intention de recherche**. Deux pages qui visent la même requête se cannibalisent et perdent toutes les deux. Vérifier avant d'écrire qu'aucune page existante ne couvre déjà le sujet.

## Types de pages

| Type | Exemple | Schema JSON-LD |
|---|---|---|
| Page locale (conversion) | `entrainement-bras-de-fer-strassen.html` | `SportsClub` + `BreadcrumbList` |
| Article de blog | `technique-prise-bras-de-fer.html` | `Article` + `BreadcrumbList` (+ `FAQPage` si vraie FAQ) |
| Hub | `articles.html` | `BreadcrumbList` |

## Procédure

### 1. Brouillon
Rédiger en markdown dans `drafts/`. Trois exemples y sont disponibles.

### 2. Partir d'une page existante
Copier la page du même type la plus proche et remplacer le contenu. Cela garantit la cohérence du CSS, de la navigation et du fil d'Ariane.

### 3. Le `<head>`
```html
<meta name="robots" content="index, follow"/>
<link rel="canonical" href="https://armwrestlingclubstrassen.com/MA-PAGE.html"/>
<title>…</title>                                <!-- 50-60 caractères -->
<meta name="description" content="…"/>           <!-- 120-160 caractères -->
```

Le `title` porte le concept principal en tête. La description décrit honnêtement la page — elle n'influence pas le classement mais bien le taux de clic.

### 4. Structure
- **un seul** `<h1>`, reprenant l'intention principale
- `<h2>`/`<h3>` reflétant la hiérarchie réelle du contenu, jamais choisis pour l'apparence
- pas de `FAQPage` en JSON-LD si la page n'affiche pas réellement les questions

### 5. Sitemap
```xml
<url>
  <loc>https://armwrestlingclubstrassen.com/MA-PAGE.html</loc>
  <lastmod>AAAA-MM-JJ</lastmod>
  <changefreq>monthly</changefreq>
  <priority>0.8</priority>
</url>
```

### 6. Maillage — l'étape la plus souvent oubliée

**Au moins 3 liens entrants**, sinon Google ne découvrira pas la page.

- ajouter une carte dans `articles.html`
- ajouter un lien contextuel en plein texte dans 2 articles liés (bloc `<div class="callout">`)
- si la page cible le mobile ou la conversion locale, ajouter un lien dans une slide de `m/index.html`

Ancres descriptives, jamais « cliquez ici ».

### 7. Vérification
```bash
grep -l 'href="\(\.\./\)\?MA-PAGE.html"' *.html m/*.html | wc -l   # doit être >= 3
curl -s -o /dev/null -w '%{http_code}' https://armwrestlingclubstrassen.com/MA-PAGE.html
```

## Contraintes de style

- Grille d'articles liés : `blog-grid-v2` est en `repeat(3, 1fr)` — **exactement 3 cartes**, une 4ᵉ crée une ligne orpheline. Pour un lien supplémentaire, utiliser un lien contextuel en plein texte.
- Encadré de mise en avant : `<div class="callout">`
- Lien contextuel : `style="color:var(--white);font-weight:600;"`

## Après publication

Soumettre l'URL dans l'outil d'inspection de Google Search Console pour accélérer l'indexation. Sans cela, la découverte peut prendre plusieurs semaines.
