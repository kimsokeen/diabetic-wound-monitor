import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { Button, Card } from '../shared/UI'
import UploadPhoto from './UploadPhoto'
import SubmissionHistory from './SubmissionHistory'
import CaregiverList from './CaregiverList'
import ChatPanel from '../shared/ChatPanel'

const TABS = ['Upload', 'History', 'Talk to caregiver']

export default function PatientDashboard() {
  const { profile, signOut } = useAuth()
  const [activeTab, setActiveTab] = useState('Upload')
  const [refreshKey, setRefreshKey] = useState(0)
  const [selectedCaregiver, setSelectedCaregiver] = useState({ id: null, name: null })

  return (
    <div className="min-h-screen">
      <header className="bg-white border-b px-6 py-4 flex justify-between items-center">
        <div>
          <h1 className="font-bold text-lg">Hi, {profile?.full_name}</h1>
          <p className="text-xs text-slate-500">Patient dashboard</p>
        </div>
        <Button variant="secondary" onClick={signOut}>Log out</Button>
      </header>

      <div className="max-w-3xl mx-auto p-6">
        <Card className="mb-6 bg-brand-50 border-brand-100">
          <p className="text-sm text-slate-700">
            Share these with your caregiver so they can follow your progress:
          </p>
          <p className="text-sm mt-1">
            <strong>Your ID:</strong> <code className="bg-white px-2 py-0.5 rounded border text-xs">{profile?.id}</code>
          </p>
          <p className="text-sm">
            <strong>Your passkey:</strong> <code className="bg-white px-2 py-0.5 rounded border text-xs">{profile?.passkey}</code>
          </p>
        </Card>

        <div className="flex gap-2 mb-6">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                activeTab === tab ? 'bg-brand-600 text-white' : 'bg-white border border-slate-200 text-slate-600'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {activeTab === 'Upload' && (
          <UploadPhoto onNewSubmission={() => setRefreshKey((k) => k + 1)} />
        )}

        {activeTab === 'History' && <SubmissionHistory patientId={profile?.id} refreshKey={refreshKey} />}

        {activeTab === 'Talk to caregiver' && (
          <div className="grid grid-cols-3 gap-4">
            <Card className="col-span-1">
              <h3 className="font-semibold mb-2 text-sm">Your caregivers</h3>
              <CaregiverList
                patientId={profile?.id}
                selectedCaregiverId={selectedCaregiver.id}
                onSelect={(id, name) => setSelectedCaregiver({ id, name })}
              />
            </Card>
            <Card className="col-span-2">
              <ChatPanel
                patientId={profile?.id}
                caregiverId={selectedCaregiver.id}
                currentUserId={profile?.id}
                otherPersonName={selectedCaregiver.name}
              />
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
