import { expect,it } from 'vitest';
import { questionPrompt } from '../src/engine/presentation';
import { templates } from '../src/engine/bank';
it('유형·규칙은 문제 표시에서 숨기고 저장된 원문·해설은 보존',()=>{
 const q=templates.find(t=>t.id==='seq-16')!.generate(77);
 const original=q.question;
 expect(questionPrompt(q)).not.toContain(q.rule);
 expect(questionPrompt(q)).not.toContain('등차');
 expect(questionPrompt(q)).toContain(q.question.split('\n')[0]);
 expect(q.question).toBe(original);
 const creative=templates[0].generate(77);expect(questionPrompt(creative)).toBe(creative.question);
});
