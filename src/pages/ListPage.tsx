import { useEffect, useMemo, useState } from 'react'
import { getProperties } from '../api/properties'
import { CHIPS } from '../components/layout/filterChips'
import { MapPanel } from '../components/property/MapPanel'
import { PropertyList, type AppliedPill } from '../components/property/PropertyList'
import { useAppState } from '../context/useAppState'
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
          pills={pills}
          onOpen={open}
          onPageChange={setPage}
          onReset={resetFilters}
        />
      </div>
    </div>
  )
}
