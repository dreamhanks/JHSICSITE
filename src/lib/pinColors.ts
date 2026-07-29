import type { PinKind } from '../types/property'

/** Pin colours, DERIVED from the @theme tokens rather than duplicated, so
 *  a palette swap reaches the map without anyone remembering to edit here.
 *
 *  Lives in lib/ rather than beside PropertyMap because the map legend
 *  needs the same values: Design A hardcoded the legend swatches and they
 *  drifted from the pins the moment the palette changed. One source now,
 *  so they cannot disagree again.
 *
 *  The three stay semantically distinct: g is 診断済み＋10年保証, o is
 *  診断済み, s is 会員限定. */
const PIN_TOKEN: Record<PinKind, { token: string; fallback: string }> = {
  g: { token: '--color-green', fallback: '#067647' },
  o: { token: '--color-orange', fallback: '#d9480f' },
  s: { token: '--color-soil', fallback: '#0041D9' },
}

/** Read lazily, never at module scope: @theme compiles to a :root rule,
 *  which is not applied while modules are still evaluating. The stylesheet
 *  is a render-blocking <link>, so by first paint this always resolves. */
export function pinColor(kind: PinKind): string {
  const { token, fallback } = PIN_TOKEN[kind]
  const v = getComputedStyle(document.documentElement).getPropertyValue(token).trim()
  return v || fallback
}
