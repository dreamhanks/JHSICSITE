import { ExteriorArt } from './ExteriorArt'
import { LivingArt } from './LivingArt'
import { KitchenArt } from './KitchenArt'
import { BathArt } from './BathArt'
import { Plan2fArt } from './Plan2fArt'
import type { ReactElement } from 'react'
import type { ArtProps } from './palettes'

export type ArtKey = 'exterior' | 'living' | 'kitchen' | 'bath' | 'plan2f'

/** Keyed exactly as the original `const ART={exterior,living,kitchen,bath,plan2f}`. */
export const ART: Record<ArtKey, (props: ArtProps) => ReactElement> = {
  exterior: ExteriorArt,
  living: LivingArt,
  kitchen: KitchenArt,
  bath: BathArt,
  plan2f: Plan2fArt,
}

/** Original GAL (L1013-1016). */
export const GAL: { key: ArtKey; cap: string }[] = [
  { key: 'exterior', cap: '外観' },
  { key: 'living', cap: 'リビング' },
  { key: 'kitchen', cap: 'キッチン' },
  { key: 'bath', cap: '浴室' },
  { key: 'plan2f', cap: '間取り図' },
]

/** Original CAPMAP (L1017). */
export const CAPMAP: Record<ArtKey, string> = {
  exterior: '外観 2階建て木造',
  living: 'リビング（リノベ後）',
  kitchen: '対面キッチン（リノベ後）',
  bath: '浴室（リノベ後）',
  plan2f: '間取り 5LDK',
}
