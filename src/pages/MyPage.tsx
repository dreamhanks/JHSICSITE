import { useEffect, useRef, useState } from 'react'
import { getProperties } from '../api/properties'
import { HeartIcon } from '../components/art/HeartIcon'
import { PropertyCard } from '../components/property/PropertyCard'
import { PageHero } from '../components/common/PageHero'
import { useAppState } from '../context/useAppState'
import type { Property } from '../types/property'

/** Design C Stage 4 §2.3: .mynav becomes a left rail.
 *
 *  THE TABS NOW WORK. They were three inert <span>s with .on hardcoded
 *  on the first, no handler, no tabIndex and no role — so this adds the
 *  selection they always implied, and nothing else. Selection is LOCAL:
 *  which panel is showing is a property of this screen, not of the app,
 *  so it deliberately does not go into AppStateContext and it resets
 *  when the page unmounts.
 *
 *  role=tablist with arrow-key roving, because that is what a rail
 *  swapping panels actually is. (KarteTabs uses aria-pressed instead —
 *  there the requirement was that deleting the row leave no dangling
 *  tabpanel, which does not apply here.) */
const TABS = [
  { id: 'favs', label: 'お気に入り物件' },
  { id: 'requests', label: '資料請求履歴' },
  { id: 'account', label: '会員情報' },
] as const

type TabId = typeof TABS[number]['id']

export function MyPage() {
  const { favs, activeId, setActiveId, setCurrentPropertyId, setView } = useAppState()
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<TabId>('favs')
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([])

  useEffect(() => {
    let alive = true
    getProperties().then((p) => {
      if (!alive) return
      setProperties(p)
      setLoading(false)
    })
    return () => { alive = false }
  }, [])

  const open = (id: number) => {
    setActiveId(id)
    setCurrentPropertyId(id)
    setView('detail')
  }

  const items = properties.filter((p) => favs.has(p.id))

  /** Left/Right (and Up/Down, since the rail is vertical on desktop)
   *  move between tabs and take focus with them, as a tablist requires. */
  const onKeyDown = (e: React.KeyboardEvent, i: number) => {
    const delta = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1
      : e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? -1
      : e.key === 'Home' ? -i
      : e.key === 'End' ? TABS.length - 1 - i
      : 0
    if (delta === 0) return
    e.preventDefault()
    const next = (i + delta + TABS.length) % TABS.length
    setTab(TABS[next].id)
    tabRefs.current[next]?.focus()
  }

  return (
    <div className="page show">
      <PageHero eyebrow="MY PAGE" title="マイページ">
        お気に入り登録した物件の一覧です。気になる物件を保存して、じっくり比較検討いただけます。
      </PageHero>
      <div className="mypanel">
        <div className="mynav" role="tablist" aria-label="マイページ">
          {TABS.map((t, i) => (
            <button
              key={t.id}
              ref={(el) => { tabRefs.current[i] = el }}
              type="button"
              role="tab"
              id={`mytab-${t.id}`}
              className={t.id === tab ? 't on' : 't'}
              aria-selected={t.id === tab}
              aria-controls={`mypanel-${t.id}`}
              // Roving tabindex: one stop for the whole rail.
              tabIndex={t.id === tab ? 0 : -1}
              onClick={() => setTab(t.id)}
              onKeyDown={(e) => onKeyDown(e, i)}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div
          className="mybody"
          role="tabpanel"
          id={`mypanel-${tab}`}
          aria-labelledby={`mytab-${tab}`}
          tabIndex={0}
        >
          {tab !== 'favs' ? (
            <p className="mysoon">準備中です。</p>
          ) : loading ? (
            <div className="plist">
              {Array.from({ length: 2 }, (_, i) => <div key={i} className="sk sk-card" />)}
            </div>
          ) : items.length === 0 ? (
            <div className="emptyfav">
              <HeartIcon />
              <b>お気に入りはまだありません</b>
              <div>気になる物件のハートマークを押すと、ここに保存されます。</div>
              <button className="go2" onClick={() => setView('list')}>物件を探す</button>
            </div>
          ) : (
            <div className="plist">
              {items.map((p) => (
                <PropertyCard key={p.id} property={p} active={p.id === activeId} onOpen={open} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
