import type { KarteStratum } from '../../types/karte'
import { DocButton } from './DocButton'

export function Stratum({ stratum, isMember }: { stratum: KarteStratum; isMember: boolean }) {
  return (
    <div className={`stratum s${stratum.depth}`}>
      <div className="when">{stratum.period}<small>{stratum.phase}</small></div>
      <div className="what">
        <b>{stratum.title}</b><span>{stratum.description}</span>
      </div>
      <div className="docs">
        {stratum.docs.map((d) => <DocButton key={d.id} doc={d} isMember={isMember} />)}
      </div>
    </div>
  )
}
