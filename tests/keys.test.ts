import { describe,it,expect } from 'vitest';
import { numpadKey,numLockOff,calcKey,optionKey } from '../src/engine/keys';
describe('넘패드 키 변환',()=>{
 it.each([['Numpad0','0','0'],['Numpad7','7','7'],['Numpad9','9','9'],['NumpadDecimal','.','.'],['NumpadAdd','+','+'],['NumpadSubtract','-','-'],['NumpadMultiply','*','*'],['NumpadDivide','/','/'],['NumpadParenLeft','(','('],['NumpadParenRight',')',')']])('%s → %s',(code,key,want)=>expect(numpadKey(code,key)).toBe(want));
 it('넘패드 Enter와 애플 키패드 =는 계산 실행',()=>{expect(numpadKey('NumpadEnter','Enter')).toBe('=');expect(numpadKey('NumpadEqual','=')).toBe('=');});
 it('애플 키패드 Clear는 초기화',()=>{expect(numpadKey('NumLock','Clear')).toBe('C');});
 it('NumLock이 꺼져 e.key가 바뀌어도 숫자를 받는다',()=>{expect(numpadKey('Numpad2','ArrowDown')).toBe('2');expect(numpadKey('Numpad1','End')).toBe('1');expect(numpadKey('NumpadDecimal','Delete')).toBe('.');});
 // NumLock이 꺼진 일반 넘패드의 5는 e.key가 'Clear'다. 애플 Clear로 오인해 계산기를 비우면 안 된다.
 it('NumLock 꺼진 5를 Clear로 오인하지 않는다',()=>{expect(numpadKey('Numpad5','Clear')).toBe('5');});
 it.each([['Digit1','1'],['Digit5','5'],['KeyN','n'],['KeyC','c'],['Enter','Enter'],['Equal','='],['Period','.'],['Slash','/'],['NumLock','NumLock'],['',''] ])('넘패드가 아닌 %s는 변환하지 않는다',(code,key)=>expect(numpadKey(code,key)).toBe(''));
});
describe('코드 이름을 모르는 넘패드도 받는다',()=>{
 // location 3은 표준이 정한 넘패드 자리다. 제조사가 코드 이름을 다르게 보내도 여기로 걸린다.
 it.each([['Unknown7','7','7'],['OEM_NUMPAD3','3','3'],['','9','9'],['KeypadPlus','+','+'],['KeypadSlash','/','/'],['Keypad','=','='],['X','(','('],['X',')',')'],['X','.','.'],['X',',','.'],['X','×','*'],['X','÷','/'],['X','−','-'],['X','Enter','='],['X','Clear','C'],['X','Backspace','⌫']])('location 3 · code %s · key %s → %s',(code,key,want)=>expect(numpadKey(code,key,3)).toBe(want));
 it('넘패드의 NumLock 키 자체는 무시한다',()=>{expect(numpadKey('NumLock','NumLock',3)).toBe('');expect(numpadKey('NumLock','NumLock')).toBe('');});
 it('넘패드 자리가 아니면 문자가 같아도 받지 않는다',()=>{expect(numpadKey('Digit7','7',0)).toBe('');expect(numpadKey('Equal','=',0)).toBe('');expect(numpadKey('Period','.',0)).toBe('');expect(numpadKey('Slash','/',0)).toBe('');});
 it('애플 키패드 Clear는 location 없이도 받는다',()=>{expect(numpadKey('NumLock','Clear')).toBe('C');});
 it('넘패드 자리라도 뜻을 알 수 없는 키는 무시한다',()=>{expect(numpadKey('X','F13',3)).toBe('');expect(numpadKey('X','Tab',3)).toBe('');expect(numpadKey('X','a',3)).toBe('');});
});
describe('NumLock 꺼짐 감지',()=>{
 it('숫자키인데 e.key가 그 숫자가 아니면 꺼진 상태',()=>{expect(numLockOff('Numpad2','ArrowDown')).toBe(true);expect(numLockOff('Numpad0','Insert')).toBe(true);});
 it('켜진 상태와 숫자 아닌 키는 알리지 않는다',()=>{expect(numLockOff('Numpad2','2')).toBe(false);expect(numLockOff('NumpadAdd','+')).toBe(false);expect(numLockOff('Digit2','2')).toBe(false);expect(numLockOff('NumLock','Clear')).toBe(false);});
});
describe('메인 키보드 숫자열도 계산기로 간다',()=>{
 // 넘패드가 없는 노트북에서는 이 경로가 유일한 직통 입력이다. 이것이 없으면 계산기 칸을
 // 먼저 클릭하거나 C를 눌러야만 숫자가 들어간다(2026-10-26에 신고된 증상).
 it.each([['Digit0','0','0'],['Digit1','1','1'],['Digit5','5','5'],['Digit7','7','7'],['Digit9','9','9'],['Minus','-','-'],['Equal','=','='],['Period','.','.'],['Slash','/','/']])('%s → %s',(code,key,want)=>expect(calcKey({code,key})).toBe(want));
 it('Shift 조합으로 나머지 연산자와 괄호를 친다',()=>{expect(calcKey({code:'Equal',key:'+',shiftKey:true})).toBe('+');expect(calcKey({code:'Digit8',key:'*',shiftKey:true})).toBe('*');expect(calcKey({code:'Digit9',key:'(',shiftKey:true})).toBe('(');expect(calcKey({code:'Digit0',key:')',shiftKey:true})).toBe(')');});
 it('Backspace는 한 글자를 지운다',()=>{expect(calcKey({code:'Backspace',key:'Backspace'})).toBe('⌫');});
 // Shift+1~5는 보기 선택 몫이다. 계산기가 먼저 집으면 보기를 고를 방법이 사라진다.
 it.each(['Digit1','Digit2','Digit3','Digit4','Digit5'])('Shift+%s는 계산기가 가져가지 않는다',code=>expect(calcKey({code,key:'!',shiftKey:true})).toBe(''));
 // 한글 입력 상태의 keydown은 e.key에 'Process'나 조합 중인 글자를 싣는다.
 // e.key만 보고 판단하면 한영 전환 한 번에 계산기가 통째로 먹통이 된다.
 it('한글 입력 상태에서도 숫자를 받는다',()=>{expect(calcKey({code:'Digit7',key:'Process'})).toBe('7');expect(calcKey({code:'Digit3',key:'ㅐ'})).toBe('3');});
 it('넘패드 경로는 그대로 살아 있다',()=>{expect(calcKey({code:'Numpad7',key:'Home',location:3})).toBe('7');expect(calcKey({code:'NumpadEnter',key:'Enter',location:3})).toBe('=');expect(calcKey({code:'NumLock',key:'Clear'})).toBe('C');});
 it('계산과 무관한 키는 받지 않는다',()=>{expect(calcKey({code:'KeyN',key:'n'})).toBe('');expect(calcKey({code:'KeyC',key:'c'})).toBe('');expect(calcKey({code:'Enter',key:'Enter'})).toBe('');expect(calcKey({code:'Digit6',key:'^',shiftKey:true})).toBe('');expect(calcKey({code:'Period',key:'>',shiftKey:true})).toBe('');});
 // 숫자열 배치가 다른 키보드를 위한 2차 경로.
 it('코드 이름을 모르는 배열은 e.key로 받는다',()=>{expect(calcKey({code:'Unknown',key:'4'})).toBe('4');expect(calcKey({code:'Unknown',key:'(',shiftKey:true})).toBe('(');expect(calcKey({code:'Unknown',key:'a'})).toBe('');});
});
describe('보기 선택은 Shift+숫자열',()=>{
 it.each([['Digit1',0],['Digit3',2],['Digit5',4]])('Shift+%s → %i번 보기',(code,want)=>expect(optionKey(code,true)).toBe(want));
 it('Shift 없는 숫자열은 보기 선택이 아니다',()=>{expect(optionKey('Digit1',false)).toBe(-1);expect(optionKey('Digit3',false)).toBe(-1);});
 it('1~5 밖과 넘패드는 보기 선택이 아니다',()=>{expect(optionKey('Digit6',true)).toBe(-1);expect(optionKey('Digit0',true)).toBe(-1);expect(optionKey('Numpad3',true)).toBe(-1);});
});
