import { describe,it,expect } from 'vitest';
import { numpadKey,numLockOff } from '../src/engine/keys';
describe('넘패드 키 변환',()=>{
 it.each([['Numpad0','0','0'],['Numpad7','7','7'],['Numpad9','9','9'],['NumpadDecimal','.','.'],['NumpadAdd','+','+'],['NumpadSubtract','-','-'],['NumpadMultiply','*','*'],['NumpadDivide','/','/'],['NumpadParenLeft','(','('],['NumpadParenRight',')',')']])('%s → %s',(code,key,want)=>expect(numpadKey(code,key)).toBe(want));
 it('넘패드 Enter와 애플 키패드 =는 계산 실행',()=>{expect(numpadKey('NumpadEnter','Enter')).toBe('=');expect(numpadKey('NumpadEqual','=')).toBe('=');});
 it('애플 키패드 Clear는 초기화',()=>{expect(numpadKey('NumLock','Clear')).toBe('C');});
 it('NumLock이 꺼져 e.key가 바뀌어도 숫자를 받는다',()=>{expect(numpadKey('Numpad2','ArrowDown')).toBe('2');expect(numpadKey('Numpad1','End')).toBe('1');expect(numpadKey('NumpadDecimal','Delete')).toBe('.');});
 // NumLock이 꺼진 일반 넘패드의 5는 e.key가 'Clear'다. 애플 Clear로 오인해 계산기를 비우면 안 된다.
 it('NumLock 꺼진 5를 Clear로 오인하지 않는다',()=>{expect(numpadKey('Numpad5','Clear')).toBe('5');});
 it.each([['Digit1','1'],['Digit5','5'],['KeyN','n'],['KeyC','c'],['Enter','Enter'],['Equal','='],['Period','.'],['Slash','/'],['NumLock','NumLock'],['',''] ])('넘패드가 아닌 %s는 변환하지 않는다',(code,key)=>expect(numpadKey(code,key)).toBe(''));
});
describe('NumLock 꺼짐 감지',()=>{
 it('숫자키인데 e.key가 그 숫자가 아니면 꺼진 상태',()=>{expect(numLockOff('Numpad2','ArrowDown')).toBe(true);expect(numLockOff('Numpad0','Insert')).toBe(true);});
 it('켜진 상태와 숫자 아닌 키는 알리지 않는다',()=>{expect(numLockOff('Numpad2','2')).toBe(false);expect(numLockOff('NumpadAdd','+')).toBe(false);expect(numLockOff('Digit2','2')).toBe(false);expect(numLockOff('NumLock','Clear')).toBe(false);});
});
