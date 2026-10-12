// 넘패드 키를 계산기 입력 문자로 바꾼다. e.key가 아니라 e.code를 쓰기 때문에
// NumLock이 꺼진 넘패드(e.key가 'End'·'ArrowDown'으로 바뀌는 상태)에서도 숫자를 받는다.
// 반환 문자열은 Tools.tsx의 input()이 이미 아는 키 이름을 그대로 쓴다.
const NUMPAD: Record<string,string> = {
 Numpad0:'0',Numpad1:'1',Numpad2:'2',Numpad3:'3',Numpad4:'4',
 Numpad5:'5',Numpad6:'6',Numpad7:'7',Numpad8:'8',Numpad9:'9',
 NumpadDecimal:'.',NumpadAdd:'+',NumpadSubtract:'-',
 NumpadMultiply:'*',NumpadDivide:'/',
 NumpadParenLeft:'(',NumpadParenRight:')',
 NumpadEnter:'=',NumpadEqual:'=',NumpadBackspace:'⌫',
};
export function numpadKey(code: string,key: string): string {
 const mapped=NUMPAD[code];
 if(mapped)return mapped;
 // 애플 정품 키패드의 Clear는 code가 'NumLock'이고 key가 'Clear'다.
 // NumLock이 꺼진 일반 넘패드의 5도 e.key가 'Clear'이므로 code 조회를 먼저 해야 한다.
 if(key==='Clear')return 'C';
 return '';
}
// 넘패드 숫자키인데 e.key가 그 숫자가 아니면 NumLock이 꺼진 상태다.
// 계산기는 numpadKey로 받아내지만 메모장에는 아무것도 입력되지 않으므로 한 번 알린다.
export function numLockOff(code: string,key: string): boolean {
 const digit=/^Numpad([0-9])$/.exec(code);
 return !!digit&&key!==digit[1];
}
