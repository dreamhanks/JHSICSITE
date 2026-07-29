import { useEffect } from 'react'
import type { ChipId } from '../../context/appState'
import { useAppState } from '../../context/useAppState'
import {
  filterProperties, hasActiveFilters,
  type FieldOptions, type FilterSelectKey,
} from '../../lib/propertySearch'
import type { Property } from '../../types/property'

/** The mobile filter panel. Rendered as `class="msheet fsheet"` so it
 *  inherits the existing nav-drawer overlay wholesale — .msheet, .bg,
 *  .pane, .mh and .x all come from the ported CSS. Only the pane width
 *  is overridden, in the Step 2b block.
 *
 *  It edits pendingFilters, exactly like the desktop bar; nothing here
 *  introduces a parallel filter mechanism. */
export function FilterSheet({
  open, onClose, all, options, chips,
}: {
  open: boolean
  onClose: () => void
  all: Property[]
  options: FieldOptions
  chips: { id: ChipId; variant: '' | 'o' | 'b'; label: string }[]
}) {
  const {
    pendingFilters, appliedFilters, setPendingSelect, toggleChip,
    applyFilters, discardPendingFilters, resetFilters,
  } = useAppState()

  // Body scroll lock while the panel is open.
  useEffect(() => {
    if (!open) return
    document.body.classList.add('fsheet-open')
    return () => { document.body.classList.remove('fsheet-open') }
  }, [open])

  /** Live count for the pending edits, recomputed on every change. */
  const pendingCount = filterProperties(all, pendingFilters).length
  const showReset = hasActiveFilters(pendingFilters) || hasActiveFilters(appliedFilters)

  /** × and background dismiss without applying. */
  const cancel = () => {
    discardPendingFilters()
    onClose()
  }

  const apply = () => {
    applyFilters() // also resets to page 1 and scrolls the list to top
    onClose()
  }

  const reset = () => {
    resetFilters() // clears pending + applied, page 1, scrolls to top
    onClose()
  }

  const rows: { key: FilterSelectKey; label: string }[] = [
    { key: 'ward', label: 'エリア' },
    { key: 'station', label: '沿線・駅' },
    { key: 'price', label: '価格帯' },
    { key: 'plan', label: '間取り' },
  ]

  return (
    <div className={open ? 'msheet fsheet show' : 'msheet fsheet'}>
      <div className="bg" onClick={cancel}></div>
      <div className="pane">
        <div className="mh">
          <b>絞り込み条件</b>
          <span className="mh-actions">
            {showReset ? (
              <button className="reset-link" onClick={reset}>条件をリセット</button>
            ) : null}
            <button className="x" aria-label="閉じる" onClick={cancel}>×</button>
          </span>
        </div>

        <div className="fs-body">
          {rows.map((r) => (
            <label key={r.key} className="fs-row">
              <span className="fs-label">{r.label}</span>
              <select
                className="field"
                value={pendingFilters[r.key]}
                onChange={(e) => setPendingSelect(r.key, e.target.value)}
              >
                {options[r.key].map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </label>
          ))}

          <div className="fs-sep"></div>

          <span className="fs-label" id="fs-chip-label">こだわり条件</span>
          {/* The same differentiator sentence the こだわり dropdown carries.
              It has to be here too: the dropdown does not exist below
              640px — the pills are hidden and this sheet replaces them —
              so putting it only there would lose it entirely on mobile. */}
          <p className="refine-note">
            <b>この4つの絞り込みは、他の不動産ポータルには存在しません。</b>
            地盤調査・建物検査・保証を自社で行うJHS様だからこそ提供できる検索軸です。
          </p>
          <div className="fs-chips" role="group" aria-labelledby="fs-chip-label">
            {chips.map((c) => (
              <button
                key={c.id}
                className={c.variant ? `chip ${c.variant}` : 'chip'}
                aria-pressed={pendingFilters.chips[c.id]}
                onClick={() => toggleChip(c.id)}
              >
                <span className="dot"></span>{c.label}
              </button>
            ))}
          </div>
        </div>

        <div className="fs-foot">
          <button className="fsubmit" onClick={apply}>
            この条件で探す（{pendingCount}件）
          </button>
        </div>
      </div>
    </div>
  )
}
