import { useEffect, useMemo, useState } from 'react'
import { getKarte } from '../api/karte'
import { getPropertyById } from '../api/properties'
import { Karte } from '../components/karte/Karte'
import { DetailHero } from '../components/property/DetailHero'
import { DetailSidebar } from '../components/property/DetailSidebar'
import { LocationMap } from '../components/property/LocationMap'
import { SpecTable } from '../components/property/SpecTable'
import { TrustStrip } from '../components/property/TrustStrip'
import { useAppState } from '../context/useAppState'
import { formatAddress, formatTitle } from '../lib/propertyFormat'
import type { KarteStratum } from '../types/karte'
import type { Property } from '../types/property'

/** Design C Stage 3. The page is now four bands:
 *
 *    .dhero     split panel — gallery left, key facts right
 *    .tstrip    the trust strip, full width, dark
 *    .dcols     the record (spec table, karte timeline, location map)
 *               beside the sticky enquiry sidebar
 *
 *  SpecTable is KEPT, below the trust strip. The hero's 2x2 grid shows
 *  four of its eight rows; 構造 and 地盤評価 appear nowhere else, so
 *  dropping the table would have lost data the page is arguing for. The
 *  overlap with the hero is deliberate — the hero is the summary, the
 *  table is the record.
 *
 *  DetailCta moved into DetailSidebar and is no longer rendered here. */
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

  /** The trust strip's 建物の記録 value — 9 with the current data. */
  const docCount = useMemo(
    () => strata.reduce((n, s) => n + s.docs.length, 0),
    [strata],
  )

  const ready = !loadingProperty && property !== null

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
        {ready ? (
          <DetailHero property={property} />
        ) : (
          <div className="dhero">
            <div className="dhero-gal">
              <div className="sk sk-gmain" />
              <div className="gal gthumbs">
                {Array.from({ length: 5 }, (_, i) => <div key={i} className="sk sk-gth" />)}
              </div>
            </div>
            <div className="dhero-facts">
              {Array.from({ length: 6 }, (_, i) => <div key={i} className="sk sk-row" />)}
            </div>
          </div>
        )}

        {/* Held back until BOTH loads are in: the record count comes from
            the karte, and revealing the strip a cell short would shift
            the whole band the moment it arrived. */}
        {ready && !loadingKarte
          ? <TrustStrip property={property} docCount={docCount} />
          : <div className="sk sk-tstrip" />}

        <div className="dcols">
          <div className="dmain">
            {ready ? (
              <SpecTable property={property} />
            ) : (
              <div>{Array.from({ length: 8 }, (_, i) => <div key={i} className="sk sk-row" />)}</div>
            )}

            {/* onRegister: goToLogin records 'detail' as the origin, and
                currentPropertyId lives in context where no navigation
                clears it, so returning re-mounts this same property with
                the karte unlocked. */}
            <Karte
              strata={strata}
              loading={loadingKarte}
              isMember={isMember}
              onRegister={() => goToLogin()}
            />

            {ready ? <LocationMap property={property} /> : null}
          </div>

          {ready ? (
            <DetailSidebar property={property} onRequest={() => setView('form')} />
          ) : null}
        </div>
      </div>
    </div>
  )
}
