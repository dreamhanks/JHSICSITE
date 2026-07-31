import type { KarteStratum } from '../../types/karte'
import { DocButton } from './DocButton'

/** Design C Stage 3: the karte as a timeline.
 *
 *  Replaces the .strata bands. One spine, one dot per stratum, newest at
 *  top — which is the order the data already arrives in, so nothing is
 *  sorted here. Date and phase sit above the title, the document count
 *  sits on the right.
 *
 *  PRESENTATION ONLY. Same five strata, same nine documents, same
 *  DocButton, so the gate (memberOnly && !isMember) and the PDF download
 *  are untouched — this file contains no gate logic of its own.
 *
 *  The dots fade with age through --ktl-fade, set per item from the
 *  stratum's own depth. The fade is DECORATION: every dot is aria-hidden
 *  and the period and phase carry the same information as full-contrast
 *  text, so no meaning rests on a colour a user might not resolve. */
export function KarteTimeline({
  strata, isMember,
}: {
  strata: KarteStratum[]
  isMember: boolean
}) {
  return (
    <ol className="ktl">
      {strata.map((s) => (
        <li key={s.id} className="ktl-item" style={{ '--ktl-fade': FADE[s.depth] } as React.CSSProperties}>
          <span className="ktl-dot" aria-hidden="true"></span>
          <div className="ktl-when">
            <span className="ktl-period">{s.period}</span>
            <span className="ktl-phase">{s.phase}</span>
            <span className="ktl-n">{s.docs.length}件</span>
          </div>
          <b className="ktl-title">{s.title}</b>
          <span className="ktl-desc">{s.description}</span>
          <div className="ktl-docs">
            {s.docs.map((d) => <DocButton key={d.id} doc={d} isMember={isMember} />)}
          </div>
        </li>
      ))}
    </ol>
  )
}

/** Opacity by depth: 5 (newest) solid, 1 (着工前) faintest.
 *
 *  The floor is .52, not lower, because the dot is a graphical object
 *  and 3:1 is its minimum. --color-ink over the white .dbody measures
 *    1.00  #1a1a18  17.43:1     .64  #6c6c6b   5.26:1
 *     .88  #353534  12.28:1     .52  #888887   3.55:1
 *     .76  #51514f   7.96:1
 *  so every dot clears 3:1 and the ramp still reads as a fade. An
 *  earlier .38 floor measured 2.38:1 and failed. */
const FADE: Record<number, string> = {
  5: '1', 4: '.88', 3: '.76', 2: '.64', 1: '.52',
}
