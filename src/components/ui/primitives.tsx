import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode, SelectHTMLAttributes } from 'react'
import { cn } from '../../utils/cn'

// ---------- Button ----------
type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'success'
type Size = 'sm' | 'md' | 'lg'

const VARIANTS: Record<Variant, string> = {
  primary: 'bg-electric-500 hover:bg-electric-400 text-white shadow-glow',
  secondary: 'bg-white/5 hover:bg-white/10 text-slate-100 ring-1 ring-inset ring-white/10',
  ghost: 'bg-transparent hover:bg-white/5 text-slate-300',
  danger: 'bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 ring-1 ring-inset ring-rose-400/30',
  success: 'bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 ring-1 ring-inset ring-emerald-400/30',
}
const SIZES: Record<Size, string> = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2 text-sm',
  lg: 'px-5 py-2.5 text-sm',
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  className,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode
  variant?: Variant
  size?: Size
}) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-electric-400/70 disabled:cursor-not-allowed disabled:opacity-50 active:scale-[0.98]',
        VARIANTS[variant],
        SIZES[size],
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  )
}

// ---------- Card ----------
export function Card({
  children,
  className,
  hover = false,
}: {
  children: ReactNode
  className?: string
  hover?: boolean
}) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl shadow-card',
        hover && 'transition-all hover:-translate-y-0.5 hover:border-electric-400/40 hover:shadow-glow',
        className,
      )}
    >
      {children}
    </div>
  )
}

// ---------- Badge ----------
export function Badge({
  children,
  className,
  title,
}: {
  children: ReactNode
  className?: string
  title?: string
}) {
  return (
    <span
      title={title}
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset',
        className,
      )}
    >
      {children}
    </span>
  )
}

// ---------- Input / Select ----------
const FIELD =
  'w-full rounded-lg border border-white/10 bg-base-950/60 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-electric-400/60 focus:outline-none focus:ring-2 focus:ring-electric-400/30'

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={cn(FIELD, props.className)} />
}

export function Select(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={cn(FIELD, 'cursor-pointer', props.className)} />
}

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-slate-400">{label}</span>
      {children}
    </label>
  )
}

// ---------- Spinner ----------
export function Spinner({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        'inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-electric-400',
        className,
      )}
    />
  )
}

// ---------- ProgressBar ----------
export function ProgressBar({ value, color = '#3EA6FF' }: { value: number; color?: string }) {
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
      <div
        className="h-full rounded-full transition-all"
        style={{ width: `${Math.max(0, Math.min(100, value))}%`, backgroundColor: color }}
      />
    </div>
  )
}

// ---------- EmptyState ----------
export function EmptyState({
  icon = '🔍',
  title,
  subtitle,
  action,
}: {
  icon?: string
  title: string
  subtitle?: string
  action?: ReactNode
}) {
  return (
    <div className="rounded-2xl border border-dashed border-white/15 bg-white/[0.02] p-10 text-center">
      <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-full bg-white/5 text-2xl">
        {icon}
      </div>
      <p className="font-semibold text-slate-200">{title}</p>
      {subtitle && <p className="mt-1 text-sm text-slate-400">{subtitle}</p>}
      {action && <div className="mt-4 flex justify-center">{action}</div>}
    </div>
  )
}
