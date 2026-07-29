import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useMediaQuery } from '../../hooks/useMediaQuery'
import { derivePinKind, formatPriceMan, formatTitle } from '../../lib/propertyFormat'
import type { PinKind, Property } from '../../types/property'
import { applyHomilleStyle } from '../art/mapStyle'
import { MapBottomCard } from './MapBottomCard'
import { MapPopupCard } from './MapPopupCard'

/** Pin colours, DERIVED from the @theme tokens rather than duplicated, so
 *  a palette swap reaches the map without anyone remembering to edit here.
 *
 *  Read lazily inside pinColor: @theme compiles to a :root rule, which is
 *  not applied at module-evaluation time. The fallbacks are the Design B
 *  values, used only if a token is ever removed.
 *
 *  The three stay semantically distinct: g is 診断済み＋10年保証, o is
 *  診断済み, s is 会員限定. */
const PIN_TOKEN: Record<PinKind, { token: string; fallback: string }> = {
  g: { token: '--color-green', fallback: '#067647' },
  o: { token: '--color-orange', fallback: '#d9480f' },
  s: { token: '--color-soil', fallback: '#0041D9' },
}

function pinColor(kind: PinKind): string {
  const { token, fallback } = PIN_TOKEN[kind]
  const v = getComputedStyle(document.documentElement).getPropertyValue(token).trim()
  return v || fallback
}

/** OpenFreeMap Positron — no key, no signup, no cookies.
 *  Attribution is a licence requirement and must stay visible. */
const STYLE_URL = 'https://tiles.openfreemap.org/styles/positron'

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
    let loaded = false
    let timeoutId: ReturnType<typeof setTimeout> | undefined

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
        const { Map, setWorkerUrl } = await import('maplibre-gl')
        await import('maplibre-gl/dist/maplibre-gl.css')

        /* Point maplibre at a worker WE emit, before constructing the Map.
         *
         * Why the deep dist/ path — do not "tidy" this into a bare
         * 'maplibre-gl' import, it will break the deployed map:
         *
         * v6 went ESM-only and DELETED the UMD bundles, including
         * maplibre-gl-csp.js, which was the build that existed precisely
         * for bundlers that cannot serve a worker as a sibling file. What
         * remains resolves its worker at runtime as
         *   new URL('./maplibre-gl-worker.mjs', import.meta.url)
         * which is correct for CDN use, where the worker sits next to the
         * entry, and wrong under any bundler: import.meta.url points at
         * our hashed chunk in /assets/, where no such file exists. It 404s,
         * and because a Worker built on a bad URL neither throws nor
         * rejects, the map hangs on 'loading' forever rather than erroring.
         *
         * ?worker&url makes Vite compile that file as a worker entry and
         * hand back the emitted URL. It bundles the worker's own
         * dependency graph — maplibre-gl-shared.mjs above all — into the
         * chunk, so there is no sibling file to keep adjacent and nothing
         * to hand-copy into public/.
         *
         * The import is dynamic and sits inside this lazy path on purpose:
         * it must not drag maplibre into the initial bundle. */
        const { default: workerUrl } =
          await import('maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url')
        setWorkerUrl(workerUrl)

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
          loaded = true
          clearTimeout(timeoutId)
          const report = applyHomilleStyle(m)
          console.log('[map] style:', report.recoloured, 'of', report.total,
            'layers recoloured;', report.labelsChanged, 'of', report.symbolTotal,
            'symbol layers set to name:ja')
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

        map = m
        mapRef.current = m
      } catch (err) {
        fail('threw during import or construction', err)
      }
    })()

    return () => {
      cancelled = true
      clearTimeout(timeoutId)
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
        el.style.setProperty('--mkr-color', pinColor(derivePinKind(p)))
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
