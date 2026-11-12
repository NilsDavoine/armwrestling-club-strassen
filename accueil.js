// Page d'accueil du club (index.html) : la date du prochain mardi et le menu du téléphone.
// Sans ce script, la page affiche « Chaque mardi, 19h » et tout reste lisible.
(function () {
  // ----- Le prochain entraînement : le mardi qui vient, calculé à l'heure du Luxembourg -----
  // Une semaine sans entraînement se signale à la main dans index.html :
  //   <strong data-prochain data-sans-seance="2026-12-29 2027-01-05">
  var el = document.querySelector('[data-prochain]');
  if (el) {
    try {
      var ici = new Date(new Date().toLocaleString('en-US', { timeZone: 'Europe/Luxembourg' }));
      var sans = (el.getAttribute('data-sans-seance') || '').split(/\s+/).filter(Boolean);
      var cle = function (d) { return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2); };
      var jour = new Date(ici.getFullYear(), ici.getMonth(), ici.getDate());
      // mardi = 2 ; un mardi après 21h30, la séance du jour est finie : on passe au mardi suivant
      var fini = ici.getHours() > 21 || (ici.getHours() === 21 && ici.getMinutes() >= 30);
      var ecart = (2 - jour.getDay() + 7) % 7;
      if (ecart === 0 && fini) ecart = 7;
      jour.setDate(jour.getDate() + ecart);
      for (var i = 0; i < 8 && sans.indexOf(cle(jour)) !== -1; i++) jour.setDate(jour.getDate() + 7);
      var ceSoir = cle(jour) === cle(ici);
      var date = jour.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' });
      el.textContent = (ceSoir ? 'Ce soir, mardi ' : 'Mardi ') + date + ', 19h';
      el.setAttribute('datetime', cle(jour) + 'T19:00');
    } catch (e) { /* le texte de la page reste : « Chaque mardi, 19h » */ }
  }

  // ----- Le menu du téléphone -----
  var burger = document.getElementById('burger');
  var menu = document.getElementById('menu');
  if (burger && menu) {
    var ouvrir = function (oui) {
      menu.classList.toggle('ouvert', oui);
      burger.setAttribute('aria-expanded', String(oui));
      burger.setAttribute('aria-label', oui ? 'Fermer le menu' : 'Ouvrir le menu');
    };
    burger.addEventListener('click', function () { ouvrir(!menu.classList.contains('ouvert')); });
    menu.addEventListener('click', function (e) { if (e.target.closest('a')) ouvrir(false); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && menu.classList.contains('ouvert')) { ouvrir(false); burger.focus(); } });
  }
})();
