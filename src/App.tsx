import { useState } from 'react'
import { Footer } from './components/layout/Footer'
import { Header } from './components/layout/Header'
import { MobileSheet } from './components/layout/MobileSheet'
import { SearchBar } from './components/layout/SearchBar'
import { useAppState } from './context/useAppState'
import { useMediaQuery } from './hooks/useMediaQuery'
import { WIDE_QUERY } from './lib/breakpoints'
import { DetailPage } from './pages/DetailPage'
import { FormPage } from './pages/FormPage'
import { ListPage } from './pages/ListPage'
import { LoginPage } from './pages/LoginPage'
import { MemberPage } from './pages/MemberPage'
import { MyPage } from './pages/MyPage'
import { SupportPage } from './pages/SupportPage'

/** Replaces the original show(). The original kept all six views in the
 *  DOM and toggled display; here only the active view is rendered and it
 *  carries the .show class, so the ported CSS resolves identically.
 *  Unmounting is also what makes the form reset per 2.10.2.
 *
 *  The header, mobile sheet and footer sit outside <main> and render on
 *  every view.
 *
 *  Design C Stage 2b GATED THE SEARCH BAR ON WIDTH. It used to render on
 *  物件検索 at every width and was then floated over the map by
 *  position:fixed above 1061px. There are now two filter surfaces
 *  instead of one floated at two sizes — HeaderFilters in the header
 *  above 1061px, SearchBar at or below it — so it renders only in the
 *  narrow range now. Unmounting it above the breakpoint is what clears
 *  the map, in place of the deleted float rules.
 *
 *  It stays HERE, a sibling of <main>, rather than moving into
 *  ListPage's narrow branch: ListPage renders inside <main>, which is
 *  max-width:1320px with 20px of padding, so a .searchbar in there would
 *  stop being full-bleed and .sw's calc(100% - 40px) would resolve
 *  against an already-inset box. Both are visible changes below 1061px,
 *  which 2.6 rules out. The mount CONDITION changes; the DOM position
 *  does not.
 *
 *  Its chip and select state lives in AppStateContext, so unmounting on
 *  navigation or across the breakpoint does not reset it. */
export function App() {
  const { view } = useAppState()
  const wide = useMediaQuery(WIDE_QUERY)
  const [sheetOpen, setSheetOpen] = useState(false)

  return (
    <>
      <Header onOpenSheet={() => setSheetOpen(true)} />
      <MobileSheet open={sheetOpen} onClose={() => setSheetOpen(false)} />
      {view === 'list' && !wide && <SearchBar />}
      <main>
        {view === 'list' && <ListPage />}
        {view === 'detail' && <DetailPage />}
        {view === 'member' && <MemberPage />}
        {view === 'support' && <SupportPage />}
        {view === 'mypage' && <MyPage />}
        {view === 'form' && <FormPage />}
        {view === 'login' && <LoginPage />}
      </main>
      <Footer />
    </>
  )
}

export default App
