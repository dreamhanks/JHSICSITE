import { useCallback, useMemo, useRef, useState, type ReactNode } from 'react'
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
  const [mapOpen, setMapOpen] = useState(true)

  /* ==================================================================
     Design C Stage 2: WHO IS THE SCROLLER.

     Every "go to the top" in this file used to be a bare
     window.scrollTo, because the document was always the scroller. On
     the full-viewport list view it is not: the document is locked and
     the results scroll inside a floating panel, so a window.scrollTo
     there is a silent no-op — paging to page 2 would leave the panel
     parked wherever page 1 was.

     The panel registers itself here on mount and deregisters on
     unmount, so this file needs no knowledge of the layout and no
     media query. Below the full-viewport breakpoint nothing registers
     and the behaviour is byte-for-byte what it was.

     scrollTop scrolls BOTH deliberately. Scoping it to one or the
     other would need this file to know which view is mounting next —
     setView('detail') fires while the panel is still registered, and
     the detail page needs the WINDOW at the top. Scrolling an already
     locked document is a no-op, so doing both is free and has no
     ordering hazard.
     ================================================================== */
  const scrollTargetRef = useRef<HTMLElement | null>(null)

  /** Called by the floating results panel. Passing null deregisters. */
  const registerScrollTarget = useCallback((el: HTMLElement | null) => {
    scrollTargetRef.current = el
  }, [])

  const scrollTop = useCallback(() => {
    scrollTargetRef.current?.scrollTo({ top: 0, behavior: 'instant' })
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [])

  /** Replaces the original show(). The scroll matches
   *  window.scrollTo({top:0,behavior:"instant"}) at mockup.html L1107. */
  const setView = useCallback((v: ViewName) => {
    setViewRaw(v)
    scrollTop()
  }, [scrollTop])

  /** Home logo. setView and goToPage each scroll on their own, so this
   *  drives the raw setters and scrolls once rather than three times.
   *  Filters are untouched by design — see the note on AppState.goHome. */
  const goHome = useCallback(() => {
    setViewRaw('list')
    setPage(1)
    scrollTop()
  }, [scrollTop])

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
    scrollTop()
  }, [view, currentPropertyId, scrollTop])

  const login = useCallback((email: string) => {
    setIsLoggedIn(true)
    setUserName(email)
    setViewRaw(loginOrigin)
    scrollTop()
  }, [loginOrigin, scrollTop])

  const logout = useCallback(() => {
    setIsLoggedIn(false)
    setUserName(null)
    // favs is untouched on purpose — see AppState.logout.
    setViewRaw('list')
    setPage(1)
    scrollTop()
  }, [scrollTop])

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
   *
   *  Design C Stage 2 REVERSED this one. It used to skip the scroll on
   *  the reasoning that "the search panel sits at the top of the page,
   *  so the user is already there" — true while the results were rows
   *  in a scrolling document, because changing a filter meant the user
   *  had just scrolled back up to reach the controls.
   *
   *  Under the full-viewport layout the controls float over the map and
   *  are reachable without moving the results at all, so that reasoning
   *  no longer holds: the panel keeps whatever offset it had and a
   *  filter change silently leaves the user mid-list, looking at result
   *  7 of a set that just changed underneath them. It now scrolls, the
   *  same as applyFilters. */
  const commitFilters = useCallback((next: SearchFilters) => {
    setPendingFilters(next)
    setAppliedFilters(next)
    setPage(1)
    scrollTop()
  }, [scrollTop])

  const applyFilters = useCallback(() => {
    setAppliedFilters(pendingFilters)
    setPage(1)
    scrollTop()
  }, [pendingFilters, scrollTop])

  const discardPendingFilters = useCallback(() => {
    setPendingFilters(appliedFilters)
  }, [appliedFilters])

  const resetFilters = useCallback(() => {
    setPendingFilters(INITIAL_FILTERS)
    setAppliedFilters(INITIAL_FILTERS)
    setPage(1)
    scrollTop()
  }, [scrollTop])

  const goToPage = useCallback((p: number) => {
    setPage(p)
    scrollTop()
  }, [scrollTop])

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
      registerScrollTarget,
    }),
    [
      view, setView, goHome, isLoggedIn, userName, goToLogin, login, logout,
      favs, toggleFav, activeId, currentPropertyId,
      pendingFilters, setPendingSelect, toggleChip,
      appliedFilters, commitFilters, applyFilters, discardPendingFilters, resetFilters,
      sortKey, page, goToPage, mapOpen, registerScrollTarget,
    ],
  )

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}
