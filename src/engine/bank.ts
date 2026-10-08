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
import { patternTemplates } from './patterns';
import { creativeTemplates as v13Creative } from './legacy/v13/creative';
import { sequenceTemplates as v13Sequence } from './legacy/v13/sequence';
import { probabilityTemplates as v13Probability, referenceSequenceTemplates as v13ReferenceSequence } from './legacy/v13/reference';
import { validate } from './verify';
import { rng } from './math';
import type { Area, Attempt, Difficulty, Question, Template } from './types';
export const templates=[...creativeTemplates,...sequenceTemplates,...probabilityTemplates,...referenceSequenceTemplates,...patternTemplates];
// Retain all generators to verify historical records; only these enter new practice sets.
const basicOnly=new Set(['seq-9','seq-13','seq-15','seq-17','seq-19','seq-20','speed-4','speed-5','speed-8','speed-9','speed-14']);
export const practiceTemplates=templates.filter(t=>t.difficulty!=='easy'&&!basicOnly.has(t.id));
export const legacyTemplates=[...legacyCreative,...legacySequence];
export const v11Templates=[...v11Creative,...v11Sequence];
export const v12Templates=[...v12Creative,...v12Sequence,...v12Probability,...v12ReferenceSequence];
export const v13Templates=[...v13Creative,...v13Sequence,...v13Probability,...v13ReferenceSequence];
export function reproduce(q:Question):Question {const registry=q.generatorVersion==='1.0.0'?legacyTemplates:q.generatorVersion==='1.1.0'?v11Templates:q.generatorVersion==='1.2.0'?v12Templates:q.generatorVersion==='1.3.0'?v13Templates:q.generatorVersion==='1.4.0'?templates:[];const t=registry.find(t=>t.id===q.subtype);if(!t)throw Error('지원하지 않는 생성기 버전');return t.generate(q.seed);}
export const templateById=(id:string)=>templates.find(t=>t.id===id);
export function generateVerified(template:Template,seed:number):Question {const q=template.generate(seed);const errors=validate(q);if(errors.length)throw new Error(`${q.id}: ${errors.join(', ')}`);return q;}
// 링커리어 6회차 수열 120문항의 규칙 분포(docs/LINKAREER_REVIEW.md)와 제공 기출복원 해설에서 읽은
// 규칙을 분야로 묶은 것이다. 1.3.0까지는 고정된 20개 id 목록을 썼기 때문에 모의고사마다 같은 19개
// 유형만 나왔고, 풀에 있는 6개 유형은 한 번도 출제되지 않았다. 분야별 개수만 맞추고 유형은 매번 뽑는다.
const sequenceFamilies:[string,number,string[]][]=[
 ['분자·분모 독립 규칙',4,['seq-16','refseq-2','refseq-3','pat-4','pat-5','pat-6','pat-9']],
 ['분수·소수 표현 통일',3,['refseq-0','refseq-1','refseq-12','refseq-13']],
 ['홀수항·짝수항 분리',3,['seq-8','seq-23','refseq-7','pat-2']],
 ['변화하는 차이·비',2,['seq-2','seq-3','seq-4','pat-0','pat-1','pat-7']],
 ['이전 항의 합',2,['seq-10','refseq-6']],
 ['교대·여러 단계 연산',2,['seq-5','seq-6','seq-7','seq-22','seq-24']],
 ['군수열',1,['seq-21','refseq-8','refseq-9','pat-3']],
 ['정수부·소수부 분리',1,['refseq-4','pat-8']],
 ['이전 두 항의 곱',1,['refseq-5']],
 ['도형·격자 관계',1,['refseq-10','refseq-11']],
];
function planSequence(r:(min:number,max:number)=>number,pool:Template[],count:number):string[] {
 const levelOf=(id:string)=>pool.find(t=>t.id===id)!.difficulty;
 const groups=sequenceFamilies.map(([,quota,ids])=>{const live=ids.filter(id=>pool.some(t=>t.id===id));
  return {quota:Math.min(quota,live.length),medium:live.filter(id=>levelOf(id)==='medium'),hard:live.filter(id=>levelOf(id)!=='medium')};}).filter(g=>g.quota);
 if(!groups.length)return [];
 // 분야마다 Medium을 몇 개 가져갈지 먼저 정한다. 한 가지 난도만 가진 분야가 있어 순서대로 고르면
 // Medium 60 / Hard 40이 어긋난다. 가능한 범위의 최솟값에서 출발해 목표치까지 무작위로 올린다.
 const target=Math.round(count*0.6),take=groups.map(g=>Math.max(0,g.quota-g.hard.length));
 let chosen=take.reduce((n,v)=>n+v,0);
 for(let guard=0;chosen<target&&guard<2000;guard++){
  const i=r(0,groups.length-1),most=Math.min(groups[i].quota,groups[i].medium.length);
  if(take[i]<most){take[i]++;chosen++;}
 }
 const plan:string[]=[];
 groups.forEach((g,i)=>{
  const draw=(from:string[],n:number)=>{const rest=[...from];for(let k=0;k<n&&rest.length;k++)plan.push(...rest.splice(r(0,rest.length-1),1));};
  draw(g.medium,take[i]);draw(g.hard,g.quota-take[i]);
 });
 for(const t of pool)if(plan.length<count&&!plan.includes(t.id))plan.push(t.id);
 for(let j=plan.length-1;j>0;j--){const k=r(0,j);[plan[j],plan[k]]=[plan[k],plan[j]];}
 return plan.slice(0,count);
}
export interface Options { area:Area; seed?:number; count?:number; difficulty?:Difficulty|'balanced'; subtypes?:string[]; strategy?:'random'|'weak'|'speed'; attempts?:Attempt[]; recent?:string[] }
export function makeSet(o:Options):Question[] {
 const seed=o.seed??Date.now()>>>0,r=rng(seed),count=o.count??20;
 let pool=practiceTemplates.filter(t=>t.area===o.area&&(!o.subtypes?.length||o.subtypes.includes(t.id)));
 if(o.difficulty&&o.difficulty!=='balanced')pool=pool.filter(t=>t.difficulty===o.difficulty);
 if(!pool.length)throw new Error('조건에 맞는 검증된 유형이 없습니다.');
 const used=new Map<string,number>(),categories=new Map<string,number>(),out:Question[]=[],fingerprints=new Set(o.recent||[]);
 // A reference-balanced set covers observed rule families; explicit focus and adaptive modes retain their filters.
 const referenceMode=count===20&&!o.subtypes?.length&&(!o.difficulty||o.difficulty==='balanced')&&(!o.strategy||o.strategy==='random');
 const sequencePlan=referenceMode&&o.area==='sequence'?planSequence(r,pool,count):[];
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
