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
    'inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-semibold transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60'
  const styles: Record<NonNullable<ButtonProps['variant']>, string> = {
    primary:
      'border border-white/55 bg-gradient-to-br from-indigo-500 to-blue-500 text-white shadow-[0_12px_28px_-18px_rgba(79,93,255,0.9)] hover:brightness-105 focus-visible:ring-indigo-500 focus-visible:ring-offset-indigo-50',
    secondary:
      'border border-white/55 bg-white/50 text-slate-900 backdrop-blur-lg hover:bg-white/70 focus-visible:ring-indigo-200 focus-visible:ring-offset-indigo-50',
    danger:
      'border border-indigo-200/70 bg-indigo-100/65 text-indigo-900 backdrop-blur-lg hover:bg-indigo-100/85 focus-visible:ring-indigo-200 focus-visible:ring-offset-indigo-50',
  }

  return (
    <button className={cn(base, styles[variant], className)} {...props} />
  )
}

export default Button
