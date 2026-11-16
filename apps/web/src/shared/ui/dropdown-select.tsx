import {
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from 'react'
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
  portalContainerRef?: RefObject<HTMLElement | null>
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
  portalContainerRef,
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
  const [portalRoot, setPortalRoot] = useState<HTMLElement | null>(null)
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

  useLayoutEffect(() => {
    if (!open || !portalMenu) return

    const updatePosition = () => {
      const trigger = buttonRef.current
      if (!trigger) return
      const rect = trigger.getBoundingClientRect()
      const boundary = {
        top: 8,
        right: window.innerWidth - 8,
        bottom: window.innerHeight - 8,
        left: 8,
      }
      const portalBoundary = portalContainerRef?.current ?? null
      let clippingAncestor = portalBoundary ? trigger.parentElement : null
      while (
        clippingAncestor &&
        clippingAncestor !== document.body &&
        clippingAncestor !== document.documentElement
      ) {
        const style = window.getComputedStyle(clippingAncestor)
        const clipsX = ['auto', 'clip', 'hidden', 'scroll'].includes(style.overflowX)
        const clipsY = ['auto', 'clip', 'hidden', 'scroll'].includes(style.overflowY)
        if (clipsX || clipsY) {
          const ancestorRect = clippingAncestor.getBoundingClientRect()
          const left = ancestorRect.left + clippingAncestor.clientLeft + 8
          const top = ancestorRect.top + clippingAncestor.clientTop + 8
          const right = left + clippingAncestor.clientWidth - 16
          const bottom = top + clippingAncestor.clientHeight - 16
          if (clipsX) {
            boundary.left = Math.max(boundary.left, left)
            boundary.right = Math.min(boundary.right, right)
          }
          if (clipsY) {
            boundary.top = Math.max(boundary.top, top)
            boundary.bottom = Math.min(boundary.bottom, bottom)
          }
        }
        if (clippingAncestor === portalBoundary) break
        clippingAncestor = clippingAncestor.parentElement
      }
      const gap = 8
      const availableBelow = Math.max(0, boundary.bottom - rect.bottom - gap)
      const availableAbove = Math.max(0, rect.top - boundary.top - gap)
      const showAbove = availableAbove > availableBelow
      const availableSpace = showAbove ? availableAbove : availableBelow
      const maxHeight = Math.min(300, Math.floor(availableSpace))
      const width = Math.min(
        Math.max(rect.width, portalMenuWidth ?? rect.width),
        Math.max(0, boundary.right - boundary.left),
      )
      const desiredLeft =
        portalMenuAlign === 'end' ? rect.right - width : rect.left
      setPortalStyle({
        left: Math.max(boundary.left, Math.min(desiredLeft, boundary.right - width)),
        top: showAbove ? rect.top - gap - maxHeight : rect.bottom + gap,
        width,
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
  }, [buttonRef, open, portalContainerRef, portalMenu, portalMenuAlign, portalMenuWidth])

  function moveFocusFromTrigger(direction: -1 | 1) {
    const scope = portalContainerRef?.current ?? document.body
    const focusable = Array.from(
      scope.querySelectorAll<HTMLElement>(
        'a[href], button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])',
      ),
    ).filter(
      (element) =>
        element.tabIndex >= 0 &&
        element.getClientRects().length > 0 &&
        window.getComputedStyle(element).visibility !== 'hidden',
    )
    const trigger = buttonRef.current
    const triggerIndex = trigger ? focusable.indexOf(trigger) : -1
    const next = triggerIndex === -1 ? undefined : focusable[triggerIndex + direction]
    if (next) {
      next.focus()
      return
    }
    if (scope instanceof HTMLDialogElement) {
      focusable[direction < 0 ? focusable.length - 1 : 0]?.focus()
    } else {
      buttonRef.current?.focus()
    }
  }

  function openMenu() {
    const selectedIndex = options.findIndex((option) => option.value === value)
    setActive(available.includes(selectedIndex) ? selectedIndex : (available[0] ?? 0))
    setPortalStyle(undefined)
    if (portalMenu) setPortalRoot(portalContainerRef?.current ?? document.body)
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
              if (event.key === 'Tab') {
                event.preventDefault()
                event.stopPropagation()
                setOpen(false)
                moveFocusFromTrigger(event.shiftKey ? -1 : 1)
              }
            }}
            className="flex w-full cursor-pointer items-center justify-between gap-150 border-b border-grey-100 py-150 text-left text-preset-4 first:pt-0 last:border-0 last:pb-0 hover:text-green focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-grey-900 disabled:cursor-not-allowed disabled:text-grey-500"
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
          aria-controls={open ? `${id}-options` : undefined}
          aria-haspopup="listbox"
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-error` : undefined}
          disabled={disabled || available.length === 0}
          className={`flex h-[45px] w-full cursor-pointer items-center justify-between gap-200 rounded-100 border px-250 py-150 text-left text-preset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-grey-900 disabled:cursor-not-allowed disabled:border-grey-300 disabled:bg-grey-100 disabled:text-grey-500 ${error ? 'border-red-accessible' : 'border-beige-500 hover:border-grey-900'} ${buttonClassName}`}
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
      {portalMenu && menu && createPortal(menu, portalRoot ?? document.body)}
    </div>
  )
}
