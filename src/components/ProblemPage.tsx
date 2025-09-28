import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import CodeEditor from './CodeEditor'
import type { EvalResult, Lang } from '@/lib/types'
import { useStore } from '@/state/useStore'
import { runInWorker } from '@/lib/runner'
import { getHint } from '@/lib/langchain'
import { difficultyClass } from '@/lib/problems'

interface CodeState {
  ts: string
  js: string
}

function ensureCommonJS(source: string) {
  let output = source
    .replace(/export\s+default\s+function\s+solution/g, 'function solution')
    .replace(/export\s+function\s+solution/g, 'function solution')
    .replace(/export\s+default\s+/g, '')

  if (!/module\.exports/.test(output) && !/exports\.solution/.test(output)) {
    output += `\nif (typeof module !== 'undefined') {\n  if (typeof solution === 'function') {\n    module.exports = solution;\n  } else if (typeof solution !== 'undefined') {\n    module.exports = { solution };\n  }\n}\nif (typeof exports !== 'undefined' && typeof solution === 'function') {\n  exports.solution = solution;\n}\n`
  }

  return output
}

async function prepareExecutableCode(source: string, lang: Lang) {
  if (lang === 'js') {
    return ensureCommonJS(source)
  }

  const ts = await import('typescript')
  const { transpileModule, ModuleKind, ScriptTarget } = ts
  const result = transpileModule(source, {
    compilerOptions: {
      target: ScriptTarget.ES2020 ?? ScriptTarget.ESNext,
      module: ModuleKind.CommonJS,
    },
  })
  return ensureCommonJS(result.outputText)
}

