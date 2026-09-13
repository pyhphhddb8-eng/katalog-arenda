import ToolCard from './ToolCard.jsx'
import EmptyState from './EmptyState.jsx'
import { formatMatches } from '../lib/format.js'

export default function ToolGrid({ tools, total, term, hints, onOpen, onReset }) {
  return (
    <div>
      <p aria-live="polite" className="mb-4 text-sm font-medium text-muted">
        {formatMatches(tools.length, total)}
      </p>

      {tools.length === 0 ? (
        <EmptyState hints={hints} onReset={onReset} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {tools.map((tool) => (
            <ToolCard key={tool.id} tool={tool} term={term} onOpen={onOpen} />
          ))}
        </div>
      )}
    </div>
  )
}
