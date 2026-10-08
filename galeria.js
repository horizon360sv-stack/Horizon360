/* ==========================================================
   HORIZON 360 - Galería de proyecto (galeria.js)
   Lo usan inspeccion-aerea.html, atardecer-costa.html e inmobiliario.html.
   Lee la configuración window.GALERIA que está en cada página.
   ========================================================== */
(function () {
  const G = window.GALERIA || {};
  const base = G.carpeta || '';
  const fotos = G.fotos || [], videos = G.videos || [], yt = G.youtube || [];
  const cont = document.getElementById('galeria-contenido');
  const h = (tag, cls, txt) => {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (txt) e.textContent = txt;
    return e;
  };

  // Sin archivos todavía: mensaje amable en vez de imágenes rotas
  if (!fotos.length && !videos.length && !yt.length) {
    cont.appendChild(h('p', 'vacio', 'Pronto publicaremos aquí las fotos y videos de este proyecto.'));
    return;
  }

  // ----- Fotos (se amplían al tocarlas) -----
  if (fotos.length) {
    cont.appendChild(h('h2', 'galeria-titulo', 'Fotografías'));
    const grid = h('div', 'media-grid');
    fotos.forEach((f, i) => {
      const b = h('button', 'media-item');
      b.type = 'button';
      b.setAttribute('aria-label', 'Ampliar foto ' + (i + 1));
      const img = document.createElement('img');
      img.src = base + f; img.loading = 'lazy';
      img.alt = (G.titulo || 'Proyecto') + ' - foto ' + (i + 1);
      b.appendChild(img);
      b.addEventListener('click', () => abrir(i));
      grid.appendChild(b);
    });
    cont.appendChild(grid);
  }

  // ----- Videos (archivos MP4 y/o YouTube) -----
  if (videos.length || yt.length) {
    cont.appendChild(h('h2', 'galeria-titulo', 'Videos'));
    const grid = h('div', 'video-grid');
    videos.forEach(f => {
      const v = document.createElement('video');
      v.controls = true; v.preload = 'metadata'; v.playsInline = true; v.src = base + f;
      grid.appendChild(v);
    });
    yt.forEach(id => {
      const fr = document.createElement('iframe');
      fr.src = 'https://www.youtube-nocookie.com/embed/' + id;
      fr.title = (G.titulo || 'Proyecto') + ' - video';
      fr.loading = 'lazy'; fr.allowFullscreen = true;
      fr.allow = 'accelerometer; encrypted-media; gyroscope; picture-in-picture';
      grid.appendChild(fr);
    });
    cont.appendChild(grid);
  }

  // ----- Visor de fotos a pantalla completa -----
  let actual = 0;
  const box = h('div', 'lightbox');
  box.hidden = true; box.setAttribute('role', 'dialog'); box.setAttribute('aria-modal', 'true');
  const big = document.createElement('img');
  const cerrar = h('button', 'lb-btn lb-cerrar', '×'); cerrar.setAttribute('aria-label', 'Cerrar');
  const ant = h('button', 'lb-btn lb-ant', '‹'); ant.setAttribute('aria-label', 'Foto anterior');
  const sig = h('button', 'lb-btn lb-sig', '›'); sig.setAttribute('aria-label', 'Foto siguiente');
  box.append(big, cerrar, ant, sig);
  document.body.appendChild(box);

  function mostrar(i) {
    actual = (i + fotos.length) % fotos.length;
    big.src = base + fotos[actual];
    big.alt = (G.titulo || 'Proyecto') + ' - foto ' + (actual + 1);
  }
  function abrir(i) { mostrar(i); box.hidden = false; cerrar.focus(); }
  function cerrarVisor() { box.hidden = true; }

  cerrar.addEventListener('click', cerrarVisor);
  ant.addEventListener('click', e => { e.stopPropagation(); mostrar(actual - 1); });
  sig.addEventListener('click', e => { e.stopPropagation(); mostrar(actual + 1); });
  box.addEventListener('click', e => { if (e.target === box) cerrarVisor(); });
  document.addEventListener('keydown', e => {
    if (box.hidden) return;
    if (e.key === 'Escape') cerrarVisor();
    if (e.key === 'ArrowLeft') mostrar(actual - 1);
    if (e.key === 'ArrowRight') mostrar(actual + 1);
  });
})();
