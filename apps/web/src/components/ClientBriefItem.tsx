type ClientBriefItemProps = {
  clientName: string
  briefTitle: string
  status: string
  dotColorClass: string
  onClick?: () => void
}

export default function ClientBriefItem({
  clientName,
  briefTitle,
  status,
  dotColorClass,
  onClick,
}: ClientBriefItemProps) {
  return (
    <div
      onClick={onClick}
      className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer"
    >
      <div className="flex items-center gap-6">
        <div
          className={`w-2 h-2 aspect-square rounded-full border border-gray-300 ${dotColorClass}`}
        />
        <div>
          <p className="font-medium text-sm">{clientName}</p>
          <p className="text-xs text-gray-600">{briefTitle}</p>
        </div>
      </div>
      <div className="text-xs text-gray-400 capitalize ml-4 whitespace-nowrap">{status}</div>
    </div>
  )
}
