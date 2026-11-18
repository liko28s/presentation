// T7: "agent loop without supervision" figure.   node figs/build-loop.mjs  ->  public/figs/loop.html
// Object: a cart (the agent) circling a 4-station track. A gauge in the middle reads drift (unchecked error).
// A human gate on the return leg stops the cart and zeroes the gauge. Slider = how often the gate fires.
// Truth source: ./loop-model.mjs (inlined into the page, no runtime imports). Illustrative units, not measurements.
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import * as k from "/Users/sumapaz/.claude/skills/anatomy/kit/iso-kit.mjs";
import { kitScript } from "/Users/sumapaz/.claude/skills/anatomy/scripts/inline-kit.mjs";
import { CORNERS, GATE_S, LIMIT, EVERY, at as pathAt } from "./loop-model.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const OUT = join(HERE, "..", "public", "figs", "loop.html");
const MODEL_SRC = readFileSync(join(HERE, "loop-model.mjs"), "utf8").replace(/^export /gm, "");

const WIDTH = 760, HEIGHT = 460;
const PLATE = { x: -150, y: -106, w: 300, d: 212, r: 10 };
const PLATE_H = 12, FOOT_H = 5;
const TRACK_W = 20, TRACK_H = 3;
const STN = [[-128, -88], [128, -88], [128, 88], [-128, 88]]; // station blocks, outside the track corners
const GAUGE = { x: 0, y: 0, r: 30, z: 44, h: 10 };
const GATE = pathAt(GATE_S); // [-100, 0]
const BOOM_UP = 34, BOOM_DOWN = 8;
const CART_Z = TRACK_H;

const P = k.fitProjection(
  [...k.boxCorners(PLATE, -PLATE_H - FOOT_H, 0), [0, 0, 70], [GATE[0], GATE[1], BOOM_UP + 10], [-100, -60, 30], [100, 60, 30]],
  WIDTH, HEIGHT, { pad: 22, azimuth: 40 },
);
const at = (p) => k.iso(p, P);
const S = (paths, style) => k.solidSvg(paths, style);
const L = (d, style) => k.lineSvg(d, style);
const D = (pts, style) => k.dotsSvg(pts, style);
const depth = (x, y) => k.depthOf([x, y, 0], P);
const items = []; // static, depth-sorted: {key, svg}
const add = (x, y, svg) => items.push({ key: depth(x, y), svg });

// ---- plate
function plate() {
  const out = [`<path class="iso-halo" d="${k.haloOf(PLATE, -PLATE_H - FOOT_H, PLATE_H, P)}"/>`];
  const feet = [...k.corners(PLATE, 22)].sort((a, b) => depth(a[0], a[1]) - depth(b[0], b[1]));
  for (const [x, y] of feet) {
    out.push(S(k.cylinder(x, y, 7, -PLATE_H - FOOT_H, 1.6, P, 28), { tone: "lo" }));
    out.push(S(k.cylinder(x, y, 5.4, -PLATE_H - FOOT_H + 1.6, FOOT_H - 1.6, P, 28), { tone: "mid" }));
  }
  out.push(S(k.slabOf(PLATE, -PLATE_H, PLATE_H, P, 8, 1.6), { tone: "mid" }));
  out.push(L(k.planOutline(k.insetPlan(PLATE, 5), 0, P), { tone: "lo" }));
  const screws = k.corners(PLATE, 10);
  out.push(L(screws.map(([x, y]) => k.ring(x, y, 2.2, 0, P, 16)).join(""), { tone: "lo" }));
  out.push(D(screws.map(([x, y]) => at([x, y, 0])), { size: 0.5 }));
  return out.join("");
}

