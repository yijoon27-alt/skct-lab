// Korean particle selection. Generators must build sentences through these helpers so that
// "13로"(→13으로), "6와"(→6과), "다리을"(→다리를) can never reach a question again.
export type Final = 'none' | 'rieul' | 'other';
// Sino-Korean reading of each final digit: 1 일(ㄹ) 2 이 3 삼(ㅁ) 4 사 5 오 6 육(ㄱ) 7 칠(ㄹ) 8 팔(ㄹ) 9 구.
const digitFinal: Final[] = ['other','rieul','none','other','none','none','other','rieul','rieul','none'];
export function finalOf(value: number | string): Final {
 const text = String(value).trim();
 if (!text) return 'other';
 const last = text[text.length - 1];
 const code = last.charCodeAt(0);
 if (code >= 0xac00 && code <= 0xd7a3) { const jong = (code - 0xac00) % 28; return jong === 0 ? 'none' : jong === 8 ? 'rieul' : 'other'; }
 // "q분의 p" is read numerator last, so a rational is decided by its numerator.
 const numeric = text.includes('/') ? text.split('/')[0] : text;
 const digits = numeric.replace(/[^0-9]/g, '');
 if (!digits) return 'other';
 if (digits === '0' || (digits.length === 1 && digits === '0')) return 'other';
 // A trailing zero means the reading ends in 십·백·천·만, each of which carries a non-ㄹ final.
 if (!numeric.includes('.') && digits.endsWith('0')) return 'other';
 return digitFinal[Number(digits[digits.length - 1])];
}
export const ro = (value: number | string) => (finalOf(value) === 'other' ? '으로' : '로');
export const wa = (value: number | string) => (finalOf(value) === 'none' ? '와' : '과');
export const eul = (value: number | string) => (finalOf(value) === 'none' ? '를' : '을');
export const eun = (value: number | string) => (finalOf(value) === 'none' ? '는' : '은');
export const iga = (value: number | string) => (finalOf(value) === 'none' ? '가' : '이');
// 이/가 and 은/는 are excluded on purpose: "5이다" is a copula and "있는" is a verb ending,
// so only the three particles that can never be anything else are swept.
const pairs: [string, string, (v: string) => string][] = [['으로', '로', ro], ['와', '과', wa], ['을', '를', eul]];
// 좌표처럼 괄호가 닫힌 뒤에 붙는 조사도 끝 숫자의 받침으로 정해진다: (1,3)을.
const attached = /([0-9][0-9,]*(?:\.[0-9]+)?(?:\/[0-9]+)?)\)?(으로|로|와|과|을|를)/g;
export function particleErrors(text: string): string[] {
 const errors: string[] = [];
 for (const [a, b, pick] of pairs) {
  attached.lastIndex = 0;
  for (let m = attached.exec(text); m; m = attached.exec(text)) {
   if (m[2] !== a && m[2] !== b) continue;
   const correct = pick(m[1]);
   if (correct !== m[2]) errors.push(`조사 오류: "${m[1]}${m[2]}" → "${m[1]}${correct}"`);
  }
 }
 return [...new Set(errors)];
}
