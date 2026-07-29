import type { ReactNode } from 'react'

/** Both calloutbars in the mockup carry style="text-align:center",
 *  which maps to the core Tailwind utility text-center. */
export function CalloutBar({ children }: { children: ReactNode }) {
  return <div className="calloutbar text-center">{children}</div>
}
