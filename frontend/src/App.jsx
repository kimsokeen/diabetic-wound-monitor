import { AuthProvider, useAuth } from './context/AuthContext'
import AuthPage from './components/AuthPage'
import PatientDashboard from './components/patient/PatientDashboard'
import CaregiverDashboard from './components/caregiver/CaregiverDashboard'
import LandingIntro from './components/LandingIntro'
import { Spinner } from './components/shared/UI'
import { useEffect, useRef, useState } from 'react'

function AppContent() {
  const { session, profile, loading } = useAuth()
  const [showLanding, setShowLanding] = useState(false)
  const shownForUserRef = useRef(null)

  useEffect(() => {
    const userId = session?.user?.id

    if (!userId || !profile) {
      shownForUserRef.current = null
      setShowLanding(false)
      return
    }

    if (shownForUserRef.current === userId) return

    shownForUserRef.current = userId
    setShowLanding(true)
  }, [session?.user?.id, profile])

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
