/** Single-currency contract: every amount is an integer number of rupiah. */
export const CURRENCY = 'IDR'
export const MAX_RUPIAH = 2_147_483_647 // PostgreSQL Int upper bound, not a product goal cap.

export function assertRupiah(amount: number, minimum = 0): number {
  if (!Number.isInteger(amount) || amount < minimum || amount > MAX_RUPIAH) {
    throw new Error(`Amount must be whole rupiah from ${minimum} to ${MAX_RUPIAH}`)
  }
  return amount
}

/** Form/API input is ungrouped whole rupiah, e.g. "150000", never "150.000". */
export function parseRupiah(input: string): number {
  if (!/^\d+$/.test(input)) throw new Error('Enter whole rupiah using digits only')
  return assertRupiah(Number(input))
}
