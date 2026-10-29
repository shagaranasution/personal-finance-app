/** Amounts are already whole IDR. Never scale or round values at display time. */
const formatter = new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
})

export function formatRupiah(amount: number, showPositiveSign = false): string {
  if (!Number.isSafeInteger(amount)) throw new Error('Expected an integer rupiah amount')
  const formatted = formatter.format(amount).replace('-', '−')
  return showPositiveSign && amount > 0 ? `+${formatted}` : formatted
}
