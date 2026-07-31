import { useState } from 'react'
import type { KarteStratum } from '../../types/karte'
import { GateBanner } from './GateBanner'
import { KarteTabs } from './KarteTabs'          // STAGE 3 TABS (1 of 4)
import { KarteTimeline } from './KarteTimeline'
import { OpenedBanner } from './OpenedBanner'

export function Karte({
  strata, loading, isMember, onRegister,
}: {
  strata: KarteStratum[]
  loading: boolean
  isMember: boolean
  onRegister: () => void
}) {
  /** STAGE 3 TABS (2 of 4). null = すべて, the default. */
  const [active, setActive] = useState<string | null>(null)

  /** STAGE 3 TABS (3 of 4). Delete this and pass `strata` to the
   *  timeline to remove filtering; すべて is already the unfiltered set. */
  const shown = active === null ? strata : strata.filter((s) => s.phase === active)

  return (
    <section className="karte">
      <div className="kh">
        {/* id is what names the filter group — see KarteTabs. */}
        <h3 id="karte-h">建物カルテ</h3>
        <span className="en">BUILDING RECORD ／ 着工前から現在までの全記録</span>
      </div>
      <p className="kd">この建物に対してJHSが実施した検査・点検・保証の履歴です。下段が古く、上段が新しい記録になります。</p>
      {loading ? (
        <div className="sk sk-strata" />
      ) : (
        <>
          {/* STAGE 3 TABS (4 of 4) */}
          <KarteTabs
            phases={strata.map((s) => s.phase)}
            active={active}
            onChange={setActive}
          />
          <KarteTimeline strata={shown} isMember={isMember} />
        </>
      )}
      <GateBanner hidden={isMember} onRegister={onRegister} />
      <OpenedBanner show={isMember} />
    </section>
  )
}
