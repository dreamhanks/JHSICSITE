import { useAppState } from '../../context/useAppState'
import { HamburgerIcon, LogoMark } from '../art/Icons'
import { JHS_URL, NAV_ITEMS, isNavActive } from './navItems'

export function Header({ onOpenSheet }: { onOpenSheet: () => void }) {
  const { view, setView, goHome, isLoggedIn, goToLogin, logout, favs } = useAppState()

  return (
    <header>
      <div className="hwrap">
        {/* First in the DOM, so it leads the tab order with no tabindex.
            A real button activates on Enter and on Space, and picks up
            the global focus-visible ring, with no key handlers here.
            Prose kept free of slashes and leading dots: Tailwind scans
            this file as raw text and turns such tokens into utilities. */}
        <button className="logo" onClick={goHome} aria-label="Homille ホーム（物件検索）">
          <span className="mark"><LogoMark /></span>
          <span className="lt">
            <span className="n">Homille<small>ホーミル</small></span>
            <span className="c">家のこと、土地のこと、しっかり調べて安心生活。</span>
          </span>
        </button>
        <nav aria-label="メインメニュー">
          <a href={JHS_URL} target="_blank" rel="noopener">トップ</a>
          {NAV_ITEMS.map((item) => (
            <a
              key={item.view}
              href="#"
              className={isNavActive(item.view, view) ? 'on' : undefined}
              onClick={(e) => { e.preventDefault(); setView(item.view) }}
            >
              {item.label}
            </a>
          ))}
        </nav>
        <div className="hactions">
          {/* Takes the slot the memtoggle held, and like it stays visible
              at every width — the MOCKUP bar points here. */}
          {isLoggedIn ? (
            <button className="authbtn out" onClick={logout}>ログアウト</button>
          ) : (
            <button className="authbtn" onClick={() => goToLogin()}>ログイン</button>
          )}
          {/* Exactly one of the pair. Both open マイページ and show the
              same favourites; only お気に入り carries the count. */}
          {isLoggedIn ? (
            <button className="iconbtn" onClick={() => setView('mypage')}>マイページ</button>
          ) : (
            <button className="iconbtn" onClick={() => setView('mypage')}>
              お気に入り <span className="fav-n">{favs.size}</span>
            </button>
          )}
          <button className="hamb" aria-label="メニューを開く" onClick={onOpenSheet}>
            <HamburgerIcon />
          </button>
        </div>
      </div>
    </header>
  )
}
