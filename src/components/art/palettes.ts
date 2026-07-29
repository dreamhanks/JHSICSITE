import type { Tone } from '../../types/property'

export interface Palette {
  wall: string
  wall2: string
  floor: string
  floorL: string
  accent: string
  wood: string
  sky: string
  roof: string
}

/** Transcribed verbatim from mockup.html L908-913. */
export const PAL: Record<Tone, Palette> = {
  warm: { wall: '#efe9df', wall2: '#e5ddce', floor: '#c8a878', floorL: '#d8bb8f', accent: '#6b8e6f', wood: '#a9895f', sky: '#cfe4ef', roof: '#9c7f5c' },
  gray: { wall: '#ededec', wall2: '#e0e0df', floor: '#bcb7af', floorL: '#cbc7c0', accent: '#7c8a99', wood: '#9a9186', sky: '#d6e2e8', roof: '#8f8b83' },
  navy: { wall: '#eaeef1', wall2: '#dde4ea', floor: '#c0a982', floorL: '#d0bd9a', accent: '#3f5a70', wood: '#a68a62', sky: '#c9dbe6', roof: '#6d7f8c' },
  sand: { wall: '#f1ece2', wall2: '#e7ddca', floor: '#cbb086', floorL: '#dcc59d', accent: '#b07b4e', wood: '#a9895f', sky: '#d8e8ee', roof: '#a07b52' },
}

/** Mirrors the original `tone(name)` helper, fallback included. */
export function palette(name: Tone): Palette {
  return PAL[name] || PAL.warm
}

/** Shared signature so the ART registry stays uniformly typed.
 *  Plan2fArt ignores `tone` — the original plan2f() did too. */
export interface ArtProps {
  tone: Tone
}
