import { calculate, close, format } from './math';
import type { Question } from './types';
// Per-template solution metadata. Version 1.2.0 assigned 핵심 공식·인식 신호·최단풀이 per family,
// so all 16 'ratio' topics shared one average/unit-price explanation. Keying every template
// explicitly — and letting verify.ts compare against this same table — makes that impossible.
// No generator imports here: verify.ts must stay independent of how a question is constructed.
export interface Guidance { formula:string; signal:string; method:string }
export const creativeGuidance:Record<string,Guidance>={
 // speed
 'speed-0':{formula:'거리 = 속력 × 시간',signal:'한 가지 속력으로 일정하게 이동한 거리·시간·속력 중 하나만 비어 있는 표현',method:'분을 시간으로 바꾼 뒤 속력에 한 번만 곱합니다.'},
 'speed-1':{formula:'왕복 시간 = 편도거리 ÷ 갈 때 속력 + 편도거리 ÷ 올 때 속력',signal:'같은 거리를 서로 다른 속력으로 오간다는 표현',method:'구간마다 시간을 따로 구해 더합니다. 두 속력의 산술평균을 쓰지 않습니다.'},
 'speed-2':{formula:'같은 거리에서 시간의 비 = 속력의 비의 역비',signal:'거리가 같고 속력의 비만 주어진 표현',method:'속력의 비를 뒤집어 시간의 비로 쓰고 알려진 시간에 곱합니다.'},
 'speed-3':{formula:'거리 = 시간차 ÷ (1 ÷ 느린 속력 − 1 ÷ 빠른 속력)',signal:'같은 구간을 두 속력으로 갈 때 도착 시각이 벌어진다는 표현',method:'시간차를 시간 단위로 바꾸고 두 소요시간의 차로 나눕니다.'},
 'speed-4':{formula:'만나는 시간 = 두 지점 사이 거리 ÷ 속력의 합',signal:'서로를 향해 동시에 출발해 만난다는 표현',method:'속력을 더해 한 덩어리로 보고 거리를 나눕니다.'},
 'speed-5':{formula:'따라잡는 시간 = 앞선 거리 ÷ 속력의 차',signal:'같은 방향으로 가며 뒤차가 앞차를 따라잡는다는 표현',method:'속력의 차로 벌어진 거리를 나눕니다.'},
 'speed-6':{formula:'따라잡는 시간 = 선출발로 벌어진 거리 ÷ 속력의 차',signal:'한쪽이 먼저 출발한 뒤 나중 출발자가 따라붙는다는 표현',method:'선출발 시간을 분으로 유지하면 60 변환이 약분됩니다. 선두 속력 × 선출발 시간 ÷ 속력의 차를 입력합니다.'},
 'speed-7':{formula:'총 시간 = 2 × (선출발로 벌어진 거리 ÷ 속력의 차)',signal:'따라잡은 즉시 같은 속력으로 출발점까지 되돌아온다는 표현',method:'따라잡는 시간을 구한 뒤 2배 합니다. 돌아오는 거리와 속력이 같기 때문입니다.'},
 'speed-8':{formula:'처음 만나는 시간 = 트랙 둘레 ÷ 속력의 합',signal:'원형 트랙에서 반대 방향으로 돌다 다시 만난다는 표현',method:'트랙 한 바퀴를 거리로 보고 속력의 합으로 나눕니다.'},
 'speed-9':{formula:'한 바퀴 앞서는 시간 = 트랙 둘레 ÷ 속력의 차',signal:'원형 트랙에서 같은 방향으로 돌다 한 바퀴 차이가 난다는 표현',method:'한 바퀴만큼 앞서야 하므로 둘레를 속력의 차로 나눕니다.'},
 'speed-10':{formula:'완전히 지나는 거리 = 두 기차의 길이 합',signal:'앞부분이 만난 순간부터 완전히 지나칠 때까지라는 표현',method:'두 길이를 더해 거리로 쓰고 마주 달리므로 속력을 더해 나눕니다.'},
 'speed-11':{formula:'통과 거리 = 기차 길이 + 터널 길이',signal:'앞부분 진입부터 뒷부분 이탈까지라는 표현',method:'기차 길이를 반드시 더하고 시속을 3.6으로 나눠 초속으로 맞춥니다.'},
 'speed-12':{formula:'통과 거리 = 기차 길이 + 다리 길이',signal:'앞부분 진입부터 뒷부분 이탈까지라는 표현',method:'다리 길이에 기차 길이를 반드시 더하고 시속을 3.6으로 나눠 초속으로 맞춥니다.'},
 'speed-13':{formula:'거슬러 갈 때 = 배의 속력 − 유속, 따라 갈 때 = 배의 속력 + 유속',signal:'강을 거슬러 올라갔다 내려오는 왕복 표현',method:'올라갈 때와 내려올 때 시간을 따로 구해 더합니다. 유속은 더하고 빼기만 합니다.'},
 'speed-14':{formula:'통과 거리 = 지나가는 영역의 길이 + 구간의 폭',signal:'맨 앞 진입부터 맨 뒤 이탈까지라는 표현',method:'두 길이를 더해 거리로 쓰고 속력으로 나눕니다.'},
 'speed-15':{formula:'거리 = 속력 × 시간, 단위 변환은 마지막에',signal:'시속과 초, km와 m처럼 단위가 섞여 있는 표현',method:'먼저 같은 단위로 맞춘 뒤 한 번만 곱합니다.'},
 // mix
 'mix-0':{formula:'혼합 농도 = 용질량의 합 ÷ 용액량의 합 × 100',signal:'서로 다른 농도의 두 용액을 섞는다는 표현',method:'각 용액의 용질량을 먼저 구해 더하고 질량의 합으로 나눕니다.'},
 'mix-1':{formula:'혼합 농도 = 용질량의 합 ÷ 용액량의 합 × 100',signal:'섞은 뒤의 최종 농도를 묻는 표현',method:'각 용액의 용질량을 먼저 구해 더하고 질량의 합으로 나눕니다.'},
 'mix-2':{formula:'(목표 − 낮은 농도) × 기준 질량 = (높은 농도 − 목표) × 더할 질량',signal:'정해진 농도로 맞추려면 얼마를 더해야 하는지 묻는 표현',method:'목표 농도와의 차이를 양쪽에 두고 역비로 계산합니다.'},
 'mix-3':{formula:'용질량 보존: 처음 농도 × 처음 질량 = 나중 농도 × 나중 질량',signal:'순수한 물만 넣어 묽게 만든다는 표현',method:'용질량은 그대로입니다. 필요한 전체 질량을 구한 뒤 처음 질량을 뺍니다.'},
 'mix-4':{formula:'용질량 보존: 처음 농도 × 처음 질량 = 나중 농도 × 나중 질량',signal:'물만 증발시켜 진하게 만든다는 표현',method:'용질량은 그대로입니다. 필요한 전체 질량을 구한 뒤 처음 질량에서 뺍니다.'},
 'mix-5':{formula:'남은 용질량 = 처음 용질량 × (1 − 덜어낸 비율)',signal:'균일한 용액의 일부를 덜어낸다는 표현',method:'농도는 그대로이고 용질량만 남은 비율만큼 줄어듭니다.'},
 'mix-6':{formula:'최종 농도 = 처음 농도 × (1 − 덜어낸 비율)',signal:'덜어낸 만큼 물로 채워 전체 질량이 그대로라는 표현',method:'전체 질량이 같으므로 농도에 남은 비율만 한 번 곱합니다.'},
 'mix-7':{formula:'최종 농도 = 용질량의 합 ÷ (질량의 합 − 증발량) × 100',signal:'섞은 뒤 물만 증발시킨다는 표현',method:'용질량의 합은 그대로 두고 분모에서만 증발량을 뺍니다.'},
 'mix-8':{formula:'혼합 농도 = 질량으로 가중한 농도의 평균',signal:'두 용액의 질량이 서로 달라 단순 평균을 쓸 수 없는 표현',method:'질량을 가중치로 농도를 더한 뒤 질량의 합으로 나눕니다. 두 농도의 산술평균이 아닙니다.'},
 'mix-9':{formula:'(목표 − 낮은 농도) : (높은 농도 − 목표) = 높은 농도 쪽 질량 : 낮은 농도 쪽 질량',signal:'목표 농도가 두 농도 사이에 놓인다는 표현',method:'두 농도와 목표의 차를 구해 역비로 질량을 배분합니다.'},
 'mix-10':{formula:'최종 농도 = 처음 농도 × (1 − 덜어낸 비율)의 반복 횟수 제곱',signal:'덜어내고 물을 채우는 작업을 여러 번 반복한다는 표현',method:'반복 횟수만큼 남은 비율을 거듭 곱합니다.'},
 // work
 'work-0':{formula:'공동 완료 시간 = 1 ÷ (1÷A + 1÷B)',signal:'각자 혼자 하면 걸리는 시간을 주고 함께 할 때를 묻는 표현',method:'전체를 1로 놓고 시간당 비율을 더한 뒤 1을 나눕니다.'},
 'work-1':{formula:'공동 완료 시간 = 1 ÷ (1÷A + 1÷B + 1÷C)',signal:'세 사람의 단독 완료 시간을 모두 주는 표현',method:'전체를 1로 놓고 세 사람의 시간당 비율을 더한 뒤 1을 나눕니다.'},
 'work-2':{formula:'남은 시간 = (1 − 먼저 한 비율) ÷ 합류 후 비율의 합',signal:'한 사람이 먼저 일하다 나중에 합류한다는 표현',method:'먼저 끝낸 비율을 1에서 빼고 합류 후 비율의 합으로 나눕니다.'},
 'work-3':{formula:'남은 시간 = (1 − 함께 한 비율) ÷ 남은 사람의 시간당 비율',signal:'함께 하다 한 사람이 도중에 빠진다는 표현',method:'함께 한 비율을 먼저 빼고 남은 사람 혼자의 시간당 비율로 나눕니다.'},
 'work-4':{formula:'남은 시간 = (1 − 기존 인원이 한 비율) ÷ 늘어난 비율의 합',signal:'작업 도중 인원이 늘어난다는 표현',method:'합류 전까지의 비율을 빼고 합류 후 비율의 합으로 나눕니다.'},
 'work-5':{formula:'완료 시간 = 평소 시간 ÷ 일하는 비율',signal:'평소보다 빠른 일률로 작업한다는 표현',method:'시간당 비율이 k배면 시간은 1÷k배입니다. 평소 시간을 비율로 나눕니다.'},
 'work-6':{formula:'완료 시간 = 평소 시간 ÷ 일하는 비율',signal:'평소보다 느린 일률로 작업한다는 표현',method:'시간당 비율이 k배면 시간은 1÷k배입니다. 평소 시간을 비율로 나눕니다.'},
 'work-7':{formula:'실제 시간당 비율 = (1÷A + 1÷B) × 효율',signal:'함께 하면 각자 비율의 합보다 떨어진다는 표현',method:'남은 비율을 구한 뒤 비율의 합에 효율을 곱한 값으로 나눕니다.'},
 'work-8':{formula:'실제 시간당 비율 = (1÷A + 1÷B) × 효율',signal:'함께 하면 각자 비율의 합보다 높아진다는 표현',method:'남은 비율을 구한 뒤 비율의 합에 효율을 곱한 값으로 나눕니다.'},
 'work-9':{formula:'전체 생산량 = 대당 시간당 생산량 × 대수 × 가동 시간',signal:'설비 수와 가동 시간을 주고 총 생산량을 묻는 표현',method:'세 수를 그대로 곱합니다. 단위가 이미 맞으면 변환하지 않습니다.'},
 'work-10':{formula:'남은 시간 = 단독 완료 시간 × (1 − 끝낸 비율)',signal:'이미 몇 %가 끝났다고 알려주는 표현',method:'끝낸 비율을 1에서 빼고 단독 완료 시간에 곱합니다.'},
 // cost
 'cost-0':{formula:'판매가 = 원가 × (1 + 이익률)',signal:'원가에 몇 %를 붙여 판다는 표현',method:'원가에 (1 + 비율)을 한 번만 곱합니다.'},
 'cost-1':{formula:'판매가 = 정가 × (1 − 할인율)',signal:'정가에서 몇 %를 깎는다는 표현',method:'정가에 (1 − 비율)을 한 번만 곱합니다.'},
 'cost-2':{formula:'개당 이익 = 원가 × (1 + 이익률) × (1 − 할인율) − 원가',signal:'정가를 붙인 뒤 다시 할인해 판다는 표현',method:'두 비율을 차례로 곱한 뒤 마지막에 원가를 한 번만 뺍니다.'},
 'cost-3':{formula:'정가 = 판매가 ÷ (1 − 할인율)',signal:'할인된 가격을 주고 할인 전 가격을 묻는 표현',method:'곱했던 비율로 되나눕니다.'},
 'cost-4':{formula:'총이익 = 원가 × (이익률 − 손실률)',signal:'한쪽은 이익, 다른 쪽은 손실로 팔았다는 표현',method:'원가가 같으면 두 비율의 차만 곱하면 됩니다.'},
 'cost-5':{formula:'가격 차 = A 정가 × (1 − A 할인율) − B 정가 × (1 − B 할인율)',signal:'서로 다른 할인율을 적용한 두 상품의 가격을 비교하는 표현',method:'각각의 판매가를 구해 한 번만 뺍니다.'},
 'cost-6':{formula:'최종가 = 정가 × (1 − 첫 할인율) × (1 − 둘째 할인율)',signal:'할인된 가격에서 다시 할인한다는 표현',method:'할인율을 더하지 말고 (1 − 비율)끼리 곱합니다.'},
 'cost-7':{formula:'최종가 = 처음 가격 × (1 + 첫 인상률) × (1 + 둘째 인상률)',signal:'오른 가격에서 다시 올린다는 표현',method:'인상률을 더하지 말고 (1 + 비율)끼리 곱합니다.'},
 'cost-8':{formula:'지불액 = 묶음 수 × 묶음당 실제로 내는 개수 × 개당 가격',signal:'몇 개 값으로 몇 개를 준다는 행사 표현',method:'전체를 묶음으로 나누고 묶음마다 실제 내는 개수만 셉니다.'},
 'cost-9':{formula:'회수액 = 원금 × (1 + 수익률)',signal:'원금과 수익률을 주고 회수 금액을 묻는 표현',method:'원금에 (1 + 비율)을 곱합니다. 원금을 다시 더하지 않습니다.'},
 'cost-10':{formula:'순이익 = 판매가 × (1 − 수수료율) − 원가',signal:'판매가에서 수수료를 떼고 남는 금액을 묻는 표현',method:'수수료를 먼저 떼고 원가를 한 번만 뺍니다.'},
 'cost-11':{formula:'총비용 = 고정비 + 개당 변동비 × 수량',signal:'고정비와 개당 변동비를 따로 주는 표현',method:'고정비는 한 번, 변동비는 수량만큼 더합니다.'},
 'cost-12':{formula:'손익분기 수량 = 고정비 ÷ (판매가 − 개당 변동비)',signal:'손실이 나지 않는 최소 수량을 묻는 표현',method:'개당 공헌이익으로 고정비를 나눈 뒤 마지막 값만 올림합니다.'},
 'cost-13':{formula:'비싼 쪽 개수 = (총액 − 전부 싼 가격으로 산 금액) ÷ 가격 차',signal:'두 가격의 제품을 합해 몇 개 샀고 총액이 얼마라는 표현',method:'전부 싼 제품이라고 놓고 총액 차이를 가격 차로 나눕니다.'},
 'cost-14':{formula:'개당 최소 판매가 = 전체 원가 ÷ 정상 제품 수',signal:'일부가 폐기되고 남은 것만 팔아 원가를 회수한다는 표현',method:'원가 총액을 정상 제품 수로 나눈 뒤 마지막 값만 올림합니다.'},
 // ratio
 'ratio-0':{formula:'부분 = 전체 × (부분의 비 ÷ 비의 합)',signal:'전체 인원과 두 집단의 비만 주는 표현',method:'비의 합으로 전체를 나눈 뒤 해당하는 비를 곱합니다.'},
 'ratio-1':{formula:'변화 후 인원 = 변화 전 인원 × (1 + 증감률)',signal:'집단마다 다른 비율로 늘거나 줄었다는 표현',method:'집단별로 따로 증감을 적용한 뒤 마지막에 나눕니다.'},
 'ratio-2':{formula:'전체 증가 수 = 한 집단 × 증가율 + 나머지 집단 × 증가율',signal:'전체 증가 인원만 주고 변화 전 인원을 묻는 표현',method:'한 집단을 x로 놓고 나머지를 전체 − x로 씁니다. 증가 수 식에서 x를 한 번에 풉니다.'},
 'ratio-3':{formula:'전체 평균 = (각 집단 인원 × 평균의 합) ÷ 전체 인원',signal:'인원이 서로 다른 두 집단의 평균을 주고 전체 평균을 묻는 표현',method:'인원으로 가중해 더한 뒤 전체 인원으로 나눕니다. 두 평균의 산술평균이 아닙니다.'},
 'ratio-4':{formula:'전체 평균 = (각 집단 점수의 합) ÷ 전체 인원',signal:'두 집단의 인원과 평균을 주고 전체 평균을 묻는 표현',method:'집단마다 점수의 합을 구해 더하고 전체 인원으로 나눕니다.'},
 'ratio-5':{formula:'나머지 평균 = (전체 합 − 알려진 집단의 합) ÷ 나머지 인원',signal:'전체 평균과 일부 집단의 평균을 주고 나머지를 묻는 표현',method:'총합에서 알려진 몫을 먼저 빼고 남은 인원으로 나눕니다.'},
 'ratio-6':{formula:'빠진 값 = 전체 합 − 나머지 인원 × 나머지 평균',signal:'전체 합계를 주고 한 명을 제외한 평균을 알려주는 표현',method:'합계에서 알려진 몫을 한 번만 뺍니다.'},
 'ratio-7':{formula:'사람 수 = (남는 수 + 부족한 수) ÷ 1인당 개수 차',signal:'몇 개씩 주면 남고 하나 더 주면 부족하다는 표현',method:'남는 양과 부족한 양을 더해 1인당 개수 차로 나눕니다.'},
 'ratio-8':{formula:'비싼 쪽 개수 = (총액 − 전부 싼 단가로 산 금액) ÷ 단가 차',signal:'두 종류를 합해 몇 개이고 총액이 얼마라는 표현',method:'전부 싼 종류라고 놓고 총액 차이를 단가 차이로 나눕니다.'},
 'ratio-9':{formula:'비싼 쪽 개수 = (총액 − 전부 싼 단가로 산 금액) ÷ 단가 차',signal:'두 가격의 상품을 합해 몇 개이고 총액이 얼마라는 표현',method:'전부 싼 종류라고 놓고 총액 차이를 단가 차이로 나눕니다.'},
 'ratio-10':{formula:'1부터 N까지 k의 배수 개수 = N ÷ k의 몫',signal:'어떤 범위 안에서 특정 수의 배수가 몇 개인지 묻는 표현',method:'범위를 그 수로 나눈 몫만 취합니다. 나머지는 버립니다.'},
 'ratio-11':{formula:'1부터 N까지 홀수 개수 = N ÷ 2의 몫에 N이 홀수면 1을 더함',signal:'연속된 자연수 범위에서 홀수나 짝수가 몇 개인지 묻는 표현',method:'범위를 2로 나누고 홀수는 올림, 짝수는 버림합니다.'},
 'ratio-12':{formula:'x ≡ r₁ (mod m₁), x ≡ r₂ (mod m₂)',signal:'두 수로 나눈 나머지를 동시에 주고 그 조건을 만족하는 가장 작은 수를 묻는 표현',method:'큰 수로 나눈 나머지에서 출발해 그 수만큼 더해 가며 작은 수의 나머지 조건을 만족하는 첫 값을 찾습니다.'},
 'ratio-13':{formula:'최소공배수 = 두 수의 곱 ÷ 최대공약수',signal:'두 수의 공통 배수 중 가장 작은 수를 묻는 표현',method:'큰 수의 배수를 차례로 적으며 작은 수로 나누어떨어지는 첫 값을 찾습니다.'},
 'ratio-14':{formula:'양 끝을 포함한 나무 수 = 전체 길이 ÷ 간격 + 1',signal:'일정한 간격으로 양 끝을 포함해 심거나 세운다는 표현',method:'구간 수를 먼저 구하고 양 끝 때문에 1을 더합니다.'},
 'ratio-15':{formula:'둘레 = 2 × (가로 + 세로)',signal:'두 변의 차와 둘레를 주고 한 변의 길이를 묻는 표현',method:'둘레를 2로 나눠 가로와 세로의 합을 만들고 차를 뺀 뒤 2로 나눕니다.'},
 // count
 'count-0':{formula:'C(n, r) = n! ÷ (r! × (n − r)!)',signal:'순서를 따지지 않고 뽑는다는 표현',method:'분자에 큰 수부터 r개, 분모에 1부터 r개를 적고 약분합니다.'},
 'count-1':{formula:'P(n, r) = n × (n − 1) × … 를 r개',signal:'서로 다른 역할이나 자리를 하나씩 맡긴다는 표현',method:'큰 수부터 r개를 그대로 곱합니다.'},
 'count-2':{formula:'지정한 1명 포함 = C(n − 1, r − 1)',signal:'특정 인물을 반드시 포함한다는 표현',method:'그 사람을 먼저 고정하고 남은 자리만 셉니다.'},
 'count-3':{formula:'지정한 1명 제외 = C(n − 1, r)',signal:'특정 인물을 제외한다는 표현',method:'그 사람을 빼고 남은 사람 중에서 셉니다.'},
 'count-4':{formula:'이웃하는 배열 = 뽑는 경우 × 묶음을 포함한 배열 × 2',signal:'A와 B가 반드시 이웃한다는 표현',method:'A·B를 한 묶음으로 보세요. 나머지 사람을 고르는 수 × 묶음 배열 × A·B 내부 순서 2만 계산합니다.'},
 'count-5':{formula:'이웃하지 않는 배열 = 전체 배열 − 이웃하는 배열',signal:'A와 B가 이웃하지 않는다는 표현',method:'전체 배열에서 A·B가 붙어 있는 배열을 한 번 빼세요. 나머지 인원 선택 수를 마지막에 곱합니다.'},
 'count-6':{formula:'원형 배열 = 뽑는 경우 × (n − 1)!',signal:'원탁에 앉히고 회전한 배치는 같다고 보는 표현',method:'회전 중복을 없애려고 한 사람의 자리만 고정하세요. 인원 선택 수 × 남은 자리 배열로 계산합니다.'},
 'count-7':{formula:'이름이 구분되는 두 팀으로 나누기 = C(n, k)',signal:'이름이 서로 다른 팀으로 나눈다는 표현',method:'한 팀의 인원만 고르면 나머지는 자동으로 정해집니다.'},
 'count-8':{formula:'확률 = 같은 팀에 남은 자리 ÷ 한 명을 뺀 전체 자리',signal:'무작위 배정에서 두 사람이 같은 팀일 확률을 묻는 표현',method:'A의 자리를 고정하고 B가 들어갈 자리만 셉니다.'},
 'count-9':{formula:'확률 = 다른 팀의 자리 수 ÷ 한 명을 뺀 전체 자리',signal:'무작위 배정에서 두 사람이 서로 다른 팀일 확률을 묻는 표현',method:'A의 자리를 고정하고 다른 팀에 남은 자리만 셉니다.'},
 'count-10':{formula:'P(적어도 하나) = 1 − P(하나도 없음)',signal:'적어도 하나는 포함된다는 표현',method:'여사건으로 바꿉니다. 해당 색을 모두 피해 뽑는 경우를 전체 경우로 나눠 1에서 뺍니다.'},
 'count-11':{formula:'확률 = 해당하는 1개 선택 × 나머지에서 r − 1개 선택 ÷ 전체 경우',signal:'정확히 하나만 해당한다는 표현',method:'해당 공 1개를 고르는 수와 나머지에서 고르는 수를 곱해 전체 경우로 나눕니다.'},
 'count-12':{formula:'비복원 연속 사건 = 첫 번째 확률 × 하나 줄어든 두 번째 확률',signal:'돌려놓지 않고 연달아 뽑는다는 표현',method:'두 번째 확률의 분자와 분모를 각각 1씩 줄여 곱합니다.'},
 'count-13':{formula:'독립 사건 = 각 확률의 곱',signal:'서로 영향을 주지 않는 두 시행이라는 표현',method:'두 확률을 그대로 곱합니다.'},
 'count-14':{formula:'P(적어도 한 번 성공) = 1 − (1 − p)의 시행 횟수 제곱',signal:'여러 번 시행해 적어도 한 번 성공한다는 표현',method:'모두 실패할 확률을 시행 횟수만큼 곱해 1에서 뺍니다.'},
 'count-15':{formula:'최단경로 수 = C(가로 칸 + 세로 칸, 가로 칸)',signal:'오른쪽과 위로만 한 칸씩 이동한다는 표현',method:'전체 이동 횟수에서 한쪽 방향 횟수를 고르는 조합으로 셉니다.'},
 'count-16':{formula:'경유 경로 수 = (출발 → 경유) × (경유 → 도착)',signal:'반드시 특정 지점을 지난다는 표현',method:'경유점에서 끊어 두 구간의 최단경로 수를 각각 구해 곱합니다.'},
};
// Vocabulary that belongs to another topic. A wrong entry in the table above is caught a second
// time here, which is what the 1.2.0 leak looked like: 평균·단가·총액 prose on a modular-arithmetic item.
const foreign:[RegExp,string[]][]=[
 [/^speed-/,['농도','용질','일률','할인','원가','단가','여사건']],
 [/^mix-/,['속력','일률','할인','원가','단가','여사건']],
 [/^work-/,['농도','용질','속력','할인','원가','여사건']],
 [/^cost-/,['농도','용질','속력','일률','여사건']],
 [/^ratio-(1[0-5])$/,['평균','단가','총액','농도','용질','속력','일률','할인','여사건']],
 [/^ratio-[0-9]$/,['농도','용질','속력','일률','여사건']],
 [/^count-/,['농도','용질','속력','일률','할인','원가','단가']],
 [/^bayes-/,['농도','용질','속력','일률','할인','원가','단가']],
];
export function foreignTerms(subtype:string):string[]{return foreign.find(([p])=>p.test(subtype))?.[1]??[];}
// Questions saved before 1.3.0 carry the family-wide explanation in their snapshot, so an answer
// already in the 오답노트 still shows another topic's 공식·신호·최단풀이. Refill only those three
// fields from the table; the question, options, answer, steps, seed and grading record stay as they
// were. Idempotent, so a 1.3.0 question passes through unchanged.
export function applyGuidance<T extends {subtype?:string;memo?:string;keyFormula?:string;signal?:string;shortcut?:string}>(q:T):T{
 const guide=q&&typeof q==='object'?creativeGuidance[String(q.subtype)]:undefined;
 if(!guide||typeof q.memo!=='string')return q;
 q.keyFormula=guide.formula;q.signal=guide.signal;q.shortcut=`${guide.method} 메모장 계산식: ${q.memo}`;
 return q;
}
// 유형 = 핵심 공식 = 인식 신호 = 최단풀이 네 가지가 같은 유형을 가리키는지 확인한다.
export function guidanceErrors(q:Question):string[]{
 if(!['1.3.0','1.4.0','1.5.0','1.6.0','1.7.0'].includes(q.generatorVersion))return [];
 const errors:string[]=[];
 const fields:[string,string][]=[['핵심 공식',q.keyFormula],['인식 신호',q.signal],['최단풀이',q.shortcut],['메모장 식',q.memo]];
 for(const [label,value] of fields)if(typeof value!=='string'||!value.trim())errors.push(`${label} 누락`);
 if(errors.length)return errors;
 const guide=creativeGuidance[q.subtype];
 if(guide){
  if(q.keyFormula!==guide.formula)errors.push('유형과 핵심 공식 불일치');
  if(q.signal!==guide.signal)errors.push('유형과 인식 신호 불일치');
  if(!q.shortcut.startsWith(guide.method))errors.push('유형과 최단풀이 불일치');
 } else if(q.type==='creative'&&!q.subtype.startsWith('bayes-'))errors.push('등록되지 않은 창의수리 유형');
 const prose=`${q.keyFormula} ${q.signal} ${q.shortcut}`;
 for(const term of foreignTerms(q.subtype))if(prose.includes(term))errors.push(`다른 유형의 해설 어휘: ${term}`);
 try{calculate(q.memo);}catch{errors.push('메모장 식 계산 불가');}
 // A bare number restates the answer instead of showing how to reach it. Sequence items legitimately
 // quote a term value, so only creative questions are held to this.
 if(q.type==='creative'&&/^-?[0-9]+(\.[0-9]+)?$/.test(q.memo.trim())&&close(Number(q.memo),q.answer))errors.push('메모장 식이 정답 숫자 그 자체');
 if(q.type==='creative'&&q.memo.trim()===format(q.answer))errors.push('메모장 식이 정답 숫자 그 자체');
 return [...new Set(errors)];
}
