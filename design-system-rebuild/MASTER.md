# BNinmyhands Rebuild Design System

## 목적
이 문서는 FRONTEND RESET MODE에서 사용하는 새 프레젠테이션 기준이다.
기존 런타임 로직, API 계약, auth 규칙, ads 규칙, community 규칙은 유지하고 시각 구조만 다시 설계한다.

## 기준 입력
우선순위는 다음과 같다.
1. BNinmyhands PDR v2.0
2. System & Data Spec v1.0
3. Trust / Community / Ads Policy v1.0
4. Launch Plan & QA Playbook v1.0
5. 현재 런타임 로직과 API 계약
6. 이 문서와 `design-system-rebuild/pages/*.md`
7. 승인된 스크린샷, PDF, 참고 디자인
8. 기존 `design-system/*` 문서

## Phase 1 단서
- Phase 1 preview는 PDR 원문 직접 검증 없이 진행한다.
- live route 교체 또는 runtime adapter 단계로 넘어가기 전에는 반드시 PDR 원문을 직접 확인한다.

## 핵심 원칙
- same-run context를 보존한다.
- dashboard -> detail `run_id` 연속성을 유지한다.
- dashboard는 workspace-first, table-first로 설계한다.
- detail은 하나의 same-run analysis story로 읽혀야 한다.
- sponsor는 분석과 명확히 분리한다.
- community는 해석 보조 레이어로만 다룬다.
- frozen preview/V2/V3 트리는 건드리지 않는다.
