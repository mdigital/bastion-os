import { useEffect, useState, useRef } from 'react'
import type { FormEvent } from 'react'
import { useParams, Link } from 'react-router-dom'
import { apiFetch } from '../lib/api.ts'
import { supabase } from '../lib/supabase.ts'

interface Source {
  id: string
  file_name: string
  file_size: number
  created_at: string
}

interface Conversation {
  id: string
  title: string | null
  created_at: string
}

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  created_at: string
}

interface ConversationDetail extends Conversation {
  messages: Message[]
}

export default function ClientKBPage() {
  const { clientId } = useParams<{ clientId: string }>()
  const base = `/api/kb/clients/${clientId}`

  // Sources state
  const [sources, setSources] = useState<Source[]>([])
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  // Conversations state
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [activeConv, setActiveConv] = useState<ConversationDetail | null>(null)
  const [msgInput, setMsgInput] = useState('')
  const [sending, setSending] = useState(false)
  const [creatingConv, setCreatingConv] = useState(false)

  const [error, setError] = useState<string | null>(null)

  // Load sources + conversations on mount
  useEffect(() => {
    apiFetch<Source[]>(`${base}/sources`).then(setSources).catch((e) => setError(e.message))
    apiFetch<Conversation[]>(`${base}/conversations`).then(setConversations).catch((e) => setError(e.message))
  }, [base])

  async function handleUpload(e: FormEvent) {
    e.preventDefault()
    const file = fileRef.current?.files?.[0]
    if (!file) return

    setUploading(true)
    setError(null)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error('Not authenticated')

      const form = new FormData()
      form.append('file', file)

      const res = await fetch(`${base}/sources`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${session.access_token}` },
        body: form,
      })
      if (!res.ok) throw new Error(`Upload failed: ${res.status}`)
      const source = (await res.json()) as Source
      setSources((prev) => [...prev, source])
      if (fileRef.current) fileRef.current.value = ''
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  async function handleDelete(sourceId: string) {
    setError(null)
    try {
      await apiFetch(`${base}/sources/${sourceId}`, { method: 'DELETE' })
      setSources((prev) => prev.filter((s) => s.id !== sourceId))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete failed')
    }
  }

  async function handleNewConversation() {
    if (sources.length === 0) {
      setError('Upload at least one document first')
      return
    }
    setCreatingConv(true)
    setError(null)
    try {
      const conv = await apiFetch<ConversationDetail>(`${base}/conversations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ source_ids: sources.map((s) => s.id) }),
      })
      setConversations((prev) => [...prev, conv])
      setActiveConv({ ...conv, messages: [] })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create conversation')
    } finally {
      setCreatingConv(false)
    }
  }

  async function handleOpenConversation(convId: string) {
    setError(null)
    try {
      const detail = await apiFetch<ConversationDetail>(`${base}/conversations/${convId}`)
      setActiveConv(detail)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load conversation')
    }
  }

  async function handleSend(e: FormEvent) {
    e.preventDefault()
    if (!activeConv || !msgInput.trim()) return

    const userMsg: Message = {
      id: `temp-${Date.now()}`,
      role: 'user',
      content: msgInput.trim(),
      created_at: new Date().toISOString(),
    }

    setActiveConv((prev) =>
      prev ? { ...prev, messages: [...prev.messages, userMsg] } : prev,
    )
    setMsgInput('')
    setSending(true)
    setError(null)

    try {
      const assistantMsg = await apiFetch<Message>(
        `${base}/conversations/${activeConv.id}/messages`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content: userMsg.content }),
        },
      )
      setActiveConv((prev) =>
        prev ? { ...prev, messages: [...prev.messages, assistantMsg] } : prev,
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message')
    } finally {
      setSending(false)
    }
  }

  return (
    <div style={{ maxWidth: 960, margin: '40px auto', padding: '0 16px' }}>
      <Link to="/">&larr; All clients</Link>
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <div style={{ display: 'flex', gap: 32, marginTop: 16 }}>
        {/* Sources panel */}
        <div style={{ flex: '0 0 320px' }}>
          <h2>Sources</h2>
          <form onSubmit={handleUpload} style={{ marginBottom: 16 }}>
            <input type="file" ref={fileRef} />
            <button type="submit" disabled={uploading}>
              {uploading ? 'Uploading...' : 'Upload'}
            </button>
          </form>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {sources.map((s) => (
              <li
                key={s.id}
                style={{
                  padding: '6px 0',
                  borderBottom: '1px solid #eee',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <span style={{ fontSize: 14 }}>{s.file_name}</span>
                <button
                  type="button"
                  onClick={() => handleDelete(s.id)}
                  style={{ fontSize: 12 }}
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
          {sources.length === 0 && <p style={{ color: '#888' }}>No documents yet.</p>}
        </div>

        {/* Chat panel */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2>Chat</h2>
            <button type="button" onClick={handleNewConversation} disabled={creatingConv}>
              {creatingConv ? 'Creating...' : 'New conversation'}
            </button>
          </div>

          {/* Conversation list */}
          {!activeConv && (
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {conversations.map((c) => (
                <li key={c.id} style={{ padding: '6px 0', borderBottom: '1px solid #eee' }}>
                  <button
                    type="button"
                    onClick={() => handleOpenConversation(c.id)}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      textAlign: 'left',
                      width: '100%',
                      padding: 4,
                    }}
                  >
                    {c.title || `Conversation ${c.created_at.slice(0, 10)}`}
                  </button>
                </li>
              ))}
              {conversations.length === 0 && (
                <p style={{ color: '#888' }}>No conversations yet. Upload docs and start one.</p>
              )}
            </ul>
          )}

          {/* Active conversation */}
          {activeConv && (
            <div>
              <button
                type="button"
                onClick={() => setActiveConv(null)}
                style={{ marginBottom: 8, fontSize: 12 }}
              >
                &larr; Back to list
              </button>
              <div
                style={{
                  border: '1px solid #ddd',
                  borderRadius: 4,
                  padding: 12,
                  height: 400,
                  overflowY: 'auto',
                  marginBottom: 8,
                }}
              >
                {activeConv.messages.map((m) => (
                  <div
                    key={m.id}
                    style={{
                      marginBottom: 12,
                      textAlign: m.role === 'user' ? 'right' : 'left',
                    }}
                  >
                    <div
                      style={{
                        display: 'inline-block',
                        background: m.role === 'user' ? '#e3f2fd' : '#f5f5f5',
                        padding: '8px 12px',
                        borderRadius: 8,
                        maxWidth: '80%',
                        textAlign: 'left',
                        whiteSpace: 'pre-wrap',
                      }}
                    >
                      {m.content}
                    </div>
                  </div>
                ))}
                {sending && (
                  <div style={{ color: '#888', fontStyle: 'italic' }}>Thinking...</div>
                )}
              </div>
              <form onSubmit={handleSend} style={{ display: 'flex', gap: 8 }}>
                <input
                  type="text"
                  value={msgInput}
                  onChange={(e) => setMsgInput(e.target.value)}
                  placeholder="Ask about your documents..."
                  disabled={sending}
                  style={{ flex: 1, padding: 8 }}
                />
                <button type="submit" disabled={sending || !msgInput.trim()}>
                  Send
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
