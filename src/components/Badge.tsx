import { cn } from '../utils/cn'

interface BadgeProps {
  label: string
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info'
}

const Badge = ({ label, variant = 'default' }: BadgeProps) => {
  const styles: Record<NonNullable<BadgeProps['variant']>, string> = {
    default: 'bg-white/55 text-slate-700 border-white/60',
    success: 'bg-emerald-100/70 text-emerald-800 border-emerald-200/70',
    warning: 'bg-amber-100/70 text-amber-800 border-amber-200/70',
    danger: 'bg-rose-100/70 text-rose-800 border-rose-200/70',
    info: 'bg-indigo-100/75 text-indigo-800 border-indigo-200/75',
  }

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold backdrop-blur-md',
        styles[variant]
      )}
    >
      {label}
    </span>
  )
}

export default Badge
