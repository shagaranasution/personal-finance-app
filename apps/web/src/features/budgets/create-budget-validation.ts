import { transactionCategories } from '@/features/transactions/transaction-query'
import { MAX_RUPIAH } from '@/shared/lib/money'
import { themeOptions } from '@/shared/ui/theme-options'

export interface BudgetFormValues {
  category: string
  maximum: string
  theme: string
}

export interface CreateBudgetInput {
  category: (typeof transactionCategories)[number]
  maximum: number
  theme: string
}

export type BudgetFormErrors = Partial<Record<keyof BudgetFormValues, string>>

type ValidationResult =
  { valid: true; data: CreateBudgetInput } | { valid: false; errors: BudgetFormErrors }

export function validateBudgetForm(
  values: BudgetFormValues,
  usedCategories: readonly string[],
  usedThemes: readonly string[],
): ValidationResult {
  const errors: BudgetFormErrors = {}
  const isCategory = transactionCategories.some((category) => category === values.category)

  if (!isCategory) errors.category = 'Choose a budget category.'
  else if (usedCategories.includes(values.category))
    errors.category = 'A budget for this category already exists.'

  const maximum = Number(values.maximum)
  if (
    !/^\d+$/.test(values.maximum) ||
    !Number.isSafeInteger(maximum) ||
    maximum < 1 ||
    maximum > MAX_RUPIAH
  ) {
    errors.maximum = `Enter whole rupiah from 1 to ${MAX_RUPIAH}, using digits only.`
  }

  if (!themeOptions.some((theme) => theme.value === values.theme)) errors.theme = 'Choose a theme.'
  else if (usedThemes.includes(values.theme))
    errors.theme = 'This theme is already used. Choose another.'

  if (Object.keys(errors).length > 0) return { valid: false, errors }

  return {
    valid: true,
    data: {
      category: values.category as CreateBudgetInput['category'],
      maximum,
      theme: values.theme,
    },
  }
}
