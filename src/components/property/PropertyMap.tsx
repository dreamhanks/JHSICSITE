import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useMediaQuery } from '../../hooks/useMediaQuery'
import { derivePinKind, formatPriceMan, formatTitle } from '../../lib/propertyFormat'
import type { PinKind, Property } from '../../types/property'
import { applyHomilleStyle } from '../art/mapStyle'
import { MapBottomCard } from './MapBottomCard'
import { MapPopupCard } from './MapPopupCard'

/** Same pin colours as the drawn map (mockup.html L1012). */
const COLOR: Record<PinKind, string> = { g: '#0f5c35', o: '#e07b1e', s: '#7a5c2e' }

/** OpenFreeMap Positron — no key, no signup, no cookies.
 *  Attribution is a licence requirement and must stay visible. */
const STYLE_URL = 'https://tiles.openfreemap.org/styles/positron'

const MAX_BOUNDS: [[number, number], [number, number]] = [
  [139.7400, 35.6490],
  [139.8700, 35.7580],
]
const MIN_ZOOM = 11.5
const MAX_ZOOM = 16
const FIT_PADDING = 40
const FIT_DURATION = 400
const CENTRE: [number, number] = [139.81210, 35.70540]

/** Grace period so the pointer can cross the offset:18 gap between the
 *  marker and the card without the card closing underneath it. */
const CLOSE_DELAY_MS = 150

/** Rapid filter changes collapse into one camera animation. */
const REFIT_DEBOUNCE_MS = 250

type Status = 'loading' | 'ready' | 'failed'

