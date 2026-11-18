// Pure model v2 for the delivery-pipeline fig. Relative units, ILLUSTRATIVE, NOT real data (V3).
// Chain: define (fixed) → code → review (internal test → human valve) → test → deliver. Levels are 1-based.
export const STATIONS = [
  { id: 'define',  en: 'Define',  es: 'Definir' },
  { id: 'code',    en: 'Code',    es: 'Codificar' },
  { id: 'review',  en: 'Review',  es: 'Revisar' },
  { id: 'test',    en: 'Test',    es: 'Probar' },
  { id: 'deliver', en: 'Deliver', es: 'Entregar' },
]
export const SLIDERS = ['code', 'review', 'test', 'deliver'] // define has no slider
export const CAPS = { // capacity per level (index 0 = level 1)
  code:    [1, 2, 4, 8],
  review:  [1, 2, 4, 6, 10], // levels 2+ add the internal test substation
  test:    [1, 2, 4, 8],
  deliver: [1, 2, 4, 8],
}
export const MAXLEVEL = Object.fromEntries(SLIDERS.map(k => [k, CAPS[k].length]))
// PR count × PR size per code level (bigger and more PRs); product = CAPS.code
export const PR = [{ prs: 1, size: 1 }, { prs: 2, size: 1 }, { prs: 2, size: 2 }, { prs: 4, size: 2 }]

const clamp = (v, k) => Math.min(MAXLEVEL[k], Math.max(1, Math.round(v)))

// levels {code,review,test,deliver} → flows, queues, the single red station
export function model(levels = {}) {
  const L = Object.fromEntries(SLIDERS.map(k => [k, clamp(levels[k] ?? 1, k)]))
  const cap = Object.fromEntries(SLIDERS.map(k => [k, CAPS[k][L[k] - 1]]))
  const flow = { code: cap.code } // code is the source: never "incoming > cap"
  flow.review = Math.min(flow.code, cap.review)
  flow.test = Math.min(flow.review, cap.test)
  flow.deliver = Math.min(flow.test, cap.deliver)
  const incoming = { review: flow.code, test: flow.review, deliver: flow.test }
  const queue = {} // backlog added per tick behind each downstream station
  for (const k of ['review', 'test', 'deliver']) queue[k] = Math.max(0, incoming[k] - cap[k])
  const red = ['review', 'test', 'deliver'].find(k => queue[k] > 0) ?? null // V8: first one only
  const util = Object.fromEntries(SLIDERS.map(k => [k, Math.min(1, (k === 'code' ? cap.code : incoming[k]) / cap[k])]))
  return { levels: L, cap, flow, incoming, queue, red, util, delivered: flow.deliver,
    internalTest: L.review >= 2, pr: PR[L.code - 1] }
}
