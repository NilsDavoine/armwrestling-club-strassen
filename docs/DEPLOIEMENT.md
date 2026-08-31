# SEO — Guide de déploiement
## Armwrestling Club Strassen · Mai 2026

---

## Fichiers à déployer

Copiez tous ces fichiers dans votre dépôt GitHub à la racine du site :

### Articles blog (5 fichiers)
| Fichier | Requête cible principale |
|---|---|
| `guide-debutant-bras-de-fer.html` | "bras de fer débutant", "comment commencer bras de fer" |
| `preparation-competition-bras-de-fer.html` | "préparer compétition bras de fer", "premier tournoi bras de fer" |
| `regles-officielles-bras-de-fer.html` | "règles bras de fer", "règlement armwrestling" |
| `sport-de-force-luxembourg-comparatif.html` | "sport de force Luxembourg", "CrossFit vs bras de fer" |
| `entrainement-bras-de-fer-maison.html` | "entraînement bras de fer maison", "exercices avant-bras armwrestling" |

### Pages locales (2 fichiers)
| Fichier | Requête cible principale |
|---|---|
| `bras-de-fer-luxembourg-ville.html` | "bras de fer Luxembourg ville", "club armwrestling Luxembourg" |
| `sport-force-luxembourg.html` | "sport de force Luxembourg", "armwrestling Luxembourg" |

### Sitemap
| Fichier | Action |
|---|---|
| `sitemap.xml` | Remplace l'ancien sitemap.xml |

---

## Liens internes à ajouter dans index.html

### Section Blog (index.html)
Ajoutez les 5 articles dans la section blog. Pour chaque article, ajoutez une card :

```html
<!-- Dans la .blog-grid, ajoutez 3 nouvelles cards : -->
<div class="blog-card">
  <div style="...;color:var(--red);">Guide · Débutant</div>
  <div style="...">Guide complet pour débuter le bras de fer</div>
  <p style="...">Technique, sécurité, matériel et premier essai expliqués.</p>
  <a href="guide-debutant-bras-de-fer.html" style="...;color:var(--red);">Lire l'article →</a>
</div>
```

### Section Ressources (index.html)
Les pages locales peuvent remplacer ou compléter les 4 cards existantes dans `.seo-pages-grid`.

---

## Liens internes recommandés entre les pages

Ces liens renforcent le maillage interne — crucial pour le SEO :

### Depuis index.html → vers les nouvelles pages
- Section "Débuter" → lien vers `guide-debutant-bras-de-fer.html`
- Section "Compétitions" → lien vers `preparation-competition-bras-de-fer.html` et `regles-officielles-bras-de-fer.html`
- Section "Localisation" → lien vers `bras-de-fer-luxembourg-ville.html`

### Depuis les articles → vers index.html et entre eux
Chaque article contient déjà un CTA vers `index.html#contact`.
Ajoutez en bas de chaque article une section "À lire aussi" :

```html
<div style="border-top:1px solid rgba(255,255,255,.07);padding-top:2rem;margin-top:3rem;">
  <div style="font-family:var(--font-display);font-size:.75rem;font-weight:700;
    letter-spacing:.2em;text-transform:uppercase;color:var(--red);margin-bottom:1.5rem;">
    À lire aussi
  </div>
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem;">
    <a href="guide-debutant-bras-de-fer.html" style="text-decoration:none;
      background:var(--dark);border:1px solid rgba(255,255,255,.07);
      padding:1.2rem 1.5rem;display:block;color:var(--white);
      font-family:var(--font-display);font-size:.95rem;font-weight:700;
      text-transform:uppercase;transition:border-color .2s;"
      onmouseover="this.style.borderColor='rgba(192,57,43,.4)'"
      onmouseout="this.style.borderColor='rgba(255,255,255,.07)'">
      Guide débutant bras de fer →
    </a>
    <a href="regles-officielles-bras-de-fer.html" style="text-decoration:none;
      background:var(--dark);border:1px solid rgba(255,255,255,.07);
      padding:1.2rem 1.5rem;display:block;color:var(--white);
      font-family:var(--font-display);font-size:.95rem;font-weight:700;
      text-transform:uppercase;transition:border-color .2s;"
      onmouseover="this.style.borderColor='rgba(192,57,43,.4)'"
      onmouseout="this.style.borderColor='rgba(255,255,255,.07)'">
      Règles officielles bras de fer →
    </a>
  </div>
</div>
```

---

## Soumettre à Google Search Console

1. Allez sur https://search.google.com/search-console
2. Sélectionnez votre propriété
3. Outil "Sitemaps" → soumettez : `https://nilsdavoine.github.io/armwrestling-club-strassen/sitemap.xml`
4. Outil "Inspection d'URL" → inspectez chaque nouvelle URL et cliquez "Demander l'indexation"

---

## Calendrier de publication recommandé

Pour un impact SEO maximal, ne publiez pas tout en même temps.
Google valorise un site qui publie régulièrement.

| Semaine | Publier |
|---|---|
| Semaine 1 | `bras-de-fer-luxembourg-ville.html` + `sport-force-luxembourg.html` |
| Semaine 2 | `guide-debutant-bras-de-fer.html` |
| Semaine 3 | `regles-officielles-bras-de-fer.html` |
| Semaine 4 | `sport-de-force-luxembourg-comparatif.html` |
| Semaine 5 | `preparation-competition-bras-de-fer.html` |
| Semaine 6 | `entrainement-bras-de-fer-maison.html` |

---

## Prochaines étapes SEO après déploiement

1. **Partager sur les réseaux** : chaque article publié → post Instagram + Facebook avec lien
2. **Mairie de Strassen** : demandez à être listé sur strassen.lu avec lien vers votre site
3. **Commune de Schuttrange** : idem pour le club Munsbach
4. **sports.lu / sportlux.lu** : soumettez votre club pour être référencé
5. **RTL / Wort** : proposez un article sur la prochaine compétition → backlink de qualité
