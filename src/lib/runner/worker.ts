
function deepEqual(a:any,b:any):boolean{
  if(Object.is(a,b))return true
  if(typeof a!==typeof b)return false
  if(a&&b&&typeof a==='object'){
    if(Array.isArray(a)!==Array.isArray(b))return false
    if(Array.isArray(a)){
      if(a.length!==(b as any).length)return false
      for(let i=0;i<a.length;i++)if(!deepEqual(a[i],(b as any)[i]))return false
      return true
    }else{
      const ak=Object.keys(a),bk=Object.keys(b as any)
      if(ak.length!==bk.length)return false
      for(const k of ak)if(!deepEqual(a[k],(b as any)[k]))return false
      return true
    }
  }
  return false
}
self.onmessage=async(e:MessageEvent)=>{
  const {code,tests}=e.data as {code:string;tests:any[]}
  try{
    const fnFactory=new Function(`${code}; return typeof solution!=='undefined'?solution:null;`)
    const solution=fnFactory()
    if(typeof solution!=='function'){self.postMessage({ok:true,payload:{passed:0,total:tests.length,details:[],verdict:'RUNTIME_ERROR'}});return}
    let passed=0;const details:any[]=[];const t0=performance.now()
    for(const t of tests){
      const start=performance.now();let status:'pass'|'fail'|'error'='error';let info
      try{
        const result=await Promise.race([Promise.resolve().then(()=>solution(...t.input)),new Promise((_,rej)=>setTimeout(()=>rej(new Error('TLE')),1000))])
        if(deepEqual(result,t.output)){status='pass';passed++}else{status='fail';info=JSON.stringify({expected:t.output,actual:result})}
      }catch(err:any){status='error';info=String(err?.message||err)}
      const runtimeMs=performance.now()-start;details.push({name:t.name,status,info,runtimeMs})
    }
    const verdict=passed===tests.length?'ACCEPTED':'WRONG_ANSWER'
    self.postMessage({ok:true,payload:{passed,total:tests.length,details,verdict,runtimeMs:performance.now()-t0}})
  }catch(err){self.postMessage({ok:false,error:String(err)})}
}
