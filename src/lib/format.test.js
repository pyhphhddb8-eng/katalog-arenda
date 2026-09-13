import { describe, it, expect } from 'vitest'
import { formatPrice, formatWeight, plural, formatMatches } from './format.js'

// В выводе стоят неразрывные пробелы — для сравнения меняем их на обычные.
const plain = (s) => s.replace(/[  ]/g, ' ')

describe('formatPrice', () => {
  it('разделяет разряды и ставит знак рубля', () => {
    expect(plain(formatPrice(1800))).toBe('1 800 ₽')
  })

  it('не трогает трёхзначные суммы', () => {
    expect(plain(formatPrice(500))).toBe('500 ₽')
  })

  it('справляется с пятизначными суммами', () => {
    expect(plain(formatPrice(50000))).toBe('50 000 ₽')
  })
})

describe('formatWeight', () => {
  it('подписывает килограммы', () => {
    expect(plain(formatWeight(90))).toBe('90 кг')
  })
})

describe('plural', () => {
  const forms = ['позиция', 'позиции', 'позиций']

  it('берёт первую форму для единицы', () => {
    expect(plural(1, forms)).toBe('позиция')
    expect(plural(21, forms)).toBe('позиция')
  })

  it('берёт вторую форму для двух, трёх и четырёх', () => {
    expect(plural(3, forms)).toBe('позиции')
    expect(plural(22, forms)).toBe('позиции')
  })

  it('берёт третью форму для пяти и больше', () => {
    expect(plural(7, forms)).toBe('позиций')
    expect(plural(0, forms)).toBe('позиций')
  })

  it('берёт третью форму для одиннадцати — четырнадцати', () => {
    expect(plural(11, forms)).toBe('позиций')
    expect(plural(12, forms)).toBe('позиций')
    expect(plural(14, forms)).toBe('позиций')
  })
})

describe('formatMatches', () => {
  it('согласует глагол и существительное', () => {
    expect(plain(formatMatches(1, 24))).toBe('Подошла 1 позиция из 24')
    expect(plain(formatMatches(3, 24))).toBe('Подошли 3 позиции из 24')
    expect(plain(formatMatches(7, 24))).toBe('Подошло 7 позиций из 24')
    expect(plain(formatMatches(11, 24))).toBe('Подошло 11 позиций из 24')
    expect(plain(formatMatches(21, 24))).toBe('Подошла 21 позиция из 24')
  })

  it('отдельно говорит про пустой результат', () => {
    expect(formatMatches(0, 24)).toBe('Ничего не подошло')
  })
})
