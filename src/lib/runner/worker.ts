/// <reference lib="webworker" />

import type { EvalResult, TestCase, TestResult } from '../types'

interface WorkerRequest {
  code: string
  tests: TestCase[]
  timeoutMs: number
}

interface WorkerResponse {
  ok: boolean
  result?: EvalResult
  error?: string
}

function deepEqual(a: unknown, b: unknown): boolean {
  if (Object.is(a, b)) return true
  if (typeof a !== typeof b) return false
  if (typeof a !== 'object' || a === null || b === null) {
    return false
  }

  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false
    for (let i = 0; i < a.length; i += 1) {
      if (!deepEqual(a[i], b[i])) {
        return false
      }
    }
    return true
  }

  const keysA = Object.keys(a as Record<string, unknown>)
  const keysB = Object.keys(b as Record<string, unknown>)
  if (keysA.length !== keysB.length) return false
  for (const key of keysA) {
    if (!deepEqual((a as Record<string, unknown>)[key], (b as Record<string, unknown>)[key])) {
      return false
    }
  }
  return true
}

function execute(code: string): unknown {
  const exports: Record<string, unknown> = {}
  const module = { exports }
  const fn = new Function('exports', 'module', code)
  fn(exports, module)
  return module.exports
}

function ensureSolution(exports: unknown) {
  if (typeof exports === 'function') return exports
  if (exports && typeof exports === 'object') {
    const maybeFn = (exports as Record<string, unknown>).solution
    if (typeof maybeFn === 'function') {
      return maybeFn
    }
  }
  throw new Error('Export a function named "solution".')
}

function computeVerdict(passed: number, total: number, details: TestResult[]): EvalResult['verdict'] {
  if (details.some((item) => item.status === 'error')) {
    return 'RUNTIME_ERROR'
  }
  if (passed === total) {
    return 'ACCEPTED'
  }
  return 'WRONG_ANSWER'
}

async function runTest(
  solution: (...args: unknown[]) => unknown,
  test: TestCase,
  timeoutMs: number,
): Promise<TestResult> {
  const start = performance.now()
  let status: TestResult['status'] = 'pass'
  let info: string | undefined

  let cancelTimeout: (() => void) | undefined
  const timeout = new Promise<never>((_, reject) => {
    const id = setTimeout(() => {
      reject(new Error(`Timed out after ${timeoutMs}ms`))
    }, timeoutMs)
    cancelTimeout = () => clearTimeout(id)
  })

  try {
    const maybeResult = (solution as (...args: unknown[]) => unknown)(...test.input)
    const resolved = await Promise.race([Promise.resolve(maybeResult), timeout])
    if (!deepEqual(resolved, test.output)) {
      status = 'fail'
      info = `Expected ${JSON.stringify(test.output)}, received ${JSON.stringify(resolved)}`
    }
  } catch (error) {
    status = 'error'
    info = error instanceof Error ? error.message : String(error)
  } finally {
    cancelTimeout?.()
  }

  const runtimeMs = Math.round(performance.now() - start)
  return { name: test.name, status, info, runtimeMs }
}

self.onmessage = async (event: MessageEvent<WorkerRequest>) => {
  const { code, tests, timeoutMs } = event.data
  const response: WorkerResponse = { ok: false }

  try {
    const exports = execute(code)
    const solution = ensureSolution(exports) as (...args: unknown[]) => unknown

    const details: TestResult[] = []
    let passed = 0
    let totalRuntime = 0

    for (const test of tests) {
      const result = await runTest(solution, test, timeoutMs)
      details.push(result)
      totalRuntime += result.runtimeMs
      if (result.status === 'pass') {
        passed += 1
      }
    }

    const evalResult: EvalResult = {
      passed,
      total: tests.length,
      details,
      verdict: computeVerdict(passed, tests.length, details),
      runtimeMs: Math.round(totalRuntime),
    }

    response.ok = true
    response.result = evalResult
  } catch (error) {
    response.ok = false
    response.error = error instanceof Error ? error.message : String(error)
  }

  self.postMessage(response)
}
