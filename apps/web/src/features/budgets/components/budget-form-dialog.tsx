import { useEffect, useId, useRef, useState, type FormEvent, type RefObject } from 'react'
import { transactionCategories } from '@/features/transactions/transaction-query'
import { Button } from '@/shared/ui/button'
import { IconCloseModal } from '@/shared/components/icons'
import { DropdownSelect } from '@/shared/ui/dropdown-select'
import { Input } from '@/shared/ui/input'
import { ThemeSelect } from '@/shared/ui/theme-select'
import { themeOptions } from '@/shared/ui/theme-options'
import {
  validateBudgetForm,
  type BudgetFormErrors,
  type CreateBudgetInput,
} from '../create-budget-validation'
import type { Budget } from '../types'

interface Props {
  usedCategories: readonly string[]
  usedThemes: readonly string[]
  budget?: Budget
  returnFocusRef: RefObject<HTMLButtonElement | null>
  onClose: () => void
  onSaved: (budget: CreateBudgetInput) => void
}

export function BudgetFormDialog({
  usedCategories,
  usedThemes,
  budget,
  returnFocusRef,
  onClose,
  onSaved,
}: Props) {
  const id = useId()
  const dialog = useRef<HTMLDialogElement>(null)
  const closeButton = useRef<HTMLButtonElement>(null)
  const categoryButton = useRef<HTMLButtonElement>(null)
  const maximumInput = useRef<HTMLInputElement>(null)
  const themeButton = useRef<HTMLButtonElement>(null)
  const submitting = useRef(false)
  const [category, setCategory] = useState(
    () =>
      budget?.category ??
      transactionCategories.find((option) => !usedCategories.includes(option)) ??
      '',
  )
  const [maximum, setMaximum] = useState(() => (budget ? String(budget.maximum) : ''))
  const [theme, setTheme] = useState(
    () =>
      budget?.theme ??
      themeOptions.find((option) => !usedThemes.includes(option.value))?.value ??
      '',
  )
  const [errors, setErrors] = useState<BudgetFormErrors>({})
  const noCategoriesAvailable = transactionCategories.every((option) =>
    usedCategories.includes(option),
  )
  const noThemesAvailable = themeOptions.every((option) => usedThemes.includes(option.value))
  const initiallyUnavailable = useRef(noCategoriesAvailable || noThemesAvailable)

  useEffect(() => {
    const element = dialog.current!
    const trigger = returnFocusRef.current
    const previousOverflow = document.body.style.overflow
    element.showModal()
    if (initiallyUnavailable.current) closeButton.current?.focus()
    else categoryButton.current?.focus()
    document.body.style.overflow = 'hidden'
    return () => {
      element.close()
      document.body.style.overflow = previousOverflow
      trigger?.focus()
    }
  }, [returnFocusRef])

  function updateCategory(value: string) {
    setCategory(value)
    setErrors((previous) => ({ ...previous, category: undefined }))
  }

  function updateMaximum(value: string) {
    setMaximum(value)
    setErrors((previous) => ({ ...previous, maximum: undefined }))
  }

  function updateTheme(value: string) {
    setTheme(value)
    setErrors((previous) => ({ ...previous, theme: undefined }))
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (submitting.current || noCategoriesAvailable || noThemesAvailable) return

    const result = validateBudgetForm({ category, maximum, theme }, usedCategories, usedThemes)
    if (!result.valid) {
      setErrors(result.errors)
      if (result.errors.category) categoryButton.current?.focus()
      else if (result.errors.maximum) maximumInput.current?.focus()
      else themeButton.current?.focus()
      return
    }

    submitting.current = true
    onSaved(result.data)
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
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault()
          last?.focus()
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
            {budget ? 'Edit Budget' : 'Add New Budget'}
          </h2>
          <button
            ref={closeButton}
            type="button"
            onClick={onClose}
            aria-label={`Close ${budget ? 'Edit Budget' : 'Add New Budget'}`}
            className="flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-grey-900"
          >
            <IconCloseModal width="26" height="26" />
          </button>
        </header>

        <p className="text-preset-4 text-grey-500" id={`${id}-description`}>
          {budget
            ? 'As your budgets change, feel free to update your spending limits.'
            : 'Choose a category to set a spending budget. These categories can help you monitor spending.'}
        </p>

        {noCategoriesAvailable && (
          <p role="alert" className="text-preset-4 text-grey-500">
            All budget categories are already in use. A category must become available before you
            can create another budget.
          </p>
        )}
        {noThemesAvailable && !noCategoriesAvailable && (
          <p role="alert" className="text-preset-4 text-grey-500">
            All themes are already in use. A theme must become available before you can create
            another budget.
          </p>
        )}

        <div className="flex flex-col gap-200">
          <DropdownSelect
            label="Budget Category"
            value={category}
            options={transactionCategories.map((option) => ({
              value: option,
              label: option,
              disabled: usedCategories.includes(option),
            }))}
            disabled={noCategoriesAvailable || noThemesAvailable}
            error={errors.category}
            buttonRef={categoryButton}
            onChange={updateCategory}
          />

          <Input
            ref={maximumInput}
            label={
              <>
                Maximum Spend<span className="sr-only"> in rupiah</span>
              </>
            }
            prefix="Rp"
            placeholder="e.g. 50000"
            inputMode="numeric"
            autoComplete="off"
            required
            value={maximum}
            disabled={noCategoriesAvailable || noThemesAvailable}
            error={errors.maximum}
            onChange={(event) => updateMaximum(event.target.value)}
          />

          <ThemeSelect
            buttonRef={themeButton}
            value={theme}
            usedThemes={usedThemes}
            disabled={noCategoriesAvailable || noThemesAvailable}
            error={errors.theme}
            onChange={updateTheme}
          />
        </div>

        {Object.values(errors).some(Boolean) && (
          <p role="alert" className="sr-only">
            Check the highlighted fields before adding your budget.
          </p>
        )}

        <Button
          type="submit"
          disabled={noCategoriesAvailable || noThemesAvailable}
          className="w-full"
        >
          {budget ? 'Save Changes' : 'Add Budget'}
        </Button>
      </form>
    </dialog>
  )
}
