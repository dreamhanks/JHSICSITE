import {
  formatAgeShort, formatAreaShort, formatPriceMan, formatRoomsShort,
  formatTitle, formatWalk,
} from '../../lib/propertyFormat'
import type { Property } from '../../types/property'
import { FavoriteButton } from './FavoriteButton'
import { PropertyPhoto } from './PropertyPhoto'

/** Design C Stage 2: the card for the floating results panel.
 *
 *  A NEW CLASS, not a variant of .pcard. .pcard is already redefined in
 *  five places across homille.css, and the stretched-button pattern it
 *  depends on has been broken three times by exactly that kind of
 *  layering. A sixth override would have been the fourth break. .pcard
 *  and the stacked layout below 1061px are untouched by this file.
 *
 *  The stretched-button pattern itself is reproduced rather than
 *  inherited, and its two invariants hold here:
 *    A. .lcard is position:relative, so it is the nearest positioned
 *       ancestor of .hit and :after{inset:0} measures the whole card.
 *    B. FavoriteButton is a SIBLING of .hit, never nested inside it,
 *       and .lcard .lfav carries a z-index so it sits above the
 *       stretched pseudo-element.
 *
 *  No badges, per the brief: the panel is ~330px wide and the badge row
 *  wrapped to three lines. 会員限定 is not lost with them — it is inside
 *  formatTitle, so it still leads the headline. */
export function PanelCard({
  property, active, onOpen, onHoverIn, onHoverOut, eager = false,
}: {
  property: Property
  active: boolean
  onOpen: (id: number) => void
  /** Hovering a card highlights its pill. See ListPage for how this and
   *  the map's own hover are kept from fighting over activeId. */
  onHoverIn: (id: number) => void
  onHoverOut: (id: number) => void
  /** Set for the first two cards so they do not lazy-load. */
  eager?: boolean
}) {
  const p = property
  return (
    <div
      className={active ? 'lcard active' : 'lcard'}
      onMouseEnter={() => onHoverIn(p.id)}
      onMouseLeave={() => onHoverOut(p.id)}
    >
      <span className="lthumb">
        <PropertyPhoto property={p} room="exterior" eager={eager} />
        <span className="tg">外観</span>
      </span>

      <span className="lbody">
        <div className="lprice">{formatPriceMan(p)}</div>
        {/* The ellipsis lives on an INNER span, never on .hit itself.
            .hit is static, so its overflow would not in fact clip the
            absolutely-positioned :after — but this exact pattern has
            been broken three times, once by putting a clip on the box
            the stretched pseudo-element hangs off, and the span costs
            nothing. Do not move overflow:hidden onto .hit. */}
        <h3 className="lhead">
          <button className="hit" onClick={() => onOpen(p.id)}>
            <span className="ltext">{formatTitle(p)}</span>
          </button>
        </h3>
        <div className="lstn">
          <span>{p.station}</span>
          <span>{formatWalk(p)}</span>
        </div>
        {/* One fact line. The three strings are the existing spec-strip
            formatters verbatim; the separators are CSS borders, so no
            punctuation is invented here. */}
        <div className="lfacts">
          <span>{formatRoomsShort(p)}</span>
          <span>{formatAreaShort(p)}</span>
          <span>{formatAgeShort(p)}</span>
        </div>
      </span>

      <span className="lfav"><FavoriteButton id={p.id} /></span>
    </div>
  )
}
