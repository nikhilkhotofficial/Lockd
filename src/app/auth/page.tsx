'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Flame, Loader2 } from 'lucide-react'

export default function AuthPage() {
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const router = useRouter()
  const supabase = createClient()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    if (mode === 'signup') {
      const { error } = await supabase.auth.signUp({
        email, password,
        options: { data: { display_name: name } }
      })
      if (error) setError(error.message)
      else setSuccess('Check your email to confirm your account, then log in.')
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setError(error.message)
      else router.push('/dashboard')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-2 justify-center mb-8">
          <Flame className="text-orange-500" size={28} />
          <span className="text-2xl font-semibold text-gray-900">discipline</span>
        </div>

        <div className="card">
          <div className="flex mb-6 border border-gray-100 rounded-lg p-1 bg-gray-50">
            {(['login','signup'] as const).map(m => (
              <button key={m} onClick={() => setMode(m)}
                className={`flex-1 py-1.5 text-sm rounded-md font-medium transition-colors ${mode===m ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                {m === 'login' ? 'Log in' : 'Sign up'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            {mode === 'signup' && (
              <div>
                <label className="label">Your name</label>
                <input className="input" type="text" placeholder="e.g. Rahul" value={name}
                  onChange={e => setName(e.target.value)} required />
              </div>
            )}
            <div>
              <label className="label">Email</label>
              <input className="input" type="email" placeholder="you@example.com" value={email}
                onChange={e => setEmail(e.target.value)} required />
            </div>
            <div>
              <label className="label">Password</label>
              <input className="input" type="password" placeholder="••••••••" value={password}
                onChange={e => setPassword(e.target.value)} required minLength={6} />
            </div>

            {error && <p className="text-sm text-red-600 bg-red-50 p-2 rounded-lg">{error}</p>}
            {success && <p className="text-sm text-green-700 bg-green-50 p-2 rounded-lg">{success}</p>}

            <button type="submit" disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2">
              {loading && <Loader2 size={14} className="animate-spin" />}
              {mode === 'login' ? 'Log in' : 'Create account'}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-gray-400 mt-4">
          Build habits. Track streaks. Challenge friends.
        </p>
      </div>
    </div>
  )
}
