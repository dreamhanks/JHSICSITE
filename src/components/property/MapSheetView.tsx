import { useCallback, useEffect, useRef, useState } from 'react'
import { useAppState } from '../../context/useAppState'
import { AxisNote } from '../layout/AxisNote'
import { SORT_OPTIONS, formatRange, type SortKey } from '../../lib/propertySearch'
import type { Property } from '../../types/property'
import { BottomSheet, type Snap } from './BottomSheet'
import { Pagination } from './Pagination'
import { PanelCard } from './PanelCard'
import { PropertyMap } from './PropertyMap'

/** Design C Stage 6: 物件検索 at 640px and below.
 *
 *  THE BUG THIS FIXES. The stacked layout put the map card mid-document,
 *  so it extended below the fold and a finger meant for the page landed
 *  on the map and panned it — the failure NN/g describes for interactive
 *  maps on mobile result pages. Here the map is FIXED and only the sheet
 *  scrolls, so the two gestures can never be confused.
 *
 *  WHAT MOVED OFF MapPanel'S CHROME, and where it went — the same
 *  resolution the desktop MapStage/ListPanel split used:
 *    .legend            -> floats on the map, bottom left
 *    .mapfoot formatRange -> the sheet header, beside the count
 *    .mapfoot disclosure  -> the sheet foot
 *    h2 マップから探す…  -> DROPPED, approved: it covered the map it
 *                           labelled, and the ward names are legible on
 *                           the tiles themselves. MapPanel's h2 still
 *                           carries the string at 641-1060px.
 *    .map-toggle 地図を閉じる -> DROPPED, approved: closing a full-screen
 *                           map leaves an empty screen, which is why
 *                           Stage 2 dropped it on desktop too.
 *  The Unsplash credit is reproduced in the sheet foot because
 *  body.sheetview hides the site footer, exactly as ListPanel does.
 *
 *  MapPanel itself is untouched and still serves 641-1060px. */

export function MapSheetView({
  pageItems: items, total, loading, page, activeId, sortKey,
  onOpen, onPageChange, onReset, onSortChange, onHighlight,
}: {
  pageItems: Property[]
  total: number
  loading: boolean
  page: number
  activeId: number | null
  sortKey: SortKey
  onOpen: (id: number) => void
  onPageChange: (p: number) => void
  onReset: () => void
  onSortChange: (k: SortKey) => void
  onHighlight: (id: number | null) => void
}) {
  const { registerScrollTarget } = useAppState()
  const scrollRef = useRef<HTMLDivElement>(null)
  const [snap, setSnap] = useState<Snap>('half')
  const [mapFailed, setMapFailed] = useState(false)

  /* §2.6 needs no new call sites. scrollTop() in AppStateContext already
     scrolls whatever is registered here, so paging, filtering, sorting
     and resetting all scroll THIS sheet — and the window.scrollTo half
     of it is a no-op against the locked document, as on desktop.
     Registered on mount, cleared on unmount, so nothing leaks into the
     stacked layout or any other view. */
  useEffect(() => {
    registerScrollTarget(scrollRef.current)
    return () => registerScrollTarget(null)
  }, [registerScrollTarget])

  /* The document stops scrolling. A CLASS, never body.style.overflow:
     FilterSheet sets and clears body.fsheet-open and its cleanup calls
     classList.remove — two separate classes compose, whereas two writers
     of body.style.overflow would leave whichever cleanup ran last in
     charge. Same reasoning as body.mapview on desktop. */
  useEffect(() => {
    document.body.classList.add('sheetview')
    return () => { document.body.classList.remove('sheetview') }
  }, [])

  /* §2.7. A dead map must not leave the reader with a blank screen and
     an unreachable list. */
  useEffect(() => {
    if (mapFailed) setSnap('full')
  }, [mapFailed])

  /* §2.5. Tapping a price pill highlights it; bring the sheet to Half
     and put that card at the top of the scroller. Half rather than Full
     so the pin stays visible — the point of tapping it was the map. */
  useEffect(() => {
    if (activeId == null) return
    setSnap((s) => (s === 'peek' ? 'half' : s))
    const frame = requestAnimationFrame(() => {
      const box = scrollRef.current
      const card = box?.querySelector<HTMLElement>(`[data-pid="${activeId}"]`)
      if (box && card) box.scrollTo({ top: card.offsetTop - box.offsetTop, behavior: 'smooth' })
    })
    return () => cancelAnimationFrame(frame)
  }, [activeId])

  /* PanelCard's hover pair is meaningless without a pointer, and on this
     view activeId is owned by the map's pins. No-ops rather than a
     forked card. */
  const noop = useCallback(() => {}, [])

  const head = (
    <>
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
    </>
  )

  const foot = (
    <>
      {/* The four-axis differentiator sentence. SearchBar's own copy is
          inside the .searchbar band, which this layout collapses to a
          floating filter chip, so it is hidden there and reproduced here
          — the same AxisNote component, not a second copy of the text.
          Above the disclosure and at the disclosure's own size, because
          it is the argument the product is built on and losing it on
          mobile would lose the argument. */}
      <AxisNote className="bsheet-note" />
      <div>
        物件所在エリア・価格・間取りは<strong>一般公開</strong>。診断報告書・図面・地盤調査報告書は<strong>会員限定</strong>で公開します。
      </div>
      <div className="lcredit">
        物件写真は{' '}
        <a href="https://unsplash.com?utm_source=homille&utm_medium=referral"
           target="_blank" rel="noopener noreferrer">Unsplash</a>
        {' '}の写真家による作品です。
      </div>
    </>
  )

  return (
    <div className="msview">
      <div className="msview-map">
        <PropertyMap
          items={items} activeId={activeId}
          onHighlight={onHighlight} onOpen={onOpen}
          onStatus={(s) => setMapFailed(s === 'failed')}
        />
        <div className="legend msview-legend">
          <span><i className="price"></i>販売価格</span>
          <span><i className="warranty"></i>10年保証付</span>
          <span><i className="gated"></i>会員限定公開</span>
        </div>
      </div>

      <BottomSheet snap={snap} onSnapChange={setSnap} scrollRef={scrollRef} head={head} foot={foot}>
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
                <div key={p.id} data-pid={p.id}>
                  <PanelCard
                    property={p} active={p.id === activeId}
                    onOpen={onOpen} onHoverIn={noop} onHoverOut={noop}
                    eager={i < 2}
                  />
                </div>
              ))}
            </div>
            <Pagination total={total} page={page} onChange={onPageChange} />
          </>
        )}
      </BottomSheet>
    </div>
  )
}
