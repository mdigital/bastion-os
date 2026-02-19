import { FileText } from 'lucide-react'

export default function ClientBriefCard() {
  return (
    <div className="col-span-12 md:col-span-6 bg-white rounded-3xl p-8 shadow-lg hover:shadow-xl transition-all group">
      <div className="flex items-start gap-4 mb-6">
        <div className="w-14 h-14 bg-yellow-400 rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
          <FileText className="w-7 h-7 text-black" />
        </div>
        <div className="flex-1">
          <h3 className="text-xl font-bold mb-1">Client briefs</h3>
          <p className="text-gray-600 text-sm">AI-powered client brief optimisation</p>
        </div>
      </div>

      <button
        type="button"
        className="w-full py-3 mb-4 bg-yellow-400 text-black rounded-xl hover:bg-yellow-500 transition-colors font-medium"
      >
        Create new brief
      </button>

      <div className="space-y-3 mb-4">
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-yellow-400 rounded-full" />
            <div>
              <p className="font-medium text-sm">Acme Corporation</p>
              <p className="text-xs text-gray-600">Sustainable product launch</p>
            </div>
          </div>
          <div className="text-xs text-gray-500">In Progress</div>
        </div>
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-green-400 rounded-full" />
            <div>
              <p className="font-medium text-sm">TechStart Inc</p>
              <p className="text-xs text-gray-600">SaaS platform awareness</p>
            </div>
          </div>
          <div className="text-xs text-gray-500">Finalised</div>
        </div>
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-yellow-400 rounded-full" />
            <div>
              <p className="font-medium text-sm">GreenLife Foods</p>
              <p className="text-xs text-gray-600">Organic snack line PR</p>
            </div>
          </div>
          <div className="text-xs text-gray-500">Draft</div>
        </div>
      </div>

      <button
        type="button"
        className="w-full py-3 bg-black text-white rounded-xl hover:bg-gray-800 transition-colors font-medium"
      >
        View all briefs
      </button>

      <div className="mt-4 pt-4 border-t border-gray-200">
        <p className="text-sm text-gray-600">12 briefs enhanced this month</p>
      </div>
    </div>
  )
}
