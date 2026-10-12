import { test,expect } from './fixture';
import { GENERATOR_VERSION } from '../../src/engine/build';
const key='skct-lab:v1';
test.beforeEach(async({page})=>{await page.goto('/');});
test('학습·메모·계산기·오답·기록 복원',async({page})=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
 await page.getByRole('button',{name:'시작',exact:true}).click();await page.getByRole('textbox',{name:'문제별 메모장'}).fill('선두거리 ÷ 속력차');
 await page.getByRole('textbox',{name:'계산식'}).fill('(1+2)*3.5');await page.getByRole('textbox',{name:'계산식'}).press('Enter');await expect(page.getByLabel('계산 결과')).toHaveText('10.5');
 const answer=await page.evaluate(key=>JSON.parse(localStorage.getItem(key)!).session.questions[0].correctAnswer,key);await page.getByRole('radio').nth((answer+1)%5).click();await page.getByRole('button',{name:/정답 제출/}).click();await expect(page.getByText('오답 · 풀이를 확인해보세요',{exact:false})).toBeVisible();
 await page.reload();await expect(page.getByRole('textbox',{name:'문제별 메모장'})).toHaveValue('선두거리 ÷ 속력차');await expect(page.getByText('오답 · 풀이를 확인해보세요',{exact:false})).toBeVisible();
 await page.getByRole('button',{name:'오답노트',exact:false}).first().click();await expect(page.getByRole('button',{name:'이 문제 다시 풀기'})).toBeVisible();expect(errors).toEqual([]);
});
test('실전 잠금·이전 이동 금지·종료 후 해설',async({page})=>{
 await page.getByRole('button',{name:'SKCT LAB',exact:false}).click();await page.getByRole('button',{name:'실전 시작'}).first().click();await page.getByRole('button',{name:'시작',exact:true}).click();await page.getByRole('radio').nth(0).click();await page.getByRole('button',{name:/정답 제출/}).click();
 await expect(page.getByText('답안이 잠겼습니다.',{exact:false})).toBeVisible();await expect(page.getByText('SKCT 최단풀이',{exact:true})).not.toBeVisible();await expect(page.getByRole('radio').nth(1)).toBeDisabled();await page.getByRole('button',{name:'다음 문제',exact:false}).click();await expect(page.getByRole('button',{name:'이전',exact:false}).first()).toBeDisabled();await page.getByRole('button',{name:'제출하기',exact:true}).click();await page.getByRole('dialog').getByRole('button',{name:'제출하기',exact:true}).click();await expect(page.getByText('SESSION COMPLETE')).toBeVisible();await expect(page.getByText('SKCT 최단풀이',{exact:true})).toBeVisible();
});
test('단축키·입력 격리·자동 다음',async({page})=>{
 await page.getByRole('button',{name:'시작',exact:true}).click();await page.keyboard.press('m');await expect(page.getByRole('textbox',{name:'문제별 메모장'})).toBeFocused();await page.keyboard.type('12345');await expect(page.getByRole('radio').first()).toHaveAttribute('aria-checked','false');await page.getByRole('heading',{level:1}).click();const answer=await page.evaluate(key=>JSON.parse(localStorage.getItem(key)!).session.questions[0].correctAnswer,key);await page.getByLabel('정답이면 자동 다음').check();await page.getByRole('heading',{level:1}).click();await page.keyboard.press(String(answer+1));await page.keyboard.press('Enter');await expect(page.locator('.question-count')).toHaveText('02 / 20');
});
test('넘패드는 계산기 전용 · 상단 숫자열은 보기 선택',async({page})=>{
 // Playwright의 Numpad* 키는 NumLock이 꺼진 넘패드를 모사한다(e.code는 Numpad5, e.key는 'Clear').
 // 그래서 e.code로 판별하는지와 연타 중 글자를 잃지 않는지를 함께 고정한다.
 await page.getByRole('button',{name:'시작',exact:true}).click();await page.getByRole('heading',{level:1}).click();
 for(const k of ['Numpad1','Numpad2','NumpadAdd','Numpad3','NumpadMultiply','Numpad4','NumpadDecimal','Numpad5','NumpadDivide','Numpad9'])await page.keyboard.press(k);
 await expect(page.getByRole('textbox',{name:'계산식'})).toHaveValue('12+3*4.5/9');await expect(page.getByRole('textbox',{name:'계산식'})).toBeFocused();
 await expect(page.locator('.toast')).toContainText('Num Lock');
 await page.keyboard.press('NumpadEnter');await expect(page.getByLabel('계산 결과')).toHaveText('13.5');
 for(let i=0;i<5;i++)await expect(page.getByRole('radio').nth(i)).toHaveAttribute('aria-checked','false');
 await page.keyboard.press('Escape');await expect(page.getByRole('textbox',{name:'계산식'})).not.toBeFocused();
 await page.keyboard.press('3');await expect(page.getByRole('radio').nth(2)).toHaveAttribute('aria-checked','true');
 await page.keyboard.press('m');await expect(page.getByRole('textbox',{name:'문제별 메모장'})).toBeFocused();
 await page.keyboard.press('Numpad7');await expect(page.getByRole('textbox',{name:'문제별 메모장'})).toHaveValue('');
 await page.keyboard.type('7');await expect(page.getByRole('textbox',{name:'문제별 메모장'})).toHaveValue('7');await expect(page.getByRole('textbox',{name:'계산식'})).toHaveValue('12+3*4.5/9');
});
// Playwright의 Numpad* 키는 NumLock 꺼진 상태만 모사하므로, 켜진 상태(e.key가 실제 문자)는
// 합성 KeyboardEvent로 확인한다. 브라우저 기본 문자 삽입은 일어나지 않지만 핸들러 계약은 그대로 고정된다.
test('NumLock 켜진 넘패드 · 애플 키패드 Clear와 =',async({page})=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
await page.getByRole('button',{name:'시작',exact:true}).click();
 await page.getByRole('heading',{level:1}).click();
 const send=(pairs:[string,string][])=>page.evaluate(ps=>{for(const [code,key] of ps)(document.activeElement||document.body).dispatchEvent(new KeyboardEvent('keydown',{code,key,bubbles:true,cancelable:true}));},pairs);
 // NumLock 켜짐: e.key가 실제 문자다.
 await send([['Numpad5','5'],['Numpad0','0'],['NumpadSubtract','-'],['Numpad8','8'],['NumpadDecimal','.'],['Numpad5','5']]);
 await expect(page.getByRole('textbox',{name:'계산식'})).toHaveValue('50-8.5');
 await expect(page.locator('.toast')).toHaveCount(0);           // NumLock 켜짐이면 안내하지 않는다
 await send([['NumpadEnter','Enter']]);
 await expect(page.getByLabel('계산 결과')).toHaveText('41.5');
 await send([['NumLock','Clear']]);                              // 애플 키패드 Clear
 await expect(page.getByRole('textbox',{name:'계산식'})).toHaveValue('');
 await expect(page.getByLabel('계산 결과')).toHaveText('0');
 for(let i=0;i<5;i++)await expect(page.getByRole('radio').nth(i)).toHaveAttribute('aria-checked','false');
 // 애플 키패드 =는 계산을 실행한다. 리터럴 '='로 들어가면 파서가 식 전체를 거부한다.
 await send([['Numpad2','2'],['NumpadAdd','+'],['Numpad2','2'],['NumpadEqual','=']]);
 await expect(page.getByRole('textbox',{name:'계산식'})).toHaveValue('2+2');await expect(page.getByLabel('계산 결과')).toHaveText('4');
 expect(errors).toEqual([]);
});
test('모바일·다크모드·계산오류·넘침',async({page})=>{
 await page.setViewportSize({width:390,height:844});await page.getByRole('button',{name:'다크 모드',exact:true}).click();await expect(page.locator('html')).toHaveAttribute('data-theme','dark');await page.getByRole('textbox',{name:'문제별 메모장'}).scrollIntoViewIfNeeded();await expect(page.getByRole('textbox',{name:'문제별 메모장'})).toBeVisible();await page.getByRole('textbox',{name:'계산식'}).fill('1/0');await page.getByRole('textbox',{name:'계산식'}).press('Enter');await expect(page.getByLabel('계산 결과')).toContainText('0으로');expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);await page.screenshot({path:'docs/mobile.png',fullPage:true});
});
test('실전 만료·새로고침 자동 제출',async({page})=>{
 await page.getByRole('button',{name:'SKCT LAB',exact:false}).click();await page.getByRole('button',{name:'실전 시작'}).last().click();await page.getByRole('button',{name:'시작',exact:true}).click();await page.evaluate(key=>{const x=JSON.parse(localStorage.getItem(key)!);x.session.deadline=Date.now()-1000;localStorage.setItem(key,JSON.stringify(x));},key);await page.reload();await expect(page.getByText('SESSION COMPLETE')).toBeVisible();
});
test('백업·가져오기·통계',async({page})=>{
 const promise=page.waitForEvent('download');await page.getByRole('button',{name:'JSON 백업'}).click();const dl=await promise;await dl.saveAs('test-results/backup.json');await page.locator('input[type=file]').setInputFiles({name:'bad.json',mimeType:'application/json',buffer:Buffer.from('{"version":7}')});await expect(page.locator('.toast')).toContainText('지원하지 않는');await page.locator('input[type=file]').setInputFiles('test-results/backup.json');await page.getByRole('button',{name:'현재 백업 후 복원'}).click();await expect(page.locator('.toast')).toContainText('복원');await page.getByRole('button',{name:'나의 학습 통계'}).click();await expect(page.getByRole('heading',{name:'유형별 정답률'})).toBeVisible();
});
test('데스크톱·신고·문제은행',async({page})=>{
 await page.setViewportSize({width:1440,height:1100});await page.getByRole('button',{name:'시작',exact:true}).click();await page.getByRole('button',{name:'문제 신고',exact:true}).click();await page.getByPlaceholder('어떤 조건이나 풀이가 잘못되었는지 남겨주세요.').fill('검토 요청');await page.getByRole('button',{name:'신고 저장'}).click();const reports=await page.evaluate(key=>JSON.parse(localStorage.getItem(key)!).reports,key);expect(reports[0].question.seed).toBeGreaterThan(0);expect(reports[0].question.generatorVersion).toBe(GENERATOR_VERSION);const correct=await page.evaluate(key=>JSON.parse(localStorage.getItem(key)!).session.questions[0].correctAnswer,key);await page.getByRole('radio').nth((correct+1)%5).click();await page.getByRole('button',{name:/정답 제출/}).click();await page.screenshot({path:'docs/desktop.png',fullPage:true});await page.getByRole('button',{name:'문제은행',exact:true}).click();await page.getByRole('textbox',{name:'문제 유형 검색'}).fill('선출발');await expect(page.getByRole('button',{name:'문제 보기',exact:true})).toHaveCount(1);
});
test('집중훈련·20문항 이동·분수·모바일 도구 접근',async({page})=>{
 await page.getByRole('button',{name:'유형별 집중 훈련',exact:true}).click();await page.getByRole('combobox',{name:'시험 영역',exact:true}).selectOption('sequence');await page.getByRole('button',{name:'분자·분모 독립 규칙',exact:false}).click();await page.getByRole('button',{name:'새 문제 20개 시작',exact:false}).click();await page.getByRole('button',{name:'시작',exact:true}).click();
 for(let i=0;i<20;i++){await page.getByRole('button',{name:`${i+1}번 문제`,exact:true}).click();await expect(page.locator('.question-count')).toHaveText(`${String(i+1).padStart(2,'0')} / 20`);await expect(page.getByRole('radio')).toHaveCount(5);}
 await page.setViewportSize({width:390,height:844});await page.getByRole('button',{name:'메모장',exact:true}).click();await expect(page.getByRole('textbox',{name:'문제별 메모장'})).toBeFocused();await page.getByRole('button',{name:'계산기',exact:true}).click();await expect(page.getByRole('textbox',{name:'계산식'})).toBeFocused();
});
test('개발 전용 검토실·초안 검증·승인·삭제',async({page})=>{
 test.skip(!!process.env.SKCT_STATIC_TEST,'개발 환경 전용 컴포넌트는 프로덕션 빌드에 없습니다.');
 await page.getByRole('button',{name:'개발자 검토실',exact:true}).click();await page.getByLabel('문제',{exact:true}).fill('0에 1을 더하면 얼마인가?');for(let i=0;i<5;i++)await page.getByRole('textbox',{name:`${i+1}번 선지`}).fill(String(i+1));await page.getByLabel('정답 계산식').fill('0+1');await page.getByLabel('해설',{exact:true}).fill('0+1=1이므로 정답은 1이다.');await page.getByRole('button',{name:'자동 수식 검사'}).click();await expect(page.getByText('수식과 선지 검사 통과.',{exact:false})).toBeVisible();await page.getByLabel('문장 조건·유일성·해설을 직접 검토했습니다.').check();await page.getByRole('button',{name:'검토 승인',exact:true}).click();await page.getByRole('button',{name:'초안 저장',exact:true}).click();const drafts=await page.evaluate(key=>JSON.parse(localStorage.getItem(key)!).drafts,key);expect(drafts[0].status).toBe('approved');await page.getByRole('button',{name:'삭제',exact:true}).click();await expect(page.getByText('0에 1을 더하면 얼마인가? · approved')).not.toBeVisible();
});

