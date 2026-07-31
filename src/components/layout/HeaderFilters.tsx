import { useEffect, useRef, useState } from 'react'
import { getProperties } from '../../api/properties'
import type { ChipId } from '../../context/appState'
import { useAppState } from '../../context/useAppState'
import { useMediaQuery } from '../../hooks/useMediaQuery'
import { HEADER_PILLS_QUERY, WIDE_QUERY } from '../../lib/breakpoints'
import {
  buildAreaOptions, buildPlanOptions, buildPriceOptions, buildStationOptions,
  countActiveFilters, hasActiveFilters, type FilterSelectKey,
} from '../../lib/propertySearch'
import { AxisNote } from './AxisNote'
import { CHIPS, FIELDS, PLACEHOLDER, stripCount, type FieldOptions } from './filterFields'

/** Design C Stage 2b: the filter controls, in the header row.
 *
 *  This is the WIDE arm of the list view's filter surface. SearchBar is
 *  the narrow arm, and the two are the branches of one conditional in
 *  ListPage — see breakpoints.ts. They can never be mounted together, so
 *  SearchBar keeps sole ownership of the f-ward / f-station / f-price /
 *  f-plan ids and its label htmlFor pairings are untouched.
 *
 *  NO FILTER LOGIC LIVES HERE. changeSelect and flipChip are the same
 *  two lines SearchBar uses, over the same commitFilters, and every
 *  option list comes from the same builders in propertySearch.ts, which
 *  is not modified.
 *
 *  CHIPS, FIELDS, PLACEHOLDER, stripCount and the axisnote are imported
 *  from filterFields.ts and AxisNote.tsx, which both surfaces share, so
 *  a chip or a field label can only ever be changed in one place. FIELDS
 *  carries an `id` per field for SearchBar's label htmlFor pairings;
 *  this surface deliberately ignores it, because its pills are buttons
 *  with no paired <label> and it mints no element ids at all. */

type PanelId = FilterSelectKey | 'refine' | 'all'

