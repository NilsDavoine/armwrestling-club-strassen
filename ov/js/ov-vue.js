// Open Vendetta : le HTML d'une rangée d'athlète de la vitrine (style du site du club, maquette m6).
// Tout texte venu de la base est échappé.
import { ageDe, pratiqueDe } from './ov-data.js';
const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
export { esc };

const PLUS = '<span class="athlete-chev" aria-hidden="true"><svg viewBox="0 0 14 14"><path d="M7 1.5v11M1.5 7h11" fill="none" stroke="currentColor" stroke-width="1.6"/></svg></span>';
const SEP = '<span class="sep" aria-hidden="true">·</span>';

export function ligneAthlete(p, villeNom, clubNom) {
  const id = esc(p.id);
  // Le nom de famille est facultatif : « Lucas », pas « Lucas undefined ».
  const nom = esc(p.prenom + (p.nom ? ' ' + p.nom : ''));
  const brasLigne = p.bras === 'Les deux' ? 'Les deux bras' : 'Bras ' + esc(String(p.bras).toLowerCase());
  // Sans photo, l'initiale du prénom tient la place.
  const ini = '<span class="initiale" aria-hidden="true">' + esc(String(p.prenom || '').charAt(0)) + '</span>';
  const thumb = p.mini ? '<img src="' + esc(p.mini) + '" width="128" height="160" alt="" decoding="async">' : ini;
  // Un pseudo mal formé donnerait un lien cassé vers instagram.com : on ne l'affiche pas.
  const brut = String(p.instagram || '').replace(/^@/, '');
  const pseudo = /^[A-Za-z0-9._]{1,30}$/.test(brut) ? brut : '';
  const lignes = (p.palmares ? '<dt>Palmarès</dt><dd>' + esc(p.palmares) + '</dd>' : '')
    + (pseudo ? '<dt>Instagram</dt><dd><a href="https://www.instagram.com/' + esc(pseudo) + '/" rel="noopener" target="_blank">@' + esc(pseudo) + '</a></dd>' : '');
  // À l'écran, décimales à la française (84,5) ; data-poids garde le point pour le tri et les filtres.
  const nb = (v) => esc(typeof v === 'number' ? String(v).replace('.', ',') : v);
  const spec = (t, v, u, cls) => v == null || v === '' ? '' : '<div' + (cls ? ' class="' + cls + '"' : '') + '><dt>' + t + '</dt><dd>' + nb(v) + (u ? '<small>' + u + '</small>' : '') + '</dd></div>';
  // Sans tour de bras, la case « Bras » prend deux colonnes : la grille de 3 reste pleine.
  const sansBiceps = p.biceps == null || p.biceps === '';
  return '<li class="athlete" id="profil-' + id + '" data-ville="' + esc(villeNom) + '" data-bras="' + esc(p.bras) + '" data-poids="' + esc(p.poids) + '" data-club="' + esc(clubNom) + '" data-nom="' + nom + '">'
    + '<div class="athlete-row">'
    + '<figure class="athlete-thumb">' + thumb + '</figure>'
    + '<div class="athlete-id"><p class="athlete-name" translate="no"><button class="athlete-toggle" type="button" aria-expanded="false" aria-controls="fiche-' + id + '">' + nom + '</button></p><p class="athlete-club">' + esc(clubNom) + '</p></div>'
    + '<p class="athlete-facts">' + brasLigne + '<span class="facts-more">' + SEP + nb(p.taille) + ' cm' + SEP + esc(ageDe(p)) + ' ans</span></p>'
    + '<p class="athlete-weight">' + nb(p.poids) + '<small>kg</small></p>' + PLUS
    + '</div>'
    + '<div class="athlete-fiche" id="fiche-' + id + '" hidden>'
    // La grande photo se charge à l'ouverture de la fiche (ov-vitrine.js) ; d'ici là, l'initiale.
    + '<figure class="fiche-photo"><span class="fiche-ghost" aria-hidden="true">' + nb(p.poids) + '</span><img data-photo="' + id + '" width="960" height="640" alt="' + nom + '" decoding="async" hidden>' + ini + '</figure>'
    + '<div class="fiche-body">'
    + '<p class="fiche-meta"><strong>' + esc(clubNom) + '</strong> · ' + esc(villeNom) + '</p>'
    + '<dl class="specs">' + spec('Poids', p.poids, 'kg') + spec('Taille', p.taille, 'cm') + spec('Tour de bras', p.biceps, 'cm') + spec('Âge', ageDe(p), 'ans') + spec('Pratique', pratiqueDe(p), 'ans') + spec('Bras', p.bras, '', sansBiceps ? 'wide' : '') + '</dl>'
    + (lignes ? '<dl class="fiche-lines">' + lignes + '</dl>' : '')
    + '<div class="fiche-propose"><button class="btn-register" type="button" data-propose data-prenom="' + esc(p.prenom) + '" data-profil="' + id + '" aria-expanded="false" aria-controls="propose-' + id + '">Proposer un match à ' + esc(p.prenom) + ' <span aria-hidden="true">→</span></button><div class="propose" id="propose-' + id + '" hidden></div></div>'
    + '</div></div></li>';
}
