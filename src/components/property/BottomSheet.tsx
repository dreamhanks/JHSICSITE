import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'

/** Design C Stage 6: the draggable bottom sheet.
 *
 *  Hand-rolled — no package, and there was no touch or drag code
 *  anywhere in this codebase before it (the only pointer listener was
 *  HeaderFilters' outside-dismiss). Everything below is new, so it is
 *  documented at length.
 *
 *  ============ HOW A DRAG IS TOLD FROM A SCROLL ============
 *
 *  This is where hand-rolled sheets fail, so the decision is made ONCE
 *  per gesture, at the first significant move, and never revisited:
 *
 *    1. Under 6px of travel      -> undecided. Nothing moves yet.
 *    2. |dx| > |dy|              -> 'scroll'. A sideways swipe is never
 *                                   a sheet drag; we let it go.
 *    3. Started on the grab area -> 'sheet', always. The handle and the
 *                                   header exist to be dragged.
 *    4. Not at Full              -> 'sheet'. The content is
 *                                   overflow:hidden at Peek and Half,
 *                                   so there is nothing to scroll and a
 *                                   drag can only mean the sheet.
 *    5. At Full, scrollTop <= 0
 *       and dragging DOWN        -> 'sheet'. The list is already at its
 *                                   top, so a downward pull means
 *                                   "close", exactly as Google Maps.
 *    6. Otherwise                -> 'scroll'. Hands off; the browser
 *                                   scrolls the list natively.
 *
 *  STARTING A DRAG ON THE CONTENT rather than the handle is therefore
 *  well defined: rules 4 and 5 cover it. At Peek/Half it drags the
 *  sheet; at Full it scrolls the list, unless the list is already at
 *  the top and you pull down, which drags the sheet. In BOTH cases
 *  where we take over, the native scroller has nothing it could have
 *  done — it is either overflow:hidden or already at scrollTop 0 — so
 *  we are never fighting a scroll that the browser also wants to run,
 *  and no preventDefault is needed on a passive listener.
 *
 *  touch-action backs this up rather than carrying it: the grab area is
 *  touch-action:none (always ours), the scroller is touch-action:none
 *  until the sheet is at Full and pan-y once it is. Setting none on the
 *  sheet ROOT would have disabled the scroller too — touch-action is
 *  intersected down the hit-test chain — which is why it is set on the
 *  two parts and not the whole.
 *
 *  The pointer is captured only after we commit to 'sheet', so a
 *  gesture that turns out to be a scroll never has its events stolen.
 */

export type Snap = 'peek' | 'half' | 'full'

/** Sheet top, in px below the top of the map area, at Full. Leaves the
 *  floating filter chip uncovered — see .msv-bar in homille.css. */
const FULL_TOP = 68
/** Visible height at Peek: the header band and nothing else. */
const PEEK_HEIGHT = 90
/** Travel before the gesture is classified. */
const DECIDE_PX = 6
/** Travel under which a pointerup counts as a tap rather than a drag. */
const TAP_PX = 6

const ORDER: Snap[] = ['peek', 'half', 'full']

/** Controls that consume a tap where they stand. A gesture starting on
 *  one of these never becomes a sheet drag — see shouldIgnore. */
const CONTROL = 'select, button, a, input, textarea, [role="button"]'

/** True when a pointerdown must not start a gesture at all.
 *
 *  WHY THIS EXISTS. 並び替え sits inside .bsheet-grab, so fromGrab was
 *  true for it and rule 3 fired: a clean tap CYCLED the snap and a
 *  10px smudge took the gesture, with the click retargeting to .bsheet
 *  so the select never opened. The favourite heart and the pager had
 *  the same fault through rules 4 and 5.
 *
 *  THE ONE EXCEPTION IS THE CARD. PanelCard's .hit is a button whose
 *  :after is stretched over the entire card (inset:0), so every point
 *  on a card resolves to it — measured at three heights, all .hit.
 *  Treating it as a control would have left the sheet draggable only
 *  from the handle and the 10px gaps between cards, which breaks
 *  dragging the body at Peek and Half and pull-to-collapse at Full. It
 *  is not a control anyone aims at; it IS the body. A clean tap on it
 *  still opens the property, because a drag and a tap are already told
 *  apart by TAP_PX. */
function shouldIgnore(target: HTMLElement): boolean {
  const control = target.closest<HTMLElement>(CONTROL)
  if (!control) return false
  if (control.closest('.bsheet-handle')) return false   // the grab handle itself
  if (control.classList.contains('hit')) return false    // the card surface
  return true
}

function offsetsFor(height: number): Record<Snap, number> {
  return {
    full: FULL_TOP,
    half: Math.round(height * 0.5),
    peek: Math.max(FULL_TOP, height - PEEK_HEIGHT),
  }
}

