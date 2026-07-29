export function GateBanner({ hidden, onRegister }: { hidden: boolean; onRegister: () => void }) {
  return (
    <div className={hidden ? 'gate hidden' : 'gate'}>
      <div className="gt">
        <b>ログインすると、この物件の全記録を閲覧できます</b>
        <span>診断報告書・図面・地盤調査報告書・保証書は、会員限定で公開しています。登録は無料です。</span>
      </div>
      {/* Step 2g: was 無料で会員登録する. Login is now the only way in,
          and no registration flow exists, so the old label promised
          something the mockup cannot deliver. */}
      <button className="gb" onClick={onRegister}>ログインして閲覧する</button>
    </div>
  )
}
