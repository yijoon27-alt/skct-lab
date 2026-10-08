import { creativeTemplates } from './creative';
import { sequenceTemplates } from './sequence';
import { creativeTemplates as legacyCreative } from './legacy/creative';
import { sequenceTemplates as legacySequence } from './legacy/sequence';
import { creativeTemplates as v11Creative } from './legacy/v11/creative';
import { sequenceTemplates as v11Sequence } from './legacy/v11/sequence';
import { creativeTemplates as v12Creative } from './legacy/v12/creative';
import { sequenceTemplates as v12Sequence } from './legacy/v12/sequence';
import { probabilityTemplates as v12Probability, referenceSequenceTemplates as v12ReferenceSequence } from './legacy/v12/reference';
import { probabilityTemplates, referenceSequenceTemplates } from './reference';
import { validate } from './verify';
import { rng } from './math';
import type { Area, Attempt, Difficulty, Question, Template } from './types';
export const templates=[...creativeTemplates,...sequenceTemplates,...probabilityTemplates,...referenceSequenceTemplates];
// Retain all generators to verify historical records; only these enter new practice sets.
const basicOnly=new Set(['seq-9','seq-13','seq-15','seq-17','seq-19','seq-20','speed-4','speed-5','speed-8','speed-9','speed-14']);
export const practiceTemplates=templates.filter(t=>t.difficulty!=='easy'&&!basicOnly.has(t.id));
export const legacyTemplates=[...legacyCreative,...legacySequence];
export const v11Templates=[...v11Creative,...v11Sequence];
export const v12Templates=[...v12Creative,...v12Sequence,...v12Probability,...v12ReferenceSequence];
export function reproduce(q:Question):Question {const registry=q.generatorVersion==='1.0.0'?legacyTemplates:q.generatorVersion==='1.1.0'?v11Templates:q.generatorVersion==='1.2.0'?v12Templates:q.generatorVersion==='1.3.0'?templates:[];const t=registry.find(t=>t.id===q.subtype);if(!t)throw Error('지원하지 않는 생성기 버전');return t.generate(q.seed);}
export const templateById=(id:string)=>templates.find(t=>t.id===id);
export function generateVerified(template:Template,seed:number):Question {const q=template.generate(seed);const errors=validate(q);if(errors.length)throw new Error(`${q.id}: ${errors.join(', ')}`);return q;}
export interface Options { area:Area; seed?:number; count?:number; difficulty?:Difficulty|'balanced'; subtypes?:string[]; strategy?:'random'|'weak'|'speed'; attempts?:Attempt[]; recent?:string[] }
export function makeSet(o:Options):Question[] {
 const seed=o.seed??Date.now()>>>0,r=rng(seed),count=o.count??20;
 let pool=practiceTemplates.filter(t=>t.area===o.area&&(!o.subtypes?.length||o.subtypes.includes(t.id)));
 if(o.difficulty&&o.difficulty!=='balanced')pool=pool.filter(t=>t.difficulty===o.difficulty);
 if(!pool.length)throw new Error('조건에 맞는 검증된 유형이 없습니다.');
 const used=new Map<string,number>(),categories=new Map<string,number>(),out:Question[]=[],fingerprints=new Set(o.recent||[]);
 // A reference-balanced set covers observed rule families; explicit focus and adaptive modes retain their filters.
 const referenceMode=count===20&&!o.subtypes?.length&&(!o.difficulty||o.difficulty==='balanced')&&(!o.strategy||o.strategy==='random');
 const sequencePlan=['refseq-0','refseq-1','refseq-2','refseq-3','seq-16','refseq-4','refseq-5','refseq-6','refseq-7','refseq-8','refseq-9',`refseq-${r(10,11)}`,'seq-8','seq-10','refseq-12','refseq-13','seq-3','seq-23','seq-22','seq-7'];
 for(let j=sequencePlan.length-1;j>0;j--){const k=r(0,j);[sequencePlan[j],sequencePlan[k]]=[sequencePlan[k],sequencePlan[j]];}
 const bayesSlot=r(0,19);
 const targets:Difficulty[]=Array.from({length:count},(_,i)=>i<count*.6?'medium':'hard');
 for(let n=targets.length-1;n>0;n--){const k=r(0,n);[targets[n],targets[k]]=[targets[k],targets[n]];}
 for(let n=0;n<count;n++){
  let available=pool;
  if(!o.subtypes?.length&&(!o.difficulty||o.difficulty==='balanced')){const same=pool.filter(t=>t.difficulty===targets[n]);if(same.length)available=same;}
  if(referenceMode&&o.area==='sequence')available=pool.filter(t=>t.id===sequencePlan[n]);
  if(referenceMode&&o.area==='creative'&&n===bayesSlot){const candidates=available.filter(t=>t.id.startsWith('bayes-'));if(candidates.length)available=candidates;}
  const unused=available.filter(t=>!used.has(t.id));if(unused.length)available=unused;
  if(!o.subtypes?.length&&o.area==='creative'){const balanced=available.filter(t=>(categories.get(t.category)||0)<4);if(balanced.length)available=balanced;}
  const scores=available.map(t=>{
   const history=(o.attempts||[]).filter(a=>a.first&&!a.assisted&&a.question.subtype===t.id);
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
