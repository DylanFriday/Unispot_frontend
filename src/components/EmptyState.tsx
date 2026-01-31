import type { ReactNode } from 'react'

interface EmptyStateProps {
  title: string
  description?: string
  action?: ReactNode
}

const EmptyState = ({ title, description, action }: EmptyStateProps) => (
  <div className="rounded-xl border border-dashed border-gray-300 bg-white p-8 text-center">
    <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
    {description ? <p className="mt-2 text-sm text-gray-600">{description}</p> : null}
    {action ? <div className="mt-4 flex justify-center">{action}</div> : null}
  </div>
)

export default EmptyState
