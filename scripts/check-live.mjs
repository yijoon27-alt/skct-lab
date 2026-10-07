import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
const browser=await chromium.launch({channel:'chrome',headless:true});
try {
 const page=await browser.newPage();
 await page.goto(`https://yijoon27-alt.github.io/skct-lab/?verify=${Date.now()}`,{waitUntil:'networkidle'});
 await page.getByRole('button',{name:'창의수리',exact:false}).first().click();
 await page.getByRole('button',{name:'풀이 보기',exact:true}).click();
 await page.locator('.explanation').waitFor();
 const snapshot=await page.evaluate(()=>JSON.parse(localStorage.getItem('skct-lab:v1')));
 assert.equal(snapshot.session.questions[0].generatorVersion,'1.1.0');
 assert.equal(snapshot.attempts.length,0);
 await page.getByRole('textbox',{name:'계산식'}).fill('12*3');
 await page.getByRole('textbox',{name:'계산식'}).press('Enter');
 assert.equal(await page.getByLabel('계산 결과').textContent(),'36');
 await page.getByRole('button',{name:'다음 문제',exact:false}).click();
 assert.equal(await page.getByRole('textbox',{name:'계산식'}).inputValue(),'');
 assert.equal(await page.getByLabel('계산 결과').textContent(),'0');
 for(const area of ['creative','sequence']){
  await page.getByRole('button',{name:'무제한 연습',exact:true}).click();
  await page.locator('.training-settings select').first().selectOption(area);
  await page.getByRole('button',{name:'새 문제 20개 시작',exact:false}).click();
  await page.getByRole('button',{name:'풀이 보기',exact:true}).click();
  await page.locator('.explanation').waitFor();
 }
 console.log('Live Pages: generator 1.1.0, instant solutions in both unlimited areas, calculator reset PASS');
} finally {await browser.close();}
