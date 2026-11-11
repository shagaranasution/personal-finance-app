import assert from 'node:assert/strict'
import { test } from 'node:test'
import { MAX_RUPIAH } from '../src/shared/lib/money.ts'
import { paginateItems } from '../src/shared/lib/pagination.ts'
import {
  getRecurringBillSummary,
  getVisibleRecurringBills,
} from '../src/features/recurring-bills/recurring-bill-query.ts'

const bills = [
  {
    vendorId: 'bravo',
    name: 'Bravo Utilities',
    amount: 20_000,
    dueDate: '2024-08-24',
    status: 'due-soon',
    canonicalTransactionId: 'bill-2',
  },
  {
    vendorId: 'alpha',
    name: 'Alpha Energy',
    amount: 50_000,
    dueDate: '2024-08-19',
    status: 'paid',
    canonicalTransactionId: 'bill-1',
  },
  {
    vendorId: 'charlie',
    name: 'Charlie Network',
    amount: 20_000,
    dueDate: '2024-08-19',
    status: 'upcoming',
    canonicalTransactionId: 'bill-3',
  },
  {
    vendorId: 'delta',
    name: 'Delta Media',
    amount: 10_000,
    dueDate: '2024-08-30',
    status: 'overdue',
    canonicalTransactionId: 'bill-4',
  },
]

test('search trims whitespace, ignores case, and searches vendor names', () => {
  assert.deepEqual(
    getVisibleRecurringBills(bills, '  nEtWoRk ', 'latest').map((bill) => bill.vendorId),
    ['charlie'],
  )
  assert.equal(getVisibleRecurringBills(bills, 'not a vendor', 'latest').length, 0)
})

test('latest and oldest sort by the documented due-date direction with stable ties', () => {
  assert.deepEqual(
    getVisibleRecurringBills(bills, '', 'latest').map((bill) => bill.vendorId),
    ['alpha', 'charlie', 'bravo', 'delta'],
  )
  assert.deepEqual(
    getVisibleRecurringBills(bills, '', 'oldest').map((bill) => bill.vendorId),
    ['delta', 'bravo', 'alpha', 'charlie'],
  )
})

test('name and amount sorts work in both directions and stabilize ties', () => {
  assert.deepEqual(
    getVisibleRecurringBills(bills, '', 'a-z').map((bill) => bill.vendorId),
    ['alpha', 'bravo', 'charlie', 'delta'],
  )
  assert.deepEqual(
    getVisibleRecurringBills(bills, '', 'z-a').map((bill) => bill.vendorId),
    ['delta', 'charlie', 'bravo', 'alpha'],
  )
  assert.deepEqual(
    getVisibleRecurringBills(bills, '', 'highest').map((bill) => bill.vendorId),
    ['alpha', 'charlie', 'bravo', 'delta'],
  )
  assert.deepEqual(
    getVisibleRecurringBills(bills, '', 'lowest').map((bill) => bill.vendorId),
    ['delta', 'charlie', 'bravo', 'alpha'],
  )
})

test('summary includes all bills regardless of the visible search result', () => {
  const summary = getRecurringBillSummary(bills)

  assert.deepEqual(summary.totalBills, { count: 4, amount: 100_000 })
  assert.deepEqual(summary.paidBills, { count: 1, amount: 50_000 })
  assert.deepEqual(summary.upcomingBills, { count: 3, amount: 50_000 })
  assert.deepEqual(summary.dueSoonBills, { count: 1, amount: 20_000 })
  assert.equal(getVisibleRecurringBills(bills, 'Alpha', 'latest').length, 1)
  assert.deepEqual(getRecurringBillSummary(bills), summary)
})

test('summary rejects totals outside the supported whole-rupiah range', () => {
  assert.throws(
    () =>
      getRecurringBillSummary([
        { ...bills[0], amount: MAX_RUPIAH },
        { ...bills[1], amount: 1 },
      ]),
    /supported rupiah limit/,
  )
})

test('23 synthetic recurring bills paginate after search and sorting while summaries stay complete', () => {
  const manyBills = Array.from({ length: 23 }, (_, index) => ({
    vendorId: `vendor-${String(index + 1).padStart(2, '0')}`,
    name: `Vendor ${String(index + 1).padStart(2, '0')} ${index < 11 ? 'Batch One' : 'Batch Two'}`,
    amount: (index + 1) * 1_000,
    dueDate: `2024-08-${String((index % 28) + 1).padStart(2, '0')}`,
    status: index % 4 === 0 ? 'paid' : index % 4 === 1 ? 'due-soon' : 'upcoming',
    canonicalTransactionId: `bill-${index + 1}`,
  }))
  const sortedBills = getVisibleRecurringBills(manyBills, '', 'a-z')
  const firstPage = paginateItems(sortedBills, 1)
  const secondPage = paginateItems(sortedBills, 2)
  const thirdPage = paginateItems(sortedBills, 3)

  assert.equal(firstPage.pageCount, 3)
  assert.equal(firstPage.items.length, 10)
  assert.equal(secondPage.items.length, 10)
  assert.equal(thirdPage.items.length, 3)
  assert.deepEqual([firstPage.firstItem, firstPage.lastItem], [1, 10])
  assert.deepEqual([thirdPage.firstItem, thirdPage.lastItem], [21, 23])

  const matchingBills = getVisibleRecurringBills(manyBills, 'batch one', 'lowest')
  const finalMatchPage = paginateItems(matchingBills, 2)
  assert.equal(matchingBills.length, 11)
  assert.equal(finalMatchPage.pageCount, 2)
  assert.deepEqual(
    finalMatchPage.items.map((bill) => bill.vendorId),
    ['vendor-11'],
  )
  assert.deepEqual(getRecurringBillSummary(manyBills).totalBills, {
    count: 23,
    amount: 276_000,
  })
})
