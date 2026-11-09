import { useEffect, useRef, useState } from 'react'
import { IconEllipsis } from '@/shared/components/icons'
import type { Pot } from '../types'

interface PotActionsProps {
  pot: Pot
  onEdit: (pot: Pot, trigger: HTMLButtonElement) => void
  onDelete: (pot: Pot, trigger: HTMLButtonElement) => void
}

export function PotActions({ pot, onEdit, onDelete }: PotActionsProps) {
  const container = useRef<HTMLDivElement>(null)
  const editButton = useRef<HTMLButtonElement>(null)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (open) editButton.current?.focus()
  }, [open])

  useEffect(() => {
    if (!open) return
    const closeOutside = (event: PointerEvent) => {
      if (!container.current?.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener('pointerdown', closeOutside)
    return () => document.removeEventListener('pointerdown', closeOutside)
  }, [open])

  function choose(action: 'edit' | 'delete') {
    setOpen(false)
    const trigger = container.current?.querySelector('button[aria-haspopup="menu"]')
    if (!(trigger instanceof HTMLButtonElement)) return
    if (action === 'edit') onEdit(pot, trigger)
    else onDelete(pot, trigger)
  }

  return (
    <div
      className="relative shrink-0"
      ref={container}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false)
      }}
      onKeyDown={(event) => {
        if (event.key === 'Escape' && open) {
          event.preventDefault()
          setOpen(false)
          container.current?.querySelector<HTMLButtonElement>('[aria-haspopup="menu"]')?.focus()
        }
      }}
    >
      <button
        type="button"
        aria-label={`Options for ${pot.name}`}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex size-6 cursor-pointer items-center justify-center rounded-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-grey-900"
        onClick={() => setOpen((wasOpen) => !wasOpen)}
      >
        <IconEllipsis width={14} height={4} />
      </button>
      {open && (
        <div
          role="menu"
          aria-label={`${pot.name} pot actions`}
          className="absolute right-0 top-full z-20 mt-100 flex w-[114px] flex-col rounded-100 bg-white p-200 shadow-[0_4px_24px_0_#00000040]"
        >
          <button
            ref={editButton}
            type="button"
            role="menuitem"
            className="border-b border-grey-100 py-100 text-left text-preset-5-bold hover:text-green focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-grey-900"
            onClick={() => choose('edit')}
          >
            Edit Pot
          </button>
          <button
            type="button"
            role="menuitem"
            className="py-100 text-left text-preset-5-bold text-red hover:text-red-accessible focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-grey-900"
            onClick={() => choose('delete')}
          >
            Delete Pot
          </button>
        </div>
      )}
    </div>
  )
}
