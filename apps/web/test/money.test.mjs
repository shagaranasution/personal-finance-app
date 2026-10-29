import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { test } from 'node:test'
import { formatRupiah } from '../src/shared/lib/money.ts'

const readable = (value) => value.replace(/\s/g, ' ')

test('currency formatting uses rupiah, Indonesian grouping, and transaction signs', () => {
  assert.equal(readable(formatRupiah(4_836_000)), 'Rp 4.836.000')
  assert.equal(readable(formatRupiah(75_500, true)), '+Rp 75.500')
  assert.equal(readable(formatRupiah(-55_500, true)), '−Rp 55.500')
  assert.equal(readable(formatRupiah(0, true)), 'Rp 0')
})

test('display rejects fractional and unsafe amounts instead of silently rounding', () => {
  for (const amount of [1.25, NaN, Infinity, Number.MAX_SAFE_INTEGER + 1]) {
    assert.throws(() => formatRupiah(amount))
  }
})

test('all 49 app transaction fixtures contain already-adapted whole rupiah', async () => {
  const transactions = JSON.parse(
    await readFile(
      new URL('../src/features/transactions/data/transactions.json', import.meta.url),
      'utf8',
    ),
  )
  assert.equal(transactions.length, 49)
  assert.ok(transactions.every((transaction) => Number.isSafeInteger(transaction.amount)))
  assert.equal(
    transactions.find((transaction) => transaction.id === 'transaction-001').amount,
    75_500,
  )
  assert.equal(
    transactions.reduce((sum, transaction) => sum + transaction.amount, 0),
    2_114_500,
  )
})
