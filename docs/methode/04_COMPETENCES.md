# 04 : Les compétences (skills) : lesquelles, quand, et ce qui est installé

> Une compétence est un mode d'emploi que la session charge à la demande. La règle : s'il y a 1 % de chance qu'une compétence s'applique, on l'invoque. Processus avant technique.

## Quand invoquer quoi

| Moment | Compétence | Si elle n'apparaît pas dans la liste de la session |
|---|---|---|
| Début de toute conversation | `superpowers:using-superpowers` | lire `00_PRINCIPES.md`, chercher une compétence avant d'agir |
| Avant toute création ou modification | `superpowers:brainstorming` | appliquer à la main l'étape A de `01_ETAPES.md` |
| Un bug, un test qui échoue, un comportement inattendu | `superpowers:systematic-debugging`, avant tout correctif | `mattpocock-skills:diagnosing-bugs` |
| Avant d'écrire du code (scripts `ov/`, règles Firestore) | `superpowers:test-driven-development` | `mattpocock-skills:tdd` |
| Travail en plusieurs étapes | `superpowers:writing-plans`, puis `superpowers:subagent-driven-development` ou `superpowers:executing-plans` | plan dans un fichier, cases à cocher, preuve de fin par tâche |
| Maquette d'une page ou d'une section | `ui-ux-pro-max:ui-ux-pro-max`, puis `design-taste-frontend` | `artifact-design` |
| Relire une page (UX, accessibilité) | `web-design-guidelines` | `ecc:accessibility` |
| SEO d'une page | `ecc:seo` ou `marketing-skills:seo-audit` ; données structurées : `marketing-skills:schema` | `docs/SEO.md` et `docs/CONTENU.md` |
| Écrire le texte d'une page | `no-ai-slop` (toujours), `marketing-skills:copywriting` | lire `C:\Users\NILS\.claude\skills\no-ai-slop\SKILL.md` |
| Rapport, comparaison, mode d'emploi en artifact | `planche-claire`, puis `artifact-design` | `artifact-design` seul |
| Graphique, tableau de chiffres | `dataviz` | disponible |
| Posts Google Business | `google-business-posts` (compétence propre à ce dossier) | suivre `docs/GOOGLE-BUSINESS.md` |
| Console où Nils est connecté (Firebase, Google) | `anthropic-skills:chrome-browser` | demander à Nils de faire le geste |
| Travail terminé | `superpowers:verification-before-completion`, puis `superpowers:requesting-code-review` | relire en ligne (`00_PRINCIPES.md` §1), puis `code-review` |
| Réglages de Claude Code (permissions, style, crochets) | `update-config` | disponible |

## Ce qui est installé (mesuré le 2026-11-12)

Mesuré dans `C:\Users\NILS\.claude\plugins\installed_plugins.json`, `C:\Users\NILS\.claude\settings.json` et `C:\Users\NILS\.claude\skills\`.

- **superpowers** v5.1.0 : installé pour tous les dossiers et pour ce dossier.
- **ui-ux-pro-max** v2.15.0 : installé **pour tous les dossiers** depuis le 2026-11-12. Il ne dépend plus de la façon d'écrire le chemin (`c:` ou `C:`). 7 compétences : `ui-ux-pro-max:ui-ux-pro-max` (la principale), `design`, `design-system`, `brand`, `banner-design`, `slides`, `ui-styling`. ⚠️ Ses commandes d'exemple appellent `python` : sur ce PC, taper `py -3` à la place.
- **ecc** : environ 150 compétences `ecc:*`. Il apporte le crochet **GateGuard**, qui bloque la première écriture de chaque fichier et la première commande Bash. Normal : présenter les faits demandés, relancer.
- **mattpocock-skills**, **marketing-skills**, **gsap-skills**, **openseo** : actifs pour tous les dossiers.
- **brag** (montage vidéo) : activé pour ce dossier seulement (`.claude/settings.json`).
- Dans `C:\Users\NILS\.claude\skills\` : `design-taste-frontend`, `web-design-guidelines`, `image-to-code`, `no-ai-slop`, `planche-claire`, `instagram-carousel`, `viral-hook-creator`.
  - `image-to-code` veut générer une image avant le code. Aucun générateur d'images n'est branché sur ce PC ; le 2026-11-11, Nils a choisi « sans image ».
  - Les scripts de vérification de `design-taste-frontend` trouvent le navigateur avec `CHROME_PATH="$LOCALAPPDATA/ms-playwright/chromium-1243/chrome-win64/chrome.exe"` (le Chromium de Playwright).
- Dans ce dossier, `.claude/skills/google-business-posts/` : 13 posts Google Business, un par semaine.

Si une compétence de ce tableau manque au début d'une session : taper `/plugin`, vérifier qu'elle est active, redémarrer Claude Code. En attendant, utiliser la colonne de droite.
