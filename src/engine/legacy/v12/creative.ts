import { build, type Body } from './build';
import { calculate, choose, factorial, legacyFormat as format, rng } from '../../math';
import type { Difficulty, Template } from '../../types';
const groups: [string,string,string[]][] = [
 ['speed','거리·속력·시간',['기본 이동','같은 거리 왕복','속력비·시간비','도착 시간차','마주 보는 이동','같은 방향 추월','선출발 후 추월','추월 후 왕복','원형 트랙 마주침','원형 트랙 추월','두 기차 통과','기차와 터널','기차와 다리','배의 상류·하류','영역 완전 통과','시간 단위 변환']],
 ['mix','농도·혼합',['서로 다른 용액 혼합','혼합 후 농도','목표 농도 혼합량','물 추가','물 증발','용액 일부 제거','제거 후 물 보충','혼합 후 증발','가중평균 농도','농도차 역비','연속 제거·보충']],
 ['work','작업량·일률',['두 사람 공동 작업','세 사람 공동 작업','한 명 먼저 작업','작업자 이탈','작업자 추가','효율 증가','효율 감소','협업 효율 저하','작업 시너지','전체 작업량 역산','남은 작업 시간']],
 ['cost','원가·정가·비용',['원가와 이익률','정가와 할인율','할인 후 이익','할인 전 가격 역산','이익·손실 합산','두 상품 가격 비교','연속 할인','연속 인상','2+1 행사','투자 수익률','판매 수수료','고정비·변동비','손익분기점','두 제품 가격 차이','불량품 최소 판매가']],
 ['ratio','비율·평균·정수',['남녀 인원 비율','증감 후 인원 비율','전체 증가로 인원 역산','가중평균','평균 점수','일부 집단 평균','빠진 사람 점수','남음·부족','동전 개수','상품 개수 차이법','배수·약수','홀수·짝수','나머지 조건','최소공배수','나무 심기','직사각형 둘레']],
 ['count','경우의 수·확률',['기본 조합','순열','반드시 포함','반드시 제외','이웃하는 배열','이웃하지 않는 배열','원형 배치','팀 배정','같은 팀 확률','서로 다른 팀 확률','적어도 하나','정확히 한 명','연속 사건','독립 사건','여사건','최단경로','특정 지점 경유']]
];
export const creativeTemplates:Template[]=groups.flatMap(([family,category,names])=>names.map((name,i)=>{
 const easy:Record<string,number[]>={speed:[0,2,15],mix:[0,1,5,8],work:[0,1,9,10],cost:[0,1,3,8,9,11],ratio:[0,4,6,10,11,13,14,15],count:[0,1,2,3,7,13]};
 const hard:Record<string,number[]>={speed:[1,3,7,13],mix:[7,10],work:[4,7,8],cost:[2,5,14],ratio:[2,5,12],count:[4,5,10,11,16]};
 const difficulty:Difficulty=easy[family].includes(i)?'easy':hard[family].includes(i)?'hard':'medium';
 return {id:`${family}-${i}`,name,category,area:'creative' as const,difficulty,complexity:difficulty==='easy'?'기본 관계 1개':difficulty==='hard'?'조건 3개 이상 또는 역산·경우 분기':'조건 2개 또는 단위 변환',generate:(seed:number)=>build(`${family}-${i}`,category,'creative',difficulty,seed,generate(family,i,seed))};
}));
function chooseMemo(n:number,k:number):string {if(k<0||k>n)return '0';const m=Math.min(k,n-k);if(m===0)return '1';return `(${Array.from({length:m},(_,j)=>n-j).join('*')})/(${Array.from({length:m},(_,j)=>j+1).join('*')})`;}
function factorialMemo(n:number):string {return Array.from({length:n},(_,j)=>j+1).join('*')||'1';}
function generate(family:string,i:number,seed:number):Body {
 const r=rng(seed), a=r(3,8),b=r(2,5),c=r(2,6),d=r(2,5);
 let question='',expression='',unit='',formula='',signal='',shortcut='',memo='';
 let facts:Record<string,number>={};
 const steps:Body['steps']=[];
 const step=(label:string,e:string)=>{const v=calculate(e);steps.push({label,expression:e,value:v});return v;};
 if(family==='speed') {
  const slow=a*6,fast=slow+b*6,t=r(4,12),dist=c*6;
  facts={slow,fast,t,dist,c,a,b};formula='거리 = 속력 × 시간; 상대속력은 합 또는 차';signal='같은 방향 → 차, 반대 방향 → 합, 완전 통과 → 길이 합';unit='분';
  switch(i){
   case 0:question=`자동차가 시속 ${slow}km로 ${c*60}분 동안 일정하게 이동했다. 이동 거리는?`;expression=`${slow}*${c}`;unit='km';break;
   case 1:question=`편도 ${dist}km인 같은 길을 갈 때는 시속 ${slow}km, 올 때는 시속 ${fast}km로 이동했다. 휴식 없이 왕복하는 데 걸린 시간은?`;expression=`(${dist}/${slow}+${dist}/${fast})*60`;break;
   case 2:question=`동일한 거리를 이동하는 A와 B의 속력비는 ${a}:${b}이다. A가 ${t}분 걸렸다면 B의 이동 시간은?`;expression=`${t}*${a}/${b}`;break;
   case 3:question=`같은 구간을 시속 ${slow}km로 달릴 때보다 시속 ${fast}km로 달릴 때 ${t}분 일찍 도착한다. 구간의 길이는?`;expression=`(${t}/60)/ (1/${slow}-1/${fast})`;unit='km';break;
   case 4:question=`${dist}km 떨어진 두 차량이 같은 시각에 서로를 향해 시속 ${slow}km와 ${fast}km로 출발한다. 몇 분 후 만나는가?`;expression=`${dist}/(${slow}+${fast})*60`;break;
   case 5:question=`시속 ${slow}km인 차량의 ${t}km 뒤에서 시속 ${fast}km인 차량이 같은 방향으로 동시에 출발한다. 추월까지 걸리는 시간은?`;expression=`${t}/(${fast}-${slow})*60`;break;
   case 6:question=`A가 시속 ${slow}km로 출발하고 ${t}분 뒤 B가 같은 곳에서 시속 ${fast}km로 따라 출발했다. B 출발 후 A를 따라잡기까지 몇 분인가?`;expression=`${slow}*${t}/(${fast}-${slow})`;break;
   case 7:question=`A가 시속 ${slow}km로 출발한 ${t}분 뒤, B가 같은 곳에서 시속 ${fast}km로 출발했다. B는 A를 처음 따라잡은 즉시 같은 속력으로 출발점까지 돌아왔다. B의 총 이동 시간은?`;expression=`2*${slow}*${t}/(${fast}-${slow})`;break;
   case 8:facts.dist=c;question=`둘레 ${c}km인 원형 트랙에서 두 자동차가 같은 지점에서 반대 방향으로 시속 ${slow}km와 ${fast}km로 달린다. 출발 이후 처음 다시 만나는 시간은?`;expression=`${c}/(${slow}+${fast})*60`;break;
   case 9:facts.dist=c;question=`둘레 ${c}km인 원형 트랙에서 같은 지점에서 같은 방향으로 시속 ${slow}km와 ${fast}km로 출발한다. 빠른 사람이 처음 한 바퀴 앞서는 시간은?`;expression=`${c}/(${fast}-${slow})*60`;break;
   case 10: facts.l1=a*20;facts.l2=b*30;question=`길이 ${facts.l1}m와 ${facts.l2}m인 두 기차가 초속 ${a}m와 ${b}m로 마주 달린다. 앞부분이 만난 순간부터 완전히 통과할 때까지 걸리는 시간은?`;expression=`(${facts.l1}+${facts.l2})/(${a}+${b})`;unit='초';break;
   case 11:case 12: facts.length=a*20;facts.region=c*100;question=`길이 ${facts.length}m인 기차가 시속 ${slow}km로 길이 ${facts.region}m인 ${i===11?'터널':'다리'}을 통과한다. 앞부분 진입부터 뒷부분 이탈까지의 시간은?`;expression=`(${facts.length}+${facts.region})/(${slow}/3.6)`;unit='초';break;
   case 13: facts.slow=a*3;facts.water=a;facts.dist=c*a;question=`정수에서 시속 ${facts.slow}km인 배가 유속 ${facts.water}km인 강을 따라 편도 ${facts.dist}km를 왕복한다. 휴식 시간은 없을 때 총 소요 시간은?`;expression=`(${facts.dist}/(${facts.slow}-${facts.water})+${facts.dist}/(${facts.slow}+${facts.water}))*60`;break;
   case 14:facts.length=a*10;facts.region=c*10;question=`지름 ${facts.length}km의 원형 기상 현상이 폭 ${facts.region}km의 직선 구간을 수직으로 시속 ${slow}km로 지난다. 맨 앞부분 진입부터 맨 뒷부분 이탈까지 시간은?`;expression=`(${facts.length}+${facts.region})/${slow}*60`;break;
   default:question=`시속 ${slow}km로 ${t*60}초 동안 이동한 거리는?`;expression=`${slow}*${t}*60/3600*1000`;unit='m';
  }
  shortcut='합·차로 상대속력을 정한 뒤 필요한 이동 거리만 나눕니다. 왕복은 각 구간 시간을 더합니다.';
 } else if(family==='mix') {
  const low=a,high=a+b*3,m1=c*100,m2=d*100,target=(low+high)/2,remove=20;facts={low,high,m1,m2,target,remove};formula='용질량 = 용액량 × 농도 / 100';signal='물 추가·증발 → 용질 보존, 용액 제거 → 같은 농도로 제거';unit='g';
  switch(i){
   case 0:case 1:case 8:facts.dist=c;question=`농도 ${low}% 용액 ${m1}g과 ${high}% 용액 ${m2}g을 섞는다. 용질은 반응하지 않고 질량은 더해질 때 최종 농도는?`;expression=`(${low}*${m1}+${high}*${m2})/(${m1}+${m2})`;unit='%';break;
   case 2:case 9:question=`농도 ${low}% 용액 ${m1}g에 ${high}% 용액을 더해 ${target}%로 만든다. 더할 용액의 질량은?`;expression=`${m1}*(${target}-${low})/(${high}-${target})`;break;
   case 3:question=`농도 ${high}% 용액 ${m1}g에 순수한 물을 넣어 ${low}%로 만든다. 추가한 물은?`;expression=`${m1}*(${high}/${low}-1)`;break;
   case 4:question=`농도 ${low}% 용액 ${m1}g에서 물만 증발시켜 ${high}%로 만든다. 증발한 물의 질량은?`;expression=`${m1}*(1-${low}/${high})`;break;
   case 5:question=`균일한 농도 ${high}% 용액 ${m1}g의 ${remove}%를 덜어냈다. 남은 용질의 질량은?`;expression=`${m1}*${high}/100*(1-${remove}/100)`;break;
   case 6:question=`균일한 농도 ${high}% 용액 ${m1}g에서 ${remove}%를 덜어낸 뒤 같은 질량의 물을 채웠다. 최종 농도는?`;expression=`${high}*(1-${remove}/100)`;unit='%';break;
   case 7:facts.evap=c*20;question=`${low}% 용액 ${m1}g과 ${high}% 용액 ${m2}g을 혼합한 뒤 물 ${facts.evap}g만 증발시켰다. 최종 농도는?`;expression=`(${low}*${m1}+${high}*${m2})/(${m1}+${m2}-${facts.evap})`;unit='%';break;
   default:facts.times=r(2,3);question=`농도 ${high}% 용액에서 전체의 ${remove}%를 덜어내고 같은 질량의 물을 채운다. 매번 충분히 섞으며 이 작업을 ${facts.times}회 반복했을 때 최종 농도는?`;expression=`${high}${Array(facts.times).fill(`*(1-${remove}/100)`).join('')}`;unit='%';
  }
  shortcut='용질량 보존식을 세웁니다. 덜어내고 물을 채우면 농도에 남은 비율을 곱합니다.';
 } else if(family==='work') {
  const A=a*4,B=b*6,C=c*8,early=1,eff=i===6?r(10,18)*5:i===7?90:r(11,19)*10;
  facts={A,B,C,early,eff,units:c*100};unit='시간';formula='완성 비율 = 시간 × (1/단독 완료시간)';signal='공동 작업 → 일률 합, 중간 변경 → 작업 구간 분리';
  switch(i){
   case 0:question=`동일한 일을 A는 ${A}시간, B는 ${B}시간에 혼자 마친다. 두 사람이 일정한 효율로 함께 하면 완료까지 시간은?`;expression=`1/(1/${A}+1/${B})`;break;
   case 1:question=`한 일을 혼자 마치는 데 A는 ${A}시간, B는 ${B}시간, C는 ${C}시간이 걸린다. 세 사람의 일률이 더해질 때 공동 작업 시간은?`;expression=`1/(1/${A}+1/${B}+1/${C})`;break;
   case 2:question=`A 혼자 ${A}시간, B 혼자 ${B}시간이 필요한 일에서 A가 먼저 ${early}시간 일한 뒤 B가 합류한다. 합류 후 남은 시간은?`;expression=`(1-${early}/${A})/(1/${A}+1/${B})`;break;
   case 3:question=`A와 B의 단독 완료 시간은 각각 ${A}, ${B}시간이다. 함께 ${early}시간 작업한 뒤 B가 떠났다. 이후 A가 일을 마치는 데 필요한 시간은?`;expression=`(1-${early}*(1/${A}+1/${B}))*${A}`;break;
   case 4:question=`단독 완료 시간이 ${A}, ${B}, ${C}시간인 A, B, C 중 A와 B가 먼저 ${early}시간 작업하고 C가 합류했다. 합류 후 남은 시간은?`;expression=`(1-${early}*(1/${A}+1/${B}))/(1/${A}+1/${B}+1/${C})`;break;
   case 5:case 6:question=`A가 평소 혼자 ${A}시간에 마치는 일을, 처음부터 평소의 ${eff}% 일률로 작업한다. 완료 시간은?`;expression=`${A}/(${eff}/100)`;break;
   case 7:case 8:facts.dist=c;question=`A와 B의 단독 완료 시간은 ${A}, ${B}시간이다. A가 먼저 ${early}시간 작업한 뒤 B가 합류한다. 함께 작업할 때 전체 일률은 두 단독 일률 합의 ${eff}%가 된다. 합류 후 남은 시간은?`;expression=`(1-${early}/${A})/((1/${A}+1/${B})*${eff}/100)`;break;
   case 9:question=`한 설비가 시간당 ${a}개를 생산한다. ${b}대가 같은 효율로 ${c}시간 가동했다면 전체 생산량은?`;expression=`${a}*${b}*${c}`;facts={a,b,c};unit='개';break;
   default:question=`A가 혼자 ${A}시간에 하는 일의 ${c*10}%가 이미 끝났다. 남은 일을 A 혼자 마치는 시간은?`;expression=`${A}*(1-${c*10}/100)`;facts.completed=c*10;
  }
  shortcut='전체 일을 1로 놓고 완료 비율을 먼저 뺀 뒤 남은 비율을 현재 일률로 나눕니다.';
 } else if(family==='cost') {
  const cost=a*1000,markup=r(7,17)*5,discount=b*5,price=cost*(1+markup/100),fixed=c*10000,variable=b*100,count=100,fee=5;
  facts={cost,markup,discount,price,fixed,variable,count,fee};formula='이익 = 매출 − 비용; 연속 비율은 곱한다';signal='연속 할인 → 비율 곱, 손익분기 → 고정비 ÷ 개당 공헌이익';unit='원';
  switch(i){
   case 0:question=`원가 ${cost}원인 상품을 원가 대비 ${markup}% 이익을 붙여 판매한다. 판매가는?`;expression=`${cost}*(1+${markup}/100)`;break;
   case 1:question=`정가 ${format(price)}원인 상품을 ${discount}% 할인한다. 실제 판매가는?`;expression=`${price}*(1-${discount}/100)`;break;
   case 2:question=`원가 ${cost}원에 ${markup}%를 붙여 정가를 정하고 정가에서 ${discount}% 할인해 판매한다. 개당 이익은?`;expression=`${cost}*(1+${markup}/100)*(1-${discount}/100)-${cost}`;break;
   case 3:question=`${discount}% 할인한 판매가가 ${format(price*(1-discount/100))}원이다. 할인 전 정가는?`;expression=`${price*(1-discount/100)}/(1-${discount}/100)`;break;
   case 4:question=`원가가 각각 ${cost}원인 상품 두 개 중 하나는 ${markup}% 이익, 다른 하나는 ${discount}% 손실로 팔았다. 총이익은?`;expression=`${cost}*(${markup}-${discount})/100`;break;
   case 5:question=`A 상품 정가는 ${format(price)}원, B 상품 정가는 ${cost}원이다. A는 ${discount}% 할인, B는 ${b}% 할인한다. A의 판매가가 B보다 얼마나 비싼가?`;expression=`${price}*(1-${discount}/100)-${cost}*(1-${b}/100)`;facts.b=b;break;
   case 6:question=`정가 ${format(price)}원에서 먼저 ${discount}%, 할인된 가격에서 다시 ${b}% 할인한다. 최종 판매가는?`;expression=`${price}*(1-${discount}/100)*(1-${b}/100)`;facts.b=b;break;
   case 7:question=`가격 ${cost}원을 먼저 ${discount}% 올리고, 오른 가격에서 다시 ${b}% 올렸다. 최종 가격은?`;expression=`${cost}*(1+${discount}/100)*(1+${b}/100)`;facts.b=b;break;
   case 8:facts.dist=c;question=`개당 ${cost}원인 상품의 '2개 값으로 3개 제공' 행사를 이용한다. ${c*3}개를 구매할 때 총지불액은?`;expression=`${cost}*${c}*2`;facts.bundles=c;break;
   case 9:question=`${cost*100}원을 투자하여 수수료 없이 원금 대비 ${discount}%의 수익을 얻었다. 원금을 포함한 회수 금액은?`;expression=`${cost}*100*(1+${discount}/100)`;break;
   case 10:question=`판매가 ${format(price)}원에서 ${fee}% 판매 수수료를 뗀다. 상품 원가 ${cost}원 외 비용이 없다면 순이익은?`;expression=`${price}*(1-${fee}/100)-${cost}`;break;
   case 11:question=`고정비 ${fixed}원, 제품 한 개의 변동비 ${variable}원이다. ${count}개 생산 시 총비용은?`;expression=`${fixed}+${variable}*${count}`;break;
   case 12:memo=`${fixed}/(${cost}-${variable})`;step('판매 수량 하한',memo);question=`고정비 ${fixed}원, 개당 변동비 ${variable}원, 개당 판매가 ${cost}원이다. 손실이 나지 않으려면 최소 몇 개를 판매해야 하는가?`;expression=String(Math.ceil(fixed/(cost-variable)));unit='개';break;
   case 13:facts.n=c*10;facts.expensive=b*100+cost;facts.total=facts.n*cost+d*facts.expensive;facts.n+=d;question=`${cost}원짜리와 ${facts.expensive}원짜리를 합해 ${facts.n}개 샀다. 총액 ${facts.total}원일 때 비싼 상품의 개수는?`;expression=`(${facts.total}-${facts.n}*${cost})/(${facts.expensive}-${cost})`;unit='개';break;
   default:facts.defects=discount;memo=`${cost}*${count}/(${count}*(1-${discount}/100))`;step('정상 제품당 원가 하한',memo);question=`원가 ${cost}원인 상품 ${count}개 중 ${discount}%가 불량으로 폐기되었다. 정상 제품을 모두 같은 가격에 팔아 원가 총액 이상을 회수하려면 개당 최소 판매가는? (1원 단위 올림, 다른 비용 없음)`;expression=String(Math.ceil(cost*count/(count*(1-discount/100))));
  }
  shortcut='원가·정가·실판매가를 구분합니다. 연속 비율은 곱하고, 최소 수량·가격은 마지막에 올림합니다.';
 } else if(family==='ratio') {
  const men=a*20,women=b*20,N=men+women,s1=60+c*5,s2=50+d*5;
  facts={a,b,c,d,men,women,N,s1,s2};unit='명';formula='전체 합 = 각 집단 인원 × 평균의 합';signal='전부 한 종류로 가정 → 총액 차이를 단가 차이로 나눔';
  switch(i){
   case 0:question=`남녀 비율 ${a}:${b}인 동아리의 전체 인원은 ${N}명이다. 남학생은 몇 명인가?`;expression=`${N}*${a}/(${a}+${b})`;break;
   case 1:question=`남학생 ${men}명과 여학생 ${women}명이 있었다. 남학생은 20%, 여학생은 10% 늘었다. 늘어난 뒤 남학생 수를 여학생 수로 나눈 값은?`;expression=`(${men}*1.2)/(${women}*1.1)`;unit='배';break;
   case 2:facts.increase=men*0.2+women*0.1;question=`전체 ${N}명인 모임에서 남학생은 20%, 여학생은 10% 늘어 총 ${facts.increase}명이 증가했다. 증가 전 남학생 수는?`;expression=`(${facts.increase}-${N}*0.1)/0.1`;break;
   case 3:case 4:question=`${a}명의 평균 점수는 ${s1}점, 나머지 ${b}명의 평균은 ${s2}점이다. 전체 ${a+b}명의 평균은?`;expression=`(${a}*${s1}+${b}*${s2})/(${a}+${b})`;unit='점';break;
   case 5:facts.average=(a*s1+b*s2)/(a+b);question=`${a+b}명의 평균은 ${format(facts.average)}점이다. 그중 ${a}명의 평균이 ${s1}점이면 나머지 ${b}명의 평균은?`;expression=`(${facts.average}*(${a}+${b})-${a}*${s1})/${b}`;unit='점';break;
   case 6:facts.total=s1*a+s2;question=`${a+1}명의 점수 합계는 ${facts.total}점이다. 한 명을 제외한 ${a}명의 평균이 ${s1}점이라면 제외된 한 명의 점수는?`;expression=`${facts.total}-${a}*${s1}`;unit='점';break;
   case 7:facts.left=a;facts.short=b;facts.per1=c;facts.per2=c+1;facts.items=(a+b)*c+a;question=`사람들에게 물건을 ${c}개씩 주면 ${a}개가 남고 ${c+1}개씩 주면 ${b}개가 부족하다. 사람 수는?`;expression=`(${a}+${b})/((${c+1})-${c})`;break;
   case 8:case 9:facts.cheap=100;facts.expensive=100+b*100;facts.n=a+c;facts.total=a*100+c*facts.expensive;question=`${facts.cheap}원짜리 ${i===8?'동전':'상품'}과 ${facts.expensive}원짜리를 합해 ${facts.n}개 가지고 있다. 총액 ${facts.total}원일 때 ${facts.expensive}원짜리는 몇 개인가?`;expression=`(${facts.total}-${facts.n}*${facts.cheap})/(${facts.expensive}-${facts.cheap})`;unit='개';break;
   case 10:facts.limit=r(20,500);question=`1부터 ${facts.limit}까지의 자연수 중 ${b}의 배수는 몇 개인가?`;expression=String(Math.floor(facts.limit/b));unit='개';break;
   case 11:facts.limit=r(15,199);question=`1부터 ${facts.limit}까지의 자연수 중 홀수는 몇 개인가?`;expression=String(Math.ceil(facts.limit/2));unit='개';break;
   case 12:facts.mod1=[3,5,7][r(0,2)];facts.mod2=[11,13,17][r(0,2)];facts.rem1=r(0,facts.mod1-1);facts.rem2=r(0,facts.mod2-1);{let x=1;while(x%facts.mod1!==facts.rem1||x%facts.mod2!==facts.rem2)x++;question=`${facts.mod1}로 나눈 나머지가 ${facts.rem1}, ${facts.mod2}로 나눈 나머지가 ${facts.rem2}인 가장 작은 양의 정수는?`;expression=String(x);unit='';}break;
   case 13:facts.p=2*a;facts.q=3*b;{let x=facts.p;while(x%facts.q!==0)x+=facts.p;question=`${facts.p}와 ${facts.q}의 최소공배수는?`;expression=String(x);unit='';}break;
   case 14:facts.length=a*b*10;facts.gap=b*10;question=`길이 ${facts.length}m의 직선 길에 ${facts.gap}m 간격으로 양 끝을 포함하여 나무를 심는다. 필요한 나무 수는?`;expression=`${facts.length}/${facts.gap}+1`;unit='그루';break;
   default:facts.width=a;facts.length=a+b;question=`직사각형의 가로가 세로보다 ${b}m 길고 둘레가 ${2*(a+a+b)}m이다. 세로 길이는?`;expression=`(${2*(a+a+b)}/2-${b})/2`;unit='m';
  }
  shortcut='총합을 유지하는 식으로 역산합니다. 인원·개수는 정수인지 마지막에 확인합니다.';
 } else {
  const n=r([10,11].includes(i)?6:[4,5,6].includes(i)?3:5,[4,5,6].includes(i)?6:i===1?9:10),k=r(2,4),red=r(2,[10,11].includes(i)?n-k:n-2),blue=n-red;facts={n,k,red,blue,a,b};unit='가지';formula='조합 C(n,r), 순열 n!/(n−r)!, 확률 = 유리한 경우 / 전체 경우';signal='순서 구분 여부부터 판단, 적어도 하나 → 여사건';
  const arrayWays=(size:number,pool:number)=>i===4?choose(pool-2,size-2)*2*factorial(size-1):i===5?choose(pool-2,size-2)*(factorial(size)-2*factorial(size-1)):choose(pool,size)*factorial(size-1);
  switch(i){
   case 0:question=`서로 다른 ${n}명 중 ${k}명을 순서 없이 뽑는 방법 수는?`;expression=chooseMemo(n,k);break;
   case 1:facts.roles=r(2,4);question=`서로 다른 ${n}명 중 ${facts.roles}개의 서로 다른 역할을 서로 다른 사람에게 하나씩 맡기는 방법 수는?`;expression=Array.from({length:facts.roles},(_,j)=>String(n-j)).join('*');break;
   case 2:question=`${n}명 중 ${k}명의 대표를 뽑되 지정된 A는 반드시 포함한다. 순서 없는 방법 수는?`;expression=chooseMemo(n-1,k-1);break;
   case 3:question=`${n}명 중 ${k}명의 대표를 뽑되 지정된 A는 제외한다. 순서 없는 방법 수는?`;expression=chooseMemo(n-1,k);break;
   case 4:facts.pool=n+r(1,10);while(arrayWays(n,facts.pool)>4000)facts.pool--;question=`서로 다른 ${facts.pool}명 중 지정된 A와 B를 포함하여 ${n}명을 뽑아 일렬로 세운다. A와 B가 이웃하는 배열 수는?`;expression=`(${chooseMemo(facts.pool-2,n-2)})*2*(${factorialMemo(n-1)})`;break;
   case 5:facts.pool=n+r(1,10);while(arrayWays(n,facts.pool)>4000)facts.pool--;question=`서로 다른 ${facts.pool}명 중 지정된 A와 B를 포함하여 ${n}명을 뽑아 일렬로 세운다. A와 B가 이웃하지 않는 배열 수는?`;expression=`(${chooseMemo(facts.pool-2,n-2)})*((${factorialMemo(n)})-2*(${factorialMemo(n-1)}))`;break;
   case 6:facts.pool=n+r(1,10);while(arrayWays(n,facts.pool)>4000)facts.pool--;question=`서로 다른 ${facts.pool}명 중 ${n}명을 골라 원탁에 앉힌다. 회전해서 같은 배치는 같고, 거울상은 다른 것으로 셀 때 배치 수는?`;expression=`(${chooseMemo(facts.pool,n)})*(${factorialMemo(n-1)})`;break;
   case 7:question=`${n}명을 이름이 다른 A팀 ${k}명, B팀 ${n-k}명으로 나누는 방법 수는? (팀 안의 순서 없음)`;expression=chooseMemo(n,k);break;
   case 8:case 9:facts.team=r(2,7);facts.teams=r(2,5);facts.n=facts.team*facts.teams;question=`${facts.n}명을 무작위로 이름이 다른 ${facts.teams}개 팀에 ${facts.team}명씩 배정한다. 지정된 A와 B가 ${i===8?'같은':'서로 다른'} 팀일 확률은?`;expression=i===8?`(${facts.team}-1)/(${facts.n}-1)`:`(${facts.n}-${facts.team})/(${facts.n}-1)`;unit='확률';break;
   case 10:question=`빨간 공 ${red}개와 파란 공 ${blue}개에서 동시에 ${k}개를 균등하게 뽑는다. 빨간 공이 적어도 하나일 확률은?`;expression=`1-(${chooseMemo(blue,k)})/(${chooseMemo(n,k)})`;unit='확률';break;
   case 11:question=`빨간 공 ${red}개와 파란 공 ${blue}개에서 동시에 ${k}개를 균등하게 뽑는다. 빨간 공이 정확히 하나일 확률은?`;expression=`${red}*(${chooseMemo(blue,k-1)})/(${chooseMemo(n,k)})`;unit='확률';break;
   case 12:question=`빨간 공 ${red}개와 파란 공 ${blue}개에서 한 개씩 두 번, 돌려놓지 않고 뽑는다. 두 번 모두 빨간 공일 확률은?`;expression=`${red}/${n}*(${red}-1)/(${n}-1)`;unit='확률';break;
   case 13:question=`성공 확률이 각각 1/${a}, 1/${b}인 서로 독립인 두 시행이 모두 성공할 확률은?`;expression=`1/${a}*1/${b}`;unit='확률';break;
   case 14:facts.trials=r(2,3);facts.a=r(2,11);question=`성공 확률이 1/${facts.a}인 독립 시행을 ${facts.trials}회 할 때 적어도 한 번 성공할 확률은?`;expression='1-'+Array(facts.trials).fill(`(1-1/${facts.a})`).join('*');unit='확률';break;
   case 15:question=`격자에서 오른쪽 ${a}칸, 위 ${b}칸 떨어진 점까지 오른쪽 또는 위로만 한 칸씩 이동한다. 최단경로 수는?`;expression=chooseMemo(a+b,a);break;
   default:facts.x=2;facts.y=1;question=`(0,0)에서 (${a},${b})까지 오른쪽·위로만 한 칸씩 이동하되 반드시 (2,1)을 지나는 최단경로 수는?`;expression=`(${chooseMemo(3,2)})*(${chooseMemo(a+b-3,a-2)})`;
  }
  shortcut='순서가 없으면 조합, 있으면 순열입니다. 확률은 같은 조건의 전체 경우와 유리한 경우를 셉니다.';
 }
 if(family==='speed'){
  if([4,8].includes(i))step('상대속력(km/h)',`${facts.slow}+${facts.fast}`);
  if([5,6,7,9].includes(i))step('상대속력(km/h)',`${facts.fast}-${facts.slow}`);
  if([6,7].includes(i))step('선출발로 생긴 거리(km)',`${facts.slow}*${facts.t}/60`);
  if([11,12,14].includes(i))step('완전 통과에 필요한 거리',`${facts.length}+${facts.region}`);
  if([11,12].includes(i))step('초속(m/s)으로 환산',`${facts.slow}/3.6`);
 }
 if(family==='mix'){
  step('첫 용액의 용질량(g)',`${[3,5,6,10].includes(i)?facts.high:facts.low}*${facts.m1}/100`);
  if([0,1,7,8].includes(i))step('둘째 용액의 용질량(g)',`${facts.high}*${facts.m2}/100`);
 }
 if(family==='work'&&i!==9){step('A의 시간당 작업 비율',`1/${facts.A}`);if([0,1,2,3,4,7,8].includes(i))step('B의 시간당 작업 비율',`1/${facts.B}`);}
 if(family==='cost'){
  if(i===2)step('정가(원)',`${facts.cost}*(1+${facts.markup}/100)`);
  if(i===6)step('첫 할인 후 금액(원)',`${facts.price}*(1-${facts.discount}/100)`);
  if(i===12)step('개당 공헌이익(원)',`${facts.cost}-${facts.variable}`);
  if(i===13)step('전부 싼 제품이라고 가정한 총액(원)',`${facts.n}*${facts.cost}`);
  if(i===14){step('정상 제품 수(개)',`${facts.count}*(1-${facts.defects}/100)`);step('회수해야 할 전체 원가(원)',`${facts.cost}*${facts.count}`);}
 }
 if(family==='ratio'&&i===5){step('전체 점수 합계',`${facts.average}*(${facts.a}+${facts.b})`);step('알려진 집단의 점수 합계',`${facts.a}*${facts.s1}`);}
 if(family==='ratio'&&[8,9].includes(i))step('전부 싼 종류라고 가정한 총액(원)',`${facts.n}*${facts.cheap}`);
 if(family==='count'&&[4,5,6].includes(i)){step('뽑을 사람 선택',chooseMemo(facts.pool-(i===6?0:2),facts.n-(i===6?0:2)));step(i===6?'한 자리를 고정한 원탁 배열':'A·B를 한 묶음으로 본 배열',factorialMemo(facts.n-1));}
 const answer=step('정답 계산',expression);
 const method=family==='speed'&&[6,7].includes(i)?'선출발 시간을 분으로 유지하면 60 변환이 약분됩니다. 선두 속력 × 선출발 시간 ÷ 속력차를 입력합니다.':family==='speed'?'구간별 시간만 계산하고 분·초 단위를 마지막에 맞춥니다.':family==='mix'?'물 추가·증발은 소금량이 그대로입니다. 제거·보충은 남은 비율만 곱합니다.':family==='work'?'전체를 1로 놓고 먼저 끝낸 비율을 뺀 뒤 현재 일률 합으로 나눕니다.':family==='cost'&&[12,14].includes(i)?'비용 합계를 회수 단위로 나눈 뒤 마지막 값만 올림합니다.':family==='cost'?'할인·인상 비율은 곱하고, 매출에서 비용을 한 번만 뺍니다.':family==='ratio'?'총합에서 알려진 몫을 먼저 빼세요. 개수 문제는 전부 싼 종류라고 놓고 차액을 단가 차이로 나눕니다.':i===4?'A·B를 한 묶음으로 보세요. 나머지 사람을 고르는 수 × 묶음 배열 × A·B 내부 순서 2만 계산합니다.':i===5?'전체 배열에서 A·B가 붙어 있는 배열을 한 번 빼세요. 나머지 인원 선택 수를 마지막에 곱합니다.':i===6?'회전 중복을 없애려고 한 사람의 자리만 고정하세요. 인원 선택 수 × 남은 자리 배열로 계산합니다.':'먼저 순서 구분 여부를 정하세요. 포함 인원은 고정하고 남은 자리를 세며, 확률은 여사건이나 유리한 경우 ÷ 전체 경우로 계산합니다.';
 shortcut=`${method} 메모장 계산식: ${memo||expression}`;
 return {question,answer,unit,facts,steps,formula,signal,shortcut,memo:memo||expression};
}
