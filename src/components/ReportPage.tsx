import { useMemo, useState } from 'react'
import { summarizeReport } from '@/lib/langchain'
import type { ReportInsights } from '@/lib/types'
import { useStore, type StoreState } from '@/state/useStore'

export default function ReportPage() {
  const problems = useStore((state) => state.problems)
  const attempts = useStore((state) => state.attempts)
  const aiSummary = useStore((state) => state.aiSummary)
  const setAiSummary = useStore((state) => state.setAiSummary)

  const [isSummarizing, setIsSummarizing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const summary = useMemo(() => buildReportInsights(problems, attempts), [problems, attempts])

  const generateSummary = async () => {
    setIsSummarizing(true)
    setError(null)
    try {
      const text = await summarizeReport(summary)
      setAiSummary(text)
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setIsSummarizing(false)
    }
  }

  return (
    <div className="section" style={{ gap: '2rem' }}>
      <header>
        <h1>Your Coding Report</h1>
        <p style={{ color: 'rgba(226,232,240,0.7)', maxWidth: 600 }}>
          Review your attempt history, identify weak topics, and ask the AI coach for a tailored learning plan.
        </p>
      </header>

      <section className="surface" style={{ display: 'grid', gap: '1.5rem' }}>
        <div className="stat-grid">
          <Stat title="Problems Solved" value={summary.solved} />
          <Stat title="Total Attempts" value={summary.attempts} />
          <Stat title="Pass Rate" value={`${(summary.passRate * 100).toFixed(1)}%`} />
        </div>

        <div>
          <h3>Weak Topics</h3>
          {summary.weakTopics.length === 0 ? (
            <p className="small">No weak spots detected yet. Keep going!</p>
          ) : (
            <div className="tag-list">
              {summary.weakTopics.map((topic) => (
                <span key={topic} className="tag">
                  {topic}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="actions" style={{ justifyContent: 'space-between' }}>
          <button className="button" type="button" onClick={generateSummary} disabled={isSummarizing}>
            {isSummarizing ? 'Analyzing…' : 'Generate AI Summary'}
          </button>
          {aiSummary && <span className="small">Last updated just now</span>}
        </div>

        {error && <div className="hint-box">⚠️ {error}</div>}

        {aiSummary && (
          <div className="hint-box" style={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>{aiSummary}</div>
        )}
      </section>

      <section className="surface" style={{ display: 'grid', gap: '1rem' }}>
        <h2>Attempt History</h2>
        {attempts.length === 0 ? (
          <p className="small">Run some code to populate the report.</p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Problem</th>
                <th>Verdict</th>
                <th>Language</th>
                <th>Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {attempts
                .slice()
                .reverse()
                .slice(0, 20)
                .map((attempt) => {
                  const problem = problems.find((item) => item.id === attempt.problemId)
                  return (
                    <tr key={attempt.id}>
                      <td>{problem?.title ?? 'Unknown problem'}</td>
                      <td>
                        <span className={`test-pill ${attempt.result.verdict === 'ACCEPTED' ? 'pass' : 'fail'}`}>
                          {attempt.result.verdict}
                        </span>
                      </td>
                      <td>{attempt.lang.toUpperCase()}</td>
                      <td>{new Date(attempt.createdAt).toLocaleString()}</td>
                    </tr>
                  )
                })}
            </tbody>
          </table>
        )}
      </section>
    </div>
  )
}

interface StatProps {
  title: string
  value: string | number
}

function Stat({ title, value }: StatProps) {
  return (
    <div className="stat-card">
      <h4>{title}</h4>
      <strong>{value}</strong>
    </div>
  )
}

function buildReportInsights(problems: StoreState['problems'], attempts: StoreState['attempts']): ReportInsights {
  const solvedProblems = new Set<string>()
  const passedAttempts = attempts.filter((attempt) => attempt.result.verdict === 'ACCEPTED')
  const topicAttempts = new Map<string, number>()
  const topicFailures = new Map<string, number>()

  for (const attempt of attempts) {
    const problem = problems.find((item) => item.id === attempt.problemId)
    if (!problem) continue

    if (attempt.result.verdict === 'ACCEPTED') {
      solvedProblems.add(attempt.problemId)
    }

    for (const topic of problem.topics) {
      topicAttempts.set(topic, (topicAttempts.get(topic) ?? 0) + 1)
      if (attempt.result.verdict !== 'ACCEPTED') {
        topicFailures.set(topic, (topicFailures.get(topic) ?? 0) + 1)
      }
    }
  }

  const weakTopics = Array.from(topicAttempts.entries())
    .filter(([topic, count]) => {
      const failures = topicFailures.get(topic) ?? 0
      return count >= 2 && failures / count >= 0.5
    })
    .map(([topic]) => topic)

  return {
    solved: solvedProblems.size,
    attempts: attempts.length,
    passRate: attempts.length === 0 ? 0 : passedAttempts.length / attempts.length,
    weakTopics,
  }
}
