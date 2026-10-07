import type { Question,Attempt } from './types';
// A new seed can shuffle choices while producing the same numeric conditions.
// Those attempts are retries even when their reproducible IDs differ.
export function questionKey(q:Question):string {return JSON.stringify([q.type,q.question]);}
export function normalizeAttempts(attempts:Attempt[]):Attempt[]{const seen=new Set<string>();return attempts.map(a=>{const key=questionKey(a.question),first=!seen.has(key);seen.add(key);return a.first===first?a:{...a,first};});}
