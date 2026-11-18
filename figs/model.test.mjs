import assert from 'node:assert/strict'
import { SLIDERS, CAPS, MAXLEVEL, PR, model } from './model.mjs'

assert.deepEqual(MAXLEVEL, { code: 4, review: 5, test: 4, deliver: 4 })
// PR count × size = code capacity at every level
PR.forEach((p, i) => assert.equal(p.prs * p.size, CAPS.code[i]))
// all-1 start: nothing red, delivered 1
let m = model({ code: 1, review: 1, test: 1, deliver: 1 })
assert.equal(m.red, null); assert.equal(m.delivered, 1)
// out-of-range / missing levels are clamped
assert.deepEqual(model({ code: 99, review: 0 }).levels, { code: 4, review: 1, test: 1, deliver: 1 })
// raise code alone → review red (V8), queue behind review only, delivered stays at review cap
m = model({ code: 4, review: 1, test: 1, deliver: 1 })
assert.equal(m.red, 'review'); assert.equal(m.queue.review, 7); assert.equal(m.delivered, 1)
// raise review to 3 (cap 4): still red (8>4); to 5 (cap 10): review clear, test becomes red
m = model({ code: 4, review: 3, test: 1, deliver: 1 })
assert.equal(m.red, 'review'); assert.equal(m.queue.review, 4)
m = model({ code: 4, review: 5, test: 1, deliver: 1 })
assert.equal(m.red, 'test'); assert.equal(m.flow.review, 8); assert.equal(m.queue.test, 7)
// fix test → deliver red; fix deliver → nothing red, everything delivered
m = model({ code: 4, review: 5, test: 4, deliver: 1 })
assert.equal(m.red, 'deliver')
m = model({ code: 4, review: 5, test: 4, deliver: 4 })
assert.equal(m.red, null); assert.equal(m.delivered, 8)
// exactly one red even when several stations are short (first only)
m = model({ code: 4, review: 1, test: 1, deliver: 1 })
assert.equal(m.red, 'review'); assert.equal(m.queue.test, 0) // test sees only what review passes
// delivered never exceeds any cap on the chain; monotone in every slider
for (const k of SLIDERS) for (let l = 2; l <= MAXLEVEL[k]; l++) {
  const lo = model({ code: 4, review: 5, test: 4, deliver: 4, [k]: l - 1 }), hi = model({ code: 4, review: 5, test: 4, deliver: 4, [k]: l })
  assert(hi.delivered >= lo.delivered)
}
// internal test substation from review level 2
assert.equal(model({ review: 1 }).internalTest, false); assert.equal(model({ review: 2 }).internalTest, true)
console.log('model ok')
