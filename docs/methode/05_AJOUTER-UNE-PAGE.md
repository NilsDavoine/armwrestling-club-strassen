# 05 : Ajouter une page au site, du début à la fin

> **À lire par toute session à qui Nils confie une page** : une page locale, un article, une page d'événement, un outil. Les principes sont dans `00_PRINCIPES.md`, les étapes dans `01_ETAPES.md` ; ce fichier les applique au cas d'une page du site du club. La partie purement technique (le `<head>`, le sitemap, le maillage) est dans `docs/CONTENU.md` : on la suit, on ne la recopie pas ici.

---

## 1. Ce qu'il faut lire avant de toucher à quoi que ce soit

Dans cet ordre.

| Fichier | Ce qu'on y prend |
|---|---|
| `docs/methode/00_PRINCIPES.md` | mesurer plutôt que déduire, les interdits |
| `docs/methode/01_ETAPES.md` | cadrage, « ok », maquette, plan, publication, mesure |
| `docs/methode/03_REGARDER-LE-SITE.md` | voir et mesurer le site en local et en ligne |
| `CLAUDE.md` § « Règles à respecter » | le SEO non négociable, les images, ce qui est volontaire |
| `docs/CONTENU.md` | la procédure technique d'une nouvelle page |
| `docs/SEO.md`, `docs/IMAGES.md` | le balisage, la version mobile, la compression des images |
| `docs/ETAT.md` | ce qui est en cours, ce qui attend Nils |

Si la page lit ou écrit dans Firebase : `docs/OPEN-VENDETTA.md`, puis `C:\Users\NILS\armwrestlingclubstrassen\open-vendetta\CLAUDE.md` et son `ETAT.md`.

---

## 2. Le cycle, en sept temps

### Temps 1 : regarder ce qui existe

- **Une page couvre-t-elle déjà ce sujet ?** Deux pages sur la même recherche se font concurrence et perdent toutes les deux (`docs/CONTENU.md`, « Principe »).
- Quelle page existante est **du même type** (page locale, article, outil) ? On partira d'elle.
- Quelles pages pourront **pointer vers la nouvelle** (il en faut au moins 3) ?
- Mesurer la page modèle en ligne, en 1440 et en 390 (`03_REGARDER-LE-SITE.md`).

### Temps 2 : cadrer avec Nils

Invoquer `superpowers:brainstorming`. Questions avec l'outil à choix, par séries, recommandation en premier. À trancher au minimum :

- le but de la page, et la recherche Google qu'elle vise ;
- le type : page publique à classer, ou outil (`noindex`) ;
- l'appel à l'action (l'objectif du site : la séance d'essai gratuite du mardi 19 h) ;
- les langues.

On sort avec la fiche `docs/superpowers/specs/AAAA-MM-JJ-<page>-design.md`.

### Temps 3 : les maquettes

Plusieurs maquettes, en 1440 et en 390, à partir du style du site (`style.css`). Outils : `ui-ux-pro-max:ui-ux-pro-max`, puis `design-taste-frontend`. Nils **nomme** celle qu'il retient. Rien ne se code avant.

### Temps 4 : le plan

`superpowers:writing-plans`, dans `docs/superpowers/plans/AAAA-MM-JJ-<page>.md`. Chaque tâche dit ce qui prouve qu'elle est finie.

### Temps 5 : fabriquer

Partir de la page du même type (`docs/CONTENU.md` §2), puis cocher **chaque ligne** :

- [ ] `title` de 50 à 60 caractères, concept principal en tête
- [ ] `meta description` de 120 à 160 caractères
- [ ] `robots` à `index, follow` (ou `noindex` si c'est un outil, et alors l'ajouter à « Ce qui est volontaire » dans `CLAUDE.md`)
- [ ] `canonical` vers sa propre adresse
- [ ] **un seul** `<h1>`
- [ ] un bloc JSON-LD qui correspond au type de page (`docs/CONTENU.md`, tableau « Types de pages »)
- [ ] une entrée dans `sitemap.xml`
- [ ] **au moins 3 liens entrants** depuis 3 pages différentes : carte dans `articles.html`, liens dans le texte de 2 articles proches, diapositive de `m/index.html` si la page vise le téléphone
- [ ] images en `.webp`, 1440 px au plus, 300 Ko au plus, nom en kebab-case descriptif (`docs/IMAGES.md`)
- [ ] le script GoatCounter en fin de `<body>`, comme sur les autres pages publiques
- [ ] aucun numéro de téléphone
- [ ] textes passés par `no-ai-slop`

