import assert from 'node:assert/strict'
import { randomUUID } from 'node:crypto'
import { spawnSync } from 'node:child_process'
import { test } from 'node:test'
import pg from 'pg'
import { createApp } from '../dist/app.js'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../dist/generated/prisma/client.js'
import { seedDemo } from '../dist/development/seed-demo.js'
import { demoBalance, demoPots } from '../dist/development/seed-data.js'
import { assertLocalSeedDatabase, getLocalDemoOwnerId } from '../dist/development/demo-owner.js'
import { readConfig } from '../dist/config.js'
import { assertRupiah, parseRupiah, MAX_RUPIAH } from '../dist/money.js'

test('whole-rupiah inputs reject fractions, formatting, and overflow', () => {
  assert.equal(parseRupiah('3814250'), 3_814_250)
  assert.equal(parseRupiah('0'), 0)
  assert.equal(parseRupiah(String(MAX_RUPIAH)), MAX_RUPIAH)
  for (const input of [
    '',
    ' ',
    '-1',
    '1.25',
    '1,25',
    '1.000',
    'Rp1000',
    '1e3',
    'Infinity',
    String(MAX_RUPIAH + 1),
  ]) {
    assert.throws(() => parseRupiah(input))
  }
  for (const amount of [NaN, Infinity, 0.5, -1, MAX_RUPIAH + 1])
    assert.throws(() => assertRupiah(amount))
  assert.throws(() => assertRupiah(0, 1))
})

test('demo identity refuses production and remote seed targets', () => {
  assert.throws(() => assertLocalSeedDatabase('postgresql://example:secret@remote.example/finance'))
  const previous = process.env.NODE_ENV
  try {
    process.env.NODE_ENV = 'production'
    assert.throws(() => getLocalDemoOwnerId(), /disabled in production/)
  } finally {
    if (previous === undefined) delete process.env.NODE_ENV
    else process.env.NODE_ENV = previous
  }
})

