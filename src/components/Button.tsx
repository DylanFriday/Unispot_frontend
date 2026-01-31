import type { ButtonHTMLAttributes } from 'react'
import { cn } from '../utils/cn'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger'
}

const Button = ({
  variant = 'primary',
  className,
  ...props
}: ButtonProps) => {
  const base =
    'inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed'
  const styles: Record<NonNullable<ButtonProps['variant']>, string> = {
    primary: 'bg-ink text-white hover:bg-black focus-visible:ring-black',
    secondary:
      'bg-gray-200 text-gray-900 hover:bg-gray-300 focus-visible:ring-gray-400',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500',
  }

  return (
    <button className={cn(base, styles[variant], className)} {...props} />
  )
}

export default Button
