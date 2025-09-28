import type {
  Difficulty,
  HintRequest,
  Problem,
  ReportInsights,
} from './types'
import { attachStarterCode, difficultyLabel, slugify } from './problems'

function capitalize(word: string) {
  return word.charAt(0).toUpperCase() + word.slice(1)
}

function randomId() {
  return Math.random().toString(36).slice(2, 9)
}

function createCountingProblem(topic: string, difficulty: Difficulty): Problem {
  const cleanedTopic = topic.trim() || 'Numbers'
  const title = `${capitalize(cleanedTopic)} Frequency Counter`
  const slug = `${slugify(title)}-${randomId()}`
  const prompt = `You are given an array of integers representing ${cleanedTopic.toLowerCase()} values and a target integer. Return how many times the target appears in the array.`
  return {
    id: `generated-${randomId()}`,
    slug,
    title,
    difficulty,
    topics: [capitalize(cleanedTopic), 'Counting'],
    prompt,
    examples: [
      {
        input: [[1, 2, 2, 3, 2], 2],
        output: 3,
        explanation: '2 appears three times in the array.',
      },
      {
        input: [[5, 5, 5, 5], 5],
        output: 4,
      },
    ],
    starterCode: {
      ts: `export function solution(values: number[], target: number): number {
  // Count occurrences of target in values
  return 0
}`,
      js: `export function solution(values, target) {
  // Count occurrences of target in values
  return 0
}`,
    },
    tests: [
      { name: 'basic', input: [[1, 2, 2, 3, 2], 2], output: 3 },
      { name: 'all match', input: [[5, 5, 5, 5], 5], output: 4 },
      { name: 'none match', input: [[3, 4, 5], 1], output: 0 },
    ],
  }
}

function createAggregationProblem(topic: string, difficulty: Difficulty): Problem {
  const cleanedTopic = topic.trim() || 'Data'
  const title = `${capitalize(cleanedTopic)} Moving Average`
  const slug = `${slugify(title)}-${randomId()}`
  const prompt = `Given an array of integers representing ${cleanedTopic.toLowerCase()} measurements and a window size k, return an array of the average of each contiguous subarray of length k rounded down to the nearest integer.`
  return {
    id: `generated-${randomId()}`,
    slug,
    title,
    difficulty,
    topics: [capitalize(cleanedTopic), 'Sliding Window'],
    prompt,
    examples: [
      {
        input: [[1, 3, 2, 6, -1, 4, 1, 8, 2], 5],
        output: [2, 2, 3, 2],
      },
      {
        input: [[5, 10, 15], 2],
        output: [7, 12],
      },
    ],
    starterCode: {
      ts: `export function solution(values: number[], k: number): number[] {
  // Compute floor of the average over each sliding window of size k
  return []
}`,
      js: `export function solution(values, k) {
  // Compute floor of the average over each sliding window of size k
  return []
}`,
    },
    tests: [
      { name: 'window 5', input: [[1, 3, 2, 6, -1, 4, 1, 8, 2], 5], output: [2, 2, 3, 2] },
      { name: 'window 2', input: [[5, 10, 15], 2], output: [7, 12] },
      { name: 'window equals array', input: [[2, 4, 6], 3], output: [4] },
    ],
  }
}

function createDynamicProgrammingProblem(topic: string, difficulty: Difficulty): Problem {
  const cleanedTopic = topic.trim() || 'Sequences'
  const title = `${capitalize(cleanedTopic)} Staircase`
  const slug = `${slugify(title)}-${randomId()}`
  const prompt = `You are climbing a staircase related to ${cleanedTopic.toLowerCase()} where it takes n steps to reach the top. Each time you can climb either 1 or 2 steps. Return how many distinct ways you can climb to the top.`
  return {
    id: `generated-${randomId()}`,
    slug,
    title,
    difficulty,
    topics: [capitalize(cleanedTopic), 'Dynamic Programming'],
    prompt,
    examples: [
      {
        input: [2],
        output: 2,
        explanation: '1+1 or 2',
      },
      {
        input: [3],
        output: 3,
      },
    ],
    starterCode: {
      ts: `export function solution(n: number): number {
  // Fibonacci-style DP
  return 0
}`,
      js: `export function solution(n) {
  // Fibonacci-style DP
  return 0
}`,
    },
    tests: [
      { name: 'n = 2', input: [2], output: 2 },
      { name: 'n = 3', input: [3], output: 3 },
      { name: 'n = 5', input: [5], output: 8 },
    ],
  }
}

const generators: Record<Difficulty, ((topic: string, difficulty: Difficulty) => Problem)[]> = {
  EASY: [createCountingProblem],
  MEDIUM: [createAggregationProblem, createDynamicProgrammingProblem],
  HARD: [createDynamicProgrammingProblem],
}

export async function generateProblem({
  topic,
  difficulty,
}: {
  topic: string
  difficulty: Difficulty
}): Promise<Problem> {
  const available = generators[difficulty]
  const generator = available[Math.floor(Math.random() * available.length)]
  return attachStarterCode(generator(topic, difficulty))
}

export async function getHint({ problem, code, lastResult }: HintRequest): Promise<string> {
  const attemptStatus = lastResult?.verdict
  const intro = `Problem: ${problem.title} (${difficultyLabel(problem.difficulty)})`
  const lines = [intro]

  if (attemptStatus === 'ACCEPTED') {
    lines.push('✅ Your latest attempt already passes all tests. Consider optimizing for readability or runtime if needed.')
  } else if (attemptStatus === 'WRONG_ANSWER') {
    lines.push('🔍 Check how you handle edge cases. Compare your output with the expected output for each example and ensure you are not mutating shared data.')
  } else if (attemptStatus === 'RUNTIME_ERROR') {
    lines.push('⚠️ Investigate runtime errors. Common issues include accessing undefined indices or calling methods on null values.')
  } else if (attemptStatus === 'TLE') {
    lines.push('⏳ Your solution timed out. Look for opportunities to use a more efficient data structure, such as a hash map or sliding window.')
  } else {
    lines.push('🧭 Start by restating the problem in your own words and outline a step-by-step approach before coding.')
  }

  if (code.trim().length < 30) {
    lines.push('✍️ Try sketching some pseudocode inside the editor to guide your implementation.')
  }

  lines.push('🧪 Re-run the provided examples locally and instrument your code with console logs to see intermediate states.')

  return lines.join('\n')
}

export async function summarizeReport({
  solved,
  attempts,
  passRate,
  weakTopics,
}: ReportInsights): Promise<string> {
  const summary: string[] = []
  summary.push(`You solved ${solved} problem${solved === 1 ? '' : 's'} across ${attempts} attempt${attempts === 1 ? '' : 's'}.`)
  summary.push(`Your pass rate is ${(passRate * 100).toFixed(1)}%. Focus on maintaining consistency across new problems.`)

  if (weakTopics.length > 0) {
    summary.push(`Spend extra time reviewing: ${weakTopics.join(', ')}.`)
  } else {
    summary.push('Great job! No weak topics detected from your history so far.')
  }

  summary.push('Set a goal to attempt at least three new problems this week and revisit any that required more than two tries.')

  return summary.join(' ')
}
