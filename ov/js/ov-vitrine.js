// Open Vendetta : la vitrine (liste, filtres, fiches, proposition de match), branchée sur Firestore.
import { notifier } from './ov-notify.js';
import { dansTranche, slug } from './ov-data.js';
import { ligneAthlete, esc } from './ov-vue.js';

const roster = document.getElementById('profils');
const anchor = roster.querySelector('[data-roster-empty]'); // les groupes de villes se placent juste avant
let data, fb;
try {
  fb = await import('./ov-firebase.js');
  data = await fb.chargerVitrine();
} catch (e) {
  roster.querySelector('[data-roster-status]').textContent = 'Les profils ne se chargent pas. Réessayez dans un moment.';
  throw e;
}
const villeNom = (id) => (data.villes.find((v) => v.id === id) || {}).nom || '';
const clubNom = (id) => (data.clubs.find((c) => c.id === id) || {}).nom || '';
for (const v of [...data.villes].sort((a, b) => a.ordre - b.ordre)) {
  const siens = data.profils.filter((p) => p.villeId === v.id);
  if (!siens.length) continue;
  const g = document.createElement('div');
  g.className = 'roster-group';
  g.dataset.ville = v.nom;
  g.id = slug(v.nom);
  g.innerHTML = '<div class="roster-head"><h3 id="ville-' + esc(v.id) + '">' + esc(v.nom) + '</h3><p data-group-count></p></div><ul class="roster-list">'
    + siens.map((p) => ligneAthlete(p, v.nom, clubNom(p.clubId))).join('') + '</ul>';
  anchor.before(g);
}
// Aucun profil publié : on le dit, au lieu de parler de filtres qui n'ont rien retiré.
if (!data.profils.length) {
  const [titre, texte] = anchor.querySelectorAll('p');
  titre.textContent = 'Aucun profil publié pour l’instant.';
  texte.textContent = 'Les profils apparaissent ici après validation par le club.';
}
if (location.hash) { const cible = document.getElementById(decodeURIComponent(location.hash.slice(1))); if (cible) cible.scrollIntoView(); }
// Les menus Ville et Club ne proposent que ce qui existe vraiment.
const remplir = (name, premier, noms) => {
  const s = roster.querySelector('select[name="' + name + '"]');
  s.innerHTML = premier + noms.map((n) => '<option value="' + esc(n) + '">' + esc(n) + '</option>').join('');
};
remplir('ville', '<option value="toutes">Toutes les villes</option>', [...new Set(data.profils.map((p) => villeNom(p.villeId)))].filter(Boolean));
const listeClubs = document.getElementById('ov-clubs');
if (listeClubs) listeClubs.replaceChildren(...[...new Set(data.clubs.map((c) => c.nom).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'fr')).map((n) => { const o = document.createElement('option'); o.value = n; return o; }));
remplir('club', '<option value="tous">Tous les clubs</option>', [...new Set(data.profils.map((p) => clubNom(p.clubId)))].filter(Boolean).sort());

document.documentElement.classList.add('ov-js');
const pick = (name) => roster.querySelector('[name="' + name + '"]').value;
const groups = [...roster.querySelectorAll('.roster-group')];
const status = roster.querySelector('[data-roster-status]');
const empty = roster.querySelector('[data-roster-empty]');
const reset = roster.querySelector('[data-roster-reset]');
const selects = [...roster.querySelectorAll('.filters select')];
const plural = (n, one, many) => n + ' ' + (n > 1 ? many : one);

