import { useEffect, useId, useRef, type RefObject } from 'react'
import { IconCloseModal } from '@/shared/components/icons'
import { Button } from '@/shared/ui/button'
import { formatRupiah } from '@/shared/lib/money'
import type { Pot } from '../types'

interface DeletePotDialogProps {
  pot: Pot
  returnFocusRef: RefObject<HTMLElement | null>
  error?: string
  onClose: () => void
  onConfirm: () => void
}

export function DeletePotDialog({
  pot,
  returnFocusRef,
  error,
  onClose,
  onConfirm,
}: DeletePotDialogProps) {
  const id = useId()
  const dialog = useRef<HTMLDialogElement>(null)
  const cancelButton = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const element = dialog.current!
    const previousOverflow = document.body.style.overflow
    element.showModal()
    cancelButton.current?.focus()
    document.body.style.overflow = 'hidden'
    return () => {
      element.close()
      document.body.style.overflow = previousOverflow
      returnFocusRef.current?.focus()
    }
  }, [returnFocusRef])

  return (
    <dialog
      ref={dialog}
      aria-labelledby={`${id}-title`}
      aria-describedby={`${id}-description`}
      className="fixed inset-0 m-auto max-h-[calc(100dvh_-_3rem)] w-[calc(100%_-_2.5rem)] max-w-[560px] overflow-y-auto rounded-150 border-0 bg-white p-0 text-grey-900 backdrop:bg-black/50"
      onKeyDown={(event) => {
        if (event.key !== 'Tab') return
        const buttons = [
          ...event.currentTarget.querySelectorAll<HTMLButtonElement>('button:not(:disabled)'),
        ]
        const first = buttons[0]
        const last = buttons.at(-1)
        if (!first || !last) {
          event.preventDefault()
          return
        }
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault()
          last.focus()
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault()
          first.focus()
        }
      }}
      onCancel={(event) => {
        event.preventDefault()
        onClose()
      }}
    >
      <div className="flex flex-col gap-250 p-250 tablet:p-400">
        <header className="flex items-center justify-between gap-200">
          <h2 className="text-preset-2 tablet:text-preset-1" id={`${id}-title`}>
            Delete ‘{pot.name}’?
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close delete pot confirmation"
            className="flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-grey-900"
          >
            <IconCloseModal width="26" height="26" />
          </button>
        </header>
        <p className="text-preset-4 text-grey-500" id={`${id}-description`}>
          This local UI preview will remove the pot and return {formatRupiah(pot.total)} to its
          preview balance. The change is not saved and will reset when you reload the saved pots.
        </p>
        {error && (
          <p role="alert" className="text-preset-5 text-red-accessible">
            {error}
          </p>
        )}
        <Button variant="destroy" className="w-full" onClick={onConfirm}>
          Yes, Confirm Deletion
        </Button>
        <Button ref={cancelButton} variant="tertiary" className="w-full" onClick={onClose}>
          <span className="tablet:hidden">No, I want to go back</span>
          <span className="hidden tablet:inline">No, Go Back</span>
        </Button>
      </div>
    </dialog>
  )
}
