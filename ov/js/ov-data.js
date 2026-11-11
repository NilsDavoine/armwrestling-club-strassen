// Open Vendetta : la logique sans navigateur ni réseau. Testée par open-vendetta/tests/data.test.mjs.
export const BRAS = ['Droit', 'Gauche', 'Les deux'];

// Les valeurs sont celles du menu « Poids » de open-vendetta.html.
const TRANCHES = {
  tous: () => true,
  lt70: (kg) => kg < 70,
  '70-89': (kg) => kg >= 70 && kg < 90,
  '90': (kg) => kg >= 90,
};
export function dansTranche(kg, tranche) {
  const f = TRANCHES[tranche];
  return f ? f(Number(kg)) : true;
}

// f = { villeId: 'toutes' | id, bras: 'tous' | 'Droit' | 'Gauche', poids: tranche, clubId: 'tous' | id }
export function correspond(p, f) {
  return (f.villeId === 'toutes' || p.villeId === f.villeId)
    && (f.bras === 'tous' || p.bras === f.bras || p.bras === 'Les deux')
    && dansTranche(p.poids, f.poids)
    && (f.clubId === 'tous' || p.clubId === f.clubId);
}

export function trier(profils, ordre) {
  const s = ordre === 'asc' ? 1 : -1;
  return [...profils].sort((a, b) => s * (a.poids - b.poids) || String(a.nom).localeCompare(String(b.nom), 'fr'));
}

// Les villes dans l'ordre choisi par l'organisateur, chacune avec ses profils filtrés et triés ; une ville vide disparaît.
export function grouperParVille(profils, villes, f, ordre) {
  return [...villes].sort((a, b) => a.ordre - b.ordre)
    .map((v) => ({ ville: v, profils: trier(profils.filter((p) => p.villeId === v.id && correspond(p, f)), ordre) }))
    .filter((g) => g.profils.length > 0);
}

export function norm(t) {
  return String(t || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]/g, '');
}

export function slug(t) {
  return String(t || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'x';
}

function distance(a, b) {
  const d = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]);
  for (let j = 1; j <= b.length; j++) d[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    }
  }
  return d[a.length][b.length];
}

// Le club existant le plus proche du texte tapé, ou null si aucun n'est assez proche.
export function clubProche(saisi, clubs) {
  const t = norm(saisi);
  if (!t) return null;
  let meilleur = null, score = 0;
  for (const c of clubs) {
    const n = norm(c.nom);
    const s = 1 - distance(t, n) / Math.max(t.length, n.length);
    if (s > score) { meilleur = c; score = s; }
  }
  return score >= 0.75 ? meilleur : null;
}

export const brasTexte = (b) => (b === 'Les deux' ? 'les deux bras' : 'bras ' + String(b).toLowerCase());

// CSV tel que l'exporte Google Sheets : virgules, guillemets doublés, retours à la ligne dans un champ.
export function lireCsv(texte) {
  const t = String(texte).replace(/^﻿/, '');
  const lignes = [];
  let champ = '', ligne = [], entreGuillemets = false;
  const finLigne = () => { ligne.push(champ); champ = ''; if (ligne.some((v) => v !== '')) lignes.push(ligne); ligne = []; };
  for (let i = 0; i < t.length; i++) {
    const c = t[i];
    if (entreGuillemets) {
      if (c === '"' && t[i + 1] === '"') { champ += '"'; i++; }
      else if (c === '"') entreGuillemets = false;
      else champ += c;
    } else if (c === '"') entreGuillemets = true;
    else if (c === ',') { ligne.push(champ); champ = ''; }
    else if (c === '\r' && t[i + 1] === '\n') { finLigne(); i++; }
    else if (c === '\n' || c === '\r') finLigne();
    else champ += c;
  }
  if (champ !== '' || ligne.length) finLigne();
  return lignes;
}

const nombre = (v) => { const n = parseFloat(String(v || '').replace(',', '.')); return Number.isFinite(n) ? n : null; };

// La feuille « Vendetta 2026 » (colonnes : docs/VENDETTA.md). Une entrée par athlète ; TYPE vide = athlète (anciennes lignes).
export function athletesDeLaFeuille(texte) {
  const [entete = [], ...lignes] = lireCsv(texte);
  const col = (nom) => entete.findIndex((h) => h.trim().toUpperCase() === nom);
  const i = {
    prenom: col('NAME'), nom: col('SURNAME'), club: col('CLUB'), pays: col('COUNTRY'), poids: col('WEIGHT (KG)'),
    age: col('AGE (YEARS)'), pratique: col('EXPERIENCE'), taille: col('HEIGHT (CM)'), biceps: col('BICEPS (CM)'),
    bras: col('ARM'), palmares: col('PALMARES'), email: col('EMAIL'), tel: col('PHONE'), type: col('TYPE'),
  };
  const v = (l, k) => (i[k] >= 0 ? String(l[i[k]] ?? '').trim() : '');
  return lignes
    .filter((l) => ['', 'Athlète'].includes(v(l, 'type')) && v(l, 'prenom') && v(l, 'nom'))
    .map((l) => ({
      profil: {
        prenom: v(l, 'prenom'), nom: v(l, 'nom'), clubSaisi: v(l, 'club'), villeSaisie: v(l, 'pays'),
        poids: nombre(v(l, 'poids')), taille: nombre(v(l, 'taille')), biceps: nombre(v(l, 'biceps')),
        age: nombre(v(l, 'age')), pratique: nombre(v(l, 'pratique')),
        bras: BRAS.includes(v(l, 'bras')) ? v(l, 'bras') : null, palmares: v(l, 'palmares'),
      },
      contact: { email: v(l, 'email'), telephone: v(l, 'tel') },
    }));
}
