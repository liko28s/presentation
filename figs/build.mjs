// Isometric "delivery bench" figure v2 for the deck (T13).
//   node figs/build.mjs   ->   public/figs/pipeline.html   (standalone, offline, framework-free)
// Truth source: ./model.mjs (v2). Its source is inlined into the page (no imports at runtime) and the
// build reads CAPS/STATIONS from the same module, so nothing is duplicated.
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import * as k from "/Users/sumapaz/.claude/skills/anatomy/kit/iso-kit.mjs";
import * as G from "/Users/sumapaz/.claude/skills/anatomy/kit/lathe.mjs";
import { tubePieces } from "/Users/sumapaz/.claude/skills/anatomy/kit/tube.mjs";
import { kitScript } from "/Users/sumapaz/.claude/skills/anatomy/scripts/inline-kit.mjs";
import { STATIONS, SLIDERS, CAPS, MAXLEVEL } from "./model.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const OUT = join(HERE, "..", "public", "figs", "pipeline.html");
const MODEL_SRC = readFileSync(join(HERE, "model.mjs"), "utf8").replace(/^export /gm, "");

// ---------------------------------------------------------------- world layout (x along the flow, z up)
const W = 1500;
const H = 520;
const ZC = 34; // pipe axis height
const FL = 3.4; // flange thickness
const PAD = 2.4; // raised port plate
const BD = 32; // half depth of every station
const RAD = { p1: 9, p2: 14, p3: 13, p4: 13 };
const NECK = [3.4, 4.6, 6.2, 8, 10.5]; // human-valve bore per review level (level 5 widest)
const rfOf = (r) => r * 1.36 + 1.6;

const X = {};
X.defA = -36; X.defB = 36;
X.codeA = 108; X.codeB = 192;
X.itA = 312; X.itB = 384;
X.funFl = 424; X.funA = X.funFl + FL; X.funB = X.funA + 52;
X.neckA = X.funB; X.valveA = X.neckA + 8; X.valveB = X.valveA + 52; X.neckB = X.valveB + 8;
X.outA = X.neckB; X.outB = X.outA + 30; X.outFl = X.outB + FL;
X.testA = 704; X.testB = 780;
X.delA = 920; X.delB = 980;
const QW = 40; // diverter block width
const LEG = 22;
const UNIT_DEF = {
  review: { cx: 252, rr: 11, rpipe: RAD.p2, tw: 64, td: 64, th: 118, zt: 94, win: [16, 104] },
  test: { cx: 640, rr: 8, rpipe: RAD.p3, tw: 48, td: 48, th: 94, zt: 74, win: [14, 80] },
  deliver: { cx: 850, rr: 8, rpipe: RAD.p4, tw: 48, td: 48, th: 94, zt: 74, win: [14, 80] },
};
const UN = {};
for (const [key, u] of Object.entries(UNIT_DEF)) {
  const ballR = u.rr + 4;
  const off = Math.sqrt(ballR * ballR - u.rr * u.rr);
  const face = -off - LEG - FL - PAD;
  const tank = { x: u.cx - u.tw / 2, y: face - u.td, w: u.tw, d: u.td, r: 5 };
  UN[key] = { k: key, ...u, ballR, off, face, tank, brEnd: face - 8, zh: rfOf(u.rpipe) + 1.4, shelf: { x0: u.cx - u.tw / 2 - 16, x1: u.cx + u.tw / 2 + 16, y0: tank.y - 14 } };
}
const PL = { x: -72, y: -48, w: 1162, d: 114, r: 10 };
const PLATE_H = 12;
const FOOT_H = 5;
const CONV = { x: X.delB, y: -20, w: 90, d: 40 };
const ROLLER_TOP = 20;
const GAUGE = { x: X.testA + 28, y: -2, z: 75, r: 12.6 };
const ITG = { x: X.itA + 20, y: -6, z: 72, r: 8.4 }; // internal-test gauge
const IT_SCAN = { x: 360, y0: -22, y1: 22, zBar: 90 };

const P = k.fitProjection(
  [
    ...k.boxCorners(PL, -PL.d * 0 - PLATE_H - FOOT_H, 0),
    ...Object.values(UN).flatMap((u) => [[u.shelf.x0, u.shelf.y0, 0], [u.shelf.x1, u.shelf.y0, 0], [u.tank.x, u.tank.y, u.th + 16], [u.tank.x + u.tank.w, u.tank.y + u.tank.d, u.th + 16]]),
    [(X.valveA + X.valveB) / 2, 0, 128],
    [X.delB + 90, 20, 14],
    [0, 0, 106], [150, 0, 112], [GAUGE.x, 0, 90], [IT_SCAN.x, 0, 110],
  ],
  W, H, { pad: 14, azimuth: 66, elevation: 26 },
);
const at = (p) => k.iso(p, P);

// ---------------------------------------------------------------- svg helpers
const parts = { solids: 0, lamps: 0, lines: 0, variants: 0 };
const S = (paths, style) => { parts.solids++; return k.solidSvg(paths, style); };
const L = (d, style) => { parts.lines++; return k.lineSvg(d, style); };
const D = (pts, style) => k.dotsSvg(pts, style);
const byDepth = (pts) => [...pts].sort((a, b) => k.depthOf([a[0], a[1], 0], P) - k.depthOf([b[0], b[1], 0], P));
const quadX = (x, y0, y1, z0, z1) => k.pathOf([[x, y0, z0], [x, y1, z0], [x, y1, z1], [x, y0, z1]].map((p) => at(p)), true);
const quadY = (y, x0, x1, z0, z1) => k.pathOf([[x0, y, z0], [x1, y, z0], [x1, y, z1], [x0, y, z1]].map((p) => at(p)), true);
const rec = (d) => `<path class="rec" d="${d}"/>`;
const bi = (en, es) => `<span lang="en">${en}</span><span lang="es">${es}</span>`;
const frameX = (x, y, z) => G.frameAlong([x, y, z], [1, 0, 0]);
const screws = (y, pts) => D(pts.map(([x, z]) => at([x, y, z])), { size: 0.5 });
const grp = (st, inner) => `<g data-st="${st}">${inner}</g>`;

// ---------------------------------------------------------------- bench
const SH = Object.values(UN).map((u) => u.shelf);
function plateRing(inset = 0) {
  const x0 = PL.x + inset, y0 = PL.y + inset, x1 = PL.x + PL.w - inset, y1 = PL.y + PL.d - inset;
  const pts = [[x0, y0]];
  for (const s of SH) pts.push([s.x0 + inset, y0], [s.x0 + inset, s.y0 + inset], [s.x1 - inset, s.y0 + inset], [s.x1 - inset, y0]);
  pts.push([x1, y0], [x1, y1], [x0, y1]);
  return pts;
}

function plaque(cx, en, es, fs = 10, tone = "mid") {
  const n = Math.max(en.length, es.length);
  const w = Math.round(n * 0.6 * fs + 18);
  const plan = { x: cx - w / 2, y: 39, w, d: 19, r: 2 };
  const out = [S(k.slabOf(plan, 0, 0.8, P, 3), { tone: "lo", crease: "none" })];
  out.push(L(k.planOutline(k.insetPlan(plan, 1.6), 0.8, P, 3), { tone: "faint" }));
  const text = (lang, s) => `<text class="iso-face-text" lang="${lang}" data-tone="${tone}" transform="${k.topMatrix([cx - (s.length * 0.6 * fs) / 2, 49 + fs * 0.3], 0.8, P, "x")}" font-size="${fs}">${s}</text>`;
  out.push(text("en", en), text("es", es));
  out.push(D([at([plan.x + 3.8, plan.y + plan.d / 2, 0.8]), at([plan.x + w - 3.8, plan.y + plan.d / 2, 0.8])], { size: 0.45 }));
  return out.join("");
}

function bench() {
  const slab = (z, h, bevel) => k.extrude(plateRing(0), z, h, P, { convex: false, bevel });
  const out = [`<path class="iso-halo" d="${slab(-PLATE_H - FOOT_H, PLATE_H).fill}"/>`];
  const feet = [[-46, -22], [-46, 44], [540, -22], [540, 44], [1060, -22], [1060, 44]];
  for (const s of SH) feet.push([s.x0 + 14, s.y0 + 20], [s.x1 - 14, s.y0 + 20]);
  for (const [x, y] of byDepth(feet)) out.push(S(k.cylinder(x, y, 7.4, -PLATE_H - FOOT_H, FOOT_H, P, 28, 0.5), { tone: "lo" }));
  out.push(S(slab(-PLATE_H, PLATE_H, 1.6), { tone: "mid" }));
  out.push(L(k.onTop(plateRing(5), 0, P, true), { tone: "lo" }));
  const sc = [[PL.x + 10, PL.y + 10], [PL.x + PL.w - 10, PL.y + 10], [PL.x + 10, PL.y + PL.d - 10], [PL.x + PL.w - 10, PL.y + PL.d - 10], [PL.x + PL.w / 2, PL.y + PL.d - 10]];
  for (const s of SH) sc.push([s.x0 + 10, s.y0 + 10], [s.x1 - 10, s.y0 + 10]);
  out.push(L(sc.map(([x, y]) => k.ring(x, y, 2.4, 0, P, 16)).join(""), { tone: "lo" }));
  out.push(D(sc.map(([x, y]) => at([x, y, 0])), { size: 0.55 }));
  const strip = { x: -58, y: PL.y + PL.d - 11, w: PL.w - 28, d: 5.6, r: 1 };
  out.push(S(k.slabOf(strip, 0, 0.6, P, 3), { tone: "lo", crease: "none" }));
  const t = k.topTicks(strip.x + 4, strip.x + strip.w - 4, 5, 5, strip.y + 0.6, 0.6, [1.9, 3.4], P);
  out.push(L(t.minor, { tone: "lo" }), L(t.major, { tone: "mid" }));
  out.push(D([at([strip.x + 2, strip.y + 2.8, 0.6]), at([strip.x + strip.w - 2, strip.y + 2.8, 0.6])], { size: 0.45 }));
  return out.join("");
}

// ---------------------------------------------------------------- LED bars and level pips on vertical faces
function lampBar(name, x0, y, z0) {
  const w = 5.6, gap = 2.4, h = 4;
  const total = 4 * w + 3 * gap;
  const out = [rec(quadY(y, x0 - 1.5, x0 + total + 1.5, z0 - 1.5, z0 + h + 1.5))];
  for (let j = 0; j < 4; j++) {
    parts.lamps++;
    out.push(`<path class="lamp" data-lamp="${name}" data-seg="${j}" d="${quadY(y, x0 + j * (w + gap), x0 + j * (w + gap) + w, z0, z0 + h)}"/>`);
  }
  return out.join("");
}
function pipBar(name, n, x0, y, z0) {
  const w = 5, gap = 2.2, h = 4.4;
  const total = n * w + (n - 1) * gap;
  const out = [rec(quadY(y, x0 - 1.5, x0 + total + 1.5, z0 - 1.5, z0 + h + 1.5))];
  for (let j = 0; j < n; j++) {
    parts.lamps++;
    out.push(`<path class="pip" data-pip="${name}" data-i="${j}" d="${quadY(y, x0 + j * (w + gap), x0 + j * (w + gap) + w, z0, z0 + h)}"/>`);
  }
  return out.join("");
}

// ---------------------------------------------------------------- glass pipes with a fluid and a crate lane
const LANES = [];
const defs = [];
const FILL_ID = [];

