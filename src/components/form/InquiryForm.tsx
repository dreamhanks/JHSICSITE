import { useRef, useState } from 'react'
import { submitInquiry } from '../../api/inquiry'
import type { InquiryPayload } from '../../types/inquiry'
import type { Property } from '../../types/property'
import { DoneView } from './DoneView'
import { FormRow } from './FormRow'

type ErrorKey = 'name' | 'email' | 'tel'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/** Step 2g: this no longer grants membership. A 資料請求 is not a login,
 *  so the submit sets no auth state and the copy makes no membership
 *  claim; the completion screen offers a ログインする route instead. */
export function InquiryForm({ property, onDone }: { property: Property; onDone: () => void }) {
  const [name, setName] = useState('')
  const [kana, setKana] = useState('')
  const [email, setEmail] = useState('')
  const [tel, setTel] = useState('')
  const [zip, setZip] = useState('')
  const [pref, setPref] = useState('')
  const [timing, setTiming] = useState('')
  const [contactByEmail, setContactByEmail] = useState(true)
  const [contactByPhone, setContactByPhone] = useState(false)
  const [wantsViewing, setWantsViewing] = useState(false)
  const [message, setMessage] = useState('')
  const [agreed, setAgreed] = useState(false)

  const [errors, setErrors] = useState<Set<ErrorKey>>(() => new Set())
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)

  const nameRef = useRef<HTMLInputElement>(null)
  const emailRef = useRef<HTMLInputElement>(null)
  const telRef = useRef<HTMLInputElement>(null)

  const handleSubmit = async () => {
    const bad = new Set<ErrorKey>()
    if (name.trim().length === 0) bad.add('name')
    if (!EMAIL_RE.test(email)) bad.add('email')
    if (tel.replace(/[^0-9]/g, '').length < 10) bad.add('tel')
    setErrors(bad)

    if (bad.size > 0) {
      // Focus the first invalid input, in document order.
      const first = bad.has('name') ? nameRef : bad.has('email') ? emailRef : telRef
      first.current?.focus()
      return
    }

    const payload: InquiryPayload = {
      propertyId: property.id,
      name, kana, email, tel, zip, pref, timing,
      contactByEmail, contactByPhone, wantsViewing, message, agreed,
    }

    setSubmitting(true)
    const result = await submitInquiry(payload)
    setSubmitting(false)
    if (result.ok) setDone(true)
  }

  if (done) return <div className="formcard"><DoneView onBack={onDone} /></div>

  return (
    <div className="formcard">
      <h2>資料請求・内見のお申し込み</h2>
      <p className="fd">
        下記のフォームにご入力ください。担当不動産会社より、ご希望の連絡方法でご連絡いたします。
        <span className="req-note">＊は必須項目です。</span>
      </p>

      <FormRow label="お名前" required error={errors.has('name')} message="お名前をご入力ください。">
        <input ref={nameRef} type="text" placeholder="山田 太郎" autoComplete="name"
          value={name} onChange={(e) => setName(e.target.value)} />
      </FormRow>

      <FormRow label="フリガナ" optional>
        <input type="text" placeholder="ヤマダ タロウ" value={kana} onChange={(e) => setKana(e.target.value)} />
      </FormRow>

      <div className="f2">
        <FormRow label="メールアドレス" required error={errors.has('email')} message="正しいメールアドレスをご入力ください。">
          <input ref={emailRef} type="email" placeholder="example@mail.com" autoComplete="email"
            value={email} onChange={(e) => setEmail(e.target.value)} />
        </FormRow>
        <FormRow label="電話番号" required error={errors.has('tel')} message="電話番号をご入力ください。">
          <input ref={telRef} type="tel" placeholder="090-1234-5678" autoComplete="tel"
            value={tel} onChange={(e) => setTel(e.target.value)} />
        </FormRow>
      </div>

      <div className="f2">
        <FormRow label="郵便番号" optional>
          <input type="text" placeholder="130-0000" value={zip} onChange={(e) => setZip(e.target.value)} />
        </FormRow>
        <FormRow label="お住まいの都道府県" optional>
          <select value={pref} onChange={(e) => setPref(e.target.value)}>
            <option value="">選択してください</option>
            <option>東京都</option><option>神奈川県</option><option>千葉県</option><option>埼玉県</option><option>その他</option>
          </select>
        </FormRow>
      </div>

      <FormRow label="ご購入検討時期" optional>
        <select value={timing} onChange={(e) => setTiming(e.target.value)}>
          <option value="">選択してください</option>
          <option>すぐにでも</option><option>3か月以内</option><option>半年以内</option><option>1年以内</option><option>未定・情報収集中</option>
        </select>
      </FormRow>

      <FormRow label="ご希望の連絡方法" optional>
        <div className="checks">
          <label>
            <input type="checkbox" checked={contactByEmail} onChange={(e) => setContactByEmail(e.target.checked)} /> メールで連絡してほしい
          </label>
          <label>
            <input type="checkbox" checked={contactByPhone} onChange={(e) => setContactByPhone(e.target.checked)} /> 電話で連絡してほしい
          </label>
          <label>
            <input type="checkbox" checked={wantsViewing} onChange={(e) => setWantsViewing(e.target.checked)} /> 内見（現地見学）を希望する
          </label>
        </div>
      </FormRow>

      <FormRow label="ご質問・ご要望" optional>
        <textarea rows={3} placeholder="例）週末に内見を希望します。リフォームの相談もできますか？"
          value={message} onChange={(e) => setMessage(e.target.value)} />
      </FormRow>

      <div className="consent">
        【個人情報の取り扱いについて】ご入力いただいた個人情報は、資料送付・お問い合わせ対応・担当不動産会社との連携の目的に利用します。
        ご本人の同意なく第三者に提供することはありません（担当不動産会社への連携を除く）。売買契約の締結後は、物件情報の閲覧を購入者様のみに制限します。
        詳細はプライバシーポリシーをご確認ください。
      </div>
      <label className="checks consent-agree">
        <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} />{' '}
        <span className="lbl">個人情報の取り扱いに同意します <span className="req-inline">＊必須</span></span>
      </label>

      <button className="fsubmit" disabled={!agreed || submitting} onClick={handleSubmit}>
        資料請求を送信する
      </button>
    </div>
  )
}
