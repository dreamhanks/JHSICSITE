import type { ViewName } from '../../types/view'

export const JHS_URL = 'https://www.j-shield.co.jp/'

/** The nav destinations shared by <nav> and the mobile sheet. */
export const NAV_ITEMS: { view: ViewName; label: string }[] = [
  { view: 'list', label: '物件検索' },
  { view: 'member', label: '会員限定' },
  { view: 'support', label: '購入サポート' },
]

/** Original: nav link 物件検索 stays active while a detail page is open. */
export function isNavActive(itemView: ViewName, current: ViewName): boolean {
  return itemView === current || (current === 'detail' && itemView === 'list')
}
