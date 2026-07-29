import type { ChipId } from '../../context/appState'

/** The four こだわり conditions, shared by the header filter bar, the
 *  mobile filter sheet, and the applied-filter pills above the results.
 *
 *  UI configuration, not domain data — it stays here rather than being
 *  routed through types/ data/ api/, matching navItems.ts. It lives in
 *  its own module rather than beside a component because oxlint's
 *  react/only-export-components rule forbids a component file exporting
 *  anything else — the same reason AppStateContext keeps its context in
 *  appState.ts. */
export const CHIPS: { id: ChipId; variant: '' | 'o' | 'b'; label: string }[] = [
  { id: 'warranty', variant: '', label: '10年保証付き' },
  { id: 'inspected', variant: 'o', label: '既存住宅診断済み' },
  { id: 'ground', variant: 'b', label: '地盤評価 A・B' },
  { id: 'newbuild', variant: '', label: '新築時履歴あり' },
]
