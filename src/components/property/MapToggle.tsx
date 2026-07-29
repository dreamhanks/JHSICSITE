import { useAppState } from '../../context/useAppState'

/** 地図を閉じる / 地図を表示する.
 *
 *  One component, two placements, because the button has to survive the
 *  map unmounting. When the map is open it floats over the map's own
 *  top-right corner, rendered by MapPanel but OUTSIDE PropertyMap so it
 *  is not inside the region that tears down. When the map is closed the
 *  whole map column is gone, so ListPage renders it at the top of the
 *  expanded list instead.
 *
 *  Keeping it one component means the two labels and the handler have a
 *  single definition rather than being duplicated across the two sites. */
export function MapToggle({ className }: { className?: string }) {
  const { mapOpen, setMapOpen } = useAppState()

  return (
    <button
      className={className ? `map-toggle ${className}` : 'map-toggle'}
      aria-expanded={mapOpen}
      onClick={() => setMapOpen(!mapOpen)}
    >
      {mapOpen ? '地図を閉じる' : '地図を表示する'}
    </button>
  )
}
