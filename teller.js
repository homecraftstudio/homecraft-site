/* Anonieme bezoekerstelling van HomeCraft: geen cookies, geen persoonsgegevens, geen id die de browser verlaat.
   Telt alleen aantallen (per site, dag, taal en bron) bij een openbare teller. Niet bij Do Not Track / Global
   Privacy Control, op localhost, of op een apparaat dat ?notrack=1 heeft bezocht. Statistiek: /stats/ (homecraft.studio). */
(function () {
  try {
    var NS = 'hcs-k7q2m9';
    var BASE = 'https://abacus.jasoncameron.dev/hit/' + NS + '/';
    var ls = window.localStorage;
    var q = new URLSearchParams(location.search);
    if (q.get('notrack') === '1') { try { ls.setItem('hc-notrack', '1'); } catch (e) {} }
    var uit = false;
    try { uit = ls.getItem('hc-notrack') === '1'; } catch (e) {}
    if (uit || navigator.doNotTrack === '1' || window.doNotTrack === '1' || navigator.globalPrivacyControl === true) return;
    if (/^(localhost|127\.0\.0\.1|\[::1\])$/.test(location.hostname)) return;
    var site = /^beta\./.test(location.hostname) ? 'beta' : 'www';
    var dag = new Date().toISOString().slice(0, 10);
        var ref = (document.referrer || '').toLowerCase();
    var utm = (q.get('utm_source') || '').toLowerCase();
    var bron = 'direct';
    if (q.has('fbclid') || /facebook|fb/.test(utm) || /(^|\/\/)([a-z]+\.)?facebook\.com|fb\.me|l\.messenger/.test(ref)) bron = 'facebook';
    else if (/google/.test(utm) || /\/\/(www\.)?google\./.test(ref)) bron = 'google';
    else if (/github/.test(utm) || /github\.com/.test(ref)) bron = 'github';
    else if (ref && ref.indexOf(location.hostname) === -1 && !/homecraft\.studio/.test(ref)) bron = 'overig';
    else if (utm) bron = 'overig';
    var sleutels = [site + '-hits', site + '-d-' + dag, site + '-s-' + bron];
    var nieuw = false, nieuwDag = false;
    try {
      if (!ls.getItem('hc-gezien-' + site)) { ls.setItem('hc-gezien-' + site, '1'); nieuw = true; }
      if (ls.getItem('hc-dag-' + site) !== dag) { ls.setItem('hc-dag-' + site, dag); nieuwDag = true; }
    } catch (e) {}
    if (nieuw) sleutels.push(site + '-uniek');
    if (nieuwDag) sleutels.push(site + '-ud-' + dag);
    if (site === 'beta' && q.get('u')) sleutels.push('beta-code');
    var stuur = function () {
      var taal = (document.documentElement.lang || q.get('lang') || 'en').toLowerCase().slice(0, 2);
      if (!/^(en|nl|de|fr|es|zh|hi)$/.test(taal)) taal = 'en';
      sleutels.push(site + '-l-' + taal);
      sleutels.forEach(function (k) {
        try { fetch(BASE + k, { mode: 'cors', keepalive: true, cache: 'no-store' }).catch(function () {}); } catch (e) {}
      });
    };
    if (document.readyState === 'complete') setTimeout(stuur, 1200);
    else window.addEventListener('load', function () { setTimeout(stuur, 1200); });
  } catch (e) { /* stil falen */ }
})();
