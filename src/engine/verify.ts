import { calculate, close, format } from './math';
import type { Question } from './types';
// No generator imports. Validate conditions against the proposed answer, not its construction formula.
function combinations(n:number,k:number):number[][] {
 const out:number[][]=[];function visit(start:number,v:number[]){if(v.length===k){out.push(v);return;}for(let x=start;x<n;x++)visit(x+1,[...v,x]);}visit(0,[]);return out;
}
function arrangements(n:number, predicate:(v:number[])=>boolean):number {
 let count=0;function visit(v:number[],used:number){if(v.length===n){if(predicate(v))count++;return;}for(let x=0;x<n;x++)if(!(used&(1<<x)))visit([...v,x],used|(1<<x));}visit([],0);return count;
}
function paths(x:number,y:number):number {const dp=Array.from({length:x+1},()=>Array(y+1).fill(1));for(let a=1;a<=x;a++)for(let b=1;b<=y;b++)dp[a][b]=dp[a-1][b]+dp[a][b-1];return dp[x][y];}
export function verifyAnswer(q:Question):boolean {
 const x=q.answer,f=q.facts,id=q.subtype.split('-')[0],i=Number(q.subtype.split('-')[1]);const eq=close;
 if(id==='speed'){
  const {slow:s,fast:v,t,dist:d,c,a,b}=f;
  switch(i){
   case 0:return eq(x/c,s);case 1:return eq(x/60-d/s,d/v);case 2:return eq(a*t,b*x);
   case 3:return eq(x/s-x/v,t/60);case 4:case 8:return eq((s+v)*x/60,d);
   case 5:return eq(v*x/60,s*x/60+t);case 6:return eq(v*x/60,s*(x+t)/60);
   case 7:{const outward=x/2;return eq(v*outward/60,s*(outward+t)/60);}
   case 9:return eq(v*x/60-s*x/60,d);case 10:return eq(x*(a+b),f.l1+f.l2);
   case 11:case 12:return eq(x*s*1000/3600,f.length+f.region);
   case 13:return eq(x/60*(s*s-f.water*f.water),2*d*s);
   case 14:return eq(x*s/60,f.length+f.region);case 15:return eq(x/1000,s*t/60);
  }
 } else if(id==='mix'){
  const {low:l,high:h,m1,m2,target:tg,remove:rm}=f;
  switch(i){case 0:case 1:case 8:return eq(x*(m1+m2),l*m1+h*m2);case 2:case 9:return eq(tg*(m1+x),l*m1+h*x)&&x>0;
   case 3:return eq(l*(m1+x),h*m1);case 4:return eq(h*(m1-x),l*m1)&&x<m1;
   case 5:return eq(x/(m1*(100-rm)/100),h/100);case 6:return eq(x*m1,h*(m1*(100-rm)/100));
   case 7:return eq(x*(m1+m2-f.evap),l*m1+h*m2);
   case 10:{let salt=h*m1/100;for(let k=0;k<f.times;k++)salt-=salt*rm/100;return eq(x*m1/100,salt);}
  }
 }else if(id==='work'){
  const {A,B,C,early:t,eff}=f;
  switch(i){case 0:return eq(x/A+x/B,1);case 1:return eq(x/A+x/B+x/C,1);
   case 2:return eq((t+x)/A+x/B,1);case 3:return eq((t+x)/A+t/B,1);case 4:return eq((t+x)/A+(t+x)/B+x/C,1);
   case 5:case 6:return eq(x*eff,A*100);case 7:case 8:return eq(t/A+x/A*eff/100+x/B*eff/100,1);
   case 9:return eq(x/f.b/f.c,f.a);case 10:return eq(x/A+f.completed/100,1);
  }
 }else if(id==='cost'){
  const {cost:c,markup:m,discount:d,price:p,fixed:F,variable:v,count:n,fee}=f;
  switch(i){case 0:return eq((x-c)/c,m/100);case 1:return eq((p-x)/p,d/100);case 2:return eq((x+c)/(c*(1+m/100)),1-d/100);
   case 3:return eq(x-x*d/100,p*(1-d/100));case 4:return eq(x,c*m/100-c*d/100);
   case 5:return eq(x+c*(1-f.b/100),p*(1-d/100));case 6:return eq(x/(1-f.b/100),p-p*d/100);
   case 7:return eq(x/(1+f.b/100),c+c*d/100);case 8:return eq(x/f.bundles,c*2);case 9:return eq(x-c*100,c*d);
   case 10:return eq(x+c+p*fee/100,p);case 11:return eq((x-F)/n,v);
   case 12:return Number.isInteger(x)&&x*(c-v)>=F&&(x-1)*(c-v)<F;
   case 13:return Number.isInteger(x)&&x>=0&&x<=f.n&&eq((f.n-x)*c+x*f.expensive,f.total);
   case 14:{const good=n*(1-f.defects/100);return Number.isInteger(x)&&x*good>=c*n&&(x-1)*good<c*n;}
  }
 }else if(id==='ratio'){
  const {a,b,men,women,N,s1,s2}=f;
  switch(i){case 0:return Number.isInteger(x)&&eq(x*b,(N-x)*a);case 1:return eq(x*women*1.1,men*1.2);
   case 2:return Number.isInteger(x)&&eq(x*0.2+(N-x)*0.1,f.increase)&&x>=0&&x<=N;
   case 3:case 4:return eq(x*(a+b),a*s1+b*s2);case 5:return eq(a*s1+b*x,f.average*(a+b));case 6:return eq(x+a*s1,f.total);
   case 7:return Number.isInteger(x)&&eq(f.per1*x+f.left,f.per2*x-f.short);
   case 8:case 9:return Number.isInteger(x)&&x>=0&&x<=f.n&&eq((f.n-x)*f.cheap+x*f.expensive,f.total);
   case 10:return x===Array.from({length:f.limit},(_,i)=>i+1).filter(v=>v%b===0).length;
   case 11:return x===Array.from({length:f.limit},(_,i)=>i+1).filter(v=>v%2).length;
   case 12:return x===Array.from({length:f.mod1*f.mod2},(_,i)=>i+1).find(v=>v%f.mod1===f.rem1&&v%f.mod2===f.rem2);
   case 13:return x===Array.from({length:f.p*f.q},(_,i)=>i+1).find(v=>v%f.p===0&&v%f.q===0);
   case 14:return eq((x-1)*f.gap,f.length)&&Number.isInteger(x);
   case 15:return eq(2*(x+x+f.b),2*(f.width+f.length));
  }
 }else if(id==='count'){
  const {n,k,red,a,b}=f,sets=[0,2,3,7,10,11].includes(i)?combinations(n,k):[];
  switch(i){case 0:case 7:return x===sets.length;
   case 1:{let count=0;function fill(used:number,depth:number){if(depth===f.roles){count++;return;}for(let j=0;j<n;j++)if(!(used&(1<<j)))fill(used|(1<<j),depth+1);}fill(0,0);return x===count;}
   case 2:return x===sets.filter(v=>v.includes(0)).length;case 3:return x===sets.filter(v=>!v.includes(0)).length;
   case 4:case 5:return x===combinations(f.pool,n).filter(v=>v.includes(0)&&v.includes(1)).length*arrangements(n,v=>(Math.abs(v.indexOf(0)-v.indexOf(1))===1)===(i===4));
   case 6:return x===combinations(f.pool,n).length*arrangements(n,v=>v[0]===0);
   case 8:case 9:{let good=0;for(let slot=1;slot<n;slot++)if((slot<f.team)===(i===8))good++;return eq(x,good/(n-1));}
   case 10:return eq(x,sets.filter(v=>v.some(v=>v<red)).length/sets.length);
   case 11:return eq(x,sets.filter(v=>v.filter(v=>v<red).length===1).length/sets.length);
   case 12:{let good=0,total=0;for(let p=0;p<n;p++)for(let v=0;v<n;v++)if(p!==v){total++;if(p<red&&v<red)good++;}return eq(x,good/total);}
   case 13:return eq(x,1/(a*b));case 14:{let good=0,total=0;function event(j:number,success:boolean){if(j===f.trials){total++;if(success)good++;return;}for(let v=0;v<a;v++)event(j+1,success||v===0);}event(0,false);return eq(x,good/total);}
   case 15:return x===paths(a,b);case 16:return x===paths(f.x,f.y)*paths(a-f.x,b-f.y);
  }
 }else if(id==='seq'){
  const s=q.sequence;if(!s||s.length!==7||!eq(s[6],x))return false;
  const {a,b,c,offset}=f;
  const delta=s.slice(1).map((v,j)=>v-s[j]);
  const test=(fn:(j:number)=>boolean,start=0)=>Array.from({length:7-start},(_,j)=>j+start).every(fn);
  switch(i){case 0:return delta.every(v=>eq(v,b));case 1:return test(j=>eq(s[j]/s[j-1],b),1);
   case 2:return eq(delta[0],b)&&delta.slice(1).every((v,j)=>eq(v-delta[j],c));
   case 3:return delta.every((v,j)=>eq(v,b*(j+1)));
   case 4:{const d2=delta.slice(1).map((v,j)=>v-delta[j]);return eq(s[0],a)&&eq(delta[0],b+c)&&d2.every((v,j)=>eq(v,c*(j+2)));}
   case 5:case 6:return test(j=>eq(s[j]-s[j-1]*b,i===5?c:-c),1);
   case 7:return test(j=>j%2?eq(s[j]-s[j-1],c):eq(s[j]/s[j-1],b),1);
   case 8:return test(j=>eq(s[j]-s[j-2],j%2?c:b),2);
   case 9:case 10:return test(j=>eq(s[j]-s[j-1]-s[j-2],i===9?0:c),2);
   case 11:return test(j=>{let sum=0;for(let k=1;k<=j+c;k++)sum+=k;return eq(s[j],sum*b);});
   case 12:return test(j=>eq(Math.sqrt(s[j]-a),j+c));case 13:return test(j=>eq(Math.cbrt(s[j]-a),j+c));
   case 14:{const primes:number[]=[];for(let v=2;primes.length<offset+7;v++){let prime=true;for(let d=2;d*d<=v;d++)if(v%d===0)prime=false;if(prime)primes.push(v);}return test(j=>s[j]===primes[j+offset]);}
   case 15:return test(j=>eq(s[j]*c*11,a+j*b));case 16:return test(j=>eq(s[j]*(a+b+j*c),a+j*b));
   case 17:return test(j=>eq(1/s[j]-1/s[j-1],b),1);case 18:return delta.every(v=>eq(v*10,b));
   case 19:return test(j=>eq(Math.abs(s[j])-Math.abs(s[j-1]),b)&&Math.sign(s[j])===(j%2?-1:1),1);
   case 20:return test(j=>Math.sign(s[j])===([1,1,-1][j%3])&&eq(Math.abs(s[j]),a+j*b));
   case 21:return eq(s[2],s[0]+s[1])&&eq(s[5],s[3]+s[4])&&eq(s[3]-s[0],b)&&eq(s[4]-s[1],b)&&eq(s[6]-s[3],b);
   case 22:return test(j=>eq(s[j]-s[j-1]*b,j%2?c:-c),1);
   case 23:return test(j=>j%2?eq(s[j]-s[j-2],c):eq(s[j]/s[j-2],b),2);
   case 24:return test(j=>eq((s[j]-s[j-1]*b)/j,c),1);
  }
 }
 return false;
}
export function verifyExplanation(q:Question):boolean {
 try{return q.steps.length>0&&q.steps.every(s=>close(calculate(s.expression),s.value))&&close(q.steps.at(-1)!.value,q.answer)&&q.explanation===q.steps.map(s=>`${s.label}: ${s.expression.replaceAll('*','×').replaceAll('/','÷')} = ${format(s.value)}`).join('\n');}catch{return false;}
}
export function validate(q:Question):string[] {
 const errors:string[]=[];
 if(!q||typeof q.question!=='string'||!q.question.trim()||q.question.length>6000)return ['문항 구조 오류'];
 if(!Number.isInteger(q.seed)||q.seed<0||q.seed>4294967295||q.generatorVersion!=='1.0.0')errors.push('시드·버전 오류');
 if(q.id!==`${q.subtype}-v1-${q.seed}`)errors.push('문항 식별자 오류');
 if(!Number.isFinite(q.answer))errors.push('유한하지 않은 정답');
 if(q.options?.length!==5||q.optionValues?.length!==5||!Number.isInteger(q.correctAnswer)||q.correctAnswer<0||q.correctAnswer>4)errors.push('선지 구조 오류');
 else {
  if(q.unit==='확률'&&q.optionValues.some(v=>v<0||v>1))errors.push('선지 확률 범위 오류');
  if(q.optionValues.some(v=>!Number.isFinite(v)))errors.push('선지 숫자 오류');
  if(q.optionValues.some((v,i)=>q.optionValues.slice(0,i).some(x=>close(v,x))))errors.push('수치 중복 선지');
  if(q.optionValues.filter(v=>close(v,q.answer)).length!==1||!close(q.optionValues[q.correctAnswer],q.answer))errors.push('정답 위치 오류');
  if(q.options.some((s,i)=>s!==format(q.optionValues[i])+(q.unit&&q.unit!=='확률'?` ${q.unit}`:'')))errors.push('선지 표시·단위 오류');
 }
 if(q.unit==='확률'&&(q.answer<0||q.answer>1))errors.push('불가능한 확률');
 if(['명','개','가지','그루'].includes(q.unit)&&(!Number.isInteger(q.answer)||q.answer<0))errors.push('정수 조건 오류');
 try{if(!verifyAnswer(q))errors.push('독립 조건 검산 실패');}catch{errors.push('검산 예외');}
 if(!verifyExplanation(q))errors.push('해설 계산 오류');
 return errors;
}
