# Environnement de travail du site du club — fiche de décision

> 2026-11-12 · validée par Nils (« Ok, vas-y ») · session lancée depuis le dossier Agir Luxembourg.

## Le problème

Nils trouve la session du site du club « stupide » comparée à celle d'Agir. Mesuré le 2026-11-12, la différence ne vient pas du modèle mais de l'environnement :

| | Agir Luxembourg | Site du club |
|---|---|---|
| Style de réponse ELI5 | activé | absent : la session parle en jargon |
| Méthode écrite | `methode/` (7 fiches) | aucune |
| `CLAUDE.md` | table « quand… lire d'abord… puis » | notice technique |
| Mémoire | ~50 notes, dont les préférences de Nils | 1 note |
| Compétences `ui-ux-pro-max` | installées pour ce dossier seulement | absentes |
| État + passation | `ETAT-AVANCEMENT.md` | seulement `open-vendetta/ETAT.md` |

Deux erreurs dans le `CLAUDE.md` du site égarent la session : il renvoie à la CLI `gh` (absente du PC), et il affirme que `_config.yml` exclut « les .md du site publié » (il n'exclut que `CLAUDE.md` et `docs/`).

## Décisions de Nils (questions à choix du 2026-11-12)

1. Préférences personnelles : **pour tous ses dossiers** (pas seulement le club).
2. Fiches de méthode du club : **`docs/methode/`** du site (sauvegardées sur GitHub, jamais publiées : `docs/` est exclu par `_config.yml`).
3. Compétences `ui-ux-pro-max` : **pour tous ses dossiers** (portée utilisateur).
4. Les 2 erreurs du `CLAUDE.md` du site : **corrigées**, après copie de l'ancien fichier.

## Ce qui est fabriqué

### Niveau utilisateur (`C:\Users\NILS\.claude\`)

- `CLAUDE.md` : qui est Nils, ses préférences (questions à choix en série, liens cliquables, jamais de coûts, `no-ai-slop` par défaut, artifacts `planche-claire`, vidéos sans effet caméra), les faits du PC (`py -3`, pas de `gh`, 8 Go de mémoire, GateGuard), la carte des projets. Règle : le `CLAUDE.md` d'un dossier gagne en cas de conflit.
- `output-styles/ELI5.md` : le style, disponible partout, **activé seulement par les dossiers qui le demandent** (Agir, club). L'usine vidéos (`D:\videos-club\moteur`) n'est pas touchée.
- Plugin `ui-ux-pro-max@ui-ux-pro-max-skill` installé en portée utilisateur. Agir : mise à jour de `methode/04_COMPETENCES.md` (piège du `c:` minuscule) et de la note de mémoire `ui-ux-pro-max-installed`.

### Dossier du site du club

- `CLAUDE.md` : table de renvois en tête, sections « Reprendre et passer la main » et « Règles qui ne bougent pas », contenu technique gardé, 2 erreurs corrigées. Copie de l'ancien dans `.claude/sauvegardes/2026-11-12/`.
- `docs/methode/` : `00_PRINCIPES.md`, `01_ETAPES.md`, `02_PARLER-A-NILS.md`, `03_REGARDER-LE-SITE.md` (outil testé sur ce PC avant d'être écrit), `04_COMPETENCES.md`, `05_AJOUTER-UNE-PAGE.md`.
- `docs/ETAT.md` : état du site, ce qui attend une décision, journal, rituel « passation » ; renvoie à `open-vendetta/ETAT.md`.
- `.claude/settings.json` : `"outputStyle": "ELI5"` ajouté, le reste inchangé.

Les sauvegardes du site vont dans `.claude/sauvegardes/<date>/` : dossier ignoré par Git et non publié (Jekyll ignore les dossiers qui commencent par un point). Un dossier `sauvegardes/` à la racine serait publié en ligne.

## Ce qui n'est pas fait

- **Aucun `git push`.** Au début de la session, le dépôt avait des commits Open Vendetta non poussés dont les règles Firestore devaient être déployées avant. À 10 h 40, l'autre session a déployé les règles puis poussé (`d0f8ef7`). Reste la règle générale : on ne pousse que sur demande de Nils, et d'autres sessions travaillent dans le dépôt (accueil en cours : `index.html`, `style.css`). Les fichiers de cette fiche sont commités en local, à part, sans toucher aux fichiers des autres sessions. Ils partiront avec le prochain push ; ils ne changent rien au site en ligne (`CLAUDE.md` et `docs/` sont exclus de la publication).
- Rien dans le code du site, dans `open-vendetta/`, ni dans l'usine vidéos.
- La session en cours sur le site ne voit pas ces changements : il faut en ouvrir une nouvelle.

## Preuve de fin

Une session de test (`claude -p`) lancée depuis le dossier du site, chemin écrit avec `C:` majuscule :

1. répond dans le style ELI5 ;
2. liste les compétences `ui-ux-pro-max:*` ;
3. cite la table de renvois du `CLAUDE.md` et le chemin `docs/methode/05_AJOUTER-UNE-PAGE.md` pour « ajouter une page » ;
4. connaît une préférence du `CLAUDE.md` personnel (ex. `py -3`).

Et une session de test lancée depuis un dossier neutre ne passe **pas** en ELI5 (le style n'est pas activé partout).