### Temps 6 : vérifier en local

Serveur local et fenêtre du club : `03_REGARDER-LE-SITE.md`. Mesurer en 1440 et en 390 : un seul `h1`, aucun débordement, aucune erreur nouvelle dans la console. Puis compter les liens entrants **par leur nom** (Bash, depuis le dossier du site) :

```bash
grep -l 'href="\(\.\./\)\?MA-PAGE.html"' *.html m/*.html
```

Mesuré le 2026-11-12 sur `nutrition-bras-de-fer.html` : 3 pages, `articles.html`, `preparation-competition-bras-de-fer.html`, `recuperation-tendinites-bras-de-fer.html`.

Puis `web-design-guidelines` sur la page, et `ecc:seo` ou `marketing-skills:seo-audit`.

### Temps 7 : publier, puis mesurer en ligne

1. Commiter **seulement** les fichiers de la page.
2. **Pousser seulement quand Nils le demande** : `git push origin main`. Si des règles Firestore ont changé, les déployer avant (`01_ETAPES.md`, étape E).
3. Mesurer en ligne, une fois la nouvelle version servie :

```bash
curl -s -o /dev/null -w '%{http_code}\n' https://armwrestlingclubstrassen.com/MA-PAGE.html   # attendu : 200
curl -s https://armwrestlingclubstrassen.com/sitemap.xml | grep -c "MA-PAGE.html"            # attendu : 1
```

Mesuré le 2026-11-12 sur `nutrition-bras-de-fer.html` : `200` et `1`.

4. Ouvrir la page en ligne dans la fenêtre du club, en 1440 et en 390, et relire ce qui s'affiche.
5. Dire à Nils de demander l'indexation de l'adresse dans Google Search Console (outil d'inspection d'URL) : sans cela, Google peut mettre des semaines à la trouver.
6. Une ligne datée dans `docs/ETAT.md`, avec les mesures.

---

## 3. Les pièges propres à ce site

1. **La version mobile de l'accueil est `/m/index.html`.** Elle doit rester à parité avec `index.html` : même `title`, même `meta description`, mêmes données structurées. Google indexe le contenu de `/m/` pour l'adresse `/`.
2. **Jamais de `noindex`** sur une page qu'on atteint par la redirection mobile.
3. **Grille d'articles liés : exactement 3 cartes.** Une 4e crée une ligne orpheline. Pour un lien de plus : un lien dans le texte.
4. **Ce qui est publié :** tout le dossier, sauf les dossiers qui commencent par `_` ou `.` et ce que `_config.yml` exclut (`CLAUDE.md`, `docs/`, `drafts/`, `node_modules/`…). Un nouveau dossier ou un nouveau `.md` à la racine **part en ligne**.
5. **Le `.gitignore` ignore `.png`, `.jpg`, `.jpeg`.** Une image dans un de ces formats n'arrive pas en ligne sans `git add -f`. Préférer le `.webp`.
6. **Ne jamais renommer une image déjà en ligne** : GitHub Pages ne sait pas rediriger une image, et elle perd son classement Google Images.
7. **`.fade-in` reste invisible sans JavaScript.** Voir `CLAUDE.md`, « Ce qui est volontaire », pour le repli.

---

## 4. Ce que la session rend à la fin

- La fiche de décision et le choix de maquette de Nils.
- Les mesures avant et après, prises en ligne, en 1440 et en 390.
- La liste des pages qui pointent vers la nouvelle, par leur nom.
- La ligne ajoutée dans `docs/ETAT.md`.
- Ce qui n'a pas été fait, et pourquoi.

---

## 5. La phrase à donner à une session

À copier telle quelle, en remplaçant la partie entre crochets.

> Tu travailles sur le site du club. Lis d'abord `docs/methode/05_AJOUTER-UNE-PAGE.md` et suis-le du début à la fin.
>
> La page que je te confie : **[le sujet de la page]**.
>
> Regarde d'abord ce qui existe déjà sur le site. Puis cadre avec moi, avec tes questions à choix. Puis montre-moi plusieurs maquettes, en grand écran et en téléphone. J'en choisis une, tu la fabriques, tu me la montres en local, et tu ne pousses que quand je te le dis. Ensuite tu mesures en ligne et tu me rends les mesures.
