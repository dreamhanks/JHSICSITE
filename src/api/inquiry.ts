import type { InquiryPayload, InquiryResult } from '../types/inquiry'
import { delay } from './config'

export async function submitInquiry(_payload: InquiryPayload): Promise<InquiryResult> {
  await delay()
  return { ok: true }
}
