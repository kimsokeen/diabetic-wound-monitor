import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { Button, Input, Card, ErrorText } from './shared/UI'

export default function AuthPage() {
  const { signIn, signUp } = useAuth()
  const [mode, setMode] = useState('login') // 'login' | 'signup'
  const [role, setRole] = useState('patient')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [signupDone, setSignupDone] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      if (mode === 'login') {
        await signIn({ email, password })
      } else {
        await signUp({ email, password, fullName, role })
        setSignupDone(true)
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (signupDone) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center">
          <h2 className="text-xl font-semibold mb-2">Check your email</h2>
          <p className="text-slate-600 mb-4">
            We sent a confirmation link to <strong>{email}</strong>. Click it, then come back and log in.
          </p>
          <Button onClick={() => { setSignupDone(false); setMode('login') }}>Back to login</Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <h1 className="text-2xl font-bold mb-1">Diabetic Ulcer Monitoring</h1>
        <p className="text-slate-500 mb-6">{mode === 'login' ? 'Log in to your account' : 'Create an account'}</p>

        <form onSubmit={handleSubmit}>
          {mode === 'signup' && (
            <>
              <Input label="Full name" required value={fullName} onChange={(e) => setFullName(e.target.value)} />
              <label className="block mb-4">
                <span className="block text-sm font-medium text-slate-700 mb-1">I am a...</span>
                <div className="flex gap-3">
                  {['patient', 'caregiver'].map((r) => (
                    <button
                      type="button"
                      key={r}
                      onClick={() => setRole(r)}
                      className={`flex-1 py-2 rounded-lg border capitalize ${
                        role === r ? 'bg-brand-600 text-white border-brand-600' : 'border-slate-300 text-slate-700'
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </label>
            </>
          )}

          <Input
            label="Email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input
            label="Password"
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <ErrorText>{error}</ErrorText>

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? 'Please wait...' : mode === 'login' ? 'Log in' : 'Sign up'}
          </Button>
        </form>

        <p className="text-sm text-slate-500 mt-4 text-center">
          {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}{' '}
          <button
            className="text-brand-600 font-medium"
            onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError('') }}
          >
            {mode === 'login' ? 'Sign up' : 'Log in'}
          </button>
        </p>
      </Card>
    </div>
  )
}
