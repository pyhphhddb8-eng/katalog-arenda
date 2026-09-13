import { useMemo, useState } from 'react'
import { TOOLS } from './data/tools.js'
import { DEFAULT_TERM_ID } from './data/rentTerms.js'
import { priceBounds, emptyState, selectTools } from './lib/filter.js'
import ToolGrid from './components/ToolGrid.jsx'
import TermSwitch from './components/TermSwitch.jsx'

export default function App() {
  const bounds = useMemo(() => priceBounds(TOOLS), [])
  const [state, setState] = useState(() => emptyState(bounds))
  const [term, setTerm] = useState(DEFAULT_TERM_ID)

  const shown = useMemo(() => selectTools(TOOLS, state), [state])

  return (
    <main className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="text-3xl font-semibold">Аренда строительного инструмента</h1>
      <div className="mt-6">
        <TermSwitch value={term} onChange={setTerm} />
      </div>
      <div className="mt-8">
        <ToolGrid tools={shown} total={TOOLS.length} term={term} onOpen={() => {}} />
      </div>
    </main>
  )
}
