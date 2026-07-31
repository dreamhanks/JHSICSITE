import { useEffect, useRef, useState } from 'react'
import { STYLE_URL, WALK_METRES_PER_MIN, circlePolygon, loadMapLibre } from '../../lib/maplibre'
import { formatPriceMan, formatTitle, formatWalk } from '../../lib/propertyFormat'
import type { Property } from '../../types/property'
import { applyJapaneseLabels, muteMajorRoads } from '../art/mapStyle'

/** Design C Stage 3 §2.5: the location map.
 *
 *  A SECOND MapLibre instance, which is safe — see the verification
 *  block in lib/maplibre.ts. The two maps share the module, the chunk
 *  and the global worker pool, and in this app they never even coexist:
 *  App renders 物件検索 xor 物件詳細, so the list map is removed before
 *  this one is built.
 *
 *  LAZY, in two senses. The maplibre import does not start until an
 *  IntersectionObserver says the box is within 200px of the viewport, so
 *  nothing about this component is on the path to first paint; and the
 *  import is dynamic, so the chunk is not in the initial bundle either.
 *
 *  The dashed circle is walkMinutes x WALK_METRES_PER_MIN metres,
 *  centred on the property. It is drawn as a GeoJSON polygon rather than
 *  a circle layer so the radius is true in METRES at every zoom, and
 *  because line-dasharray works on a line layer and not on a circle one. */

const LOAD_TIMEOUT_MS = 10_000
/** Padding around the radius circle when framing it, in px. */
const FIT_PADDING = 34

type Status = 'idle' | 'loading' | 'ready' | 'failed'

