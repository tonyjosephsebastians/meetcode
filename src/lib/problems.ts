import type { Difficulty, Lang, Problem } from './types'

function randomId(prefix = 'p') {
  const cryptoImpl = typeof globalThis !== 'undefined' ? (globalThis as { crypto?: Crypto }).crypto : undefined
  if (cryptoImpl && typeof cryptoImpl.randomUUID === 'function') {
    return `${prefix}-${cryptoImpl.randomUUID().slice(0, 8)}`
  }
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`
}

const STARTER_TS = `export function solution(...args: any[]): any {
  // TODO: implement
  return null
}`

const STARTER_JS = `export function solution(...args) {
  // TODO: implement
  return null
}`

const STARTER_BY_LANG: Record<Lang, string> = {
  ts: STARTER_TS,
  js: STARTER_JS,
}

const seed: Problem[] = [
  {
    id: 'two-sum',
    slug: 'two-sum',
    title: 'Two Sum',
    difficulty: 'EASY',
    topics: ['Array', 'Hash Map'],
    prompt:
      'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target. You may assume that each input has exactly one solution, and you may not use the same element twice.',
    constraints: '- 2 ≤ nums.length ≤ 10^4\n- -10^9 ≤ nums[i] ≤ 10^9\n- Exactly one valid answer exists.',
    examples: [
      {
        input: [[2, 7, 11, 15], 9],
        output: [0, 1],
        explanation: '2 + 7 = 9',
      },
      {
        input: [[3, 2, 4], 6],
        output: [1, 2],
      },
    ],
    starterCode: {
      ts: `export function solution(nums: number[], target: number): [number, number] {
  // Use a hash map to store value -> index
  return [0, 0]
}`,
      js: `export function solution(nums, target) {
  // Use a hash map to store value -> index
  return [0, 0]
}`,
    },
    tests: [
      { name: 'example 1', input: [[2, 7, 11, 15], 9], output: [0, 1] },
      { name: 'example 2', input: [[3, 2, 4], 6], output: [1, 2] },
      { name: 'negative numbers', input: [[-3, 4, 3, 90], 0], output: [0, 2] },
    ],
  },
  {
    id: 'valid-parentheses',
    slug: 'valid-parentheses',
    title: 'Valid Parentheses',
    difficulty: 'EASY',
    topics: ['Stack', 'String'],
    prompt:
      'Given a string s containing just the characters "()", "{}", and "[]", determine if the input string is valid. An input string is valid if open brackets are closed by the same type of brackets and in the correct order.',
    examples: [
      {
        input: ['()'],
        output: true,
      },
      {
        input: ['()[]{}'],
        output: true,
      },
      {
        input: ['(]'],
        output: false,
      },
    ],
    starterCode: {
      ts: `export function solution(s: string): boolean {
  // Use a stack to match parentheses
  return true
}`,
      js: `export function solution(s) {
  // Use a stack to match parentheses
  return true
}`,
    },
    tests: [
      { name: 'simple valid', input: ['()'], output: true },
      { name: 'mixed valid', input: ['()[]{}'], output: true },
      { name: 'invalid', input: ['(]'], output: false },
      { name: 'nested', input: ['{[]}'], output: true },
    ],
  },
  {
    id: 'longest-substring-without-repeat',
    slug: 'longest-substring-without-repeat',
    title: 'Longest Substring Without Repeating Characters',
    difficulty: 'MEDIUM',
    topics: ['Sliding Window', 'String'],
    prompt:
      'Given a string s, find the length of the longest substring without repeating characters. Return the length of the substring.',
    examples: [
      {
        input: ['abcabcbb'],
        output: 3,
        explanation: 'The answer is "abc" with length 3.',
      },
      {
        input: ['bbbbb'],
        output: 1,
      },
    ],
    starterCode: {
      ts: `export function solution(s: string): number {
  // Sliding window
  return 0
}`,
      js: `export function solution(s) {
  // Sliding window
  return 0
}`,
    },
    tests: [
      { name: 'example 1', input: ['abcabcbb'], output: 3 },
      { name: 'example 2', input: ['bbbbb'], output: 1 },
      { name: 'mixed', input: ['pwwkew'], output: 3 },
      { name: 'unicode', input: ['dvdf'], output: 3 },
    ],
  },
  {
    id: 'binary-tree-level-order',
    slug: 'binary-tree-level-order',
    title: 'Binary Tree Level Order Traversal',
    difficulty: 'MEDIUM',
    topics: ['Tree', 'Breadth-First Search'],
    prompt:
      'Given the root of a binary tree, return the level order traversal of its nodes values from left to right, level by level.',
    constraints: '- 0 ≤ nodes ≤ 2000\n- Node values are integers in [-1000, 1000]',
    examples: [
      {
        input: [
          {
            val: 3,
            left: { val: 9, left: null, right: null },
            right: { val: 20, left: { val: 15, left: null, right: null }, right: { val: 7, left: null, right: null } },
          },
        ],
        output: [[3], [9, 20], [15, 7]],
      },
    ],
    starterCode: {
      ts: `export interface TreeNode {
  val: number
  left: TreeNode | null
  right: TreeNode | null
}

export function solution(root: TreeNode | null): number[][] {
  // Breadth-first search
  return []
}`,
      js: `export function solution(root) {
  // Breadth-first search
  return []
}`,
    },
    tests: [
      {
        name: 'basic tree',
        input: [
          {
            val: 3,
            left: { val: 9, left: null, right: null },
            right: { val: 20, left: { val: 15, left: null, right: null }, right: { val: 7, left: null, right: null } },
          },
        ],
        output: [[3], [9, 20], [15, 7]],
      },
      { name: 'single node', input: [{ val: 1, left: null, right: null }], output: [[1]] },
      { name: 'empty', input: [null], output: [] },
    ],
  },
]

export function getSeedProblems(): Problem[] {
  return seed.map((problem) => ({
    ...problem,
    starterCode: {
      ts: problem.starterCode.ts ?? STARTER_BY_LANG.ts,
      js: problem.starterCode.js ?? STARTER_BY_LANG.js,
    },
  }))
}

export function difficultyClass(difficulty: Difficulty) {
  switch (difficulty) {
    case 'EASY':
      return 'badge easy'
    case 'MEDIUM':
      return 'badge medium'
    case 'HARD':
      return 'badge hard'
    default:
      return 'badge'
  }
}

export function difficultyLabel(difficulty: Difficulty) {
  return difficulty.charAt(0) + difficulty.slice(1).toLowerCase()
}

export function slugify(input: string) {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function createProblemSkeleton(title: string, difficulty: Difficulty, topics: string[]): Problem {
  const slug = slugify(title)
  return {
    id: slug || randomId(),
    slug: slug || randomId(),
    title,
    difficulty,
    topics,
    prompt: 'Describe the problem in detail.',
    examples: [],
    starterCode: { ...STARTER_BY_LANG },
    tests: [],
  }
}

export function nextProblemId() {
  return randomId('problem')
}

export function attachStarterCode(problem: Problem): Problem {
  return {
    ...problem,
    starterCode: {
      ts: problem.starterCode?.ts ?? STARTER_BY_LANG.ts,
      js: problem.starterCode?.js ?? STARTER_BY_LANG.js,
    },
  }
}
