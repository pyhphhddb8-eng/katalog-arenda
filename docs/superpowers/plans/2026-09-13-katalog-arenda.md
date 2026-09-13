# Каталог с подбором по параметрам — план работ

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Собрать демо-модуль каталога аренды строительного инструмента с подбором по нескольким группам параметров, диапазоном цены, сортировкой и пересчётом цен по сроку аренды, и выложить его на GitHub Pages.

**Architecture:** Данные позиций лежат отдельным файлом-списком. Отбор, счётчики и расчёт цены — чистые функции без React, они покрыты тестами Vitest и запускаются без браузера. React-компоненты только читают эти функции и рисуют результат. Состояние подбора — один объект, который двусторонне связан с адресной строкой.

**Tech Stack:** React 19, Vite 7, Tailwind CSS 4 (плагин `@tailwindcss/vite`, без `tailwind.config.js`), Vitest 3. Никаких UI-библиотек: окно позиции делается на нативном `<dialog>`, который сам даёт Esc, ловушку фокуса и возврат фокуса.

**Spec:** `docs/superpowers/specs/2026-09-13-katalog-arenda-design.md`

## Global Constraints

- Язык интерфейса — русский. Кавычки «ёлочки», тире — длинное (—), цена пишется как `1 800 ₽` (неразрывный пробел между разрядами, символ рубля).
- 24 позиции, ровно пять типов: `compaction`, `concrete`, `power`, `height`, `hand`.
- Три варианта питания: `petrol`, `mains`, `battery`. Позиции без питания (леса, вышки, лестницы) имеют `power: 'none'` и не попадают в отбор ни при одном отмеченном варианте питания. Четвёртого чекбокса в группе «Питание» нет.
- Три весовых диапазона, границы включаются снизу: `light` — вес ≤ 50, `medium` — 50 < вес ≤ 100, `heavy` — вес > 100.
- Три срока аренды: `day` (1 день), `three` (3 дня), `week` (7 дней). Коэффициенты живут в данных, а не в коде.
- Между группами фильтров условие «и», внутри группы — «или».
- Кнопки «Применить» нет: любое изменение фильтра пересчитывает список сразу.
- Базовый путь Vite — относительный (`base: './'`), сайт живёт в подпапке `/katalog-arenda/`.
- Сборка кладётся в `docs/`, но `docs/superpowers/` стирать нельзя: там лежат спека и этот план. Поэтому `emptyOutDir: false`, а старые ассеты чистятся точечно.
- На странице обязана быть видимая надпись, что позиции и цены условные, а модуль — демонстрационный.
- Контраст текста к фону — не ниже 4,5 по WCAG. На ширине 360 px горизонтальной прокрутки быть не должно.
- Ни формы заявки, ни корзины, ни сбора персональных данных — это сознательно вынесено в другую работу портфолио.
- Коммиты на русском, в повелительном наклонении, по одному на задачу. Ветка `main`.

---

## Устройство файлов

| Файл | За что отвечает |
| --- | --- |
| `index.html` | Корневой документ, `lang="ru"`, заголовок вкладки, описание. |
| `vite.config.js` | Плагины React и Tailwind, `base: './'`, сборка в `docs/`, настройки Vitest. |
| `package.json` | Зависимости и команды `dev`, `build`, `preview`, `test`. |
| `src/main.jsx` | Точка входа React. |
| `src/index.css` | Подключение Tailwind и переменные темы. |
| `src/App.jsx` | Держит состояние подбора, связывает его с адресом, раскладывает экран. |
| `src/data/tools.js` | 24 позиции и справочники типов, питания, весовых диапазонов. |
| `src/data/rentTerms.js` | Сроки аренды и коэффициенты цены. |
| `src/lib/pricing.js` | Расчёт цены за срок. Чистые функции, про React не знает. |
| `src/lib/filter.js` | Отбор, сортировка, счётчики у чекбоксов, подсказки при пустом результате. Чистые функции. |
| `src/lib/urlState.js` | Состояние подбора ↔ строка запроса. Чистые функции. |
| `src/lib/format.js` | Форматирование цены и веса для показа. |
| `src/components/FilterPanel.jsx` | Вся панель фильтров целиком. |
| `src/components/CheckboxGroup.jsx` | Одна группа чекбоксов со счётчиками. |
| `src/components/PriceRange.jsx` | Диапазон цены двумя ползунками. |
| `src/components/DeliveryToggle.jsx` | Переключатель «только с доставкой». |
| `src/components/SortSelect.jsx` | Выбор сортировки. |
| `src/components/TermSwitch.jsx` | Переключатель срока аренды. |
| `src/components/ToolCard.jsx` | Карточка позиции в сетке. |
| `src/components/ToolGrid.jsx` | Сетка карточек и счётчик «подошло N из 24». |
| `src/components/ToolDialog.jsx` | Окно позиции на нативном `<dialog>`. |
| `src/components/EmptyState.jsx` | Экран «ничего не нашлось» с объяснением и сбросом. |
| `src/components/FilterDrawer.jsx` | Обёртка фильтров для планшета и телефона. |

Тесты лежат рядом с кодом: `src/lib/pricing.test.js`, `src/lib/filter.test.js`, `src/lib/urlState.test.js`, `src/data/tools.test.js`.

---

## Задача 1: Каркас проекта

**Files:**
- Create: `package.json`, `vite.config.js`, `index.html`, `.gitignore`, `src/main.jsx`, `src/App.jsx`, `src/index.css`

**Interfaces:**
- Consumes: ничего.
- Produces: рабочие команды `npm run dev`, `npm run build`, `npm test`; компонент `App` по умолчанию из `src/App.jsx`.

- [ ] **Шаг 1: Завести проект и поставить зависимости**

```bash
cd ~/Progects/katalog-arenda
npm create vite@latest . -- --template react
npm install
npm install -D tailwindcss @tailwindcss/vite vitest
```

`npm create vite` в непустой папке спросит подтверждение — выбрать вариант, который не стирает существующие файлы («Ignore files and continue»). Если он всё же удалил `README.md` или `docs/`, вернуть их: `git checkout -- README.md docs`.

- [ ] **Шаг 2: Настроить Vite**

Заменить `vite.config.js` целиком:

```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  base: './',
  plugins: [react(), tailwindcss()],
  build: {
    outDir: 'docs',
    emptyOutDir: false,
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.js'],
  },
})
```

`emptyOutDir: false` здесь обязателен: в `docs/` лежат спека и план, и обычная сборка Vite стёрла бы их.

- [ ] **Шаг 3: Прописать команды**

В `package.json` заменить блок `scripts` на:

```json
"scripts": {
  "dev": "vite",
  "build": "rm -rf docs/assets && vite build",
  "preview": "vite preview",
  "test": "vitest run",
  "test:watch": "vitest"
}
```

Чистится только `docs/assets` — там лежат сборочные файлы Vite с хэшами в именах, которые иначе копились бы от сборки к сборке. `docs/superpowers` остаётся нетронутой.

- [ ] **Шаг 4: Подключить Tailwind**

`src/index.css` целиком:

```css
@import "tailwindcss";

@theme {
  --color-ink: #16181d;
  --color-muted: #5b6270;
  --color-line: #e3e6ec;
  --color-surface: #ffffff;
  --color-canvas: #f6f7f9;
  --color-accent: #a34a08;
  --color-accent-soft: #fdf1e6;
}

html {
  scroll-behavior: smooth;
}

body {
  background: var(--color-canvas);
  color: var(--color-ink);
}
```

Палитра подобрана под норму контраста 4,5. Акцент `#a34a08` даёт на белом около 5,9, на плашке `#fdf1e6` — около 5,3; серый `#5b6270` на фоне страницы — около 5,7. Все восемь встречающихся сочетаний «текст на фоне» закрепляются тестом в задаче 15, чтобы правка палитры не сломала доступность молча.

Удалить `src/App.css` — он не нужен.

- [ ] **Шаг 4: Заготовка страницы**

`index.html` — поправить голову документа:

```html
<!doctype html>
<html lang="ru">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Каталог аренды строительного инструмента — демо-модуль</title>
    <meta name="description" content="Демонстрационный модуль каталога: подбор инструмента по типу, питанию, весу и цене, пересчёт стоимости по сроку аренды." />
    <meta name="robots" content="noindex" />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

`noindex` стоит потому, что это демо с условными ценами: в поиске ему делать нечего.

`src/main.jsx`:

```jsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
```

`src/App.jsx`:

```jsx
export default function App() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-3xl font-semibold">Аренда строительного инструмента</h1>
    </main>
  )
}
```

- [ ] **Шаг 5: Проверить, что всё поднимается**

Run: `npm run dev`
Expected: Vite печатает адрес `http://localhost:5173/`, страница открывается с заголовком, консоль браузера чистая. Остановить сервер по Ctrl+C.

Run: `npm test`
Expected: Vitest сообщает `No test files found` и завершается — это нормально, тестов ещё нет.

- [ ] **Шаг 6: Коммит**

```bash
git add -A
git commit -m "Каркас: Vite, React, Tailwind, Vitest"
```

---

## Задача 2: Данные позиций и справочники

**Files:**
- Create: `src/data/tools.js`, `src/data/rentTerms.js`, `src/data/tools.test.js`

**Interfaces:**
- Consumes: ничего.
- Produces:
  - `TYPES: {id, label}[]` — пять типов;
  - `POWER_SOURCES: {id, label}[]` — три варианта питания;
  - `WEIGHT_BANDS: {id, label, test(weight) => boolean}[]` — три диапазона;
  - `TOOLS: Tool[]`, где `Tool = {id, name, type, power, weight, pricePerDay, deposit, delivery, includes: string[], bringYourOwn: string[]}`;
  - `RENT_TERMS: {id, label, days, rate}[]`, `DEFAULT_TERM_ID = 'day'`.

- [ ] **Шаг 1: Написать падающий тест целостности данных**

`src/data/tools.test.js`:

```js
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
      expect(TOOLS.some((t) => band.test(t.weight))) .toBe(true)
    }
  })

  it('относят каждую позицию ровно к одному весовому диапазону', () => {
    for (const tool of TOOLS) {
      const hit = WEIGHT_BANDS.filter((b) => b.test(tool.weight))
      expect(hit).toHaveLength(1)
    }
  })
})
```

- [ ] **Шаг 2: Запустить тест и убедиться, что он падает**

Run: `npm test`
Expected: FAIL — `Failed to resolve import "./tools.js"`.

- [ ] **Шаг 3: Написать справочники и позиции**

`src/data/tools.js`:

