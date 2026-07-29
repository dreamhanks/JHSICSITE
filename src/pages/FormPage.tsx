import { useEffect, useState } from 'react'
import { getPropertyById } from '../api/properties'
import { InquiryForm } from '../components/form/InquiryForm'
import { FormSidebar } from '../components/form/FormSidebar'
import { useAppState } from '../context/useAppState'
import type { Property } from '../types/property'

/** BUG FIX (2.10.2): this page unmounts whenever another view is shown,
 *  so InquiryForm's state — including the completion screen — is
 *  discarded. Reopening the form always yields a blank form. The
 *  original permanently replaced #formCard.innerHTML after one submit. */
export function FormPage() {
  const { currentPropertyId, setView } = useAppState()
  const [property, setProperty] = useState<Property | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (currentPropertyId == null) return
    let alive = true
    setLoading(true)
    getPropertyById(currentPropertyId).then((p) => {
      if (!alive) return
      setProperty(p)
      setLoading(false)
    })
    return () => { alive = false }
  }, [currentPropertyId])

  const back = () => setView(currentPropertyId == null ? 'list' : 'detail')

  return (
    <div className="page show">
      <button className="backlink" onClick={back}>← 物件詳細に戻る</button>
      <div className="formwrap">
        {loading || !property ? (
          <div className="formcard"><div className="sk sk-strata" /></div>
        ) : (
          <InquiryForm property={property} onDone={back} />
        )}
        {loading || !property ? (
          <aside className="fside"><div className="sk sk-row" /></aside>
        ) : (
          <FormSidebar property={property} />
        )}
      </div>
    </div>
  )
}
