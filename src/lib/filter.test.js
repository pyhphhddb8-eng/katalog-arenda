import { describe, it, expect } from 'vitest'
import {
  GROUPS,
  SORTS,
  priceBounds,
  emptyState,
  matchesTool,
  selectTools,
  toggleOption,
} from './filter.js'

// Маленький набор-образец: по нему легко считать в уме, что должно получиться.
const fixtures = [
  { id: 'a', name: 'А', type: 'compaction', power: 'petrol', weight: 40, pricePerDay: 1000, delivery: true },
  { id: 'b', name: 'Б', type: 'compaction', power: 'mains', weight: 50, pricePerDay: 2000, delivery: false },
  { id: 'v', name: 'В', type: 'concrete', power: 'petrol', weight: 100, pricePerDay: 3000, delivery: true },
  { id: 'g', name: 'Г', type: 'height', power: 'none', weight: 150, pricePerDay: 500, delivery: true },
]

const bounds = priceBounds(fixtures)
const base = emptyState(bounds)
const ids = (list) => list.map((t) => t.id)

describe('priceBounds', () => {
  it('берёт самую дешёвую и самую дорогую позицию', () => {
    expect(bounds).toEqual({ min: 500, max: 3000 })
  })
})

describe('emptyState', () => {
  it('раскрывает диапазон цены на всю ширину', () => {
    expect(base.price).toEqual([500, 3000])
  })

  it('не отмечает ни одного чекбокса', () => {
    expect(base.types).toEqual([])
    expect(base.powers).toEqual([])
    expect(base.weights).toEqual([])
    expect(base.deliveryOnly).toBe(false)
  })
})

describe('пустое состояние', () => {
  it('пропускает все позиции', () => {
    expect(ids(selectTools(fixtures, base))).toHaveLength(4)
  })
})

describe('условие «или» внутри группы', () => {
  it('две отметки типа дают объединение', () => {
    const state = { ...base, types: ['compaction', 'height'] }
    expect(ids(selectTools(fixtures, state)).sort()).toEqual(['a', 'b', 'g'])
  })
})

describe('условие «и» между группами', () => {
  it('пересекает тип, питание и вес', () => {
    const state = { ...base, types: ['compaction'], powers: ['petrol'], weights: ['light'] }
    expect(ids(selectTools(fixtures, state))).toEqual(['a'])
  })

  it('даёт пустой результат на несовместимых условиях', () => {
    const state = { ...base, types: ['height'], powers: ['petrol'] }
    expect(selectTools(fixtures, state)).toEqual([])
  })
})

describe('позиции без питания', () => {
  it('выпадают из отбора при любом отмеченном питании', () => {
    for (const power of ['petrol', 'mains', 'battery']) {
      const state = { ...base, powers: [power] }
      expect(ids(selectTools(fixtures, state))).not.toContain('g')
    }
  })

  it('остаются в списке, пока питание не отмечено', () => {
    expect(ids(selectTools(fixtures, base))).toContain('g')
  })
})

describe('весовые диапазоны', () => {
  it('относят ровно 50 кг к «до 50 кг»', () => {
    const state = { ...base, weights: ['light'] }
    expect(ids(selectTools(fixtures, state)).sort()).toEqual(['a', 'b'])
  })

  it('относят ровно 100 кг к «50–100 кг»', () => {
    const state = { ...base, weights: ['medium'] }
    expect(ids(selectTools(fixtures, state))).toEqual(['v'])
  })

  it('относят всё выше 100 кг к «больше 100 кг»', () => {
    const state = { ...base, weights: ['heavy'] }
    expect(ids(selectTools(fixtures, state))).toEqual(['g'])
  })
})