```js
export const TYPES = [
  { id: 'compaction', label: 'Уплотнение грунта' },
  { id: 'concrete', label: 'Бетон' },
  { id: 'power', label: 'Питание' },
  { id: 'height', label: 'Высота' },
  { id: 'hand', label: 'Ручной инструмент' },
]

export const POWER_SOURCES = [
  { id: 'petrol', label: 'Бензин' },
  { id: 'mains', label: 'Сеть 220 В' },
  { id: 'battery', label: 'Аккумулятор' },
]

// Границы включаются снизу: 50 кг — это ещё «до 50», 100 кг — ещё «50–100».
export const WEIGHT_BANDS = [
  { id: 'light', label: 'До 50 кг', test: (w) => w <= 50 },
  { id: 'medium', label: '50–100 кг', test: (w) => w > 50 && w <= 100 },
  { id: 'heavy', label: 'Больше 100 кг', test: (w) => w > 100 },
]

export const TOOLS = [
  {
    id: 'wp1550',
    name: 'Виброплита Wacker Neuson WP1550',
    type: 'compaction',
    power: 'petrol',
    weight: 90,
    pricePerDay: 1800,
    deposit: 20000,
    delivery: true,
    includes: ['Бак заправлен', 'Поливочный бак для асфальта', 'Инструктаж на выдаче'],
    bringYourOwn: ['Бензин АИ-92 на смену', 'Перчатки и защитные наушники'],
  },
  {
    id: 'cnp20',
    name: 'Виброплита Zitrek CNP 20',
    type: 'compaction',
    power: 'petrol',
    weight: 62,
    pricePerDay: 1200,
    deposit: 12000,
    delivery: true,
    includes: ['Бак заправлен', 'Транспортировочные колёса'],
    bringYourOwn: ['Бензин АИ-92 на смену', 'Защитные наушники'],
  },
  {
    id: 'ms330',
    name: 'Виброплита реверсивная Masalta MS330',
    type: 'compaction',
    power: 'petrol',
    weight: 320,
    pricePerDay: 4500,
    deposit: 50000,
    delivery: true,
    includes: ['Бак заправлен', 'Пульт дистанционного управления', 'Погрузка и разгрузка'],
    bringYourOwn: ['Бензин АИ-92 на смену', 'Двое рабочих на разгрузку, если без нашей доставки'],
  },
  {
    id: 'bs60',
    name: 'Вибротрамбовка Wacker Neuson BS60-4',
    type: 'compaction',
    power: 'petrol',
    weight: 68,
    pricePerDay: 2200,
    deposit: 25000,
    delivery: true,
    includes: ['Бак заправлен', 'Комплект масла для двухтактной смеси'],
    bringYourOwn: ['Бензин АИ-92 на смену', 'Защитные наушники и перчатки'],
  },
  {
    id: 'cnp10e',
    name: 'Виброплита электрическая Zitrek CNP 10-1',
    type: 'compaction',
    power: 'mains',
    weight: 48,
    pricePerDay: 900,
    deposit: 9000,
    delivery: true,
    includes: ['Кабель 5 м', 'Транспортировочные колёса'],
    bringYourOwn: ['Удлинитель с заземлением', 'Защитные наушники'],
  },
  {
    id: 'zbr132',
    name: 'Бетономешалка Zitrek ZBR 132',
    type: 'concrete',
    power: 'mains',
    weight: 52,
    pricePerDay: 600,
    deposit: 6000,
    delivery: true,
    includes: ['Кабель 3 м', 'Комплект ключей для сборки'],
    bringYourOwn: ['Удлинитель с заземлением', 'Лопата и вёдра'],
  },
  {
    id: 'ecm200',
    name: 'Бетономешалка Prorab ECM 200',
    type: 'concrete',
    power: 'mains',
    weight: 98,
    pricePerDay: 900,
    deposit: 9000,
    delivery: true,
    includes: ['Кабель 3 м', 'Разборная станина'],
    bringYourOwn: ['Удлинитель с заземлением', 'Лопата и вёдра'],
  },
  {
    id: 'mve1500',
    name: 'Глубинный вибратор Masalta MVE-1500',
    type: 'concrete',
    power: 'mains',
    weight: 12,
    pricePerDay: 700,
    deposit: 7000,
    delivery: false,
    includes: ['Гибкий вал 4 м', 'Булава 38 мм'],
    bringYourOwn: ['Удлинитель с заземлением', 'Перчатки'],
  },
  {
    id: 'vbg15',
    name: 'Глубинный вибратор бензиновый Vektor VBG-1.5',
    type: 'concrete',
    power: 'petrol',
    weight: 34,
    pricePerDay: 1400,
    deposit: 15000,
    delivery: true,
    includes: ['Бак заправлен', 'Гибкий вал 6 м', 'Булава 50 мм'],
    bringYourOwn: ['Бензин АИ-92 на смену', 'Перчатки'],
  },
  {
    id: 'mcd4',
    name: 'Виброрейка Masalta MCD-4',
    type: 'concrete',
    power: 'petrol',
    weight: 21,
    pricePerDay: 1600,
    deposit: 18000,
    delivery: false,
    includes: ['Бак заправлен', 'Профиль 2 м'],
    bringYourOwn: ['Бензин АИ-92 на смену', 'Второй человек на длинный профиль'],
  },
  {
    id: 'dy6500',
    name: 'Генератор Huter DY6500L',
    type: 'power',
    power: 'petrol',
    weight: 78,
    pricePerDay: 1500,
    deposit: 15000,
    delivery: true,
    includes: ['Бак заправлен', 'Масло залито', 'Колёсный комплект'],
    bringYourOwn: ['Бензин АИ-92 на смену', 'Навес от дождя'],
  },
  {
    id: 'bs3300',
    name: 'Генератор Fubag BS 3300',
    type: 'power',
    power: 'petrol',
    weight: 46,
    pricePerDay: 1100,
    deposit: 11000,
    delivery: true,
    includes: ['Бак заправлен', 'Масло залито'],
    bringYourOwn: ['Бензин АИ-92 на смену', 'Навес от дождя'],
  },
  {
    id: 'hhy10000',
    name: 'Генератор Hyundai HHY 10000FE',
    type: 'power',
    power: 'petrol',
    weight: 148,
    pricePerDay: 3200,
    deposit: 35000,
    delivery: true,
    includes: ['Бак заправлен', 'Электростартер и аккумулятор', 'Погрузка и разгрузка'],
    bringYourOwn: ['Бензин АИ-92 на смену', 'Навес от дождя'],
  },
  {
    id: 'delta2',
    name: 'Зарядная станция EcoFlow Delta 2',
    type: 'power',
    power: 'battery',
    weight: 12,
    pricePerDay: 1900,
    deposit: 40000,
    delivery: false,
    includes: ['Кабель для зарядки от сети', 'Сумка-чехол'],
    bringYourOwn: ['Розетка поблизости для подзарядки', 'Сухое место для хранения'],
  },
  {
    id: 'vsr412',
    name: 'Вышка-тура ВСР-4/12, рабочая высота 5,7 м',
    type: 'height',
    power: 'none',
    weight: 62,
    pricePerDay: 800,
    deposit: 12000,
    delivery: true,
    includes: ['Настилы и ограждения', 'Колёса с тормозами', 'Схема сборки'],
    bringYourOwn: ['Двое рабочих на сборку', 'Каска'],
  },
  {
    id: 'vsr420',
    name: 'Вышка-тура ВСР-4/20, рабочая высота 9,7 м',
    type: 'height',
    power: 'none',
    weight: 104,
    pricePerDay: 1300,
    deposit: 20000,
    delivery: true,
    includes: ['Настилы и ограждения', 'Стабилизаторы', 'Схема сборки'],
    bringYourOwn: ['Двое рабочих на сборку', 'Каска и страховочная привязь'],
  },
  {
    id: 'lrsp40',
    name: 'Леса рамные ЛРСП-40, 10 м²',
    type: 'height',
    power: 'none',
    weight: 180,
    pricePerDay: 500,
    deposit: 10000,
    delivery: true,
    includes: ['Рамы, диагонали, настилы', 'Крепёж', 'Схема сборки'],
    bringYourOwn: ['Двое рабочих на сборку', 'Ровная площадка под опоры'],
  },
  {
    id: 'alumet44',
    name: 'Лестница-трансформер Alumet 4×4',
    type: 'height',
    power: 'none',
    weight: 18,
    pricePerDay: 350,
    deposit: 5000,
    delivery: false,
    includes: ['Резиновые башмаки', 'Фиксаторы секций'],
    bringYourOwn: ['Машина с длинным багажником', 'Каска'],
  },
  {
    id: 'pm500',
    name: 'Подъёмник мачтовый ПМ-500',
    type: 'height',
    power: 'mains',
    weight: 240,
    pricePerDay: 2800,
    deposit: 40000,
    delivery: true,
    includes: ['Монтаж и демонтаж силами компании', 'Кабель 10 м', 'Инструктаж'],
    bringYourOwn: ['Линия 220 В с заземлением', 'Ровная площадка под опоры'],
  },
  {
    id: 'gbh226',
    name: 'Перфоратор Bosch GBH 2-26',
    type: 'hand',
    power: 'mains',
    weight: 3,
    pricePerDay: 400,
    deposit: 6000,
    delivery: false,
    includes: ['Кейс', 'Буры SDS-plus 8, 10, 12 мм', 'Боковая рукоятка'],
    bringYourOwn: ['Удлинитель', 'Очки и респиратор'],
  },
  {
    id: 'hr4013',
    name: 'Перфоратор Makita HR4013C SDS-max',
    type: 'hand',
    power: 'mains',
    weight: 8,
    pricePerDay: 750,
    deposit: 12000,
    delivery: false,
    includes: ['Кейс', 'Бур SDS-max 20 мм', 'Пика'],
    bringYourOwn: ['Удлинитель', 'Очки, респиратор, наушники'],
  },
  {
    id: 'hm1307',
    name: 'Отбойный молоток Makita HM1307CB',
    type: 'hand',
    power: 'mains',
    weight: 17,
    pricePerDay: 1100,
    deposit: 18000,
    delivery: true,
    includes: ['Пика и лопатка', 'Тележка для переноски'],
    bringYourOwn: ['Удлинитель с заземлением', 'Очки, респиратор, наушники'],
  },
  {
    id: 'gnf35',
    name: 'Штроборез Bosch GNF 35 CA',
    type: 'hand',
    power: 'mains',
    weight: 5,
    pricePerDay: 900,
    deposit: 14000,
    delivery: false,
    includes: ['Два алмазных диска', 'Кейс', 'Патрубок под пылесос'],
    bringYourOwn: ['Строительный пылесос', 'Очки и респиратор'],
  },
  {
    id: 'dhr243',
    name: 'Перфоратор аккумуляторный Makita DHR243',
    type: 'hand',
    power: 'battery',
    weight: 4,
    pricePerDay: 850,
    deposit: 13000,
    delivery: false,
    includes: ['Два аккумулятора 5 А·ч', 'Зарядное устройство', 'Кейс'],
    bringYourOwn: ['Розетка для зарядки', 'Очки и респиратор'],
  },
]
```

`src/data/rentTerms.js`:

