import { GROUPS, SORTS, DEFAULT_SORT_ID, emptyState } from './filter.js'
import { RENT_TERMS, DEFAULT_TERM_ID } from '../data/rentTerms.js'

const PARAM_BY_GROUP = { types: 't', powers: 'p', weights: 'w' }

export function stateToSearch(state, term, bounds) {
  const params = new URLSearchParams()

  for (const group of GROUPS) {
    const selected = state[group.key] ?? []
    if (selected.length > 0) params.set(PARAM_BY_GROUP[group.key], selected.join(','))
  }

  const [min, max] = state.price
  if (min > bounds.min || max < bounds.max) params.set('price', `${min}-${max}`)

  if (state.deliveryOnly) params.set('d', '1')
  if (state.sort !== DEFAULT_SORT_ID) params.set('sort', state.sort)
  if (term !== DEFAULT_TERM_ID) params.set('term', term)

  return params.toString()
}

function readList(params, key, knownIds) {
  const raw = params.get(key)
  if (!raw) return []
  // Порядок сохраняем как в справочнике, чтобы сравнение состояний не зависело
  // от того, в каком порядке пользователь расставил отметки.
  const chosen = new Set(raw.split(','))
  return knownIds.filter((id) => chosen.has(id))
}

function readPrice(params, bounds) {
  const raw = params.get('price')
  if (!raw) return [bounds.min, bounds.max]
  const parts = raw.split('-').map((n) => Number.parseInt(n, 10))
  if (parts.length !== 2 || parts.some(Number.isNaN)) return [bounds.min, bounds.max]
  const lo = Math.max(bounds.min, Math.min(parts[0], parts[1]))
  const hi = Math.min(bounds.max, Math.max(parts[0], parts[1]))
  return [lo, hi]
}

export function searchToState(search, bounds) {
  const params = new URLSearchParams(search.startsWith('?') ? search.slice(1) : search)
  const state = emptyState(bounds)

  for (const group of GROUPS) {
    state[group.key] = readList(
      params,
      PARAM_BY_GROUP[group.key],
      group.options.map((o) => o.id),
    )
  }

  state.price = readPrice(params, bounds)
  state.deliveryOnly = params.get('d') === '1'

  const sort = params.get('sort')
  state.sort = SORTS.some((s) => s.id === sort) ? sort : DEFAULT_SORT_ID

  const term = params.get('term')
  const knownTerm = RENT_TERMS.some((t) => t.id === term) ? term : DEFAULT_TERM_ID

  return { state, term: knownTerm }
}
