# 프런트엔드 안정화 체크리스트

## 목적
이 문서는 live rebuild 전환 이후 3~7일 동안 안정적으로 운영되는지 확인하기 위한 점검표입니다.
개발자가 아니어도 따라갈 수 있도록, 매일 확인할 항목과 반복 테스트 URL을 한 문서에 모았습니다.

## 기본 원칙
- 기준 환경은 먼저 `localhost` 입니다.
- live 경로는 `/` 와 `/coin/[symbol]` 입니다.
- `rebuild-preview` 는 회귀 테스트용으로 계속 유지합니다.
- 문제가 없더라도 frozen/reference 트리는 바로 지우지 않습니다.

## Day 0 체크리스트
- [ ] `npm run lint` 가 통과하는지 확인
- [ ] `npm run build` 가 통과하는지 확인
- [ ] live dashboard `/` 가 열리는지 확인
- [ ] live valid detail 이 열리는지 확인
- [ ] live invalid detail 이 unavailable 상태로 내려가는지 확인
- [ ] rebuild-preview runtime 이 열리는지 확인
- [ ] rebuild-preview fixture 가 열리는지 확인
- [ ] 첫 화면 스크린샷 4장 정도를 남겨 기준 화면으로 보관

## Day 1 체크리스트
- [ ] `/` 에서 첫 심볼 클릭 후 detail 로 이동
- [ ] detail URL 에 `timeframe` 과 `run_id` 가 유지되는지 확인
- [ ] 브라우저 뒤로가기로 dashboard 문맥이 유지되는지 확인
- [ ] `1h`, `4h`, `24h` 각각 한 번씩 확인

## Day 2 체크리스트
- [ ] guest 상태에서 dashboard 가 자연스럽게 보이는지 확인
- [ ] guest 상태에서 detail discussion 이 읽기 전용으로 보이는지 확인
- [ ] 로그인 상태에서 write affordance 가 과장되지 않고 정상적으로 보이는지 확인
- [ ] sponsor 가 분석 콘텐츠처럼 보이지 않는지 확인

## Day 3 체크리스트
- [ ] invalid `run_id` 로 접근 시 approved unavailable 상태가 나오는지 확인
- [ ] invalid `symbol` 로 접근 시 approved unavailable 상태가 나오는지 확인
- [ ] timeframe mismatch 조합에서 unavailable 상태가 나오는지 확인
- [ ] loading 상태가 무한정 지속되지 않는지 확인

## Day 4 체크리스트
- [ ] 자주 보는 실제 심볼 3~5개로 live detail 반복 확인
- [ ] funding/history/discussion 흐름이 같은 톤으로 유지되는지 확인
- [ ] ads on 상황에서 top/mid/bottom sponsor 구분이 분명한지 확인

## Day 5 체크리스트
- [ ] community unavailable 또는 빈 상태에서도 메인 분석 레이아웃이 무너지지 않는지 확인
- [ ] sponsor slot 이 비어 있어도 레이아웃이 어색하게 붕 뜨지 않는지 확인
- [ ] rebuild-preview fixture 화면이 여전히 deterministic 하게 유지되는지 확인

## Day 6 체크리스트
- [ ] Day 1~5 중 문제 있었던 시나리오를 다시 확인
- [ ] 새로 생긴 build/lint/runtime 이슈가 없는지 확인
- [ ] 스크린샷 기준 화면과 비교해 큰 차이가 없는지 확인

## Day 7 체크리스트
- [ ] 지난 1주간 release blocker 가 없었는지 정리
- [ ] rollback 필요성이 사실상 사라졌는지 판단
- [ ] cleanup/archive 를 시작해도 되는지 보수적으로 검토

## 수동 회귀 테스트 매트릭스

