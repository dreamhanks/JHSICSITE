import { formatRange } from '../../lib/propertySearch'
import { pinColor } from '../../lib/pinColors'
import type { PinKind, Property } from '../../types/property'
import { MapToggle } from './MapToggle'
import { PropertyMap } from './PropertyMap'

/** Legend rows. The swatch colour comes from pinColor, the SAME source
 *  the markers use — Design A hardcoded these and they silently drifted
 *  from the pins the moment the palette changed. */
const LEGEND: { kind: PinKind; label: string }[] = [
  { kind: 'g', label: '診断済み＋10年保証' },
  { kind: 'o', label: '診断済み' },
  { kind: 's', label: '会員限定公開' },
]

/** Design B Stage 2: the map surface only.
 *
 *  The card chrome is gone — no border, no radius, no heading band. The
 *  h2 stays in the DOM as the region's accessible name but is visually
 *  hidden, since the band that used to carry it no longer exists. The
 *  legend floats bottom-left over the map, and 地図を閉じる moved out to
 *  the list column so it stays reachable when the map is closed. */
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
  return (
    <div className="splitmap">
      <h2 className="vh">マップから探す（墨田区・台東区・江東区周辺）</h2>

      {/* The rounded box the map and its disclosure band share. .splitmap
          carries the padding that insets it; this carries the radius and
          the clip, so both halves round together instead of the band
          hanging square off the bottom of a rounded map. */}
      <div className="splitmap-card">
        <div className="splitmap-surface">
          <PropertyMap
            items={pageItems} activeId={activeId}
            onHighlight={onHighlight} onOpen={onOpen}
          />
          {/* Floats over the map, top-right. Sibling of PropertyMap, not a
              child, so it is outside the region that unmounts. */}
          <MapToggle className="over" />
          <div className="legend">
            {LEGEND.map((l) => (
              <span key={l.kind}>
                <i style={{ background: pinColor(l.kind) }}></i>{l.label}
              </span>
            ))}
          </div>
        </div>

        <div className="mapfoot">
          {formatRange(total, page)}<br />
          物件所在エリア・価格・間取りは<strong>一般公開</strong>。診断報告書・図面・地盤調査報告書は<strong>会員限定</strong>で公開します。
        </div>
      </div>
    </div>
  )
}
