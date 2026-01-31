import type { InputHTMLAttributes } from 'react'
import { cn } from '../utils/cn'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

const Input = ({ label, error, className, ...props }: InputProps) => {
  return (
    <label className="block text-sm">
      {label ? <span className="mb-1 block font-medium">{label}</span> : null}
      <input
        className={cn(
          'w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-ink focus:outline-none focus:ring-2 focus:ring-ink/20',
          error ? 'border-red-300 focus:border-red-500 focus:ring-red-200' : '',
          className
        )}
        {...props}
      />
      {error ? <span className="mt-1 block text-xs text-red-600">{error}</span> : null}
    </label>
  )
}

export default Input
