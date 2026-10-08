import { describe,expect,it } from 'vitest';
import { creativeTemplates } from '../src/engine/creative';
import { templates,templateById,v12Templates,v13Templates,v14Templates,v15Templates,reproduce } from '../src/engine/bank';
import { creativeGuidance,guidanceErrors,applyGuidance } from '../src/engine/guidance';
import { validate } from '../src/engine/verify';
import { eul,particleErrors,ro,wa } from '../src/engine/korean';
import { calculate,format,legacyFormat } from '../src/engine/math';
import { emptyStore,parseBackup } from '../src/engine/storage';
import { createSession,grade } from '../src/engine/session';
describe('유형 = 핵심 공식 = 인식 신호 = 최단풀이',()=>{
 it('창의수리 86개 유형이 빠짐없이, 그리고 그만큼만 해설 표에 등록',()=>{
  expect([...Object.keys(creativeGuidance)].sort()).toEqual(creativeTemplates.map(t=>t.id).sort());
 });
 it('138개 유형 × 50시드의 해설 메타데이터·문장 조사·문항 분류가 유형과 일치',()=>{
  for(const t of templates)for(let s=1;s<=50;s++){
   const q=t.generate(s*4099);
   expect(guidanceErrors(q),q.id).toEqual([]);
   expect(particleErrors(q.question),q.id).toEqual([]);
   expect([q.category,q.difficulty,q.type],q.id).toEqual([t.category,t.difficulty,t.area]);
   expect(()=>calculate(q.memo),`${q.id} 메모식`).not.toThrow();
   if(q.type==='creative')expect(q.memo,`${q.id} 메모식`).not.toBe(format(q.answer));
  }
 });
 it('다른 유형의 해설을 붙이면 출제 전에 걸러짐',()=>{
  const q=templateById('ratio-12')!.generate(7919);
  expect(validate(q)).toEqual([]);
  expect(validate({...q,keyFormula:creativeGuidance['ratio-3'].formula})).toContain('유형과 핵심 공식 불일치');
  expect(validate({...q,signal:creativeGuidance['ratio-8'].signal})).toContain('유형과 인식 신호 불일치');
  expect(validate({...q,shortcut:`${creativeGuidance['ratio-9'].method} 메모장 계산식: ${q.memo}`})).toContain('유형과 최단풀이 불일치');
  expect(validate({...q,keyFormula:'전체 합 = 각 집단 인원 × 평균의 합'})).toContain('다른 유형의 해설 어휘: 평균');
  expect(validate({...q,memo:format(q.answer)})).toContain('메모장 식이 정답 숫자 그 자체');
  expect(validate({...q,signal:''})).toContain('인식 신호 누락');
  expect(validate({...q,question:'13로 나눈 나머지가 6인 가장 작은 양의 정수는?'}).join(' ')).toContain('조사 오류');
 });
});
describe('한국어 조사',()=>{
 it.each([[3,'으로'],[5,'로'],[7,'로'],[11,'로'],[13,'으로'],[17,'로'],[10,'으로'],[100,'으로']])('%i → %s 나눈',(n,particle)=>expect(ro(n)).toBe(particle));
 it.each([[6,'과'],[8,'과'],[10,'과'],[12,'와'],[14,'와'],[16,'과']])('%i → %s',(n,particle)=>expect(wa(n)).toBe(particle));
 it('받침에 따라 을·를을 고름',()=>{expect(eul('터널')).toBe('을');expect(eul('다리')).toBe('를');});
 it('숫자에 붙은 조사만 검사하므로 서술형 문장은 오탐하지 않음',()=>{
  expect(particleErrors('13로 나눈 나머지')).toHaveLength(1);
  expect(particleErrors('13으로 나눈 나머지')).toEqual([]);
  expect(particleErrors('6와 9의 최소공배수')).toHaveLength(1);
  expect(particleErrors('속력비는 4:5이다. 있는 값은 2가지를 넘는다.')).toEqual([]);
 });
});
it('나머지 조건은 큰 나누는 수보다 큰 답만 출제하고 나머지가 0인 조건을 쓰지 않음',()=>{
 const t=templateById('ratio-12')!;
 for(let s=1;s<=200;s++){
  const q=t.generate(s*7919);
  expect(q.answer,q.id).toBeGreaterThan(q.facts.mod2);
  expect(Math.min(q.facts.rem1,q.facts.rem2),q.id).toBeGreaterThanOrEqual(1);
  expect(q.answer%q.facts.mod1,q.id).toBe(q.facts.rem1);
  expect(q.answer%q.facts.mod2,q.id).toBe(q.facts.rem2);
 }
});
it('소수점 오차가 섞인 정수를 42/1로 표시하지 않고 구버전 표기는 그대로 재현',()=>{
 const noisy=560/(48/3.6);
 expect(Number.isInteger(noisy)).toBe(false);
 expect(format(noisy)).toBe('42');
 expect(legacyFormat(noisy)).toBe('42/1');
 expect(format(1/3)).toBe('1/3');
 for(const t of templates)for(let s=1;s<=50;s++)for(const option of t.generate(s*4099).options)expect(option,t.id).not.toMatch(/\/1(\s|$)/);
});
it('구버전 기록의 해설만 유형에 맞게 고치고 정답·선지·문장·채점은 그대로 유지',()=>{
 const old=v12Templates.find(t=>t.id==='ratio-12')!.generate(7919);
 expect(old.keyFormula).toBe('전체 합 = 각 집단 인원 × 평균의 합');
 let s=emptyStore();s.session=createSession([old],'creative','card');
 s=grade(s,s.session!,0,(old.correctAnswer+1)%5);
 const restored=parseBackup(JSON.stringify(s));
 const q=restored.attempts[0].question;
 expect(q.keyFormula).toBe(creativeGuidance['ratio-12'].formula);
 expect(q.signal).toBe(creativeGuidance['ratio-12'].signal);
 expect(q.shortcut.startsWith(creativeGuidance['ratio-12'].method)).toBe(true);
 expect([q.question,q.options,q.optionValues,q.answer,q.correctAnswer,q.seed,q.generatorVersion,q.explanation,q.steps,q.memo])
  .toEqual([old.question,old.options,old.optionValues,old.answer,old.correctAnswer,old.seed,'1.2.0',old.explanation,old.steps,old.memo]);
 expect([restored.attempts[0].correct,restored.attempts[0].selected]).toEqual([false,(old.correctAnswer+1)%5]);
 expect(parseBackup(JSON.stringify(restored))).toEqual(restored);
});
it('1.2.0 생성기 128개를 그대로 보존해 과거 기록을 재현',()=>{
 expect(v12Templates).toHaveLength(128);
 for(const t of v12Templates)for(let seed=1;seed<=5;seed++){
  const q=t.generate(seed*179);
  expect(q.generatorVersion,q.id).toBe('1.2.0');
  expect(validate(q),q.id).toEqual([]);
  expect(reproduce(q)).toEqual(q);
 }
 expect(applyGuidance(templateById('ratio-12')!.generate(7919))).toEqual(templateById('ratio-12')!.generate(7919));
});
it('1.3.0 생성기 128개를 그대로 보존해 과거 기록을 재현',()=>{
 expect(v13Templates).toHaveLength(128);
 for(const t of v13Templates)for(let seed=1;seed<=5;seed++){
  const q=t.generate(seed*179);
  expect(q.generatorVersion,q.id).toBe('1.3.0');
  expect(validate(q),q.id).toEqual([]);
  expect(reproduce(q)).toEqual(q);
 }
});
it('1.4.0 생성기 138개를 그대로 보존해 과거 기록을 재현',()=>{
 expect(v14Templates).toHaveLength(138);
 for(const t of v14Templates)for(let seed=1;seed<=4;seed++){
  const q=t.generate(seed*179);
  expect(q.generatorVersion,q.id).toBe('1.4.0');
  expect(validate(q),q.id).toEqual([]);
  expect(reproduce(q)).toEqual(q);
 }
});
it('1.5.0 생성기 138개를 그대로 보존해 과거 기록을 재현',()=>{
 expect(v15Templates).toHaveLength(138);
 for(const t of v15Templates)for(let seed=1;seed<=4;seed++){
  const q=t.generate(seed*179);
  expect(q.generatorVersion,q.id).toBe('1.5.0');
  expect(validate(q),q.id).toEqual([]);
  expect(reproduce(q)).toEqual(q);
 }
});
