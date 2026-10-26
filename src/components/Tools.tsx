import { useEffect,useRef,useState } from 'react';
import { Pencil,Calculator as CalcIcon,Trash2,RotateCcw,ChevronDown } from 'lucide-react';
import { calculate } from '../engine/math';
import { numpadKey } from '../engine/keys';
export function focusTool(target:'memo'|'calc'){window.dispatchEvent(new CustomEvent('skct:focus-tool',{detail:target}));}
// 숫자·연산자 키는 계산기 입력이다. App.tsx의 전역 핸들러가 넘패드든 숫자열이든 여기로 보낸다.
export function sendCalcKey(key:string){window.dispatchEvent(new CustomEvent('skct:calc-key',{detail:key}));}
export function Tools({note,onNote,restore,focusRef,questionKey}:{questionKey:string;note:string;onNote:(s:string)=>void;restore:()=>void;focusRef:React.RefObject<HTMLTextAreaElement|null>}) {
 const [expr,setExpr]=useState(''),[result,setResult]=useState('0'),[error,setError]=useState(''),[open,setOpen]=useState(true);
 const calcRef=useRef<HTMLInputElement>(null);
 // 계산식은 ref에도 동기로 적어 둔다. 넘패드를 연타하면 한 번의 렌더 사이에 여러 키가 들어오는데,
 // 그때 state 클로저를 읽으면 직전 글자를 잃거나 '='가 빈 식을 계산한다.
 const exprRef=useRef('');
 const writeExpr=(next:string)=>{exprRef.current=next;setExpr(next);};
 useEffect(()=>{writeExpr('');setResult('0');setError('');},[questionKey]);
 useEffect(()=>{const focus=(e:Event)=>{setOpen(true);setTimeout(()=>{if((e as CustomEvent).detail==='memo')focusRef.current?.focus();else calcRef.current?.focus();},0);};window.addEventListener('skct:focus-tool',focus);return()=>window.removeEventListener('skct:focus-tool',focus);},[focusRef]);
 const input=(key:string)=>{setError('');if(key==='C'){writeExpr('');setResult('0');}else if(key==='⌫')writeExpr(exprRef.current.slice(0,-1));else if(key==='='){try{const n=calculate(exprRef.current);setResult(Number(n.toPrecision(12)).toString());}catch(e){setError((e as Error).message);}}else writeExpr(exprRef.current+key);};
 // 첫 키만 직접 넣고 포커스를 옮긴다. 이후 키는 브라우저 기본 입력으로 들어간다.
 // .tools-body.collapsed가 display:none이라 접힌 상태에서는 setOpen(true) 없이 focus()가 먹지 않는다.
 useEffect(()=>{const key=(e:Event)=>{setOpen(true);input((e as CustomEvent).detail as string);setTimeout(()=>{const el=calcRef.current;if(el){el.focus();el.setSelectionRange(el.value.length,el.value.length);}},0);};window.addEventListener('skct:calc-key',key);return()=>window.removeEventListener('skct:calc-key',key);});
 return <aside className="tools panel" aria-label="풀이 도구"><button className="tools-heading" onClick={()=>setOpen(!open)}><span className="eyebrow">PRACTICE TOOLS</span><span className="badge">실전 도구 <ChevronDown size={13}/></span></button><div className={open?'tools-body':'tools-body collapsed'}><div className="tool-label"><h3><Pencil size={15}/> 메모장</h3><span><button className="text-button" onClick={restore} title="이전 저장 메모 복원"><RotateCcw size={13}/></button><button className="text-button" onClick={()=>onNote('')} aria-label="메모 전체 삭제"><Trash2 size={13}/></button></span></div><textarea ref={focusRef} aria-label="문제별 메모장" value={note} onChange={e=>onNote(e.target.value)} placeholder={'빠른 풀이식을 남겨보세요.\n예) 선두거리 ÷ 속력차'} maxLength={20000}/><div className="math-symbols">{['÷','×','→','²','√','%'].map(s=><button key={s} onClick={()=>{onNote(note+s);focusRef.current?.focus();}}>{s}</button>)}</div><small>문항별 자동 저장 · 메모 입력 중 단축키 비활성</small><div className="divider"/><div className="tool-label"><h3><CalcIcon size={15}/> 계산기</h3><button className="text-button" onClick={()=>input('C')}>초기화</button></div><div className="calculator-display"><input id="calculator-input" ref={calcRef} aria-label="계산식" value={expr} placeholder="계산식을 입력하세요" onChange={e=>{writeExpr(e.target.value);setError('');}} onKeyDown={e=>{if(e.key==='Enter'||e.key==='='){e.preventDefault();input('=');return;}if(e.key==='Escape'){e.currentTarget.blur();return;}const pad=numpadKey(e.code,e.key,e.location);if(pad&&pad!=='='){e.preventDefault();input(pad);}}}/><output aria-label="계산 결과">{error?<span className="calc-error">{error}</span>:result}</output></div><div className="keypad">{['C','(',')','⌫','7','8','9','/','4','5','6','*','1','2','3','-','0','.','=','+'].map(k=><button key={k} className={k==='='?'equals':['/','*','-','+'].includes(k)?'operator':''} onClick={()=>input(k)}>{k==='*'?'×':k==='/'?'÷':k}</button>)}</div><small>숫자·연산자 키로 바로 입력 · Enter 계산 · Clear 초기화 · 문제 이동 시 자동 초기화</small><div className="divider"/><div className="tool-tip"><span>빠른 풀이 습관</span><p>계산 전에 유형을 먼저 알아보세요.<br/>한 줄의 식이 시간을 줄여줍니다.</p></div></div></aside>;
}
