import { RENT_TERMS, DEFAULT_TERM_ID } from '../data/rentTerms.js'

const DEFAULT_TERM = RENT_TERMS.find((t) => t.id === DEFAULT_TERM_ID)

export function termById(termId) {
  return RENT_TERMS.find((t) => t.id === termId) ?? DEFAULT_TERM
}

export function priceForTerm(tool, termId) {
  const term = termById(termId)
  // Округляем до десятков рублей: дробные рубли в прайсе аренды не встречаются.
  return Math.round((tool.pricePerDay * term.days * term.rate) / 10) * 10
}

export function pricePerDayForTerm(tool, termId) {
  const term = termById(termId)
  return Math.round(priceForTerm(tool, termId) / term.days)
}

export function savingForTerm(tool, termId) {
  const term = termById(termId)
  return tool.pricePerDay * term.days - priceForTerm(tool, termId)
}
