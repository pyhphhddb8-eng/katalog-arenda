import { describe, it, expect } from 'vitest'
import { stateToSearch, searchToState } from './urlState.js'
import { emptyState, priceBounds } from './filter.js'
import { TOOLS } from '../data/tools.js'

const bounds = priceBounds(TOOLS)
const base = emptyState(bounds)

describe('stateToSearch', () => {
  it('на пустом состоянии даёт пустую строку', () => {
    expect(stateToSearch(base, 'day', bounds)).toBe('')
  })

  it('пишет отметки через запятую', () => {
    const state = { ...base, types: ['compaction', 'hand'] }
    expect(stateToSearch(state, 'day', bounds)).toBe('t=compaction%2Chand')
  })

  it('пишет суженный диапазон цены', () => {
    const state = { ...base, price: [700, 2000] }
    expect(stateToSearch(state, 'day', bounds)).toBe('price=700-2000')
  })

  it('опускает диапазон цены, раскрытый на всю ширину', () => {
    expect(stateToSearch({ ...base, price: [bounds.min, bounds.max] }, 'day', bounds)).toBe('')
  })

  it('пишет доставку, сортировку и срок', () => {
    const state = { ...base, deliveryOnly: true, sort: 'weight-asc' }
    const search = stateToSearch(state, 'week', bounds)
    expect(search).toContain('d=1')
    expect(search).toContain('sort=weight-asc')
    expect(search).toContain('term=week')
  })

  it('опускает сортировку и срок по умолчанию', () => {
    expect(stateToSearch(base, 'day', bounds)).toBe('')
  })
})

describe('searchToState', () => {
  it('на пустой строке возвращает пустое состояние и срок по умолчанию', () => {
    const { state, term } = searchToState('', bounds)
    expect(state).toEqual(base)
    expect(term).toBe('day')
  })

  it('принимает строку с ведущим вопросительным знаком', () => {
    const { state } = searchToState('?t=hand', bounds)
    expect(state.types).toEqual(['hand'])
  })

  it('выбрасывает неизвестные отметки', () => {
    const { state } = searchToState('t=hand,выдумка', bounds)
    expect(state.types).toEqual(['hand'])
  })

  it('выбрасывает неизвестную сортировку', () => {
    const { state } = searchToState('sort=по-настроению', bounds)
    expect(state.sort).toBe('price-asc')
  })

  it('выбрасывает неизвестный срок', () => {
    const { term } = searchToState('term=месяц', bounds)
    expect(term).toBe('day')
  })

  it('подрезает диапазон цены до границ данных', () => {
    const { state } = searchToState('price=0-999999', bounds)
    expect(state.price).toEqual([bounds.min, bounds.max])
  })

  it('игнорирует диапазон цены из мусора', () => {
    const { state } = searchToState('price=дёшево', bounds)
    expect(state.price).toEqual([bounds.min, bounds.max])
  })

  it('разворачивает перевёрнутый диапазон', () => {
    const { state } = searchToState('price=2000-700', bounds)
    expect(state.price).toEqual([700, 2000])
  })
})

describe('состояние переживает поездку в адрес и обратно', () => {
  const samples = [
    [{ ...base, types: ['compaction', 'height'], powers: ['petrol'] }, 'day'],
    [{ ...base, weights: ['light'], price: [700, 2000], deliveryOnly: true }, 'three'],
    [{ ...base, sort: 'price-desc' }, 'week'],
    [base, 'day'],
  ]

  it('для каждого образца', () => {
    for (const [state, term] of samples) {
      const search = stateToSearch(state, term, bounds)
      const back = searchToState(search, bounds)
      expect(back.state).toEqual(state)
      expect(back.term).toBe(term)
    }
  })
})
