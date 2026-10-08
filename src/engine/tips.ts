import { practiceTemplates, templates } from './bank';
import { creativeGuidance, type Guidance } from './guidance';
import { getStats } from './session';
import type { Area, Attempt, Difficulty } from './types';
// Study sheet for the 공식 정리 page. 창의수리 86개 유형의 문구는 guidance.ts 하나에서 가져오므로
// 문항 해설과 절대 갈라지지 않는다. 수열·조건부 확률은 생성기가 시드마다 문구를 조립하므로 여기에
// 따로 적고, 시드와 무관한 공식은 생성기 값과 같은지 테스트가 고정한다. 신호·최단풀이는 외우기
// 좋게 다시 쓴 것이라 생성기 문구와 같을 필요가 없다(수열 생성기의 signal은 유형 이름 그 자체다).
// aliases는 화면에 보이지 않고 검색에만 쓴다. 문제 문장은 '용액'이라고 쓰지만 사람은 '소금물'로 찾는다.
const extraGuidance:Record<string,Guidance>={
 // bayes
 'bayes-0':{formula:'P(A|관찰) = A이면서 관찰된 수 ÷ 전체 관찰된 수',signal:'불량품을 하나 꺼냈다처럼 결과를 이미 본 뒤 어느 쪽에서 나왔는지 묻는 표현',method:'1만 개 기준으로 생산 비중 × 불량률을 두 칸에 적고, A칸을 두 칸의 합으로 나눕니다. %의 공통 분모는 약분됩니다.'},
 'bayes-1':{formula:'P(A|관찰) = A이면서 관찰된 수 ÷ 전체 관찰된 수',signal:'검사 결과가 양성인데 실제로 그런지 묻는 표현. 민감도와 특이도가 따로 주어집니다.',method:'결함 없는 쪽의 양성률 = 100 − 특이도부터 구합니다. 두 칸(결함×민감도, 정상×위양성률)을 적고 앞칸을 합으로 나눕니다.'},
 'bayes-2':{formula:'P(A|관찰) = A이면서 관찰된 수 ÷ 전체 관찰된 수',signal:'이수자 중 한 명을 골랐다처럼 조건을 만족하는 사람만 남긴 뒤 소속을 묻는 표현',method:'해당하는 사람만 남깁니다. 집단 비중 × 집단 안의 비율을 두 칸에 적고 앞칸을 합으로 나눕니다.'},
 // seq
 'seq-0':{formula:'aₙ = a₁ + (n−1)d',signal:'이웃한 항의 차가 처음부터 끝까지 같음',method:'차를 한 번 구하고 빈칸까지 몇 칸인지만 세어 곱합니다.'},
 'seq-1':{formula:'aₙ = a₁ × rⁿ⁻¹',signal:'이웃한 항의 비가 일정하고 증가 폭이 점점 커짐',method:'나눠서 공비를 찾고 빈칸까지 칸 수만큼 곱합니다.'},
 'seq-2':{formula:'aₙ = a₁ + (n−1)d + c(n−1)(n−2)/2',signal:'차를 적어 보면 그 차가 또 일정하게 커짐',method:'항의 차를 한 줄 더 적습니다. 두 번째 줄이 등차면 거꾸로 복원합니다.'},
 'seq-3':{formula:'계차 합 = b × n(n−1)/2',signal:'항의 차가 일정한 수의 1배, 2배, 3배로 늘어남',method:'차의 줄을 적고 그 줄이 등차인지 봅니다. 빈칸 앞 항에 해당 차를 더합니다.'},
 'seq-4':{formula:'3차 계차 일정 → 계차를 차례로 복원',signal:'차를 두 번 적어야 비로소 일정해짐',method:'차의 줄을 두 번 적습니다. 맨 아래 줄부터 위로 되돌려 올립니다.'},
 'seq-5':{formula:'다음 항 = 이전 항 × r + c',signal:'증가 폭이 커지지만 공비로 딱 떨어지지 않음',method:'연속한 두 항으로 ×r+c의 r과 c를 연립해 찾습니다. 작은 정수부터 대입하면 빠릅니다.'},
 'seq-6':{formula:'다음 항 = 이전 항 × r − c',signal:'곱한 뒤 조금씩 깎이는 모양',method:'두 항으로 r과 c를 찾습니다. 부호만 뺄셈으로 두고 같은 방법을 씁니다.'},
 'seq-7':{formula:'홀→짝: +c, 짝→홀: ×r',signal:'더하기와 곱하기가 번갈아 나타남',method:'한 칸 건너 비교하지 말고 이웃한 칸의 연산 종류를 번갈아 확인합니다.'},
 'seq-8':{formula:'홀수항·짝수항을 두 줄로 분리',signal:'이웃한 항끼리는 규칙이 없는데 한 칸씩 건너뛰면 보임',method:'1·3·5번째와 2·4·6번째를 두 줄로 따로 적습니다. 각 줄의 차만 봅니다.'},
 'seq-9':{formula:'aₙ = aₙ₋₁ + aₙ₋₂',signal:'앞의 두 항을 더하면 다음 항이 됨',method:'앞 두 항을 더해 봅니다. 맞으면 그대로 이어갑니다.'},
 'seq-10':{formula:'aₙ = aₙ₋₁ + aₙ₋₂ + c',signal:'앞 두 항의 합보다 항상 일정하게 큼',method:'앞 두 항을 더한 뒤 실제 항과의 차를 봅니다. 그 차가 c입니다.'},
 'seq-11':{formula:'Tₙ = n(n+1)/2',signal:'1, 3, 6, 10처럼 늘어나는 폭이 1씩 커짐',method:'삼각수 1, 3, 6, 10, 15, 21을 외워 두고 몇 배인지만 봅니다.'},
 'seq-12':{formula:'aₙ = (n+k)² + c',signal:'제곱수에서 일정한 수만큼 떨어져 있음',method:'각 항에서 가까운 제곱수를 빼 봅니다. 차가 일정하면 그 값이 c입니다.'},
 'seq-13':{formula:'aₙ = (n+k)³ + c',signal:'증가 폭이 매우 빠르고 세제곱수에 가까움',method:'8, 27, 64, 125를 떠올려 차를 확인합니다.'},
 'seq-14':{formula:'1과 자기 자신 외 약수가 없는 다음 자연수',signal:'계산 규칙이 없고 값이 모두 소수',method:'2, 3, 5, 7, 11, 13, 17, 19, 23, 29를 외워 두고 자리만 맞춥니다.'},
 'seq-15':{formula:'통분한 뒤 분자 계차 확인',signal:'분모가 같거나 같게 만들 수 있는 분수 나열',method:'분모를 하나로 통일한 뒤 분자만 등차인지 봅니다.'},
 'seq-16':{formula:'분자와 분모 각각 일정한 차를 적용',signal:'분수인데 분자 줄과 분모 줄이 서로 다른 속도로 커짐',method:'분자와 분모를 위아래 두 줄로 따로 적습니다. 약분된 항이 있으면 되돌려서 비교합니다.'},
 'seq-17':{formula:'역수로 바꾼 뒤 계차 확인',signal:'분자가 모두 1이고 분모만 변함',method:'뒤집어서 분모만 수열로 봅니다.'},
 'seq-18':{formula:'소수점을 옮겨 정수로 비교',signal:'0.3, 0.7, 1.1처럼 소수 한 자리로 변함',method:'10을 곱해 정수로 바꾼 뒤 차를 봅니다. 마지막에 다시 10으로 나눕니다.'},
 'seq-19':{formula:'크기 규칙과 부호 규칙을 분리',signal:'부호가 +, −로 번갈아 나타남',method:'절댓값만 적어 규칙을 찾고 부호는 자리 번호로 따로 정합니다.'},
 'seq-20':{formula:'3개씩 부호를 묶고 절댓값 계차 확인',signal:'부호가 +, +, −처럼 세 개 주기로 반복',method:'부호를 3개씩 묶어 주기를 확인한 뒤 절댓값만 수열로 봅니다.'},
 'seq-21':{formula:'[p, q, p+q]를 반복, p와 q는 등차',signal:'3개씩 끊으면 세 번째가 앞 두 개의 합',method:'3개씩 세로로 끊어 적습니다. 각 묶음의 첫째·둘째가 각각 등차인지 봅니다.'},
 'seq-22':{formula:'×r 이후 +c, −c 반복',signal:'곱한 뒤 더하고 빼기를 번갈아 함',method:'공비를 먼저 찾고 남는 값의 부호가 번갈아 바뀌는지 확인합니다.'},
 'seq-23':{formula:'홀짝 분리 후 각각 비율·차 확인',signal:'한 줄은 곱으로, 다른 줄은 덧셈으로 늘어남',method:'홀수항과 짝수항을 두 줄로 나눕니다. 한 줄은 비, 다른 줄은 차로 봅니다.'},
 'seq-24':{formula:'aₙ₊₁ = r × aₙ + n × c',signal:'곱한 뒤 더하는 값이 자리마다 조금씩 커짐',method:'공비를 찾고 남는 값이 자리 번호에 비례하는지 봅니다.'},
 // refseq
 'refseq-0':{formula:'표현을 통일하면 항의 차가 일정',signal:'분수와 소수가 섞여 나옴',method:'전부 분수나 전부 소수로 통일한 뒤 차를 봅니다.'},
 'refseq-1':{formula:'표현 통일 → 공비 → 빈칸 계산',signal:'분수와 소수가 섞여 있고 값이 배로 커짐',method:'표현을 통일한 뒤 나눠서 공비가 2인지 확인합니다.'},
 'refseq-2':{formula:'분자의 계차와 분모의 공차를 각각 복원',signal:'분수인데 분자는 계차수열, 분모는 등차',method:'분자 줄과 분모 줄을 따로 적습니다. 분자 줄은 차를 한 번 더 적어 봅니다.'},
 'refseq-3':{formula:'역수 → 계차 → 원래 값으로 복원',signal:'분자가 1이고 분모의 증가 폭이 커짐',method:'뒤집은 뒤 분모의 차를 한 줄 더 적습니다.'},
 'refseq-4':{formula:'정수 부분과 소수 두 자리 숫자를 두 줄로 나눔',signal:'3.05, 5.08처럼 정수 부분과 소수 부분이 따로 움직임',method:'소수점을 기준으로 두 줄로 쪼갭니다. 각각 등차·계차인지 봅니다.'},
 'refseq-5':{formula:'aₙ = aₙ₋₁ × aₙ₋₂',signal:'값이 폭발적으로 커지고 항 수가 적음',method:'앞 두 항을 곱해 봅니다. 더해서 안 맞으면 곱을 의심합니다.'},
 'refseq-6':{formula:'aₙ = aₙ₋₁ + aₙ₋₂ + aₙ₋₃',signal:'앞 두 항의 합보다 크고 세 항의 합과 맞음',method:'앞 세 항을 더해 봅니다.'},
 'refseq-7':{formula:'홀짝 분리 → 홀수 줄의 이전 두 항 합',signal:'한 줄은 등차인데 다른 줄만 급하게 커짐',method:'홀짝으로 나눈 뒤 커지는 줄에서만 앞 두 항의 합을 확인합니다.'},
 'refseq-8':{formula:'[p, q, p×q]',signal:'3개씩 끊으면 세 번째가 앞 두 개의 곱',method:'3개씩 끊어 적고 셋째 칸이 앞 두 칸의 곱인지 봅니다.'},
 'refseq-9':{formula:'[p, q, p−q]',signal:'3개씩 끊으면 세 번째가 앞 두 개의 차',method:'3개씩 끊어 적고 셋째 칸이 첫째 − 둘째인지 봅니다.'},
 'refseq-10':{formula:'첫째 × 둘째 + 셋째 = 넷째',signal:'표의 각 행에 같은 관계가 반복됨',method:'완성된 행에서 관계를 먼저 찾습니다. 곱을 먼저 시도하고 남는 값을 합·차로 맞춥니다.'},
 'refseq-11':{formula:'왼쪽 × 오른쪽 − 위 = 아래',signal:'여러 도형에 같은 위치 관계가 반복됨',method:'같은 위치끼리 세로로 비교합니다. 두 칸의 곱과 남은 칸의 합·차를 먼저 대조합니다.'},
 'refseq-12':{formula:'표현 통일 → 앞 두 항 합',signal:'분수·소수가 섞여 있는데 앞 두 항의 합으로 이어짐',method:'표현을 통일한 뒤 앞 두 항을 더해 봅니다.'},
 'refseq-13':{formula:'소수점 이동 → +b, ×2 교대',signal:'소수인데 더하기와 2배가 번갈아 나타남',method:'소수 한 자리를 유지한 채 이웃 연산을 번갈아 확인합니다.'},
};
export const tipGuidance:Record<string,Guidance>={...creativeGuidance,...extraGuidance};
// inPool: 신규 출제 풀에 있는 유형만 '연습하기'로 문제를 뽑을 수 있다. Easy와 단순 유형은 공식만 싣는다.
export interface Tip extends Guidance { id:string; name:string; area:Area; category:string; difficulty:Difficulty; inPool:boolean }
export interface TipGroup { area:Area; section:string; title:string; aliases:string; tips:Tip[] }
const layout:[Area,string,string,string,string[]][]=[
 ['creative','거리·속력·시간','기본·단위','속도 시속 분속 초속 단위환산 km m',['speed-0','speed-15','speed-2']],
 ['creative','거리·속력·시간','만남·추월','마주보기 따라잡기 추격 만남 동시출발',['speed-4','speed-5','speed-6','speed-7','speed-3']],
 ['creative','거리·속력·시간','왕복·강물','배 강물 유속 상류 하류 왕복 평균속력',['speed-1','speed-13']],
 ['creative','거리·속력·시간','원형 트랙','트랙 운동장 호수 둘레 한바퀴',['speed-8','speed-9']],
 ['creative','거리·속력·시간','기차·통과','기차 열차 터널 다리 통과 길이',['speed-10','speed-11','speed-12','speed-14']],
 ['creative','농도·혼합','섞기','소금물 설탕물 용액 소금 농도 혼합',['mix-0','mix-1','mix-8','mix-2','mix-9']],
 ['creative','농도·혼합','물 추가·증발','소금물 물타기 증발 묽게 진하게',['mix-3','mix-4','mix-7']],
 ['creative','농도·혼합','덜어내고 채우기','소금물 퍼내기 덜어내기 보충',['mix-5','mix-6','mix-10']],
 ['creative','작업량·일률','공동 작업','일 함께 수도 호스 물통 일률',['work-0','work-1','work-2','work-3','work-4']],
 ['creative','작업량·일률','효율 변화','일 효율 능률 일률',['work-5','work-6','work-7','work-8']],
 ['creative','작업량·일률','남은 일·생산량','일 생산 기계 설비 남은일',['work-9','work-10']],
 ['creative','원가·정가·비용','원가·정가','장사 이익 마진 원가 정가 판매가',['cost-0','cost-1','cost-2','cost-3']],
 ['creative','원가·정가·비용','연속 할인·인상','할인 세일 인상 행사 수익률',['cost-6','cost-7','cost-8','cost-9']],
 ['creative','원가·정가·비용','이익·손익','이익 손해 손익분기 수수료 고정비',['cost-4','cost-5','cost-10','cost-11','cost-12','cost-14']],
 ['creative','원가·정가·비용','개수 역산','개수 몇개 총액 가격차',['cost-13']],
 ['creative','비율·평균·정수','비율','비 비율 남녀 증가 감소 퍼센트',['ratio-0','ratio-1','ratio-2']],
 ['creative','비율·평균·정수','평균','평균 점수 가중평균',['ratio-3','ratio-4','ratio-5','ratio-6']],
 ['creative','비율·평균·정수','개수 역산','동전 개수 남음 부족 몇개',['ratio-7','ratio-8','ratio-9']],
 ['creative','비율·평균·정수','정수 조건','나머지 배수 약수 최소공배수 홀수 짝수 나무심기 둘레',['ratio-10','ratio-11','ratio-12','ratio-13','ratio-14','ratio-15']],
 ['creative','경우의 수·확률','조합·순열','조합 순열 뽑기 경우의수',['count-0','count-1','count-2','count-3','count-7']],
 ['creative','경우의 수·확률','배열','줄세우기 이웃 원탁 배열',['count-4','count-5','count-6']],
 ['creative','경우의 수·확률','확률','확률 공 여사건 적어도',['count-8','count-9','count-10','count-11','count-12','count-13','count-14']],
 ['creative','경우의 수·확률','조건부 확률','조건부확률 베이즈 불량 양성',['bayes-0','bayes-1','bayes-2']],
 ['creative','경우의 수·확률','경로','최단경로 격자 길찾기',['count-15','count-16']],
 ['sequence','수열 규칙','등차·등비','규칙 패턴 등차 등비 공차 공비',['seq-0','seq-1','seq-2','refseq-0','refseq-1']],
 ['sequence','수열 규칙','계차·제곱','규칙 패턴 계차 제곱 세제곱 삼각수',['seq-3','seq-4','seq-11','seq-12','seq-13','refseq-2','refseq-3']],
 ['sequence','수열 규칙','이전 항으로 만드는 수열','규칙 패턴 피보나치 점화 앞항',['seq-5','seq-6','seq-9','seq-10','seq-22','seq-24','refseq-5','refseq-6','refseq-12']],
 ['sequence','수열 규칙','홀짝·교대','규칙 패턴 홀수항 짝수항 교대',['seq-7','seq-8','seq-23','refseq-7','refseq-13']],
 ['sequence','수열 규칙','분수·소수','규칙 패턴 분수 소수 분자 분모 역수 통분',['seq-15','seq-16','seq-17','seq-18','refseq-4']],
 ['sequence','수열 규칙','부호·군수열','규칙 패턴 부호 음수 군수열 묶음',['seq-19','seq-20','seq-21','refseq-8','refseq-9']],
 ['sequence','수열 규칙','소수 나열·표·도형','규칙 패턴 소수 표 도형 격자',['seq-14','refseq-10','refseq-11']],
];
export function tipGroups():TipGroup[]{
 return layout.map(([area,section,title,aliases,ids])=>({area,section,title,aliases,tips:ids.flatMap(id=>{
  const t=templates.find(t=>t.id===id),guide=tipGuidance[id];
  return t&&guide?[{id,name:t.name,area:t.area,category:t.category,difficulty:t.difficulty,inPool:practiceTemplates.some(p=>p.id===id),...guide}]:[];
 })}));
}
// 첫 시도 기록만 쓴다. 풀이를 보고 답한 문항과 재도전은 getStats가 이미 걸러낸다.
export interface WeakTip extends Tip { accuracy:number; total:number; seconds:number }
export function weakTips(attempts:Attempt[],limit=6):WeakTip[]{
 const all=new Map(tipGroups().flatMap(g=>g.tips).map(t=>[t.id,t]));
 return getStats(attempts).groups
  .filter(g=>g.total>=2&&g.accuracy<100&&all.has(g.subtype))
  .slice(0,limit)
  .map(g=>({...all.get(g.subtype)!,accuracy:g.accuracy,total:g.total,seconds:g.seconds}));
}
