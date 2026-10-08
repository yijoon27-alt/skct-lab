import {chromium,expect} from '@playwright/test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
// Read the current version from the generator instead of restating it here.
const version=readFileSync(new URL('../src/engine/build.ts',import.meta.url),'utf8').match(/GENERATOR_VERSION='([^']+)'/)[1];
const browser=await chromium.launch({channel:'chrome',headless:true});
try {
 const page=await browser.newPage();
 await page.goto(`https://yijoon27-alt.github.io/skct-lab/?verify=${Date.now()}`,{waitUntil:'networkidle'});
 await page.getByRole('button',{name:'창의수리',exact:false}).first().click();
 await page.getByRole('button',{name:'풀이 보기',exact:true}).click();
 await page.locator('.explanation').waitFor();
 const snapshot=await page.evaluate(()=>JSON.parse(localStorage.getItem('skct-lab:v1')));
 assert.equal(snapshot.session.questions[0].generatorVersion,version);
 assert.equal(snapshot.attempts.length,0);
 await page.getByRole('textbox',{name:'계산식'}).fill('12*3');
 await page.getByRole('textbox',{name:'계산식'}).press('Enter');
 assert.equal(await page.getByLabel('계산 결과').textContent(),'36');
 await page.getByRole('button',{name:'다음 문제',exact:false}).click();
 await expect(page.getByRole('textbox',{name:'계산식'})).toHaveValue('');
 await expect(page.getByLabel('계산 결과')).toHaveText('0');
 for(const area of ['creative','sequence']){
  await page.getByRole('button',{name:'무제한 연습',exact:true}).click();
  await page.locator('.training-settings select').first().selectOption(area);
  await page.getByRole('button',{name:'새 문제 20개 시작',exact:false}).click();
  await page.getByRole('button',{name:'풀이 보기',exact:true}).click();
  await page.locator('.explanation').waitFor();
 }
 const current=await page.evaluate(()=>JSON.parse(localStorage.getItem('skct-lab:v1')));
 // 수열 세트는 고정 목록이 아니라 분야 분포로 뽑으므로 분야 단위로 확인한다.
 const subtypes=current.session.questions.map(q=>q.subtype);
 assert.equal(new Set(subtypes).size,20,'한 세트에 같은 유형이 두 번 들어감');
 for(const [family,ids] of [['이전 두 항의 곱',['refseq-5']],['정수부·소수부 분리',['refseq-4','pat-8']],['분자·분모 독립',['seq-16','refseq-2','refseq-3','pat-4','pat-5','pat-6','pat-9']],['도형·격자',['refseq-10','refseq-11']]])
  assert(subtypes.some(id=>ids.includes(id)),family);
 const diagramIndex=current.session.questions.findIndex(q=>q.diagram);
 assert(diagramIndex>=0);
 await page.getByRole('button',{name:`${diagramIndex+1}번 문제`,exact:true}).click();
 await expect(page.locator('.question-diagram,.cross-diagrams')).toBeVisible();
 await expect(page.locator('.question-meta')).not.toContainText('Hard');
 await page.getByRole('button',{name:'문제은행',exact:true}).click();
 await page.getByRole('combobox',{name:'문제은행 영역'}).selectOption('sequence');
 await expect(page.locator('.bank-row')).toHaveCount(37);
 await page.getByRole('combobox',{name:'문제은행 영역'}).selectOption('creative');
 await expect(page.locator('.bank-row')).toHaveCount(53);
 await page.getByRole('textbox',{name:'문제 유형 검색'}).fill('조건부 확률');
 await expect(page.getByRole('button',{name:'문제 보기',exact:true})).toHaveCount(3);
 console.log(`Live Pages: generator ${version}, instant solutions in both unlimited areas, calculator reset, new rules/diagrams, creative 53 + sequence 37 PASS`);
} finally {await browser.close();}