// ---- track: four rail slabs along the legs + a screw at each joint
function track() {
  const out = [];
  CORNERS.forEach(([x0, y0], i) => {
    const [x1, y1] = CORNERS[(i + 1) % 4];
    const plan = { x: Math.min(x0, x1) - TRACK_W / 2, y: Math.min(y0, y1) - TRACK_W / 2, w: Math.abs(x1 - x0) + TRACK_W, d: Math.abs(y1 - y0) + TRACK_W, r: 2 };
    out.push(S(k.slabOf(plan, 0, TRACK_H, P, 3, 0.4), { tone: "mid" }));
    out.push(L(k.lineOnTop([x0, y0], [x1, y1], TRACK_H, P), { tone: "lo" }));
  });
  out.push(D(CORNERS.map(([x, y]) => at([x, y, TRACK_H])), { size: 0.5 }));
  return out.join("");
}

// ---- stations 1..4: block + engraved number; each a different small fitting so they don't read as clones
function station(i) {
  const [x, y] = STN[i], out = [];
  const plan = { x: x - 13, y: y - 13, w: 26, d: 26, r: 3 };
  out.push(S(k.slabOf(plan, 0, 14, P, 4, 0.8), { tone: "mid" }));
  out.push(L(k.planOutline(k.insetPlan(plan, 3), 14, P, 3), { tone: "faint" }));
  out.push(D(k.corners(plan, 3.4).map(([px, py]) => at([px, py, 14])), { size: 0.45 }));
  out.push(k.faceTextSvg(k.topMatrix([x, y + 4], 14, P, "y"), String(i + 1), { size: 11, tone: "hi", anchor: "middle" }));
  if (i === 2) { // Act = tools: a small clamp arm
    out.push(S(k.cylinder(x, y - 8, 2.2, 14, 10, P, 18), { tone: "mid" }));
    out.push(S(k.slabOf({ x: x - 9, y: y - 10, w: 18, d: 4, r: 1 }, 24, 3, P, 2, 0.3), { tone: "hi" }));
  }
  if (i === 3) { // Observe: a lens post
    out.push(S(k.cylinder(x + 7, y - 8, 3.4, 14, 5, P, 20), { tone: "hi" }));
    out.push(L(k.ring(x + 7, y - 8, 1.6, 19, P, 14), { tone: "lo" }));
  }
  if (i === 0) out.push(S(k.cylinder(x + 7, y - 8, 2, 14, 7, P, 16), { tone: "hi" })); // Goal: a flag pole stub
  if (i === 1) out.push(L(k.lineOnTop([x - 8, y - 9], [x + 8, y - 9], 14, P), { tone: "mid" })); // Plan: a ruled line
  return out.join("");
}
STN.forEach(([x, y], i) => add(x, y, station(i)));

// ---- gauge (drift): pedestal + dial, needle drawn live
const SWEEP = 0.75, START = -0.375; // turns: 270° sweep, 0 at lower-left
const LIM_FRAC = LIMIT / (LIMIT * 1.4); // gauge full scale = 1.4 × LIMIT
const turnOf = (f) => START + SWEEP * f;
const tip = (turn, r0, r1, z) => {
  const a = turn * Math.PI * 2, [cx, cy] = [GAUGE.x, GAUGE.y];
  return k.lineOnTop([cx + Math.sin(a) * r0, cy - Math.cos(a) * r0], [cx + Math.sin(a) * r1, cy - Math.cos(a) * r1], z, P);
};
function gauge() {
  const { x, y, r, z, h } = GAUGE, top = z + h, out = [];
  out.push(S(k.cylinder(x, y, 14, 0, 4, P, 32), { tone: "lo" }));
  out.push(S(k.cylinder(x, y, 5, 4, z - 4, P, 24), { tone: "mid" }));
  out.push(L(k.sideArc(x, y, 5, 22, P, 12), { tone: "faint" }));
  out.push(S(k.cylinder(x, y, r, z, h, P, 64, 0.8), { tone: "hi", crease: "lo" }));
  out.push(L(k.knurl(x, y, r, top - 3.4, top, 96, P, 0.3), { tone: "lo" }));
  out.push(L(k.ring(x, y, r - 2.4, top, P, 64), { tone: "lo" }));
  let minor = "", major = "", red = "";
  for (let i = 0; i <= 28; i++) {
    const f = i / 28, big = i % 4 === 0, t = tip(turnOf(f), r - 6.5, r - (big ? 3.4 : 4.6), top);
    if (big) major += t; else minor += t;
  }
  for (let i = 0; i <= 8; i++) red += tip(turnOf(LIM_FRAC + ((1 - LIM_FRAC) * i) / 8), r - 9.6, r - 6.6, top);
  out.push(L(minor, { tone: "lo" }), L(major, { tone: "mid" }));
  out.push(`<path class="iso-line" d="${red}" style="stroke:var(--anatomy-red);stroke-width:1.5"/>`);
  out.push(L(k.ring(x, y, 2, top, P, 16), { tone: "mid" }));
  return out.join("");
}
add(GAUGE.x, GAUGE.y, gauge());

