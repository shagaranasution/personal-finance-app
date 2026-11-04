import { MAX_RUPIAH } from '../../shared/lib/money.ts'
import { potThemes } from './pot-themes.ts'
import type { CreatePotInput } from './types'

export interface PotFormValues {
  name: string
  target: string
  theme: string
}

export type PotFormErrors = Partial<Record<keyof PotFormValues, string>>

type ValidationResult =
  { valid: true; data: CreatePotInput } | { valid: false; errors: PotFormErrors }

export function validatePotForm(
  values: PotFormValues,
  usedThemes: readonly string[],
): ValidationResult {
  const errors: PotFormErrors = {}
  const name = values.name.trim()

  if ([...name].length < 1 || [...name].length > 30 || name.includes('\0'))
    errors.name = 'Enter a name between 1 and 30 characters.'

  const target = Number(values.target)

  if (
    !/^\d+$/.test(values.target) ||
    !Number.isInteger(target) ||
    target < 1 ||
    target > MAX_RUPIAH
  ) {
    errors.target = 'Enter whole rupiah from 1 to 2147483647, using digits only.'
  }

  if (!potThemes.some((theme) => theme.value === values.theme)) errors.theme = 'Choose a theme.'
  else if (usedThemes.includes(values.theme))
    errors.theme = 'This theme is already used. Choose another.'

  if (Object.keys(errors).length > 0) return { valid: false, errors }

  return { valid: true, data: { name, target, theme: values.theme } }
}
