import {
  deriveBadges, formatAgeShort, formatPriceMan, formatRoomsShort, formatTitle, formatWalk,
} from '../../lib/propertyFormat'
import type { Property } from '../../types/property'
import { FavoriteButton } from './FavoriteButton'
import { PropertyPhoto } from './PropertyPhoto'

/** Desktop popup body. Rendered through a portal into MapLibre's popup
 *  node, so it keeps full React context — the heart is the same
 *  FavoriteButton the rows use, wired to the same toggleFav. */
export function MapPopupCard({
  property: p, onOpen,
}: {
  property: Property
  onOpen: (id: number) => void
}) {
  return (
    <div className="mpop-card">
      <div className="mpop-head">
        <span className="mpop-thumb">
          <PropertyPhoto property={p} room="exterior" />
          <FavoriteButton id={p.id} />
        </span>
        <span className="mpop-title">{formatTitle(p)}</span>
      </div>

      <div className="badges">
        {deriveBadges(p).map((b, i) => (
          <span key={i} className={`bdg ${b.variant}`}>{b.label}</span>
        ))}
      </div>

      <div className="mpop-price">{formatPriceMan(p)}</div>

      <div className="mpop-spec">
        <span>{formatWalk(p)}</span>
        <span>{formatRoomsShort(p)}</span>
        <span>{formatAgeShort(p)}</span>
      </div>

      <button className="mpop-go" onClick={() => onOpen(p.id)}>詳細を見る</button>
    </div>
  )
}