export function HeaderFilters() {
  const { appliedFilters, commitFilters, resetFilters } = useAppState()

  const wide = useMediaQuery(WIDE_QUERY)
  const expanded = useMediaQuery(HEADER_PILLS_QUERY)

  const [options, setOptions] = useState<FieldOptions>(PLACEHOLDER)
  const [open, setOpen] = useState<PanelId | null>(null)
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let alive = true
    getProperties().then((list) => {
      if (!alive) return
      setOptions({
        ward: buildAreaOptions(list),
        station: buildStationOptions(list),
        price: buildPriceOptions(list),
        plan: buildPlanOptions(list),
      })
    })
    return () => { alive = false }
  }, [])

  /* A panel anchored to a pill that is about to be replaced by the
     collapsed one (or unmounted entirely) would be left orphaned, so the
     open panel is dropped whenever the layout crosses either boundary. */
  useEffect(() => { setOpen(null) }, [expanded, wide])

  /* pointerdown, not click: it fires before focus moves, so dismissing
     by pressing the map does not first hand focus to the map canvas. */
  useEffect(() => {
    if (open === null) return
    const onDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(null)
    }
    document.addEventListener('pointerdown', onDown)
    return () => { document.removeEventListener('pointerdown', onDown) }
  }, [open])

  // Every hook is above this line, so the early return is safe.
  if (!wide) return null

  /* ---- the only two filter operations, both from SearchBar ---- */
  const changeSelect = (key: FilterSelectKey, value: string) =>
    commitFilters({ ...appliedFilters, [key]: value })
  const flipChip = (id: ChipId) =>
    commitFilters({
      ...appliedFilters,
      chips: { ...appliedFilters.chips, [id]: !appliedFilters.chips[id] },
    })

  const showReset = hasActiveFilters(appliedFilters)
  const activeCount = countActiveFilters(appliedFilters)
  const chipCount = Object.values(appliedFilters.chips).filter(Boolean).length

  const toggle = (id: PanelId) => setOpen((cur) => (cur === id ? null : id))

  /* Escape closes and returns focus to the pill that opened the panel,
     which is where the user's attention was. The trigger is found by
     data attribute rather than a ref map — one query on one keypress. */
  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== 'Escape' || open === null) return
    e.stopPropagation()
    const trigger = rootRef.current
      ?.querySelector<HTMLButtonElement>(`[data-pill="${open}"]`)
    setOpen(null)
    trigger?.focus()
  }

  /** The axisnote, moved off the map and into the panel. The same
   *  component SearchBar renders; .cfil-note resets the ported
   *  .axisnote's page-level width and padding for a 360px panel. */
  const axisnote = <AxisNote className="cfil-note" />

  const chipGroup = (labelledBy: string) => (
    <div className="chips cfil-chips" role="group" aria-labelledby={labelledBy}>
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
    </div>
  )

  const resetRow = showReset ? (
    <button className="reset-link cfil-reset" onClick={() => { resetFilters(); setOpen(null) }}>
      条件をリセット
    </button>
  ) : null

  /* ---- one select pill: label when unset, VALUE when set ---- */
  const selectPill = (f: { key: FilterSelectKey; label: string }) => {
    const v = appliedFilters[f.key]
    const set = v !== ''
    const value = set ? stripCount(options[f.key].find((o) => o.value === v)?.label ?? v) : ''
    const panelId = `cfil-pop-${f.key}`
    return (
      <div key={f.key} className="cfil-slot">
        <button
          type="button"
          data-pill={f.key}
          id={`cfil-${f.key}`}
          className={set ? 'cfil-pill set' : 'cfil-pill'}
          aria-haspopup="listbox"
          aria-expanded={open === f.key}
          aria-controls={open === f.key ? panelId : undefined}
          /* Composed accessible name: the pill shows only the value once
             set, so the field it belongs to has to come from here. The
             title carries the untruncated value for the clamped pills. */
          aria-label={set ? `${f.label}: ${value}` : undefined}
          title={set ? value : undefined}
          onClick={() => toggle(f.key)}
        >
          <span className="cfil-t">{set ? value : f.label}</span>
          <span className="cfil-caret" aria-hidden="true">▾</span>
        </button>
        {open === f.key ? (
          <div className="cfil-pop" id={panelId}>
            <div className="cfil-opts" role="listbox" aria-labelledby={`cfil-${f.key}`}>
              {options[f.key].map((o) => (
                <button
                  key={o.value}
                  type="button"
                  role="option"
                  aria-selected={o.value === v}
                  className={o.value === v ? 'cfil-opt on' : 'cfil-opt'}
                  onClick={() => { changeSelect(f.key, o.value); setOpen(null) }}
                >
                  {o.label}
                </button>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    )
  }

  /* ---- こだわり: chips + axisnote + reset ---- */
  const refinePill = (
    <div className="cfil-slot">
      <button
        type="button"
        data-pill="refine"
        id="cfil-refine"
        className={chipCount > 0 ? 'cfil-pill set' : 'cfil-pill'}
        aria-haspopup="dialog"
        aria-expanded={open === 'refine'}
        aria-controls={open === 'refine' ? 'cfil-pop-refine' : undefined}
        onClick={() => toggle('refine')}
      >
        <span className="cfil-t">こだわり</span>
        {chipCount > 0 ? <span className="cfil-n">{chipCount}</span> : null}
        <span className="cfil-caret" aria-hidden="true">▾</span>
      </button>
      {open === 'refine' ? (
        <div className="cfil-pop cfil-pop-refine" id="cfil-pop-refine">
          {axisnote}
          {chipGroup('cfil-refine')}
          {resetRow}
        </div>
      ) : null}
    </div>
  )

  /* ---- collapsed: one 絞り込み pill holding everything ---- */
  const collapsedPill = (
    <div className="cfil-slot">
      <button
        type="button"
        data-pill="all"
        id="cfil-all"
        className={activeCount > 0 ? 'cfil-pill set' : 'cfil-pill'}
        aria-haspopup="dialog"
        aria-expanded={open === 'all'}
        aria-controls={open === 'all' ? 'cfil-pop-all' : undefined}
        onClick={() => toggle('all')}
      >
        <span className="cfil-t">絞り込み</span>
        {/* The count is what keeps the collapse from hiding that filters
            are applied. Same countActiveFilters the mobile trigger uses. */}
        {activeCount > 0 ? <span className="cfil-n">{activeCount}</span> : null}
        <span className="cfil-caret" aria-hidden="true">▾</span>
      </button>
      {open === 'all' ? (
        <div className="cfil-pop cfil-pop-all" id="cfil-pop-all">
          {/* Wrapping <label>s, exactly as FilterSheet does, so the four
              selects are named without minting ids that could ever
              collide with SearchBar's. */}
          <div className="cfil-rows">
            {FIELDS.map((f) => (
              <label key={f.key} className="cfil-row">
                <span className="cfil-rowlabel">{f.label}</span>
                <select
                  className="field"
                  value={appliedFilters[f.key]}
                  onChange={(e) => changeSelect(f.key, e.target.value)}
                >
                  {options[f.key].map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </label>
            ))}
          </div>
          <div className="cfil-sep"></div>
          <span className="refine-label cfil-rowlabel" id="cfil-all-refine">こだわり条件</span>
          {axisnote}
          {chipGroup('cfil-all-refine')}
          {resetRow}
        </div>
      ) : null}
    </div>
  )

  return (
    <div className="cfilters" ref={rootRef} onKeyDown={onKeyDown}>
      <span className="cfil-rule" aria-hidden="true"></span>
      {expanded ? (
        <>
          {FIELDS.map(selectPill)}
          {refinePill}
        </>
      ) : collapsedPill}
      <span className="cfil-rule" aria-hidden="true"></span>
    </div>
  )
}