test('보기 클릭으로 시작·일시정지 후 선택 재개·풀이 전 유형 힌트 없음',async({page})=>{
 await expect(page.getByRole('radio').first()).toBeEnabled();
 await page.getByRole('radio').nth(1).click();
 await expect(page.getByRole('radio').nth(1)).toHaveAttribute('aria-checked','true');
 await expect(page.getByRole('button',{name:'일시정지',exact:false})).toBeVisible();
 await page.getByRole('button',{name:'일시정지',exact:false}).click();
 await page.getByRole('radio').nth(2).click();
 await expect(page.getByRole('radio').nth(2)).toHaveAttribute('aria-checked','true');
 await expect(page.getByRole('button',{name:'정답 제출',exact:false})).toBeEnabled();
 await page.getByRole('button',{name:'유형별 집중 훈련',exact:true}).click();
 await page.getByRole('combobox',{name:'시험 영역',exact:true}).selectOption('sequence');
 await page.getByRole('button',{name:'분자·분모 독립 규칙',exact:false}).click();
 await page.getByRole('button',{name:'새 문제 20개 시작',exact:false}).click();
 await page.getByRole('button',{name:'마치고 새로 시작',exact:true}).click();
 await expect(page.locator('.question-meta')).not.toContainText('분자');
 await expect(page.locator('.question-meta')).not.toContainText('Hard');
 await expect(page.locator('.question-text')).not.toContainText('규칙');
 await expect(page.locator('.question-text')).not.toContainText('등차');
 const correct=await page.evaluate(()=>JSON.parse(localStorage.getItem('skct-lab:v1')!).session.questions[0].correctAnswer);
 await page.getByRole('radio').nth((correct+1)%5).click();
 await page.getByRole('button',{name:'정답 제출',exact:false}).click();
 await expect(page.locator('.explanation')).toContainText('분자·분모 독립 규칙');
 await expect(page.locator('.explanation')).toContainText('규칙 ·');
});

