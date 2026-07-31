import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { getProperties } from '../api/properties'
import { CHIPS } from '../components/layout/filterChips'
import { MapFoot } from '../components/property/MapFoot'
import { MapPanel } from '../components/property/MapPanel'
import { MapToggle } from '../components/property/MapToggle'
import type { MapCamera } from '../components/property/PropertyMap'
import { PropertyList, type AppliedPill } from '../components/property/PropertyList'
import { ViewToggle } from '../components/property/ViewToggle'
import { useAppState } from '../context/useAppState'
import { useMediaQuery } from '../hooks/useMediaQuery'
import {
  buildAreaOptions, buildPlanOptions, buildPriceOptions, buildStationOptions,
  filterProperties, pageCount, pageSlice, sortProperties,
  type FieldOptions, type FilterSelectKey,
} from '../lib/propertySearch'
import type { Property } from '../types/property'

const PILL_FIELDS: FilterSelectKey[] = ['ward', 'station', 'price', 'plan']
const stripCount = (label: string) => label.replace(/（\d+）$/, '')

export function ListPage() {
  const {
    activeId, setActiveId, setCurrentPropertyId, setView,
    appliedFilters, commitFilters, resetFilters, sortKey, page, setPage,
    mapOpen, setMapOpen,
  } = useAppState()

  /** The split only exists above 1060; below it the row card is still the
   *  right shape for a full-width column. */
  const isSplit = useMediaQuery('(min-width: 1061px)')

  /** Design B mobile. 640, not 1060, and the reason is mechanical: the
   *  filter sheet is structurally unopenable above 640px — .msheet.show
   *  lives inside the 640px query and .filter-trigger is display:none
   *  outside it — so a view toggle up to 1060 would strand the filters.
   *  Also the boundary PropertyMap already uses for isMobile, so the
   *  tap-to-open bottom card and this view coincide. */
  const isMobile = useMediaQuery('(max-width: 640px)')

  const [all, setAll] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let alive = true
    getProperties().then((p) => {
      if (!alive) return
      setAll(p)
      setLoading(false)
    })
    return () => { alive = false }
  }, [])

  // Filtering stays client-side over the full array, as specified.
  const results = useMemo(
    () => sortProperties(filterProperties(all, appliedFilters), sortKey),
    [all, appliedFilters, sortKey],
  )

  // A filter change can leave the current page out of range.
  const safePage = Math.min(page, pageCount(results.length))
  const items = useMemo(() => pageSlice(results, safePage), [results, safePage])

  /* Applied-filter pills. Built here rather than in the header bar
     because they render above the results — and from `all`, which this
     page already holds, so no second fetch. Clearing a pill goes through
     commitFilters, the same path the header pills use. */
  const options: FieldOptions = useMemo(() => ({
    ward: buildAreaOptions(all),
    station: buildStationOptions(all),
    price: buildPriceOptions(all),
    plan: buildPlanOptions(all),
  }), [all])

  const pills: AppliedPill[] = useMemo(() => {
    const out: AppliedPill[] = []
    for (const key of PILL_FIELDS) {
      const v = appliedFilters[key]
      if (v === '') continue
      const opt = options[key].find((o) => o.value === v)
      out.push({
        key,
        label: stripCount(opt?.label ?? v),
        clear: () => commitFilters({ ...appliedFilters, [key]: '' }),
      })
    }
    for (const c of CHIPS) {
      if (!appliedFilters.chips[c.id]) continue
      out.push({
        key: c.id,
        label: c.label,
        clear: () => commitFilters({
          ...appliedFilters,
          chips: { ...appliedFilters.chips, [c.id]: false },
        }),
      })
    }
    return out
  }, [appliedFilters, options, commitFilters])

  const open = (id: number) => {
    setActiveId(id)
    setCurrentPropertyId(id)
    setView('detail')
  }

  /* ---------------- Design B mobile: the 一覧 / 地図 toggle ----------------

     The toggle DRIVES mapOpen rather than adding a second flag, so there
     is one fact about whether the map is showing and the desktop
     地図を閉じる button and this control can never disagree. 一覧 being
     the default is set by mapOpen's initialiser in AppStateContext, which
     reads the viewport once at mount. */

  /* The document stops scrolling in 地図 view. A CLASS, never
     body.style.overflow: FilterSheet sets and clears body.fsheet-open
     with classList, so two classes compose, whereas two writers of the
     same inline style would leave whichever cleanup ran last in charge.
     The rule itself is inside the 640px query, so even a leaked class
     cannot lock the desktop. */
  useEffect(() => {
    if (!isMobile || !mapOpen) return
    document.body.classList.add('bmap')
    return () => { document.body.classList.remove('bmap') }
  }, [isMobile, mapOpen])

  /* §2.4, the map's viewport across a switch.
     §2.2 requires the map be UNMOUNTED in 一覧 view — hiding it would
     leave it able to capture scroll, which is the bug — so a remount is
     unavoidable and the camera has to survive it instead. moveend
     reports it, and it is handed back on the next mount.

     Keyed by the marker set: a filter applied while the map was
     unmounted must still re-frame, so the camera is only offered back
     when the pins are the ones it was recorded against. */
  const itemsKeyRef = useRef('')
  itemsKeyRef.current = items.map((p) => p.id).join(',')
  const cameraRef = useRef<MapCamera | null>(null)
  const cameraKeyRef = useRef('')

  const rememberCamera = useCallback((c: MapCamera) => {
    cameraRef.current = c
    cameraKeyRef.current = itemsKeyRef.current
  }, [])

  const restoreCamera =
    isMobile && cameraKeyRef.current === itemsKeyRef.current
      ? cameraRef.current
      : null

  const wrapClass = [
    'splitwrap',
    mapOpen ? null : 'mapclosed',
    isMobile ? (mapOpen ? 'bmap-map' : 'bmap-list') : null,
  ].filter(Boolean).join(' ')

  /* Card hover drives the same activeId the pins already use — no
     parallel state. The ref is what stops the two hover sources fighting:
     a card only clears the highlight if the highlight is still ITS OWN.
     So if the pointer leaves a card and then lands on a pin, the pin's
     onHighlight has already moved activeId on, the ids no longer match,
     and the card's leave is ignored instead of wiping the pin — which
     also covers the pin popup being open, since that only happens while
     activeId belongs to the pin. */
  const hoveredCardRef = useRef<number | null>(null)
  const hoverCard = (id: number | null) => {
    if (id === null) {
      if (activeId === hoveredCardRef.current) setActiveId(null)
      hoveredCardRef.current = null
    } else {
      hoveredCardRef.current = id
      setActiveId(id)
    }
  }

  /* Design B Stage 2: map left, list right, the map sticky and the page
     scrolling as one document. Below 1060 this reflows to the map above
     the list, which is the shape Design A had. */
  return (
    <div className={wrapClass}>
      {/* Fixed bar under the header. Rendered only below 640px, where it
          is the only way to reach the map. */}
      {isMobile ? (
        <ViewToggle
          mapOpen={mapOpen}
          onChange={setMapOpen}
          count={loading ? null : results.length}
        />
      ) : null}

      {mapOpen ? (
        <MapPanel
          pageItems={items}
          total={results.length}
          page={safePage}
          activeId={activeId}
          onHighlight={setActiveId}
          onOpen={open}
          initialCamera={restoreCamera}
          onCameraChange={isMobile ? rememberCamera : undefined}
        />
      ) : null}

      <div className="splitlist">
        {/* Only when the map is closed: the map column is unmounted, so
            its floating copy of this button is gone with it. Open, the
            button lives over the map itself.

            Suppressed below 640px: the segmented toggle already owns
            this choice there, and two controls for one fact sitting one
            above the other is exactly the ambiguity the toggle removes. */}
        {mapOpen || isMobile ? null : (
          <div className="listtop"><MapToggle className="show" /></div>
        )}

        <PropertyList
          pageItems={items}
          total={results.length}
          loading={loading}
          page={safePage}
          activeId={activeId}
          pills={pills}
          variant={isSplit ? 'card' : 'row'}
          onOpen={open}
          onPageChange={setPage}
          onReset={resetFilters}
          onHover={hoverCard}
        />

        {/* The page range and the 一般公開 / 会員限定 disclosure live under
            the map, which 一覧 view unmounts. Reproduced after the pager
            so mobile does not lose the disclosure entirely — the SAME
            component MapPanel renders, not a second copy of the text.
            Not shown in 地図 view: the bar's live count already states
            the total, and the map is meant to fill the viewport. */}
        {isMobile && !mapOpen && !loading ? (
          <MapFoot total={results.length} page={safePage} className="listfoot" />
        ) : null}
      </div>
    </div>
  )
}
