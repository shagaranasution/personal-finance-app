import assert from 'node:assert/strict'
import { test } from 'node:test'
import { fetchPots } from '../src/features/pots/pots-api.ts'
import { getPotProgress } from '../src/features/pots/pot-progress.ts'

const pot = { id: 'pot-1', name: 'Savings', theme: '#277C78', total: 159_000, target: 2_000_000 }

test('progress preserves real ratios and caps only the visual fill', () => {
  assert.equal(getPotProgress(159_000, 2_000_000).label, '7.95%')
  assert.equal(getPotProgress(0, 1000).fill, 0)
  assert.equal(getPotProgress(1000, 1000).goalReached, true)
  const over = getPotProgress(1500, 1000)
  assert.equal(over.label, '150.0%')
  assert.equal(over.fill, 100)
  assert.equal(over.overTarget, true)
  for (const [total, target] of [
    [1, 0],
    [1, -1],
    [-1, 100],
    [0.5, 100],
    [1, Infinity],
  ]) {
    assert.throws(() => getPotProgress(total, target))
  }
})

test('client reads same-origin IDR data without choosing an owner', async (t) => {
  const controller = new AbortController()
  const fetch = t.mock.method(globalThis, 'fetch', async (url, options) => {
    assert.equal(url, '/api/pots')
    assert.equal(options.signal, controller.signal)
    assert.equal(options.cache, 'no-store')
    return Response.json([pot])
  })
  assert.deepEqual(await fetchPots(controller.signal), [pot])
  assert.equal(fetch.mock.callCount(), 1)
})

test('an empty response is valid, while failed and malformed responses reject', async (t) => {
  const controller = new AbortController()
  const fetch = t.mock.method(globalThis, 'fetch')
  fetch.mock.mockImplementation(async () => Response.json([]))
  assert.deepEqual(await fetchPots(controller.signal), [])
  fetch.mock.mockImplementation(async () =>
    Response.json({ message: 'private server detail' }, { status: 503 }),
  )
  await assert.rejects(fetchPots(controller.signal), /Unable to load pots/)
  for (const payload of [
    { pots: [] },
    [null],
    [{ ...pot, total: 1.25 }],
    [{ ...pot, target: 0 }],
    [{ ...pot, total: -1 }],
    [{ ...pot, theme: 'invalid' }],
    [pot, pot],
  ]) {
    fetch.mock.mockImplementation(async () => Response.json(payload))
    await assert.rejects(fetchPots(controller.signal), /Invalid pots response/)
  }
  fetch.mock.mockImplementation(async () => new Response('not JSON'))
  await assert.rejects(fetchPots(controller.signal))
})

test('request failure can be retried and cancellation reaches fetch', async (t) => {
  const controller = new AbortController()
  const fetch = t.mock.method(globalThis, 'fetch', async () => {
    throw new TypeError('Network unavailable')
  })
  await assert.rejects(fetchPots(controller.signal))
  fetch.mock.mockImplementation(async () => Response.json([pot]))
  assert.deepEqual(await fetchPots(controller.signal), [pot])
  controller.abort()
  fetch.mock.mockImplementation(async (_url, { signal }) => {
    signal.throwIfAborted()
    return Response.json([])
  })
  await assert.rejects(fetchPots(controller.signal), { name: 'AbortError' })
})
