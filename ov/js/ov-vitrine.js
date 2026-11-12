// Open Vendetta : la vitrine (liste, filtres, fiches, proposition de match depuis son propre profil), branchée sur Firestore.
import { notifier } from './ov-notify.js';
import { dansTranche, slug, norm, ageDe } from './ov-data.js';
import { ligneAthlete, esc } from './ov-vue.js?v=4';

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
  g.innerHTML = '<div class="roster-head"><h3 id="ville-' + esc(v.id) + '">' + esc(v.nom) + '</h3><p data-group-count></p></div><ul class="roster-list" id="liste-' + esc(v.id) + '">'
    + siens.map((p) => ligneAthlete(p, v.nom, clubNom(p.clubId))).join('') + '</ul>'
    + '<button class="roster-more" type="button" data-more aria-expanded="false" aria-controls="liste-' + esc(v.id) + '" hidden></button>';
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
const tagsBox = roster.querySelector('[data-roster-tags]');
const filterToggle = roster.querySelector('.roster-toggle');
const filters = roster.querySelector('.filters');
const selects = [...roster.querySelectorAll('.filters select')];
const plural = (n, one, many) => n + ' ' + (n > 1 ? many : one);
// Chaque ville montre ses 3 premiers profils ; le bouton « Voir les autres » déplie la suite.
const LIMITE = 3;
const deplies = new Set(); // villes dépliées par le visiteur
const CHEV_BAS = '<svg viewBox="0 0 12 12" aria-hidden="true"><path d="M2.5 4.5 6 8l3.5-3.5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const CROIX = '<svg viewBox="0 0 14 14" aria-hidden="true"><path d="M3 3l8 8M11 3l-8 8" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>';
const ICONE_FILTRE = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M2.5 4h11M4.5 8h7M6.5 12h3" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>';
// la mini-photo d'un profil caché, sur le bouton « Voir les autres »
const miniDe = (li) => {
  const img = li.querySelector('.athlete-thumb img');
  return '<span class="more-vig">' + (img ? '<img src="' + esc(img.getAttribute('src')) + '" width="26" height="33" alt="" decoding="async">'
    : esc((li.querySelector('.athlete-thumb .initiale') || {}).textContent || '')) + '</span>';
};
// le texte d'une étiquette de filtre actif
const ETIQUETTE = {
  ville: (o) => o.text,
  bras: (o) => 'Bras ' + o.text.toLowerCase(),
  poids: (o) => o.text,
  club: (o) => o.text,
};

