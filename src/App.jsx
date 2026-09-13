import { useEffect, useMemo, useRef, useState } from 'react'
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
import ToolDialog from './components/ToolDialog.jsx'
import { stateToSearch, searchToState } from './lib/urlState.js'

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
      <h1 className="text-3xl font-semibold">Аренда строительного инструмента</h1>

      <div className="mt-6 flex flex-wrap items-end justify-between gap-4">
        <TermSwitch value={term} onChange={setTerm} />
        <SortSelect value={state.sort} onChange={(sort) => setState({ ...state, sort })} />
      </div>

      <div className="mt-8 lg:grid lg:grid-cols-[17rem_1fr] lg:gap-8">
        <div className="mb-6 lg:hidden">
          <FilterDrawer state={state} counts={counts} bounds={bounds} onChange={setState} />
        </div>

        <aside className="hidden rounded-xl border border-line bg-surface p-5 lg:block lg:self-start">
          <FilterPanel state={state} counts={counts} bounds={bounds} onChange={setState} />
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

      <ToolDialog tool={openTool} term={term} onClose={() => setOpenTool(null)} />
    </main>
  )
}
