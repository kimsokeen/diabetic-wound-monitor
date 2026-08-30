import { AuthProvider, useAuth } from './context/AuthContext'
import AuthPage from './components/AuthPage'
import PatientDashboard from './components/patient/PatientDashboard'
import CaregiverDashboard from './components/caregiver/CaregiverDashboard'
import { Spinner } from './components/shared/UI'

function AppContent() {
  const { session, profile, loading } = useAuth()

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

  return profile.role === 'patient' ? <PatientDashboard /> : <CaregiverDashboard />
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}
