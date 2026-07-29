import { useState } from 'react'
import { Footer } from './components/layout/Footer'
import { Header } from './components/layout/Header'
import { MobileSheet } from './components/layout/MobileSheet'
import { useAppState } from './context/useAppState'
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
 *  Design B: the search bar is gone from here. Its controls became the
 *  header's second row and are gated inside Header by the same
 *  `view === 'list'` test that used to live on this line. Their chip and
 *  select state still lives in AppStateContext, so unmounting the row
 *  when leaving 物件検索 does not reset it. */
export function App() {
  const { view } = useAppState()
  const [sheetOpen, setSheetOpen] = useState(false)

  return (
    <>
      <Header onOpenSheet={() => setSheetOpen(true)} />
      <MobileSheet open={sheetOpen} onClose={() => setSheetOpen(false)} />
      {/* Design B Stage 2: only 物件検索 goes full-bleed. Every other view
          keeps main's 1320px measure and 20px padding. */}
      <main className={view === 'list' ? 'mfull' : undefined}>
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
