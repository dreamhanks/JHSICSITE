/** Copy edit approved in Step 1: the final sentence
 *  「※本モックアップでは、書類ファイルは開きません。」 is appended to the
 *  existing banner text. It renders only while 会員 is active, i.e.
 *  exactly when the eight documents become clickable. Styled as plain
 *  banner text — no emphasis, no colour, no separate element. */
export function OpenedBanner({ show }: { show: boolean }) {
  return (
    <div className={show ? 'opened show' : 'opened'}>
      <b>会員としてログイン中です。</b>
      全8点の書類を閲覧・ダウンロードできます。売買契約の締結後は、購入者様のみ閲覧可能な状態にクローズされます。※本モックアップでは、書類ファイルは開きません。
    </div>
  )
}
