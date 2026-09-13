export default function EmptyState({ hints, onReset }) {
  return (
    <div className="rounded-xl border border-dashed border-line bg-surface p-8 text-center">
      <p className="text-lg font-semibold">Под такие условия ничего нет</p>

      {hints.length > 0 ? (
        <div className="mx-auto mt-3 max-w-md text-sm text-muted">
          <p>Мешает сочетание условий. Список вернётся, если ослабить любое из них:</p>
          <ul className="mt-2 space-y-1">
            {hints.map((hint) => (
              <li key={hint.key} className="text-ink">
                {hint.label}
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p className="mx-auto mt-3 max-w-md text-sm text-muted">
          Условия пересекаются так, что ни одна позиция не подходит. Снимите часть отметок.
        </p>
      )}

      <button
        type="button"
        onClick={onReset}
        className="mt-6 rounded-lg bg-accent px-5 py-2.5 text-sm font-medium text-white transition hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      >
        Сбросить все условия
      </button>
    </div>
  )
}