// ---- human gate on the return leg: two posts + a lamp; the boom is live
function gatePosts() {
  const [gx, gy] = GATE, out = [];
  for (const dx of [-24, 24]) {
    out.push(S(k.slabOf({ x: gx + dx - 5, y: gy - 5, w: 10, d: 10, r: 2 }, 0, 6, P, 3, 0.5), { tone: "lo" }));
    out.push(S(k.cylinder(gx + dx, gy, 3, 6, BOOM_UP + 6, P, 20), { tone: "mid" }));
    out.push(S(k.cylinder(gx + dx, gy, 4, 6 + BOOM_UP + 6, 3, P, 20), { tone: "mid" }));
  }
  out.push(D([at([gx - 24, gy, 6 + BOOM_UP + 9]), at([gx + 24, gy, 6 + BOOM_UP + 9])], { size: 0.5 }));
  return out.join("");
}
add(GATE[0], GATE[1] - 8, gatePosts());
const BOOM_Y = GATE[1];
const boom = () => {
  const [gx] = GATE, out = [];
  out.push(S(k.slabOf({ x: gx - 24, y: BOOM_Y - 2.5, w: 48, d: 5, r: 1.2 }, 0, 4, P, 2, 0.4), { tone: "hi", lit: true }));
  for (let i = -20; i <= 16; i += 12) out.push(S(k.slabOf({ x: gx + i, y: BOOM_Y - 2.6, w: 6, d: 5.2, r: 0.5 }, 0, 4.2, P, 1, 0.2), { tone: "lo", crease: "none" }));
  return out.join("");
};

// ---- cart = the agent (the one lit part), built at the origin, moved live
function cart() {
  const out = [`<path class="iso-halo" d="${k.haloOf(k.insetPlan({ x: -17, y: -13, w: 34, d: 26, r: 3 }, 2), CART_Z, 0.1, P)}" style="filter:blur(4px)"/>`];
  for (const [x, y] of [[-11, -9], [11, -9], [-11, 9], [11, 9]]) out.push(S(k.cylinder(x, y, 4, CART_Z, 3, P, 16), { tone: "lo" }));
  out.push(S(k.slabOf({ x: -17, y: -13, w: 34, d: 26, r: 3 }, CART_Z + 3, 8, P, 4, 0.6), { tone: "mid" }));
  out.push(S(k.slabOf({ x: -11, y: -8, w: 22, d: 16, r: 2 }, CART_Z + 11, 10, P, 3, 0.5), { tone: "hi", crease: "lo", lit: true }));
  out.push(L(k.planOutline(k.insetPlan({ x: -11, y: -8, w: 22, d: 16, r: 2 }, 2), CART_Z + 21, P, 2), { tone: "faint" }));
  out.push(S(k.cylinder(0, 0, 1.4, CART_Z + 21, 10, P, 12), { tone: "hi", crease: "none", lit: true }));
  out.push(D([at([0, 0, CART_Z + 31])], { size: 0.6, tone: "hi" }));
  return out.join("");
}

