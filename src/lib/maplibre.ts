/** The single place MapLibre is booted.
 *
 *  Design C Stage 3 hoisted this out of PropertyMap because there are now
 *  TWO maps — the list map and the detail page's location map — and the
 *  worker bootstrap below has already caused two production incidents.
 *  A second hand-copied copy was not going to survive contact.
 *
 *  TWO MAPS IS SAFE, and is a first-class MapLibre scenario. Verified
 *  against maplibre-gl 6.0.0 in dist/maplibre-gl-dev.mjs:
 *
 *    L1771  getGlobalWorkerPool() — its own docstring reads "the single,
 *           global WorkerPool instance to be shared across each Map"
 *    L12940 new Dispatcher(getGlobalWorkerPool(), map._getMapId()) — each
 *           Map gets its own dispatcher over the SHARED pool
 *    L1736  acquire(mapId) keys on the map id
 *    L1745  release(mapId) terminates workers only when numActive() === 0
 *    L1763  WorkerPool.workerCount = 1 off Safari — one worker, all maps
 *
 *  loadMapLibre is safe to call any number of times: the three dynamic
 *  imports are module-cached, so the second caller downloads nothing, and
 *  setWorkerUrl (L28197) is a bare `config.WORKER_URL = value` that
 *  workerFactory (L1707) reads at worker-creation time — so re-setting it
 *  to the same URL is a no-op.
 */

/** OpenFreeMap Liberty — no key, no signup, no cookies. Liberty is the
 *  only OpenFreeMap style still maintained upstream, and it is a
 *  full-colour map: parks, water and a real road hierarchy, which is
 *  what a map-first design needs. Attribution is a licence requirement
 *  and must stay visible. */
export const STYLE_URL = 'https://tiles.openfreemap.org/styles/liberty'

/** Imports maplibre, its stylesheet and OUR worker, points maplibre at
 *  the worker, and hands back the module.
 *
 *  Point maplibre at a worker WE emit, before constructing any Map.
 *
 *  Why the deep dist/ path — do not "tidy" this into a bare
 *  'maplibre-gl' import, it will break the deployed map:
 *
 *  v6 went ESM-only and DELETED the UMD bundles, including
 *  maplibre-gl-csp.js, which was the build that existed precisely for
 *  bundlers that cannot serve a worker as a sibling file. What remains
 *  resolves its worker at runtime as
 *    new URL('./maplibre-gl-worker.mjs', import.meta.url)
 *  which is correct for CDN use, where the worker sits next to the
 *  entry, and wrong under any bundler: import.meta.url points at our
 *  hashed chunk in /assets/, where no such file exists. It 404s, and
 *  because a Worker built on a bad URL neither throws nor rejects, the
 *  map hangs on 'loading' forever rather than erroring.
 *
 *  ?worker&url makes Vite compile that file as a worker entry and hand
 *  back the emitted URL. It bundles the worker's own dependency graph —
 *  maplibre-gl-shared.mjs above all — into the chunk, so there is no
 *  sibling file to keep adjacent and nothing to hand-copy into public/.
 *
 *  Every import here is dynamic on purpose: maplibre must never reach
 *  the initial bundle. Callers must keep this inside their own lazy
 *  path. */
export async function loadMapLibre() {
  const mod = await import('maplibre-gl')
  await import('maplibre-gl/dist/maplibre-gl.css')
  const { default: workerUrl } =
    await import('maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url')
  mod.setWorkerUrl(workerUrl)
  return mod
}

/** Metres walked per minute, the figure the 徒歩N分 values are built on.
 *
 *  Documented at types/property.ts:32-33 — every record's lat/lng is
 *  "placed at exactly walkMinutes x 80m from the record's own station".
 *  It had never been a constant; the location map's radius circle is the
 *  first thing that needs it as a number rather than as prose. */
export const WALK_METRES_PER_MIN = 80

/** The shape maplibre's addSource wants, declared structurally.
 *
 *  NOT `GeoJSON.Feature<GeoJSON.Polygon>`: @types/geojson is present but
 *  only as a transitive dependency of maplibre, and tsconfig.app.json
 *  pins `types` to ["vite/client"], so its global namespace is not in
 *  scope. Importing it directly would make a transitive package a direct
 *  one without it appearing in package.json. Four lines avoid that. */
export interface CircleFeature {
  type: 'Feature'
  properties: Record<string, never>
  geometry: { type: 'Polygon'; coordinates: [number, number][][] }
}

/** A circle on the earth as a GeoJSON polygon, so the radius stays true
 *  in METRES at every zoom. A `circle` layer's circle-radius is in
 *  pixels and would need a zoom expression to mean a fixed distance;
 *  a polygon also takes line-dasharray, which a circle layer does not. */
export function circlePolygon(
  lng: number, lat: number, metres: number, steps = 96,
): CircleFeature {
  // Degrees per metre at this latitude. 111,320 m per degree of latitude
  // is the standard spherical approximation; longitude shrinks by cos(lat).
  const dLat = metres / 111_320
  const dLng = metres / (111_320 * Math.cos((lat * Math.PI) / 180))
  const ring: [number, number][] = []
  for (let i = 0; i <= steps; i++) {
    const t = (i / steps) * 2 * Math.PI
    ring.push([lng + dLng * Math.cos(t), lat + dLat * Math.sin(t)])
  }
  return { type: 'Feature', properties: {}, geometry: { type: 'Polygon', coordinates: [ring] } }
}
