import transactionData from './transactions.json'
import type { Transaction } from '../types'

/**
 * The fixture is newest first. Sorting by timestamp and then immutable fixture
 * ID gives tied timestamps a deterministic order across renders.
 */
export const transactions: Transaction[] = [...(transactionData as Transaction[])].sort(
  (left, right) =>
    Date.parse(right.date) - Date.parse(left.date) || left.id.localeCompare(right.id),
)

export const TRANSACTIONS_PER_PAGE = 10