```js
// Коэффициент — множитель к цене за сутки. Чем длиннее срок, тем он ниже:
// в этом и состоит выгода, которую показывает переключатель срока.
export const RENT_TERMS = [
  { id: 'day', label: 'Сутки', days: 1, rate: 1 },
  { id: 'three', label: '3 дня', days: 3, rate: 0.9 },
  { id: 'week', label: 'Неделя', days: 7, rate: 0.75 },
]

export const DEFAULT_TERM_ID = 'day'
```

- [ ] **Шаг 4: Запустить тест и убедиться, что он проходит**

Run: `npm test`
Expected: PASS, 10 тестов в `src/data/tools.test.js`.

- [ ] **Шаг 5: Коммит**

```bash
git add src/data
git commit -m "Данные: 24 позиции, справочники параметров и сроки аренды"
```

---

## Задача 3: Расчёт цены по сроку

**Files:**
- Create: `src/lib/pricing.js`, `src/lib/pricing.test.js`

**Interfaces:**
- Consumes: `RENT_TERMS`, `DEFAULT_TERM_ID` из `src/data/rentTerms.js`; поле `pricePerDay` у позиции.
- Produces:
  - `termById(termId) => Term` — падает обратно на срок по умолчанию, если id неизвестен;
  - `priceForTerm(tool, termId) => number` — цена за весь срок, округлённая до десятков рублей;
  - `pricePerDayForTerm(tool, termId) => number` — цена за сутки внутри срока;
  - `savingForTerm(tool, termId) => number` — сколько экономит срок против такого же числа отдельных суток, `0` для срока в один день.

- [ ] **Шаг 1: Написать падающие тесты**

`src/lib/pricing.test.js`:

```js
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
```

- [ ] **Шаг 2: Запустить тесты и убедиться, что они падают**

Run: `npm test`
Expected: FAIL — `Failed to resolve import "./pricing.js"`.

- [ ] **Шаг 3: Написать реализацию**

`src/lib/pricing.js`:

```js
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
```

- [ ] **Шаг 4: Запустить тесты и убедиться, что они проходят**

Run: `npm test`
Expected: PASS, все тесты в `pricing.test.js` и `tools.test.js`.

- [ ] **Шаг 5: Коммит**

```bash
git add src/lib/pricing.js src/lib/pricing.test.js
git commit -m "Расчёт цены по сроку аренды"
```

---

## Задача 4: Отбор и сортировка

**Files:**
- Create: `src/lib/filter.js`, `src/lib/filter.test.js`

**Interfaces:**
- Consumes: `TYPES`, `POWER_SOURCES`, `WEIGHT_BANDS` из `src/data/tools.js`.
- Produces:
  - `GROUPS: {key, label, options, matches(tool, optionId)}[]` — три группы чекбоксов; `key` совпадает с полем состояния;
  - `SORTS: {id, label, compare}[]`, `DEFAULT_SORT_ID = 'price-asc'`;
  - `priceBounds(tools) => {min, max}`;
  - `emptyState(bounds) => State`, где `State = {types: string[], powers: string[], weights: string[], price: [number, number], deliveryOnly: boolean, sort: string}`;
  - `matchesTool(tool, state) => boolean`;
  - `selectTools(tools, state) => Tool[]`;
  - `toggleOption(state, groupKey, optionId) => State`.

- [ ] **Шаг 1: Написать падающие тесты отбора**

`src/lib/filter.test.js`:

```js
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
```

- [ ] **Шаг 2: Запустить тесты и убедиться, что они падают**

Run: `npm test`
Expected: FAIL — `Failed to resolve import "./filter.js"`.

- [ ] **Шаг 3: Написать реализацию**

`src/lib/filter.js`:

```js
import { TYPES, POWER_SOURCES, WEIGHT_BANDS } from '../data/tools.js'

// Группа чекбоксов знает три вещи: где её отметки лежат в состоянии,
// как она называется на экране и как проверить одну позицию по одной отметке.
export const GROUPS = [
  {
    key: 'types',
    label: 'Тип',
    options: TYPES,
    matches: (tool, id) => tool.type === id,
  },
  {
    key: 'powers',
    label: 'Питание',
    options: POWER_SOURCES,
    matches: (tool, id) => tool.power === id,
  },
  {
    key: 'weights',
    label: 'Вес',
    options: WEIGHT_BANDS,
    matches: (tool, id) => {
      const band = WEIGHT_BANDS.find((b) => b.id === id)
      return band ? band.test(tool.weight) : false
    },
  },
]

const byName = (a, b) => a.name.localeCompare(b.name, 'ru')

export const SORTS = [
  { id: 'price-asc', label: 'Сначала дешевле', compare: (a, b) => a.pricePerDay - b.pricePerDay },
  { id: 'price-desc', label: 'Сначала дороже', compare: (a, b) => b.pricePerDay - a.pricePerDay },
  { id: 'weight-asc', label: 'Сначала легче', compare: (a, b) => a.weight - b.weight },
]

export const DEFAULT_SORT_ID = 'price-asc'

export function priceBounds(tools) {
  const prices = tools.map((t) => t.pricePerDay)
  return { min: Math.min(...prices), max: Math.max(...prices) }
}

export function emptyState(bounds) {
  return {
    types: [],
    powers: [],
    weights: [],
    price: [bounds.min, bounds.max],
    deliveryOnly: false,
    sort: DEFAULT_SORT_ID,
  }
}

function matchesGroup(tool, group, selected) {
  // Пустая группа ничего не требует. Непустая — «или» по своим отметкам.
  if (selected.length === 0) return true
  return selected.some((id) => group.matches(tool, id))
}

export function matchesTool(tool, state) {
  for (const group of GROUPS) {
    if (!matchesGroup(tool, group, state[group.key] ?? [])) return false
  }
  if (state.deliveryOnly && !tool.delivery) return false
  const [min, max] = state.price
  // Границы включаются: позиция ровно по цене отсечки в отбор попадает.
  if (tool.pricePerDay < min || tool.pricePerDay > max) return false
  return true
}

export function selectTools(tools, state) {
  const sort = SORTS.find((s) => s.id === state.sort) ?? SORTS[0]
  return tools
    .filter((tool) => matchesTool(tool, state))
    .sort((a, b) => sort.compare(a, b) || byName(a, b))
}

export function toggleOption(state, groupKey, optionId) {
  const current = state[groupKey] ?? []
  const next = current.includes(optionId)
    ? current.filter((id) => id !== optionId)
    : [...current, optionId]
  return { ...state, [groupKey]: next }
}
```

- [ ] **Шаг 4: Запустить тесты и убедиться, что они проходят**

Run: `npm test`
Expected: PASS.

- [ ] **Шаг 5: Коммит**

```bash
git add src/lib/filter.js src/lib/filter.test.js
git commit -m "Отбор по группам параметров и сортировка"
```

---

## Задача 5: Счётчики у чекбоксов, счёт активных фильтров и подсказки при пустом результате

**Files:**
- Modify: `src/lib/filter.js` — дописать в конец
- Modify: `src/lib/filter.test.js` — дописать в конец

**Interfaces:**
- Consumes: `GROUPS`, `matchesTool`, `selectTools`, `emptyState`, `priceBounds` из задачи 4.
- Produces:
  - `optionCount(tools, state, groupKey, optionId) => number` — сколько позиций даст эта отметка при нынешних условиях соседних групп;
  - `optionCounts(tools, state) => {types: Record<string, number>, powers: ..., weights: ...}`;
  - `activeFilterCount(state, bounds) => number`;
  - `resetFilters(state, bounds) => State` — сбрасывает все фильтры, сортировку оставляет;
  - `conflictHints(tools, state, bounds) => {key: string, label: string}[]` — какие условия мешают, перечислены по одному.

Счётчик считается так: берём нынешнее состояние, а в своей группе оставляем ровно
одну отметку — ту, у которой рисуем число. Соседние группы, цена и доставка
остаются как есть. Такой счёт закрывает обе формулировки спеки сразу:

- пока в группе ничего не отмечено, число равно длине списка после нажатия
  («считают то же, что покажет список»);
- когда в группе уже что-то отмечено, число равно прибавке к списку
  («сколько позиций он добавит к текущему отбору»).

Второе верно потому, что внутри каждой группы варианты взаимно исключают друг
друга: у позиции один тип, одно питание и один весовой диапазон. Оба равенства
проверяются тестом на настоящих данных, а не принимаются на веру.

Ноль у отметки означает, что жать бессмысленно, — ровно от этого тыканья спека и
избавляется.

- [ ] **Шаг 1: Дописать падающие тесты**

Добавить в конец `src/lib/filter.test.js`:

```js
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
```

- [ ] **Шаг 2: Запустить тесты и убедиться, что они падают**

Run: `npm test`
Expected: FAIL — `optionCount is not a function` (или сообщение о неразрешённом импорте).

- [ ] **Шаг 3: Дописать реализацию**

Добавить в конец `src/lib/filter.js`:

```js
export function optionCount(tools, state, groupKey, optionId) {
  // Своя группа считается так, будто в ней отмечена только эта опция.
  // Соседние группы, цена и доставка остаются как есть.
  const probe = { ...state, [groupKey]: [optionId] }
  return tools.filter((tool) => matchesTool(tool, probe)).length
}

export function optionCounts(tools, state) {
  const counts = {}
  for (const group of GROUPS) {
    counts[group.key] = {}
    for (const option of group.options) {
      counts[group.key][option.id] = optionCount(tools, state, group.key, option.id)
    }
  }
  return counts
}

function isPriceNarrowed(state, bounds) {
  return state.price[0] > bounds.min || state.price[1] < bounds.max
}

export function activeFilterCount(state, bounds) {
  let count = 0
  for (const group of GROUPS) count += (state[group.key] ?? []).length
  if (isPriceNarrowed(state, bounds)) count += 1
  if (state.deliveryOnly) count += 1
  return count
}

export function resetFilters(state, bounds) {
  return { ...emptyState(bounds), sort: state.sort }
}

export function conflictHints(tools, state, bounds) {
  if (selectTools(tools, state).length > 0) return []

  const candidates = [
    ...GROUPS.map((g) => ({
      key: g.key,
      label: g.label,
      relaxed: { ...state, [g.key]: [] },
      active: (state[g.key] ?? []).length > 0,
    })),
    {
      key: 'price',
      label: 'Цена за сутки',
      relaxed: { ...state, price: [bounds.min, bounds.max] },
      active: isPriceNarrowed(state, bounds),
    },
    {
      key: 'deliveryOnly',
      label: 'Только с доставкой',
      relaxed: { ...state, deliveryOnly: false },
      active: state.deliveryOnly,
    },
  ]

  // Показываем только те условия, снятие которых в одиночку вернёт результат.
  return candidates
    .filter((c) => c.active && selectTools(tools, c.relaxed).length > 0)
    .map(({ key, label }) => ({ key, label }))
}
```

- [ ] **Шаг 4: Запустить тесты и убедиться, что они проходят**

Run: `npm test`
Expected: PASS.

- [ ] **Шаг 5: Коммит**

