import {chromium,expect} from '@playwright/test';
import assert from 'node:assert/strict';
const browser=await chromium.launch({channel:'chrome',headless:true});
try {
 const page=await browser.newPage();
 await page.goto(`https://yijoon27-alt.github.io/skct-lab/?verify=${Date.now()}`,{waitUntil:'networkidle'});
 await page.getByRole('button',{name:'창의수리',exact:false}).first().click();
 await page.getByRole('button',{name:'풀이 보기',exact:true}).click();
 await page.locator('.explanation').waitFor();
 const snapshot=await page.evaluate(()=>JSON.parse(localStorage.getItem('skct-lab:v1')));
 assert.equal(snapshot.session.questions[0].generatorVersion,'1.2.0');
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
 assert(current.session.questions.some(q=>q.subtype==='refseq-5'));
 assert(current.session.questions.some(q=>q.subtype==='refseq-4'));
 const diagramIndex=current.session.questions.findIndex(q=>q.diagram);
 assert(diagramIndex>=0);
 await page.getByRole('button',{name:`${diagramIndex+1}번 문제`,exact:true}).click();
 await expect(page.locator('.question-diagram,.cross-diagrams')).toBeVisible();
 await expect(page.locator('.question-meta')).not.toContainText('Hard');
 await page.getByRole('button',{name:'문제은행',exact:true}).click();
 await page.getByRole('combobox',{name:'문제은행 영역'}).selectOption('sequence');
 await expect(page.locator('.bank-row')).toHaveCount(27);
 await page.getByRole('combobox',{name:'문제은행 영역'}).selectOption('creative');
 await expect(page.locator('.bank-row')).toHaveCount(53);
 await page.getByRole('textbox',{name:'문제 유형 검색'}).fill('조건부 확률');
 await expect(page.getByRole('button',{name:'문제 보기',exact:true})).toHaveCount(3);
 console.log('Live Pages: generator 1.2.0, instant solutions in both unlimited areas, calculator reset, new rules/diagrams, creative 53 + sequence 27 PASS');
} finally {await browser.close();}
