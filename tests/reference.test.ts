import { it,expect } from 'vitest';
import { probabilityTemplates,referenceSequenceTemplates } from '../src/engine/reference';
import { generateVerified,makeSet,v11Templates,reproduce,practiceTemplates,templates } from '../src/engine/bank';
import { verifyAnswer,validate } from '../src/engine/verify';
import { calculate } from '../src/engine/math';
import { questionPrompt } from '../src/engine/presentation';
import { emptyStore,parseBackup } from '../src/engine/storage';
import { createSession,grade } from '../src/engine/session';

it('새 17개 유형 17,000사례: 정답·전 항·해설·메모·잘못된 답 차단',()=>{
 for(const t of [...probabilityTemplates,...referenceSequenceTemplates])for(let n=1;n<=1000;n++){
  const q=generateVerified(t,n*4099);expect(calculate(q.memo),q.id).toBeCloseTo(q.answer,8);
  expect(verifyAnswer({...q,answer:q.answer+0.1}),q.id).toBe(false);
  if(q.sequence){const bad=structuredClone(q);bad.sequence![0]+=0.03;expect(verifyAnswer(bad),q.id).toBe(false);}
 }
});
it('기본 혼합 100세트: 수리 조건부 확률·수열 분수/소수/곱/도형 포함, 난도 12:8',()=>{
 for(let seed=1;seed<=100;seed++){
  const c=makeSet({area:'creative',seed});expect(c.some(q=>q.subtype.startsWith('bayes-'))).toBe(true);
  const s=makeSet({area:'sequence',seed});
  for(const id of ['refseq-0','refseq-1','refseq-2','refseq-3','refseq-4','refseq-5','refseq-7','refseq-8','refseq-12','refseq-13'])expect(s.some(q=>q.subtype===id),id).toBe(true);
  expect(s.some(q=>q.diagram)).toBe(true);expect(s.filter(q=>q.difficulty==='hard')).toHaveLength(8);expect(s.filter(q=>q.difficulty==='medium')).toHaveLength(12);
  for(const q of s){expect(questionPrompt(q)).not.toContain(q.rule||'규칙을 찾습니다');expect(questionPrompt(q)).not.toContain(q.category);}
 }
});
it('새 질문 형식 6종과 분수/소수/대분수 표기, 정수·소수 분리의 두 자리 표시',()=>{
 const kinds=new Set<number>();let mixed=false,decimal=false;
 for(const t of referenceSequenceTemplates.filter(t=>!['refseq-10','refseq-11'].includes(t.id)))for(let seed=1;seed<=100;seed++){
  const q=generateVerified(t,seed*4099);kinds.add(q.facts.queryKind);mixed ||= q.question.includes('대분수');decimal ||= /\d+\.\d+/.test(q.question);
  if(q.subtype==='refseq-4')expect(q.question).toMatch(/\d+\.\d{2}/);
  if(['refseq-0','refseq-1'].includes(q.subtype))expect([1,2,4,5]).toContain(q.facts.queryKind);
  if(q.facts.queryKind===4)expect(q.question).toContain('(A)×(B)');if(q.facts.queryKind===5)expect(q.question).toContain('(A)÷(B)');
 }
 expect([...kinds].sort()).toEqual([0,1,2,3,4,5]);expect(mixed&&decimal).toBe(true);
});
it('도형 수치 변조·빈칸 누락 차단, 백업에 그림 데이터 보존',()=>{
 for(const id of ['refseq-10','refseq-11']){
  const q=generateVerified(templates.find(t=>t.id===id)!,4099);const bad=structuredClone(q);bad.diagram!.cells[0][3]!+=1;expect(verifyAnswer(bad)).toBe(false);
  const noBlank=structuredClone(q);noBlank.diagram!.cells[3][3]=q.answer;expect(verifyAnswer(noBlank)).toBe(false);
  const s=emptyStore();s.session=createSession([q],'sequence','card');expect(parseBackup(JSON.stringify(s))).toEqual(s);
  s.session.questions[0]=bad;expect(()=>parseBackup(JSON.stringify(s))).toThrow();
 }
});
it('생성기 1.1.0의 555개와 3버전 혼합 기록 재현',()=>{
 for(const t of v11Templates)for(let seed=1;seed<=5;seed++){const q=t.generate(seed*179);expect(validate(q),q.id).toEqual([]);expect(reproduce(q)).toEqual(q);}
 let store=emptyStore();const old=v11Templates.find(t=>t.id==='seq-16')!.generate(179);store.session=createSession([old],'sequence','card');store=grade(store,store.session,0,old.correctAnswer);
 store.session=createSession(makeSet({area:'sequence',seed:7}),'sequence','card');expect(parseBackup(JSON.stringify(store))).toEqual(store);
 expect(practiceTemplates).toHaveLength(80);expect(templates).toHaveLength(128);
});

it('화면 수열의 분수·대분수·소수 표기가 실제 검산 항과 일치',()=>{
 const read=(s:string)=>{const m=s.match(/^(\d+) (\d+)\/(\d+)$/);if(m)return Number(m[1])+Number(m[2])/Number(m[3]);const f=s.match(/^(-?\d+)\/(\d+)$/);if(f)return Number(f[1])/Number(f[2]);return Number(s);};
 for(const t of referenceSequenceTemplates)for(let seed=1;seed<=100;seed++){
  const q=generateVerified(t,seed*4099);if(!q.sequence)continue;
  const shown=q.question.split('\n')[0].split(', ');
  shown.forEach((value,j)=>{if(['(A)','(B)','…'].includes(value))return;expect(read(value),`${q.id} 표시 ${value}`).toBeCloseTo(q.sequence![j],8);});
 }
});
