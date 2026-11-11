// Open Vendetta : le HTML d'une rangée d'athlète de la vitrine. Tout texte venu de la base est échappé.
const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
export { esc };

const CHEVRON = '<span class="athlete__chev" aria-hidden="true"><svg viewBox="0 0 12 12"><path d="M3 4.5l3 3 3-3" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg></span>';

export function ligneAthlete(p, villeNom, clubNom) {
  const id = esc(p.id);
  const nom = esc(p.prenom + ' ' + p.nom);
  const brasLigne = p.bras === 'Les deux' ? 'Les deux bras' : 'Bras ' + esc(String(p.bras).toLowerCase());
  const pseudo = String(p.instagram || '').replace(/^@/, '');
  const lignes = (p.palmares ? '<dt>Palmarès</dt><dd>' + esc(p.palmares) + '</dd>' : '')
    + (pseudo ? '<dt>Instagram</dt><dd><a href="https://www.instagram.com/' + esc(pseudo) + '/" rel="noopener" target="_blank">@' + esc(pseudo) + '</a></dd>' : '');
  const spec = (t, v, u) => '<div><dt>' + t + '</dt><dd>' + esc(v) + (u ? '<small>' + u + '</small>' : '') + '</dd></div>';
  return '<li class="athlete" data-ville="' + esc(villeNom) + '" data-bras="' + esc(p.bras) + '" data-poids="' + esc(p.poids) + '" data-club="' + esc(clubNom) + '">'
    + '<div class="athlete__row">'
    + '<figure class="athlete__thumb"><img src="' + esc(p.mini) + '" width="192" height="240" alt="' + nom + '" decoding="async"></figure>'
    + '<div class="athlete__id"><p class="athlete__name" translate="no"><button class="athlete__toggle" type="button" aria-expanded="false" aria-controls="fiche-' + id + '">' + nom + '</button></p><p class="athlete__club">' + esc(clubNom) + '</p></div>'
    + '<p class="athlete__facts">' + brasLigne + '<span class="facts__more"> · ' + esc(p.taille) + ' cm · ' + esc(p.age) + ' ans</span></p>'
    + '<p class="athlete__weight">' + esc(p.poids) + '<small>kg</small></p>' + CHEVRON
    + '</div>'
    + '<div class="athlete__fiche" id="fiche-' + id + '" hidden>'
    + '<figure class="fiche__photo"><img data-photo="' + id + '" width="960" height="640" alt="' + nom + '" decoding="async"></figure>'
    + '<div class="fiche__body">'
    + '<p class="fiche__meta">' + esc(clubNom) + ' · ' + esc(villeNom) + '</p>'
    + '<dl class="specs">' + spec('Poids', p.poids, 'kg') + spec('Taille', p.taille, 'cm') + spec('Tour de bras', p.biceps, 'cm') + spec('Âge', p.age, 'ans') + spec('Pratique', p.pratique, 'ans') + spec('Bras', p.bras) + '</dl>'
    + (lignes ? '<dl class="fiche__lines">' + lignes + '</dl>' : '')
    + '<div class="fiche__propose"><button class="btn btn--primary" type="button" data-propose data-prenom="' + esc(p.prenom) + '" data-profil="' + id + '" aria-expanded="false" aria-controls="propose-' + id + '">Proposer un match à ' + esc(p.prenom) + '</button><div class="propose" id="propose-' + id + '" hidden></div></div>'
    + '</div></div></li>';
}
