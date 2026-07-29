import type { ArtKey } from '../components/art'
import type { Property } from '../types/property'
import { PHOTO_URLS } from '../data/propertyImages.mock'

/** PHOTO_URLS is `as const`, so indexing it with a computed slot key would
 *  be a type error and would claim every lookup succeeds. Widened here so
 *  a missing slot reads as undefined and falls through to the SVG art. */
const URLS: Record<string, string | undefined> = PHOTO_URLS

/** Room types that have photographs. 間取り図 is deliberately absent —
 *  no stock floor plan exists, so Plan2fArt stays SVG unconditionally. */
export type PhotoKey = Exclude<ArtKey, 'plan2f'>

/** How many files exist per room type. The id is taken modulo these, so
 *  a property always resolves to the same photo. */
const POOL: Record<PhotoKey, { prefix: string; count: number }> = {
  exterior: { prefix: 'ex', count: 12 },
  living: { prefix: 'lv', count: 10 },
  kitchen: { prefix: 'kt', count: 8 },
  bath: { prefix: 'bt', count: 8 },
}

const pad = (n: number) => String(n).padStart(2, '0')

/** Deterministic by id: the same record always resolves to slot ex-04,
 *  which now names a hotlinked Unsplash URL rather than a local file.
 *  Returns undefined when the slot has no photograph — the caller's
 *  signal to render the SVG art instead. */
export function photoUrl(p: Property, key: PhotoKey): string | undefined {
  const { prefix, count } = POOL[key]
  return URLS[`${prefix}-${pad((p.id % count) + 1)}`]
}

/** Japanese room name for the alt text. */
export const ROOM_LABEL: Record<PhotoKey, string> = {
  exterior: '外観',
  living: 'リビング',
  kitchen: 'キッチン',
  bath: '浴室',
}

/** Every distinct URL the whole data set can produce — 12+10+8+8 = 38.
 *  That is the ceiling on distinct image requests for a whole session,
 *  however many records are on screen. */
export function distinctUrlCount(): number {
  return Object.values(POOL).reduce((a, b) => a + b.count, 0)
}

/* ------------------------------------------------------------------
   Load-verdict cache.

   Keyed by URL, NOT by property id, so all records sharing slot ex-03
   settle the question with a single request. Deliberately plain module
   state: it dies on reload, which is what makes newly-added URLs
   appear after a refresh without any cache-busting. Nothing here is
   written to localStorage, sessionStorage, or any other durable store.
   ------------------------------------------------------------------ */
type Verdict = 'ok' | 'failed'
const verdicts = new Map<string, Verdict>()

export function getVerdict(url: string): Verdict | undefined {
  return verdicts.get(url)
}
export function setVerdict(url: string, v: Verdict): void {
  verdicts.set(url, v)
}
/** Test helper — also proves the cache is in-memory only. */
export function clearVerdicts(): void {
  verdicts.clear()
}
export function verdictStats(): { ok: number; failed: number } {
  let ok = 0, failed = 0
  verdicts.forEach((v) => { if (v === 'ok') ok++; else failed++ })
  return { ok, failed }
}
