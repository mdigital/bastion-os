import { useState } from 'react'
import type { FormEvent } from 'react'
import { useAuth } from '../contexts/AuthContext.tsx'

export default function Login() {
  const { signIn } = useAuth()
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)

    const { error: err } = await signIn(email)

    setSubmitting(false)
    if (err) {
      setError(err.message)
    } else {
      setSent(true)
    }
  }

  if (sent) {
    return (
      <div style={{ maxWidth: 400, margin: '80px auto', textAlign: 'center' }}>
        <h2>Check your email</h2>
        <p>
          We sent a magic link to <strong>{email}</strong>. Click the link in
          the email to sign in.
        </p>
        <button type="button" onClick={() => setSent(false)}>
          Try a different email
        </button>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 400, margin: '80px auto' }}>
      <h1>Sign in to Bastion</h1>
      <form onSubmit={handleSubmit}>
        <label htmlFor="email" style={{ display: 'block', marginBottom: 4 }}>
          Email address
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@company.com"
          required
          style={{ width: '100%', padding: 8, marginBottom: 12 }}
        />
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <button
          type="submit"
          disabled={submitting}
          style={{ width: '100%', padding: 10 }}
        >
          {submitting ? 'Sending...' : 'Send magic link'}
        </button>
      </form>
    </div>
  )
}