export default function ProblemPage() {
  const { slug } = useParams()
  const problem = useStore((state) => state.problems.find((item) => item.slug === slug))
  const attempts = useStore((state) => state.attempts.filter((attempt) => attempt.problemId === problem?.id))
  const lang = useStore((state) => state.lang)
  const setLang = useStore((state) => state.setLang)
  const addAttempt = useStore((state) => state.addAttempt)

  const [codeState, setCodeState] = useState<CodeState>(() => ({
    ts: problem?.starterCode.ts ?? '',
    js: problem?.starterCode.js ?? '',
  }))
  const [result, setResult] = useState<EvalResult | null>(null)
  const [hint, setHint] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isRunning, setIsRunning] = useState(false)
  const [isHintLoading, setIsHintLoading] = useState(false)

  useEffect(() => {
    if (!problem) return
    setCodeState({ ts: problem.starterCode.ts, js: problem.starterCode.js })
    setResult(null)
    setHint(null)
    setError(null)
  }, [problem?.id])

  const latestVerdict = attempts[attempts.length - 1]?.result.verdict

  const code = useMemo(() => codeState[lang], [codeState, lang])

  if (!problem) {
    return (
      <div className="empty">
        Problem not found. <Link to="/">Return to the list.</Link>
      </div>
    )
  }

  const handleLangChange = (nextLang: Lang) => {
    setLang(nextLang)
    setResult(null)
    setHint(null)
  }

  const handleCodeChange = (value: string) => {
    setCodeState((prev) => ({ ...prev, [lang]: value }))
  }

  const runCode = async () => {
    setIsRunning(true)
    setError(null)
    try {
      const executable = await prepareExecutableCode(codeState[lang], lang)
      const evaluation = await runInWorker({ code: executable, tests: problem.tests })
      setResult(evaluation)
      const attemptId =
        typeof crypto !== 'undefined' && 'randomUUID' in crypto
          ? `attempt-${crypto.randomUUID()}`
          : `attempt-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
      addAttempt({
        id: attemptId,
        problemId: problem.id,
        lang,
        code: codeState[lang],
        createdAt: new Date().toISOString(),
        result: evaluation,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setIsRunning(false)
    }
  }

  const requestHint = async () => {
    setIsHintLoading(true)
    try {
      const nextHint = await getHint({ problem, code: codeState[lang], lastResult: result })
      setHint(nextHint)
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setIsHintLoading(false)
    }
  }

  return (
    <div className="section">
      <div className="surface" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <div>
          <div className={difficultyClass(problem.difficulty)}>{problem.difficulty}</div>
          <h1 style={{ marginBottom: '0.5rem' }}>{problem.title}</h1>
          <p style={{ color: 'rgba(226,232,240,0.75)' }}>{problem.prompt}</p>
        </div>

        {problem.constraints && (
          <div>
            <h3>Constraints</h3>
            <pre>{problem.constraints}</pre>
          </div>
        )}

        <div className="details-grid">
          <section>
            <h3>Examples</h3>
            {problem.examples.map((example, index) => (
              <div key={index} className="surface" style={{ padding: '1rem', background: 'rgba(30,41,59,0.6)' }}>
                <strong>Input:</strong>
                <pre>{JSON.stringify(example.input, null, 2)}</pre>
                <strong>Output:</strong>
                <pre>{JSON.stringify(example.output, null, 2)}</pre>
                {example.explanation && <p className="small">{example.explanation}</p>}
              </div>
            ))}
          </section>

          <section>
            <h3>Recent Attempts</h3>
            {attempts.length === 0 ? (
              <p className="small">No attempts yet. Give it a shot!</p>
            ) : (
              <div className="test-result">
                {attempts
                  .slice()
                  .reverse()
                  .slice(0, 5)
                  .map((attempt) => (
                    <div
                      key={attempt.id}
                      className="surface"
                      style={{ padding: '0.75rem', background: 'rgba(30,41,59,0.6)' }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                        <span
                          className={`test-pill ${attempt.result.verdict === 'ACCEPTED' ? 'pass' : 'fail'}`}
                        >
                          {attempt.result.verdict}
                        </span>
                        <span className="small">{new Date(attempt.createdAt).toLocaleString()}</span>
                      </div>
                      <div className="small">Language: {attempt.lang.toUpperCase()}</div>
                    </div>
                  ))}
              </div>
            )}
          </section>
        </div>
      </div>

      <div className="surface" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div className="actions" style={{ justifyContent: 'space-between' }}>
          <div className="actions">
            <button
              type="button"
              className="button"
              style={{ background: lang === 'ts' ? 'linear-gradient(135deg,#6366f1,#8b5cf6)' : 'rgba(30,41,59,0.8)' }}
              onClick={() => handleLangChange('ts')}
            >
              TypeScript
            </button>
            <button
              type="button"
              className="button"
              style={{ background: lang === 'js' ? 'linear-gradient(135deg,#2563eb,#7c3aed)' : 'rgba(30,41,59,0.8)' }}
              onClick={() => handleLangChange('js')}
            >
              JavaScript
            </button>
          </div>

          <div className="actions">
            <button className="button" type="button" onClick={runCode} disabled={isRunning}>
              {isRunning ? 'Running…' : 'Run Tests'}
            </button>
            <button className="button" type="button" onClick={requestHint} disabled={isHintLoading}>
              {isHintLoading ? 'Thinking…' : 'Get Hint'}
            </button>
          </div>
        </div>

        <CodeEditor value={code} lang={lang} onChange={handleCodeChange} height={520} />

        {error && <div className="hint-box">⚠️ {error}</div>}

        {result && (
          <div className="surface" style={{ background: 'rgba(30,41,59,0.6)', borderRadius: '0.75rem' }}>
            <h3>Results</h3>
            <div className="test-result">
              <div>
                Verdict: <strong>{result.verdict}</strong> ({result.passed}/{result.total} tests passed)
              </div>
              <div className="tag-list">
                {result.details.map((detail) => (
                  <span key={detail.name} className={`test-pill ${detail.status}`}>
                    {detail.name} · {detail.status}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {hint && (
          <div className="hint-box">
            <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{hint}</pre>
          </div>
        )}

        {latestVerdict === 'ACCEPTED' && (
          <div
            className="hint-box"
            style={{ background: 'rgba(74,222,128,0.1)', borderColor: 'rgba(74,222,128,0.4)', color: '#bbf7d0' }}
          >
            🎉 Great job! Consider tackling a harder problem or generating a new challenge.
          </div>
        )}
      </div>
    </div>
  )
}
