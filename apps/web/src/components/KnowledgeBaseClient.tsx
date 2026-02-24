type KnowledgeBaseClientProps = {
  name: string
  sources: number
  dotColorClass: string
}

export default function KnowledgeBaseClient({ name, dotColorClass }: KnowledgeBaseClientProps) {
  return (
    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer">
      <div className="flex items-center gap-3">
        <div className={`w-2 h-2 rounded-full ${dotColorClass}`} />
        <span className="text-sm font-medium">{name}</span>
      </div>
      <span className="text-xs text-gray-500">[TODO: from DB] sources</span>
    </div>
  )
}
