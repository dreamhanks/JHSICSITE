/* =============================================================
   Design C: Japanese labels, plus a narrow road-muting pass
   added in Stage 2 (see the block above muteMajorRoads for why
   that is not the recolour returning).

   The recolour is gone. Design A drained the basemap to a flat
   beige palette because the map was a companion to a list; in
   Design C the map IS the page, so it keeps Liberty's own
   cartography — parks, water, road hierarchy — and the UI recedes
   instead.

   RESTRUCTURE NOTE, and this was the trap:

   The old loop did the recolour and the label rewrite together,
   and `classify()` returning null did `continue` — which skipped
   the LABEL rewrite as well as the paint. classify() returned
   null for `aeroway` and `shield` layers, so those symbol layers
   silently kept their English names. Deleting classify() without
   noticing would have looked like a pure deletion while quietly
   changing which layers got Japanese.

   This version walks symbol layers only, and skips for exactly
   two reasons:

     1. No text-field at all. Liberty has two icon-only symbol
        layers, road_one_way_arrow and its _opposite. Setting a
        text-field on those would print street names on top of
        one-way arrows — ADDING labels where the style wants
        none. Positron had no such layers, so this hazard did not
        exist before the switch.
     2. isRefLabel. Route shields carry `ref` — a road number,
        not a place name — and rewriting those to name:ja blanks
        them, because a shield has no name.

   Everything else, aeroways included, now gets the rewrite. The
   name-bearing layers all use Liberty's name:latin/name:nonlatin
   pattern, and coalesce falls back to `name`, so none can blank.
   ============================================================= */

type MinimalLayer = {
  id: string
  type: string
  layout?: Record<string, unknown>
  paint?: Record<string, unknown>
}

/** Japanese first, falling back to the default name so nothing blanks. */
export const JA_TEXT_FIELD = ['coalesce', ['get', 'name:ja'], ['get', 'name']]

/** True when a symbol layer's text is a route ref rather than a name. */
export function isRefLabel(layer: MinimalLayer): boolean {
  const tf = layer.layout?.['text-field']
  return tf !== undefined && JSON.stringify(tf).includes('"ref"')
}

/** True when the layer draws icons only. Such a layer must be left alone:
 *  giving it a text-field invents labels the cartography never had. */
export function isIconOnly(layer: MinimalLayer): boolean {
  return layer.layout?.['text-field'] === undefined
}

interface StyleTarget {
  getStyle(): { layers: MinimalLayer[] }
  setLayoutProperty(id: string, prop: string, value: unknown): void
  setPaintProperty(id: string, prop: string, value: unknown): void
}

export interface LabelReport {
  /** Every layer in the style, of any type. */
  total: number
  /** How many of those are symbol layers — the label candidates. */
  symbolTotal: number
  labelsChanged: number
  /** Left in place on purpose: route shields and icon-only layers. */
  labelsLeftAlone: string[]
  failed: string[]
}

/* =============================================================
   Stage 2 fix 2: mute the major roads. THIS IS NOT THE RECOLOUR.

   The recolour walked all 111 layers, classified every one, and
   replaced the whole palette with a flat beige scheme — which is
   why the Design A map lost parks, water and road hierarchy and
   read as a drawing. Three things make this different:

     1. It is an ALLOW-LIST, driven by colour, not by a classifier
        with a default branch. A layer qualifies only if its id is
        a road, bridge or tunnel line AND its line-color is one of
        the five warm colours Liberty uses for the motorway, trunk,
        link and secondary-tertiary classes. 30 layers qualify.
        The other 81 — parks, water, buildings, landuse, every
        label, and the 28 minor road, rail and footpath lines
        Liberty already paints white or grey — are never read.

     2. It does not CHOOSE colours. Each one is derived from
        Liberty's own value: same hue, saturation cut to 28%,
        lightness moved 45% of the way to the #f8f4f0 background.
        The road hierarchy survives because casing and fill are
        muted by the same rule and stay distinguishable
        (#e9ac77 -> #d9cec5 casing against #fea -> #ebe8db fill).

     3. It is reversible by deleting one call. Nothing else in
        the style is consulted or written.

   Why at all: at the Stage 2 fit zoom of 13.1-14.0 the motorway
   casing was the loudest thing on screen, louder than the price
   pills, which are the entire point of a map-first design.
   ============================================================= */

/** Liberty's warm road colours, lower-cased. */
const LOUD_ROAD_COLOURS = new Set(['#e9ac77', '#fc8', '#fea', '#ffdaa6', '#fff4c6'])
const ROAD_LAYER = /^(road|bridge|tunnel)_/

