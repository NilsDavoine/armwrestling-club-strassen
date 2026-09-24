# Armwrestling Club Strassen — site web

Site vitrine statique du club de bras de fer de Strassen (Luxembourg), affilié LAF.
Objectif principal : **convertir des visiteurs en participants à la séance d'essai gratuite du mardi 19h.**

## Nature du projet

Site **100 % statique**, sans build, sans framework, sans dépendance runtime.
Chaque page est un fichier `.html` autonome à la racine, avec son CSS partagé et son JSON-LD inline.

- **Hébergement** : GitHub Pages, branche `main`, déploiement automatique au push
- **Domaine** : `armwrestlingclubstrassen.com` (fichier `CNAME`)
- **Jekyll** : actif par défaut (pas de `.nojekyll`) → **tout dossier préfixé `_` est exclu du déploiement**
- **Langue principale** : français (`fr-LU`), une variante allemande

## Structure

```
/
├── index.html                     Page d'accueil (desktop + responsive)
├── articles.html                  Index du blog — hub de maillage interne
├── m/                             Version mobile (carrousel plein écran)
│   ├── index.html                 Carrousel — canonical vers /
│   └── evenement.html             Formulaire perfs POWER ARM (noindex volontaire)
├── tournament.html                Outil de gestion de tournoi (noindex volontaire)
├── duel.html                      Outil de gestion de duels (noindex volontaire)
├── vendetta.html                  Candidature Vendetta 2026 — page publique indexable
├── *.html                         Pages SEO locales et articles de blog
├── style.css                      Feuille principale (~71 Ko)
├── blog.css                       Styles spécifiques aux articles
├── main.js                        Interactions globales
├── sitemap.xml                    24 URLs indexables
├── robots.txt
├── _config.yml                    Jekyll — exclut docs/, drafts/ et les .md du site publié
├── *.webp                         Images servies (compressées)
├── picture_event_clubs/           Photos des exercices POWER ARM
├── drafts/                        Brouillons markdown d'articles
├── _archive/                      Images inutilisées — NON déployé (préfixe `_`)
└── docs/                          Documentation projet
```

## Documentation

| Fichier | Contenu |
|---|---|
| [docs/SEO.md](docs/SEO.md) | Règles SEO, conventions de balisage, configuration mobile |
| [docs/IMAGES.md](docs/IMAGES.md) | Workflow de compression des images |
| [docs/CONTENU.md](docs/CONTENU.md) | Comment ajouter une page ou un article |
| [docs/DEPLOIEMENT.md](docs/DEPLOIEMENT.md) | Procédure de déploiement |
| [docs/VENDETTA.md](docs/VENDETTA.md) | Collecte des candidatures Vendetta 2026 (Apps Script → Google Sheets) |
| [docs/DUEL.md](docs/DUEL.md) | Spécification du Duel Mode (`duel.html`) |

## Règles à respecter

### SEO — non négociable
- Toute nouvelle page publique doit avoir : `title` (50-60 car.), `meta description` (120-160 car.), `robots index, follow`, `canonical` auto-référencé, **un seul** `<h1>`, un bloc JSON-LD, et une entrée dans `sitemap.xml`.
- Toute nouvelle page doit recevoir **au moins 3 liens entrants** depuis des pages existantes. Une page sans lien entrant n'est pas découverte par Google.
- `/m/index.html` doit rester **à parité** avec `index.html` : mêmes données structurées, même `title`, même `meta description`. Google indexe le contenu de `/m/` pour l'URL `/`.
- Ne jamais mettre `noindex` sur une page atteignable par la redirection mobile.

### Images
- Jamais d'image servie au-delà de **~300 Ko**. Passer par le workflow de [docs/IMAGES.md](docs/IMAGES.md).
- Jamais de JPEG brut d'appareil photo servi tel quel : convertir en WebP ≤ 1440 px avant de le référencer.
- Format `.webp` uniquement pour le contenu ; PNG réservé aux favicons.
- **Nommage en kebab-case descriptif** — `match-officiel-arbitre-laf-luxembourg.webp`, jamais `2F3A1361.webp`. Le nom de fichier est un signal de classement pour Google Images. Pas de parenthèses ni de majuscules.
- Ne **pas** renommer une image déjà en ligne pour l'esthétique : GitHub Pages ne sait pas rediriger un fichier image, et un renommage fait perdre son classement Google Images. Les 42 images en `snake_case` ou `PascalCase` restent telles quelles, volontairement.

### Mesure d'audience
- GoatCounter (sans cookie, sans bannière RGPD) est déclaré en fin de `<body>` sur les 24 pages publiques.
- **À activer** : remplacer `VOTRE-CODE-GOATCOUNTER` par le code obtenu à l'inscription sur goatcounter.com.

### Ce qui est volontaire — ne pas « corriger »
- `tournament.html` : `noindex, follow`, pas de `<h1>` — c'est un outil interne, pas une page publique.
- `m/evenement.html` : `noindex, nofollow` — formulaire réservé aux inscrits.
- La redirection mobile ligne 5 de `index.html` — voir [docs/SEO.md](docs/SEO.md) pour la justification et ses contraintes.
- Les `<h4>` de `comment-gagner`, `premier-tournoi` et `recuperation-tendinites` sautent le niveau `h3` : ils portent des styles dédiés (`.timeline-content h4`, `.checklist h4`). Les convertir changerait le rendu.
- `.fade-in` reste à `opacity: 0` par défaut ; le repli sans JS passe par le `<noscript>` et le `onerror` de `main.js` dans `index.html`.

## Contexte

- **Président** : Nils Davoine, arbitre national luxembourgeois
- **Sites d'entraînement** : Strassen, Centre National des Arts Martiaux (CNAM), 297 rue de Reckenthal, L-2410 (mardi 19h–21h30, depuis le 29/09/2026 ; 60 places, 5 tables) et Munsbach (vendredi 18h)
- **Événement** : POWER ARM 1st Edition

## Agent skills

### Issue tracker

Les issues vivent dans les GitHub Issues du dépôt `NilsDavoine/armwrestling-club-strassen`, pilotées via la CLI `gh`. See `docs/agents/issue-tracker.md`.

### Triage labels

Les cinq libellés canoniques, repris tels quels : `needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context : un `CONTEXT.md` et un `docs/adr/` à la racine, créés à la demande. See `docs/agents/domain.md`.
