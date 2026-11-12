# Refonte de l'accueil et d'Open Vendetta : plan

> Fiche de décision : `docs/superpowers/specs/2026-11-12-refonte-accueil-open-vendetta-design.md`.
> Exécution dans la session, tâche par tâche (8 Go de mémoire : pas d'agents en parallèle sur des fichiers partagés). Cocher au fur et à mesure.

**But :** appliquer les 20 choix de l'accueil et les 8 choix d'Open Vendetta, avec des photos du club retouchées.

**Architecture :** l'accueil reçoit sa propre feuille `accueil.css` et son script `accueil.js` ; `style.css` ne bouge pas. Open Vendetta garde `style.css` et ses styles dans la page. La page mobile `/m/` devient un renvoi vers `/`.

**Outils :** HTML, CSS et JavaScript à la main, sans build. Retouche des photos avec Python (`py -3`, Pillow et numpy). Vérification dans la fenêtre Chrome du club (port 9340) sur le serveur local 8766, à 1440 et à 390 px.

---

## Tâche 1 : photos du club retouchées

Fichiers : nouveaux `.webp` à la racine et dans `ov/assets/img/club/`. Script de retouche hors dépôt.

- [x] Choisir les photos : accroche, salle du CNAM, mise en garde, match d'entraînement, compétition, accroche d'Open Vendetta.
- [x] Retoucher : recadrage, redressement, lumière, couleurs, netteté, même étalonnage.
- [x] Planche avant / après relue à l'œil.

**Fini quand :** chaque fichier fait 300 Ko au plus et 1440 px au plus, porte un nom en minuscules avec tirets, et la planche avant / après est montrée à Nils.

## Tâche 2 : Open Vendetta

Fichiers : `open-vendetta.html`, `ov/js/ov-vitrine.js`, `ov/js/ov-vue.js`, `ov/js/ov-inscription.js`. Copie avant modification dans `.claude/sauvegardes/2026-11-12-refonte/`.

- [x] 1A accroche courte, profils dès le premier écran.
- [x] 2A trois étapes sous l'accroche.
- [x] 3B photos : noir et blanc, voile rouge, cadre 4 pour 5 rempli.
- [x] 4A cartes-portraits à partir de 901 px de large ; rangées sur téléphone.
- [x] 5A formulaire : une étape à la fois, barre d'avancement, retour possible sans perdre les réponses.
- [x] 6A menu et pied de page : « Ajouter mon profil », plus de lien en double, bouton du menu de 44 px.
- [x] 7A ligne « Ouvert depuis le 11 novembre 2026 ».
- [x] 8A rangées grises pendant le chargement, bouton « Réessayer » si la base ne répond pas.
- [x] Versions des scripts augmentées (`?v=`).

**Fini quand :** à 1440 et à 390 px, la page charge les profils de la vraie base, une fiche s'ouvre, le formulaire passe de l'étape 1 à 3 et revient sans perdre de réponse, rien ne déborde, la console ne montre pas d'erreur nouvelle. Les tests de `..\open-vendetta\tests\data.test.mjs` passent. Aucun formulaire n'est envoyé à la vraie base.

## Tâche 3 : accueil

Fichiers : `index.html` (réécrit), `accueil.css` et `accueil.js` (nouveaux), `m/index.html` (renvoi). Copies avant modification dans `.claude/sauvegardes/2026-11-12-refonte/`.

- [x] `accueil.css` : noir uni, une bande rouge, 6 tailles de texte, 2 boutons et 1 lien, lignes à la place des boîtes, angles droits.
- [x] `index.html` : 8 sections dans l'ordre de la fiche, textes courts, aucun émoji, aucun tiret long, aucun numéro de téléphone.
- [x] `accueil.js` : prochain mardi, accordéon, menu du téléphone.
- [x] Redirection mobile et balise `alternate media` retirées ; `m/index.html` renvoie vers `/`.
- [x] Tous les liens internes de l'ancien `index.html` et de l'ancien `m/index.html` sont présents.
- [x] Données structurées : `telephone` retiré, questions affichées = questions déclarées.

**Fini quand :** à 1440 et à 390 px, rien ne déborde, un seul `h1`, aucun texte sous 13 px, aucune zone cliquable sous 44 px (hors liens dans une phrase), aucun texte sous le contraste 4,5 pour 1, 0 émoji, 0 tiret long, 0 numéro de téléphone écrit. La liste des liens internes de l'ancienne page est incluse dans la nouvelle. `sitemap.xml` : date de `/` et d'`open-vendetta.html` mises à jour.

## Tâche 4 : documents et relecture

- [x] `docs/SEO.md` : la section « Configuration mobile » décrit la page unique.
- [x] `CLAUDE.md` : structure, parité `/m/` et redirection mobile mises à jour.
- [x] `docs/OPEN-VENDETTA.md` : formulaire par étapes, cartes-portraits, traitement des photos.
- [x] `docs/ETAT.md` : une ligne datée, ce qui est mesuré, ce qui attend Nils.
- [x] Vérification à l’écran (1440 et 390 px, mesures, console, liens).
- [ ] Relecture du code par un second regard (`superpowers:requesting-code-review`) : pas faite.

**Fini quand :** les documents disent ce que le site fait, et Nils a les adresses locales à regarder.

## Tâche 5 : mise en ligne (sur demande de Nils seulement)

- [x] `git status`, n'ajouter que les fichiers de ce chantier, commit (`8113836`, 22 fichiers).
- [x] `git push origin main` quand Nils le demande (« publie », le 2026-11-12).
- [x] Relire en ligne : `200`, 1440 et 390 px, console, `/m/` renvoie vers `/`. Fait le 2026-11-12, détail dans `docs/ETAT.md`.
