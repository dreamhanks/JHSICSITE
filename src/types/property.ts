export type Tone = 'warm' | 'gray' | 'navy' | 'sand'

/** Map pin colour class: g = 診断済み＋10年保証, o = 診断済み, s = 会員限定公開.
 *  Derived from facts via derivePinKind() — never stored. */
export type PinKind = 'g' | 'o' | 's'

export type BadgeVariant = 'g' | 'o' | 'b' | 's'

export interface Badge {
  variant: BadgeVariant
  label: string
}

export type Ward = '墨田区' | '台東区' | '江東区'
export type Structure = '木造' | '軽量鉄骨造' | 'RC造'
export type GroundGrade = 'A' | 'B' | 'C'
export type Rooms = 3 | 4 | 5 | 6

/** The suffix appended to the 地盤評価 line. Independent of
 *  hasSdsTest / hasNewBuildRecord because record 4 in the original
 *  mockup carries 「／新築時記録あり」 while having no 新築時履歴あり
 *  badge — the two are separate facts. */
export type GroundNote = 'sds' | 'newbuild' | 'none'

export interface Property {
  id: number

  // ---- location ----
  ward: Ward
  town: string
  addressSuffix: string
  /** WGS84. Placed at exactly walkMinutes x 80m from the record's own
   *  station, on a bearing chosen to stay inside its ward. */
  lat: number
  lng: number

  // ---- price & size ----
  priceYen: number
  floorAreaSqm: number
  landAreaSqm: number

  // ---- layout ----
  rooms: Rooms
  hasStudy: boolean
  structure: Structure
  floors: number

  // ---- age ----
  builtYear: number
  renovatedYear: number
  isFullRenovation: boolean

  // ---- access ----
  line: string
  station: string
  walkMinutes: number

  // ---- ground ----
  groundGrade: GroundGrade
  groundNote: GroundNote
  hasSdsTest: boolean

  // ---- facts driving badges / filters ----
  hasWarranty10y: boolean
  isInspected: boolean
  hasNewBuildRecord: boolean
  canProposeRenovation: boolean
  isMemberOnly: boolean

  // ---- presentation ----
  /** Bespoke marketing prose. formatTitle() prepends 【会員限定】. */
  headline: string
  tone: Tone
}
