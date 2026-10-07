import { questionKey,normalizeAttempts } from './identity';
import type { Attempt, Question, Session, Store, Area, Mode } from './types';
export function createSession(questions:Question[],area:Area,mode:Mode,review=false):Session {return {id:crypto.randomUUID(),area,mode,questions,index:0,answers:{},seconds:{},notes:{},startedAt:null,deadline:null,remaining:900,done:false,running:false,review};}
export function tick(s:Session,now:number):Session {if(s.done||!s.running)return s;return {...s,remaining:s.deadline?Math.max(0,Math.ceil((s.deadline-now)/1000)):s.remaining};}
export function canMove(s:Session,index:number):boolean {return index>=0&&index<s.questions.length&&(s.done||s.mode==='card'||index===s.index);}
export function grade(store:Store,s:Session,index:number,selected:number|null):Store {
 const q=s.questions[index];if(Object.hasOwn(s.answers,q.id))return store;
 const first=!store.attempts.some(a=>questionKey(a.question)===questionKey(q));
 const attempt:Attempt={id:`${s.id}:${q.id}`,question:q,selected,correct:selected===q.correctAnswer,seconds:s.seconds[q.id]||0,at:new Date().toISOString(),sessionId:s.id,first,note:s.notes[q.id]||store.notes[q.id]||''};
 const next={...s,answers:{...s.answers,[q.id]:selected}};
 return {...store,session:next,attempts:[...store.attempts,attempt]};
}
export function finish(store:Store,s:Session):Store {
 if(s.done)return store;
 let next:Store={...store,session:s};for(let i=0;i<s.questions.length;i++)next=grade(next,next.session!,i,null);
 const final={...next.session!,done:true,running:false,remaining:s.remaining};
 const score=s.questions.filter(q=>final.answers[q.id]===q.correctAnswer).length;
 return {...next,session:final,results:[...next.results,{id:s.id,area:s.area,score,count:s.questions.length,seconds:Object.values(final.seconds).reduce((a,b)=>a+b,0),at:new Date().toISOString()}]};
}
export function getStats(attempts:Attempt[]) {
 const normalized=normalizeAttempts(attempts),first=normalized.filter(a=>a.first),retry=normalized.filter(a=>!a.first);
 const groups=new Map<string,Attempt[]>();for(const a of first){const key=a.question.subtype;groups.set(key,[...(groups.get(key)||[]),a]);}
 return {first,retry,accuracy:first.length?first.filter(a=>a.correct).length/first.length*100:0,average:first.length?first.reduce((s,a)=>s+a.seconds,0)/first.length:0,groups:[...groups].map(([subtype,items])=>({subtype,category:items[0].question.category,total:items.length,accuracy:items.filter(a=>a.correct).length/items.length*100,seconds:items.reduce((s,a)=>s+a.seconds,0)/items.length})).sort((a,b)=>a.accuracy-b.accuracy)};
}

export function calendarDay(iso:string):string {return new Intl.DateTimeFormat('sv-SE',{timeZone:'Asia/Seoul',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date(iso));}
