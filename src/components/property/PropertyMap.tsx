import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useMediaQuery } from '../../hooks/useMediaQuery'
import { STYLE_URL, loadMapLibre } from '../../lib/maplibre'
import { formatPriceMan, formatTitle } from '../../lib/propertyFormat'
import type { Property } from '../../types/property'
import { applyJapaneseLabels, muteMajorRoads } from '../art/mapStyle'
import { MapBottomCard } from './MapBottomCard'
import { MapPopupCard } from './MapPopupCard'

/** Below this the markers are plain dots; at or above it they become
 *  price pills.
 *
 *  Picked from the data, not by eye. A pill is about 64x24px including
 *  its gap; counting overlapping pairs across all ten pages gives 33 at
 *  the current layout's fit zoom (11.8-12.7) and 4 at the full-viewport
 *  fit Stage 2 will produce (13.0-13.9). Zero overlap needs zoom 14.5,
 *  which NEITHER layout reaches when framing ten pins — so 13 is the
 *  point where pills start being readable rather than the point where
 *  they stop colliding. See the report. */
const PILL_MIN_ZOOM = 13

const MAX_BOUNDS: [[number, number], [number, number]] = [
  [139.7400, 35.6490],
  [139.8700, 35.7580],
]
const MIN_ZOOM = 11.5
const MAX_ZOOM = 16

/** How long to wait for maplibre's `load` event before declaring failure.
 *
 *  Without this the map has no failure path at all for anything that goes
 *  wrong asynchronously after construction. A worker that 404s does not
 *  throw and does not reject — the Map is constructed, `load` simply never
 *  fires — so the component sat on 'loading' indefinitely and a broken map
 *  was indistinguishable from a slow one. That is how the production
 *  worker failure reached the deployed site unnoticed.
 *
 *  10s is deliberately generous: OpenFreeMap on a cold cache over a poor
 *  connection is well inside it, so this fires for real breakage, not for
 *  slowness. */
