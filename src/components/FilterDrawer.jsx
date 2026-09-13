import { useEffect, useRef, useState } from 'react'
import { activeFilterCount } from '../lib/filter.js'
import FilterPanel from './FilterPanel.jsx'

export default function FilterDrawer({ state, counts, bounds, onChange }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const active = activeFilterCount(state, bounds)

  useEffect(() => {
    const node = ref.current
    if (!node) return
    if (open && !node.open) node.showModal()
    if (!open && node.open) node.close()
  }, [open])

  useEffect(() => {
    if (!open) return
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previous
    }
  }, [open])

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="w-full rounded-lg border border-line bg-surface px-4 py-3 text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent sm:w-auto"
      >
        Фильтры{active > 0 && <> · {active}</>}
      </button>

      <dialog
        ref={ref}
        onClose={() => setOpen(false)}
        onKeyDown={(event) => {
          if (event.key === 'Escape') setOpen(false)
        }}
        onClick={(event) => {
          if (event.target === ref.current) setOpen(false)
        }}
        className="m-0 mt-auto max-h-[85dvh] w-full max-w-none rounded-t-2xl border border-line bg-surface p-0 text-ink backdrop:bg-black/40 md:m-auto md:max-h-[85dvh] md:w-[22rem] md:rounded-2xl"
      >
        <div className="sticky top-0 flex items-center justify-between border-b border-line bg-surface px-5 py-4">
          <span className="text-base font-semibold">Фильтры</span>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Закрыть фильтры"
            className="-mr-2 rounded-md px-2 py-1 text-2xl leading-none text-muted hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            ×
          </button>
        </div>

        <div className="overflow-y-auto px-5 py-5">
          <FilterPanel state={state} counts={counts} bounds={bounds} onChange={onChange} />
        </div>

        <div className="sticky bottom-0 border-t border-line bg-surface px-5 py-4">
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="w-full rounded-lg bg-accent px-5 py-3 text-sm font-medium text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            Показать результат
          </button>
        </div>
      </dialog>
    </div>
  )
}
