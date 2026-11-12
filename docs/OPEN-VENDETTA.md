# Open Vendetta — mode d'emploi technique

Vitrine d'athlètes ouverts à un match de bras de fer. Un visiteur choisit un profil et propose un match ; l'organisateur fixe ensuite le lieu et la date. Les données sont dans Firebase (Firestore + connexion Google), le site reste 100 % statique.

- Vitrine : https://armwrestlingclubstrassen.com/open-vendetta.html (indexée, dans `sitemap.xml`)
- Inscription : formulaire en bas de la vitrine (`open-vendetta.html#inscription`, script `ov/js/ov-inscription.js`, recadrage de la photo `ov/js/ov-crop.js`). L'ancienne adresse `open-vendetta-ajouter.html` renvoie vers ce formulaire (`noindex`, hors sitemap).
- Gestion : `open-vendetta-gestion.html` (`noindex, nofollow`, hors sitemap, compte Google de l'organisateur seulement)
- Décisions : [superpowers/specs/2026-11-11-open-vendetta-design.md](superpowers/specs/2026-11-11-open-vendetta-design.md) · plan : [superpowers/plans/2026-11-11-open-vendetta.md](superpowers/plans/2026-11-11-open-vendetta.md)

## Refonte du 2026-11-12 (après l'audit, 8 choix de Nils)

Fiche de décision : [superpowers/specs/2026-11-12-refonte-accueil-open-vendetta-design.md](superpowers/specs/2026-11-12-refonte-accueil-open-vendetta-design.md). Tout est dans `open-vendetta.html` (styles en fin de bloc `<style>`) et dans trois scripts.

- **Accroche courte** : le nom, une phrase, la photo de match retouchée. Les profils arrivent dès le premier écran.
- **3 étapes** sous l'accroche (`#etapes`) : ajouter son profil, choisir un adversaire, le club organise.
- **Photos des athlètes** : la page applique le même traitement à toutes (noir et blanc, voile rouge, cadre 4 pour 5 rempli). C'est du CSS : les photos gardées dans la base ne changent pas.
- **Grand écran (901 px et plus)** : les profils sont des cartes-portraits, 4 par ligne, 4 visibles par ville. Une carte ouverte reprend toute la largeur et redevient une rangée, avec sa fiche dessous. La carte montre la vignette, puis la grande photo quand elle arrive à l'écran : une lecture de `photos/{id}` par carte visible, partagée avec la fiche (`photoDe` dans `ov-vitrine.js`). Sur téléphone : les rangées, 3 par ville, comme avant.
- **Formulaire d'inscription** : une étape à la fois (`data-etape` sur les 3 `fieldset`, barre `data-insc-prog`, boutons « Retour » et « Continuer »). Chaque étape est contrôlée quand on la quitte, et les trois sont recontrôlées avant l'envoi. Une étape cachée garde ses réponses. Les données envoyées ne changent pas.
- **Menu et pied de page** : un seul bouton « Ajouter mon profil » ; le bouton du menu fait 44 px sur téléphone.
- **Ligne « Ouvert depuis le 11 novembre 2026 »** sous le compteur : à remplacer par les matchs annoncés quand il y en aura.
- **Chargement** : des rangées grises (`data-roster-attente`) tiennent la place des profils ; si la base ne répond pas, un bouton « Réessayer » recharge la page.
- Versions : `ov-vitrine.js?v=8`, `ov-vue.js?v=5`, `ov-inscription.js?v=4`.

## Où sont les fichiers

| Emplacement | Contenu |
|---|---|
| `open-vendetta*.html` (ce dépôt) | Les 3 pages. La vitrine (`open-vendetta.html`) reprend la maquette `m6-style-du-site` (feuille `style.css` du club, polices Barlow), **sans** le panneau de chiffres de l'accroche ; l'inscription et la gestion restent sur la maquette `m3-ferrari` (kit taste de `ov/assets/`). |
| `ov/js/` | `ov-config.js` (configuration publique, version du SDK, sujet ntfy), `ov-firebase.js` (module public : Firestore Lite, sans connexion, pour la vitrine et l'inscription), `ov-admin.js` (module de gestion : Firestore complet + connexion Google ; une page ne charge jamais les deux), `ov-data.js` (logique pure), `ov-vue.js` (rangée d'athlète échappée), `ov-image.js` (réduction des photos), `ov-notify.js` (alertes), `ov-forms.js` (vérification des champs), `ov-vitrine.js` (script de la vitrine). |
| `ov/assets/` | Kit CSS/JS de la compétence taste (licence MIT : `ov/assets/LICENSE-taste-skill.txt`), utilisé par l'inscription et la gestion, et photos du club (utilisées aussi par la vitrine). |
| `C:\Users\NILS\armwrestlingclubstrassen\open-vendetta\` (hors dépôt, jamais publié, Git local) | `firestore.rules` (**seule copie de référence**), `tests/` (`data.test.mjs`, `rules.test.mjs`, `prod-check.mjs`), `ETAT.md`. |

## Données (Firestore, projet `open-vendetta`, région `eur3`)

| Collection | Champs | Qui lit |
|---|---|---|
| `villes/{id}` | `nom`, `ordre` | tout le monde |
| `clubs/{id}` | `nom` | tout le monde |
| `profils/{id}` | `prenom`, `nom`, `clubId`, `clubSaisi`, `villeId` ou `villeSaisie`, `poids`, `taille`, `biceps` (cm, 20 à 70 ; voir **Mesures de bras**), `bicepsDroit`, `bicepsGauche` (cm, 20 à 70, facultatifs), `avantBrasDroit`, `avantBrasGauche` (cm, 15 à 60, facultatifs), `age`, `pratique`, `naissance` (`AAAA-MM-JJ`, facultatif), `pratiqueDepuis` (`AAAA-MM-JJ`, facultatif), `bras` (`Droit`, `Gauche`, `Les deux`), `palmares`, `instagram`, `mini` (vignette), `statut` (`en_attente`, `publie`, `cache`), `source`, `creeLe` | tout le monde si `publie` ; sinon l'organisateur |
| `photos/{profilId}` | `image` (photo de la fiche, data URL ≤ 300 000 caractères) | comme le profil |
| `contacts/{profilId}` | `email`, `telephone`, `accordParent`, `publicOk`, `usageOk`, `creeLe` | **l'organisateur seulement** |
| `candidatures/{id}` | `profilId` (athlète visé), `adversaireId` (profil de celui qui propose), `message` (facultatif, 1 000 caractères), `accord` (`true`), `accordParent` (facultatif), `etat` (`nouvelle`, `en_discussion`, `match_organise`, `sans_suite`), `creeLe`. Ancienne forme, encore acceptée : `profilId` + infos sportives tapées, `email`, `telephone`, `instagram` au lieu d'`adversaireId` | **l'organisateur seulement** |

Un visiteur crée un profil, son contact et sa photo **dans un seul envoi**, toujours `en_attente`. De 14 à 17 ans, l'accord d'un parent est obligatoire, pour un profil comme pour une proposition de match. « Valider » en gestion exige photo, club, ville, bras, accord de publication et, pour un mineur, accord d'un parent.

**Mesures de bras.** Depuis novembre 2026, l'inscription demande d'abord le bras, puis le tour de biceps contracté et le tour d'avant-bras de ce bras, ou des deux pour « Les deux » ; les champs de l'autre bras restent cachés et ne partent pas. Le profil porte seulement les mesures du ou des bras choisis (`bicepsDroit`, `avantBrasDroit`, `bicepsGauche`, `avantBrasGauche`). `biceps` reste écrit pour la compatibilité (règles, anciens profils, import de la feuille) : le biceps du bras choisi, le plus grand des deux pour « Les deux ». La fiche de la vitrine montre « Biceps : droit 42 cm · gauche 40 cm », « Avant-bras : … » quand le profil les a, sinon l'ancien « Tour de bras » (`biceps`) ; une mesure inconnue n'apparaît pas. En gestion, « Corriger / Modifier » montre les mesures du bras choisi (elles suivent le menu « Bras ») ; changer de bras retire les mesures de l'autre et recalcule `biceps`. Le champ « Tour de bras, ancienne mesure » n'apparaît que pour un profil sans biceps par bras ; un biceps par bras rempli le remplace.

**Proposer un match.** Il faut avoir son propre profil publié ; sinon, le formulaire renvoie vers l'inscription (`#inscription`). Le visiteur tape son nom dans un seul champ (prénom et nom, dans un ordre ou l'autre), la page cherche parmi les profils publiés déjà chargés (accents et majuscules ignorés, l'athlète visé exclu), les profils trouvés s'affichent sous le champ et il touche le sien. Rien d'autre à retaper : la proposition ne porte que les deux profils, le message et les accords ; la gestion lit le contact du proposeur dans `contacts/{adversaireId}`. Le navigateur retient le profil choisi (`localStorage`, clé `ov-mon-profil`, rien d'autre) et le présélectionne la fois suivante ; la croix à côté du profil (« Ce n'est pas vous ? Changer de profil ») l'oublie. Aucune connexion ni mot de passe : n'importe qui peut choisir n'importe quelle fiche publiée, c'est l'organisateur qui confirme en écrivant au contact de la fiche. Une fiche tout juste inscrite est `en_attente` et n'apparaît pas dans la recherche tant que le club ne l'a pas validée. Règle : les deux profils existent et sont `publie`, ils sont différents, et si l'`age` écrit dans le profil du proposeur n'est pas d'au moins 18 (ou manque), `accordParent` doit valoir `true` ; la page montre la case du parent dans ce cas, ou si l'âge calculé (`ageDe`) est sous 18.

**Âge et pratique calculés.** Quand un profil a `naissance`, son âge s'affiche tout seul et gagne un an à chaque anniversaire ; quand il a `pratiqueDepuis`, les années de pratique gagnent un an à chaque date anniversaire (fonctions `ageDe` et `pratiqueDe` de `ov/js/ov-data.js`, date locale). `age` et `pratique` restent écrits comme valeurs de secours : ils servent seuls aux anciens profils sans date, et les règles vérifient toujours `age` (14 à 99). Les 22 profils importés sont nés un 31 décembre et pratiquent depuis un 11 novembre.

## Sauvegarde, confidentialité, vignettes

- **Sauvegarde** : bouton « Exporter la base (sauvegarde) » en gestion, onglet « Villes et clubs », une fois par mois. Il télécharge `open-vendetta-sauvegarde-AAAA-MM-JJ.json` (villes, clubs, profils sans vignette, contacts, candidatures). Le fichier contient des données personnelles : à garder sur l'ordinateur de l'organisateur.
- **Note de confidentialité** : lien repliable « Ce que le club fait de vos données » dans le formulaire d'inscription (au-dessus des cases d'accord de l'étape 3) et dans le modèle « Proposer un match » de `open-vendetta.html` (`<template id="tpl-propose">`, qui mentionne aussi le profil retenu par le navigateur). Les candidatures sont gardées 12 mois au plus ; une fiche est supprimée sur simple demande. Un profil ou une candidature se supprime en gestion.
- **Vignettes** : `MINI` = 160 px, 12 000 caractères au plus (`ov/js/ov-image.js`). Les vignettes déjà enregistrées gardent leur ancienne taille jusqu'à un changement de photo.

## Changer une règle de sécurité

Dans `C:\Users\NILS\armwrestlingclubstrassen\open-vendetta\` :

1. Modifier `firestore.rules`, et ajouter un test dans `tests/rules.test.mjs`.
2. `npm run test:rules` → `fail 0` (émulateur local, Java requis).
3. `npx firebase deploy --only firestore:rules` (compte de l'organisateur ; si la CLI n'est plus connectée : `npx firebase login --no-localhost`).
4. `node tests/prod-check.mjs open-vendetta` → 5 lignes `OK` sur le vrai projet.
5. Commit dans le Git local du dossier.

Quand une page du site envoie une forme nouvelle (ex. la proposition de match par `adversaireId`), **déployer les règles avant de pousser la page** : sinon la base refuse les envois de la nouvelle page.

## Alertes sur le téléphone (ntfy)

Chaque nouveau profil et chaque proposition envoie une alerte au sujet ntfy écrit dans `ov/js/ov-config.js` (`NTFY_SUJET`). L'appli ntfy (serveur `ntfy.sh`) doit être abonnée à ce sujet. Le sujet est visible dans le code public : les messages ne contiennent **jamais** de nom ni de contact (« Nouveau profil à valider », « Nouvelle demande de match »), et un clic ouvre la gestion. Pour relire les alertes des 12 dernières heures : `curl -s "https://ntfy.sh/<sujet>/json?poll=1&since=12h"`.

## Ce qui est volontaire — ne pas « corriger »

- `noindex` sur l'inscription et la gestion ; la gestion est hors sitemap.
- Aucune photo d'exemple publiée : les portraits de la maquette (Wikimedia) sont restés hors du site.
- La configuration Firebase de `ov-config.js` est publique par nature : la sécurité tient dans les règles.
- `ov/share.jpg` a été ajouté avec `git add -f` : le `.gitignore` du site ignore `*.JPG`, ce qui attrape aussi `.jpg` sous Windows.
- Le SDK Firebase est épinglé (`FIREBASE_SDK`, 13.1.0) : pour le changer, prendre une version stable publiée depuis plus de 14 jours (`npm view firebase time --json`).
- Les athlètes de la feuille Vendetta du 7 novembre s'importent une seule fois (gestion > « Villes et clubs ») et restent en attente, sans photo : leur accord ne couvrait pas une vitrine publique. Un profil importé ne passe en public que si la personne a dit oui et a donné une photo.
