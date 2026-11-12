// Open Vendetta : le HTML d'une rangée d'athlète de la vitrine (style du site du club, maquette m6 ;
// détails choisis le 12/11/2026 : rangée épurée, mesures en une ligne de chiffres, club en titre de la fiche).
// Tout texte venu de la base est échappé.
import { ageDe, pratiqueDe } from './ov-data.js';
const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
export { esc };

// la petite flèche rouge qui ouvre la fiche (elle pivote vers le bas, fiche ouverte)
const FLECHE = '<span class="athlete-chev" aria-hidden="true"><svg viewBox="0 0 12 12"><path d="M4.5 2.5 8 6l-3.5 3.5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg></span>';
const SEP = '<span class="sep" aria-hidden="true">·</span>';
const INSTA = '<svg viewBox="0 0 16 16" aria-hidden="true"><rect x="2.5" y="2.5" width="11" height="11" rx="3.2"/><circle cx="8" cy="8" r="2.6"/><circle cx="11.4" cy="4.6" r=".7" fill="currentColor" stroke="none"/></svg>';
const INSECABLE = String.fromCharCode(160); // « 41,5 cm » ne se coupe pas en fin de ligne

export function ligneAthlete(p, villeNom, clubNom) {
  const id = esc(p.id);
  // Le nom de famille est facultatif : « Lucas », pas « Lucas undefined ».
  const nom = esc(p.prenom + (p.nom ? ' ' + p.nom : ''));
  const brasBas = p.bras === 'Les deux' ? 'les deux bras' : 'bras ' + String(p.bras).toLowerCase();
  const brasHaut = brasBas.charAt(0).toUpperCase() + brasBas.slice(1);
  // Sans photo, l'initiale du prénom tient la place.
  const ini = '<span class="initiale" aria-hidden="true">' + esc(String(p.prenom || '').charAt(0)) + '</span>';
  const thumb = p.mini ? '<img src="' + esc(p.mini) + '" width="128" height="160" alt="" decoding="async">' : ini;
  // Un pseudo mal formé donnerait un lien cassé vers instagram.com : on ne l'affiche pas.
  const brut = String(p.instagram || '').replace(/^@/, '');
  const pseudo = /^[A-Za-z0-9._]{1,30}$/.test(brut) ? brut : '';
  // À l'écran, décimales à la française (84,5) ; data-poids garde le point pour le tri et les filtres.
  const nb = (v) => esc(typeof v === 'number' ? String(v).replace('.', ',') : v);
  const connu = (v) => v != null && v !== '';
  const cm = (v) => nb(v) + INSECABLE + 'cm';
  const age = ageDe(p), pratique = pratiqueDe(p);

  // La rangée : le club et le bras sur une ligne ; taille et âge en plus, sur grand écran seulement.
  const sous = (clubNom ? esc(clubNom) + SEP + esc(brasBas) : esc(brasHaut));
  const faits = [connu(p.taille) ? cm(p.taille) : '', connu(age) ? esc(age) + INSECABLE + 'ans' : ''].filter(Boolean).join(SEP);

  // La fiche, en titre : le club (ou la ville, sans club), la ville dessous ; Instagram dans un carré à droite.
  const titre = clubNom || villeNom;
  const sousTitre = clubNom ? villeNom : '';
  const insta = pseudo ? '<a class="fiche-insta" href="https://www.instagram.com/' + esc(pseudo) + '/" rel="noopener" target="_blank" aria-label="Instagram de '
    + esc(p.prenom) + ' : @' + esc(pseudo) + '" title="@' + esc(pseudo) + '">' + INSTA + '</a>' : '';

  // Les mesures : poids / taille / âge en grand, puis le bras et la pratique, puis le tour du ou des bras.
  // Une mesure inconnue ne s'affiche pas.
  const cles = [[p.poids, 'kg'], [p.taille, 'cm'], [age, 'ans']].filter(([v]) => connu(v))
    .map(([v, u]) => '<span>' + nb(v) + '<small>' + u + '</small></span>').join('');
  const n = Number(pratique);
  const pratiqueTxt = !connu(pratique) || !Number.isFinite(n) ? '' : n < 1 ? 'moins d’un an de pratique' : nb(pratique) + (n < 2 ? ' an' : ' ans') + ' de pratique';
  const texte = [esc(brasHaut), pratiqueTxt].filter(Boolean).join(SEP);
  // Biceps et avant-bras par bras quand la fiche les a (inscriptions depuis novembre 2026), sinon l'ancien « Tour de bras » (biceps).
  const COTES = [['Droit', 'droit'], ['Gauche', 'gauche']];
  const parCote = (champ) => COTES.filter(([c]) => connu(p[champ + c])).map(([c, t]) => t + ' ' + cm(p[champ + c]));
  const ligne = (t, parts) => (parts.length ? '<div><dt>' + t + '</dt><dd>' + parts.join(SEP) + '</dd></div>' : '');
  const bicepsParBras = COTES.some(([c]) => connu(p['biceps' + c]));
  const bras = (bicepsParBras ? ligne('Biceps', parCote('biceps')) : connu(p.biceps) ? ligne('Tour de bras', [cm(p.biceps)]) : '')
    + ligne('Avant-bras', parCote('avantBras'));

  return '<li class="athlete" id="profil-' + id + '" data-ville="' + esc(villeNom) + '" data-bras="' + esc(p.bras) + '" data-poids="' + esc(p.poids) + '" data-club="' + esc(clubNom) + '" data-nom="' + nom + '">'
    + '<div class="athlete-row">'
    + '<figure class="athlete-thumb">' + thumb + '</figure>'
    + '<div class="athlete-id"><p class="athlete-name" translate="no"><button class="athlete-toggle" type="button" aria-expanded="false" aria-controls="fiche-' + id + '">' + nom + '</button></p><p class="athlete-sub">' + sous + '</p></div>'
    + '<p class="athlete-facts">' + faits + '</p>'
    + '<p class="athlete-weight">' + nb(p.poids) + '<small>kg</small></p>' + FLECHE
    + '</div>'
    + '<div class="athlete-fiche" id="fiche-' + id + '" hidden>'
    // La grande photo se charge à l'ouverture de la fiche (ov-vitrine.js) ; d'ici là, l'initiale.
    + '<figure class="fiche-photo"><span class="fiche-ghost" aria-hidden="true">' + nb(p.poids) + '</span><img data-photo="' + id + '" width="960" height="640" alt="' + nom + '" decoding="async" hidden>' + ini + '</figure>'
    + '<div class="fiche-body">'
    + '<div class="fiche-tete"><div><p class="fiche-club">' + esc(titre) + '</p>' + (sousTitre ? '<p class="fiche-ville">' + esc(sousTitre) + '</p>' : '') + '</div>' + insta + '</div>'
    + '<div class="mesures">' + (cles ? '<p class="mesures-cles">' + cles + '</p>' : '') + '<p class="mesures-texte">' + texte + '</p>'
    + (bras ? '<dl class="mesures-bras">' + bras + '</dl>' : '') + '</div>'
    + (p.palmares ? '<p class="fiche-palmares"><span class="ov-sr">Palmarès : </span>' + esc(p.palmares) + '</p>' : '')
    + '<div class="fiche-propose"><button class="btn-register" type="button" data-propose data-prenom="' + esc(p.prenom) + '" data-profil="' + id + '" aria-expanded="false" aria-controls="propose-' + id + '">Proposer un match à ' + esc(p.prenom) + ' <span aria-hidden="true">→</span></button><div class="propose" id="propose-' + id + '" hidden></div></div>'
    + '</div></div></li>';
}
