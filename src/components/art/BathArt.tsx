import { palette, type ArtProps } from './palettes'

export function BathArt({ tone }: ArtProps) {
  const c = palette(tone)
  return (
    <svg viewBox="0 0 400 250" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">
      <rect width="400" height="250" fill="#e7edf0" /><polygon points="0,0 400,0 400,180 0,205" fill="#dfe7ea" />
      <polygon points="230,20 380,20 380,170 230,182" fill={c.wood} opacity="0.72" />
      <polygon points="0,205 400,180 400,250 0,250" fill="#c5ccce" />
      <g stroke="#d3d9da" strokeWidth="1.5"><line x1="100" y1="196" x2="120" y2="250" /><line x1="220" y1="188" x2="230" y2="250" /><line x1="320" y1="182" x2="326" y2="250" /></g>
      <rect x="40" y="150" width="200" height="64" rx="14" fill="#ffffff" /><rect x="52" y="158" width="176" height="44" rx="10" fill="#dcebf2" /><ellipse cx="140" cy="180" rx="80" ry="16" fill="#cfe4ef" opacity="0.6" />
      <rect x="120" y="128" width="40" height="8" rx="4" fill="#b9c2c5" /><rect x="136" y="112" width="8" height="18" fill="#c7cfd1" />
      <rect x="272" y="70" width="70" height="50" rx="3" fill="#cfe0e6" stroke="#fff" strokeWidth="3" /><rect x="278" y="128" width="58" height="10" rx="3" fill="#eef3f4" /><path d="M300 128 v-10 q0 -4 6 -4" fill="none" stroke="#9aa4a7" strokeWidth="3" />
      <line x1="360" y1="60" x2="360" y2="150" stroke="#c7cfd1" strokeWidth="4" /><circle cx="360" cy="58" r="8" fill="#c7cfd1" />
      <rect x="200" y="120" width="26" height="34" rx="3" fill={c.accent} opacity="0.7" />
    </svg>
  )
}
