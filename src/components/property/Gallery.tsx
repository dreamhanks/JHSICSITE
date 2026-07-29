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

  /** Design B Stage 3: the four tiles are the four NOT currently large,
   *  in GAL order. Clicking one swaps it into the large slot and the
   *  outgoing image drops back into its own GAL position — a straight
   *  re-render, no animation.
   *
   *  Consequence: no small tile is ever the selected one, so .gth.on has
   *  no target here. Being the large image IS the selected state, which
   *  is why the rule is not applied rather than moved. */
  const smalls = GAL.filter((g) => g.key !== selected)

  const tile = (k: ArtKey, eager = false) => (isPlan(k)
    ? <Plan tone={p.tone} />
    : <PropertyPhoto property={p} room={k as PhotoKey} eager={eager} />)

  return (
    <div className="dmosaic">
      <div className="gmain">
        {/* Largest, most visible image on the page — never lazy.
            間取り図 needs no object-fit: its viewBox is 400x250, exactly
            the 16/10 the slot asks for, so it fills without distortion. */}
        {tile(selected, true)}
        <div className="rb">{ribbon}</div>
        <FavoriteButton id={p.id} />
      </div>
      <div className="gal gthumbs">
        {smalls.map((g) => (
          <button
            key={g.key}
            /* 間取り図 gets its own ground: it is a pale line drawing, and
               on the standard tile grey it reads as an empty square. */
            className={isPlan(g.key) ? 'gth gth-plan' : 'gth'}
            aria-label={CAPMAP[g.key]}
            onClick={() => setSelected(g.key)}
          >
            {tile(g.key)}
            <span className="cap">{g.cap}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
