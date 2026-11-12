// Open Vendetta : recadrer une photo avant l'envoi. Cadre 4:5 (comme la vignette de la liste) ; on fait glisser la
// photo pour la placer, le curseur zoome, deux boutons la tournent d'un quart de tour. rendre() donne un Blob PNG
// 768 × 960, à passer ensuite à reduirePhoto() (ov-image.js), qui fait la photo de la fiche et la vignette.
const W = 320, H = 400;          // le cadre à l'écran (px CSS)
const OUT_W = 768, OUT_H = 960;  // la photo rendue
const MAX_SRC = 2000;            // la photo chargée est réduite à 2000 px de côté : assez pour zoomer, léger en mémoire

export function recadreur(host) {
  host.innerHTML =
    '<div class="crop__frame"><canvas class="crop__canvas" tabindex="0" aria-label="Cadrage de la photo : faites-la glisser, ou utilisez les flèches du clavier"></canvas></div>' +
    '<div class="crop__tools">' +
      '<label class="crop__zoom"><span class="form-label">Zoom</span><input type="range" min="1" max="4" step="0.01" value="1" data-zoom></label>' +
      '<div class="crop__buttons">' +
        '<button type="button" class="crop__btn" data-rot="-1" aria-label="Tourner d’un quart de tour vers la gauche">↺</button>' +
        '<button type="button" class="crop__btn" data-rot="1" aria-label="Tourner d’un quart de tour vers la droite">↻</button>' +
        '<button type="button" class="crop__btn crop__btn--text" data-reset>Recentrer</button>' +
      '</div>' +
    '</div>' +
    '<p class="crop__hint">Faites glisser la photo pour la placer dans le cadre.</p>';
  const canvas = host.querySelector('canvas'), ctx = canvas.getContext('2d');
  const zoomInput = host.querySelector('[data-zoom]');
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  canvas.width = W * dpr; canvas.height = H * dpr;
  let src = null, rot = 0, zoom = 1, ox = 0, oy = 0;

  // la photo tournée : largeur et hauteur échangées d'un quart de tour sur deux
  const dims = () => (rot % 2 ? [src.height, src.width] : [src.width, src.height]);
  const echelle = (w, h) => { const [sw, sh] = dims(); return Math.max(w / sw, h / sh) * zoom; };
  function borner() {
    const [sw, sh] = dims(), s = echelle(W, H);
    const mx = Math.max(0, (sw * s - W) / 2), my = Math.max(0, (sh * s - H) / 2);
    ox = Math.min(mx, Math.max(-mx, ox)); oy = Math.min(my, Math.max(-my, oy));
  }
  function peindre(c, w, h, k) {
    const g = c.getContext('2d');
    g.setTransform(1, 0, 0, 1, 0, 0);
    g.clearRect(0, 0, c.width, c.height);
    g.setTransform(k, 0, 0, k, 0, 0);
    g.translate(w / 2 + ox, h / 2 + oy);
    g.rotate((rot * Math.PI) / 2);
    const s = echelle(w, h);
    g.scale(s, s);
    g.imageSmoothingQuality = 'high';
    g.drawImage(src, -src.width / 2, -src.height / 2);
  }
  const dessiner = () => { if (src) { borner(); peindre(canvas, W, H, dpr); } };

  // glisser (souris, doigt, stylet)
  let prise = null;
  canvas.addEventListener('pointerdown', (e) => { if (!src) return; prise = { x: e.clientX, y: e.clientY, ox, oy }; canvas.setPointerCapture(e.pointerId); });
  canvas.addEventListener('pointermove', (e) => {
    if (!prise) return;
    const r = canvas.getBoundingClientRect(), k = W / r.width; // le cadre peut être affiché plus petit que 320 px
    ox = prise.ox + (e.clientX - prise.x) * k; oy = prise.oy + (e.clientY - prise.y) * k; dessiner();
  });
  const lacher = () => { prise = null; };
  canvas.addEventListener('pointerup', lacher); canvas.addEventListener('pointercancel', lacher);
  // clavier : les flèches déplacent, + et - zooment
  canvas.addEventListener('keydown', (e) => {
    if (!src) return;
    const pas = e.shiftKey ? 40 : 10;
    const d = { ArrowLeft: [pas, 0], ArrowRight: [-pas, 0], ArrowUp: [0, pas], ArrowDown: [0, -pas] }[e.key];
    if (d) { e.preventDefault(); ox += d[0]; oy += d[1]; dessiner(); return; }
    if (e.key === '+' || e.key === '=') { e.preventDefault(); zoomInput.value = Math.min(4, zoom + 0.1); zoomInput.dispatchEvent(new Event('input')); }
    if (e.key === '-') { e.preventDefault(); zoomInput.value = Math.max(1, zoom - 0.1); zoomInput.dispatchEvent(new Event('input')); }
  });
  zoomInput.addEventListener('input', () => {
    const avant = zoom; zoom = Number(zoomInput.value) || 1;
    ox *= zoom / avant; oy *= zoom / avant; // on zoome autour du centre du cadre
    dessiner();
  });
  host.querySelectorAll('[data-rot]').forEach((b) => b.addEventListener('click', () => {
    rot = (rot + Number(b.dataset.rot) + 4) % 4; ox = 0; oy = 0; dessiner();
  }));
  host.querySelector('[data-reset]').addEventListener('click', () => { zoom = 1; zoomInput.value = 1; ox = 0; oy = 0; dessiner(); });

  return {
    // charge un fichier image ; rejette si le navigateur ne sait pas le lire
    async charger(fichier) {
      const bmp = await createImageBitmap(fichier, { imageOrientation: 'from-image' });
      const k = Math.min(1, MAX_SRC / Math.max(bmp.width, bmp.height));
      const c = document.createElement('canvas');
      c.width = Math.max(1, Math.round(bmp.width * k)); c.height = Math.max(1, Math.round(bmp.height * k));
      c.getContext('2d').drawImage(bmp, 0, 0, c.width, c.height);
      bmp.close();
      src = c; rot = 0; zoom = 1; zoomInput.value = 1; ox = 0; oy = 0;
      dessiner();
    },
    pret: () => !!src,
    // la photo telle qu'elle est cadrée, en 768 × 960
    rendre() {
      if (!src) return Promise.reject(new Error('pas-de-photo'));
      const c = document.createElement('canvas');
      c.width = OUT_W; c.height = OUT_H;
      peindre(c, W, H, OUT_W / W);
      return new Promise((ok, ko) => c.toBlob((b) => (b ? ok(b) : ko(new Error('rendu-impossible'))), 'image/png'));
    },
    vider() { src = null; ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, canvas.width, canvas.height); },
  };
}
