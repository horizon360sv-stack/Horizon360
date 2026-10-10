(function () {
  'use strict';
  var RUTA_OK = /^comunidad\/[\w.-]+\.jpg$/;
  var $err = document.getElementById('cm-error');
  var $cont = document.getElementById('cm-contenido');
  function fallo(m) { $err.textContent = m; $err.hidden = false; $cont.hidden = true; }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function fechaTxt(f) {
    if (!f) return '';
    var d = new Date(f + (String(f).length === 10 ? 'T12:00:00' : ''));
    return isNaN(d) ? '' : d.toLocaleDateString('es-SV', { year: 'numeric', month: 'long', day: 'numeric' });
  }
  var id = new URLSearchParams(location.search).get('id') || '';
  if (!id) return fallo('Falta indicar qué foto quieres ver. Vuelve a la comunidad y elige una.');

  fetch('data/comunidad.json', { cache: 'no-cache' })
    .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
    .then(function (d) {
      var lista = (d && Array.isArray(d.aportes) ? d.aportes : []).filter(function (a) { return a && RUTA_OK.test(String(a.foto || '')) && RUTA_OK.test(String(a.mini || '')) && /^[\w-]+$/.test(String(a.id || '')); });
      var i = -1;
      lista.forEach(function (a, k) { if (a.id === id) i = k; });
      if (i < 0) return fallo('No encontramos esa foto. Puede que ya no esté publicada.');
      var a = lista[i];
      var titulo = a.titulo || 'Foto 360°';
      document.title = titulo + ' | Comunidad 360 | Horizon 360';
      document.getElementById('f-titulo').textContent = titulo;
      document.getElementById('f-meta').textContent = [a.lugar, a.autor ? 'por ' + a.autor : '', fechaTxt(a.fecha)].filter(Boolean).join(' · ');
      $cont.hidden = false;

      if (typeof pannellum === 'undefined') return fallo('No se pudo cargar el visor 360°. Recarga la página.');
      pannellum.viewer('visor', {
        type: 'equirectangular', panorama: a.foto, preview: a.mini, autoLoad: true,
        autoRotate: -2, hfov: 100, minHfov: 40, maxHfov: 120, showControls: true, showFullscreenCtrl: true, compass: false,
        strings: { loadButtonLabel: 'Toca para cargar<br>la foto 360°', loadingLabel: 'Cargando…', bylineLabel: 'por %s', textureSizeError: 'La foto es demasiado grande para este dispositivo.', noPanoramaError: 'No se indicó la foto.', fileAccessError: 'No se pudo abrir la foto.', malformedURLError: 'Dirección de la foto no válida.', genericWebGLError: 'Tu navegador no admite el visor 360°.', iOS8WebGLError: 'Tu navegador no admite el visor 360°.' }
      });

      var la = Number(a.lat), ln = Number(a.lng);
      if (a.lat != null && a.lng != null && isFinite(la) && isFinite(ln)) {
        var m = document.getElementById('f-mapa');
        m.href = 'https://www.google.com/maps?q=' + la.toFixed(5) + ',' + ln.toFixed(5);
        m.hidden = false;
      }
      var $av = document.getElementById('f-aviso');
      document.getElementById('f-compartir').addEventListener('click', function () {
        var url = location.href;
        var ok = function () { $av.textContent = 'Enlace copiado'; setTimeout(function () { $av.textContent = ''; }, 2500); };
        if (navigator.share) { navigator.share({ title: titulo, url: url }).catch(function () {}); }
        else if (navigator.clipboard) { navigator.clipboard.writeText(url).then(ok, function () { $av.textContent = url; }); }
        else { $av.textContent = url; }
      });
      var nav = document.getElementById('f-nav'), h = '';
      // lista: más nueva primero
      if (lista[i + 1]) h += '<a href="foto360.html?id=' + encodeURIComponent(lista[i + 1].id) + '">&larr; ' + esc(lista[i + 1].titulo || 'Anterior') + '</a>'; else h += '<span></span>';
      if (lista[i - 1]) h += '<a href="foto360.html?id=' + encodeURIComponent(lista[i - 1].id) + '">' + esc(lista[i - 1].titulo || 'Siguiente') + ' &rarr;</a>';
      nav.innerHTML = h;
    })
    .catch(function () { fallo('No pudimos cargar la foto en este momento. Intenta de nuevo en unos minutos.'); });
})();
