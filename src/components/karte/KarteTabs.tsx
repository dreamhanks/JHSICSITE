/** Design C Stage 3 §2.4: the karte filter row.
 *
 *  BUILT TO BE DELETED CLEANLY. Everything that makes filtering work is
 *  either in this file or in the four marked lines of Karte.tsx. To
 *  remove the feature entirely:
 *
 *    1. delete this file
 *    2. in Karte.tsx delete the four lines marked "STAGE 3 TABS" —
 *       the import, the useState, the <KarteTabs> element, and the
 *       `shown` const — and pass `strata` straight to KarteTimeline
 *    3. delete the .ktabs block in homille.css
 *
 *  Nothing else refers to it. The result is the すべて view, which is an
 *  unfiltered timeline — exactly what renders today by default.
 *
 *  LABELS COME FROM THE DATA. Every label is a stratum's own `phase`,
 *  read in array order, so 売却前 / リフォーム後 / 居住中 / 工事中 /
 *  着工前 tell the building's story newest-first. No string is invented
 *  here; すべて is the one addition and it is already in the codebase as
 *  propertySearch.ts's select placeholder.
 *
 *  ROLES: this is a group of toggle buttons with aria-pressed, NOT a
 *  tablist. A tablist needs a partner element carrying role="tabpanel"
 *  and aria-controls, which would couple the timeline to this component
 *  and break requirement (2) above — deleting the row would leave a
 *  tabpanel with no tablist. A filter group is also the honest
 *  description of what this does. */
export function KarteTabs({
  phases, active, onChange,
}: {
  /** Each stratum's `phase`, in the data's own newest-first order. */
  phases: string[]
  /** null = すべて */
  active: string | null
  onChange: (phase: string | null) => void
}) {
  /* Named from the existing 建物カルテ heading (Karte.tsx gives it
     id="karte-h"), so the group has an accessible name without a visible
     label duplicating the heading, and without a new string. The id is
     inert if this component is deleted. */
  return (
    <div className="ktabs" role="group" aria-labelledby="karte-h">
      <button
        type="button"
        className={active === null ? 'ktab on' : 'ktab'}
        aria-pressed={active === null}
        onClick={() => onChange(null)}
      >
        すべて
      </button>
      {phases.map((ph) => (
        <button
          key={ph}
          type="button"
          className={active === ph ? 'ktab on' : 'ktab'}
          aria-pressed={active === ph}
          onClick={() => onChange(ph)}
        >
          {ph}
        </button>
      ))}
    </div>
  )
}
