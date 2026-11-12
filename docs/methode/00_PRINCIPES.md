# 00 : Principes de travail (à lire au début de chaque conversation)

> Ce dossier `docs/methode/` décrit **comment on travaille** sur le site du club. Ce que contient le site (structure, SEO, images) est dans `CLAUDE.md` et les autres fichiers de `docs/`. Méthode reprise d'Agir Luxembourg le 2026-11-12, adaptée au club.
> `docs/` n'est jamais publié sur armwrestlingclubstrassen.com (`_config.yml` l'exclut), mais il part sur GitHub avec le reste du dépôt.

---

## 1. Le principe qui prime sur tout

**Mesurer plutôt que déduire.** On dit « c'est fait » quand on a lu le résultat sur le vrai système : le site en ligne, la vraie base Firestore. Pas parce que le fichier est écrit, ni parce que le commit existe. Sinon, on dit « écrit, pas encore vérifié ».

Ce que ce site a déjà coûté :

- La vitrine Open Vendetta était vide. Ce n'était pas l'affichage : la base n'avait **aucun** profil `publie` (27 en attente, 0 publié). On l'a su en lisant la base, pas en relisant le code.
- `ov/share.jpg` existait sur le disque mais pas dans le dépôt : le `.gitignore` ignore `*.JPG`, donc aussi `.jpg` sous Windows. Il a fallu `git add -f`.
- Juste après un déploiement, un navigateur peut garder l'ancien script en cache quelques minutes. On recharge avant de conclure.

**Corollaire : vérifier l'identité, pas la quantité.** Compter 3 liens entrants ne prouve rien si les 3 sont dans la même page. On lit les noms.

---

## 2. Les garde-fous

Tout test nouveau est **éprouvé par mutation** : on casse volontairement ce qu'il surveille, on vérifie qu'il passe au rouge, puis on restaure **depuis une copie**, jamais par annulation de version.

Exemple réel (Open Vendetta, 2026-11-11) : règles Firestore modifiées pour rendre les contacts lisibles par tous, 3 tests ont échoué ; après restauration depuis la copie, 12 tests OK.

Un garde-fou qu'on n'a jamais vu échouer ne prouve rien.

---

## 3. Ce qu'on ne fait jamais

- **Aucune amélioration non demandée.** Le périmètre demandé est le livrable.
- **Aucun code tant que Nils n'a pas demandé d'en produire.** Une question appelle une réponse, pas une implémentation.
- **Aucun nettoyage ni suppression sans « ok » explicite.** Avant d'écraser un fichier : copie dans `.claude/sauvegardes/<date>/`. Jamais dans un dossier `sauvegardes/` à la racine : il serait publié en ligne.
- **Aucun `git push` sans demande de Nils.** Sur ce site, un push = une mise en ligne : GitHub Pages publie la branche `main`.
- **Aucun numéro de téléphone** sur le site : il est public.
- **Aucun secret** (mot de passe, jeton privé) dans un fichier du dépôt : il part sur GitHub. La configuration Firebase de `ov-config.js` est publique par nature, ce n'est pas un secret.
- **Aucune page « corrigée » parmi celles listées « volontaires »** dans `CLAUDE.md` (`noindex` des outils, `<h4>` de certains articles, redirection mobile).
- **Nommer un système par son nom affiché**, jamais par un fragment d'adresse.

---

## 4. Les compétences passent avant l'action

S'il y a 1 % de chance qu'une compétence s'applique, on l'invoque. « C'est juste une petite modification », « je regarde d'abord le code » : ce sont des signaux qu'on se justifie. On s'arrête et on invoque.

Les compétences de **processus** (cadrage, débogage) passent avant les compétences **techniques**. Liste et remplaçants : `04_COMPETENCES.md`.

---

## 5. Renvois

- Les étapes de toute création : `01_ETAPES.md`
- Comment parler à Nils : `02_PARLER-A-NILS.md`
- Regarder le site en local et en ligne : `03_REGARDER-LE-SITE.md`
- Quelle compétence, quand : `04_COMPETENCES.md`
- Ajouter une page, du début à la fin : `05_AJOUTER-UNE-PAGE.md`
- Où on en est : `../ETAT.md`
