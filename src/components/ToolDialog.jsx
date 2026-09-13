import { useEffect, useRef } from 'react'
import { RENT_TERMS } from '../data/rentTerms.js'
import { typeLabel, powerLabel } from '../data/tools.js'
import { formatPrice, formatWeight } from '../lib/format.js'
import { priceForTerm, pricePerDayForTerm, savingForTerm } from '../lib/pricing.js'

export default function ToolDialog({ tool, term, onClose }) {
  const ref = useRef(null)

  useEffect(() => {
    const node = ref.current
    if (!node) return
    if (tool && !node.open) node.showModal()
    if (!tool && node.open) node.close()
  }, [tool])

  useEffect(() => {
    // Фон под окном не должен прокручиваться, пока окно открыто.
    if (!tool) return
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previous
    }
  }, [tool])

  // Клик мимо окна: у самого <dialog> область клика — вся страница,
  // поэтому попадание ровно в него значит попадание по подложке.
  const onBackdropClick = (event) => {
    if (event.target === ref.current) onClose()
  }

  // Нативный <dialog> закрывается по Esc сам, и событие close это подхватывает.
  // Явный обработчик стоит рядом как подстраховка: в некоторых окружениях
  // (в том числе под автоматизацией) встроенное поведение не срабатывает,
  // а Esc обязан работать. Повторный вызов onClose безвреден.
  const onKeyDown = (event) => {
    if (event.key === 'Escape') onClose()
  }

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onKeyDown={onKeyDown}
      onClick={onBackdropClick}
      className="m-auto w-[min(34rem,calc(100vw-2rem))] rounded-xl border border-line bg-surface p-0 text-ink backdrop:bg-black/40"
    >
      {tool && (
        <div className="p-6">
          <div className="flex items-start justify-between gap-4">
            <h2 className="text-xl font-semibold leading-snug">{tool.name}</h2>
            <button
              type="button"
              onClick={onClose}
              aria-label="Закрыть"
              className="-mr-2 -mt-1 rounded-md px-2 py-1 text-2xl leading-none text-muted hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              ×
            </button>
          </div>

          <dl className="mt-4 space-y-1 text-sm">
            <div className="flex gap-2">
              <dt className="min-w-28 text-muted">Тип</dt>
              <dd>{typeLabel(tool.type)}</dd>
            </div>
            <div className="flex gap-2">
              <dt className="min-w-28 text-muted">Питание</dt>
              <dd>{powerLabel(tool.power)}</dd>
            </div>
            <div className="flex gap-2">
              <dt className="min-w-28 text-muted">Вес</dt>
              <dd>{formatWeight(tool.weight)}</dd>
            </div>
            <div className="flex gap-2">
              <dt className="min-w-28 text-muted">Залог</dt>
              <dd>{formatPrice(tool.deposit)}</dd>
            </div>
            <div className="flex gap-2">
              <dt className="min-w-28 text-muted">Доставка</dt>
              <dd>{tool.delivery ? 'Привозим на объект' : 'Только самовывоз'}</dd>
            </div>
          </dl>

          <h3 className="mt-6 text-sm font-semibold">Цена по срокам</h3>
          <div className="mt-2 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line text-left text-muted">
                  <th scope="col" className="py-2 pr-3 font-medium">Срок</th>
                  <th scope="col" className="py-2 pr-3 font-medium">За весь срок</th>
                  <th scope="col" className="py-2 pr-3 font-medium">В сутки</th>
                  <th scope="col" className="py-2 font-medium">Выгода</th>
                </tr>
              </thead>
              <tbody>
                {RENT_TERMS.map((row) => (
                  <tr
                    key={row.id}
                    className={`border-b border-line last:border-0 ${row.id === term ? 'font-medium text-accent' : ''}`}
                  >
                    <th scope="row" className="py-2 pr-3 text-left font-normal">{row.label}</th>
                    <td className="py-2 pr-3">{formatPrice(priceForTerm(tool, row.id))}</td>
                    <td className="py-2 pr-3">{formatPrice(pricePerDayForTerm(tool, row.id))}</td>
                    <td className="py-2">
                      {savingForTerm(tool, row.id) > 0 ? formatPrice(savingForTerm(tool, row.id)) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h3 className="mt-6 text-sm font-semibold">Входит в аренду</h3>
          <ul className="mt-2 space-y-1 text-sm text-muted">
            {tool.includes.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>

          <h3 className="mt-5 text-sm font-semibold">Привезти с собой</h3>
          <ul className="mt-2 space-y-1 text-sm text-muted">
            {tool.bringYourOwn.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </div>
      )}
    </dialog>
  )
}
