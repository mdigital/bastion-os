import { useState, useMemo } from 'react'
import type { Practice } from '@bastion-os/shared'
import type { BriefWithClient } from '../hooks/useBriefPolling'
import { Search, Plus, Archive, ChevronLeft, ChevronRight } from 'lucide-react'
import { apiFetch } from '../lib/api'

const PAGE_SIZE = 20

const STATUS_BADGE: Record<string, string> = {
  draft: 'bg-yellow-100 text-yellow-800',
  finalized: 'bg-green-100 text-green-800',
  archived: 'bg-gray-100 text-gray-600',
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('en-AU', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function formatCurrency(val: string | null): string {
  if (!val) return '—'
  const num = parseFloat(val.replace(/[^0-9.]/g, ''))
  if (isNaN(num)) return val
  return `$${num.toLocaleString()}`
}

type Props = {
  briefs: BriefWithClient[]
  practices: Practice[]
  onNewBrief: () => void
  onRefresh: () => void
}

export default function BriefsListingPage({ briefs, practices, onNewBrief, onRefresh }: Props) {
  const [search, setSearch] = useState('')
  const [clientFilter, setClientFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [departmentFilter, setDepartmentFilter] = useState('')
  const [showArchived, setShowArchived] = useState(false)
  const [page, setPage] = useState(1)

  const clientNames = useMemo(() => {
    const names = new Set(briefs.map((b) => b.clients?.name).filter(Boolean) as string[])
    return [...names].sort()
  }, [briefs])

  const filtered = useMemo(() => {
    let list = briefs

    if (!showArchived) {
      list = list.filter((b) => !b.archived)
    }

    if (search) {
      const q = search.toLowerCase()
      list = list.filter(
        (b) =>
          (b.clients?.name ?? '').toLowerCase().includes(q) ||
          (b.job_to_be_done ?? '').toLowerCase().includes(q),
      )
    }

    if (clientFilter) {
      list = list.filter((b) => b.clients?.name === clientFilter)
    }

    if (statusFilter) {
      list = list.filter((b) => b.status === statusFilter)
    }

    if (departmentFilter) {
      list = list.filter((b) => b.lead_practice_id === departmentFilter)
    }

    return list
  }, [briefs, search, clientFilter, statusFilter, departmentFilter, showArchived])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
  const paged = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)
  const showFrom = filtered.length === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1
  const showTo = Math.min(safePage * PAGE_SIZE, filtered.length)

  const handleArchive = async (briefId: string) => {
    await apiFetch(`/api/briefs/${briefId}/archive`, { method: 'POST' })
    onRefresh()
  }

  const practiceMap = useMemo(() => {
    const m: Record<string, string> = {}
    for (const p of practices) m[p.id] = p.name
    return m
  }, [practices])

  return (
    <div className="max-w-screen-2xl mx-auto px-8 py-12">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Client briefs</h1>
          <p className="text-gray-600">View and manage all your client briefs</p>
        </div>
        <button
          onClick={onNewBrief}
          className="flex items-center gap-2 px-6 py-3 bg-black text-white rounded-xl hover:bg-gray-800 transition-colors font-medium"
        >
          <Plus className="w-4 h-4" />
          New Brief
        </button>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-wrap items-center gap-4 mb-6">
        <div className="relative flex-1 min-w-[280px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search briefs by client name or job..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
          />
        </div>

        <select
          value={clientFilter}
          onChange={(e) => { setClientFilter(e.target.value); setPage(1) }}
          className="px-4 py-2.5 border border-gray-300 rounded-lg bg-white"
        >
          <option value="">All Clients</option>
          {clientNames.map((n) => (
            <option key={n} value={n}>{n}</option>
          ))}
        </select>

        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1) }}
          className="px-4 py-2.5 border border-gray-300 rounded-lg bg-white"
        >
          <option value="">All Status</option>
          <option value="draft">Draft</option>
          <option value="finalized">Finalized</option>
        </select>

        <select
          value={departmentFilter}
          onChange={(e) => { setDepartmentFilter(e.target.value); setPage(1) }}
          className="px-4 py-2.5 border border-gray-300 rounded-lg bg-white"
        >
          <option value="">All Departments</option>
          {practices.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>

        <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
          <input
            type="checkbox"
            checked={showArchived}
            onChange={(e) => { setShowArchived(e.target.checked); setPage(1) }}
            className="rounded border-gray-300"
          />
          Show archived
        </label>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left px-6 py-3 font-medium text-gray-600">Client</th>
                <th className="text-left px-6 py-3 font-medium text-gray-600">Job Description</th>
                <th className="text-left px-6 py-3 font-medium text-gray-600">Budget</th>
                <th className="text-left px-6 py-3 font-medium text-gray-600">Due Date</th>
                <th className="text-left px-6 py-3 font-medium text-gray-600">Department</th>
                <th className="text-left px-6 py-3 font-medium text-gray-600">Status</th>
                <th className="text-left px-6 py-3 font-medium text-gray-600">Last Modified</th>
                <th className="text-left px-6 py-3 font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paged.map((brief) => (
                <tr key={brief.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-medium">{brief.clients?.name ?? '—'}</td>
                  <td className="px-6 py-4 max-w-[300px] truncate">{brief.job_to_be_done ?? '—'}</td>
                  <td className="px-6 py-4">{formatCurrency(brief.budget)}</td>
                  <td className="px-6 py-4">{formatDate(brief.due_date)}</td>
                  <td className="px-6 py-4">{brief.lead_practice_id ? (practiceMap[brief.lead_practice_id] ?? '—') : '—'}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium capitalize ${STATUS_BADGE[brief.status] ?? 'bg-gray-100 text-gray-600'}`}>
                      {brief.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-500">{formatDate(brief.updated_at)}</td>
                  <td className="px-6 py-4">
                    {!brief.archived && (
                      <button
                        onClick={() => handleArchive(brief.id)}
                        className="p-1.5 text-gray-400 hover:text-red-500 transition-colors rounded"
                        title="Archive brief"
                      >
                        <Archive className="w-4 h-4" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {paged.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                    No briefs found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {filtered.length > PAGE_SIZE && (
        <div className="flex items-center justify-between mt-6">
          <p className="text-sm text-gray-600">
            Showing {showFrom} to {showTo} of {filtered.length} briefs
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={safePage <= 1}
              className="p-2 rounded-lg border border-gray-300 disabled:opacity-40 hover:bg-gray-50 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
              <button
                key={n}
                onClick={() => setPage(n)}
                className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
                  n === safePage
                    ? 'bg-black text-white'
                    : 'border border-gray-300 hover:bg-gray-50'
                }`}
              >
                {n}
              </button>
            ))}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={safePage >= totalPages}
              className="p-2 rounded-lg border border-gray-300 disabled:opacity-40 hover:bg-gray-50 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
