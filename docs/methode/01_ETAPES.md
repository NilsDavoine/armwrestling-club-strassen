# 01 : Les étapes de toute création, toujours dans le même ordre

> À lire **avant** de créer ou modifier quoi que ce soit : une page, une section, un formulaire, un texte, un outil. Principes : `00_PRINCIPES.md`. Compétences citées : `04_COMPETENCES.md`. Pour une page entière : `05_AJOUTER-UNE-PAGE.md` applique ces étapes au cas précis.

## Étape A : cadrage (obligatoire avant toute création)

Invoquer `superpowers:brainstorming` avant d'écrire la moindre ligne.

- **Les questions passent par l'outil de questions à choix** (réponses cliquables), par séries, la recommandation en premier. Chaque option dit ce qu'elle implique. Préférence de Nils, qui prime sur « une seule question à la fois » de la compétence.
- On cerne l'intention réelle de Nils, pas celle qu'on imagine. On ne propose pas d'améliorations non demandées.
- On sort avec **une fiche de décision écrite** : `docs/superpowers/specs/AAAA-MM-JJ-<sujet>-design.md`. Pas avec du code.

## Étape B : le « ok » de Nils

Le cadrage se termine par un résumé court de ce qui est décidé. Rien ne part en fabrication sans un **« ok » explicite**.

Si la session tourne sans Nils en face : livrer tout ce qui ne dépend pas de la décision, écrire la proposition, s'arrêter là.

## Étape C : la maquette avant le code

Pour tout ce qui se voit (page, section, fiche, formulaire), on montre **plusieurs maquettes à comparer** avant de toucher au site.

- Outils : `ui-ux-pro-max:ui-ux-pro-max` (style, couleurs, typographie, règles UX ; ses commandes `python` se lancent avec `py -3`), puis `design-taste-frontend` pour la finition.
- Toujours **les deux vues** : grand écran à 1440 px et téléphone à 390 px.
- Forme qui a marché pour Open Vendetta : un dossier de maquettes HTML à côté du site, ouvert d'un clic (`C:\Users\NILS\armwrestlingclubstrassen\open-vendetta-maquettes\`, fichier `voir-les-maquettes.bat`). Pour un rapport ou une comparaison commentée : un artifact au gabarit `planche-claire` (couleur du club `#C0392B`).
- Le 2026-11-12, entre 6 maquettes, Nils a choisi **celle au style du site** (m6, avec `style.css`). Partir du style existant du site, sauf demande contraire.

Rien ne part en fabrication tant que Nils n'a pas **nommé** la maquette retenue.

## Étape D : le plan écrit, puis l'exécution

Pour tout travail en plusieurs étapes : un plan (`superpowers:writing-plans`) dans `docs/superpowers/plans/AAAA-MM-JJ-<sujet>.md`, tâche par tâche, avec pour chaque tâche **ce qui prouve qu'elle est finie**. Puis l'exécution (`superpowers:subagent-driven-development` ou `superpowers:executing-plans`), en cochant au fur et à mesure.

Le PC n'a que 8 Go de mémoire : peu d'agents en même temps.

## Étape E : vérifier en local, puis publier

1. Vérifier en local, en 1440 et en 390 : `03_REGARDER-LE-SITE.md`.
2. Commiter les fichiers de la tâche, et **seulement** ceux-là (une autre session peut avoir des fichiers en cours dans le même dépôt).
3. **Publier = `git push origin main`, seulement quand Nils le demande.** GitHub Pages met alors le site en ligne.
4. Si la page lit ou écrit dans Firestore et que les règles ont changé : **déployer les règles d'abord** (`npx firebase deploy --only firestore:rules` depuis `C:\Users\NILS\armwrestlingclubstrassen\open-vendetta`), puis pousser le site. Dans l'autre ordre, le site en ligne envoie des données que la base refuse.

## Étape F : mesurer en ligne, dans l'autre sens

On relit le résultat **sur armwrestlingclubstrassen.com**, pas dans les fichiers qu'on vient d'écrire :

- la page répond `200` ;
- grand écran 1440 et téléphone 390, sans débordement ;
- la console du navigateur ne montre pas d'erreur nouvelle (l'erreur GoatCounter `400` est connue : le code n'est pas encore activé) ;
- pour une nouvelle page : `sitemap.xml` en ligne la contient, et les liens entrants sont en ligne.

Outils et pièges : `03_REGARDER-LE-SITE.md`.

## Fin de travail

1. `superpowers:verification-before-completion`.
2. `superpowers:requesting-code-review` (ou `code-review`).
3. Une ligne datée dans `docs/ETAT.md`, avec ce qui a été mesuré.
4. Dire à Nils ce qui n'a pas été fait, et pourquoi.
