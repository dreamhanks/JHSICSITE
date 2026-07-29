import {
  formatAccess, formatAddress, formatAge, formatArea, formatGround, formatPlan,
  formatPriceMan, formatStructure,
} from '../../lib/propertyFormat'
import type { Property } from '../../types/property'

export function SpecTable({ property: p }: { property: Property }) {
  return (
    <table className="spec">
      <tbody>
        <tr><th>販売価格</th><td><span className="big">{formatPriceMan(p)}</span></td></tr>
        <tr><th>所在地</th><td>{formatAddress(p)}</td></tr>
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
