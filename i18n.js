/* Taalkeuze NL/EN. Nederlands staat in de HTML; hier alleen de Engelse teksten.
   Keuze: ?lang=nl|en, anders een eerder gekozen taal, anders de browsertaal. */
(function () {
  var EN = {
    'meta.titel': 'HomeCraft — your home in 3D, live in Home Assistant',
    'meta.omschrijving': 'HomeCraft shows your home as a real 3D model from above in Home Assistant, with live lamp light, devices and editors for floor plan, interior and kitchen. Open source and fully local.',
    'skip': 'Skip to content',
    'merk.aria': 'HomeCraft, back to top',
    'nav.aria': 'Main menu',
    'nav.functies': 'Features',
    'nav.hoe': 'How it works',
    'nav.vragen': 'FAQ',
    'hero.label': 'For Home Assistant · open source',
    'hero.titel': 'Your home in 3D. <em>Live</em>, from above.',
    'hero.lead': 'HomeCraft shows your home as a real 3D model in Home Assistant. Lamps glow the way they really shine, devices show their state, and you see at a glance what is happening at home.',
    'cta.github': 'View on GitHub',
    'cta.beta': 'Beta: invitation only',
    'feit.lokaal': 'Everything local in Home Assistant',
    'feit.talen': '7 languages',
    'feit.gratis': 'Free and open source',
    'alt.dashboard': 'A Home Assistant dashboard with three HomeCraft cards: the whole house in 3D with room labels, the first floor from above and the living room up close.',
    'func.oog': 'Features',
    'func.titel': 'Everything happening at home, in one view.',
    'func.lead': 'Not lists of switches, but your own home: with the rooms you live in, the lamps that are on and the devices that are running.',
    'alt.huis': 'A house in 3D seen from above at an angle, with labels for living room, bedroom, bathroom and hall.',
    'f1.titel': '3D from above, with live light',
    'f1.tekst': 'Your home as a real 3D model: facade, roof, floors and rooms. Daylight follows the sun and the weather; lamps are real light sources that dim and change colour, just like at home.',
    'f1.p1': 'From the whole house to a single floor or room',
    'f1.p2': 'Light spills through doorways into the hall',
    'f1.p3': 'Only draws when something changes: easy on a tablet',
    'alt.kamer': 'A living room up close in 3D, with windows, doors and lamp light on the floor.',
    'f2.titel': 'Lamps, devices and your car from Home Assistant',
    'f2.tekst': 'Connect what you already have. More than 50 kinds of devices get their own small 3D model that shows their state: the radiator glows, the washing machine shakes, the screen lights up.',
    'f2.p1': 'Tap to switch, hold for more',
    'f2.p2': 'Climate, cameras, media and alerts in their place in the house',
    'f2.p3': 'Rooms link to your areas automatically, in seven languages',
    'alt.verdieping': 'The floor plan of one floor seen straight from above, with walls, doors and windows.',
    'f3.titel': 'Draw your own home: floor plan, interior and kitchen',
    'f3.tekst': 'Three editors with one familiar layout. Draw walls, rooms, doors and windows; furnish the rooms; design your kitchen. HomeCraft builds the 3D house for you.',
    'f3.p1': 'Right inside Home Assistant, on any device with a browser',
    'f3.p2': 'Or start with a sample house',
    'f3.p3': 'Your whole home in one backup file',
    'k1.titel': 'Climate, energy and signal',
    'k1.tekst': 'See where it is warm or cold, where your power goes and where the wireless signal is weak, as a map over your own floor plan.',
    'k2.titel': 'Wall tablet and kiosk',
    'k2.tekst': 'Made for a tablet on the wall: give each screen its own name, let automations fly to a room, or set it to view only.',
    'k3.titel': 'Seven languages',
    'k3.tekst': 'English, Dutch, German, French, Spanish, Chinese and Hindi. Every text, in every editor.',
    'k4.titel': 'Private: everything stays home',
    'k4.tekst': 'Your home, your lamps and your settings live in your own Home Assistant. No account, no cloud, nothing is sent anywhere.',
    'alt.instellingen': 'HomeCraft settings: panel name of this screen, rooms and areas, permissions and backup.',
    'alt.reparatie': 'A HomeCraft repair notice in Home Assistant about linked entities that no longer exist.',
    'thuis.oog': 'At home in Home Assistant',
    'thuis.titel': 'Feels like part of Home Assistant',
    'thuis.tekst': 'HomeCraft is a regular integration with its own panel and a dashboard card. It works with your areas, your user permissions, your automations and your notifications.',
    'thuis.p1': 'Dashboard card for the house, a floor or a room',
    'thuis.p2': 'Actions for automations: fly to a room, highlight a room during an alarm',
    'thuis.p3': 'Reports what is wrong by itself, with a fix included',
    'hoe.oog': 'How it works',
    'hoe.titel': 'Your home on screen in three steps.',
    's1.titel': 'Install the integration',
    's1.tekst': 'Add HomeCraft to Home Assistant as a custom repository and restart. HomeCraft then appears in your sidebar.',
    's2.titel': 'Draw your home',
    's2.tekst': 'Draw walls, rooms, doors and windows, or start with the sample house. HomeCraft builds the 3D model and bakes the daylight.',
    's3.titel': 'Connect your lamps and devices',
    's3.tekst': 'Light points from your floor plan are already suggested. Tap one, pick the lamp, and watch it shine live.',
    'faq.oog': 'Frequently asked questions',
    'faq.titel': 'Good to know.',
    'q1.v': 'What do I need?',
    'q1.a1': 'Home Assistant <strong>2024.7</strong> or newer.',
    'q1.a2': 'A recent browser with <strong>WebGL2</strong>. All common browsers from recent years support it, on desktop, tablet and phone.',
    'q1.a3': 'Your own lamps and devices in Home Assistant, if you want to connect them. Without them you can still draw and look around.',
    'q2.v': 'Is HomeCraft free?',
    'q2.a1': 'Yes. HomeCraft is free and open source: the code is free software under the GPL-3.0. The building core that turns your floor plan into a 3D house is a closed module with its own licence, and it is also free to use and redistribute.',
    'q3.v': 'What happens to my data?',
    'q3.a1': 'Nothing outside your home. Everything is stored locally in your own Home Assistant: your house, lamps, devices and settings. HomeCraft has no account and no cloud, and sends nothing.',
    'q3.a2': 'This website also uses no cookies, no trackers and no external fonts.',
    'q4.v': 'Does it work on a wall tablet?',
    'q4.a1': 'That is what HomeCraft was made for. A few tips:',
    'q4.a2': 'Put the browser or a kiosk app in full screen and keep the screen on.',
    'q4.a3': 'Give each screen its own name under <em>Settings › Panel ID of this screen</em>, so automations can target exactly that screen.',
    'q4.a4': 'Leave <em>Power-saving drawing</em> on: at rest HomeCraft draws nothing, so the tablet stays cool. Weaker tablets automatically get a lighter quality.',
    'q4.a5': 'Set a shared screen in the hall to view only, so nobody changes anything by accident.',
    'q5.v': 'Do I have to draw my whole home myself?',
    'q5.a1': 'You draw the floor plan yourself in HomeCraft, with walls, rooms, doors and windows. You do not need any other program for that. Want to look around first? Start with the sample house.',
    'q6.v': 'Can I join the beta?',
    'q6.a1': 'The beta is currently by invitation only, for a small group of testers. The code is already public on GitHub.',
    'slot.titel': 'See your home as it is.',
    'slot.tekst': 'Open source, local and made for Home Assistant.',
    'voet.tekst': 'HomeCraft is an independent project and not affiliated with Home Assistant. Code under GPL-3.0; the building core is a closed module with its own licence.',
    'voet.aria': 'Footer',
    'voet.licentie': 'Licence',
    'voet.melden': 'Report a problem'
  };
  window.HC_I18N_EN = Object.assign(window.HC_I18N_EN || {}, EN);
})();

