// Open Vendetta : accès public à Firestore (version légère, sans connexion Google). La gestion est dans ov-admin.js.
import { FIREBASE, FIREBASE_SDK } from './ov-config.js';

const base = 'https://www.gstatic.com/firebasejs/' + FIREBASE_SDK + '/';
const [{ initializeApp }, fs] = await Promise.all([
  import(base + 'firebase-app.js'), import(base + 'firebase-firestore-lite.js'),
]);
const app = initializeApp(FIREBASE);
const db = fs.getFirestore(app);
const col = (n) => fs.collection(db, n);
const ref = (n, id) => fs.doc(db, n, id);
const lire = (snap) => snap.docs.map((d) => ({ id: d.id, ...d.data() }));

// ---- Vitrine et inscription (visiteurs) ----
export async function chargerVitrine() {
  const [villes, clubs, profils] = await Promise.all([
    fs.getDocs(col('villes')), fs.getDocs(col('clubs')),
    fs.getDocs(fs.query(col('profils'), fs.where('statut', '==', 'publie'))),
  ]);
  return { villes: lire(villes), clubs: lire(clubs), profils: lire(profils) };
}
export async function chargerClubs() { return lire(await fs.getDocs(col('clubs'))); }
export async function chargerVilles() {
  return lire(await fs.getDocs(col('villes')));
}
export async function chargerPhoto(id) {
  const s = await fs.getDoc(ref('photos', id));
  return s.exists() ? s.data().image : null;
}
export async function envoyerCandidature(c) {
  await fs.addDoc(col('candidatures'), { ...c, etat: 'nouvelle', creeLe: fs.serverTimestamp() });
}
// Un seul lot : la règle refuse une photo ou un contact écrits sans leur profil neuf.
export async function envoyerProfil(profil, contact, photo) {
  const p = fs.doc(col('profils'));
  const b = fs.writeBatch(db);
  b.set(p, { ...profil, statut: 'en_attente', creeLe: fs.serverTimestamp() });
  b.set(ref('contacts', p.id), { ...contact, creeLe: fs.serverTimestamp() });
  b.set(ref('photos', p.id), { image: photo });
  await b.commit();
  return p.id;
}