describe('границы диапазона цены', () => {
  it('включают позицию, стоящую ровно на нижней границе', () => {
    const state = { ...base, price: [1000, 3000] }
    expect(ids(selectTools(fixtures, state))).toContain('a')
  })

  it('включают позицию, стоящую ровно на верхней границе', () => {
    const state = { ...base, price: [500, 1000] }
    expect(ids(selectTools(fixtures, state))).toContain('a')
  })

  it('отсекают то, что вне диапазона', () => {
    const state = { ...base, price: [900, 2500] }
    expect(ids(selectTools(fixtures, state)).sort()).toEqual(['a', 'b'])
  })
})

describe('только с доставкой', () => {
  it('убирает позиции без доставки', () => {
    const state = { ...base, deliveryOnly: true }
    expect(ids(selectTools(fixtures, state))).not.toContain('b')
  })
})

describe('сортировка', () => {
  it('по умолчанию ставит дешёвые первыми', () => {
    expect(ids(selectTools(fixtures, base))).toEqual(['g', 'a', 'b', 'v'])
  })

  it('разворачивает список для «сначала дороже»', () => {
    const state = { ...base, sort: 'price-desc' }
    expect(ids(selectTools(fixtures, state))).toEqual(['v', 'b', 'a', 'g'])
  })

  it('сортирует по весу', () => {
    const state = { ...base, sort: 'weight-asc' }
    expect(ids(selectTools(fixtures, state))).toEqual(['a', 'b', 'v', 'g'])
  })

  it('знает ровно три варианта', () => {
    expect(SORTS.map((s) => s.id)).toEqual(['price-asc', 'price-desc', 'weight-asc'])
  })
})

describe('matchesTool', () => {
  it('проверяет одну позицию без перебора всего списка', () => {
    expect(matchesTool(fixtures[0], { ...base, powers: ['petrol'] })).toBe(true)
    expect(matchesTool(fixtures[1], { ...base, powers: ['petrol'] })).toBe(false)
  })
})

describe('toggleOption', () => {
  it('добавляет отметку', () => {
    expect(toggleOption(base, 'types', 'concrete').types).toEqual(['concrete'])
  })

  it('снимает уже поставленную отметку', () => {
    const on = toggleOption(base, 'types', 'concrete')
    expect(toggleOption(on, 'types', 'concrete').types).toEqual([])
  })

  it('не трогает исходное состояние', () => {
    toggleOption(base, 'types', 'concrete')
    expect(base.types).toEqual([])
  })
})

describe('GROUPS', () => {
  it('описывает три группы чекбоксов', () => {
    expect(GROUPS.map((g) => g.key)).toEqual(['types', 'powers', 'weights'])
  })
})

import {
  optionCount,
  optionCounts,
  activeFilterCount,
  resetFilters,
  conflictHints,
} from './filter.js'
import { TOOLS } from '../data/tools.js'

describe('optionCount', () => {
  it('на пустом отборе показывает, сколько позиций даст отметка', () => {
    expect(optionCount(fixtures, base, 'types', 'compaction')).toBe(2)
  })

  it('не оглядывается на другие отметки своей же группы', () => {
    const state = { ...base, types: ['concrete'] }
    expect(optionCount(fixtures, state, 'types', 'compaction')).toBe(2)
  })

  it('учитывает отметки соседних групп', () => {
    const state = { ...base, powers: ['petrol'] }
    expect(optionCount(fixtures, state, 'types', 'compaction')).toBe(1)
  })

  it('учитывает диапазон цены', () => {
    const state = { ...base, price: [900, 2500] }
    expect(optionCount(fixtures, state, 'types', 'compaction')).toBe(2)
  })

  it('учитывает доставку', () => {
    const state = { ...base, deliveryOnly: true }
    expect(optionCount(fixtures, state, 'types', 'compaction')).toBe(1)
  })

  it('показывает ноль там, где жать бессмысленно', () => {
    const state = { ...base, powers: ['mains'] }
    expect(optionCount(fixtures, state, 'types', 'height')).toBe(0)
  })

  it('для уже отмеченной опции показывает её вклад в текущий список', () => {
    const state = { ...base, types: ['concrete', 'compaction'] }
    expect(optionCount(fixtures, state, 'types', 'compaction')).toBe(2)
  })
})

