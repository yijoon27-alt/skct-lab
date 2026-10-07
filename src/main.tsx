import { Component,StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './style.css';
class Boundary extends Component<{children:React.ReactNode},{error:boolean}>{state={error:false};static getDerivedStateFromError(){return {error:true};}render(){return this.state.error?<main className="panel content-panel"><h1>화면을 불러오지 못했습니다.</h1><p>저장 기록은 삭제되지 않았습니다. 새로고침하거나 백업을 확인하세요.</p><button onClick={()=>location.reload()}>새로고침</button></main>:this.props.children;}}
createRoot(document.getElementById('root')!).render(<StrictMode><Boundary><App/></Boundary></StrictMode>);
