# Environnement de travail du site du club — plan

> **Pour la session qui exécute :** suivre les tâches dans l'ordre, cocher au fur et à mesure. Exécution en ligne dans la session (pas d'agents : PC à 8 Go de mémoire).

**But :** donner au dossier du site du club la même méthode, les mêmes compétences et les mêmes préférences qu'Agir Luxembourg.

**Fiche de décision :** `docs/superpowers/specs/2026-11-12-environnement-de-travail-design.md`.

**Outils :** fichiers Markdown et JSON, `claude.exe` (`C:\Users\NILS\.local\bin\claude.exe`) pour l'installation du plugin et les sessions de test.

---

### Tâche 0 — Sauvegardes

- [ ] Copier `CLAUDE.md` et `.claude/settings.json` du site dans `.claude/sauvegardes/2026-11-12/`.
- [ ] Copier `agir Luxembourg/methode/04_COMPETENCES.md` et la note de mémoire `ui-ux-pro-max-installed.md` dans `agir Luxembourg/sauvegardes/2026-11-12/environnement-club/`.
- **Preuve :** les 4 copies existent, même taille que l'original.

### Tâche 1 — Style ELI5 au niveau utilisateur

- [ ] Créer `C:\Users\NILS\.claude\output-styles\ELI5.md` : copie de `agir Luxembourg/.claude/output-styles/ELI5.md`, dernière section rendue générale (« la méthode du dossier, si le dossier en a une »).
- **Preuve :** même en-tête `name: ELI5` ; aucun mot propre à Agir dans le fichier.

### Tâche 2 — `CLAUDE.md` personnel

- [ ] Créer `C:\Users\NILS\.claude\CLAUDE.md` : qui est Nils ; préférences (questions à choix en série, liens cliquables, jamais de coûts, `no-ai-slop`, `planche-claire`, vidéos sans effet caméra) ; faits du PC ; carte des projets ; priorité au `CLAUDE.md` du dossier.
- **Preuve :** tâche 9, test B.

### Tâche 3 — `ui-ux-pro-max` en portée utilisateur

- [ ] `claude plugin install ui-ux-pro-max@ui-ux-pro-max-skill --scope user`.
- **Preuve :** `installed_plugins.json` contient une entrée `"scope": "user"` pour ce plugin ; tâche 9, tests A et B.

### Tâche 4 — Réglage du dossier du site

- [ ] Ajouter `"outputStyle": "ELI5"` à `.claude/settings.json` du site, sans retirer `brag@brag`.
- **Preuve :** JSON valide (`node -e "JSON.parse(...)"`).

### Tâche 5 — `docs/methode/` (6 fiches)

- [ ] `00_PRINCIPES.md`, `01_ETAPES.md`, `02_PARLER-A-NILS.md`, `03_REGARDER-LE-SITE.md`, `04_COMPETENCES.md`, `05_AJOUTER-UNE-PAGE.md`.
- [ ] Pour `03` : tester d'abord sur ce PC le serveur local (`py -3 -m http.server 8766 --bind 127.0.0.1`) et l'outil qui ouvre une page et la mesure à 1440 et 390 ; n'écrire que ce qui a marché.
- **Preuve :** chaque commande citée dans `03` a été lancée pendant cette session et son résultat noté.

### Tâche 6 — `docs/ETAT.md`

- [ ] Résumé du site, chantiers ouverts (Open Vendetta → `open-vendetta/ETAT.md`), ce qui attend Nils, journal, rituel « passation ».
- **Preuve :** chaque fait cité est lu dans un fichier ou dans Git le 2026-11-12.

### Tâche 7 — `CLAUDE.md` du site

- [ ] Table « Quand… lire d'abord… puis » en tête ; sections « Reprendre et passer la main » et « Règles qui ne bougent pas » ; contenu technique gardé.
- [ ] Corriger : l'arbre (`_config.yml` exclut `CLAUDE.md` et `docs/`, pas tous les `.md`) ; la section « Agent skills » (`gh` absent du PC).
- **Preuve :** diff contre la copie de la tâche 0 : seules ces parties changent.

### Tâche 8 — Agir à jour

- [ ] `methode/04_COMPETENCES.md` : ligne datée, plugin désormais en portée utilisateur.
- [ ] Mémoire : note `ui-ux-pro-max-installed` mise à jour ; note `autres-projets-dossiers` : le site du club a sa méthode ; `MEMORY.md` : une ligne vers le `CLAUDE.md` personnel.

### Tâche 9 — Mesurer avec des sessions de test

- [ ] Test A, depuis `C:\Users\NILS\armwrestlingclubstrassen\armwrestling-club-strassen` (C majuscule) : `claude -p` demande le style actif, les compétences `ui-ux-pro-max`, le fichier à lire pour ajouter une page, la commande Python. Attendu : ELI5, compétences listées, `docs/methode/05_AJOUTER-UNE-PAGE.md`, `py -3`.
- [ ] Test B, depuis un dossier neutre (dossier temporaire de la session) : mêmes questions. Attendu : style par défaut (pas ELI5), compétences `ui-ux-pro-max` listées, `py -3` connu.

### Tâche 10 — Commit local, sans push

- [ ] `git add` des seuls fichiers de ce plan (`CLAUDE.md`, `docs/methode/`, `docs/ETAT.md`, la fiche et ce plan), puis `git commit`.
- [ ] **Aucun `git push`** : commits Open Vendetta non poussés, règles Firestore à déployer d'abord.
- **Preuve :** `git show --stat HEAD` ne liste que ces fichiers ; `git status` montre toujours les fichiers de l'autre session intacts.
