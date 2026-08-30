import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { Button, Card } from '../shared/UI'
import PatientSearch from './PatientSearch'
import PatientList from './PatientList'
import SubmissionHistory from '../patient/SubmissionHistory'
import ChatPanel from '../shared/ChatPanel'

export default function CaregiverDashboard() {
  const { profile, signOut } = useAuth()
  const [refreshKey, setRefreshKey] = useState(0)
  const [selectedPatient, setSelectedPatient] = useState({ id: null, name: null })
  const [view, setView] = useState('history') // 'history' | 'chat'

  return (
    <div className="min-h-screen">
      <header className="bg-white border-b px-6 py-4 flex justify-between items-center">
        <div>
          <h1 className="font-bold text-lg">Hi, {profile?.full_name}</h1>
          <p className="text-xs text-slate-500">Caregiver dashboard</p>
        </div>
        <Button variant="secondary" onClick={signOut}>Log out</Button>
      </header>

      <div className="max-w-5xl mx-auto p-6 grid grid-cols-3 gap-6">
        <div className="col-span-1 space-y-6">
          <PatientSearch onLinked={() => setRefreshKey((k) => k + 1)} />
          <Card>
            <h3 className="font-semibold mb-2 text-sm">Your patients</h3>
            <PatientList
              caregiverId={profile?.id}
              selectedPatientId={selectedPatient.id}
              refreshKey={refreshKey}
              onSelect={(id, name) => setSelectedPatient({ id, name })}
            />
          </Card>
        </div>

        <div className="col-span-2">
          {!selectedPatient.id ? (
            <Card>
              <p className="text-slate-500 text-sm">Select a patient to view their progress or chat with them.</p>
            </Card>
          ) : (
            <>
              <div className="flex gap-2 mb-4">
                <button
                  onClick={() => setView('history')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium ${
                    view === 'history' ? 'bg-brand-600 text-white' : 'bg-white border border-slate-200 text-slate-600'
                  }`}
                >
                  {selectedPatient.name}'s history
                </button>
                <button
                  onClick={() => setView('chat')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium ${
                    view === 'chat' ? 'bg-brand-600 text-white' : 'bg-white border border-slate-200 text-slate-600'
                  }`}
                >
                  Chat
                </button>
              </div>

              {view === 'history' && <SubmissionHistory patientId={selectedPatient.id} />}
              {view === 'chat' && (
                <Card>
                  <ChatPanel
                    patientId={selectedPatient.id}
                    caregiverId={profile?.id}
                    currentUserId={profile?.id}
                    otherPersonName={selectedPatient.name}
                  />
                </Card>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