test('migrations, ownership, and seed use a disposable database', async (t) => {
  const { databaseUrl } = readConfig()
  assertLocalSeedDatabase(databaseUrl)
  const admin = new pg.Pool({ connectionString: databaseUrl })
  // This test only deletes the unique database it creates, never the configured application database.
  const databaseName = `fin07_test_${randomUUID().replaceAll('-', '')}`
  const url = new URL(databaseUrl)
  url.pathname = `/${databaseName}`
  const testUrl = url.toString()
  let database
  let created = false
  try {
    await admin.query(`CREATE DATABASE "${databaseName}"`)
    created = true
    const migration = spawnSync('npm', ['run', 'db:migrate'], {
      env: { ...process.env, DATABASE_URL: testUrl },
      encoding: 'utf8',
      timeout: 30000,
    })
    assert.equal(migration.status, 0, `${migration.stdout}\n${migration.stderr}`)
    database = new PrismaClient({
      adapter: new PrismaPg({ connectionString: testUrl }, { schema: 'finance' }),
    })
    const reset = async () => {
      await database.pot.deleteMany()
      await database.balanceSnapshot.deleteMany()
      await database.accountOwner.deleteMany()
    }
    const ownerId = getLocalDemoOwnerId()
    const newPot = (overrides = {}) => ({
      id: randomUUID(),
      ownerId,
      name: 'Extra pot',
      target: 1000,
      total: 0,
      theme: '#C94736',
      ...overrides,
    })

    await t.test('fractional seed data is rejected before any database inserts', async () => {
      const originalTarget = demoPots[0].target
      try {
        demoPots[0].target = 1.25
        await assert.rejects(seedDemo(database), /whole rupiah/)
        assert.equal(await database.accountOwner.count(), 0)
        assert.equal(await database.balanceSnapshot.count(), 0)
        assert.equal(await database.pot.count(), 0)
      } finally {
        demoPots[0].target = originalTarget
      }
    })

    await t.test(
      'empty-database migrations and repeated seeds produce exact stable IDR data',
      async () => {
        await seedDemo(database)
        await seedDemo(database)
        assert.equal(await database.accountOwner.count(), 1)
        assert.equal(await database.balanceSnapshot.count(), 1)
        assert.equal(await database.pot.count(), 5)
        assert.deepEqual(await database.balanceSnapshot.findUnique({ where: { ownerId } }), {
          id: demoBalance.id,
          ownerId,
          current: 4_836_000,
          income: 3_814_250,
          expenses: 1_700_500,
        })
        const pots = await database.pot.findMany({ orderBy: { id: 'asc' } })
        assert.deepEqual(
          pots,
          demoPots.map((pot) => ({ ...pot, ownerId })),
        )
        assert.equal(
          pots.reduce((sum, pot) => sum + pot.total, 0),
          920_000,
        )
        assert.equal(demoBalance.current + pots.reduce((sum, pot) => sum + pot.total, 0), 5_756_000)
      },
    )

    await t.test(
      'reseeding preserves edits and restores only missing fixture records',
      async () => {
        await database.pot.update({
          where: { id: demoPots[0].id },
          data: { name: 'My savings', total: 200_000 },
        })
        await database.balanceSnapshot.update({ where: { ownerId }, data: { current: 4_795_000 } })
        await database.pot.delete({ where: { id: demoPots[4].id } })
        await seedDemo(database)
        assert.equal(
          (await database.pot.findUnique({ where: { id: demoPots[0].id } })).name,
          'My savings',
        )
        assert.equal(
          (await database.pot.findUnique({ where: { id: demoPots[0].id } })).total,
          200_000,
        )
        assert.equal(
          (await database.balanceSnapshot.findUnique({ where: { ownerId } })).current,
          4_795_000,
        )
        assert.equal(await database.pot.count(), 5)
      },
    )

    await t.test('foreign keys, one snapshot, and owner-scoped themes are enforced', async () => {
      await assert.rejects(database.pot.create({ data: newPot({ ownerId: randomUUID() }) }))
      await assert.rejects(
        database.balanceSnapshot.create({ data: { ownerId, current: 0, income: 0, expenses: 0 } }),
      )
      await assert.rejects(database.pot.create({ data: newPot({ theme: demoPots[0].theme }) }))
      await assert.rejects(database.accountOwner.delete({ where: { id: ownerId } }))
      const other = await database.accountOwner.create({ data: { displayName: 'Another owner' } })
      await database.pot.create({ data: newPot({ ownerId: other.id, theme: demoPots[0].theme }) })
      const ownPots = await database.pot.findMany({ where: { ownerId } })
      assert.equal(ownPots.length, 5)
      assert.ok(ownPots.every((pot) => pot.ownerId === ownerId))
    })

    await t.test(
      'SQL constraints reject invalid money, names, themes; goals may be exceeded',
      async () => {
        for (const overrides of [
          { target: 0 },
          { target: -1 },
          { target: 2_147_483_648 },
          { total: -1 },
          { name: '' },
          { name: '   ' },
          { name: ' padded ' },
          { name: 'x'.repeat(31) },
          { theme: '#FFFFFF' },
        ]) {
          await assert.rejects(database.pot.create({ data: newPot(overrides) }))
        }
        for (const field of ['current', 'income', 'expenses']) {
          await assert.rejects(
            database.balanceSnapshot.update({ where: { ownerId }, data: { [field]: -1 } }),
          )
        }
        const beyondGoal = await database.pot.create({
          data: newPot({ name: demoPots[1].name, total: 2000, target: 1000 }),
        })
        assert.equal(beyondGoal.total, 2000) // Duplicate names and above-target saving are legal.
      },
    )

    await t.test(
      'HTTP pot reads are owner-scoped, stable, persisted, and empty when appropriate',
      async () => {
        const previousUrl = process.env.DATABASE_URL
        let app
        try {
          process.env.DATABASE_URL = testUrl
          app = await createApp()
        } finally {
          if (previousUrl === undefined) delete process.env.DATABASE_URL
          else process.env.DATABASE_URL = previousUrl
        }
        try {
          await app.listen(0, '127.0.0.1')
          const base = await app.getUrl()
          const other = await database.accountOwner.findFirst({ where: { id: { not: ownerId } } })
          const request = await fetch(`${base}/api/pots?ownerId=${other.id}`)
          assert.equal(request.status, 200)
          assert.equal(request.headers.get('cache-control'), 'no-store')
          const data = await request.json()
          const expected = await database.pot.findMany({
            where: { ownerId },
            select: { id: true, name: true, theme: true, total: true, target: true },
            orderBy: { id: 'asc' },
          })
          assert.deepEqual(data, expected)
          assert.ok(data.every((pot) => !('ownerId' in pot)))
          assert.equal(
            data.some((pot) => pot.name === 'My savings' && pot.total === 200_000),
            true,
          )
          assert.deepEqual(await (await fetch(`${base}/api/pots`)).json(), expected)
          // Only disposable test data is removed; the application database is untouched.
          await database.pot.deleteMany({ where: { ownerId } })
          const empty = await fetch(`${base}/api/pots`)
          assert.equal(empty.status, 200)
          assert.deepEqual(await empty.json(), [])
        } finally {
          await app.close()
        }
      },
    )

    await t.test('a late seed conflict rolls back every earlier insert', async () => {
      await reset()
      await database.accountOwner.create({ data: { id: ownerId, displayName: 'Existing owner' } })
      await database.pot.create({ data: newPot({ theme: demoPots[4].theme }) })
      await assert.rejects(seedDemo(database))
      assert.equal(await database.balanceSnapshot.count(), 0)
      assert.equal(await database.pot.count(), 1)
      assert.equal(
        (await database.accountOwner.findUnique({ where: { id: ownerId } })).displayName,
        'Existing owner',
      )
    })

    await t.test('a conflicting seed ID cannot be reassigned to the demo owner', async () => {
      await reset()
      const other = await database.accountOwner.create({ data: { displayName: 'Another owner' } })
      await database.pot.create({ data: newPot({ id: demoPots[0].id, ownerId: other.id }) })
      await assert.rejects(seedDemo(database), /different owner/)
      assert.equal(await database.accountOwner.count(), 1)
      assert.equal(await database.balanceSnapshot.count(), 0)
      assert.equal(
        (await database.pot.findUnique({ where: { id: demoPots[0].id } })).ownerId,
        other.id,
      )
    })
  } finally {
    if (database) await database.$disconnect()
    if (created) await admin.query(`DROP DATABASE "${databaseName}" WITH (FORCE)`)
    await admin.end()
  }
})
