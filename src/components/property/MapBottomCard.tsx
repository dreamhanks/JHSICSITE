import { formatPriceMan, formatTitle } from '../../lib/propertyFormat'
import type { Property } from '../../types/property'
import { PropertyPhoto } from './PropertyPhoto'

/** Mobile replacement for the anchored popup. The map is only 260px tall
 *  at 375px, so a popup over the pin would cover most of it. Thumbnail,
 *  headline, price and 詳細を見る only — no badges, no spec row. */
export function MapBottomCard({
  property: p, onOpen, onClose,
}: {
  property: Property
  onOpen: (id: number) => void
  onClose: () => void
}) {
  return (
    <div className="mbcard" role="dialog" aria-label={formatTitle(p)}>
      <span className="mbcard-thumb"><PropertyPhoto property={p} room="exterior" /></span>
      <span className="mbcard-body">
        <span className="mbcard-title">{formatTitle(p)}</span>
        <span className="mbcard-price">{formatPriceMan(p)}</span>
      </span>
      <button className="mbcard-go" onClick={() => onOpen(p.id)}>詳細を見る</button>
      <button className="mbcard-x" aria-label="閉じる" onClick={onClose}>×</button>
    </div>
  )
}