function apply() {
  const ville = pick('ville'), bras = pick('bras'), poids = pick('poids'), club = pick('club'), ordre = pick('tri');
  let total = 0;
  for (const group of groups) {
    const list = group.querySelector('.roster-list');
    const items = [...list.children].sort((a, b) => (ordre === 'asc' ? a.dataset.poids - b.dataset.poids : b.dataset.poids - a.dataset.poids)
      || a.dataset.nom.localeCompare(b.dataset.nom, 'fr'));
    items.forEach((li) => list.appendChild(li));
    let shown = 0;
    for (const li of items) {
      const ok = (ville === 'toutes' || li.dataset.ville === ville)
        && (bras === 'tous' || li.dataset.bras === bras || li.dataset.bras === 'Les deux')
        && dansTranche(Number(li.dataset.poids), poids)
        && (club === 'tous' || li.dataset.club === club);
      li.hidden = !ok;
      if (ok) shown++;
    }
    group.hidden = shown === 0;
    group.querySelector('[data-group-count]').textContent = plural(shown, 'profil', 'profils');
    total += shown;
  }
  status.textContent = !data.profils.length ? 'Aucun profil publié' : total === 0 ? 'Aucun profil affiché' : plural(total, 'profil affiché', 'profils affichés');
  empty.hidden = total !== 0;
  const narrowed = ville !== 'toutes' || bras !== 'tous' || poids !== 'tous' || club !== 'tous';
  reset.hidden = !narrowed;
  // the chosen filters stay in the address, so a shared link opens on the same list
  const params = new URLSearchParams(location.search);
  for (const s of selects) { if (s.selectedIndex === 0) params.delete(s.name); else params.set(s.name, s.value); }
  const q = params.toString();
  history.replaceState(null, '', location.pathname + (q ? '?' + q : '') + location.hash);
}
const start = new URLSearchParams(location.search);
for (const s of selects) {
  const v = start.get(s.name);
  if (v !== null && [...s.options].some((o) => o.value === v)) s.value = v;
}
apply();
selects.forEach((s) => s.addEventListener('change', apply));
reset.addEventListener('click', () => { selects.forEach((s) => { s.selectedIndex = 0; }); apply(); selects[0].focus(); });

const filterToggle = roster.querySelector('.roster-toggle');
const filters = roster.querySelector('.filters');
filterToggle.addEventListener('click', () => {
  const open = filterToggle.getAttribute('aria-expanded') !== 'true';
  filterToggle.setAttribute('aria-expanded', String(open));
  filters.classList.toggle('is-open', open);
});

roster.addEventListener('click', (e) => {
  const toggle = e.target.closest('.athlete-toggle');
  if (toggle) {
    const li = toggle.closest('.athlete');
    const sheet = document.getElementById(toggle.getAttribute('aria-controls'));
    const open = toggle.getAttribute('aria-expanded') !== 'true';
    toggle.setAttribute('aria-expanded', String(open));
    sheet.hidden = !open;
    // la grande photo n'arrive qu'à la première ouverture ; l'initiale reste tant qu'elle n'est pas là
    const img = sheet.querySelector('img[data-photo]');
    if (open && img && !img.src) {
      fb.chargerPhoto(img.dataset.photo).then((src) => {
        if (!src) return;
        img.addEventListener('load', () => { img.hidden = false; }, { once: true });
        img.src = src;
      }).catch(() => {});
    }
    li.classList.toggle('is-open', open);
    // the open profile goes in the address too, so a link can open one athlete's sheet
    const params = new URLSearchParams(location.search);
    if (open) params.set('profil', sheet.id.replace('fiche-', ''));
    else if (params.get('profil') === sheet.id.replace('fiche-', '')) params.delete('profil');
    const q = params.toString();
    history.replaceState(null, '', location.pathname + (q ? '?' + q : '') + location.hash);
    return;
  }
  const propose = e.target.closest('[data-propose]');
  if (propose) openPropose(propose);
});

