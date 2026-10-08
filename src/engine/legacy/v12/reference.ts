// Independently authored rules inspired by the aggregate review, never source questions.
import { build } from './build';
import { calculate, legacyFormat as format, rng } from '../../math';
import type { Template, Step, Question } from '../../types';

const probabilityNames=['조건부 확률 · 생산 출처','조건부 확률 · 검사 결과','조건부 확률 · 집단 선택'];
export const probabilityTemplates:Template[]=probabilityNames.map((name,i)=>({
 id:`bayes-${i}`,name,category:'경우의 수·확률',area:'creative',difficulty:i===1?'hard':'medium',
 complexity:i===1?'실제 상태와 검사 결과의 두 단계 비율':'관찰된 결과로 표본공간을 제한한 뒤 집단 비율 역산',
 generate(seed){
  const r=rng(seed),share=i===1?r(1,4)*5:r(2,8)*10,rateA=i===1?r(14,19)*5:i===0?r(1,7)*2:r(1,7)*5,rateB=i===1?r(1,3)*5:i===0?r(1,7)*2:r(1,7)*5;
  const observedA=share*rateA,observedB=(100-share)*rateB,answer=observedA/(observedA+observedB);
  const question=i===0?`두 작업장 A, B가 전체 제품의 ${share}%, ${100-share}%를 각각 생산한다. A 제품의 불량률은 ${rateA}%, B 제품의 불량률은 ${rateB}%다. 전체 제품 중 하나를 무작위로 골랐더니 불량이었다. 이 제품이 A에서 생산되었을 확률은?`:
   i===1?`어떤 부품의 ${share}%에는 결함이 있다. 검사에서 결함이 있는 부품은 ${rateA}%가 양성으로, 결함이 없는 부품은 ${100-rateB}%가 음성으로 판정된다. 부품을 무작위로 하나 골라 검사했더니 양성이었다. 실제로 결함이 있을 확률은? (각 비율은 해당 집단 안의 비율이다.)`:
   `회원의 ${share}%는 A집단, 나머지는 B집단에 속한다. A집단의 ${rateA}%, B집단의 ${rateB}%가 교육을 이수했다. 회원을 무작위로 한 명 골랐더니 교육 이수자였다. 이 회원이 A집단일 확률은?`;
  const memo=i===1?`${share}*${rateA}/(${share}*${rateA}+${100-share}*(100-${100-rateB}))`:`${share}*${rateA}/(${share}*${rateA}+${100-share}*${rateB})`;
  return build(`bayes-${i}`,'경우의 수·확률','creative',i===1?'hard':'medium',seed,{question,answer,unit:'확률',facts:{share,rateA,rateB,...(i===1?{specificity:100-rateB}:{})},
   steps:[...(i===1?[{label:'결함 없는 부품의 양성률',expression:`100-${100-rateB}`,value:rateB}]:[]),{label:'1만 개/명 기준 A의 관찰 대상',expression:`${share}*${rateA}`,value:observedA},{label:'B의 관찰 대상',expression:`${100-share}*${rateB}`,value:observedB},{label:'관찰 대상 중 A 비율',expression:memo,value:answer}],
   formula:'P(A|관찰) = A이면서 관찰된 수 ÷ 전체 관찰된 수',signal:'이미 불량·양성·이수라는 결과를 관찰한 뒤 출처나 실제 상태를 묻는 표현',
   shortcut:'관찰된 대상만 남깁니다. 집단 비중×집단 안의 관찰 비율을 두 칸에 적고, A칸을 두 칸 합으로 나눕니다. %의 공통 분모는 약분됩니다.',memo});
 }
}));

const specs=[
 ['유리수 통일 · 등차','medium','분수·대분수·소수 표현을 통일한 뒤 두 항 계산'],
 ['유리수 통일 · 등비','medium','표현 통일과 공비 확인 뒤 목표값 계산'],
 ['분자·분모 계차','hard','분자와 분모의 서로 다른 변화 확인'],
 ['역수 · 변화하는 계차','hard','역수 변환 후 계차 변화 확인'],
 ['정수·소수 부분 분리','medium','정수와 소수 부분의 독립 규칙'],
 ['이전 두 항의 곱','medium','곱의 점화 관계와 두 빈칸 계산'],
 ['이전 세 항의 합','medium','세 항의 점화 관계와 두 빈칸 계산'],
 ['홀짝 분리 · 이전 항 합','hard','홀짝 분리 후 한 줄의 점화 관계 확인'],
 ['군수열 · 곱','hard','세 항씩 묶고 군 내부 곱과 군 사이 변화 확인'],
 ['군수열 · 차','medium','군 내부 차와 군 사이 변화 확인'],
 ['격자 · 행 관계','hard','여러 행의 같은 관계를 비교해 빈칸 결정'],
 ['도형 · 교차 관계','hard','여러 도형의 곱과 합 관계 비교'],
 ['유리수 · 이전 두 항의 합','medium','분수·소수 통일 후 점화 관계'],
 ['소수 · 교대 연산','medium','소수 표현에서 두 연산의 반복 발견']
] as const;