function supportBack(s, r, axis, fixed) {
  const bx = axis === "x" ? { x: s - 8, y: fixed - (r - 1), w: 16, d: 2 * (r - 1), r: 1.5 } : { x: fixed - (r - 1), y: s - 8, w: 2 * (r - 1), d: 16, r: 1.5 };
  const post = axis === "x" ? [s, fixed - (r + 2.8)] : [fixed - (r + 2.8), s];
  return S(k.slabOf(bx, 0, ZC - r, P, 3, 0.5), { tone: "mid" }) + S(k.cylinder(post[0], post[1], 1.5, 0, ZC + r, P, 12), { tone: "lo", crease: "none" });
}
function supportFront(s, r, axis, fixed) {
  const post = axis === "x" ? [s, fixed + (r + 2.8)] : [fixed + (r + 2.8), s];
  const strap = axis === "x" ? { x: s - 2.6, y: fixed - (r + 4.4), w: 5.2, d: 2 * (r + 4.4), r: 1.2 } : { x: fixed - (r + 4.4), y: s - 2.6, w: 2 * (r + 4.4), d: 5.2, r: 1.2 };
  return (
    S(k.cylinder(post[0], post[1], 1.5, 0, ZC + r, P, 12), { tone: "lo", crease: "none" }) +
    S(k.slabOf(strap, ZC + r, 2, P, 2, 0.3), { tone: "mid" }) +
    D([at([strap.x + strap.w / 2, strap.y + 1.8, ZC + r + 2]), at([strap.x + strap.w / 2, strap.y + strap.d - 1.8, ZC + r + 2])], { size: 0.45 })
  );
}

function pipe({ id, a, b, r, axis = "x", fixed = 0, dir = 1, zc = ZC, fluid = true, flangeA = true, flangeB = true, boltA = true, boltB = false, supports = [] }) {
  const rf = rfOf(r);
  const pt = axis === "x" ? (t) => [t, fixed, zc] : axis === "y" ? (t) => [fixed, t, zc] : (t) => [fixed[0], fixed[1], t];
  const piece = tubePieces([pt(a), pt(b)], r, P, { maxLength: 4000, caps: true })[0];
  const dirv = axis === "x" ? [dir, 0, 0] : axis === "y" ? [0, dir, 0] : [0, 0, dir];
  const out = [];
  for (const t of supports) out.push(supportBack(t, r, axis, fixed));
  if (flangeA) {
    const F = G.frameAlong(pt(a - dir * FL), dirv);
    out.push(S(G.disc(0, FL, rf, F, P), { tone: "mid" }));
    if (boltA) out.push(D(G.dotsOf(F, FL, rf * 0.78, 8, P, { all: true }), { size: 0.55 }));
  }
  out.push(`<path class="tb-body" d="${piece.body}"/>`);
  defs.push(`<clipPath id="c-${id}"><path d="${piece.body}"/></clipPath>`);
  if (fluid) {
    defs.push(`<clipPath id="lv-${id}"><polygon id="lvp-${id}" points=""/></clipPath><clipPath id="lt-${id}"><polygon id="ltp-${id}" points=""/></clipPath>`);
    out.push(`<g clip-path="url(#c-${id})"><path class="fluid" clip-path="url(#lv-${id})" d="${piece.body}"/><path class="fluid-top" clip-path="url(#lt-${id})" d="${piece.body}"/></g>`);
    FILL_ID.push(id);
  }
  out.push(`<g class="lane" id="lane-${id}" clip-path="url(#c-${id})"></g>`);
  out.push(`<path class="tb-shine" d="${piece.shine}"/><path class="tb-shade" d="${piece.shade}"/>`);
  out.push(`<path class="iso-line tb-edge" data-tone="hi" d="${piece.edges}"/>`);
  if (flangeB) {
    const F = G.frameAlong(pt(b), dirv);
    out.push(S(G.disc(0, FL, rf, F, P), { tone: "mid" }));
    if (boltB) out.push(D(G.dotsOf(F, 0, rf * 0.78, 8, P, { all: true }), { size: 0.55 }));
  }
  for (const t of supports) out.push(supportFront(t, r, axis, fixed));
  LANES.push({ id, axis, lo: Math.min(a, b), hi: Math.max(a, b), r, fixed, fluid, dir, zc });
  return out.join("");
}

function glassCone(id, paths) {
  defs.push(`<clipPath id="c-${id}"><path d="${paths.fill}"/></clipPath>`);
  const shades = paths.shades.map((d, i) => (d ? `<path class="iso-shade" data-shade="${i}" d="${d}"/>` : "")).join("");
  return `<g class="iso-solid glass"${paths.seamless ? " data-seamless" : ""}><path class="iso-fill" d="${paths.fill}"/>${shades}${paths.top ? `<path class="iso-top" d="${paths.top}"/>` : ""}<g class="lane" id="lane-${id}" clip-path="url(#c-${id})"></g><path class="iso-line iso-edge" data-tone="hi" d="${paths.outline}"/></g>`;
}

function portPad(face, dirx, r) {
  const h = rfOf(r) + 1.6;
  const tone = dirx > 0 ? "mid" : "lo";
  const plan = dirx > 0 ? { x: face, y: -h, w: PAD, d: 2 * h, r: 2.4 } : { x: face - PAD, y: -h, w: PAD, d: 2 * h, r: 2.4 };
  return S(k.slabOf(plan, ZC - h, 2 * h, P, 3, 0.3), { tone, crease: "faint" });
}
const plinth = (a, b, extra = 3) => S(k.slabOf({ x: a - extra, y: -BD - 3, w: b - a + 2 * extra, d: 2 * BD + 6, r: 3.5 }, 0, 6, P, 5, 0.6), { tone: "lo" });

// ---------------------------------------------------------------- stations
const DEF_WIN = { x0: -30, x1: -6, z0: 14, z1: 50 };
function define() {
  const out = [];
  const B = { x: X.defA, y: -BD, w: X.defB - X.defA, d: 2 * BD, r: 3 };
  out.push(plinth(X.defA, X.defB));
  out.push(S(k.slabOf(B, 6, 52, P, 5, 0.8), { tone: "mid", inner: L(k.sideSeam(B, 24, P, 5), { tone: "faint" }) }));
  out.push(S(k.slabOf(k.insetPlan(B, 2.6), 58, 3.4, P, 4, 0.5), { tone: "mid" }));
  const F = G.frameOf([0, 0, 61.4], [0, 0, 1], [1, 0, 0], [0, 1, 0]);
  const cone = (s) => 19 + ((s - 2) * (31 - 19)) / 30;
  const prof = [[0, 17], [2, 17], [2, 19, 1]];
  for (let s = 6; s <= 32; s += 4) prof.push([s, cone(s), 1]);
  prof.push([32, 31], [32, 32.8], [35.4, 32.8], [35.4, 31]);
  out.push(S(G.solidOf(prof, F, P), { tone: "mid", crease: "faint" }));
  out.push(`<path class="hole" d="${G.circleOf(F, 35.4, 29.6, P, 56)}"/>`);
  out.push(L(G.circleOf(F, 35.4, 29.6, P, 56), { tone: "lo" }));
  const y = BD, w = DEF_WIN;
  out.push(rec(quadY(y, w.x0, w.x1, w.z0, w.z1)));
  out.push(`<path class="fx" id="fx-def" d=""/>`);
  out.push(L(quadY(y, w.x0, w.x1, w.z0, w.z1), { tone: "mid" }));
  for (let z = w.z0 + 4; z < w.z1 - 1; z += 4) out.push(L(k.segment([w.x0, y, z], [w.x0 + (Math.round((z - w.z0) / 4) % 4 === 0 ? 5 : 2.8), y, z], P), { tone: "mid" }));
  out.push(lampBar("define", 8, y, 44));
  for (let i = 0; i < 4; i++) out.push(rec(quadY(y, 8, 33, 14 + i * 5, 16.4 + i * 5)));
  out.push(screws(y, [[-31, 10], [31, 10], [-31, 54], [31, 54]]));
  out.push(portPad(X.defB, 1, RAD.p1));
  return out.join("");
}

function code() {
  const out = [];
  const B = { x: X.codeA, y: -BD, w: X.codeB - X.codeA, d: 2 * BD, r: 3 };
  out.push(portPad(X.codeA, -1, RAD.p1));
  out.push(plinth(X.codeA, X.codeB));
  out.push(S(k.slabOf(B, 6, 56, P, 5, 0.8), { tone: "mid", inner: L(k.sideSeam(B, 24, P, 5), { tone: "faint" }) }));
  const cover = k.insetPlan(B, 4);
  out.push(S(k.slabOf(cover, 62, 5, P, 4, 0.5), { tone: "mid", inner: L(k.sideSeam(cover, 64.5, P, 4), { tone: "faint" }) }));
  out.push(D(k.corners(cover, 4).map(([x, y]) => at([x, y, 67])), { size: 0.5 }));
  const c = [(X.codeA + X.codeB) / 2, 0];
  out.push(S(k.cylinder(c[0], c[1], 16, 67, 22, P, 44, 0.6), { tone: "hi" }));
  out.push(L(k.sideArc(c[0], c[1], 16, 73, P, 28), { tone: "faint" }));
  out.push(L(k.sideArc(c[0], c[1], 16, 83, P, 28), { tone: "faint" }));
  out.push(L(k.knurl(c[0], c[1], 16, 67, 72, 48, P, 0.3), { tone: "lo" }));
  out.push(S(k.cylinder(c[0], c[1], 6.4, 89, 2.4, P, 24), { tone: "mid" }));
  out.push(`<g id="ram"></g>`);
  const tl = [X.codeB - 14, -20];
  out.push(S(k.cylinder(tl[0], tl[1], 2.8, 67, 10, P, 16), { tone: "mid", crease: "none" }));
  out.push(S(k.cylinder(tl[0], tl[1], 3.8, 77, 2.4, P, 16), { tone: "lo" }));
  out.push(`<path class="lampdot" id="lamp-code" d="${k.ring(tl[0], tl[1], 1.5, 79.4, P, 12)}"/>`);
  const y = BD;
  out.push(lampBar("code", X.codeA + 40, y, 44));
  out.push(pipBar("code", MAXLEVEL.code, X.codeA + 8, y, 44));
  for (let i = 0; i < 3; i++) out.push(rec(quadY(y, X.codeA + 8, X.codeA + 34, 14 + i * 5, 16.4 + i * 5)));
  out.push(rec(quadY(y, X.codeA + 40, X.codeB - 8, 14, 34)));
  out.push(L(k.segment([X.codeA + 40, y, 24], [X.codeB - 8, y, 24], P), { tone: "faint" }));
  out.push(screws(y, [[X.codeA + 4, 10], [X.codeB - 4, 10], [X.codeA + 4, 58], [X.codeB - 4, 58]]));
  out.push(portPad(X.codeB, 1, RAD.p2));
  return out.join("");
}

