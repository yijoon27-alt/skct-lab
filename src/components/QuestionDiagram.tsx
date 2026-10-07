import type { Question } from '../engine/types';
export function QuestionDiagram({question}:{question:Question}){
 const diagram=question.diagram;if(!diagram)return null;
 const value=(v:number|null)=>v===null?'(A)':String(v);
 if(diagram.kind==='grid')return <div className="question-diagram"><table aria-label="문제 숫자 표"><tbody>{diagram.cells.map((row,j)=><tr key={j}>{row.map((v,k)=><td key={k} className={v===null?'missing':''}>{value(v)}</td>)}</tr>)}</tbody></table></div>;
 return <div className="cross-diagrams" aria-label="문제 숫자 도형">{diagram.cells.map(([left,right,top,bottom],j)=><div className="cross-diagram" role="group" aria-label={`${j+1}번째 도형`} key={j}><span className="cross-top">{value(top)}</span><span className="cross-left">{value(left)}</span><span className="cross-right">{value(right)}</span><span className={`cross-bottom ${bottom===null?'missing':''}`}>{value(bottom)}</span></div>)}</div>;
}
