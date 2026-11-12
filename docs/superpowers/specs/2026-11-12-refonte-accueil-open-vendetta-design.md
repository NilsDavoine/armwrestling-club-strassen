# Refonte de l'accueil et d'Open Vendetta : fiche de décision

> Décidé par Nils le 2026-11-12, après l'audit des deux pages.
> Planches d'audit (les 28 points, les 3 propositions de chacun, les maquettes) :
> accueil https://claude.ai/artifact/Buya4mLXQQbuQnJjcTiL78 · Open Vendetta https://claude.ai/artifact/TfAu8n6UoMtW8ocXdX1Tb3
> Plan : `docs/superpowers/plans/2026-11-12-refonte-accueil-open-vendetta.md`

## Les 3 réponses de cadrage

| Question | Réponse de Nils |
|---|---|
| Quelles photos retoucher | Les fichiers des photos du club utilisées sur l'accueil et sur Open Vendetta. Pour les photos des athlètes : la page applique le même traitement à toutes (recadrage, noir et blanc, voile rouge). Les originaux restent tels quels dans la base. |
| Où appliquer le style | Accueil et Open Vendetta seulement. Les 23 autres pages gardent leur aspect, donc `style.css` n'est pas modifié. |
| Numéros de téléphone | Retirés partout : dans la page et dans les données structurées. Le bouton WhatsApp reste. |

Consigne ajoutée par Nils : « Pour les photos prends bien soin de les retoucher pour qu'elles paraissent vraiment pro, pour le moment certaines font brouillon. »

## Accueil : les 20 choix

