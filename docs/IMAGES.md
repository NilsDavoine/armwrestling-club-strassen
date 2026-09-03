# Images — workflow

## Règle

**Aucune image servie ne doit dépasser ~300 Ko.** Les images sont le premier facteur de LCP (Largest Contentful Paint), métrique Core Web Vitals qui influence le classement.

Format `.webp` pour tout le contenu. PNG réservé aux favicons et à `android-chrome-512x512.png`.

## Ajouter une image

1. Déposer l'original à la racine (ou dans `picture_event_clubs/` pour les exercices POWER ARM)
2. Lancer la compression ci-dessous
3. Référencer avec un `alt` descriptif contenant naturellement le sujet

```html
<img src="mon-image.webp" alt="Match de bras de fer en compétition au Luxembourg" loading="lazy" width="800" height="600">
```

`loading="lazy"` sur toutes les images sous la ligne de flottaison. `width`/`height` explicites pour éviter le CLS (Cumulative Layout Shift).

## Compression

`sharp` est déjà installé en dépendance de développement.

```bash
cat > .compress.js <<'EOF'
const sharp=require('sharp'),fs=require('fs');
(async()=>{
  for(const f of process.argv.slice(2)){
    const buf=fs.readFileSync(f), before=buf.length;
    const out=await sharp(buf).resize({width:1600,withoutEnlargement:true}).webp({quality:78}).toBuffer();
    if(out.length<before){fs.writeFileSync(f,out);console.log(`${f}: ${Math.round(before/1024)}Ko -> ${Math.round(out.length/1024)}Ko`);}
    else console.log(`${f}: inchange`);
  }
})();
EOF
node .compress.js mon-image.webp
rm .compress.js
```

**Note Windows :** la lecture doit passer par un buffer (`fs.readFileSync`) et non par un chemin. `sharp` garde sinon un verrou sur le fichier source, ce qui fait échouer l'écriture avec `EPERM`.

### Réglages

| Paramètre | Valeur | Raison |
|---|---|---|
| `width: 1600` | max | Au-delà, aucun gain visible sur écran courant |
| `quality: 78` | webp | Seuil où l'artefact devient perceptible |
| `withoutEnlargement` | true | N'agrandit jamais une petite image |

## Compresser tout ce qui dépasse le seuil

```bash
LIST=""
for f in *.webp; do
  n=$(grep -l "$f" *.html m/*.html *.css 2>/dev/null | wc -l)
  sz=$(du -k "$f" | cut -f1)
  if [ "$n" -gt 0 ] && [ "$sz" -gt 800 ]; then LIST="$LIST $f"; fi
done
node .compress.js $LIST
```

## Trouver les images inutilisées

```bash
for f in *.webp; do
  n=$(grep -l "$f" *.html m/*.html *.css 2>/dev/null | wc -l)
  [ "$n" -eq 0 ] && echo "INUTILISEE: $f ($(du -k "$f" | cut -f1) Ko)"
done
```

Les déplacer dans `_archive/`. Ce dossier est exclu du déploiement par Jekyll (préfixe `_`) et ignoré par git.

## Historique

- **juillet 2026** — 11 images actives compressées : 35 Mo → 1,1 Mo. `competition-bras-de-fer-luxembourg.webp`, servie sur 8 pages et utilisée en `og:image`, passait de 3368 Ko à 111 Ko.
- 19 images inutilisées (48 Mo) déplacées vers `_archive/`.

## Point ouvert

Le dossier `.git` pèse ~474 Mo : les images lourdes d'origine restent dans l'historique. Les sortir du disque ne réduit pas le dépôt. Un `git filter-repo` réécrirait l'historique — opération lourde, à ne tenter qu'avec une sauvegarde complète.
