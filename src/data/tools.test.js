import { describe, it, expect } from 'vitest'
import { TOOLS, TYPES, POWER_SOURCES, WEIGHT_BANDS } from './tools.js'

const typeIds = TYPES.map((t) => t.id)
const powerIds = POWER_SOURCES.map((p) => p.id)

describe('данные позиций', () => {
  it('содержат ровно 24 позиции', () => {
    expect(TOOLS).toHaveLength(24)
  })

  it('используют только известные типы', () => {
    for (const tool of TOOLS) {
      expect(typeIds).toContain(tool.type)
    }
  })

  it('используют только известное питание или его отсутствие', () => {
    for (const tool of TOOLS) {
      expect([...powerIds, 'none']).toContain(tool.power)
    }
  })

  it('покрывают все пять типов', () => {
    const used = new Set(TOOLS.map((t) => t.type))
    expect(used.size).toBe(5)
  })

  it('дают каждому чекбоксу питания хотя бы одну позицию', () => {
    for (const id of powerIds) {
      expect(TOOLS.some((t) => t.power === id)).toBe(true)
    }
  })

  it('имеют уникальные идентификаторы', () => {
    const ids = TOOLS.map((t) => t.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('имеют положительные цену, вес и залог', () => {
    for (const tool of TOOLS) {
      expect(tool.pricePerDay).toBeGreaterThan(0)
      expect(tool.weight).toBeGreaterThan(0)
      expect(tool.deposit).toBeGreaterThan(0)
    }
  })

  it('рассказывают, что входит в аренду и что привезти с собой', () => {
    for (const tool of TOOLS) {
      expect(tool.includes.length).toBeGreaterThan(0)
      expect(tool.bringYourOwn.length).toBeGreaterThan(0)
    }
  })

  it('заполняют каждый весовой диапазон', () => {
    for (const band of WEIGHT_BANDS) {
      expect(TOOLS.some((t) => band.test(t.weight))).toBe(true)
    }
  })

  it('относят каждую позицию ровно к одному весовому диапазону', () => {
    for (const tool of TOOLS) {
      const hit = WEIGHT_BANDS.filter((b) => b.test(tool.weight))
      expect(hit).toHaveLength(1)
    }
  })
})
