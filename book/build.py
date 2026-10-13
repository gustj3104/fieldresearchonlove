#!/usr/bin/env python3
"""《사랑 행동 / THE ACT OF LOVE》 내지 PDF 빌더.

데이터: data/book.json (도입부·소개·판권), data/actions.csv (사랑 행동 100개), illustrations/NNN.png
출력:   output/ (인쇄용 PDF 3종, 검토용 스프레드 PDF, 편집표, 줄 수 검토표)

사용:  python3 build.py [--bleed 3] [--font-size 13]
"""
import argparse
import csv
import json
import re
import sys
from pathlib import Path

import pikepdf
from PIL import Image
from reportlab.lib.utils import ImageReader
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfgen import canvas
from reportlab.platypus import Frame, Paragraph
from reportlab.lib.styles import ParagraphStyle

ROOT = Path(__file__).resolve().parent
MM = 72 / 25.4

# ───────────────────────── 판형·레이아웃 (mm) ─────────────────────────
TRIM_W, TRIM_H = 148.0, 210.0
M_INNER, M_OUTER, M_TOP, M_BOTTOM = 18.0, 16.0, 20.0, 24.0   # 안쪽(제본쪽)/바깥/위/아래 안전 여백
ACTION_FONT_PT = 13.0          # 사랑 행동 문장 (전 페이지 동일)
ACTION_LEADING_PT = 23.0
ACTION_TEXT_WIDTH_MM = 88.0    # 문장 최대 폭
ILLUST_BOX_MM = 36.0           # 일러스트 최대 박스 (정사각)
SLUG_MM = 10.0                 # 재단선 포함 버전의 추가 여백(도련 바깥)

FONT_REG, FONT_SEMI = "NSK", "NSK-SB"
K100 = (0, 0, 0, 1)
PLACEHOLDER_RE = re.compile(r"^\[사랑 행동 \d{3}\]$")
FRONT_TEXT_PLACEHOLDER = "[추후 작성]"


def mm(v):
    return v * MM


# ───────────────────────── 페이지 구성표 ─────────────────────────
def build_plan(data, n_actions):
    """PDF 낱장 순서의 페이지 명세 리스트. 1쪽 = 오른쪽(홀수=우, 짝수=좌)."""
    plan = []

    def add(kind, section, component, **kw):
        plan.append(dict(page=len(plan) + 1, kind=kind, section=section, component=component, **kw))

    add("phrase", "B 도입부", "문구 페이지")
    add("blank", "B 도입부", "빈 페이지 (문구 뒷면)")
    add("title", "B 도입부", "속표지")
    add("blank", "B 도입부", "빈 페이지 (속표지 뒷면 / 사용법 펼침면 왼쪽)")
    add("howto", "B 도입부", "사용법 (펼침면 오른쪽)")
    add("intro_open", "C 프로젝트 소개", "프로젝트 소개 구간 표지 (1/8)")
    for i, item in enumerate(data["intro"]):
        add("intro", "C 프로젝트 소개", f"{item['title']} ({i + 2}/8)", index=i)
    for n in range(1, n_actions + 1):
        add("action_art", "D 사랑 행동", f"사랑 행동 {n:03d} 일러스트", action=n)
        add("action_text", "D 사랑 행동", f"사랑 행동 {n:03d} 문장", action=n)
    add("colophon", "E 마지막", "제작 정보 및 판권")
    # 제작 정보 뒤에 최소 1개의 빈 페이지, 이후 4의 배수가 될 때까지 빈 페이지
    add("blank", "E 마지막", "빈 페이지")
    while len(plan) % 4 != 0:
        add("blank", "E 마지막", "빈 페이지")
    for p in plan:
        p["side"] = "R" if p["page"] % 2 == 1 else "L"
    return plan


