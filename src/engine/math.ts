// Deterministic PRNG. Replaying (template, seed, version) reproduces the entire question.
export function rng(seed: number) { let s = seed >>> 0; return (min: number, max: number) => { s += 0x6D2B79F5; let t = s; t = Math.imul(t ^ t >>> 15, t | 1); t ^= t + Math.imul(t ^ t >>> 7, t | 61); return min + Math.floor(((t ^ t >>> 14) >>> 0) / 4294967296 * (max - min + 1)); }; }
export const close = (a: number, b: number) => Number.isFinite(a) && Number.isFinite(b) && Math.abs(a - b) <= 1e-8 * Math.max(1,Math.abs(a),Math.abs(b));
export function gcd(a: number,b: number): number { return b ? gcd(b,a%b) : Math.abs(a); }
// 1.0.0~1.2.0 rendered a value only floating-point noise away from an integer as "42/1", and that
// string reached answer choices and question text. Current questions collapse it; saved questions
// from those versions must still reproduce byte for byte, so both renderings are kept.
function render(n: number, collapseUnitDenominator: boolean): string {
 if (Number.isInteger(n)) return String(n);
 // Continued fractions preserve exact rational answers without long denominator scans.
 const sign=n<0?-1:1, absolute=Math.abs(n);let x=absolute,p0=0,p1=1,q0=1,q1=0;
 for(let k=0;k<30;k++){
  const a=Math.floor(x),p=a*p1+p0,q=a*q1+q0;
  if(q>1e9||!Number.isSafeInteger(p))break;
  if(Math.abs(p/q-absolute)<1e-11){const g=gcd(p,q),numerator=sign*p/g,denominator=q/g;return collapseUnitDenominator&&denominator===1?String(numerator):`${numerator}/${denominator}`;}
  [p0,p1,q0,q1]=[p1,p,q1,q];const rest=x-a;if(rest<1e-14)break;x=1/rest;
 }
 return Number(n.toPrecision(12)).toString();
}
export const format=(n: number): string => render(n, true);
export const legacyFormat=(n: number): string => render(n, false);
export function choose(n: number,k: number): number { if(k<0||k>n)return 0; let x=1; for(let i=1;i<=k;i++)x=x*(n-i+1)/i; return Math.round(x); }
export function factorial(n:number):number { let x=1;for(let i=2;i<=n;i++)x*=i;return x; }
// Recursive descent, no dynamic code execution, no identifiers or implicit multiplication.
export function calculate(input: string): number {
 const source=input.replaceAll('×','*').replaceAll('÷','/').replaceAll('−','-').replace(/\s/g,'');
 if(source.length>500)throw new Error('계산식이 너무 깁니다.');
 const tokens=source.match(/(?:\d+(?:\.\d*)?|\.\d+)|[()+\-*/]/g)||[];
 if(tokens.join('')!==source||!tokens.length)throw new Error('숫자와 사칙연산만 입력하세요.');
 let i=0;
 function atom():number { const t=tokens[i++];if(t==='+')return atom();if(t==='-')return -atom();if(t==='('){const v=sum();if(tokens[i++]!==')')throw new Error('괄호를 확인하세요.');return v;}if(t===undefined||!/^\d|^\./.test(t))throw new Error('계산식을 확인하세요.');return Number(t); }
 function product():number {let v=atom();while(tokens[i]==='*'||tokens[i]==='/'){const op=tokens[i++],b=atom();if(op==='/'&&b===0)throw new Error('0으로 나눌 수 없습니다.');v=op==='*'?v*b:v/b;}return v;}
 function sum():number {let v=product();while(tokens[i]==='+'||tokens[i]==='-'){const op=tokens[i++],b=product();v=op==='+'?v+b:v-b;}return v;}
 const result=sum();if(i!==tokens.length||!Number.isFinite(result)||Math.abs(result)>1e14)throw new Error('계산 범위를 확인하세요.');return result;
}
export const primes=Array.from({length:598},(_,i)=>i+2).filter(n=>Array.from({length:Math.floor(Math.sqrt(n))-1},(_,i)=>i+2).every(d=>n%d!==0));
