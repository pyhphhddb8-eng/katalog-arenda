import { GROUPS, toggleOption, activeFilterCount, resetFilters } from '../lib/filter.js'
import CheckboxGroup from './CheckboxGroup.jsx'
import DeliveryToggle from './DeliveryToggle.jsx'

export default function FilterPanel({ state, counts, bounds, onChange }) {
  const active = activeFilterCount(state, bounds)

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Подбор</h2>
        {active > 0 && (
          <button
            type="button"
            onClick={() => onChange(resetFilters(state, bounds))}
            className="rounded-md px-2 py-1 text-sm font-medium text-accent underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            Сбросить всё
          </button>
        )}
      </div>

      {GROUPS.map((group) => (
        <CheckboxGroup
          key={group.key}
          group={group}
          selected={state[group.key]}
          counts={counts[group.key]}
          onToggle={(optionId) => onChange(toggleOption(state, group.key, optionId))}
        />
      ))}

      <div className="border-b border-line pb-5">
        <DeliveryToggle
          checked={state.deliveryOnly}
          onChange={(next) => onChange({ ...state, deliveryOnly: next })}
        />
      </div>
    </div>
  )
}
