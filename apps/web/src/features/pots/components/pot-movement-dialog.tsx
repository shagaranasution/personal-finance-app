import { useEffect, useId, useRef, useState, type FormEvent, type RefObject } from 'react'
import { IconCloseModal } from '@/shared/components/icons'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { formatRupiah } from '@/shared/lib/money'
import { getPotProgress } from '../pot-progress'
import { type PotMovementDirection, type PotMovementResult } from '../pot-fixture-adapter'
import { validatePotMovement } from '../pot-movement-validation'
import type { Pot } from '../types'

interface PotMovementDialogProps {
  pot: Pot
  currentBalance: number
  direction: PotMovementDirection
  returnFocusRef: RefObject<HTMLButtonElement | null>
  onClose: () => void
  onConfirm: (amount: number) => PotMovementResult
}

export function PotMovementDialog({
  pot,
  currentBalance,
  direction,
  returnFocusRef,
  onClose,
  onConfirm,
}: PotMovementDialogProps) {
  const id = useId()
  const dialog = useRef<HTMLDialogElement>(null)
  const amountInput = useRef<HTMLInputElement>(null)
  const submitting = useRef(false)
  const [amount, setAmount] = useState('')
  const [attempted, setAttempted] = useState(false)
  const [operationError, setOperationError] = useState('')
  const validation = validatePotMovement(amount, direction, currentBalance, pot.total)
  const previewAmount = validation.valid ? validation.amount : 0
  const newTotal = direction === 'add' ? pot.total + previewAmount : pot.total - previewAmount
  const progress = getPotProgress(newTotal, pot.target)
  const isAdding = direction === 'add'
  const title = isAdding ? `Add to ‘${pot.name}’` : `Withdraw from ‘${pot.name}’`
  const validationError = attempted && !validation.valid ? validation.error : undefined
  const error = operationError || validationError
  const unchangedTotal = isAdding ? pot.total : newTotal
  const unchangedFill = Math.min((unchangedTotal / pot.target) * 100, 100)
  const movementFill = Math.min((previewAmount / pot.target) * 100, 100 - unchangedFill)

  useEffect(() => {
    const element = dialog.current!
    const trigger = returnFocusRef.current
    const previousOverflow = document.body.style.overflow
    element.showModal()
    amountInput.current?.focus()
    document.body.style.overflow = 'hidden'
    return () => {
      element.close()
      document.body.style.overflow = previousOverflow
      trigger?.focus()
    }
  }, [returnFocusRef])

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (submitting.current) return
    setAttempted(true)
    if (!validation.valid) {
      setOperationError('')
      amountInput.current?.focus()
      return
    }

    const result = onConfirm(validation.amount)
    if (!result.changed) {
      setOperationError(result.error ?? 'This movement could not be applied. Try again.')
      amountInput.current?.focus()
      return
    }
    submitting.current = true
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
            'button:not(:disabled), input:not(:disabled)',
          ),
        ]
        const first = controls[0]
        const last = controls.at(-1)
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
        if (!submitting.current) onClose()
      }}
    >
      <form
        noValidate
        onSubmit={submit}
        className="flex flex-col gap-300 px-250 py-300 tablet:p-400"
      >
        <header className="flex items-center justify-between gap-200">
          <h2 id={`${id}-title`} className="text-preset-2 tablet:text-preset-1">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label={`Close ${title}`}
            className="flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-grey-900"
          >
            <IconCloseModal width="26" height="26" />
          </button>
        </header>

        <p id={`${id}-description`} className="text-preset-4 text-grey-500">
          {isAdding
            ? 'Add money to your pot to keep it separate from your main balance. As soon as you add this money, it will be deducted from your current balance.'
            : 'Withdraw from your pot to put money back in your main balance. This will reduce the amount you have in this pot.'}
        </p>

        <section aria-label="Movement preview" className="flex flex-col gap-200">
          <div className="flex items-center justify-between gap-200">
            <h3 className="text-preset-4 text-grey-500">New Amount</h3>
            <span className="text-right text-preset-1">{formatRupiah(newTotal)}</span>
          </div>
          <div
            role="progressbar"
            aria-label={`${pot.name} projected progress`}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={progress.fill}
            aria-valuetext={`${progress.label} of target; ${formatRupiah(newTotal)} saved of ${formatRupiah(pot.target)}`}
            className="flex h-2 overflow-hidden rounded-50 bg-beige-100"
          >
            <div
              className="h-full shrink-0 rounded-l-50 bg-grey-900 transition-[width]"
              style={{ width: `${unchangedFill}%` }}
            />
            {movementFill > 0 && (
              <div
                className={`h-full shrink-0 transition-[width] ${isAdding ? 'rounded-r-50' : ''}`}
                style={{
                  width: `${movementFill}%`,
                  backgroundColor: isAdding ? pot.theme : 'var(--color-red)',
                }}
              />
            )}
          </div>
          <div className="flex items-start justify-between gap-100 text-preset-5 text-grey-500">
            <span
              className={`text-preset-5-bold ${isAdding ? '' : 'text-red'}`}
              style={isAdding ? { color: pot.theme } : undefined}
            >
              {progress.label}
            </span>
            <span className="text-right">Target of {formatRupiah(pot.target)}</span>
          </div>
        </section>

        <Input
          ref={amountInput}
          label={isAdding ? 'Amount to Add' : 'Amount to Withdraw'}
          prefix="Rp"
          inputMode="numeric"
          autoComplete="off"
          required
          value={amount}
          error={error}
          onChange={(event) => {
            setAmount(event.target.value)
            setAttempted(false)
            setOperationError('')
          }}
        />

        <Button type="submit" className="w-full">
          {isAdding ? 'Confirm Addition' : 'Confirm Withdrawal'}
        </Button>
      </form>
    </dialog>
  )
}
