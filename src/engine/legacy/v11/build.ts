import { legacyFormat as format, rng } from '../../math';
import type { Area, Difficulty, Question, Step } from '../../types';
export interface Body { question:string; answer:number; unit:string; facts:Record<string,number>; steps:Step[]; formula:string; signal:string; shortcut:string; sequence?:number[]; rule?:string; memo?:string }
export function build(id:string,category:string,area:Area,difficulty:Difficulty,seed:number,b:Body):Question {
 const r=rng(seed ^ 0x793af),values=[b.answer];
 const rational=format(b.answer).split('/'),denominator=rational.length===2?Number(rational[1]):0;
 const scale=denominator?1/(b.unit==='확률'?denominator*Math.max(1,Math.ceil(5/denominator)):denominator):b.unit==='확률'?0.05: Math.abs(b.answer)<1?0.1:Math.max(1,Math.round(Math.abs(b.answer)*0.08));
 for(let j=1;values.length<5;j++) {if(j>200)throw Error('유일한 선지 생성 범위 부족');const value=b.answer+((j%2)?1:-1)*Math.ceil(j/2)*scale;if((b.unit!=='확률'||value>=0&&value<=1)&&(area==='sequence'||value>=0)&&!values.some(x=>Math.abs(x-value)<1e-8))values.push(value);}
 for(let j=values.length-1;j>0;j--){const k=r(0,j);[values[j],values[k]]=[values[k],values[j]];}
 const suffix=b.unit==='확률'?'':b.unit;
 return {id:`${id}-v2-${seed>>>0}`,type:area,subtype:id,category,difficulty,question:b.question,options:values.map(v=>format(v)+(suffix?` ${suffix}`:'')),optionValues:values,correctAnswer:values.indexOf(b.answer),answer:b.answer,unit:b.unit,explanation:b.steps.map(s=>`${s.label}: ${s.expression.replaceAll('*','×').replaceAll('/','÷')} = ${format(s.value)}`).join('\n'),shortcut:b.shortcut,memo:b.memo||b.steps.at(-1)?.expression||'',keyFormula:b.formula,signal:b.signal,steps:b.steps,seed:seed>>>0,generatorVersion:'1.1.0',facts:b.facts,sequence:b.sequence,rule:b.rule};
}