describe('счётчик сходится с тем, что покажет список', () => {
  const realBounds = priceBounds(TOOLS)
  const states = [
    emptyState(realBounds),
    { ...emptyState(realBounds), types: ['compaction'] },
    { ...emptyState(realBounds), powers: ['petrol'], weights: ['light'] },
    { ...emptyState(realBounds), types: ['hand', 'concrete'], deliveryOnly: true },
    { ...emptyState(realBounds), price: [700, 2000] },
  ]

  it('для каждой неотмеченной опции в каждом состоянии', () => {
    for (const state of states) {
      const shown = selectTools(TOOLS, state).length
      for (const group of GROUPS) {
        const selected = state[group.key]
        for (const option of group.options) {
          if (selected.includes(option.id)) continue
          const count = optionCount(TOOLS, state, group.key, option.id)
          const after = selectTools(TOOLS, toggleOption(state, group.key, option.id)).length
          if (selected.length === 0) {
            // Группа пуста: счётчик — это и есть будущая длина списка.
            expect(count).toBe(after)
          } else {
            // В группе уже есть отметки: счётчик — это прибавка.
            expect(shown + count).toBe(after)
          }
        }
      }
    }
  })
})

describe('optionCounts', () => {
  it('выдаёт число для каждой опции каждой группы', () => {
    const counts = optionCounts(fixtures, base)
    expect(Object.keys(counts)).toEqual(['types', 'powers', 'weights'])
    expect(counts.types.compaction).toBe(2)
    expect(counts.weights.heavy).toBe(1)
    expect(counts.powers.battery).toBe(0)
  })
})

describe('activeFilterCount', () => {
  it('на пустом состоянии равен нулю', () => {
    expect(activeFilterCount(base, bounds)).toBe(0)
  })

  it('считает каждую отметку отдельно', () => {
    const state = { ...base, types: ['compaction', 'height'], powers: ['petrol'] }
    expect(activeFilterCount(state, bounds)).toBe(3)
  })

  it('считает суженный диапазон цены за одно условие', () => {
    const state = { ...base, price: [800, 3000] }
    expect(activeFilterCount(state, bounds)).toBe(1)
  })

  it('считает доставку за одно условие', () => {
    expect(activeFilterCount({ ...base, deliveryOnly: true }, bounds)).toBe(1)
  })

  it('не считает сортировку фильтром', () => {
    expect(activeFilterCount({ ...base, sort: 'price-desc' }, bounds)).toBe(0)
  })
})

describe('resetFilters', () => {
  it('снимает все условия', () => {
    const state = { ...base, types: ['compaction'], deliveryOnly: true, price: [800, 900] }
    expect(activeFilterCount(resetFilters(state, bounds), bounds)).toBe(0)
  })

  it('оставляет выбранную сортировку', () => {
    const state = { ...base, sort: 'weight-asc', types: ['compaction'] }
    expect(resetFilters(state, bounds).sort).toBe('weight-asc')
  })
})

describe('conflictHints', () => {
  it('на непустом результате молчит', () => {
    expect(conflictHints(fixtures, base, bounds)).toEqual([])
  })

  it('называет условия, снятие которых вернёт результат', () => {
    const state = { ...base, types: ['height'], powers: ['petrol'] }
    const keys = conflictHints(fixtures, state, bounds).map((h) => h.key)
    expect(keys).toContain('types')
    expect(keys).toContain('powers')
  })

  it('называет диапазон цены, когда виноват он', () => {
    const state = { ...base, price: [1100, 1200] }
    const keys = conflictHints(fixtures, state, bounds).map((h) => h.key)
    expect(keys).toEqual(['price'])
  })

  it('называет доставку, когда виновата она', () => {
    const state = { ...base, types: ['compaction'], powers: ['mains'], deliveryOnly: true }
    const keys = conflictHints(fixtures, state, bounds).map((h) => h.key)
    expect(keys).toContain('deliveryOnly')
  })
})
