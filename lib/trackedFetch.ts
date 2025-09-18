import { useLoadingStore } from "./loadingStore"

// NOTE: 모듈 범위에서 store 직접 import 사용
export async function trackedFetch(input: RequestInfo | URL, init?: RequestInit) {
  const { start, stop } = useLoadingStore.getState()
  start()
  try {
    const res = await fetch(input, init)
    return res
  } finally {
    stop()
  }
}