test('답을 고르지 않고 풀이 즉시 보기·메모 식 사용·보조 학습 통계 분리',async({page})=>{
 await page.getByLabel('정답이면 자동 다음').uncheck();
 await page.getByRole('button',{name:'풀이 보기',exact:true}).click();
 await expect(page.locator('.explanation')).toBeVisible();
 await expect(page.getByText('풀이 열람 · 정답률 집계에서 제외')).toBeVisible();
 let snapshot=await page.evaluate(()=>JSON.parse(localStorage.getItem('skct-lab:v1')!));
 expect(snapshot.attempts).toHaveLength(0);
 expect(snapshot.session.answers).toEqual({});
 const q=snapshot.session.questions[0];
 await page.getByRole('button',{name:'다음 문제',exact:false}).click();await expect(page.locator('.question-count')).toHaveText('02 / 20');await page.getByRole('button',{name:'1번 문제',exact:true}).click();await expect(page.locator('.explanation')).toBeVisible();
 await page.getByRole('button',{name:'이 식을 메모장에 넣기',exact:true}).click();
 await expect(page.getByRole('textbox',{name:'문제별 메모장'})).toHaveValue(q.memo);
 await expect(page.getByRole('textbox',{name:'문제별 메모장'})).toBeFocused();
 await page.getByRole('radio').nth(q.correctAnswer).click();
 await page.getByRole('button',{name:'정답 제출',exact:false}).click();
 snapshot=await page.evaluate(()=>JSON.parse(localStorage.getItem('skct-lab:v1')!));
 expect(snapshot.attempts[0].assisted).toBe(true);
 await page.reload();await expect(page.locator('.explanation')).toBeVisible();
 await page.getByRole('button',{name:'나의 학습 통계',exact:true}).click();
 await expect(page.getByText('풀이를 본 뒤 답한 1개 문항은 정답률에서 제외합니다.',{exact:false})).toBeVisible();
 await page.getByRole('button',{name:'SKCT LAB',exact:false}).click();
 await page.getByRole('button',{name:'실전 시작'}).first().click();
 await page.getByRole('button',{name:'마치고 새로 시작',exact:true}).click();
 await expect(page.getByRole('button',{name:'풀이 보기',exact:true})).toHaveCount(0);
});

