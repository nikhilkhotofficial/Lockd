'use client'
import { useState, useEffect, Suspense } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, useSearchParams } from 'next/navigation'
import { Flame, Loader2, Eye, EyeOff, Mail, ArrowLeft } from 'lucide-react'

type Mode = 'login' | 'signup' | 'forgot' | 'otp'

function AuthForm() {
  const [mode, setMode] = useState<Mode>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [otp, setOtp] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  useEffect(() => {
    const urlError = searchParams.get('error')
    if (urlError) setError(decodeURIComponent(urlError))
  }, [searchParams])

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

    } else if (mode === 'login') {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setError(error.message)
      else router.push('/dashboard')

    } else if (mode === 'forgot') {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback?next=/auth/reset-password`
      })
      if (error) setError(error.message)
      else setSuccess('Password reset link sent! Check your email.')

    } else if (mode === 'otp') {
      const { error } = await supabase.auth.signInWithOtp({ email })
      if (error) setError(error.message)
      else setSuccess('OTP sent to your email!')
    }

    setLoading(false)
  }

  async function verifyOtp(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.verifyOtp({
      email,
      token: otp,
      type: 'email'
    })
    if (error) setError(error.message)
    else router.push('/dashboard')
    setLoading(false)
  }

  async function handleGoogle() {
    setError('')
    setGoogleLoading(true)
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          skipBrowserRedirect: false,
        }
      })
      if (error) { setError(error.message); setGoogleLoading(false) }
      // Don't reset loading — page will redirect on success
    } catch {
      setError('Google sign in failed. Please try again.')
      setGoogleLoading(false)
    }
  }

  async function sendOtp() {
    if (!email) { setError('Enter your email first'); return }
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithOtp({ email })
    if (error) setError(error.message)
    else setSuccess('OTP sent! Check your email.')
    setLoading(false)
  }

  const isOtpVerifyStep = mode === 'otp' && success.includes('sent')

  return (
    <div className="card">
      {(mode === 'forgot' || mode === 'otp') && (
        <button onClick={() => { setMode('login'); setError(''); setSuccess('') }}
          className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4 -mt-1">
          <ArrowLeft size={14} /> Back to login
        </button>
      )}

      {(mode === 'login' || mode === 'signup') && (
        <div className="flex mb-6 border border-gray-100 rounded-lg p-1 bg-gray-50">
          {(['login', 'signup'] as const).map(m => (
            <button key={m} onClick={() => { setMode(m); setError(''); setSuccess('') }}
              className={`flex-1 py-1.5 text-sm rounded-md font-medium transition-colors ${mode === m ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
              {m === 'login' ? 'Log in' : 'Sign up'}
            </button>
          ))}
        </div>
      )}

      {mode === 'forgot' && (
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Reset password</h2>
          <p className="text-sm text-gray-500 mt-1">We'll send a reset link to your email.</p>
        </div>
      )}

      {mode === 'otp' && (
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Login with OTP</h2>
          <p className="text-sm text-gray-500 mt-1">No password needed — we'll email you a code.</p>
        </div>
      )}

      {isOtpVerifyStep ? (
        <form onSubmit={verifyOtp} className="space-y-3">
          <p className="text-sm text-green-700 bg-green-50 p-2 rounded-lg">{success}</p>
          <div>
            <label className="label">Enter OTP code</label>
            <input className="input text-center tracking-widest text-lg" type="text"
              placeholder="123456" maxLength={6} value={otp}
              onChange={e => setOtp(e.target.value.replace(/\D/g, ''))} required />
          </div>
          {error && <p className="text-sm text-red-600 bg-red-50 p-2 rounded-lg">{error}</p>}
          <button type="submit" disabled={loading}
            className="btn-primary w-full flex items-center justify-center gap-2">
            {loading && <Loader2 size={14} className="animate-spin" />}
            Verify & Log in
          </button>
          <button type="button" onClick={sendOtp}
            className="w-full text-sm text-gray-500 hover:text-gray-700 underline">
            Resend OTP
          </button>
        </form>
      ) : (
        <>
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
            {mode !== 'forgot' && mode !== 'otp' && (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="label !mb-0">Password</label>
                  {mode === 'login' && (
                    <button type="button" onClick={() => { setMode('forgot'); setError(''); setSuccess('') }}
                      className="text-xs text-orange-500 hover:text-orange-600 font-medium">
                      Forgot password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <input className="input pr-10" type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••" value={password}
                    onChange={e => setPassword(e.target.value)} required minLength={6} />
                  <button type="button" onClick={() => setShowPassword(p => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
            )}
            {error && <p className="text-sm text-red-600 bg-red-50 p-2 rounded-lg">{error}</p>}
            {success && !isOtpVerifyStep && <p className="text-sm text-green-700 bg-green-50 p-2 rounded-lg">{success}</p>}
            <button type="submit" disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2">
              {loading && <Loader2 size={14} className="animate-spin" />}
              {mode === 'login' ? 'Log in' : mode === 'signup' ? 'Create account' : mode === 'forgot' ? 'Send reset link' : 'Send OTP'}
            </button>
          </form>

          {(mode === 'login' || mode === 'signup') && (
            <>
              <div className="flex items-center gap-3 my-4">
                <div className="flex-1 h-px bg-gray-100" />
                <span className="text-xs text-gray-400">or continue with</span>
                <div className="flex-1 h-px bg-gray-100" />
              </div>
              <div className="space-y-2">
                <button onClick={handleGoogle} disabled={googleLoading || loading}
                  className="w-full flex items-center justify-center gap-2 border border-gray-200 rounded-lg py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-60">
                  {googleLoading ? <Loader2 size={15} className="animate-spin" /> : <svg width="16" height="16" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>}
                  {googleLoading ? 'Redirecting...' : 'Continue with Google'}
                </button>
                <button type="button" onClick={() => { setMode('otp'); setError(''); setSuccess('') }}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 border border-gray-200 rounded-lg py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                  <Mail size={15} />
                  Login with Email OTP
                </button>
              </div>
            </>
          )}
        </>
      )}
    </div>
  )
}

export default function AuthPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-2 justify-center mb-8">
          <Flame className="text-orange-500" size={28} />
          <span className="text-2xl font-semibold text-gray-900">discipline</span>
        </div>
        <Suspense fallback={<div className="card text-center text-sm text-gray-400">Loading...</div>}>
          <AuthForm />
        </Suspense>
        <p className="text-center text-xs text-gray-400 mt-4">
          Build habits. Track streaks. Challenge friends.
        </p>
      </div>
    </div>
  )
}