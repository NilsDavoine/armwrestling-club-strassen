# ÉTAT : site du club (armwrestlingclubstrassen.com)

> Une page. Le haut dit où on en est ; le journal en bas, le plus récent en premier.
> Quand Nils dit **« passation »** : mettre à jour « En bref » et « Attend Nils », puis ajouter une ligne datée au journal (ce qui est fait, ce qui a été mesuré en ligne, ce qui reste).

## En bref (2026-11-12)

- Site statique, publié par GitHub Pages depuis la branche `main`. 25 adresses dans `sitemap.xml`.
- Dernier commit en ligne le 2026-11-12 à 10 h 34 : `d0f8ef7` (accueil, photos du palmarès).
- Chantier ouvert : **Open Vendetta** (vitrine de profils, inscription, page de gestion branchée sur Firebase). En ligne depuis le 2026-11-11. État détaillé : `C:\Users\NILS\armwrestlingclubstrassen\open-vendetta\ETAT.md`.
- **Plusieurs sessions travaillent parfois en même temps dans ce dépôt** (vu le 2026-11-12 : une sur Open Vendetta, une sur l'accueil). Avant de commiter : `git status`, puis n'ajouter que ses propres fichiers.
- **Refonte de l’accueil et d’Open Vendetta : faite en local, pas encore en ligne** (28 choix de Nils après l’audit du 2026-11-12). Fiche de décision : `docs/superpowers/specs/2026-11-12-refonte-accueil-open-vendetta-design.md`. Plan : `docs/superpowers/plans/2026-11-12-refonte-accueil-open-vendetta.md`. L’accueil a sa propre feuille `accueil.css` ; `/m/index.html` n’est plus qu’un renvoi vers `/`.

## Attend Nils

- **Refonte de l’accueil et d’Open Vendetta** : regarder les deux pages en local, puis dire « publie ». Rien n’est commité. Fichiers du chantier : `index.html`, `accueil.css`, `accueil.js`, `m/index.html`, `open-vendetta.html`, `ov/js/ov-vitrine.js`, `ov/js/ov-vue.js`, `ov/js/ov-inscription.js`, `sitemap.xml`, 7 photos retouchées (5 à la racine, 2 dans `ov/assets/img/club/`), `CLAUDE.md`, `docs/SEO.md`, `docs/OPEN-VENDETTA.md`, ce fichier, la fiche et le plan. Copies d’avant : `.claude/sauvegardes/2026-11-12-refonte/`. À confirmer par Nils : le titre européen (qui, quelle catégorie), le lien « Événement POWER ARM » du pied de page, la ligne « Ouvert depuis le 11 novembre 2026 » d’Open Vendetta. Les 23 autres pages gardent l’ancien style (menu compris) : chantier à part.
- **GoatCounter** (mesure d'audience sans cookie) : 26 pages portent encore `VOTRE-CODE-GOATCOUNTER`. Il faut le code obtenu à l'inscription sur goatcounter.com. D'ici là, chaque page montre une erreur `400` dans la console.
- **Open Vendetta** : voir la section « Attend » de `open-vendetta\ETAT.md` (connexion à la gestion depuis le téléphone, appli ntfy, import de la feuille Vendetta 2026).
- **Fichiers jamais commités**, présents seulement sur le disque (relevé du 2026-11-12) : `_promo/`, `docs/google-business/`, `docs/superpowers/plans/2026-11-11-open-vendetta.md`, `docs/superpowers/specs/2026-09-24-affiches-video-cnam-design.md`, `docs/superpowers/specs/2026-11-11-open-vendetta-design.md`. À décider : les commiter ou les laisser hors de Git. Rien à supprimer.

## Reprendre le travail

1. Lire `CLAUDE.md` (sa table « Quand… lire d'abord… »).
2. Lire ce fichier.
3. Pour Open Vendetta : `open-vendetta\CLAUDE.md` et `open-vendetta\ETAT.md`.
4. Pour une nouvelle page : `docs/methode/05_AJOUTER-UNE-PAGE.md`.

## Journal

- **2026-11-12, après-midi** : audit de l’accueil et d’Open Vendetta (28 points, planches https://claude.ai/artifact/Buya4mLXQQbuQnJjcTiL78 et https://claude.ai/artifact/TfAu8n6UoMtW8ocXdX1Tb3), puis refonte des deux pages selon les 28 choix de Nils. **En local seulement.** Mesuré sur le serveur local, à 1440 et 390 px : accueil de 15 écrans à 7,5 ; 6 tailles de texte (13 à 80 px) au lieu de 32 ; 0 texte sous 13 px ; 0 texte sous le contraste 4,5 ; 0 émoji ; 0 tiret long ; 0 numéro de téléphone ; tous les liens internes de l’ancien accueil et de l’ancien `/m/` présents ; `/m/` renvoie vers `/` ; Open Vendetta charge les 19 profils, le formulaire passe les 3 étapes et garde les réponses (aucun envoi fait) ; 32 tests `data.test.mjs` passent ; console sans erreur. Pas fait : relecture en ligne, vrai téléphone, envoi d’un formulaire, relecture du code par un second regard.
- **2026-11-12** : environnement de travail installé, comme celui d'Agir Luxembourg. Méthode dans `docs/methode/` (6 fiches), ce fichier, `CLAUDE.md` avec une table de renvois, style de réponse ELI5 activé pour ce dossier, compétences `ui-ux-pro-max` installées pour tous les dossiers, préférences de Nils dans `C:\Users\NILS\.claude\CLAUDE.md`. Outils de mesure testés sur ce PC (serveur local `8766`, fenêtre Chrome du club `9340`, `nav.mjs`). Fiche de décision : `docs/superpowers/specs/2026-11-12-environnement-de-travail-design.md`.
- **2026-11-12, 10 h 40** : Open Vendetta, règles Firestore déployées, puis site poussé (`e66428c` et `d0f8ef7`). Détail dans `open-vendetta\ETAT.md`.
- **2026-11-11, 21 h 30** : Open Vendetta publié pour la première fois.
- Avant : voir `git log`.
