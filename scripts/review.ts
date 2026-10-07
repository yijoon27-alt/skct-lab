import { writeFileSync } from 'node:fs';
import { templates,generateVerified } from '../src/engine/bank';
// Review pack is generated privately and contains only independently authored questions.
const lines=['# 사람 검토용 샘플','',`총 ${templates.length}개 유형, 유형당 5문항. 자동 검산 통과는 사람 검토 완료를 뜻하지 않습니다.`,'','각 문항을 직접 풀고 문장 조건·단위·자연스러운 유일성·난도·최단풀이를 확인하세요.'];
for(const t of templates){lines.push(`\n## ${t.id} · ${t.name} (${t.difficulty})`);for(let i=1;i<=5;i++){const q=generateVerified(t,i*179);lines.push(`\n### ${q.id}`,q.question,'',q.options.map((s,j)=>`${j+1}. ${s}`).join('\n'),'',`정답: ${q.correctAnswer+1} · ${q.options[q.correctAnswer]}`,`검산식: ${q.memo}`,`해설: ${q.explanation}`,`최단풀이: ${q.shortcut}`,'검토: [ ] 직접 계산 [ ] 전제 [ ] 유일성 [ ] 난도 [ ] 해설');}}
writeFileSync('docs/review-samples.md',lines.join('\n'));
console.log(`${templates.length*5}개 자체 제작 검토 샘플 → docs/review-samples.md`);