// internal test substation: chamber + gauge + scanner gantry (idle and dark at review level 1)
function internalTest() {
  const out = [];
  const B = { x: X.itA, y: -BD, w: X.itB - X.itA, d: 2 * BD, r: 3 };
  out.push(portPad(X.itA, -1, RAD.p2));
  out.push(plinth(X.itA, X.itB));
  out.push(S(k.slabOf(B, 6, 56, P, 5, 0.8), { tone: "mid", inner: L(k.sideSeam(B, 24, P, 5), { tone: "faint" }) }));
  const lid = k.insetPlan(B, 3);
  out.push(S(k.slabOf(lid, 62, 4, P, 4, 0.5), { tone: "mid", inner: L(k.sideSeam(lid, 64, P, 4), { tone: "faint" }) }));
  out.push(D(k.corners(lid, 4).map(([x, y]) => at([x, y, 66])), { size: 0.5 }));
  // gauge
  const g = ITG;
  out.push(S(k.cylinder(g.x, g.y, 12, 66, 6, P, 40, 0.6), { tone: "hi", crease: "lo" }));
  out.push(L(k.knurl(g.x, g.y, 12, g.z - 2.4, g.z, 56, P, 0.3), { tone: "lo" }));
  out.push(L(k.ring(g.x, g.y, 10.6, g.z, P, 40), { tone: "lo" }));
  const tk = k.radialTicks(g.x, g.y, 9.8, 24, 4, g.z, [1, 2.2], P, -Math.PI * 0.75, Math.PI * 1.5);
  out.push(L(tk.minor, { tone: "lo" }), L(tk.major, { tone: "mid" }));
  out.push(L(k.ring(g.x, g.y, 1.4, g.z, P, 12), { tone: "mid" }));
  out.push(`<path class="iso-line needle" id="it-needle" data-tone="hi" data-free="start" d=""/>`);
  // scanner gantry: two posts, a bar along y and a head that slides on it
  const s = IT_SCAN;
  for (const py of [s.y0, s.y1]) out.push(S(k.cylinder(s.x, py, 2.2, 66, s.zBar - 66, P, 14), { tone: "lo", crease: "none" }));
  out.push(S(k.slabOf({ x: s.x - 2, y: s.y0 - 3, w: 4, d: s.y1 - s.y0 + 6, r: 1 }, s.zBar, 4, P, 2, 0.3), { tone: "mid" }));
  out.push(`<g id="it-head"></g>`);
  // front face
  const y = BD;
  out.push(rec(quadY(y, X.itA + 6, X.itA + 36, 14, 42)));
  out.push(`<path class="scan" id="it-scan" d=""/>`);
  out.push(`<path class="shut" id="it-shut" d="${quadY(y, X.itA + 6, X.itA + 36, 14, 42)}"/>`);
  out.push(L(quadY(y, X.itA + 6, X.itA + 36, 14, 42), { tone: "mid" }));
  out.push(lampBar("it", X.itA + 40, y, 44));
  for (let i = 0; i < 3; i++) out.push(rec(quadY(y, X.itA + 40, X.itA + 62, 14 + i * 5, 16.4 + i * 5)));
  out.push(screws(y, [[X.itA + 4, 10], [X.itB - 4, 10], [X.itA + 4, 58], [X.itB - 4, 58]]));
  out.push(portPad(X.itB, 1, RAD.p2));
  return out.join("");
}

// diverter block on the pipe + riser + elbow ball (to the queue tank behind)
function diverter(u) {
  const out = [];
  const blk = { x: u.cx - QW / 2, y: -22, w: QW, d: 44, r: 2.5 };
  const zh = u.zh;
  out.push(S(k.slabOf(blk, ZC - zh, 2 * zh, P, 3, 0.7), { tone: "mid" }));
  const top = ZC + zh;
  out.push(D(k.corners(blk, 3.2).map(([x, y]) => at([x, y, top])), { size: 0.5 }));
  out.push(rec(quadY(22, u.cx - 6, u.cx + 6, ZC - 11, ZC - 3)));
  out.push(`<path class="lampdot" id="lamp-div-${u.k}" d="${quadY(22, u.cx - 4, u.cx + 4, ZC - 9, ZC - 5)}"/>`);
  out.push(screws(22, [[blk.x + 4, ZC - zh + 4], [blk.x + QW - 4, ZC - zh + 4], [blk.x + 4, ZC + zh - 4], [blk.x + QW - 4, ZC + zh - 4]]));
  const F = G.frameAlong([u.cx, 0, top], [0, 0, 1]);
  const rf = rfOf(u.rr);
  out.push(S(G.disc(0, FL, rf, F, P), { tone: "mid" }) + D(G.dotsOf(F, FL, rf * 0.78, 8, P, { all: true }), { size: 0.55 }));
  out.push(pipe({ id: `${u.k}z`, a: top + FL, b: u.zt - u.off, r: u.rr, axis: "z", fixed: [u.cx, 0], flangeA: false, flangeB: false, fluid: false }));
  out.push(S(G.sphereOf([u.cx, 0, u.zt], u.ballR, P), { tone: "mid" }));
  return grp(u.k, out.join(""));
}

function tank(u) {
  const out = [];
  const T = u.tank;
  out.push(S(k.slabOf({ x: T.x - 3, y: T.y - 3, w: T.w + 6, d: T.d + 6, r: 6 }, 0, 5, P, 6, 0.6), { tone: "lo" }));
  const seams = [30, Math.round(u.th * 0.63)].map((z) => L(k.sideSeam(T, z, P, 6), { tone: "faint" })).join("");
  out.push(S(k.slabOf(T, 5, u.th - 5, P, 6, 0.9), { tone: "mid", inner: seams }));
  const cap = k.insetPlan(T, 3);
  out.push(S(k.slabOf(cap, u.th, 4, P, 5, 0.5), { tone: "mid", inner: L(k.sideSeam(cap, u.th + 2, P, 5), { tone: "faint" }) }));
  const vent = [T.x + 12, T.y + T.d - 12];
  out.push(S(k.cylinder(vent[0], vent[1], 4.4, u.th + 4, 6, P, 20), { tone: "mid" }));
  out.push(S(k.cylinder(vent[0], vent[1], 5.8, u.th + 10, 2.4, P, 20), { tone: "lo" }));
  out.push(D(k.corners(cap, 5).map(([x, y]) => at([x, y, u.th + 4])), { size: 0.5 }));
  const x = T.x + T.w;
  const y0 = T.y + 9, y1 = T.y + T.d - 11, z0 = u.win[0], z1 = u.win[1];
  out.push(L(quadX(x, y0 - 2.6, y1 + 2.6, z0 - 2.6, z1 + 2.6), { tone: "mid" }));
  out.push(rec(quadX(x, y0, y1, z0, z1)));
  out.push(`<path class="qfluid" id="fx-q-${u.k}" d=""/>`);
  out.push(L(quadX(x, y0, y1, z0, z1), { tone: "mid" }));
  out.push(`<path class="iso-line qline" id="fx-ql-${u.k}" data-tone="hi" d=""/>`);
  for (let z = z0 + 8; z < z1 - 1; z += 8) {
    const big = Math.round((z - z0) / 8) % 4 === 0;
    out.push(L(k.segment([x, y0, z], [x, y0 + (big ? 8 : 4.6), z], P), { tone: big ? "mid" : "lo" }));
  }
  out.push(D([at([x, y0 - 1.3, z0 - 1.3]), at([x, y1 + 1.3, z0 - 1.3]), at([x, y0 - 1.3, z1 + 1.3]), at([x, y1 + 1.3, z1 + 1.3])], { size: 0.5 }));
  const h = rfOf(u.rr) + 1.6;
  out.push(S(k.slabOf({ x: u.cx - h, y: T.y + T.d, w: 2 * h, d: PAD, r: 2 }, u.zt - h, 2 * h, P, 3, 0.3), { tone: "mid" }));
  for (const x0 of [T.x + 3.5, T.x + T.w - 8.5]) {
    out.push(rec(quadY(T.y + T.d, x0, x0 + 5, 30, u.th - 28)));
    out.push(screws(T.y + T.d, [[x0 + 2.5, 24], [x0 + 2.5, u.th - 22]]));
  }
  out.push(S(G.disc(0, 8, 3.4, G.frameAlong([x, T.y + 22, 12], [1, 0, 0]), P), { tone: "mid" }));
  out.push(S(G.disc(8, 10.4, 5, G.frameAlong([x, T.y + 22, 12], [1, 0, 0]), P), { tone: "lo" }));
  return grp(u.k, out.join(""));
}

// human review valve: plinth, level-dependent bore (funnel + necks per level), body, bonnet, wheel
function reviewValve(neckVariants) {
  const out = [];
  out.push(S(k.slabOf({ x: X.valveA - 3, y: -BD - 3, w: X.valveB - X.valveA + 6, d: 2 * BD + 6, r: 3.5 }, 0, 6, P, 5, 0.6), { tone: "lo" }));
  out.push(neckVariants);
  const VB = { x: X.valveA, y: -30, w: X.valveB - X.valveA, d: 60, r: 3 };
  out.push(S(k.slabOf(VB, 6, 62, P, 4, 0.9), { tone: "hi", inner: L(k.sideSeam(VB, 24, P, 4), { tone: "faint" }) }));
  const bonnet = { x: X.valveA + 10, y: -16, w: X.valveB - X.valveA - 20, d: 32, r: 3 };
  out.push(S(k.slabOf(bonnet, 68, 9, P, 3, 0.6), { tone: "hi" }));
  out.push(D(k.corners(bonnet, 3.6).map(([x, y]) => at([x, y, 77])), { size: 0.5, tone: "hi" }));
  out.push(D(k.corners(VB, 4.6).map(([x, y]) => at([x, y, 68])), { size: 0.5, tone: "hi" }));
  const y = 30;
  out.push(lampBar("review", X.valveA + 9, y, 48));
  out.push(rec(quadY(y, X.valveA + 8, X.valveB - 8, 13, 34)));
  out.push(pipBar("review", MAXLEVEL.review, X.valveA + 6.4, y, 38));
  for (let i = 0; i < 3; i++) out.push(L(quadY(y, X.valveA + 16, X.valveB - 16, 18 + i * 5, 20.2 + i * 5), { tone: "lo" }));
  out.push(screws(y, [[X.valveA + 11, 16], [X.valveB - 11, 16], [X.valveA + 11, 31], [X.valveB - 11, 31], [X.valveA + 4, 8], [X.valveB - 4, 8], [X.valveA + 4, 58], [X.valveB - 4, 58]]));
  out.push(`<g id="wheel"></g>`);
  return out.join("");
}

