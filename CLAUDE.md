# Armwrestling Club Strassen — site web

Site vitrine statique du club de bras de fer de Strassen (Luxembourg), affilié LAF.
Objectif principal : **convertir des visiteurs en participants à la séance d'essai gratuite du mardi 19h.**

> **Carte et renvois.** Ce haut de fichier dit **où lire avant d'agir**. Comment on travaille : `docs/methode/`. Où on en est : `docs/ETAT.md`. Les préférences de Nils valables dans tous ses dossiers : `C:\Users\NILS\.claude\CLAUDE.md`.

## Quand… lire d'abord… puis

| Quand… | Lire d'abord | Puis |
|---|---|---|
| Toute conversation commence | `docs/methode/00_PRINCIPES.md`, puis `docs/ETAT.md` | invoquer `superpowers:using-superpowers` |
| Créer ou modifier quelque chose (page, section, formulaire, texte, outil) | `docs/methode/01_ETAPES.md` | cadrage (questions à choix) → « ok » → maquettes → plan → vérifier en local → publier sur demande → mesurer en ligne |
| **Ajouter une page au site** | **`docs/methode/05_AJOUTER-UNE-PAGE.md`** | le cycle complet, la liste SEO à cocher, la phrase à donner à une session |
| Regarder, mesurer ou capturer une page (en local ou en ligne) | `docs/methode/03_REGARDER-LE-SITE.md` | serveur local `8766`, fenêtre Chrome du club `9340`, `nav.mjs` |
| Choisir une compétence, ou une compétence citée est absente | `docs/methode/04_COMPETENCES.md` | colonne « si absente » |
| Rédiger une réponse à Nils | style **ELI5** actif ; référence `docs/methode/02_PARLER-A-NILS.md` | conclusion d'abord, gestes numérotés, zéro jargon |
| Une maquette, un design | `ui-ux-pro-max:ui-ux-pro-max`, puis `design-taste-frontend` | 1440 et 390, style du site ; ses commandes `python` se lancent avec `py -3` |
| Écrire le texte d'une page | `docs/CONTENU.md` | `no-ai-slop` avant de rendre le texte |
| Un bug, un test qui échoue, un comportement inattendu | `superpowers:systematic-debugging` | avant tout correctif |
| Open Vendetta (vitrine, inscription, gestion, Firebase) | `docs/OPEN-VENDETTA.md`, puis `..\open-vendetta\CLAUDE.md` et son `ETAT.md` | règles Firestore déployées **avant** de pousser le site |
| Ajouter ou changer une image | `docs/IMAGES.md` | `.webp`, 300 Ko au plus |
| Posts Google Business | `docs/GOOGLE-BUSINESS.md` | compétence `.claude/skills/google-business-posts` |
| Publier (pousser) | `docs/methode/01_ETAPES.md`, étape E | **seulement sur demande de Nils**, puis mesurer en ligne |
| Savoir où on en est, ce qui attend Nils | `docs/ETAT.md` | |

## Règles qui ne bougent pas

1. **Pousser = mettre en ligne.** `git push origin main` seulement quand Nils le demande. Avant de commiter : `git status`, puis n'ajouter que ses propres fichiers : d'autres sessions travaillent parfois dans ce dépôt en même temps.
2. **Mesurer plutôt que déduire.** « C'est fait » seulement après lecture sur armwrestlingclubstrassen.com, en 1440 et en 390. Sinon : « écrit, pas encore vérifié ».
3. **Aucune amélioration non demandée. Aucune suppression sans « ok » explicite.** Avant d'écraser un fichier : copie dans `.claude/sauvegardes/<date>/` (jamais dans un `sauvegardes/` à la racine : il serait publié).
4. **Tout ce qui est posé à la racine part en ligne**, sauf les noms qui commencent par `_` ou `.` et ce que `_config.yml` exclut.
5. **Aucun numéro de téléphone sur le site. Aucun secret dans le dépôt** (il part sur GitHub).
6. **Firestore avant le site** : si des règles ont changé, les déployer, puis pousser.

## Reprendre et passer la main

