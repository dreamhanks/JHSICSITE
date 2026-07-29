import { useEffect, useState } from 'react'
import { getProperties } from '../api/properties'
import { HeartIcon } from '../components/art/HeartIcon'
import { PropertyCard } from '../components/property/PropertyCard'
import { PageHero } from '../components/common/PageHero'
import { useAppState } from '../context/useAppState'
import type { Property } from '../types/property'

export function MyPage() {
  const { favs, activeId, setActiveId, setCurrentPropertyId, setView } = useAppState()
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)

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

  return (
    <div className="page show">
      <PageHero eyebrow="MY PAGE" title="マイページ">
        お気に入り登録した物件の一覧です。気になる物件を保存して、じっくり比較検討いただけます。
      </PageHero>
      <div className="mypanel">
        <div className="mynav">
          <span className="t on">お気に入り物件</span>
          <span className="t">資料請求履歴</span>
          <span className="t">会員情報</span>
        </div>
        <div>
          {loading ? (
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
