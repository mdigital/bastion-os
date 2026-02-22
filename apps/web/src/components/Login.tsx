import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { Mail, Lock, ArrowRight, Check, Loader } from 'lucide-react'

type LoginStep = 'email' | 'sent' | 'verifying'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [step, setStep] = useState<LoginStep>('email')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [resentMessage, setResentMessage] = useState('')
  const navigate = useNavigate()

  const trimmedEmail = email.trim()

  const validateEmail = () => {
    if (!trimmedEmail) return 'Please enter your email address'
    if (!trimmedEmail.includes('@')) return 'Please enter a valid email address'
    return ''
  }

  const sendMagicLink = async () => {
    const { error } = await supabase.auth.signInWithOtp({ email: trimmedEmail })
    if (error) throw new Error('Failed to send magic link')
  }

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault()
    setError('')

    const validationError = validateEmail()
    if (validationError) {
      setError(validationError)
      return
    }

    if (showPassword && !password) {
      setError('Please enter your password')
      return
    }

    setIsLoading(true)

    try {
      const res = await fetch('/api/auth/check-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: trimmedEmail }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.message || 'Error checking email')
      }

      const data = await res.json()
      if (!data.found) {
        throw new Error(
          'This email is not registered in the system. Please contact your administrator.',
        )
      }

      if (showPassword) {
        const { error: signInErr } = await supabase.auth.signInWithPassword({
          email: trimmedEmail,
          password,
        })
        if (signInErr) throw new Error(signInErr.message)
        navigate('/', { replace: true })
      } else {
        await sendMagicLink()
        setStep('sent')
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('Network error. Please try again.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendLink = async () => {
    setIsLoading(true)
    setError('')
    setResentMessage('')

    try {
      await sendMagicLink()
      setResentMessage('Magic link resent! Check your inbox.')
      setTimeout(() => setResentMessage(''), 5000)
    } catch {
      setError('Failed to resend magic link. Please try again later.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-yellow-50 via-white to-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-block mb-4">
            <div className="w-16 h-16 bg-yellow-400 rounded-2xl flex items-center justify-center">
              <span className="text-2xl font-bold">B</span>
            </div>
          </div>
          <h1 className="text-3xl font-bold mb-2">Bastion OS</h1>
          <p className="text-gray-600">AI-powered operating system for business managers</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
          {step === 'email' && (
            <div>
              <h2 className="text-2xl font-bold mb-2">Welcome back</h2>
              <p className="text-gray-600 mb-6">
                {showPassword ? 'Sign in with your password' : 'Enter your email to receive a magic link'}
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium mb-2">
                    Email address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value)
                        setError('')
                      }}
                      placeholder="you@example.com"
                      className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
                      disabled={isLoading}
                    />
                  </div>
                </div>

                {showPassword && (
                  <div>
                    <label htmlFor="password" className="block text-sm font-medium mb-2">
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value)
                          setError('')
                        }}
                        placeholder="Enter your password"
                        className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
                        disabled={isLoading}
                      />
                    </div>
                  </div>
                )}

                {error && <p className="text-sm text-red-600">{error}</p>}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full px-6 py-3 bg-yellow-400 text-black rounded-lg hover:bg-yellow-500 transition-colors font-medium flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <Loader className="w-5 h-5 animate-spin" />
                      {showPassword ? 'Signing in...' : 'Sending magic link...'}
                    </>
                  ) : (
                    <>
                      {showPassword ? 'Sign in' : 'Send magic link'}
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => {
                      setShowPassword(!showPassword)
                      setPassword('')
                      setError('')
                    }}
                    className="text-sm text-gray-600 hover:underline"
                  >
                    {showPassword ? 'Use magic link instead' : 'Have a password? Sign in with password'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {step === 'sent' && (
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Check className="w-8 h-8 text-green-600" />
              </div>

              <h2 className="text-2xl font-bold mb-2">Check your inbox</h2>
              <p className="text-gray-600 mb-6">
                We've sent a magic link to <strong>{email}</strong>
              </p>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-gray-700">
                  Click the link in your email to sign in. The link will expire in 15 minutes.
                </p>
              </div>

              <button
                onClick={handleResendLink}
                disabled={isLoading}
                className="text-sm text-gray-600 hover:underline disabled:opacity-50"
              >
                Didn't receive the email? Resend link
              </button>

              {resentMessage && <div className="mt-2 text-green-600 text-sm">{resentMessage}</div>}

              <div className="mt-3">
                <button
                  onClick={() => {
                    setStep('email')
                    setEmail('')
                    setError('')
                  }}
                  className="text-sm text-gray-600 hover:underline"
                >
                  Use a different email
                </button>
              </div>
            </div>
          )}

          {step === 'verifying' && (
            <div className="text-center py-8">
              <Loader className="w-12 h-12 text-yellow-600 animate-spin mx-auto mb-4" />
              <h2 className="text-xl font-bold mb-2">Verifying...</h2>
              <p className="text-gray-600">Logging you in to Bastion OS</p>
            </div>
          )}
        </div>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">Need access? Contact your system administrator</p>
        </div>
      </div>
    </div>
  )
}
