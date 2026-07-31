import { useEffect, useMemo, useRef, useState } from 'react'
import { getProperties } from '../api/properties'
import { ListPanel } from '../components/property/ListPanel'
import { MapPanel } from '../components/property/MapPanel'
import { MapStage } from '../components/property/MapStage'
import { PropertyList } from '../components/property/PropertyList'
import { useAppState } from '../context/useAppState'
import { useMediaQuery } from '../hooks/useMediaQuery'
import { WIDE_QUERY } from '../lib/breakpoints'
import { filterProperties, pageCount, pageSlice, sortProperties } from '../lib/propertySearch'
import type { Property } from '../types/property'

export function ListPage() {
  const {
    activeId, setActiveId, setCurrentPropertyId, setView,
    appliedFilters, resetFilters, sortKey, setSortKey, page, setPage,
  } = useAppState()

  const wide = useMediaQuery(WIDE_QUERY)
  const [panelCollapsed, setPanelCollapsed] = useState(false)
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

  /* The document scroll lock, scoped THREE ways so it can never leak:
     to this view (ListPage only mounts on 物件検索), to this breakpoint,
     and to the component's lifetime via the cleanup. It is a body CLASS
     rather than an inline style specifically so it composes with
     .fsheet-open instead of fighting it — the mobile sheet's cleanup
     does classList.remove('fsheet-open'), which cannot disturb a
     separate class, whereas both writing body.style.overflow would have
     made the last cleanup to run win. */
  useEffect(() => {
    if (!wide) return
    document.body.classList.add('mapview')
    return () => { document.body.classList.remove('mapview') }
  }, [wide])

  // Filtering stays client-side over the full array, as specified.
  const results = useMemo(
    () => sortProperties(filterProperties(all, appliedFilters), sortKey),
    [all, appliedFilters, sortKey],
  )

  // A filter change can leave the current page out of range.
  const safePage = Math.min(page, pageCount(results.length))
  const items = useMemo(() => pageSlice(results, safePage), [results, safePage])

  const open = (id: number) => {
    setActiveId(id)
    setCurrentPropertyId(id)
    setView('detail')
  }

  /* ---- card hover <-> pin hover, over ONE piece of state ----

     Both directions write activeId, and there is no second copy: the
     map already highlights whichever pin matches activeId, and .lcard
     already highlights on .active, so pointing at either end lights up
     the other for free.

     What they fight over is CLEARING it. A naive onMouseLeave that
     nulls activeId destroys a selection the other source just made,
     because moving the pointer from card A to card B fires A's leave
     and B's enter, and a slide from a card onto its pin fires the leave
     with nothing to replace it. This ref records which card last
     claimed the highlight; a card may only clear what is still its own.
     A pin never touches the ref, so a pin-driven highlight cannot be
     cleared by a stale card leave either.

     Note this is deliberately separate from the map's popup, which is
     gated on PropertyMap's own cardId — hovering a CARD highlights the
     pin without opening a popup over the map. */
  const hoverCardRef = useRef<number | null>(null)
  const hoverIn = (id: number) => {
    hoverCardRef.current = id
    setActiveId(id)
  }
  const hoverOut = (id: number) => {
    if (hoverCardRef.current !== id) return
    hoverCardRef.current = null
    setActiveId(null)
  }

  if (wide) {
    return (
      <div className="mapview-root">
        <MapStage
          items={items}
          activeId={activeId}
          onHighlight={setActiveId}
          onOpen={open}
        />
        <ListPanel
          pageItems={items}
          total={results.length}
          loading={loading}
          page={safePage}
          activeId={activeId}
          sortKey={sortKey}
          collapsed={panelCollapsed}
          onOpen={open}
          onPageChange={setPage}
          onReset={resetFilters}
          onSortChange={setSortKey}
          onHoverIn={hoverIn}
          onHoverOut={hoverOut}
          onToggle={() => setPanelCollapsed((v) => !v)}
        />
      </div>
    )
  }

  /* Stacked fallback, unchanged from Stage 1: full-width map on top at a
     fixed height, then the result rows, normal document scroll. This is
     also the only branch where 地図を閉じる exists — MapPanel owns it,
     and there the label still means what it says.

     SearchBar is NOT rendered here: it stays a sibling of <main> in
     App.tsx, gated on the same WIDE_QUERY. See the note there. */
  return (
    <div>
      <div className="reslayout">
        <MapPanel
          pageItems={items}
          total={results.length}
          page={safePage}
          activeId={activeId}
          onHighlight={setActiveId}
          onOpen={open}
        />
        <PropertyList
          pageItems={items}
          total={results.length}
          loading={loading}
          page={safePage}
          activeId={activeId}
          sortKey={sortKey}
          onOpen={open}
          onPageChange={setPage}
          onReset={resetFilters}
          onSortChange={setSortKey}
        />
      </div>
    </div>
  )
}
