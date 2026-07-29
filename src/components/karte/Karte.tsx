import type { KarteStratum } from '../../types/karte'
import { GateBanner } from './GateBanner'
import { OpenedBanner } from './OpenedBanner'
import { Stratum } from './Stratum'

export function Karte({
  strata, loading, isMember, onRegister,
}: {
  strata: KarteStratum[]
  loading: boolean
  isMember: boolean
  onRegister: () => void
}) {
  return (
    <section className="karte">
      <div className="kh">
        <h3>建物カルテ</h3>
        <span className="en">BUILDING RECORD ／ 着工前から現在までの全記録</span>
      </div>
      <p className="kd">この建物に対してJHSが実施した検査・点検・保証の履歴です。下段が古く、上段が新しい記録になります。</p>
      {loading ? (
        <div className="sk sk-strata" />
      ) : (
        <div className="strata">
          {strata.map((s) => <Stratum key={s.id} stratum={s} isMember={isMember} />)}
        </div>
      )}
      <GateBanner hidden={isMember} onRegister={onRegister} />
      <OpenedBanner show={isMember} />
    </section>
  )
}
