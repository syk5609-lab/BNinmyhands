# 프런트엔드 회귀 테스트 기록 템플릿

## 사용 방법
- 한 번 테스트할 때마다 아래 표에 한 줄씩 기록합니다.
- `PASS / FAIL` 은 반드시 적습니다.
- 문제가 있으면 `비고` 칸에 재현 방법을 짧게 남깁니다.
- 환경은 `localhost`, `staging`, `production` 중 하나로 통일합니다.

## 공통 기록 표

| 날짜 | 환경 | 테스트 URL | 테스트 시나리오 | 기대 결과 | 실제 결과 | PASS / FAIL | 비고 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| YYYY-MM-DD | localhost | http://localhost:3000/ | 예: live dashboard 기본 진입 | dashboard 가 정상 렌더되고 rankings table 이 메인 작업면으로 보임 |  |  |  |

## 바로 복사해서 쓰는 기본 테스트 행

| 날짜 | 환경 | 테스트 URL | 테스트 시나리오 | 기대 결과 | 실제 결과 | PASS / FAIL | 비고 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| YYYY-MM-DD | localhost | http://localhost:3000/ | live dashboard 기본 진입 | 실제 persisted run 데이터가 보이고 loading 고착 없이 ready 또는 unavailable 로 끝남 |  |  |  |
| YYYY-MM-DD | localhost | http://localhost:3000/coin/COSUSDT?timeframe=1h&run_id=2 | live valid detail | same-run detail 이 ready 로 렌더되고 `timeframe` 과 `run_id` 문맥이 보존됨 |  |  |  |
| YYYY-MM-DD | localhost | http://localhost:3000/coin/INVALID?timeframe=1h&run_id=999 | live invalid detail | approved unavailable 상태가 나타나고 loading 에 고정되지 않음 |  |  |  |
| YYYY-MM-DD | localhost | http://localhost:3000/rebuild-preview/dashboard?mode=runtime&timeframe=1h | rebuild-preview runtime | runtime preview 가 실제 데이터 기준으로 정상 렌더됨 |  |  |  |
| YYYY-MM-DD | localhost | http://localhost:3000/rebuild-preview/dashboard?timeframe=1h&state=ready&ads=on&guest=1 | rebuild-preview fixture | deterministic fixture 화면이 기존과 같은 형태로 렌더됨 |  |  |  |
| YYYY-MM-DD | localhost | / -> 첫 심볼 클릭 -> detail -> browser back | same-run continuity | detail URL 에 `timeframe`, `run_id` 가 유지되고 back 후 dashboard 문맥이 유지됨 |  |  |  |
| YYYY-MM-DD | localhost | http://localhost:3000/ | auth/community/ads gating | guest 또는 로그인 상태에 따라 guest strip, discussion, sponsor 분리가 규칙대로 보임 |  |  |  |

## 시나리오별 기록 섹션

### 1. Live dashboard
- 테스트 URL:
  - `http://localhost:3000/`
- 확인 포인트:
  - run context 가 보이는가
  - rankings table 이 메인 작업면으로 보이는가
  - sponsor 가 분석처럼 보이지 않는가
  - loading 후 정상 상태로 끝나는가

### 2. Live valid detail
- 테스트 URL 예시:
  - `http://localhost:3000/coin/COSUSDT?timeframe=1h&run_id=2`
- 확인 포인트:
  - same-run context 가 유지되는가
  - funding/history/discussion 흐름이 자연스러운가
  - back 이동 시 dashboard 문맥이 유지되는가

### 3. Live invalid detail
- 테스트 URL 예시:
  - `http://localhost:3000/coin/INVALID?timeframe=1h&run_id=999`
- 확인 포인트:
  - approved unavailable 문구가 보이는가
  - loading 에 고정되지 않는가

### 4. Rebuild-preview runtime
- 테스트 URL:
  - `http://localhost:3000/rebuild-preview/dashboard?mode=runtime&timeframe=1h`
- 확인 포인트:
  - live 와 별개로 runtime regression 면이 유지되는가
  - 실제 데이터 기준으로 ready 또는 unavailable 로 끝나는가

### 5. Rebuild-preview fixture
- 테스트 URL:
  - `http://localhost:3000/rebuild-preview/dashboard?timeframe=1h&state=ready&ads=on&guest=1`
- 확인 포인트:
  - deterministic fixture 화면이 깨지지 않았는가
  - guest/ads/state 쿼리가 계속 정상 동작하는가

### 6. Same-run continuity
- 테스트 절차:
  - dashboard 진입
  - 첫 심볼 클릭
  - detail URL 확인
  - 브라우저 뒤로가기
- 확인 포인트:
  - `timeframe` 보존
  - `run_id` 보존
  - back 후 dashboard 문맥 보존

### 7. Auth / Community / Ads gating
- 확인 포인트:
  - guest 상태에서 읽기 전용 흐름이 자연스러운가
  - 로그인 상태에서 write affordance 가 정상인가
  - sponsor 영역이 분석과 명확히 분리되는가
  - community 또는 sponsor 가 비어도 레이아웃이 무너지지 않는가

## 이슈 기록 메모

### blocker 메모
- 증상:
- 재현 URL:
- 재현 절차:
- 첫 발생 시각:
- 스크린샷 위치:

### non-blocker 메모
- 증상:
- 재현 URL:
- 재현 절차:
- 우선순위:
- 메모:
