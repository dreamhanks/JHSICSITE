import type { ChipFilters } from '../context/appState'
import type { Property, Ward } from '../types/property'

/** Pure filtering, sorting, option-building and pagination.
 *  No component contains filter logic. */

export type SortKey = 'recommended' | 'priceAsc' | 'priceDesc' | 'newest' | 'nearest'

export interface SearchFilters {
  /** '' = すべて */
  ward: string
  /** '' = すべて, otherwise an exact station name */
  station: string
  /** '' = すべて, otherwise a PriceBracketId */
  price: string
  /** '' = すべて, otherwise the minimum room count as a string */
  plan: string
  chips: ChipFilters
}

/** Which select keys exist. Used by the context setter and both surfaces. */
export type FilterSelectKey = 'ward' | 'station' | 'price' | 'plan'

export interface SelectOption {
  value: string
  label: string
}

export const PAGE_SIZE = 10

/* ------------------------------ price brackets ------------------------------ */

type PriceBracketId = 'b1' | 'b2' | 'b3'

const PRICE_BRACKETS: { id: PriceBracketId; label: string; test: (yen: number) => boolean }[] = [
  { id: 'b1', label: '〜6,000万円', test: (y) => y <= 60_000_000 },
  { id: 'b2', label: '6,000〜9,000万円', test: (y) => y > 60_000_000 && y <= 90_000_000 },
  { id: 'b3', label: '9,000万円〜', test: (y) => y > 90_000_000 },
]

const PLAN_MINIMUMS = [3, 4, 5]
const WARDS: Ward[] = ['墨田区', '台東区', '江東区']

/* ------------------------------ option builders ------------------------------ */
/* Counts are computed once over the full data set and never recomputed as other
   filters narrow it — a count that shifts under the cursor mid-demo reads as a bug. */

/* The placeholder is a bare すべて with no count: it always equals the
   grand total, which 掲載物件 100件 and .mapfoot 全100件中 already show.
   The field name lives in a <label> above the select on desktop and in
   .fs-label in the mobile sheet, so it is not repeated inside the option
   either.
   Every SPECIFIC option keeps its count — the distribution is uneven, so
   a user choosing 江東区 should see it yields 16 before committing. */

export function buildAreaOptions(all: Property[]): SelectOption[] {
  return [
    { value: '', label: 'すべて' },
    ...WARDS.map((w) => {
      const n = all.filter((p) => p.ward === w).length
      return { value: w, label: `${w}（${n}）` }
    }),
  ]
}

/** Stations present in the data, most common first, then by name.
 *  `line` is deliberately not a filter axis of its own: several stations
 *  are served by more than one line, so an exact station match is the
 *  unambiguous unit. */
export function buildStationOptions(all: Property[]): SelectOption[] {
  const counts = new Map<string, number>()
  for (const p of all) counts.set(p.station, (counts.get(p.station) ?? 0) + 1)
  const sorted = [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], 'ja'))
  return [
    { value: '', label: 'すべて' },
    ...sorted.map(([station, n]) => ({ value: station, label: `${station}（${n}）` })),
  ]
}

export function buildPriceOptions(all: Property[]): SelectOption[] {
  return [
    { value: '', label: 'すべて' },
    ...PRICE_BRACKETS.map((b) => {
      const n = all.filter((p) => b.test(p.priceYen)).length
      return { value: b.id, label: `${b.label}（${n}）` }
    }),
  ]
}

export function buildPlanOptions(all: Property[]): SelectOption[] {
  return [
    { value: '', label: 'すべて' },
    ...PLAN_MINIMUMS.map((n) => {
      const c = all.filter((p) => p.rooms >= n).length
      return { value: String(n), label: `${n}LDK以上（${c}）` }
    }),
  ]
}

export const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: 'recommended', label: 'おすすめ順' },
  { value: 'priceAsc', label: '価格が安い順' },
  { value: 'priceDesc', label: '価格が高い順' },
  { value: 'newest', label: '築年数が新しい順' },
  { value: 'nearest', label: '駅から近い順' },
]

/* ------------------------------ filter ------------------------------ */

export function filterProperties(all: Property[], f: SearchFilters): Property[] {
  const bracket = PRICE_BRACKETS.find((b) => b.id === f.price)
  const minRooms = f.plan === '' ? null : Number(f.plan)

  return all.filter((p) => {
    if (f.ward !== '' && p.ward !== f.ward) return false
    if (f.station !== '' && p.station !== f.station) return false
    if (bracket && !bracket.test(p.priceYen)) return false
    if (minRooms !== null && p.rooms < minRooms) return false

    // chips are AND, and only constrain when pressed
    if (f.chips.warranty && !p.hasWarranty10y) return false
    if (f.chips.inspected && !p.isInspected) return false
    if (f.chips.ground && !(p.groundGrade === 'A' || p.groundGrade === 'B')) return false
    if (f.chips.newbuild && !p.hasNewBuildRecord) return false
    return true
  })
}

/** True when anything is narrowing the result set. Drives the
 *  visibility of 条件をリセット, so it never shows as a dead control. */
export function hasActiveFilters(f: SearchFilters): boolean {
  return f.ward !== '' || f.station !== '' || f.price !== '' || f.plan !== ''
    || Object.values(f.chips).some(Boolean)
}

/** How many filters are narrowing the set — the .filter-trigger badge. */
export function countActiveFilters(f: SearchFilters): number {
  return (f.ward !== '' ? 1 : 0) + (f.station !== '' ? 1 : 0)
    + (f.price !== '' ? 1 : 0) + (f.plan !== '' ? 1 : 0)
    + Object.values(f.chips).filter(Boolean).length
}

/* ------------------------------ sort ------------------------------ */

export function sortProperties(list: Property[], key: SortKey): Property[] {
  const out = [...list]
  // id ascending is the tie-breaker everywhere, so every order is stable
  const byId = (a: Property, b: Property) => a.id - b.id
  switch (key) {
    case 'priceAsc': return out.sort((a, b) => a.priceYen - b.priceYen || byId(a, b))
    case 'priceDesc': return out.sort((a, b) => b.priceYen - a.priceYen || byId(a, b))
    case 'newest': return out.sort((a, b) => b.builtYear - a.builtYear || byId(a, b))
    case 'nearest': return out.sort((a, b) => a.walkMinutes - b.walkMinutes || byId(a, b))
    case 'recommended':
    default: return out.sort(byId)
  }
}

/* ------------------------------ paginate ------------------------------ */

export function pageCount(total: number): number {
  return Math.max(1, Math.ceil(total / PAGE_SIZE))
}

export function pageSlice<T>(list: T[], page: number): T[] {
  const start = (page - 1) * PAGE_SIZE
  return list.slice(start, start + PAGE_SIZE)
}

/** `全62件中 1〜20件を表示` — returns the range portion only. */
export function formatRange(total: number, page: number): string {
  if (total === 0) return '該当0件'
  const start = (page - 1) * PAGE_SIZE + 1
  const end = Math.min(page * PAGE_SIZE, total)
  return `全${total}件中 ${start}〜${end}件を表示`
}

/** Ellipsised page list, e.g. [1,'…',4,5,6,'…',12]. */
export function pageItems(total: number, current: number): (number | '…')[] {
  const last = pageCount(total)
  if (last <= 7) return Array.from({ length: last }, (_, i) => i + 1)
  const out: (number | '…')[] = [1]
  const from = Math.max(2, current - 1)
  const to = Math.min(last - 1, current + 1)
  if (from > 2) out.push('…')
  for (let i = from; i <= to; i++) out.push(i)
  if (to < last - 1) out.push('…')
  out.push(last)
  return out
}
