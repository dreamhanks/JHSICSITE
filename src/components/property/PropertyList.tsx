import type { Property } from '../../types/property'
import { Pagination } from './Pagination'
import { PropertyCard } from './PropertyCard'

/** One removable pill per active filter. */
export type AppliedPill = { key: string; label: string; clear: () => void }

export function PropertyList({
  pageItems: items, total, loading, page, activeId, pills,
  onOpen, onPageChange, onReset,
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
  onOpen: (id: number) => void
  onPageChange: (p: number) => void
  onReset: () => void
}) {
  return (
    <div>
      {/* Design B: the differentiator sentence and the applied-filter
          pills sit together directly above the results, next to the
          count. Both answer "what am I looking at", which is a result
          concern, not a header one. 並び替え moved the other way, into
          the sticky header row with the rest of the controls. */}
      <div className="resctx">
        <div className="axisnote">
          <b>この4つの絞り込みは、他の不動産ポータルには存在しません。</b>
          地盤調査・建物検査・保証を自社で行うJHS様だからこそ提供できる検索軸です。
        </div>
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

      <div className="listhead">
        <h2>掲載物件</h2>
        <span className="cnt">
          {loading ? null : <><b>{total}</b> 件／全件が既存住宅診断済み</>}
        </span>
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
