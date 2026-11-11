# Open Vendetta — mode d'emploi technique

Vitrine d'athlètes ouverts à un match de bras de fer. Un visiteur choisit un profil et propose un match ; l'organisateur fixe ensuite le lieu et la date. Les données sont dans Firebase (Firestore + connexion Google), le site reste 100 % statique.

- Vitrine : https://armwrestlingclubstrassen.com/open-vendetta.html (indexée, dans `sitemap.xml`)
- Inscription : `open-vendetta-ajouter.html` (`noindex, follow`, hors sitemap)
- Gestion : `open-vendetta-gestion.html` (`noindex, nofollow`, hors sitemap, compte Google de l'organisateur seulement)
- Décisions : [superpowers/specs/2026-11-11-open-vendetta-design.md](superpowers/specs/2026-11-11-open-vendetta-design.md) · plan : [superpowers/plans/2026-11-11-open-vendetta.md](superpowers/plans/2026-11-11-open-vendetta.md)

## Où sont les fichiers

| Emplacement | Contenu |
|---|---|
| `open-vendetta*.html` (ce dépôt) | Les 3 pages, reprises de la maquette validée `m3-ferrari`. |
| `ov/js/` | `ov-config.js` (configuration publique, version du SDK, sujet ntfy), `ov-firebase.js` (tout l'accès Firestore et Google), `ov-data.js` (logique pure), `ov-vue.js` (rangée d'athlète échappée), `ov-image.js` (réduction des photos), `ov-notify.js` (alertes), `ov-forms.js` (vérification des champs), `ov-vitrine.js` (script de la vitrine). |
| `ov/assets/` | Kit CSS/JS de la compétence taste (licence MIT : `ov/assets/LICENSE-taste-skill.txt`) et photos du club. |
| `C:\Users\NILS\armwrestlingclubstrassen\open-vendetta\` (hors dépôt, jamais publié, Git local) | `firestore.rules` (**seule copie de référence**), `tests/` (`data.test.mjs`, `rules.test.mjs`, `prod-check.mjs`), `ETAT.md`. |

## Données (Firestore, projet `open-vendetta`, région `eur3`)

| Collection | Champs | Qui lit |
|---|---|---|
| `villes/{id}` | `nom`, `ordre` | tout le monde |
| `clubs/{id}` | `nom` | tout le monde |
| `profils/{id}` | `prenom`, `nom`, `clubId`, `clubSaisi`, `villeId` ou `villeSaisie`, `poids`, `taille`, `biceps`, `age`, `pratique`, `bras` (`Droit`, `Gauche`, `Les deux`), `palmares`, `instagram`, `mini` (vignette), `statut` (`en_attente`, `publie`, `cache`), `source`, `creeLe` | tout le monde si `publie` ; sinon l'organisateur |
| `photos/{profilId}` | `image` (photo de la fiche, data URL ≤ 300 000 caractères) | comme le profil |
| `contacts/{profilId}` | `email`, `telephone`, `accordParent`, `publicOk`, `usageOk`, `creeLe` | **l'organisateur seulement** |
| `candidatures/{id}` | `profilId`, infos sportives, `email`, `telephone`, `instagram`, `message`, `accord`, `accordParent`, `etat` (`nouvelle`, `en_discussion`, `match_organise`, `sans_suite`), `creeLe` | **l'organisateur seulement** |

Un visiteur crée un profil, son contact et sa photo **dans un seul envoi**, toujours `en_attente`. De 14 à 17 ans, l'accord d'un parent est obligatoire, pour un profil comme pour une proposition de match. « Valider » en gestion exige photo, club, ville, bras, accord de publication et, pour un mineur, accord d'un parent.

## Changer une règle de sécurité

Dans `C:\Users\NILS\armwrestlingclubstrassen\open-vendetta\` :

1. Modifier `firestore.rules`, et ajouter un test dans `tests/rules.test.mjs`.
2. `npm run test:rules` → `fail 0` (émulateur local, Java requis).
3. `npx firebase deploy --only firestore:rules` (compte de l'organisateur ; si la CLI n'est plus connectée : `npx firebase login --no-localhost`).
4. `node tests/prod-check.mjs open-vendetta` → 5 lignes `OK` sur le vrai projet.
5. Commit dans le Git local du dossier.

## Alertes sur le téléphone (ntfy)

Chaque nouveau profil et chaque proposition envoie une alerte au sujet ntfy écrit dans `ov/js/ov-config.js` (`NTFY_SUJET`). L'appli ntfy (serveur `ntfy.sh`) doit être abonnée à ce sujet. Le sujet est visible dans le code public : les messages ne contiennent **jamais** de nom ni de contact (« Nouveau profil à valider », « Nouvelle demande de match »), et un clic ouvre la gestion. Pour relire les alertes des 12 dernières heures : `curl -s "https://ntfy.sh/<sujet>/json?poll=1&since=12h"`.

## Ce qui est volontaire — ne pas « corriger »

- `noindex` sur l'inscription et la gestion ; la gestion est hors sitemap.
- Aucune photo d'exemple publiée : les portraits de la maquette (Wikimedia) sont restés hors du site.
- La configuration Firebase de `ov-config.js` est publique par nature : la sécurité tient dans les règles.
- `ov/share.jpg` a été ajouté avec `git add -f` : le `.gitignore` du site ignore `*.JPG`, ce qui attrape aussi `.jpg` sous Windows.
- Le SDK Firebase est épinglé (`FIREBASE_SDK`, 13.1.0) : pour le changer, prendre une version stable publiée depuis plus de 14 jours (`npm view firebase time --json`).
- Les athlètes de la feuille Vendetta du 7 novembre s'importent une seule fois (gestion > « Villes et clubs ») et restent en attente, sans photo : leur accord ne couvrait pas une vitrine publique. Un profil importé ne passe en public que si la personne a dit oui et a donné une photo.
