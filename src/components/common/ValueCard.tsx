import type { ReactNode } from 'react'

export function ValueCard({
  icon, title, tag, children,
}: {
  icon: ReactNode
  title: string
  tag?: string
  children: ReactNode
}) {
  return (
    <div className="vc">
      <div className="ic">{icon}</div>
      <h3>{title}</h3>
      <p>{children}</p>
      {tag ? <span className="tagm">{tag}</span> : null}
    </div>
  )
}
