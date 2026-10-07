import { creativeTemplates } from './creative';
import { sequenceTemplates } from './sequence';
import { validate } from './verify';
import { rng } from './math';
import type { Area, Attempt, Difficulty, Question, Template } from './types';
export const templates=[...creativeTemplates,...sequenceTemplates];
export const templateById=(id:string)=>templates.find(t=>t.id===id);
export function generateVerified(template:Template,seed:number):Question {const q=template.generate(seed);const errors=validate(q);if(errors.length)throw new Error(`${q.id}: ${errors.join(', ')}`);return q;}
export interface Options { area:Area; seed?:number; count?:number; difficulty?:Difficulty|'balanced'; subtypes?:string[]; strategy?:'random'|'weak'|'speed'; attempts?:Attempt[]; recent?:string[] }
export function makeSet(o:Options):Question[] {
 const seed=o.seed??Date.now()>>>0,r=rng(seed),count=o.count??20;
 let pool=templates.filter(t=>t.area===o.area&&(!o.subtypes?.length||o.subtypes.includes(t.id)));
 if(o.difficulty&&o.difficulty!=='balanced')pool=pool.filter(t=>t.difficulty===o.difficulty);
 if(!pool.length)throw new Error('조건에 맞는 검증된 유형이 없습니다.');
 const used=new Map<string,number>(),categories=new Map<string,number>(),out:Question[]=[],fingerprints=new Set(o.recent||[]);
 const targets:Difficulty[]=Array.from({length:count},(_,i)=>i<count*.25?'easy':i<count*.75?'medium':'hard');
 for(let n=targets.length-1;n>0;n--){const k=r(0,n);[targets[n],targets[k]]=[targets[k],targets[n]];}
 for(let n=0;n<count;n++){
  let available=pool;
  if(!o.subtypes?.length&&(!o.difficulty||o.difficulty==='balanced')){const same=pool.filter(t=>t.difficulty===targets[n]);if(same.length)available=same;}
  const unused=available.filter(t=>!used.has(t.id));if(unused.length)available=unused;
  if(!o.subtypes?.length&&o.area==='creative'){const balanced=available.filter(t=>(categories.get(t.category)||0)<4);if(balanced.length)available=balanced;}
  const scores=available.map(t=>{
   const history=(o.attempts||[]).filter(a=>a.first&&a.question.subtype===t.id);
   const weakness=history.length?history.filter(a=>!a.correct).length/history.length:0.5;
   const speed=history.length?history.filter(a=>a.correct&&a.seconds>45).length/history.length:0;
   const weight=o.strategy==='weak'?1+weakness*5:o.strategy==='speed'?1+speed*5:1;
   return {t,score:(r(1,1000)/1000)*weight/(1+(used.get(t.id)||0)*5+(categories.get(t.category)||0)*0.5)};
  }).sort((a,b)=>b.score-a.score);
  const t=scores[0].t;let q:Question|undefined;
  for(let k=0;k<100;k++){
   const candidate=generateVerified(t,r(1,2147483646));
   if(!fingerprints.has(candidate.question)){q=candidate;break;}
  }
  if(!q){for(let k=0;k<1000;k++){const candidate=generateVerified(t,r(1,2147483646));if(!out.some(v=>v.question===candidate.question)){q=candidate;break;}}}
  if(!q)throw new Error('서로 다른 숫자 조합이 부족합니다. 유형 범위를 넓혀주세요.');
  used.set(t.id,(used.get(t.id)||0)+1);categories.set(t.category,(categories.get(t.category)||0)+1);fingerprints.add(q.question);out.push(q);
 }
 return out;
}
