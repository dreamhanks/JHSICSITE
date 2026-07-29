import { useState } from 'react'
import { Footer } from './components/layout/Footer'
import { Header } from './components/layout/Header'
import { MobileSheet } from './components/layout/MobileSheet'
import { SearchBar } from './components/layout/SearchBar'
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
 *  The search bar also sits outside <main>, but unlike the original it
 *  renders only on 物件検索. In the mockup show() never controlled it, so
 *  it appeared on every view including 物件詳細, where it pushed the
 *  property title down. Its chip and select state lives in
 *  AppStateContext precisely so unmounting here does not reset it. */
export function App() {
  const { view } = useAppState()
  const [sheetOpen, setSheetOpen] = useState(false)

  return (
    <>
      <Header onOpenSheet={() => setSheetOpen(true)} />
      <MobileSheet open={sheetOpen} onClose={() => setSheetOpen(false)} />
      {view === 'list' && <SearchBar />}
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
