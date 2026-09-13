import { SORTS } from '../lib/filter.js'

export default function SortSelect({ value, onChange }) {
  return (
    <label className="flex items-center gap-2 text-sm">
      <span className="text-muted">Сортировка</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="rounded-lg border border-line bg-surface px-3 py-2 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      >
        {SORTS.map((sort) => (
          <option key={sort.id} value={sort.id}>
            {sort.label}
          </option>
        ))}
      </select>
    </label>
  )
}
