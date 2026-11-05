import { useEffect, useId, useRef, useState, type RefObject } from 'react'
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
  const id = useId()
  const container = useRef<HTMLDivElement>(null)
  const options = useRef<(HTMLButtonElement | null)[]>([])
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(0)
  const selected = themeOptions.find((theme) => theme.value === value)
  const available = themeOptions.flatMap((theme, index) =>
    usedThemes.includes(theme.value) ? [] : [index],
  )

  useEffect(() => {
    if (open) options.current[active]?.focus()
  }, [open, active])

  useEffect(() => {
    if (!open) return
    const closeOutside = (event: PointerEvent) => {
      if (!container.current?.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener('pointerdown', closeOutside)
    return () => document.removeEventListener('pointerdown', closeOutside)
  }, [open])

  function openMenu() {
    const index = themeOptions.findIndex((theme) => theme.value === value)
    setActive(available.includes(index) ? index : (available[0] ?? 0))
    setOpen(true)
  }

  function closeMenu() {
    setOpen(false)
    buttonRef.current?.focus()
  }

  return (
    <div
      ref={container}
      className="flex flex-col gap-50"
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false)
      }}
    >
      <span className="text-preset-5-bold text-grey-500" id={`${id}-label`}>
        Theme
      </span>
      <div className="relative">
        <button
          ref={buttonRef}
          type="button"
          role="combobox"
          aria-labelledby={`${id}-label ${id}-value`}
          aria-expanded={open}
          aria-controls={`${id}-options`}
          aria-haspopup="listbox"
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-error` : undefined}
          disabled={disabled || available.length === 0}
          className={`flex h-[45px] w-full items-center justify-between gap-200 rounded-100 border px-250 py-150 text-left text-preset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-grey-900 disabled:cursor-not-allowed disabled:border-grey-300 disabled:bg-grey-100 disabled:text-grey-500 ${error ? 'border-red-accessible' : 'border-beige-500 hover:border-grey-900'}`}
          onClick={() => (open ? closeMenu() : openMenu())}
          onKeyDown={(event) => {
            if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
              event.preventDefault()
              openMenu()
            }
          }}
        >
          <span className="flex min-w-0 items-center gap-150" id={`${id}-value`}>
            {selected && (
              <span
                aria-hidden="true"
                className="size-4 shrink-0 rounded-full"
                style={{ backgroundColor: selected.value }}
              />
            )}
            {selected?.label ?? 'No themes available'}
          </span>
          <span className="flex size-4 shrink-0 items-center justify-center">
            <img alt="" src="/assets/images/icon-caret-down.svg" width="12" height="6" />
          </span>
        </button>
        {open && (
          <div
            id={`${id}-options`}
            role="listbox"
            aria-labelledby={`${id}-label`}
            className="absolute inset-x-0 bottom-full z-20 mb-100 max-h-[min(300px,45dvh)] overflow-y-auto rounded-100 bg-white px-250 py-150 shadow-[0_4px_24px_0_#00000040]"
          >
            {themeOptions.map((theme, index) => {
              const used = usedThemes.includes(theme.value)
              return (
                <button
                  key={theme.value}
                  ref={(element) => {
                    options.current[index] = element
                  }}
                  role="option"
                  type="button"
                  aria-selected={value === theme.value}
                  disabled={used}
                  tabIndex={-1}
                  className="flex w-full items-center justify-between gap-150 border-b border-grey-100 py-150 text-left text-preset-4 first:pt-0 last:border-0 last:pb-0 hover:text-green focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-grey-900 disabled:cursor-not-allowed disabled:text-grey-500"
                  onClick={() => {
                    onChange(theme.value)
                    closeMenu()
                  }}
                  onKeyDown={(event) => {
                    const position = available.indexOf(index)
                    let next: number | undefined
                    if (event.key === 'ArrowDown')
                      next = available[(position + 1) % available.length]
                    if (event.key === 'ArrowUp')
                      next = available[(position - 1 + available.length) % available.length]
                    if (event.key === 'Home') next = available[0]
                    if (event.key === 'End') next = available.at(-1)
                    if (next !== undefined) {
                      event.preventDefault()
                      setActive(next)
                    }
                    if (event.key === 'Escape') {
                      event.preventDefault()
                      event.stopPropagation()
                      closeMenu()
                    }
                  }}
                >
                  <span className="flex min-w-0 items-center gap-150">
                    <span
                      aria-hidden="true"
                      className={`size-4 shrink-0 rounded-full ${used ? 'opacity-25' : ''}`}
                      style={{ backgroundColor: theme.value }}
                    />
                    {theme.label}
                  </span>
                  {used ? (
                    <span className="shrink-0 text-preset-5 text-grey-500">Already used</span>
                  ) : value === theme.value ? (
                    <img alt="" src="/assets/images/icon-selected.svg" width="14" height="14" />
                  ) : null}
                </button>
              )
            })}
          </div>
        )}
      </div>
      {error && (
        <p className="text-right text-preset-5 text-red-accessible" id={`${id}-error`}>
          {error}
        </p>
      )}
    </div>
  )
}
