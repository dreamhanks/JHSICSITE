/** The two width boundaries the list view observes in JS.
 *
 *  Both are duplicated as media queries in homille.css and MUST stay in
 *  step with it — that is why they live here rather than as local
 *  constants in the two components that need them.
 */

/** Above this the map fills the viewport and the results float over it;
 *  at or below it the Design C Stage 1 stacked layout is used unchanged,
 *  with a fixed-height map and a normally scrolling document. 1061 is
 *  the complement of the 1060px breakpoint homille.css already uses for
 *  .maphost, so no new boundary is introduced.
 *
 *  It also decides which of the two filter surfaces mounts: HeaderFilters
 *  above, SearchBar (and with it FilterSheet) at or below. They are the
 *  two arms of one conditional, so they can never be mounted together. */
export const WIDE_QUERY = '(min-width: 1061px)'

/** Design C Stage 2b. Above this the five filter pills are laid out
 *  individually in the header row; at or below it they collapse into a
 *  single 絞り込み pill that opens the same panel.
 *
 *  1320 is not a new number: it is .hwrap's max-width. At and above it
 *  the header's content box is pinned at 1280px, so the row's slack is
 *  constant; below it the content box shrinks 1px per 1px of viewport
 *  while the logo, nav and actions do not. That makes 1320 exactly the
 *  width at which the expanded row stops being width-independent, which
 *  is the only defensible place to put the boundary. Measured slack for
 *  the expanded row at 1320 and above is +19.10px with every filter set
 *  to its widest value; one pixel below it the row would start eating
 *  into that margin. */
export const HEADER_PILLS_QUERY = '(min-width: 1320px)'