function test() {
  const out = [];
  const B = { x: X.testA, y: -BD, w: X.testB - X.testA, d: 2 * BD, r: 3 };
  out.push(portPad(X.testA, -1, RAD.p3));
  out.push(plinth(X.testA, X.testB));
  out.push(S(k.slabOf(B, 6, 56, P, 5, 0.8), { tone: "mid", inner: L(k.sideSeam(B, 24, P, 5), { tone: "faint" }) }));
  const lid = k.insetPlan(B, 3);
  out.push(S(k.slabOf(lid, 62, 4, P, 4, 0.5), { tone: "mid", inner: L(k.sideSeam(lid, 64, P, 4), { tone: "faint" }) }));
  const g = GAUGE, GT = g.z;
  out.push(S(k.cylinder(g.x, g.y, 18, 66, 9, P, 56, 0.7), { tone: "hi", crease: "lo" }));
  out.push(L(k.knurl(g.x, g.y, 18, GT - 3, GT, 72, P, 0.3), { tone: "lo" }));
  out.push(L(k.sideArc(g.x, g.y, 18, GT - 3, P, 36), { tone: "faint" }));
  out.push(L(k.ring(g.x, g.y, 16, GT, P, 56), { tone: "lo" }));
  const tk = k.radialTicks(g.x, g.y, 14.6, 40, 5, GT, [1.2, 2.6], P, -Math.PI * 0.75, Math.PI * 1.5);
  out.push(L(tk.minor, { tone: "lo" }), L(tk.major, { tone: "mid" }));
  out.push(L(k.ring(g.x, g.y, 1.6, GT, P, 12), { tone: "mid" }));
  out.push(`<path class="iso-line needle" id="needle" data-tone="hi" data-free="start" d=""/>`);
  // probes: one more installed per test level
  for (let i = 0; i < MAXLEVEL.test; i++) {
    const sx = X.testB - 14, sy = -21 + i * 14;
    out.push(`<g class="probe" data-i="${i}">` + S(k.cylinder(sx, sy, 3.6, 66, 5, P, 18), { tone: "mid" }) + S(k.cylinder(sx, sy, 2.1, 71, 12, P, 14), { tone: "lo", crease: "none" }) + `</g>`);
  }
  const y = BD;
  out.push(lampBar("test", X.testA + 40, y, 44));
  out.push(rec(quadY(y, X.testA + 8, X.testA + 32, 14, 40)));
  out.push(L(quadY(y, X.testA + 8, X.testA + 32, 14, 40), { tone: "mid" }));
  out.push(S(k.slabOf({ x: X.testA + 28, y, w: 2.4, d: 2.6, r: 0.8 }, 22, 10, P, 2, 0.2), { tone: "mid", crease: "none" }));
  out.push(pipBar("test", MAXLEVEL.test, X.testA + 40, y, 14));
  for (let i = 0; i < 2; i++) out.push(rec(quadY(y, X.testA + 40, X.testA + 68, 22 + i * 5, 24.4 + i * 5)));
  out.push(screws(y, [[X.testA + 4, 10], [X.testB - 4, 10], [X.testA + 4, 58], [X.testB - 4, 58]]));
  out.push(D([at([X.testA + 10, y, 16]), at([X.testA + 10, y, 38]), at([X.testA + 30, y, 16])], { size: 0.5 }));
  out.push(portPad(X.testB, 1, RAD.p4));
  return out.join("");
}

function conveyorBase() {
  const out = [];
  for (const y of [CONV.y, CONV.y + CONV.d - 3.6]) out.push(S(k.slabOf({ x: CONV.x, y, w: CONV.w, d: 3.6, r: 1 }, 9, 9, P, 3, 0.4), { tone: "mid" }));
  for (const lx of [CONV.x + 14, CONV.x + CONV.w - 14]) {
    for (const ly of [CONV.y + 1.8, CONV.y + CONV.d - 1.8]) out.push(S(k.cylinder(lx, ly, 2.2, 0, 9, P, 12), { tone: "lo", crease: "none" }));
  }
  out.push(S(k.slabOf({ x: CONV.x + CONV.w - 3.4, y: CONV.y, w: 3.4, d: CONV.d, r: 1 }, 9, 17, P, 3, 0.4), { tone: "mid" }));
  for (let i = 0; i < 8; i++) {
    const rx = CONV.x + 8 + i * 10.4;
    out.push(`<g class="roll" data-i="${i}">` + S(G.disc(-15.4, 15.4, 3.2, G.frameAlong([rx, 0, ROLLER_TOP - 3.2], [0, 1, 0]), P), { tone: "mid" }) + `</g>`);
  }
  out.push(D(byDepth([[CONV.x + 4, CONV.y + 1.8], [CONV.x + CONV.w - 8, CONV.y + 1.8], [CONV.x + 4, CONV.y + CONV.d - 1.8]]).map(([x, y]) => at([x, y, 18])), { size: 0.45 }));
  return out.join("");
}

function deliver() {
  const out = [];
  const B = { x: X.delA, y: -BD, w: X.delB - X.delA, d: 2 * BD, r: 3 };
  out.push(S(k.slabOf({ x: B.x - 3, y: -BD - 3, w: B.w + 3, d: 2 * BD + 6, r: 3.5 }, 0, 6, P, 5, 0.6), { tone: "lo" }));
  out.push(S(k.slabOf(B, 6, 50, P, 5, 0.8), { tone: "mid", inner: L(k.sideSeam(B, 24, P, 5), { tone: "faint" }) }));
  const roof = k.insetPlan(B, 3);
  out.push(S(k.slabOf(roof, 56, 4, P, 4, 0.5), { tone: "mid", inner: L(k.sideSeam(roof, 58, P, 4), { tone: "faint" }) }));
  out.push(L(quadX(X.delB, -19, 19, 12, 46), { tone: "mid" }));
  out.push(rec(quadX(X.delB, -17, 17, 14, 44)));
  out.push(S(k.cylinder(X.delA + 12, -22, 2.6, 60, 12, P, 14), { tone: "mid", crease: "none" }));
  out.push(S(k.cylinder(X.delA + 12, -22, 3.8, 72, 3, P, 16), { tone: "lo" }));
  out.push(`<path class="lampdot" id="lamp-del" d="${k.ring(X.delA + 12, -22, 1.6, 75.2, P, 12)}"/>`);
  const y = BD;
  out.push(lampBar("deliver", X.delA + 14, y, 44));
  out.push(rec(quadY(y, X.delA + 7, X.delB - 8, 14, 34)));
  out.push(pipBar("deliver", MAXLEVEL.deliver, X.delA + 14, y, 24));
  out.push(L(k.segment([X.delA + 7, y, 40], [X.delB - 8, y, 40], P), { tone: "faint" }));
  out.push(screws(y, [[B.x + 4, 10], [X.delB - 4, 10], [B.x + 4, 52], [X.delB - 4, 52]]));
  out.push(D(k.corners(roof, 4).map(([x, yy]) => at([x, yy, 60])), { size: 0.5 }));
  return out.join("");
}

// ---------------------------------------------------------------- assemble in painter's order (far to near, bottom to top)
const coneProfile = (s0, s1, r0, r1) => { const pr = []; for (let i = 0; i <= 7; i++) { const s = (i / 7) * (s1 - s0); pr.push([s, r0 + (r1 - r0) * (s / (s1 - s0)), 1]); } return pr; };
const variants = (make) => [1, 2, 3, 4, 5].map((lv) => `<g class="fv" data-lv="${lv}">${make(lv, NECK[lv - 1])}</g>`).join("");
const funnelVariants = variants((lv, nr) => glassCone(`fun${lv}`, G.solidOf(coneProfile(X.funA, X.funB, RAD.p2, nr), frameX(X.funA, 0, ZC), P)));
const outletVariants = variants((lv, nr) => glassCone(`out${lv}`, G.solidOf(coneProfile(X.outA, X.outB, nr, RAD.p3), frameX(X.outA, 0, ZC), P)));
const neckVariants = variants((lv, nr) => S(G.disc(0, X.valveA - X.neckA, nr, frameX(X.neckA, 0, ZC), P), { tone: "hi" }) + S(G.disc(0, X.neckB - X.valveB, nr, frameX(X.valveB, 0, ZC), P), { tone: "hi" }));
parts.variants = 16; // 4 extra copies each of funnel, outlet and 2 neck discs (one level shown at a time)
const funnelFlange = () => { const F = frameX(X.funFl, 0, ZC), rf = rfOf(RAD.p2); return S(G.disc(0, FL, rf, F, P), { tone: "mid" }) + D(G.dotsOf(F, FL, rf * 0.8, 8, P, { all: true }), { size: 0.55 }); };
const outletFlange = () => { const F = frameX(X.outB, 0, ZC), rf = rfOf(RAD.p3); return S(G.disc(0, FL, rf, F, P), { tone: "mid" }) + D(G.dotsOf(F, FL, rf * 0.78, 8, P, { all: true }), { size: 0.55 }); };

// horizontal overflow pipe from each elbow ball back to its tank (behind the line)
const overflow = (u) => pipe({ id: `${u.k}y`, a: -u.off, b: -u.off - LEG, r: u.rr, axis: "y", fixed: u.cx, dir: -1, zc: u.zt, flangeA: false, boltA: false, boltB: false });

const mid = (a, b) => (a + b) / 2;
const layers = [];
layers.push(bench());
layers.push([plaque(0, "DEFINE", "DEFINIR"), plaque(mid(X.codeA, X.codeB), "CODE", "CODIFICAR"), plaque(mid(X.itA, X.itB), "INTERNAL TEST", "PRUEBA INTERNA", 7.6), plaque(mid(X.valveA, X.valveB), "REVIEW", "REVISAR"), plaque(mid(X.testA, X.testB), "TEST", "PROBAR"), plaque(mid(X.delA, X.delB), "DELIVER", "ENTREGAR")].join(""));
for (const u of Object.values(UN)) layers.push(tank(u));
for (const u of Object.values(UN)) layers.push(grp(u.k, overflow(u)));
layers.push(define());
layers.push(pipe({ id: "p1", a: X.defB + PAD + FL, b: X.codeA - PAD - FL, r: RAD.p1, supports: [mid(X.defB, X.codeA)] }));
layers.push(grp("code", code()));
layers.push(pipe({ id: "p2a", a: X.codeB + PAD + FL, b: UN.review.cx - QW / 2 - FL, r: RAD.p2, supports: [mid(X.codeB, UN.review.cx - QW / 2)] }));
layers.push(diverter(UN.review));
layers.push(pipe({ id: "p2b", a: UN.review.cx + QW / 2 + FL, b: X.itA - PAD - FL, r: RAD.p2 }));
layers.push(grp("review", internalTest()));
layers.push(pipe({ id: "p2c", a: X.itB + PAD + FL, b: X.funFl, r: RAD.p2, flangeB: false }));
layers.push(grp("review", funnelFlange() + funnelVariants));
layers.push(grp("review", reviewValve(neckVariants)));
layers.push(grp("review", outletVariants + outletFlange()));
layers.push(pipe({ id: "p3a", a: X.outFl, b: UN.test.cx - QW / 2 - FL, r: RAD.p3, flangeA: false }));
layers.push(diverter(UN.test));
layers.push(pipe({ id: "p3b", a: UN.test.cx + QW / 2 + FL, b: X.testA - PAD - FL, r: RAD.p3 }));
layers.push(grp("test", test()));
layers.push(pipe({ id: "p4a", a: X.testB + PAD + FL, b: UN.deliver.cx - QW / 2 - FL, r: RAD.p4, supports: [mid(X.testB, UN.deliver.cx - QW / 2)] }));
layers.push(diverter(UN.deliver));
layers.push(pipe({ id: "p4b", a: UN.deliver.cx + QW / 2 + FL, b: X.delA - FL, r: RAD.p4 }));
layers.push(grp("deliver", conveyorBase()));
layers.push(`<g class="lane" id="lane-cv"></g>`);
layers.push(grp("deliver", deliver()));

const LABEL_EN = "An isometric bench of five stations joined by glass pipes: a define intake tank, a code press that extrudes pull-request crates, a review station made of an internal test chamber feeding a human review valve, a test chamber and a dispatch dock. Each of review, test and deliver has a queue tank behind it that fills when it is the bottleneck.";
const LABEL_ES = "Banco isométrico de cinco estaciones unidas por tuberías de vidrio: un tanque de entrada para definir, una prensa que extruye cajas de pull request, una estación de revisión formada por una cámara de prueba interna que alimenta una válvula de revisión humana, una cámara de pruebas y un muelle de despacho. Revisar, probar y entregar tienen un tanque de cola detrás que se llena cuando son el cuello de botella.";
const svg = k
  .figureSvg({ width: W, height: H, label: LABEL_EN, body: [`<defs>${defs.join("")}</defs>`, ...layers] })
  .replace(' xmlns="http://www.w3.org/2000/svg"', "");

