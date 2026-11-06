import { useSyncExternalStore } from 'react'
import { budgets as initialBudgets } from './data/budgets'
import type { CreateBudgetInput } from './create-budget-validation'
import type { Budget } from './types'

// Shared in-memory state lets pages consume the same budgets until FIN-28 adds persistence.
let currentBudgets = initialBudgets
const subscribers = new Set<() => void>()

function subscribe(listener: () => void) {
  subscribers.add(listener)
  return () => subscribers.delete(listener)
}

function getSnapshot() {
  return currentBudgets
}

function publish(nextBudgets: Budget[]) {
  currentBudgets = nextBudgets
  subscribers.forEach((listener) => listener())
}

export function useBudgets() {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot)
}

export function addBudget(input: CreateBudgetInput) {
  publish([...currentBudgets, { ...input, id: `budget-${crypto.randomUUID()}` }])
}

export function updateBudget(id: string, input: CreateBudgetInput) {
  publish(currentBudgets.map((budget) => (budget.id === id ? { ...budget, ...input } : budget)))
}

export function removeBudget(id: string) {
  publish(currentBudgets.filter((budget) => budget.id !== id))
}
