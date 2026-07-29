import { useEffect, useMemo, useState } from 'react'
import { getProperties } from '../api/properties'
import { MapPanel } from '../components/property/MapPanel'
import { PropertyList } from '../components/property/PropertyList'
import { useAppState } from '../context/useAppState'
import { filterProperties, pageCount, pageSlice, sortProperties } from '../lib/propertySearch'
import type { Property } from '../types/property'

export function ListPage() {
  const {
    activeId, setActiveId, setCurrentPropertyId, setView,
    appliedFilters, resetFilters, sortKey, setSortKey, page, setPage,
  } = useAppState()

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

  const open = (id: number) => {
    setActiveId(id)
    setCurrentPropertyId(id)
    setView('detail')
  }

  /* SUUMO-style stack: full-width map on top, then the result rows.
     The old .split two-column grid is gone. */
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
