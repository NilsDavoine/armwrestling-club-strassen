// Open Vendetta : le formulaire d'inscription, en bas de la vitrine (une étape à la fois depuis le 12/11/2026).
// La photo est recadrée (ov-crop.js) puis réduite dans le navigateur ; la fiche part dans Firestore, en attente
// de relecture par l'organisateur. Les données envoyées sont les mêmes qu'avec l'ancienne page d'inscription.
import { reduirePhoto, MINI, FICHE } from './ov-image.js?v=2';
import { recadreur } from './ov-crop.js';
import { notifier } from './ov-notify.js';
import { ageAu, dateIlYA } from './ov-data.js';

// ov-firebase.js attend le SDK sur le réseau : chargé à part, pour que le formulaire reste utilisable
// (validation, « Autre ville », recadrage) si ce chargement échoue.
const firebase = import('./ov-firebase.js');

const form = document.getElementById('inscription-form');
const done = document.querySelector('[data-insc-done]');
if (form) {
  const f = form.elements;
  const status = form.querySelector('[data-insc-status]');
  const submit = form.querySelector('[type="submit"]');
  const MSG_ENVOI = 'L’envoi n’a pas marché. Vérifiez votre connexion et réessayez.';
  let sending = false;

  const when = (name) => form.querySelector('[data-when="' + name + '"]');
  // l'âge tiré de la date de naissance ; null si la date est absente, impossible ou dans le futur
  const age = () => {
    const t = f.naissance.value.trim(), m = /^([0-9]{4})-([0-9]{2})-([0-9]{2})$/.exec(t);
    if (!m) return null;
    const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
    if (d.getMonth() !== Number(m[2]) - 1) return null;
    const a = ageAu(t);
    return a >= 0 ? a : null;
  };
  function follow() {
    const v = form.querySelector('input[name="ville"]:checked');
    when('autre-ville').hidden = !(v && v.value === 'autre');
    const a = age();
    when('mineur').hidden = !(a !== null && a >= 14 && a <= 17);
    when('trop-jeune').hidden = !(a !== null && a < 14);
    // les mesures du bras choisi, ou des deux ; rien tant que le bras n'est pas choisi
    const b = form.querySelector('input[name="bras"]:checked');
    form.querySelectorAll('[data-mesure]').forEach((box) => {
      const cache = !b || !(b.value === 'Les deux' || b.value === box.dataset.mesure);
      if (cache && !box.hidden) OVForms.setError(box.querySelector('input'), '');
      box.hidden = cache;
    });
  }
  // les bras dont on envoie les mesures : 'Droit', 'Gauche' ou les deux
  const cotes = () => ({ Droit: ['Droit'], Gauche: ['Gauche'], 'Les deux': ['Droit', 'Gauche'] }[f.bras.value] || []);
  form.addEventListener('input', follow);
  form.addEventListener('change', follow);
  OVForms.watch(form);

  // les villes viennent de la base (les clubs aussi : la liste « ov-clubs » est remplie par la vitrine)
  const choix = form.querySelector('input[name="ville"][value="autre"]').closest('label');
  const noteVilles = form.querySelector('[data-villes-note]');
  firebase.then((fb) => fb.chargerVilles()).then((villes) => {
    [...villes].sort((a, b) => (a.ordre ?? 0) - (b.ordre ?? 0)).forEach((v) => {
      const label = document.createElement('label'), radio = document.createElement('input');
      radio.type = 'radio'; radio.name = 'ville'; radio.value = v.id;
      label.append(radio, ' ' + v.nom);
      choix.before(label);
    });
  }).catch(() => {
    noteVilles.textContent = 'La liste des villes ne s’est pas chargée. Choisissez « Autre ville » et écrivez la vôtre.';
    noteVilles.hidden = false;
  });

  // ---- la photo : choisie, puis recadrée dans le cadre 4:5 ----
  const input = f.photo;
  const cropBox = form.querySelector('[data-crop]');
  const crop = recadreur(cropBox);
  const changer = form.querySelector('[data-photo-change]');
  const pick = form.querySelector('[data-photo-pick]');
  input.addEventListener('change', async () => {
    const file = input.files && input.files[0];
    if (!file) return;
    if (!/^image\//.test(file.type)) { OVForms.setError(input, 'Choisissez une image : une photo en JPEG, PNG ou WebP.'); input.value = ''; return; }
    try {
      await crop.charger(file);
    } catch (e) {
      OVForms.setError(input, 'Cette photo ne s’ouvre pas. Essayez une autre photo (JPEG ou PNG).');
      input.value = ''; return;
    }
    cropBox.hidden = false; pick.hidden = true; changer.hidden = false;
    OVForms.check(input);
    cropBox.querySelector('canvas').focus({ preventScroll: true });
  });
  changer.addEventListener('click', () => input.click());

  const nombreDeChamps = (n) => (n === 1 ? 'Un champ est à corriger.' : n + ' champs sont à corriger.');
  const n = (v) => Number(String(v).replace(',', '.'));

  // ---- une étape à la fois : Vous, Votre profil sportif, Photo et accords ----
  // Une étape cachée garde ses réponses. Elle est contrôlée quand on la quitte, et encore une fois avant l'envoi.
  const etapes = [...form.querySelectorAll('[data-etape]')];
  const prog = [...form.querySelectorAll('[data-insc-prog] li')];
  const retour = form.querySelector('[data-insc-retour]');
  const suite = form.querySelector('[data-insc-suite]');
  const derniere = etapes.length - 1;
  let etape = 0;
  function montrer(i, focus) {
    etape = i;
    etapes.forEach((g, k) => { g.hidden = k !== i; });
    prog.forEach((li, k) => {
      li.classList.toggle('on', k <= i);
      if (k === i) li.setAttribute('aria-current', 'step'); else li.removeAttribute('aria-current');
    });
    retour.hidden = i === 0; suite.hidden = i === derniere; submit.hidden = i !== derniere;
    if (focus) {
      status.textContent = '';
      form.scrollIntoView({ block: 'start' });
      const premier = etapes[i].querySelector('input, select, textarea');
      if (premier) premier.focus({ preventScroll: true });
    }
  }
  // l'étape à l'écran est-elle bien remplie ? Sinon, les messages s'affichent sous les champs.
  function etapeValide() {
    follow();
    const a = age();
    if (etapes[etape].contains(f.naissance) && a !== null && a < 14) { status.textContent = 'La vitrine accueille les athlètes à partir de 14 ans.'; f.naissance.focus(); return false; }
    const bad = OVForms.validate(etapes[etape]);
    // la règle de la base veut un email de 6 caractères au moins (a@b.c passerait le contrôle de format)
    const mail = f.email.value.trim();
    if (etapes[etape].contains(f.email) && !bad.includes(f.email) && mail.length > 0 && mail.length < 6) {
      OVForms.setError(f.email, 'Écrivez une adresse email d’au moins 6 caractères.');
      if (!bad.length) f.email.focus();
      bad.push(f.email);
    }
    if (bad.length) { status.textContent = nombreDeChamps(bad.length); return false; }
    status.textContent = '';
    return true;
  }
  suite.addEventListener('click', () => { if (etapeValide()) montrer(etape + 1, true); });
  retour.addEventListener('click', () => montrer(etape - 1, true));
  form.classList.add('insc-etapes');
  montrer(0, false);

  async function envoyer() {
    // l'une après l'autre : deux grandes photos décodées en même temps font tomber un téléphone
    let image, mini;
    try {
      const cadree = await crop.rendre();
      image = await reduirePhoto(cadree, FICHE.max, FICHE.limite);
      mini = await reduirePhoto(cadree, MINI.max, MINI.limite);
    } catch (e) {
      OVForms.setError(input, 'Cette photo ne passe pas. Essayez une autre photo (JPEG ou PNG).');
      return false;
    }
    const profil = {
      prenom: f.prenom.value.trim(), nom: f.nom.value.trim(), clubSaisi: f.club.value.trim(),
      poids: n(f.poids.value), taille: n(f.taille.value),
      naissance: f.naissance.value.trim(), age: ageAu(f.naissance.value.trim()), bras: f.bras.value, mini,
    };
    // facultatifs : biceps et avant-bras du ou des bras choisis, années de pratique ; un champ vide n'est pas envoyé.
    // biceps (vitrine, gestion, anciens profils) : celui du bras, le plus grand pour « Les deux », s'il y en a un.
    const rempli = (champ) => champ.value.trim() !== '';
    for (const c of cotes()) {
      const b = f['biceps_' + c.toLowerCase()], a = f['avant_bras_' + c.toLowerCase()];
      if (rempli(b)) profil['biceps' + c] = n(b.value);
      if (rempli(a)) profil['avantBras' + c] = n(a.value);
    }
    const biceps = cotes().map((c) => profil['biceps' + c]).filter((v) => v != null);
    if (biceps.length) profil.biceps = Math.max(...biceps);
    if (rempli(f.pratique)) { profil.pratique = n(f.pratique.value); profil.pratiqueDepuis = dateIlYA(Math.round(profil.pratique)); }
    if (f.ville.value === 'autre') profil.villeSaisie = f.autre_ville.value.trim(); else profil.villeId = f.ville.value;
    if (f.palmares.value.trim()) profil.palmares = f.palmares.value.trim();
    if (f.instagram.value.trim()) profil.instagram = f.instagram.value.trim().replace(/^@?/, '@');
    const contact = {
      email: f.email.value.trim(),
      accordParent: profil.age < 18 && !!(f.accord_parent && f.accord_parent.checked),
      publicOk: f.fiche_publique.checked, usageOk: f.usage.checked,
    };
    if (f.telephone.value.trim()) contact.telephone = f.indicatif.value + ' ' + f.telephone.value.trim();
    try {
      const fb = await firebase;
      await fb.envoyerProfil(profil, contact, image);
    } catch (e) {
      status.textContent = MSG_ENVOI;
      return false;
    }
    notifier('Nouveau profil à valider');
    return true;
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (sending) return;
    // la touche Entrée avant la dernière étape fait avancer, elle n'envoie rien
    if (etape < derniere) { if (etapeValide()) montrer(etape + 1, true); return; }
    // avant l'envoi, les trois étapes sont recontrôlées ; la première qui ne passe pas revient à l'écran
    for (let k = 0; k <= derniere; k++) {
      montrer(k, false);
      if (!etapeValide()) { form.scrollIntoView({ block: 'start' }); return; }
    }
    sending = true; submit.disabled = true; submit.firstChild.textContent = 'Envoi en cours… '; status.textContent = '';
    let ok = false;
    try { ok = await envoyer(); } catch (err) { status.textContent = MSG_ENVOI; }
    sending = false; submit.disabled = false; submit.firstChild.textContent = 'Envoyer ma fiche ';
    if (!ok) return;
    form.hidden = true; done.hidden = false; done.focus();
  });

  done.querySelector('[data-insc-restart]').addEventListener('click', () => {
    form.reset(); crop.vider(); cropBox.hidden = true; pick.hidden = false; changer.hidden = true;
    follow(); montrer(0, false); status.textContent = ''; form.hidden = false; done.hidden = true; f.prenom.focus();
  });
  follow();
}
