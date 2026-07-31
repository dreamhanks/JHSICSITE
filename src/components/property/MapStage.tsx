import type { Property } from '../../types/property'
import { PropertyMap } from './PropertyMap'

/** Design C Stage 2: the map as the page.
 *
 *  No .mapcard, no border, no radius, no .maphead, no .mapfoot — the
 *  card chrome was there to make the map a component of a document, and
 *  it is now the document. MapPanel keeps every one of those for the
 *  stacked fallback below 1061px and is untouched.
 *
 *  .mapstage owns the height as an outright length; see the warning
 *  block above .maphost in homille.css for why that is not negotiable.
 *
 *  The legend moves here rather than disappearing with .maphead: it
 *  explains the price pills, which are the whole marker vocabulary of
 *  this design, and the strings are Stage 1's verbatim. */
export function MapStage({
  items, activeId, onHighlight, onOpen,
}: {
  items: Property[]
  activeId: number | null
  onHighlight: (id: number | null) => void
  onOpen: (id: number) => void
}) {
  return (
    <div className="mapstage">
      <PropertyMap
        items={items} activeId={activeId}
        onHighlight={onHighlight} onOpen={onOpen}
      />
      <div className="legend maplegend">
        <span><i className="price"></i>販売価格</span>
        <span><i className="warranty"></i>10年保証付</span>
        <span><i className="gated"></i>会員限定公開</span>
      </div>
    </div>
  )
}
