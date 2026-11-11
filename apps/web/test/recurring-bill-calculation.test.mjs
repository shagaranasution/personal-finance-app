import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { test } from 'node:test'
import {
  calculateRecurringBills,
  DEMO_RECURRING_BILL_CONTEXT,
} from '../src/features/recurring-bills/recurring-bill-calculation.ts'

const transaction = (id, name, date, amount, recurring = true) => ({
  id,
  name,
  date,
  amount,
  recurring,
})

test('demo bills produce one row per vendor and expected August summaries', async () => {
  const transactions = JSON.parse(
    await readFile(
      new URL('../src/features/transactions/data/transactions.json', import.meta.url),
      'utf8',
    ),
  )
  const bills = calculateRecurringBills(transactions, DEMO_RECURRING_BILL_CONTEXT)
  const sum = (status) =>
    bills.filter((bill) => bill.status === status).reduce((total, bill) => total + bill.amount, 0)

  assert.equal(bills.length, 8)
  assert.equal(sum('paid'), 190_000)
  assert.equal(sum('due-soon'), 59_980)
  assert.equal(sum('upcoming') + sum('due-soon'), 194_980)
  assert.deepEqual(
    bills.filter((bill) => bill.status === 'due-soon').map((bill) => bill.name),
    ['Nimbus Data Storage', 'ByteWise'],
  )
  assert.deepEqual(
    bills.map((bill) => bill.dueDate),
    [
      '2024-08-02',
      '2024-08-03',
      '2024-08-04',
      '2024-08-11',
      '2024-08-21',
      '2024-08-23',
      '2024-08-29',
      '2024-08-30',
    ],
  )
})

test('vendor matching is normalized and the latest eligible record wins ties by ID', () => {
  const transactions = [
    transaction('old', 'Acme Telecom', '2024-07-12T08:00:00Z', -10_000),
    transaction('record-b', '  ACME   TELECOM ', '2024-07-15T08:00:00Z', -12_000),
    transaction('record-a', 'acme telecom', '2024-07-15T08:00:00Z', -13_000),
    transaction('after-reference', 'ACME TELECOM', '2024-08-20T00:00:00Z', -15_000),
  ]
  const [bill] = calculateRecurringBills(transactions, DEMO_RECURRING_BILL_CONTEXT)

  assert.equal(bill.vendorId, 'acme telecom')
  assert.equal(bill.name, 'acme telecom')
  assert.equal(bill.amount, 13_000)
  assert.equal(bill.dueDate, '2024-08-15')
  assert.equal(bill.canonicalTransactionId, 'record-a')
  assert.equal(bill.status, 'overdue')
})

test('due-today and day-five boundaries are included; day-six is excluded', () => {
  const transactions = [
    transaction('today', 'Due Today', '2024-07-19T10:00:00Z', -1_000),
    transaction('zulu', 'Zulu Vendor', '2024-07-19T10:00:00Z', -5_000),
    transaction('alpha', 'Alpha Vendor', '2024-07-19T10:00:00Z', -6_000),
    transaction('day-five', 'Due In Five', '2024-07-24T10:00:00Z', -2_000),
    transaction('day-six', 'Due In Six', '2024-07-25T10:00:00Z', -3_000),
    transaction('yesterday', 'Was Due Yesterday', '2024-07-18T10:00:00Z', -4_000),
  ]
  const bills = calculateRecurringBills(transactions, DEMO_RECURRING_BILL_CONTEXT)
  const statuses = Object.fromEntries(bills.map(({ name, status }) => [name, status]))

  assert.equal(statuses['Due Today'], 'due-soon')
  assert.equal(statuses['Due In Five'], 'due-soon')
  assert.equal(statuses['Due In Six'], 'upcoming')
  assert.equal(statuses['Was Due Yesterday'], 'overdue')
  assert.deepEqual(
    bills.filter((bill) => bill.dueDate === '2024-08-19').map((bill) => bill.vendorId),
    ['alpha vendor', 'due today', 'zulu vendor'],
  )
})

test('paid-in-August takes precedence, includes the full reference UTC day, and excludes future days', () => {
  const transactions = [
    transaction('paid-late', 'Paid Late', '2024-08-19T23:59:59Z', -5_000),
    transaction('future', 'Future Payment', '2024-08-20T00:00:00Z', -6_000),
    transaction('positive', 'Income Record', '2024-08-19T12:00:00Z', 7_000),
    transaction('not-recurring', 'One Time', '2024-08-19T12:00:00Z', -8_000, false),
  ]
  const bills = calculateRecurringBills(transactions, DEMO_RECURRING_BILL_CONTEXT)

  assert.equal(bills.length, 1)
  assert.equal(bills[0].status, 'paid')
  assert.equal(bills[0].dueDate, '2024-08-19')
})

test('scheduled days beyond the reporting month are clamped to its final UTC day', () => {
  const bills = calculateRecurringBills(
    [transaction('month-end', 'Month End', '2024-01-31T12:00:00Z', -9_000)],
    { reportingMonth: '2024-02', referenceDate: '2024-02-20' },
  )

  assert.equal(bills[0].dueDate, '2024-02-29')
  assert.equal(bills[0].status, 'upcoming')
})

test('calculation rejects invalid explicit calendar context', () => {
  assert.throws(
    () =>
      calculateRecurringBills([], {
        reportingMonth: '2024-13',
        referenceDate: '2024-08-19',
      }),
    /reportingMonth/,
  )
  assert.throws(
    () =>
      calculateRecurringBills([], {
        reportingMonth: '2024-08',
        referenceDate: '2024-02-30',
      }),
    /referenceDate/,
  )
})
