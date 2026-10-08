import { describe,expect,it } from 'vitest';
import { practiceTemplates } from '../src/engine/bank';
// 유형 연습은 같은 유형을 20문항 연속으로 푼다. 조건이 늘 같은 비율로 묶여 있으면
// 숫자만 바뀌고 푸는 방법이 한 가지로 굳어져 연습이 되지 않는다.
const SEEDS=200;
const samples=(t:typeof practiceTemplates[number])=>Array.from({length:SEEDS},(_,i)=>t.generate((i+1)*7919));
// 문제 문장에 실제로 적히는 조건만 본다. 쓰이지 않는 잔여 facts는 화면에 영향을 주지 않는다.
const printed=(q:{question:string;facts:Record<string,number>})=>Object.keys(q.facts)
 .filter(k=>new RegExp(`(^|[^0-9.])${String(q.facts[k]).replace('.','\\.')}([^0-9.]|$)`).test(q.question));
describe('유형 연습의 조건 다양성',()=>{
 for(const t of practiceTemplates)it(`${t.id} ${t.name}`,()=>{
  const qs=samples(t);
  const keys=[...new Set(qs.flatMap(printed))].filter(k=>qs.every(q=>printed(q).includes(k)));
  for(const key of keys){
   // 정답이 문제에 적힌 조건 그대로이거나 항상 같은 배수면 계산할 것이 없다.
   const ratios=new Set(qs.map(q=>(q.facts[key]?q.answer/q.facts[key]:NaN)).filter(Number.isFinite).map(v=>v.toFixed(6)));
   expect(ratios.size===1&&qs.every(q=>!!q.facts[key]),`${t.id}: 정답이 조건 ${key}의 고정 배수`).toBe(false);
  }
  // 문제에 함께 적히는 두 조건이 늘 같은 비율이면 사실상 조건이 하나다.
  for(let i=0;i<keys.length;i++)for(let j=i+1;j<keys.length;j++){
   const pair=new Set(qs.map(q=>(q.facts[keys[j]]?q.facts[keys[i]]/q.facts[keys[j]]:NaN)).filter(Number.isFinite).map(v=>v.toFixed(6)));
   expect(pair.size,`${t.id}: 조건 ${keys[i]}와 ${keys[j]}가 항상 같은 비율`).toBeGreaterThan(1);
  }
  expect(new Set(qs.map(q=>q.question)).size,`${t.id}: 서로 다른 문항`).toBeGreaterThanOrEqual(30);
  expect(new Set(qs.map(q=>q.answer)).size,`${t.id}: 서로 다른 정답`).toBeGreaterThanOrEqual(12);
 });
});
