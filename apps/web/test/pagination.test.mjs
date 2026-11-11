import assert from 'node:assert/strict'
import { test } from 'node:test'
import { getPaginationPageNumbers, paginateItems } from '../src/shared/lib/pagination.ts'

test('49 items use five pages and leave nine items on the last page', () => {
  const records = Array.from({ length: 49 }, (_, index) => `record-${index + 1}`)
  const firstPage = paginateItems(records, 1)
  const lastPage = paginateItems(records, 5)

  assert.equal(firstPage.pageCount, 5)
  assert.equal(firstPage.items.length, 10)
  assert.deepEqual([firstPage.firstItem, firstPage.lastItem], [1, 10])
  assert.equal(lastPage.items.length, 9)
  assert.deepEqual([lastPage.firstItem, lastPage.lastItem], [41, 49])
})

test('paging clamps invalid and out-of-range page requests and supports empty results', () => {
  assert.equal(paginateItems(['one', 'two'], 4).page, 1)
  assert.equal(paginateItems(['one', 'two'], 0).page, 1)
  assert.deepEqual(paginateItems([], 3), {
    items: [],
    page: 1,
    pageCount: 0,
    firstItem: 0,
    lastItem: 0,
    totalItems: 0,
  })
  assert.throws(() => paginateItems(['one'], 1, 0), /positive integer/)
})

test('page numbers keep the first, last, and neighboring pages visible', () => {
  assert.deepEqual(getPaginationPageNumbers(1, 5), [1, 2, 5])
  assert.deepEqual(getPaginationPageNumbers(3, 5), [1, 2, 3, 4, 5])
  assert.deepEqual(getPaginationPageNumbers(8, 12), [1, 7, 8, 9, 12])
})
