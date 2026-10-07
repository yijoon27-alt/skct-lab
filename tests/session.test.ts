import { it,expect } from 'vitest';
import { makeSet,templates } from '../src/engine/bank';
import { emptyStore,parseBackup,csv,saveStore } from '../src/engine/storage';
import { createSession,grade,finish,tick,canMove,getStats,calendarDay } from '../src/engine/session';
const qs=()=>makeSet({area:'creative',seed:200});
it('첫 시도와 재시도 분리 / 중복 채점 방지',()=>{let s=emptyStore();s.session=createSession(qs(),'creative','card');const q=s.session.questions[0];s=grade(s,s.session,0,q.correctAnswer);s=grade(s,s.session!,0,0);expect(s.attempts).toHaveLength(1);s.session=createSession([q],'creative','card',true);s=grade(s,s.session,0,(q.correctAnswer+1)%5);expect(getStats(s.attempts).accuracy).toBe(100);expect(getStats(s.attempts).retry).toHaveLength(1);});
it('실전 이동 제한·답안 잠금·미응답 자동 제출',()=>{let s=emptyStore();s.session=createSession(qs(),'creative','exam');expect(canMove(s.session,1)).toBe(false);s=grade(s,s.session,0,0);s=grade(s,s.session!,0,1);expect(s.session!.answers[qs()[0].id]).toBe(0);s=finish(s,s.session!);expect(s.attempts).toHaveLength(20);expect(s.results).toHaveLength(1);expect(finish(s,s.session!)).toEqual(s);expect(canMove(s.session!,1)).toBe(true);});
it('백그라운드·재시작 타이머는 절대 시각으로 계산',()=>{const s={...createSession(qs(),'creative','exam'),running:true,deadline:10000};expect(tick(s,5000).remaining).toBe(5);expect(tick(s,20000).remaining).toBe(0);expect(calendarDay('2026-10-06T15:01:00.000Z')).toBe('2026-10-07');});
it('백업 왕복·오류 백업 거절·CSV escaping',()=>{const s=emptyStore();s.session=createSession(qs(),'creative','card');expect(parseBackup(JSON.stringify(s))).toEqual(s);const retryStore=grade(s,s.session!,0,0);const badRetry=structuredClone(retryStore);badRetry.attempts.push({...badRetry.attempts[0],id:'bad-first'});expect(parseBackup(JSON.stringify(badRetry)).attempts[1].first).toBe(false);expect(()=>parseBackup('{"version":8}')).toThrow();const wrong=structuredClone(s);wrong.session!.questions[0].answer++;expect(()=>parseBackup(JSON.stringify(wrong))).toThrow();const graded=grade(s,s.session!,0,0);graded.attempts[0].note='=HYPERLINK("test")';expect(csv(graded)).toContain("'=HYPERLINK");graded.notes[graded.attempts[0].question.id]='최신 개인 풀이법';expect(csv(graded)).toContain('최신 개인 풀이법');});
it('저장 실패는 사용자에게 반환',()=>{expect(saveStore(emptyStore())).toContain('저장');});

it('다른 시드·선지 순서라도 같은 숫자 조건은 재도전으로 집계',()=>{
 const t=templates[0],seen=new Map<string,ReturnType<typeof t.generate>>();let pair:ReturnType<typeof t.generate>[]=[];
 for(let seed=1;seed<=200;seed++){const q=t.generate(seed),old=seen.get(q.question);if(old){pair=[old,q];break;}seen.set(q.question,q);}
 expect(pair).toHaveLength(2);expect(pair[0].id).not.toBe(pair[1].id);
 let s=emptyStore();for(const q of pair){s.session=createSession([q],q.type,'card');s=grade(s,s.session,0,q.correctAnswer);}
 expect(getStats(s.attempts).first).toHaveLength(1);expect(getStats(s.attempts).retry).toHaveLength(1);expect(parseBackup(JSON.stringify(s)).attempts[1].first).toBe(false);
});