export function LocationMap({ property: p }: { property: Property }) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const hostRef = useRef<HTMLDivElement>(null)
  const [near, setNear] = useState(false)
  const [status, setStatus] = useState<Status>('idle')

  const metres = p.walkMinutes * WALK_METRES_PER_MIN
  /** 徒歩8分（640m）— formatWalk's own output plus the derived distance,
   *  parenthesised the way formatPlan and formatAge already qualify a
   *  value. Labels the CIRCLE, not the station: the circle is centred on
   *  the property, so naming the station here would have read as "the
   *  station is at the centre". */
  const radiusLabel = `${formatWalk(p)}（${metres}m）`

  /* ---- gate the whole thing on proximity to the viewport ---- */
  useEffect(() => {
    const el = wrapRef.current
    if (!el) return
    if (typeof IntersectionObserver === 'undefined') { setNear(true); return }
    const io = new IntersectionObserver((entries) => {
      if (!entries.some((e) => e.isIntersecting)) return
      setNear(true)
      io.disconnect()
    }, { rootMargin: '200px' })
    io.observe(el)
    return () => { io.disconnect() }
  }, [])

  /* ---- build once we are near ---- */
  useEffect(() => {
    if (!near) return
    let cancelled = false
    let loaded = false
    let timeoutId: ReturnType<typeof setTimeout> | undefined
    let ro: ResizeObserver | null = null
    let marker: import('maplibre-gl').Marker | null = null
    let label: import('maplibre-gl').Marker | null = null
    let map: import('maplibre-gl').Map | null = null

    setStatus('loading')

    const fail = (reason: string, detail?: unknown) => {
      if (cancelled || loaded) return
      console.error(`[locmap] FAILED — ${reason}`, detail ?? '')
      setStatus('failed')
    }

    ;(async () => {
      try {
        const { Map, Marker, LngLatBounds } = await loadMapLibre()
        if (cancelled || !hostRef.current) return

        const m = new Map({
          container: hostRef.current,
          style: STYLE_URL,
          center: [p.lng, p.lat],
          zoom: 14,
          pitchWithRotate: false,
          dragRotate: false,
          attributionControl: { compact: true },
        })
        m.touchZoomRotate.disableRotation()
        m.setMaxPitch(0)
        map = m

        m.on('load', () => {
          if (cancelled) return
          loaded = true
          clearTimeout(timeoutId)
          m.resize()

          // Same treatment as the list map, from the same module.
          applyJapaneseLabels(m)
          muteMajorRoads(m)

          const ring = circlePolygon(p.lng, p.lat, metres)
          m.addSource('walk-radius', { type: 'geojson', data: ring })
          m.addLayer({
            id: 'walk-radius-fill', type: 'fill', source: 'walk-radius',
            paint: { 'fill-color': '#1a1a18', 'fill-opacity': 0.06 },
          })
          m.addLayer({
            id: 'walk-radius-line', type: 'line', source: 'walk-radius',
            paint: {
              'line-color': '#1a1a18', 'line-width': 1.5,
              'line-dasharray': [3, 2], 'line-opacity': 0.55,
            },
          })

          /* The property's own pill, identical in markup to the list
             map's markers so it reads as the same vocabulary. `.pills`
             is set on the host unconditionally here: there is exactly
             one marker, so it can never collide with another and the
             zoom-based dot mode has nothing to solve. */
          const el = document.createElement('div')
          const cls = ['mkr']
          if (p.isMemberOnly) cls.push('gated')
          if (p.hasWarranty10y) cls.push('warranty')
          el.className = cls.join(' ')
          el.textContent = formatPriceMan(p)
          el.setAttribute('aria-label', `${formatTitle(p)} ${formatPriceMan(p)}`)
          marker = new Marker({ element: el }).setLngLat([p.lng, p.lat]).addTo(m)

          // The circle's label, pinned to its northern edge.
          const lab = document.createElement('div')
          lab.className = 'locmap-radius'
          lab.textContent = radiusLabel
          label = new Marker({ element: lab, anchor: 'bottom' })
            .setLngLat([p.lng, p.lat + metres / 111_320])
            .addTo(m)

          // Frame the circle, not the point.
          const b = new LngLatBounds()
          for (const c of ring.geometry.coordinates[0]) b.extend(c as [number, number])
          m.fitBounds(b, { padding: FIT_PADDING, duration: 0 })

          setStatus('ready')
        })

        m.on('error', (e) => {
          if (loaded) return
          fail('maplibre error before load', e)
        })

        timeoutId = setTimeout(() => {
          fail(`no load event after ${LOAD_TIMEOUT_MS}ms`)
        }, LOAD_TIMEOUT_MS)

        if (hostRef.current && typeof ResizeObserver !== 'undefined') {
          let frame = 0
          ro = new ResizeObserver(() => {
            if (frame) return
            frame = requestAnimationFrame(() => { frame = 0; if (!cancelled) m.resize() })
          })
          ro.observe(hostRef.current)
        }
      } catch (err) {
        fail('threw during import or construction', err)
      }
    })()

    return () => {
      cancelled = true
      clearTimeout(timeoutId)
      ro?.disconnect()
      marker?.remove()
      label?.remove()
      map?.remove()
    }
  }, [near, p, metres, radiusLabel])

  /* Both strings here are authorised new Japanese. 周辺地図 names the
     section; the failure line is PropertyMap's without its second
     sentence, which promises 物件一覧 — a thing that does not exist on
     this page, so it could not be reused verbatim. The heading follows
     the .karte pattern rather than a <figure>, so the page's outline
     stays consistent. */
  return (
    <section className="locmap" ref={wrapRef} aria-labelledby="locmap-h">
      <h3 className="locmap-h" id="locmap-h">周辺地図</h3>
      <div className="locmap-body pills">
        <div ref={hostRef} className="locmap-host" />
        {status !== 'ready' ? (
          <div className={status === 'failed' ? 'mapstate failed' : 'mapstate'}>
            {status === 'failed'
              ? <span>地図を読み込めませんでした。</span>
              : null}
          </div>
        ) : null}
      </div>
    </section>
  )
}