function query(seed:number,terms:number[],expressions:string[],maxKind=5,pairOnly=false){
 const r=rng(seed^0x82745);let kind=pairOnly?[1,2,4,5][r(0,3)]:r(0,maxKind),A=2,B=4;
 if(kind===0){A=terms.length-2;B=A;}
 if(kind===3){A=terms.length-1;B=A;}
 if(kind===4&&Math.abs(terms[A]*terms[B])>45000)kind=2;
 if(kind===5&&terms[B]===0)kind=1;
 let expression=kind===1?`(${expressions[A]})+(${expressions[B]})`:kind===2?`(${expressions[B]})-(${expressions[A]})`:kind===4?`(${expressions[A]})*(${expressions[B]})`:kind===5?`(${expressions[A]})/(${expressions[B]})`:expressions[A];
 let answer=calculate(expression);
 if(Number(format(answer).split('/')[1]||1)>1800){kind=2;expression=`(${expressions[B]})-(${expressions[A]})`;answer=calculate(expression);}
 if(Math.abs(answer-Math.round(answer))<1e-9)answer=Math.round(answer);
 const instruction=kind===0?'빈칸 (A)에 들어갈 수를 구하세요.':kind===1?'(A)+(B)의 값을 구하세요.':kind===2?'(B)−(A)의 값을 구하세요.':kind===3?`${A+1}번째 항을 구하세요.`:kind===4?'(A)×(B)의 값을 구하세요.':'(A)÷(B)의 값을 구하세요.';
 return {kind,A,B,answer,expression,instruction};
}
function display(v:number,j:number,style:number){
 if(Math.abs(v-Math.round(v))<1e-9)return String(Math.round(v));
 if(style===1&&j%2&&Math.abs(v*1000-Math.round(v*1000))<1e-8)return Number(v.toFixed(3)).toString();
 if(style===2&&j%2&&v>1&&!Number.isInteger(v))return `${Math.floor(v)} ${format(v-Math.floor(v))}`;
 return format(v);
}
export const referenceSequenceTemplates:Template[]=specs.map(([name,difficulty,complexity],i)=>({
 id:`refseq-${i}`,name,category:name,area:'sequence',difficulty,complexity,
 generate(seed){
  const r=rng(seed),a=r(2,6),b=r(1,3),c=r(2,5),d=r(1,3),den=i===1?[8,10][r(0,1)]:[4,5,8,10][r(0,3)],style=r(0,2);
  const terms:number[]=[],expressions:string[]=[];let rule='',formula='';
  // A short six-term product sequence avoids artificial growth from extra supplied terms.
  const N=i===5?6:i===8||i===9?12:9;
  for(let j=0;j<N;j++){
   let e='';
   switch(i){
    case 0:e=`(${a}+${j}*${b})/${den}`;rule='같은 표현으로 통일하면 항의 차가 일정합니다.';formula=`공차 ${format(b/den)}로 목표 항 복원`;break;
    case 1:e=`${a}${Array(j).fill('*2').join('')}/${den}`;rule='분수와 소수를 통일하면 이웃한 항의 비가 2입니다.';formula='표현 통일 → 공비 → 빈칸 계산';break;
    case 2:e=`(${a}+${b}*${j}*(${j}+1)/2)/(${c}+${d}*${j})`;rule='분자의 차는 일정한 수의 1배, 2배, …이고 분모는 일정하게 증가합니다.';formula='분자의 계차와 분모의 공차를 각각 복원';break;
    case 3:e=`1/(${a}+${b}*${j}*(${j}+1)/2)`;rule='역수를 취하면 차가 일정한 수의 1배, 2배, …입니다.';formula='역수 → 계차 → 원래 값으로 복원';break;
    case 4:e=`(${a}+${j}*${b})+(${c}+${j}*(${j}+1)/2)/100`;rule='정수 부분은 등차, 소수 두 자리 숫자의 차는 1, 2, 3, …입니다.';formula='정수 부분과 소수 두 자리 숫자를 두 줄로 나눔';break;
    case 5:e=j===0?String(r(2,7)):j===1?String(r(1,terms[0]>5?2:3)):`${terms[j-1]}*${terms[j-2]}`;rule='세 번째 항부터 앞 두 항을 곱합니다.';formula='aₙ = aₙ₋₁ × aₙ₋₂';break;
    case 6:e=j<3?`${a}+${j}*${b}`:`${terms[j-1]}+${terms[j-2]}+${terms[j-3]}`;rule='네 번째 항부터 앞 세 항의 합입니다.';formula='aₙ = aₙ₋₁ + aₙ₋₂ + aₙ₋₃';break;
    case 7:e=j%2?`${c}+${Math.floor(j/2)}*${d}`:j<4?`${a}+${j/2}*${b}`:`${terms[j-2]}+${terms[j-4]}`;rule='홀수항은 앞 두 홀수항의 합, 짝수항은 등차입니다.';formula='홀짝 분리 → 홀수 줄의 이전 두 항 합';break;
    case 8:case 9:{const g=Math.floor(j/3),p=`${a}+${g}*${b}`,q=`${c}+${g}*${d}`;e=j%3===0?p:j%3===1?q:i===8?`(${p})*(${q})`:`(${p})-(${q})`;rule=i===8?'3개씩 묶으면 세 번째 수는 앞 두 수의 곱입니다. 각 군의 첫째·둘째 수는 일정하게 증가합니다.':'3개씩 묶으면 세 번째 수는 첫째 수에서 둘째 수를 뺀 값입니다. 첫째·둘째 수는 각각 일정하게 증가합니다.';formula=i===8?'[p, q, p×q]':'[p, q, p−q]';break;}
    case 12:e=j<2?`(${a}+${j}*${b})/${den}`:`(${terms[j-1]})+(${terms[j-2]})`;rule='분수와 소수를 통일하면 세 번째 항부터 앞 두 항의 합입니다.';formula='표현 통일 → 앞 두 항 합';break;
    case 13:e=j===0?`${a}/10`:j%2?`(${terms[j-1]})+${b}/10`:`(${terms[j-1]})*2`;rule='일정한 소수 더하기와 2배하기를 번갈아 적용합니다.';formula='소수점 이동 → +b, ×2 교대';break;
    default:e=`${a}+${j}*${b}`;
   }
   expressions.push(e);const value=calculate(e);terms.push(i===13?Number(value.toFixed(1)):value);
  }
  if(i===10||i===11){
   const rows=Array.from({length:4},(_,j)=>[a+j*b,c+j*d,r(2,8)]);
   const answers=rows.map(([u,v,w])=>i===10?u*v+w:u*v-w);
   const expressions=rows.map(([u,v,w])=>`${u}*${v}${i===10?'+':'-'}${w}`);
   const cells=rows.flat();const answer=answers[3];
   const diagram:NonNullable<Question['diagram']>={kind:i===10?'grid':'cross',cells:rows.map((row,j)=>[...row,j===3?null:answers[j]])} ;
   const steps:Step[]=answers.map((value,j)=>({label:`${j+1}번째 관계`,expression:expressions[j],value}));
   return {...build(`refseq-${i}`,name,'sequence',difficulty,seed,{question:`${i===10?'다음 표의 각 행에는 같은 관계가 성립합니다.':'다음 네 도형에는 같은 관계가 성립합니다.'} 빈칸 (A)에 들어갈 수를 구하세요.\n자료: ${diagram.cells.map(row=>row.map(v=>v===null?'(A)':v).join(', ')).join(' / ')}`,answer,unit:'',facts:Object.fromEntries(cells.map((value,j)=>[`cell${j}`,value])),steps,formula:i===10?'첫째 × 둘째 + 셋째 = 넷째':'왼쪽 × 오른쪽 − 위 = 아래',signal:'여러 행/도형에서 동일한 위치 관계 비교',shortcut:'숫자 네 칸을 같은 위치끼리 비교합니다. 앞 두 칸의 곱과 남은 칸의 합·차를 먼저 대조하고 마지막 빈칸에 한 번 적용합니다.',memo:expressions[3]}),diagram};
  }
  const q=query(seed,terms,expressions,i===2||i===3?2:5,i===0||i===1);
  const shown=q.kind===3?terms.slice(0,Math.min(6,terms.length-2)):terms;
  const prompt=shown.map((v,j)=>q.kind!==3&&j===q.A?'(A)':[1,2,4,5].includes(q.kind)&&j===q.B?'(B)':i===2?`${a+b*j*(j+1)/2}/${c+d*j}`:i===4?v.toFixed(2):display(v,j,[0,1,12,13].includes(i)?Math.max(1,style):style));
  const steps=terms.map((value,j)=>({label:`${j+1}번째 항`,expression:expressions[j],value}));steps.push({label:q.instruction,expression:q.expression,value:q.answer});
  const expressionsAreMixed=prompt.some(value=>/\d+ \d+\/\d+/.test(value));
  return build(`refseq-${i}`,name,'sequence',difficulty,seed,{question:`${prompt.join(', ')}${q.kind===3?', …':''}\n${q.instruction}${expressionsAreMixed?'\n※ 정수와 분수를 띄어 쓴 값은 대분수입니다.':''}`,answer:q.answer,unit:'',facts:{a,b,c,d,den,style,queryKind:q.kind,indexA:q.A,indexB:q.B},sequence:terms,rule,formula,signal:name,
   shortcut:`${formula}. ${q.kind===4?'A와 B를 구한 뒤 곱합니다.':q.kind===5?'A를 B로 나눕니다.':'목표 항만 복원하고 질문에서 요구한 연산을 적용합니다.'}`,steps,memo:q.expression});
 }
}));
