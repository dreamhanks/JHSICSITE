import { CalloutBar } from '../components/common/CalloutBar'
import { PageHero } from '../components/common/PageHero'
import { Section } from '../components/common/Section'
import { ValueCard } from '../components/common/ValueCard'
import {
  BlueprintIcon, ChatIcon, DocumentIcon, HeartOutlineIcon, SearchIcon, ShieldIcon, UsersIcon,
} from '../components/art/Icons'

/** Design C Stage 7. 会員限定 is structurally main and design-b again —
 *  hero, four permissions, three capabilities, callout — carrying the
 *  Design C palette through the @theme tokens and nothing else.
 *
 *  Stage 4 had argued this page by demonstration: it put a locked
 *  建物カルテ timeline where the four .vc cards had been and compacted
 *  their copy into a .permlist below it. Stage 7 reverses that whole
 *  move. The four cards are back in a 2x2 .grid2, and the demonstration
 *  is gone rather than relabelled — src/components/karte/LockedKarte.tsx
 *  was deleted with it, MemberPage having been its only consumer.
 *
 *  The karte itself is NOT affected. It lives on 物件詳細, where Karte.tsx
 *  still renders KarteTimeline, KarteTabs, DocButton and both banners
 *  exactly as before. Only this page's copy of it is gone.
 *
 *  The four titles and bodies are the Stage 4 PERMISSIONS strings restored
 *  byte for byte, in their original order, and are byte-identical to what
 *  main and design-b render. The 会員限定 tag renders once per card.
 *
 *  BlueprintIcon, DocumentIcon, ShieldIcon and UsersIcon are live imports
 *  again; between Stage 4 and now they were exported by art/Icons and
 *  referenced by nothing. */
export function MemberPage() {
  return (
    <div className="page show">
      <PageHero eyebrow="MEMBERS ONLY" title="会員だけが見られる、建物の「本当のところ」">
        Homilleの会員登録は無料です。JHSが自ら調査・保証した物件の診断報告書・図面・地盤データ・保証内容まで、
        建物の全記録を閲覧できます。「見えないリスク」に不安を抱えたまま購入を判断する必要はありません。
      </PageHero>

      <Section
        title="会員登録で解放される4つの権限"
        lead="一般公開されているのは物件概要まで。判断に必要な情報は、会員登録した方だけにお届けします。"
      >
        <div className="grid2">
          <ValueCard icon={<DocumentIcon />} title="既存住宅診断報告書の閲覧" tag="会員限定">
            構造耐力上主要な部分・雨水の浸入を防止する部分の劣化状況を記した、建物状況調査の報告書そのものを閲覧できます。隠蔽部・小屋裏の写真も含みます。
          </ValueCard>
          <ValueCard icon={<BlueprintIcon />} title="各種図面・建築確認済証・地盤調査報告書" tag="会員限定">
            新築時の竣工図面、建築確認済証、そしてJHSの地盤調査（SDS試験）報告書まで。建物の素性を裏付ける一次資料を確認できます。
          </ValueCard>
          <ValueCard icon={<ShieldIcon />} title="10年保証の内容確認" tag="会員限定">
            「建物サポートシステム ストック型」による10年品質保証の対象範囲・保証書を、購入前に確認できます。保証の中身が見えるから安心して判断できます。
          </ValueCard>
          <ValueCard icon={<UsersIcon />} title="会員限定公開物件の閲覧" tag="会員限定">
            一般には公開していない会員限定物件を閲覧できます。人気の物件や希少な物件が、登録者だけに先行して届きます。
          </ValueCard>
        </div>
      </Section>

      <Section title="登録するとできること">
        <div className="grid3">
          <ValueCard icon={<HeartOutlineIcon />} title="お気に入り登録">
            気になる物件を保存して、マイページでいつでも見返せます。価格変更や成約のお知らせも受け取れます。
          </ValueCard>
          <ValueCard icon={<ChatIcon />} title="資料請求・内見申込">
            会員情報を一度登録すれば、次回以降はワンクリックで資料請求・内見予約ができます。担当不動産会社へ直接つながります。
          </ValueCard>
          <ValueCard icon={<SearchIcon />} title="こだわり条件で検索">
            「10年保証付き」「診断済み」「地盤評価A・B」「新築時履歴あり」など、他社にない検索軸で理想の一軒を絞り込めます。
          </ValueCard>
        </div>
      </Section>

      <CalloutBar>
        <b>ログインは無料でご利用いただけます。</b><br />
        {/* Step 2g: both routes named here changed. The button was renamed,
            and 資料請求 no longer registers anyone. */}
        物件詳細ページの「ログインして閲覧する」ボタン、または画面右上の「ログイン」からご利用いただけます。<br />
        <span className="callout-note">※売買契約の締結後は、購入者様のみ閲覧可能な状態にクローズされ、個人情報は適切に管理されます。</span>
      </CalloutBar>
    </div>
  )
}
