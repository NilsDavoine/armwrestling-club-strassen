# Déménagement CNAM + horaire 19h — plan d'implémentation

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Faire passer tout le site de « 86 rue des Romains, mardi 18h » à « CNAM, 297 rue de Reckenthal, mardi 19h–21h30 », avec un article d'annonce relié depuis trois pages.

**Architecture:** Site statique sans build ; chaque page est un HTML autonome. Les modifications sont des remplacements de chaînes exacts, appliqués par un petit script node qui refuse tout remplacement dont le nombre d'occurrences ne correspond pas. L'ordre compte : la passe globale « 18h → 19h » s'exécute d'abord, les éditions par fichier sont écrites contre le texte résultant.

**Tech Stack:** HTML/CSS statiques, node 24 (script utilitaire dans le scratchpad), grep pour la vérification. Pas de commit sans accord de Nils : un seul commit proposé à la fin.

Spec : `docs/superpowers/specs/2026-09-24-demenagement-cnam-design.md`.

---

### Task 1 : outil de remplacement vérifié

**Files:**
- Create: `<scratchpad>/replace.js`
- Create: `<scratchpad>/check.js`

Format d'un fichier d'éditions (`.edits`) : blocs `=== old` / `=== new`, texte tel quel, sans échappement. Une ligne `=== old count=all` autorise plusieurs occurrences ; sinon exactement une occurrence est exigée. Les `\n` dans une valeur `new` prennent la fin de ligne dominante du fichier cible.

- [ ] **Step 1 : écrire `replace.js`**

```js
// usage: node replace.js <file> <edits-file> [--tolerant]   (exit 1 si une édition ne matche pas exactement)
const fs = require('fs');
const [,, file, editsFile, flag] = process.argv; const tolerant = flag === '--tolerant';
let src = fs.readFileSync(file, 'utf8');
const bom = src.charCodeAt(0) === 0xFEFF ? '﻿' : ''; if (bom) src = src.slice(1);
const crlf = (src.match(/\r\n/g) || []).length, lf = (src.match(/(^|[^\r])\n/g) || []).length;
const eol = crlf >= lf ? '\r\n' : '\n';
const raw = fs.readFileSync(editsFile, 'utf8').replace(/\r\n/g, '\n');
const blocks = raw.split(/^=== old(.*)$/m);
const edits = [];
for (let i = 1; i < blocks.length; i += 2) {
  const opts = blocks[i].trim(); const body = blocks[i + 1];
  const idx = body.indexOf('\n=== new\n'); if (idx < 0) { console.error('bloc sans === new'); process.exit(1); }
  const oldS = body.slice(1, idx); const newS = body.slice(idx + '\n=== new\n'.length).replace(/\n$/, '');
  edits.push({ old: oldS.replace(/\n/g, eol), neu: newS.replace(/\n/g, eol), all: /count=all/.test(opts) });
}
let failed = false, applied = 0;
for (const e of edits) {
  const n = src.split(e.old).length - 1;
  if (n === 0 && tolerant) continue;
  if (n === 0 || (!e.all && n !== 1)) { failed = true; console.error(`✗ ${n} occurrence(s) : ${e.old.slice(0, 90)}`); continue; }
  src = src.split(e.old).join(e.neu); applied++; console.log(`✓ ${n}× ${e.old.slice(0, 70)}`);
}
if (failed) { console.error(`ABANDON, ${file} non modifié`); process.exit(1); }
if (applied) fs.writeFileSync(file, bom + src, 'utf8');
console.log(`→ ${file} : ${applied} édition(s)`);
```

- [ ] **Step 2 : écrire `check.js`** (vérification finale, Task 11)

