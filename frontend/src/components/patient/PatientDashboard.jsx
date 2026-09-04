import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../../context/AuthContext'
import { Button, Card } from '../shared/UI'
import AnimatedTabs from '../shared/AnimatedTabs'
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
      <header className="bg-white border-b border-line px-6 py-4 flex justify-between items-center">
        <div>
          <h1 className="font-display text-xl text-ink">Hi, {profile?.full_name}</h1>
          <p className="text-xs text-ink/50">Patient dashboard</p>
        </div>
        <Button variant="secondary" onClick={signOut}>Log out</Button>
      </header>

      <div className="max-w-3xl mx-auto p-6">
        <div className="mb-6 rounded-xl bg-brand-600 text-white px-5 py-4">
          <p className="text-sm text-brand-100">
            Share these with your caregiver so they can follow your progress:
          </p>
          <div className="flex flex-wrap gap-x-6 gap-y-1 mt-2 text-sm">
            <p><span className="text-brand-100">ID</span> <code className="ml-1 bg-white/15 px-2 py-0.5 rounded text-xs">{profile?.id}</code></p>
            <p><span className="text-brand-100">Passkey</span> <code className="ml-1 bg-white/15 px-2 py-0.5 rounded text-xs">{profile?.passkey}</code></p>
          </div>
        </div>

        <AnimatedTabs tabs={TABS} activeTab={activeTab} onChange={setActiveTab} layoutId="patient-tab-pill" />

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
          >
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
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}