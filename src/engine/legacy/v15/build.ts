import { format, rng } from '../../math';
import type { Area, Difficulty, Question, Step } from '../../types';
// Single source of truth for the generator version. A hardcoded copy in App.tsx silently
// discarded every restored session on the 1.2.0 → 1.3.0 bump, so nothing re-states this string.
export const GENERATOR_VERSION='1.5.0';
// decimals: 문제를 소수로 제시한 수열은 선지도 소수로 적는다. 0.7, 0.9, 1.1 수열의 답이 17/10으로
// 나오면 실전에서 쓸 수 없는 화면이 된다.
export interface Body { question:string; answer:number; unit:string; facts:Record<string,number>; steps:Step[]; formula:string; signal:string; shortcut:string; sequence?:number[]; rule?:string; memo?:string; decimals?:number }
export function build(id:string,category:string,area:Area,difficulty:Difficulty,seed:number,b:Body):Question {
 const r=rng(seed ^ 0x793af),values=[b.answer];
 const rational=format(b.answer).split('/'),denominator=rational.length===2?Number(rational[1]):0;
 const scale=denominator?1/(b.unit==='확률'?denominator*Math.max(1,Math.ceil(5/denominator)):denominator):b.unit==='확률'?0.05: Math.abs(b.answer)<1?0.1:Math.max(1,Math.round(Math.abs(b.answer)*0.08));
 // 모든 항이 양수인 수열에 0이나 음수 선지가 섞이면 계산하지 않고도 지워진다.
 const positive=area==='sequence'&&!!b.sequence?.length&&b.sequence.every(v=>v>0)&&b.answer>0;
 for(let j=1;values.length<5;j++) {if(j>200)throw Error('유일한 선지 생성 범위 부족');const value=b.answer+((j%2)?1:-1)*Math.ceil(j/2)*scale;if((b.unit!=='확률'||value>=0&&value<=1)&&(positive?value>0:area==='sequence'||value>=0)&&!values.some(x=>Math.abs(x-value)<1e-8))values.push(value);}
 for(let j=values.length-1;j>0;j--){const k=r(0,j);[values[j],values[k]]=[values[k],values[j]];}
 const suffix=b.unit==='확률'?'':b.unit;
 const show=(v:number)=>b.decimals===undefined?format(v):v.toFixed(b.decimals);
 return {id:`${id}-v6-${seed>>>0}`,type:area,subtype:id,category,difficulty,question:b.question,options:values.map(v=>show(v)+(suffix?` ${suffix}`:'')),optionValues:values,correctAnswer:values.indexOf(b.answer),answer:b.answer,unit:b.unit,explanation:b.steps.map(s=>`${s.label}: ${s.expression.replaceAll('*','×').replaceAll('/','÷')} = ${show(s.value)}`).join('\n'),shortcut:b.shortcut,memo:b.memo||b.steps.at(-1)?.expression||'',keyFormula:b.formula,signal:b.signal,steps:b.steps,seed:seed>>>0,generatorVersion:GENERATOR_VERSION,facts:b.facts,sequence:b.sequence,rule:b.rule,decimals:b.decimals};
}
