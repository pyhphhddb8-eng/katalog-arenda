const NBSP = ' '
const numbers = new Intl.NumberFormat('ru-RU')

export function formatPrice(value) {
  return `${numbers.format(value)}${NBSP}₽`
}

export function formatWeight(value) {
  return `${numbers.format(value)}${NBSP}кг`
}

// Русский счёт: 1 позиция, 2–4 позиции, 5–20 позиций, и снова по кругу.
export function plural(n, [one, few, many]) {
  const mod100 = Math.abs(n) % 100
  if (mod100 >= 11 && mod100 <= 14) return many
  const mod10 = mod100 % 10
  if (mod10 === 1) return one
  if (mod10 >= 2 && mod10 <= 4) return few
  return many
}

export function formatMatches(shown, total) {
  if (shown === 0) return 'Ничего не подошло'
  const verb = plural(shown, ['Подошла', 'Подошли', 'Подошло'])
  const noun = plural(shown, ['позиция', 'позиции', 'позиций'])
  return `${verb} ${shown} ${noun} из ${total}`
}
