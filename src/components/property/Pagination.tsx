import { pageCount, pageItems } from '../../lib/propertySearch'

export function Pagination({
  total, page, onChange,
}: {
  total: number
  page: number
  onChange: (p: number) => void
}) {
  const last = pageCount(total)
  if (total === 0 || last <= 1) return null

  return (
    <nav className="pager" aria-label="ページ送り">
      <button
        className="pg nav" disabled={page <= 1}
        onClick={() => onChange(page - 1)} aria-label="前のページ"
      >‹</button>
      {pageItems(total, page).map((it, i) =>
        it === '…'
          ? <span key={`e${i}`} className="pg gap" aria-hidden="true">…</span>
          : (
            <button
              key={it}
              className={it === page ? 'pg on' : 'pg'}
              aria-current={it === page ? 'page' : undefined}
              aria-label={`${it}ページ目`}
              onClick={() => onChange(it)}
            >{it}</button>
          ),
      )}
      <button
        className="pg nav" disabled={page >= last}
        onClick={() => onChange(page + 1)} aria-label="次のページ"
      >›</button>
    </nav>
  )
}
