import { forwardRef, type InputHTMLAttributes, type ReactNode, useId } from 'react'

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'prefix'> {
  label?: ReactNode
  helperText?: ReactNode
  error?: ReactNode
  prefix?: ReactNode
  colorTag?: string
  trailingIcon?: ReactNode
  containerClassName?: string
  inputClassName?: string
}

const baseFieldClasses =
  'flex h-[45px] items-center gap-200 rounded-100 border bg-white px-250 py-150'

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      helperText,
      error,
      prefix,
      colorTag,
      trailingIcon,
      containerClassName = '',
      inputClassName = '',
      id,
      disabled,
      ...props
    },
    ref,
  ) => {
    const generatedId = useId()
    const inputId = id ?? generatedId
    const message = error ?? helperText
    const messageId = message ? `${inputId}-message` : undefined
    const fieldClasses = [
      baseFieldClasses,
      disabled
        ? 'cursor-not-allowed border-grey-300 bg-grey-100'
        : error
          ? 'border-red hover:border-red focus-within:border-red'
          : 'border-beige-500 hover:border-grey-500 focus-within:border-grey-900',
      'transition-colors',
    ].join(' ')

    return (
      <div className={['flex w-full flex-col gap-1', containerClassName].join(' ')}>
        {label && (
          <label className="text-preset-5-bold text-grey-500" htmlFor={inputId}>
            {label}
          </label>
        )}

        <div className={fieldClasses}>
          {colorTag && (
            <span
              aria-hidden="true"
              className="size-4 shrink-0 rounded-full"
              style={{ backgroundColor: colorTag }}
            />
          )}

          {prefix && (
            <span aria-hidden="true" className="shrink-0 text-preset-4 text-beige-500">
              {prefix}
            </span>
          )}

          <input
            ref={ref}
            aria-describedby={messageId}
            aria-invalid={error ? true : undefined}
            className={[
              'min-w-0 flex-1 bg-transparent text-preset-4 text-grey-900 outline-none',
              'placeholder:text-beige-500 disabled:cursor-not-allowed disabled:text-grey-500',
              inputClassName,
            ].join(' ')}
            disabled={disabled}
            id={inputId}
            {...props}
          />

          {trailingIcon && (
            <span aria-hidden="true" className="flex size-4 shrink-0 items-center justify-center">
              {trailingIcon}
            </span>
          )}
        </div>

        {message && (
          <p
            className={[
              'text-right text-preset-5',
              error ? 'text-red-accessible' : 'text-grey-500',
            ].join(' ')}
            id={messageId}
          >
            {message}
          </p>
        )}
      </div>
    )
  },
)