```bash
git add src/lib/filter.js src/lib/filter.test.js
git commit -m "Счётчики у чекбоксов и подсказки при пустом отборе"
```

---

## Задача 6: Состояние подбора в адресе страницы

**Files:**
- Create: `src/lib/urlState.js`, `src/lib/urlState.test.js`

**Interfaces:**
- Consumes: `GROUPS`, `SORTS`, `DEFAULT_SORT_ID`, `emptyState` из `src/lib/filter.js`; `RENT_TERMS`, `DEFAULT_TERM_ID` из `src/data/rentTerms.js`.
- Produces:
  - `stateToSearch(state, term, bounds) => string` — строка запроса без ведущего `?`; всё, что совпадает с умолчанием, опускается;
  - `searchToState(search, bounds) => {state, term}` — разбор строки запроса; мусор и неизвестные значения молча игнорируются.

Ключи строки запроса: `t` — типы, `p` — питание, `w` — вес (списки через запятую), `price` — `мин-макс`, `d=1` — только с доставкой, `sort` — сортировка, `term` — срок аренды.

- [ ] **Шаг 1: Написать падающие тесты**

`src/lib/urlState.test.js`:

```js
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
    const { state } = searchToState(`price=0-999999`, bounds)
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
```

- [ ] **Шаг 2: Запустить тесты и убедиться, что они падают**

Run: `npm test`
Expected: FAIL — `Failed to resolve import "./urlState.js"`.

- [ ] **Шаг 3: Написать реализацию**

`src/lib/urlState.js`:

```js
import { GROUPS, SORTS, DEFAULT_SORT_ID, emptyState } from './filter.js'
import { RENT_TERMS, DEFAULT_TERM_ID } from '../data/rentTerms.js'

const PARAM_BY_GROUP = { types: 't', powers: 'p', weights: 'w' }

export function stateToSearch(state, term, bounds) {
  const params = new URLSearchParams()

  for (const group of GROUPS) {
    const selected = state[group.key] ?? []
    if (selected.length > 0) params.set(PARAM_BY_GROUP[group.key], selected.join(','))
  }

  const [min, max] = state.price
  if (min > bounds.min || max < bounds.max) params.set('price', `${min}-${max}`)

  if (state.deliveryOnly) params.set('d', '1')
  if (state.sort !== DEFAULT_SORT_ID) params.set('sort', state.sort)
  if (term !== DEFAULT_TERM_ID) params.set('term', term)

  return params.toString()
}

function readList(params, key, knownIds) {
  const raw = params.get(key)
  if (!raw) return []
  // Порядок сохраняем как в справочнике, чтобы сравнение состояний не зависело
  // от того, в каком порядке пользователь расставил отметки.
  const chosen = new Set(raw.split(','))
  return knownIds.filter((id) => chosen.has(id))
}

function readPrice(params, bounds) {
  const raw = params.get('price')
  if (!raw) return [bounds.min, bounds.max]
  const parts = raw.split('-').map((n) => Number.parseInt(n, 10))
  if (parts.length !== 2 || parts.some(Number.isNaN)) return [bounds.min, bounds.max]
  const lo = Math.max(bounds.min, Math.min(parts[0], parts[1]))
  const hi = Math.min(bounds.max, Math.max(parts[0], parts[1]))
  return [lo, hi]
}

export function searchToState(search, bounds) {
  const params = new URLSearchParams(search.startsWith('?') ? search.slice(1) : search)
  const state = emptyState(bounds)

  for (const group of GROUPS) {
    state[group.key] = readList(
      params,
      PARAM_BY_GROUP[group.key],
      group.options.map((o) => o.id),
    )
  }

  state.price = readPrice(params, bounds)
  state.deliveryOnly = params.get('d') === '1'

  const sort = params.get('sort')
  state.sort = SORTS.some((s) => s.id === sort) ? sort : DEFAULT_SORT_ID

  const term = params.get('term')
  const knownTerm = RENT_TERMS.some((t) => t.id === term) ? term : DEFAULT_TERM_ID

  return { state, term: knownTerm }
}
```

- [ ] **Шаг 4: Запустить тесты и убедиться, что они проходят**

Run: `npm test`
Expected: PASS. Всего четыре файла тестов.

- [ ] **Шаг 5: Коммит**

```bash
git add src/lib/urlState.js src/lib/urlState.test.js
git commit -m "Состояние подбора в строке запроса"
```

---

## Задача 7: Сетка карточек и переключатель срока

**Files:**
- Create: `src/lib/format.js`, `src/lib/format.test.js`, `src/components/ToolGlyph.jsx`, `src/components/ToolCard.jsx`, `src/components/ToolGrid.jsx`, `src/components/TermSwitch.jsx`
- Modify: `src/data/tools.js` — дописать в конец
- Modify: `src/App.jsx` — заменить целиком

**Interfaces:**
- Consumes: `TOOLS`, `selectTools`, `emptyState`, `priceBounds` из задач 2 и 4; `priceForTerm`, `pricePerDayForTerm`, `savingForTerm`, `termById` из задачи 3.
- Produces:
  - `formatPrice(value) => string`, `formatWeight(value) => string`, `plural(n, [one, few, many]) => string`, `formatMatches(shown, total) => string` из `src/lib/format.js`;
  - `typeLabel(id) => string`, `powerLabel(id) => string` из `src/data/tools.js`;
  - `<ToolGlyph type={string} />`, `<ToolCard tool={Tool} term={string} onOpen={(tool) => void} />`, `<ToolGrid tools={Tool[]} total={number} term={string} onOpen={fn} />`, `<TermSwitch value={string} onChange={(termId) => void} />`.

- [ ] **Шаг 1: Написать падающие тесты форматирования**

`src/lib/format.test.js`:

```js
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
```

- [ ] **Шаг 2: Запустить тесты и убедиться, что они падают**

Run: `npm test`
Expected: FAIL — `Failed to resolve import "./format.js"`.

- [ ] **Шаг 3: Написать форматирование**

`src/lib/format.js`:

```js
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
```

- [ ] **Шаг 4: Запустить тесты и убедиться, что они проходят**

Run: `npm test`
Expected: PASS.

- [ ] **Шаг 5: Дописать подписи в справочники**

Добавить в конец `src/data/tools.js`:

```js
export function typeLabel(id) {
  return TYPES.find((t) => t.id === id)?.label ?? ''
}

export function powerLabel(id) {
  if (id === 'none') return 'Питание не нужно'
  return POWER_SOURCES.find((p) => p.id === id)?.label ?? ''
}
```

- [ ] **Шаг 6: Нарисовать заглушки вместо фотографий**

Фотографий инструмента нет, и ставить чужие нельзя. Вместо серых прямоугольников — простой знак по типу позиции, нарисованный кодом.

`src/components/ToolGlyph.jsx`:

```jsx
const SHAPES = {
  compaction: (
    <>
      <rect x="14" y="16" width="36" height="18" rx="3" />
      <path d="M12 42h40M16 50h32" />
    </>
  ),
  concrete: (
    <>
      <path d="M20 18h24l-6 24H26z" />
      <path d="M32 42v8M24 50h16" />
    </>
  ),
  power: (
    <>
      <circle cx="32" cy="32" r="17" />
      <path d="M34 21l-9 14h7l-2 10 9-14h-7z" />
    </>
  ),
  height: (
    <>
      <path d="M22 14v36M42 14v36" />
      <path d="M22 24h20M22 32h20M22 40h20" />
    </>
  ),
  hand: (
    <>
      <rect x="18" y="16" width="28" height="10" rx="2" />
      <path d="M32 26v22" />
      <path d="M27 48h10l-5 6z" />
    </>
  ),
}

export default function ToolGlyph({ type }) {
  return (
    <svg
      viewBox="0 0 64 64"
      aria-hidden="true"
      className="h-16 w-16 stroke-accent"
      fill="none"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {SHAPES[type] ?? SHAPES.hand}
    </svg>
  )
}
```

`aria-hidden` стоит потому, что знак ничего не сообщает сверх названия позиции рядом: программе чтения с экрана он только мешал бы.

- [ ] **Шаг 7: Написать карточку**

`src/components/ToolCard.jsx`:

```jsx
import ToolGlyph from './ToolGlyph.jsx'
import { typeLabel, powerLabel } from '../data/tools.js'
import { formatPrice, formatWeight } from '../lib/format.js'
import { priceForTerm, pricePerDayForTerm, savingForTerm, termById } from '../lib/pricing.js'

export default function ToolCard({ tool, term, onOpen }) {
  const total = priceForTerm(tool, term)
  const perDay = pricePerDayForTerm(tool, term)
  const saving = savingForTerm(tool, term)
  const days = termById(term).days

  return (
    <article className="flex flex-col rounded-xl border border-line bg-surface p-5">
      <div className="mb-3 flex items-start justify-between gap-3">
        <ToolGlyph type={tool.type} />
        {tool.delivery && (
          <span className="rounded-full bg-accent-soft px-2.5 py-1 text-xs font-medium text-accent">
            Есть доставка
          </span>
        )}
      </div>

      <h3 className="text-base font-semibold leading-snug">{tool.name}</h3>

      <dl className="mt-3 space-y-1 text-sm text-muted">
        <div className="flex gap-2">
          <dt className="min-w-24">Тип</dt>
          <dd className="text-ink">{typeLabel(tool.type)}</dd>
        </div>
        <div className="flex gap-2">
          <dt className="min-w-24">Питание</dt>
          <dd className="text-ink">{powerLabel(tool.power)}</dd>
        </div>
        <div className="flex gap-2">
          <dt className="min-w-24">Вес</dt>
          <dd className="text-ink">{formatWeight(tool.weight)}</dd>
        </div>
      </dl>

      <div className="mt-4 border-t border-line pt-4">
        <p className="text-2xl font-semibold">{formatPrice(total)}</p>
        <p className="text-sm text-muted">
          за {days === 1 ? 'сутки' : `${days} дн.`}
          {days > 1 && <> · {formatPrice(perDay)} в сутки</>}
        </p>
        {saving > 0 && (
          <p className="mt-1 text-sm font-medium text-accent">
            Выгода {formatPrice(saving)} против отдельных суток
          </p>
        )}
      </div>

      <button
        type="button"
        onClick={() => onOpen(tool)}
        className="mt-4 rounded-lg border border-line px-4 py-2.5 text-sm font-medium transition hover:border-accent hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      >
        Условия аренды
      </button>
    </article>
  )
}
```

- [ ] **Шаг 7: Написать сетку**

`src/components/ToolGrid.jsx`:

```jsx
import ToolCard from './ToolCard.jsx'
import { formatMatches } from '../lib/format.js'

export default function ToolGrid({ tools, total, term, onOpen }) {
  return (
    <div>
      <p aria-live="polite" className="mb-4 text-sm font-medium text-muted">
        {formatMatches(tools.length, total)}
      </p>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {tools.map((tool) => (
          <ToolCard key={tool.id} tool={tool} term={term} onOpen={onOpen} />
        ))}
      </div>
    </div>
  )
}
```

