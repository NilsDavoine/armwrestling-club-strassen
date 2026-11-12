# ÉTAT : site du club (armwrestlingclubstrassen.com)

> Une page. Le haut dit où on en est ; le journal en bas, le plus récent en premier.
> Quand Nils dit **« passation »** : mettre à jour « En bref » et « Attend Nils », puis ajouter une ligne datée au journal (ce qui est fait, ce qui a été mesuré en ligne, ce qui reste).

## En bref (2026-11-12)

- Site statique, publié par GitHub Pages depuis la branche `main`. 25 adresses dans `sitemap.xml`.
- Dernier commit en ligne le 2026-11-12 à 10 h 34 : `d0f8ef7` (accueil, photos du palmarès).
- Chantier ouvert : **Open Vendetta** (vitrine de profils, inscription, page de gestion branchée sur Firebase). En ligne depuis le 2026-11-11. État détaillé : `C:\Users\NILS\armwrestlingclubstrassen\open-vendetta\ETAT.md`.
- **Plusieurs sessions travaillent parfois en même temps dans ce dépôt** (vu le 2026-11-12 : une sur Open Vendetta, une sur l'accueil). Avant de commiter : `git status`, puis n'ajouter que ses propres fichiers.

## Attend Nils

- **GoatCounter** (mesure d'audience sans cookie) : 26 pages portent encore `VOTRE-CODE-GOATCOUNTER`. Il faut le code obtenu à l'inscription sur goatcounter.com. D'ici là, chaque page montre une erreur `400` dans la console.
- **Open Vendetta** : voir la section « Attend » de `open-vendetta\ETAT.md` (connexion à la gestion depuis le téléphone, appli ntfy, import de la feuille Vendetta 2026).
- **Fichiers jamais commités**, présents seulement sur le disque (relevé du 2026-11-12) : `_promo/`, `docs/google-business/`, `docs/superpowers/plans/2026-11-11-open-vendetta.md`, `docs/superpowers/specs/2026-09-24-affiches-video-cnam-design.md`, `docs/superpowers/specs/2026-11-11-open-vendetta-design.md`. À décider : les commiter ou les laisser hors de Git. Rien à supprimer.

## Reprendre le travail

1. Lire `CLAUDE.md` (sa table « Quand… lire d'abord… »).
2. Lire ce fichier.
3. Pour Open Vendetta : `open-vendetta\CLAUDE.md` et `open-vendetta\ETAT.md`.
4. Pour une nouvelle page : `docs/methode/05_AJOUTER-UNE-PAGE.md`.

## Journal

- **2026-11-12** : environnement de travail installé, comme celui d'Agir Luxembourg. Méthode dans `docs/methode/` (6 fiches), ce fichier, `CLAUDE.md` avec une table de renvois, style de réponse ELI5 activé pour ce dossier, compétences `ui-ux-pro-max` installées pour tous les dossiers, préférences de Nils dans `C:\Users\NILS\.claude\CLAUDE.md`. Outils de mesure testés sur ce PC (serveur local `8766`, fenêtre Chrome du club `9340`, `nav.mjs`). Fiche de décision : `docs/superpowers/specs/2026-11-12-environnement-de-travail-design.md`.
- **2026-11-12, 10 h 40** : Open Vendetta, règles Firestore déployées, puis site poussé (`e66428c` et `d0f8ef7`). Détail dans `open-vendetta\ETAT.md`.
- **2026-11-11, 21 h 30** : Open Vendetta publié pour la première fois.
- Avant : voir `git log`.
