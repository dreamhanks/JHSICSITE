import { useState } from 'react'
import { deriveBadges } from '../../lib/propertyFormat'
import type { PhotoKey } from '../../lib/propertyImages'
import type { Property } from '../../types/property'
import { ART, CAPMAP, GAL, type ArtKey } from '../art'
import { FavoriteButton } from './FavoriteButton'
import { PropertyPhoto } from './PropertyPhoto'

/** DEVIATION FROM ORIGINAL (approved): the ribbon is now derived purely
 *  from the selected thumbnail. The original showed the badge list on
 *  first render but CAPMAP after any thumbnail click — including a click
 *  on 外観 itself, so the same thumbnail produced two different ribbons
 *  depending on history. Selecting 外観 now always shows the badges.
 *
 *  BUG FIX (2.10.1): the favourite heart stays on the main image after
 *  switching thumbnails. The original destroyed it via innerHTML. */
export function Gallery({ property }: { property: Property }) {
  const [selected, setSelected] = useState<ArtKey>('exterior')
  const p = property
  const ribbon = selected === 'exterior'
    ? deriveBadges(p).map((b) => b.label).join('　/　')
    : CAPMAP[selected]

  /** 間取り図 has no photograph — it renders the SVG unconditionally. */
  const isPlan = (k: ArtKey): k is 'plan2f' => k === 'plan2f'
  const Plan = ART.plan2f

  return (
    <>
      <div className="gmain">
        {isPlan(selected)
          ? <Plan tone={p.tone} />
          /* Largest, most visible image on the page — never lazy. */
          : <PropertyPhoto property={p} room={selected as PhotoKey} eager />}
        <div className="rb">{ribbon}</div>
        <FavoriteButton id={p.id} />
      </div>
      <div className="gal gthumbs">
        {GAL.map((g) => (
          <button
            key={g.key}
            className={g.key === selected ? 'gth on' : 'gth'}
            aria-label={CAPMAP[g.key]}
            onClick={() => setSelected(g.key)}
          >
            {isPlan(g.key)
              ? <Plan tone={p.tone} />
              : <PropertyPhoto property={p} room={g.key as PhotoKey} />}
            <span className="cap">{g.cap}</span>
          </button>
        ))}
      </div>
    </>
  )
}
