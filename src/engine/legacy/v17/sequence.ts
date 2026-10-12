import { build } from './build';
import { gcd, rng, primes, format } from '../../math';
import type { Difficulty, Template } from '../../types';
const names=['등차수열','등비수열','공차가 변하는 수열','계차수열','이중 계차수열','곱셈 후 덧셈','곱셈 후 뺄셈','교대 연산','홀수항·짝수항 분리','피보나치','피보나치 변형','삼각수','제곱수','세제곱수','소수 나열','분수수열','분자·분모 독립 규칙','역수수열','소수점 수열','음수 교대','부호 반복','군수열','여러 단계 연산','두 규칙 교차','복합 수열'];
export const sequenceTemplates:Template[]=names.map((name,i)=>{
 const difficulty:Difficulty=[0,1,11,12,14,18].includes(i)?'easy':[4,16,22,23,24].includes(i)?'hard':'medium';
 return {id:`seq-${i}`,name,category:name,area:'sequence',difficulty,complexity:difficulty==='easy'?'하나의 일정한 차·비율':difficulty==='hard'?'두 규칙 결합 또는 2차 이상 계차':'계차 또는 두 항 분리',generate:(seed:number)=>{
  const r=rng(seed),offset=r(0,8), terms:number[]=[],expressions:string[]=[];let a=r(2,9),b=r(2,3);
  let c=r(1,5);if([1,5,6,22,24].includes(i)&&b===3){a=r(2,4);c=r(1,3);}// 항이 약분되면 분자 줄과 분모 줄의 등차 규칙이 화면에서 사라진다. 9개 항이 모두 기약인 조합만 쓴다.
 if(i===16){const clean=(x:number,y:number)=>Array.from({length:9},(_,j)=>gcd(x+j*b,x+b+j*y)).every(g=>g===1);
  search:for(let da=0;da<8;da++)for(let dc=0;dc<8;dc++){const x=2+(a-2+da)%8,y=1+(c-1+dc)%8;if(clean(x,y)){a=x;c=y;break search;}}}if(i===6&&a*b-c===a)c=1;
  let rule='',formula='';const N=[2,3,4,21].includes(i)?12:9;
  for(let j=0;j<N;j++) {
   let x=0,e='';
   switch(i){
    case 0:x=a+j*b;e=`${a}+${j}*${b}`;rule='이웃한 항의 차가 일정합니다.';formula='aₙ = a₁ + (n−1)d';break;
    case 1:x=a*b**j;e=`${a}${Array(j).fill(`*${b}`).join('')}`;rule='이웃한 항의 비율이 일정합니다.';formula='aₙ = a₁ × rⁿ⁻¹';break;
    case 2:x=a+b*j+c*j*(j-1)/2;e=`${a}+${b}*${j}+${c}*${j}*(${j}-1)/2`;rule='공차가 일정한 양만큼 증가합니다.';formula='aₙ = a₁ + (n−1)d + c(n−1)(n−2)/2';break;
    case 3:x=a+b*j*(j+1)/2;e=`${a}+${b}*${j}*(${j}+1)/2`;rule='계차는 일정한 수의 1배, 2배, 3배, …입니다.';formula='계차 합 = b × n(n−1)/2';break;
    case 4:x=a+b*j+c*j*(j+1)*(j+2)/6;e=`${a}+${b}*${j}+${c}*${j}*(${j}+1)*(${j}+2)/6`;rule='1차 계차의 차가 등차수열을 이룹니다.';formula='3차 계차 일정 → 계차를 차례로 복원';break;
    case 5:case 6:x=j===0?a:terms[j-1]*b+(i===5?c:-c);e=j===0?String(a):`${terms[j-1]}*${b}${i===5?'+':'-'}${c}`;rule=`매번 같은 수를 곱한 뒤 일정한 수를 ${i===5?'더':'뺍'}니다.`;formula=`다음 항 = 이전 항 × r ${i===5?'+':'−'} c`;break;
    case 7:x=j===0?a:j%2?terms[j-1]+c:terms[j-1]*b;e=j===0?String(a):`${terms[j-1]}${j%2?'+':'*'}${j%2?c:b}`;rule='일정한 수 더하기와 일정한 수 곱하기를 번갈아 적용합니다.';formula='홀→짝: +c, 짝→홀: ×r';break;
    case 8:x=j%2===0?a+(j/2)*b:a*3+Math.floor(j/2)*c;e=j%2===0?`${a}+${j/2}*${b}`:`${a}*3+${Math.floor(j/2)}*${c}`;rule='홀수항과 짝수항이 각각 등차수열입니다.';formula='홀수항·짝수항을 두 줄로 분리';break;
    case 9:case 10:x=j<2?a+j*b:terms[j-1]+terms[j-2]+(i===10?c:0);e=j<2?`${a}+${j}*${b}`:`${terms[j-1]}+${terms[j-2]}${i===10?`+${c}`:''}`;rule=i===9?'세 번째 항부터 앞 두 항의 합입니다.':'세 번째 항부터 앞 두 항의 합에 일정한 수를 더합니다.';formula=i===9?'aₙ = aₙ₋₁ + aₙ₋₂':'aₙ = aₙ₋₁ + aₙ₋₂ + c';break;
    case 11:x=b*(j+c)*(j+c+1)/2;e=`${b}*(${j}+${c})*(${j}+${c}+1)/2`;rule='연속된 삼각수의 일정한 배수입니다.';formula='Tₙ = n(n+1)/2';break;
    case 12:x=(j+c)**2+a;e=`(${j}+${c})*(${j}+${c})+${a}`;rule='연속 자연수의 제곱에 일정한 수를 더합니다.';formula='aₙ = (n+k)² + c';break;
    case 13:x=(j+c)**3+a;e=`(${j}+${c})*(${j}+${c})*(${j}+${c})+${a}`;rule='연속 자연수의 세제곱에 일정한 수를 더합니다.';formula='aₙ = (n+k)³ + c';break;
    case 14:x=primes[j+offset];e=String(x);rule='연속된 소수를 나열합니다.';formula='1과 자기 자신 외 약수가 없는 다음 자연수';break;
    case 15:x=(a+j*b)/(c*11);e=`(${a}+${j}*${b})/(${c}*11)`;rule='일정한 분모로 통분하면 분자가 등차수열입니다.';formula='통분한 뒤 분자 계차 확인';break;
    case 16:x=(a+j*b)/(a+b+j*c);e=`(${a}+${j}*${b})/(${a}+${b}+${j}*${c})`;rule='약분 전 분자와 분모는 각각 등차수열입니다.';formula='분자와 분모 각각 일정한 차를 적용';break;
    case 17:x=1/(a+j*b);e=`1/(${a}+${j}*${b})`;rule='각 항의 역수가 등차수열입니다.';formula='역수로 바꾼 뒤 계차 확인';break;
    case 18:x=(a+j*b)/10;e=`(${a}+${j}*${b})/10`;rule='각 항에 10을 곱하면 등차수열입니다.';formula='소수점을 옮겨 정수로 비교';break;
    case 19:x=(j%2?-1:1)*(a+j*b);e=`${j%2?-1:1}*(${a}+${j}*${b})`;rule='절댓값은 등차수열이고 부호는 +, −로 교대합니다.';formula='크기 규칙과 부호 규칙을 분리';break;
    case 20:x=([1,1,-1][j%3])*(a+j*b);e=`${[1,1,-1][j%3]}*(${a}+${j}*${b})`;rule='절댓값은 등차수열이고 부호는 +, +, −를 반복합니다.';formula='3개씩 부호를 묶고 절댓값 계차 확인';break;
    case 21:{const group=Math.floor(j/3),pos=j%3;x=pos===0?a+group*b:pos===1?c+group*b:a+c+group*b*2;e=pos===0?`${a}+${group}*${b}`:pos===1?`${c}+${group}*${b}`:`${a}+${c}+${group}*${b}*2`;rule='3항씩 묶고 각 군의 세 번째 항은 앞 두 항의 합입니다. 각 군의 첫째·둘째 항은 각각 일정하게 증가합니다.';formula='[p, q, p+q]를 반복, p와 q는 등차';}break;
    case 22:x=j===0?a:terms[j-1]*b+(j%2?c:-c);e=j===0?String(a):`${terms[j-1]}*${b}${j%2?'+':'-'}${c}`;rule='매번 일정한 수를 곱하고, 일정한 수 더하기·빼기를 교대합니다.';formula='×r 이후 +c, −c 반복';break;
    case 23:x=j%2===0?a*b**(j/2):a*2+Math.floor(j/2)*c;e=j%2===0?`${a}${Array(j/2).fill(`*${b}`).join('')}`:`${a}*2+${Math.floor(j/2)}*${c}`;rule='홀수항은 등비, 짝수항은 등차수열입니다.';formula='홀짝 분리 후 각각 비율·차 확인';break;
    default:x=j===0?a:terms[j-1]*b+j*c;e=j===0?String(a):`${terms[j-1]}*${b}+${j}*${c}`;rule='일정한 수를 곱한 뒤 더하는 수가 같은 양만큼 증가합니다.';formula='aₙ₊₁ = r × aₙ + n × c';
   }
   terms.push(x);expressions.push(e);
  }
  // Ask for an interior term, two missing terms, or a distant term; no rule hints in the prompt.
  const show=(v:number)=>i===18?Number(v.toFixed(1)).toFixed(1):format(v);
  const nth=[2,3,4].includes(i);
  // 분자·분모를 각각 따라가는 유형은 두 빈칸의 합·차를 물으면 분모가 곱해져 메모장 계산 규모를 넘는다.
  const kind=nth?3:i===16?0:[8,21,23].includes(i)?r(1,2):r(0,2);
  const indexA=nth?r(8,11):kind===0?r(3,5):3;
  const indexB=kind===0||kind===3?indexA:7;
  const displayed=nth?terms.slice(0,6).map(show):terms.map((v,j)=>j===indexA?'(A)':kind!==0&&j===indexB?'(B)':show(v));
  const instruction=kind===0?'빈칸 (A)에 들어갈 수를 구하세요.':kind===1?'(A)+(B)의 값을 구하세요.':kind===2?'(B)−(A)의 값을 구하세요.':`${indexA+1}번째 항을 구하세요.`;
  const answer=kind===1?terms[indexA]+terms[indexB]:kind===2?terms[indexB]-terms[indexA]:terms[indexA];
  const queryExpression=kind===1?`(${terms[indexA]})+(${terms[indexB]})`:kind===2?`(${terms[indexB]})-(${terms[indexA]})`:String(answer);
  const steps=terms.map((value,j)=>({label:`${j+1}번째 항`,expression:expressions[j],value}));
  steps.push({label:instruction,expression:queryExpression,value:answer});
  return build(`seq-${i}`,name,'sequence',difficulty,seed,{question:`${displayed.join(', ')}${nth?', …':''}\n${instruction}`,answer,unit:'',facts:{a,b,c,offset,queryKind:kind,indexA,indexB},sequence:terms,rule,formula,signal:name,decimals:i===18?1:undefined,shortcut:`${formula}. ${kind===1?'A와 B를 각각 구해 더합니다.':kind===2?'B에서 A를 뺍니다.':nth?'규칙을 일반항이나 계차 합으로 바꾸어 목표 항을 바로 구합니다.':'빈칸 전후의 항에 같은 관계가 성립하는지 확인합니다.'}`,steps,memo:kind===1?`(${expressions[indexA]})+(${expressions[indexB]})`:kind===2?`(${expressions[indexB]})-(${expressions[indexA]})`:expressions[indexA]});
 }};
});