function apply() {
  const ville = pick('ville'), bras = pick('bras'), poids = pick('poids'), club = pick('club'), ordre = pick('tri');
  let total = 0;
  for (const group of groups) {
    const list = group.querySelector('.roster-list');
    const items = [...list.children].sort((a, b) => (ordre === 'asc' ? a.dataset.poids - b.dataset.poids : b.dataset.poids - a.dataset.poids)
      || a.dataset.nom.localeCompare(b.dataset.nom, 'fr'));
    items.forEach((li) => list.appendChild(li));
    const deplie = deplies.has(group.dataset.ville);
    let shown = 0;
    const auDela = []; // les profils retenus au-delà des 3 premiers
    for (const li of items) {
      const ok = (ville === 'toutes' || li.dataset.ville === ville)
        && (bras === 'tous' || li.dataset.bras === bras || li.dataset.bras === 'Les deux')
        && dansTranche(Number(li.dataset.poids), poids)
        && (club === 'tous' || li.dataset.club === club);
      if (ok && shown >= LIMITE) auDela.push(li);
      // au-delà des 3 premiers, caché tant que la ville n'est pas dépliée (sauf une fiche ouverte)
      li.hidden = !ok || (shown >= LIMITE && !deplie && !li.classList.contains('is-open'));
      if (ok) shown++;
    }
    group.hidden = shown === 0;
    group.querySelector('[data-group-count]').textContent = plural(shown, 'profil', 'profils');
    // en bas du bloc de la ville : les mini-photos des profils cachés ; le bouton déroule (ou remonte) la suite
    const more = group.querySelector('[data-more]');
    const reste = shown - LIMITE;
    more.hidden = reste <= 0;
    group.classList.toggle('has-more', reste > 0);
    group.classList.toggle('is-deplie', deplie && reste > 0);
    more.setAttribute('aria-expanded', String(deplie));
    more.innerHTML = deplie
      ? '<span class="more-txt">Réduire</span>' + CHEV_BAS
      : '<span class="more-vigs" aria-hidden="true">' + auDela.slice(0, 4).map(miniDe).join('') + '</span><span class="more-txt">'
        + (reste === 1 ? 'Voir l’autre profil' : 'Voir les ' + reste + ' autres profils') + ' à ' + esc(group.dataset.ville) + '</span>' + CHEV_BAS;
    total += shown;
  }
  const narrowed = ville !== 'toutes' || bras !== 'tous' || poids !== 'tous' || club !== 'tous';
  // le compteur en grand : « 4 profils sur 12 » quand un filtre en retire
  status.innerHTML = !data.profils.length ? 'Aucun profil publié' : total === 0 ? 'Aucun profil affiché'
    : '<b>' + total + '</b> ' + (total > 1 ? 'profils' : 'profil') + (total < data.profils.length ? ' sur ' + data.profils.length : '');
  empty.hidden = total !== 0;
  // les filtres actifs, chacun en étiquette avec sa croix ; leur nombre sur le bouton « Filtrer »
  const actifs = selects.filter((s) => s.name !== 'tri' && s.selectedIndex > 0);
  tagsBox.querySelectorAll('[data-filtre]').forEach((t) => t.remove());
  reset.before(...actifs.map((s) => {
    const b = document.createElement('button');
    const t = ETIQUETTE[s.name](s.options[s.selectedIndex]);
    b.type = 'button'; b.className = 'filtre-tag'; b.dataset.filtre = s.name;
    b.setAttribute('aria-label', 'Retirer le filtre : ' + t);
    b.innerHTML = '<span>' + esc(t) + '</span>' + CROIX;
    return b;
  }));
  tagsBox.hidden = !narrowed;
  reset.hidden = actifs.length < 2;
  filterToggle.innerHTML = ICONE_FILTRE + '<span>Filtrer</span>'
    + (actifs.length ? '<em class="filtre-nb" aria-hidden="true">' + actifs.length + '</em><span class="ov-sr"> (' + plural(actifs.length, 'filtre actif', 'filtres actifs') + ')</span>' : '');
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
// « Tout retirer » : la liste complète revient ; le focus repart sur « Filtrer » (le bouton, lui, disparaît)
reset.addEventListener('click', () => { selects.forEach((s) => { if (s.name !== 'tri') s.selectedIndex = 0; }); apply(); filterToggle.focus(); });

filterToggle.addEventListener('click', () => {
  const open = filterToggle.getAttribute('aria-expanded') !== 'true';
  filterToggle.setAttribute('aria-expanded', String(open));
  filters.classList.toggle('is-open', open);
});

roster.addEventListener('click', (e) => {
  // la croix d'une étiquette retire ce filtre-là ; le focus passe à l'étiquette suivante, ou à « Filtrer »
  const tag = e.target.closest('[data-filtre]');
  if (tag) {
    const s = roster.querySelector('select[name="' + tag.dataset.filtre + '"]');
    s.selectedIndex = 0; apply();
    (tagsBox.hidden ? filterToggle : tagsBox.querySelector('[data-filtre]') || filterToggle).focus();
    return;
  }
  const more = e.target.closest('[data-more]');
  if (more) {
    const group = more.closest('.roster-group');
    const ouvrir = !deplies.has(group.dataset.ville);
    if (ouvrir) deplies.add(group.dataset.ville); else deplies.delete(group.dataset.ville);
    const caches = ouvrir ? [...group.querySelectorAll('.athlete[hidden]')] : [];
    apply();
    // les profils qui apparaissent descendent l'un après l'autre, comme un volet qui se déroule
    caches.filter((li) => !li.hidden).forEach((li, i) => {
      li.classList.remove('is-revele'); void li.offsetWidth;
      li.style.animationDelay = Math.min(i, 8) * 40 + 'ms'; li.classList.add('is-revele');
    });
    // replié : on remonte au nom de la ville, sinon le visiteur se retrouve plus bas, dans la ville suivante
    if (!ouvrir) group.querySelector('h3').scrollIntoView({ block: 'start' });
    return;
  }
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

// "Proposer un match à X": the form opens under the athlete's figures, his photograph still beside it.
// Le visiteur ne retape pas son profil : il retrouve sa fiche publiée par son nom et la choisit.
// Son contact est déjà chez l'organisateur (contacts/{son profil}) : la proposition ne porte que les deux profils.
const tpl = document.getElementById('tpl-propose');
const parId = new Map(data.profils.map((p) => [p.id, p]));
// Le profil choisi est retenu dans ce navigateur pour la fois suivante. Sans stockage (navigation privée,
// données bloquées), tout marche pareil : le visiteur retape seulement son nom.
const CLE_MOI = 'ov-mon-profil';
const lireMoi = () => { try { return localStorage.getItem(CLE_MOI); } catch (e) { return null; } };
const ecrireMoi = (id) => { try { if (id) localStorage.setItem(CLE_MOI, id); else localStorage.removeItem(CLE_MOI); } catch (e) { /* rien à retenir */ } };
// La base exige l'accord d'un parent tant que l'âge écrit dans le profil n'est pas d'au moins 18 ans ;
// l'âge affiché (calculé depuis la date de naissance) compte aussi.
const mineur = (p) => !(typeof p.age === 'number' && p.age >= 18) || ageDe(p) < 18;
const nomComplet = (p) => p.prenom + (p.nom ? ' ' + p.nom : '');
const insecable = String.fromCharCode(160); // « 88 kg » ne se coupe pas en fin de ligne
const infosMoi = (p) => [clubNom(p.clubId), villeNom(p.villeId), String(p.poids).replace('.', ',') + insecable + 'kg'].filter(Boolean).join(' · ');
function carteMoi(p) {
  const vignette = p.mini ? '<img src="' + esc(p.mini) + '" width="44" height="55" alt="" decoding="async">' : esc(String(p.prenom || '').charAt(0));
  return '<span class="moi-vignette" aria-hidden="true">' + vignette + '</span><span class="moi-texte"><span class="moi-nom" translate="no">'
    + esc(nomComplet(p)) + '</span><span class="moi-infos">' + esc(infosMoi(p)) + '</span></span>';
}
// Prénom et nom chacun à sa place, ou tapés ensemble dans un seul champ (la vitrine n'a plus que celui-là, nom = ''),
// dans un ordre ou l'autre ; accents et majuscules ignorés. null : pas encore assez de lettres pour chercher.
// L'athlète visé n'est jamais proposé.
function trouverProfils(prenom, nom, exclu) {
  const tp = norm(prenom), tn = norm(nom), q = tp + tn;
  if (q.length < 2) return null;
  return data.profils.filter((p) => {
    if (p.id === exclu) return false;
    const pp = norm(p.prenom), pn = norm(p.nom);
    return (pp.includes(tp) && pn.includes(tn)) || (pp + pn).includes(q) || (pn + pp).includes(q) || (tp !== '' && !pn && pp.includes(tp));
  }).sort((a, b) => nomComplet(a).localeCompare(nomComplet(b), 'fr'));
}
const MAX_TROUVES = 6;
const majMoiDe = new WeakMap(); // la boîte d'une fiche → remet à jour « votre profil » à chaque ouverture

function openPropose(btn) {
  const box = document.getElementById(btn.getAttribute('aria-controls'));
  const athlete = btn.closest('.athlete').querySelector('.athlete-toggle').textContent.trim();
  const cible = btn.dataset.profil;
  if (!box.firstElementChild) {
    box.innerHTML = tpl.innerHTML.split('__ID__').join(esc(box.id)).split('__PRENOM__').join(esc(btn.dataset.prenom));
    const form = box.querySelector('form');
    const li = btn.closest('.athlete');
    form.querySelector('[data-recap]').textContent = athlete + ' · ' + li.dataset.poids + ' kg · ' + (li.dataset.bras === 'Les deux' ? 'les deux bras' : 'bras ' + li.dataset.bras.toLowerCase());
    OVForms.watch(form);
    const f = form.elements;
    const recherche = form.querySelector('[data-moi-recherche]');
    const choisi = form.querySelector('[data-moi-choisi]');
    const liste = form.querySelector('[data-moi-liste]');
    const aide = form.querySelector('[data-moi-aide]');
    // La case du parent n'apparaît que pour un profil mineur ; masquée, elle n'est pas contrôlée.
    const parent = form.querySelector('[data-when="mineur"]');
    let moi = null; // le profil du visiteur
    const choisir = (p) => { moi = p || null; parent.hidden = !(moi && mineur(moi)); };
    // un seul champ « Votre nom » : les profils trouvés s'affichent juste dessous, on touche le sien
    const chercher = () => {
      const trouves = trouverProfils(f.qui.value, '', cible);
      if (!trouves || !trouves.length) {
        liste.replaceChildren();
        // le nom tapé est celui de l'athlète visé : on ne se propose pas un match à soi-même
        const lui = trouves && trouverProfils(f.qui.value, '', null).some((p) => p.id === cible);
        aide.textContent = !trouves ? 'Tapez votre nom : votre profil apparaît sous le champ.'
          : lui ? 'C’est la fiche que vous regardez : choisissez un autre athlète pour proposer un match.' : 'Aucun profil publié à ce nom.';
        return;
      }
      liste.innerHTML = trouves.slice(0, MAX_TROUVES).map((p) => '<li><button class="moi-choix" type="button" data-moi="' + esc(p.id) + '">'
        + carteMoi(p) + '</button></li>').join('');
      aide.textContent = trouves.length > MAX_TROUVES ? trouves.length + ' profils correspondent : précisez votre nom.'
        : trouves.length === 1 ? 'Est-ce vous ? Touchez votre profil.' : trouves.length + ' profils correspondent : touchez le vôtre.';
    };
    f.qui.addEventListener('input', chercher);
    const montrerChoisi = (p) => {
      form.querySelector('[data-moi-carte]').innerHTML = carteMoi(p);
      OVForms.setError(recherche, '');
      choisi.hidden = false; recherche.hidden = true; choisir(p);
    };
    // le profil touché reste dans le champ, avec une croix pour en changer
    liste.addEventListener('click', (e) => {
      const b = e.target.closest('[data-moi]');
      if (!b || !parId.has(b.dataset.moi)) return;
      montrerChoisi(parId.get(b.dataset.moi));
      f.message.focus();
    });
    const montrerRecherche = () => { choisi.hidden = true; recherche.hidden = false; choisir(null); chercher(); };
    // Le profil retenu par ce navigateur est déjà choisi ; sauf si c'est l'athlète visé, ou une fiche qui n'est plus publiée.
    const majMoi = () => {
      const id = lireMoi();
      if (id && !parId.has(id)) ecrireMoi(null);
      const p = id && id !== cible ? parId.get(id) : null;
      if (p) { if (choisi.hidden || !moi || moi.id !== p.id) montrerChoisi(p); }
      else if (!choisi.hidden) montrerRecherche();
    };
    majMoiDe.set(box, majMoi);
    form.querySelector('[data-moi-changer]').addEventListener('click', () => { ecrireMoi(null); montrerRecherche(); f.qui.focus(); });
    form.addEventListener('submit', async (ev) => {
      ev.preventDefault();
      const status = form.querySelector('.form__status');
      const bad = OVForms.validate(form);
      if (!bad.length && !moi) { montrerRecherche(); OVForms.setError(recherche, recherche.dataset.err); f.qui.focus(); bad.push(recherche); }
      if (bad.length) { status.textContent = bad.length === 1 ? 'Un champ est à corriger.' : bad.length + ' champs sont à corriger.'; return; }
      status.textContent = '';
      const c = { profilId: cible, adversaireId: moi.id, accord: f.accord.checked };
      if (f.message.value.trim()) c.message = f.message.value.trim();
      if (!parent.hidden && f.accord_parent.checked) c.accordParent = true;
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
      ecrireMoi(moi.id);
      notifier('Nouvelle demande de match');
      const done = document.createElement('div');
      done.className = 'propose__done'; done.setAttribute('role', 'status'); done.tabIndex = -1;
      const coche = document.createElement('span'); coche.className = 'ok-coche'; coche.setAttribute('aria-hidden', 'true');
      coche.innerHTML = '<svg viewBox="0 0 16 16"><path d="M3 8.5l3.2 3L13 4.5" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
      const title = document.createElement('p'); title.className = 'propose__done-title';
      title.textContent = 'Votre proposition à ' + athlete + ' est envoyée';
      const text = document.createElement('p');
      text.textContent = 'L’organisateur vous recontacte avec les coordonnées de votre fiche (' + nomComplet(moi) + ') pour fixer le lieu et la date.';
      const again = document.createElement('button');
      again.type = 'button'; again.className = 'ov-mini-btn';
      again.innerHTML = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M13 8a5 5 0 1 1-1.5-3.6M13 2.5v3h-3" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>Envoyer une autre proposition';
      again.addEventListener('click', () => { done.remove(); form.hidden = false; f.message.value = ''; majMoi(); (recherche.hidden ? f.message : f.qui).focus(); });
      done.append(coche, title, text, again);
      form.hidden = true; form.after(done); done.focus();
    });
    form.querySelector('[data-propose-cancel]').addEventListener('click', () => {
      box.hidden = true; btn.hidden = false; btn.setAttribute('aria-expanded', 'false'); btn.focus();
    });
  }
  majMoiDe.get(box)();
  box.hidden = false; btn.hidden = true; btn.setAttribute('aria-expanded', 'true');
  const form = box.querySelector('form');
  const first = !form.hidden ? (form.querySelector('[data-moi-recherche]').hidden ? form.elements.message : form.elements.qui) : box.querySelector('.propose__done');
  if (first) first.focus({ preventScroll: true });
}

const linked = start.get('profil');
const linkedToggle = linked && /^[A-Za-z0-9]{1,40}$/.test(linked) ? roster.querySelector('[aria-controls="fiche-' + linked + '"]') : null;
if (linkedToggle) {
  // un lien vers un profil au-delà des 3 premiers déplie sa ville
  if (linkedToggle.closest('.athlete').hidden) { deplies.add(linkedToggle.closest('.roster-group').dataset.ville); apply(); }
  linkedToggle.click();
  if (start.get('proposer') === '1') openPropose(linkedToggle.closest('.athlete').querySelector('[data-propose]'));
  linkedToggle.closest('.athlete').scrollIntoView({ block: 'start' });
}
