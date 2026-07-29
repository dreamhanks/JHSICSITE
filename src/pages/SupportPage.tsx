import { CalloutBar } from '../components/common/CalloutBar'
import { PageHero } from '../components/common/PageHero'
import { Section } from '../components/common/Section'
import { ValueCard } from '../components/common/ValueCard'
import { ClockIcon, HouseIcon, MapPinIcon, StarIcon, WrenchIcon } from '../components/art/Icons'
import { JHS_URL } from '../components/layout/navItems'

export function SupportPage() {
  return (
    <div className="page show">
      <PageHero eyebrow="PURCHASE SUPPORT" title="買ったあとも、ずっと安心が続く仕組み">
        JHSは地盤調査・解析実績250万棟、住宅インスペクションの豊富な実績を持つ住宅品質の専門会社です。
        中古住宅の購入を、新築同様の安心とともにお届けするための保証・リフォームの仕組みをご紹介します。
      </PageHero>

      <Section title="既存住宅向け 10年品質保証" lead="築25年までの既存住宅を対象とした、JHSの品質保証サービスです。">
        <div className="warrantybox">
          <div className="wbh">
            <div className="nm">建物サポートシステム ストック型</div>
            <div className="sub">中古住宅を、保証付きの安心な住まいへ</div>
          </div>
          <div className="wbrow">
            <div className="k">対象</div>
            <div className="v">築25年までの既存戸建住宅。JHSのインスペクション（建物状況調査）を実施した物件が対象です。</div>
          </div>
          <div className="wbrow">
            <div className="k">保証期間</div>
            <div className="v"><b>最長10年間</b>の品質保証。引渡し後の主要構造部・雨水の浸入を防止する部分の不具合をカバーします。</div>
          </div>
          <div className="wbrow">
            <div className="k">保証の承継</div>
            <div className="v">売買時に保証を次のオーナーへ引き継げる物件もあります。資産価値の維持につながります。</div>
          </div>
          <div className="wbrow">
            <div className="k">背景</div>
            <div className="v">見えにくい劣化・不具合への不安、信頼できるリフォーム事業者の選定の難しさ。こうした課題に、豊富なインスペクション実績で応えます。</div>
          </div>
        </div>
      </Section>

      <Section title="地盤保証という土台の安心" lead="建物だけでなく、その下の地盤まで。JHSは地盤の専門会社です。">
        <div className="grid3">
          <ValueCard icon={<HouseIcon />} title="最大5,000万円の地盤保証">
            万一の不同沈下に備え、1事故あたり最大5,000万円を保証。調査・仮住まい費用もそれぞれ200万円まで対応します（規程に基づく）。
          </ValueCard>
          <ValueCard icon={<ClockIcon />} title="SDS試験による地盤調査">
            JAXAとの共同研究にも採択されたスクリュードライビングサウンディング（SDS）試験。地層構成・支持層深度を精密に解析します。
          </ValueCard>
          <ValueCard icon={<MapPinIcon />} title="地盤サポートマップで周辺確認">
            250万棟の調査データを地図上に可視化。購入検討エリアの地盤傾向を、住所からひと目で確認できます。
          </ValueCard>
        </div>
      </Section>

      <Section
        title="リフォーム・リノベーションのご提案"
        lead="AIを活用した業務支援システム「Homilleリノベナビ」で、根拠あるリノベーションを実現します。"
      >
        <div className="grid2">
          <ValueCard icon={<WrenchIcon />} title="診断にもとづくリノベーション" tag="Homilleリノベナビ">
            建物状況調査の結果をもとに、直すべき箇所を明確にしてからリノベーションを計画。感覚ではなくデータで、必要な工事を見極めます。劣化の指摘は、リフォームで価値を高めるための出発点です。
          </ValueCard>
          <ValueCard icon={<StarIcon />} title="リノベ後は10年保証付きの住まいへ" tag="建物サポートシステム ストック型">
            リフォーム完了に伴い、10年間の品質保証を付与できます。「診断 → リノベーション → 保証」がひとつながりになることで、中古とは思えない安心の住まいが完成します。
          </ValueCard>
        </div>
      </Section>

      <Section title="ご購入までの流れ">
        <div className="steps">
          <div className="step"><h4>物件を探す</h4><p>マップやこだわり条件から、診断済み・保証付きの物件を探します。</p></div>
          {/* Step 2g: the heading named a registration flow that no longer
              exists, so it moves to ログイン along with the body copy. */}
          <div className="step"><h4>ログイン・資料請求</h4><p>ログインすると全記録を閲覧いただけます。気になる物件は資料請求・内見をお申し込みください。</p></div>
          <div className="step"><h4>内見・ご相談</h4><p>担当不動産会社が対応。診断結果や保証内容を確認しながら検討できます。</p></div>
          <div className="step"><h4>ご契約・保証開始</h4><p>ご契約後、10年保証が適用。購入後も定期点検やサポートが続きます。</p></div>
        </div>
      </Section>

      <CalloutBar>
        JHSの保証・リフォームサービスの詳細は、
        <a href={JHS_URL} target="_blank" rel="noopener" className="jhs-link">ジャパンホームシールド公式サイト</a>
        でもご案内しています。
      </CalloutBar>
    </div>
  )
}
