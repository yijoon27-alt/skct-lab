import { useMemo,useState } from 'react';
import { ArrowRight,Printer,Search,Target } from 'lucide-react';
import type { Area,Store } from '../engine/types';
import { tipGroups,weakTips,type Tip } from '../engine/tips';
const difficultyName=(d:Tip['difficulty'])=>({easy:'Easy',medium:'Medium',hard:'Hard'}[d]);
function TipCard({tip,practice}:{tip:Tip;practice:(area:Area,subtype:string)=>void}) {
 return <article className="tip-card">
  <div className="tip-head"><b>{tip.name}</b><span className={`difficulty ${tip.difficulty}`}>{difficultyName(tip.difficulty)}</span></div>
  <code className="tip-formula">{tip.formula}</code>
  <dl>
   <dt>이렇게 나오면</dt><dd>{tip.signal}</dd>
   <dt>이렇게 푼다</dt><dd>{tip.method}</dd>
  </dl>
  {tip.inPool
   ?<button className="text-button" onClick={()=>practice(tip.area,tip.id)}>이 유형 연습하기 <ArrowRight size={12}/></button>
   :<small className="tip-note">기본 유형 · 신규 출제에서 제외</small>}
 </article>;
}
export function Tips({store,practice}:{store:Store;practice:(area:Area,subtype:string)=>void}) {
 const [query,setQuery]=useState(''),[area,setArea]=useState<Area|'all'>('all');
 const groups=useMemo(()=>tipGroups(),[]);
 const weak=useMemo(()=>weakTips(store.attempts),[store.attempts]);
 const keyword=query.trim().toLowerCase();
 const visible=groups
  .map(g=>({...g,tips:g.tips.filter(t=>(area==='all'||t.area===area)&&(!keyword||`${t.name} ${t.category} ${t.formula} ${t.signal} ${t.method} ${g.title} ${g.aliases}`.toLowerCase().includes(keyword)))}))
  .filter(g=>g.tips.length);
 const count=visible.reduce((n,g)=>n+g.tips.length,0);
 // Consecutive groups share a section heading (거리·속력·시간 → 기본·단위 / 만남·추월 / …).
 const sections:{section:string;groups:typeof visible}[]=[];
 for(const g of visible){
  const last=sections.at(-1);
  if(last&&last.section===g.section)last.groups.push(g);else sections.push({section:g.section,groups:[g]});
 }
 return <>
  <div className="page-heading">
   <span className="eyebrow">FORMULA & PATTERN SHEET</span>
   <h1>자주 틀리는 유형은,<br/>공식부터 다시.</h1>
   <p>{groups.reduce((n,g)=>n+g.tips.length,0)}개 세부 유형의 핵심 공식과 문제를 알아보는 신호, 그리고 메모장에 바로 넣을 최단 풀이입니다. 창의수리 공식은 실제 문항 해설과 같은 표에서 가져옵니다.</p>
  </div>
  {weak.length>0&&<section className="panel content-panel">
   <h2><Target size={16}/> 내가 자주 틀리는 유형</h2>
   <p className="muted">첫 시도 기준으로 정답률이 낮은 순입니다. 풀이를 본 뒤 답한 문항과 재도전은 빼고 셉니다.</p>
   <div className="tip-list weak-list">{weak.map(t=><article className="tip-card weak" key={t.id}>
    <div className="tip-head"><b>{t.name}</b><span className="tip-score">{Math.round(t.accuracy)}%</span></div>
    <small>{t.category} · {t.total}문항 · 평균 {Math.round(t.seconds)}초</small>
    <code className="tip-formula">{t.formula}</code>
    <dl><dt>이렇게 푼다</dt><dd>{t.method}</dd></dl>
    {t.inPool&&<button className="text-button" onClick={()=>practice(t.area,t.id)}>이 유형 연습하기 <ArrowRight size={12}/></button>}
   </article>)}</div>
  </section>}
  <section className="panel content-panel">
   <div className="filter-row">
    <label className="tip-search"><Search size={14}/><input placeholder="유형·공식·신호 검색 (예: 기차, 소금물, 여사건)" aria-label="유형·공식 검색" value={query} onChange={e=>setQuery(e.target.value)}/></label>
    <select aria-label="팁 영역" value={area} onChange={e=>setArea(e.target.value as Area|'all')}>
     <option value="all">전체 영역</option><option value="creative">창의수리</option><option value="sequence">수열추리</option>
    </select>
    <span className="muted">{count}개 유형</span>
    <button className="text-button" onClick={()=>window.print()}><Printer size={13}/> 인쇄 · PDF로 저장</button>
   </div>
   {sections.length?sections.map(({section,groups})=><div className="tip-section" key={section}>
    <h2>{section}</h2>
    {groups.map(g=><div key={g.title}>
     <h3 className="tip-group-title">{g.title}</h3>
     <div className="tip-list">{g.tips.map(t=><TipCard key={t.id} tip={t} practice={practice}/>)}</div>
    </div>)}
   </div>):<div className="empty"><Search size={28}/><h3>검색 결과가 없습니다.</h3><p>다른 낱말로 찾아보세요.</p></div>}
  </section>
  <section className="notice"><Target size={19}/><div><b>공식은 외우고, 신호는 알아보기</b><p>시험장에서 시간을 줄이는 건 공식 자체보다 '이 문장이 어떤 유형인지' 알아보는 속도입니다. 틀린 문항은 오답노트에서 같은 유형으로 반복 출제할 수 있습니다.</p></div></section>
 </>;
}
