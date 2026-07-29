import {
  deriveBadges, formatAgeShort, formatAreaShort, formatPriceMan, formatRoomsShort,
  formatTitle, formatWalk,
} from '../../lib/propertyFormat'
import type { Property } from '../../types/property'
import { FavoriteButton } from './FavoriteButton'
import { PropertyPhoto } from './PropertyPhoto'

/** `row` is Design A's horizontal result row, still used by マイページ.
 *  `card` is Design B's vertical card for the split list column. */
export type CardVariant = 'row' | 'card'

/** The single de-duplicated result card, used by 物件検索 and マイページ.
 *
 *  Both variants share one skeleton: a plain <div>, a real
 *  <button class="hit"> stretched over the whole card by
 *  `.pcard .hit:after{inset:0}`, and the favourite button above it on
 *  z-index — the pattern already in homille.css, not a new one. The
 *  favourite is a sibling of the hit area, never nested inside it. */
export function PropertyCard({
  property, active, onOpen, eager = false, variant = 'row', onHover,
}: {
  property: Property
  active: boolean
  onOpen: (id: number) => void
  /** Set for the first two rows so they do not lazy-load. */
  eager?: boolean
  variant?: CardVariant
  /** Design B: hovering or focusing a card highlights its pin. Passing
   *  null on leave clears it. Omitted by マイページ, which has no map. */
  onHover?: (id: number | null) => void
}) {
  const p = property

  const hoverProps = onHover
    ? {
        onMouseEnter: () => onHover(p.id),
        onMouseLeave: () => onHover(null),
        onFocus: () => onHover(p.id),
        onBlur: () => onHover(null),
      }
    : {}

  if (variant === 'card') {
    return (
      <div className={active ? 'pcard vcard active' : 'pcard vcard'} {...hoverProps}>
        <span className="pthumb">
          <PropertyPhoto property={p} room="exterior" eager={eager} />
          <span className="tg">外観</span>
          <span className="pfav"><FavoriteButton id={p.id} /></span>
        </span>

        <span className="pbody">
          <div className="vprice">{formatPriceMan(p)}</div>
          <div className="vspec">{formatRoomsShort(p)} ・ {formatAreaShort(p)}</div>
          <div className="vaddr">{p.station} {formatWalk(p)}</div>
          {/* Carries the accessible name and the whole-card click target.
              The headline is not drawn in this variant — the price leads —
              so the text is visually hidden rather than removed. */}
          <h3 className="vhit">
            <button className="hit" onClick={() => onOpen(p.id)}>{formatTitle(p)}</button>
          </h3>
          <div className="badges">
            {deriveBadges(p).map((b, i) => (
              <span key={i} className={`bdg ${b.variant}`}>{b.label}</span>
            ))}
          </div>
        </span>
      </div>
    )
  }

  return (
    <div className={active ? 'pcard active' : 'pcard'} {...hoverProps}>
      <span className="pthumb">
        <PropertyPhoto property={p} room="exterior" eager={eager} />
        <span className="tg">外観</span>
      </span>

      <span className="pbody">
        <h3>
          <button className="hit" onClick={() => onOpen(p.id)}>{formatTitle(p)}</button>
        </h3>
        <div className="badges">
          {deriveBadges(p).map((b, i) => (
            <span key={i} className={`bdg ${b.variant}`}>{b.label}</span>
          ))}
        </div>
        <div className="spec-strip">
          <span className="sc">
            <span className="sc-l">価格</span>
            <span className="sc-v price">{formatPriceMan(p)}</span>
          </span>
          <span className="sc">
            <span className="sc-l">沿線・駅</span>
            <span className="sc-v">{p.station}<br />{formatWalk(p)}</span>
          </span>
          <span className="sc">
            <span className="sc-l">間取り</span>
            <span className="sc-v">{formatRoomsShort(p)}</span>
          </span>
          <span className="sc">
            <span className="sc-l">建物／土地</span>
            <span className="sc-v">{formatAreaShort(p)}</span>
          </span>
          <span className="sc">
            <span className="sc-l">築年数</span>
            <span className="sc-v">{formatAgeShort(p)}</span>
          </span>
        </div>
      </span>

      <span className="pfav"><FavoriteButton id={p.id} /></span>
    </div>
  )
}
