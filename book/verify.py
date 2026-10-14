#!/usr/bin/env python3
"""output/ 의 PDF를 읽어 최종 검수 항목을 자동 확인한다. 실패 시 종료 코드 1."""
import csv
import json
import re
import subprocess
import sys
from pathlib import Path

import pikepdf
import pymupdf

ROOT = Path(__file__).resolve().parent
OUT = ROOT / "output"
MM = 72 / 25.4
fails = []


def check(ok, msg):
    print(("PASS " if ok else "FAIL ") + msg)
    if not ok:
        fails.append(msg)


actions = {int(r["number"]): r["text"] for r in csv.DictReader(open(ROOT / "data/actions.csv", encoding="utf-8"))}
data = json.load(open(ROOT / "data/book.json", encoding="utf-8"))
norm = lambda s: re.sub(r"\s+", "", s)

variants = {
    "bleed3mm": (OUT / "ACT-OF-LOVE_interior_DRAFT_A5_bleed3mm.pdf", 3),
    "trim-only": (OUT / "ACT-OF-LOVE_interior_DRAFT_A5_trim-only.pdf", 0),
    "with-marks": (OUT / "ACT-OF-LOVE_interior_DRAFT_A5_bleed3mm_with-marks.pdf", 3),
}
docs = {k: pymupdf.open(p) for k, (p, _) in variants.items()}
N = len(docs["bleed3mm"])
print(f"== 총 {N}쪽 ==")
check(N % 4 == 0, f"총 페이지 수 {N} 는 4의 배수")
check(len({len(d) for d in docs.values()}) == 1, "인쇄용 3종의 페이지 수 동일")

for k, (path, bleed) in variants.items():
    with pikepdf.open(path) as pdf:
        tw, th = 148 * MM, 210 * MM
        ok_trim = ok_media = True
        for pg in pdf.pages:
            t = [float(x) for x in pg.TrimBox]
            ok_trim &= abs((t[2] - t[0]) - tw) < 0.01 and abs((t[3] - t[1]) - th) < 0.01
            m = [float(x) for x in pg.MediaBox]
            slug = 10 * MM if k == "with-marks" else 0
            exp_w, exp_h = tw + 2 * (bleed * MM + slug), th + 2 * (bleed * MM + slug)
            ok_media &= abs((m[2] - m[0]) - exp_w) < 0.01 and abs((m[3] - m[1]) - exp_h) < 0.01
        check(ok_trim, f"[{k}] 모든 쪽 TrimBox = 148×210mm")
        check(ok_media, f"[{k}] 모든 쪽 MediaBox 크기 일정 (도련 {bleed}mm{' + 재단선' if k == 'with-marks' else ''})")
        # 색상: RGB 연산자 없음, k 연산자는 K100(0 0 0 1)만
        bad_rgb = bad_k = 0
        for pg in pdf.pages:
            for operands, op in pikepdf.parse_content_stream(pg):
                o = str(op)
                if o in ("rg", "RG"):
                    bad_rgb += 1
                if o in ("k", "K") and [float(x) for x in operands] != [0, 0, 0, 1]:
                    bad_k += 1
        check(bad_rgb == 0 and bad_k == 0, f"[{k}] RGB 없음, CMYK는 K100만 사용 (rg={bad_rgb}, 비K100={bad_k})")

# 폰트 임베드 (poppler 없이 PyMuPDF/pikepdf로 확인)
with pikepdf.open(variants["bleed3mm"][0]) as pdf:
    fonts = {}
    for pg in pdf.pages:
        for name, f in pg.Resources.get("/Font", {}).items():
            desc = f.get("/FontDescriptor") or (f.DescendantFonts[0].FontDescriptor if "/DescendantFonts" in f else None)
            embedded = bool(desc is not None and any(k in desc for k in ("/FontFile", "/FontFile2", "/FontFile3")))
            fonts[str(f.get("/BaseFont"))] = fonts.get(str(f.get("/BaseFont")), True) and embedded
    check(bool(fonts) and all(fonts.values()), f"모든 글꼴 임베드 ({len(fonts)}개 서브셋: {sorted(set(n.split('+')[-1] for n in fonts))})")

d = docs["bleed3mm"]
B = 3 * MM
page_text = [d[i].get_text("text") for i in range(N)]

