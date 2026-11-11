import type { RecurringBill } from './recurring-bill-calculation'
import { MAX_RUPIAH } from '../../shared/lib/money.ts'

export const recurringBillSorts = [
  { value: 'latest', label: 'Latest' },
  { value: 'oldest', label: 'Oldest' },
  { value: 'a-z', label: 'A to Z' },
  { value: 'z-a', label: 'Z to A' },
  { value: 'highest', label: 'Highest' },
  { value: 'lowest', label: 'Lowest' },
] as const

export type RecurringBillSort = (typeof recurringBillSorts)[number]['value']

export interface RecurringBillSummary {
  totalBills: { count: number; amount: number }
  paidBills: { count: number; amount: number }
  upcomingBills: { count: number; amount: number }
  dueSoonBills: { count: number; amount: number }
}

const collator = new Intl.Collator('en-US', { sensitivity: 'base' })

function compareId(left: RecurringBill, right: RecurringBill): number {
  return left.vendorId < right.vendorId ? -1 : left.vendorId > right.vendorId ? 1 : 0
}

function compareDueDate(left: RecurringBill, right: RecurringBill): number {
  return (
    (left.dueDate < right.dueDate ? -1 : left.dueDate > right.dueDate ? 1 : 0) ||
    compareId(left, right)
  )
}

export function getVisibleRecurringBills(
  source: readonly RecurringBill[],
  search: string,
  sort: RecurringBillSort,
): RecurringBill[] {
  const query = search.trim().toLocaleLowerCase('en-US')
  const matching = source.filter((bill) => bill.name.toLocaleLowerCase('en-US').includes(query))

  return matching.sort((left, right) => {
    if (sort === 'latest') return compareDueDate(left, right)
    if (sort === 'oldest') {
      return (
        (left.dueDate > right.dueDate ? -1 : left.dueDate < right.dueDate ? 1 : 0) ||
        compareId(left, right)
      )
    }
    if (sort === 'a-z' || sort === 'z-a') {
      const nameOrder = collator.compare(left.name, right.name)
      return (sort === 'a-z' ? nameOrder : -nameOrder) || compareDueDate(left, right)
    }

    const amountOrder = left.amount === right.amount ? 0 : left.amount > right.amount ? -1 : 1
    return (sort === 'highest' ? amountOrder : -amountOrder) || compareDueDate(left, right)
  })
}

export function getRecurringBillSummary(bills: readonly RecurringBill[]): RecurringBillSummary {
  const summarize = (matching: readonly RecurringBill[]) => {
    const amount = matching.reduce((total, bill) => total + bill.amount, 0)
    if (!Number.isSafeInteger(amount) || amount > MAX_RUPIAH) {
      throw new RangeError('Recurring bill summary exceeds the supported rupiah limit')
    }
    return { count: matching.length, amount }
  }

  return {
    totalBills: summarize(bills),
    paidBills: summarize(bills.filter((bill) => bill.status === 'paid')),
    upcomingBills: summarize(bills.filter((bill) => bill.status !== 'paid')),
    dueSoonBills: summarize(bills.filter((bill) => bill.status === 'due-soon')),
  }
}
