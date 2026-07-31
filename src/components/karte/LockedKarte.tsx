import { useEffect, useState } from 'react'
import { getKarte } from '../../api/karte'
import { useAppState } from '../../context/useAppState'
import type { KarteStratum } from '../../types/karte'
import { KarteTimeline } from './KarteTimeline'

/** Design C Stage 4 §2.1: 会員限定 argues by demonstration.
 *
 *  The page used to make its case with four benefit cards. It now shows
 *  the actual thing being withheld — a real 建物カルテ timeline with the
 *  newest stratum legible and the rest fading out of focus — and puts
 *  the login call to action over it.
 *
 *  KarteTimeline is REUSED, not forked. It takes only {strata, isMember}
 *  and holds no gate state of its own: the gate lives in DocButton
 *  (`memberOnly && !isMember`) and the banners are Karte's siblings, not
 *  the timeline's children. So this file adds a wrapper and an overlay
 *  and nothing else.
 *
 *  The data comes from the same api/karte the detail page uses, so
 *  karte.mock.ts is neither duplicated nor touched. getKarteFor ignores
 *  its argument — the karte is identical for every property — so any id
 *  yields the same five strata and nine documents. */
const DEMO_PROPERTY_ID = 1

export function LockedKarte() {
  const { isMember, goToLogin, setView } = useAppState()
  const [strata, setStrata] = useState<KarteStratum[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let alive = true
    getKarte(DEMO_PROPERTY_ID).then((k) => {
      if (!alive) return
      setStrata(k)
      setLoading(false)
    })
    return () => { alive = false }
  }, [])

  if (loading) return <div className="sk sk-strata" />

  const docCount = strata.reduce((n, s) => n + s.docs.length, 0)

  /* Logged in: the same timeline with nothing over it, and the button
     sends the reader to the inventory rather than to a login they have
     already done. 物件を探す is the string MyPage's empty state and
     PropertyList already use. */
  if (isMember) {
    return (
      <div className="mlock open">
        <KarteTimeline strata={strata} isMember />
        <div className="mlock-act">
          <button className="go2" onClick={() => setView('list')}>物件を探す</button>
        </div>
      </div>
    )
  }

  return (
    <div className="mlock">
      {/* inert, not just pointer-events:none. Eight of the nine document
          buttons are already `disabled` and so unfocusable, but the
          公開 地盤サポートマップ is not — without this it would be the
          one tabbable control inside a deliberately unreadable panel,
          and it would download a PDF from behind the lock. inert also
          removes the blurred text from the accessibility tree, which is
          correct here: the legible content in this state is the button,
          and its label carries the whole message. Same pairing
          ListPanel uses for the collapsed results panel. */}
      <div className="mlock-tl" aria-hidden inert>
        <KarteTimeline strata={strata} isMember={false} />
      </div>
      <div className="mlock-over">
        <button className="go2" onClick={() => goToLogin()}>
          ログインして全{docCount}件を見る
        </button>
      </div>
    </div>
  )
}
