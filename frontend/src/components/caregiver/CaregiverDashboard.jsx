import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../../context/AuthContext'
import { Button, Card } from '../shared/UI'
import AnimatedTabs from '../shared/AnimatedTabs'
import PatientSearch from './PatientSearch'
import PatientList from './PatientList'
import SubmissionHistory from '../patient/SubmissionHistory'
import ChatPanel from '../shared/ChatPanel'

export default function CaregiverDashboard() {
  const { profile, signOut } = useAuth()
  const [refreshKey, setRefreshKey] = useState(0)
  const [selectedPatient, setSelectedPatient] = useState({ id: null, name: null })
  const [view, setView] = useState('history') // 'history' | 'chat'

  const historyLabel = `${selectedPatient.name}'s history`
  const tabs = [historyLabel, 'Chat']
  const activeTabLabel = view === 'history' ? historyLabel : 'Chat'

  return (
    <div className="min-h-screen">
      <header className="bg-white border-b border-line px-6 py-4 flex justify-between items-center">
        <div>
          <h1 className="font-display text-xl text-ink">Hi, {profile?.full_name}</h1>
          <p className="text-xs text-ink/50">Caregiver dashboard</p>
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
              <p className="text-ink/50 text-sm">Select a patient to view their progress or chat with them.</p>
            </Card>
          ) : (
            <>
              <AnimatedTabs
                tabs={tabs}
                activeTab={activeTabLabel}
                onChange={(label) => setView(label === historyLabel ? 'history' : 'chat')}
                layoutId="caregiver-tab-pill"
              />

              <AnimatePresence mode="wait">
                <motion.div
                  key={view}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.15 }}
                >
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
                </motion.div>
              </AnimatePresence>
            </>
          )}
        </div>
      </div>
    </div>
  )
}