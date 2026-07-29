export type DocIconType = 'PDF' | 'JPG' | 'MAP'

/** Matches the original `.doc.o` / `.doc.b` / `.doc.g` colour classes. */
export type DocColorClass = 'o' | 'b' | 'g'

export interface KarteDoc {
  id: string
  iconType: DocIconType
  colorClass: DocColorClass
  label: string
  /** Replaces the original data-gate attribute: data-gate="1" -> true */
  memberOnly: boolean
}

/** 1 = deepest / oldest stratum (着工前), 5 = newest (売却前). Drives the .sN band colour. */
export type StratumDepth = 1 | 2 | 3 | 4 | 5

export interface KarteStratum {
  id: string
  depth: StratumDepth
  /** The .when date label, e.g. 2026年6月 */
  period: string
  /** The .when <small> sub-label, e.g. 売却前 */
  phase: string
  title: string
  description: string
  docs: KarteDoc[]
}
