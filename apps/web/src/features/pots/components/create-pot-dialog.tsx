import { useEffect, useId, useRef, useState, type FormEvent, type RefObject } from 'react'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { ThemeSelect } from '@/shared/ui/theme-select'
import { themeOptions } from '@/shared/ui/theme-options'
import { createPot } from '../pots-api'
import { validatePotForm, type PotFormErrors } from '../create-pot-validation'
import type { Pot } from '../types'
import { IconCloseModal } from '@/shared/components/icons'

interface Props {
  usedThemes: readonly string[]
  returnFocusRef: RefObject<HTMLButtonElement | null>
  onClose: () => void
  onCreated: (pot: Pot) => void
}

export function CreatePotDialog({ usedThemes, returnFocusRef, onClose, onCreated }: Props) {
  const id = useId()
  const dialog = useRef<HTMLDialogElement>(null)
  const nameInput = useRef<HTMLInputElement>(null)
  const targetInput = useRef<HTMLInputElement>(null)
  const themeButton = useRef<HTMLButtonElement>(null)
  const statusMessage = useRef<HTMLParagraphElement>(null)
  const submitButton = useRef<HTMLButtonElement>(null)
  const request = useRef<AbortController | null>(null)
  const submitting = useRef(false)
  const [name, setName] = useState('')
  const [target, setTarget] = useState('')
  const [theme, setTheme] = useState<string>(
    () => themeOptions.find((entry) => !usedThemes.includes(entry.value))?.value ?? '',
  )
  const [errors, setErrors] = useState<PotFormErrors>({})
  const [serverError, setServerError] = useState('')
  const [pending, setPending] = useState(false)
  const exhausted = themeOptions.every((entry) => usedThemes.includes(entry.value))
  const remaining = 30 - [...name.trim()].length

  useEffect(() => {
    const element = dialog.current!
    const trigger = returnFocusRef.current
    const previousOverflow = document.body.style.overflow
    element.showModal()
    nameInput.current?.focus()
    document.body.style.overflow = 'hidden'
    return () => {
      request.current?.abort()
      element.close()
      document.body.style.overflow = previousOverflow
      trigger?.focus()
    }
  }, [returnFocusRef])

  useEffect(() => {
    if (pending) statusMessage.current?.focus()
    else if (serverError) submitButton.current?.focus()
  }, [pending, serverError])

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (submitting.current || exhausted) return
    const result = validatePotForm({ name, target, theme }, usedThemes)
    setServerError('')
    if (!result.valid) {
      setErrors(result.errors)
      if (result.errors.name) nameInput.current?.focus()
      else if (result.errors.target) targetInput.current?.focus()
      else themeButton.current?.focus()
      return
    }
    submitting.current = true // Immediate guard, before React renders disabled controls.
    setPending(true)
    setErrors({})
    const controller = new AbortController()
    request.current = controller
    try {
      const saved = await createPot(result.data, controller.signal)
      if (!controller.signal.aborted) onCreated(saved)
    } catch (error) {
      if (!controller.signal.aborted) {
        setServerError(
          error instanceof Error && error.name === 'PotCreationError'
            ? error.message
            : 'We couldn’t confirm the save. Your entries are kept. Close and refresh the list before retrying to check whether your pot was saved.',
        )
      }
    } finally {
      submitting.current = false
      if (!controller.signal.aborted) setPending(false)
      request.current = null
    }
  }

  return (
    <dialog
      ref={dialog}
      aria-labelledby={`${id}-title`}
      aria-describedby={`${id}-description`}
      className="fixed inset-0 m-auto max-h-[calc(100dvh_-_3rem)] w-[calc(100%_-_2.5rem)] max-w-[560px] overflow-y-auto rounded-150 border-0 bg-white p-0 text-grey-900 backdrop:bg-black/50"
      onKeyDown={(event) => {
        if (event.key !== 'Tab') return
        const controls = [
          ...event.currentTarget.querySelectorAll<HTMLElement>(
            'button:not(:disabled):not([tabindex="-1"]), input:not(:disabled)',
          ),
        ]
        const first = controls[0]
        const last = controls.at(-1)
        if (!first) {
          event.preventDefault()
          return
        }
        // Explicit boundaries also cover browsers that otherwise tab to the document.
        if (
          event.target === statusMessage.current ||
          (event.shiftKey && document.activeElement === first)
        ) {
          event.preventDefault()
          if (event.shiftKey) last?.focus()
          else first.focus()
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault()
          first.focus()
        }
      }}
      onCancel={(event) => {
        event.preventDefault()
        if (!submitting.current) onClose()
      }}
    >
      <form
        noValidate
        onSubmit={submit}
        className="flex flex-col gap-250 px-250 py-300 tablet:p-400"
      >
        <header className="flex items-center justify-between gap-200">
          <h2 id={`${id}-title`} className="text-preset-2 tablet:text-preset-1">
            Add New Pot
          </h2>
          <button
            type="button"
            disabled={pending}
            onClick={onClose}
            aria-label="Close Add New Pot"
            className="flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-grey-900 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <IconCloseModal width="26" height="26" />
          </button>
        </header>
        <p className="text-preset-4 text-grey-500" id={`${id}-description`}>
          Create a pot to set savings targets. These can help keep you on track as you save for
          special purchases.
        </p>
        {exhausted && (
          <p role="alert" className="text-preset-4 text-grey-500">
            All 15 themes are already in use. A theme needs to become available before you can add
            another pot.
          </p>
        )}
        <div className="flex flex-col gap-200">
          <Input
            ref={nameInput}
            label="Pot Name"
            placeholder="e.g. Rainy Days"
            autoComplete="off"
            required
            value={name}
            disabled={pending || exhausted}
            error={errors.name}
            helperText={
              remaining >= 0
                ? `${remaining} characters left`
                : `${-remaining} characters over the limit`
            }
            onChange={(event) => {
              setName(event.target.value)
              setErrors((previous) => ({ ...previous, name: undefined }))
              setServerError('')
            }}
          />
          <Input
            ref={targetInput}
            label={
              <>
                Target<span className="sr-only"> in rupiah</span>
              </>
            }
            prefix="Rp"
            placeholder="e.g. 2000000"
            inputMode="numeric"
            autoComplete="off"
            required
            value={target}
            disabled={pending || exhausted}
            error={errors.target}
            onChange={(event) => {
              setTarget(event.target.value)
              setErrors((previous) => ({ ...previous, target: undefined }))
              setServerError('')
            }}
          />
          <ThemeSelect
            buttonRef={themeButton}
            value={theme}
            usedThemes={usedThemes}
            disabled={pending || exhausted}
            error={errors.theme}
            onChange={(value) => {
              setTheme(value)
              setErrors((previous) => ({ ...previous, theme: undefined }))
              setServerError('')
            }}
          />
        </div>
        {Object.values(errors).some(Boolean) && (
          <p role="alert" className="sr-only">
            Check the highlighted fields before adding your pot.
          </p>
        )}
        {serverError && (
          <p role="alert" className="text-preset-4 text-red-accessible">
            {serverError}
          </p>
        )}
        <Button
          ref={submitButton}
          type="submit"
          disabled={pending || exhausted}
          aria-busy={pending}
          className="w-full"
        >
          {pending ? 'Adding pot…' : 'Add Pot'}
        </Button>
        <p ref={statusMessage} role="status" tabIndex={-1} className="sr-only">
          {pending ? 'Saving your pot. Please wait.' : ''}
        </p>
      </form>
    </dialog>
  )
}
