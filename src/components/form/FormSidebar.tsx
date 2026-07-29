import { formatArea, formatPlan, formatPriceMan, formatTitle } from '../../lib/propertyFormat'
import type { Property } from '../../types/property'
import { PropertyPhoto } from '../property/PropertyPhoto'

export function FormSidebar({ property: p }: { property: Property }) {
  return (
    <aside className="fside">
      <h3>お申し込み対象の物件</h3>
      <div className="pinfo">
        <span className="th"><PropertyPhoto property={p} room="exterior" /></span>
        <span>
          <span className="nm">{formatTitle(p)}</span>
          <span className="pr">{formatPriceMan(p)}</span>
          <span className="meta">{formatPlan(p)}・{formatArea(p)}</span>
        </span>
      </div>
      <ul>
        {/* Step 2g: the 資料請求 no longer grants membership, so these two
            no longer claim it does. */}
        <li>資料請求はどなたでもお申し込みいただけます</li>
        <li>診断報告書・図面・地盤データ・保証書は、ログイン後に閲覧できます</li>
        <li>担当不動産会社より、ご希望の方法でご連絡します</li>
        <li>しつこい営業は行いません。ご検討ペースを尊重します</li>
      </ul>
    </aside>
  )
}
