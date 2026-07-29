import { useRef, useState } from 'react'
import { PageHero } from '../components/common/PageHero'
import { FormRow } from '../components/form/FormRow'
import { useAppState } from '../context/useAppState'

type ErrorKey = 'email' | 'password'

/** Step 2g. Replaces the 非会員／会員 toggle as the only way to become a
 *  member. No authentication happens: any non-empty pair succeeds, and
 *  the password is never stored, sent, or copied into app state — it
 *  lives in this component's state and dies with it.
 *
 *  Shell is .page + PageHero + .formcard, matching 会員限定 and
 *  購入サポート; the fields reuse FormRow so the .err treatment is the
 *  same one the 資料請求 form uses. */
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
    <div className="page show">
      <PageHero eyebrow="LOGIN" title="ログイン">
        会員としてログインすると、この物件の診断報告書・図面・地盤調査報告書・保証書をご覧いただけます。
      </PageHero>

      <div className="loginwrap">
        <div className="formcard">
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
    </div>
  )
}