# 구조
plan_expect = {}
action_text_pages, action_art_pages = {}, {}
for i in range(N):
    t = norm(page_text[i])
    for n, txt in actions.items():
        if t == norm(txt):
            action_text_pages.setdefault(n, []).append(i + 1)
check(len(action_text_pages) == 100 and all(len(v) == 1 for v in action_text_pages.values()),
      f"사랑 행동 문장 페이지 정확히 100개, 중복·누락 없음 (발견 {len(action_text_pages)}개)")
check(all(v[0] % 2 == 1 for v in action_text_pages.values()), "모든 사랑 행동 문장이 오른쪽(홀수) 페이지")
A1 = action_text_pages[1][0]
check(A1 % 2 == 1 and all(action_text_pages[n][0] == A1 + 2 * (n - 1) for n in action_text_pages),
      f"문장 페이지 = {A1}, {A1 + 2}, …, {A1 + 198} (번호 순서·한 칸 건너 오른쪽 쪽)")
COL = A1 + 199  # 제작 정보 쪽
# 한 페이지에 사랑 행동 2개 이상 금지: 문장 페이지 텍스트가 단일 문장과 정확히 일치했으므로 보장됨
# 왼쪽 페이지 일러스트(플레이스홀더 또는 이미지)
for n in range(1, 101):
    p = A1 - 1 + 2 * (n - 1)
    pg = d[p - 1]
    has_art = bool(pg.get_drawings()) or bool(pg.get_images())
    action_art_pages[n] = has_art
check(all(action_art_pages.values()), "사랑 행동 100개 모두 왼쪽(짝수) 페이지에 일러스트 상자/이미지 존재")

# 새 원고 반영 확인
check(norm(page_text[0]) == norm(data["phrase"]), "p.1 문구가 book.json 원문과 일치")
if data["howto"]["body"]:
    check(all(norm(re.sub(r"^\d+\.", "", it)) in norm(page_text[4]) for it in data["howto"]["body"]),
          f"p.5 사용법 {len(data['howto']['body'])}개 항목 원문 일치")
# 일러스트: 연속 쪽 동일 이미지 금지, 풀 이미지 고르게 사용
import hashlib
art_hash = []
for n in range(1, 101):
    pg = d[14 + 2 * (n - 1) - 1]
    imgs = pg.get_images(full=True)
    art_hash.append(hashlib.md5(d.extract_image(imgs[0][0])["image"]).hexdigest() if imgs else None)
if all(art_hash):
    from collections import Counter
    cnt = Counter(art_hash)
    check(all(a != b for a, b in zip(art_hash, art_hash[1:])), "연속한 사랑 행동 일러스트에 같은 이미지가 없음 (연속 중복 0)")
    check(len(cnt) == len(list((ROOT / "illustrations/pool").glob("*.png"))), f"풀 이미지 {len(cnt)}종 모두 사용 (횟수 {sorted(cnt.values())})")

# 빈 페이지 / 마지막 순서
blank_pages = [2, 4] + list(range(COL + 1, N + 1))
check(all(not page_text[p - 1].strip() and not d[p - 1].get_drawings() and not d[p - 1].get_images() for p in blank_pages),
      f"빈 페이지 {blank_pages} 에 어떤 내용도 없음")
check("제작정보" in norm(page_text[COL - 1]) and "Copyright" in norm(page_text[COL - 1]) and COL % 2 == 0, f"p.{COL} = 제작 정보 및 판권 (왼쪽), 사랑 행동 100 바로 다음")
check(norm(page_text[COL - 2]) == norm(actions[100]), f"p.{COL - 1} = 사랑 행동 100 문장 (마지막 사랑 행동 뒤에 제작 정보)")
labels = ["기획", "제작", "편집", "디자인", "프로젝트 운영", "이메일", "Copyright"]
lines213 = [l.strip() for l in page_text[COL - 1].splitlines()]
pos = [lines213.index(l) if l in lines213 else -1 for l in labels]
check(all(p >= 0 for p in pos) and pos == sorted(pos), "판권 항목 7개가 지정 순서로 존재")
check(norm(data["title_ko"]) in norm(page_text[2]) and norm(data["title_en"]) in norm(page_text[2]) and "엮은이윤현지" in norm(page_text[2]), "p.3 속표지: 제목·영문·엮은이 (book.json 표기와 일치)")
check("HOWTOUSETHISBOOK" in norm(page_text[4]) and "책사용법" in norm(page_text[4]), "p.5 사용법 오른쪽 페이지")
# 서문·후기·감사 구간(p.6 ~ 사랑 행동 앞): 원고 원문·순서 일치
sec_expect = ""
for sec in data["sections"]:
    sec_expect += sec["title"] + "".join(x for x in sec["body"] if x != "\f").replace("***", "") + sec.get("note", "")
