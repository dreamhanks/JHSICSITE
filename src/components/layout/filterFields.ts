import type { ChipId } from '../../context/appState'
import type { FilterSelectKey, SelectOption } from '../../lib/propertySearch'

/** UI configuration for the property filters, not domain data — kept as
 *  module constants here rather than routed through types/ data/ api/.
 *
 *  SHARED BY THE TWO FILTER SURFACES. SearchBar (with FilterSheet) is
 *  the surface at or below 1061px; HeaderFilters is the pill row above
 *  it. They are the two arms of one conditional in App.tsx and are never
 *  mounted together, but they must offer the same fields, the same chips
 *  and the same labels — so those live in one place and neither owns
 *  them. Design C Stage 2b hoisted them out of SearchBar; before that
 *  HeaderFilters carried a second copy that could drift.
 *
 *  The axisnote is the other shared piece and is a component, so it is
 *  in AxisNote.tsx instead — this file must stay JSX-free to keep
 *  oxlint's react/only-export-components happy. */

export const CHIPS: { id: ChipId; variant: '' | 'o' | 'b'; label: string }[] = [
  { id: 'warranty', variant: '', label: '10年保証付き' },
  { id: 'inspected', variant: 'o', label: '既存住宅診断済み' },
  { id: 'ground', variant: 'b', label: '地盤評価 A・B' },
  { id: 'newbuild', variant: '', label: '新築時履歴あり' },
]

export type FieldOptions = Record<FilterSelectKey, SelectOption[]>

/** Shown only for the ~300ms before the record set arrives. */
export const PLACEHOLDER: FieldOptions = {
  ward: [{ value: '', label: 'すべて' }],
  station: [{ value: '', label: 'すべて' }],
  price: [{ value: '', label: 'すべて' }],
  plan: [{ value: '', label: 'すべて' }],
}

/** `id` pairs each select with its <label htmlFor> in SearchBar. It is
 *  deliberately unused by HeaderFilters, whose pills are buttons with no
 *  paired label — that surface mints no element ids at all, which is
 *  what keeps these four unique however the tree is rendered. */
export const FIELDS: { key: FilterSelectKey; id: string; label: string }[] = [
  { key: 'ward', id: 'f-ward', label: 'エリア' },
  { key: 'station', id: 'f-station', label: '沿線・駅' },
  { key: 'price', id: 'f-price', label: '価格帯' },
  { key: 'plan', id: 'f-plan', label: '間取り' },
]

/** `墨田区（62）` -> `墨田区` for the applied-filter pills. */
export const stripCount = (label: string) => label.replace(/（\d+）$/, '')
