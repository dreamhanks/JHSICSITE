import { useAppState } from '../../context/useAppState'
import { useMediaQuery } from '../../hooks/useMediaQuery'
import { WIDE_QUERY } from '../../lib/breakpoints'
import { HamburgerIcon, LogoMark } from '../art/Icons'
import { HeaderFilters } from './HeaderFilters'
import { JHS_URL, NAV_ITEMS, isNavActive } from './navItems'

export function Header({ onOpenSheet }: { onOpenSheet: () => void }) {
  const { view, setView, goHome, isLoggedIn, goToLogin, logout, favs } = useAppState()

  /* Design C Stage 2b. The filter row exists on exactly one view at
     exactly one size range, and the header has to know because the
     tagline is dropped in the same breath — hfilters is what carries
     that to the CSS.

     It is NOT body.mapview, though it describes the same condition.
     body.mapview is added in a ListPage effect, so it lands one paint
     LATE: the tagline would render at its full 221.73px for a frame,
     against a row that only has 19.10px of slack, and the header would
     visibly reflow on every entry to the list view. useMediaQuery seeds
     its state synchronously in a useState initialiser, so this class is
     on the very first paint, in the same render as the pills it has to
     make room for. */
  const wide = useMediaQuery(WIDE_QUERY)
  const hfilters = view === 'list' && wide

  return (
    <header className={hfilters ? 'hfilters' : undefined}>
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
        {/* Between the nav and the actions, a thin vertical rule at each
            end. HeaderFilters renders nothing at all below 1061px, where
            SearchBar is the filter surface instead. */}
        {view === 'list' ? <HeaderFilters /> : null}
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