# ───────────────────────── 데이터 로드 ─────────────────────────
def load_actions():
    rows = list(csv.DictReader(open(ROOT / "data/actions.csv", encoding="utf-8", newline="")))
    actions = {}
    for r in rows:
        n = int(r["number"])
        if n in actions:
            sys.exit(f"사랑 행동 번호 중복: {n}")
        actions[n] = dict(text=r["text"], illustration=(r.get("illustration") or "").strip())
    if sorted(actions) != list(range(1, 101)):
        sys.exit("data/actions.csv 는 번호 1~100 이 정확히 한 번씩 있어야 합니다.")
    return actions


def find_illustration(n, actions):
    name = actions[n]["illustration"]
    if name:
        p = ROOT / "illustrations" / name
        return p if p.exists() else None
    for ext in ("png", "jpg", "jpeg"):
        p = ROOT / "illustrations" / f"{n:03d}.{ext}"
        if p.exists():
            return p
    return None


# ───────────────────────── 조판 도우미 ─────────────────────────
def text_w(s, font, size):
    return pdfmetrics.stringWidth(s, font, size)


def greedy(words, font, size, maxw):
    lines, cur = [], ""
    for w in words:
        # 한 어절이 최대 폭보다 길면 글자 단위로 쪼갠다.
        pieces = [w]
        if text_w(w, font, size) > maxw:
            pieces, buf = [], ""
            for ch in w:
                if text_w(buf + ch, font, size) > maxw and buf:
                    pieces.append(buf)
                    buf = ch
                else:
                    buf += ch
            pieces.append(buf)
        for k, piece in enumerate(pieces):
            glue = " " if (cur and k == 0) else ""
            if cur and text_w(cur + glue + piece, font, size) > maxw:
                lines.append(cur)
                cur = piece
            else:
                cur = cur + glue + piece if cur else piece
    if cur:
        lines.append(cur)
    return lines


def wrap_balanced(text, font, size, maxw):
    """어절 단위 줄바꿈. 줄 수는 그리디와 같게 두고, 가장 짧은 폭으로 균형을 맞춘다."""
    words = text.split(" ")
    base = greedy(words, font, size, maxw)
    n = len(base)
    if n == 1:
        return base
    lo, hi = max(text_w(w, font, size) for w in words), maxw
    lo = min(lo, hi)
    for _ in range(40):
        mid = (lo + hi) / 2
        if len(greedy(words, font, size, mid)) <= n:
            hi = mid
        else:
            lo = mid
    return greedy(words, font, size, hi)


def spacing_text(c, x, y, s, font, size, tracking, align="center"):
    """자간(tracking, pt)을 준 한 줄 텍스트. 가운데/왼쪽 정렬."""
    w = text_w(s, font, size) + tracking * (len(s) - 1)
    x0 = x - w / 2 if align == "center" else x
    c.saveState()  # Tc(자간)가 이후 텍스트로 새지 않도록 격리
    t = c.beginText(x0, y)
    t.setFont(font, size)
    t.setCharSpace(tracking)
    t.textOut(s)
    c.drawText(t)
    c.restoreState()


def set_k(c):
    c.setFillColorCMYK(*K100)
    c.setStrokeColorCMYK(*K100)


# ───────────────────────── 페이지 그리기 (원점 = 재단선 왼쪽 아래) ─────────────────────────
class Ctx:
    def __init__(self, data, actions, font_pt):
        self.data, self.actions, self.font_pt = data, actions, font_pt
        self.warnings, self.line_counts, self.illust_info = [], {}, {}

    def area(self, side):
        """텍스트 영역(pt): (x0, y0, x1, y1). 오른쪽 면은 왼쪽이 안쪽(제본쪽)."""
        left = M_INNER if side == "R" else M_OUTER
        right = M_OUTER if side == "R" else M_INNER
        return mm(left), mm(M_BOTTOM), mm(TRIM_W - right), mm(TRIM_H - M_TOP)


