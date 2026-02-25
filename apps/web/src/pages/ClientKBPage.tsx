import { useEffect, useState, useRef, useCallback } from 'react'
import type { FormEvent, DragEvent } from 'react'
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

interface Suggestion {
  id: string
  key: string
  display_name: string
  content: string
}

interface UploadingFile {
  name: string
  status: 'uploading' | 'done' | 'error'
}

export default function ClientKBPage() {
  const { clientId } = useParams<{ clientId: string }>()
  const base = `/api/kb/clients/${clientId}`

  // Sources state
  const [sources, setSources] = useState<Source[]>([])
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([])
  const fileRef = useRef<HTMLInputElement>(null)
  const [dragOver, setDragOver] = useState(false)

  // Conversations state
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [activeConv, setActiveConv] = useState<ConversationDetail | null>(null)
  const [msgInput, setMsgInput] = useState('')
  const [sending, setSending] = useState(false)
  const [creatingConv, setCreatingConv] = useState(false)

  // File preparation state
  const [preparingFiles, setPreparingFiles] = useState(false)
  const [prepareProgress, setPrepareProgress] = useState<{ current: number; total: number; fileName: string } | null>(null)

  // Suggestions state
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])

  const [error, setError] = useState<string | null>(null)

  // Load sources + conversations + suggestions on mount
  useEffect(() => {
    apiFetch<Source[]>(`${base}/sources`).then(setSources).catch((e) => setError(e.message))
    apiFetch<Conversation[]>(`${base}/conversations`).then(setConversations).catch((e) => setError(e.message))
    apiFetch<Suggestion[]>('/api/kb/suggestions').then(setSuggestions).catch((e) => setError(e.message))
  }, [base])

  async function uploadSingleFile(file: File): Promise<Source | null> {
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
    return (await res.json()) as Source
  }

  const handleFiles = useCallback(async (files: FileList | File[]) => {
    const fileArray = Array.from(files)
    if (fileArray.length === 0) return

    setError(null)

    // Add all files as "uploading"
    const newUploading: UploadingFile[] = fileArray.map((f) => ({
      name: f.name,
      status: 'uploading' as const,
    }))
    setUploadingFiles((prev) => [...prev, ...newUploading])

    for (let i = 0; i < fileArray.length; i++) {
      const file = fileArray[i]
      try {
        const source = await uploadSingleFile(file)
        if (source) {
          setSources((prev) => [...prev, source])
        }
        setUploadingFiles((prev) =>
          prev.map((u) =>
            u.name === file.name && u.status === 'uploading'
              ? { ...u, status: 'done' as const }
              : u,
          ),
        )
      } catch (err) {
        setUploadingFiles((prev) =>
          prev.map((u) =>
            u.name === file.name && u.status === 'uploading'
              ? { ...u, status: 'error' as const }
              : u,
          ),
        )
        setError(err instanceof Error ? err.message : `Failed to upload ${file.name}`)
      }
    }

    // Clear completed uploads after a brief delay
    setTimeout(() => {
      setUploadingFiles((prev) => prev.filter((u) => u.status === 'uploading'))
    }, 2000)
  }, [base])

  function handleDragOver(e: DragEvent) {
    e.preventDefault()
    setDragOver(true)
  }

  function handleDragLeave(e: DragEvent) {
    e.preventDefault()
    setDragOver(false)
  }

  function handleDrop(e: DragEvent) {
    e.preventDefault()
    setDragOver(false)
    if (e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files)
    }
  }

  function handleDropZoneClick() {
    fileRef.current?.click()
  }

  function handleFileInputChange() {
    const files = fileRef.current?.files
    if (files && files.length > 0) {
      handleFiles(files)
      if (fileRef.current) fileRef.current.value = ''
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

  async function prepareConversationFiles(convId: string) {
    setPreparingFiles(true)
    setPrepareProgress(null)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error('Not authenticated')

      const res = await fetch(`${base}/conversations/${convId}/prepare-files`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${session.access_token}` },
      })

      if (!res.ok || !res.body) {
        throw new Error(`Prepare files failed: ${res.status}`)
      }

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })

        // Parse SSE events from buffer
        const parts = buffer.split('\n\n')
        buffer = parts.pop() || ''

        for (const part of parts) {
          const lines = part.split('\n')
          let eventType = ''
          let data = ''
          for (const line of lines) {
            if (line.startsWith('event: ')) eventType = line.slice(7)
            else if (line.startsWith('data: ')) data = line.slice(6)
          }
          if (eventType === 'progress' && data) {
            try {
              const progress = JSON.parse(data)
              setPrepareProgress({ current: progress.current, total: progress.total, fileName: progress.fileName })
            } catch { /* ignore parse errors */ }
          }
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to prepare files')
    } finally {
      setPreparingFiles(false)
      setPrepareProgress(null)
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
      // Prepare files in background (non-blocking — files are fresh from upload but this ensures cache)
      prepareConversationFiles(conv.id)
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
      // Prepare files — verifies cached Gemini URIs and re-uploads stale ones
      prepareConversationFiles(convId)
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

  const isUploading = uploadingFiles.some((u) => u.status === 'uploading')

  return (
    <div style={{ maxWidth: 1280, margin: '40px auto', padding: '0 16px' }}>
      <Link to="/">&larr; All clients</Link>
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <div style={{ display: 'flex', gap: 32, marginTop: 16 }}>
        {/* Sources panel */}
        <div style={{ flex: '0 0 320px' }}>
          <h2>Sources</h2>

          {/* Drop zone */}
          <div
            onClick={handleDropZoneClick}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            style={{
              border: `2px dashed ${dragOver ? '#2196f3' : '#ccc'}`,
              borderRadius: 8,
              padding: 24,
              textAlign: 'center',
              cursor: 'pointer',
              marginBottom: 16,
              background: dragOver ? '#e3f2fd' : '#fafafa',
              transition: 'border-color 0.2s, background 0.2s',
            }}
          >
            <input
              type="file"
              ref={fileRef}
              multiple
              onChange={handleFileInputChange}
              style={{ display: 'none' }}
            />
            <p style={{ margin: 0, color: '#666', fontSize: 14 }}>
              {isUploading
                ? 'Uploading...'
                : 'Drag & drop files here, or click to browse'}
            </p>
          </div>

          {/* Upload progress */}
          {uploadingFiles.length > 0 && (
            <ul style={{ listStyle: 'none', padding: 0, marginBottom: 12 }}>
              {uploadingFiles.map((u, i) => (
                <li
                  key={`${u.name}-${i}`}
                  style={{
                    padding: '4px 0',
                    fontSize: 13,
                    color:
                      u.status === 'uploading'
                        ? '#1976d2'
                        : u.status === 'done'
                          ? '#388e3c'
                          : '#d32f2f',
                  }}
                >
                  {u.name}{' '}
                  {u.status === 'uploading' && '— uploading...'}
                  {u.status === 'done' && '— done'}
                  {u.status === 'error' && '— failed'}
                </li>
              ))}
            </ul>
          )}

          {/* Source list */}
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
          {sources.length === 0 && !isUploading && (
            <p style={{ color: '#888' }}>No documents yet.</p>
          )}
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
              {preparingFiles && (
                <div
                  style={{
                    padding: '8px 12px',
                    marginBottom: 8,
                    background: '#e3f2fd',
                    borderRadius: 4,
                    fontSize: 13,
                    color: '#1565c0',
                  }}
                >
                  {prepareProgress
                    ? `Preparing documents... (${prepareProgress.current}/${prepareProgress.total}) — ${prepareProgress.fileName}`
                    : 'Preparing documents...'}
                </div>
              )}
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
                  disabled={sending || preparingFiles}
                  placeholder={preparingFiles ? 'Preparing documents...' : 'Ask about your documents...'}
                  style={{ flex: 1, padding: 8 }}
                />
                <button type="submit" disabled={sending || preparingFiles || !msgInput.trim()}>
                  Send
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Suggestions sidebar — only when a conversation is active */}
        {activeConv && suggestions.length > 0 && (
          <div style={{ flex: '0 0 320px' }}>
            <h2>Suggestions</h2>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 8,
              }}
            >
              {suggestions.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setMsgInput(s.content)}
                  style={{
                    padding: '10px 8px',
                    fontSize: 13,
                    border: '1px solid #ddd',
                    borderRadius: 6,
                    background: '#fafafa',
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                >
                  {s.display_name}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
