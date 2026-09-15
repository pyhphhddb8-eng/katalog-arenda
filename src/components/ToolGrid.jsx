import ToolCard from './ToolCard.jsx'
import EmptyState from './EmptyState.jsx'
import { formatMatches } from '../lib/format.js'

export default function ToolGrid({ tools, total, term, hints, onOpen, onReset }) {
  return (
    <div>
      {/* Заголовок уровня h2 обязателен: карточки внутри — h3, а на узком
          экране панель «Подбор» со своим h2 скрыта. Без него после h1 сразу
          шёл бы h3, и программа чтения с экрана теряла бы структуру. */}
      <div className="mb-4 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h2 className="text-lg font-semibold">Каталог</h2>
        <p aria-live="polite" className="text-sm font-medium text-muted">
          {formatMatches(tools.length, total)}
        </p>
      </div>

      {tools.length === 0 ? (
        <EmptyState hints={hints} onReset={onReset} />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {tools.map((tool) => (
            <ToolCard key={tool.id} tool={tool} term={term} onOpen={onOpen} />
          ))}
        </div>
      )}
    </div>
  )
}
