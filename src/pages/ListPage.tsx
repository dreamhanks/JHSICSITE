import { useEffect, useMemo, useRef, useState } from 'react'
import { getProperties } from '../api/properties'
import { CHIPS } from '../components/layout/filterChips'
import { MapPanel } from '../components/property/MapPanel'
import { PropertyList, type AppliedPill } from '../components/property/PropertyList'
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
    <div className={mapOpen ? 'splitwrap' : 'splitwrap mapclosed'}>
      {mapOpen ? (
        <MapPanel
          pageItems={items}
          total={results.length}
          page={safePage}
          activeId={activeId}
          onHighlight={setActiveId}
          onOpen={open}
        />
      ) : null}

      <div className="splitlist">
        {/* The toggle lives here rather than over the map, so it is in the
            same place whether the map is showing or not. */}
        <div className="listtop">
          <button
            className="map-toggle"
            aria-expanded={mapOpen}
            onClick={() => setMapOpen(!mapOpen)}
          >
            {mapOpen ? '地図を閉じる' : '地図を表示する'}
          </button>
        </div>

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
      </div>
    </div>
  )
}
