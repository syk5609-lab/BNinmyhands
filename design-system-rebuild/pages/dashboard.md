# Dashboard Rebuild Rules

## 페이지 목표
대시보드는 BNinmyhands의 주 작업면이다.
사용자는 최신 persisted run을 빠르게 읽고, 랭킹 테이블에서 심볼을 좁힌 뒤 same-run detail로 내려가야 한다.

## 핵심 구조
1. compact header
2. run context strip
3. guest strip
4. strategy preset row
5. active preset explanation
6. top candidates
7. dashboard top sponsor slot
8. bucket summary
9. controls row
10. rankings table
11. dashboard mid sponsor slot
12. disclosure footer

## 강제 규칙
- 랭킹 테이블이 가장 넓고 안정적인 작업면이어야 한다.
- 첫 viewport에서 run context와 table 진입부가 함께 보여야 한다.
- guest strip은 run context 아래에만 둔다.
- dashboard top sponsor는 top candidates 아래, bucket summary 위에 둔다.
- dashboard mid sponsor는 rankings table 아래, disclosure footer 위에 둔다.
- ads off일 때 top sponsor와 mid sponsor 모두 주변 흐름과 여백이 무너지지 않아야 한다.
- preset, bucket, sponsor가 랭킹 표보다 무겁게 보이면 안 된다.
- 카드 모자이크, hero 스타일 구성, 과장된 요약 카드 구성을 금지한다.
