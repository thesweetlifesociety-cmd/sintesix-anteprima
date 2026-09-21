(function () {
  var d = document;
  var html = d.documentElement;
  var movimento = html.classList.contains('anim');
  // i caratteri si aspettano, ma non più di 700 ms: con una rete lenta l'apertura non resta vuota
  var pronti = Promise.race([
    d.fonts && d.fonts.ready ? d.fonts.ready : Promise.resolve(),
    new Promise(function (r) { setTimeout(r, 700); })
  ]);

  // titoli: ogni parola in una finestrella, da cui sale
  [].forEach.call(d.querySelectorAll('[data-parole]'), function (el) {
    var i = 0;
    var dividi = function (nodo) {
      [].slice.call(nodo.childNodes).forEach(function (n) {
        if (n.nodeType === 3) {
          var frag = d.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach(function (p) {
            if (!p) return;
            if (/^\s+$/.test(p)) { frag.appendChild(d.createTextNode(p)); return; }
            var w = d.createElement('span');
            var s = d.createElement('span');
            w.className = 'w';
            s.textContent = p;
            s.style.setProperty('--i', i++);
            w.appendChild(s);
            frag.appendChild(w);
          });
          n.parentNode.replaceChild(frag, n);
        } else if (n.nodeType === 1 && n.tagName !== 'BR') {
          dividi(n);
        }
      });
    };
    dividi(el);
    el.classList.add('diviso');
  });

  // ritardi: quelli scritti nella pagina, e quelli a scalare dentro un gruppo
  [].forEach.call(d.querySelectorAll('[data-ritardo]'), function (el) {
    el.style.setProperty('--ritardo', el.getAttribute('data-ritardo') + 'ms');
  });
  [].forEach.call(d.querySelectorAll('[data-gruppo]'), function (g) {
    var passo = parseInt(g.getAttribute('data-gruppo'), 10) || 100;
    [].forEach.call(g.querySelectorAll('[data-rivela]'), function (el, k) {
      el.style.setProperty('--ritardo', (k * passo) + 'ms');
    });
  });

  var vedi = function (el) { el.classList.add('visto'); };

  // l'apertura parte da sola: il titolo sale, poi il conto si fa da sé.
  // Sul telefono il conto sta sotto la piega: parte quando lo si vede davvero.
  var mazzo = d.querySelector('.sp-mazzo');
  var ultima = mazzo ? mazzo.querySelector('.c4') : null;
  // parte al caricamento solo se si vede già anche l'ultima carta, «= Soluzioni»
  var mazzoSubito = !!mazzo && (!ultima || ultima.getBoundingClientRect().bottom <= window.innerHeight);
  var apertura = [].slice.call(d.querySelectorAll('.sp-eroe [data-parole], .sp-eroe [data-rivela], .apertura [data-parole], .apertura [data-rivela]'));
  if (mazzoSubito) apertura.push(mazzo);
  pronti.then(function () { requestAnimationFrame(function () { apertura.forEach(vedi); }); });

  // il resto entra quando arriva sullo schermo
  var resto = [].slice.call(d.querySelectorAll('[data-parole], [data-rivela]')).filter(function (el) {
    return apertura.indexOf(el) < 0;
  });
  if (movimento && 'IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (voci) {
      voci.forEach(function (v) {
        if (v.isIntersecting) { vedi(v.target); io.unobserve(v.target); }
      });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0 });   // soglia 0: anche i blocchi più alti dello schermo compaiono appena entrano
    resto.forEach(function (el) { io.observe(el); });
    if (mazzo && !mazzoSubito) {
      // parte quando «= Soluzioni» è tutta sullo schermo: così il conto si vede per intero
      mazzo.classList.add('tardi');
      var im = new IntersectionObserver(function (voci) {
        if (voci[0].intersectionRatio > 0.95) { vedi(mazzo); im.disconnect(); }
      }, { rootMargin: '0px 0px -6% 0px', threshold: [0.5, 0.75, 0.96, 1] });
      im.observe(ultima);
    }
  } else {
    resto.forEach(vedi);
    if (mazzo) vedi(mazzo);
  }

  // intestazione: il filo compare quando si scorre
  var testata = d.querySelector('.testata');
  if (testata) {
    var scorri = function () { testata.classList.toggle('scorre', window.scrollY > 8); };
    window.addEventListener('scroll', scorri, { passive: true });
    scorri();
  }

  // linguette: l'indicatore scivola sotto la scelta; i pannelli stanno uno sopra l'altro,
  // così la sezione ha sempre la stessa altezza e cambiando scheda la pagina non salta
  [].forEach.call(d.querySelectorAll('.sp-linguette'), function (lista) {
    var scelta = function () { return lista.querySelector('[aria-selected="true"]'); };
    var pannello = function (t) { return t ? d.getElementById(t.getAttribute('aria-controls')) : null; };
    var ultimo = pannello(scelta());
    // metti(true) fa scivolare l'indicatore (clic, frecce); metti() lo rimette a posto senza animazione
    // (all'avvio, quando arrivano i caratteri, quando cambia la larghezza delle linguette)
    var metti = function (anima) {
      var t = scelta();
      if (!t) return;
      if (!anima) lista.classList.add('fermo');
      lista.style.setProperty('--ind-x', t.offsetLeft + 'px');
      lista.style.setProperty('--ind-y', t.offsetTop + 'px');
      lista.style.setProperty('--ind-w', t.offsetWidth + 'px');
      lista.style.setProperty('--ind-h', t.offsetHeight + 'px');
      if (!anima) { void lista.offsetWidth; lista.classList.remove('fermo'); }
    };
    var aPosto = function () { metti(); };
    // sintesix.js ha già cambiato la scelta: il pannello uscente sfuma, il nuovo sale al suo posto
    var cambia = function () {
      metti(true);
      var p = pannello(scelta());
      if (!p || p === ultimo) return;
      if (movimento) {
        var via = ultimo;
        if (via) {
          via.classList.add('esce');
          setTimeout(function () { via.classList.remove('esce'); }, 300);
        }
        p.classList.remove('esce', 'entra');
        void p.offsetWidth;
        p.classList.add('entra');
      }
      ultimo = p;
    };
    lista.parentNode.classList.add('impilate');
    lista.classList.add('con-indicatore');
    lista.addEventListener('click', function (e) {
      if (e.target.closest('[role="tab"]')) cambia();
    });
    lista.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') cambia();
    });
    window.addEventListener('resize', aPosto);
    if ('ResizeObserver' in window) {
      var ro = new ResizeObserver(aPosto);
      [].forEach.call(lista.querySelectorAll('[role="tab"]'), function (b) { ro.observe(b); });
    }
    if (d.fonts && d.fonts.addEventListener) d.fonts.addEventListener('loadingdone', aPosto);
    pronti.then(aPosto);
    metti();
  });
  [].forEach.call(d.querySelectorAll('.sp-voci'), function (v) {
    [].forEach.call(v.querySelectorAll('li'), function (li, k) { li.style.setProperty('--i', k); });
  });

  window.sparkPronto = true;
})();
