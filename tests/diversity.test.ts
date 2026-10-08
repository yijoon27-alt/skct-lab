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
  // 문제에 적히는 조건이 늘 같은 값이면 그 조건은 사실상 문장의 일부일 뿐이다.
  for(const key of keys)expect(new Set(qs.map(q=>q.facts[key])).size,`${t.id}: 조건 ${key}이(가) 항상 같은 값`).toBeGreaterThan(1);
  expect(new Set(qs.map(q=>q.question)).size,`${t.id}: 서로 다른 문항`).toBeGreaterThanOrEqual(30);
  expect(new Set(qs.map(q=>q.answer)).size,`${t.id}: 서로 다른 정답`).toBeGreaterThanOrEqual(12);
 });
});
it('정답만 유일하게 어떤 단위의 배수여서 계산 없이 고를 수 있는 문항은 드물어야 한다',()=>{
 // 선지 간격이 정답의 자릿수와 무관하면 정답만 100의 배수로 튀어 계산할 필요가 없어진다.
 const divides=(v:number,m:number)=>Math.abs(v/m-Math.round(v/m))<1e-9;
 let guessable=0,total=0;
 for(const t of practiceTemplates)for(let s=1;s<=100;s++){
  const q=t.generate(s*7919);total++;
  if([1000,100,10,5,2].some(m=>divides(q.answer,m)&&q.optionValues.filter(v=>divides(v,m)).length===1))guessable++;
 }
 expect(guessable/total,`${guessable}/${total} 문항이 선지만 보고 고를 수 있음`).toBeLessThan(0.02);
});
it('문제 문장에 고정된 숫자가 박혀 있으면 안 된다',()=>{
 // 20%, 10%처럼 문장에 적힌 숫자는 facts에 없어서 조건 검사에 걸리지 않는다.
 // 숫자를 자리표시자로 바꾼 문장 뼈대가 같은 문항끼리 자리별로 비교한다.
 const allowed:Record<string,number[]>={
  'count-16':[0,0],      // (0,0)에서 출발
  'cost-14':[1],         // 1원 단위 올림
  'seq-17':[1,1,1,1,1,1,1],'refseq-3':[1,1,1,1,1,1,1],'count-13':[1,1],  // 역수·독립 사건의 분자 1은 유형의 정의
  'ratio-10':[1],'ratio-11':[1],               // 1부터 N까지
 };
 for(const t of practiceTemplates){
  const qs=Array.from({length:120},(_,i)=>t.generate((i+1)*7919).question.split('\n')[0]);
  const groups=new Map<string,number[][]>();
  for(const q of qs){
   const nums=(q.match(/-?\d+(?:\.\d+)?/g)||[]).map(Number);
   const shape=q.replace(/-?\d+(?:\.\d+)?/g,'#');
   groups.set(shape,[...(groups.get(shape)||[]),nums]);
  }
  const lists=[...groups.values()].sort((a,b)=>b.length-a.length)[0];
  if(lists.length<40)continue;
  const fixed=lists[0].filter((_,i)=>lists.every(v=>v[i]===lists[0][i]));
  expect(fixed,`${t.id} ${t.name}: 문장에 고정된 숫자`).toEqual(allowed[t.id]??[]);
 }
});
