import {
  deriveBadges, formatAgeShort, formatAreaShort, formatPriceMan, formatRoomsShort,
  formatTitle, formatWalk,
} from '../../lib/propertyFormat'
import type { Property } from '../../types/property'
import { FavoriteButton } from './FavoriteButton'
import { PropertyPhoto } from './PropertyPhoto'

/** The single de-duplicated result row, used by 物件検索 and マイページ.
 *
 *  The card is a plain <div>; the title holds a real <button class="hit">
 *  stretched over the whole row by `.pcard .hit:after{inset:0}`, and the
 *  favourite button sits above it on z-index:2 — the pattern already in
 *  homille.css, not a new one. The favourite is a sibling of the hit
 *  area, never nested inside it. */
export function PropertyCard({
  property, active, onOpen, eager = false,
}: {
  property: Property
  active: boolean
  onOpen: (id: number) => void
  /** Set for the first two rows so they do not lazy-load. */
  eager?: boolean
}) {
  const p = property
  return (
    <div className={active ? 'pcard active' : 'pcard'}>
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
