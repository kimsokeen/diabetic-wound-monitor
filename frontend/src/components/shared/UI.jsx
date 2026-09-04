import { motion } from 'framer-motion'

export function Button({ children, variant = 'primary', className = '', disabled, ...props }) {
  const base = 'px-4 py-2 rounded-lg font-medium transition disabled:opacity-50 disabled:cursor-not-allowed'
  const variants = {
    primary: 'bg-brand-600 text-white hover:bg-brand-700',
    secondary: 'bg-white text-ink border border-line hover:bg-brand-50',
    danger: 'bg-clay-600 text-white hover:bg-clay-500',
  }
  return (
    <motion.button
      whileTap={!disabled ? { scale: 0.96 } : undefined}
      whileHover={!disabled ? { scale: 1.02 } : undefined}
      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
      className={`${base} ${variants[variant]} ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </motion.button>
  )
}

export function Input({ label, ...props }) {
  return (
    <label className="block mb-4">
      {label && <span className="block text-sm font-medium text-ink/80 mb-1">{label}</span>}
      <input
        className="w-full px-3 py-2 border border-line rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
        {...props}
      />
    </label>
  )
}

export function Card({ children, className = '' }) {
  return <div className={`bg-white rounded-xl border border-line p-6 ${className}`}>{children}</div>
}

export function ErrorText({ children }) {
  if (!children) return null
  return <p className="text-sm text-clay-600 mb-4">{children}</p>
}

export function Spinner() {
  return (
    <div className="flex justify-center items-center py-8">
      <div className="w-8 h-8 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin" />
    </div>
  )
}