import type { Property } from '../../types/property'
import { Pagination } from './Pagination'
import { PropertyCard, type CardVariant } from './PropertyCard'

/** One removable pill per active filter. */
export type AppliedPill = { key: string; label: string; clear: () => void }

export function PropertyList({
  pageItems: items, total, loading, page, activeId, pills, variant = 'row',
  onOpen, onPageChange, onReset, onHover,
}: {
  /** Just the current page's results. */
  pageItems: Property[]
  /** Filtered total across all pages. */
  total: number
  loading: boolean
  page: number
  activeId: number | null
  /** Applied-filter pills, built by the page from the same options the
   *  header bar uses. */
  pills: AppliedPill[]
  variant?: CardVariant
  onOpen: (id: number) => void
  onPageChange: (p: number) => void
  onReset: () => void
  /** Card hover highlights the matching pin. Absent on マイページ. */
  onHover?: (id: number | null) => void
}) {
  return (
    <div>
      {/* The axisnote moved into the こだわり dropdown, next to the four
          chips it describes. What stays here is the applied-filter
          pills — "what am I looking at" belongs with the results. */}
      <div className="resctx">
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
      </div>

      {/* The count lives in header row 2, where it can be seen while a
          filter is being changed. Repeating it here 200px lower was pure
          duplication, so the number is gone and only the claim it
          qualified remains. Authorised label change. */}
      <div className="listhead">
        <h2>掲載物件</h2>
        <span className="cnt">{loading ? null : '全件が既存住宅診断済み'}</span>
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
          <div className={variant === 'card' ? 'plist pgrid' : 'plist'}>
            {items.map((p, i) => (
              <PropertyCard
                key={p.id} property={p} active={p.id === activeId}
                onOpen={onOpen} eager={i < 2}
                variant={variant} onHover={onHover}
              />
            ))}
          </div>
          <Pagination total={total} page={page} onChange={onPageChange} />
        </>
      )}
    </div>
  )
}
