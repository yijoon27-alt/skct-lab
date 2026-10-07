import { test as base,expect } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import { resolve,sep } from 'node:path';
// Optional production-bundle fixture: route resources without listening on a local port.
// This uses the real Chromium DOM, React bundle and browser localStorage.
export const test=base.extend({page:async({page},use)=>{
 if(process.env.SKCT_STATIC_TEST){
  const root=resolve('dist');
  await page.route('**/*',async route=>{
   const path=decodeURIComponent(new URL(route.request().url()).pathname),file=resolve(root,path==='/'?'index.html':'.'+path);
   if(!file.startsWith(root+sep)){await route.fulfill({status:403,body:''});return;}
   try{const body=await readFile(file);await route.fulfill({body,contentType:file.endsWith('.js')?'text/javascript':file.endsWith('.css')?'text/css':file.endsWith('.html')?'text/html':'application/octet-stream'});}catch{await route.fulfill({status:404,body:''});}
  });
 }
 await use(page);
}});
export { expect };
