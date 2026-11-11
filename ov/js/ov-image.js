// Open Vendetta : réduire une photo avant l'envoi. dimensions() est testée ; reduirePhoto() ne tourne que dans un navigateur.
export function dimensions(largeur, hauteur, max) {
  const r = Math.min(1, max / Math.max(largeur, hauteur));
  return { largeur: Math.round(largeur * r), hauteur: Math.round(hauteur * r) };
}

// Rend une image « data:image/webp;base64,… » (ou jpeg si le navigateur ne sait pas faire de webp, comme Safari)
// d'au plus `limite` caractères, en baissant la qualité si besoin. Rejette si même la plus basse qualité dépasse.
export async function reduirePhoto(fichier, max, limite) {
  const bmp = await createImageBitmap(fichier, { imageOrientation: 'from-image' });
  const { largeur, hauteur } = dimensions(bmp.width, bmp.height, max);
  const c = document.createElement('canvas');
  c.width = largeur; c.height = hauteur;
  c.getContext('2d').drawImage(bmp, 0, 0, largeur, hauteur);
  bmp.close();
  for (const q of [0.82, 0.72, 0.62, 0.5]) {
    let url = c.toDataURL('image/webp', q);
    if (!url.startsWith('data:image/webp')) url = c.toDataURL('image/jpeg', q);
    if (url.length <= limite) return url;
  }
  throw new Error('photo-trop-lourde');
}

// Les deux tailles stockées : la vignette de la liste et la photo de la fiche (limites des règles Firestore).
export const MINI = { max: 240, limite: 40000 };
export const FICHE = { max: 960, limite: 300000 };
