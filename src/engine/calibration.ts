import { format } from './math';
import type { Question } from './types';
// Design limits informed by reference review; these are not official SKCT limits.
export const referenceLimits={countOption:5000,sequenceMagnitude:50000,fractionDenominator:2000};
export function calibrationErrors(q:Question):string[]{
 if(!['1.1.0','1.2.0','1.3.0','1.4.0','1.5.0','1.6.0','1.7.0'].includes(q.generatorVersion))return [];
 const errors:string[]=[],values=Array.isArray(q.optionValues)?q.optionValues:[];
 if(q.unit==='가지'&&values.some(v=>v>referenceLimits.countOption))errors.push('경우의 수 계산 규모 초과');
 if(q.type==='sequence'&&[...(Array.isArray(q.sequence)?q.sequence:[]),...values].some(v=>Math.abs(v)>referenceLimits.sequenceMagnitude))errors.push('수열 계산 규모 초과');
 if(values.some(v=>Number(format(v).split('/')[1]||1)>referenceLimits.fractionDenominator))errors.push('분수 분모 계산 규모 초과');
 return errors;
}
