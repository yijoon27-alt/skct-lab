import type { Question } from './types';

// Keep canonical question snapshots intact for backup/reproduction.
export function questionPrompt(q: Question): string {
 if(q.diagram)return q.question.split('\n')[0];
 return q.type === 'sequence' && q.generatorVersion === '1.0.0'
  ? `${q.question.split('\n')[0]}\n빈칸에 들어갈 수를 구하세요.`
  : q.question;
}
