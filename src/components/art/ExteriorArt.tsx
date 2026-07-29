import { palette, type ArtProps } from './palettes'

export function ExteriorArt({ tone }: ArtProps) {
  const c = palette(tone)
  return (
    <svg viewBox="0 0 400 250" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">
      <rect width="400" height="250" fill={c.sky} /><rect y="185" width="400" height="65" fill="#dfe6d8" />
      <circle cx="52" cy="150" r="26" fill="#9cb894" /><rect x="49" y="150" width="6" height="42" fill="#8a7457" />
      <circle cx="358" cy="158" r="20" fill="#a7c09e" /><rect x="355" y="158" width="6" height="36" fill="#8a7457" />
      <rect x="110" y="70" width="180" height="122" fill="#f4f1ea" /><rect x="110" y="70" width="180" height="52" fill={c.wall2} />
      <polygon points="100,72 200,34 300,72" fill={c.roof} /><polygon points="200,34 300,72 292,72 200,42" fill="#7d6448" />
      <rect x="132" y="86" width="34" height="26" fill="#b7d2df" stroke="#fff" strokeWidth="3" />
      <rect x="182" y="86" width="34" height="26" fill="#b7d2df" stroke="#fff" strokeWidth="3" />
      <rect x="232" y="86" width="34" height="26" fill="#b7d2df" stroke="#fff" strokeWidth="3" />
      <rect x="132" y="138" width="52" height="42" fill="#b7d2df" stroke="#fff" strokeWidth="3" /><line x1="158" y1="138" x2="158" y2="180" stroke="#fff" strokeWidth="2" />
      <rect x="222" y="126" width="46" height="7" fill="#7d6448" /><rect x="228" y="132" width="34" height="60" fill={c.wood} />
      <rect x="233" y="140" width="24" height="44" fill="#7a6248" /><circle cx="239" cy="163" r="2" fill="#e8dcc0" />
      <polygon points="238,192 252,192 268,232 224,232" fill="#cfc7b8" />
    </svg>
  )
}