// "Proposer un match à X": the form opens under the athlete's figures, his photograph still beside it
const tpl = document.getElementById('tpl-propose');
function openPropose(btn) {
  const box = document.getElementById(btn.getAttribute('aria-controls'));
  const athlete = btn.closest('.athlete').querySelector('.athlete-toggle').textContent.trim();
  if (!box.firstElementChild) {
    box.innerHTML = tpl.innerHTML.split('__ID__').join(esc(box.id)).split('__PRENOM__').join(esc(btn.dataset.prenom));
    const form = box.querySelector('form');
    const li = btn.closest('.athlete');
    form.querySelector('[data-recap]').textContent = athlete + ' · ' + li.dataset.poids + ' kg · ' + (li.dataset.bras === 'Les deux' ? 'les deux bras' : 'bras ' + li.dataset.bras.toLowerCase());
    OVForms.watch(form);
    // La case du parent n'apparaît que de 14 à 17 ans ; masquée, elle n'est pas contrôlée.
    const parent = form.querySelector('[data-when="mineur"]');
    const ageSaisi = () => { const t = form.elements.age.value.trim(); const v = Number(t.replace(',', '.')); return t !== '' && Number.isFinite(v) ? v : null; };
    const suivreAge = () => { const a = ageSaisi(); parent.hidden = !(a !== null && a >= 14 && a < 18); };
    form.addEventListener('input', suivreAge);
    form.addEventListener('change', suivreAge);
    form.addEventListener('submit', async (ev) => {
      ev.preventDefault();
      const status = form.querySelector('.form__status');
      suivreAge();
      const bad = OVForms.validate(form);
      // La règle de la base veut au moins 6 caractères pour l'email.
      if (!bad.length && form.elements.email.value.trim().length < 6) { OVForms.setError(form.elements.email, form.elements.email.dataset.errFormat); form.elements.email.focus(); bad.push(form.elements.email); }
      if (bad.length) { status.textContent = bad.length === 1 ? 'Un champ est à corriger.' : bad.length + ' champs sont à corriger.'; return; }
      status.textContent = '';
      const f = form.elements;
      const n = (v) => Number(String(v).replace(',', '.'));
      const tel = f.telephone.value.trim();
      const c = {
        profilId: btn.dataset.profil,
        prenom: f.prenom.value.trim(), nom: f.nom.value.trim(), ville: f.ville.value.trim(),
        poids: n(f.poids.value), bras: f.bras.value, age: n(f.age.value), pratique: n(f.pratique.value),
        email: f.email.value.trim(), accord: f.accord.checked,
      };
      if (!parent.hidden && f.accord_parent.checked) c.accordParent = true;
      if (f.club.value.trim()) c.club = f.club.value.trim();
      if (tel) c.telephone = f.indicatif.value + ' ' + tel;
      if (f.instagram.value.trim()) c.instagram = f.instagram.value.trim().replace(/^@?/, '@');
      if (f.message.value.trim()) c.message = f.message.value.trim();
      const envoyer = form.querySelector('[type="submit"]');
      envoyer.disabled = true;
      try {
        await fb.envoyerCandidature(c);
      } catch (err) {
        envoyer.disabled = false;
        status.textContent = 'L’envoi n’a pas marché. Vérifiez votre connexion et réessayez.';
        return;
      }
      envoyer.disabled = false;
      notifier('Nouvelle demande de match');
      const done = document.createElement('div');
      done.className = 'propose__done'; done.setAttribute('role', 'status'); done.tabIndex = -1;
      const title = document.createElement('p'); title.className = 'propose__done-title';
      title.textContent = 'Votre proposition à ' + athlete + ' est envoyée';
      const text = document.createElement('p');
      text.textContent = 'L’organisateur vous écrit à ' + form.elements.email.value.trim() + ' pour fixer l’adversaire, le lieu et la date.';
      const again = document.createElement('button');
      again.type = 'button'; again.className = 'btn-outline'; again.textContent = 'Envoyer une autre proposition';
      again.addEventListener('click', () => { done.remove(); form.hidden = false; form.elements.prenom.focus(); });
      done.append(title, text, again);
      form.hidden = true; form.after(done); done.focus();
    });
    form.querySelector('[data-propose-cancel]').addEventListener('click', () => {
      box.hidden = true; btn.hidden = false; btn.setAttribute('aria-expanded', 'false'); btn.focus();
    });
  }
  box.hidden = false; btn.hidden = true; btn.setAttribute('aria-expanded', 'true');
  const first = box.querySelector('form:not([hidden]) input, .propose__done');
  if (first) first.focus({ preventScroll: true });
}

const linked = start.get('profil');
const linkedToggle = linked && /^[A-Za-z0-9]{1,40}$/.test(linked) ? roster.querySelector('[aria-controls="fiche-' + linked + '"]') : null;
if (linkedToggle) {
  linkedToggle.click();
  if (start.get('proposer') === '1') openPropose(linkedToggle.closest('.athlete').querySelector('[data-propose]'));
  linkedToggle.closest('.athlete').scrollIntoView({ block: 'start' });
}
