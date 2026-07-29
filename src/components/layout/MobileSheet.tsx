import type { MouseEvent as ReactMouseEvent } from 'react'
import { useAppState } from '../../context/useAppState'
import type { ViewName } from '../../types/view'
import { JHS_URL, NAV_ITEMS } from './navItems'

export function MobileSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { setView, goHome, isLoggedIn, goToLogin, logout, favs } = useAppState()

  const go = (e: ReactMouseEvent, v: ViewName) => {
    e.preventDefault()
    onClose()
    setView(v)
  }

  const goHomeAndClose = () => {
    onClose()
    goHome()
  }

  return (
    <div className={open ? 'msheet show' : 'msheet'}>
      <div className="bg" onClick={onClose}></div>
      <div className="pane">
        <div className="mh">
          {/* The b element stays, so the sheet stylesheet keeps supplying
              the wordmark type and the button only adds behaviour. */}
          <button className="mlogo" onClick={goHomeAndClose} aria-label="Homille ホーム（物件検索）">
            <b>Homille</b>
          </button>
          <button className="x" aria-label="閉じる" onClick={onClose}>×</button>
        </div>
        <a href={JHS_URL} target="_blank" rel="noopener" onClick={onClose}>トップ（JHS公式サイト）</a>
        {NAV_ITEMS.map((item) => (
          <a key={item.view} href="#" onClick={(e) => go(e, item.view)}>{item.label}</a>
        ))}
        {/* One of the pair, matching the header. */}
        {isLoggedIn ? (
          <a href="#" onClick={(e) => go(e, 'mypage')}>マイページ</a>
        ) : (
          <a href="#" onClick={(e) => go(e, 'mypage')}>お気に入り（<span>{favs.size}</span>）</a>
        )}
        {isLoggedIn ? (
          <a href="#" onClick={(e) => { e.preventDefault(); onClose(); logout() }}>ログアウト</a>
        ) : (
          <a href="#" onClick={(e) => { e.preventDefault(); onClose(); goToLogin() }}>ログイン</a>
        )}
      </div>
    </div>
  )
}
