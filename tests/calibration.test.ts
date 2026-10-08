import { expect,it } from 'vitest';
import { practiceTemplates,legacyTemplates,generateVerified,makeSet,reproduce } from '../src/engine/bank';
import { validate } from '../src/engine/verify';
import { calculate } from '../src/engine/math';
import { calibrationErrors } from '../src/engine/calibration';
import { applyGuidance } from '../src/engine/guidance';
import { emptyStore,parseBackup } from '../src/engine/storage';
import { createSession,grade,getStats,finish,revealSolution } from '../src/engine/session';
it('신규 출제 45,000개는 숫자 규모·분모 기준 및 독립 검산을 통과',()=>{
 for(const t of practiceTemplates)for(let seed=1;seed<=500;seed++){const q=generateVerified(t,seed*7919);expect(calibrationErrors(q),q.id).toEqual([]);expect(q.generatorVersion).toBe('1.5.0');}
});
it('단순히 큰 숫자를 쓰는 문항은 런타임 출제에서 차단',()=>{
 const q=generateVerified(practiceTemplates.find(t=>t.id==='count-4')!,79);
 expect(calibrationErrors({...q,optionValues:[6000,...q.optionValues.slice(1)]})).toContain('경우의 수 계산 규모 초과');
 expect(calibrationErrors({...q,optionValues:[1/2501,...q.optionValues.slice(1)]})).toContain('분수 분모 계산 규모 초과');
});
it('수열 질문은 중간 빈칸·합·차·먼 항을 모두 제공하며 최소 메모식으로 검산 가능',()=>{
 const kinds=new Set<number>();
 for(const t of practiceTemplates.filter(t=>t.area==='sequence'))for(let seed=1;seed<=30;seed++){
  const q=generateVerified(t,seed*179);if(q.sequence)kinds.add(q.facts.queryKind);
  expect(q.question).not.toContain(q.rule);expect(calculate(q.memo)).toBeCloseTo(q.answer);
  if(q.facts.queryKind===1)expect(q.question).toContain('(A)+(B)');
  if(q.facts.queryKind===2)expect(q.question).toContain('(B)−(A)');
  const bad=structuredClone(q);if(q.sequence){bad.facts.indexA=99;expect(validate(bad)).toContain('독립 조건 검산 실패');}
 }expect([...kinds].sort()).toEqual([0,1,2,3,4,5]);
});
it('구버전 생성기 555개 및 구·신 문항 혼합 백업을 계속 복원',()=>{
 for(const t of legacyTemplates)for(let seed=1;seed<=5;seed++){const q=t.generate(seed*179);expect(validate(q),q.id).toEqual([]);expect(reproduce(q)).toEqual(q);}
 let s=emptyStore();const q=legacyTemplates.find(t=>t.id==='count-4')!.generate(179);s.session=createSession([q],'creative','card');s=grade(s,s.session,0,q.correctAnswer);
 s.session=createSession(makeSet({area:'sequence',seed:123}),'sequence','card');s.favorites=[legacyTemplates.find(t=>t.id==='seq-16')!.generate(179)];
 const restored=parseBackup(JSON.stringify(s));
 // 복원 시 구버전 스냅샷의 해설 메타데이터만 현행 유형 표로 교정되고 나머지는 그대로 남는다.
 for(const q of [...s.attempts.map(a=>a.question),...s.favorites,...(s.session?.questions||[])])applyGuidance(q);
 expect(restored).toEqual(s);
});
it('풀이 보기 즉시 열람·답안 미채점·열람 후 정답률 제외·실전 차단·백업 복원',()=>{
 let s=emptyStore();s.session=createSession(makeSet({area:'creative',seed:12}),'creative','card');const q=s.session.questions[0];
 s=revealSolution(s);expect(s.session!.revealed).toEqual([q.id]);expect(s.attempts).toHaveLength(0);expect(s.session!.answers).toEqual({});
 s=grade(s,s.session!,0,q.correctAnswer);expect(s.attempts[0].assisted).toBe(true);expect(getStats(s.attempts).first).toHaveLength(0);expect(getStats(s.attempts).assisted).toHaveLength(1);
 s=finish(s,s.session!);expect(s.results[0].assisted).toBe(1);expect(parseBackup(JSON.stringify(s))).toEqual(s);
 s.session=createSession([q],'creative','exam');expect(revealSolution(s)).toBe(s);
});
