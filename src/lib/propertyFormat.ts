import type { Badge, PinKind, Property } from '../types/property'

/** Pure formatters. Every display string in the UI comes from here —
 *  the data layer stores typed facts only.
 *
 *  Output is byte-identical to the six original mockup records; see the
 *  parity assertions in the Phase 3 verification. */

export function formatPrice(p: Property): string {
  return `¥${p.priceYen.toLocaleString('en-US')}`
}

/** Japanese property-portal convention: 8,980万円 / 1億1,200万円 / 1億円.
 *  Used in the result rows and the map pin aria-label. SpecTable and
 *  FormSidebar keep formatPrice() — the detail page is where the exact
 *  figure belongs. */
export function formatPriceMan(p: Property): string {
  const man = Math.round(p.priceYen / 10000)
  const oku = Math.floor(man / 10000)
  const rest = man % 10000
  if (oku === 0) return `${man.toLocaleString('en-US')}万円`
  if (rest === 0) return `${oku}億円`
  return `${oku}億${rest.toLocaleString('en-US')}万円`
}

export function formatArea(p: Property): string {
  return `延床 ${p.floorAreaSqm.toFixed(2)}㎡／土地 ${p.landAreaSqm.toFixed(2)}㎡`
}

/** 建物／土地 for the result-row spec strip: 117.50／108.72㎡ */
export function formatAreaShort(p: Property): string {
  return `${p.floorAreaSqm.toFixed(2)}／${p.landAreaSqm.toFixed(2)}㎡`
}

/** 5LDK / 5LDK＋書斎 — the spec strip has no room for the floor count. */
export function formatRoomsShort(p: Property): string {
  return `${p.rooms}LDK${p.hasStudy ? '＋書斎' : ''}`
}

/** 徒歩8分 — the station name is shown on its own line above it. */
export function formatWalk(p: Property): string {
  return `徒歩${p.walkMinutes}分`
}

export function formatPlan(p: Property): string {
  return `${p.rooms}LDK${p.hasStudy ? '＋書斎' : ''}（${p.floors}階建て）`
}

export function formatStructure(p: Property): string {
  return `${p.structure} ${p.floors}階建て`
}

export function formatAccess(p: Property): string {
  return `${p.line}「${p.station}」駅 徒歩${p.walkMinutes}分`
}

const GRADE_LABEL: Record<Property['groundGrade'], string> = {
  A: 'A（良好）',
  B: 'B（概ね良好）',
  C: 'C（要注意）',
}

const NOTE_SUFFIX: Record<Property['groundNote'], string> = {
  sds: '／SDS試験実施済',
  newbuild: '／新築時記録あり',
  none: '',
}

export function formatGround(p: Property): string {
  return GRADE_LABEL[p.groundGrade] + NOTE_SUFFIX[p.groundNote]
}

/** 築N年 is computed against the current year, so it never goes stale.
 *  `now` exists so the parity test can pin the assertion to 2026. */
export function formatAge(p: Property, now: number = new Date().getFullYear()): string {
  return `${formatAgeShort(p, now)}（${p.renovatedYear}年${p.isFullRenovation ? 'フル' : ''}リノベ）`
}

/** Age without the renovation parenthetical, e.g. 築22年.
 *  Used on the card, where the full string wrapped mid-token between
 *  築22 and 年. SpecTable keeps the full formatAge(). */
export function formatAgeShort(p: Property, now: number = new Date().getFullYear()): string {
  return `築${now - p.builtYear}年`
}

export function formatAddress(p: Property): string {
  return `東京都${p.ward}${p.town}　${p.addressSuffix}`
}

export function formatTitle(p: Property): string {
  return `${p.isMemberOnly ? '【会員限定】' : ''}${p.headline}`
}

/** Emission order recovered from the six original records:
 *  member -> warranty -> inspected -> newbuild -> renovation. */
export function deriveBadges(p: Property): Badge[] {
  const out: Badge[] = []
  if (p.isMemberOnly) out.push({ variant: 's', label: '会員限定公開' })
  if (p.hasWarranty10y) out.push({ variant: 'g', label: '10年保証付' })
  if (p.isInspected) out.push({ variant: 'o', label: '診断済み' })
  if (p.hasNewBuildRecord) out.push({ variant: 'b', label: '新築時履歴あり' })
  if (p.canProposeRenovation) out.push({ variant: 's', label: 'リノベ提案可' })
  return out
}

export function derivePinKind(p: Property): PinKind {
  if (p.isMemberOnly) return 's'
  if (p.hasWarranty10y) return 'g'
  return 'o'
}
