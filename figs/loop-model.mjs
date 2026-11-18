// T7 model: an agent looping unsupervised. Truth source for figs/build-loop.mjs (inlined, no imports at runtime).
// Illustrative relative units, NOT measurements: each lap of unchecked work adds 1 unit of drift
// (errors the agent cannot see in its own work). A human gate zeroes drift when it fires.
export const CORNERS = [[-100, -60], [100, -60], [100, 60], [-100, 60]]; // 1 Goal, 2 Plan, 3 Act, 4 Observe
export const PERIM = 640; // 200 + 120 + 200 + 120
export const GATE_S = 580; // gate on the 4->1 leg, midpoint (-100, 0)
export const LIMIT = 6; // drift at which the gauge enters the red zone
export const EVERY = [0, 3, 1]; // slider level -> human checks every N laps (0 = never)
const LEGS = [200, 120, 200, 120];

// point on the loop at distance s (wraps), starting at corner 1
export function at(s) {
  let d = ((s % PERIM) + PERIM) % PERIM;
  for (let i = 0; i < 4; i++) {
    if (d <= LEGS[i]) {
      const [x0, y0] = CORNERS[i], [x1, y1] = CORNERS[(i + 1) % 4];
      return [x0 + ((x1 - x0) * d) / LEGS[i], y0 + ((y1 - y0) * d) / LEGS[i]];
    }
    d -= LEGS[i];
  }
}
// how many times the cart has passed the gate after travelling `dist`
export const crossings = (dist) => (dist < GATE_S ? 0 : Math.floor((dist - GATE_S) / PERIM) + 1);
// does the human check fire on this crossing?
export const fires = (n, every) => every > 0 && n > 0 && n % every === 0;
// drift after travelling `dist` with a check every `every` laps (0 = never)
export function driftAt(dist, every) {
  const n = crossings(dist);
  const last = every > 0 ? Math.floor(n / every) * every : 0; // last crossing that fired
  const since = last > 0 ? GATE_S + (last - 1) * PERIM : 0;
  return (dist - since) / PERIM;
}
