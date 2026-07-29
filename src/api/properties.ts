import { properties } from '../data/properties.mock'
import type { Property } from '../types/property'
import { delay } from './config'

export async function getProperties(): Promise<Property[]> {
  await delay()
  return properties
}

export async function getPropertyById(id: number): Promise<Property | null> {
  await delay()
  return properties.find((p) => p.id === id) ?? null
}
