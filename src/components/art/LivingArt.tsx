import { palette, type ArtProps } from './palettes'

export function LivingArt({ tone }: ArtProps) {
  const c = palette(tone)
  return (
    <svg viewBox="0 0 400 250" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">
      <rect width="400" height="250" fill={c.wall} /><polygon points="0,0 60,26 60,192 0,218" fill={c.wall2} />
      <polygon points="0,218 60,192 400,175 400,250 0,250" fill={c.floor} />
      <g stroke={c.floorL} strokeWidth="1.5" opacity="0.6"><line x1="70" y1="192" x2="120" y2="250" /><line x1="160" y1="188" x2="200" y2="250" /><line x1="250" y1="184" x2="280" y2="250" /><line x1="340" y1="180" x2="356" y2="250" /></g>
      <rect x="250" y="40" width="130" height="120" fill="#cfe4ef" stroke="#fff" strokeWidth="4" /><line x1="315" y1="40" x2="315" y2="160" stroke="#fff" strokeWidth="3" />
      <rect x="228" y="120" width="18" height="24" fill="#b7936a" /><path d="M237 120 Q220 90 232 78 Q240 96 237 120" fill={c.accent} /><path d="M237 120 Q254 92 246 76 Q240 98 237 120" fill="#7fa07f" />
      <rect x="96" y="150" width="150" height="46" rx="8" fill={c.accent} /><rect x="90" y="140" width="26" height="56" rx="8" fill={c.accent} /><rect x="226" y="140" width="26" height="56" rx="8" fill={c.accent} />
      <rect x="120" y="150" width="44" height="24" rx="6" fill="#fff" opacity="0.28" /><rect x="180" y="150" width="44" height="24" rx="6" fill="#fff" opacity="0.28" />
      <ellipse cx="172" cy="216" rx="120" ry="18" fill="#e8d9c2" opacity="0.65" />
      <rect x="132" y="198" width="80" height="14" rx="3" fill={c.wood} /><rect x="138" y="212" width="6" height="12" fill="#8a7052" /><rect x="200" y="212" width="6" height="12" fill="#8a7052" />
      <rect x="96" y="60" width="40" height="52" fill="#fff" stroke={c.wood} strokeWidth="3" /><rect x="104" y="70" width="24" height="32" fill={c.accent} opacity="0.5" />
      <line x1="180" y1="0" x2="180" y2="30" stroke="#8a7052" strokeWidth="2" /><path d="M166 30 h28 l-6 14 h-16 z" fill={c.wood} />
    </svg>
  )
}
