import { cn } from '../utils/cn'

interface StarRatingProps {
  value: number
  onChange?: (value: number) => void
  readOnly?: boolean
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizeStyles: Record<NonNullable<StarRatingProps['size']>, string> = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-2xl',
}

const StarRating = ({
  value,
  onChange,
  readOnly = false,
  size = 'md',
  className,
}: StarRatingProps) => {
  const roundedValue = Math.round(value)

  return (
    <div className={cn('inline-flex items-center gap-1', className)}>
      {Array.from({ length: 5 }).map((_, index) => {
        const starValue = index + 1
        const isFilled = roundedValue >= starValue
        const starClass = cn(
          sizeStyles[size],
          'leading-none',
          isFilled ? 'text-amber-500' : 'text-gray-300',
          readOnly ? 'cursor-default' : 'cursor-pointer'
        )

        if (readOnly) {
          return (
            <span key={starValue} aria-hidden className={starClass}>
              ★
            </span>
          )
        }

        return (
          <button
            key={starValue}
            type="button"
            className={cn(starClass, 'transition hover:scale-110')}
            onClick={() => onChange?.(starValue)}
            aria-label={`Set rating to ${starValue}`}
          >
            ★
          </button>
        )
      })}
    </div>
  )
}

export default StarRating
