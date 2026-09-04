import { useState } from 'react'
import { motion } from 'framer-motion'
import { X, RotateCcw } from 'lucide-react'
import { supabase, BACKEND_URL, getSignedImageUrl } from '../../lib/supabaseClient'
import { Button, Card } from '../shared/UI'
import HeroVideoDialog from '../shared/HeroVideoDialog'
import Dropzone from '../shared/Dropzone'
import {
  Attachment,
  AttachmentMedia,
  AttachmentContent,
  AttachmentTitle,
  AttachmentDescription,
  AttachmentActions,
  AttachmentAction,
  formatFileSize,
} from '../shared/Attachment'

// Mayo Clinic's short, credible foot-care video — shown after analysis to
// help patients reduce their risk of the wound worsening.
const CHRONIC_RISK_VIDEO_ID = 'SulNOSMMNLY'

export default function UploadPhoto({ onNewSubmission }) {
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState(null)

  function handleFileSelected(selected) {
    setFile(selected)
    setPreview(URL.createObjectURL(selected))
    setResult(null)
    setError('')
  }

  function reset() {
    setFile(null)
    setPreview(null)
    setResult(null)
    setError('')
  }

  async function handleUpload() {
    if (!file) return
    setLoading(true)
    setError('')

    try {
      // Get the patient's current login token so the backend knows who's uploading.
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error('You are not logged in.')

      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch(`${BACKEND_URL}/analyze`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${session.access_token}` },
        body: formData,
      })

      if (!response.ok) {
        const errBody = await response.json().catch(() => ({}))
        throw new Error(errBody.detail || 'Analysis failed. Please try again.')
      }

      const data = await response.json()
      const maskSignedUrl = await getSignedImageUrl(data.mask_url)
      setResult({ ...data, maskSignedUrl })
      onNewSubmission?.()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Map our app state onto the Attachment component's state prop.
  const attachmentState = error ? 'error' : loading ? 'uploading' : result ? 'done' : 'idle'

  return (
    <Card>
      <h2 className="font-display text-xl text-ink mb-4">Upload a wound photo</h2>

      {!file && <Dropzone onFileSelected={handleFileSelected} />}

      {file && (
        <Attachment state={attachmentState}>
          <AttachmentMedia variant="image">
            <img src={preview} alt="Selected wound photo" className="w-full h-full object-cover" />
          </AttachmentMedia>

          <AttachmentContent>
            <AttachmentTitle>{file.name}</AttachmentTitle>
            <AttachmentDescription tone={error ? 'error' : result ? 'brand' : 'default'}>
              {error
                ? error
                : loading
                ? 'Analyzing...'
                : result
                ? 'Analysis complete'
                : formatFileSize(file.size)}
            </AttachmentDescription>
          </AttachmentContent>

          <AttachmentActions>
            {!loading && (
              <AttachmentAction aria-label="Remove photo" onClick={reset}>
                {result || error ? <RotateCcw size={14} /> : <X size={14} />}
              </AttachmentAction>
            )}
          </AttachmentActions>
        </Attachment>
      )}

      {file && !result && (
        <Button onClick={handleUpload} disabled={loading} className="mt-4">
          {loading ? 'Analyzing...' : 'Analyze photo'}
        </Button>
      )}

      {result && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mt-6 pt-6 border-t border-line"
        >
          <p className="text-xs uppercase tracking-wide text-ink/40 mb-1">Wound area</p>
          <p className="font-display text-4xl text-clay-600 mb-4">{result.wound_area_percent}%</p>

          {result.maskSignedUrl && (
            <img
              src={result.maskSignedUrl}
              alt="Segmentation overlay"
              className="w-48 h-48 object-cover rounded-lg mb-5 border border-line"
            />
          )}

          <HeroVideoDialog
            title="How to reduce chronic risk"
            videoSrc={`https://www.youtube.com/embed/${CHRONIC_RISK_VIDEO_ID}`}
            thumbnailSrc={`https://img.youtube.com/vi/${CHRONIC_RISK_VIDEO_ID}/hqdefault.jpg`}
            thumbnailAlt="Diabetic foot care video thumbnail"
          />
        </motion.div>
      )}
    </Card>
  )
}