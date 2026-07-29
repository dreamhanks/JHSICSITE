import type { KarteStratum } from '../types/karte'

/** Transcribed verbatim from mockup.html L603-639.
 *  Array order matches DOM order: newest (s5) first.
 *  data-gate="1" -> memberOnly: true, data-gate="0" -> false. */
const sharedKarte: KarteStratum[] = [
  {
    id: 's5', depth: 5, period: '2026年6月', phase: '売却前',
    title: '既存住宅診断（建物状況調査）',
    description: '構造耐力上主要な部分・雨水の浸入を防止する部分の劣化状況を調査',
    docs: [
      { id: 's5-d1', iconType: 'PDF', colorClass: 'o', label: '既存住宅調査診断報告書', memberOnly: true },
      { id: 's5-d2', iconType: 'JPG', colorClass: 'o', label: '隠蔽部・小屋裏写真（18点）', memberOnly: true },
    ],
  },
  {
    id: 's4', depth: 4, period: '2026年6月', phase: 'リフォーム後',
    title: '既存住宅向け10年品質保証',
    description: 'リフォーム完了に伴い、10年間の品質保証を付与',
    docs: [
      { id: 's4-d1', iconType: 'PDF', colorClass: 'g', label: '保証書・保証範囲一覧', memberOnly: true },
    ],
  },
  {
    id: 's3', depth: 3, period: '2015・2020年', phase: '居住中',
    title: '定期点検（2回実施）',
    description: '引渡し後の定期点検記録および指摘事項への対応履歴',
    docs: [
      { id: 's3-d1', iconType: 'PDF', colorClass: 'o', label: '定期点検報告書（5年・10年）', memberOnly: true },
      { id: 's3-d2', iconType: 'PDF', colorClass: 'o', label: '修繕履歴', memberOnly: true },
    ],
  },
  {
    id: 's2', depth: 2, period: '2004年', phase: '工事中',
    title: '新築時 品質検査・図面',
    description: '施工状況の品質検査記録、確認済証、竣工図面一式',
    docs: [
      { id: 's2-d1', iconType: 'PDF', colorClass: 'b', label: '各種図面・建築確認済証', memberOnly: true },
      { id: 's2-d2', iconType: 'PDF', colorClass: 'b', label: '新築時品質検査記録', memberOnly: true },
    ],
  },
  {
    id: 's1', depth: 1, period: '2003年', phase: '着工前',
    title: '地盤調査（SDS試験）',
    description: '地層構成・支持層深度の解析結果。周辺の地盤傾向も併せて確認可能',
    docs: [
      { id: 's1-d1', iconType: 'PDF', colorClass: 'b', label: '地盤調査報告書', memberOnly: true },
      { id: 's1-d2', iconType: 'MAP', colorClass: 'b', label: '地盤サポートマップ（周辺）', memberOnly: false },
    ],
  },
]

/** The mockup's karte is identical for every property. Shaped as a
 *  per-property lookup so it can diverge later without touching callers. */
export function getKarteFor(_propertyId: number): KarteStratum[] {
  return sharedKarte
}