items.sort((a, b) => a.key - b.key);
const start = pathAt(0);
const svg = k.figureSvg({
  width: WIDTH, height: HEIGHT,
  label: "A cart circles a four-station track around a drift gauge. Each lap adds drift. A gate on the return leg stops the cart and resets the gauge when a human checks.",
  body: [
    plate(), track(),
    `<g id="items">${items.map((i) => `<g data-k="${i.key}">${i.svg}</g>`).join("")}</g>`,
    `<g id="boom" data-k="${depth(GATE[0], BOOM_Y)}" transform="${k.translateAlong(P, [0, 0, BOOM_UP])}">${boom()}</g>`,
    `<g id="cart" transform="${k.translateAlong(P, [start[0], start[1], 0])}">${cart()}</g>`,
    `<path id="needle" class="iso-line" data-tone="lit" data-free="start" d="${tip(turnOf(0), -3, GAUGE.r - 5, GAUGE.z + GAUGE.h + 0.2)}" style="stroke-width:1.2"/>`,
  ],
});

// ---- bilingual text lives outside the drawing; plateHtml escapes, so use tokens and swap after
const T = {
  fig: ["Fig 2", "Fig 2"],
  title: ["Agent loop, no supervision", "Bucle del agente, sin supervisión"],
  hint: ["Slide to add human checks", "Desliza para añadir revisión humana"],
  k1: ["Agent: the cart that loops", "Agente: el carrito que da vueltas"],
  k2: ["Stations 1 Goal · 2 Plan · 3 Act (tools) · 4 Observe", "Estaciones 1 Meta · 2 Plan · 3 Actuar (herramientas) · 4 Observar"],
  cap: ["Every lap adds one unit of drift: errors the agent cannot see in its own work. The gate stops the cart, a human checks, drift resets to zero. Illustrative model, relative units, not measurements.", "Cada vuelta suma una unidad de deriva: errores que el agente no ve en su propio trabajo. La puerta detiene el carrito, un humano revisa y la deriva vuelve a cero. Modelo ilustrativo, unidades relativas, no mediciones."],
};
const bi = (key) => `<span lang="en">${T[key][0]}</span><span lang="es">${T[key][1]}</span>`;
const LV = [["No human check", "Sin revisión humana"], ["Human checks every 3 laps", "Revisión humana cada 3 vueltas"], ["Human checks every lap", "Revisión humana cada vuelta"]];
const ctl = `<div class="ctl"><label for="lv"><span lang="en">Supervision</span><span lang="es">Supervisión</span></label><input id="lv" type="range" min="0" max="2" step="1" value="0" aria-valuetext="">` +
  `<output id="lvname">${LV.map((l, i) => `<span data-lv="${i}"><span lang="en">${l[0]}</span><span lang="es">${l[1]}</span></span>`).join("")}</output></div>`;

