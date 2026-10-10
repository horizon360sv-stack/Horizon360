(function () {
  'use strict';
  var PAGINA = 24;
  var RUTA_OK = /^comunidad\/[\w.-]+\.jpg$/;
  var ID_OK = /^[\w-]+$/;
  var lista = [], mostrados = 0;
  var $cuenta = document.getElementById('cm-cuenta');
  var $grid = document.getElementById('cm-grid');
  var $vacio = document.getElementById('cm-vacio');
  var $mas = document.getElementById('cm-mas');
  var $mapa = document.getElementById('cm-mapa');

  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function fechaTxt(f) {
    if (!f) return '';
    var d = new Date(f + (String(f).length === 10 ? 'T12:00:00' : ''));
    return isNaN(d) ? '' : d.toLocaleDateString('es-SV', { year: 'numeric', month: 'long', day: 'numeric' });
  }
  function valido(a) {
    return a && typeof a === 'object' && ID_OK.test(String(a.id || '')) && RUTA_OK.test(String(a.foto || '')) && RUTA_OK.test(String(a.mini || ''));
  }
  function coords(a) {
    var la = Number(a.lat), ln = Number(a.lng);
    return (a.lat != null && a.lng != null && isFinite(la) && isFinite(ln) && Math.abs(la) <= 90 && Math.abs(ln) <= 180) ? [la, ln] : null;
  }
  function tarjeta(a) {
    var el = document.createElement('a');
    el.className = 'cm-card';
    el.href = 'foto360.html?id=' + encodeURIComponent(a.id);
    var sub = [a.lugar, a.autor ? 'por ' + a.autor : ''].filter(Boolean).join(' · ');
    el.innerHTML = '<div class="cm-thumb"><img loading="lazy" decoding="async" src="' + esc(a.mini) + '" alt="Vista previa de ' + esc(a.titulo || 'foto 360°') + '"><span class="cm-badge">360°</span></div>' +
      '<div class="cm-info"><h3>' + esc(a.titulo || 'Foto 360°') + '</h3><p>' + esc(sub) + '</p></div>';
    return el;
  }
  function pintar() {
    var hasta = Math.min(lista.length, mostrados + PAGINA);
    for (var i = mostrados; i < hasta; i++) $grid.appendChild(tarjeta(lista[i]));
    mostrados = hasta;
    $mas.hidden = mostrados >= lista.length;
  }
  function mapa() {
    var con = lista.filter(coords);
    if (!con.length || typeof L === 'undefined') return;
    try {
      $mapa.hidden = false;
      var m = L.map($mapa, { scrollWheelZoom: false });
      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 18, attribution: '&copy; colaboradores de OpenStreetMap' }).addTo(m);
      var pts = [];
      con.forEach(function (a) {
        var c = coords(a); pts.push(c);
        L.circleMarker(c, { radius: 9, color: '#0d381e', weight: 2, fillColor: '#2e7d32', fillOpacity: .9 }).addTo(m)
          .bindPopup('<strong>' + esc(a.titulo || 'Foto 360°') + '</strong><br>' + esc(a.lugar || '') + '<br><a href="foto360.html?id=' + encodeURIComponent(a.id) + '">Ver en 360°</a>');
      });
      m.fitBounds(pts, { padding: [30, 30], maxZoom: 14 });
    } catch (e) { $mapa.hidden = true; }
  }
  function vacio(msg) { $vacio.textContent = msg; $vacio.hidden = false; }

  fetch('data/comunidad.json', { cache: 'no-cache' })
    .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
    .then(function (d) {
      lista = (d && Array.isArray(d.aportes) ? d.aportes : []).filter(valido);
      if (!lista.length) {
        $cuenta.textContent = 'Aún no hay fotos publicadas.';
        vacio('Sé la primera persona en aportar: envía tu foto 360° y aparecerá aquí.');
        return;
      }
      $cuenta.textContent = lista.length + (lista.length === 1 ? ' foto 360° compartida' : ' fotos 360° compartidas') + ' por la comunidad.';
      pintar(); mapa();
    })
    .catch(function () {
      $cuenta.textContent = '';
      vacio('No pudimos cargar las fotos en este momento. Intenta de nuevo en unos minutos.');
    });
  $mas.addEventListener('click', pintar);
})();