def draw_page(c, spec, ctx):
    set_k(c)
    k, side = spec["kind"], spec["side"]
    x0, y0, x1, y1 = ctx.area(side)
    cx, cy = (x0 + x1) / 2, (y0 + y1) / 2
    d = ctx.data
    if k == "blank":
        return
    if k == "phrase":
        c.setFont(FONT_REG, 10)
        txt = d.get("phrase") or "[문구 한 줄 — 추후 전달]"
        c.drawCentredString(cx, cy - 3.5, txt)
    elif k == "title":
        c.setFont(FONT_SEMI, 30)
        c.drawCentredString(cx, mm(TRIM_H - 78), d["title_ko"])
        spacing_text(c, cx, mm(TRIM_H - 92), d["title_en"], FONT_REG, 9, 2.6)
        c.setFont(FONT_REG, 10.5)
        c.drawCentredString(cx, y0 + mm(8), f"엮은이  {d['editor']}")
    elif k == "howto":
        spacing_text(c, x0, mm(TRIM_H - 34), d["howto"]["heading_en"], FONT_REG, 8, 1.6, align="left")
        c.setFont(FONT_SEMI, 17)
        c.drawString(x0, mm(TRIM_H - 44), d["howto"]["heading_ko"])
        c.setLineWidth(0.4)
        c.line(x0, mm(TRIM_H - 50), x0 + mm(10), mm(TRIM_H - 50))
        body_block(c, ctx, d["howto"]["body"], x0, y0, x1, mm(TRIM_H - 58), "[사용법 원고 — 추후 전달]", spec)
    elif k == "intro_open":
        c.setFont(FONT_SEMI, 20)
        c.drawCentredString(cx, cy + mm(2), d["intro_opener"]["title"])
        c.setFont(FONT_REG, 8.5)
        c.drawCentredString(cx, cy - mm(8), d["intro_opener"]["sub"])
    elif k == "intro":
        item = d["intro"][spec["index"]]
        c.setFont(FONT_REG, 8)
        c.drawString(x0, mm(TRIM_H - 34), f"{spec['index'] + 1:02d}")
        title_lines = wrap_balanced(item["title"], FONT_SEMI, 15, x1 - x0)
        yy = mm(TRIM_H - 44)
        c.setFont(FONT_SEMI, 15)
        for ln in title_lines:
            c.drawString(x0, yy, ln)
            yy -= 22
        yy += 22
        c.setLineWidth(0.4)
        c.line(x0, yy - mm(6), x0 + mm(10), yy - mm(6))
        body_block(c, ctx, item["body"], x0, y0, x1, yy - mm(14), f"[본문 원고 — {item['title']}]", spec)
    elif k == "action_text":
        n = spec["action"]
        text = ctx.actions[n]["text"]
        lines = wrap_balanced(text, FONT_REG, ctx.font_pt, mm(ACTION_TEXT_WIDTH_MM))
        ctx.line_counts[n] = len(lines)
        if len(lines) > 5:
            ctx.warnings.append(f"사랑 행동 {n:03d}: {len(lines)}줄 — 글자 크기/문장 길이 검토 필요")
        c.setFont(FONT_REG, ctx.font_pt)
        top = cy + (len(lines) - 1) / 2 * ACTION_LEADING_PT
        for i, ln in enumerate(lines):
            # 한글 글면 중심이 줄 중심에 오도록 0.35em 보정
            c.drawCentredString(cx, top - i * ACTION_LEADING_PT - 0.35 * ctx.font_pt, ln)
    elif k == "action_art":
        n = spec["action"]
        box = mm(ILLUST_BOX_MM)
        path = find_illustration(n, ctx.actions)
        if path:
            im = Image.open(path).convert("L")  # 1도 인쇄: K 그레이스케일
            w, h = im.size
            s = min(box / w, box / h)
            dw, dh = w * s, h * s
            ppi = w / (dw / 72)
            ctx.illust_info[n] = (path.name, round(ppi))
            if ppi < 300:
                ctx.warnings.append(f"사랑 행동 {n:03d} 일러스트 {path.name}: 배치 크기 기준 {ppi:.0f}ppi (<300)")
            c.drawImage(ImageReader(im), cx - dw / 2, cy - dh / 2, dw, dh)
        else:
            c.setLineWidth(0.3)
            c.rect(cx - box / 2, cy - box / 2, box, box)
            c.setFont(FONT_REG, 6.5)
            c.drawCentredString(cx, cy - 2, f"[일러스트 {n:03d}]")
    elif k == "colophon":
        spacing_text(c, x0, mm(TRIM_H - 34), "COLOPHON", FONT_REG, 7.5, 1.6, align="left")
        c.setFont(FONT_SEMI, 11)
        c.drawString(x0, mm(TRIM_H - 44), "제작 정보")
        c.setFont(FONT_REG, 8.5)
        yy = mm(TRIM_H - 60)
        for line in (f"{d['title_ko']}  {d['title_en']}", d["project"], f"엮은이  {d['editor']}"):
            c.drawString(x0, yy, line)
            yy -= 14
        rows = list(d["colophon"].items())
        lead = 15
        yy = y0 + lead * (len(rows) - 1) + 4
        c.setFont(FONT_REG, 8)
        for label, val in rows:
            c.drawString(x0, yy, label)
            c.drawString(x0 + mm(28), yy, val or FRONT_TEXT_PLACEHOLDER)
            yy -= lead


