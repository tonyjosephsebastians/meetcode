
export type Difficulty = 'EASY'|'MEDIUM'|'HARD'
export type Lang = 'ts'|'js'

export interface Example { input: unknown[]; output: unknown }
export interface TestCase { name:string; input:unknown[]; output:unknown; hidden?:boolean }
export interface Problem {
  id:string; slug:string; title:string; difficulty:Difficulty; topics:string[];
  prompt:string; constraints?:string; examples:Example[]; starterCode:Record<Lang,string>; tests:TestCase[];
}

export type TestStatus = 'pass'|'fail'|'error'
export interface TestResult { name:string; status:TestStatus; info?:string; runtimeMs:number }
export interface EvalResult { passed:number; total:number; details:TestResult[]; verdict:'ACCEPTED'|'WRONG_ANSWER'|'RUNTIME_ERROR'|'TLE'; runtimeMs?:number }
export interface UserReport { solved:number; attempts:number; passRate:number; weakTopics:string[]; aiSummary:string }
