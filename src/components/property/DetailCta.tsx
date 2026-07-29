import { useAppState } from '../../context/useAppState'
import { HeartIcon } from '../art/HeartIcon'

export function DetailCta({ propertyId, onRequest }: { propertyId: number; onRequest: () => void }) {
  const { favs, toggleFav } = useAppState()
  const on = favs.has(propertyId)

  return (
    <>
      <div className="cta">
        <button className="p" onClick={onRequest}>資料請求・内見を申し込む</button>
        <button className={on ? 'fav on' : 'fav'} onClick={() => toggleFav(propertyId)}>
          <HeartIcon />
          {on ? 'お気に入り登録済み' : 'お気に入りに追加'}
        </button>
      </div>
      <p className="ctanote">
        資料請求・内見申込・電話問い合わせが「反響」として計上され、担当不動産会社へ会員情報が連携されます。
      </p>
    </>
  )
}
