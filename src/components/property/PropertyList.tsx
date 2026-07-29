import { SORT_OPTIONS, type SortKey } from '../../lib/propertySearch'
import type { Property } from '../../types/property'
import { Pagination } from './Pagination'
import { PropertyCard } from './PropertyCard'

export function PropertyList({
  pageItems: items, total, loading, page, activeId, sortKey,
  onOpen, onPageChange, onReset, onSortChange,
}: {
  /** Just the current page's results. */
  pageItems: Property[]
  /** Filtered total across all pages. */
  total: number
  loading: boolean
  page: number
  activeId: number | null
  sortKey: SortKey
  onOpen: (id: number) => void
  onPageChange: (p: number) => void
  onReset: () => void
  onSortChange: (k: SortKey) => void
}) {
  return (
    <div>
      <div className="listhead">
        <h2>掲載物件</h2>
        <span className="cnt">
          {loading ? null : <><b>{total}</b> 件／全件が既存住宅診断済み</>}
        </span>
        {/* 並び替え lives here, not in the search bar: it applies
            immediately, whereas the selects and chips need 探す. */}
        <select
          className="field sortsel" aria-label="並び替え"
          value={sortKey}
          onChange={(e) => onSortChange(e.target.value as SortKey)}
        >
          {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="plist">
          {Array.from({ length: 6 }, (_, i) => <div key={i} className="sk sk-card" />)}
        </div>
      ) : total === 0 ? (
        /* Reuses the .emptyfav block rather than inventing a new visual. */
        <div className="emptyfav">
          <b>該当する物件がありません</b>
          <div>条件を変更するか、条件をリセットしてお試しください。</div>
          <button className="go2" onClick={onReset}>条件をリセット</button>
        </div>
      ) : (
        <>
          <div className="plist">
            {items.map((p, i) => (
              <PropertyCard
                key={p.id} property={p} active={p.id === activeId}
                onOpen={onOpen} eager={i < 2}
              />
            ))}
          </div>
          <Pagination total={total} page={page} onChange={onPageChange} />
        </>
      )}
    </div>
  )
}
