import { TYPES, POWER_SOURCES, WEIGHT_BANDS } from '../data/tools.js'

// Группа чекбоксов знает три вещи: где её отметки лежат в состоянии,
// как она называется на экране и как проверить одну позицию по одной отметке.
export const GROUPS = [
  {
    key: 'types',
    label: 'Тип',
    options: TYPES,
    matches: (tool, id) => tool.type === id,
  },
  {
    key: 'powers',
    label: 'Питание',
    options: POWER_SOURCES,
    matches: (tool, id) => tool.power === id,
  },
  {
    key: 'weights',
    label: 'Вес',
    options: WEIGHT_BANDS,
    matches: (tool, id) => {
      const band = WEIGHT_BANDS.find((b) => b.id === id)
      return band ? band.test(tool.weight) : false
    },
  },
]

const byName = (a, b) => a.name.localeCompare(b.name, 'ru')

export const SORTS = [
  { id: 'price-asc', label: 'Сначала дешевле', compare: (a, b) => a.pricePerDay - b.pricePerDay },
  { id: 'price-desc', label: 'Сначала дороже', compare: (a, b) => b.pricePerDay - a.pricePerDay },
  { id: 'weight-asc', label: 'Сначала легче', compare: (a, b) => a.weight - b.weight },
]

export const DEFAULT_SORT_ID = 'price-asc'

export function priceBounds(tools) {
  const prices = tools.map((t) => t.pricePerDay)
  return { min: Math.min(...prices), max: Math.max(...prices) }
}

export function emptyState(bounds) {
  return {
    types: [],
    powers: [],
    weights: [],
    price: [bounds.min, bounds.max],
    deliveryOnly: false,
    sort: DEFAULT_SORT_ID,
  }
}

function matchesGroup(tool, group, selected) {
  // Пустая группа ничего не требует. Непустая — «или» по своим отметкам.
  if (selected.length === 0) return true
  return selected.some((id) => group.matches(tool, id))
}

export function matchesTool(tool, state) {
  for (const group of GROUPS) {
    if (!matchesGroup(tool, group, state[group.key] ?? [])) return false
  }
  if (state.deliveryOnly && !tool.delivery) return false
  const [min, max] = state.price
  // Границы включаются: позиция ровно по цене отсечки в отбор попадает.
  if (tool.pricePerDay < min || tool.pricePerDay > max) return false
  return true
}

export function selectTools(tools, state) {
  const sort = SORTS.find((s) => s.id === state.sort) ?? SORTS[0]
  return tools
    .filter((tool) => matchesTool(tool, state))
    .sort((a, b) => sort.compare(a, b) || byName(a, b))
}

export function toggleOption(state, groupKey, optionId) {
  const current = state[groupKey] ?? []
  const next = current.includes(optionId)
    ? current.filter((id) => id !== optionId)
    : [...current, optionId]
  return { ...state, [groupKey]: next }
}

export function optionCount(tools, state, groupKey, optionId) {
  // Своя группа считается так, будто в ней отмечена только эта опция.
  // Соседние группы, цена и доставка остаются как есть.
  const probe = { ...state, [groupKey]: [optionId] }
  return tools.filter((tool) => matchesTool(tool, probe)).length
}

export function optionCounts(tools, state) {
  const counts = {}
  for (const group of GROUPS) {
    counts[group.key] = {}
    for (const option of group.options) {
      counts[group.key][option.id] = optionCount(tools, state, group.key, option.id)
    }
  }
  return counts
}

function isPriceNarrowed(state, bounds) {
  return state.price[0] > bounds.min || state.price[1] < bounds.max
}

export function activeFilterCount(state, bounds) {
  let count = 0
  for (const group of GROUPS) count += (state[group.key] ?? []).length
  if (isPriceNarrowed(state, bounds)) count += 1
  if (state.deliveryOnly) count += 1
  return count
}

export function resetFilters(state, bounds) {
  return { ...emptyState(bounds), sort: state.sort }
}

export function conflictHints(tools, state, bounds) {
  if (selectTools(tools, state).length > 0) return []

  const candidates = [
    ...GROUPS.map((g) => ({
      key: g.key,
      label: g.label,
      relaxed: { ...state, [g.key]: [] },
      active: (state[g.key] ?? []).length > 0,
    })),
    {
      key: 'price',
      label: 'Цена за сутки',
      relaxed: { ...state, price: [bounds.min, bounds.max] },
      active: isPriceNarrowed(state, bounds),
    },
    {
      key: 'deliveryOnly',
      label: 'Только с доставкой',
      relaxed: { ...state, deliveryOnly: false },
      active: state.deliveryOnly,
    },
  ]

  // Показываем только те условия, снятие которых в одиночку вернёт результат.
  return candidates
    .filter((c) => c.active && selectTools(tools, c.relaxed).length > 0)
    .map(({ key, label }) => ({ key, label }))
}
