import { cn } from '../utils/cn'

interface AlertProps {
  message: string
  tone?: 'error' | 'info'
}

const Alert = ({ message, tone = 'info' }: AlertProps) => {
  const styles =
    tone === 'error'
      ? 'border-red-200 bg-red-50 text-red-700'
      : 'border-blue-200 bg-blue-50 text-blue-700'

  return (
    <div className={cn('rounded-md border px-3 py-2 text-sm', styles)}>
      {message}
    </div>
  )
}

export default Alert
