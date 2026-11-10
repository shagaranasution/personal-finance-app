import { formatRupiah, MAX_RUPIAH } from '@/shared/lib/money'
import type { PotMovementDirection } from './pot-fixture-adapter'

export type PotMovementValidation =
  { valid: true; amount: number } | { valid: false; error: string }

export function validatePotMovement(
  rawAmount: string,
  direction: PotMovementDirection,
  currentBalance: number,
  potTotal: number,
): PotMovementValidation {
  if (!/^\d+$/.test(rawAmount)) {
    return { valid: false, error: 'Enter a whole-rupiah amount using digits only.' }
  }

  const amount = Number(rawAmount)
  if (!Number.isSafeInteger(amount) || amount < 1 || amount > MAX_RUPIAH) {
    return {
      valid: false,
      error: `Enter a whole-rupiah amount from 1 to ${formatRupiah(MAX_RUPIAH)}.`,
    }
  }
  if (direction === 'add' && amount > currentBalance) {
    return {
      valid: false,
      error: `You can add up to the current balance of ${formatRupiah(currentBalance)}.`,
    }
  }
  if (direction === 'withdraw' && amount > potTotal) {
    return {
      valid: false,
      error: `You can withdraw up to this pot’s total of ${formatRupiah(potTotal)}.`,
    }
  }
  if (direction === 'withdraw' && currentBalance + amount > MAX_RUPIAH) {
    return {
      valid: false,
      error: 'This withdrawal would exceed the supported balance limit.',
    }
  }
  if (direction === 'add' && potTotal + amount > MAX_RUPIAH) {
    return {
      valid: false,
      error: 'This addition would exceed the supported pot total limit.',
    }
  }

  return { valid: true, amount }
}
