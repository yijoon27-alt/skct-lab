import { format, rng } from '../../math';
import type { Area, Difficulty, Question, Step } from '../../types';
// Single source of truth for the generator version. A hardcoded copy in App.tsx silently
// discarded every restored session on the 1.2.0 → 1.3.0 bump, so nothing re-states this string.
export const GENERATOR_VERSION='1.6.0';
// decimals: 문제를 소수로 제시한 수열은 선지도 소수로 적는다. 0.7, 0.9, 1.1 수열의 답이 17/10으로
// 나오면 실전에서 쓸 수 없는 화면이 된다.
export interface Body { question:string; answer:number; unit:string; facts:Record<string,number>; steps:Step[]; formula:string; signal:string; shortcut:string; sequence?:number[]; rule?:string; memo?:string; decimals?:number }
export function build(id:string,category:string,area:Area,difficulty:Difficulty,seed:number,b:Body):Question {
 const r=rng(seed ^ 0x793af),values=[b.answer];
 const rational=format(b.answer).split('/'),denominator=rational.length===2?Number(rational[1]):0;
 // 정답만 100의 배수이고 나머지 선지는 아니면 계산하지 않고도 고를 수 있다. 선지 간격을
 // 정답이 가진 자릿수 단위의 배수로 맞춰 다섯 선지가 모두 같은 단위를 갖게 한다.
 const rough=Math.abs(b.answer)<1?0.1:Math.max(1,Math.round(Math.abs(b.answer)*0.08));
 // 3674.9999999999995처럼 오차가 섞인 값도 화면에는 3675로 나오므로 반올림해서 단위를 본다.
 const whole=Math.abs(b.answer-Math.round(b.answer))<1e-9?Math.abs(Math.round(b.answer)):0;
 // 단위를 정답의 최대 약수로 잡으면 간격이 지나치게 벌어져 '43개 중 몇 개'에 125개 같은
 // 선지가 생긴다. 보통 간격의 몇 배 안에서 가장 큰 단위를 쓴다.
 const cap=Math.max(2,rough*5);
 const unit=whole?[1000,500,250,100,50,25,20,10,5,4,2].find(u=>u<=cap&&whole%u===0)??1:1;
 const scale=denominator?1/(b.unit==='확률'?denominator*Math.max(1,Math.ceil(5/denominator)):denominator):b.unit==='확률'?0.05:Math.max(unit,Math.round(rough/unit)*unit);
 // 모든 항이 양수인 수열에 0이나 음수 선지가 섞이면 계산하지 않고도 지워진다.
 // 0이나 음수는 양수 답에서 계산 없이 지워진다. 수열은 음수 항이 있을 때만 허용한다.
 const positive=b.answer>0&&(area!=='sequence'||(!!b.sequence?.length&&b.sequence.every(v=>v>0)));
 for(let j=1;values.length<5;j++) {if(j>200)throw Error('유일한 선지 생성 범위 부족');const value=b.answer+((j%2)?1:-1)*Math.ceil(j/2)*scale;if((b.unit!=='확률'||value>=0&&value<=1)&&(positive?value>0:area==='sequence'||value>=0)&&!values.some(x=>Math.abs(x-value)<1e-8))values.push(value);}
 for(let j=values.length-1;j>0;j--){const k=r(0,j);[values[j],values[k]]=[values[k],values[j]];}
 const suffix=b.unit==='확률'?'':b.unit;
 const show=(v:number)=>b.decimals===undefined?format(v):v.toFixed(b.decimals);
 return {id:`${id}-v7-${seed>>>0}`,type:area,subtype:id,category,difficulty,question:b.question,options:values.map(v=>show(v)+(suffix?` ${suffix}`:'')),optionValues:values,correctAnswer:values.indexOf(b.answer),answer:b.answer,unit:b.unit,explanation:b.steps.map(s=>`${s.label}: ${s.expression.replaceAll('*','×').replaceAll('/','÷')} = ${show(s.value)}`).join('\n'),shortcut:b.shortcut,memo:b.memo||b.steps.at(-1)?.expression||'',keyFormula:b.formula,signal:b.signal,steps:b.steps,seed:seed>>>0,generatorVersion:GENERATOR_VERSION,facts:b.facts,sequence:b.sequence,rule:b.rule,decimals:b.decimals};
}