export function PropertyMap({
  items, activeId, onHighlight, onOpen,
}: {
  items: Property[]
  activeId: number | null
  onHighlight: (id: number | null) => void
  onOpen: (id: number) => void
}) {
  const isMobile = useMediaQuery('(max-width: 640px)')
  const hostRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<import('maplibre-gl').Map | null>(null)
  const markersRef = useRef<import('maplibre-gl').Marker[]>([])
  const markerElsRef = useRef(new Map<number, HTMLButtonElement>())
  const popupRef = useRef<import('maplibre-gl').Popup | null>(null)
  const popupNodeRef = useRef<HTMLDivElement | null>(null)
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  /** Ids of the marker set the camera last framed. */
  const lastFitRef = useRef<string>('')
  const [status, setStatus] = useState<Status>('loading')

  /** Which property's card is showing. A DISTINCT fact from activeId:
   *  activeId records which pin is selected (and keeps its row
   *  highlighted, surviving navigation), while cardId records whether
   *  the pointer or focus is actually on a pin right now. Gating the
   *  card on this is what stops it reappearing on return from a detail
   *  page, where no pointer is anywhere near the map. */
  const [cardId, setCardId] = useState<number | null>(null)
  const [portalNode, setPortalNode] = useState<HTMLDivElement | null>(null)

  const onHighlightRef = useRef(onHighlight)
  onHighlightRef.current = onHighlight
  const isMobileRef = useRef(isMobile)
  isMobileRef.current = isMobile
  const onOpenRef = useRef(onOpen)
  onOpenRef.current = onOpen

  const carded = items.find((p) => p.id === cardId) ?? null

  const cancelClose = () => {
    if (closeTimer.current) { clearTimeout(closeTimer.current); closeTimer.current = null }
  }
  const scheduleClose = () => {
    cancelClose()
    closeTimer.current = setTimeout(() => setCardId(null), CLOSE_DELAY_MS)
  }
  const cancelCloseRef = useRef(cancelClose)
  cancelCloseRef.current = cancelClose
  const scheduleCloseRef = useRef(scheduleClose)
  scheduleCloseRef.current = scheduleClose

  /* ---------------- map construction ---------------- */
  useEffect(() => {
    let cancelled = false
    let map: import('maplibre-gl').Map | null = null

    ;(async () => {
      try {
        const { Map } = await import('maplibre-gl')
        await import('maplibre-gl/dist/maplibre-gl.css')
        if (cancelled || !hostRef.current) return

        const m = new Map({
          container: hostRef.current,
          style: STYLE_URL,
          center: CENTRE,
          zoom: 12.2,
          maxBounds: MAX_BOUNDS,
          minZoom: MIN_ZOOM,
          maxZoom: MAX_ZOOM,
          pitchWithRotate: false,
          dragRotate: false,
          attributionControl: { compact: false },
        })
        m.touchZoomRotate.disableRotation()
        m.setMaxPitch(0)

        m.on('load', () => {
          if (cancelled) return
          const report = applyHomilleStyle(m)
          console.log('[map] style:', report.recoloured, 'of', report.total,
            'layers recoloured;', report.labelsChanged, 'of', report.symbolTotal,
            'symbol layers set to name:ja')
          setStatus('ready')
        })
        m.on('error', (e) => { console.error('[map] maplibre error', e) })

        map = m
        mapRef.current = m
      } catch (err) {
        console.error('[map] CAUGHT in effect:', err)
        if (!cancelled) setStatus('failed')
      }
    })()

    return () => {
      cancelled = true
      cancelClose()
      markersRef.current.forEach((mk) => mk.remove())
      markersRef.current = []
      popupRef.current?.remove()
      mapRef.current?.remove()
      mapRef.current = null
      map?.remove()
    }
  }, [])

  /* ---------------- markers + fit to the current page ---------------- */
  useEffect(() => {
    const map = mapRef.current
    if (!map || status !== 'ready') return

    let cancelled = false
    ;(async () => {
      const { Marker } = await import('maplibre-gl')
      if (cancelled) return

      markersRef.current.forEach((mk) => mk.remove())
      markerElsRef.current.clear()
      setCardId(null)

      markersRef.current = items.map((p) => {
        const el = document.createElement('button')
        el.type = 'button'
        el.className = 'mkr'
        el.style.setProperty('--mkr-color', COLOR[derivePinKind(p)])
        el.setAttribute('aria-label', `${formatTitle(p)} ${formatPriceMan(p)}`)

        const open = () => {
          cancelCloseRef.current()
          setCardId(p.id)
          onHighlightRef.current(p.id)
        }

        // Desktop: hover opens. Mobile keeps tap-to-open and no hover.
        el.addEventListener('mouseenter', () => { if (!isMobileRef.current) open() })
        el.addEventListener('mouseleave', () => { if (!isMobileRef.current) scheduleCloseRef.current() })

        // Keyboard has no hover, so focus is the equivalent trigger.
        el.addEventListener('focus', () => { if (!isMobileRef.current) open() })
        el.addEventListener('blur', (e) => {
          if (isMobileRef.current) return
          const to = (e as FocusEvent).relatedTarget as Node | null
          if (to && popupNodeRef.current?.contains(to)) return // moved into the card
          scheduleCloseRef.current()
        })

        // Enter/Space must move focus INTO the card, not fire the click.
        el.addEventListener('keydown', (e) => {
          if (e.key !== 'Enter' && e.key !== ' ') return
          e.preventDefault()
          if (isMobileRef.current) { open(); return }
          cancelCloseRef.current()
          setCardId(p.id)
          onHighlightRef.current(p.id)
          requestAnimationFrame(() => popupNodeRef.current?.focus())
        })

        el.addEventListener('click', (e) => {
          e.stopPropagation()
          if (isMobileRef.current) { open(); return }
          // Desktop: the card is already open from hover, so a click on
          // the pin means "open this one" — same as a result-row click.
          onHighlightRef.current(p.id)
          onOpenRef.current(p.id)
        })

        markerElsRef.current.set(p.id, el)
        return new Marker({ element: el }).setLngLat([p.lng, p.lat]).addTo(map)
      })

    })()

    return () => { cancelled = true }
  }, [items, status])

  /* ---------------- debounced camera refit ----------------
     Filters now apply on change, so a user flipping four chips would
     otherwise queue four fitBounds animations. Markers update instantly
     above; only the camera waits. */
  useEffect(() => {
    const map = mapRef.current
    if (!map || status !== 'ready' || items.length === 0) return

    // Compare the actual marker set, not just its size: a filter change
    // that swaps which ten properties are shown must still re-frame,
    // while one that leaves them identical must not re-animate at all.
    const key = items.map((p) => p.id).join(',')
    if (key === lastFitRef.current) return

    let cancelled = false
    const timer = setTimeout(() => {
      ;(async () => {
        const { LngLatBounds } = await import('maplibre-gl')
        if (cancelled) return
        lastFitRef.current = key
        const b = new LngLatBounds()
        items.forEach((p) => b.extend([p.lng, p.lat]))
        map.fitBounds(b, {
          padding: FIT_PADDING, maxZoom: MAX_ZOOM,
          duration: FIT_DURATION, essential: true,
        })
      })()
    }, REFIT_DEBOUNCE_MS)

    return () => { cancelled = true; clearTimeout(timer) }
  }, [items, status])

  /* ---------------- .active follows activeId ---------------- */
  useEffect(() => {
    markerElsRef.current.forEach((el, id) => {
      el.classList.toggle('active', id === activeId)
    })
  }, [activeId, items, status])

  /* ---------------- one persistent popup, moved between markers ------ */
  useEffect(() => {
    const map = mapRef.current
    if (!map || status !== 'ready' || isMobile) return

    let cancelled = false
    ;(async () => {
      const { Popup } = await import('maplibre-gl')
      if (cancelled) return

      if (!popupRef.current) {
        const node = document.createElement('div')
        node.tabIndex = -1
        node.setAttribute('role', 'dialog')
        // The card must survive the pointer crossing the offset:18 gap.
        node.addEventListener('mouseenter', () => cancelCloseRef.current())
        node.addEventListener('mouseleave', () => scheduleCloseRef.current())
        node.addEventListener('focusin', () => cancelCloseRef.current())
        node.addEventListener('focusout', (e) => {
          const to = (e as FocusEvent).relatedTarget as Node | null
          if (to && node.contains(to)) return
          scheduleCloseRef.current()
        })
        popupNodeRef.current = node

        // No `anchor`: MapLibre then picks the anchor that keeps the
        // popup inside the container, flipping below a pin near the top
        // edge. Panning instead would slide the marker out from under
        // the pointer and bounce the card closed.
        popupRef.current = new Popup({
          closeButton: true, closeOnClick: false, offset: 18,
          maxWidth: '280px', className: 'mpop', focusAfterOpen: false,
        }).setDOMContent(node)

        popupRef.current.on('close', () => {
          setCardId(null)
          markerElsRef.current.get(activeId ?? -1)?.focus()
        })
        setPortalNode(node)
      }

      const popup = popupRef.current
      if (carded) {
        // Moving between markers just relocates the same popup, so the
        // portal content updates in place with no unmount flicker.
        popup.setLngLat([carded.lng, carded.lat])
        popupNodeRef.current?.setAttribute('aria-label', formatTitle(carded))
        if (!popup.isOpen()) popup.addTo(map)
      } else if (popup.isOpen()) {
        popup.remove()
      }
    })()

    return () => { cancelled = true }
  }, [carded, status, isMobile, activeId])

  /* ---------------- Escape closes ---------------- */
  useEffect(() => {
    if (!carded) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      cancelClose()
      markerElsRef.current.get(carded.id)?.focus()
      setCardId(null)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [carded])

  return (
    <div className={carded && isMobile ? 'mapbody card-open' : 'mapbody'}>
      <div ref={hostRef} className="maphost" />

      {portalNode && carded && !isMobile
        ? createPortal(<MapPopupCard property={carded} onOpen={onOpen} />, portalNode)
        : null}

      {carded && isMobile ? (
        <MapBottomCard
          property={carded}
          onOpen={onOpen}
          onClose={() => setCardId(null)}
        />
      ) : null}

      {status !== 'ready' ? (
        <div className={status === 'failed' ? 'mapstate failed' : 'mapstate'}>
          {status === 'failed'
            ? <span>地図を読み込めませんでした。物件一覧はそのままご利用いただけます。</span>
            : null}
        </div>
      ) : null}
    </div>
  )
}
