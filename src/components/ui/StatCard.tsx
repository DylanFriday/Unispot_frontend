import type { ReactNode } from 'react'
import Card from '../Card'
import { cn } from '../../utils/cn'

interface StatCardProps {
  title: string
  value: string
  subtext?: string
  tone?: 'primary' | 'success' | 'warning' | 'danger' | 'neutral'
  icon?: ReactNode
  className?: string
}

const toneStyles: Record<NonNullable<StatCardProps['tone']>, string> = {
  primary: 'text-blue-700 bg-blue-50',
  success: 'text-emerald-700 bg-emerald-50',
  warning: 'text-amber-700 bg-amber-50',
  danger: 'text-rose-700 bg-rose-50',
  neutral: 'text-slate-700 bg-slate-100',
}

const StatCard = ({
  title,
  value,
  subtext,
  tone = 'primary',
  icon,
  className,
}: StatCardProps) => {
  return (
    <Card
      className={cn(
        'space-y-3 transition duration-200 hover:-translate-y-0.5 hover:shadow-md',
        className
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          {title}
        </p>
        {icon ? (
          <span
            className={cn(
              'inline-flex h-8 w-8 items-center justify-center rounded-lg',
              toneStyles[tone]
            )}
          >
            {icon}
          </span>
        ) : null}
      </div>
      <p className="text-3xl font-bold tracking-tight text-slate-900">{value}</p>
      {subtext ? <p className="text-sm text-slate-500">{subtext}</p> : null}
    </Card>
  )
}

export default StatCard
