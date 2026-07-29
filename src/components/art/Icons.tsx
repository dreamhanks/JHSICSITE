/** All remaining inline SVGs from the mockup, transcribed verbatim.
 *  The .vc .ic icons take their stroke/fill/stroke-width from
 *  `.vc .ic svg` in homille.css, exactly as in the original. */

export function LogoMark() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8"
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 10.5 12 3l9 7.5" /><path d="M5.5 9.5V21h13V9.5" /><path d="M12 21v-6" />
    </svg>
  )
}

/* Design B ink. The rendered colour comes from the stylesheet — the
   hamburger rule sets stroke to --color-paper on the dark header — so
   this literal is only the fallback if that rule is ever removed. */
export function HamburgerIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="#111116" strokeWidth="2" strokeLinecap="round">
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  )
}

export function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24"><path d="M4 12l5 5L20 6" /></svg>
  )
}

/* ---- 会員限定：会員登録で解放される4つの権限 ---- */

export function DocumentIcon() {
  return (
    <svg viewBox="0 0 24 24">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6" /><path d="M9 13h6M9 17h6" />
    </svg>
  )
}

export function BlueprintIcon() {
  return (
    <svg viewBox="0 0 24 24"><path d="M3 3h18v18H3z" /><path d="M3 9h18M9 21V9" /></svg>
  )
}

export function ShieldIcon() {
  return (
    <svg viewBox="0 0 24 24">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><path d="M9 12l2 2 4-4" />
    </svg>
  )
}

export function UsersIcon() {
  return (
    <svg viewBox="0 0 24 24">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
    </svg>
  )
}

/* ---- 会員限定：登録するとできること ---- */

export function HeartOutlineIcon() {
  return (
    <svg viewBox="0 0 24 24">
      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7z" />
    </svg>
  )
}

export function ChatIcon() {
  return (
    <svg viewBox="0 0 24 24"><path d="M4 4h16v12H5.17L4 17.17z" /><path d="M8 9h8M8 12h5" /></svg>
  )
}

export function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="8" /><path d="M21 21l-4.3-4.3" /></svg>
  )
}

/** Design B: the 絞り込み trigger. Sliders, not a magnifier — the search
 *  box beside it now owns SearchIcon, and two magnifiers in one row would
 *  read as two search controls. Stroke and viewBox match SearchIcon so it
 *  inherits the same sizing rules. */
export function FilterIcon() {
  return (
    <svg viewBox="0 0 24 24">
      <path d="M4 7h10M18 7h2M4 17h4M12 17h8" />
      <circle cx="16" cy="7" r="2" /><circle cx="10" cy="17" r="2" />
    </svg>
  )
}

/* ---- 購入サポート：地盤保証という土台の安心 ---- */

export function HouseIcon() {
  return (
    <svg viewBox="0 0 24 24"><path d="M3 20h18M5 20V9l7-5 7 5v11" /><path d="M9 20v-6h6v6" /></svg>
  )
}

export function ClockIcon() {
  return (
    <svg viewBox="0 0 24 24"><path d="M12 2a10 10 0 1 0 10 10" /><path d="M12 6v6l4 2" /></svg>
  )
}

export function MapPinIcon() {
  return (
    <svg viewBox="0 0 24 24">
      <path d="M21 10c0 7-9 12-9 12S3 17 3 10a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
    </svg>
  )
}

/* ---- 購入サポート：リフォーム・リノベーション ---- */

export function WrenchIcon() {
  return (
    <svg viewBox="0 0 24 24">
      <path d="M14.7 6.3a5 5 0 0 0-7 7l-4 4 1 1 4-4a5 5 0 0 0 7-7l-2.5 2.5-2-2z" />
    </svg>
  )
}

export function StarIcon() {
  return (
    <svg viewBox="0 0 24 24">
      <path d="M12 2l2.4 7.4H22l-6 4.6 2.3 7.4-6.3-4.6L5.7 21 8 14 2 9.4h7.6z" />
    </svg>
  )
}
