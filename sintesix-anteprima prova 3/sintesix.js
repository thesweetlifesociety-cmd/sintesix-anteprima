(function () {
  var d = document;

  // menu sotto i 1180 px
  var bottone = d.querySelector('.apri-menu');
  var menu = d.getElementById('menu-mobile');
  if (bottone && menu) {
    var chiudi = function () {
      bottone.setAttribute('aria-expanded', 'false');
      bottone.textContent = 'Menu';
      menu.hidden = true;
    };
    bottone.addEventListener('click', function () {
      if (bottone.getAttribute('aria-expanded') === 'true') { chiudi(); return; }
      bottone.setAttribute('aria-expanded', 'true');
      bottone.textContent = 'Chiudi';
      menu.hidden = false;
    });
    d.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !menu.hidden) { chiudi(); bottone.focus(); }
    });
    window.addEventListener('resize', function () {
      if (window.innerWidth > 1180 && !menu.hidden) chiudi();
    });
  }

  // avviso cookie: resta finché non si sceglie
  var avviso = d.querySelector('.cookie');
  if (avviso) {
    var scelta = null;
    try { scelta = window.localStorage.getItem('sintesix-cookie'); } catch (e) {}
    if (!scelta) avviso.hidden = false;
    avviso.addEventListener('click', function (e) {
      var t = e.target.closest('[data-cookie]');
      if (!t) return;
      try { window.localStorage.setItem('sintesix-cookie', t.getAttribute('data-cookie')); } catch (err) {}
      avviso.hidden = true;
    });
    d.addEventListener('click', function (e) {
      if (e.target.closest('[data-cookie-apri]')) avviso.hidden = false;
    });
  }

  // filtri della Bacheca
  var filtri = d.querySelector('.filtri');
  if (filtri) {
    var pezzi = [].slice.call(d.querySelectorAll('.pezzi [data-categoria]'));
    filtri.addEventListener('click', function (e) {
      var t = e.target.closest('button[data-filtro]');
      if (!t) return;
      [].forEach.call(filtri.querySelectorAll('button'), function (b) {
        b.setAttribute('aria-pressed', b === t ? 'true' : 'false');
      });
      var v = t.getAttribute('data-filtro');
      pezzi.forEach(function (p) {
        p.hidden = !(v === 'tutti' || p.getAttribute('data-categoria') === v);
      });
    });
  }

  // linguette: un pannello alla volta, le frecce spostano la scelta
  [].forEach.call(d.querySelectorAll('[role="tablist"]'), function (lista) {
    var tabs = [].slice.call(lista.querySelectorAll('[role="tab"]'));
    var mostra = function (t, fuoco) {
      tabs.forEach(function (x) {
        var on = x === t;
        x.setAttribute('aria-selected', on ? 'true' : 'false');
        x.tabIndex = on ? 0 : -1;
        var p = d.getElementById(x.getAttribute('aria-controls'));
        if (p) p.hidden = !on;
      });
      if (fuoco) t.focus();
    };
    tabs.forEach(function (t, i) {
      t.addEventListener('click', function () { mostra(t); });
      t.addEventListener('keydown', function (e) {
        var k = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
        if (k) { e.preventDefault(); mostra(tabs[(i + k + tabs.length) % tabs.length], true); }
      });
    });
    var scelto = tabs.filter(function (t) { return t.getAttribute('aria-selected') === 'true'; })[0] || tabs[0];
    if (scelto) mostra(scelto);
  });

  // moduli dell'anteprima: non spediscono, rispondono
  [].forEach.call(d.querySelectorAll('form[data-anteprima]'), function (f) {
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      var esito = f.querySelector('.esito');
      if (esito) esito.textContent = f.getAttribute('data-anteprima');
    });
  });
})();
