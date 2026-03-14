import { useState, useMemo } from 'react'
import type { Practice } from '@bastion-os/shared'
import type { BriefWithClient } from '../hooks/useBriefPolling'
import {
  Search,
  Plus,
  Archive,
  ChevronLeft,
  ChevronRight,
  User,
  DollarSign,
  Calendar,
  X,
  HelpCircle,
} from 'lucide-react'
import { apiFetch } from '../lib/api'

const PAGE_SIZE = 2

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
  onBriefSelect?: (briefId: string) => void
}

export default function BriefsListingPage({
  briefs,
  practices,
  onNewBrief,
  onRefresh,
  onBriefSelect,
}: Props) {
  const [search, setSearch] = useState('')
  const [clientFilter, setClientFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [departmentFilter, setDepartmentFilter] = useState('')
  const [showArchived, setShowArchived] = useState(false)
  const [page, setPage] = useState(1)
  const [showHelpModal, setShowHelpModal] = useState(false)

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
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold">Client briefs</h1>
            <button
              onClick={() => setShowHelpModal(true)}
              className="text-yellow-600 hover:text-yellow-700 transition-colors flex items-center gap-1 text-sm"
            >
              <HelpCircle className="w-5 h-5" />
              <span>How this tool works</span>
            </button>
          </div>
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
      <div className="mb-6">
        <div className="relative w-full mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search briefs by client name, department or job..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
          />
        </div>
        <div className="flex flex-wrap gap-4 items-center">
          <select
            value={clientFilter}
            onChange={(e) => {
              setClientFilter(e.target.value)
              setPage(1)
            }}
            className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg"
          >
            <option value="">All Clients</option>
            {clientNames.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value)
              setPage(1)
            }}
            className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg"
          >
            <option value="">All Status</option>
            <option value="draft">Draft</option>
            <option value="finalized">Finalized</option>
          </select>
          <select
            value={departmentFilter}
            onChange={(e) => {
              setDepartmentFilter(e.target.value)
              setPage(1)
            }}
            className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg"
          >
            <option value="">All Departments</option>
            {practices.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
          <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
            Show archived
            <input
              type="checkbox"
              checked={showArchived}
              onChange={(e) => {
                setShowArchived(e.target.checked)
                setPage(1)
              }}
              className="rounded border-gray-300"
            />
          </label>
        </div>
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
                <tr
                  key={brief.id}
                  onClick={() => onBriefSelect?.(brief.id)}
                  className="border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  <td className="px-6 py-4 font-medium flex items-center gap-2">
                    <User className="w-4 h-4 text-gray-400" />
                    {brief.clients?.name ?? '—'}
                  </td>
                  <td className="px-6 py-4 max-w-75 truncate">{brief.job_to_be_done ?? '—'}</td>
                  <td className="px-6 py-4 flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-gray-400" />
                    {formatCurrency(brief.budget)}
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-block align-middle mr-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                    </span>
                    <span className="align-middle">{formatDate(brief.due_date)}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-block px-2.5 py-1 rounded-full bg-gray-100 text-gray-600 text-xs font-medium">
                      {brief.lead_practice_id ? (practiceMap[brief.lead_practice_id] ?? '—') : '—'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium capitalize ${STATUS_BADGE[brief.status] ?? 'bg-gray-100 text-gray-600'}`}
                    >
                      {brief.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-500">{formatDate(brief.updated_at)}</td>
                  <td className="px-6 py-4">
                    {!brief.archived && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleArchive(brief.id)
                        }}
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
              className="flex items-center gap-1 p-2 rounded-lg border border-gray-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
              <button
                key={n}
                onClick={() => setPage(n)}
                className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
                  n === safePage
                    ? 'bg-yellow-400 text-black'
                    : 'border border-gray-300 hover:bg-gray-50'
                }`}
              >
                {n}
              </button>
            ))}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={safePage >= totalPages}
              className="flex items-center gap-1 p-2 rounded-lg border border-gray-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {showHelpModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
              <h3>How This Tool Works</h3>
              <button
                onClick={() => setShowHelpModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              <div className="bg-linear-to-r from-yellow-50 to-bone border-l-4 border-yellow-400 p-6 rounded-lg">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center shrink-0">
                    <svg
                      className="w-5 h-5"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-700 mb-6">
                      The Client Brief Clarifier and Enhancer validates that you have all the
                      information needed to make sound strategic decisions. This tool does{' '}
                      <strong>not</strong> suggest what strategy should be used—it ensures clarity
                      before strategic work begins.
                    </p>

                    {/* Timeline Steps */}
                    <div className="space-y-4">
                      {/* Step 1 */}
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center shrink-0 mt-1">
                          <span className="text-sm font-bold">1</span>
                        </div>
                        <div>
                          <h4 className="font-semibold mb-1">Receive Client Brief</h4>
                          <p className="text-sm text-gray-700">
                            Upload the initial brief received from your client to begin the
                            clarification process.
                          </p>
                        </div>
                      </div>

                      {/* Step 2 */}
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center shrink-0 mt-1">
                          <span className="text-sm font-bold">2</span>
                        </div>
                        <div>
                          <h4 className="font-semibold mb-1">Clarify and Enhance</h4>
                          <p className="text-sm text-gray-700">
                            The AI analyses the brief and highlights any missing information or
                            areas that need clarification to ensure you have everything needed for
                            strategic planning.
                          </p>
                        </div>
                      </div>

                      {/* Step 3 */}
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center shrink-0 mt-1">
                          <span className="text-sm font-bold text-gray-600">3</span>
                        </div>
                        <div>
                          <h4 className="font-semibold mb-1">
                            Strategic Response{' '}
                            <span className="text-xs text-gray-500 font-normal">(optional)</span>
                          </h4>
                          <p className="text-sm text-gray-700">
                            Once the brief is clarified, your team can develop the strategic
                            response using the enhanced brief as a foundation.
                          </p>
                        </div>
                      </div>

                      {/* Step 4 */}
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center shrink-0 mt-1">
                          <span className="text-sm font-bold">4</span>
                        </div>
                        <div>
                          <h4 className="font-semibold mb-1">Create Practice Brief</h4>
                          <p className="text-sm text-gray-700">
                            Finalise the enhanced brief ready to share with your team and begin
                            execution.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 bg-gray-50 px-6 py-4 flex justify-end border-t border-gray-200 rounded-b-2xl">
              <button
                onClick={() => setShowHelpModal(false)}
                className="px-6 py-2 bg-yellow-400 text-black rounded-lg hover:bg-yellow-500 transition-colors"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
