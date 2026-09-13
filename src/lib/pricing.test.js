import { describe, it, expect } from 'vitest'
import { termById, priceForTerm, pricePerDayForTerm, savingForTerm } from './pricing.js'
import { TOOLS } from '../data/tools.js'
import { RENT_TERMS } from '../data/rentTerms.js'

const tool = { pricePerDay: 1000 }

describe('termById', () => {
  it('находит срок по идентификатору', () => {
    expect(termById('week').days).toBe(7)
  })

  it('возвращает срок по умолчанию для неизвестного идентификатора', () => {
    expect(termById('месяц').id).toBe('day')
  })
})

describe('priceForTerm', () => {
  it('за сутки берёт цену как есть', () => {
    expect(priceForTerm(tool, 'day')).toBe(1000)
  })

  it('за три дня считает по коэффициенту', () => {
    expect(priceForTerm(tool, 'three')).toBe(2700)
  })

  it('за неделю считает по коэффициенту', () => {
    expect(priceForTerm(tool, 'week')).toBe(5250)
  })

  it('округляет до десятков рублей', () => {
    expect(priceForTerm({ pricePerDay: 333 }, 'three')).toBe(900)
  })
})

describe('pricePerDayForTerm', () => {
  it('за сутки совпадает с ценой позиции', () => {
    expect(pricePerDayForTerm(tool, 'day')).toBe(1000)
  })

  it('за неделю ниже цены за сутки', () => {
    expect(pricePerDayForTerm(tool, 'week')).toBeLessThan(1000)
  })
})

describe('savingForTerm', () => {
  it('за сутки экономии нет', () => {
    expect(savingForTerm(tool, 'day')).toBe(0)
  })

  it('за неделю показывает разницу с семью отдельными сутками', () => {
    expect(savingForTerm(tool, 'week')).toBe(1750)
  })
})

describe('выгода длинного срока', () => {
  it('для каждой позиции неделя дешевле семи отдельных суток', () => {
    for (const item of TOOLS) {
      expect(priceForTerm(item, 'week')).toBeLessThan(item.pricePerDay * 7)
    }
  })

  it('для каждой позиции цена за сутки падает с ростом срока', () => {
    for (const item of TOOLS) {
      const perDay = RENT_TERMS.map((t) => pricePerDayForTerm(item, t.id))
      expect(perDay[1]).toBeLessThan(perDay[0])
      expect(perDay[2]).toBeLessThan(perDay[1])
    }
  })
})
