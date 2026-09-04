import { motion } from 'framer-motion'

/**
 * A row of tab buttons with a highlight pill that smoothly slides between
 * them on click, powered by framer-motion's shared layout animation.
 *
 * Usage:
 *   <AnimatedTabs tabs={['Upload', 'History']} activeTab={tab} onChange={setTab} />
 */
export default function AnimatedTabs({ tabs, activeTab, onChange, layoutId = 'active-tab-pill' }) {
  return (
    <div className="flex gap-2 mb-6">
      {tabs.map((tab) => {
        const isActive = activeTab === tab
        return (
          <motion.button
            key={tab}
            onClick={() => onChange(tab)}
            whileTap={{ scale: 0.96 }}
            className={`relative px-4 py-2 rounded-lg text-sm font-medium ${
              isActive ? 'text-white' : 'bg-white border border-line text-ink/60'
            }`}
          >
            {isActive && (
              <motion.div
                layoutId={layoutId}
                className="absolute inset-0 bg-brand-600 rounded-lg -z-10"
                transition={{ type: 'spring', stiffness: 500, damping: 35 }}
              />
            )}
            {tab}
          </motion.button>
        )
      })}
    </div>
  )
}