/** The four-axis footnote, shared by both filter surfaces.
 *
 *  SearchBar renders it as a sibling of .sw, where it sits under the
 *  search panel in the stacked layout; HeaderFilters renders it inside
 *  the こだわり panel, above the chips, with .cfil-note resetting the
 *  ported .axisnote's page-level width and padding.
 *
 *  The text is identical in both and is the reason this is a component
 *  rather than two copies of the same two sentences. It is its own file
 *  because filterFields.ts must stay JSX-free, and because oxlint's
 *  react/only-export-components wants a component module to export only
 *  the component — the same reason AppStateContext.tsx has appState.ts
 *  next to it. */
export function AxisNote({ className }: { className?: string }) {
  return (
    <div className={className ? `axisnote ${className}` : 'axisnote'}>
      <b>この4つの絞り込みは、他の不動産ポータルには存在しません。</b>
      地盤調査・建物検査・保証を自社で行うJHS様だからこそ提供できる検索軸です。
    </div>
  )
}