const SATURATION_KEEP = 0.28
const LIGHTNESS_TOWARD_GROUND = 0.45
/** Liberty's own background layer, so muting moves toward the map's
 *  actual ground rather than toward an invented neutral. */
const GROUND_L = 0.96

function hexToRgb(hex: string): [number, number, number] {
  let h = hex.replace('#', '')
  if (h.length === 3) h = [...h].map((c) => c + c).join('')
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16)) as [number, number, number]
}

function rgbToHex(r: number, g: number, b: number): string {
  const to = (v: number) =>
    Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, '0')
  return `#${to(r)}${to(g)}${to(b)}`
}

function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  r /= 255; g /= 255; b /= 255
  const mx = Math.max(r, g, b), mn = Math.min(r, g, b)
  const l = (mx + mn) / 2
  if (mx === mn) return [0, 0, l]
  const d = mx - mn
  const s = l > 0.5 ? d / (2 - mx - mn) : d / (mx + mn)
  let h = mx === r ? (g - b) / d + (g < b ? 6 : 0) : mx === g ? (b - r) / d + 2 : (r - g) / d + 4
  return [h / 6, s, l]
}

function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  if (s === 0) return [l * 255, l * 255, l * 255]
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s
  const p = 2 * l - q
  const f = (t: number) => {
    t = (t + 1) % 1
    if (t < 1 / 6) return p + (q - p) * 6 * t
    if (t < 0.5) return q
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6
    return p
  }
  return [f(h + 1 / 3) * 255, f(h) * 255, f(h - 1 / 3) * 255]
}

/** Same hue, less saturation, lifted toward the ground colour. */
export function muteRoadColour(hex: string): string {
  const [h, s, l] = rgbToHsl(...hexToRgb(hex))
  return rgbToHex(...hslToRgb(h, s * SATURATION_KEEP, l + (GROUND_L - l) * LIGHTNESS_TOWARD_GROUND))
}

export interface RoadReport {
  /** Layers whose flat line-color was replaced. */
  muted: string[]
  /** Layers whose line-color was a zoom expression. Liberty has one,
   *  road_motorway, which interpolates to #fc8 from zoom 6 up. The map
   *  has MIN_ZOOM 11.5 and can never render the lower stop, so the
   *  expression is replaced wholesale by the muted flat colour. */
  expressionsFlattened: string[]
  failed: string[]
}

export function muteMajorRoads(map: StyleTarget): RoadReport {
  const layers = map.getStyle().layers ?? []
  const r: RoadReport = { muted: [], expressionsFlattened: [], failed: [] }

  for (const layer of layers) {
    if (layer.type !== 'line' || !ROAD_LAYER.test(layer.id)) continue
    const colour = layer.paint?.['line-color']

    let next: string | undefined
    let viaExpression = false

    if (typeof colour === 'string') {
      if (!LOUD_ROAD_COLOURS.has(colour.toLowerCase())) continue
      next = muteRoadColour(colour)
    } else if (colour !== undefined) {
      const flat = JSON.stringify(colour).toLowerCase()
      const hit = [...LOUD_ROAD_COLOURS].find((c) => flat.includes(`"${c}"`))
      if (!hit) continue
      next = muteRoadColour(hit)
      viaExpression = true
    } else {
      continue
    }

    try {
      map.setPaintProperty(layer.id, 'line-color', next)
      if (viaExpression) r.expressionsFlattened.push(layer.id)
      else r.muted.push(layer.id)
    } catch {
      r.failed.push(`${layer.id}:line-color`)
    }
  }

  return r
}

export function applyJapaneseLabels(map: StyleTarget): LabelReport {
  const layers = map.getStyle().layers ?? []
  const r: LabelReport = {
    total: layers.length, symbolTotal: 0,
    labelsChanged: 0, labelsLeftAlone: [], failed: [],
  }

  for (const layer of layers) {
    if (layer.type !== 'symbol') continue
    r.symbolTotal++

    if (isIconOnly(layer)) { r.labelsLeftAlone.push(`${layer.id}(icon-only)`); continue }
    if (isRefLabel(layer)) { r.labelsLeftAlone.push(`${layer.id}(ref)`); continue }

    try {
      map.setLayoutProperty(layer.id, 'text-field', JA_TEXT_FIELD)
      r.labelsChanged++
    } catch {
      r.failed.push(`${layer.id}:text-field`)
    }
  }

  return r
}
