import assert from 'node:assert/strict'
import { test } from 'node:test'
import { spawnSync } from 'node:child_process'
import { createApp } from '../dist/app.js'
import { DatabaseService } from '../dist/database.service.js'

// Requires a migrated, dedicated development/CI database. Never resets data.
test('API and PostgreSQL integration', async (t) => {
  const app = await createApp()
  try {
    await app.listen(0, '127.0.0.1')
    const base = await app.getUrl()
    await t.test('health checks the real database', async () => {
      const response = await fetch(`${base}/api/health`)
      assert.equal(response.status, 200)
      assert.deepEqual(await response.json(), { status: 'ok', database: 'up' })
    })
    await t.test('initial migration is recorded and the schema exists', async () => {
      const database = app.get(DatabaseService)
      const schemas =
        await database.$queryRaw`SELECT schema_name FROM information_schema.schemata WHERE schema_name = 'finance'`
      assert.equal(schemas.length, 1)
      const migrations =
        await database.$queryRaw`SELECT migration_name FROM finance._prisma_migrations WHERE finished_at IS NOT NULL AND rolled_back_at IS NULL`
      assert.ok(migrations.some((row) => row.migration_name === '20261026000000_initial_schema'))
    })
    await t.test('unknown routes use the JSON error contract', async () => {
      const response = await fetch(`${base}/api/missing?secret=hidden`)
      assert.equal(response.status, 404)
      const body = await response.json()
      assert.equal(body.statusCode, 404)
      assert.equal(body.path, '/api/missing')
      assert.equal(body.message, 'Route not found')
      assert.doesNotMatch(JSON.stringify(body), /secret|hidden/)
    })
  } finally {
    await app.close()
  }
})

test('database connection failure returns a safe 503', async () => {
  const original = process.env.DATABASE_URL
  process.env.DATABASE_URL =
    'postgresql://private_user:private_password@127.0.0.1:1/unavailable?schema=finance'
  let app
  try {
    app = await createApp()
    await app.listen(0, '127.0.0.1')
    const response = await fetch(`${await app.getUrl()}/api/health`)
    assert.equal(response.status, 503)
    assert.deepEqual(await response.json(), {
      statusCode: 503,
      message: 'Database unavailable',
      path: '/api/health',
    })
    const pots = await fetch(`${await app.getUrl()}/api/pots`)
    assert.equal(pots.status, 503)
    assert.deepEqual(await pots.json(), {
      statusCode: 503,
      message: 'Pots are temporarily unavailable',
      path: '/api/pots',
    })
  } finally {
    if (app) await app.close()
    if (original === undefined) delete process.env.DATABASE_URL
    else process.env.DATABASE_URL = original
  }
})

test('invalid server configuration exits unsuccessfully without exposing secrets', () => {
  const result = spawnSync(process.execPath, ['dist/main.js'], {
    env: { ...process.env, DATABASE_URL: 'invalid_private_value', PORT: '3000' },
    encoding: 'utf8',
    timeout: 10000,
  })
  assert.equal(result.status, 1)
  assert.match(result.stderr, /API startup failed/)
  assert.doesNotMatch(result.stderr, /invalid_private_value/)
})
