import type { Transaction } from './types'

export const transactionCategories = [
  'Entertainment',
  'Bills',
  'Groceries',
  'Dining Out',
  'Transportation',
  'Personal Care',
  'Education',
  'Lifestyle',
  'Shopping',
  'General',
] as const

export type TransactionCategory = (typeof transactionCategories)[number]

export const transactionSorts = [
  { value: 'latest', label: 'Latest' },
  { value: 'oldest', label: 'Oldest' },
  { value: 'a-z', label: 'A to Z' },
  { value: 'z-a', label: 'Z to A' },
  { value: 'highest', label: 'Highest' },
  { value: 'lowest', label: 'Lowest' },
] as const

export type TransactionSort = (typeof transactionSorts)[number]['value']

export function isTransactionCategory(value: string | null): value is TransactionCategory {
  return transactionCategories.some((category) => category === value)
}

export function isTransactionSort(value: string | null): value is TransactionSort {
  return transactionSorts.some((sort) => sort.value === value)
}

function compareLatest(left: Transaction, right: Transaction) {
  return Date.parse(right.date) - Date.parse(left.date) || left.id.localeCompare(right.id)
}

export function getVisibleTransactions(
  source: Transaction[],
  search: string,
  category: TransactionCategory | null,
  sort: TransactionSort,
) {
  const query = search.trim().toLocaleLowerCase('en-US')
  const matching = source.filter((transaction) => {
    const matchesName = transaction.name.toLocaleLowerCase('en-US').includes(query)
    const matchesCategory = category === null || transaction.category === category
    return matchesName && matchesCategory
  })

  const collator = new Intl.Collator('en-US', { sensitivity: 'base' })
  return matching.sort((left, right) => {
    if (sort === 'latest') return compareLatest(left, right)
    if (sort === 'oldest') {
      return Date.parse(left.date) - Date.parse(right.date) || left.id.localeCompare(right.id)
    }
    if (sort === 'a-z' || sort === 'z-a') {
      const nameOrder = collator.compare(left.name, right.name)
      return (sort === 'a-z' ? nameOrder : -nameOrder) || compareLatest(left, right)
    }

    const amountOrder = left.amount - right.amount
    return (sort === 'highest' ? -amountOrder : amountOrder) || compareLatest(left, right)
  })
}
