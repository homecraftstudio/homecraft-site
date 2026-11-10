/* Taalkeuze in 7 talen: en, nl, de, fr, es, zh (vereenvoudigd Chinees) en hi (Hindi).
   Engels staat in de HTML. De andere talen staan in /i18n/<taal>.js en worden pas geladen als ze nodig zijn.
   Keuze: ?lang=xx, anders de eerder gekozen taal (localStorage), anders de taal van de browser (de eerste uit
   navigator.languages die we hebben), anders Engels. Geen locatie: de browsertaal is wat de bezoeker zelf instelde.
   Het vroege script in <head> start het laden van de vertaling al tijdens het opbouwen; dit bestand zet hem neer. */
(function () {
  var TALEN = ['en', 'nl', 'de', 'fr', 'es', 'zh', 'hi'];
  var NAMEN = { en: 'English', nl: 'Nederlands', de: 'Deutsch', fr: 'Français', es: 'Español', zh: '中文', hi: 'हिन्दी' };
  var HTML_LANG = { zh: 'zh-Hans' };
  var OPSLAG = 'hc-taal';
  var EN = {}; // de Engelse teksten uit de HTML, bewaard bij de eerste wissel
  var huidig = 'en';
  var SOORTEN = [
    ['data-i18n', function (el) { return el.textContent; }, function (el, v) { el.textContent = v; }],
    ['data-i18n-html', function (el) { return el.innerHTML; }, function (el, v) { el.innerHTML = v; }],
    ['data-i18n-alt', function (el) { return el.alt; }, function (el, v) { el.alt = v; }],
    ['data-i18n-aria', function (el) { return el.getAttribute('aria-label'); }, function (el, v) { el.setAttribute('aria-label', v); }],
    ['data-i18n-content', function (el) { return el.content; }, function (el, v) { el.content = v; }]
  ];

  function lees() { try { return localStorage.getItem(OPSLAG); } catch (e) { return null; } }
  function bewaar(w) { try { localStorage.setItem(OPSLAG, w); } catch (e) { /* privévenster */ } }
  function geldig(t) { t = String(t || '').toLowerCase().slice(0, 2); return TALEN.indexOf(t) >= 0 ? t : null; }
  function woordenboek(t) { return (window.HC_I18N || {})[t] || {}; }

  /* Tekst bij een sleutel in de huidige taal, voor teksten die niet in de HTML staan (bijv. een knopmelding). */
  window.HC_T = function (sleutel, engels) {
    var v = huidig === 'en' ? null : woordenboek(huidig)[sleutel];
    return v != null ? v : engels;
  };
  window.HC_TAAL = function () { return huidig; };

  function zet(taal) {
    var wb = taal === 'en' ? {} : woordenboek(taal);
    SOORTEN.forEach(function (s) {
      document.querySelectorAll('[' + s[0] + ']').forEach(function (el) {
        var k = el.getAttribute(s[0]);
        var id = s[0] + '|' + k;
        if (!(id in EN)) EN[id] = s[1](el);
        var v = wb[k] != null ? wb[k] : EN[id]; // ontbreekt een vertaling, dan blijft het Engels staan
        if (v != null) s[2](el, v);
      });
    });
    huidig = taal;
    var html = document.documentElement;
    html.lang = HTML_LANG[taal] || taal;
    html.classList.remove('hc-vertaal');
    kiezerBij();
    beelden(taal);
    document.dispatchEvent(new CustomEvent('hc-taal', { detail: taal }));
  }

  /* Laadt /i18n/<taal>.js (of wacht op het exemplaar dat het vroege script al startte). */
  function laad(taal, klaar) {
    if (taal === 'en' || (window.HC_I18N && window.HC_I18N[taal])) { klaar(); return; }
    var id = 'hc-taal-' + taal;
    var s = document.getElementById(id);
    if (!s) {
      s = document.createElement('script');
      s.src = '/i18n/' + taal + '.js';
      s.id = id;
      document.head.appendChild(s);
    }
    s.addEventListener('load', klaar);
    s.addEventListener('error', function () { document.documentElement.classList.remove('hc-vertaal'); });
  }

  function kies(taal) { laad(taal, function () { zet(taal); }); }

  /* De canonieke link volgt een expliciete ?lang=, zodat elke taalversie naar zichzelf wijst. */
  function canoniek(taal) {
    var c = document.querySelector('link[rel="canonical"]');
    if (c && taal) c.href = c.href.split('?')[0] + '?lang=' + taal;
  }

  /* ---- Beelden per taal: /img/<taal>/<naam>, met terugval op /img/en/ en daarna /img/ ----
     Geldt voor <source srcset>, <img src>, preload-links en og:image/twitter:image. Of een taalmap bestaat,
     wordt één keer per map nagevraagd (HEAD op het eerste beeld van de pagina) en onthouden. */
  var BEELD = /(\/img\/)(?:[a-z]{2}\/)?([\w.-]+\.(?:avif|webp|jpe?g|png))/g;
  var BEELD_EEN = /\/img\/(?:[a-z]{2}\/)?([\w.-]+\.(?:avif|webp|jpe?g|png))/;
  var mapBestaat = {};
  function beeldDragers() {
    var uit = [];
    document.querySelectorAll('source[srcset]').forEach(function (el) { uit.push([el, 'srcset']); });
    document.querySelectorAll('img[src]').forEach(function (el) { uit.push([el, 'src']); });
    document.querySelectorAll('link[rel="preload"][as="image"]').forEach(function (el) { uit.push([el, 'href']); });
    document.querySelectorAll('meta[property="og:image"], meta[name="twitter:image"]').forEach(function (el) { uit.push([el, 'content']); });
    return uit.filter(function (d) { return BEELD_EEN.test(d[0].getAttribute(d[1]) || ''); });
  }
  function toets(map, bestand, klaar) {
    if (map in mapBestaat) { klaar(mapBestaat[map]); return; }
    if (!window.fetch) { klaar(mapBestaat[map] = true); return; }
    fetch('/img/' + (map ? map + '/' : '') + bestand, { method: 'HEAD', cache: 'no-cache' })
      .then(function (r) { return r.ok; }, function () { return false; })
      .then(function (ok) { mapBestaat[map] = ok; klaar(ok); });
  }
  var beeldBeurt = 0;
  function beelden(taal) {
    var dragers = beeldDragers();
    // Alleen og:image en geen getoonde beelden (zoals op de beta, zonder taalmappen): niets doen. Crawlers voeren
    // geen JavaScript uit, dus wisselen levert daar niets op behalve vergeefse verzoeken naar ontbrekende mappen.
    if (!dragers.some(function (d) { return d[1] !== 'content'; })) return;
    var beurt = ++beeldBeurt;
    var eerste = dragers.filter(function (d) { return d[1] !== 'content'; })[0];
    var bestand = (eerste[0].getAttribute(eerste[1]).match(BEELD_EEN) || [])[1];
    var kandidaten = [taal, 'en', ''].filter(function (m, i, a) { return a.indexOf(m) === i; });
    (function volgende(i) {
      var map = kandidaten[i];
      if (map === '') { zetBeelden(dragers, ''); return; }
      toets(map, bestand, function (ok) {
        if (beurt !== beeldBeurt) return; // intussen een andere taal gekozen
        if (ok) zetBeelden(dragers, map); else volgende(i + 1);
      });
    })(0);
  }
  function zetBeelden(dragers, map) {
    dragers.forEach(function (d) {
      var oud = d[0].getAttribute(d[1]);
      var nieuw = oud.replace(BEELD, function (m, img, naam) { return img + (map ? map + '/' : '') + naam; });
      if (nieuw !== oud) d[0].setAttribute(d[1], nieuw);
    });
  }

  /* ---- Taalkiezer: knop met de huidige taalcode die een lijst opent ---- */
  var kiezer = document.querySelector('[data-taalkiezer]');
  var knop = kiezer && kiezer.querySelector('.taal-knop');
  var lijst = kiezer && kiezer.querySelector('.taal-lijst');
  var links = lijst ? Array.prototype.slice.call(lijst.querySelectorAll('a[data-taal]')) : [];

  function kiezerBij() {
    if (!knop) return;
    var code = knop.querySelector('.taal-code');
    if (code) code.textContent = huidig.toUpperCase();
    var label = window.HC_T('taal.label', 'Language');
    knop.setAttribute('aria-label', label + (huidig === 'en' ? '' : ' (Language)') + ': ' + NAMEN[huidig]);
    links.forEach(function (a) {
      if (a.getAttribute('data-taal') === huidig) a.setAttribute('aria-current', 'true');
      else a.removeAttribute('aria-current');
    });
  }
  function open(metFocus) {
    lijst.hidden = false;
    knop.setAttribute('aria-expanded', 'true');
    if (metFocus) (lijst.querySelector('[aria-current]') || links[0]).focus();
  }
  function sluit(focusKnop) {
    if (lijst.hidden) return;
    lijst.hidden = true;
    knop.setAttribute('aria-expanded', 'false');
    if (focusKnop) knop.focus();
  }

  if (knop && lijst) {
    knop.addEventListener('click', function () { if (lijst.hidden) open(false); else sluit(false); });
    knop.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); open(true); }
    });
    lijst.addEventListener('keydown', function (e) {
      var i = links.indexOf(document.activeElement);
      if (e.key === 'ArrowDown') { e.preventDefault(); links[(i + 1) % links.length].focus(); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); links[(i - 1 + links.length) % links.length].focus(); }
      else if (e.key === 'Home') { e.preventDefault(); links[0].focus(); }
      else if (e.key === 'End') { e.preventDefault(); links[links.length - 1].focus(); }
    });
    kiezer.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !lijst.hidden) { e.preventDefault(); sluit(true); }
    });
    kiezer.addEventListener('focusout', function (e) {
      if (e.relatedTarget && !kiezer.contains(e.relatedTarget)) sluit(false);
    });
    document.addEventListener('click', function (e) { if (!kiezer.contains(e.target)) sluit(false); });
    links.forEach(function (a) {
      a.addEventListener('click', function (e) {
        var t = a.getAttribute('data-taal');
        e.preventDefault();
        bewaar(t);
        // Staat er al een ?lang= in het adres, dan die bijwerken; anders blijft het adres zoals het is.
        try {
          var url = new URL(location.href);
          if (url.searchParams.has('lang')) {
            url.searchParams.set('lang', t);
            history.replaceState(history.state, '', url.pathname + url.search + url.hash);
            canoniek(t);
          }
        } catch (err) { /* adres blijft staan */ }
        sluit(true);
        kies(t);
      });
    });
  }

  /* ---- Start ---- */
  var uitAdres = null;
  try { uitAdres = geldig(new URLSearchParams(location.search).get('lang')); } catch (e) { /* geen URLSearchParams */ }
  function browserTaal() {
    var lijst = [];
    try { lijst = (navigator.languages && navigator.languages.length ? navigator.languages : [navigator.language]) || []; } catch (e) { /* geen navigator */ }
    for (var i = 0; i < lijst.length; i++) { var t = geldig(lijst[i]); if (t) return t; }
    return null;
  }
  var start = uitAdres || geldig(lees()) || browserTaal() || 'en';
  if (uitAdres) canoniek(uitAdres);
  if (start !== 'en') kies(start);
  else { document.documentElement.classList.remove('hc-vertaal'); kiezerBij(); beelden('en'); }
})();
