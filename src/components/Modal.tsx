import { useEffect } from 'react'
import type { ReactNode } from 'react'
import { cn } from '../utils/cn'

interface ModalProps {
  open: boolean
  title?: string
  children: ReactNode
  onClose: () => void
  footer?: ReactNode
  panelClassName?: string
  contentClassName?: string
  footerClassName?: string
  backdropClassName?: string
}

const Modal = ({
  open,
  title,
  children,
  onClose,
  footer,
  panelClassName,
  contentClassName,
  footerClassName,
  backdropClassName,
}: ModalProps) => {
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
        className={cn(
          'absolute inset-0 h-full w-full bg-slate-900/30 backdrop-blur-[2px]',
          backdropClassName
        )}
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        className={cn(
          'relative z-10 w-[90vw] max-w-lg rounded-2xl border border-white/60 bg-white/70 p-6 shadow-[0_28px_80px_-48px_rgba(15,23,42,0.85)] backdrop-blur-xl',
          panelClassName
        )}
      >
        {title ? (
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
            <button
              type="button"
              onClick={onClose}
              className="rounded-md px-2 py-1 text-sm text-slate-500 transition hover:bg-white/70"
            >
              Close
            </button>
          </div>
        ) : null}
        <div className={cn('text-sm text-slate-700', contentClassName)}>{children}</div>
        {footer ? (
          <div className={cn('mt-6 flex justify-end gap-2', footerClassName)}>{footer}</div>
        ) : null}
      </div>
    </div>
  )
}

export default Modal