// ---------------------------------------------------------------- data for the page
const tankDat = (u) => ({ x: u.tank.x + u.tank.w, y0: u.tank.y + 9, y1: u.tank.y + u.tank.d - 11, z0: u.win[0], z1: u.win[1] });
const DATA = {
  P, X, ZC, RAD, FL, NECK, ROLLER_TOP, LANES, fillIds: FILL_ID, QW,
  UN: Object.fromEntries(Object.entries(UN).map(([key, u]) => [key, { k: key, cx: u.cx, zt: u.zt, rr: u.rr, brEnd: u.brEnd, tank: tankDat(u) }])),
  def: { y: BD, ...DEF_WIN },
  code: { cx: mid(X.codeA, X.codeB), cy: 0, z0: 91.4 },
  wheel: { x: mid(X.valveA, X.valveB), y: 0, z0: 77 },
  gauge: GAUGE, itg: ITG, scan: { ...IT_SCAN, y: BD, x0: X.itA + 6, x1: X.itA + 36, z0: 14, z1: 42, head: { x: IT_SCAN.x, z: IT_SCAN.zBar + 4 } },
  T: 5.0, KQ: 0.006,
  labelEn: LABEL_EN, labelEs: LABEL_ES,
};

const LIVE = String.raw`
const doc = document;
const lang = doc.documentElement.lang === "es" ? "es" : "en";
const P = DATA.P, X = DATA.X, ZC = DATA.ZC, RAD = DATA.RAD, UN = DATA.UN, NECK = DATA.NECK;
const T = DATA.T, KQ = DATA.KQ;
const KEYS = SLIDERS;
const UKEYS = ["review", "test", "deliver"];
const NAME = {}; STATIONS.forEach((s) => { NAME[s.id] = s; });
const LN = {}; DATA.LANES.forEach((l) => { LN[l.id] = l; });
const XLANES = ["p1", "p2a", "p2b", "p2c", "p3a", "p3b", "p4a", "p4b"];
const stage = doc.getElementById("stage");
const svgEl = stage.querySelector("svg");
const laneEl = {};
doc.querySelectorAll(".lane").forEach((el) => { laneEl[el.id.slice(5)] = el; });
const still = matchMedia("(prefers-reduced-motion: reduce)");
const SL = {}; KEYS.forEach((key) => { SL[key] = doc.getElementById("s-" + key); });
const cl = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
const sm = (v) => { v = cl(v, 0, 1); return v * v * (3 - 2 * v); };
const ease = (t) => t + (sm(t) - t) * 0.75;
const follow = (v, t, dt, tau) => (Math.abs(t - v) < 1e-4 ? t : v + (t - v) * (1 - Math.exp(-dt / tau)));
const CV0 = X.delB;
const DWELL = X.funA + (X.funB - X.funA) * 0.8;

let lvs = { code: 1, review: 1, test: 1, deliver: 1 };
let M = model(lvs);
let clock = 0, ramAt = -9, delAt = -9, itPh = 0;
const crates = [];
const cyc = { at: 0.3, n: 0, j: 0, size: 1 };
const bcyc = { at: 0.3, n: 0, j: 0 };
const acc = { review: 0.5, test: 0.5, deliver: 0.5 };
const lv = {}, lvT = {};
DATA.fillIds.forEach((id) => { lv[id] = 0; lvT[id] = 0; });
const qL = { review: 0, test: 0, deliver: 0 }, qT = { review: 0, test: 0, deliver: 0 };
let gate = 0, gateT = 0, needle = 0, needleT = 0, itL = 0, itT = 0, itNeedle = 0, divL = { review: 0, test: 0, deliver: 0 };

const edgeOf = (size) => 8.8 * Math.sqrt(size);
const rAt = (x) => {
  const nr = NECK[lvs.review - 1];
  if (x < X.funA) return RAD.p2;
  if (x < X.funB) return RAD.p2 - (RAD.p2 - nr) * ((x - X.funA) / (X.funB - X.funA));
  if (x < X.outA) return nr;
  if (x < X.outB) return nr + (RAD.p3 - nr) * ((x - X.outA) / (X.outB - X.outA));
  return 99;
};
const fit = (r, e) => Math.min(1, (0.92 * r) / (e * 0.7071));

function pathFor(c) {
  const h = c.e / 2, v = 52, Lg = [];
  let x = X.codeB + 2.4 - h - 1;
  const go = (to, fl) => { const d = Math.max(0.05, Math.abs(to - x) / v); Lg.push(Object.assign({ ax: "x", a: x, b: to, d: d }, fl)); x = to; };
  const wait = (d, fl) => { if (d > 0.01) Lg.push(Object.assign({ ax: "x", a: x, b: x, d: d }, fl)); };
  const branch = (u) => {
    Lg.push({ ax: "z", a: ZC, b: u.zt, d: 1.9, lane: u.k + "z", bx: u.cx, rr: u.rr });
    Lg.push({ ax: "y", a: 0, b: u.brEnd, d: 1.9, lane: u.k + "y", bx: u.cx, zt: u.zt, rr: u.rr, arrive: u.k });
  };
  const over = (key) => (M.incoming[key] > M.cap[key] ? 0.9 : 0);
  go(UN.review.cx);
  if (c.div === "review") { branch(UN.review); return Lg; }
  go(X.itA + 8, { it: true }); go(X.itB - 8, { it: true });
  go(DWELL); wait(0.7 + 0.3 * c.size, { gate: true }); go(X.valveA + 12, { gate: true }); go(X.outA, { gate: true });
  go(UN.test.cx - 26); wait(over("test")); go(UN.test.cx);
  if (c.div === "test") { branch(UN.test); return Lg; }
  const tm = (X.testA + X.testB) / 2;
  go(X.testA - 4); go(tm); wait(1.0, {}); go(X.testB + 4);
  go(UN.deliver.cx - 26); wait(over("deliver")); go(UN.deliver.cx);
  if (c.div === "deliver") { branch(UN.deliver); return Lg; }
  go(X.delA); go(CV0 + 26 + c.e); go(CV0 + 58, { deliver: true }); wait(0.8);
  Lg.push({ ax: "f", a: 0, b: 1, d: 1.1 });
  return Lg;
}
function mk(kind, size, div) {
  const c = { kind: kind, size: size, div: div, born: clock, e: kind === "brief" ? 5 : edgeOf(size) };
  if (kind === "brief") {
    const h = c.e / 2;
    c.legs = [{ ax: "x", a: X.defB + 2.4 - h - 1, b: X.codeA + h, d: 3.4 }];
  } else c.legs = pathFor(c);
  c.total = c.legs.reduce((s, g) => s + g.d, 0);
  crates.push(c);
  return c;
}
function posOf(c) {
  const age = clock - c.born;
  let accd = 0;
  for (let i = 0; i < c.legs.length; i++) {
    const g = c.legs[i];
    if (age <= accd + g.d || i === c.legs.length - 1) {
      const u = ease(cl((age - accd) / g.d, 0, 1));
      const val = g.a + (g.b - g.a) * u;
      const r = { x: g.bx === undefined ? val : g.bx, y: 0, z: null, f: 0, g: g };
      if (g.ax === "z") r.z = val;
      else if (g.ax === "y") { r.y = val; r.z = g.zt; }
      else if (g.ax === "f") { r.x = c.legs[i - 1].b; r.f = sm((age - accd) / g.d); }
      return r;
    }
    accd += g.d;
  }
  return null;
}
function decide() {
  const rates = { review: M.flow.review / M.flow.code, test: M.flow.test / M.flow.review, deliver: M.flow.deliver / M.flow.test };
  for (const key of UKEYS) { acc[key] += rates[key]; if (acc[key] >= 1) acc[key] -= 1; else return key; }
  return null;
}
function crateSvg(cx, cy, cz, e, xmin, alpha, tone) {
  const x0 = Math.max(cx - e / 2, xmin), x1 = cx + e / 2;
  if (x1 - x0 < 0.3 || alpha < 0.02) return "";
  const p = slabOf({ x: x0, y: cy - e / 2, w: x1 - x0, d: e, r: Math.min(1, e / 5) }, cz - e / 2, e, P, 2, 0.4);
  const s = solidSvg(p, { tone: tone });
  return alpha < 0.99 ? '<g opacity="' + alpha.toFixed(2) + '">' + s + "</g>" : s;
}

function spawn() {
  if (!cyc.n && clock >= cyc.at) { cyc.n = M.pr.prs; cyc.j = 0; cyc.size = M.pr.size; }
  while (cyc.n && clock >= cyc.at + (cyc.j * T) / cyc.n) {
    mk("pass", cyc.size, decide());
    ramAt = clock;
    cyc.j++;
    if (cyc.j >= cyc.n) { cyc.at += T; cyc.n = 0; }
  }
  if (!bcyc.n && clock >= bcyc.at) { bcyc.n = 2; bcyc.j = 0; }
  while (bcyc.n && clock >= bcyc.at + (bcyc.j * T) / bcyc.n) {
    mk("brief", 1, null);
    bcyc.j++;
    if (bcyc.j >= bcyc.n) { bcyc.at += T; bcyc.n = 0; }
  }
}

const baseQ = (key) => (M.queue[key] > 0 ? 0.14 + 0.16 * Math.min(1, M.queue[key] / 10) : 0);
function step(dt, snap) {
  clock += dt;
  spawn();
  let gateNow = 0;
  const divNow = { review: 0, test: 0, deliver: 0 };
  for (let i = crates.length - 1; i >= 0; i--) {
    const c = crates[i];
    const age = clock - c.born;
    if (age > c.total + 0.05) { crates.splice(i, 1); continue; }
    const p = posOf(c);
    if (p.g.gate) gateNow = 1;
    if (c.div && (p.g.ax === "z" || p.g.ax === "y")) divNow[c.div] = 1;
    if (p.g.arrive && !c.arrived && age >= c.total - 0.3) { c.arrived = true; qT[p.g.arrive] = Math.min(1, qT[p.g.arrive] + c.size * KQ); }
    if (p.g.deliver && !c.delivered) { c.delivered = true; delAt = clock; }
  }
  gateT = gateNow;
  const f = (v, t, tau) => (snap ? t : follow(v, t, dt, tau));
  for (const key of UKEYS) {
    qT[key] = Math.max(qT[key], baseQ(key));
    if (M.queue[key] === 0) qT[key] = Math.max(0, qT[key] - 0.05 * dt);
    qL[key] = f(qL[key], qT[key], 0.9);
    divL[key] = f(divL[key], divNow[key], 0.25);
  }
  for (const id in lv) lv[id] = f(lv[id], lvT[id], 0.7);
  gate = f(gate, gateT, 0.35);
  needle = f(needle, needleT, 0.8);
  itL = f(itL, itT, 0.7);
  itPh += dt * (0.6 + 0.9 * itL);
  itNeedle = f(itNeedle, itT * (0.3 + 0.7 * (lvs.review - 1) / 4), 0.8);
}

const level = (lane, v) => {
  const r = lane.r, zc = lane.zc, zl = zc - r + cl(v, 0, 1) * 2 * r, w = Math.sqrt(Math.max(0, r * r - (zl - zc) * (zl - zc))), zlow = zc - r - 2;
  const pt = (a, b, z) => { const q = lane.axis === "x" ? iso([a, b, z], P) : iso([b, a, z], P); return q[0].toFixed(1) + "," + q[1].toFixed(1); };
  const A = pt(lane.lo, lane.fixed - w, zl), B = pt(lane.hi, lane.fixed - w, zl), C = pt(lane.hi, lane.fixed + w, zl), F = pt(lane.lo, lane.fixed + w, zl);
  const Dp = pt(lane.hi, lane.fixed + w, zlow), E = pt(lane.lo, lane.fixed + w, zlow);
  return v < 0.02 ? ["", ""] : [[A, B, C, Dp, E, F].join(" "), [A, B, C, F].join(" ")];
};
const polys = {};
DATA.fillIds.forEach((id) => { polys[id] = [doc.getElementById("lvp-" + id), doc.getElementById("ltp-" + id)]; });
const lastLv = {};
const laneHtml = {};
const setLane = (id, html) => { if (laneEl[id] && laneHtml[id] !== html) { laneHtml[id] = html; laneEl[id].innerHTML = html; } };
const zOf = (x, e) => (x < X.delA ? ZC : ZC + (DATA.ROLLER_TOP + e / 2 - ZC) * sm((x - X.delA) / (X.delB - X.delA)));
const $ = (id) => doc.getElementById(id);

function render() {
  const buckets = {};
  for (const id in laneEl) buckets[id] = [];
  const lr = lvs.review;
  for (const c of crates) {
    const p = posOf(c);
    if (!p) continue;
    const brief = c.kind === "brief";
    const g = p.g;
    const rec = { x: p.x, y: p.y, z: 0, e: c.e, alpha: 1 - p.f, tone: brief ? "mid" : "hi" };
    if (brief) { rec.z = ZC; if (p.x + c.e / 2 > LN.p1.lo - 0.5 && p.x - c.e / 2 < LN.p1.hi + 0.5) buckets.p1.push(rec); continue; }
    if (g.ax === "z" || g.ax === "y") {
      rec.e = c.e * fit(g.rr, c.e);
      rec.z = g.ax === "z" ? p.z : g.zt;
      buckets[g.lane].push(rec);
      continue;
    }
    rec.e = c.e * fit(rAt(p.x), c.e);
    rec.z = zOf(p.x, rec.e) + 5 * p.f;
    for (const id of XLANES) { const l = LN[id]; if (p.x + rec.e / 2 > l.lo - 0.5 && p.x - rec.e / 2 < l.hi + 0.5) buckets[id].push(rec); }
    if (p.x + rec.e / 2 > X.funA - 0.5 && p.x - rec.e / 2 < X.funB + 0.5) buckets["fun" + lr].push(rec);
    if (p.x + rec.e / 2 > X.outA - 0.5 && p.x - rec.e / 2 < X.outB + 0.5) buckets["out" + lr].push(rec);
    if (p.x + rec.e / 2 > CV0 && p.x - rec.e / 2 < CV0 + 100) buckets.cv.push(rec);
  }
  for (const id in buckets) {
    const vert = id.slice(-1) === "z" && id.length > 2 && UN[id.slice(0, -1)];
    const hz = id.slice(-1) === "y" && id.length > 2 && UN[id.slice(0, -1)];
    const u = vert || hz ? UN[id.slice(0, -1)] : null;
    const list = buckets[id].sort((a, b) => (vert ? a.z - b.z : hz ? a.y - b.y : a.x - b.x));
    setLane(id, list.map((r) => (u ? crateSvg(u.cx, hz ? r.y : 0, r.z, r.e, -1e9, r.alpha, r.tone) : crateSvg(r.x, 0, r.z, r.e, id === "cv" ? CV0 : -1e9, r.alpha, r.tone))).join(""));
  }
  DATA.fillIds.forEach((id) => {
    const v = lv[id];
    if (lastLv[id] !== undefined && Math.abs(lastLv[id] - v) < 0.0005) return;
    lastLv[id] = v;
    const pr = level(LN[id], v);
    polys[id][0].setAttribute("points", pr[0]);
    polys[id][1].setAttribute("points", pr[1]);
  });
  const q3 = (a, b, c2) => iso([a, b, c2], P);
  for (const key of UKEYS) {
    const t = UN[key].tank;
    const qz = t.z0 + (t.z1 - t.z0) * cl(qL[key], 0, 1);
    const qf = $("fx-q-" + key), ql = $("fx-ql-" + key);
    if (qL[key] > 0.004) {
      qf.setAttribute("d", pathOf([q3(t.x, t.y0, t.z0), q3(t.x, t.y1, t.z0), q3(t.x, t.y1, qz), q3(t.x, t.y0, qz)], true));
      ql.setAttribute("d", pathOf([q3(t.x, t.y0, qz), q3(t.x, t.y1, qz)]));
    } else { qf.setAttribute("d", ""); ql.setAttribute("d", ""); }
    $("lamp-div-" + key).style.opacity = (0.3 + 0.7 * cl(divL[key], 0, 1)).toFixed(2);
  }
  const d = DATA.def;
  $("fx-def").setAttribute("d", pathOf([q3(d.x0, d.y, d.z0), q3(d.x1, d.y, d.z0), q3(d.x1, d.y, d.z0 + (d.z1 - d.z0) * 0.72), q3(d.x0, d.y, d.z0 + (d.z1 - d.z0) * 0.72)], true));
  const cd = DATA.code;
  const age = clock - ramAt;
  const st = age >= 0 && age < 1.0 ? Math.pow(Math.sin(Math.PI * age), 2) : 0;
  const zh = cd.z0 + 12 + 18 * (1 - st);
  const rh = 8.4 + 2.2 * M.pr.size;
  $("ram").innerHTML = solidSvg(cylinder(cd.cx, cd.cy, 3.4, cd.z0, zh - cd.z0, P, 16), { tone: "mid", crease: "none" }) + solidSvg(cylinder(cd.cx, cd.cy, rh, zh, 4.4, P, 32, 0.4), { tone: "hi" }) + lineSvg(ring(cd.cx, cd.cy, rh - 3.6, zh + 4.4, P, 24), { tone: "lo" });
  const w = DATA.wheel, lift = 8 * gate, zt = w.z0 + 22 + lift;
  const spokes = [];
  for (let i = 0; i < 5; i++) { const a = gate * Math.PI * 3 + (i * Math.PI * 2) / 5; spokes.push(pathOf([iso([w.x + 3.6 * Math.cos(a), w.y + 3.6 * Math.sin(a), zt + 3], P), iso([w.x + 10.4 * Math.cos(a), w.y + 10.4 * Math.sin(a), zt + 3], P)])); }
  $("wheel").innerHTML =
    solidSvg(cylinder(w.x, w.y, 2.6, w.z0, 22 + lift, P, 16), { tone: "hi", crease: "none" }) +
    solidSvg(cylinder(w.x, w.y, 13.4, zt, 3, P, 44, 0.4), { tone: "hi" }) +
    '<path class="hole" d="' + ring(w.x, w.y, 10.4, zt + 3, P, 40) + '"/>' +
    lineSvg(ring(w.x, w.y, 10.4, zt + 3, P, 40), { tone: "hi" }) +
    lineSvg(spokes.join(""), { tone: "hi" }) +
    solidSvg(cylinder(w.x, w.y, 3.8, zt + 3, 2.8, P, 18), { tone: "hi" });
  const g = DATA.gauge, a = -Math.PI * 0.75 + Math.PI * 1.5 * cl(needle, 0, 1);
  $("needle").setAttribute("d", lineOnTop([g.x - Math.sin(a) * 3.4, g.y + Math.cos(a) * 3.4], [g.x + Math.sin(a) * g.r, g.y - Math.cos(a) * g.r], g.z + 0.2, P));
  const ig = DATA.itg, ia = -Math.PI * 0.75 + Math.PI * 1.5 * cl(itNeedle + 0.04 * itL * Math.sin(itPh * 2.7), 0, 1);
  $("it-needle").setAttribute("d", lineOnTop([ig.x - Math.sin(ia) * 2.8, ig.y + Math.cos(ia) * 2.8], [ig.x + Math.sin(ia) * ig.r, ig.y - Math.cos(ia) * ig.r], ig.z + 0.2, P));
  const sc = DATA.scan, sy = 16 * Math.sin(itPh) * itL;
  $("it-head").setAttribute("transform", translateAlong(P, [0, sy, 0]));
  $("it-head").innerHTML = solidSvg(slabOf({ x: sc.x - 5.5, y: -4, w: 11, d: 8, r: 1.2 }, sc.zBar + 4, 7, P, 2, 0.3), { tone: "hi" }) + solidSvg(cylinder(sc.x, 0, 2.4, sc.zBar + 11, 3, P, 14), { tone: "mid", crease: "none" });
  const bx = sc.x0 + 3 + (sc.x1 - sc.x0 - 8) * (0.5 + 0.5 * Math.sin(itPh));
  $("it-scan").setAttribute("d", itL > 0.03 ? pathOf([q3(bx, sc.y, sc.z0 + 1), q3(bx + 3, sc.y, sc.z0 + 1), q3(bx + 3, sc.y, sc.z1 - 1), q3(bx, sc.y, sc.z1 - 1)], true) : "");
  $("it-scan").style.opacity = (0.2 + 0.8 * itL).toFixed(2);
  $("it-shut").style.opacity = (1 - itL).toFixed(2);
  const lamp = (id, v) => { $(id).style.opacity = (0.25 + 0.75 * cl(v, 0, 1)).toFixed(2); };
  lamp("lamp-code", Math.exp(-Math.max(0, clock - ramAt) * 1.6));
  lamp("lamp-del", Math.exp(-Math.max(0, clock - delAt) * 0.8));
}

/* ---- readout, panels, red state (all driven by model(lvs)) ---- */
const roStatus = $("ro-status");
const ESN = { code: "Código", review: "Revisión", test: "Pruebas", deliver: "Entrega" };
const bn2 = (en, es) => '<span lang="en">' + en + '</span><span lang="es">' + es + "</span>";
function paint() {
  const redKey = M.red;
  roStatus.dataset.st = redKey || "none";
  $("q-cell").dataset.st = redKey || "none";
  doc.querySelectorAll("[data-st]").forEach((el) => { el.dataset.red = el.dataset.st === redKey ? "1" : "0"; });
  svgEl.dataset.red = redKey || "";
}
function apply() {
  M = model(lvs);
  const L = M.levels;
  KEYS.forEach((key) => {
    SL[key].value = String(L[key]);
    $("lvn-" + key).textContent = L[key];
    $("cap-" + key).innerHTML = capText(key);
    $("f-" + key).textContent = M.flow[key];
    $("c-" + key).textContent = "/" + M.cap[key];
    SL[key].setAttribute("aria-valuetext", (lang === "es" ? "Nivel " : "Level ") + L[key] + " " + (lang === "es" ? "de " : "of ") + CAPS[key].length + ", " + (lang === "es" ? "capacidad " : "capacity ") + M.cap[key]);
  });
  $("r-del").textContent = M.delivered;
  $("r-q").textContent = M.red ? "+" + M.queue[M.red] : "0";
  roStatus.innerHTML = M.red ? bn2("Bottleneck: " + NAME[M.red].en, "Cuello de botella: " + ESN[M.red]) : bn2("No bottleneck", "Sin cuello de botella");
  paint();
  doc.querySelectorAll("[data-pip]").forEach((el) => { el.style.opacity = +el.dataset.i < L[el.dataset.pip] ? "0.95" : "0.14"; });
  doc.querySelectorAll(".probe").forEach((el) => { el.style.opacity = +el.dataset.i < L.test ? "1" : "0.32"; });
  doc.querySelectorAll(".roll").forEach((el) => { el.style.opacity = +el.dataset.i < 2 * L.deliver ? "1" : "0.3"; });
  doc.querySelectorAll(".fv").forEach((el) => { el.style.display = +el.dataset.lv === L.review ? "" : "none"; });
  const lampV = { define: 0.6, code: M.util.code, it: M.internalTest ? 0.25 * (L.review - 1) : 0, review: M.util.review, test: M.util.test, deliver: M.util.deliver };
  doc.querySelectorAll(".lamp").forEach((el) => { el.style.opacity = (0.12 + 0.88 * cl(lampV[el.dataset.lamp] * 4 - +el.dataset.seg, 0, 1)).toFixed(2); });
  const fl = (f) => 0.1 + 0.82 * f / 10;
  const qv = (key) => (M.queue[key] > 0 ? 0.3 + 0.62 * Math.min(1, M.queue[key] / 10) : 0);
  lvT.p1 = 0.62; lvT.p2a = fl(M.flow.code); lvT.p2b = lvT.p2c = lvT.p3a = fl(M.flow.review); lvT.p3b = lvT.p4a = fl(M.flow.test); lvT.p4b = fl(M.flow.deliver);
  UKEYS.forEach((key) => { lvT[key + "y"] = qv(key); });
  needleT = M.util.test;
  itT = M.internalTest ? 1 : 0;
}
function capText(key) {
  const c = M.cap[key];
  if (key === "code") return bn2("PRs " + M.pr.prs + " × size " + M.pr.size, "PRs " + M.pr.prs + " × tamaño " + M.pr.size);
  if (key === "review") return M.internalTest ? bn2("Internal test on · capacity " + c, "Prueba interna activa · capacidad " + c) : bn2("Internal test off · capacity " + c, "Prueba interna apagada · capacidad " + c);
  return bn2("Capacity " + c, "Capacidad " + c);
}
function readLevels() { const o = {}; KEYS.forEach((key) => { o[key] = +SL[key].value; }); return o; }
function warm() {
  crates.length = 0; clock = 0; cyc.at = 0.1; cyc.n = 0; bcyc.at = 0.1; bcyc.n = 0; ramAt = -9; delAt = -9;
  apply();
  for (const key of UKEYS) { qT[key] = qL[key] = M.queue[key] > 0 ? Math.min(0.9, 0.3 + M.queue[key] * 0.04) : 0; }
  for (const id in lv) lv[id] = lvT[id];
  needle = needleT; gate = 0; itL = itT; itNeedle = itT * (0.3 + 0.7 * (lvs.review - 1) / 4);
  for (let t = 0; t < 30; t += 0.05) step(0.05, true);
  for (const key of UKEYS) { qT[key] = qL[key] = M.queue[key] > 0 ? Math.min(0.9, 0.3 + M.queue[key] * 0.04) : 0; }
  gate = gateT;
  render();
}
function onLevels() {
  lvs = readLevels();
  if (still.matches) { warm(); return; }
  apply();
  cyc.n = 0; cyc.at = clock + 0.35;
  run();
}
KEYS.forEach((key) => SL[key].addEventListener("input", onLevels));
$("reset").addEventListener("click", () => {
  KEYS.forEach((key) => { SL[key].value = "1"; });
  UKEYS.forEach((key) => { qT[key] = 0; });
  onLevels();
});
svgEl.setAttribute("aria-label", lang === "es" ? DATA.labelEs : DATA.labelEn);
KEYS.forEach((key) => SL[key].setAttribute("aria-label", (lang === "es" ? "Nivel de " : "Level of ") + NAME[key][lang]));

let frame = 0, last = 0, visible = false;
function tick(now) {
  const dt = last ? Math.min((now - last) / 1000, 1 / 30) : 1 / 60;
  last = now;
  step(dt, false);
  render();
  frame = visible && !still.matches ? requestAnimationFrame(tick) : 0;
}
function run() { if (!frame && visible && !still.matches) { last = 0; frame = requestAnimationFrame(tick); } }
new IntersectionObserver((entries) => { visible = entries[entries.length - 1].isIntersecting; if (visible) run(); }, { rootMargin: "120px 0px" }).observe(stage);
if (still.addEventListener) still.addEventListener("change", () => { if (still.matches) warm(); else run(); });
const qs = /[?&]lv=([0-9]),([0-9]),([0-9]),([0-9])/.exec(location.search);
if (qs) KEYS.forEach((key, i) => { SL[key].value = String(cl(+qs[i + 1], 1, CAPS[key].length)); });
lvs = readLevels();
warm();
window.__fig = { model: () => M, levels: () => lvs };
if (matchMedia("(max-width:760px)").matches) { const mid = () => { stage.scrollLeft = (stage.scrollWidth - stage.clientWidth) * 0.5; }; mid(); setTimeout(mid, 120); addEventListener("load", mid); }
if (!still.matches) { visible = true; run(); }
`;