const LOAD_TIMEOUT_MS = 10_000
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
  items, activeId, onHighlight, onOpen, onStatus,
}: {
  items: Property[]
  activeId: number | null
  onHighlight: (id: number | null) => void
  onOpen: (id: number) => void
  /** Design C Stage 6, ADDITIVE and optional: the mobile bottom sheet
   *  expands to Full when the map fails, so it has to know. Callers that
   *  omit it are byte-for-byte unaffected — nothing else in this file
   *  reads it, and `status` already existed. */
  onStatus?: (s: Status) => void
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
    let loaded = false
    let timeoutId: ReturnType<typeof setTimeout> | undefined
    let ro: ResizeObserver | null = null
    let cancelFrame: (() => void) | null = null

    /** Size audit. Two distinct faults, both invisible to every other
     *  check because MapLibre loads happily into either:
     *
     *    1. the container has no size at all;
     *    2. the container is right but the CANVAS is smaller, which is
     *       tiles filling only part of the box with dead space below.
     *
     *  (2) is what a stale canvas looks like, and a container-only
     *  version of this guard does not catch it. Never sets 'failed':
     *  the map is working, its box is not. */
    const checkSize = (m: import('maplibre-gl').Map) => {
      const host = hostRef.current
      if (!host) return
      const box = host.getBoundingClientRect()
      if (box.width < 1 || box.height < 1) {
        console.error(
          `[map] CONTAINER HAS NO SIZE — ${Math.round(box.width)}x${Math.round(box.height)}px. ` +
          'MapLibre loaded fine, so the map is working and simply invisible. ' +
          'Check the height chain in homille.css: PropertyMap renders .mapbody ' +
          'between the layout and .maphost, and .mapbody has no height of its own, ' +
          'so any percentage height on .maphost collapses to 0. Give .maphost an ' +
          'outright length, or a flex stretch from a definite-height ancestor.',
        )
        return
      }
      const c = m.getCanvas().getBoundingClientRect()
      // 2px covers sub-pixel layout and devicePixelRatio rounding.
      if (Math.abs(c.width - box.width) > 2 || Math.abs(c.height - box.height) > 2) {
        console.error(
          `[map] CANVAS DOES NOT MATCH ITS CONTAINER — canvas ${Math.round(c.width)}x${Math.round(c.height)}px ` +
          `inside a ${Math.round(box.width)}x${Math.round(box.height)}px container. ` +
          'Tiles will fill only part of the box. Either the container resized after ' +
          'MapLibre measured it and no resize followed, or a stale height rule is ' +
          'still on .maphost — check that nothing sets an explicit height on it ' +
          'that the current layout does not expect.',
        )
      }
    }

    /** Reads the live zoom and flips the host between dot and pill mode. */
    const syncPillMode = () => {
      const host = hostRef.current
      const map = mapRef.current
      if (!host || !map) return
      host.classList.toggle('pills', map.getZoom() >= PILL_MIN_ZOOM)
    }

    /** Single route to the failed state, so every cause logs its reason.
     *  Ignores anything arriving after a successful load, and after
     *  unmount, so neither can tear down a working map. */
    const fail = (reason: string, detail?: unknown) => {
      if (cancelled || loaded) return
      console.error(`[map] FAILED — ${reason}`, detail ?? '')
      setStatus('failed')
    }

    ;(async () => {
      try {
        /* Import, stylesheet and worker bootstrap all live in
           lib/maplibre.ts, which carries the full explanation of why the
           worker is wired up by hand — Stage 3 hoisted it there so the
           detail page's location map shares one copy rather than a
           hand-duplicated second one. Still dynamic, still inside this
           lazy path, so maplibre stays out of the initial bundle. */
        const { Map } = await loadMapLibre()

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

        /* Dots below PILL_MIN_ZOOM, price pills at or above it. One class
           on the host rather than touching every marker: the markers are
           plain DOM, so CSS can switch their whole presentation and this
           stays cheap enough to run on every zoom frame. */
        m.on('zoom', syncPillMode)

        m.on('load', () => {
          if (cancelled) return
          loaded = true
          clearTimeout(timeoutId)

          /* A 0-size container is INVISIBLE BUT NOT BROKEN, so nothing
             else catches it: the style loads, `load` fires, status goes
             ready, and the 10s timeout never runs. That has now cost a
             full debugging round three times, so measure and shout.
             Deliberately NOT setStatus('failed') — the map is working
             correctly; its container is the fault. */
          // Design C Stage 2 made the host's height viewport-derived
          // rather than a fixed 380px, so it can settle after
          // construction. Square the canvas with it before measuring.
          m.resize()
          checkSize(m)

          const report = applyJapaneseLabels(m)
          console.log('[map] labels:', report.labelsChanged, 'of', report.symbolTotal,
            'symbol layers set to name:ja;', report.labelsLeftAlone.length,
            'left alone (route refs);', report.total, 'layers total')
          if (report.failed.length) console.warn('[map] label failures:', report.failed)

          /* Stage 2: mute the motorway and trunk classes only. At the
             fit zoom the yellow casing outshouted the price pills. This
             is an allow-list of 30 named road layers out of 111 — see
             the block above muteMajorRoads for why it is not the
             Design A recolour returning. */
          const roads = muteMajorRoads(m)
          console.log('[map] roads muted:', roads.muted.length, 'flat +',
            roads.expressionsFlattened.length, 'expression =',
            roads.muted.length + roads.expressionsFlattened.length, 'of', report.total, 'layers')
          if (roads.failed.length) console.warn('[map] road mute failures:', roads.failed)

          syncPillMode()
          setStatus('ready')
        })

        m.on('error', (e) => {
          // Before load, an error means the map will never come up — the
          // worker 404 surfaces here. After load, maplibre also emits
          // RECOVERABLE errors (a missing tile, an absent sprite), which
          // must not tear down a map that is already working.
          if (loaded) { console.error('[map] maplibre error (post-load, ignored)', e); return }
          fail('maplibre error before load', e)
        })

        // Backstop for failures that never raise an event at all: a Worker
        // built on a 404 URL fires no error maplibre forwards, so only the
        // absence of `load` is observable.
        timeoutId = setTimeout(() => {
          fail(`no load event after ${LOAD_TIMEOUT_MS}ms — the worker script or the style may have failed to load`)
        }, LOAD_TIMEOUT_MS)

        /* Follow the container for the rest of the map's life.
         *
         * MapLibre v6 already observes the container itself (throttled
         * 50ms, and trackResize does default to true — it is in the
         * options defaults, despite the `=== true` read). This is
         * deliberately kept anyway: its observer SKIPS its own first
         * callback, so a size that settles once right after
         * construction can be the one it ignores. Under Design C
         * Stage 2 that is not hypothetical — the host is
         * calc(100dvh - var(--header-h)), and the results panel
         * collapsing changes nothing about the host while a browser
         * chrome change (mobile URL bar, zoom) changes everything.
         * rAF throttling coalesces a drag-resize to one resize per
         * frame instead of thrashing the GL context. */
        if (hostRef.current && typeof ResizeObserver !== 'undefined') {
          let frame = 0
          ro = new ResizeObserver(() => {
            if (frame) return
            frame = requestAnimationFrame(() => {
              frame = 0
              if (cancelled || !mapRef.current) return
              mapRef.current.resize()
            })
          })
          ro.observe(hostRef.current)
          cancelFrame = () => { if (frame) cancelAnimationFrame(frame) }
        }

        map = m
        mapRef.current = m
      } catch (err) {
        fail('threw during import or construction', err)
      }
    })()

    return () => {
      cancelled = true
      clearTimeout(timeoutId)
      ro?.disconnect()
      cancelFrame?.()
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
        /* Price pills. EVERY chip carries a price, 会員限定 included: the
           price is public everywhere else in the product — PropertyCard
           renders it for member-only records too — so hiding it on the
           map would have withheld nothing and cost the client ten
           readings of the market. 会員限定 is marked by the dashed
           border instead.

           The chip carries formatPriceMan verbatim — a new formatter was
           out of scope — so it reads 8,980万円, not 8,980万.

           The two flags are INDEPENDENT and both can apply, which is why
           this reads the booleans directly rather than derivePinKind:
           that helper collapses them into one of three values for the
           old three-colour legend, and would have dropped the 保証 dot
           from every member-only record. */
        const el = document.createElement('button')
        el.type = 'button'
        const cls = ['mkr']
        if (p.isMemberOnly) cls.push('gated')
        if (p.hasWarranty10y) cls.push('warranty')
        el.className = cls.join(' ')
        el.textContent = formatPriceMan(p)
        // The label keeps the price in every case, so the pill's shorter
        // visual form never costs a screen-reader user information.
        el.setAttribute('aria-label', `${formatTitle(p)} ${formatPriceMan(p)}`)

        /* Design C Stage 6: OUT OF THE TAB ORDER AT 640px AND BELOW.
           There the map is the backdrop to a bottom sheet, and ten
           focusable pills sat between the filter chip and the sheet's
           drag handle — the handle was Tab #19, so a keyboard user had
           to cross the entire map to reach the control that opens the
           results. The pills stay tappable, keep their aria-label, and
           every destination they offer is also a card inside the sheet.
           Above 640px they are tab stops as before, because there the
           map is a browsing surface in its own right. Kept in sync by
           the effect below, so a resize across the breakpoint is
           picked up. */
        el.tabIndex = isMobileRef.current ? -1 : 0

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

  /* ---------------- tab order follows the breakpoint ----------------
     Same shape as the .active sync above: the markers are plain DOM
     built once per item set, so anything that has to change with React
     state is written onto them here rather than by rebuilding them. */
  useEffect(() => {
    markerElsRef.current.forEach((el) => { el.tabIndex = isMobile ? -1 : 0 })
  }, [isMobile, items, status])

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

  /* ---------------- status out (Stage 6, optional) ---------------- */
  const onStatusRef = useRef(onStatus)
  onStatusRef.current = onStatus
  useEffect(() => { onStatusRef.current?.(status) }, [status])

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
