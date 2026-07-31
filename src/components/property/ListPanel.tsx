import { useEffect, useRef } from 'react'
import { useAppState } from '../../context/useAppState'
import { SORT_OPTIONS, formatRange, type SortKey } from '../../lib/propertySearch'
import type { Property } from '../../types/property'
import { Pagination } from './Pagination'
import { PanelCard } from './PanelCard'

/** Design C Stage 2: the results panel floating over the map.
 *
 *  Three bands. The head and the foot are flex:none, the scroller is
 *  flex:1 with its own overflow — so the count, 並び替え and the
 *  disclosure all stay put while the cards move.
 *
 *  WHERE .mapfoot's two strings went, both verbatim:
 *    formatRange(total, page) -> the head, beside the count. It
 *      describes the list, so it belongs with the list.
 *    the 一般公開／会員限定 disclosure -> the foot, pinned below the
 *      pagination.
 *  .mapfoot itself no longer exists in this layout; it survives
 *  unchanged in the stacked fallback, where MapPanel still renders it.
 *
 *  PAGINATION sits INSIDE the scroller, at the end of the cards, not
 *  pinned. Two reasons: the pager runs to seven controls plus two
 *  arrows, which at 330px is a full row that would permanently cost
 *  ~44px of card space on top of the pinned foot; and reaching the end
 *  of ten results is exactly when "here is how to get more" should
 *  appear. Being inside the scroll is safe because goToPage scrolls
 *  this panel back to the top, so the pager is never left stranded
 *  off-screen after a page change. */
export function ListPanel({
  pageItems: items, total, loading, page, activeId, sortKey, collapsed,
  onOpen, onPageChange, onReset, onSortChange, onHoverIn, onHoverOut, onToggle,
}: {
  pageItems: Property[]
  total: number
  loading: boolean
  page: number
  activeId: number | null
  sortKey: SortKey
  collapsed: boolean
  onOpen: (id: number) => void
  onPageChange: (p: number) => void
  onReset: () => void
  onSortChange: (k: SortKey) => void
  onHoverIn: (id: number) => void
  onHoverOut: (id: number) => void
  onToggle: () => void
}) {
  const { registerScrollTarget } = useAppState()
  const scrollRef = useRef<HTMLDivElement>(null)

  /* The context's "scroll to top" has to reach THIS element, because on
     this layout the document does not scroll. Registered on mount and
     cleared on unmount, so nothing is registered in the stacked
     fallback or on any other view. */
  useEffect(() => {
    registerScrollTarget(scrollRef.current)
    return () => registerScrollTarget(null)
  }, [registerScrollTarget])

  return (
    <>
      {/* The collapse control is a SIBLING of the panel, not a child, so
          it stays on screen when the panel translates off. It is the
          same button in both states — it flips its glyph, its label and
          aria-expanded — which is what brings the panel back. */}
      <button
        className={collapsed ? 'lpanel-tog collapsed' : 'lpanel-tog'}
        aria-expanded={!collapsed}
        aria-label={collapsed ? '掲載物件を表示する' : '掲載物件を閉じる'}
        onClick={onToggle}
      >
        <span aria-hidden="true">{collapsed ? '‹' : '›'}</span>
      </button>

      {/* inert, not just aria-hidden. pointer-events:none stops the
          mouse but leaves every card button, the sort select and the
          pager in the tab order, so a keyboard user would tab into a
          panel that is translated off screen — and aria-hidden over a
          focusable subtree is itself an a11y fault. inert removes
          focusability, which is what makes the aria-hidden safe. */}
      <aside
        className={collapsed ? 'lpanel collapsed' : 'lpanel'}
        aria-hidden={collapsed}
        inert={collapsed}
      >
        <div className="lpanel-head">
          <h2>掲載物件</h2>
          <span className="cnt">
            {loading ? null : <><b>{total}</b> 件／全件が既存住宅診断済み</>}
          </span>
          <span className="lrange">{loading ? null : formatRange(total, page)}</span>
          <select
            className="field sortsel" aria-label="並び替え"
            value={sortKey}
            onChange={(e) => onSortChange(e.target.value as SortKey)}
          >
            {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>

        <div className="lpanel-scroll" ref={scrollRef}>
          {loading ? (
            <div className="lstack">
              {Array.from({ length: 4 }, (_, i) => <div key={i} className="sk sk-lcard" />)}
            </div>
          ) : total === 0 ? (
            <div className="emptyfav">
              <b>該当する物件がありません</b>
              <div>条件を変更するか、条件をリセットしてお試しください。</div>
              <button className="go2" onClick={onReset}>条件をリセット</button>
            </div>
          ) : (
            <>
              <div className="lstack">
                {items.map((p, i) => (
                  <PanelCard
                    key={p.id} property={p} active={p.id === activeId}
                    onOpen={onOpen} onHoverIn={onHoverIn} onHoverOut={onHoverOut}
                    eager={i < 2}
                  />
                ))}
              </div>
              <Pagination total={total} page={page} onChange={onPageChange} />
            </>
          )}
        </div>

        <div className="lpanel-foot">
          <div>
            物件所在エリア・価格・間取りは<strong>一般公開</strong>。診断報告書・図面・地盤調査報告書は<strong>会員限定</strong>で公開します。
          </div>
          {/* The site footer is hidden on this view because the page does
              not scroll, and it carried the Unsplash credit required by
              their API guidelines — on the one view that shows the most
              photos. The line is reproduced here verbatim from
              Footer.tsx, at the same type size as the disclosure above. */}
          <div className="lcredit">
            物件写真は{' '}
            <a href="https://unsplash.com?utm_source=homille&utm_medium=referral"
               target="_blank" rel="noopener noreferrer">Unsplash</a>
            {' '}の写真家による作品です。
          </div>
        </div>
      </aside>
    </>
  )
}
