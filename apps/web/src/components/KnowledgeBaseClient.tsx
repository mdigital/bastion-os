import { Link } from 'react-router-dom'

type KnowledgeBaseClientProps = {
  name: string
  id: string
  sources: number
  dotColorClass: string
}

export default function KnowledgeBaseClient({
  name,
  id,
  sources,
  dotColorClass,
}: KnowledgeBaseClientProps) {
  return (
    <li className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer">
      <div className="flex items-center gap-3">
        <div className={`w-2 h-2 rounded-full ${dotColorClass}`} />
        <Link to={`/clients/${id}`} className="text-sm font-medium  hover:underline">
          {name}
        </Link>
      </div>
      <span className="text-xs text-gray-500">
        {sources} {sources === 1 ? 'source' : 'sources'}
      </span>
    </li>
  )
}
