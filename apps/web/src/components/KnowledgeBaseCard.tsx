import { Database, Search } from 'lucide-react'

export default function KnowledgeBaseCard() {
  return (
    <div className="col-span-12 md:col-span-6 bg-white rounded-3xl p-8 shadow-lg hover:shadow-xl transition-all group">
      <div className="flex items-start gap-4 mb-6">
        <div className="w-14 h-14 bg-black rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
          <Database className="w-7 h-7 text-yellow-400" />
        </div>
        <div className="flex-1">
          <h3 className="text-xl font-bold mb-1">Knowledge Base</h3>
          <p className="text-gray-600 text-sm">Everything you need to know about clients</p>
        </div>
      </div>

      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search knowledge base..."
            className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all"
          />
        </div>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-blue-500 rounded-full" />
            <span className="text-sm font-medium">Geely Group</span>
          </div>
          <span className="text-xs text-gray-500">24 sources</span>
        </div>
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-indigo-500 rounded-full" />
            <span className="text-sm font-medium">Volvo</span>
          </div>
          <span className="text-xs text-gray-500">45 sources</span>
        </div>
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-green-500 rounded-full" />
            <span className="text-sm font-medium">Acme Corporation</span>
          </div>
          <span className="text-xs text-gray-500">18 sources</span>
        </div>
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-purple-500 rounded-full" />
            <span className="text-sm font-medium">TechStart Inc</span>
          </div>
          <span className="text-xs text-gray-500">31 sources</span>
        </div>
      </div>

      <button
        type="button"
        className="w-full py-3 bg-black text-white rounded-xl hover:bg-gray-800 transition-colors font-medium"
      >
        View all clients
      </button>

      <div className="mt-4 pt-4 border-t border-gray-200">
        <p className="text-sm text-gray-600">6 clients • 152 total sources</p>
      </div>
    </div>
  )
}
