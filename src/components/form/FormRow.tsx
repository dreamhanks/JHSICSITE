import type { ReactNode } from 'react'

export function FormRow({
  label, required, optional, error, message, children,
}: {
  label: string
  required?: boolean
  optional?: boolean
  error?: boolean
  message?: string
  children: ReactNode
}) {
  return (
    <div className={error ? 'frow err' : 'frow'}>
      <label>
        {label}{' '}
        {required ? <span className="req">＊必須</span> : null}
        {optional ? <span className="opt">任意</span> : null}
      </label>
      {children}
      {message ? <div className="msg">{message}</div> : null}
    </div>
  )
}
