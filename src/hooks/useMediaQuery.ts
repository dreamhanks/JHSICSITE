import { useEffect, useState } from 'react'

/** Re-added in Step 2e: the desktop popup and the mobile bottom card are
 *  different components, not one component styled two ways, so the
 *  breakpoint has to be observed in JS. Mirrors the 640px boundary in
 *  homille.css. */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() =>
    typeof window !== 'undefined' && window.matchMedia(query).matches)

  useEffect(() => {
    const mql = window.matchMedia(query)
    const onChange = () => setMatches(mql.matches)
    setMatches(mql.matches)
    mql.addEventListener('change', onChange)
    return () => mql.removeEventListener('change', onChange)
  }, [query])

  return matches
}
