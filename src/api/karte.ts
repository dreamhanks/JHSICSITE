import { getKarteFor } from '../data/karte.mock'
import type { KarteStratum } from '../types/karte'
import { delay } from './config'

export async function getKarte(propertyId: number): Promise<KarteStratum[]> {
  await delay()
  return getKarteFor(propertyId)
}