| 영역 | 시나리오 | 확인 방법 | 기대 결과 |
| --- | --- | --- | --- |
| Live dashboard | 기본 진입 | `/` 접속 | 실제 persisted run 데이터가 보이고, rankings table 이 메인 작업면으로 보여야 함 |
| Live dashboard | timeframe 변경 | `1h`, `4h`, `24h` 로 각각 확인 | 각 timeframe 에 맞는 run context 가 보이고, 화면이 멈추지 않아야 함 |
| Live detail | valid same-run detail | valid symbol + `timeframe` + `run_id` 로 접근 | ready 상태로 렌더되고 same-run context 가 보여야 함 |
| Invalid detail | invalid symbol 또는 invalid run | invalid URL 로 접근 | loading 에 고정되지 않고 approved unavailable 상태로 가야 함 |
| Rebuild-preview fixture | deterministic preview | fixture URL 접속 | 고정된 fixture 화면이 항상 같은 형태로 나와야 함 |
| Rebuild-preview runtime | runtime preview | runtime preview URL 접속 | live 와 비슷한 실제 데이터 흐름을 보여야 함 |
| Auth gating | guest 상태 | 로그인 안 된 상태에서 dashboard/detail 확인 | guest strip, read-only discussion, 과하지 않은 로그인 유도가 보여야 함 |
| Community gating | discussion 상태 | community enabled/disabled 또는 빈 상태 확인 | 메인 분석은 유지되고 discussion 만 soft-fail 또는 read-only 처리되어야 함 |
| Ads gating | sponsor on/off | sponsor 노출 여부 확인 | sponsor 는 분석과 분리되어 보여야 하고, off 여도 레이아웃이 깨지지 않아야 함 |
| Same-run continuity | dashboard -> detail -> back | 첫 심볼 클릭 후 뒤로가기 | `timeframe` 과 `run_id` 가 보존되고 dashboard 문맥이 유지되어야 함 |

## 반복 확인용 북마크 URL

### Live 경로
- `http://localhost:3000/`
- `http://localhost:3000/coin/COSUSDT?timeframe=1h&run_id=2`
- `http://localhost:3000/coin/INVALID?timeframe=1h&run_id=999`

### Rebuild-preview 경로
- `http://localhost:3000/rebuild-preview/dashboard?mode=runtime&timeframe=1h`
- `http://localhost:3000/rebuild-preview/dashboard?timeframe=1h&state=ready&ads=on&guest=1`
- `http://localhost:3000/rebuild-preview/dashboard?timeframe=24h&state=unavailable&ads=off&guest=1`
- `http://localhost:3000/rebuild-preview/coin/BTCUSDT?timeframe=1h&run_id=101&state=ready&ads=on&guest=1`

## 무엇이 release blocker 인가

### blocker
- live `/` 또는 live detail 이 열리지 않음
- dashboard -> detail -> back 에서 `run_id` 또는 `timeframe` continuity 가 깨짐
- invalid detail 이 unavailable 대신 loading 에 고정됨
- auth/community/ads gating 이 비즈니스 규칙을 깨뜨림
- `npm run lint` 또는 `npm run build` 가 깨짐
- rebuild-preview runtime 또는 fixture 가 망가져 회귀 테스트 기준면을 잃음

### non-blocker
- sponsor 문구 길이 차이
- discussion 이 비어 있을 때 약간 휑한 느낌
- 모바일에서 일부 구간이 다소 촘촘한 느낌
- preview 화면의 가벼운 시각 차이

## 안정화 이후 archive/cleanup 정책

### 계속 유지할 것
- live active rebuild 경로
- `rebuild-preview` 전체
- `components/rebuild/**`, `lib/rebuild/**`
- auth/community/ads/runtime 관련 현재 동작 경로

### 나중에 archive 할 수 있는 것
- 오래된 preview 산출물
- 과거 실험용 스크린샷
- frozen/reference tree 중 장기 보관이 필요한 것들

### 안정성이 확인된 뒤에만 삭제 검토할 것
- 비어 있는 `frontend-runtime/components/dashboard` 디렉터리
- 더 이상 안 쓰는 stray backup 파일이 추가로 발견될 경우 그 파일들
- frozen/reference tree 전체

## 최종 판단 기준
- 3~7일 동안 blocker 가 없고
- live 와 rebuild-preview 가 모두 안정적으로 유지되고
- same-run continuity, auth/community/ads gating 이 계속 정상이라면
- 그때 archive/cleanup 을 다음 단계로 진행합니다
