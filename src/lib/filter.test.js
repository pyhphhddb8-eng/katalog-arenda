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
