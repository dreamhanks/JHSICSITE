import { useAppState } from '../../context/useAppState'
import { HeartIcon } from '../art/HeartIcon'

/** One favourite button for the list card, the マイページ card and the
 *  gallery main image. aria-label is computed (the original hardcoded
 *  お気に入り解除 only on the マイページ copy). */
export function FavoriteButton({ id }: { id: number }) {
  const { favs, toggleFav } = useAppState()
  const on = favs.has(id)
  return (
    <button
      className={on ? 'favbtn on' : 'favbtn'}
      aria-label={on ? 'お気に入り解除' : 'お気に入り'}
      aria-pressed={on}
      onClick={(e) => { e.stopPropagation(); toggleFav(id) }}
    >
      <HeartIcon />
    </button>
  )
}
