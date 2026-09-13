import { formatPrice } from '../lib/format.js'

const STEP = 50

export default function PriceRange({ value, bounds, onChange }) {
  const [min, max] = value
  const span = bounds.max - bounds.min
  const leftPercent = ((min - bounds.min) / span) * 100
  const rightPercent = ((max - bounds.min) / span) * 100

  const setMin = (next) => onChange([Math.min(next, max), max])
  const setMax = (next) => onChange([min, Math.max(next, min)])

  const sliderClass =
    'pointer-events-none absolute inset-x-0 top-0 h-6 w-full appearance-none bg-transparent ' +
    '[&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 ' +
    '[&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full ' +
    '[&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-accent ' +
    '[&::-webkit-slider-thumb]:bg-white [&::-moz-range-thumb]:pointer-events-auto ' +
    '[&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:rounded-full ' +
    '[&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-accent [&::-moz-range-thumb]:bg-white ' +
    'focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent'

  return (
    <fieldset className="border-b border-line pb-5">
      <legend className="mb-3 text-sm font-semibold">Цена за сутки</legend>

      <p className="mb-3 text-sm text-muted">
        от <span className="font-medium text-ink">{formatPrice(min)}</span> до{' '}
        <span className="font-medium text-ink">{formatPrice(max)}</span>
      </p>

      <div className="relative h-6">
        <div className="absolute inset-x-0 top-2.5 h-1 rounded-full bg-line" />
        <div
          className="absolute top-2.5 h-1 rounded-full bg-accent"
          style={{ left: `${leftPercent}%`, right: `${100 - rightPercent}%` }}
        />
        <input
          type="range"
          min={bounds.min}
          max={bounds.max}
          step={STEP}
          value={min}
          onChange={(event) => setMin(Number(event.target.value))}
          aria-label="Цена за сутки, от"
          className={sliderClass}
        />
        <input
          type="range"
          min={bounds.min}
          max={bounds.max}
          step={STEP}
          value={max}
          onChange={(event) => setMax(Number(event.target.value))}
          aria-label="Цена за сутки, до"
          className={sliderClass}
        />
      </div>
    </fieldset>
  )
}
