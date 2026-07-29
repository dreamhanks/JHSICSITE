import { useEffect, useState } from 'react'
import { getProperties } from '../../api/properties'
import type { ChipId } from '../../context/appState'
import { useAppState } from '../../context/useAppState'
import {
  buildAreaOptions, buildPlanOptions, buildPriceOptions, buildStationOptions,
  countActiveFilters, hasActiveFilters, type FilterSelectKey, type SelectOption,
} from '../../lib/propertySearch'
import type { Property } from '../../types/property'
import { SearchIcon } from '../art/Icons'
import { FilterSheet } from './FilterSheet'

/** UI configuration, not domain data — kept as module constants here
 *  rather than routed through types/ data/ api/. */
const CHIPS: { id: ChipId; variant: '' | 'o' | 'b'; label: string }[] = [
  { id: 'warranty', variant: '', label: '10年保証付き' },
  { id: 'inspected', variant: 'o', label: '既存住宅診断済み' },
  { id: 'ground', variant: 'b', label: '地盤評価 A・B' },
  { id: 'newbuild', variant: '', label: '新築時履歴あり' },
]

export type FieldOptions = Record<FilterSelectKey, SelectOption[]>

/** Shown only for the ~300ms before the record set arrives. */
const PLACEHOLDER: FieldOptions = {
  ward: [{ value: '', label: 'すべて' }],
  station: [{ value: '', label: 'すべて' }],
  price: [{ value: '', label: 'すべて' }],
  plan: [{ value: '', label: 'すべて' }],
}

const FIELDS: { key: FilterSelectKey; id: string; label: string }[] = [
  { key: 'ward', id: 'f-ward', label: 'エリア' },
  { key: 'station', id: 'f-station', label: '沿線・駅' },
  { key: 'price', id: 'f-price', label: '価格帯' },
  { key: 'plan', id: 'f-plan', label: '間取り' },
]

/** `墨田区（62）` -> `墨田区` for the applied-filter pills. */
const stripCount = (label: string) => label.replace(/（\d+）$/, '')

export function SearchBar() {
  const {
    pendingFilters, appliedFilters, commitFilters, resetFilters,
  } = useAppState()

  const [all, setAll] = useState<Property[]>([])
  const [options, setOptions] = useState<FieldOptions>(PLACEHOLDER)
  const [sheetOpen, setSheetOpen] = useState(false)

  useEffect(() => {
    let alive = true
    getProperties().then((list) => {
      if (!alive) return
      setAll(list)
      setOptions({
        ward: buildAreaOptions(list),
        station: buildStationOptions(list),
        price: buildPriceOptions(list),
        plan: buildPlanOptions(list),
      })
    })
    return () => { alive = false }
  }, [])

  const activeCount = countActiveFilters(appliedFilters)
  const showReset = hasActiveFilters(pendingFilters) || hasActiveFilters(appliedFilters)

  /* Desktop applies on change — no 探す. Both halves move together. */
  const changeSelect = (key: FilterSelectKey, value: string) =>
    commitFilters({ ...appliedFilters, [key]: value })
  const flipChip = (id: ChipId) =>
    commitFilters({
      ...appliedFilters,
      chips: { ...appliedFilters.chips, [id]: !appliedFilters.chips[id] },
    })

  /* One removable pill per active filter, so the user can see what is
     narrowing the list and drop a single condition to broaden it. */
  const pills: { key: string; label: string; clear: () => void }[] = []
  for (const f of FIELDS) {
    const v = appliedFilters[f.key]
    if (v === '') continue
    const opt = options[f.key].find((o) => o.value === v)
    pills.push({
      key: f.key,
      label: stripCount(opt?.label ?? v),
      clear: () => changeSelect(f.key, ''),
    })
  }
  for (const c of CHIPS) {
    if (!appliedFilters.chips[c.id]) continue
    pills.push({ key: c.id, label: c.label, clear: () => flipChip(c.id) })
  }

  return (
    <div className="searchbar">
      <div className="sw">
        <div className="sw-primary">
          {FIELDS.map((f) => (
            <div key={f.key} className="field-group">
              <label className="field-label" htmlFor={f.id}>{f.label}</label>
              <select
                id={f.id}
                className="field"
                value={pendingFilters[f.key]}
                onChange={(e) => changeSelect(f.key, e.target.value)}
              >
                {options[f.key].map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
          ))}
        </div>

        <div className="sw-refine">
          <span className="refine-label" id="refine-label">こだわり条件</span>
          <div className="chips" role="group" aria-labelledby="refine-label">
            {CHIPS.map((c) => (
              <button
                key={c.id}
                className={c.variant ? `chip ${c.variant}` : 'chip'}
                aria-pressed={pendingFilters.chips[c.id]}
                onClick={() => flipChip(c.id)}
              >
                <span className="dot"></span>{c.label}
              </button>
            ))}
          </div>
          <span className="sw-spacer"></span>
          {pills.length > 0 ? (
            <div className="fpills" role="group" aria-label="適用中の絞り込み条件">
              {pills.map((p) => (
                <button key={p.key} className="fpill" onClick={p.clear}
                  aria-label={`${p.label} を解除`}>
                  {p.label}<span className="fpill-x" aria-hidden="true">×</span>
                </button>
              ))}
            </div>
          ) : null}
          {showReset ? (
            <button className="reset-link" onClick={resetFilters}>条件をリセット</button>
          ) : null}
        </div>

        <button
          className="filter-trigger"
          aria-expanded={sheetOpen}
          onClick={() => setSheetOpen(true)}
        >
          <SearchIcon />
          <span className="ft-label">絞り込み条件を変更</span>
          {activeCount > 0 ? <span className="ft-badge">条件 {activeCount}</span> : null}
        </button>
      </div>

      <div className="axisnote">
        <b>この4つの絞り込みは、他の不動産ポータルには存在しません。</b>
        地盤調査・建物検査・保証を自社で行うJHS様だからこそ提供できる検索軸です。
      </div>

      <FilterSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        all={all}
        options={options}
        chips={CHIPS}
      />
    </div>
  )
}
