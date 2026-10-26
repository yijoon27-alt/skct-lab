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
// 표에 없는 코드를 쓰는 넘패드도 받기 위한 2차 경로. e.key에 실린 문자를 그대로 쓴다.
const FROM_KEY: Record<string,string> = {Enter:'=',Clear:'C',Backspace:'⌫',',':'.','×':'*','÷':'/','−':'-'};
// code, key, location 세 가지를 모두 본다. location 3은 표준이 정한 '넘패드 자리'이므로
// 제조사가 어떤 코드 이름을 보내든 넘패드에서 온 키인지 알 수 있다.
export function numpadKey(code: string,key: string,location?: number): string {
 const mapped=NUMPAD[code];
 if(mapped)return mapped;
 const onPad=location===3||code.startsWith('Numpad');
 // 애플 정품 키패드의 Clear는 code가 'NumLock'이다. NumLock이 꺼진 일반 넘패드의 5도
 // e.key가 'Clear'이므로, 위의 code 조회가 반드시 먼저 끝난 뒤에 이 줄에 닿아야 한다.
 if(!onPad)return key==='Clear'?'C':'';
 if(key==='NumLock')return '';
 if(FROM_KEY[key])return FROM_KEY[key];
 if(key.length===1&&'0123456789.+-*/()='.includes(key))return key;
 return '';
}
// 넘패드 숫자키인데 e.key가 그 숫자가 아니면 NumLock이 꺼진 상태다.
// 계산기는 numpadKey로 받아내지만 메모장에는 아무것도 입력되지 않으므로 한 번 알린다.
export function numLockOff(code: string,key: string): boolean {
 const digit=/^Numpad([0-9])$/.exec(code);
 return !!digit&&key!==digit[1];
}
// 메인 키보드 숫자열도 계산기로 보낸다. 넘패드가 없는 노트북에서는 이 경로가 유일한 직통 입력이다.
// e.key가 아니라 e.code로 판별하는 이유는 한글 입력 상태의 keydown이 e.key에 'Process'나
// 조합 중인 글자를 싣기 때문이다. 그때 e.key만 보면 계산기가 통째로 먹통이 된다.
const MAIN: Record<string,string> = {
 Digit0:'0',Digit1:'1',Digit2:'2',Digit3:'3',Digit4:'4',
 Digit5:'5',Digit6:'6',Digit7:'7',Digit8:'8',Digit9:'9',
 Minus:'-',Equal:'=',Period:'.',Slash:'/',Backspace:'⌫',
};
// Shift를 누른 숫자열. Digit1~Digit5가 여기 없는 것은 보기 선택 몫이기 때문이다.
const SHIFTED: Record<string,string> = {Equal:'+',Digit8:'*',Digit9:'(',Digit0:')'};
export type CalcKeyEvent = {code:string;key:string;location?:number;shiftKey?:boolean};
// 넘패드와 메인 키보드를 합친 단일 입구. 빈 문자열이면 계산기가 쓸 키가 아니다.
export function calcKey(e: CalcKeyEvent): string {
 const pad=numpadKey(e.code,e.key,e.location);
 if(pad)return pad;
 // Shift+숫자열 1~5는 보기 선택이 가져간다. 계산기가 먼저 집으면 보기를 고를 방법이 사라진다.
 if(e.shiftKey&&/^Digit[1-5]$/.test(e.code))return '';
 const mapped=e.shiftKey?SHIFTED[e.code]:MAIN[e.code];
 if(mapped)return mapped;
 // 숫자열 배치가 다른 키보드를 위한 2차 경로. 여기서만 e.key에 실린 문자를 그대로 쓴다.
 return e.key.length===1&&'0123456789.+-*/()'.includes(e.key)?e.key:'';
}
// 보기 선택은 Shift+숫자열 1~5다. e.key는 Shift가 섞이면 '!'~'%'가 되므로 e.code로 본다.
export function optionKey(code: string,shiftKey: boolean): number {
 const m=/^Digit([1-5])$/.exec(code);
 return shiftKey&&m?Number(m[1])-1:-1;
}
