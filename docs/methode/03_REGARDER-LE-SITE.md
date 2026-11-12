# 03 : Regarder le site, en local et en ligne

> À lire avant de mesurer, capturer ou vérifier une page. **Tout ce qui suit a été lancé et mesuré sur ce PC le 2026-11-12.** Une commande ajoutée ici plus tard doit l'être aussi, avec sa date.

Modifier une page sans la voir, c'est deviner. Une capture montre le rendu ; une mesure dit pourquoi. On fait les deux.

## 1. Voir le site en local, avant de pousser

Servir le dossier du site :

```powershell
py -3 -m http.server 8766 --bind 127.0.0.1 --directory "C:\Users\NILS\armwrestlingclubstrassen\armwrestling-club-strassen"
```

Puis ouvrir `http://127.0.0.1:8766/<page>.html`. Mesuré : `open-vendetta.html` répond `200`. Firebase accepte `localhost` comme domaine autorisé : les pages Open Vendetta fonctionnent en local sur la vraie base.

Le port `8766` peut déjà être pris par une autre session. Vérifier avant :

```powershell
Get-NetTCPConnection -State Listen -LocalPort 8766 -ErrorAction SilentlyContinue
```

## 2. La fenêtre Chrome du club

Une fenêtre Chrome à part, avec **son port de pilotage (9340) et son propre profil** :

```powershell
Start-Process "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe" -ArgumentList "--remote-debugging-port=9340","--user-data-dir=`"C:\Users\NILS\.cache\club-navigateurs\site`"","--no-first-run","--no-default-browser-check","https://armwrestlingclubstrassen.com/"
```

Le profil vit dans `C:\Users\NILS\.cache\club-navigateurs\site` : une connexion faite à la main (page de gestion Open Vendetta, compte Google) y reste d'une fois sur l'autre.

**Les ports déjà pris sur ce PC, à ne pas toucher :** `9337` = la fenêtre Chrome du robot vidéos du club ; `9333` à `9336` = Agir Luxembourg.

## 3. L'outil qui pilote la fenêtre : `nav.mjs`

L'outil maison d'Agir marche tel quel sur le site du club. On l'appelle par son chemin complet, avec `--port 9340` :

```powershell
$nav = "C:\Users\NILS\armwrestlingclubstrassen\agir Luxembourg\outils\nav.mjs"
node $nav ou --port 9340                                   # titre + adresse de l'onglet
node $nav va "http://127.0.0.1:8766/open-vendetta.html" --port 9340
node $nav eval "<javascript>" --port 9340 --large 1440     # grand écran
node $nav eval "<javascript>" --port 9340 --large 390      # téléphone (identité iPhone)
node $nav capture "<chemin\fichier.png>" --port 9340 --large 390
```

Autres verbes : `mesure <sélecteur>`, `clic <sélecteur>`, `clicxy <x> <y>`, `molette`, `console`, `devant`, `onglets`. Détail : `C:\Users\NILS\armwrestlingclubstrassen\agir Luxembourg\methode\03_NAVIGATEUR-PILOTE.md`.

La mesure de base, à faire en 1440 **et** en 390 :

```powershell
node $nav eval "JSON.stringify({titre: document.title, adresse: location.href, h1: document.querySelectorAll('h1').length, largeurPage: document.documentElement.scrollWidth, largeurFenetre: innerWidth, deborde: document.documentElement.scrollWidth > innerWidth})" --port 9340 --large 390
```

Résultats du 2026-11-12 :

| Page | Vue | Adresse lue | `h1` | Déborde |
|---|---|---|---|---|
| accueil en ligne | fenêtre normale | `/` | 1 | non |
| accueil en ligne | 390 | **`/m/`** | 1 | non |
| `open-vendetta.html` en local | 1440 | idem | 1 | non |
| `open-vendetta.html` en local | 390 | idem | 1 | non |

## 4. Les pièges, tous vus le 2026-11-12

1. **En vue téléphone, l'accueil part vers `/m/`.** C'est la redirection mobile voulue (ligne 5 d'`index.html`, voir `docs/SEO.md`). Pour juger l'accueil sur téléphone, on mesure donc `/m/index.html`, le carrousel.
2. **Sans `--large`, la fenêtre fait environ 1250 px, pas 1440.** Toujours écrire `--large 1440` pour le grand écran.
3. **Juste après un push, on voit encore l'ancienne page.** Recharger un peu plus tard. Les scripts d'Open Vendetta sont versionnés (`?v=2`) pour éviter de mélanger ancien et nouveau code.
4. **Le greffon navigateur de la session (Playwright, plugin ecc) n'a pas démarré** le 2026-11-12 (délai de 30 s dépassé). `nav.mjs` ne dépend pas de lui.

## 5. Les consoles connectées (Firebase, Google)

Pour une console où Nils est connecté avec son compte (console Firebase, Search Console), l'extension **Claude in Chrome** a servi le 2026-11-11 (compétence `anthropic-skills:chrome-browser`). Elle agit dans le vrai Chrome de Nils.

## 6. Fermer ce qu'on a ouvert

Le PC n'a que 8 Go de mémoire. En fin de mesure, fermer **seulement** la fenêtre du club et le serveur local qu'on a lancés :

```powershell
Get-CimInstance Win32_Process | Where-Object { ($_.Name -eq 'chrome.exe' -and $_.CommandLine -like '*club-navigateurs*') -or ($_.Name -match '^(py|python)\.exe$' -and $_.CommandLine -like '*http.server*8766*') } | ForEach-Object { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue }
```

Mesuré le 2026-11-12 : 11 processus fermés, la fenêtre du robot vidéos (port 9337) toujours ouverte.

## 7. La règle de conduite

- **Lire d'abord.** Une mesure n'écrit rien.
- **N'écrire que des données d'essai identifiées** (ex. un profil « Test ») et les retirer aussitôt, en vérifiant leur nom avant d'effacer.
- **Ne jamais contourner une connexion.** Nils se connecte lui-même, une fois, dans la fenêtre.
- **Dire à Nils ce qu'on a laissé derrière soi.**
- **Obscura** (le navigateur sans fenêtre choisi le 2026-10-23) n'a pas encore été testé sur le site du club. On ne l'utilise pas ici avant un test réussi.
