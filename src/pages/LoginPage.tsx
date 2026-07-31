import { useRef, useState } from 'react'
import { FormRow } from '../components/form/FormRow'
import { useAppState } from '../context/useAppState'

type ErrorKey = 'email' | 'password'

/** Step 2g. Replaces the 非会員／会員 toggle as the only way to become a
 *  member. No authentication happens: any non-empty pair succeeds, and
 *  the password is never stored, sent, or copied into app state — it
 *  lives in this component's state and dies with it.
 *
 *  Design C Stage 5 §2.1: THE CENTRED CARD.
 *
 *  The Stage 4 split screen and its LoginMap are gone — deleted, not
 *  hidden, along with every .loginmap / .loginsplit rule. What is left
 *  is the Stripe/Notion/Linear shape: one card, centred in the space
 *  below the header, and nothing else competing with it.
 *
 *  PageHero is gone from THIS page only. It still opens 会員限定,
 *  購入サポート and マイページ; a hero above a centred login card would
 *  have pinned the card to the bottom of the viewport and undone the
 *  centring.
 *
 *  Everything inside the card is untouched: the same h2, the same
 *  description with its モックアップ note, the same two FormRows with the
 *  same labels and validation, the same submit button. */
export function LoginPage() {
  const { login } = useAppState()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState<Set<ErrorKey>>(() => new Set())

  const emailRef = useRef<HTMLInputElement>(null)
  const passwordRef = useRef<HTMLInputElement>(null)

  const handleSubmit = () => {
    const bad = new Set<ErrorKey>()
    if (email.trim().length === 0) bad.add('email')
    if (password.length === 0) bad.add('password')
    setErrors(bad)

    if (bad.size > 0) {
      // Focus the first invalid input, in document order — as InquiryForm does.
      const first = bad.has('email') ? emailRef : passwordRef
      first.current?.focus()
      return
    }

    login(email.trim())
  }

  return (
    <div className="page show loginview">
      <div className="formcard logincard">
        <h2>会員ログイン</h2>
        <p className="fd">
          ご登録のメールアドレスとパスワードをご入力ください。
          <span className="req-note">※モックアップのため、任意のID・パスワードでログインできます。</span>
        </p>

        <FormRow label="メールアドレス" required error={errors.has('email')}
          message="メールアドレスをご入力ください。">
          <input ref={emailRef} type="email" placeholder="example@mail.com" autoComplete="email"
            value={email} onChange={(e) => setEmail(e.target.value)} />
        </FormRow>

        <FormRow label="パスワード" required error={errors.has('password')}
          message="パスワードをご入力ください。">
          <input ref={passwordRef} type="password" autoComplete="current-password"
            value={password} onChange={(e) => setPassword(e.target.value)} />
        </FormRow>

        <button className="fsubmit" onClick={handleSubmit}>ログインする</button>
      </div>
    </div>
  )
}
