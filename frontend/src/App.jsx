import { AuthProvider, useAuth } from './context/AuthContext'
import AuthPage from './components/AuthPage'
import PatientDashboard from './components/patient/PatientDashboard'
import CaregiverDashboard from './components/caregiver/CaregiverDashboard'
import LandingIntro from './components/LandingIntro'
import { Spinner } from './components/shared/UI'
import { useEffect, useState } from 'react'

function AppContent() {
  const { session, profile, loading } = useAuth()
  const [showLanding, setShowLanding] = useState(false)

  useEffect(() => {
    setShowLanding(Boolean(session && profile))
  }, [session, profile])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner />
      </div>
    )
  }

  if (!session || !profile) {
    return <AuthPage />
  }

  return (
    <>
      {profile.role === 'patient' ? <PatientDashboard /> : <CaregiverDashboard />}
      {showLanding && (
        <LandingIntro
          name={profile.full_name}
          onComplete={() => setShowLanding(false)}
        />
      )}
    </>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}
