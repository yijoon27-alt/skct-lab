import { describe,expect,it } from 'vitest';
import { patternTemplates } from '../src/engine/patterns';
import { makeSet,practiceTemplates,templateById,generateVerified } from '../src/engine/bank';
import { validate } from '../src/engine/verify';
import { gcd } from '../src/engine/math';
describe('자료에서 확인한 새 수열 규칙',()=>{
 it('10개 유형이 모두 연습 풀에 들어간다',()=>{
  expect(patternTemplates).toHaveLength(10);
  for(const t of patternTemplates)expect(practiceTemplates.some(p=>p.id===t.id),t.id).toBe(true);
 });
 for(const t of patternTemplates)it(`${t.id} ${t.name}: 500개 시드`,()=>{
  for(let s=1;s<=500;s++){const q=generateVerified(t,s*7919);expect(q).toEqual(t.generate(s*7919));}
 });
 it('규칙을 어긋나게 바꾼 항은 독립 검산이 걸러낸다',()=>{
  for(const t of patternTemplates){
   const q=t.generate(7919),bad=structuredClone(q);
   bad.sequence![1]+=1;
   expect(validate(bad),t.id).toContain('독립 조건 검산 실패');
  }
 });
});
describe('수열 모의고사 구성',()=>{
 // 1.3.0까지는 고정된 20개 id 목록이라 세트마다 같은 19개 유형만 나왔다.
 it('80세트에서 연습 풀의 모든 수열 유형이 한 번은 출제되고, 한 세트 안에서는 겹치지 않는다',()=>{
  const pool=practiceTemplates.filter(t=>t.area==='sequence');
  const seen=new Set<string>();
  for(let seed=1;seed<=80;seed++){
   const qs=makeSet({area:'sequence',seed:seed*7919});
   expect(new Set(qs.map(q=>q.subtype)).size,`시드 ${seed}`).toBe(20);
   expect(qs.filter(q=>q.difficulty==='medium'),`시드 ${seed}`).toHaveLength(12);
   expect(qs.filter(q=>q.difficulty==='hard'),`시드 ${seed}`).toHaveLength(8);
   for(const q of qs)seen.add(q.subtype);
  }
  expect([...pool].filter(t=>!seen.has(t.id)).map(t=>t.id)).toEqual([]);
 });
});
it('분자·분모를 각각 따라가는 유형은 약분으로 규칙이 가려지지 않는다',()=>{
 const t=practiceTemplates.find(t=>t.id==='seq-16')!;
 for(let s=1;s<=300;s++){
  const q=t.generate(s*7919),{a,b,c}=q.facts;
  for(let j=0;j<9;j++)expect(gcd(a+j*b,a+b+j*c),`${q.id} ${j+1}번째 항`).toBe(1);
 }
});
it('소수로 제시한 수열은 선지와 해설도 소수로 적는다',()=>{
 // 1.3.0까지 5.03, 8.04, 11.06 수열의 선지가 2939/100, 147/5로 나왔다.
 for(const id of ['refseq-4','pat-8','seq-18'])for(const seed of [7919,31676,54321]){
  const q=templateById(id)!.generate(seed);
  expect(q.decimals,id).toBeGreaterThan(0);
  const shape=new RegExp(`^-?\\d+\\.\\d{${q.decimals}}$`);
  for(const option of q.options)expect(option,`${id} 선지 ${option}`).toMatch(shape);
  expect(q.explanation,`${id} 해설`).not.toMatch(/\d\/\d/);
  expect(q.question.split('\n')[0],`${id} 문제`).not.toMatch(/\d\/\d/);
 }
});
it('모든 항이 양수인 수열에는 계산 없이 지워지는 0 이하 선지를 넣지 않는다',()=>{
 for(const t of practiceTemplates.filter(t=>t.area==='sequence'))for(let s=1;s<=120;s++){
  const q=t.generate(s*7919);
  if(!q.sequence?.length||!q.sequence.every(v=>v>0)||q.answer<=0)continue;
  expect(q.optionValues.filter(v=>v<=0),q.id).toEqual([]);
 }
});
