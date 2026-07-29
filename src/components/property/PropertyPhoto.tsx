import { useState } from 'react'
import {
  getVerdict, photoUrl, ROOM_LABEL, setVerdict, type PhotoKey,
} from '../../lib/propertyImages'
import { formatTitle } from '../../lib/propertyFormat'
import type { Property } from '../../types/property'
import { ART } from '../art'

/** A photograph with the original SVG art as its fallback.
 *
 *  The URL is never probed ahead of time — the <img> is rendered and
 *  onError swaps in the SVG, which also covers a hotlink that stops
 *  resolving. The verdict is cached by URL in module scope, so a dead
 *  slot ex-03 costs one failed request for the whole session no matter
 *  how many records point at it.
 *
 *  The container already reserves its aspect-ratio, so neither branch
 *  can shift layout: the <img> fills the box exactly as the SVG does. */
export function PropertyPhoto({
  property, room, eager = false,
}: {
  property: Property
  room: PhotoKey
  /** Skips loading="lazy" for above-the-fold images. */
  eager?: boolean
}) {
  const url = photoUrl(property, room)
  // Start already-failed if this URL is known bad, so no second request.
  const [failed, setFailed] = useState(() => !!url && getVerdict(url) === 'failed')

  // No URL for this slot, or the image errored: the SVG art stands in.
  if (!url || failed) {
    const Art = ART[room]
    return <Art tone={property.tone} />
  }

  return (
    <img
      className="pphoto"
      src={url}
      alt={`${formatTitle(property)} ${ROOM_LABEL[room]}`}
      loading={eager ? 'eager' : 'lazy'}
      decoding="async"
      onLoad={() => setVerdict(url, 'ok')}
      onError={() => { setVerdict(url, 'failed'); setFailed(true) }}
    />
  )
}
