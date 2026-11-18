// V1/V6: every en text has an es twin (spans + notes), and no CDN (V2 offline)
import { readFileSync } from 'node:fs';
const s = readFileSync('index.html', 'utf8');
const n = (l) => (s.match(new RegExp(`<(span|p) lang="${l}"`, 'g')) || []).length;
if (n('en') !== n('es')) throw Error(`en/es mismatch ${n('en')} vs ${n('es')}`);
if (/https?:\/\//.test(s)) throw Error('external URL in index.html');
console.log(`ok: ${n('en')} en/es pairs`);

// V2/V5: figs are built, offline, bilingual
import { existsSync } from 'node:fs';
for (const name of ['pipeline', 'loop']) {
  const path = `public/figs/${name}.html`;
  if (!existsSync(path)) throw Error(`missing ${path}: run node figs/build${name === 'loop' ? '-loop' : ''}.mjs`);
  const f = readFileSync(path, 'utf8');
  if (/(src|href)=["']?https?:|url\(https?:|@import|\bfetch\(/.test(f)) throw Error(`external ref in ${name} fig`);
  const fn = (l) => (f.match(new RegExp(`<(span|text)[^>]*lang="${l}"`, 'g')) || []).length;
  if (fn('en') !== fn('es')) throw Error(`${name} fig en/es mismatch ${fn('en')} vs ${fn('es')}`);
  console.log(`ok: ${name} fig ${fn('en')} en/es pairs`);
}
