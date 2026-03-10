import type { Brief, BriefAnalysisStatus, BriefSection, BriefFile } from '@bastion-os/shared'
import { useEffect, useRef, useState, useCallback } from 'react'
import { apiFetch } from '../lib/api'

export interface BriefWithRelations extends Brief {
  brief_sections: BriefSection[]
  brief_files: BriefFile[]
}

export interface BriefWithClient extends Brief {
  brief_files: BriefFile[]
  clients: { id: string; name: string } | null
}

const TERMINAL_STATUSES: BriefAnalysisStatus[] = [
  'ready',
  'extract_failed',
  'triage_failed',
  'sections_failed',
]

export function useBriefPolling(briefId: string | null) {
  const [brief, setBrief] = useState<BriefWithRelations | null>(null)
  const [isPolling, setIsPolling] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const stopPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    setIsPolling(false)
  }, [])

  const fetchBrief = useCallback(async () => {
    if (!briefId) return
    try {
      const data = await apiFetch<BriefWithRelations>(`/api/briefs/${briefId}`)
      setBrief(data)
      setError(null)

      if (TERMINAL_STATUSES.includes(data.analysis_status)) {
        stopPolling()
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    }
  }, [briefId, stopPolling])

  // Start polling when briefId changes
  useEffect(() => {
    if (!briefId) {
      setBrief(null)
      setIsPolling(false)
      return
    }

    // Fetch immediately
    setIsPolling(true)
    fetchBrief()

    // Then poll every 2s
    intervalRef.current = setInterval(fetchBrief, 2000)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [briefId, fetchBrief])

  const retry = useCallback(async () => {
    if (!briefId) return
    try {
      await apiFetch(`/api/briefs/${briefId}/retry`, { method: 'POST' })
      setIsPolling(true)
      intervalRef.current = setInterval(fetchBrief, 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    }
  }, [briefId, fetchBrief])

  return { brief, isPolling, error, retry, refetch: fetchBrief }
}
