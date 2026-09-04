import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowDown } from 'lucide-react'

const BACKGROUND_VIDEO = 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260423_084718_72a17915-4964-4059-afcd-22d59399b72e.mp4'

export default function LandingIntro({ name, onComplete }) {
  const [leaving, setLeaving] = useState(false)

  function startMonitoring() {
    setLeaving(true)
  }

  return (
    <AnimatePresence onExitComplete={onComplete}>
      {!leaving && (
        <motion.main
          className="fixed inset-0 z-50 overflow-hidden bg-ink text-white"
          initial={{ y: 0 }}
          exit={{ y: '-100%' }}
          transition={{ duration: 0.85, ease: [0.76, 0, 0.24, 1] }}
          aria-label="Welcome to Diabetic Wound Monitor"
        >
          <video
            className="absolute inset-0 h-full w-full object-cover"
            src={BACKGROUND_VIDEO}
            autoPlay
            loop
            muted
            playsInline
            aria-hidden="true"
          />
          <div className="absolute inset-0 bg-ink/60" />
          <div className="absolute inset-0 bg-gradient-to-b from-ink/20 via-transparent to-ink/80" />

          <div className="relative flex min-h-full flex-col items-center justify-center px-6 text-center">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.7 }}
              className="max-w-2xl"
            >
              <p className="mb-5 text-xs font-semibold uppercase tracking-[0.3em] text-white/70">
                Diabetic Wound Monitor
              </p>
              <h1 className="font-display text-5xl leading-[0.95] sm:text-7xl">
                Hello, {name || 'there'}.
              </h1>
              <p className="mx-auto mt-6 max-w-lg text-base leading-7 text-white/80 sm:text-lg">
                Get your wound monitored every day at home.
              </p>
              <p className="mx-auto mt-6 max-w-lg text-xs leading-5 text-white/65 sm:text-sm sm:leading-6">
                This project is made by Warat Mekasuwandumrong, Keen and Nawat Suangburanakul, Holmes. This project is an idea for a hackathon only. For medical use, please consult your doctor for any medical advice.
              </p>
              <button
                type="button"
                onClick={startMonitoring}
                className="mt-9 inline-flex items-center gap-3 rounded-full bg-white px-7 py-3.5 text-sm font-semibold text-ink transition-transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-ink"
              >
                Get started
                <ArrowDown size={17} strokeWidth={2.5} aria-hidden="true" />
              </button>
            </motion.div>

            <motion.div
              className="absolute bottom-7 flex flex-col items-center gap-2 text-white/60"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1, duration: 0.6 }}
            >
              <span className="text-[10px] uppercase tracking-[0.25em]">Your care, in view</span>
              <ArrowDown size={16} aria-hidden="true" />
            </motion.div>
          </div>
        </motion.main>
      )}
    </AnimatePresence>
  )
}