def body_block(c, ctx, paragraphs, x0, y0, x1, y_top, placeholder, spec):
    if not paragraphs:
        c.setFont(FONT_REG, 8.5)
        c.drawString(x0, y_top - 8, placeholder)
        return
    st = ParagraphStyle("body", fontName=FONT_REG, fontSize=9.5, leading=17, alignment=0, wordWrap=None,
                        spaceAfter=8)
    frame = Frame(x0, y0, x1 - x0, y_top - y0, leftPadding=0, rightPadding=0, topPadding=0, bottomPadding=0)
    story = [Paragraph(p, st) for p in paragraphs]
    frame.addFromList(story, c)
    if story:
        ctx.warnings.append(f"p.{spec['page']:03d}: 본문이 영역을 넘침 (잘린 문단 {len(story)}개)")


# ───────────────────────── 출력 ─────────────────────────
def set_boxes(path, trim_off, slug_pt, w_pt, h_pt, title):
    """TrimBox = 148×210mm, BleedBox = 도련 포함 영역(MediaBox에서 슬러그 제외)."""
    with pikepdf.open(path, allow_overwriting_input=True) as pdf:
        tw, th = TRIM_W * MM, TRIM_H * MM
        for pg in pdf.pages:
            pg.TrimBox = [trim_off, trim_off, trim_off + tw, trim_off + th]
            pg.BleedBox = [slug_pt, slug_pt, w_pt - slug_pt, h_pt - slug_pt]
        pdf.docinfo["/Title"] = title
        pdf.docinfo["/Author"] = "윤현지 (엮은이)"
        pdf.docinfo["/Subject"] = "A5 내지 인쇄용 시안 (최종 원고 아님)"
        pdf.save(path)


def render_print(plan, ctx, out, bleed_mm, marks):
    slug = SLUG_MM if marks else 0
    off = mm(bleed_mm + slug)
    w, h = mm(TRIM_W + 2 * (bleed_mm + slug)), mm(TRIM_H + 2 * (bleed_mm + slug))
    c = canvas.Canvas(str(out), pagesize=(w, h), pageCompression=1, invariant=1, initialFontName=FONT_REG)
    c.setTitle("사랑 행동 내지 (인쇄용 시안)")
    for spec in plan:
        c.saveState()
        c.translate(off, off)
        draw_page(c, spec, ctx)
        c.restoreState()
        if marks:
            draw_marks(c, off, bleed_mm)
        c.showPage()
    c.save()
    set_boxes(out, off, mm(slug), w, h, out.stem)


def draw_marks(c, off, bleed_mm):
    """재단선(트림 마크). 도련 바깥쪽에만 그린다."""
    set_k(c)
    c.setLineWidth(0.25)
    tw, th = mm(TRIM_W), mm(TRIM_H)
    gap, ln = mm(bleed_mm + 1), mm(5)
    for x in (off, off + tw):
        for y, sgn in ((off, -1), (off + th, 1)):
            c.line(x, y + sgn * gap, x, y + sgn * (gap + ln))
    for y in (off, off + th):
        for x, sgn in ((off, -1), (off + tw, 1)):
            c.line(x + sgn * gap, y, x + sgn * (gap + ln), y)