(function () {
  var NL = {}; // originele Nederlandse teksten, bewaard bij de eerste wissel
  var SOORTEN = [
    ['data-i18n', function (el) { return el.textContent; }, function (el, v) { el.textContent = v; }],
    ['data-i18n-html', function (el) { return el.innerHTML; }, function (el, v) { el.innerHTML = v; }],
    ['data-i18n-alt', function (el) { return el.alt; }, function (el, v) { el.alt = v; }],
    ['data-i18n-aria', function (el) { return el.getAttribute('aria-label'); }, function (el, v) { el.setAttribute('aria-label', v); }],
    ['data-i18n-content', function (el) { return el.content; }, function (el, v) { el.content = v; }]
  ];

  function lees(sleutel) { try { return localStorage.getItem(sleutel); } catch (e) { return null; } }
  function bewaar(sleutel, w) { try { localStorage.setItem(sleutel, w); } catch (e) { /* privévenster */ } }

  function zet(taal) {
    var en = window.HC_I18N_EN || {};
    SOORTEN.forEach(function (s) {
      document.querySelectorAll('[' + s[0] + ']').forEach(function (el) {
        var k = el.getAttribute(s[0]);
        var id = s[0] + '|' + k;
        if (!(id in NL)) NL[id] = s[1](el);
        var v = taal === 'en' ? en[k] : NL[id];
        if (v != null) s[2](el, v);
      });
    });
    document.documentElement.lang = taal;
    document.querySelectorAll('[data-taal]').forEach(function (b) {
      b.setAttribute('aria-pressed', String(b.getAttribute('data-taal') === taal));
    });
    document.dispatchEvent(new CustomEvent('hc-taal', { detail: taal }));
  }

  function begin() {
    var q = new URLSearchParams(location.search).get('lang');
    var taal = (q === 'nl' || q === 'en') ? q : lees('hc-taal');
    if (taal !== 'nl' && taal !== 'en') {
      var talen = navigator.languages && navigator.languages.length ? navigator.languages : [navigator.language || 'en'];
      taal = /^nl\b/i.test(talen[0] || '') ? 'nl' : 'en';
      for (var i = 0; i < talen.length; i++) { if (/^(nl|en)\b/i.test(talen[i])) { taal = talen[i].slice(0, 2).toLowerCase(); break; } }
    }
    if (taal !== 'nl') zet(taal);
    document.querySelectorAll('[data-taal]').forEach(function (b) {
      b.addEventListener('click', function () {
        var t = b.getAttribute('data-taal');
        bewaar('hc-taal', t);
        zet(t);
      });
    });
    window.HC_TAAL = function () { return document.documentElement.lang; };
  }
  begin();
})();
