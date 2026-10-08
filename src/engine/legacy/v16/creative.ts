import { build, type Body } from './build';
import { calculate, choose, factorial, format, gcd, rng } from '../../math';
import { creativeGuidance } from '../../guidance';
import { eul, ro, wa } from '../../korean';
import type { Difficulty, Template } from '../../types';
const groups: [string,string,string[]][] = [
 ['speed','거리·속력·시간',['기본 이동','같은 거리 왕복','속력비·시간비','도착 시간차','마주 보는 이동','같은 방향 추월','선출발 후 추월','추월 후 왕복','원형 트랙 마주침','원형 트랙 추월','두 기차 통과','기차와 터널','기차와 다리','배의 상류·하류','영역 완전 통과','시간 단위 변환']],
 ['mix','농도·혼합',['서로 다른 용액 혼합','혼합 후 농도','목표 농도 혼합량','물 추가','물 증발','용액 일부 제거','제거 후 물 보충','혼합 후 증발','가중평균 농도','농도차 역비','연속 제거·보충']],
 ['work','작업량·일률',['두 사람 공동 작업','세 사람 공동 작업','한 명 먼저 작업','작업자 이탈','작업자 추가','효율 증가','효율 감소','협업 효율 저하','작업 시너지','설비 가동 생산량','남은 작업 시간']],
 ['cost','원가·정가·비용',['원가와 이익률','정가와 할인율','할인 후 이익','할인 전 가격 역산','이익·손실 합산','두 상품 가격 비교','연속 할인','연속 인상','2+1 행사','투자 수익률','판매 수수료','고정비·변동비','손익분기점','두 제품 개수 차이법','불량품 최소 판매가']],
 ['ratio','비율·평균·정수',['남녀 인원 비율','증감 후 인원 비율','전체 증가로 인원 역산','가중평균','평균 점수','일부 집단 평균','빠진 사람 점수','남음·부족','동전 개수','상품 개수 차이법','배수·약수','홀수·짝수','나머지 조건','최소공배수','나무 심기','직사각형 둘레']],
 ['count','경우의 수·확률',['기본 조합','순열','반드시 포함','반드시 제외','이웃하는 배열','이웃하지 않는 배열','원형 배치','팀 배정','같은 팀 확률','서로 다른 팀 확률','적어도 하나','정확히 하나','연속 사건','독립 사건','여사건','최단경로','특정 지점 경유']]
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
  facts={slow,fast,t,dist,c,a,b};unit='분';
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
   case 10: facts.l1=r(4,14)*20;facts.l2=r(4,14)*20;question=`길이 ${facts.l1}m와 ${facts.l2}m인 두 기차가 초속 ${a}m와 ${b}m로 마주 달린다. 앞부분이 만난 순간부터 완전히 통과할 때까지 걸리는 시간은?`;expression=`(${facts.l1}+${facts.l2})/(${a}+${b})`;unit='초';break;
   case 11:case 12: {facts.length=r(4,14)*20;facts.region=r(2,14)*100;const crossing=i===11?'터널':'다리';question=`길이 ${facts.length}m인 기차가 시속 ${slow}km로 길이 ${facts.region}m인 ${crossing}${eul(crossing)} 통과한다. 앞부분 진입부터 뒷부분 이탈까지의 시간은?`;}expression=`(${facts.length}+${facts.region})/(${slow}/3.6)`;unit='초';break;
   // 유속이 배 속력의 1/3로 고정돼 있어 정답이 한 변수에만 좌우됐다.
   case 13: {const water=r(1,5),speed=water+r(3,10),up=speed-water,down=speed+water;
    const unit=up*down/gcd(120*speed,up*down),perUnit=120*speed/gcd(120*speed,up*down);
    facts.water=water;facts.slow=speed;facts.dist=unit*r(1,Math.max(1,Math.floor(480/perUnit)));}question=`정수에서 시속 ${facts.slow}km인 배가 유속 ${facts.water}km인 강을 따라 편도 ${facts.dist}km를 왕복한다. 휴식 시간은 없을 때 총 소요 시간은?`;expression=`(${facts.dist}/(${facts.slow}-${facts.water})+${facts.dist}/(${facts.slow}+${facts.water}))*60`;break;
   case 14:facts.length=a*10;facts.region=c*10;question=`지름 ${facts.length}km의 원형 기상 현상이 폭 ${facts.region}km의 직선 구간을 수직으로 시속 ${slow}km로 지난다. 맨 앞부분 진입부터 맨 뒷부분 이탈까지 시간은?`;expression=`(${facts.length}+${facts.region})/${slow}*60`;break;
   default:question=`시속 ${slow}km로 ${t*60}초 동안 이동한 거리는?`;expression=`${slow}*${t}*60/3600*1000`;unit='m';
  }
 } else if(family==='mix') {
  // 목표 농도를 두 농도의 한가운데로 두면 농도차가 늘 1:1이 되어 '더할 질량 = 기준 질량'이 항상 성립한다.
  const near=r(1,4),far=r(1,4),span=r(2,5);
  const low=r(3,12),high=low+(near+far)*span,target=low+near*span;
  const m1=far*r(1,9)*100,m2=r(1,8)*100,remove=r(2,6)*10;
  facts={low,high,m1,m2,target,remove,near,far};unit='g';
  switch(i){
   case 0:case 1:case 8:facts.dist=c;question=`농도 ${low}% 용액 ${m1}g과 ${high}% 용액 ${m2}g을 섞는다. 용질은 반응하지 않고 질량은 더해질 때 최종 농도는?`;expression=`(${low}*${m1}+${high}*${m2})/(${m1}+${m2})`;unit='%';break;
   case 2:case 9:question=`농도 ${low}% 용액 ${m1}g에 ${high}% 용액을 더해 ${target}%로 만든다. 더할 용액의 질량은?`;expression=`${m1}*(${target}-${low})/(${high}-${target})`;break;
   case 3:{const times=r(2,5),weak=r(2,9),strong=weak*times;facts.low=weak;facts.high=strong;facts.m1=r(2,9)*100;
    question=`농도 ${strong}% 용액 ${facts.m1}g에 순수한 물을 넣어 ${weak}%로 만든다. 추가한 물은?`;expression=`${facts.m1}*(${strong}/${weak}-1)`;}break;
   case 4:{const times=r(2,5),weak=r(2,9),strong=weak*times;facts.low=weak;facts.high=strong;facts.m1=r(2,9)*100;
    question=`농도 ${weak}% 용액 ${facts.m1}g에서 물만 증발시켜 ${strong}%로 만든다. 증발한 물의 질량은?`;expression=`${facts.m1}*(1-${weak}/${strong})`;}break;
   case 5:question=`균일한 농도 ${high}% 용액 ${m1}g의 ${remove}%를 덜어냈다. 남은 용질의 질량은?`;expression=`${m1}*${high}/100*(1-${remove}/100)`;break;
   case 6:question=`균일한 농도 ${high}% 용액 ${m1}g에서 ${remove}%를 덜어낸 뒤 같은 질량의 물을 채웠다. 최종 농도는?`;expression=`${high}*(1-${remove}/100)`;unit='%';break;
   case 7:facts.evap=r(1,9)*20;question=`${low}% 용액 ${m1}g과 ${high}% 용액 ${m2}g을 혼합한 뒤 물 ${facts.evap}g만 증발시켰다. 최종 농도는?`;expression=`(${low}*${m1}+${high}*${m2})/(${m1}+${m2}-${facts.evap})`;unit='%';break;
   default:facts.times=r(2,3);question=`농도 ${high}% 용액에서 전체의 ${remove}%를 덜어내고 같은 질량의 물을 채운다. 매번 충분히 섞으며 이 작업을 ${facts.times}회 반복했을 때 최종 농도는?`;expression=`${high}${Array(facts.times).fill(`*(1-${remove}/100)`).join('')}`;unit='%';
  }
 } else if(family==='work') {
  const A=a*4,B=b*6,C=c*8,early=r(1,4),eff=i===6?r(10,18)*5:i===7?r(12,19)*5:r(11,19)*10;
  facts={A,B,C,early,eff,units:c*100};unit='시간';
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
 } else if(family==='cost') {
  const cost=a*1000,markup=r(2,9)*10,discount=b*5,price=cost*(1+markup/100),fixed=c*10000,variable=b*100,count=r(2,10)*100,fee=r(1,4)*5;
  facts={cost,markup,discount,price,fixed,variable,count,fee};unit='원';
  switch(i){
   case 0:question=`원가 ${cost}원인 상품을 원가 대비 ${markup}% 이익을 붙여 판매한다. 판매가는?`;expression=`${cost}*(1+${markup}/100)`;break;
   case 1:question=`정가 ${format(price)}원인 상품을 ${discount}% 할인한다. 실제 판매가는?`;expression=`${price}*(1-${discount}/100)`;break;
   case 2:question=`원가 ${cost}원에 ${markup}%를 붙여 정가를 정하고 정가에서 ${discount}% 할인해 판매한다. 개당 이익은?`;expression=`${cost}*(1+${markup}/100)*(1-${discount}/100)-${cost}`;break;
   case 3:question=`${discount}% 할인한 판매가가 ${format(price*(1-discount/100))}원이다. 할인 전 정가는?`;expression=`${price*(1-discount/100)}/(1-${discount}/100)`;break;
   case 4:question=`원가가 각각 ${cost}원인 상품 두 개 중 하나는 ${markup}% 이익, 다른 하나는 ${discount}% 손실로 팔았다. 총이익은?`;expression=`${cost}*(${markup}-${discount})/100`;break;
   case 5:{const second=r(1,8)*5;facts.b=second;question=`A 상품 정가는 ${format(price)}원, B 상품 정가는 ${cost}원이다. A는 ${discount}% 할인, B는 ${second}% 할인한다. A의 판매가가 B보다 얼마나 비싼가?`;expression=`${price}*(1-${discount}/100)-${cost}*(1-${second}/100)`;}break;
   // 두 비율을 잇달아 적용하면 10의 배수여야 금액이 정수로 떨어진다.
   case 6:{const first=r(1,4)*10,second=r(1,4)*10;facts.discount=first;facts.b=second;question=`정가 ${format(price)}원에서 먼저 ${first}%, 할인된 가격에서 다시 ${second}% 할인한다. 최종 판매가는?`;expression=`${price}*(1-${first}/100)*(1-${second}/100)`;}break;
   case 7:{const first=r(1,4)*10,second=r(1,4)*10;facts.discount=first;facts.b=second;question=`가격 ${cost}원을 먼저 ${first}% 올리고, 오른 가격에서 다시 ${second}% 올렸다. 최종 가격은?`;expression=`${cost}*(1+${first}/100)*(1+${second}/100)`;}break;
   case 8:facts.dist=c;question=`개당 ${cost}원인 상품의 '2개 값으로 3개 제공' 행사를 이용한다. ${c*3}개를 구매할 때 총지불액은?`;expression=`${cost}*${c}*2`;facts.bundles=c;break;
   case 9:question=`${cost*100}원을 투자하여 수수료 없이 원금 대비 ${discount}%의 수익을 얻었다. 원금을 포함한 회수 금액은?`;expression=`${cost}*100*(1+${discount}/100)`;break;
   case 10:question=`판매가 ${format(price)}원에서 ${fee}% 판매 수수료를 뗀다. 상품 원가 ${cost}원 외 비용이 없다면 순이익은?`;expression=`${price}*(1-${fee}/100)-${cost}`;break;
   case 11:question=`고정비 ${fixed}원, 제품 한 개의 변동비 ${variable}원이다. ${count}개 생산 시 총비용은?`;expression=`${fixed}+${variable}*${count}`;break;
   case 12:memo=`${fixed}/(${cost}-${variable})`;step('판매 수량 하한',memo);question=`고정비 ${fixed}원, 개당 변동비 ${variable}원, 개당 판매가 ${cost}원이다. 손실이 나지 않으려면 최소 몇 개를 판매해야 하는가?`;expression=String(Math.ceil(fixed/(cost-variable)));unit='개';break;
   case 13:{const many=r(2,24);facts.n=r(8,30);facts.expensive=b*100+cost;facts.total=facts.n*cost+many*facts.expensive;facts.n+=many;}question=`${cost}원짜리와 ${facts.expensive}원짜리를 합해 ${facts.n}개 샀다. 총액 ${facts.total}원일 때 비싼 상품의 개수는?`;expression=`(${facts.total}-${facts.n}*${cost})/(${facts.expensive}-${cost})`;unit='개';break;
   default:facts.defects=r(1,8)*5;memo=`${cost}*${count}/(${count}*(1-${facts.defects}/100))`;step('정상 제품당 원가 하한',memo);question=`원가 ${cost}원인 상품 ${count}개 중 ${facts.defects}%가 불량으로 폐기되었다. 정상 제품을 모두 같은 가격에 팔아 원가 총액 이상을 회수하려면 개당 최소 판매가는? (1원 단위 올림, 다른 비용 없음)`;expression=String(Math.ceil(cost*count/(count*(1-facts.defects/100))));
  }
 } else if(family==='ratio') {
  const men=r(3,30)*10,women=r(3,30)*10,N=men+women,s1=55+r(0,9)*5,s2=40+r(0,14)*5;
  facts={a,b,c,d,men,women,N,s1,s2};unit='명';
  switch(i){
   // 전체 인원이 비의 합으로 나누어떨어져야 남학생 수가 정수가 된다.
   case 0:{const total=(a+b)*r(4,24);facts.N=total;question=`남녀 비율 ${a}:${b}인 동아리의 전체 인원은 ${total}명이다. 남학생은 몇 명인가?`;expression=`${total}*${a}/(${a}+${b})`;}break;
   case 1:question=`남학생 ${men}명과 여학생 ${women}명이 있었다. 남학생은 20%, 여학생은 10% 늘었다. 늘어난 뒤 남학생 수를 여학생 수로 나눈 값은?`;expression=`(${men}*1.2)/(${women}*1.1)`;unit='배';break;
   case 2:facts.increase=men*0.2+women*0.1;facts.men=men;question=`전체 ${N}명인 모임에서 남학생은 20%, 여학생은 10% 늘어 총 ${facts.increase}명이 증가했다. 증가 전 남학생 수는?`;expression=`(${facts.increase}-${N}*0.1)/0.1`;break;
   case 3:case 4:question=`${a}명의 평균 점수는 ${s1}점, 나머지 ${b}명의 평균은 ${s2}점이다. 전체 ${a+b}명의 평균은?`;expression=`(${a}*${s1}+${b}*${s2})/(${a}+${b})`;unit='점';break;
   case 5:facts.average=(a*s1+b*s2)/(a+b);question=`${a+b}명의 평균은 ${format(facts.average)}점이다. 그중 ${a}명의 평균이 ${s1}점이면 나머지 ${b}명의 평균은?`;expression=`(${facts.average}*(${a}+${b})-${a}*${s1})/${b}`;unit='점';break;
   case 6:facts.total=s1*a+s2;question=`${a+1}명의 점수 합계는 ${facts.total}점이다. 한 명을 제외한 ${a}명의 평균이 ${s1}점이라면 제외된 한 명의 점수는?`;expression=`${facts.total}-${a}*${s1}`;unit='점';break;
   // 1인당 개수 차를 1로 고정하면 사람 수가 '남는 수 + 부족한 수'로 늘 같아진다.
   case 7:{const people=r(6,28),per=r(2,8),gap=r(1,3),left=r(1,Math.min(9,people*gap-1)),short=people*gap-left;
    facts.left=left;facts.short=short;facts.per1=per;facts.per2=per+gap;facts.items=people*per+left;
    question=`사람들에게 물건을 ${per}개씩 주면 ${left}개가 남고 ${per+gap}개씩 주면 ${short}개가 부족하다. 사람 수는?`;expression=`(${left}+${short})/(${per+gap}-${per})`;}break;
   case 8:case 9:{const cheapCount=r(5,25),dearCount=r(3,30);facts.cheap=r(1,5)*100;facts.expensive=facts.cheap+b*100;facts.n=cheapCount+dearCount;facts.total=cheapCount*facts.cheap+dearCount*facts.expensive;}question=`${facts.cheap}원짜리 ${i===8?'동전':'상품'}과 ${facts.expensive}원짜리를 합해 ${facts.n}개 가지고 있다. 총액 ${facts.total}원일 때 ${facts.expensive}원짜리는 몇 개인가?`;expression=`(${facts.total}-${facts.n}*${facts.cheap})/(${facts.expensive}-${facts.cheap})`;unit='개';break;
   case 10:facts.limit=r(20,500);memo=`${facts.limit}/${b}`;step('버림하기 전 나눗셈',memo);question=`1부터 ${facts.limit}까지의 자연수 중 ${b}의 배수는 몇 개인가?`;expression=`(${facts.limit}-${facts.limit%b})/${b}`;unit='개';break;
   case 11:facts.limit=r(15,199);memo=`${facts.limit}/2`;step('올림하기 전 나눗셈',memo);question=`1부터 ${facts.limit}까지의 자연수 중 홀수는 몇 개인가?`;expression=`(${facts.limit}+${facts.limit%2})/2`;unit='개';break;
   case 12:{facts.mod1=r(3,9);facts.mod2=[11,13,17,19,23][r(0,4)];let x=1;
    // When the larger remainder is already the answer the item needs no reasoning at all,
    // so keep drawing remainders until the smallest solution passes the larger divisor.
    for(let guard=0;guard<200;guard++){facts.rem1=r(1,facts.mod1-1);facts.rem2=r(1,facts.mod2-1);x=1;while(x%facts.mod1!==facts.rem1||x%facts.mod2!==facts.rem2)x++;if(x>facts.mod2)break;}
    step(`${facts.mod1}${ro(facts.mod1)} 나눈 나머지 확인`,`${x}-${facts.mod1}*${Math.floor(x/facts.mod1)}`);
    memo=`${facts.rem2}+${facts.mod2}*${(x-facts.rem2)/facts.mod2}`;
    question=`${facts.mod1}${ro(facts.mod1)} 나눈 나머지가 ${facts.rem1}, ${facts.mod2}${ro(facts.mod2)} 나눈 나머지가 ${facts.rem2}인 가장 작은 양의 정수는?`;expression=memo;unit='';}break;
   case 13:{facts.p=2*a;facts.q=3*b;const divisor=gcd(facts.p,facts.q);if(divisor>1)step('두 수의 곱',`${facts.p}*${facts.q}`);memo=divisor>1?`${facts.p}*${facts.q}/${divisor}`:`${facts.p}*${facts.q}`;question=`${facts.p}${wa(facts.p)} ${facts.q}의 최소공배수는?`;expression=memo;unit='';}break;
   case 14:facts.length=a*b*10;facts.gap=b*10;question=`길이 ${facts.length}m의 직선 길에 ${facts.gap}m 간격으로 양 끝을 포함하여 나무를 심는다. 필요한 나무 수는?`;expression=`${facts.length}/${facts.gap}+1`;unit='그루';break;
   default:facts.width=a;facts.length=a+b;question=`직사각형의 가로가 세로보다 ${b}m 길고 둘레가 ${2*(a+a+b)}m이다. 세로 길이는?`;expression=`(${2*(a+a+b)}/2-${b})/2`;unit='m';
  }
 } else {
  const n=r([10,11].includes(i)?6:[4,5,6].includes(i)?3:5,[4,5,6].includes(i)?6:i===1?9:i===12?13:10),k=[10,11].includes(i)?r(2,Math.max(2,Math.min(5,n-3))):r(2,4),red=r(2,[10,11].includes(i)?n-k:n-2),blue=n-red;facts={n,k,red,blue,a,b};unit='가지';
  const arrayWays=(size:number,pool:number)=>i===4?choose(pool-2,size-2)*2*factorial(size-1):i===5?choose(pool-2,size-2)*(factorial(size)-2*factorial(size-1)):choose(pool,size)*factorial(size-1);
  switch(i){
   case 0:question=`서로 다른 ${n}명 중 ${k}명을 순서 없이 뽑는 방법 수는?`;expression=chooseMemo(n,k);break;
   case 1:facts.roles=r(2,4);question=`서로 다른 ${n}명 중 ${facts.roles}개의 서로 다른 역할을 서로 다른 사람에게 하나씩 맡기는 방법 수는?`;expression=Array.from({length:facts.roles},(_,j)=>String(n-j)).join('*');break;
   case 2:question=`${n}명 중 ${k}명의 대표를 뽑되 지정된 A는 반드시 포함한다. 순서 없는 방법 수는?`;expression=chooseMemo(n-1,k-1);break;
   // Excluding one person from n and then picking n-1 leaves a single arrangement, so the
   // item would have answer 1 and nothing to calculate; keep at least one person unchosen.
   case 3:facts.k=Math.min(k,n-2);question=`${n}명 중 ${facts.k}명의 대표를 뽑되 지정된 A는 제외한다. 순서 없는 방법 수는?`;expression=chooseMemo(n-1,facts.k);break;
   case 4:facts.pool=n+r(1,20);while(arrayWays(n,facts.pool)>4000)facts.pool--;question=`서로 다른 ${facts.pool}명 중 지정된 A와 B를 포함하여 ${n}명을 뽑아 일렬로 세운다. A와 B가 이웃하는 배열 수는?`;expression=`(${chooseMemo(facts.pool-2,n-2)})*2*(${factorialMemo(n-1)})`;break;
   case 5:facts.pool=n+r(1,20);while(arrayWays(n,facts.pool)>4000)facts.pool--;question=`서로 다른 ${facts.pool}명 중 지정된 A와 B를 포함하여 ${n}명을 뽑아 일렬로 세운다. A와 B가 이웃하지 않는 배열 수는?`;expression=`(${chooseMemo(facts.pool-2,n-2)})*((${factorialMemo(n)})-2*(${factorialMemo(n-1)}))`;break;
   case 6:facts.pool=n+r(1,20);while(arrayWays(n,facts.pool)>4000)facts.pool--;question=`서로 다른 ${facts.pool}명 중 ${n}명을 골라 원탁에 앉힌다. 회전해서 같은 배치는 같고, 거울상은 다른 것으로 셀 때 배치 수는?`;expression=`(${chooseMemo(facts.pool,n)})*(${factorialMemo(n-1)})`;break;
   case 7:question=`${n}명을 이름이 다른 A팀 ${k}명, B팀 ${n-k}명으로 나누는 방법 수는? (팀 안의 순서 없음)`;expression=chooseMemo(n,k);break;
   case 8:case 9:facts.team=r(2,9);facts.teams=r(2,6);facts.n=facts.team*facts.teams;question=`${facts.n}명을 무작위로 이름이 다른 ${facts.teams}개 팀에 ${facts.team}명씩 배정한다. 지정된 A와 B가 ${i===8?'같은':'서로 다른'} 팀일 확률은?`;expression=i===8?`(${facts.team}-1)/(${facts.n}-1)`:`(${facts.n}-${facts.team})/(${facts.n}-1)`;unit='확률';break;
   case 10:question=`빨간 공 ${red}개와 파란 공 ${blue}개에서 동시에 ${k}개를 균등하게 뽑는다. 빨간 공이 적어도 하나일 확률은?`;expression=`1-(${chooseMemo(blue,k)})/(${chooseMemo(n,k)})`;unit='확률';break;
   case 11:question=`빨간 공 ${red}개와 파란 공 ${blue}개에서 동시에 ${k}개를 균등하게 뽑는다. 빨간 공이 정확히 하나일 확률은?`;expression=`${red}*(${chooseMemo(blue,k-1)})/(${chooseMemo(n,k)})`;unit='확률';break;
   case 12:question=`빨간 공 ${red}개와 파란 공 ${blue}개에서 한 개씩 두 번, 돌려놓지 않고 뽑는다. 두 번 모두 빨간 공일 확률은?`;expression=`${red}/${n}*(${red}-1)/(${n}-1)`;unit='확률';break;
   case 13:question=`성공 확률이 각각 1/${a}, 1/${b}인 서로 독립인 두 시행이 모두 성공할 확률은?`;expression=`1/${a}*1/${b}`;unit='확률';break;
   // 분모가 (확률의 분모)^시행횟수라 메모장 계산 규모를 넘지 않도록 시행 수에 맞춰 범위를 정한다.
   case 14:facts.trials=r(2,4);facts.a=r(2,facts.trials===2?20:facts.trials===3?12:6);question=`성공 확률이 1/${facts.a}인 독립 시행을 ${facts.trials}회 할 때 적어도 한 번 성공할 확률은?`;expression='1-'+Array(facts.trials).fill(`(1-1/${facts.a})`).join('*');unit='확률';break;
   case 15:{let across=a+r(0,3),up=b+r(0,2);while(choose(across+up,across)>4000)across--;facts.a=across;facts.b=up;
    question=`격자에서 오른쪽 ${across}칸, 위 ${up}칸 떨어진 점까지 오른쪽 또는 위로만 한 칸씩 이동한다. 최단경로 수는?`;expression=chooseMemo(across+up,across);}break;
   // 경유점이 (2, 1)로 고정돼 있어 같은 구조만 반복됐다.
   default:{facts.x=r(1,a-1);facts.y=r(1,b-1);const {x,y}=facts;question=`(0,0)에서 (${a},${b})까지 오른쪽·위로만 한 칸씩 이동하되 반드시 (${x},${y})${eul(y)} 지나는 최단경로 수는?`;expression=`(${chooseMemo(x+y,x)})*(${chooseMemo(a-x+b-y,a-x)})`;}
  }
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
 // 유형 = 핵심 공식 = 인식 신호 = 최단풀이. One table, one key, checked again in verify.ts.
 const guide=creativeGuidance[`${family}-${i}`];
 formula=guide.formula;signal=guide.signal;
 shortcut=`${guide.method} 메모장 계산식: ${memo||expression}`;
 return {question,answer,unit,facts,steps,formula,signal,shortcut,memo:memo||expression};
}
