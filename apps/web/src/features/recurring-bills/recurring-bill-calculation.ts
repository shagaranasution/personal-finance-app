import { MAX_RUPIAH } from '../../shared/lib/money.ts'
import type { Transaction } from '../transactions/types'

const DAY_MS = 24 * 60 * 60 * 1000

export const RECURRING_BILL_DUE_SOON_DAYS = 5

export const DEMO_RECURRING_BILL_CONTEXT = {
  reportingMonth: '2024-08',
  referenceDate: '2024-08-19',
} as const

export type RecurringBillStatus = 'paid' | 'due-soon' | 'upcoming' | 'overdue'

export interface RecurringBillCalculationContext {
  /** Calendar month used for projected due dates and paid status, in YYYY-MM form. */
  reportingMonth: string
  /** Inclusive UTC calendar day used to select history and calculate due-soon status. */
  referenceDate: string
}

export interface RecurringBill {
  /** Fixture identity from the normalized vendor name; persisted data will use a vendor ID. */
  vendorId: string
  name: string
  /** Positive whole-rupiah monthly amount from the canonical recurring transaction. */
  amount: number
  dueDate: string
  status: RecurringBillStatus
  canonicalTransactionId: string
}

interface DatedRecurringTransaction {
  transaction: Transaction
  timestamp: number
  vendorId: string
}

function parseUtcDate(value: string, label: string): number {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
  if (!match) throw new RangeError(`${label} must be a valid YYYY-MM-DD date`)

  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])
  const timestamp = Date.UTC(year, month - 1, day)
  const parsed = new Date(timestamp)

  if (
    parsed.getUTCFullYear() !== year ||
    parsed.getUTCMonth() !== month - 1 ||
    parsed.getUTCDate() !== day
  ) {
    throw new RangeError(`${label} must be a valid YYYY-MM-DD date`)
  }

  return timestamp
}

function normalizeVendorName(name: string): string {
  return name.trim().replace(/\s+/g, ' ').toLowerCase()
}

function compareText(left: string, right: string): number {
  return left < right ? -1 : left > right ? 1 : 0
}

function buildDueDate(reportingMonth: string, scheduledDay: number): string {
  const [yearText, monthText] = reportingMonth.split('-')
  const year = Number(yearText)
  const month = Number(monthText)
  const finalDay = new Date(Date.UTC(year, month, 0)).getUTCDate()
  const day = Math.min(scheduledDay, finalDay)

  return `${reportingMonth}-${String(day).padStart(2, '0')}`
}

/**
 * Projects one monthly bill per vendor from recurring outgoing transactions.
 * All dates are compared as UTC calendar dates and the reference date is explicit;
 * the function never reads the machine clock or local timezone.
 */
export function calculateRecurringBills(
  transactions: readonly Transaction[],
  context: RecurringBillCalculationContext,
): RecurringBill[] {
  const referenceDay = parseUtcDate(context.referenceDate, 'referenceDate')
  const referenceEnd = referenceDay + DAY_MS
  const reportingMonthStart = parseUtcDate(`${context.reportingMonth}-01`, 'reportingMonth')
  const [yearText, monthText] = context.reportingMonth.split('-')
  const reportingMonthEnd = Date.UTC(Number(yearText), Number(monthText), 1)
  const vendors = new Map<string, DatedRecurringTransaction[]>()

  for (const transaction of transactions) {
    if (!transaction.recurring || transaction.amount >= 0) continue

    const vendorId = normalizeVendorName(transaction.name)
    if (!vendorId) {
      throw new RangeError(`Recurring transaction ${transaction.id} must have a vendor name`)
    }
    if (!Number.isSafeInteger(transaction.amount) || Math.abs(transaction.amount) > MAX_RUPIAH) {
      throw new RangeError(
        `Recurring transaction ${transaction.id} must have a bounded whole-rupiah amount`,
      )
    }

    const timestamp = Date.parse(transaction.date)
    if (!Number.isFinite(timestamp)) {
      throw new RangeError(`Recurring transaction ${transaction.id} must have a valid date`)
    }
    if (timestamp >= referenceEnd) continue

    const records = vendors.get(vendorId) ?? []
    records.push({ transaction, timestamp, vendorId })
    vendors.set(vendorId, records)
  }

  const bills: RecurringBill[] = []

  for (const [vendorId, records] of vendors) {
    records.sort(
      (left, right) =>
        right.timestamp - left.timestamp || compareText(left.transaction.id, right.transaction.id),
    )
    const canonical = records[0]
    if (!canonical) continue

    const transactionDate = new Date(canonical.timestamp)
    const dueDate = buildDueDate(context.reportingMonth, transactionDate.getUTCDate())
    const dueDay = parseUtcDate(dueDate, 'calculated dueDate')
    const daysUntilDue = Math.floor((dueDay - referenceDay) / DAY_MS)
    const paid = records.some(
      ({ timestamp }) => timestamp >= reportingMonthStart && timestamp < reportingMonthEnd,
    )
    const status: RecurringBillStatus = paid
      ? 'paid'
      : daysUntilDue < 0
        ? 'overdue'
        : daysUntilDue <= RECURRING_BILL_DUE_SOON_DAYS
          ? 'due-soon'
          : 'upcoming'

    bills.push({
      vendorId,
      name: canonical.transaction.name.trim().replace(/\s+/g, ' '),
      amount: Math.abs(canonical.transaction.amount),
      dueDate,
      status,
      canonicalTransactionId: canonical.transaction.id,
    })
  }

  return bills.sort(
    (left, right) =>
      compareText(left.dueDate, right.dueDate) || compareText(left.vendorId, right.vendorId),
  )
}
