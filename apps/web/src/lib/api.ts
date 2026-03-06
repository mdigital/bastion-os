import { supabase } from './supabase.ts'

export async function apiFetch<T = unknown>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) throw new Error('Not authenticated')

  const res = await fetch(path, {
    ...init,
    headers: {
      ...init?.headers,
      Authorization: `Bearer ${session.access_token}`,
    },
  })

  if (!res.ok) {
    const body = await res.text()
    throw new Error(`API ${res.status}: ${body}`)
  }

  if (res.status === 204) return undefined as T

  return res.json() as Promise<T>
}

/** Upload a file via multipart FormData with auth header. */
export async function apiUploadFile<T = unknown>(
  path: string,
  file: File,
): Promise<T> {
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) throw new Error('Not authenticated')

  const formData = new FormData()
  formData.append('file', file)

  const res = await fetch(path, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${session.access_token}`,
    },
    body: formData,
  })

  if (!res.ok) {
    const body = await res.text()
    throw new Error(`API ${res.status}: ${body}`)
  }

  return res.json() as Promise<T>
}
