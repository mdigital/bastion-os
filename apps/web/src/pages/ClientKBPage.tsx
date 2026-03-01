import { useEffect, useState, useRef, useCallback } from 'react'
import type { DragEvent, SubmitEventHandler } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { apiFetch } from '../lib/api.ts'
import { supabase } from '../lib/supabase.ts'
import Layout from '../components/Layout.tsx'
// prettier-ignore
import { ArrowLeft, BarChart3, FileText, Loader2, Network, PieChart, Presentation, RefreshCw, Send, Sparkles, X, Zap } from 'lucide-react'

const Icons = [
  {
    label: 'Summarise key goals',
    icon: FileText,
    color: 'text-purple-600',
  },
  {
    label: 'Competitor analysis',
    icon: BarChart3,
    color: 'text-green-600',
  },
  {
    label: 'Target audience',
    icon: Network,
    color: 'text-pink-600',
  },
  {
    label: 'Campaign timeline',
    icon: Presentation,
    color: 'text-yellow-600',
  },
  {
    label: 'Key challenges',
    icon: Zap,
    color: 'text-red-600',
  },
  {
    label: 'Strategy ideas',
    icon: Sparkles,
    color: 'text-blue-600',
  },
  {
    label: 'Brand positioning',
    icon: PieChart,
    color: 'text-purple-600',
  },
  {
    label: 'Budget info',
    icon: FileText,
    color: 'text-orange-600',
  },
]

interface Source {
  id: string
  file_name: string
  file_size: number
  created_at: string
  digest_status: 'pending' | 'processing' | 'ready' | 'failed'
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
  const navigate = useNavigate()
  const base = `/api/kb/clients/${clientId}`

  const [clientName, setClientName] = useState<string | null>(null)

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

  // Suggestions state
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [, setError] = useState<string | null>(null)

  // Load sources + conversations + suggestions on mount
  useEffect(() => {
    apiFetch<Source[]>(`${base}/sources`)
      .then(setSources)
      .catch((e) => setError(e.message))
    apiFetch<Conversation[]>(`${base}/conversations`)
      .then(setConversations)
      .catch((e) => setError(e.message))
    apiFetch<Suggestion[]>('/api/kb/suggestions')
      .then(setSuggestions)
      .catch((e) => setError(e.message))
  }, [base])

  useEffect(() => {
    if (!clientId) return

    const loadClientName = async () => {
      const { data, error } = await supabase
        .from('clients')
        .select('name')
        .eq('id', clientId)
        .maybeSingle()

      if (error) {
        console.error('Failed to load client name:', error.message)
        return
      }

      const name = data?.name ?? null

      setClientName(name)
    }

    void loadClientName()
  }, [clientId])

  // Poll for digest status while any source is pending/processing
  useEffect(() => {
    const hasPending = sources.some(
      (s) => s.digest_status === 'pending' || s.digest_status === 'processing',
    )
    if (!hasPending) return

    const interval = setInterval(() => {
      apiFetch<Source[]>(`${base}/sources`)
        .then(setSources)
        .catch(() => {})
    }, 5000)

    return () => clearInterval(interval)
  }, [sources, base])

  const allDigestsReady = sources.length > 0 && sources.every((s) => s.digest_status === 'ready')

