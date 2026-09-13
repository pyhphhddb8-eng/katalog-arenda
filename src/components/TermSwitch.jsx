import { RENT_TERMS } from '../data/rentTerms.js'

export default function TermSwitch({ value, onChange }) {
  return (
    <fieldset>
      <legend className="mb-2 text-sm font-medium text-muted">Срок аренды</legend>
      <div className="inline-flex rounded-lg border border-line bg-surface p-1">
        {RENT_TERMS.map((term) => (
          <label
            key={term.id}
            className={`cursor-pointer rounded-md px-4 py-2 text-sm font-medium transition has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-accent ${
              value === term.id ? 'bg-accent text-white' : 'text-ink hover:text-accent'
            }`}
          >
            <input
              type="radio"
              name="term"
              value={term.id}
              checked={value === term.id}
              onChange={() => onChange(term.id)}
              className="sr-only"
            />
            {term.label}
          </label>
        ))}
      </div>
    </fieldset>
  )
}
