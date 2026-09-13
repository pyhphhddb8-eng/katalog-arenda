export default function CheckboxGroup({ group, selected, counts, onToggle }) {
  return (
    <fieldset className="border-b border-line pb-5">
      <legend className="mb-3 text-sm font-semibold">{group.label}</legend>
      <div className="space-y-1">
        {group.options.map((option) => {
          const checked = selected.includes(option.id)
          const count = counts[option.id] ?? 0
          const dead = !checked && count === 0
          return (
            <label
              key={option.id}
              className={`flex cursor-pointer items-center gap-2.5 rounded-md px-2 py-1.5 text-sm has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-accent ${
                dead ? 'text-muted' : 'hover:bg-canvas'
              }`}
            >
              <input
                type="checkbox"
                checked={checked}
                onChange={() => onToggle(option.id)}
                className="h-4 w-4 shrink-0 accent-accent"
              />
              <span className="flex-1">{option.label}</span>
              <span className={`text-xs tabular-nums ${dead ? 'text-muted' : 'text-accent'}`}>
                {count}
              </span>
            </label>
          )
        })}
      </div>
    </fieldset>
  )
}
