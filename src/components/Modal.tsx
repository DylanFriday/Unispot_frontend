import { useEffect } from 'react'
import type { ReactNode } from 'react'
import { cn } from '../utils/cn'

interface ModalProps {
  open: boolean
  title?: string
  children: ReactNode
  onClose: () => void
  footer?: ReactNode
}

const Modal = ({ open, title, children, onClose, footer }: ModalProps) => {
  useEffect(() => {
    if (!open) return

    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', handleKey)
    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', handleKey)
      document.body.style.overflow = originalOverflow
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <button
        type="button"
        aria-label="Close modal"
        className="absolute inset-0 h-full w-full bg-black/40"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        className={cn(
          'relative z-10 w-[90vw] max-w-lg rounded-xl border border-gray-200 bg-white p-6 shadow-xl'
        )}
      >
        {title ? (
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
            <button
              type="button"
              onClick={onClose}
              className="rounded-md px-2 py-1 text-sm text-gray-500 hover:bg-gray-100"
            >
              Close
            </button>
          </div>
        ) : null}
        <div className="text-sm text-gray-700">{children}</div>
        {footer ? <div className="mt-6 flex justify-end gap-2">{footer}</div> : null}
      </div>
    </div>
  )
}

export default Modal
