import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { Attempt, Lang, Problem } from '@/lib/types'
import { attachStarterCode, getSeedProblems } from '@/lib/problems'
import { getStorage } from '@/lib/storage'

export interface StoreState {
  lang: Lang
  problems: Problem[]
  attempts: Attempt[]
  aiSummary: string | null
}

export interface StoreActions {
  setLang: (lang: Lang) => void
  setProblems: (problems: Problem[]) => void
  upsertProblem: (problem: Problem) => void
  addAttempt: (attempt: Attempt) => void
  setAiSummary: (summary: string | null) => void
  reset: () => void
}

const STORAGE_KEY = 'meetcode-store'

const useStoreBase = create<StoreState & StoreActions>()(
  persist(
    (set, get) => ({
      lang: 'ts',
      problems: getSeedProblems(),
      attempts: [],
      aiSummary: null,
      setLang: (lang) => set({ lang }),
      setProblems: (problems) =>
        set({ problems: problems.map((problem) => attachStarterCode(problem)) }),
      upsertProblem: (problem) => {
        const { problems } = get()
        const existingIndex = problems.findIndex((p) => p.id === problem.id || p.slug === problem.slug)
        if (existingIndex >= 0) {
          const updated = [...problems]
          updated[existingIndex] = attachStarterCode(problem)
          set({ problems: updated })
        } else {
          set({ problems: [...problems, attachStarterCode(problem)] })
        }
      },
      addAttempt: (attempt) => set({ attempts: [...get().attempts, attempt] }),
      setAiSummary: (summary) => set({ aiSummary: summary }),
      reset: () =>
        set({
          lang: 'ts',
          problems: getSeedProblems(),
          attempts: [],
          aiSummary: null,
        }),
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => getStorage()),
    },
  ),
)

export const useStore = useStoreBase
