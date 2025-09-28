import type { EvalResult, TestCase } from '../types'

export interface RunRequest {
  code: string
  tests: TestCase[]
  timeoutMs?: number
}

const DEFAULT_TIMEOUT = 4000

export function runInWorker({ code, tests, timeoutMs }: RunRequest): Promise<EvalResult> {
  const worker = new Worker(new URL('./worker.ts', import.meta.url), { type: 'module' })

  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      worker.terminate()
      reject(new Error('Execution timed out'))
    }, timeoutMs ?? DEFAULT_TIMEOUT)

    worker.onmessage = (event: MessageEvent<{ ok: boolean; result?: EvalResult; error?: string }>) => {
      clearTimeout(timer)
      worker.terminate()
      if (!event.data.ok || !event.data.result) {
        reject(new Error(event.data.error ?? 'Unknown runner error'))
        return
      }
      resolve(event.data.result)
    }

    worker.onerror = (error) => {
      clearTimeout(timer)
      worker.terminate()
      reject(error)
    }

    worker.postMessage({ code, tests, timeoutMs: timeoutMs ?? DEFAULT_TIMEOUT })
  })
}