// ---------------------------------------------------------------- page
const mixr = (pct, base) => `color-mix(in srgb,var(--red) calc(var(--r) * ${pct}%),${base})`;
const redCss = [];
for (let i = 0; i < 4; i++) {
  const c = mixr(34, `var(--anatomy-shade-${i})`);
  redCss.push(`[data-st] .iso-solid>.iso-shade[data-shade="${i}"]{fill:${c}}`, `[data-st] .iso-solid[data-seamless]>.iso-shade[data-shade="${i}"]{fill:${c};stroke:${c}}`);
}
{
  const c = mixr(42, "var(--anatomy-top)");
  redCss.push(`[data-st] .iso-solid>.iso-top{fill:${c}}`, `[data-st] .iso-solid[data-seamless]>.iso-top{fill:${c};stroke:${c}}`);
}
for (const t of ["hi", "mid", "lo"]) redCss.push(`[data-st] .iso-solid>.iso-edge[data-tone="${t}"]{stroke:${mixr(100, `var(--anatomy-${t})`)}}`);
redCss.push(
  `[data-st] .lamp,[data-st] .pip{fill:${mixr(100, "var(--anatomy-hi)")}}`,
  `[data-st] .lampdot{fill:${mixr(100, "var(--anatomy-hi)")};stroke:${mixr(100, "var(--anatomy-mid)")}}`,
  `[data-st] .qfluid{fill:${mixr(100, "var(--qfluid)")}}`,
  `[data-st] .qline{stroke:${mixr(100, "var(--anatomy-hi)")}}`,
  `[data-st] .scan{fill:${mixr(100, "var(--qfluid)")}}`,
);