`aria-live="polite"` нужен потому, что кнопки «Применить» нет: без него пользователь программы чтения с экрана не узнает, что список пересчитался.

- [ ] **Шаг 8: Написать переключатель срока**

`src/components/TermSwitch.jsx`:

```jsx
import { RENT_TERMS } from '../data/rentTerms.js'

export default function TermSwitch({ value, onChange }) {
  return (
    <fieldset>
      <legend className="mb-2 text-sm font-medium text-muted">Срок аренды</legend>
      <div className="inline-flex rounded-lg border border-line bg-surface p-1">
        {RENT_TERMS.map((term) => (
          <label
            key={term.id}
            className={`cursor-pointer rounded-md px-4 py-2 text-sm font-medium transition has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-accent ${
              value === term.id ? 'bg-accent text-white' : 'text-ink hover:text-accent'
            }`}
          >
            <input
              type="radio"
              name="term"
              value={term.id}
              checked={value === term.id}
              onChange={() => onChange(term.id)}
              className="sr-only"
            />
            {term.label}
          </label>
        ))}
      </div>
    </fieldset>
  )
}
```

Это именно радиокнопки, а не кнопки: так стрелки на клавиатуре переключают срок, как и ожидается от выбора одного из трёх.

- [ ] **Шаг 9: Собрать всё в App**

`src/App.jsx` целиком:

```jsx
import { useMemo, useState } from 'react'
import { TOOLS } from './data/tools.js'
import { DEFAULT_TERM_ID } from './data/rentTerms.js'
import { priceBounds, emptyState, selectTools } from './lib/filter.js'
import ToolGrid from './components/ToolGrid.jsx'
import TermSwitch from './components/TermSwitch.jsx'

export default function App() {
  const bounds = useMemo(() => priceBounds(TOOLS), [])
  const [state, setState] = useState(() => emptyState(bounds))
  const [term, setTerm] = useState(DEFAULT_TERM_ID)

  const shown = useMemo(() => selectTools(TOOLS, state), [state])

  return (
    <main className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="text-3xl font-semibold">Аренда строительного инструмента</h1>
      <div className="mt-6">
        <TermSwitch value={term} onChange={setTerm} />
      </div>
      <div className="mt-8">
        <ToolGrid tools={shown} total={TOOLS.length} term={term} onOpen={() => {}} />
      </div>
    </main>
  )
}
```

`setState` пока не вызывается — фильтров ещё нет. Он появится в задаче 8.

- [ ] **Шаг 10: Посмотреть глазами**

Run: `npm run dev`
Expected: 24 карточки в три колонки на широком экране, счётчик «Подошло 24 позиции из 24». Переключение срока на «Неделя» меняет цены на всех карточках сразу и добавляет строку выгоды. Консоль браузера чистая.

- [ ] **Шаг 11: Коммит**

```bash
git add src/lib/format.js src/lib/format.test.js src/components src/data/tools.js src/App.jsx
git commit -m "Сетка карточек, заглушки-знаки и переключатель срока"
```

---

## Задача 8: Панель фильтров

**Files:**
- Create: `src/components/CheckboxGroup.jsx`, `src/components/DeliveryToggle.jsx`, `src/components/SortSelect.jsx`, `src/components/FilterPanel.jsx`
- Modify: `src/App.jsx`

**Interfaces:**
- Consumes: `GROUPS`, `SORTS`, `toggleOption`, `optionCounts`, `activeFilterCount`, `resetFilters` из задач 4 и 5.
- Produces:
  - `<CheckboxGroup group={Group} selected={string[]} counts={Record<string, number>} onToggle={(optionId) => void} />`;
  - `<DeliveryToggle checked={boolean} onChange={(next) => void} />`;
  - `<SortSelect value={string} onChange={(sortId) => void} />`;
  - `<FilterPanel state={State} counts={Counts} bounds={Bounds} onChange={(nextState) => void} />`.

Ползунок цены встраивается в `FilterPanel` в задаче 9 — здесь под него оставляется место.

- [ ] **Шаг 1: Написать группу чекбоксов**

`src/components/CheckboxGroup.jsx`:

```jsx
export default function CheckboxGroup({ group, selected, counts, onToggle }) {
  return (
    <fieldset className="border-b border-line pb-5">
      <legend className="mb-3 text-sm font-semibold">{group.label}</legend>
      <div className="space-y-1">
        {group.options.map((option) => {
          const checked = selected.includes(option.id)
          const count = counts[option.id] ?? 0
          const dead = !checked && count === 0
          return (
            <label
              key={option.id}
              className={`flex cursor-pointer items-center gap-2.5 rounded-md px-2 py-1.5 text-sm has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-accent ${
                dead ? 'text-muted' : 'hover:bg-canvas'
              }`}
            >
              <input
                type="checkbox"
                checked={checked}
                onChange={() => onToggle(option.id)}
                className="h-4 w-4 shrink-0 accent-accent"
              />
              <span className="flex-1">{option.label}</span>
              <span className={`text-xs tabular-nums ${dead ? 'text-muted' : 'text-accent'}`}>
                {count}
              </span>
            </label>
          )
        })}
      </div>
    </fieldset>
  )
}
```

Число справа — сколько позиций даст эта отметка при нынешних условиях соседних групп. Ноль сразу виден и говорит, что жать бессмысленно: такая отметка приведёт к пустому списку.

- [ ] **Шаг 2: Написать переключатель доставки и выбор сортировки**

`src/components/DeliveryToggle.jsx`:

```jsx
export default function DeliveryToggle({ checked, onChange }) {
  return (
    <label className="flex cursor-pointer items-center gap-2.5 rounded-md px-2 py-1.5 text-sm hover:bg-canvas has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-accent">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="h-4 w-4 shrink-0 accent-accent"
      />
      <span>Только с доставкой</span>
    </label>
  )
}
```

`src/components/SortSelect.jsx`:

```jsx
import { SORTS } from '../lib/filter.js'

export default function SortSelect({ value, onChange }) {
  return (
    <label className="flex items-center gap-2 text-sm">
      <span className="text-muted">Сортировка</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="rounded-lg border border-line bg-surface px-3 py-2 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      >
        {SORTS.map((sort) => (
          <option key={sort.id} value={sort.id}>
            {sort.label}
          </option>
        ))}
      </select>
    </label>
  )
}
```

- [ ] **Шаг 3: Собрать панель**

`src/components/FilterPanel.jsx`:

```jsx
import { GROUPS, toggleOption, activeFilterCount, resetFilters } from '../lib/filter.js'
import CheckboxGroup from './CheckboxGroup.jsx'
import DeliveryToggle from './DeliveryToggle.jsx'

export default function FilterPanel({ state, counts, bounds, onChange }) {
  const active = activeFilterCount(state, bounds)

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Подбор</h2>
        {active > 0 && (
          <button
            type="button"
            onClick={() => onChange(resetFilters(state, bounds))}
            className="rounded-md px-2 py-1 text-sm font-medium text-accent underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            Сбросить всё
          </button>
        )}
      </div>

      {GROUPS.map((group) => (
        <CheckboxGroup
          key={group.key}
          group={group}
          selected={state[group.key]}
          counts={counts[group.key]}
          onToggle={(optionId) => onChange(toggleOption(state, group.key, optionId))}
        />
      ))}

      <div className="border-b border-line pb-5">
        <DeliveryToggle
          checked={state.deliveryOnly}
          onChange={(next) => onChange({ ...state, deliveryOnly: next })}
        />
      </div>
    </div>
  )
}
```

Кнопка «Сбросить всё» рисуется только когда `active > 0` — ровно как просит спека.

- [ ] **Шаг 4: Подключить панель к App**

Заменить `src/App.jsx` целиком:

```jsx
import { useMemo, useState } from 'react'
import { TOOLS } from './data/tools.js'
import { DEFAULT_TERM_ID } from './data/rentTerms.js'
import { priceBounds, emptyState, selectTools, optionCounts } from './lib/filter.js'
import FilterPanel from './components/FilterPanel.jsx'
import ToolGrid from './components/ToolGrid.jsx'
import TermSwitch from './components/TermSwitch.jsx'
import SortSelect from './components/SortSelect.jsx'

export default function App() {
  const bounds = useMemo(() => priceBounds(TOOLS), [])
  const [state, setState] = useState(() => emptyState(bounds))
  const [term, setTerm] = useState(DEFAULT_TERM_ID)

  const shown = useMemo(() => selectTools(TOOLS, state), [state])
  const counts = useMemo(() => optionCounts(TOOLS, state), [state])

  return (
    <main className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="text-3xl font-semibold">Аренда строительного инструмента</h1>

      <div className="mt-6 flex flex-wrap items-end justify-between gap-4">
        <TermSwitch value={term} onChange={setTerm} />
        <SortSelect value={state.sort} onChange={(sort) => setState({ ...state, sort })} />
      </div>

      <div className="mt-8 lg:grid lg:grid-cols-[17rem_1fr] lg:gap-8">
        <aside className="mb-8 rounded-xl border border-line bg-surface p-5 lg:mb-0 lg:self-start">
          <FilterPanel state={state} counts={counts} bounds={bounds} onChange={setState} />
        </aside>
        <ToolGrid tools={shown} total={TOOLS.length} term={term} onOpen={() => {}} />
      </div>
    </main>
  )
}
```

- [ ] **Шаг 5: Проверить руками**

Run: `npm run dev`

Проверить по пунктам:
- отметка «Бензин» сразу сокращает список, кнопка «Применить» не нужна;
- числа у чекбоксов меняются после каждой отметки;
- не трогая ничего, посмотреть на число у «Уплотнение грунта» и нажать — в списке оказывается ровно столько позиций;
- отметить «Бензин», посмотреть на число у «Уплотнение грунта», нажать — список вырастает ровно на это число;
- отметить «Высота» и «Бензин» — у части отметок появляются нули, и это те, что дали бы пустой список;
- появилась кнопка «Сбросить всё», она возвращает 24 позиции и исчезает;
- сортировка «Сначала дороже» переворачивает список;
- по Tab фокус проходит по всем чекбоксам и виден рамкой, пробел ставит и снимает отметку;
- консоль браузера чистая.

- [ ] **Шаг 6: Коммит**

```bash
git add src/components src/App.jsx
git commit -m "Панель фильтров со счётчиками и сбросом"
```

---

## Задача 9: Диапазон цены двумя ползунками

**Files:**
- Create: `src/components/PriceRange.jsx`
- Modify: `src/components/FilterPanel.jsx`

**Interfaces:**
- Consumes: `bounds` из `priceBounds`, поле `state.price`.
- Produces: `<PriceRange value={[number, number]} bounds={Bounds} onChange={([min, max]) => void} />`.

