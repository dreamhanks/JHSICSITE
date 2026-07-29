import { useEffect, useState } from 'react'
import { getKarte } from '../api/karte'
import { getPropertyById } from '../api/properties'
import { Karte } from '../components/karte/Karte'
import { DetailCta } from '../components/property/DetailCta'
import { Gallery } from '../components/property/Gallery'
import { SpecTable } from '../components/property/SpecTable'
import { useAppState } from '../context/useAppState'
import {
  formatAddress, formatAreaShort, formatPriceMan, formatRoomsShort, formatTitle,
} from '../lib/propertyFormat'
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
        {/* Photo mosaic across the full content width: one large image
            and a 2x2 of the other four. */}
        {loadingProperty || !property ? (
          <div className="dmosaic">
            <div className="sk sk-gmain" />
            <div className="gal gthumbs">
              {Array.from({ length: 4 }, (_, i) => <div key={i} className="sk sk-gth" />)}
            </div>
          </div>
        ) : (
          <Gallery property={property} />
        )}

        <div className="dmain">
          <div className="dcontent">
            {loadingProperty || !property ? (
              <div>
                {Array.from({ length: 8 }, (_, i) => <div key={i} className="sk sk-row" />)}
              </div>
            ) : (
              <>
                {/* Price leads, address beneath it — the reverse of
                    Design A, where the headline led and the price sat
                    inside the spec table. */}
                <div className="dlead">
                  <div className="dprice">{formatPriceMan(property)}</div>
                  <div className="daddr">{formatAddress(property)}</div>
                  <div className="dsum">
                    {formatRoomsShort(property)} ・ {formatAreaShort(property)}
                  </div>
                </div>
                <SpecTable property={property} />
              </>
            )}
          </div>

          {/* Sticky action panel. Offset from --header-h, the variable
              Stage 2 established — the 16px is a gutter, not a second
              copy of the header height. */}
          <aside className="dside">
            {loadingProperty || !property ? null : (
              <DetailCta propertyId={property.id} onRequest={() => setView('form')} />
            )}
          </aside>

          {/* The karte spans BOTH columns, on its own grid row below the
              price block and the action panel. It is the differentiator
              and it was the thing being squeezed, so it takes the full
              measure rather than sharing it with an empty column.

              onRegister: goToLogin records 'detail' as the origin, and
              currentPropertyId lives in context where no navigation
              clears it, so returning re-mounts this same property with
              the karte unlocked. */}
          <div className="dkarte">
            <Karte
              strata={strata}
              loading={loadingKarte}
              isMember={isMember}
              onRegister={() => goToLogin()}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
