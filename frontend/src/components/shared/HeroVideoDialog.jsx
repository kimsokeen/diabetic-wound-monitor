import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Play, XIcon } from 'lucide-react'

/**
 * A video thumbnail that expands into a modal player on click, with a
 * spring pop-in animation. Adapted for plain Vite React (no Next.js/shadcn).
 *
 * Props:
 *   videoSrc     - an embeddable URL, e.g. https://www.youtube.com/embed/VIDEO_ID
 *   thumbnailSrc - preview image shown before the video opens
 *   title        - accessible label / caption shown under the thumbnail
 */
export default function HeroVideoDialog({ videoSrc, thumbnailSrc, thumbnailAlt = 'Video thumbnail', title, className = '' }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className={className}>
      {title && <p className="text-sm font-medium text-slate-700 mb-2">{title}</p>}

      <div className="relative cursor-pointer group max-w-xs" onClick={() => setIsOpen(true)}>
        <img
          src={thumbnailSrc}
          alt={thumbnailAlt}
          className="w-full rounded-lg border shadow-sm transition group-hover:brightness-90"
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            whileHover={{ scale: 1.1 }}
            className="bg-brand-600 rounded-full size-12 flex items-center justify-center shadow-lg"
          >
            <Play className="size-5 text-white fill-white ml-0.5" />
          </motion.div>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.85, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-2xl aspect-video"
            >
              <button
                onClick={() => setIsOpen(false)}
                className="absolute -top-10 right-0 text-white bg-white/10 hover:bg-white/20 rounded-full p-2"
                aria-label="Close video"
              >
                <XIcon className="size-5" />
              </button>
              <div className="w-full h-full rounded-xl overflow-hidden border-2 border-white">
                <iframe
                  src={videoSrc}
                  title={title || 'Video'}
                  className="w-full h-full"
                  allowFullScreen
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
