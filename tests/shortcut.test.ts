import { describe,it,expect } from 'vitest';
import { templateById,templates,v17Templates,reproduce } from '../src/engine/bank';
import { creativeGuidance,allowedMethods,applyGuidance } from '../src/engine/guidance';
import { validate } from '../src/engine/verify';
import { calculate,close,gcd } from '../src/engine/math';

describe('조건이 맞는 문항에만 변형 최단풀이를 붙인다',()=>{
 // 역비 풀이는 한 칸이 정수 분으로 떨어질 때만 실제로 더 빠르다. 떨어지지 않는데 안내하면
 // 분수 칸을 계산하게 되어 기본 풀이보다 길어진다. 그 경계를 생성기 바깥에서 다시 센다.
 it('speed-3은 한 칸이 정수 분일 때만 역비 풀이를 안내한다',()=>{
  const t=templateById('speed-3')!,guide=creativeGuidance['speed-3'],[general,ratioMethod]=allowedMethods(guide);
  let ratio=0;
  for(let s=1;s<=1500;s++){
   const q=t.generate(s*7919);
   const [slow,fast]=[q.facts.slow,q.facts.fast],share=gcd(slow,fast);
   const step=q.facts.t/(fast/share-slow/share);          // 한 칸의 분
   const want=Number.isInteger(step)?ratioMethod:general;
   expect(q.shortcut.startsWith(want),`${q.id} ${slow}:${fast} ${q.facts.t}분 → 한 칸 ${step}분`).toBe(true);
   if(Number.isInteger(step))ratio++;
  }
  expect(ratio).toBeGreaterThan(0);expect(ratio).toBeLessThan(1500);
 });
 it('두 갈래 모두 메모식이 정답과 같은 값을 낸다',()=>{
  const t=templateById('speed-3')!;
  for(let s=1;s<=1500;s++){const q=t.generate(s*7919);
   expect(validate(q),q.id).toEqual([]);
   expect(close(calculate(q.memo),q.answer),`${q.id} 메모식 ${q.memo}`).toBe(true);}
 });
 it('등록되지 않은 최단풀이는 여전히 걸러진다',()=>{
  const q=templateById('speed-3')!.generate(7919);
  expect(validate({...q,shortcut:`${creativeGuidance['speed-4'].method} 메모장 계산식: ${q.memo}`})).toContain('유형과 최단풀이 불일치');
 });
 it('변형을 쓰지 않는 유형은 기본 풀이 하나만 허용한다',()=>{
  for(const t of templates.filter(t=>t.area==='creative')){
   const guide=creativeGuidance[t.id];if(!guide)continue;
   const q=t.generate(7919);
   expect(allowedMethods(guide).some(m=>q.shortcut.startsWith(m)),t.id).toBe(true);
  }
 });
});

describe('메모장 최소 계산식은 실제로 정답이 나오는 식이어야 한다',()=>{
 // 최단풀이 설명과 메모식이 어긋나면 사용자가 둘 중 어느 쪽을 믿어야 할지 알 수 없다.
 // 올림·버림이 필요한 네 유형만 예외다. 메모식은 반올림 전 나눗셈을 보여주고,
 // 각 유형의 최단풀이가 마지막에 올리거나 버리라고 적는다.
 const rounding=new Set(['cost-12','cost-14','ratio-10','ratio-11']);
 for(const t of templates.filter(t=>t.area==='creative'&&!rounding.has(t.id)))
  it(`${t.id} ${t.name}`,()=>{
   for(let s=1;s<=120;s++){const q=t.generate(s*7919);
    expect(close(calculate(q.memo),q.answer),`${q.id} 메모식 ${q.memo} → 정답 ${q.answer}`).toBe(true);}
  });
 it('올림·버림 유형은 메모식이 반올림 전 값이고 최단풀이가 그 처리를 적는다',()=>{
  for(const id of rounding){
   const q=templateById(id)!.generate(7919);
   expect(/올림|버림|버립니다/.test(q.shortcut),`${id} 최단풀이에 올림·버림 안내 없음`).toBe(true);
   expect(()=>calculate(q.memo),`${id} 메모식`).not.toThrow();
  }
 });
});

describe('1.8.0으로 올린 뒤에도 1.7.0 기록을 그대로 재현',()=>{
 it('v17 생성기가 1.7.0 문항을 바이트 단위로 되살린다',()=>{
  for(const t of v17Templates)for(let seed=1;seed<=3;seed++){
   const q=t.generate(seed*179);
   expect(q.generatorVersion,q.id).toBe('1.7.0');
   expect(validate(q),q.id).toEqual([]);
   expect(reproduce(q),q.id).toEqual(q);}
 });
 it('1.7.0 스냅샷의 최단풀이는 현행 표로 교정되고 메모식은 그대로 남는다',()=>{
  const old=v17Templates.find(t=>t.id==='speed-3')!.generate(7919);
  const memo=old.memo,corrected=applyGuidance({...old});
  expect(corrected.memo).toBe(memo);
  expect(allowedMethods(creativeGuidance['speed-3']).some(m=>corrected.shortcut!.startsWith(m))).toBe(true);
  expect(applyGuidance({...corrected})).toEqual(corrected);   // 멱등
 });
});
