# 《사랑 행동 / THE ACT OF LOVE》 내지 제작 원본

A5(148×210mm) 하드커버 사철 양장 내지 PDF 생성 소스. 원고 없는 항목은 플레이스홀더이므로 현재 결과물은 **인쇄용 시안**입니다.

## 빠른 시작
```bash
pip install -r requirements.txt
./scripts/fetch_fonts.sh        # Noto Serif KR (OFL) → fonts/
python3 build.py                # output/ 에 PDF·편집표 생성 (--bleed 3 --font-size 13)
python3 verify.py               # 자동 검수
```

## 수정하는 곳
| 바꿀 것 | 파일 |
|---|---|
| 사랑 행동 100개 문장 | `data/actions.csv` (`number,text,illustration`) — 문장만 바꾸면 모든 서식 유지 |
| 일러스트 | `illustrations/001.png` … `100.png` |
| 문구·속표지·사용법·소개 원고·판권 | `data/book.json` (본문은 문단 문자열 배열) |
| 여백·글꼴 크기·행간·일러스트 크기 | `build.py` 상단 상수 |

## 페이지 구성 (총 216쪽, 1쪽 = 오른쪽)
1 문구(우) · 2 빈면 · 3 속표지(우) · 4 빈면 | 5 사용법(우) · 6–13 프로젝트 소개 8면(6 구간 표지 + 7개 주제) · 14–213 사랑 행동 ×100 (좌 일러스트/우 문장) · 214 제작 정보 · 215–216 빈면.
상세: `output/page-map.md` / `page-map.csv`.

## 조판 규칙
- 사랑 행동: Noto Serif KR Regular 13pt / 행간 23pt, K100, 텍스트 영역 가로·세로 중앙, 최대 폭 88mm, 어절 단위 균형 줄바꿈. 쪽 번호(폴리오)는 넣지 않음.
- 여백: 안쪽 18 / 바깥 16 / 위 20 / 아래 24mm. 텍스트 영역 중심은 쪽 중심보다 2mm 위.
- 도련 기본 3mm, TrimBox/BleedBox 설정. 재단선 포함본·무도련본 별도 생성.

## 산출물 (`output/`)
- `ACT-OF-LOVE_interior_DRAFT_A5_bleed3mm.pdf` — 인쇄용 시안 (도련 3mm, 낱장)
- `..._trim-only.pdf` / `..._bleed3mm_with-marks.pdf` — 무도련 / 재단선 포함
- `ACT-OF-LOVE_review-spreads_DRAFT.pdf` — 검토용 펼침면 (인쇄 불가)
- `page-map.md|csv` 편집표, `line-review.csv` 문장 줄 수 검토, `prepress-checklist.md` 인쇄소 제출 전 확인

## 표지 (별도 파일, 치수 미확정 시안)
`python3 cover.py [--theme light|dark]` → `output/cover/` (뒷표지·책등·앞표지 한 장 전개도, 안내선이 있는 `_review_` 파일 별도).
치수는 `data/cover.json` (책등 16mm 등은 가정값). 인쇄소의 A5(W148XH210) 표지 템플릿/사양이 확정되면 수정하세요.
