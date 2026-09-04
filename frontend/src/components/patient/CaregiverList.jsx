import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { Spinner } from '../shared/UI'

export default function CaregiverList({ patientId, selectedCaregiverId, onSelect }) {
  const [caregivers, setCaregivers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadCaregivers()
  }, [patientId])

  async function loadCaregivers() {
    setLoading(true)
    // Join caregiver_links -> profiles to get each linked caregiver's name.
    const { data, error } = await supabase
      .from('caregiver_links')
      .select('caregiver_id, profiles:caregiver_id (id, full_name)')
      .eq('patient_id', patientId)

    if (error) console.error('Failed to load caregivers:', error.message)
    setCaregivers(data || [])
    setLoading(false)
  }

  if (loading) return <Spinner />
  if (caregivers.length === 0) {
    return <p className="text-sm text-ink/50">No caregiver has linked to you yet.</p>
  }

  return (
    <div className="space-y-1">
      {caregivers.map((c) => (
        <button
          key={c.caregiver_id}
          onClick={() => onSelect(c.caregiver_id, c.profiles?.full_name)}
          className={`w-full text-left px-3 py-2 rounded-lg text-sm ${
            selectedCaregiverId === c.caregiver_id ? 'bg-brand-100 text-brand-700' : 'hover:bg-paper'
          }`}
        >
          {c.profiles?.full_name || 'Unnamed caregiver'}
        </button>
      ))}
    </div>
  )
}