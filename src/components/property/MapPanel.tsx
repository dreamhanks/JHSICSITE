import { useAppState } from '../../context/useAppState'
import { formatRange } from '../../lib/propertySearch'
import type { Property } from '../../types/property'
import { PropertyMap } from './PropertyMap'

export function MapPanel({
  pageItems, total, page, activeId, onHighlight, onOpen,
}: {
  /** Only the current page's results are pinned — at most 10. */
  pageItems: Property[]
  total: number
  page: number
  activeId: number | null
  /** null clears the selection, which also closes the popup. */
  onHighlight: (id: number | null) => void
  onOpen: (id: number) => void
}) {
  const { mapOpen, setMapOpen } = useAppState()

  return (
    <div className="mapcard">
      <div className="maphead">
        <h2>マップから探す（墨田区・台東区・江東区周辺）</h2>
        <div className="legend">
          <span><i className="g"></i>診断済み＋10年保証</span>
          <span><i className="o"></i>診断済み</span>
          <span><i className="s"></i>会員限定公開</span>
        </div>
        <button
          className="map-toggle"
          aria-expanded={mapOpen}
          onClick={() => setMapOpen(!mapOpen)}
        >
          {mapOpen ? '地図を閉じる' : '地図を表示する'}
        </button>
      </div>

      {mapOpen ? (
        <>
          <PropertyMap
            items={pageItems} activeId={activeId}
            onHighlight={onHighlight} onOpen={onOpen}
          />
          <div className="mapfoot">
            {formatRange(total, page)}<br />
            物件所在エリア・価格・間取りは<strong>一般公開</strong>。診断報告書・図面・地盤調査報告書は<strong>会員限定</strong>で公開します。
          </div>
        </>
      ) : null}
    </div>
  )
}