```js
// usage: node check.js  — depuis la racine du dépôt
const fs = require('fs');
const pages = [...fs.readdirSync('.').filter(f => f.endsWith('.html')), 'm/index.html', 'm/evenement.html'];
const newPage = 'club-demenage-cnam-strassen.html';
let bad = 0;
const leftovers = [/rue des Romains/i, /L-8041/, /garage/i, /mardi 18h/i, /mardi à 18h/i, /mardi%20%C3%A0%2018h/, /Dienstag ab 18/, /dienstags um 18/i, /Mardi — 18h00/];
for (const p of pages) {
  const s = fs.readFileSync(p, 'utf8');
  if (p !== newPage) for (const re of leftovers) { const m = s.match(re); if (m) { bad++; console.log(`RESTE  ${p}: ${m[0]}`); } }
  const blocks = [...s.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
  blocks.forEach((b, i) => { try { JSON.parse(b[1]); } catch (e) { bad++; console.log(`JSON-LD invalide ${p} bloc ${i}: ${e.message}`); } });
}
const pick = s => { const m = s.match(/"streetAddress":\s*"([^"]+)"[\s\S]*?"postalCode":\s*"([^"]+)"[\s\S]*?"latitude":\s*([\d.]+)[\s\S]*?"longitude":\s*([\d.]+)/); return m ? m.slice(1).join(' | ') : 'ABSENT'; };
const a = pick(fs.readFileSync('index.html', 'utf8')), b = pick(fs.readFileSync('m/index.html', 'utf8'));
if (a !== b) { bad++; console.log(`PARITÉ index/m : ${a}  ≠  ${b}`); } else console.log(`parité index/m OK : ${a}`);
const tm = f => { const s = fs.readFileSync(f, 'utf8'); return [ (s.match(/<title>([^<]*)<\/title>/) || [])[1] || '', (s.match(/name="description" content="([^"]*)"/) || [])[1] || '' ]; };
if (tm('index.html')[0] !== tm('m/index.html')[0] || tm('index.html')[1] !== tm('m/index.html')[1]) { bad++; console.log('PARITÉ title/meta index vs m/index'); } else console.log('parité title/meta OK');
if (!fs.existsSync(newPage)) { bad++; console.log('nouvelle page absente'); } else {
  const [t, d] = tm(newPage); console.log(`nouvelle page: title ${t.length} car., description ${d.length} car.`);
  if (t.length < 50 || t.length > 60) { bad++; console.log('title hors 50-60'); }
  if (d.length < 120 || d.length > 160) { bad++; console.log('description hors 120-160'); }
  const inbound = pages.filter(p => p !== newPage && fs.readFileSync(p, 'utf8').includes(newPage));
  console.log(`liens entrants (${inbound.length}) : ${inbound.join(', ')}`); if (inbound.length < 3) { bad++; console.log('moins de 3 liens entrants'); }
  if (!fs.readFileSync('sitemap.xml', 'utf8').includes(newPage)) { bad++; console.log('absente du sitemap'); }
  const h1 = (fs.readFileSync(newPage, 'utf8').match(/<h1[\s>]/g) || []).length; if (h1 !== 1) { bad++; console.log(`h1 = ${h1}`); }
}
console.log(bad ? `\n${bad} problème(s)` : '\nTOUT EST OK'); process.exit(bad ? 1 : 0);
```

- [ ] **Step 3 : tester l'outil sur une copie**

Run : `cp index.html "$S/t.html" && printf '=== old\n86 rue des Romains, Strassen, Luxembourg\n=== new\nTEST\n' > "$S/t.edits" && node "$S/replace.js" "$S/t.html" "$S/t.edits" && grep -c TEST "$S/t.html"`
Expected : `✓ 1× …`, puis `1`. Un second passage sur le même fichier doit échouer avec `✗ 0 occurrence(s)`.

---

### Task 2 : passe globale horaire 18h → 19h (24 fichiers)

**Files:** Modify: tous les `*.html` de la racine et `m/index.html` ; `CLAUDE.md` ligne 4.

Les motifs contiennent tous « mardi », « Di » ou « Dienstag » : aucun ne peut toucher « vendredi 18h » (Munsbach).

- [ ] **Step 1 : écrire `<scratchpad>/horaire.edits`** (tous en `count=all`)

```
=== old count=all
mardi%20%C3%A0%2018h
=== new
mardi%20%C3%A0%2019h
=== old count=all
Mardi 18h
=== new
Mardi 19h
=== old count=all
mardi 18h
=== new
mardi 19h
=== old count=all
mardi à 18h00
=== new
mardi de 19h à 21h30
=== old count=all
mardi à 18h
=== new
mardi à 19h
=== old count=all
Mardi à 18h
=== new
Mardi à 19h
=== old count=all
mardi (18h)
=== new
mardi (19h)
=== old count=all
Mardi — 18h00
=== new
Mardi — 19h00
=== old count=all
Mardi <span>18h</span>
=== new
Mardi <span>19h</span>
=== old count=all
Di <span>18h</span>
=== new
Di <span>19h</span>
=== old count=all
Dienstag ab 18 Uhr
=== new
Dienstag ab 19 Uhr
=== old count=all
dienstags um 18 Uhr
=== new
dienstags um 19 Uhr
=== old count=all
Dienstags um 18 Uhr
=== new
Dienstags um 19 Uhr
=== old count=all
Dienstag 18 Uhr
=== new
Dienstag 19 Uhr
```