const CSS = `
:root{color-scheme:dark}
*{box-sizing:border-box}
@property --r{syntax:'<number>';inherits:true;initial-value:0}
html,body{margin:0;height:100%;background:transparent;color:var(--anatomy-text);overflow:hidden}
html[lang=en] [lang=es],html[lang=es] [lang=en]{display:none !important}
body{--u:calc(100vw / 1920);font:400 clamp(14px,calc(var(--u) * 28),34px)/1.35 ui-sans-serif,system-ui,-apple-system,"Segoe UI",Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased}
.iso{
  --anatomy-page:#141414;--anatomy-card:#0f0f0f;--anatomy-text:#d8d8d8;--anatomy-strong:#f6f6f6;--anatomy-muted:#a2a2a2;
  --anatomy-paper:#0f0f0f;--anatomy-face:#2a2a2a;--anatomy-top:#3c3c3c;
  --anatomy-shade-0:#161616;--anatomy-shade-1:#1e1e1e;--anatomy-shade-2:#282828;--anatomy-shade-3:#323232;
  --anatomy-hi:#f0f0f0;--anatomy-mid:#a0a0a0;--anatomy-lo:#666;--anatomy-faint:#404040;--anatomy-lit:#ffffff;
  --anatomy-halo:#000;--anatomy-halo-opacity:.9;--anatomy-dot:#f2f2f2;
  --anatomy-weight:1.15px;
  --fluid:#454545;--fluid-top:#6a6a6a;--qfluid:#f4f4f4;--red:#ff4d4d;
}
[data-st]{--r:0;transition:--r .9s ease}
[data-st][data-red="1"]{--r:1}
${redCss.join("\n")}
.deck{height:100vh;display:grid;grid-template-rows:minmax(0,1fr) auto;gap:calc(var(--u) * 12);padding:calc(var(--u) * 16) calc(var(--u) * 24) calc(var(--u) * 16)}
.card{position:relative;display:grid;grid-template-columns:1fr auto;grid-template-rows:auto minmax(0,1fr) auto;min-height:0;margin:0;background:var(--anatomy-card);box-shadow:0 0 0 1px var(--anatomy-lo);padding:calc(var(--u) * 18) calc(var(--u) * 28)}
.corner{position:relative;z-index:2;font-family:var(--anatomy-mono);letter-spacing:.06em;color:var(--anatomy-text);line-height:1.2}
.c-fig{grid-column:1;grid-row:1;font-size:clamp(13px,calc(var(--u) * 28),32px);color:var(--anatomy-strong)}
.c-title{grid-column:2;grid-row:1;text-align:right;text-transform:uppercase;letter-spacing:.14em;font-size:clamp(13px,calc(var(--u) * 28),32px)}
.stage{position:absolute;inset:calc(var(--u) * 30) calc(var(--u) * 10) calc(var(--u) * 170);z-index:1}
.stage svg{position:absolute;inset:0;width:100%;height:100%;display:block;overflow:visible}
.keys{position:absolute;z-index:2;left:calc(var(--u) * 28);bottom:calc(var(--u) * 66);margin:0;padding:0;list-style:none;font-size:clamp(11px,calc(var(--u) * 24),28px);color:var(--anatomy-text);display:grid;gap:calc(var(--u) * 6)}
.keys li{display:flex;align-items:center;gap:.6em}
.keys i{display:inline-block;width:1.1em;height:.8em;border:1.5px solid var(--anatomy-hi);background:#b0b0b0;flex:none}
.keys .k-red{border-color:var(--red);background:var(--red)}
.keys .k-lamp{border-color:var(--anatomy-mid);background:repeating-linear-gradient(90deg,#f0f0f0 0 22%,#222 22% 33%)}
.c-hint{grid-column:1;grid-row:3;align-self:end;text-transform:uppercase;letter-spacing:.1em;font-size:clamp(12px,calc(var(--u) * 24),28px);color:var(--anatomy-muted)}
.readout{position:relative;z-index:2;grid-column:2;grid-row:3;align-self:end;text-align:right;font-variant-numeric:tabular-nums}
.ro-status{font:600 clamp(20px,calc(var(--u) * 54),64px)/1.08 ui-sans-serif,system-ui,sans-serif;color:${mixr(100, "var(--anatomy-strong)")};letter-spacing:-.01em;margin-bottom:calc(var(--u) * 8)}
.ro-grid{display:flex;gap:calc(var(--u) * 30);justify-content:flex-end;margin:0;font-family:var(--anatomy-mono)}
.ro-grid>div{display:flex;flex-direction:column;align-items:flex-end}
.ro-grid dt{font-size:clamp(10px,calc(var(--u) * 21),25px);letter-spacing:.08em;text-transform:uppercase;color:var(--anatomy-muted)}
.ro-grid dd{margin:0;font-size:clamp(16px,calc(var(--u) * 50),58px);color:${mixr(100, "var(--anatomy-strong)")};line-height:1.1}
.ro-grid dd small{font-size:.58em;color:${mixr(100, "var(--anatomy-muted)")}}
.ro-grid .sep{border-left:1px solid var(--anatomy-lo);padding-left:calc(var(--u) * 30)}
.ctl{display:grid;grid-template-columns:repeat(4,minmax(0,1fr)) auto;gap:calc(var(--u) * 12);align-items:stretch}
.panel{border:1px solid ${mixr(100, "var(--anatomy-lo)")};background:var(--anatomy-card);padding:calc(var(--u) * 8) calc(var(--u) * 18) calc(var(--u) * 6);min-width:0}
.ph{display:flex;justify-content:space-between;align-items:baseline;gap:8px}
.pn{font-weight:600;font-size:clamp(14px,calc(var(--u) * 34),40px);color:${mixr(100, "var(--anatomy-strong)")}}
.pl{font-family:var(--anatomy-mono);font-size:clamp(11px,calc(var(--u) * 25),30px);color:var(--anatomy-muted);white-space:nowrap}
.pl b{color:var(--anatomy-strong);font-size:1.25em}
.panel input{display:block;width:100%;margin:calc(var(--u) * 2) 0 0}
.pt{display:flex;justify-content:space-between;font-family:var(--anatomy-mono);font-size:clamp(10px,calc(var(--u) * 21),25px);color:var(--anatomy-muted);padding:0 calc(var(--u) * 24)}
.pc{font-size:clamp(10px,calc(var(--u) * 22),26px);color:var(--anatomy-muted);margin-top:calc(var(--u) * 2);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.rst{all:unset;cursor:pointer;display:flex;flex-direction:column;justify-content:center;align-items:center;padding:0 calc(var(--u) * 26);border:1px solid var(--anatomy-mid);color:var(--anatomy-strong);font-size:clamp(12px,calc(var(--u) * 30),36px);letter-spacing:.04em;background:linear-gradient(var(--anatomy-top),var(--anatomy-shade-1));-webkit-tap-highlight-color:transparent}
.rst:hover{border-color:var(--anatomy-lit)}
.rst:focus-visible{outline:1px solid var(--anatomy-muted);outline-offset:3px}
.cap{grid-column:1 / -1;font-size:clamp(10px,calc(var(--u) * 22),26px);color:var(--anatomy-muted);text-align:center;letter-spacing:.02em}
input[type=range]{-webkit-appearance:none;appearance:none;background:transparent;height:calc(var(--u) * 52);min-height:30px;cursor:pointer;touch-action:pan-y}
input[type=range]:focus-visible{outline:1px solid var(--anatomy-muted);outline-offset:6px}
input[type=range]::-webkit-slider-runnable-track{height:calc(var(--u) * 14);min-height:8px;background:linear-gradient(var(--anatomy-shade-0),var(--anatomy-shade-2));border:1px solid var(--anatomy-mid);border-radius:2px;box-shadow:inset 0 1px 0 #000}
input[type=range]::-moz-range-track{height:calc(var(--u) * 14);min-height:8px;background:linear-gradient(var(--anatomy-shade-0),var(--anatomy-shade-2));border:1px solid var(--anatomy-mid);border-radius:2px}
input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:calc(var(--u) * 48);min-width:28px;height:calc(var(--u) * 48);min-height:28px;margin-top:calc(var(--u) * -20);border-radius:5px;background:linear-gradient(#8a8a8a,var(--anatomy-top) 40%,var(--anatomy-shade-2));border:1.5px solid ${mixr(100, "var(--anatomy-lit)")};box-shadow:0 5px 0 -1px #000,0 8px 12px #0009,inset 0 1px 0 #ffffff50}
input[type=range]::-moz-range-thumb{width:calc(var(--u) * 48);min-width:28px;height:calc(var(--u) * 48);min-height:28px;border-radius:5px;background:linear-gradient(#8a8a8a,var(--anatomy-top) 40%,var(--anatomy-shade-2));border:1.5px solid ${mixr(100, "var(--anatomy-lit)")}}
.tb-body{fill:var(--anatomy-shade-3);stroke:none}
.lane .iso-solid>.iso-fill{fill:#8e8e8e}
svg .lane .iso-solid>.iso-shade[data-shade="0"]{fill:#5e5e5e}svg .lane .iso-solid>.iso-shade[data-shade="1"]{fill:#767676}svg .lane .iso-solid>.iso-shade[data-shade="2"]{fill:#909090}svg .lane .iso-solid>.iso-shade[data-shade="3"]{fill:#a8a8a8}
svg .lane .iso-solid>.iso-top{fill:#d2d2d2}
svg .lane .iso-solid>.iso-edge[data-tone="hi"]{stroke:var(--anatomy-hi)}svg .lane .iso-solid>.iso-edge[data-tone="mid"]{stroke:var(--anatomy-mid)}
.glass .iso-shade{opacity:.85}
.tb-shine{opacity:.55}.tb-shade{opacity:.6}
.fluid{fill:var(--fluid);stroke:none}
.fluid-top{fill:var(--fluid-top);stroke:none}
.rec{fill:var(--anatomy-shade-0);stroke:var(--anatomy-lo);stroke-width:var(--anatomy-weight)}
.fx{fill:var(--fluid-top);stroke:none}
.qfluid{fill:var(--qfluid);stroke:none;opacity:.92}
.hole{fill:var(--anatomy-shade-0);stroke:none}
.lamp{fill:var(--anatomy-hi);stroke:none;opacity:.12;transition:opacity .7s ease}
.pip{fill:var(--anatomy-hi);stroke:none;opacity:.14;transition:opacity .5s ease}
.probe,.roll{transition:opacity .5s ease}
.lampdot{fill:var(--anatomy-hi);stroke:var(--anatomy-mid);stroke-width:var(--anatomy-weight);opacity:.5}
.scan{fill:var(--qfluid);stroke:none}
.shut{fill:var(--anatomy-shade-0);stroke:none}
.iso-face-text{fill:var(--anatomy-mid);font-weight:600}
.iso-face-text[data-tone=hi]{fill:var(--anatomy-hi)}
@media (max-width:760px){
  html,body{overflow:auto;height:auto}
  body{font-size:15px}
  .deck{height:auto;display:block;padding:12px}
  .card{display:block;padding:14px 12px}
  .corner{display:block}
  .c-fig{display:inline-block;width:20%;font-size:12px}
  .c-title{display:inline-block;width:78%;text-align:right;font-size:11px;letter-spacing:.08em}
  .stage{position:relative;inset:auto;margin:10px -2px 8px;overflow-x:auto;overflow-y:hidden;-webkit-overflow-scrolling:touch;touch-action:pan-x pan-y}
  .stage svg{position:static;height:auto;width:210%;max-width:none}
  .keys{position:static;font-size:12px;margin:0 0 8px}
  .c-hint{display:block;font-size:11px;margin-bottom:8px}
  .readout{text-align:left}
  .ro-status{font-size:20px}
  .ro-grid{flex-wrap:wrap;justify-content:flex-start;gap:6px 16px}
  .ro-grid>div{align-items:flex-start}
  .ro-grid .sep{border-left:0;padding-left:0}
  .ro-grid dt{font-size:10px}.ro-grid dd{font-size:20px}
  .ctl{margin-top:12px;grid-template-columns:1fr 1fr}
  .panel{padding:8px 12px}.pn{font-size:15px}.pl{font-size:11px}.pt{font-size:10px;padding:0 14px}.pc{font-size:10px}
  .rst{grid-column:1 / -1;padding:12px;font-size:14px}
  .cap{font-size:11px}
  input[type=range]{height:34px}
  input[type=range]::-webkit-slider-thumb{margin-top:-11px}
}
@media (prefers-reduced-motion:reduce){*{animation:none!important;transition:none!important}}
`;