Два наложенных друг на друга `<input type="range">`: каждый доступен с клавиатуры сам по себе, стрелки двигают его на шаг, Home и End — к краям. Ползунки не проезжают друг сквозь друга: нижний не поднимается выше верхнего и наоборот.

- [ ] **Шаг 1: Написать компонент**

`src/components/PriceRange.jsx`:

```jsx
import { formatPrice } from '../lib/format.js'

const STEP = 50

export default function PriceRange({ value, bounds, onChange }) {
  const [min, max] = value
  const span = bounds.max - bounds.min
  const leftPercent = ((min - bounds.min) / span) * 100
  const rightPercent = ((max - bounds.min) / span) * 100

  const setMin = (next) => onChange([Math.min(next, max), max])
  const setMax = (next) => onChange([min, Math.max(next, min)])

  const sliderClass =
    'pointer-events-none absolute inset-x-0 top-0 h-6 w-full appearance-none bg-transparent ' +
    '[&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 ' +
    '[&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full ' +
    '[&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-accent ' +
    '[&::-webkit-slider-thumb]:bg-white [&::-moz-range-thumb]:pointer-events-auto ' +
    '[&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:rounded-full ' +
    '[&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-accent [&::-moz-range-thumb]:bg-white ' +
    'focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent'

  return (
    <fieldset className="border-b border-line pb-5">
      <legend className="mb-3 text-sm font-semibold">Цена за сутки</legend>

      <p className="mb-3 text-sm text-muted">
        от <span className="font-medium text-ink">{formatPrice(min)}</span> до{' '}
        <span className="font-medium text-ink">{formatPrice(max)}</span>
      </p>

      <div className="relative h-6">
        <div className="absolute inset-x-0 top-2.5 h-1 rounded-full bg-line" />
        <div
          className="absolute top-2.5 h-1 rounded-full bg-accent"
          style={{ left: `${leftPercent}%`, right: `${100 - rightPercent}%` }}
        />
        <input
          type="range"
          min={bounds.min}
          max={bounds.max}
          step={STEP}
          value={min}
          onChange={(event) => setMin(Number(event.target.value))}
          aria-label="Цена за сутки, от"
          className={sliderClass}
        />
        <input
          type="range"
          min={bounds.min}
          max={bounds.max}
          step={STEP}
          value={max}
          onChange={(event) => setMax(Number(event.target.value))}
          aria-label="Цена за сутки, до"
          className={sliderClass}
        />
      </div>
    </fieldset>
  )
}
```

`pointer-events-none` на самой дорожке и `pointer-events-auto` на кружке — так мышь всегда попадает в тот ползунок, за который тянет, а не в верхний по слою.

- [ ] **Шаг 2: Встроить в панель**

В `src/components/FilterPanel.jsx` добавить импорт:

```jsx
import PriceRange from './PriceRange.jsx'
```

И вставить между блоком `GROUPS.map(...)` и блоком доставки:

```jsx
      <PriceRange
        value={state.price}
        bounds={bounds}
        onChange={(price) => onChange({ ...state, price })}
      />
```

- [ ] **Шаг 3: Проверить руками**

Run: `npm run dev`

Проверить:
- обе ручки тянутся мышью, подпись «от … до …» идёт следом;
- список пересчитывается на ходу;
- ползунки не проезжают друг сквозь друга;
- Tab доводит фокус до каждой ручки, фокус виден, стрелки двигают её, Home и End прыгают к краям;
- как только диапазон сужен, появляется «Сбросить всё», и сброс раскрывает его обратно.

- [ ] **Шаг 4: Коммит**

```bash
git add src/components/PriceRange.jsx src/components/FilterPanel.jsx
git commit -m "Диапазон цены двумя ползунками"
```

---

## Задача 10: Экран «ничего не нашлось»

**Files:**
- Create: `src/components/EmptyState.jsx`
- Modify: `src/components/ToolGrid.jsx`

**Interfaces:**
- Consumes: `conflictHints`, `resetFilters` из задачи 5.
- Produces: `<EmptyState hints={{key, label}[]} onReset={() => void} />`.

Пустой экран без объяснения — тупик. Показываем, какие именно условия мешают, и даём выход.

- [ ] **Шаг 1: Написать компонент**

`src/components/EmptyState.jsx`:

```jsx
export default function EmptyState({ hints, onReset }) {
  return (
    <div className="rounded-xl border border-dashed border-line bg-surface p-8 text-center">
      <p className="text-lg font-semibold">Под такие условия ничего нет</p>

      {hints.length > 0 ? (
        <div className="mx-auto mt-3 max-w-md text-sm text-muted">
          <p>Мешает сочетание условий. Список вернётся, если ослабить любое из них:</p>
          <ul className="mt-2 space-y-1">
            {hints.map((hint) => (
              <li key={hint.key} className="text-ink">
                {hint.label}
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p className="mx-auto mt-3 max-w-md text-sm text-muted">
          Условия пересекаются так, что ни одна позиция не подходит. Снимите часть отметок.
        </p>
      )}

      <button
        type="button"
        onClick={onReset}
        className="mt-6 rounded-lg bg-accent px-5 py-2.5 text-sm font-medium text-white transition hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      >
        Сбросить все условия
      </button>
    </div>
  )
}
```

Подсказки перечисляются только те, снятие которых в одиночку вернёт результат: это гарантирует `conflictHints`. Вторая ветка нужна на случай, когда не спасает снятие ни одного условия по отдельности.

- [ ] **Шаг 2: Показать его вместо пустой сетки**

`src/components/ToolGrid.jsx` целиком:

```jsx
import ToolCard from './ToolCard.jsx'
import EmptyState from './EmptyState.jsx'
import { formatMatches } from '../lib/format.js'

export default function ToolGrid({ tools, total, term, hints, onOpen, onReset }) {
  return (
    <div>
      <p aria-live="polite" className="mb-4 text-sm font-medium text-muted">
        {formatMatches(tools.length, total)}
      </p>

      {tools.length === 0 ? (
        <EmptyState hints={hints} onReset={onReset} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {tools.map((tool) => (
            <ToolCard key={tool.id} tool={tool} term={term} onOpen={onOpen} />
          ))}
        </div>
      )}
    </div>
  )
}
```

- [ ] **Шаг 3: Передать подсказки из App**

В `src/App.jsx` добавить в импорт из `./lib/filter.js` имена `conflictHints` и `resetFilters`, посчитать подсказки и передать их в сетку:

```jsx
  const hints = useMemo(() => conflictHints(TOOLS, state, bounds), [state, bounds])
```

и заменить строку с `<ToolGrid .../>` на:

```jsx
        <ToolGrid
          tools={shown}
          total={TOOLS.length}
          term={term}
          hints={hints}
          onOpen={() => {}}
          onReset={() => setState(resetFilters(state, bounds))}
        />
```

- [ ] **Шаг 4: Проверить руками**

Run: `npm run dev`

Отметить «Высота» и «Бензин» одновременно. Ожидается: «Ничего не подошло», объяснение с перечисленными «Тип» и «Питание», кнопка сброса возвращает 24 позиции.

- [ ] **Шаг 5: Коммит**

```bash
git add src/components/EmptyState.jsx src/components/ToolGrid.jsx src/App.jsx
git commit -m "Экран «ничего не нашлось» с объяснением и сбросом"
```

---

## Задача 11: Окно позиции

**Files:**
- Create: `src/components/ToolDialog.jsx`
- Modify: `src/App.jsx`

**Interfaces:**
- Consumes: `RENT_TERMS` из задачи 2; `priceForTerm`, `pricePerDayForTerm`, `savingForTerm` из задачи 3; `formatPrice`, `formatWeight` из задачи 7.
- Produces: `<ToolDialog tool={Tool | null} term={string} onClose={() => void} />`.

Берём нативный `<dialog>` с `showModal()`. Он бесплатно даёт четыре вещи, которые просит спека: закрытие по Esc, удержание фокуса внутри окна, возврат фокуса на кнопку, которая окно открыла, и недоступность фона. Собственная ловушка фокуса не нужна.

- [ ] **Шаг 1: Написать окно**

`src/components/ToolDialog.jsx`:

```jsx
import { useEffect, useRef } from 'react'
import { RENT_TERMS } from '../data/rentTerms.js'
import { typeLabel, powerLabel } from '../data/tools.js'
import { formatPrice, formatWeight } from '../lib/format.js'
import { priceForTerm, pricePerDayForTerm, savingForTerm } from '../lib/pricing.js'

export default function ToolDialog({ tool, term, onClose }) {
  const ref = useRef(null)

  useEffect(() => {
    const node = ref.current
    if (!node) return
    if (tool && !node.open) node.showModal()
    if (!tool && node.open) node.close()
  }, [tool])

  useEffect(() => {
    // Фон под окном не должен прокручиваться, пока окно открыто.
    if (!tool) return
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previous
    }
  }, [tool])

  // Клик мимо окна: у самого <dialog> область клика — вся страница,
  // поэтому попадание ровно в него значит попадание по подложке.
  const onBackdropClick = (event) => {
    if (event.target === ref.current) onClose()
  }

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={onBackdropClick}
      className="m-auto w-[min(34rem,calc(100vw-2rem))] rounded-xl border border-line bg-surface p-0 text-ink backdrop:bg-black/40"
    >
      {tool && (
        <div className="p-6">
          <div className="flex items-start justify-between gap-4">
            <h2 className="text-xl font-semibold leading-snug">{tool.name}</h2>
            <button
              type="button"
              onClick={onClose}
              aria-label="Закрыть"
              className="-mr-2 -mt-1 rounded-md px-2 py-1 text-2xl leading-none text-muted hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              ×
            </button>
          </div>

          <dl className="mt-4 space-y-1 text-sm">
            <div className="flex gap-2">
              <dt className="min-w-28 text-muted">Тип</dt>
              <dd>{typeLabel(tool.type)}</dd>
            </div>
            <div className="flex gap-2">
              <dt className="min-w-28 text-muted">Питание</dt>
              <dd>{powerLabel(tool.power)}</dd>
            </div>
            <div className="flex gap-2">
              <dt className="min-w-28 text-muted">Вес</dt>
              <dd>{formatWeight(tool.weight)}</dd>
            </div>
            <div className="flex gap-2">
              <dt className="min-w-28 text-muted">Залог</dt>
              <dd>{formatPrice(tool.deposit)}</dd>
            </div>
            <div className="flex gap-2">
              <dt className="min-w-28 text-muted">Доставка</dt>
              <dd>{tool.delivery ? 'Привозим на объект' : 'Только самовывоз'}</dd>
            </div>
          </dl>

          <h3 className="mt-6 text-sm font-semibold">Цена по срокам</h3>
          <div className="mt-2 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line text-left text-muted">
                  <th scope="col" className="py-2 pr-3 font-medium">Срок</th>
                  <th scope="col" className="py-2 pr-3 font-medium">За весь срок</th>
                  <th scope="col" className="py-2 pr-3 font-medium">В сутки</th>
                  <th scope="col" className="py-2 font-medium">Выгода</th>
                </tr>
              </thead>
              <tbody>
                {RENT_TERMS.map((row) => (
                  <tr
                    key={row.id}
                    className={`border-b border-line last:border-0 ${row.id === term ? 'font-medium text-accent' : ''}`}
                  >
                    <th scope="row" className="py-2 pr-3 text-left font-normal">{row.label}</th>
                    <td className="py-2 pr-3">{formatPrice(priceForTerm(tool, row.id))}</td>
                    <td className="py-2 pr-3">{formatPrice(pricePerDayForTerm(tool, row.id))}</td>
                    <td className="py-2">
                      {savingForTerm(tool, row.id) > 0 ? formatPrice(savingForTerm(tool, row.id)) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h3 className="mt-6 text-sm font-semibold">Входит в аренду</h3>
          <ul className="mt-2 space-y-1 text-sm text-muted">
            {tool.includes.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>

          <h3 className="mt-5 text-sm font-semibold">Привезти с собой</h3>
          <ul className="mt-2 space-y-1 text-sm text-muted">
            {tool.bringYourOwn.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </div>
      )}
    </dialog>
  )
}
```

