import { close } from './math';
import type { Question } from './types';
// No construction helpers or generators. Enumerate a 10,000-element population for Bayes.
export function verifyReference(q:Question):boolean{
 const f=q.facts,eq=close;
 if(q.subtype.startsWith('bayes-')){
  if(![f.share,f.rateA,f.rateB].every(v=>Number.isInteger(v)&&v>0&&v<100))return false;
  if(q.subtype==='bayes-1'&&(!Number.isInteger(f.specificity)||f.specificity+f.rateB!==100))return false;
  let selected=0,selectedA=0;
  for(let person=0;person<10000;person++){
   const isA=person<f.share*100,local=isA?person:person-f.share*100;
   const size=(isA?f.share:100-f.share)*100,rate=isA?f.rateA:f.rateB;
   if(local<size*rate/100){selected++;if(isA)selectedA++;}
  }
  return selected>0&&eq(q.answer*selected,selectedA);
 }
 const i=Number(q.subtype.split('-')[1]);if(!Number.isInteger(i)||i<0||i>13)return false;
 if(i===10||i===11){
  if(q.diagram?.kind!==(i===10?'grid':'cross')||q.diagram.cells.length!==4)return false;
  const rows=q.diagram.cells;
  if(!rows.every(row=>row.length===4))return false;
  for(let j=0;j<4;j++){
   const [a,b,c,v]=rows[j];if(a===null||b===null||c===null)return false;
   if(![a,b,c].every(Number.isInteger))return false;
   if(![a,b,c].every((x,k)=>x===f[`cell${j*3+k}`]))return false;
   const output=j===3?q.answer:v;if(output===null||!eq(a*b,i===10?output-c:output+c))return false;
   if(j===3&&v!==null)return false;
  }return true;
 }
 const s=q.sequence,{a,b,c,d,den,queryKind:k,indexA:A,indexB:B}=f;
 if(!s||s.length!==(i===5?6:i===8||i===9?12:9)||!s.every(Number.isFinite))return false;
 if(![0,1,2,3,4,5].includes(k)||![A,B].every(j=>Number.isInteger(j)&&j>=0&&j<s.length))return false;
 if(k===5&&s[B]===0)return false;
 const result=k===1?s[A]+s[B]:k===2?s[B]-s[A]:k===4?s[A]*s[B]:k===5?s[A]/s[B]:s[A];
 if(!eq(result,q.answer))return false;
 if(![a,b,c,d,den].every(v=>Number.isInteger(v)&&v>0)||![0,1,2].includes(f.style))return false;
 const every=(fn:(j:number)=>boolean,start=0)=>s.slice(start).every((_,j)=>fn(j+start));
 switch(i){
  case 0:return eq(s[0]*den,a)&&every(j=>eq((s[j]-s[j-1])*den,b),1);
  case 1:return eq(s[0]*den,a)&&every(j=>eq(s[j]/s[j-1],2),1);
  case 2:{const numer=s.map((v,j)=>v*(c+d*j));return eq(numer[0],a)&&every(j=>eq(numer[j]-numer[j-1],b*j),1);}
  case 3:return eq(1/s[0],a)&&every(j=>eq(1/s[j]-1/s[j-1],b*j),1);
  case 4:{const ints=s.map(Math.floor),parts=s.map((v,j)=>Math.round((v-ints[j])*100));return eq(s[0],a+c/100)&&every(j=>ints[j]-ints[j-1]===b&&parts[j]-parts[j-1]===j,1);}
  case 5:return Number.isInteger(s[0])&&Number.isInteger(s[1])&&s[0]>=2&&s[0]<=7&&s[1]>=1&&s[1]<=(s[0]>5?2:3)&&every(j=>eq(s[j]/s[j-1],s[j-2]),2);
  case 6:return s.slice(0,3).every((v,j)=>eq(v,a+j*b))&&every(j=>eq(s[j]-s[j-1],s[j-2]+s[j-3]),3);
  case 7:return eq(s[0],a)&&eq(s[2],a+b)&&eq(s[1],c)&&every(j=>j%2?eq(s[j]-s[j-2],d):eq(s[j]-s[j-2],s[j-4]),3);
  case 12:return eq(s[0]*den,a)&&eq(s[1]*den,a+b)&&every(j=>eq(s[j]-s[j-1],s[j-2]),2);
  case 13:return eq(s[0]*10,a)&&every(j=>j%2?eq((s[j]-s[j-1])*10,b):eq(s[j]/s[j-1],2),1);
  case 8:case 9:return eq(s[0],a)&&eq(s[1],c)&&every(j=>j%3===2?eq(i===8?s[j]/s[j-1]:s[j]+s[j-1],s[j-2]):j<3?true:eq(s[j]-s[j-3],j%3===0?b:d));
 }
 return false;
}
