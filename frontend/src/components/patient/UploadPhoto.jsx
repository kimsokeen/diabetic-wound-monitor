import { useState } from 'react'
import { supabase, BACKEND_URL, getSignedImageUrl } from '../../lib/supabaseClient'
import { Button, Card, ErrorText, Spinner } from '../shared/UI'

export default function UploadPhoto({ onNewSubmission }) {
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState(null)

  function handleFileChange(e) {
    const selected = e.target.files[0]
    if (!selected) return
    setFile(selected)
    setPreview(URL.createObjectURL(selected))
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

  return (
    <Card>
      <h2 className="text-lg font-semibold mb-4">Upload a wound photo</h2>

      <input type="file" accept="image/*" onChange={handleFileChange} className="mb-4" />

      {preview && (
        <img src={preview} alt="Preview" className="w-48 h-48 object-cover rounded-lg mb-4 border" />
      )}

      <ErrorText>{error}</ErrorText>

      <Button onClick={handleUpload} disabled={!file || loading}>
        {loading ? 'Analyzing...' : 'Analyze photo'}
      </Button>

      {loading && <Spinner />}

      {result && (
        <div className="mt-6 p-4 bg-slate-50 rounded-lg border">
          <h3 className="font-medium mb-2">Results</h3>
          <p className="text-sm mb-2">
            Wound area: <strong>{result.wound_area_percent}%</strong> of the photo
          </p>

          {result.maskSignedUrl && (
            <img src={result.maskSignedUrl} alt="Segmentation overlay" className="w-48 h-48 object-cover rounded-lg mb-3 border" />
          )}
        </div>
      )}
    </Card>
  )
}