import { useMemo, useState } from 'react'
import { TOOLS } from './data/tools.js'
import { DEFAULT_TERM_ID } from './data/rentTerms.js'
import {
  priceBounds,
  emptyState,
  selectTools,
  optionCounts,
  conflictHints,
  resetFilters,
} from './lib/filter.js'
import FilterPanel from './components/FilterPanel.jsx'
import ToolGrid from './components/ToolGrid.jsx'
import TermSwitch from './components/TermSwitch.jsx'
import SortSelect from './components/SortSelect.jsx'

export default function App() {
  const bounds = useMemo(() => priceBounds(TOOLS), [])
  const [state, setState] = useState(() => emptyState(bounds))
  const [term, setTerm] = useState(DEFAULT_TERM_ID)

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
        <aside className="mb-8 rounded-xl border border-line bg-surface p-5 lg:mb-0 lg:self-start">
          <FilterPanel state={state} counts={counts} bounds={bounds} onChange={setState} />
        </aside>
        <ToolGrid
          tools={shown}
          total={TOOLS.length}
          term={term}
          hints={hints}
          onOpen={() => {}}
          onReset={() => setState(resetFilters(state, bounds))}
        />
      </div>
    </main>
  )
}
