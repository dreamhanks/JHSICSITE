import { useContext } from 'react'
import { AppStateContext, type AppState } from './appState'

export function useAppState(): AppState {
  const ctx = useContext(AppStateContext)
  if (!ctx) throw new Error('useAppState must be used within AppStateProvider')
  return ctx
}
