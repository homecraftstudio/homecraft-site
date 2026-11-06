/* Anonieme bezoekerstelling van HomeCraft: geen cookies, geen persoonsgegevens, geen id die de browser verlaat.
   Telt alleen aantallen per sleutel bij de accountloze teller Abacus (abacus.jasoncameron.dev).
   - Unieke bezoeker: alleen een vlag in localStorage op dit apparaat (hc-gezien-<site>, hc-dag-<site>).
   - Naar de teller gaat geen referrer (referrerPolicy: no-referrer) en geen cookie (credentials: omit).
   - Niet tellen bij Do Not Track of Global Privacy Control, op localhost/127.0.0.1, of op een apparaat dat
     ?notrack=1 heeft geopend (vlag hc-notrack; ?notrack=0 haalt hem weg). Geldt per site (eigen localStorage).
   - Test: ?teltest=hcs-test-<letters/cijfers> telt tijdelijk tegen die testnamespace, ook op localhost;
     ?teltest=uit zet het terug. De echte namespace hieronder verandert daarbij niet.
   Sleutels (<site> = www of beta, datum in UTC):
     <site>-hits, <site>-uniek, <site>-d-JJJJ-MM-DD, <site>-ud-JJJJ-MM-DD, <site>-l-<taal>,
     <site>-s-<bron> (facebook, google, github, direct, overig; per weergave, verkeer binnen de site telt als direct),
     beta-code (geldige testcode gebruikt), beta-gids (installatiegids getoond).
   Losse gebeurtenissen van de pagina: (window.HC_TELQ = window.HC_TELQ || []).push('beta-gids').
   Statistiek: homecraft.studio/stats/ */
(function () {
  var NS = 'hcs-k7q2m9';
  var API = 'https://abacus.jasoncameron.dev';

  function lees(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function zet(k, v) { try { if (v == null) localStorage.removeItem(k); else localStorage.setItem(k, v); return true; } catch (e) { return false; } }

  function begin() {
    try {
      var p = new URLSearchParams(location.search);
      if (p.get('notrack') === '1') zet('hc-notrack', '1');
      if (p.get('notrack') === '0') zet('hc-notrack', null);
      var tt = p.get('teltest');
      if (tt === 'uit') zet('hc-teltest', null);
      else if (/^hcs-test-[a-z0-9]{3,24}$/.test(tt || '')) zet('hc-teltest', tt);

      var test = lees('hc-teltest');
      var ns = /^hcs-test-[a-z0-9]{3,24}$/.test(test || '') ? test : NS;
      var lokaal = /^(localhost|127\.0\.0\.1|\[::1\]|)$/.test(location.hostname) || location.protocol === 'file:';
      var dnt = navigator.doNotTrack === '1' || window.doNotTrack === '1' || navigator.msDoNotTrack === '1' || navigator.globalPrivacyControl === true;
      if (dnt || lees('hc-notrack') === '1' || (lokaal && ns === NS)) return;

      var site = /^beta\./.test(location.hostname) || document.documentElement.hasAttribute('data-toegang') ? 'beta' : 'www';
      var tel = function (sleutel) {
        try {
          fetch(API + '/hit/' + ns + '/' + sleutel, { mode: 'cors', keepalive: true, credentials: 'omit', cache: 'no-store', referrerPolicy: 'no-referrer' })
            .catch(function () { /* stil falen */ });
        } catch (e) { /* stil falen */ }
      };
      var dag = new Date().toISOString().slice(0, 10);

      tel(site + '-hits');
      tel(site + '-d-' + dag);
      // Uniek (ooit) en uniek per dag: alleen als localStorage werkt; anders weten we het niet en tellen we het niet.
      if (!lees('hc-gezien-' + site) && zet('hc-gezien-' + site, '1')) tel(site + '-uniek');
      if (lees('hc-dag-' + site) !== dag && zet('hc-dag-' + site, dag)) tel(site + '-ud-' + dag);

      var taal = String(document.documentElement.lang || p.get('lang') || 'en').toLowerCase().slice(0, 2);
      if (!/^(en|nl|de|fr|es|zh|hi)$/.test(taal)) taal = 'en';
      tel(site + '-l-' + taal);
      tel(site + '-s-' + herkomst(p));

      // Gebeurtenissen van de pagina zelf (beta-code, beta-gids), ook als ze later binnenkomen.
      var mag = function (k) { return /^beta-(code|gids)$/.test(k); };
      (window.HC_TELQ || []).forEach(function (k) { if (mag(k)) tel(k); });
      window.HC_TELQ = { push: function (k) { if (mag(k)) tel(k); } };
    } catch (e) { /* de teller mag nooit iets breken */ }
  }

  /* Herkomst uit utm_source, fbclid of document.referrer. Verkeer binnen *.homecraft.studio telt als direct. */
  function herkomst(p) {
    var utm = (p.get('utm_source') || '').toLowerCase();
    if (p.has('fbclid') || /facebook|^fb$|^ig$|instagram/.test(utm)) return 'facebook';
    if (/google/.test(utm)) return 'google';
    if (/github/.test(utm)) return 'github';
    if (utm) return 'overig';
    var host = '';
    try { host = document.referrer ? new URL(document.referrer).hostname.toLowerCase() : ''; } catch (e) { return 'overig'; }
    if (!host || host === location.hostname || /(^|\.)homecraft\.studio$/.test(host)) return 'direct';
    if (/(^|\.)facebook\.com$|(^|\.)fb\.com$|(^|\.)fb\.me$|(^|\.)messenger\.com$/.test(host)) return 'facebook';
    if (/(^|\.)google\.[a-z.]+$/.test(host)) return 'google';
    if (/(^|\.)github\.com$/.test(host)) return 'github';
    return 'overig';
  }

  // Pas tellen als de pagina klaar is en de browser even niets te doen heeft.
  function straks() {
    if ('requestIdleCallback' in window) requestIdleCallback(begin, { timeout: 3000 });
    else setTimeout(begin, 1200);
  }
  if (document.readyState === 'complete') straks();
  else window.addEventListener('load', straks);
})();
