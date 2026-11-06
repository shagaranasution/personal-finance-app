import type { RefObject } from 'react'
import { IconSelected } from '../components/icons'
import { DropdownSelect } from './dropdown-select'
import { themeOptions } from './theme-options'

interface ThemeSelectProps {
  value: string
  usedThemes: readonly string[]
  disabled: boolean
  error?: string
  buttonRef: RefObject<HTMLButtonElement | null>
  onChange: (value: string) => void
}

export function ThemeSelect({
  value,
  usedThemes,
  disabled,
  error,
  buttonRef,
  onChange,
}: ThemeSelectProps) {
  const options = themeOptions.map((theme) => ({
    ...theme,
    disabled: usedThemes.includes(theme.value),
  }))

  return (
    <DropdownSelect
      label="Theme"
      value={value}
      options={options}
      disabled={disabled}
      error={error}
      emptyLabel="No themes available"
      buttonRef={buttonRef}
      renderValue={(theme) => (
        <>
          <span
            aria-hidden="true"
            className="size-4 shrink-0 rounded-full"
            style={{ backgroundColor: theme.value }}
          />
          {theme.label}
        </>
      )}
      renderOption={(theme, selected) => (
        <>
          <span className="flex min-w-0 items-center gap-150">
            <span
              aria-hidden="true"
              className={`size-4 shrink-0 rounded-full ${theme.disabled ? 'opacity-25' : ''}`}
              style={{ backgroundColor: theme.value }}
            />
            {theme.label}
          </span>
          {theme.disabled ? (
            <span className="shrink-0 text-preset-5 text-grey-500">Already used</span>
          ) : selected ? (
            <IconSelected />
          ) : null}
        </>
      )}
      onChange={onChange}
    />
  )
}
