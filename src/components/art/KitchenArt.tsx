import { palette, type ArtProps } from './palettes'

export function KitchenArt({ tone }: ArtProps) {
  const c = palette(tone)
  return (
    <svg viewBox="0 0 400 250" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">
      <rect width="400" height="250" fill={c.wall} /><polygon points="0,218 400,200 400,250 0,250" fill={c.floor} />
      <rect x="40" y="30" width="320" height="46" fill={c.wall2} /><g stroke={c.wall} strokeWidth="2"><line x1="120" y1="30" x2="120" y2="76" /><line x1="200" y1="30" x2="200" y2="76" /><line x1="280" y1="30" x2="280" y2="76" /></g>
      <rect x="40" y="76" width="320" height="44" fill="#f2ede2" /><rect x="40" y="120" width="320" height="14" fill="#e8e2d5" />
      <g fill="none" stroke={c.wall2} strokeWidth="1"><line x1="120" y1="76" x2="120" y2="120" /><line x1="200" y1="76" x2="200" y2="120" /><line x1="280" y1="76" x2="280" y2="120" /><line x1="40" y1="98" x2="360" y2="98" /></g>
      <path d="M150 30 h100 l-14 34 h-72 z" fill="#c9c4ba" />
      <rect x="176" y="120" width="48" height="14" fill="#5a564f" /><circle cx="192" cy="127" r="4" fill="#3a3733" /><circle cx="208" cy="127" r="4" fill="#3a3733" />
      <rect x="70" y="150" width="260" height="70" rx="4" fill={c.wood} /><rect x="70" y="150" width="260" height="16" rx="3" fill="#efe9dd" />
      <g stroke="#8a7052" strokeWidth="1.5" opacity="0.5"><line x1="160" y1="166" x2="160" y2="220" /><line x1="240" y1="166" x2="240" y2="220" /></g>
      <rect x="96" y="156" width="42" height="6" rx="3" fill="#cfcabf" /><path d="M120 156 v-14 q0 -6 8 -6" fill="none" stroke="#9a958b" strokeWidth="3" />
      <circle cx="150" cy="236" r="11" fill={c.accent} /><rect x="148" y="236" width="4" height="12" fill="#7a7568" /><circle cx="250" cy="236" r="11" fill={c.accent} /><rect x="248" y="236" width="4" height="12" fill="#7a7568" />
      <line x1="150" y1="30" x2="150" y2="70" stroke="#8a7052" strokeWidth="2" /><circle cx="150" cy="74" r="8" fill={c.accent} /><line x1="250" y1="30" x2="250" y2="70" stroke="#8a7052" strokeWidth="2" /><circle cx="250" cy="74" r="8" fill={c.accent} />
    </svg>
  )
}
