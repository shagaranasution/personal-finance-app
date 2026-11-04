import assert from 'node:assert/strict'
import { randomUUID } from 'node:crypto'
import { spawnSync } from 'node:child_process'
import { test } from 'node:test'
import pg from 'pg'
import { createApp } from '../dist/app.js'
import { DatabaseService } from '../dist/database.service.js'
import { readConfig } from '../dist/config.js'
import { seedDemo } from '../dist/development/seed-demo.js'
import { assertLocalSeedDatabase, getLocalDemoOwnerId } from '../dist/development/demo-owner.js'
import { POT_THEMES } from '../dist/pots/pot-themes.js'

test('create-pot HTTP contract with a disposable database', async (t) => {
  const { databaseUrl } = readConfig()
  assertLocalSeedDatabase(databaseUrl)
  const admin = new pg.Pool({ connectionString: databaseUrl })
  const databaseName = `fin09_test_${randomUUID().replaceAll('-', '')}`
  const url = new URL(databaseUrl)
  url.pathname = `/${databaseName}`
  let created = false
  let app
  try {
    await admin.query(`CREATE DATABASE "${databaseName}"`)
    created = true
    const migration = spawnSync('npm', ['run', 'db:migrate'], {
      env: { ...process.env, DATABASE_URL: url.toString() },
      encoding: 'utf8',
      timeout: 30000,
    })
    assert.equal(migration.status, 0, `${migration.stdout}\n${migration.stderr}`)
    const previousUrl = process.env.DATABASE_URL
    try {
      process.env.DATABASE_URL = url.toString()
      app = await createApp()
    } finally {
      if (previousUrl === undefined) delete process.env.DATABASE_URL
      else process.env.DATABASE_URL = previousUrl
    }
    await app.listen(0, '127.0.0.1')
    const base = await app.getUrl()
    const database = app.get(DatabaseService)
    const ownerId = getLocalDemoOwnerId()
    const valid = { name: 'Rainy Days', target: 2_000_000, theme: '#C94736' }
    const post = (body, query = '') =>
      fetch(`${base}/api/pots${query}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
    t.beforeEach(async () => {
      await database.pot.deleteMany()
      await database.balanceSnapshot.deleteMany()
      await database.accountOwner.deleteMany()
      await seedDemo(database)
    })

    await t.test('creates one trimmed, zero-funded owner-scoped pot that persists', async () => {
      const balance = await database.balanceSnapshot.findUnique({ where: { ownerId } })
      const response = await post({ ...valid, name: '  Savings  ' })
      assert.equal(response.status, 201)
      assert.equal(response.headers.get('cache-control'), 'no-store')
      const pot = await response.json()
      assert.match(pot.id, /^[0-9a-f-]{36}$/)
      assert.deepEqual(Object.keys(pot).sort(), ['id', 'name', 'target', 'theme', 'total'])
      assert.equal(pot.name, 'Savings') // Duplicate names are legal.
      assert.equal(pot.total, 0)
      assert.equal(pot.target, 2_000_000)
      assert.equal((await database.pot.findUnique({ where: { id: pot.id } })).ownerId, ownerId)
      assert.deepEqual(await database.balanceSnapshot.findUnique({ where: { ownerId } }), balance)
      assert.equal(await database.pot.count(), 6)
      for (let read = 0; read < 2; read++) {
        const list = await (await fetch(`${base}/api/pots`)).json()
        assert.deepEqual(
          list.find((entry) => entry.id === pot.id),
          pot,
        )
      }
    })

    await t.test('creates the first pot when the owner has an empty list', async () => {
      await database.pot.deleteMany({ where: { ownerId } })
      assert.deepEqual(await (await fetch(`${base}/api/pots`)).json(), [])
      const response = await post({ ...valid, theme: '#277C78' })
      assert.equal(response.status, 201)
      assert.equal((await (await fetch(`${base}/api/pots`)).json()).length, 1)
    })

    await t.test(
      'rejects malformed fields and attempts to set identity or saved funds',
      async () => {
        const invalid = [
          {},
          null,
          [],
          { ...valid, name: '' },
          { ...valid, name: '   ' },
          { ...valid, name: 123 },
          { ...valid, name: 'x'.repeat(31) },
          { ...valid, name: 'bad\u0000name' },
          ...[0, -1, 1.25, 2_147_483_648, '2000000', '1e3', null].map((target) => ({
            ...valid,
            target,
          })),
          { ...valid, theme: '#FFFFFF' },
          { ...valid, theme: null },
          { ...valid, ownerId: randomUUID() },
          { ...valid, id: randomUUID() },
          { ...valid, total: 100 },
        ]
        for (const body of invalid) {
          const response = await post(body)
          assert.equal(response.status, 400, `Unexpected acceptance: ${JSON.stringify(body)}`)
        }
        assert.equal(await database.pot.count(), 5)
      },
    )

    await t.test('counts Unicode code points and accepts exact money boundaries', async () => {
      const response = await post({ ...valid, name: '💰'.repeat(30), target: 2_147_483_647 })
      assert.equal(response.status, 201)
      assert.equal((await response.json()).name, '💰'.repeat(30))
      assert.equal((await post({ ...valid, name: '💰'.repeat(31), theme: '#597C7C' })).status, 400)
      assert.equal((await post({ ...valid, target: 1, theme: '#597C7C' })).status, 201)
    })

    await t.test(
      'client owner selectors cannot redirect writes; another owner may reuse a theme',
      async () => {
        const other = await database.accountOwner.create({ data: { displayName: 'Other owner' } })
        await database.pot.create({
          data: { ownerId: other.id, name: 'Other savings', target: 100, theme: valid.theme },
        })
        const response = await post(valid, `?ownerId=${other.id}`)
        assert.equal(response.status, 201)
        const saved = await response.json()
        assert.equal((await database.pot.findUnique({ where: { id: saved.id } })).ownerId, ownerId)
        assert.equal(await database.pot.count({ where: { ownerId: other.id } }), 1)
      },
    )

    await t.test('simultaneous identical creates yield one pot and one safe conflict', async () => {
      const responses = await Promise.all([post(valid), post(valid)])
      assert.deepEqual(responses.map((response) => response.status).sort(), [201, 409])
      assert.equal(await database.pot.count({ where: { ownerId, theme: valid.theme } }), 1)
      const conflict = await responses.find((response) => response.status === 409).json()
      assert.equal(conflict.statusCode, 409)
      assert.match(conflict.message, /theme.*already used/)
      assert.doesNotMatch(JSON.stringify(conflict), /Prisma|postgresql|password|constraint/)
    })

    await t.test('palette exhaustion cannot create a sixteenth pot', async () => {
      const existing = (await database.pot.findMany({ where: { ownerId } })).map((pot) => pot.theme)
      for (const theme of POT_THEMES.filter((theme) => !existing.includes(theme))) {
        assert.equal((await post({ ...valid, theme })).status, 201)
      }
      assert.equal(await database.pot.count({ where: { ownerId } }), 15)
      assert.equal((await post(valid)).status, 409)
      assert.equal(await database.pot.count({ where: { ownerId } }), 15)
    })
  } finally {
    if (app) await app.close()
    if (created) await admin.query(`DROP DATABASE "${databaseName}" WITH (FORCE)`)
    await admin.end()
  }
})
