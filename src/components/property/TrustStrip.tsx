import type { Property } from '../../types/property'

/** Design C Stage 3: the trust strip — the design's signature.
 *
 *  The argument of this product is that JHS holds the record, so the
 *  record is promoted above the fold, directly under the hero, the way
 *  Opendoor places its trust signals.
 *
 *  NO CELL EVER MAKES A CLAIM THE DATA CANNOT SUPPORT. Three cells are
 *  always present and one is conditional:
 *
 *    建物の記録   the karte's document count — every record has one
 *    品質保証     10年 when hasWarranty10y, otherwise 無. Both are
 *                 facts: 45 of 100 records genuinely carry no warranty,
 *                 and saying so is more use to a reader than a cell
 *                 that quietly disappears.
 *    地盤評価     the record's own grade — every record has one
 *    既存住宅診断 rendered ONLY when isInspected. There is no 未: that
 *                 word is not in this codebase and the state is
 *                 unreachable anyway (100 of 100 records are inspected,
 *                 which is why the list panel says 全件が既存住宅診断済み).
 *                 If it ever changes the cell disappears rather than
 *                 inventing a label for it.
 *
 *  無 is authorised new Japanese, approved for this cell specifically.
 *  It appears nowhere else in the codebase except inside 無料. */
export function TrustStrip({
  property: p, docCount,
}: {
  property: Property
  /** Total documents in this property's karte — 9 today. */
  docCount: number
}) {
  const cells: { value: string; label: string }[] = [
    { value: `${docCount}件`, label: '建物の記録' },
  ]
  cells.push({ value: p.hasWarranty10y ? '10年' : '無', label: '品質保証' })
  cells.push({ value: p.groundGrade, label: '地盤評価' })
  if (p.isInspected) cells.push({ value: '済', label: '既存住宅診断' })

  return (
    <section className="tstrip" aria-labelledby="tstrip-lede">
      <span className="ts-lede" id="tstrip-lede">JHS が確認した記録</span>
      {/* dt before dd is the reading order — "建物の記録: 9件". The
          value sits ABOVE the label visually via column-reverse, so the
          DOM stays in the order a screen reader wants. */}
      <dl className="ts-cells">
        {cells.map((c) => (
          <div className="ts-cell" key={c.label}>
            <dt className="ts-l">{c.label}</dt>
            <dd className="ts-v">{c.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  )
}
