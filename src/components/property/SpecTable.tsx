import {
  formatAccess, formatAge, formatArea, formatGround, formatPlan, formatStructure,
} from '../../lib/propertyFormat'
import type { Property } from '../../types/property'

/** Design B: 販売価格 and 所在地 are GONE from here. The price block above
 *  the table is now the canonical place for both, and repeating them
 *  150px lower was pure duplication.
 *
 *  Deleted rather than gated behind a prop: this component has exactly
 *  one consumer, DetailPage. A `showPrice` flag with a single call site
 *  would be dead configuration. If a second consumer ever needs them
 *  back, add the prop then. */
export function SpecTable({ property: p }: { property: Property }) {
  return (
    <table className="spec">
      <tbody>
        <tr><th>間取り</th><td>{formatPlan(p)}</td></tr>
        <tr><th>面積</th><td>{formatArea(p)}</td></tr>
        <tr><th>築年数</th><td>{formatAge(p)}</td></tr>
        <tr><th>構造</th><td>{formatStructure(p)}</td></tr>
        <tr><th>交通</th><td>{formatAccess(p)}</td></tr>
        <tr><th>地盤評価</th><td>{formatGround(p)}</td></tr>
      </tbody>
    </table>
  )
}
