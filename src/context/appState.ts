import { createContext } from 'react'
import type { FilterSelectKey, SearchFilters, SortKey } from '../lib/propertySearch'
import type { ViewName } from '../types/view'

export type ChipId = 'warranty' | 'inspected' | 'ground' | 'newbuild'
export type ChipFilters = Record<ChipId, boolean>

/** DELIBERATE DEVIATION from the original mockup's initial visual.
 *
 *  mockup.html L500-503 hardcodes aria-pressed="true" on 10年保証付き and
 *  既存住宅診断済み, but there the chips were decorative and filtered
 *  nothing. Now that they are real AND filters, a pressed chip on first
 *  paint would hide most of the inventory and pre-empt the 探す
 *  demonstration. All four therefore start unpressed, so the app opens
 *  on the full 100 records. */
export const INITIAL_CHIP_FILTERS: ChipFilters = {
  warranty: false,
  inspected: false,
  ground: false,
  newbuild: false,
}

export const INITIAL_FILTERS: SearchFilters = {
  ward: '',
  station: '',
  price: '',
  plan: '',
  chips: INITIAL_CHIP_FILTERS,
}

export interface AppState {
  view: ViewName
  setView: (v: ViewName) => void
  /** The home logo. Navigation, NOT a reset: returns to 物件検索 at page
   *  1 and scrolls up, but deliberately leaves the filters alone —
   *  条件をリセット (resetFilters) is what clears them. Lives here so the
   *  header logo and the mobile sheet share one implementation. */
  goHome: () => void
  /* ---- Auth. Step 2g replaced the 非会員／会員 toggle with a login,
     so membership is no longer independently settable. ---- */
  isLoggedIn: boolean
  /** The email typed at login. Display only — no password is ever held
   *  in state, stored, or sent anywhere. */
  userName: string | null
  /** DERIVED from isLoggedIn, never stored alongside it, so the two
   *  cannot drift. Every pre-2g consumer (the karte gate, the opened
   *  banner, the doc buttons, the 閲覧権限 label) reads this unchanged. */
  isMember: boolean
  /** Opens the login view and remembers where the user came from.
   *  currentPropertyId is deliberately left alone, so returning to
   *  'detail' lands on the same property.
   *
   *  'form' is never recorded as the origin: that view unmounts on
   *  navigation, so returning would show a blank 資料請求 form instead
   *  of the record being unlocked. It resolves to the property detail,
   *  or the list when no property is current — the same rule the form's
   *  own back link uses. */
  goToLogin: () => void
  /** Any non-empty credentials succeed — this is a mockup. Returns the
   *  user to the view goToLogin recorded. */
  login: (email: string) => void
  /** Clears auth and returns to 物件検索. Deliberately does NOT clear
   *  favs: guest favourites are standard practice and dropping them
   *  mid-demo would read as a bug. */
  logout: () => void
  favs: Set<number>
  toggleFav: (id: number) => void
  activeId: number | null
  setActiveId: (id: number | null) => void
  currentPropertyId: number | null
  setCurrentPropertyId: (id: number | null) => void

  /** Edited by the search bar. Chips reflect their toggle immediately,
   *  but nothing re-queries until 探す is pressed. */
  pendingFilters: SearchFilters
  setPendingSelect: (key: FilterSelectKey, value: string) => void
  toggleChip: (id: ChipId) => void

  /** What the list is actually filtered by. */
  appliedFilters: SearchFilters
  /** Desktop entry point: writes pending AND applied together so the two
   *  can never drift, and returns to page 1. The mobile sheet still uses
   *  the pending -> applyFilters path, which is the correct pattern on a
   *  small screen. One implementation, two entry points. */
  commitFilters: (next: SearchFilters) => void

  /** この条件で探す — copies pending onto applied and returns to page 1. */
  applyFilters: () => void
  /** Closing the mobile filter sheet without applying: throws away the
   *  pending edits by resetting them back to what is currently applied. */
  discardPendingFilters: () => void
  /** 条件をリセット — clears both, back to page 1. */
  resetFilters: () => void

  /** Sorting is a display concern, so it applies immediately. */
  sortKey: SortKey
  setSortKey: (k: SortKey) => void

  page: number
  setPage: (p: number) => void

  /** 地図を閉じる / 地図を表示する. Held here rather than in MapPanel so
   *  the choice survives navigating away from 物件検索 and back. */
  mapOpen: boolean
  setMapOpen: (v: boolean) => void
}

/** Kept out of AppStateContext.tsx so that file only exports a
 *  component — required by oxlint react/only-export-components. */
export const AppStateContext = createContext<AppState | null>(null)
