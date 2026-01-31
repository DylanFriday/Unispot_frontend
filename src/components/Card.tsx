import type { HTMLAttributes } from 'react'
import { cn } from '../utils/cn'

const Card = ({ className, ...props }: HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      'rounded-xl border border-gray-200 bg-white p-6 shadow-sm',
      className
    )}
    {...props}
  />
)

export default Card