export function BottomSheet({
  snap, onSnapChange, scrollRef, head, children, foot,
}: {
  snap: Snap
  onSnapChange: (s: Snap) => void
  /** The sheet's scroller, so the caller can register it as the app's
   *  scroll target and scroll it to top on paging. */
  scrollRef: React.RefObject<HTMLDivElement | null>
  head: ReactNode
  children: ReactNode
  foot: ReactNode
}) {
  const rootRef = useRef<HTMLDivElement>(null)
  const [height, setHeight] = useState(0)
  /** Live translateY while dragging; null when resting on a snap. */
  const [dragY, setDragY] = useState<number | null>(null)
  /** The same value, readable from event handlers without a stale closure. */
  const yRef = useRef(0)

  const gesture = useRef<{
    id: number
    startY: number
    startClientX: number
    startClientY: number
    startScroll: number
    fromGrab: boolean
    mode: 'idle' | 'sheet' | 'scroll'
    moved: number
    /** The last position this gesture ASKED for, recorded synchronously.
     *  The snap on release is computed from this and not from the
     *  rendered transform: a fast flick can lift the pointer before
     *  React has committed the final move, and reading rendered state
     *  there would snap back to where the drag started. */
    lastY: number
  } | null>(null)

  /* The sheet's own box drives the snap maths, so it follows a browser
     chrome change (mobile URL bar) without a magic number. */
  useEffect(() => {
    const el = rootRef.current
    if (!el) return
    const read = () => setHeight(el.getBoundingClientRect().height)
    read()
    if (typeof ResizeObserver === 'undefined') return
    const ro = new ResizeObserver(read)
    ro.observe(el)
    return () => { ro.disconnect() }
  }, [])

  const offsets = offsetsFor(height)
  const restY = offsets[snap]
  const y = dragY ?? restY
  yRef.current = y

  const clamp = useCallback(
    (v: number) => Math.min(offsets.peek, Math.max(offsets.full, v)),
    [offsets.peek, offsets.full],
  )

  const nearest = (v: number): Snap =>
    ORDER.reduce((best, s) =>
      Math.abs(offsets[s] - v) < Math.abs(offsets[best] - v) ? s : best, ORDER[0])

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return
    const target = e.target as HTMLElement
    if (shouldIgnore(target)) return
    gesture.current = {
      id: e.pointerId,
      startY: yRef.current,
      startClientX: e.clientX,
      startClientY: e.clientY,
      startScroll: scrollRef.current?.scrollTop ?? 0,
      fromGrab: !!target.closest('.bsheet-grab'),
      mode: 'idle',
      moved: 0,
      lastY: yRef.current,
    }
  }

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const g = gesture.current
    if (!g || e.pointerId !== g.id) return
    const dy = e.clientY - g.startClientY
    const dx = e.clientX - g.startClientX
    g.moved = Math.max(g.moved, Math.abs(dy), Math.abs(dx))

    if (g.mode === 'idle') {
      if (Math.abs(dy) < DECIDE_PX && Math.abs(dx) < DECIDE_PX) return
      if (Math.abs(dx) > Math.abs(dy)) { g.mode = 'scroll'; return }
      if (g.fromGrab) g.mode = 'sheet'
      else if (snap !== 'full') g.mode = 'sheet'
      else if (g.startScroll <= 0 && dy > 0) g.mode = 'sheet'
      else g.mode = 'scroll'
      if (g.mode === 'sheet') {
        try { e.currentTarget.setPointerCapture(g.id) } catch { /* already gone */ }
      }
    }
    if (g.mode !== 'sheet') return
    const next = clamp(g.startY + dy)
    g.lastY = next
    setDragY(next)
  }

  const endGesture = (e: React.PointerEvent<HTMLDivElement>, cancelled = false) => {
    const g = gesture.current
    if (!g || e.pointerId !== g.id) return
    gesture.current = null
    if (g.mode === 'sheet') {
      const landed = nearest(g.lastY)
      setDragY(null)
      if (landed !== snap) onSnapChange(landed)
      return
    }
    /* A tap on the grab area cycles peek -> half -> full -> peek. Read
       from the gesture rather than a click handler, so a drag that ends
       where it began does not also fire a cycle. */
    /* A CANCELLED pointer is not a tap. On a real device the native
       select picker can take the pointer away mid-gesture, and treating
       that as a tap would cycle the snap behind the open picker. */
    if (!cancelled && g.fromGrab && g.moved < TAP_PX) {
      onSnapChange(ORDER[(ORDER.indexOf(snap) + 1) % ORDER.length])
    }
  }

  /** Arrow keys move one snap point; Home and End jump to the ends. */
  const onHandleKeyDown = (e: React.KeyboardEvent) => {
    const i = ORDER.indexOf(snap)
    let next: Snap | null = null
    if (e.key === 'ArrowUp') next = ORDER[Math.min(ORDER.length - 1, i + 1)]
    else if (e.key === 'ArrowDown') next = ORDER[Math.max(0, i - 1)]
    else if (e.key === 'Home') next = 'full'
    else if (e.key === 'End') next = 'peek'
    if (!next) return
    e.preventDefault()
    if (next !== snap) onSnapChange(next)
  }

  return (
    <div
      ref={rootRef}
      className={`bsheet at-${snap}${dragY === null ? '' : ' dragging'}`}
      style={{ transform: `translate3d(0, ${Math.round(y)}px, 0)` }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={(e) => endGesture(e, false)}
      onPointerCancel={(e) => endGesture(e, true)}
    >
      <div className="bsheet-grab">
        {/* Without a visible line users assume the sheet is fixed. The
            button is the keyboard equivalent of the drag. */}
        <button
          type="button"
          className="bsheet-handle"
          aria-label="掲載物件"
          aria-expanded={snap !== 'peek'}
          onKeyDown={onHandleKeyDown}
        >
          <span className="bsheet-bar" aria-hidden="true"></span>
        </button>
        <div className="bsheet-head">{head}</div>
      </div>

      <div className="bsheet-scroll" ref={scrollRef}>{children}</div>

      <div className="bsheet-foot">{foot}</div>
    </div>
  )
}
