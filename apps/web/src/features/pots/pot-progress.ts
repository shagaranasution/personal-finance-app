const percentageFormatter = new Intl.NumberFormat('en-US', {
  minimumFractionDigits: 1,
  maximumFractionDigits: 2,
})

export function getPotProgress(total: number, target: number) {
  if (!Number.isSafeInteger(total) || total < 0 || !Number.isSafeInteger(target) || target <= 0) {
    throw new Error('Progress requires nonnegative whole rupiah and a positive target')
  }
  const percentage = (total / target) * 100
  return {
    percentage,
    label: `${percentageFormatter.format(percentage)}%`,
    fill: Math.min(100, percentage),
    goalReached: total >= target,
    overTarget: total > target,
  }
}
