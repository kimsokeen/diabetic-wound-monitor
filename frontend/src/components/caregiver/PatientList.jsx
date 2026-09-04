import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { Spinner } from '../shared/UI'

export default function PatientList({ caregiverId, selectedPatientId, onSelect, refreshKey }) {
  const [patients, setPatients] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadPatients()
  }, [caregiverId, refreshKey])

  async function loadPatients() {
    setLoading(true)
    const { data, error } = await supabase
      .from('caregiver_links')
      .select('patient_id, linked_at, profiles:patient_id (id, full_name)')
      .eq('caregiver_id', caregiverId)
      .order('linked_at', { ascending: false })

    if (error) console.error('Failed to load patients:', error.message)
    setPatients(data || [])
    setLoading(false)
  }

  if (loading) return <Spinner />
  if (patients.length === 0) {
    return <p className="text-sm text-ink/50">No patients linked yet — add one above.</p>
  }

  return (
    <div className="space-y-1">
      {patients.map((p) => (
        <button
          key={p.patient_id}
          onClick={() => onSelect(p.patient_id, p.profiles?.full_name)}
          className={`w-full text-left px-3 py-2 rounded-lg text-sm ${
            selectedPatientId === p.patient_id ? 'bg-brand-100 text-brand-700' : 'hover:bg-paper'
          }`}
        >
          {p.profiles?.full_name || 'Unnamed patient'}
        </button>
      ))}
    </div>
  )
}