const live = `
${MODEL_SRC}
const P = ${JSON.stringify(P)};
const GATE = ${JSON.stringify(GATE)}, BOOM_UP = ${BOOM_UP}, BOOM_DOWN = ${BOOM_DOWN};
const GAUGE = ${JSON.stringify(GAUGE)}, SWEEP = ${SWEEP}, START = ${START}, FULL = ${LIMIT * 1.4};
const lang = document.documentElement.lang === "es" ? "es" : "en";
const stage = document.querySelector(".iso-stage"), svg = stage.querySelector("svg");
const cart = svg.getElementById("cart"), boom = svg.getElementById("boom"), needle = svg.getElementById("needle");
const group = svg.getElementById("items");
const items = [...group.children].map((g) => ({ g, key: +g.dataset.k }));
const readout = document.querySelector("[data-readout]"), lv = document.getElementById("lv");
const still = matchMedia("(prefers-reduced-motion: reduce)");
const LAP = 7, HOLD = 1.6; // seconds per lap, seconds the gate holds the cart
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const tip = ${tip.toString().replace(/k\.lineOnTop/g, "lineOnTop")};
const needleAt = (f) => tip(START + SWEEP * f, -3, GAUGE.r - 5, GAUGE.z + GAUGE.h + 0.2);
let dist = 0, hold = 0, boomZ = BOOM_UP, every = EVERY[0], last = 0, frame = 0, visible = false;
const es = lang === "es";
function layer(x, y) { // cart sits in depth order among the static parts
  const key = depthOf([x, y, 0], P), next = items.find((i) => i.key > key);
  if (next) { if (cart.nextElementSibling !== next.g || cart.parentNode !== group) group.insertBefore(cart, next.g); }
  else if (cart.parentNode !== group || cart.nextElementSibling) group.appendChild(cart);
}
function draw() {
  const [x, y] = at(dist);
  cart.setAttribute("transform", translateAlong(P, [x, y, 0]));
  layer(x, y);
  boom.setAttribute("transform", translateAlong(P, [0, 0, boomZ]));
  const drift = driftAt(dist, every);
  needle.setAttribute("d", needleAt(clamp(drift / FULL, 0, 1)));
  const over = drift >= LIMIT;
  const mode = every === 0 ? (es ? "sin revisión" : "no human check") : (es ? "revisión cada " : "check every ") + every + (es ? (every === 1 ? " vuelta" : " vueltas") : (every === 1 ? " lap" : " laps"));
  const text = (es ? "deriva " : "drift ") + drift.toFixed(1) + " / " + LIMIT + (over ? (es ? " · FUERA DE LÍMITE" : " · PAST LIMIT") : "") + " · " + mode;
  if (readout.textContent !== text) readout.textContent = text;
  readout.style.color = over ? "var(--anatomy-red)" : "";
  stage.setAttribute("aria-valuetext", text);
  for (const s of document.querySelectorAll("#lvname > span")) s.hidden = s.dataset.lv !== lv.value;
}
function tick(now) {
  const dt = last ? Math.min((now - last) / 1000, 1 / 30) : 1 / 60;
  last = now;
  if (hold > 0) { hold -= dt; boomZ += (BOOM_DOWN - boomZ) * (1 - Math.exp(-dt / 0.12)); }
  else {
    boomZ += (BOOM_UP - boomZ) * (1 - Math.exp(-dt / 0.2));
    const nd = dist + (PERIM / LAP) * dt, before = crossings(dist), after = crossings(nd);
    if (after > before && fires(after, every)) { dist = GATE_S + (after - 1) * PERIM; hold = HOLD; } else dist = nd;
  }
  draw();
  frame = visible ? requestAnimationFrame(tick) : 0;
}
const run = () => { if (!frame && visible) { last = 0; frame = requestAnimationFrame(tick); } };
new IntersectionObserver((e) => { visible = e[e.length - 1].isIntersecting; if (visible) run(); }, { rootMargin: "120px 0px" }).observe(stage);
lv.addEventListener("input", () => { every = EVERY[+lv.value]; draw(); });
if (still.matches) dist = 2.5 * PERIM; // reduced motion: one still frame, slider still updates the gauge
draw();
if (!still.matches) run();
`;

let body = k.plateHtml({
  fig: "@@fig@@", title: "@@title@@", hint: "@@hint@@", readout: "drift 0.0 / " + LIMIT,
  keys: [{ mark: "lit", label: "@@k1@@" }, { mark: "raised", label: "@@k2@@" }],
  caption: "@@cap@@",
  body: `<div class="iso-stage" tabindex="-1" role="img" aria-label="">${svg}</div>${ctl}`,
});
for (const key of Object.keys(T)) body = body.replace(`@@${key}@@`, bi(key));

const CSS = `html[lang=en] [lang=es],html[lang=es] [lang=en]{display:none !important}
.ctl{display:flex;align-items:center;gap:16px;padding:8px 20px 12px;font-size:22px;color:var(--anatomy-strong)}
.ctl input{flex:1;min-width:120px;height:32px;accent-color:var(--anatomy-strong)}.ctl output{min-width:300px;text-align:right}
.iso-legend{font-size:20px;line-height:1.4}.iso-caption{display:none}.iso-plate-corner{font-size:18px !important}`;
const LANG = `<script>(function(){try{var m=/[?&]lang=(es|en)/.exec(location.search);document.documentElement.lang=m?m[1]:"en"}catch(e){}})()</script>`;
let html = k.pageHtml({ title: "Fig 2", theme: "dark", body, script: kitScript() + live, width: 900 });
html = html.replace("</head>", `${LANG}<style>${CSS}</style></head>`);
mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, html);
console.log("wrote", OUT, `(${items.length} static groups)`);
