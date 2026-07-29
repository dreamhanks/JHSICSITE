import type { ReactNode } from 'react'

export function Section({
  title, lead, children,
}: {
  title: string
  lead?: string
  children: ReactNode
}) {
  return (
    <div className="sec">
      <h2>{title}</h2>
      {lead ? <p className="lead">{lead}</p> : null}
      {children}
    </div>
  )
}
