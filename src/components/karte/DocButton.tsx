import { downloadBlankPdf } from '../../lib/blankPdf'
import type { KarteDoc } from '../../types/karte'

/** Clicking downloads a blank single-page A4 PDF named after the
 *  document. `disabled` is the only gate, so the 公開 MAP document
 *  downloads whether or not anyone is logged in, while the eight
 *  memberOnly documents download only once logged in. */
export function DocButton({ doc, isMember }: { doc: KarteDoc; isMember: boolean }) {
  const disabled = doc.memberOnly && !isMember
  const status = doc.memberOnly ? (isMember ? '開く' : '会員限定') : '公開'

  return (
    <button
      className={`doc ${doc.colorClass}`}
      disabled={disabled}
      onClick={() => downloadBlankPdf(doc.label)}
    >
      <span className="ic">{doc.iconType}</span>
      <span className="lb">{doc.label}</span>
      <span className="st">{status}</span>
    </button>
  )
}
