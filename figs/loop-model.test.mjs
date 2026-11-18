import assert from 'node:assert/strict'
import { PERIM, GATE_S, LIMIT, EVERY, at, crossings, fires, driftAt } from './loop-model.mjs'

assert.deepEqual(at(0), [-100, -60]); assert.deepEqual(at(200), [100, -60]); assert.deepEqual(at(320), [100, 60])
assert.deepEqual(at(520), [-100, 60]); assert.deepEqual(at(GATE_S), [-100, 0]); assert.deepEqual(at(PERIM), [-100, -60])
// no human: drift = laps travelled, crosses LIMIT after 6 laps
assert.equal(driftAt(3 * PERIM, 0), 3)
assert.ok(driftAt(LIMIT * PERIM, 0) >= LIMIT)
// every lap: check zeroes drift at the gate, never reaches 1 lap of drift
assert.equal(driftAt(GATE_S - 1, 1), (GATE_S - 1) / PERIM); assert.equal(driftAt(GATE_S, 1), 0)
assert.ok(Math.abs(driftAt(GATE_S + PERIM / 100, 1) - 0.01) < 1e-9) // right after the gate
let peak = 0; for (let d = 0; d < 20 * PERIM; d += 1) peak = Math.max(peak, driftAt(d, 1)); assert.ok(peak < 1 + 1e-9)
// every 3 laps: peak stays under 3 laps, below LIMIT
peak = 0; for (let d = 0; d < 20 * PERIM; d += 1) peak = Math.max(peak, driftAt(d, 3)); assert.ok(peak <= 3 + 1e-9 && peak < LIMIT)
// no-human peak grows without bound past LIMIT
peak = 0; for (let d = 0; d < 20 * PERIM; d += 1) peak = Math.max(peak, driftAt(d, 0)); assert.ok(peak > LIMIT)
// fires only on every Nth crossing
assert.equal(fires(3, 3), true); assert.equal(fires(2, 3), false); assert.equal(fires(5, 0), false); assert.equal(crossings(GATE_S - 1), 0)
assert.deepEqual(EVERY, [0, 3, 1])
console.log('ok: loop model')
