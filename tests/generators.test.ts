import { describe,it,expect } from 'vitest';
import { templates,practiceTemplates,makeSet } from '../src/engine/bank';
import { validate,verifyAnswer,verifyExplanation } from '../src/engine/verify';
import { calculate } from '../src/engine/math';
describe('111개 유형의 독립 검산',()=>{
 for(const t of templates)it(`${t.id} ${t.name}: 200개 시드`,()=>{
  for(let s=1;s<=200;s++) {const q=t.generate(s*7919);expect(validate(q),q.id).toEqual([]);expect(q).toEqual(t.generate(s*7919));}
 });
 it('오류 문항과 잘못된 해설 차단',()=>{const q=templates[0].generate(54);expect(verifyAnswer({...q,answer:q.answer+1})).toBe(false);expect(verifyExplanation({...q,steps:[{label:'오류',expression:'2+2',value:5}]})).toBe(false);expect(validate({...q,optionValues:Array(5).fill(q.answer)}).length).toBeGreaterThan(0);});
 it('두 영역 20문항 / 난도 12:8 / 재현 / 중복 없음',()=>{for(const area of ['creative','sequence'] as const){const qs=makeSet({area,seed:100});expect(qs).toHaveLength(20);expect(new Set(qs.map(q=>q.question)).size).toBe(20);for(const [d,n] of [['medium',12],['hard',8]] as const)expect(qs.filter(q=>q.difficulty===d)).toHaveLength(n);expect(qs).toEqual(makeSet({area,seed:100}));}});
 it('필터·최근 문항 회피',()=>{const qs=makeSet({area:'creative',seed:987,difficulty:'medium',subtypes:['speed-6']});const recent=qs.map(q=>q.question);const more=makeSet({area:'creative',seed:987,difficulty:'medium',subtypes:['speed-6'],recent});expect(more.every(q=>!recent.includes(q.question))).toBe(true);});
});
describe('안전한 계산기',()=>{
 it.each([['1+2*3',7],['(1+2)*3',9],['-2*(3.5-1)',-5],['0.1+0.2',0.3],['1/3+2/3',1]])('%s',(e,v)=>expect(calculate(e)).toBeCloseTo(v));
 it.each(['1/0','alert(1)','2**3','(1+2','1;2','2(3)','NaN'])('잘못된 입력 %s',e=>expect(()=>calculate(e)).toThrow());
});
it('모든 세부 유형은 집중훈련 20개 서로 다른 문항을 제공',()=>{for(const t of practiceTemplates){const qs=makeSet({area:t.area,subtypes:[t.id],seed:77});expect(new Set(qs.map(q=>q.question)).size,t.id).toBe(20);}});

it('기본 유형은 신규 출제에서 제외하고 과거 검증용 생성기는 보존',()=>{expect(practiceTemplates.every(t=>t.difficulty!=='easy')).toBe(true);for(const area of ['creative','sequence'] as const)for(let seed=1;seed<=20;seed++){const qs=makeSet({area,seed});expect(qs.every(q=>practiceTemplates.some(t=>t.id===q.subtype))).toBe(true);}expect(()=>makeSet({area:'sequence',subtypes:['seq-0']})).toThrow();});