- [ ] **Шаг 2: Подключить к App**

В `src/App.jsx` добавить импорт:

```jsx
import ToolDialog from './components/ToolDialog.jsx'
```

Добавить состояние рядом с остальными:

```jsx
  const [openTool, setOpenTool] = useState(null)
```

Заменить `onOpen={() => {}}` на `onOpen={setOpenTool}` и дописать окно перед закрывающим `</main>`:

```jsx
      <ToolDialog tool={openTool} term={term} onClose={() => setOpenTool(null)} />
```

- [ ] **Шаг 3: Проверить руками**

Run: `npm run dev`

Проверить:
- «Условия аренды» открывает окно поверх списка, в таблице все три срока, выбранный подсвечен;
- Esc закрывает, клик по затемнению закрывает, крестик закрывает;
- после закрытия фокус вернулся ровно на ту кнопку, с которой окно открыли;
- при открытом окне колесо мыши не прокручивает список за окном;
- Tab по кругу ходит только внутри окна;
- консоль чистая.

- [ ] **Шаг 4: Коммит**

```bash
git add src/components/ToolDialog.jsx src/App.jsx
git commit -m "Окно позиции с условиями и таблицей цен"
```

---

## Задача 12: Планшет и телефон

**Files:**
- Create: `src/components/FilterDrawer.jsx`
- Modify: `src/components/ToolGrid.jsx`, `src/App.jsx`

**Interfaces:**
- Consumes: `activeFilterCount` из задачи 5, `<FilterPanel />` из задачи 8.
- Produces: `<FilterDrawer state={State} counts={Counts} bounds={Bounds} onChange={fn} />` — кнопка «Фильтры · N» и выезжающая панель. Прятать её на широком экране — дело обёртки в `App`, сам компонент про раскладку страницы не знает.

Раскладка по спеке: от 1024 px — панель слева и три колонки; 768–1023 px — кнопка со счётчиком и две колонки; до 767 px — шторка снизу и одна колонка.

- [ ] **Шаг 1: Поправить число колонок в сетке**

В `src/components/ToolGrid.jsx` заменить класс сетки:

```jsx
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
```

`md` в Tailwind — это 768 px, `lg` — 1024 px: ровно те границы, что в спеке.

- [ ] **Шаг 2: Написать шторку**

`src/components/FilterDrawer.jsx`:

```jsx
import { useEffect, useRef, useState } from 'react'
import { activeFilterCount } from '../lib/filter.js'
import FilterPanel from './FilterPanel.jsx'

export default function FilterDrawer({ state, counts, bounds, onChange }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const active = activeFilterCount(state, bounds)

  useEffect(() => {
    const node = ref.current
    if (!node) return
    if (open && !node.open) node.showModal()
    if (!open && node.open) node.close()
  }, [open])

  useEffect(() => {
    if (!open) return
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previous
    }
  }, [open])

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="w-full rounded-lg border border-line bg-surface px-4 py-3 text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent sm:w-auto"
      >
        Фильтры{active > 0 && <> · {active}</>}
      </button>

      <dialog
        ref={ref}
        onClose={() => setOpen(false)}
        onClick={(event) => {
          if (event.target === ref.current) setOpen(false)
        }}
        className="m-0 mt-auto max-h-[85dvh] w-full max-w-none rounded-t-2xl border border-line bg-surface p-0 text-ink backdrop:bg-black/40 md:m-auto md:max-h-[85dvh] md:w-[22rem] md:rounded-2xl"
      >
        <div className="sticky top-0 flex items-center justify-between border-b border-line bg-surface px-5 py-4">
          <span className="text-base font-semibold">Фильтры</span>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Закрыть фильтры"
            className="-mr-2 rounded-md px-2 py-1 text-2xl leading-none text-muted hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            ×
          </button>
        </div>

        <div className="overflow-y-auto px-5 py-5">
          <FilterPanel state={state} counts={counts} bounds={bounds} onChange={onChange} />
        </div>

        <div className="sticky bottom-0 border-t border-line bg-surface px-5 py-4">
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="w-full rounded-lg bg-accent px-5 py-3 text-sm font-medium text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            Показать результат
          </button>
        </div>
      </dialog>
    </div>
  )
}
```

Кнопка «Показать результат» не применяет фильтры — они уже применились — а просто закрывает шторку: на телефоне список за ней не виден, и нужен понятный выход.

На телефоне окно прижато вниз (`mt-auto`, скругление только сверху), с 768 px оно становится обычным окном по центру. `dvh` вместо `vh` — чтобы адресная строка мобильного браузера не срезала низ.

- [ ] **Шаг 3: Развести раскладку в App**

В `src/App.jsx` добавить импорт:

```jsx
import FilterDrawer from './components/FilterDrawer.jsx'
```

Заменить блок с `<aside>` на:

```jsx
        <div className="mb-6 lg:hidden">
          <FilterDrawer state={state} counts={counts} bounds={bounds} onChange={setState} />
        </div>

        <aside className="hidden rounded-xl border border-line bg-surface p-5 lg:block lg:self-start">
          <FilterPanel state={state} counts={counts} bounds={bounds} onChange={setState} />
        </aside>
```

Внешний `<div>` при этом остаётся тем же: `className="mt-8 lg:grid lg:grid-cols-[17rem_1fr] lg:gap-8"`.

- [ ] **Шаг 4: Проверить на трёх ширинах**

Run: `npm run dev`

В браузере включить режим устройства и проверить 360, 768 и 1280 px:
- 360 px — одна колонка, кнопка «Фильтры», панель выезжает снизу, горизонтальной прокрутки нет;
- 768 px — две колонки, кнопка «Фильтры · N» со счётчиком после пары отметок, окно фильтров по центру;
- 1280 px — три колонки, панель слева, кнопки «Фильтры» нет.

Отсутствие горизонтальной прокрутки проверить в консоли браузера:

```js
document.documentElement.scrollWidth <= window.innerWidth
```

Expected: `true` на всех трёх ширинах.

- [ ] **Шаг 5: Коммит**

```bash
git add src/components/FilterDrawer.jsx src/components/ToolGrid.jsx src/App.jsx
git commit -m "Раскладка под планшет и телефон, шторка фильтров"
```

---

## Задача 13: Подбор в адресной строке

**Files:**
- Modify: `src/App.jsx`

**Interfaces:**
- Consumes: `stateToSearch`, `searchToState` из задачи 6.
- Produces: ссылка с выбранным отбором открывается в том же виде; кнопка «назад» возвращает предыдущий отбор.

Запись в историю задерживается на 400 мс. Без этого протаскивание ползунка цены накидало бы в историю сотню шагов, и «назад» перестала бы работать осмысленно.

- [ ] **Шаг 1: Привязать начальное состояние к адресу**

В `src/App.jsx` добавить `useEffect` и `useRef` в импорт из `react`, добавить импорт:

```jsx
import { stateToSearch, searchToState } from './lib/urlState.js'
```

Заменить три строки с `useState` на:

```jsx
  const [initial] = useState(() => searchToState(window.location.search, bounds))
  const [state, setState] = useState(initial.state)
  const [term, setTerm] = useState(initial.term)
  const [openTool, setOpenTool] = useState(null)
  const historyTimer = useRef(null)
```

- [ ] **Шаг 2: Писать состояние в адрес**

Добавить после объявлений состояния:

```jsx
  useEffect(() => {
    const search = stateToSearch(state, term, bounds)
    const next = search ? `${window.location.pathname}?${search}` : window.location.pathname
    const current = `${window.location.pathname}${window.location.search}`
    if (next === current) return

    // Задержка, чтобы протаскивание ползунка не плодило шаги истории.
    clearTimeout(historyTimer.current)
    historyTimer.current = setTimeout(() => {
      window.history.pushState(null, '', next)
    }, 400)

    return () => clearTimeout(historyTimer.current)
  }, [state, term, bounds])
```

- [ ] **Шаг 3: Слушать кнопку «назад»**

Добавить следом:

```jsx
  useEffect(() => {
    const onPop = () => {
      const restored = searchToState(window.location.search, bounds)
      setState(restored.state)
      setTerm(restored.term)
    }
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [bounds])
```

Обратной записи в адрес при этом не случится: проверка `next === current` в первом эффекте увидит, что адрес уже соответствует состоянию.

- [ ] **Шаг 4: Проверить руками**

Run: `npm run dev`

Проверить:
- отметить «Бензин» и «Уплотнение грунта», сузить цену, выбрать «Неделя» — в адресе появились `t`, `p`, `price`, `term`;
- скопировать адрес, открыть в новой вкладке — тот же отбор, тот же срок, те же отмеченные чекбоксы;
- «назад» в браузере возвращает предыдущий отбор, «вперёд» — следующий;
- протащить ползунок цены из края в край одним движением и нажать «назад» один раз — вернулось состояние до перетаскивания, а не промежуточное;
- открыть адрес с мусором `?t=выдумка&sort=как-нибудь&price=абв` — страница открывается в исходном виде, консоль чистая.

- [ ] **Шаг 5: Коммит**

```bash
git add src/App.jsx
git commit -m "Состояние подбора в адресе, поддержка кнопки «назад»"
```

---

## Задача 14: Обрамление страницы

**Files:**
- Modify: `src/App.jsx`

**Interfaces:**
- Consumes: всё готовое.
- Produces: заголовок с пояснением, видимая оговорка про условные данные, подвал.

Оговорка обязательна: без неё демо с выдуманными ценами читается как настоящий прайс.

- [ ] **Шаг 1: Заменить шапку и дописать подвал**

Заменить строку `<h1 ...>` в `src/App.jsx` на:

