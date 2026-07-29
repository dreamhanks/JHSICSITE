import { CheckIcon } from '../art/Icons'
import { useAppState } from '../../context/useAppState'

/** Step 2g: the 資料請求 no longer grants membership, so this screen no
 *  longer announces one. It reports the request and offers login as a
 *  separate, honest next step. goToLogin resolves the 'form' origin to
 *  the property detail itself, so no origin is passed from here. */
export function DoneView({ onBack }: { onBack: () => void }) {
  const { goToLogin } = useAppState()

  return (
    <div className="doneview">
      <div className="ok"><CheckIcon /></div>
      <h2>お申し込みを受け付けました</h2>
      <p>ご入力ありがとうございます。担当者より2営業日以内にご連絡いたします。</p>
      <p>診断報告書・図面・地盤調査報告書は、ログイン後にご覧いただけます。</p>
      <div className="doneacts">
        <button className="back2" onClick={onBack}>物件詳細を見る</button>
        <button className="back2 login" onClick={() => goToLogin()}>ログインする</button>
      </div>
    </div>
  )
}
