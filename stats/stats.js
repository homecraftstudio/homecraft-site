/* Statistiekpagina: leest de anonieme tellers (zie /teller.js) bij Abacus en toont ze.
   Leest met /info, dat ook voor een (nog) ontbrekende sleutel netjes antwoordt (exists: false). */
(function () {
  var NS = 'hcs-k7q2m9';
  var API = 'https://abacus.jasoncameron.dev';
  var SITES = [['www', 'homecraft.studio'], ['beta', 'beta.homecraft.studio']];
  var TALEN = [['en', 'English'], ['nl', 'Nederlands'], ['de', 'Deutsch'], ['fr', 'Français'], ['es', 'Español'], ['zh', '中文'], ['hi', 'हिन्दी']];
  var BRONNEN = [['direct', 'Direct'], ['google', 'Google'], ['facebook', 'Facebook'], ['github', 'GitHub'], ['overig', 'Overig']];
  var DAGEN = 30;
  var START = '2026-11-06'; // eerste dag van de telling; eerdere dagen bestaan niet en worden niet opgevraagd
  var MAANDEN = ['jan', 'feb', 'mrt', 'apr', 'mei', 'jun', 'jul', 'aug', 'sep', 'okt', 'nov', 'dec'];

  function lees(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function zet(k, v) { try { if (v == null) localStorage.removeItem(k); else localStorage.setItem(k, v); } catch (e) { /* niets */ } }
  var $ = function (id) { return document.getElementById(id); };
  var nf = new Intl.NumberFormat('nl-NL');
  var getal = function (v) { return v == null ? '?' : nf.format(v); };

  // Namespace: de echte, of een testnamespace via ?ns=hcs-test-… of de testvlag van teller.js.
  var q = new URLSearchParams(location.search);
  var test = q.get('ns') || lees('hc-teltest');
  var ns = /^hcs-test-[a-z0-9]{3,24}$/.test(test || '') ? test : NS;
  if (ns !== NS) { $('testmelding').hidden = false; $('testmelding').textContent = 'Testnamespace: ' + ns + '. Dit zijn testcijfers, niet de echte bezoekers.'; }

  function dagen() {
    var uit = [], nu = Date.now();
    for (var i = DAGEN - 1; i >= 0; i--) uit.push(new Date(nu - i * 864e5).toISOString().slice(0, 10));
    return uit;
  }
  function dagLabel(d) { var p = d.split('-'); return +p[2] + ' ' + MAANDEN[+p[1] - 1]; }

  /* Abacus staat 30 verzoeken per 10 seconden per IP toe en kent geen batch. Daarom één verzoek per 800 ms
     (hooguit 13 per 10 s; in de praktijk weigert Abacus soms al eerder), de belangrijkste sleutels eerst, en afgesloten dagen (ouder dan gisteren) bewaard in deze browser.
     Bij een 429 wachten we 10 s en proberen we het opnieuw. Elke binnengekomen waarde roept bij() aan. */
  var CACHE = 'hc-stats-' + ns;
  function cacheLees() { try { return JSON.parse(lees(CACHE) || '{}') || {}; } catch (e) { return {}; } }
  function haalAlles(sleutels, data, bij, klaar) {
    var i = 0, beurt = ++laadBeurt;
    function volgende() {
      if (beurt !== laadBeurt) return;
      if (i >= sleutels.length) { klaar(); return; }
      var k = sleutels[i];
      fetch(API + '/info/' + ns + '/' + k, { cache: 'no-store', credentials: 'omit', referrerPolicy: 'no-referrer' })
        .then(function (r) {
          if (r.status === 429) return 'opnieuw';
          return r.ok ? r.json() : null;
        })
        .then(function (j) {
          if (j === 'opnieuw') { setTimeout(volgende, 10000); return; }
          data[k] = j ? (j.exists ? j.value : 0) : null;
          i++; bij(i, sleutels.length); setTimeout(volgende, 800);
        }, function () { data[k] = null; i++; bij(i, sleutels.length); setTimeout(volgende, 800); });
    }
    volgende();
  }
  var laadBeurt = 0;

  function el(tag, attr, kinderen) {
    var e = document.createElement(tag);
    for (var a in attr || {}) { if (a === 'tekst') e.textContent = attr[a]; else e.setAttribute(a, attr[a]); }
    (kinderen || []).forEach(function (k) { if (k) e.appendChild(k); });
    return e;
  }
  function tegel(waarde, naam) {
    return el('div', { class: 'tegel' }, [el('div', { class: 'w', tekst: waarde }), el('div', { class: 'n', tekst: naam })]);
  }

  /* Staafgrafiek van weergaven per dag (één reeks, één as), met tooltip en tabelweergave. */
  var SVGNS = 'http://www.w3.org/2000/svg';
  function svg(tag, attr) { var e = document.createElementNS(SVGNS, tag); for (var a in attr) e.setAttribute(a, attr[a]); return e; }
  function rond(max) {
    if (max <= 4) return 4;
    var stap = Math.pow(10, Math.floor(Math.log10(max)));
    var m = [1, 2, 5, 10].map(function (f) { return f * stap; }).filter(function (v) { return v * 4 >= max; })[0];
    return m * 4;
  }
  var TEKENAARS = [], rw;
  window.addEventListener('resize', function () { clearTimeout(rw); rw = setTimeout(function () { TEKENAARS.forEach(function (f) { f(); }); }, 120); });
  function grafiek(doos, rijen) {
    var tip = el('div', { class: 'tip', hidden: '' });
    var houder = el('div', { class: 'grafiek' }, [tip]);
    doos.appendChild(houder);
    function teken() {
      var oud = houder.querySelector('svg'); if (oud) oud.remove();
      var B = houder.clientWidth || 600, H = 220, L = 36, R = 4, T = 10, O = 24;
      var max = rond(Math.max.apply(null, rijen.map(function (r) { return r.w || 0; })));
      var s = svg('svg', { viewBox: '0 0 ' + B + ' ' + H, role: 'img', 'aria-label': 'Weergaven per dag, laatste ' + DAGEN + ' dagen' });
      for (var g = 0; g <= 4; g++) {
        var y = T + (H - T - O) * (1 - g / 4);
        s.appendChild(svg('line', { class: g ? 'rooster' : 'basis', x1: L, x2: B - R, y1: y, y2: y }));
        var t = svg('text', { class: 'as', x: L - 8, y: y + 4, 'text-anchor': 'end' }); t.textContent = nf.format(max * g / 4); s.appendChild(t);
      }
      var kol = (B - L - R) / rijen.length, gat = Math.max(2, kol * 0.22), bw = Math.max(2, kol - gat);
      rijen.forEach(function (r, i) {
        var x = L + i * kol + gat / 2, h = (H - T - O) * (r.w || 0) / max, y0 = H - O;
        var vang = svg('rect', { class: 'vang', x: L + i * kol, y: T, width: kol, height: H - T - O, tabindex: '0' });
        var rr = Math.min(4, bw / 2, h);
        var staaf = svg('path', { class: 'staaf', d: h > 0 ? 'M' + x + ',' + y0 + 'V' + (y0 - h + rr) + 'Q' + x + ',' + (y0 - h) + ' ' + (x + rr) + ',' + (y0 - h) + 'H' + (x + bw - rr) + 'Q' + (x + bw) + ',' + (y0 - h) + ' ' + (x + bw) + ',' + (y0 - h + rr) + 'V' + y0 + 'Z' : 'M0,0' });
        var toon = function () {
          staaf.classList.add('actief');
          tip.innerHTML = '';
          tip.appendChild(el('div', { tekst: dagLabel(r.d) }));
          tip.appendChild(el('div', {}, [el('b', { tekst: getal(r.w) }), document.createTextNode(' weergaven')]));
          if (r.u !== undefined) tip.appendChild(el('div', {}, [el('b', { tekst: getal(r.u) }), document.createTextNode(' uniek')]));
          tip.hidden = false;
          var links = Math.min(Math.max(x + bw / 2, 70), B - 70);
          tip.style.left = links + 'px'; tip.style.top = Math.max(y0 - h, 40) + 'px';
        };
        var weg = function () { staaf.classList.remove('actief'); tip.hidden = true; };
        vang.addEventListener('pointerenter', toon); vang.addEventListener('focus', toon);
        vang.addEventListener('pointerleave', weg); vang.addEventListener('blur', weg);
        s.appendChild(vang); s.appendChild(staaf);
        if (i % 7 === (rijen.length - 1) % 7) {
          var lt = svg('text', { class: 'as', x: x + bw / 2, y: H - 6, 'text-anchor': 'middle' }); lt.textContent = dagLabel(r.d); s.appendChild(lt);
        }
      });
      houder.insertBefore(s, tip);
    }
    teken();
    TEKENAARS.push(teken);
    // Tabelweergave
    var tb = el('tbody');
    rijen.slice().reverse().forEach(function (r) { tb.appendChild(el('tr', {}, [el('td', { tekst: r.d }), el('td', { tekst: getal(r.w) })])); });
    doos.appendChild(el('details', { class: 'tabel' }, [el('summary', { tekst: 'Als tabel' }),
      el('table', {}, [el('thead', {}, [el('tr', {}, [el('th', { tekst: 'Datum (UTC)' }), el('th', { tekst: 'Weergaven' })])]), tb])]));
  }

  function verdeling(titel, paren, data, prefix) {
    var doos = el('div', { class: 'kaartje' }, [el('h3', { tekst: titel })]);
    var rijen = paren.map(function (p) { return [p[1], data[prefix + p[0]]]; });
    var som = rijen.reduce(function (a, r) { return a + (r[1] || 0); }, 0);
    if (!som) { doos.appendChild(el('p', { class: 'leeg', tekst: 'Nog geen gegevens.' })); return doos; }
    rijen.sort(function (a, b) { return (b[1] || 0) - (a[1] || 0); });
    var max = rijen[0][1] || 1;
    var ul = el('ul', { class: 'lijst' });
    rijen.forEach(function (r) {
      var pct = Math.round(100 * (r[1] || 0) / som);
      var balk = el('div', { class: 's' }, [el('div', { class: 'b', style: 'width:' + (100 * (r[1] || 0) / max) + '%' })]);
      var g = el('div', { class: 'g' }, [document.createTextNode(getal(r[1]) + ' '), el('span', { tekst: '(' + pct + '%)' })]);
      ul.appendChild(el('li', {}, [el('span', { tekst: r[0] }), balk, g]));
    });
    doos.appendChild(ul);
    return doos;
  }

  function laad() {
    var dd = dagen(), vandaag = dd[dd.length - 1], gisteren = dd[dd.length - 2];
    var cache = cacheLees();
    var data = {};
    var eerst = ['beta-code', 'beta-gids'], dan = [], laatst = [];
    SITES.forEach(function (s) {
      var k = s[0];
      eerst.push(k + '-hits', k + '-uniek', k + '-d-' + vandaag, k + '-ud-' + vandaag);
      TALEN.forEach(function (t) { dan.push(k + '-l-' + t[0]); });
      BRONNEN.forEach(function (b) { dan.push(k + '-s-' + b[0]); });
      dd.slice().reverse().forEach(function (d) {
        if (d === vandaag) return;
        [k + '-d-' + d].forEach(function (x) {
          if (d < START) data[x] = 0;
          else if (d < gisteren && typeof cache[x] === 'number') data[x] = cache[x]; else laatst.push(x);
        });
      });
    });
    var sleutels = eerst.concat(dan, laatst);
    var wacht = null;
    teken(data, dd, vandaag, true);
    $('status').textContent = 'Laden… 0 van ' + sleutels.length;
    haalAlles(sleutels, data, function (n, tot) {
      $('status').textContent = 'Laden… ' + n + ' van ' + tot;
      if (!wacht) wacht = setTimeout(function () { wacht = null; teken(data, dd, vandaag, true); }, 700);
    }, function () {
      clearTimeout(wacht); teken(data, dd, vandaag, false);
      var nieuw = {};
      Object.keys(data).forEach(function (x) { var m = x.match(/-u?d-(\d{4}-\d{2}-\d{2})$/); if (m && m[1] < gisteren && typeof data[x] === 'number') nieuw[x] = data[x]; });
      zet(CACHE, JSON.stringify(nieuw));
      var mis = sleutels.filter(function (x) { return data[x] == null; }).length;
      var t = new Date();
      $('status').textContent = (mis ? mis + ' tellers niet bereikbaar. ' : '') + 'Bijgewerkt om ' + ('0' + t.getHours()).slice(-2) + ':' + ('0' + t.getMinutes()).slice(-2) + '.';
    });
  }

  /* Tekent alles met wat er nu binnen is; ontbrekende waarden tonen als – tijdens het laden. */
  function teken(data, dd, vandaag, bezig) {
    var w = function (k) { return k in data ? getal(data[k]) : '–'; };
    var inhoud = $('inhoud'); inhoud.innerHTML = ''; TEKENAARS = [];
    SITES.forEach(function (s) {
      var k = s[0];
      // Uniek per dag lezen we alleen voor vandaag: Abacus staat maar 30 verzoeken per 10 s toe.
      var rijen = dd.map(function (d) { var r = { d: d, w: data[k + '-d-' + d] }; if (d === vandaag) r.u = data[k + '-ud-' + d]; return r; });
      var som = function (veld) { return rijen.reduce(function (a, r) { return a + (r[veld] || 0); }, 0); };
      var compleet = rijen.every(function (r) { return (k + '-d-' + r.d) in data; });
      var sec = el('section', { class: 'st-sectie', 'aria-labelledby': 'h-' + k }, [
        el('div', { class: 'st-kop' }, [el('h2', { id: 'h-' + k, tekst: s[1] }), el('small', { tekst: 'totalen sinds het begin van de telling' })]),
        el('div', { class: 'tegels' }, [
          tegel(w(k + '-hits'), 'weergaven in totaal'),
          tegel(w(k + '-uniek'), 'unieke bezoekers'),
          tegel(w(k + '-d-' + vandaag), 'weergaven vandaag · ' + w(k + '-ud-' + vandaag) + ' uniek'),
          tegel(compleet ? getal(som('w')) : '–', 'weergaven in de laatste ' + DAGEN + ' dagen')
        ])
      ]);
      var kaart = el('div', { class: 'kaartje', style: 'margin-top:12px' }, [el('h3', { tekst: 'Weergaven per dag, laatste ' + DAGEN + ' dagen' })]);
      sec.appendChild(kaart);
      inhoud.appendChild(sec);
      grafiek(kaart, rijen);
      sec.appendChild(el('div', { class: 'verdeling', style: 'margin-top:12px' }, [
        verdeling('Taal', TALEN, data, k + '-l-'),
        verdeling('Herkomst', BRONNEN, data, k + '-s-')
      ]));
    });
    $('beta-code').textContent = w('beta-code');
    $('beta-gids').textContent = w('beta-gids');
    inhoud.setAttribute('aria-busy', String(bezig));
  }

  function notrackBij() {
    var uit = lees('hc-notrack') === '1';
    var dnt = navigator.doNotTrack === '1' || navigator.globalPrivacyControl === true;
    $('notrack').textContent = uit ? 'Dit apparaat weer meetellen' : 'Dit apparaat niet meetellen';
    $('notrack-staat').textContent = uit ? 'Dit apparaat wordt nu niet meegeteld.'
      : dnt ? 'Deze browser stuurt Do Not Track of Global Privacy Control en wordt daarom al niet meegeteld.'
      : 'Dit apparaat wordt meegeteld.';
  }
  $('notrack').addEventListener('click', function () { zet('hc-notrack', lees('hc-notrack') === '1' ? null : '1'); notrackBij(); });
  $('vernieuw').addEventListener('click', laad);
  notrackBij();
  laad();
})();
