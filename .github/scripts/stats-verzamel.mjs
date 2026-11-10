// Snapshot of the anonymous visitor counters (see /teller.js and /stats/), every 15 minutes from a GitHub Action.
// Reads the same keys as the stats page from Abacus, one request per 800 ms (Abacus allows 30 per 10 s per IP),
// keeps closed days from the previous snapshot, and writes data.json for the stats page to show at once.
import { readFileSync, writeFileSync, existsSync } from 'node:fs';

const NS = 'hcs-k7q2m9';
const API = 'https://abacus.jasoncameron.dev';
const SITES = ['www', 'beta', 'demo'];
const TALEN = ['en', 'nl', 'de', 'fr', 'es', 'zh', 'hi'];
const BRONNEN = ['direct', 'google', 'facebook', 'github', 'overig'];
const DAGEN = 30;
const START = '2026-11-06';
const [, , vorigPad, uitPad] = process.argv;

const vorig = vorigPad && existsSync(vorigPad) ? (() => { try { return JSON.parse(readFileSync(vorigPad, 'utf8')).data || {}; } catch { return {}; } })() : {};
const dagen = [];
for (let i = DAGEN - 1; i >= 0; i--) dagen.push(new Date(Date.now() - i * 864e5).toISOString().slice(0, 10));
const vandaag = dagen[dagen.length - 1], gisteren = dagen[dagen.length - 2];

const data = {};
const sleutels = ['beta-code', 'beta-gids'];
for (const k of SITES) {
  sleutels.push(`${k}-hits`, `${k}-uniek`, `${k}-d-${vandaag}`, `${k}-ud-${vandaag}`);
  for (const t of TALEN) sleutels.push(`${k}-l-${t}`);
  for (const b of BRONNEN) sleutels.push(`${k}-s-${b}`);
  for (const d of dagen) {
    if (d === vandaag) continue;
    const x = `${k}-d-${d}`;
    if (d < START) data[x] = 0;
    else if (d < gisteren && typeof vorig[x] === 'number') data[x] = vorig[x];
    else sleutels.push(x);
  }
}

const wacht = (ms) => new Promise((r) => setTimeout(r, ms));
let mis = 0;
for (const k of sleutels) {
  let waarde = null;
  for (let poging = 0; poging < 4; poging++) {
    try {
      const r = await fetch(`${API}/info/${NS}/${k}`, { headers: { 'cache-control': 'no-store' } });
      if (r.status === 429) { await wacht(10000); continue; }
      if (r.ok) { const j = await r.json(); waarde = j.exists ? j.value : 0; }
      break;
    } catch { await wacht(2000); }
  }
  if (waarde == null) { mis++; if (typeof vorig[k] === 'number') waarde = vorig[k]; }
  if (waarde != null) data[k] = waarde;
  await wacht(800);
}
writeFileSync(uitPad, JSON.stringify({ tijd: new Date().toISOString(), mis, data }));
console.log(`${sleutels.length} tellers gelezen, ${mis} niet bereikbaar`);
