import { forwardRef, type HTMLAttributes } from 'react'

export type CardProps = HTMLAttributes<HTMLDivElement>

const cardClasses = 'w-full overflow-hidden rounded-150 bg-white px-250 py-300 tablet:p-400'

export const Card = forwardRef<HTMLDivElement, CardProps>(({ className = '', ...props }, ref) => (
  <div ref={ref} className={[cardClasses, className].join(' ')} {...props} />
))
