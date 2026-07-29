/* =============================================================
   Recolours the OpenFreeMap Positron style to the palette of the
   original drawn map (the one the client already approved), and
   forces Japanese-only labels.

   Layers are matched by TYPE and by id SUBSTRING, never by a
   hardcoded id list, so an upstream rename degrades to "left at
   Positron's colour" rather than breaking.

   NOTE ON SUBSTRINGS: Positron does NOT name its road layers
   "road". They are highway_*, railway_*, tunnel_*, and the
   residential blocks are landuse_*. Matching only on "road"
   would have recoloured three pier layers and missed every
   actual street.
   ============================================================= */

/** Palette lifted from the deleted MapSvg. */
export const MAP_PALETTE = {
  land: '#f2efe8',
  block: '#e8e4da',
  green: '#dce6d5',
  water: '#c6d8e2',
  road: '#ffffff',
  casing: '#e3ded4',
  label: '#5c554d',
  halo: '#f2efe8',
} as const

type MinimalLayer = { id: string; type: string; layout?: Record<string, unknown> }

/** What a layer should become. `null` = deliberately left alone. */
export function classify(layer: MinimalLayer): { prop: string; color: string; extra?: [string, string] } | null {
  const id = layer.id.toLowerCase()
  const t = layer.type

  if (t === 'background') return { prop: 'background-color', color: MAP_PALETTE.land }

  // Aeroways are outside the three wards; recolouring them is noise.
  if (id.includes('aeroway')) return null
  // Route shields carry `ref`, not a place name — leave them entirely.
  if (id.includes('shield')) return null

  const isWater = id.includes('water')
  const isGreen = id.includes('park') || id.includes('wood') || id.includes('grass')
    || id.includes('landcover')
  const isBuilding = id.includes('building')
  const isBlock = id.includes('landuse')
  const isCasing = id.includes('casing')
  const isRoad = id.includes('highway') || id.includes('road') || id.includes('tunnel')
    || id.includes('bridge') || id.includes('motorway')
  const isRail = id.includes('railway')
  const isBoundary = id.includes('boundary')

  if (t === 'fill') {
    if (isWater) return { prop: 'fill-color', color: MAP_PALETTE.water }
    if (isGreen) return { prop: 'fill-color', color: MAP_PALETTE.green }
    if (isBuilding) return { prop: 'fill-color', color: MAP_PALETTE.block }
    if (isBlock) return { prop: 'fill-color', color: MAP_PALETTE.block }
    if (isRoad) return { prop: 'fill-color', color: MAP_PALETTE.road }
    return { prop: 'fill-color', color: MAP_PALETTE.block }
  }

  if (t === 'line') {
    if (isWater) return { prop: 'line-color', color: MAP_PALETTE.water }
    if (isCasing) return { prop: 'line-color', color: MAP_PALETTE.casing }
    if (isRail) return { prop: 'line-color', color: MAP_PALETTE.casing }
    if (isBoundary) return { prop: 'line-color', color: MAP_PALETTE.casing }
    if (isRoad) return { prop: 'line-color', color: MAP_PALETTE.road }
    return { prop: 'line-color', color: MAP_PALETTE.casing }
  }

  if (t === 'symbol') {
    return {
      prop: 'text-color',
      color: MAP_PALETTE.label,
      extra: ['text-halo-color', MAP_PALETTE.halo],
    }
  }

  // raster / heatmap / fill-extrusion etc. cannot take these paint props.
  return null
}

/** Japanese first, falling back to the default name so nothing blanks. */
export const JA_TEXT_FIELD = ['coalesce', ['get', 'name:ja'], ['get', 'name']]

/** True when a symbol layer's text is a route ref rather than a name. */
export function isRefLabel(layer: MinimalLayer): boolean {
  const tf = layer.layout?.['text-field']
  return tf !== undefined && JSON.stringify(tf).includes('"ref"')
}

interface StyleTarget {
  getStyle(): { layers: MinimalLayer[] }
  setPaintProperty(id: string, prop: string, value: unknown): void
  setLayoutProperty(id: string, prop: string, value: unknown): void
}

export interface StyleReport {
  total: number
  recoloured: number
  skipped: string[]
  symbolTotal: number
  labelsChanged: number
  labelsLeftAlone: string[]
  failed: string[]
}

export function applyHomilleStyle(map: StyleTarget): StyleReport {
  const layers = map.getStyle().layers ?? []
  const r: StyleReport = {
    total: layers.length, recoloured: 0, skipped: [],
    symbolTotal: 0, labelsChanged: 0, labelsLeftAlone: [], failed: [],
  }

  for (const layer of layers) {
    if (layer.type === 'symbol') r.symbolTotal++

    const plan = classify(layer)
    if (!plan) { r.skipped.push(`${layer.id}[${layer.type}]`); continue }

    try {
      map.setPaintProperty(layer.id, plan.prop, plan.color)
      if (plan.extra) map.setPaintProperty(layer.id, plan.extra[0], plan.extra[1])
      r.recoloured++
    } catch {
      r.failed.push(`${layer.id}:${plan.prop}`)
    }

    if (layer.type === 'symbol') {
      if (isRefLabel(layer)) {
        r.labelsLeftAlone.push(layer.id)
      } else {
        try {
          map.setLayoutProperty(layer.id, 'text-field', JA_TEXT_FIELD)
          r.labelsChanged++
        } catch {
          r.failed.push(`${layer.id}:text-field`)
        }
      }
    }
  }

  return r
}
