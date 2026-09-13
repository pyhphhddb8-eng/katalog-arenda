import ToolGlyph from './ToolGlyph.jsx'
import { typeLabel, powerLabel } from '../data/tools.js'
import { formatPrice, formatWeight } from '../lib/format.js'
import { priceForTerm, pricePerDayForTerm, savingForTerm, termById } from '../lib/pricing.js'

export default function ToolCard({ tool, term, onOpen }) {
  const total = priceForTerm(tool, term)
  const perDay = pricePerDayForTerm(tool, term)
  const saving = savingForTerm(tool, term)
  const days = termById(term).days

  return (
    <article className="flex flex-col rounded-xl border border-line bg-surface p-5">
      <div className="mb-3 flex items-start justify-between gap-3">
        <ToolGlyph type={tool.type} />
        {tool.delivery && (
          <span className="rounded-full bg-accent-soft px-2.5 py-1 text-xs font-medium text-accent">
            Есть доставка
          </span>
        )}
      </div>

      <h3 className="text-base font-semibold leading-snug">{tool.name}</h3>

      <dl className="mt-3 space-y-1 text-sm text-muted">
        <div className="flex gap-2">
          <dt className="min-w-24">Тип</dt>
          <dd className="text-ink">{typeLabel(tool.type)}</dd>
        </div>
        <div className="flex gap-2">
          <dt className="min-w-24">Питание</dt>
          <dd className="text-ink">{powerLabel(tool.power)}</dd>
        </div>
        <div className="flex gap-2">
          <dt className="min-w-24">Вес</dt>
          <dd className="text-ink">{formatWeight(tool.weight)}</dd>
        </div>
      </dl>

      <div className="mt-4 border-t border-line pt-4">
        <p className="text-2xl font-semibold">{formatPrice(total)}</p>
        <p className="text-sm text-muted">
          за {days === 1 ? 'сутки' : `${days} дн.`}
          {days > 1 && <> · {formatPrice(perDay)} в сутки</>}
        </p>
        {saving > 0 && (
          <p className="mt-1 text-sm font-medium text-accent">
            Выгода {formatPrice(saving)} против отдельных суток
          </p>
        )}
      </div>

      <button
        type="button"
        onClick={() => onOpen(tool)}
        className="mt-4 rounded-lg border border-line px-4 py-2.5 text-sm font-medium transition hover:border-accent hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      >
        Условия аренды
      </button>
    </article>
  )
}
