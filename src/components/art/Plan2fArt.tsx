import type { ArtProps } from './palettes'

/** The original plan2f(c) accepted a palette and never used it — every
 *  colour is a literal. The prop is kept so the ART registry stays
 *  uniformly typed; `_props` satisfies noUnusedParameters. */
export function Plan2fArt(_props: ArtProps) {
  return (
    <svg viewBox="0 0 400 250" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">
      <rect width="400" height="250" fill="#fbfaf7" />
      <text x="20" y="26" fontSize="13" fontWeight="700" fill="#5c4322" fontFamily="sans-serif">1F</text>
      <text x="220" y="26" fontSize="13" fontWeight="700" fill="#5c4322" fontFamily="sans-serif">2F</text>
      <g stroke="#7a5c2e" strokeWidth="2" fill="none"><rect x="20" y="36" width="170" height="200" /><line x1="20" y1="150" x2="120" y2="150" /><line x1="120" y1="120" x2="120" y2="236" /><line x1="120" y1="120" x2="190" y2="120" /></g>
      <g fontSize="11" fill="#6b635a" fontFamily="sans-serif" textAnchor="middle"><text x="70" y="98">LDK 18帖</text><text x="70" y="196">和室 6帖</text><text x="155" y="86">洋室 6帖</text><text x="155" y="182">水回り</text></g>
      <g stroke="#7a5c2e" strokeWidth="2" fill="none"><rect x="210" y="36" width="170" height="200" /><line x1="210" y1="136" x2="380" y2="136" /><line x1="295" y1="36" x2="295" y2="136" /><line x1="295" y1="136" x2="295" y2="236" /></g>
      <g fontSize="11" fill="#6b635a" fontFamily="sans-serif" textAnchor="middle"><text x="252" y="92">洋室 8帖</text><text x="338" y="92">洋室 6帖</text><text x="252" y="190">洋室 6帖</text><text x="338" y="190">WIC・納戸</text></g>
      <g stroke="#a9895f" strokeWidth="1"><rect x="128" y="128" width="54" height="18" fill="none" /><line x1="128" y1="134" x2="182" y2="134" /><line x1="128" y1="140" x2="182" y2="140" /></g>
    </svg>
  )
}