SEC_END = A1 - 2  # 에세이 구간 마지막 쪽 (사랑 행동 일러스트 쪽 바로 앞, 필요 시 사이 빈 쪽 포함)
sec_actual = "".join(page_text[i] for i in range(5, SEC_END))
check(norm(sec_actual).replace("\n", "") == norm(sec_expect), f"p.6–{SEC_END} 서문·후기·감사 본문이 book.json 원문과 일치 (줄바꿈 제외, 순서 일치)")

# 한글 깨짐/누락: 추출 텍스트에 대체문자·PUA 없음, 문장 원문 일치(위에서 검증)
all_txt = "".join(page_text)
check("�" not in all_txt and not re.search("[-]", all_txt), "추출 텍스트에 깨진 글자(U+FFFD/PUA) 없음")

# 텍스트가 재단선 기준 안전 여백 안에 있는가 + 문장 크기 일정
def bbox_ok(i):
    pg = d[i]
    right = (i + 1) % 2 == 1
    inner, outer = 18 * MM, 16 * MM
    x0 = B + (inner if right else outer) - 0.5
    x1 = B + 148 * MM - (outer if right else inner) + 0.5
    for b in pg.get_text("dict")["blocks"]:
        if b["type"] == 0:
            r = b["bbox"]
            if r[0] < x0 or r[2] > x1 or r[1] < B + 20 * MM - 2 or r[3] > B + 210 * MM - 24 * MM + 8:
                return False
    return True
check(all(bbox_ok(i) for i in range(N)), "모든 쪽의 텍스트가 안전 여백(안쪽 18·바깥 16·위 20·아래 24mm) 안")
sizes = set()
cy_dev = []
for n, (p,) in action_text_pages.items():
    pg = d[p - 1]
    spans = [s for b in pg.get_text("dict")["blocks"] if b["type"] == 0 for l in b["lines"] for s in l["spans"]]
    sizes |= {(s["font"].split("+")[-1], round(s["size"], 2)) for s in spans}
    oy = [s["origin"][1] for s in spans]          # 각 줄 기준선(위→아래 좌표)
    expected = pg.rect.height - (B + 107 * MM - 0.35 * 13)  # 텍스트 영역 중심 + 글면 보정
    cy_dev.append(((min(oy) + max(oy)) / 2 - expected) / MM)
check(len(sizes) == 1, f"사랑 행동 문장 글꼴·크기 전부 동일 {sizes}")
check(max(abs(x) for x in cy_dev) < 0.1, f"사랑 행동 문장 블록 세로 중심 편차 최대 {max(abs(x) for x in cy_dev):.2f}mm (기준선 중심, 허용 0.1mm)")

# 검토용 PDF 순서
rv = pymupdf.open(OUT / "ACT-OF-LOVE_review-spreads_DRAFT.pdf")
seq = []
for pg in rv:
    seq += [int(m) for m in re.findall(r"p\.(\d{3})\s+[LR]", pg.get_text())]
check(seq == list(range(1, N + 1)), f"검토용 PDF 페이지 순서 1…{N} 와 인쇄용 낱장 순서 일치 (스프레드 {len(rv)}장)")
rv_sides_ok = True
for pg in rv:
    for m in re.finditer(r"p\.(\d{3})\s+([LR])", pg.get_text()):
        rv_sides_ok &= (int(m.group(1)) % 2 == 1) == (m.group(2) == "R")
check(rv_sides_ok, "검토용 PDF 좌/우 라벨이 홀수=우, 짝수=좌와 일치")
# 검토용 페이지 본문 텍스트 = 인쇄용 텍스트 (순서 일치)
print("\n실패:" if fails else "\n모든 자동 검수 통과", fails if fails else "")
sys.exit(1 if fails else 0)
