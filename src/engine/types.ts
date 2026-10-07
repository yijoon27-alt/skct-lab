export type Area = 'creative' | 'sequence';
export type Difficulty = 'easy' | 'medium' | 'hard';
export interface Step { label: string; expression: string; value: number }
export interface Question {
 id: string; type: Area; subtype: string; category: string; difficulty: Difficulty;
 question: string; options: string[]; optionValues: number[]; correctAnswer: number;
 answer: number; unit: string; explanation: string; shortcut: string; memo: string;
 keyFormula: string; signal: string; steps: Step[]; seed: number; generatorVersion: string;
 facts: Record<string, number>; sequence?: number[]; rule?: string; diagram?: {kind: 'grid'|'cross'; cells: (number|null)[][]};
}
export interface Template { id: string; name: string; category: string; area: Area; difficulty: Difficulty; complexity: string; generate: (seed: number) => Question }
export type Mode = 'card' | 'exam';
export interface Attempt { id: string; question: Question; selected: number | null; correct: boolean; seconds: number; at: string; sessionId: string; first: boolean; note: string; assisted?: boolean }
export interface Session { id: string; area: Area; mode: Mode; questions: Question[]; index: number; answers: Record<string, number | null>; seconds: Record<string, number>; notes: Record<string, string>; startedAt: number | null; deadline: number | null; remaining: number; done: boolean; running: boolean; review: boolean; revealed?: string[] }
export interface Report { id: string; question: Question; reason: string; detail: string; at: string; resolved: boolean }
export interface ExamResult { id: string; area: Area; at: string; score: number; count: number; seconds: number; assisted?: number }
export interface Store { version: 1; attempts: Attempt[]; session: Session | null; notes: Record<string,string>; favorites: Question[]; reports: Report[]; results: ExamResult[]; settings: { dark: boolean; autoNext: boolean; timed: boolean }; drafts: Draft[]; recent: string[] }
export interface Draft { id: string; question: string; options: string[]; correctAnswer: number; expression: string; explanation: string; category: string; difficulty: Difficulty; status: 'draft' | 'verified' | 'approved'; reviewed: boolean }
