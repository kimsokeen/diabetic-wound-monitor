import { useEffect, useState } from 'react'
import { supabase, getSignedImageUrl } from '../../lib/supabaseClient'
import { Card, Spinner } from '../shared/UI'

export default function SubmissionHistory({ patientId, refreshKey }) {
  const [submissions, setSubmissions] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!patientId) return
    loadHistory()
  }, [patientId, refreshKey])

  async function loadHistory() {
    setLoading(true)
    const { data, error } = await supabase
      .from('submissions')
      .select('*')
      .eq('patient_id', patientId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Failed to load history:', error.message)
      setSubmissions([])
      setLoading(false)
      return
    }

    // Attach a temporary signed URL to each photo so <img> can display it.
    const withUrls = await Promise.all(
      data.map(async (submission) => ({
        ...submission,
        imageSignedUrl: await getSignedImageUrl(submission.image_url),
      }))
    )
    setSubmissions(withUrls)
    setLoading(false)
  }

  if (loading) return <Spinner />
  if (submissions.length === 0) return <p className="text-ink/50 text-sm">No submissions yet.</p>

  return (
    <div className="space-y-4">
      {submissions.map((s) => (
        <Card key={s.id} className="flex gap-4">
          {s.imageSignedUrl && (
            <img src={s.imageSignedUrl} alt="Wound" className="w-24 h-24 object-cover rounded-lg border flex-shrink-0" />
          )}
          <div className="flex-1">
            <p className="text-sm text-ink/50">
              {new Date(s.created_at).toLocaleString()}
            </p>
            <p className="font-medium">Wound area: {s.wound_area_percent}%</p>
          </div>
        </Card>
      ))}
    </div>
  )
}