import { useEffect, useRef, useState } from 'react'
import { getProperties } from '../../api/properties'
import type { ChipId } from '../../context/appState'
import { useAppState } from '../../context/useAppState'
import {
  buildAreaOptions, buildPlanOptions, buildPriceOptions, buildStationOptions,
  countActiveFilters, filterProperties, hasActiveFilters, SORT_OPTIONS,
  type FieldOptions, type FilterSelectKey, type SortKey,
} from '../../lib/propertySearch'
import type { Property } from '../../types/property'
import { FilterIcon, SearchIcon } from '../art/Icons'
import { CHIPS } from './filterChips'
import { FilterSheet } from './FilterSheet'

/** Shown only for the ~300ms before the record set arrives. */
const PLACEHOLDER: FieldOptions = {
  ward: [{ value: '', label: 'すべて' }],
  station: [{ value: '', label: 'すべて' }],
  price: [{ value: '', label: 'すべて' }],
  plan: [{ value: '', label: 'すべて' }],
}

/** `short` is the 1060px fallback label. Row 2 must never wrap, so the
 *  pills shed words rather than the row gaining a line. */
const FIELDS: { key: FilterSelectKey; label: string; short: string }[] = [
  { key: 'ward', label: 'エリア', short: 'エリア' },
  { key: 'station', label: '沿線・駅', short: '駅' },
  { key: 'price', label: '価格帯', short: '価格' },
  { key: 'plan', label: '間取り', short: '間取' },
]

/** `墨田区（62）` -> `墨田区`. A set pill shows the value, not the count. */
const stripCount = (label: string) => label.replace(/（\d+）$/, '')

/** Long enough that the commit does not fire per keystroke, short enough
 *  that the count still feels live. */
const KEYWORD_DEBOUNCE_MS = 250

