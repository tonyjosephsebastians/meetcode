import { useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useStore } from '@/state/useStore'
import { difficultyClass, difficultyLabel, getSeedProblems } from '@/lib/problems'

export default function ProblemList() {
  const problems = useStore((state) => state.problems)
  const attempts = useStore((state) => state.attempts)
  const setProblems = useStore((state) => state.setProblems)

  useEffect(() => {
    if (problems.length === 0) {
      setProblems(getSeedProblems())
    }
  }, [problems.length, setProblems])

  const statsByProblem = useMemo(() => {
    const map = new Map<string, { attempts: number; solved: boolean; lastVerdict?: string }>()
    for (const attempt of attempts) {
      const info = map.get(attempt.problemId) ?? { attempts: 0, solved: false }
      info.attempts += 1
      info.lastVerdict = attempt.result.verdict
      if (attempt.result.verdict === 'ACCEPTED') {
        info.solved = true
      }
      map.set(attempt.problemId, info)
    }
    return map
  }, [attempts])

  if (problems.length === 0) {
    return <div className="empty">No problems available yet. Generate one to get started!</div>
  }

  return (
    <div className="section" style={{ gap: '2rem' }}>
      <header>
        <h1 style={{ marginBottom: '0.5rem' }}>AI Practice Set</h1>
        <p style={{ color: 'rgba(226,232,240,0.7)', maxWidth: 640 }}>
          Tackle curated algorithm problems, track your attempts, and generate fresh challenges without leaving the browser.
        </p>
      </header>

      <div className="card-grid">
        {problems.map((problem) => {
          const stats = statsByProblem.get(problem.id)
          return (
            <article key={problem.id} className="card">
              <div className={difficultyClass(problem.difficulty)}>{difficultyLabel(problem.difficulty)}</div>
              <h3 style={{ margin: 0 }}>{problem.title}</h3>
              <p style={{ color: 'rgba(226,232,240,0.75)', flexGrow: 1 }}>{problem.prompt.slice(0, 140)}…</p>

              <div className="tag-list">
                {problem.topics.map((topic) => (
                  <span key={topic} className="tag">
                    {topic}
                  </span>
                ))}
              </div>

              <div className="actions" style={{ justifyContent: 'space-between' }}>
                <Link className="link-button" to={`/p/${problem.slug}`}>
                  Open problem →
                </Link>
                <span className="small">
                  {stats ? `${stats.attempts} attempt${stats.attempts === 1 ? '' : 's'}` : 'No attempts yet'} ·{' '}
                  {stats?.solved ? '✅ Solved' : 'Pending'}
                </span>
              </div>
            </article>
          )
        })}
      </div>
    </div>
  )
}
