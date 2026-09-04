import { motion } from 'framer-motion'

/**
 * Adapted from shadcn/ui's Attachment component for plain Tailwind + framer-motion
 * (no Base UI / Radix dependency). Same composition pattern:
 *
 *   <Attachment state="uploading">
 *     <AttachmentMedia variant="image"><img ... /></AttachmentMedia>
 *     <AttachmentContent>
 *       <AttachmentTitle>photo.jpg</AttachmentTitle>
 *       <AttachmentDescription>2.4 MB · Analyzing...</AttachmentDescription>
 *     </AttachmentContent>
 *     <AttachmentActions>
 *       <AttachmentAction aria-label="Remove"><X size={14} /></AttachmentAction>
 *     </AttachmentActions>
 *   </Attachment>
 */

const stateBorder = {
  idle: 'border-line',
  uploading: 'border-brand-200',
  processing: 'border-brand-200',
  error: 'border-clay-500',
  done: 'border-brand-200',
}

export function Attachment({ children, state = 'done', className = '' }) {
  const isBusy = state === 'uploading' || state === 'processing'
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative flex items-center gap-3 bg-white rounded-xl border p-3 overflow-hidden ${stateBorder[state]} ${className}`}
    >
      {children}
      {isBusy && (
        <motion.div
          className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-brand-100 to-transparent"
          animate={{ x: ['-120%', '320%'] }}
          transition={{ repeat: Infinity, duration: 1.3, ease: 'linear' }}
        />
      )}
    </motion.div>
  )
}

export function AttachmentMedia({ children, variant = 'icon' }) {
  const size = variant === 'image' ? 'w-16 h-16' : 'w-10 h-10'
  return (
    <div className={`${size} rounded-lg overflow-hidden shrink-0 bg-brand-50 text-brand-600 flex items-center justify-center relative z-10`}>
      {children}
    </div>
  )
}

export function AttachmentContent({ children }) {
  return <div className="flex-1 min-w-0 relative z-10">{children}</div>
}

export function AttachmentTitle({ children }) {
  return <p className="text-sm font-medium text-ink truncate">{children}</p>
}

export function AttachmentDescription({ children, tone = 'default' }) {
  const toneStyles = {
    default: 'text-ink/50',
    error: 'text-clay-600',
    brand: 'text-brand-600',
  }
  return <p className={`text-xs mt-0.5 ${toneStyles[tone]}`}>{children}</p>
}

export function AttachmentActions({ children }) {
  return <div className="flex items-center gap-1 shrink-0 relative z-10">{children}</div>
}

export function AttachmentAction({ children, className = '', ...props }) {
  return (
    <motion.button
      whileTap={{ scale: 0.9 }}
      type="button"
      className={`w-7 h-7 rounded-full flex items-center justify-center text-ink/40 hover:text-ink hover:bg-paper transition ${className}`}
      {...props}
    >
      {children}
    </motion.button>
  )
}

export function formatFileSize(bytes) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}
