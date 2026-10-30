import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react'

type ButtonVariant = 'primary' | 'secondary' | 'tertiary' | 'destroy'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  leftIcon?: ReactNode
  rightIcon?: ReactNode
}

const baseClasses = [
  'cursor-pointer rounded-100 p-200 text-preset-4-bold',
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-grey-900',
  'disabled:cursor-not-allowed disabled:opacity-50',
].join(' ')

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'text-white bg-grey-900 hover:bg-grey-500',

  secondary:
    'text-grey-900 border border-beige-100 bg-beige-100 hover:bg-white hover:border-beige-500 hover:border',

  tertiary: 'text-grey-500 hover:text-grey-900 text-preset-4',

  destroy: 'text-white bg-red hover:bg-red/80',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      leftIcon,
      rightIcon,
      className = '',
      children,
      type = 'button',
      ...props
    },
    ref,
  ) => {
    return (
      <button
        ref={ref}
        className={[baseClasses, variantClasses[variant], className].join(' ')}
        type={type}
        {...props}
      >
        {leftIcon && <span>{leftIcon}</span>}

        {children}

        {rightIcon && <span>{rightIcon}</span>}
      </button>
    )
  },
)
