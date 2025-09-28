
import { create } from 'zustand'
import type { Lang, Problem } from '@/lib/types'

type State={ lang:Lang; problems:Problem[]; attempts:any[] }
type Actions={ setLang:(l:Lang)=>void; setProblems:(p:Problem[])=>void; addAttempt:(a:any)=>void }

export const useStore=create<State&Actions>((set)=>({
  lang:'ts', problems:[], attempts:[],
  setLang:(l)=>set({lang:l}),
  setProblems:(p)=>set({problems:p}),
  addAttempt:(a)=>set(s=>({attempts:[...s.attempts,a]}))
}))
