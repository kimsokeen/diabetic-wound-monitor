import { useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { Button, Input, Card, ErrorText } from '../shared/UI'

export default function PatientSearch({ onLinked }) {
  const [patientId, setPatientId] = useState('')
  const [passkey, setPasskey] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSearch(e) {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    // This calls a Postgres function that checks the passkey server-side —
    // the frontend never gets to read patient data it isn't authorized for.
    const { data, error } = await supabase.rpc('link_patient_by_passkey', {
      patient_id_input: patientId.trim(),
      passkey_input: passkey.trim(),
    })

    if (error) {
      setError('No patient found with that ID and passkey. Please double check and try again.')
    } else {
      setSuccess(`Linked to ${data} successfully.`)
      setPatientId('')
      setPasskey('')
      onLinked?.()
    }
    setLoading(false)
  }

  return (
    <Card>
      <h2 className="text-lg font-semibold mb-1">Add a patient</h2>
      <p className="text-sm text-slate-500 mb-4">
        Ask your patient for their ID and passkey, shown on their dashboard.
      </p>
      <form onSubmit={handleSearch}>
        <Input label="Patient ID" required value={patientId} onChange={(e) => setPatientId(e.target.value)} />
        <Input label="Passkey" required value={passkey} onChange={(e) => setPasskey(e.target.value)} />
        <ErrorText>{error}</ErrorText>
        {success && <p className="text-sm text-green-600 mb-4">{success}</p>}
        <Button type="submit" disabled={loading}>
          {loading ? 'Checking...' : 'Add patient'}
        </Button>
      </form>
    </Card>
  )
}