- [ ] **Step 2 : appliquer en mode tolérant** (un motif absent d'un fichier est ignoré)

```bash
cd <repo>; for f in *.html m/index.html; do node "$S/replace.js" "$f" "$S/horaire.edits" --tolerant; done
```

- [ ] **Step 3 : vérifier**

Run : `grep -rn -i -E "mardi.{0,3}18h|dienstag.{0,4}18|C3%A0%2018h" *.html m/*.html | grep -v -i vendredi`
Expected : aucune ligne.

- [ ] **Step 4 : CLAUDE.md ligne 4** : `séance d'essai gratuite du mardi 18h.` → `séance d'essai gratuite du mardi 19h.`

---

### Task 3 : `index.html` et `m/index.html` (parité)

**Files:** Modify: `index.html` (l. 45-53, 125, 212, 240, 485, 491, 516-521, 886, 922), `m/index.html` (l. 37-45, 117, 621, 634-637, + un lien slide 3).

- [ ] **Step 1 : `<scratchpad>/index.edits`** (commun aux deux fichiers)

```
=== old
          "streetAddress": "86 rue des Romains",
=== new
          "streetAddress": "Centre National des Arts Martiaux, 297 rue de Reckenthal",
=== old
          "postalCode": "L-8041",
=== new
          "postalCode": "L-2410",
=== old
          "latitude": 49.61850,
=== new
          "latitude": 49.62153,
=== old
          "longitude": 6.06274
=== new
          "longitude": 6.08436
=== old
              "text": "Le site principal de l'Armwrestling Club Strassen se trouve au 86 rue des Romains, L-8041 Strassen, proche Luxembourg-ville."
=== new
              "text": "Le club s'entraîne au Centre National des Arts Martiaux (CNAM), 297 rue de Reckenthal, L-2410 Strassen, à 8 minutes de Luxembourg-ville. Bâtiment principal, 2e étage, salle à droite. Parking gratuit, bus 16 et 11 (arrêt Strassen, Hondseck) ou bus 19 (arrêt Strassen, Schafsstrachen)."
```

- [ ] **Step 2 : `<scratchpad>/index-desktop.edits`** (propre à `index.html`)

```
=== old
        <div class="hero-highlight">Essai gratuit · Mardi 19h · Strassen</div>
=== new
        <div class="hero-highlight">Essai gratuit · Mardi 19h · Strassen</div>
        <a href="club-demenage-cnam-strassen.html" class="hero-highlight" style="text-decoration:none;border:1px solid rgba(192,57,43,.5);">Nouveau dès le 29 septembre 2026 : le club s'installe au CNAM, mardi 19h–21h30 →</a>
=== old
          <div class="quick-info-value">86 rue des Romains, proche Luxembourg-ville, transport simple</div>
=== new
          <div class="quick-info-value">CNAM, 297 rue de Reckenthal — 8 min du centre, bus 16 / 11 / 19, parking gratuit</div>
=== old
      <div class="card-location">📍 86 rue des Romains, Strassen, Luxembourg</div>
=== new
      <div class="card-location">📍 CNAM · 297 rue de Reckenthal, L-2410 Strassen</div>
=== old
          <div class="card-detail-value">Mardi — 19h00</div>
=== new
          <div class="card-detail-value">Mardi — 19h00 à 21h30</div>
=== old
        <div class="card-access-row">🚗 <span><strong>8 min</strong> en voiture · Parking devant le garage, toujours disponible</span></div>
=== new
        <div class="card-access-row">🚗 <span><strong>8 min</strong> en voiture par la route d'Arlon · Parking gigantesque, gratuit, ouvert en permanence</span></div>
=== old
        <div class="card-access-row">🚌 <span><strong>12 min</strong> en transport en commun depuis la gare centrale</span></div>
=== new
        <div class="card-access-row">🚌 <span><strong>Bus 16 ou 11</strong> depuis Hamilius, arrêt Strassen, Hondseck (10 min à pied) · <strong>Bus 19</strong> depuis la gare, arrêt Strassen, Schafsstrachen (5 min à pied) · gratuit</span></div>
        <div class="card-access-row">🚲 <span><strong>17 min</strong> à vélo depuis le centre par la route d'Arlon</span></div>
=== old
        <div class="card-access-row">🚪 <span>Garage blanc identifiable — sonnez à la porte d'entrée à côté du garage</span></div>
=== new
        <div class="card-access-row">🚪 <span>Bâtiment principal, 2ᵉ étage, salle à droite · en cas de doute, la conciergerie au rez-de-chaussée vous oriente</span></div>
=== old
          <a class="card-map-link" href="https://www.google.com/maps/search/?api=1&query=86+rue+des+Romains+Strassen+Luxembourg" target="_blank" rel="noopener">Google Maps</a>
=== new
          <a class="card-map-link" href="https://www.google.com/maps/search/?api=1&query=297+rue+de+Reckenthal+Strassen+Luxembourg" target="_blank" rel="noopener">Google Maps</a>
=== old
          <a class="card-map-link" href="https://www.google.com/maps/dir/?api=1&origin=Luxembourg+Ville+Centre&destination=86+rue+des+Romains+Strassen+Luxembourg&travelmode=transit" target="_blank" rel="noopener">Itinéraire →</a>
=== new
          <a class="card-map-link" href="https://www.google.com/maps/dir/?api=1&origin=Luxembourg+Ville+Centre&destination=297+rue+de+Reckenthal+Strassen+Luxembourg&travelmode=transit" target="_blank" rel="noopener">Itinéraire →</a>
          <a class="card-map-link" href="club-demenage-cnam-strassen.html">La nouvelle salle →</a>
=== old
          <p>Le club de Strassen est à 8 min en voiture et 12 min en transport depuis le centre-ville. Parking toujours disponible devant le garage. Le club de Munsbach est à 13–15 min en voiture ou 17 min en train.</p>
=== new
          <p>Le club de Strassen (CNAM, 297 rue de Reckenthal) est à 8 min en voiture du centre-ville, avec un grand parking gratuit. En bus : lignes 16 ou 11 depuis Hamilius jusqu'à l'arrêt Strassen, Hondseck, puis 10 min à pied ; ou ligne 19 depuis la gare jusqu'à Strassen, Schafsstrachen, puis 5 min à pied. Le club de Munsbach est à 13–15 min en voiture ou 17 min en train.</p>
=== old
      <div style="font-size:0.9rem;color:rgba(245,240,232,0.65);margin-bottom:1rem;">📍 86 rue des Romains, Strassen</div>
=== new
      <div style="font-size:0.9rem;color:rgba(245,240,232,0.65);margin-bottom:1rem;">📍 CNAM, 297 rue de Reckenthal, Strassen</div>
```

- [ ] **Step 3 : `<scratchpad>/m-index.edits`** (propre à `m/index.html`)

```
=== old
      <div class="pill">Mardi 19h · Strassen</div>
=== new
      <div class="pill">Mardi 19h–21h30 · CNAM Strassen</div>
=== old
          <div class="card-day">Mardi 19h</div>
=== new
          <div class="card-day">Mardi 19h–21h30</div>
=== old
          <div class="card-addr">86 rue des Romains · L-8041 Strassen</div>
=== new
          <div class="card-addr">CNAM · 297 rue de Reckenthal · L-2410 Strassen</div>
=== old
          <a href="https://maps.google.com/?q=86+rue+des+Romains+L-8041+Strassen+Luxembourg" target="_blank" rel="noopener" class="maps-link">📍 Ouvrir dans Maps</a>
=== new
          <a href="https://maps.google.com/?q=297+rue+de+Reckenthal+L-2410+Strassen+Luxembourg" target="_blank" rel="noopener" class="maps-link">📍 Ouvrir dans Maps</a>
=== old
        <a href="../entrainement-bras-de-fer-strassen.html" class="doc-link">Entraînement de bras de fer à Strassen</a>
=== new
        <a href="../club-demenage-cnam-strassen.html" class="doc-link">Nouvelle salle au CNAM dès le 29 septembre 2026</a>
        <a href="../entrainement-bras-de-fer-strassen.html" class="doc-link">Entraînement de bras de fer à Strassen</a>
```

- [ ] **Step 4 : appliquer** : `node replace.js index.html index.edits && node replace.js index.html index-desktop.edits && node replace.js m/index.html index.edits && node replace.js m/index.html m-index.edits`
- [ ] **Step 5 : vérifier la parité** : `node check.js` doit afficher `parité index/m OK` et `parité title/meta OK` (la nouvelle page n'existe pas encore : cette erreur-là est attendue).

---

### Task 4 : `entrainement-bras-de-fer-strassen.html`

- [ ] **Step 1 : `<scratchpad>/strassen.edits`**

```
=== old
"streetAddress":"86 rue des Romains","postalCode":"L-8041"
=== new
"streetAddress":"Centre National des Arts Martiaux, 297 rue de Reckenthal","postalCode":"L-2410"
=== old
"geo":{"@type":"GeoCoordinates","latitude":49.61850,"longitude":6.06274}
=== new
"geo":{"@type":"GeoCoordinates","latitude":49.62153,"longitude":6.08436}
=== old
Chaque mardi à 19h au 86 rue des Romains. Tables de compétition WAF
=== new
Chaque mardi de 19h à 21h30 au Centre National des Arts Martiaux (CNAM), 297 rue de Reckenthal. 5 tables de compétition WAF
=== old
<div class="hero-stat-num">2<span>h</span></div><div class="hero-stat-label">durée de la séance</div>
=== new
<div class="hero-stat-num">2<span>h30</span></div><div class="hero-stat-label">durée de la séance</div>
=== old
query=86+rue+des+Romains+Strassen+Luxembourg
=== new
query=297+rue+de+Reckenthal+Strassen+Luxembourg
=== old
    <h2>Une séance type, <span>minute par minute</span></h2>
=== new
    <div class="callout">
      <p><strong>Nouveau depuis le 29 septembre 2026 :</strong> le club s'entraîne au Centre National des Arts Martiaux (CNAM), 297 rue de Reckenthal à Strassen, le mardi de 19h à 21h30. Salle de 60 places, 5 tables, parking gratuit. <a href="club-demenage-cnam-strassen.html" style="color:var(--white);font-weight:600;">Tout savoir sur la nouvelle salle et l'accès →</a></p>
    </div>
    <h2>Une séance type, <span>minute par minute</span></h2>
=== old
L'entraînement du mardi commence à 19h et dure environ 2 heures.
=== new
L'entraînement du mardi commence à 19h et dure 2h30, jusqu'à 21h30.
=== old
        <div class="tl-time">18h00</div>
=== new
        <div class="tl-time">19h00</div>
=== old
        <div class="tl-time">18h20</div>
=== new
        <div class="tl-time">19h20</div>
=== old
        <div class="tl-time">18h40</div>
=== new
        <div class="tl-time">19h40</div>
=== old
        <div class="tl-time">20h00</div>
=== new
        <div class="tl-time">21h30</div>
=== old
        <p class="cta-final-desc">86 rue des Romains, Strassen — 8 min depuis Luxembourg-ville. Aucun équipement requis, tous niveaux bienvenus.</p>
=== new
        <p class="cta-final-desc">CNAM, 297 rue de Reckenthal, Strassen — 8 min depuis Luxembourg-ville, parking gratuit. Aucun équipement requis, tous niveaux bienvenus.</p>
```

Avant d'appliquer : vérifier que la classe `callout` est stylée pour cette page (`grep -c "\.callout" style.css blog.css entrainement-bras-de-fer-strassen.html`). Si absente, copier la règle `.callout` de `bras-de-fer-luxembourg-ville.html` dans le `<style>` de la page.

- [ ] **Step 2 : appliquer** : `node replace.js entrainement-bras-de-fer-strassen.html strassen.edits`

---

### Task 5 : `bras-de-fer-luxembourg-ville.html`

- [ ] **Step 1 : `<scratchpad>/ville.edits`**

```
=== old
"streetAddress":"86 rue des Romains","postalCode":"L-8041"
=== new
"streetAddress":"Centre National des Arts Martiaux, 297 rue de Reckenthal","postalCode":"L-2410"
=== old
"geo":{"@type":"GeoCoordinates","latitude":49.61850,"longitude":6.06274}
=== new
"geo":{"@type":"GeoCoordinates","latitude":49.62153,"longitude":6.08436}
=== old
query=86+rue+des+Romains+Strassen+Luxembourg
=== new
query=297+rue+de+Reckenthal+Strassen+Luxembourg
=== old
        <div class="tip-stat-desc">86 rue des Romains, Strassen. Parking toujours disponible. Accès simple depuis tous les quartiers de la capitale, avant ou après le travail.</div>
=== new
        <div class="tip-stat-desc">CNAM, 297 rue de Reckenthal, Strassen. Parking gigantesque et gratuit. Accès simple depuis tous les quartiers de la capitale, après le travail.</div>
=== old
        <li class="rl-hub"><span class="rl-name">Strassen</span><span class="rl-time">Le club · 86 rue des Romains</span></li>
=== new
        <li class="rl-hub"><span class="rl-name">Strassen</span><span class="rl-time">Le club · CNAM, 297 rue de Reckenthal</span></li>
=== old
      <figcaption class="route-map-cap">Temps de trajet en voiture (approx.) jusqu'à Strassen · 86 rue des Romains, L-8041</figcaption>
=== new
      <figcaption class="route-map-cap">Temps de trajet en voiture (approx.) jusqu'au CNAM Strassen · 297 rue de Reckenthal, L-2410</figcaption>
=== old
        <div class="access-cell-val">Environ <strong>8 minutes</strong> depuis Luxembourg centre-ville. Parking disponible devant le garage et dans la rue autour.</div>
=== new
        <div class="access-cell-val">Environ <strong>8 minutes</strong> depuis Luxembourg centre-ville par la route d'Arlon. Parking gigantesque, gratuit et ouvert en permanence devant le hall. À vélo : 17 min depuis le centre.</div>
=== old
        <div class="access-cell-val">Environ <strong>12 minutes</strong> depuis le centre. Lignes de bus desservant Strassen depuis la gare centrale.</div>
=== new
        <div class="access-cell-val"><strong>Bus 16 ou 11</strong> depuis Hamilius, arrêt Strassen, Hondseck, puis 10 min à pied (jusqu'à 23h30). <strong>Bus 19</strong> depuis la Gare centrale, arrêt Strassen, Schafsstrachen, puis 5 min à pied (aller uniquement, dernier bus 19h27). Transports gratuits.</div>
=== old
        <div class="access-cell-val"><strong>86 rue des Romains</strong><br>L-8041 Strassen, Luxembourg</div>
=== new
        <div class="access-cell-val"><strong>Centre National des Arts Martiaux (CNAM)</strong><br>297 rue de Reckenthal, L-2410 Strassen</div>
=== old
        <div class="access-cell-val">Garage blanc facilement identifiable. Sonnez à la porte d'entrée à côté de la porte de garage.</div>
=== new
        <div class="access-cell-val">Bâtiment principal, 2ᵉ étage, salle à droite. En cas de doute, la conciergerie au rez-de-chaussée vous oriente.</div>
=== old
Venez directement le mardi à 19h au 86 rue des Romains. Présentez-vous comme débutant. On vous explique les bases et vous essayez sur table immédiatement. Aucun équipement à apporter.</p>
=== new
Venez directement le mardi à 19h au CNAM, 297 rue de Reckenthal. Présentez-vous comme débutant. On vous explique les bases et vous essayez sur table immédiatement. Aucun équipement à apporter. <a href="club-demenage-cnam-strassen.html" style="color:var(--white);font-weight:600;">Nouvelle salle depuis le 29 septembre 2026 →</a></p>
=== old
        <p>86 rue des Romains, Strassen — 8 min depuis Luxembourg-ville.</p>
=== new
        <p>CNAM, 297 rue de Reckenthal, Strassen — 8 min depuis Luxembourg-ville.</p>
```

- [ ] **Step 2 : appliquer** : `node replace.js bras-de-fer-luxembourg-ville.html ville.edits`

---

### Task 6 : `club-bras-de-fer-debutant-luxembourg.html`

- [ ] **Step 1 : `<scratchpad>/debutant.edits`**

```
=== old
"streetAddress":"86 rue des Romains","postalCode":"L-8041"
=== new
"streetAddress":"Centre National des Arts Martiaux, 297 rue de Reckenthal","postalCode":"L-2410"
=== old
"geo":{"@type":"GeoCoordinates","latitude":49.61850,"longitude":6.06274}
=== new
"geo":{"@type":"GeoCoordinates","latitude":49.62153,"longitude":6.08436}
=== old
<strong>Horaire stable</strong> — mardi 19h, heure de sortie de bureau, pas de complication
=== new
<strong>Horaire stable</strong> — mardi de 19h à 21h30, après le travail, pas de complication
=== old
Mardi à 19h au 86 rue des Romains, Strassen. Aucun équipement requis
=== new
Mardi à 19h au CNAM, 297 rue de Reckenthal, Strassen. Aucun équipement requis
```

- [ ] **Step 2 : appliquer** : `node replace.js club-bras-de-fer-debutant-luxembourg.html debutant.edits`

---

### Task 7 : `armwrestling-luxemburg.html` (allemand)

- [ ] **Step 1 : `<scratchpad>/de.edits`**

```
=== old
"streetAddress":"86 rue des Romains","postalCode":"L-8041"
=== new
"streetAddress":"Centre National des Arts Martiaux, 297 rue de Reckenthal","postalCode":"L-2410"
=== old
"geo":{"@type":"GeoCoordinates","latitude":49.61850,"longitude":6.06274}
=== new
"geo":{"@type":"GeoCoordinates","latitude":49.62153,"longitude":6.08436}
=== old
Das Training findet jeden Dienstag ab 19 Uhr in Strassen statt, 86 rue des Romains.
=== new
Das Training findet jeden Dienstag von 19 bis 21:30 Uhr in Strassen statt, im Centre National des Arts Martiaux (CNAM), 297 rue de Reckenthal.
=== old
query=86+rue+des+Romains+Strassen+Luxembourg
=== new
query=297+rue+de+Reckenthal+Strassen+Luxembourg
=== old
        <div class="tip-stat-desc">86 rue des Romains, Strassen. Offizielle WAF-Wettkampftische
=== new
        <div class="tip-stat-desc">CNAM, 297 rue de Reckenthal, Strassen. Offizielle WAF-Wettkampftische
=== old
Er befindet sich an der <strong>86 rue des Romains in Strassen</strong>
=== new
Er trainiert im <strong>Centre National des Arts Martiaux (CNAM), 297 rue de Reckenthal in Strassen</strong>
=== old
jeden <strong>Dienstag ab 19 Uhr</strong> statt
=== new
jeden <strong>Dienstag von 19 bis 21:30 Uhr</strong> statt
=== old
        <li class="rl-hub"><span class="rl-name">Strassen</span><span class="rl-time">Ziel · 86 rue des Romains</span></li>
=== new
        <li class="rl-hub"><span class="rl-name">Strassen</span><span class="rl-time">Ziel · CNAM, 297 rue de Reckenthal</span></li>
=== old
      <figcaption class="route-map-cap">Ungefähre Auto-Fahrzeiten nach Strassen · 86 rue des Romains, L-8041</figcaption>
=== new
      <figcaption class="route-map-cap">Ungefähre Auto-Fahrzeiten zum CNAM Strassen · 297 rue de Reckenthal, L-2410</figcaption>
=== old
        <div class="access-cell-val"><strong>~8 Minuten</strong> mit dem Auto vom Stadtzentrum. Parkplatz vor dem Gebäude und in der Straße verfügbar.</div>
=== new
        <div class="access-cell-val"><strong>~8 Minuten</strong> mit dem Auto vom Stadtzentrum über die Route d'Arlon. Großer, kostenloser Parkplatz direkt vor der Halle. Mit dem Bus: Linie 16 oder 11 ab Hamilius bis „Strassen, Hondseck“, dann 10 Min. zu Fuß.</div>
=== old
        <div class="access-cell-val"><strong>86 rue des Romains</strong><br>L-8041 Strassen, Luxemburg</div>
=== new
        <div class="access-cell-val"><strong>Centre National des Arts Martiaux (CNAM)</strong><br>297 rue de Reckenthal, L-2410 Strassen</div>
=== old
        <div class="access-cell-val">Weißes Gebäude, leicht erkennbar. Klingeln Sie an der Eingangstür neben dem Garagentor.</div>
=== new
        <div class="access-cell-val">Hauptgebäude, 2. Stock, Saal rechts. Im Zweifel hilft die Rezeption (Conciergerie) im Erdgeschoss weiter.</div>
=== old
Dienstags um 19 Uhr an der 86 rue des Romains in Strassen.
=== new
Dienstags um 19 Uhr im CNAM, 297 rue de Reckenthal in Strassen.
=== old
        <p>86 rue des Romains, Strassen — 8 Min. von Luxemburg-Stadt, 45 Min. von Trier.</p>
=== new
        <p>CNAM, 297 rue de Reckenthal, Strassen — 8 Min. von Luxemburg-Stadt, 45 Min. von Trier.</p>
```

- [ ] **Step 2 : appliquer** : `node replace.js armwrestling-luxemburg.html de.edits`

---

### Task 8 : `sport-de-force-luxembourg-comparatif.html` + carte dans `articles.html`

- [ ] **Step 1 : `<scratchpad>/comparatif.edits`**

```
=== old
l'Armwrestling Club Strassen (mardi 19h, 86 rue des Romains, Strassen)
=== new
l'Armwrestling Club Strassen (mardi 19h à 21h30, CNAM, 297 rue de Reckenthal, Strassen)
=== old
Mardi 19h · 86 rue des Romains, Strassen · Débutants bienvenus
=== new
Mardi 19h · CNAM, 297 rue de Reckenthal, Strassen · Débutants bienvenus
```

- [ ] **Step 2 : `<scratchpad>/articles.edits`** (carte en tête de grille, lien entrant n° 1 ; ancre d'une seule ligne)

```
=== old
      <a href="bras-de-fer-luxembourg-ville.html" class="art-card">
=== new
      <a href="club-demenage-cnam-strassen.html" class="art-card">
        <div class="art-card-tag">Nouveau · Le club</div>
        <div class="art-card-title">Le club s'installe au CNAM Strassen</div>
        <div class="art-card-desc">Nouvelle salle nationale, 60 places, mardi 19h–21h30 dès le 29 septembre 2026. Adresse, parking, bus.</div>
        <div class="art-card-cta">Lire l'annonce</div>
      </a>
      <a href="bras-de-fer-luxembourg-ville.html" class="art-card">
```

- [ ] **Step 3 : appliquer** les deux fichiers.

---

### Task 9 : nouvelle page `club-demenage-cnam-strassen.html`

**Files:** Create: `club-demenage-cnam-strassen.html` (modèle : `competition-bras-de-fer-luxembourg.html`, même `<head>`, nav, pied de page, bouton WhatsApp, GoatCounter).

- [ ] **Step 1 : lire le modèle** (`competition-bras-de-fer-luxembourg.html`) pour reprendre exactement : le `<head>` (polices, `style.css`, `blog.css`), la nav, la structure `local-hero`/`article-*`, l'accordéon FAQ, la grille `blog-grid-v2` (exactement 3 cartes), le pied de page, le bouton WhatsApp flottant, le script GoatCounter.

- [ ] **Step 2 : head**

```html
<title>Le club déménage au CNAM Strassen | Bras de fer Luxembourg</title>
<meta name="description" content="Dès le 29 septembre 2026, le club s'entraîne au Centre National des Arts Martiaux de Strassen, mardi 19h-21h30. 60 places, parking gratuit, accès en bus."/>
<meta name="robots" content="index, follow"/>
<link rel="canonical" href="https://armwrestlingclubstrassen.com/club-demenage-cnam-strassen.html"/>
<meta property="og:title" content="Le club déménage au CNAM Strassen | Bras de fer Luxembourg"/>
<meta property="og:description" content="Dès le 29 septembre 2026, le club s'entraîne au Centre National des Arts Martiaux de Strassen, mardi 19h-21h30. 60 places, parking gratuit, accès en bus."/>
<meta property="og:image" content="https://armwrestlingclubstrassen.com/entrainement-table-officielle-laf.webp"/>
<meta property="og:url" content="https://armwrestlingclubstrassen.com/club-demenage-cnam-strassen.html"/>
```

JSON-LD (un seul bloc `@graph`) :

```json
{"@context":"https://schema.org","@graph":[
 {"@type":"Article","headline":"Le club s'installe au Centre National des Arts Martiaux","description":"Dès le 29 septembre 2026, l'Armwrestling Club Strassen s'entraîne au CNAM, 297 rue de Reckenthal, le mardi de 19h à 21h30.","datePublished":"2026-09-24","dateModified":"2026-09-24","author":{"@type":"Organization","name":"Armwrestling Club Strassen"},"publisher":{"@type":"Organization","name":"Armwrestling Club Strassen","logo":{"@type":"ImageObject","url":"https://armwrestlingclubstrassen.com/logo.webp"}},"image":"https://armwrestlingclubstrassen.com/entrainement-table-officielle-laf.webp","mainEntityOfPage":"https://armwrestlingclubstrassen.com/club-demenage-cnam-strassen.html","inLanguage":"fr-LU"},
 {"@type":"BreadcrumbList","itemListElement":[{"@type":"ListItem","position":1,"name":"Accueil","item":"https://armwrestlingclubstrassen.com/"},{"@type":"ListItem","position":2,"name":"Articles","item":"https://armwrestlingclubstrassen.com/articles.html"},{"@type":"ListItem","position":3,"name":"Le club déménage au CNAM Strassen","item":"https://armwrestlingclubstrassen.com/club-demenage-cnam-strassen.html"}]},
 {"@type":"FAQPage","mainEntity":[
  {"@type":"Question","name":"Où se trouve exactement la nouvelle salle ?","acceptedAnswer":{"@type":"Answer","text":"Au Centre National des Arts Martiaux (CNAM), 297 rue de Reckenthal, L-2410 Strassen. Bâtiment principal, 2e étage, salle à droite. En cas de doute, la conciergerie au rez-de-chaussée vous oriente."}},
  {"@type":"Question","name":"À quelle heure a lieu l'entraînement ?","acceptedAnswer":{"@type":"Answer","text":"Le mardi de 19h à 21h30, à partir du 29 septembre 2026. La première séance est gratuite et sans inscription."}},
  {"@type":"Question","name":"Comment venir en bus ?","acceptedAnswer":{"@type":"Answer","text":"Bus 16 ou 11 depuis Hamilius jusqu'à l'arrêt Strassen, Hondseck, puis 10 minutes à pied. Ou bus 19 depuis la Gare centrale jusqu'à l'arrêt Strassen, Schafsstrachen, puis 5 minutes à pied. Les transports publics sont gratuits au Luxembourg."}},
  {"@type":"Question","name":"Le parking est-il gratuit ?","acceptedAnswer":{"@type":"Answer","text":"Oui. Le parking du hall est très grand, gratuit et ouvert en permanence."}}
 ]}
]}
```

- [ ] **Step 3 : corps** (un seul `<h1>`, `<h2>` réels, FAQ affichée = FAQ JSON-LD)

```
[hero]  tag : Le club · Nouvelle salle    date : 24 septembre 2026
H1 : Le club s'installe au Centre National des Arts Martiaux
chapeau : À partir du mardi 29 septembre 2026, l'Armwrestling Club Strassen quitte le garage de la rue des Romains pour une salle du Hall national des arts martiaux, à Strassen. Nouvel horaire : le mardi de 19h à 21h30.

H2 : De 15 à 60 places
Jusqu'ici, le club s'entraînait dans un garage : 15 personnes au maximum, et des soirs où il fallait attendre son tour à la table. La nouvelle salle accueille 60 personnes. Cinq tables de compétition sont installées pour commencer, d'autres suivront. Concrètement : plus de temps de table pour chacun, plus de partenaires de sparring, et la possibilité d'accueillir tous les débutants qui veulent essayer, sans liste d'attente.

H2 : Une salle dans un centre national
Le Hall national des arts martiaux a été inauguré en 2017. Il abrite les clubs de judo et de karaté de Strassen, une tribune de 300 places, des vestiaires et une cafétéria. Notre salle est au 2ᵉ étage du bâtiment principal, à droite en arrivant. Si vous hésitez, la conciergerie au rez-de-chaussée vous indique le chemin.

H2 : Comment venir
[4 blocs — reprendre la grille access-grid de bras-de-fer-luxembourg-ville.html, copier ses règles CSS dans le <style> de la page]
En voiture — 8 min depuis Luxembourg-ville par la route d'Arlon. Parking gigantesque, gratuit, ouvert en permanence devant le hall.
En bus — Bus 16 ou 11 depuis Hamilius, arrêt Strassen, Hondseck, puis 10 min à pied (jusqu'à 23h30). Bus 19 depuis la Gare centrale, arrêt Strassen, Schafsstrachen, puis 5 min à pied (aller uniquement, dernier bus 19h27). Transports gratuits.
À vélo — 17 min depuis le centre, 11 min depuis Belair, 14 min depuis Bertrange, par la route d'Arlon.
Adresse — Centre National des Arts Martiaux (CNAM), 297 rue de Reckenthal, L-2410 Strassen. [bouton Google Maps : https://www.google.com/maps/search/?api=1&query=297+rue+de+Reckenthal+Strassen+Luxembourg]

H2 : Ce qui ne change pas
- La première séance est gratuite, sans inscription. Venez en tenue de sport.
- Les débutants sont les bienvenus : on commence par la sécurité et les bases techniques.
- Le Grizzly of Luxembourg à Munsbach reste ouvert le vendredi à 18h avec la même licence LAF.
- Le contact : Nils Davoine, +352 661 495 319, WhatsApp.

H2 : Questions fréquentes  [accordéon, les 4 questions du JSON-LD]

[cta-box] Essai gratuit — mardi 19h au CNAM   → index.html#contact

[blog-grid-v2, 3 cartes] entrainement-bras-de-fer-strassen.html · bras-de-fer-luxembourg-ville.html · club-bras-de-fer-debutant-luxembourg.html
```

- [ ] **Step 4 : bouton WhatsApp flottant** avec le texte pré-rempli déjà passé à 19h, puis le script GoatCounter identique aux autres pages.

- [ ] **Step 5 : vérifier** : `node check.js` → title 58 car., description 150 car., 1 h1, JSON-LD valide, ≥ 3 liens entrants (articles, index, m/index, entrainement-strassen, ville).

---

### Task 10 : sitemap, CLAUDE.md, rangement

- [ ] **Step 1 : sitemap** — ajouter avant `</urlset>` :

```xml
  <url>
    <loc>https://armwrestlingclubstrassen.com/club-demenage-cnam-strassen.html</loc>
    <lastmod>2026-09-24</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
```

et passer `lastmod` à `2026-09-24` pour toutes les pages modifiées (script node : pour chaque `<loc>` de la liste des fichiers touchés, remplacer le `<lastmod>` qui suit). Vérifier avec `grep -c "2026-09-24" sitemap.xml`.

- [ ] **Step 2 : CLAUDE.md** — ligne « Sites d'entraînement » → `Strassen, Centre National des Arts Martiaux (CNAM), 297 rue de Reckenthal, L-2410 (mardi 19h–21h30, depuis le 29/09/2026 ; 60 places, 5 tables) et Munsbach (vendredi 18h)` ; « 23 URLs indexables » → « 24 URLs indexables ».

- [ ] **Step 3 : archiver** : `git mv garage_strassen_training.JPG _archive/ && git mv training_strassen.JPG _archive/` (fichiers non référencés, vérifié par grep).

---

### Task 11 : vérification finale

- [ ] **Step 1** : `node "$S/check.js"` → `TOUT EST OK`.
- [ ] **Step 2** : `grep -rn -i "romains\|garage" *.html m/*.html` → uniquement l'article d'annonce (qui raconte le déménagement) ; aucune autre page.
- [ ] **Step 3** : `git status --short` et `git diff --stat` ; relire le diff de `m/index.html` et `index.html`.
- [ ] **Step 4** : proposer à Nils le commit `Déménagement CNAM — nouvelle adresse, mardi 19h-21h30, article d'annonce` ; ne pas pousser sans son accord (le push déploie).
