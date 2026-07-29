export interface InquiryPayload {
  propertyId: number
  name: string
  kana: string
  email: string
  tel: string
  zip: string
  pref: string
  timing: string
  contactByEmail: boolean
  contactByPhone: boolean
  wantsViewing: boolean
  message: string
  agreed: boolean
}

export interface InquiryResult {
  ok: boolean
}
