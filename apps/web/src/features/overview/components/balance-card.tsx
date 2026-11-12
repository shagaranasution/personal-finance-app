import { Card } from '@/shared/ui/card'
import { formatRupiah } from '@/shared/lib/money'

interface BalanceCardProps {
  label: string
  amount: number
  emphasized?: boolean
}

export function BalanceCard({ label, amount, emphasized = false }: BalanceCardProps) {
  return (
    <Card
      padding="compact"
      className={`flex min-h-[84px] flex-col justify-center gap-100 tablet:min-h-[106px] ${emphasized ? 'text-white' : ''}`}
      style={emphasized ? { backgroundColor: 'var(--color-grey-900)' } : undefined}
    >
      <p className={`text-preset-5 ${emphasized ? 'text-white' : 'text-grey-500'}`}>{label}</p>
      <p className="text-preset-2">{formatRupiah(amount)}</p>
    </Card>
  )
}
