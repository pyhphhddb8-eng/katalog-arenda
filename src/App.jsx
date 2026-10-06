import { lazy, Suspense, useEffect, useMemo, useRef, useState } from 'react'
import { TOOLS } from './data/tools.js'
import { DEFAULT_TERM_ID } from './data/rentTerms.js'
import {
  priceBounds,
  selectTools,
  optionCounts,
  conflictHints,
  resetFilters,
} from './lib/filter.js'
import FilterPanel from './components/FilterPanel.jsx'
import FilterDrawer from './components/FilterDrawer.jsx'
import ToolGrid from './components/ToolGrid.jsx'
import TermSwitch from './components/TermSwitch.jsx'
import SortSelect from './components/SortSelect.jsx'
import { stateToSearch, searchToState } from './lib/urlState.js'

// Карточку раскрывают не все и не сразу, поэтому окно подробностей
// уезжает в отдельный кусок и качается при первом открытии.
const ToolDialog = lazy(() => import('./components/ToolDialog.jsx'))

export default function App() {
  const bounds = useMemo(() => priceBounds(TOOLS), [])
  const [initial] = useState(() => searchToState(window.location.search, bounds))
  const [state, setState] = useState(initial.state)
  const [term, setTerm] = useState(initial.term)
  const [openTool, setOpenTool] = useState(null)
  const historyTimer = useRef(null)

  useEffect(() => {
    const search = stateToSearch(state, term, bounds)
    const next = search ? `${window.location.pathname}?${search}` : window.location.pathname
    const current = `${window.location.pathname}${window.location.search}`
    if (next === current) return

    // Задержка, чтобы протаскивание ползунка не плодило шаги истории.
    clearTimeout(historyTimer.current)
    historyTimer.current = setTimeout(() => {
      window.history.pushState(null, '', next)
    }, 400)

    return () => clearTimeout(historyTimer.current)
  }, [state, term, bounds])

  useEffect(() => {
    const onPop = () => {
      const restored = searchToState(window.location.search, bounds)
      setState(restored.state)
      setTerm(restored.term)
    }
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [bounds])

  const shown = useMemo(() => selectTools(TOOLS, state), [state])
  const counts = useMemo(() => optionCounts(TOOLS, state), [state])
  const hints = useMemo(() => conflictHints(TOOLS, state, bounds), [state, bounds])

  return (
    <main className="mx-auto max-w-7xl px-4 py-10">
      <header className="max-w-2xl">
        <h1 className="font-display text-5xl font-extrabold leading-none sm:text-6xl">
          Аренда строительного инструмента
        </h1>
        <p className="mt-4 text-lg text-muted">
          Подбор по типу, питанию, весу и цене. Срок аренды пересчитывает стоимость
          всего каталога сразу.
        </p>
        <p className="mt-3 text-sm text-muted">
          Демонстрационный модуль. Позиции, цены и залоги условные — это не прайс
          настоящей компании и не предложение заключить договор.
        </p>
      </header>

      <div className="mt-6 flex flex-wrap items-end justify-between gap-4">
        <TermSwitch value={term} onChange={setTerm} />
        <SortSelect value={state.sort} onChange={(sort) => setState({ ...state, sort })} />
      </div>

      <div className="mt-8 lg:grid lg:grid-cols-[17rem_1fr] lg:gap-8">
        <div className="mb-6 lg:hidden">
          <FilterDrawer state={state} counts={counts} bounds={bounds} onChange={setState} />
        </div>

        {/* Лист отбора, прижатый к планшету, как на складе проката */}
        <aside className="relative hidden rounded-md bg-board px-3 pb-3 pt-7 shadow-[0_18px_30px_-18px_rgb(0_0_0/0.55)] lg:block lg:self-start">
          <div
            aria-hidden="true"
            className="absolute left-1/2 top-[-0.6rem] h-7 w-28 -translate-x-1/2 rounded-sm border-b-4 border-black/20 bg-clip"
          />
          <div className="bg-surface p-5">
            <FilterPanel state={state} counts={counts} bounds={bounds} onChange={setState} />
          </div>
        </aside>
        <ToolGrid
          tools={shown}
          total={TOOLS.length}
          term={term}
          hints={hints}
          onOpen={setOpenTool}
          onReset={() => setState(resetFilters(state, bounds))}
        />
      </div>

      {openTool && (
        <Suspense fallback={null}>
          <ToolDialog tool={openTool} term={term} onClose={() => setOpenTool(null)} />
        </Suspense>
      )}

      <footer className="mt-16 border-t border-line pt-6 text-sm text-muted">
        <p>
          Работа для портфолио: каталог с подбором по параметрам. Подбор и цены
          считаются прямо в браузере, без ожидания ответа сервера.
        </p>
        <p className="mt-2">
          Заявок здесь нет и персональные данные не собираются.
        </p>
      </footer>
    </main>
  )
}