def render_review(plan, ctx, out):
    """검토용 스프레드 PDF. 1쪽은 단독 오른쪽, 마지막 쪽은 단독 왼쪽. 가이드·라벨 포함(인쇄용 아님)."""
    side_m, top_m, bot_m = 8, 12, 14
    sw, sh = mm(2 * TRIM_W + 2 * side_m), mm(TRIM_H + top_m + bot_m)
    c = canvas.Canvas(str(out), pagesize=(sw, sh), pageCompression=1, invariant=1, initialFontName=FONT_REG)
    c.setTitle("사랑 행동 내지 — 검토용 펼침면 (인쇄 불가)")
    by_page = {p["page"]: p for p in plan}
    last = len(plan)
    spreads = [(None, 1)] + [(p, p + 1) for p in range(2, last, 2)] + [(last, None)]
    for left, right in spreads:
        c.setFillColorRGB(0.88, 0.88, 0.86)
        c.rect(0, 0, sw, sh, stroke=0, fill=1)
        c.setFillColorRGB(0.25, 0.25, 0.25)
        c.setFont(FONT_REG, 7)
        c.drawString(mm(side_m), sh - mm(7), "검토용 펼침면 — 인쇄 불가 · 파란 점선 = 안전 여백 / 텍스트 영역")
        for pg, ox in ((left, mm(side_m)), (right, mm(side_m + TRIM_W))):
            if pg is None:
                c.setFillColorRGB(0.8, 0.8, 0.78)
                c.rect(ox, mm(bot_m), mm(TRIM_W), mm(TRIM_H), stroke=0, fill=1)
                c.setFillColorRGB(0.4, 0.4, 0.4)
                c.setFont(FONT_REG, 7)
                c.drawCentredString(ox + mm(TRIM_W) / 2, mm(bot_m + TRIM_H / 2), "(표지·면지 쪽)")
                continue
            spec = by_page[pg]
            c.setFillColorRGB(1, 1, 1)
            c.rect(ox, mm(bot_m), mm(TRIM_W), mm(TRIM_H), stroke=0, fill=1)
            c.saveState()
            c.translate(ox, mm(bot_m))
            draw_page(c, spec, Ctx(ctx.data, ctx.actions, ctx.font_pt))
            ax0, ay0, ax1, ay1 = ctx.area(spec["side"])
            c.setStrokeColorRGB(0.2, 0.4, 0.9)
            c.setLineWidth(0.3)
            c.setDash(2, 2)
            c.rect(ax0, ay0, ax1 - ax0, ay1 - ay0)
            c.setDash()
            c.restoreState()
            c.setFillColorRGB(0.25, 0.25, 0.25)
            c.setFont(FONT_REG, 7)
            tag = f"p.{pg:03d} {'R' if spec['side'] == 'R' else 'L'}  {spec['component']}"
            c.drawString(ox, mm(bot_m - 5), tag)
        # 제본선
        c.setStrokeColorRGB(0.6, 0.6, 0.6)
        c.setLineWidth(0.3)
        c.line(mm(side_m + TRIM_W), mm(bot_m), mm(side_m + TRIM_W), mm(bot_m + TRIM_H))
        c.showPage()
    c.save()