  const handleFiles = useCallback(
    async (files: FileList | File[]) => {
      const fileArray = Array.from(files)
      if (fileArray.length === 0) return

      setError(null)

      // Add all files as "uploading"
      const newUploading: UploadingFile[] = fileArray.map((f) => ({
        name: f.name,
        status: 'uploading' as const,
      }))
      setUploadingFiles((prev) => [...prev, ...newUploading])

      async function uploadSingleFile(file: File): Promise<Source | null> {
        const {
          data: { session },
        } = await supabase.auth.getSession()
        if (!session) throw new Error('Not authenticated')

        const form = new FormData()
        form.append('file', file)

        const res = await fetch(`${base}/sources`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${session.access_token}` },
          body: form,
        })
        if (!res.ok) {
          throw new Error(`Upload failed: ${res.status}`)
        }
        return (await res.json()) as Source
      }

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
    },
    [base],
  )

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

  async function handleRetryDigest(sourceId: string) {
    setError(null)
    try {
      await apiFetch(`${base}/sources/${sourceId}/retry-digest`, { method: 'POST' })
      // Optimistically set to processing
      setSources((prev) =>
        prev.map((s) => (s.id === sourceId ? { ...s, digest_status: 'processing' as const } : s)),
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Retry failed')
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

  async function sendMessage(messageContent: string, deepDive: boolean = false) {
    if (!activeConv || !messageContent.trim()) return

    const userMsg: Message = {
      id: `temp-${Date.now()}`,
      role: 'user',
      content: messageContent.trim(),
      created_at: new Date().toISOString(),
    }

    const streamingMsg: Message = {
      id: 'streaming',
      role: 'assistant',
      content: '',
      created_at: new Date().toISOString(),
    }

    // Only add the user message to the UI if this is not a deep-dive re-send
    if (!deepDive) {
      setActiveConv((prev) =>
        prev ? { ...prev, messages: [...prev.messages, userMsg, streamingMsg] } : prev,
      )
    } else {
      setActiveConv((prev) =>
        prev ? { ...prev, messages: [...prev.messages, streamingMsg] } : prev,
      )
    }
    setMsgInput('')
    setSending(true)
    setError(null)

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (!session) throw new Error('Not authenticated')

      const res = await fetch(`${base}/conversations/${activeConv.id}/messages`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: messageContent.trim(), deep_dive: deepDive }),
      })

      if (!res.ok || !res.body) {
        throw new Error(`Request failed: ${res.status}`)
      }

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })

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
          if (!data) continue

          try {
            const parsed = JSON.parse(data)
            if (eventType === 'delta') {
              setActiveConv((prev) => {
                if (!prev) return prev
                return {
                  ...prev,
                  messages: prev.messages.map((m) =>
                    m.id === 'streaming' ? { ...m, content: m.content + parsed.text } : m,
                  ),
                }
              })
            } else if (eventType === 'done') {
              setActiveConv((prev) => {
                if (!prev) return prev
                return {
                  ...prev,
                  messages: prev.messages.map((m) =>
                    m.id === 'streaming'
                      ? {
                          id: parsed.id,
                          role: 'assistant',
                          content: parsed.content,
                          created_at: parsed.created_at,
                        }
                      : m,
                  ),
                }
              })
            } else if (eventType === 'error') {
              setError(parsed.message || 'Failed to get response')
              setActiveConv((prev) => {
                if (!prev) return prev
                return {
                  ...prev,
                  messages: prev.messages.filter((m) => m.id !== 'streaming'),
                }
              })
            }
          } catch {
            // Ignore parse errors
          }
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message')
      setActiveConv((prev) => {
        if (!prev) return prev
        return {
          ...prev,
          messages: prev.messages.filter((m) => m.id !== 'streaming'),
        }
      })
    } finally {
      setSending(false)
    }
  }

  const handleSend: SubmitEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault()
    await sendMessage(msgInput)
  }

  function handleDeepDive() {
    if (!activeConv) return
    // Find the last user message
    const lastUserMsg = [...activeConv.messages].reverse().find((m) => m.role === 'user')
    if (lastUserMsg) {
      sendMessage(lastUserMsg.content, true)
    }
  }

  const isUploading = uploadingFiles.some((u) => u.status === 'uploading')
  const chatDisabled = sending || !allDigestsReady

  // Check if the last message is from the assistant (and not streaming) to show deep-dive button
  const lastMessage = activeConv?.messages[activeConv.messages.length - 1]
  const showDeepDive =
    lastMessage?.role === 'assistant' &&
    lastMessage.id !== 'streaming' &&
    !sending

  return (
    <Layout>
      <div className="mx-auto my-10 max-w-350 px-4">
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-4">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/')}
                className="flex items-center gap-2 text-gray-600 hover:text-black transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="text-sm">Back to Clients</span>
              </button>
              <div className="w-px h-6 bg-gray-300"></div>
              <div>
                <h2 className="font-bold text-xl">{clientName}</h2>
                <p className="text-sm text-gray-600">TODO: Automotive Industry</p>
              </div>
            </div>
          </div>
        </div>
        <div className="flex min-h-150 max-h-[calc(100vh-500px)] gap-4 mb-8">
          <div className="w-64 bg-white rounded-xl border border-gray-200 flex flex-col">
            <div className="p-4 border-gray-200">
              <h3 className="font-bold text-sm mb-2">Sources</h3>
              <p className="text-xs text-gray-600 mb-3">{sources.length} documents</p>
              <div
                onClick={handleDropZoneClick}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`mb-4 cursor-pointer rounded-lg border-2 border-dashed p-6 text-center transition-colors duration-200 ${
                  dragOver ? 'border-[#2196f3] bg-[#e3f2fd]' : 'border-[#ccc] bg-[#fafafa]'
                }`}
              >
                <input
                  type="file"
                  ref={fileRef}
                  multiple
                  onChange={handleFileInputChange}
                  style={{ display: 'none' }}
                />
                <p style={{ margin: 0, color: '#666', fontSize: 14 }}>
                  {isUploading ? 'Uploading...' : 'Drag & drop files here, or click to browse'}
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
                      {u.name} {u.status === 'uploading' && '— uploading...'}
                      {u.status === 'done' && '— done'}
                      {u.status === 'error' && '— failed'}
                    </li>
                  ))}
                </ul>
              )}
              {/* Source list */}
              <ul className="space-y-1">
                {sources.map((source) => (
                  <li
                    key={source.id}
                    className="flex items-center gap-2 px-0 py-2 text-sm hover:bg-gray-50 rounded-lg transition-colors group cursor-pointer"
                  >
                    {/* Digest status indicator */}
                    <div className="w-4 h-4 flex items-center justify-center shrink-0">
                      {(source.digest_status === 'pending' || source.digest_status === 'processing') && (
                        <Loader2 className="w-3 h-3 text-yellow-500 animate-spin" />
                      )}
                      {source.digest_status === 'ready' && (
                        <div className="w-2 h-2 rounded-full bg-green-500" />
                      )}
                      {source.digest_status === 'failed' && (
                        <div className="w-2 h-2 rounded-full bg-red-500" />
                      )}
                    </div>
                    <FileText className="w-4 h-4 text-red-500 shrink-0" />
                    <span className="truncate text-xs flex-1">{source.file_name}</span>
                    {source.digest_status === 'failed' && (
                      <button
                        className="p-1 hover:bg-yellow-50 rounded"
                        onClick={() => handleRetryDigest(source.id)}
                        title="Retry digest"
                      >
                        <RefreshCw className="w-3 h-3 text-yellow-600" />
                      </button>
                    )}
                    <button
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-red-50 rounded"
                      onClick={() => handleDelete(source.id)}
                    >
                      <X className="w-3 h-3 text-red-600" />
                    </button>
                  </li>
                ))}
              </ul>
              {sources.length === 0 && !isUploading && (
                <p style={{ color: '#888' }}>No documents yet.</p>
              )}
            </div>
          </div>
          {activeConv && (
            <div className="flex-1 bg-white rounded-xl border border-gray-200 flex flex-col">
              <div className="p-4">
                <div className="mb-2 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setActiveConv(null)}
                    className="mb-2 inline-flex items-center gap-1 text-xs cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span className="text-sm">Back to List</span>
                  </button>
                  <button
                    className="cursor-pointer"
                    type="button"
                    onClick={handleNewConversation}
                    disabled={creatingConv}
                  >
                    {creatingConv ? 'Creating...' : 'New conversation'}
                  </button>
                </div>

                <div className="border border-[#ddd] rounded p-3 h-120 overflow-y-auto mb-2">
                  {activeConv.messages.map((m) => (
                    <div
                      key={m.id}
                      className={`mb-3 ${m.role === 'user' ? 'text-right' : 'text-left'}`}
                    >
                      <div
                        className={`inline-block px-3 py-2 rounded-lg max-w-[80%] text-left whitespace-pre-wrap ${
                          m.role === 'user' ? 'bg-[#e3f2fd]' : 'bg-[#f5f5f5]'
                        }`}
                      >
                        {m.content}
                      </div>
                    </div>
                  ))}
                  {showDeepDive && (
                    <div className="text-left mt-1 mb-3">
                      <button
                        type="button"
                        onClick={handleDeepDive}
                        className="text-xs text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                      >
                        Deep dive with full documents
                      </button>
                    </div>
                  )}
                </div>

                <form onSubmit={handleSend} className="flex gap-2">
                  <input
                    type="text"
                    value={msgInput}
                    onChange={(e) => setMsgInput(e.target.value)}
                    disabled={chatDisabled}
                    placeholder={
                      !allDigestsReady
                        ? 'Documents are being processed...'
                        : 'Ask about your documents...'
                    }
                    className="flex-1 p-2 border border-[#ddd] rounded"
                  />
                  <button
                    className="bg-black hover:bg-zinc-800 transition-colors px-4 py-2 rounded cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    type="submit"
                    disabled={chatDisabled || !msgInput.trim()}
                  >
                    <Send color="white" />
                  </button>
                </form>
              </div>
            </div>
          )}
          {/* Suggestions sidebar — only when a conversation is active */}
          {activeConv && suggestions.length > 0 && (
            <div className="w-80">
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <h3 className="font-bold mb-4">Prompt Suggestions</h3>
                <div className="grid grid-cols-2 gap-2">
                  {suggestions &&
                    suggestions.map((s) => {
                      const iconObject = Icons.find((item) => item.label === s.display_name)
                      const Icon = iconObject?.icon ?? FileText
                      const iconColor = iconObject?.color ?? 'text-gray-600'

                      return (
                        <button
                          key={s.key}
                          onClick={() => setMsgInput(s.content)}
                          className="flex flex-col items-center gap-2 p-3 border border-gray-200 rounded-lg hover:bg-yellow-50 hover:border-yellow-400 transition-colors group"
                        >
                          <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center group-hover:bg-yellow-100 transition-colors">
                            <Icon className={`w-4 h-4 ${iconColor}`} />
                          </div>
                          <span className="text-xs text-center leading-tight">
                            {s.display_name}
                          </span>
                        </button>
                      )
                    })}
                </div>
              </div>
            </div>
          )}

          {!activeConv && (
            <div className="flex-1 min-h-0 bg-white rounded-xl border border-gray-200 flex flex-col">
              <div className="p-4 flex min-h-0 flex-1 flex-col">
                <div className="mb-2 flex items-center justify-between">
                  <h3 className="font-bold text-sm m-0">Chat</h3>
                  <button
                    className="cursor-pointer"
                    type="button"
                    onClick={handleNewConversation}
                    disabled={creatingConv}
                  >
                    {creatingConv ? 'Creating...' : 'New conversation'}
                  </button>
                </div>

                <ul className="list-none p-0 m-0 overflow-y-auto min-h-0">
                  {conversations.map((c) => (
                    <li key={c.id} className="py-1.5 border-b border-[#eee]">
                      <button
                        type="button"
                        onClick={() => handleOpenConversation(c.id)}
                        className="w-full bg-transparent border-0 cursor-pointer text-left p-1"
                      >
                        {c.title || `Conversation ${c.created_at.slice(0, 10)}`}
                      </button>
                    </li>
                  ))}
                  {conversations.length === 0 && (
                    <p className="text-[#888]">No conversations yet. Upload docs and start one.</p>
                  )}
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}
