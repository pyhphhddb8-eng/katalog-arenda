import { describe, it, expect } from 'vitest'

const PALETTE = {
  ink: '#16181d',
  muted: '#5b6270',
  surface: '#ffffff',
  canvas: '#f6f7f9',
  accent: '#a34a08',
  accentSoft: '#fdf1e6',
  white: '#ffffff',
}

function channel(value) {
  const c = value / 255
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
}

function luminance(hex) {
  const r = Number.parseInt(hex.slice(1, 3), 16)
  const g = Number.parseInt(hex.slice(3, 5), 16)
  const b = Number.parseInt(hex.slice(5, 7), 16)
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b)
}

function contrast(a, b) {
  const la = luminance(a)
  const lb = luminance(b)
  const [hi, lo] = la > lb ? [la, lb] : [lb, la]
  return (hi + 0.05) / (lo + 0.05)
}

// Каждая пара — реально встречающееся на странице сочетание «текст на фоне».
const PAIRS = [
  ['основной текст на карточке', PALETTE.ink, PALETTE.surface],
  ['основной текст на фоне страницы', PALETTE.ink, PALETTE.canvas],
  ['серый текст на карточке', PALETTE.muted, PALETTE.surface],
  ['серый текст на фоне страницы', PALETTE.muted, PALETTE.canvas],
  ['акцент на карточке', PALETTE.accent, PALETTE.surface],
  ['акцент на фоне страницы', PALETTE.accent, PALETTE.canvas],
  ['акцент на плашке «есть доставка»', PALETTE.accent, PALETTE.accentSoft],
  ['белый текст на кнопке', PALETTE.white, PALETTE.accent],
]

describe('контраст палитры', () => {
  for (const [name, fg, bg] of PAIRS) {
    it(`${name} — не ниже 4,5 по WCAG`, () => {
      expect(contrast(fg, bg)).toBeGreaterThanOrEqual(4.5)
    })
  }
})