```jsx
      <header className="max-w-2xl">
        <h1 className="text-3xl font-semibold sm:text-4xl">
          Аренда строительного инструмента
        </h1>
        <p className="mt-3 text-base text-muted">
          Подбор по типу, питанию, весу и цене. Срок аренды пересчитывает стоимость
          всего каталога сразу.
        </p>
        <p className="mt-4 rounded-lg border border-line bg-accent-soft px-4 py-3 text-sm text-ink">
          Демонстрационный модуль. Позиции, цены и залоги условные — это не прайс
          настоящей компании и не предложение заключить договор.
        </p>
      </header>
```

Перед закрывающим `</main>` (но после `<ToolDialog />`) добавить:

```jsx
      <footer className="mt-16 border-t border-line pt-6 text-sm text-muted">
        <p>
          Работа для портфолио: каталог с подбором по параметрам. React, Vite,
          Tailwind. Отбор и расчёт цены — отдельные функции, покрытые тестами.
        </p>
        <p className="mt-2">
          Заявок здесь нет и персональные данные не собираются.
        </p>
      </footer>
```

- [ ] **Шаг 2: Посмотреть глазами**

Run: `npm run dev`
Expected: оговорка видна сразу, без прокрутки, и на телефоне тоже. Подвал на месте.

- [ ] **Шаг 3: Коммит**

```bash
git add src/App.jsx
git commit -m "Шапка, оговорка про условные данные и подвал"
```

---

## Задача 15: Проверки, сборка и выкладка

**Files:**
- Create: `src/theme.test.js`, `docs/.nojekyll`
- Modify: `README.md`

**Interfaces:**
- Consumes: всё готовое.
- Produces: сайт на `https://pyhphhddb8-eng.github.io/katalog-arenda/`.

- [ ] **Шаг 1: Написать тест контраста**

Контраст — это формула, а не глазомер. Считаем его тестом, чтобы правка палитры не сломала доступность молча.

`src/theme.test.js`:

```js
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
```

- [ ] **Шаг 2: Убедиться, что палитра в CSS и в тесте — одна и та же**

Значения в `PALETTE` обязаны совпадать с переменными в блоке `@theme` файла `src/index.css`. Сверить глазами:

Run: `grep -- '--color-' src/index.css`
Expected: `ink #16181d`, `muted #5b6270`, `surface #ffffff`, `canvas #f6f7f9`, `accent #a34a08`, `accent-soft #fdf1e6`.

Если где-то разошлось — править `src/index.css`, а не тест: тест описывает норму, CSS ей подчиняется.

Run: `npm test`
Expected: PASS, все восемь пар проходят. Тест здесь не ловит поломку, а сторожит её: следующая правка палитры мимо нормы 4,5 упадёт сразу.

- [ ] **Шаг 3: Прогнать весь набор тестов**

Run: `npm test`
Expected: PASS во всех файлах — `tools`, `pricing`, `filter`, `urlState`, `format`, `theme`.

- [ ] **Шаг 4: Собрать и проверить сборку**

```bash
npm run build
ls docs
ls docs/superpowers
```

Expected: в `docs/` появились `index.html` и папка `assets`; `docs/superpowers` со спекой и планом на месте — это главное, что здесь проверяется.

Проверить, что пути в сборке относительные:

```bash
grep -o 'src="[^"]*"' docs/index.html
```

Expected: путь начинается с `./assets/`, а не с `/assets/`. Иначе на Pages в подпапке сборка не найдётся.

- [ ] **Шаг 5: Добавить `.nojekyll`**

```bash
touch docs/.nojekyll
```

GitHub Pages по умолчанию прогоняет содержимое через Jekyll, который выбрасывает файлы и папки, начинающиеся с подчёркивания. Пустой `.nojekyll` это отключает — страховка на случай, если Vite назовёт файл с подчёркивания.

- [ ] **Шаг 6: Посмотреть собранную версию локально**

```bash
npm run preview
```

Пройти по списку из спеки на живой сборке: три ширины, работа с клавиатуры, окно позиции, ссылка с фильтрами, чистая консоль.

- [ ] **Шаг 7: Коммит**

```bash
git add -A
git commit -m "Тест контраста палитры и первая сборка в docs"
```

- [ ] **Шаг 8: Создать репозиторий и выложить**

```bash
gh repo create pyhphhddb8-eng/katalog-arenda --public --source=. --remote=origin --push
```

- [ ] **Шаг 9: Включить Pages из папки `docs`**

```bash
gh api -X POST repos/pyhphhddb8-eng/katalog-arenda/pages \
  -f 'source[branch]=main' -f 'source[path]=/docs'
```

Если Pages уже включены, команда вернёт `409` — тогда переключить источник:

```bash
gh api -X PUT repos/pyhphhddb8-eng/katalog-arenda/pages \
  -f 'source[branch]=main' -f 'source[path]=/docs'
```

- [ ] **Шаг 10: Дождаться сборки и проверить живой адрес**

Первая публикация занимает одну-две минуты.

```bash
curl -sI https://pyhphhddb8-eng.github.io/katalog-arenda/ | head -1
curl -s https://pyhphhddb8-eng.github.io/katalog-arenda/ | grep -o '<title>[^<]*</title>'
```

Expected: `HTTP/2 200` и заголовок «Каталог аренды строительного инструмента — демо-модуль».

Проверить, что подтянулась сборка, а не пустая страница:

```bash
curl -s https://pyhphhddb8-eng.github.io/katalog-arenda/ | grep -o './assets/[^"]*'
curl -sI "https://pyhphhddb8-eng.github.io/katalog-arenda/$(curl -s https://pyhphhddb8-eng.github.io/katalog-arenda/ | grep -o 'assets/[^"]*\.js' | head -1)" | head -1
```

Expected: оба `200`.

- [ ] **Шаг 11: Пройти по живому адресу вручную**

Открыть `https://pyhphhddb8-eng.github.io/katalog-arenda/` и проверить по списку из спеки:
- консоль браузера чистая, ошибок сети нет;
- фильтры считают, счётчики сходятся с длиной списка;
- окно позиции открывается и закрывается по Esc, фокус возвращается;
- ссылка с выбранными фильтрами открывается в том же виде;
- на 360 px нет горизонтальной прокрутки;
- всё проходится с клавиатуры, фокус везде виден.

- [ ] **Шаг 12: Обновить README**

В `README.md` заменить раздел «Состояние на 13.09.2026» на:

```markdown
## Состояние

Собрано и выложено: https://pyhphhddb8-eng.github.io/katalog-arenda/

Исходники в `src/`, сборка в `docs/`, оттуда её отдаёт GitHub Pages.

Команды: `npm run dev` — локальный запуск, `npm test` — тесты отбора, расчёта
цены, разбора адреса и контраста палитры, `npm run build` — сборка в `docs/`.
```

- [ ] **Шаг 13: Коммит и отправка**

```bash
git add README.md
git commit -m "README: адрес выложенной версии и команды"
git push
```

---

## Самопроверка плана

Сверено со спекой, раздел за разделом:

| Требование спеки | Где закрыто |
| --- | --- |
| 24 позиции, пять типов | Задача 2 |
| Поля позиции: название, тип, питание, вес, цена, залог, доставка, что входит, что привезти | Задача 2 |
| Оговорка, что позиции и цены условные | Задача 14 |
| Тип, питание — чекбоксы, «или» внутри группы | Задачи 4, 8 |
| Вес диапазонами | Задачи 2, 4 |
| Цена двумя ползунками | Задача 9 |
| Переключатель «только с доставкой» | Задачи 4, 8 |
| «И» между группами | Задача 4 |
| Три сортировки | Задача 4 |
| Срок аренды, коэффициенты в данных | Задачи 2, 3, 7 |
| Фильтры применяются мгновенно | Задача 8 |
| Счётчик «подошло N из 24» | Задача 7 |
| Своё число у каждого чекбокса | Задача 5 |
| Объяснение при пустом результате | Задачи 5, 10 |
| «Сбросить всё» только когда есть что сбрасывать | Задачи 5, 8 |
| Состояние в адресе, ссылкой можно делиться, работает «назад» | Задачи 6, 13 |
| Карточка окном поверх списка, Esc, клик мимо, возврат фокуса, фон не прокручивается | Задача 11 |
| Цена таблицей по трём срокам | Задача 11 |
| Десктоп от 1024: панель слева, три колонки | Задачи 8, 12 |
| Планшет 768–1023: кнопка «Фильтры · 3», две колонки | Задача 12 |
| Телефон до 767: шторка снизу, одна колонка, нет прокрутки вбок | Задача 12 |
| Данные отдельным файлом | Задача 2 |
| Отбор — чистая функция | Задача 4 |
| Расчёт цены — чистая функция | Задача 3 |
| Компоненты интерфейса разведены | Задачи 7–12 |
| Тесты: пересечение групп, пустой результат, границы цены, выгода недели, счётчики | Задачи 3, 4, 5 |
| Контраст 4,5 | Задача 15 |
| Нет прокрутки вбок на 360 px | Задача 12 |
| Работа с клавиатуры, видимый фокус | Задачи 7–12 |
| Чистая консоль на живом адресе | Задача 15 |
| Ссылка с фильтрами открывается в том же виде | Задача 15 |
| Сборка в `docs/`, относительный базовый путь | Задачи 1, 15 |
| GitHub Pages, аккаунт `pyhphhddb8-eng` | Задача 15 |
| Заглушки рисуются кодом, фотографий нет | Задача 7 |
| Нет заявок, корзины, поиска по названию | Нигде не заводится |

Расхождения со спекой, решённые в плане:

1. **`docs/` уже занята.** Спека велит класть сборку в `docs/`, но там лежит она сама. Обычная сборка Vite очистила бы папку и стёрла спеку с планом. Решение в задаче 1: `emptyOutDir: false` и точечная чистка `docs/assets` перед сборкой.
2. **У лесов и вышек нет питания.** Спека даёт три варианта питания, но пять из 24 позиций не питаются ничем. Четвёртый чекбокс не заводится: у таких позиций `power: 'none'`, и любой отмеченный вариант питания их отсекает. Проверено тестом в задаче 4.
3. **Счётчик у чекбокса.** Спека описывает его дважды и по-разному: «сколько добавит к текущему отбору» и «то же, что покажет список после нажатия». Первая попытка — считать разницу — давала на чистом фильтре отрицательные числа: первая же отметка не добавляет позиции, а отсекает. Взят фасетный счёт: своя группа считается так, будто в ней отмечена только эта опция. Он закрывает обе формулировки сразу — пока группа пуста, число равно будущей длине списка, а когда в группе уже есть отметки, оно равно прибавке. Оба равенства проверяются тестом на настоящих данных в задаче 5.
4. **Сортировка «по весу»** уточнена до «Сначала легче» — иначе направление не читается с экрана.
5. **Библиотека компонентов не ставится.** Общий порядок работы предполагает shadcn/ui, но спека перечисляет собственные компоненты, а единственное место, где библиотека реально пригодилась бы, — окно позиции — закрывается нативным `<dialog>`. Тянуть Radix ради одного окна в демо на 24 позиции смысла нет.
