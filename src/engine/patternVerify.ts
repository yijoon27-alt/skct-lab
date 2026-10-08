import { close } from './math';
import type { Question } from './types';
// No generator imports. Rebuild each rule from the stored conditions and compare it to the
// stored terms; primes are found by trial division rather than reusing the generator's table.
function primeAt(n: number): number {
 for (let value = 2, found = 0; ; value++) {
  let prime = true;
  for (let d = 2; d * d <= value; d++) if (value % d === 0) { prime = false; break; }
  if (prime) { if (found === n) return value; found++; }
 }
}
export function verifyPattern(q: Question): boolean {
 const s = q.sequence, f = q.facts, eq = close;
 if (!s || !s.length || !s.every(Number.isFinite)) return false;
 const { queryKind: k, indexA: A, indexB: B } = f;
 if (![0, 1, 2, 3].includes(k) || ![A, B].every(j => Number.isInteger(j) && j >= 0 && j < s.length)) return false;
 const asked = k === 1 ? s[A] + s[B] : k === 2 ? s[B] - s[A] : s[A];
 if (!eq(asked, q.answer)) return false;
 const every = (fn: (j: number) => boolean, start = 0) => s.slice(start).every((_, j) => fn(j + start));
 switch (Number(q.subtype.split('-')[1])) {
  case 0: return s.length === 6 && eq(s[0], f.a) && every(j => eq(s[j], s[j - 1] * 2 ** (j - 1)), 1);
  case 1: return s.length === 7 && eq(s[0], f.m * f.q ** 4) && every(j => eq(s[j] * f.q, s[j - 1] * j), 1);
  case 2: return s.length === 9 && every(j => (j % 2 ? eq(s[j], f.b + ((j - 1) / 2) * f.diff) : eq(s[j], f.a * f.ratio ** (j / 2))));
  case 3: return s.length === 12 && every(j => {
   const group = Math.floor(j / 3), place = j % 3;
   return place === 0 ? eq(s[j], f.p + group * f.dp) : place === 2 ? eq(s[j], f.r + group * f.dr) : eq(2 * s[j], s[j - 1] + s[j + 1]);
  });
  case 4: return s.length === 7 && every(j => eq(s[j] * primeAt(f.offset + j), f.c));
  case 5: return s.length === 7 && every(j => eq(s[j] * (f.c + (j * (j + 3)) / 2), primeAt(f.offset + j)));
  case 6: return s.length === f.m + 1 && every(j => eq(s[j] * 2 ** (f.m - j), f.a * (-f.k) ** j));
  case 7: {
   const gaps = s.slice(1).map((v, j) => v - s[j]);
   return s.length === 9 && eq(s[0], f.a) && eq(gaps[0], f.f0) && eq(gaps[1], f.f1) && gaps.slice(2).every((v, j) => eq(v, gaps[j] + gaps[j + 1]));
  }
  case 8: {
   const whole = s.map(Math.floor), part = s.map((v, j) => Math.round((v - whole[j]) * 100));
   return s.length === 6 && every(j => whole[j] === f.a * f.ratio ** j && part[j] === f.start - j * f.step);
  }
  case 9: return s.length === 7 && every(j => eq(s[j] * (f.p + j * f.d), f.q));
 }
 return false;
}