| # | Point | Choix |
|---|---|---|
| 1 | Premier écran | C : « Le prochain mardi ». Titre, bloc « Prochain entraînement » avec la date calculée, un bouton « Je viens mardi ». |
| 2 | Version téléphone | A : une seule page qui défile. Barre fixe « Essai gratuit · mardi 19h » en bas sur téléphone. |
| 3 | Ordre de la page | B : 8 sections. Accroche · Venir · Le club · Tarif · Compétition · Articles · Questions · Contact. Les outils (Tournament Manager, Vendetta Manager) passent en pied de page. |
| 4 | Entraînements | B : Strassen d'abord (mardi 19h à 21h30, accès en 3 chiffres), Munsbach en une ligne. |
| 5 | Contact | A : un seul grand bouton WhatsApp, les réseaux en petits liens. Plus de bouton flottant. |
| 6 | Menu | A : Le club · Venir · Tarif · Articles · Open Vendetta, et un bouton « Essai gratuit ». |
| 7 | Titres | A : un fait par titre, une ligne blanche, pas d'étiquette. |
| 8 | Fonds | C : noir uni, et une seule bande rouge (l'essai gratuit). |
| 9 | Boîtes | B : des lignes à la place des boîtes. Angles droits. |
| 10 | Émojis | A : aucune icône. |
| 11 | Boutons | A : rouge plein (action), contour (secondaire), lien souligné. 44 px de haut au minimum. |
| 12 | Petits textes | A : 6 tailles (13, 16, 20, 28, 44, 80 px au plus), rien sous 13 px, un seul gris clair. |
| 13 | À propos | C : le titre de champions d'Europe 2025 sur la grande photo de compétition. |
| 14 | Palmarès | B : les résultats datés, en liste alignée. Pas de témoignages, pas de cartes équipe. |
| 15 | Équipement | A : une grande photo de la salle et une phrase. |
| 16 | Tarif | B : l'essai (0 €), puis la licence (150 € par an). |
| 17 | Articles | A : une liste de titres, une couleur, les 6 liens gardés. |
| 18 | Questions | B : accordéon net, gros « + » rouge, aligné sur le titre. |
| 19 | Texte | A : court et direct. Aucun tiret long. |
| 20 | Animations | B : une seule entrée, celle de l'accroche au chargement. Plus de fondu au défilement. |

## Open Vendetta : les 8 choix

| # | Point | Choix |
|---|---|---|
| 1 | Accroche | A : accroche courte, les profils visibles dès le premier écran. |
| 2 | Marche à suivre | A : 3 étapes numérotées sous l'accroche. |
| 3 | Photos des profils | B : noir et blanc, voile rouge, fait par la page. Cadre en hauteur rempli (4 pour 5). |
| 4 | Liste sur grand écran | A : cartes-portraits, 4 par ligne. La rangée reste telle quelle sur téléphone. |
| 5 | Formulaire | A : une étape à la fois, avec les carrés numérotés et une barre d'avancement. |
| 6 | Menu et pied de page | A : « Ajouter mon profil » partout, en contour. Plus de lien en double. |
| 7 | Signes de vie | A : « Ouvert depuis le 11 novembre 2026. Les premiers matchs seront annoncés ici. » |
| 8 | Chargement | A : des rangées grises en attente. |

Les 12 détails choisis le matin du 2026-11-12 (filtres, rangée, mesures, cases, étapes) ne bougent pas.

## Comment c'est construit

- **`accueil.css`** (nouveau, à la racine) : le style de la nouvelle page d'accueil, seul. `index.html` ne charge plus `style.css`. Les 23 autres pages et Open Vendetta continuent de charger `style.css`, qui n'est pas modifié.
- **`index.html`** : réécrit. Une copie de l'ancien est dans `.claude/sauvegardes/2026-11-12-refonte/`.
- **`accueil.js`** (nouveau) : la date du prochain mardi, l'accordéon des questions, le menu du téléphone. Sans JavaScript, la page affiche « Chaque mardi, 19h » et toutes les réponses restent lisibles.
- **Téléphone** : la redirection de la ligne 5 d'`index.html` vers `/m/` est retirée, ainsi que la balise `rel="alternate" media`. `index.html` devient la seule page d'accueil, en une colonne sur téléphone. C'est l'« alternative envisagée » de `docs/SEO.md` : elle supprime le risque de désindexation de juillet 2026.
- **`m/index.html`** : devient un renvoi vers `/` (balise `refresh`, lien, `canonical` vers `/`, `index, follow`). Le fichier reste, pour que les anciens liens et Google arrivent sur l'accueil. `m/evenement.html` ne bouge pas.
- **Liens internes** : tous les liens que portaient `index.html` et `m/index.html` restent dans le nouvel `index.html` (les 6 articles, les 4 pages locales, la page allemande, `technique-prise-bras-de-fer.html`, `club-demenage-cnam-strassen.html`, `open-vendetta.html`, `articles.html`, `tournament.html`, `duel.html`, `m/evenement.html`, l'inscription à la 7e édition).
- **Données structurées** : même `SportsClub`, même `FAQPage` (les questions affichées et les questions déclarées restent identiques), sans `telephone`. `title` et `meta description` inchangés.
- **Photos du club** : nouveaux fichiers `.webp` retouchés, avec de nouveaux noms descriptifs. Les fichiers actuels ne sont ni renommés ni écrasés (ils servent à d'autres pages). Retouche : recadrage, redressement, lumière, couleurs, netteté, même étalonnage pour toutes. 300 Ko au plus, 1440 px au plus.
- **Open Vendetta** : `open-vendetta.html` (styles dans la page), `ov/js/ov-vitrine.js`, `ov/js/ov-vue.js`, `ov/js/ov-inscription.js`. Aucune règle Firestore ne change, aucune donnée de la base n'est modifiée.

## Ce qui n'est pas dans ce chantier

- Les 23 autres pages (articles, pages locales, page allemande) : inchangées, y compris leur menu.
- Les photos des athlètes dans la base : inchangées.
- De nouvelles prises de vue : la retouche part des photos existantes.
- La mise en ligne : seulement quand Nils la demande.

## Points laissés ouverts, à confirmer par Nils

- Le titre européen : la page écrit « Champions d'Europe 2025, sous les couleurs de la fédération luxembourgeoise ». Qui, quelle catégorie : à préciser.
- Le nombre de tables au CNAM : la nouvelle page ne donne plus de chiffre.
- `m/evenement.html` (POWER ARM) : le lien est gardé en pied de page. À retirer si l'événement est passé.
