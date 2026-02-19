type ClientBriefItemProps = {
  clientName: string
  briefTitle: string
  status: string
  dotColorClass: string
}

export default function ClientBriefItem({
  clientName,
  briefTitle,
  status,
  dotColorClass,
}: ClientBriefItemProps) {
  return (
    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer">
      <div className="flex items-center gap-3">
        <div className={`w-2 h-2 rounded-full ${dotColorClass}`} />
        <div>
          <p className="font-medium text-sm">{clientName}</p>
          <p className="text-xs text-gray-600">{briefTitle}</p>
        </div>
      </div>
      <div className="text-xs text-gray-500">{status}</div>
    </div>
  )
}
