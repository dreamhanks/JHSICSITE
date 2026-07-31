import {
  formatAccess, formatAddress, formatAgeShort, formatAreaShort,
  formatPlan, formatPriceMan, formatTitle,
} from '../../lib/propertyFormat'
import type { Property } from '../../types/property'
import { Gallery } from './Gallery'

/** Design C Stage 3: the split-panel hero. Gallery left, key facts
 *  right, as Compass and Sotheby's do — buyers read photographs and
 *  numbers at the same time, so putting them side by side beats a
 *  gallery stacked above a table.
 *
 *  THE ENQUIRY FORM IS DELIBERATELY NOT HERE. It lives in the sticky
 *  sidebar below the trust strip; a form above the fold raises exit
 *  rates, which is the same reason Zillow, Rightmove and Domain all
 *  place theirs below.
 *
 *  Every string comes from lib/propertyFormat — no formatter is
 *  introduced and none is changed. The four labels are the ones
 *  SpecTable and PropertyCard already use. */
const FACT_LABELS = ['間取り', '建物／土地', '築年数', '交通'] as const

export function DetailHero({ property: p }: { property: Property }) {
  const facts = [
    formatPlan(p),        // 5LDK（2階建て）      — SpecTable's 間取り
    formatAreaShort(p),   // 117.50／108.72㎡     — PropertyCard's 建物／土地
    formatAgeShort(p),    // 築22年               — the tile has no room for the renovation clause
    formatAccess(p),      // 都営大江戸線「両国」駅 徒歩8分 — SpecTable's 交通
  ]

  return (
    <div className="dhero">
      <div className="dhero-gal">
        <Gallery property={p} />
      </div>
      <div className="dhero-facts">
        <div className="dh-price">{formatPriceMan(p)}</div>
        {/* The page had no h1 at all — .dhead .t is a span. The headline
            is the page's subject, so it takes the heading. */}
        <h1 className="dh-title">{formatTitle(p)}</h1>
        <p className="dh-addr">{formatAddress(p)}</p>
        <dl className="dh-grid">
          {FACT_LABELS.map((label, i) => (
            <div className="dh-cell" key={label}>
              <dt>{label}</dt>
              <dd>{facts[i]}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  )
}
