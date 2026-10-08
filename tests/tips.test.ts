import { describe,expect,it } from 'vitest';
import { makeSet,practiceTemplates,templates,templateById } from '../src/engine/bank';
import { creativeGuidance } from '../src/engine/guidance';
import { tipGroups,tipGuidance,weakTips } from '../src/engine/tips';
import { emptyStore } from '../src/engine/storage';
import { createSession,grade } from '../src/engine/session';
describe('유형별 공식 정리',()=>{
 const all=tipGroups().flatMap(g=>g.tips);
 it('138개 유형이 중복 없이 한 번씩만 실린다',()=>{
  expect(all.map(t=>t.id).sort()).toEqual(templates.map(t=>t.id).sort());
 });
 it('공식·신호·최단풀이가 빈 칸 없이 채워져 있고 분류가 템플릿과 일치',()=>{
  for(const tip of all){
   const t=templateById(tip.id)!;
   expect([tip.name,tip.area,tip.category,tip.difficulty],tip.id).toEqual([t.name,t.area,t.category,t.difficulty]);
   expect(tip.inPool,tip.id).toBe(practiceTemplates.some(p=>p.id===tip.id));
   for(const [label,value] of [['공식',tip.formula],['신호',tip.signal],['최단풀이',tip.method]] as const)
    expect(value.trim().length,`${tip.id} ${label}`).toBeGreaterThan(0);
  }
 });
 it('창의수리 86개의 공식·신호는 문항 해설과 같은 표를 쓴다',()=>{
  for(const [id,guide] of Object.entries(creativeGuidance))
   expect(tipGuidance[id],id).toEqual(guide);
 });
 // 수열·조건부 확률은 생성기가 시드마다 문구를 조립한다. 시드와 무관한 공식만 골라 생성기 값과 대조해,
 // 팁과 실제 해설이 갈라지면 테스트가 먼저 실패하게 한다.
 it('수열·조건부 확률의 공식이 생성기가 쓰는 문구와 일치',()=>{
  let compared=0;
  for(const t of templates){
   if(creativeGuidance[t.id])continue;
   const a=t.generate(7919),b=t.generate(31676);
   if(a.keyFormula!==b.keyFormula)continue;
   expect(tipGuidance[t.id].formula,t.id).toBe(a.keyFormula);
   compared++;
  }
  expect(compared).toBeGreaterThanOrEqual(40);
 });
});
it('연습 가능한 유형으로 표시된 것은 실제로 그 유형만 출제된다',()=>{
 const pool=tipGroups().flatMap(g=>g.tips).filter(t=>t.inPool);
 expect(pool).toHaveLength(90);
 for(const t of [pool[0],pool[Math.floor(pool.length/2)],pool.at(-1)!]){
  const qs=makeSet({area:t.area,subtypes:[t.id],seed:31676,count:3});
  expect(qs.every(q=>q.subtype===t.id),t.id).toBe(true);
 }
});
it('자주 틀리는 유형은 첫 시도 기록만으로, 정답률이 낮은 순으로 고른다',()=>{
 const weak=templateById('ratio-12')!,strong=templateById('mix-6')!;
 let store=emptyStore();
 const wrong=[weak.generate(11),weak.generate(22),weak.generate(33)];
 const right=[strong.generate(11),strong.generate(22)];
 for(const q of [...wrong,...right]){
  store.session=createSession([q],'creative','card');
  const miss=wrong.includes(q);
  store=grade(store,store.session,0,miss?(q.correctAnswer+1)%5:q.correctAnswer);
 }
 const tips=weakTips(store.attempts);
 expect(tips[0].id).toBe('ratio-12');
 expect(tips[0].accuracy).toBe(0);
 expect(tips[0].total).toBe(3);
 expect(tips[0].formula).toBe(creativeGuidance['ratio-12'].formula);
 expect(tips.map(t=>t.id)).not.toContain('mix-6');
 expect(weakTips(emptyStore().attempts)).toEqual([]);
});
