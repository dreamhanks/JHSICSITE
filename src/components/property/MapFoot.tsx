import { formatRange } from '../../lib/propertySearch'

/** The page range and the 一般公開 / 会員限定 disclosure.
 *
 *  EXTRACTED, NOT DUPLICATED. It used to be inline markup in MapPanel,
 *  which is fine while the map is the only thing that renders it — but
 *  the ≤640px 一覧 view unmounts the map (that is the whole point of the
 *  toggle) and the disclosure must not go with it. Two inline copies
 *  would be two Japanese strings to keep in step; one component is one.
 *
 *  Call sites:
 *    MapPanel        — under the map, every width the map is shown
 *    ListPage        — after the pager, ≤640px 一覧 view only
 *
 *  Text unchanged from the original MapPanel markup. */
export function MapFoot({
  total, page, className,
}: {
  total: number
  page: number
  /** Extra class for the ≤640px list placement. */
  className?: string
}) {
  return (
    <div className={className ? `mapfoot ${className}` : 'mapfoot'}>
      {formatRange(total, page)}<br />
      物件所在エリア・価格・間取りは<strong>一般公開</strong>。診断報告書・図面・地盤調査報告書は<strong>会員限定</strong>で公開します。
    </div>
  )
}
