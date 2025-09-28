
import type { TestCase, EvalResult } from '@/lib/types'
export async function runInWorker(code:string, tests:TestCase[]):Promise<EvalResult>{
  const worker=new Worker(new URL('./worker.ts',import.meta.url),{type:'module'})
  return new Promise((resolve)=>{
    worker.onmessage=(e:MessageEvent)=>{worker.terminate();resolve(e.data.payload)}
    worker.onerror=()=>{worker.terminate();resolve({passed:0,total:tests.length,details:[],verdict:'RUNTIME_ERROR'})}
    worker.postMessage({code,tests})
  })
}