const panel = (key) => {
  const n = MAXLEVEL[key];
  return `<div class="panel" data-st="${key}"><div class="ph"><span class="pn">${bi(STATIONS.find((s) => s.id === key).en, STATIONS.find((s) => s.id === key).es)}</span><span class="pl">${bi("Level", "Nivel")} <b id="lvn-${key}">1</b>/${n}</span></div><input id="s-${key}" type="range" min="1" max="${n}" step="1" value="1"><div class="pt">${Array.from({ length: n }, (_, i) => `<span>${i + 1}</span>`).join("")}</div><div class="pc" id="cap-${key}"></div></div>`;
};
const cell = (key) => `<div data-st="${key}"><dt>${bi(STATIONS.find((s) => s.id === key).en, STATIONS.find((s) => s.id === key).es)}</dt><dd><span id="f-${key}">–</span><small id="c-${key}"></small></dd></div>`;
const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Fig 1 · Code delivery bench</title>
<script>(function(){try{var m=/[?&]lang=(es|en)/.exec(location.search);document.documentElement.lang=m?m[1]:"en"}catch(e){}})()</script>
<style>${k.ISO_CSS}${CSS}</style></head>
<body class="iso" data-theme="dark">
<main class="deck">
<figure class="card">
<span class="corner c-fig">Fig 1</span>
<span class="corner c-title">${bi("Code delivery bench", "Banco de entrega de código")}</span>
<div class="stage" id="stage">${svg}</div>
<ul class="keys">
<li><i class="k-crate"></i>${bi("Crate = one PR (count and size per tick)", "Caja = un PR (cantidad y tamaño por ciclo)")}</li>
<li><i class="k-red"></i>${bi("Red = the bottleneck and its queue", "Rojo = el cuello de botella y su cola")}</li>
<li><i class="k-lamp"></i>${bi("Lamps = how busy each station is", "Luces = qué tan ocupada está cada estación")}</li>
</ul>
<span class="corner c-hint">${bi("Upgrade a station with its slider", "Mejora una estación con su control")}</span>
<div class="readout" data-readout>
<div class="ro-status" id="ro-status" data-st="none"></div>
<dl class="ro-grid">${SLIDERS.map(cell).join("")}<div class="sep"><dt>${bi("delivered", "entregado")}</dt><dd id="r-del">–</dd></div><div data-st="none" id="q-cell"><dt>${bi("queue", "cola")}</dt><dd id="r-q">–</dd></div></dl>
</div>
</figure>
<section class="ctl">
${SLIDERS.map(panel).join("")}
<button class="rst" id="reset" type="button">${bi("Reset", "Reiniciar")}</button>
<div class="cap">${bi("Illustrative model · relative units (level 1 = 1 per tick), not measurements · flow / capacity per tick", "Modelo ilustrativo · unidades relativas (nivel 1 = 1 por ciclo), no son mediciones · flujo / capacidad por ciclo")}</div>
</section>
</main>
<script type="module">${(kitScript().replace('xmlns: "http://www.w3.org/2000/svg",', "") + "\n" + MODEL_SRC + `\nconst DATA = ${JSON.stringify(DATA)};\n` + LIVE).replace(/<\/(script)/gi, "<\\/$1")}</script>
</body></html>`;

mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, html);
console.log(`wrote ${OUT}`);
console.log(`parts: ${parts.solids} static solids (incl. ${parts.variants} per-level valve-bore variants, only one shown), ${parts.lamps} lamp/pip cells, ${parts.lines} line groups (+ live crates, ram, scanner head, wheel)`);
