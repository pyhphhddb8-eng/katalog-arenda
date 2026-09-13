// Коэффициент — множитель к цене за сутки. Чем длиннее срок, тем он ниже:
// в этом и состоит выгода, которую показывает переключатель срока.
export const RENT_TERMS = [
  { id: 'day', label: 'Сутки', days: 1, rate: 1 },
  { id: 'three', label: '3 дня', days: 3, rate: 0.9 },
  { id: 'week', label: 'Неделя', days: 7, rate: 0.75 },
]

export const DEFAULT_TERM_ID = 'day'
