import { FormEvent, useState } from 'react'
import { Link } from 'react-router-dom'
import { generateProblem } from '@/lib/langchain'
import { difficultyClass, difficultyLabel } from '@/lib/problems'
import type { Difficulty, Problem } from '@/lib/types'
import { useStore } from '@/state/useStore'

const difficulties: Difficulty[] = ['EASY', 'MEDIUM', 'HARD']

export default function GeneratePage() {
  const [topic, setTopic] = useState('Arrays')
  const [difficulty, setDifficulty] = useState<Difficulty>('MEDIUM')
  const [isLoading, setIsLoading] = useState(false)
  const [generated, setGenerated] = useState<Problem | null>(null)
  const [error, setError] = useState<string | null>(null)

  const upsertProblem = useStore((state) => state.upsertProblem)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsLoading(true)
    setError(null)
    try {
      const problem = await generateProblem({ topic, difficulty })
      upsertProblem(problem)
      setGenerated(problem)
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="section" style={{ gap: '2rem' }}>
      <header>
        <h1>Create a New AI Challenge</h1>
        <p style={{ color: 'rgba(226,232,240,0.7)', maxWidth: 560 }}>
          Describe the topic you want to practice and let the in-browser AI craft a tailored coding exercise complete with
          examples, starter code, and runnable tests.
        </p>
      </header>

      <form onSubmit={handleSubmit} className="surface" style={{ display: 'grid', gap: '1.5rem' }}>
        <div className="form-grid">
          <label>
            Topic or concept
            <input
              value={topic}
              placeholder="Linked Lists, Dynamic Programming, Graphs…"
              onChange={(event) => setTopic(event.target.value)}
            />
          </label>

          <label>
            Difficulty
            <select value={difficulty} onChange={(event) => setDifficulty(event.target.value as Difficulty)}>
              {difficulties.map((option) => (
                <option key={option} value={option}>
                  {difficultyLabel(option)}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="actions" style={{ justifyContent: 'flex-end' }}>
          <button className="button" type="submit" disabled={isLoading}>
            {isLoading ? 'Generating…' : 'Generate Problem'}
          </button>
        </div>

        {error && <div className="hint-box">⚠️ {error}</div>}
      </form>

      {generated && (
        <div className="surface" style={{ display: 'grid', gap: '1rem' }}>
          <div className={difficultyClass(generated.difficulty)}>{difficultyLabel(generated.difficulty)}</div>
          <h2 style={{ marginBottom: 0 }}>{generated.title}</h2>
          <p style={{ color: 'rgba(226,232,240,0.75)' }}>{generated.prompt}</p>

          <div>
            <h3>Examples</h3>
            {generated.examples.map((example, index) => (
              <div key={index} className="surface" style={{ padding: '1rem', background: 'rgba(30,41,59,0.6)' }}>
                <strong>Input:</strong>
                <pre>{JSON.stringify(example.input, null, 2)}</pre>
                <strong>Output:</strong>
                <pre>{JSON.stringify(example.output, null, 2)}</pre>
              </div>
            ))}
          </div>

          <Link className="link-button" to={`/p/${generated.slug}`}>
            Open the generated challenge →
          </Link>
        </div>
      )}
    </div>
  )
}
