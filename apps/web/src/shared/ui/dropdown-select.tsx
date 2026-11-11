import { useEffect, useId, useRef, useState, type ReactNode, type RefObject } from 'react'
import { createPortal } from 'react-dom'
import { IconCaretDown } from '../components/icons'

export interface DropdownSelectOption {
  value: string
  label: string
  disabled?: boolean
}

interface DropdownSelectProps<Option extends DropdownSelectOption> {
  className?: string
  label: string
  value: string
  options: readonly Option[]
  disabled?: boolean
  error?: string
  emptyLabel?: string
  buttonRef: RefObject<HTMLButtonElement | null>
  buttonClassName?: string
  labelClassName?: string
  labelPosition?: 'above' | 'inline'
  menuPosition?: 'above' | 'below'
  menuClassName?: string
  portalMenu?: boolean
  portalMenuWidth?: number
  portalMenuAlign?: 'start' | 'end'
  showCaret?: boolean
  renderValue?: (option: Option) => ReactNode
  renderOption?: (option: Option, selected: boolean) => ReactNode
  onChange: (value: string) => void
}

/** Shared accessible menu behavior; callers own option policy and presentation. */
export function DropdownSelect<Option extends DropdownSelectOption>({
  label,
  value,
  options,
  disabled = false,
  error,
  emptyLabel = 'No options available',
  buttonRef,
  renderValue,
  renderOption,
  onChange,
  className = '',
  buttonClassName = '',
  labelClassName = '',
  menuClassName = '',
  labelPosition = 'above',
  menuPosition = 'above',
  portalMenu = false,
  portalMenuWidth,
  portalMenuAlign = 'start',
  showCaret = true,
}: DropdownSelectProps<Option>) {
  const id = useId()
  const container = useRef<HTMLDivElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const optionRefs = useRef<(HTMLButtonElement | null)[]>([])
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(0)
  const [portalStyle, setPortalStyle] = useState<{
    left: number
    top: number
    width: number
    maxHeight: number
  }>()
  const selected = options.find((option) => option.value === value)
  const available = options.flatMap((option, index) => (option.disabled ? [] : [index]))

  useEffect(() => {
    if (open) optionRefs.current[active]?.focus()
  }, [open, active])

  useEffect(() => {
    if (!open) return
    const closeOutside = (event: PointerEvent) => {
      const target = event.target as Node
      if (!container.current?.contains(target) && !menuRef.current?.contains(target)) {
        setOpen(false)
      }
    }
    document.addEventListener('pointerdown', closeOutside)
    return () => document.removeEventListener('pointerdown', closeOutside)
  }, [open])

  useEffect(() => {
    if (!open || !portalMenu) return

    const updatePosition = () => {
      const trigger = buttonRef.current
      if (!trigger) return
      const rect = trigger.getBoundingClientRect()
      const viewportPadding = 8
      const gap = 8
      const availableBelow = window.innerHeight - rect.bottom - gap - viewportPadding
      const availableAbove = rect.top - gap - viewportPadding
      const showBelow =
        menuPosition === 'below'
          ? availableBelow >= Math.min(240, availableAbove) || availableBelow >= 160
          : availableBelow >= Math.min(240, availableAbove)
      const maxHeight = Math.max(
        96,
        Math.min(300, Math.floor(showBelow ? availableBelow : availableAbove)),
      )
      setPortalStyle({
        left: Math.max(
          viewportPadding,
          Math.min(
            portalMenuAlign === 'end'
              ? rect.right - Math.max(rect.width, portalMenuWidth ?? rect.width)
              : rect.left,
            window.innerWidth -
              Math.max(rect.width, portalMenuWidth ?? rect.width) -
              viewportPadding,
          ),
        ),
        top: showBelow ? rect.bottom + gap : Math.max(viewportPadding, rect.top - gap - maxHeight),
        width: Math.min(
          Math.max(rect.width, portalMenuWidth ?? rect.width),
          window.innerWidth - viewportPadding * 2,
        ),
        maxHeight,
      })
    }

    updatePosition()
    window.addEventListener('resize', updatePosition)
    window.addEventListener('scroll', updatePosition, true)
    return () => {
      window.removeEventListener('resize', updatePosition)
      window.removeEventListener('scroll', updatePosition, true)
    }
  }, [buttonRef, menuPosition, open, portalMenu, portalMenuAlign, portalMenuWidth])

  function openMenu() {
    const selectedIndex = options.findIndex((option) => option.value === value)
    setActive(available.includes(selectedIndex) ? selectedIndex : (available[0] ?? 0))
    setOpen(true)
  }

  function closeMenu(restoreFocus = true) {
    setOpen(false)
    if (restoreFocus) buttonRef.current?.focus()
  }

  const menu = open && (
    <div
      ref={menuRef}
      id={`${id}-options`}
      role="listbox"
      aria-labelledby={`${id}-label`}
      className={`max-h-[min(300px,45dvh)] overflow-y-auto rounded-100 bg-white px-250 py-150 shadow-[0_4px_24px_0_#00000040] ${menuClassName}`}
      style={
        portalMenu
          ? {
              position: 'fixed',
              zIndex: 1000,
              left: portalStyle?.left ?? -10000,
              top: portalStyle?.top ?? -10000,
              width: portalStyle?.width,
              maxHeight: portalStyle?.maxHeight,
            }
          : undefined
      }
    >
      {options.map((option, index) => {
        const selectedOption = value === option.value
        return (
          <button
            key={option.value}
            ref={(element) => {
              optionRefs.current[index] = element
            }}
            role="option"
            type="button"
            aria-selected={selectedOption}
            disabled={option.disabled}
            tabIndex={-1}
            className="flex w-full items-center justify-between gap-150 border-b border-grey-100 py-150 text-left text-preset-4 first:pt-0 last:border-0 last:pb-0 hover:text-green focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-grey-900 disabled:cursor-not-allowed disabled:text-grey-500"
            onClick={() => {
              onChange(option.value)
              closeMenu()
            }}
            onKeyDown={(event) => {
              const position = available.indexOf(index)
              let next: number | undefined
              if (event.key === 'ArrowDown') next = available[(position + 1) % available.length]
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
            {renderOption?.(option, selectedOption) ?? option.label}
          </button>
        )
      })}
    </div>
  )

  return (
    <div
      ref={container}
      className={`${labelPosition === 'inline' ? 'flex items-center justify-end gap-100' : 'flex flex-col gap-50'} ${className}`}
      onBlur={(event) => {
        const nextTarget = event.relatedTarget as Node | null
        if (!event.currentTarget.contains(nextTarget) && !menuRef.current?.contains(nextTarget)) {
          setOpen(false)
        }
      }}
    >
      <span className={`text-preset-5-bold text-grey-500 ${labelClassName}`} id={`${id}-label`}>
        {label}
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
          className={`flex h-[45px] w-full items-center justify-between gap-200 rounded-100 border px-250 py-150 text-left text-preset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-grey-900 disabled:cursor-not-allowed disabled:border-grey-300 disabled:bg-grey-100 disabled:text-grey-500 ${error ? 'border-red-accessible' : 'border-beige-500 hover:border-grey-900'} ${buttonClassName}`}
          onClick={() => (open ? closeMenu() : openMenu())}
          onKeyDown={(event) => {
            if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
              event.preventDefault()
              openMenu()
            }
          }}
        >
          <span className="flex min-w-0 items-center gap-150" id={`${id}-value`}>
            {selected ? (renderValue?.(selected) ?? selected.label) : emptyLabel}
          </span>
          {showCaret && (
            <span
              className={`flex size-4 shrink-0 items-center justify-center transition-transform ${open ? 'rotate-180' : ''}`}
            >
              <IconCaretDown />
            </span>
          )}
        </button>
        {!portalMenu && open && (
          <div
            className={`absolute inset-x-0 z-20 ${menuPosition === 'below' ? 'top-full mt-100' : 'bottom-full mb-100'}`}
          >
            {menu}
          </div>
        )}
      </div>
      {error && (
        <p className="text-right text-preset-5 text-red-accessible" id={`${id}-error`}>
          {error}
        </p>
      )}
      {portalMenu && menu && createPortal(menu, document.body)}
    </div>
  )
}