export function HeaderFilters() {
  const {
    pendingFilters, appliedFilters, commitFilters, resetFilters,
    sortKey, setSortKey,
  } = useAppState()

  const [all, setAll] = useState<Property[]>([])
  const [loaded, setLoaded] = useState(false)
  const [options, setOptions] = useState<FieldOptions>(PLACEHOLDER)
  const [sheetOpen, setSheetOpen] = useState(false)
  /** Which pill's panel is open, or null. Only ever one at a time. */
  const [openPill, setOpenPill] = useState<string | null>(null)
  /** The text box's own state. Committed to appliedFilters on a debounce,
   *  so every keystroke does not re-filter 100 records and reset the page. */
  const [kw, setKw] = useState(appliedFilters.keyword)
  const barRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let alive = true
    getProperties().then((list) => {
      if (!alive) return
      setAll(list)
      setLoaded(true)
      setOptions({
        ward: buildAreaOptions(list),
        station: buildStationOptions(list),
        price: buildPriceOptions(list),
        plan: buildPlanOptions(list),
      })
    })
    return () => { alive = false }
  }, [])

  /* Keep the box in step when the keyword is cleared from elsewhere —
     条件をリセット in the こだわり panel, or the mobile sheet. */
  useEffect(() => { setKw(appliedFilters.keyword) }, [appliedFilters.keyword])

  /* Debounced commit. The equality guard is what stops this ping-ponging
     with the sync effect above, and also makes the mount pass a no-op. */
  useEffect(() => {
    if (kw === appliedFilters.keyword) return
    const t = setTimeout(
      () => commitFilters({ ...appliedFilters, keyword: kw }),
      KEYWORD_DEBOUNCE_MS,
    )
    return () => clearTimeout(t)
  }, [kw, appliedFilters, commitFilters])

  /* Dismiss an open pill on outside click or Escape. Plain listeners
     rather than a library; the panel is a menu of buttons, so the native
     tab order already handles keyboard traversal. */
  useEffect(() => {
    if (openPill === null) return
    const onDown = (e: MouseEvent) => {
      if (!barRef.current?.contains(e.target as Node)) setOpenPill(null)
    }
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpenPill(null) }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [openPill])

  /* EXACTLY the Design A desktop path: both halves move together and the
     page resets. No new filter logic — commitFilters is the same entry
     point the old search bar used. */
  const changeSelect = (key: FilterSelectKey, value: string) =>
    commitFilters({ ...appliedFilters, [key]: value })
  const flipChip = (id: ChipId) =>
    commitFilters({
      ...appliedFilters,
      chips: { ...appliedFilters.chips, [id]: !appliedFilters.chips[id] },
    })

  /** Clearing is immediate — waiting 250ms to undo feels broken. */
  const clearKeyword = () => {
    setKw('')
    commitFilters({ ...appliedFilters, keyword: '' })
  }

  /* Same function the list page uses, over the same applied filters, so
     this count and the one the results render can never disagree. */
  const resultCount = loaded ? filterProperties(all, appliedFilters).length : null

  const activeCount = countActiveFilters(appliedFilters)
  const chipCount = CHIPS.filter((c) => appliedFilters.chips[c.id]).length
  const showReset = hasActiveFilters(pendingFilters) || hasActiveFilters(appliedFilters)

  const labelFor = (f: typeof FIELDS[number]) => {
    const v = appliedFilters[f.key]
    if (v === '') return { text: f.label, short: f.short, set: false }
    const opt = options[f.key].find((o) => o.value === v)
    const text = stripCount(opt?.label ?? v)
    return { text, short: text, set: true }
  }

  return (
    <div className="hfilters" ref={barRef}>
      <div className="hfwrap">
        {/* First in the row, and the only control besides 絞り込み that
            survives to mobile. A light field on the dark bar so it reads
            as an input rather than a sixth pill. */}
        <div className="hf-search">
          <SearchIcon />
          <input
            type="text"
            value={kw}
            onChange={(e) => setKw(e.target.value)}
            placeholder="エリア・駅・キーワードで検索"
            aria-label="エリア・駅・キーワードで検索"
          />
          {kw !== '' ? (
            <button className="hf-search-x" onClick={clearKeyword} aria-label="検索キーワードを消す">
              ×
            </button>
          ) : null}
        </div>

        {FIELDS.map((f) => {
          const { text, short, set } = labelFor(f)
          const open = openPill === f.key
          return (
            <div key={f.key} className="hf-pill-wrap">
              <button
                className={set ? 'hf-pill set' : 'hf-pill'}
                aria-expanded={open}
                onClick={() => setOpenPill(open ? null : f.key)}
              >
                <span className="hf-pill-t">{text}</span>
                <span className="hf-pill-s" aria-hidden="true">{short}</span>
                <span className="hf-caret" aria-hidden="true">▾</span>
              </button>
              {open ? (
                <div className="hf-panel" role="group" aria-label={f.label}>
                  {options[f.key].map((o) => (
                    <button
                      key={o.value}
                      className={o.value === appliedFilters[f.key] ? 'hf-opt on' : 'hf-opt'}
                      onClick={() => { changeSelect(f.key, o.value); setOpenPill(null) }}
                    >
                      {o.label}
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
          )
        })}

        {/* こだわり holds the four chips and, per Design B, 条件をリセット. */}
        <div className="hf-pill-wrap">
          <button
            className={chipCount > 0 ? 'hf-pill set' : 'hf-pill'}
            aria-expanded={openPill === 'refine'}
            onClick={() => setOpenPill(openPill === 'refine' ? null : 'refine')}
          >
            <span className="hf-pill-t">こだわり</span>
            <span className="hf-pill-s" aria-hidden="true">こだわり</span>
            {chipCount > 0 ? <span className="hf-n">{chipCount}</span> : null}
            <span className="hf-caret" aria-hidden="true">▾</span>
          </button>
          {openPill === 'refine' ? (
            <div className="hf-panel refine" role="group" aria-label="こだわり条件">
              {/* The differentiator sentence now introduces the four chips
                  it was always about, instead of sitting above the results
                  explaining controls that had moved into this dropdown. */}
              <p className="refine-note">
                <b>この4つの絞り込みは、他の不動産ポータルには存在しません。</b>
                地盤調査・建物検査・保証を自社で行うJHS様だからこそ提供できる検索軸です。
              </p>
              {CHIPS.map((c) => (
                <button
                  key={c.id}
                  className={c.variant ? `chip ${c.variant}` : 'chip'}
                  aria-pressed={appliedFilters.chips[c.id]}
                  onClick={() => flipChip(c.id)}
                >
                  <span className="dot"></span>{c.label}
                </button>
              ))}
              {showReset ? (
                <button className="reset-link" onClick={() => { resetFilters(); setOpenPill(null) }}>
                  条件をリセット
                </button>
              ) : null}
            </div>
          ) : null}
        </div>

        {/* The count sits with the controls, not only above the list: on a
            filter-driven bar, changing a pill has to visibly move a number
            or it reads as having done nothing. */}
        {resultCount !== null ? (
          <span className="hf-count" aria-live="polite"><b>{resultCount}</b>件</span>
        ) : null}

        <span className="hf-spacer"></span>

        {/* Moved out of .listhead: sort belongs with the other controls
            now that they are all in the sticky header. */}
        <select
          className="hf-sort" aria-label="並び替え"
          value={sortKey}
          onChange={(e) => setSortKey(e.target.value as SortKey)}
        >
          {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>

        {/* Below 640px the pills are hidden and this sits beside the search
            box as a compact icon-plus-count button — the long label is
            dropped there so both fit one line. */}
        <button
          className="filter-trigger"
          aria-expanded={sheetOpen}
          aria-label={`絞り込み条件を変更（${activeCount}件適用中）`}
          onClick={() => setSheetOpen(true)}
        >
          <FilterIcon />
          <span className="ft-label">絞り込み</span>
          {activeCount > 0 ? <span className="ft-badge">{activeCount}</span> : null}
        </button>
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
