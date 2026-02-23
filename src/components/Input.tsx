import type { InputHTMLAttributes } from 'react'
import { cn } from '../utils/cn'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

const Input = ({ label, error, className, ...props }: InputProps) => {
  return (
    <label className="block text-sm text-slate-800">
      {label ? <span className="mb-1 block font-semibold">{label}</span> : null}
      <input
        className={cn(
          'w-full rounded-lg border border-slate-200 bg-slate-50/70 px-3 py-2 text-sm text-slate-900 transition placeholder:text-slate-400 focus:border-blue-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100',
          error ? 'border-red-400 focus:border-red-500 focus:ring-red-200' : '',
          className
        )}
        {...props}
      />
      {error ? <span className="mt-1 block text-xs text-red-700">{error}</span> : null}
    </label>
  )
}

export default Input
