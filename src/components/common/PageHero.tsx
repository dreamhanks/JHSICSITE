import type { ReactNode } from 'react'

/** Step 2j: all four pages now use the same cream panel, so the tone
 *  prop is gone rather than left as a single-valued flag — there is
 *  nothing to vary. Reintroduce a `tone` union if a page ever needs a
 *  different treatment; do not bring back the booleans. */
export function PageHero({
  eyebrow, title, children,
}: {
  eyebrow: string
  title: string
  children: ReactNode
}) {
  return (
    <div className="pagehero">
      <div className="ey">{eyebrow}</div>
      <h1>{title}</h1>
      <p>{children}</p>
    </div>
  )
}
