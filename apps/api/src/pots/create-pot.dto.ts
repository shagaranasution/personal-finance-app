import { Transform } from 'class-transformer'
import { IsIn, IsInt, Max, Min, ValidateBy } from 'class-validator'
import { MAX_RUPIAH } from '../money.js'
import { POT_THEMES } from './pot-themes.js'

export class CreatePotDto {
  @Transform(({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value))
  @ValidateBy({
    name: 'potName',
    validator: {
      validate: (value: unknown) =>
        typeof value === 'string' &&
        [...value].length >= 1 &&
        [...value].length <= 30 &&
        !value.includes('\0'),
      defaultMessage: () => 'name must contain 1 to 30 characters',
    },
  })
  name!: string

  // No implicit numeric coercion: fractions and numeric strings are rejected.
  @IsInt({ message: 'target must be a whole-rupiah number' })
  @Min(1, { message: 'target must be at least 1 rupiah' })
  @Max(MAX_RUPIAH, { message: `target must not exceed ${MAX_RUPIAH} rupiah` })
  target!: number

  @IsIn(POT_THEMES, { message: 'theme must be a supported palette value' })
  theme!: string
}