test('수리·수열 문제 이동·번호 이동·자동 다음에서 계산기 초기화와 메모 보존',async({page})=>{
 await page.getByRole('textbox',{name:'문제별 메모장'}).fill('1번 문제 개인 메모');
 await page.getByRole('textbox',{name:'계산식'}).fill('12*3');await page.getByRole('textbox',{name:'계산식'}).press('Enter');await expect(page.getByLabel('계산 결과')).toHaveText('36');
 await page.getByRole('button',{name:'시작',exact:true}).click();
 await page.getByRole('button',{name:'건너뛰기',exact:false}).click();
 await expect(page.getByRole('textbox',{name:'계산식'})).toHaveValue('');await expect(page.getByLabel('계산 결과')).toHaveText('0');
 await page.getByRole('textbox',{name:'계산식'}).fill('1/0');await page.getByRole('textbox',{name:'계산식'}).press('Enter');await expect(page.getByLabel('계산 결과')).toContainText('0으로');
 await page.getByRole('button',{name:'1번 문제',exact:true}).click();await expect(page.getByRole('textbox',{name:'계산식'})).toHaveValue('');await expect(page.getByLabel('계산 결과')).toHaveText('0');await expect(page.getByRole('textbox',{name:'문제별 메모장'})).toHaveValue('1번 문제 개인 메모');
 await page.getByRole('button',{name:'수열추리',exact:false}).first().click();await page.getByRole('button',{name:'마치고 새로 시작',exact:true}).click();
 await page.getByRole('textbox',{name:'계산식'}).fill('3+7');await page.getByRole('textbox',{name:'계산식'}).press('Enter');
 const correct=await page.evaluate(()=>JSON.parse(localStorage.getItem('skct-lab:v1')!).session.questions[0].correctAnswer);
 await page.getByRole('radio').nth(correct).click();await page.getByRole('button',{name:'정답 제출',exact:false}).click();
 await expect(page.locator('.question-count')).toHaveText('02 / 20');await expect(page.getByRole('textbox',{name:'계산식'})).toHaveValue('');await expect(page.getByLabel('계산 결과')).toHaveText('0');
});

 test('무제한 연습 두 영역에서 미답 풀이 바로 보기',async({page})=>{
 for(const area of ['creative','sequence']){
  await page.getByRole('button',{name:'무제한 연습',exact:true}).click();
  await page.locator('.training-settings select').first().selectOption(area);
  await page.getByRole('button',{name:'새 문제 20개 시작',exact:false}).click();
  await page.getByRole('button',{name:'풀이 보기',exact:true}).click();
  await expect(page.locator('.explanation')).toBeVisible();
  await expect(page.getByRole('button',{name:'이 식을 메모장에 넣기',exact:true})).toBeVisible();
 }
});

