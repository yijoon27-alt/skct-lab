// Rules observed in the provided 기출복원 해설 that the earlier generators did not cover:
// 계비수열(공비가 또 수열을 이룸), 부호가 섞인 홀짝 분리, 군 가운데 항이 평균, 분모가 소수인 분수,
// 분자와 분모에 서로 다른 종류의 규칙, 계차가 피보나치, 정수부 등비·소수부 등차, 조화수열.
// Independently authored; no source wording or numbers are copied.
import { build } from './build';
import { calculate, format, primes, rng } from './math';
import type { Difficulty, Template } from './types';
type Draw = (min: number, max: number) => number;
interface Body { terms: number[]; shown: string[]; expressions: string[]; facts: Record<string, number>; decimals?: number }
interface Spec { name: string; difficulty: Difficulty; complexity: string; rule: string; formula: string; method: string; kinds: number[]; make(r: Draw): Body }
const ratio = (num: number, den: number) => (den === 1 ? String(num) : `${num}/${den}`);
const specs: Spec[] = [
 {
  name: '계비수열 · 공비가 2배', difficulty: 'hard', complexity: '이웃한 항의 비가 또 하나의 등비수열',
  rule: '이웃한 항의 비가 1, 2, 4, 8, …로 2배씩 커집니다.', formula: '공비가 등비수열 → 공비를 한 줄 더 적는다',
  method: '항의 차가 아니라 비를 한 줄 더 적으세요. 그 줄이 2배씩 커집니다.', kinds: [0],
  make(r) {
   const a = r(2, 40), terms = [a], expressions = [String(a)];
   for (let j = 1; j < 6; j++) { const step = 2 ** (j - 1); expressions.push(`${terms[j - 1]}*${step}`); terms.push(terms[j - 1] * step); }
   return { terms, shown: terms.map(String), expressions, facts: { a } };
  },
 },
 {
  name: '계비수열 · 공비가 등차', difficulty: 'hard', complexity: '공비가 일정하게 증가하는 분수',
  rule: '이웃한 항의 비가 일정하게 커지는 분수입니다.', formula: '공비가 등차수열 → 공비를 한 줄 더 적는다',
  method: '나눈 값을 한 줄 더 적으세요. 1/3, 2/3, 1, 4/3처럼 일정하게 커집니다.', kinds: [0],
  make(r) {
   const q = [2, 3][r(0, 1)], m = r(1, 12), first = m * q ** 4;
   const terms = [first], expressions = [String(first)];
   for (let j = 1; j < 7; j++) { expressions.push(`${terms[j - 1]}*${j}/${q}`); terms.push((terms[j - 1] * j) / q); }
   return { terms, shown: terms.map(String), expressions, facts: { q, m } };
  },
 },
 {
  name: '홀짝 분리 · 부호 교차', difficulty: 'medium', complexity: '홀수항은 등비, 짝수항은 등차이며 부호가 섞임',
  rule: '홀수항은 등비, 짝수항은 등차입니다. 공비나 공차가 음수일 수 있습니다.', formula: '홀수항·짝수항을 두 줄로 분리 후 부호까지 확인',
  method: '한 칸 건너 두 줄로 나누세요. 한 줄은 곱, 다른 줄은 덧셈이고 부호를 빠뜨리지 않습니다.', kinds: [0, 1, 2],
  make(r) {
   const scale = [2, 3, 5][r(0, 2)], rate = r(0, 1) ? scale : -scale;
   const base = r(20, 60), diff = r(0, 1) ? r(5, 9) : -r(5, 9), a = r(2, 6);
   const terms: number[] = [], expressions: string[] = [];
   for (let j = 0; j < 9; j++) {
    if (j % 2 === 0) { const value = a * rate ** (j / 2); terms.push(value); expressions.push(j === 0 ? String(a) : `(${terms[j - 2]})*(${rate})`); }
    else { const step = (j - 1) / 2, value = base + step * diff; terms.push(value); expressions.push(j === 1 ? String(base) : diff > 0 ? `${terms[j - 2]}+${diff}` : `${terms[j - 2]}-${-diff}`); }
   }
   return { terms, shown: terms.map(String), expressions, facts: { a, ratio: rate, b: base, diff } };
  },
 },
 {
  name: '군수열 · 가운데 항이 평균', difficulty: 'medium', complexity: '세 항씩 묶었을 때 가운데가 양끝의 평균',
  rule: '3개씩 묶으면 가운데 항이 첫째와 셋째의 평균입니다. 각 군의 첫째·셋째는 일정하게 커집니다.', formula: '[p, (p+r)÷2, r]를 반복, p와 r은 각각 등차',
  method: '3개씩 끊어 적으세요. 가운데가 양끝의 평균인지 먼저 확인합니다.', kinds: [0],
  make(r) {
   const p = r(10, 20), dp = r(2, 5), dr = r(6, 12);
   // 가운데 항이 정수이려면 양끝의 합이 항상 짝수여야 한다: 간격은 짝수, 두 공차는 같은 홀짝.
   const start = p + r(4, 8) * 2, step = dr % 2 === dp % 2 ? dr : dr + 1;
   const terms: number[] = [], expressions: string[] = [];
   for (let g = 0; g < 4; g++) {
    const head = p + g * dp, tail = start + g * step;
    terms.push(head, (head + tail) / 2, tail);
    expressions.push(`${p}+${g}*${dp}`, `(${head}+${tail})/2`, `${start}+${g}*${step}`);
   }
   return { terms, shown: terms.map(String), expressions, facts: { p, dp, r: start, dr: step } };
  },
 },
 {
  name: '분모가 연속 소수', difficulty: 'medium', complexity: '분자는 그대로이고 분모만 소수 나열',
  rule: '분자는 일정하고 분모가 연속된 소수입니다.', formula: '분모만 뽑아 보면 연속된 소수',
  method: '분모만 따로 적으세요. 홀수처럼 보이지만 소수 나열입니다.', kinds: [0, 3],
  make(r) {
   const c = r(1, 9), offset = r(4, 14), terms: number[] = [], shown: string[] = [], expressions: string[] = [];
   for (let j = 0; j < 7; j++) { const den = primes[offset + j]; terms.push(c / den); shown.push(ratio(c, den)); expressions.push(`${c}/${den}`); }
   return { terms, shown, expressions, facts: { c, offset } };
  },
 },
 {
  name: '분자 소수 · 분모 계차', difficulty: 'hard', complexity: '분자와 분모에 서로 다른 종류의 규칙',
  rule: '분자는 연속된 소수이고 분모는 차가 1씩 커집니다.', formula: '분자와 분모에 서로 다른 종류의 규칙을 각각 적용',
  method: '분자 줄과 분모 줄을 따로 적으세요. 같은 종류의 규칙일 거라고 가정하지 않습니다.', kinds: [0, 3],
  make(r) {
   const c = r(3, 9), offset = r(0, 8), terms: number[] = [], shown: string[] = [], expressions: string[] = [];
   for (let j = 0; j < 7; j++) {
    const num = primes[offset + j], den = c + (j * (j + 3)) / 2;
    terms.push(num / den); shown.push(`${num}/${den}`); expressions.push(`${num}/${den}`);
   }
   return { terms, shown, expressions, facts: { c, offset } };
  },
 },
 {
  name: '분자·분모 각각 등비', difficulty: 'hard', complexity: '분자는 부호가 바뀌는 등비, 분모는 반으로 줄어드는 등비',
  rule: '분자는 부호가 바뀌는 등비수열이고 분모는 반씩 줄어듭니다.', formula: '분자와 분모를 각각 등비수열로 확인',
  method: '분자와 분모를 두 줄로 나눠 각각 몇 배인지 보세요. 부호는 분자에만 붙습니다.', kinds: [0, 2],
  make(r) {
   const k = [3, 5][r(0, 1)], length = k === 3 ? 7 : 6, m = length - 1, a = 1 + 2 * r(0, 7);
   const terms: number[] = [], shown: string[] = [], expressions: string[] = [];
   for (let j = 0; j < length; j++) {
    const num = a * (-k) ** j, den = 2 ** (m - j);
    terms.push(num / den); shown.push(ratio(num, den)); expressions.push(`${num}/${den}`);
   }
   return { terms, shown, expressions, facts: { a, k, m } };
  },
 },
 {
  name: '계차가 피보나치', difficulty: 'medium', complexity: '항의 차가 앞 두 차의 합',
  rule: '항의 차를 적으면 그 줄이 앞 두 수의 합으로 이어집니다.', formula: '계차 줄에 aₙ = aₙ₋₁ + aₙ₋₂ 적용',
  method: '차를 한 줄 적으세요. 그 줄이 등차가 아니라 앞 두 수의 합입니다.', kinds: [0, 1, 2, 3],
  make(r) {
   const a = r(2, 20), f0 = r(1, 4), f1 = f0 + r(1, 5);
   const gaps = [f0, f1]; for (let j = 2; j < 8; j++) gaps.push(gaps[j - 1] + gaps[j - 2]);
   const terms = [a], expressions = [String(a)];
   for (let j = 1; j < 9; j++) { expressions.push(`${terms[j - 1]}+${gaps[j - 1]}`); terms.push(terms[j - 1] + gaps[j - 1]); }
   return { terms, shown: terms.map(String), expressions, facts: { a, f0, f1 } };
  },
 },
 {
  name: '정수부 등비 · 소수부 등차', difficulty: 'medium', complexity: '소수점 앞뒤에 서로 다른 규칙',
  rule: '정수 부분은 등비수열이고 소수 두 자리는 일정하게 줄어듭니다.', formula: '소수점을 기준으로 정수부와 소수부를 두 줄로 분리',
  method: '소수점 앞뒤를 두 줄로 쪼개세요. 앞은 몇 배, 뒤는 몇씩 줄어드는지만 봅니다.', kinds: [0, 2],
  make(r) {
   const a = r(2, 6), rate = [2, 3][r(0, 1)], step = r(2, 4), start = r(5 * step + 1, 99);
   const terms: number[] = [], shown: string[] = [], expressions: string[] = [];
   for (let j = 0; j < 6; j++) {
    const whole = a * rate ** j, part = start - j * step;
    terms.push(whole + part / 100); shown.push((whole + part / 100).toFixed(2)); expressions.push(`${whole}+${part}/100`);
   }
   return { terms, shown, expressions, facts: { a, ratio: rate, start, step }, decimals: 2 };
  },
 },
 {
  name: '조화수열 · 역수가 등차', difficulty: 'hard', complexity: '뒤집어야 규칙이 보이는 분수',
  rule: '각 항을 뒤집으면 등차수열이 됩니다.', formula: '역수를 취한 뒤 공차 확인',
  method: '분자·분모를 따로 보지 말고 통째로 뒤집으세요. 역수 줄이 등차입니다.', kinds: [0, 3],
  make(r) {
   const q = r(1, 3), p = r(2, 9), d = r(1, 3), terms: number[] = [], expressions: string[] = [];
   for (let j = 0; j < 7; j++) { terms.push(q / (p + j * d)); expressions.push(`${q}/(${p}+${j}*${d})`); }
   return { terms, shown: terms.map(format), expressions, facts: { q, p, d } };
  },
 },
];
// Mirrors the question formats already used elsewhere: 중간 빈칸, 두 빈칸의 합·차, 먼 항.
function ask(seed: number, terms: number[], expressions: string[], kinds: number[]) {
 const r = rng(seed ^ 0x51d3f), kind = kinds[r(0, kinds.length - 1)];
 let A = 2, B = terms.length - 2;
 if (kind === 0) { A = r(2, terms.length - 2); B = A; }
 else if (kind === 3) { A = terms.length - 1; B = A; }
 else A = r(2, terms.length - 4);
 const expression = kind === 1 ? `(${expressions[A]})+(${expressions[B]})` : kind === 2 ? `(${expressions[B]})-(${expressions[A]})` : expressions[A];
 const answer = calculate(expression);
 const instruction = kind === 0 ? '빈칸 (A)에 들어갈 수를 구하세요.' : kind === 1 ? '(A)+(B)의 값을 구하세요.' : kind === 2 ? '(B)−(A)의 값을 구하세요.' : `${A + 1}번째 항을 구하세요.`;
 return { kind, A, B, answer, expression, instruction };
}
export const patternTemplates: Template[] = specs.map((spec, i) => ({
 id: `pat-${i}`, name: spec.name, category: spec.name, area: 'sequence', difficulty: spec.difficulty, complexity: spec.complexity,
 generate(seed: number) {
  const body = spec.make(rng(seed));
  const q = ask(seed, body.terms, body.expressions, spec.kinds);
  const visible = q.kind === 3 ? Math.min(6, body.terms.length - 2) : body.terms.length;
  const prompt = body.shown.slice(0, visible).map((value, j) => (q.kind !== 3 && j === q.A ? '(A)' : [1, 2].includes(q.kind) && j === q.B ? '(B)' : value));
  const steps = body.terms.map((value, j) => ({ label: `${j + 1}번째 항`, expression: body.expressions[j], value }));
  steps.push({ label: q.instruction, expression: q.expression, value: q.answer });
  return build(`pat-${i}`, spec.name, 'sequence', spec.difficulty, seed, {
   question: `${prompt.join(', ')}${q.kind === 3 ? ', …' : ''}\n${q.instruction}`,
   answer: q.answer, unit: '', facts: { ...body.facts, queryKind: q.kind, indexA: q.A, indexB: q.B },
   sequence: body.terms, rule: spec.rule, formula: spec.formula, signal: spec.name, decimals: body.decimals,
   shortcut: `${spec.method} ${q.kind === 3 ? '목표 항까지만 규칙을 이어 적습니다.' : q.kind === 0 ? '빈칸 앞뒤에 같은 관계가 성립하는지 확인합니다.' : 'A와 B를 각각 구한 뒤 더하거나 뺍니다.'}`,
   steps, memo: q.expression,
  });
 },
}));
