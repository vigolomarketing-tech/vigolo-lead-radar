import type { ReactNode } from 'react'

interface BadgeProps {
  children: ReactNode
  className?: string
  title?: string
}

/** Chip con anillo (ring) usado para estados, oportunidad y presencia. */
export function Badge({ children, className = '', title }: BadgeProps) {
  return (
    <span
      title={title}
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${className}`}
    >
      {children}
    </span>
  )
}
