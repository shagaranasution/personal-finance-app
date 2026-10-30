import { forwardRef, type HTMLAttributes } from 'react'

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  padding?: 'default' | 'compact'
}

const cardClasses = 'w-full overflow-hidden rounded-150 bg-white px-250 py-300'

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className = '', padding = 'default', ...props }, ref) => (
    <div
      ref={ref}
      className={[
        cardClasses,
        padding === 'compact' ? 'tablet:p-300' : 'tablet:p-400',
        className,
      ].join(' ')}
      {...props}
    />
  ),
)