1. Début de session : lire `docs/ETAT.md`.
2. Quand Nils dit « passation » : mettre à jour `docs/ETAT.md` (« En bref », « Attend Nils », une ligne datée au journal), et `..\open-vendetta\ETAT.md` si on a travaillé sur Open Vendetta.

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
├── open-vendetta.html             Vitrine Open Vendetta (Firestore) — page publique indexable
├── open-vendetta-ajouter.html     Renvoi vers le formulaire en bas de open-vendetta.html (noindex volontaire)
├── open-vendetta-gestion.html     Gestion Open Vendetta (noindex, nofollow volontaire)
├── ov/                            JS et assets d'Open Vendetta (voir docs/OPEN-VENDETTA.md)
├── *.html                         Pages SEO locales et articles de blog
├── style.css                      Feuille principale (~71 Ko)
├── blog.css                       Styles spécifiques aux articles
├── main.js                        Interactions globales
├── sitemap.xml                    25 URLs indexables
├── robots.txt
├── _config.yml                    Jekyll — exclut du site publié CLAUDE.md, docs/, drafts/, node_modules/ et l'outillage ; un autre .md à la racine serait publié
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
| [docs/GOOGLE-BUSINESS.md](docs/GOOGLE-BUSINESS.md) | Posts Google Business : règles, format, journal des posts |
| [docs/OPEN-VENDETTA.md](docs/OPEN-VENDETTA.md) | Open Vendetta : vitrine, inscription, gestion (Firebase) |
| [docs/methode/](docs/methode/) | Comment on travaille : principes, étapes, regarder le site, compétences, ajouter une page |
| [docs/ETAT.md](docs/ETAT.md) | Où on en est, ce qui attend Nils, journal |

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
- GoatCounter (sans cookie, sans bannière RGPD) est déclaré en fin de `<body>` sur les 25 pages publiques.
- **À activer** : remplacer `VOTRE-CODE-GOATCOUNTER` par le code obtenu à l'inscription sur goatcounter.com.

### Ce qui est volontaire — ne pas « corriger »
- `tournament.html` : `noindex, follow`, pas de `<h1>` — c'est un outil interne, pas une page publique.
- `m/evenement.html` : `noindex, nofollow` — formulaire réservé aux inscrits.
- `open-vendetta-ajouter.html` (`noindex, follow`) et `open-vendetta-gestion.html` (`noindex, nofollow`, hors sitemap) : formulaire et outil de l'organisateur, pas des pages à classer.
- La redirection mobile ligne 5 de `index.html` — voir [docs/SEO.md](docs/SEO.md) pour la justification et ses contraintes.
- Les `<h4>` de `comment-gagner`, `premier-tournoi` et `recuperation-tendinites` sautent le niveau `h3` : ils portent des styles dédiés (`.timeline-content h4`, `.checklist h4`). Les convertir changerait le rendu.
- `.fade-in` reste à `opacity: 0` par défaut ; le repli sans JS passe par le `<noscript>` et le `onerror` de `main.js` dans `index.html`.

## Posts Google Business

Quand Nils demande de nouveaux posts Google Business : préparer **13 posts, un par semaine, pour les 3 mois suivants**, texte uniquement (Nils gère les photos), en suivant [docs/GOOGLE-BUSINESS.md](docs/GOOGLE-BUSINESS.md). Skill local : `.claude/skills/google-business-posts`.

## Contexte

- **Président** : Nils Davoine, arbitre national luxembourgeois
- **Sites d'entraînement** : Strassen, Centre National des Arts Martiaux (CNAM), 297 rue de Reckenthal, L-2410 (mardi 19h–21h30, depuis le 29/09/2026 ; 60 places, 5 tables) et Munsbach (vendredi 18h)
- **Événement** : POWER ARM 1st Edition

## Agent skills

### Issue tracker

Les issues vivent dans les GitHub Issues du dépôt `NilsDavoine/armwrestling-club-strassen`. See `docs/agents/issue-tracker.md`.

⚠️ **La CLI `gh` n'est pas installée sur ce PC** (vérifié le 2026-11-12) : toutes les commandes de `docs/agents/issue-tracker.md` échouent. Le suivi du travail se fait dans `docs/ETAT.md` et dans les plans de `docs/superpowers/plans/`. Pour lire ou écrire une issue malgré tout : les outils GitHub du plugin ecc (`mcp__plugin_ecc_github__*`), pas encore essayés ici.

### Triage labels

Les cinq libellés canoniques, repris tels quels : `needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context : un `CONTEXT.md` et un `docs/adr/` à la racine, créés à la demande. See `docs/agents/domain.md`.
