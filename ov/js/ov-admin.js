// Open Vendetta : module de gestion (Firestore complet + connexion Google). Autonome : ne pas le charger avec ov-firebase.js (deux initializeApp).
import { FIREBASE, FIREBASE_SDK } from './ov-config.js';

const base = 'https://www.gstatic.com/firebasejs/' + FIREBASE_SDK + '/';
const [{ initializeApp }, fs, au] = await Promise.all([
  import(base + 'firebase-app.js'), import(base + 'firebase-firestore.js'), import(base + 'firebase-auth.js'),
]);
const app = initializeApp(FIREBASE);
const db = fs.getFirestore(app);
const auth = au.getAuth(app);
const col = (n) => fs.collection(db, n);
const ref = (n, id) => fs.doc(db, n, id);
const lire = (snap) => snap.docs.map((d) => ({ id: d.id, ...d.data() }));

// ---- Gestion (Nils) ----
export async function chargerPhoto(id) {
  const s = await fs.getDoc(ref('photos', id));
  return s.exists() ? s.data().image : null;
}
export const connexion = () => au.signInWithPopup(auth, new au.GoogleAuthProvider());
export const deconnexion = () => au.signOut(auth);
export const surConnexion = (cb) => au.onAuthStateChanged(auth, cb);
// Échoue avec « permission-denied » pour tout autre compte que celui des règles.
export async function chargerTout() {
  const noms = ['villes', 'clubs', 'profils', 'contacts', 'candidatures'];
  const res = await Promise.all(noms.map((n) => fs.getDocs(col(n))));
  return Object.fromEntries(noms.map((n, i) => [n, lire(res[i])]));
}
export const majProfil = (id, champs) => fs.updateDoc(ref('profils', id), champs);
export const majContact = (id, champs) => fs.updateDoc(ref('contacts', id), champs);
export async function majPhoto(id, image, mini) {
  const b = fs.writeBatch(db);
  b.set(ref('photos', id), { image });
  b.update(ref('profils', id), { mini });
  await b.commit();
}
export async function supprimerProfil(id) {
  const b = fs.writeBatch(db);
  ['profils', 'photos', 'contacts'].forEach((n) => b.delete(ref(n, id)));
  await b.commit();
}
export const majCandidature = (id, etat) => fs.updateDoc(ref('candidatures', id), { etat });
export const supprimerCandidature = (id) => fs.deleteDoc(ref('candidatures', id));
// Valeur à passer à majContact pour retirer un champ (ex. un téléphone vidé).
export const champSupprime = () => fs.deleteField();
export const creerVille = async (nom, ordre) => (await fs.addDoc(col('villes'), { nom, ordre })).id;
export const renommerVille = (id, nom) => fs.updateDoc(ref('villes', id), { nom });
export async function ordonnerVilles(ids) {
  const b = fs.writeBatch(db);
  ids.forEach((id, i) => b.update(ref('villes', id), { ordre: i + 1 }));
  await b.commit();
}
export const creerClub = async (nom) => (await fs.addDoc(col('clubs'), { nom })).id;
export const renommerClub = (id, nom) => fs.updateDoc(ref('clubs', id), { nom });
export async function fusionnerClubs(deId, versId, profilIds) {
  const b = fs.writeBatch(db);
  profilIds.forEach((pid) => b.update(ref('profils', pid), { clubId: versId }));
  b.delete(ref('clubs', deId));
  await b.commit();
}
// entrees = athletesDeLaFeuille(csv) ; 2 écritures par athlète, lots de 100 (limite Firestore : 500).
export async function importer(entrees) {
  for (let i = 0; i < entrees.length; i += 100) {
    const b = fs.writeBatch(db);
    for (const e of entrees.slice(i, i + 100)) {
      const p = fs.doc(col('profils'));
      b.set(p, { ...e.profil, statut: 'en_attente', source: 'feuille-vendetta-2026', creeLe: fs.serverTimestamp() });
      b.set(ref('contacts', p.id), { ...e.contact, accordParent: false, publicOk: false, usageOk: false, creeLe: fs.serverTimestamp() });
    }
    await b.commit();
  }
}