# ───────────────────────── 편집표 ─────────────────────────
def write_tables(plan, ctx, outdir, bleed_mm):
    hdr = ["PDF 쪽", "펼침면", "좌/우", "구간", "구성 요소", "사랑 행동 번호", "원고 상태", "줄 수"]
    rows = []
    for p in plan:
        pg = p["page"]
        if pg == 1:
            spread = "단독(우)"
        elif pg == len(plan):
            spread = "단독(좌)"
        else:
            a0 = pg if pg % 2 == 0 else pg - 1
            spread = f"{a0}–{a0 + 1}"
        n = p.get("action")
        status = ""
        lines = ""
        if p["kind"] == "blank":
            status = "빈 페이지"
        elif p["kind"] == "action_text":
            ph = PLACEHOLDER_RE.match(ctx.actions[n]["text"])
            status = "플레이스홀더" if ph else "테스트 문장(임시)"
            lines = ctx.line_counts.get(n, "")
        elif p["kind"] == "action_art":
            status = "일러스트 배치" if find_illustration(n, ctx.actions) else "일러스트 플레이스홀더"
        elif p["kind"] == "title":
            status = "확정 정보(제목·엮은이)"
        else:
            status = "플레이스홀더"
        rows.append([f"{pg:03d}", spread, "우" if p["side"] == "R" else "좌", p["section"], p["component"],
                     f"{n:03d}" if n else "", status, lines])
    with open(outdir / "page-map.csv", "w", encoding="utf-8-sig", newline="") as f:
        w = csv.writer(f)
        w.writerow(hdr)
        w.writerows(rows)
    with open(outdir / "page-map.md", "w", encoding="utf-8") as f:
        f.write("# 편집표 — 사랑 행동 / THE ACT OF LOVE 내지 (인쇄용 시안)\n\n")
        f.write(f"- 총 {len(plan)}쪽 (4의 배수), A5 148×210mm, 인쇄용 PDF는 낱장 순서 (1쪽 = 오른쪽)\n")
        f.write("- 사랑 행동 N: 일러스트 = 왼쪽(짝수 쪽), 문장 = 오른쪽(홀수 쪽)\n\n")
        f.write("| " + " | ".join(hdr) + " |\n|" + "---|" * len(hdr) + "\n")
        for r in rows:
            f.write("| " + " | ".join(str(x) for x in r) + " |\n")
    with open(outdir / "line-review.csv", "w", encoding="utf-8-sig", newline="") as f:
        w = csv.writer(f)
        w.writerow(["사랑 행동", "글자 수", "줄 수", "원문"])
        for n in sorted(ctx.actions):
            t = ctx.actions[n]["text"]
            w.writerow([f"{n:03d}", len(t), ctx.line_counts.get(n, ""), t])


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--bleed", type=float, default=3.0, help="도련(mm), 기본 3")
    ap.add_argument("--font-size", type=float, default=ACTION_FONT_PT)
    a = ap.parse_args()

    fonts = ROOT / "fonts"
    for name, fn in ((FONT_REG, "NotoSerifKR_400Regular.ttf"), (FONT_SEMI, "NotoSerifKR_600SemiBold.ttf")):
        if not (fonts / fn).exists():
            sys.exit("폰트가 없습니다. scripts/fetch_fonts.sh 를 먼저 실행하세요.")
        pdfmetrics.registerFont(TTFont(name, str(fonts / fn)))

    data = json.load(open(ROOT / "data/book.json", encoding="utf-8"))
    actions = load_actions()
    plan = build_plan(data, len(actions))
    assert len(plan) % 4 == 0
    out = ROOT / "output"
    out.mkdir(exist_ok=True)

    ctx = Ctx(data, actions, a.font_size)
    b = a.bleed
    render_print(plan, ctx, out / f"ACT-OF-LOVE_interior_DRAFT_A5_bleed{b:g}mm.pdf", b, False)
    render_print(plan, Ctx(data, actions, a.font_size), out / "ACT-OF-LOVE_interior_DRAFT_A5_trim-only.pdf", 0, False)
    render_print(plan, Ctx(data, actions, a.font_size), out / f"ACT-OF-LOVE_interior_DRAFT_A5_bleed{b:g}mm_with-marks.pdf", b, True)
    render_review(plan, ctx, out / "ACT-OF-LOVE_review-spreads_DRAFT.pdf")
    write_tables(plan, ctx, out, b)
    print(f"{len(plan)}쪽 생성 완료 → {out}")
    for w in ctx.warnings:
        print("경고:", w)


if __name__ == "__main__":
    main()
