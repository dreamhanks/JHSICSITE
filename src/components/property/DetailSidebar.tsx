import { formatPriceMan } from '../../lib/propertyFormat'
import type { Property } from '../../types/property'
import { DetailCta } from './DetailCta'

/** Design C Stage 3 §2.6: the sticky enquiry sidebar.
 *
 *  Below the trust strip, never above it — Zillow, Rightmove and Domain
 *  all place the enquiry column below the fold for the same reason the
 *  hero has no form in it.
 *
 *  DetailCta is reused UNCHANGED, so 資料請求・内見を申し込む, the
 *  favourite toggle and the 反響 note are the same component and the
 *  same behaviour they have always been; only the price above them is
 *  new to this position, and it is formatPriceMan, the same formatter
 *  the hero and the map pills use.
 *
 *  Sticky offsets from --header-h so it can never slide under the
 *  sticky header. */
export function DetailSidebar({
  property: p, onRequest,
}: {
  property: Property
  onRequest: () => void
}) {
  return (
    <aside className="dside">
      <div className="dside-in">
        <div className="dside-price">{formatPriceMan(p)}</div>
        <DetailCta propertyId={p.id} onRequest={onRequest} />
      </div>
    </aside>
  )
}
