/** Design B mobile: the 一覧 / 地図 segmented control, ≤640px only.
 *
 *  THE BUG THIS FIXES. The inherited layout stacked a 260px map above
 *  the list, mid-document. It extended below the fold, so a finger meant
 *  to scroll the page landed on the map and panned it instead — the
 *  failure NN/g describes for interactive maps on mobile result pages.
 *  One view at a time, explicitly chosen, and the two gestures can never
 *  be confused.
 *
 *  一覧 IS THE DEFAULT, per NN/g: the list has higher information
 *  density and makes selecting faster. That default is set where mapOpen
 *  is initialised in AppStateContext, not here — see the note there.
 *
 *  Two real <button>s rather than one control with a moving thumb:
 *  aria-pressed states the selection on each, both are in the tab order,
 *  and Enter and Space activate them natively with no key handling.
 *  role="group" rather than radiogroup, because these are buttons that
 *  act immediately, not a value being chosen and submitted. */
export function ViewToggle({
  mapOpen, onChange, count,
}: {
  mapOpen: boolean
  onChange: (wantMap: boolean) => void
  /** null while the record set is still loading. */
  count: number | null
}) {
  return (
    <div className="vtoggle">
      <div className="vtseg" role="group" aria-label="表示切り替え">
        <button
          className={mapOpen ? 'vtbtn' : 'vtbtn on'}
          aria-pressed={!mapOpen}
          onClick={() => onChange(false)}
        >
          一覧
        </button>
        <button
          className={mapOpen ? 'vtbtn on' : 'vtbtn'}
          aria-pressed={mapOpen}
          onClick={() => onChange(true)}
        >
          地図
        </button>
      </div>

      {/* The count is REINTRODUCED here, not moved: .hf-count is
          display:none below 640px and .listhead was stripped of its
          number, so mobile had no visible result count at all outside
          the filter sheet. Fed from the same results.length the list
          renders, so the two can never disagree. A display:none node is
          not announced, so the header's own aria-live copy cannot
          double up with this one. */}
      {count !== null ? (
        <span className="vtcount" aria-live="polite"><b>{count}</b>件</span>
      ) : null}
    </div>
  )
}
