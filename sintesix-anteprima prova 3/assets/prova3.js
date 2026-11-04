/* SINTESIX · prova 3: la testata sopra la foto, le foto che si scoprono, le cifre che si contano */
(function () {
  var d = document;
  var html = d.documentElement;
  var corpo = d.body;
  var movimento = html.classList.contains('anim');
  var eroe = d.querySelector('[data-eroe]');

  // testata trasparente finché si è sopra la foto d'apertura
  if (eroe) {
    corpo.classList.add('con-eroe');
    var testata = d.querySelector('.testata');
    var soglia = function () {
      var oltre = window.scrollY > Math.max(48, eroe.offsetHeight - testata.offsetHeight - 24);
      testata.classList.toggle('scorre', oltre);
    };
    window.addEventListener('scroll', soglia, { passive: true });
    window.addEventListener('resize', soglia);
    soglia();
    var apri = d.querySelector('.apri-menu');
    if (apri) apri.addEventListener('click', function () { setTimeout(soglia, 0); });
    // la foto compare appena pronta
    var img = eroe.querySelector('.sp-fe-img');
    var mostra = function () { requestAnimationFrame(function () { eroe.classList.add('visto'); }); };
    if (img && img.complete) mostra(); else if (img) { img.addEventListener('load', mostra); setTimeout(mostra, 1200); }
  }

  // le cifre si contano da sole quando arrivano sullo schermo
  var conta = d.querySelector('[data-conta]');
  if (conta) {
    var cifre = [].slice.call(conta.querySelectorAll('b'));
    var parti = function () {
      cifre.forEach(function (b, k) {
        var fine = parseInt(b.textContent.replace(/\D/g, ''), 10);
        if (isNaN(fine)) return;
        var inizio = fine > 100 ? fine - 70 : 0;
        var durata = 1400, t0 = null;
        var passo = function (t) {
          if (!t0) t0 = t;
          var p = Math.min(1, (t - t0) / durata);
          var e = 1 - Math.pow(1 - p, 3);
          b.textContent = Math.round(inizio + (fine - inizio) * e);
          if (p < 1) requestAnimationFrame(passo); else b.textContent = fine;
        };
        setTimeout(function () { requestAnimationFrame(passo); }, k * 140);
      });
    };
    if (movimento && 'IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (v) {
        if (v[0].isIntersecting) { parti(); io.disconnect(); }
      }, { rootMargin: '0px 0px -20% 0px' });
      io.observe(conta);
    }
  }
})();
