import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react'
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
 *  switching thumbnails. The original destroyed it via innerHTML.
 *
 *  Design C Stage 3: HOVER ALSO SWAPS THE MAIN IMAGE.
 *
 *  There is still exactly ONE piece of state. Hovering does not open a
 *  "preview" that a later event has to undo — it simply sets `selected`,
 *  after a short delay, and clicking sets the same thing immediately.
 *  That is what makes the brief's "moving off the strip keeps the last
 *  hovered image" fall out for free rather than needing a second
 *  variable and a revert path: there is nothing to revert TO. A
 *  committed/previewed pair would also have had to answer what happens
 *  when the pointer leaves the strip and the answer is "nothing", so the
 *  pair would have been two states that must never disagree.
 *
 *  THE POINTER ENTERING THE LARGE IMAGE is therefore a non-event.
 *  .gmain carries no hover handler at all: crossing from a thumbnail up
 *  onto the main image fires that thumbnail's pointerleave, which only
 *  cancels a still-pending timer, and whatever was last selected stays
 *  on screen. Nothing flickers and nothing reverts.
 *
 *  TOUCH IS UNAFFECTED. The handler is pointerenter, not mouseenter, and
 *  it returns immediately unless pointerType is 'mouse'. A tap on a
 *  touchscreen therefore takes the click path only — which matters
 *  because browsers synthesise a mouseenter before the click on tap, so
 *  a mouseenter-based version would have armed a 120ms timer on every
 *  tap and raced it against the click. Pen input is excluded on the same
 *  test; it has no hover state to speak of on most hardware. */

/** Long enough that sweeping the pointer across the strip does not
 *  flicker, short enough that a deliberate hover feels immediate. */
const HOVER_DELAY_MS = 120

export function Gallery({ property }: { property: Property }) {
  const [selected, setSelected] = useState<ArtKey>('exterior')
  const hoverTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const p = property
  const ribbon = selected === 'exterior'
    ? deriveBadges(p).map((b) => b.label).join('　/　')
    : CAPMAP[selected]

  const cancelHover = () => {
    if (!hoverTimer.current) return
    clearTimeout(hoverTimer.current)
    hoverTimer.current = null
  }

  // A pending swap must not fire after this gallery has gone away.
  useEffect(() => cancelHover, [])

  /** Click and focus both commit at once; either also drops a pending
   *  hover so a slow timer cannot overwrite a deliberate choice. */
  const commit = (k: ArtKey) => {
    cancelHover()
    setSelected(k)
  }

  const hoverIn = (e: ReactPointerEvent<HTMLButtonElement>, k: ArtKey) => {
    if (e.pointerType !== 'mouse') return
    cancelHover()
    hoverTimer.current = setTimeout(() => {
      hoverTimer.current = null
      setSelected(k)
    }, HOVER_DELAY_MS)
  }

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
            onClick={() => commit(g.key)}
            onPointerEnter={(e) => hoverIn(e, g.key)}
            onPointerLeave={cancelHover}
            /* Focus is the keyboard's hover, and it commits with no
               delay: the delay exists to absorb a pointer sweeping
               across five thumbnails, and Tab moves one at a time with
               intent. A 120ms lag on every Tab would just read as jank. */
            onFocus={() => commit(g.key)}
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
