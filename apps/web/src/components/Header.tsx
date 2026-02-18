export default function Header() {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50 w-full">
      <div className="px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="font-medium text-gray-700">Bastion OS</span>
        </div>

        <div className="flex items-center gap-2 relative">
          <div className="relative">
            <button
              className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center hover:bg-yellow-500 transition-colors"
              type="button"
            >
              <span className="text-sm font-bold">JL</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}
