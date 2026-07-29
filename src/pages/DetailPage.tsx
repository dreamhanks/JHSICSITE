import { useEffect, useState } from 'react'
import { getKarte } from '../api/karte'
import { getPropertyById } from '../api/properties'
import { Karte } from '../components/karte/Karte'
import { DetailCta } from '../components/property/DetailCta'
import { Gallery } from '../components/property/Gallery'
import { SpecTable } from '../components/property/SpecTable'
import { useAppState } from '../context/useAppState'
import { formatAddress, formatTitle } from '../lib/propertyFormat'
import type { KarteStratum } from '../types/karte'
import type { Property } from '../types/property'

export function DetailPage() {
  const { currentPropertyId, isMember, goToLogin, setView } = useAppState()
  const [property, setProperty] = useState<Property | null>(null)
  const [strata, setStrata] = useState<KarteStratum[]>([])
  const [loadingProperty, setLoadingProperty] = useState(true)
  const [loadingKarte, setLoadingKarte] = useState(true)

  useEffect(() => {
    if (currentPropertyId == null) return
    let alive = true
    setLoadingProperty(true)
    setLoadingKarte(true)
    getPropertyById(currentPropertyId).then((p) => {
      if (!alive) return
      setProperty(p)
      setLoadingProperty(false)
    })
    getKarte(currentPropertyId).then((k) => {
      if (!alive) return
      setStrata(k)
      setLoadingKarte(false)
    })
    return () => { alive = false }
  }, [currentPropertyId])

  return (
    <div className="detail show">
      <button className="backlink" onClick={() => setView('list')}>← 検索結果に戻る</button>
      <div className="dhead">
        <span className="t">
          {property ? `物件詳細：${formatAddress(property)}　${formatTitle(property)}` : ''}
        </span>
        {/* The `in` class is what lets CSS colour the logged-in state
            green; the two states are otherwise indistinguishable to a
            selector, since they differ only in text content. */}
        <span className="g">
          閲覧権限：<b className={isMember ? 'in' : undefined}>{isMember ? '会員（ログイン中）' : '非会員'}</b>
        </span>
      </div>
      <div className="dbody">
        <div className="dgrid">
          <div>
            {loadingProperty || !property ? (
              <>
                <div className="sk sk-gmain" />
                <div className="gal gthumbs">
                  {Array.from({ length: 5 }, (_, i) => <div key={i} className="sk sk-gth" />)}
                </div>
              </>
            ) : (
              <Gallery property={property} />
            )}
          </div>
          <div>
            {loadingProperty || !property ? (
              <div>
                {Array.from({ length: 8 }, (_, i) => <div key={i} className="sk sk-row" />)}
              </div>
            ) : (
              <>
                <SpecTable property={property} />
                <DetailCta propertyId={property.id} onRequest={() => setView('form')} />
              </>
            )}
          </div>
        </div>

        {/* onRegister: goToLogin records 'detail' as the origin, and
            currentPropertyId lives in context where no navigation clears
            it, so returning re-mounts this same property with the karte
            unlocked. */}
        <Karte
          strata={strata}
          loading={loadingKarte}
          isMember={isMember}
          onRegister={() => goToLogin()}
        />
      </div>
    </div>
  )
}
