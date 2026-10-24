import type { ComponentType } from 'react'
import { IconNavBudgets } from '@/shared/components/icons/IconNavBudgets'
import { IconNavOverview } from '@/shared/components/icons/IconNavOverview'
import { IconNavPots } from '@/shared/components/icons/IconNavPots'
import { IconNavRecurringBills } from '@/shared/components/icons/IconNavRecurringBills'
import { IconNavTransactions } from '@/shared/components/icons/IconNavTransactions'
import type { IconProps } from '@/shared/components/icons/types'

export interface NavigationItem {
  label: string
  to: string
  Icon: ComponentType<IconProps>
}

export const navigationItems: NavigationItem[] = [
  { label: 'Overview', to: '/', Icon: IconNavOverview },
  { label: 'Transactions', to: '/transactions', Icon: IconNavTransactions },
  { label: 'Budgets', to: '/budgets', Icon: IconNavBudgets },
  { label: 'Pots', to: '/pots', Icon: IconNavPots },
  { label: 'Recurring Bills', to: '/recurring-bills', Icon: IconNavRecurringBills },
]
