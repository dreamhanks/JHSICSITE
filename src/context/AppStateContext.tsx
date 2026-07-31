import { useCallback, useMemo, useState, type ReactNode } from 'react'
import type { FilterSelectKey, SearchFilters, SortKey } from '../lib/propertySearch'
import type { ViewName } from '../types/view'
import {
  AppStateContext as Ctx,
  INITIAL_FILTERS,
  type AppState,
  type ChipId,
} from './appState'

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [view, setViewRaw] = useState<ViewName>('list')
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userName, setUserName] = useState<string | null>(null)
  /** Where ログイン was pressed, so a successful login returns there
   *  rather than to a fixed page. */
  const [loginOrigin, setLoginOrigin] = useState<ViewName>('list')
  const [favs, setFavs] = useState<Set<number>>(() => new Set())
  const [activeId, setActiveId] = useState<number | null>(null)
  const [currentPropertyId, setCurrentPropertyId] = useState<number | null>(null)

  const [pendingFilters, setPendingFilters] = useState<SearchFilters>(INITIAL_FILTERS)
  const [appliedFilters, setAppliedFilters] = useState<SearchFilters>(INITIAL_FILTERS)
  const [sortKey, setSortKey] = useState<SortKey>('recommended')
  const [page, setPage] = useState(1)
  /** Design B mobile: the ≤640px 一覧 / 地図 toggle DRIVES this, so its
   *  initial value is which view mobile opens on — and NN/g is explicit
   *  that the list should be the default, for information density and
   *  faster selection.
   *
   *  A viewport-aware INITIALISER, not an effect. `true` here would have
   *  opened mobile on 地図; flipping it to `false` outright would have
   *  blanked the desktop map column on first paint; and an effect that
   *  forced `false` on mobile would re-fire on every crossing of 640px,
   *  clobbering a 地図 the user had deliberately chosen. Evaluated once
   *  at provider mount, this does none of those: ≥641px is `true` and
   *  byte-identical to before, ≤640px is `false`, and a later resize or
   *  rotation never overrides a choice already made. */
  const [mapOpen, setMapOpen] = useState(() =>
    typeof window === 'undefined' ||
    !window.matchMedia('(max-width: 640px)').matches)

  /** Replaces the original show(). The scroll matches
   *  window.scrollTo({top:0,behavior:"instant"}) at mockup.html L1107. */
  const setView = useCallback((v: ViewName) => {
    setViewRaw(v)
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [])

  /** Home logo. setView and goToPage each scroll on their own, so this
   *  drives the raw setters and scrolls once rather than three times.
   *  Filters are untouched by design — see the note on AppState.goHome. */
  const goHome = useCallback(() => {
    setViewRaw('list')
    setPage(1)
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [])

  /* ---- Auth. isMember is derived below, never stored. ---- */

  const goToLogin = useCallback(() => {
    // 'form' unmounts on navigation, so returning there yields a blank
    // 資料請求 form rather than the record being unlocked. Resolved here
    // rather than at each call site, so the header, the mobile sheet and
    // the completion screen all behave the same.
    let from = view
    if (from === 'form') from = currentPropertyId == null ? 'list' : 'detail'
    // Guard the re-entry case: pressing ログイン while already on the
    // login view must not overwrite the real origin with 'login'.
    if (from !== 'login') setLoginOrigin(from)
    setViewRaw('login')
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [view, currentPropertyId])

  const login = useCallback((email: string) => {
    setIsLoggedIn(true)
    setUserName(email)
    setViewRaw(loginOrigin)
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [loginOrigin])

  const logout = useCallback(() => {
    setIsLoggedIn(false)
    setUserName(null)
    // favs is untouched on purpose — see AppState.logout.
    setViewRaw('list')
    setPage(1)
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [])

  const toggleFav = useCallback((id: number) => {
    setFavs((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  const setPendingSelect = useCallback((key: FilterSelectKey, value: string) => {
    setPendingFilters((prev) => ({ ...prev, [key]: value }))
  }, [])

  const toggleChip = useCallback((id: ChipId) => {
    setPendingFilters((prev) => ({
      ...prev,
      chips: { ...prev.chips, [id]: !prev.chips[id] },
    }))
  }, [])

  /** Desktop filters apply on change. Both halves are set in one go, so
   *  pending === applied at all times outside an open mobile sheet.
   *  Deliberately does NOT scroll: the search panel sits at the top of
   *  the page, so the user is already there when they change a filter. */
  const commitFilters = useCallback((next: SearchFilters) => {
    setPendingFilters(next)
    setAppliedFilters(next)
    setPage(1)
  }, [])

  const applyFilters = useCallback(() => {
    setAppliedFilters(pendingFilters)
    setPage(1)
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [pendingFilters])

  const discardPendingFilters = useCallback(() => {
    setPendingFilters(appliedFilters)
  }, [appliedFilters])

  const resetFilters = useCallback(() => {
    setPendingFilters(INITIAL_FILTERS)
    setAppliedFilters(INITIAL_FILTERS)
    setPage(1)
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [])

  const goToPage = useCallback((p: number) => {
    setPage(p)
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [])

  const value = useMemo<AppState>(
    () => ({
      view, setView, goHome,
      isLoggedIn, userName, goToLogin, login, logout,
      // Derived, not stored: one source of truth for membership.
      isMember: isLoggedIn,
      favs, toggleFav,
      activeId, setActiveId,
      currentPropertyId, setCurrentPropertyId,
      pendingFilters, setPendingSelect, toggleChip,
      appliedFilters, commitFilters, applyFilters, discardPendingFilters, resetFilters,
      sortKey, setSortKey,
      page, setPage: goToPage,
      mapOpen, setMapOpen,
    }),
    [
      view, setView, goHome, isLoggedIn, userName, goToLogin, login, logout,
      favs, toggleFav, activeId, currentPropertyId,
      pendingFilters, setPendingSelect, toggleChip,
      appliedFilters, commitFilters, applyFilters, discardPendingFilters, resetFilters,
      sortKey, page, goToPage, mapOpen,
    ],
  )

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}
