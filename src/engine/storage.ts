import type { Store } from './types';
import { validate } from './verify';
import { normalizeAttempts } from './identity';
import { templates } from './bank';
export const STORAGE_KEY='skct-lab:v1';
export function emptyStore():Store{return {version:1,attempts:[],session:null,notes:{},favorites:[],reports:[],results:[],settings:{dark:false,autoNext:true,timed:true},drafts:[],recent:[]};}
export function parseBackup(text:string):Store {
 if(text.length>20_000_000)throw new Error('백업 파일은 20MB 이하여야 합니다.');
 const x=JSON.parse(text);
 if(!x||x.version!==1||!Array.isArray(x.attempts)||!Array.isArray(x.favorites)||!Array.isArray(x.results)||!Array.isArray(x.reports)||!Array.isArray(x.recent)||!Array.isArray(x.drafts)||!x.notes||typeof x.notes!=='object'||Array.isArray(x.notes)||!x.settings||typeof x.settings.dark!=='boolean'||typeof x.settings.autoNext!=='boolean'||typeof x.settings.timed!=='boolean')throw new Error('지원하지 않는 백업 형식입니다. 기존 데이터는 유지됩니다.');
 const qs=[...x.attempts.map((a:any)=>a.question),...x.favorites,...x.reports.map((a:any)=>a.question),...(x.session?.questions||[])];
 if(qs.some(q=>{if(!q||validate(q).length)return true;const t=templates.find(t=>t.id===q.subtype);if(!t)return true;const canonical=t.generate(q.seed);return ['question','options','optionValues','facts','steps','answer','explanation','difficulty','type','category','shortcut','memo','keyFormula','signal','rule','sequence'].some(key=>JSON.stringify((q as any)[key])!==JSON.stringify((canonical as any)[key]));}))throw new Error('백업에 검증되지 않은 문항이 있습니다.');
 if(x.attempts.some((a:any)=>!a.id||typeof a.first!=='boolean'||typeof a.correct!=='boolean'||!Number.isFinite(a.seconds)||a.seconds<0||!Number.isFinite(Date.parse(a.at))||typeof a.note!=='string'||(a.selected!==null&&(!Number.isInteger(a.selected)||a.selected<0||a.selected>4))||a.correct!==(a.selected===a.question.correctAnswer)))throw new Error('학습 기록 형식이 잘못되었습니다.');
 x.attempts=normalizeAttempts(x.attempts);
 if(x.results.some((a:any)=>!a.id||!['creative','sequence'].includes(a.area)||!Number.isFinite(Date.parse(a.at))||!Number.isInteger(a.score)||!Number.isInteger(a.count)||a.count<1||a.score<0||a.score>a.count||!Number.isFinite(a.seconds)||a.seconds<0))throw new Error('시험 결과 형식 오류');
 if(Object.values(x.notes).some(v=>typeof v!=='string')||x.recent.some((v:any)=>typeof v!=='string'))throw new Error('메모 형식 오류');
 if(x.reports.some((v:any)=>typeof v.id!=='string'||typeof v.reason!=='string'||typeof v.detail!=='string'||typeof v.resolved!=='boolean'))throw new Error('신고 형식 오류');
 if(x.drafts.some((v:any)=>typeof v.id!=='string'||typeof v.question!=='string'||!Array.isArray(v.options)||v.options.length!==5||v.options.some((s:any)=>typeof s!=='string')||!Number.isInteger(v.correctAnswer)||v.correctAnswer<0||v.correctAnswer>4||typeof v.expression!=='string'||typeof v.explanation!=='string'||typeof v.category!=='string'||!['easy','medium','hard'].includes(v.difficulty)||!['draft','verified','approved'].includes(v.status)||typeof v.reviewed!=='boolean'))throw new Error('관리자 초안 형식 오류');
 const s=x.session;
 if(s){
  if(!s.id||!['creative','sequence'].includes(s.area)||!['card','exam'].includes(s.mode)||!Array.isArray(s.questions)||!s.questions.length||!Number.isInteger(s.index)||s.index<0||s.index>=s.questions.length||!Number.isFinite(s.remaining)||s.remaining<0||s.remaining>900||typeof s.done!=='boolean'||typeof s.running!=='boolean'||typeof s.review!=='boolean'||!s.answers||!s.seconds||!s.notes||!(s.deadline===null||Number.isFinite(s.deadline))||!(s.startedAt===null||Number.isFinite(s.startedAt)))throw new Error('세션 형식 오류');
  const ids=new Set(s.questions.map((q:any)=>q.id));if([...Object.keys(s.answers),...Object.keys(s.seconds),...Object.keys(s.notes)].some(id=>!ids.has(id)))throw new Error('세션에 없는 문항의 데이터가 있습니다.');
  if(Object.values(s.seconds).some((v:any)=>!Number.isFinite(v)||v<0)||Object.values(s.notes).some(v=>typeof v!=='string')||Object.values(s.answers).some((v:any)=>v!==null&&(!Number.isInteger(v)||v<0||v>4)))throw new Error('세션 답안 오류');
 }
 return x as Store;
}
export function loadStore():{store:Store;error:string} {
 try{const raw=localStorage.getItem(STORAGE_KEY);const store=raw?parseBackup(raw):emptyStore();if(raw&&JSON.stringify(JSON.parse(raw))!==JSON.stringify(store))localStorage.setItem(STORAGE_KEY+':before-migration',raw);return {store,error:''};}
 catch{return {store:emptyStore(),error:'저장 기록을 읽지 못했습니다. 원본은 보존되어 있습니다. 백업을 확인하세요.'};}
}
export function saveStore(store:Store):string {try{localStorage.setItem(STORAGE_KEY,JSON.stringify(store));return '';}catch{return '브라우저 저장 공간이 부족하거나 저장이 차단되었습니다. 지금 JSON 백업을 내려받으세요.';}}
export function download(name:string,content:string,type='application/json') {const url=URL.createObjectURL(new Blob([content],{type}));const a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
export function csv(store:Store):string {const cell=(v:unknown)=>'"'+String(v??'').replace(/^\s*[=+\-@]/,"'$&").replaceAll('"','""')+'"';return '\ufeff'+[['문항ID','영역','유형','난도','선택','정답','정오','초','첫시도','날짜','메모','해설','최단풀이'],...store.attempts.map(a=>[a.question.id,a.question.type,a.question.category,a.question.difficulty,a.selected===null?'미응답':a.question.options[a.selected],a.question.options[a.question.correctAnswer],a.correct?'정답':'오답',a.seconds,a.first,a.at,store.notes[a.question.id]??a.note,a.question.explanation,a.question.shortcut])].map(row=>row.map(cell).join(',')).join('\r\n');}
