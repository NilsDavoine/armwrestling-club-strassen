// Open Vendetta : réduire une photo avant l'envoi. dimensions() est testée ; reduirePhoto() ne tourne que dans un navigateur.
export function dimensions(largeur, hauteur, max) {
  const r = Math.min(1, max / Math.max(largeur, hauteur));
  return { largeur: Math.max(1, Math.round(largeur * r)), hauteur: Math.max(1, Math.round(hauteur * r)) };
}

// Rend une image « data:image/webp;base64,… » (ou jpeg si le navigateur ne sait pas faire de webp, comme Safari)
// d'au plus `limite` caractères, en baissant la qualité si besoin. Rejette si même la plus basse qualité dépasse.
export async function reduirePhoto(fichier, max, limite) {
  const bmp = await createImageBitmap(fichier, { imageOrientation: 'from-image' });
  const c = document.createElement('canvas');
  try {
    const { largeur, hauteur } = dimensions(bmp.width, bmp.height, max);
    c.width = largeur; c.height = hauteur;
    c.getContext('2d').drawImage(bmp, 0, 0, largeur, hauteur);
  } finally { bmp.close(); }
  for (const q of [0.82, 0.72, 0.62, 0.5]) {
    let url = c.toDataURL('image/webp', q);
    if (!url.startsWith('data:image/webp')) url = c.toDataURL('image/jpeg', q);
    if (url.length <= limite) return url;
  }
  throw new Error('photo-trop-lourde');
}

// Tourne une image de `quarts` quarts de tour dans le sens horaire (1 = 90°, 2 = 180°, 3 = 270°). Rend un Blob PNG
// (sans perte, transparence gardée pour les photos détourées), à passer ensuite à reduirePhoto().
export async function tournerPhoto(source, quarts) {
  const bmp = await createImageBitmap(source);
  const c = document.createElement('canvas');
  try {
    const debout = quarts % 2 === 1;
    c.width = debout ? bmp.height : bmp.width; c.height = debout ? bmp.width : bmp.height;
    const g = c.getContext('2d');
    g.translate(c.width / 2, c.height / 2);
    g.rotate((quarts * Math.PI) / 2); // angle positif = sens horaire sur un canvas (l'axe y descend)
    g.drawImage(bmp, -bmp.width / 2, -bmp.height / 2);
  } finally { bmp.close(); }
  return new Promise((ok, ko) => c.toBlob((b) => (b ? ok(b) : ko(new Error('rotation-impossible'))), 'image/png'));
}

// Une photo déjà enregistrée (data URL) en Blob, pour la retravailler.
export function enBlob(dataUrl) {
  const [tete, b64] = String(dataUrl).split(',');
  const bin = atob(b64);
  const octets = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) octets[i] = bin.charCodeAt(i);
  return new Blob([octets], { type: tete.slice(5, tete.indexOf(';')) });
}

// Les deux tailles stockées : la vignette de la liste et la photo de la fiche (limites des règles Firestore).
export const MINI = { max: 160, limite: 12000 };
export const FICHE = { max: 960, limite: 300000 };