test('최신 유형 출제 구성·도형 보기·풀이·모바일·백업 복원',async({page})=>{
 await page.getByRole('button',{name:'수열추리',exact:false}).first().click();
 const replacement=page.getByRole('button',{name:'마치고 새로 시작',exact:true});if(await replacement.isVisible())await replacement.click();
 const snapshot=await page.evaluate(()=>JSON.parse(localStorage.getItem('skct-lab:v1')!));
 // 고정 목록이 아니라 분야 분포로 뽑으므로 유형 수가 아니라 중복 없음과 자료 기반 유형 비중을 본다.
 expect(new Set(snapshot.session.questions.map((q:any)=>q.subtype)).size).toBe(20);
 expect(snapshot.session.questions.filter((q:any)=>/^(refseq|pat)-/.test(q.subtype)).length).toBeGreaterThanOrEqual(8);
 const diagramIndex=snapshot.session.questions.findIndex((q:any)=>q.diagram);
 const q=snapshot.session.questions[diagramIndex];
 await page.getByRole('button',{name:`${diagramIndex+1}번 문제`,exact:true}).click();
 await expect(page.locator('.question-diagram,.cross-diagrams')).toBeVisible();
 await expect(page.locator('.question-text')).not.toContainText(q.category);
 await expect(page.locator('.question-diagram,.cross-diagrams')).toContainText('(A)');
 await page.getByRole('button',{name:'풀이 보기',exact:true}).click();
 await expect(page.locator('.explanation')).toContainText(q.memo);
 await page.reload();await expect(page.locator('.question-diagram,.cross-diagrams')).toBeVisible();
 await page.setViewportSize({width:390,height:844});
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 await page.screenshot({path:'docs/reference-mobile.png',fullPage:true});
 await page.setViewportSize({width:1440,height:1100});await page.evaluate(()=>window.scrollTo(0,0));await page.waitForTimeout(300);await page.screenshot({path:'docs/reference-desktop.png',fullPage:false});
});

