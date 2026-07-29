/** Artificial latency for every mock api/ function, so the consuming
 *  components build real loading states from day one.
 *  Set to 0 to make the mock respond instantly without touching any
 *  loading-state code — that code must stay in place for the Spring
 *  Boot migration. */
export const MOCK_LATENCY_MS = 300

export function delay(ms: number = MOCK_LATENCY_MS): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
