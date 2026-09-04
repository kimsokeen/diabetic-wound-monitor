import { useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { ImagePlus } from 'lucide-react'

export default function Dropzone({ onFileSelected }) {
  const inputRef = useRef(null)
  const [isDragging, setIsDragging] = useState(false)

  function handleFiles(fileList) {
    const file = fileList?.[0]
    if (file) onFileSelected(file)
  }

  return (
    <motion.div
      onClick={() => inputRef.current?.click()}
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={(e) => {
        e.preventDefault()
        setIsDragging(false)
        handleFiles(e.dataTransfer.files)
      }}
      whileHover={{ scale: 1.01 }}
      className={`cursor-pointer rounded-xl border-2 border-dashed text-center py-10 px-4 transition-colors ${
        isDragging ? 'border-brand-500 bg-brand-50' : 'border-line bg-paper/60 hover:bg-brand-50/50'
      }`}
    >
      <div className="w-12 h-12 mx-auto rounded-full bg-brand-100 text-brand-700 flex items-center justify-center mb-3">
        <ImagePlus size={20} />
      </div>
      <p className="text-sm font-medium text-ink">Drop a wound photo here</p>
      <p className="text-xs text-ink/50 mt-1">or click to browse — JPG or PNG</p>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
    </motion.div>
  )
}