test('새 유형 문제은행·조건부 확률·두 도형 형식·집중훈련 20개',async({page})=>{
 for(const [area,search] of [['creative','조건부 확률 · 생산 출처'],['sequence','격자 · 행 관계'],['sequence','도형 · 교차 관계']] as const){
  await page.getByRole('button',{name:'문제은행',exact:true}).click();
  await page.getByRole('combobox',{name:'문제은행 영역'}).selectOption(area);
  await page.getByRole('textbox',{name:'문제 유형 검색'}).fill(search);
  await page.getByRole('button',{name:'문제 보기',exact:true}).click();
  if(area==='sequence')await expect(page.getByRole('dialog').locator('.question-diagram,.cross-diagrams')).toBeVisible();
  if(search==='격자 · 행 관계')await page.screenshot({path:'docs/reference-grid.png',fullPage:false});
  await page.getByRole('button',{name:'대화상자 닫기'}).click();
  await page.getByRole('button',{name:'연습',exact:true}).click();
  const replace=page.getByRole('button',{name:'마치고 새로 시작',exact:true});if(await replace.isVisible())await replace.click();
  const questions=await page.evaluate(()=>JSON.parse(localStorage.getItem('skct-lab:v1')!).session.questions);
  expect(questions).toHaveLength(20);expect(new Set(questions.map((q:any)=>q.question)).size).toBe(20);
  await page.getByRole('button',{name:'풀이 보기',exact:true}).click();await expect(page.locator('.explanation')).toBeVisible();
 }
});
test('분야로 골라 랜덤 20문항 · 문제은행 분야 바로 시작',async({page})=>{
 await page.getByRole('button',{name:'유형별 집중 훈련',exact:true}).click();
 // 큰 분야 하나만 눌러도 그 안의 모든 유형이 선택된다.
 await page.locator('.field-main',{hasText:'거리·속력·시간'}).click();
 await expect(page.getByText(/^\d+개 유형 선택$/).first()).toBeVisible();
 await page.getByRole('button',{name:/선택한 분야로 20문항 시작/}).click();
 const replace=page.getByRole('button',{name:'마치고 새로 시작',exact:true});if(await replace.isVisible())await replace.click();
 await expect(page.locator('.question-text')).toBeVisible();
 const inField=async()=>page.evaluate(key=>{const qs=JSON.parse(localStorage.getItem(key)!).session.questions as {subtype:string;category:string}[];
  return {count:qs.length,categories:[...new Set(qs.map(q=>q.category))],types:new Set(qs.map(q=>q.subtype)).size};},key);
 const picked=await inField();
 expect(picked.count).toBe(20);
 expect(picked.categories).toEqual(['거리·속력·시간']);     // 고른 분야 밖의 문항이 섞이지 않는다
 expect(picked.types).toBeGreaterThan(1);                  // 한 유형만 반복되지 않는다
 // 세부 분야만 눌러 더 좁힐 수도 있다.
 await page.getByRole('button',{name:'유형별 집중 훈련',exact:true}).click();
 await page.getByRole('button',{name:'선택 해제',exact:true}).click();
 await page.locator('.field-subs button',{hasText:'기차·통과'}).click();
 await page.getByRole('button',{name:/선택한 분야로 20문항 시작/}).click();
 const replace2=page.getByRole('button',{name:'마치고 새로 시작',exact:true});if(await replace2.isVisible())await replace2.click();
 const narrowed=await page.evaluate(key=>JSON.parse(localStorage.getItem(key)!).session.questions.map((q:{subtype:string})=>q.subtype),key);
 expect([...new Set(narrowed as string[])].every(id=>['speed-10','speed-11','speed-12','speed-14','speed-16','speed-17'].includes(id))).toBe(true);
 // 문제은행에서도 분야를 골라 바로 시작한다.
 await page.getByRole('button',{name:'문제은행',exact:true}).click();
 const start=page.getByRole('button',{name:/이 분야 랜덤 20문항/});
 await expect(start).toBeDisabled();
 await page.getByLabel('문제은행 분야').selectOption('농도·혼합');
 await expect(page.locator('.bank-row').first()).toContainText('농도·혼합');
 await start.click();
 const replace3=page.getByRole('button',{name:'마치고 새로 시작',exact:true});if(await replace3.isVisible())await replace3.click();
 const mixed=await inField();
 expect(mixed.categories).toEqual(['농도·혼합']);
});
test('유형별 공식 정리 · 검색·연습 연결·모바일',async({page})=>{
 await page.getByRole('button',{name:'유형별 공식 정리',exact:true}).click();
 await expect(page.locator('.tip-card')).toHaveCount(141);
 await expect(page.getByRole('button',{name:'이 유형 연습하기'})).toHaveCount(93);
 const search=page.getByRole('textbox',{name:'유형·공식 검색'});
 // 문제 문장은 '용액'이라고 쓰지만 사람은 '소금물'로 찾는다.
 await search.fill('소금물');
 await expect(page.locator('.tip-card')).toHaveCount(11);
 await expect(page.locator('.tip-head b').first()).toHaveText('서로 다른 용액 혼합');
 await search.fill('기차');
 await expect(page.locator('.tip-card')).toHaveCount(6);
 await search.fill('존재하지않는낱말');
 await expect(page.locator('.empty h3')).toBeVisible();
 await search.fill('');
 await page.getByRole('button',{name:'이 유형 연습하기'}).first().click();
 const replace=page.getByRole('button',{name:'마치고 새로 시작',exact:true});if(await replace.isVisible())await replace.click();
 await expect(page.locator('.question-text')).toBeVisible();
 const subtypes=await page.evaluate(key=>JSON.parse(localStorage.getItem(key)!).session.questions.map((q:{subtype:string})=>q.subtype),key);
 expect(new Set(subtypes).size).toBe(1);
 await page.setViewportSize({width:390,height:844});
 await page.getByRole('button',{name:'메뉴 열기'}).click();
 await page.getByRole('button',{name:'유형별 공식 정리',exact:true}).click();
 await expect(page.locator('.tip-card').first()).toBeVisible();
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});
