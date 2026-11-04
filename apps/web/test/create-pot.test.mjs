import assert from 'node:assert/strict'
import { test } from 'node:test'
import { validatePotForm } from '../src/features/pots/create-pot-validation.ts'
import { potThemes } from '../src/features/pots/pot-themes.ts'
import { createPot, PotCreationError } from '../src/features/pots/pots-api.ts'

const values = { name: '  Rainy Days  ', target: '2000000', theme: '#C94736' }

test('creation form trims names and preserves whole IDR without fixture scaling', () => {
  assert.deepEqual(validatePotForm(values, []), {
    valid: true,
    data: { name: 'Rainy Days', target: 2_000_000, theme: '#C94736' },
  })
  assert.equal(
    validatePotForm({ ...values, name: '💰'.repeat(30), target: '2147483647' }, []).valid,
    true,
  )
  assert.equal(validatePotForm({ ...values, name: '💰'.repeat(31) }, []).valid, false)
  assert.equal(validatePotForm({ ...values, target: '1' }, []).valid, true)
})

test('creation form rejects invalid names, amounts, unavailable and unsupported themes', () => {
  for (const name of ['', '  ', 'x'.repeat(31), 'bad\u0000name'])
    assert.equal(validatePotForm({ ...values, name }, []).valid, false)
  for (const target of [
    '',
    ' ',
    '0',
    '-1',
    '+1',
    '1.25',
    '1,25',
    '1.000',
    'Rp1000',
    '1e3',
    '2147483648',
    'Infinity',
    ' 1000',
  ]) {
    const result = validatePotForm({ ...values, target }, [])
    assert.equal(result.valid, false, target)
    assert.ok(result.errors.target)
  }
  assert.equal(validatePotForm(values, ['#C94736']).valid, false)
  assert.equal(validatePotForm({ ...values, theme: '#FFFFFF' }, []).valid, false)
  assert.equal(potThemes.length, 15)
  assert.equal(new Set(potThemes.map((theme) => theme.value)).size, 15)
  for (const theme of potThemes)
    assert.equal(
      validatePotForm(
        { ...values, theme: theme.value },
        potThemes.map((theme) => theme.value),
      ).valid,
      false,
    )
})

test('create client posts only requested fields and uses the returned persisted pot', async (t) => {
  const controller = new AbortController()
  const data = { name: 'Rainy Days', target: 2_000_000, theme: '#C94736' }
  const saved = { ...data, id: 'saved-1', total: 0 }
  const mock = t.mock.method(globalThis, 'fetch', async (url, options) => {
    assert.equal(url, '/api/pots')
    assert.equal(options.method, 'POST')
    assert.equal(options.headers['Content-Type'], 'application/json')
    assert.deepEqual(JSON.parse(options.body), data)
    assert.equal(options.signal.aborted, false)
    return Response.json(saved, { status: 201 })
  })
  assert.deepEqual(await createPot(data, controller.signal), saved)
  assert.equal(mock.mock.callCount(), 1)
})

test('create client exposes safe conflict/errors and never retries a POST automatically', async (t) => {
  const controller = new AbortController()
  const mock = t.mock.method(globalThis, 'fetch', async () =>
    Response.json({ message: 'private detail' }, { status: 409 }),
  )
  await assert.rejects(
    createPot({ name: 'Rain', target: 1, theme: '#C94736' }, controller.signal),
    (error) =>
      error instanceof PotCreationError &&
      error.status === 409 &&
      /refresh/.test(error.message) &&
      !/private detail/.test(error.message),
  )
  assert.equal(mock.mock.callCount(), 1)
  mock.mock.mockImplementation(async () => Response.json({}, { status: 503 }))
  await assert.rejects(
    createPot({ name: 'Rain', target: 1, theme: '#C94736' }, controller.signal),
    (error) => error.status === 503,
  )
  mock.mock.mockImplementation(async () => Response.json({ id: 'invalid', total: 1.25 }))
  await assert.rejects(createPot({ name: 'Rain', target: 1, theme: '#C94736' }, controller.signal))
  controller.abort()
  mock.mock.mockImplementation(async (_url, { signal }) => {
    signal.throwIfAborted()
  })
  await assert.rejects(
    createPot({ name: 'Rain', target: 1, theme: '#C94736' }, controller.signal),
    { name: 'AbortError' },
  )
})
