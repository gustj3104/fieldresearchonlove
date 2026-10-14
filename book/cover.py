#!/usr/bin/env python3
"""하드커버 표지 전개도(뒷표지 · 책등 · 앞표지) 시안 생성.

치수는 data/cover.json (미확정 가정값). 출력: output/cover/
  python3 cover.py [--theme light|dark]
"""
import argparse
import json
import sys
from pathlib import Path

import pikepdf
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfgen import canvas

from build import FONT_REG, FONT_SEMI, MM, mm, spacing_text, text_w, wrap_balanced

ROOT = Path(__file__).resolve().parent
THEMES = {  # bg / ink 는 CMYK
    "light": dict(bg=(0, 0, 0.07, 0), ink=(0, 0, 0, 1)),   # 미색 바탕 + K100
    "dark": dict(bg=(0, 0, 0, 1), ink=(0, 0, 0, 0)),       # 검정 바탕 + 흰 글자(백 抜き)
}


class Layout:
    def __init__(self, cfg):
        self.pw, self.ph = mm(cfg["panel_w_mm"]), mm(cfg["panel_h_mm"])
        self.sp, self.wr = mm(cfg["spine_mm"]), mm(cfg["wrap_mm"])
        self.W = 2 * self.wr + 2 * self.pw + self.sp
        self.H = 2 * self.wr + self.ph
        self.back_x0 = self.wr
        self.spine_x0 = self.wr + self.pw
        self.front_x0 = self.spine_x0 + self.sp
        self.y0, self.y1 = self.wr, self.wr + self.ph


def draw_cover(c, L, cfg, th, guides):
    ink, bg = th["ink"], th["bg"]
    c.setFillColorCMYK(*bg)
    c.rect(0, 0, L.W, L.H, stroke=0, fill=1)
    c.setFillColorCMYK(*ink)
    c.setStrokeColorCMYK(*ink)
    OUT, INN = mm(11), mm(17)  # 프레임 안쪽 여백: 바깥쪽 / 책등(홈)쪽

    def frame(x0, spine_on_right):
        left = x0 + (OUT if spine_on_right else INN)
        right = x0 + L.pw - (INN if spine_on_right else OUT)
        c.setLineWidth(0.5)
        c.rect(left, L.y0 + OUT, right - left, L.ph - 2 * OUT)
        return left, right

    # ── 앞표지 ──
    fl, fr = frame(L.front_x0, False)
    cx = (fl + fr) / 2
    top = L.y1 - OUT
    c.setFont(FONT_REG, 8)
    c.drawCentredString(cx, top - mm(14), "챠챠챠 6기 · 매주 화요일의 사랑연구회")
    c.setFont(FONT_SEMI, 40)
    c.drawCentredString(cx, L.y0 + L.ph / 2 + mm(6), cfg["title_ko"])
    c.setLineWidth(0.5)
    c.line(cx - mm(6), L.y0 + L.ph / 2 - mm(4), cx + mm(6), L.y0 + L.ph / 2 - mm(4))
    spacing_text(c, cx, L.y0 + L.ph / 2 - mm(14), cfg["title_en"], FONT_REG, 12, 1.0)
    c.setFont(FONT_REG, 10)
    c.drawCentredString(cx, L.y0 + OUT + mm(13), cfg["front_byline"])

    # ── 뒷표지 ──
    bl, br = frame(L.back_x0, True)
    cx = (bl + br) / 2
    c.setFont(FONT_REG, 10)
    body = cfg["back_copy"]
    if body:
        y = L.y1 - OUT - mm(40)
        for para in body:
            for ln in wrap_balanced(para, FONT_REG, 10, br - bl - mm(24)):
                c.drawCentredString(cx, y, ln)
                y -= 19
            y -= 10
    else:
        c.drawCentredString(cx, L.y1 - OUT - mm(40), cfg["back_copy_placeholder"])
    c.setFont(FONT_REG, 8)
    c.drawCentredString(cx, L.y0 + OUT + mm(13), "챠챠챠 6기 · 매주 화요일의 사랑연구회")
    if cfg["barcode_box"]:
        bw, bh = mm(40), mm(25)
        bx, by = br - mm(7) - bw, L.y0 + OUT + mm(22)
        c.setLineWidth(0.4)
        c.rect(bx, by, bw, bh)
        c.setFont(FONT_REG, 6.5)
        c.drawCentredString(bx + bw / 2, by + bh / 2 - 2, "[바코드 · 가격 영역]")

    # ── 책등 (위→아래로 읽는 회전 문자) ──
    scx = L.spine_x0 + L.sp / 2
    margin = mm(26)
    c.saveState()
    c.translate(scx, L.y1)
    c.rotate(-90)
    # 회전 좌표계: x = 위에서 아래로의 거리, y = 책등 폭 방향(오른쪽이 +)
    c.setFont(FONT_SEMI, 17)
    c.drawString(margin, -0.35 * 17, cfg["title_ko"])
    t_end = margin + text_w(cfg["title_ko"], FONT_SEMI, 17)
    spacing_text(c, t_end + mm(8), -0.35 * 7.5, cfg["title_en"], FONT_REG, 8, 0.8, align="left")
    by = "윤현지"
    c.setFont(FONT_REG, 9)
    c.drawString(L.ph - margin - text_w(by, FONT_REG, 9), -0.35 * 9, by)
    c.restoreState()

    if guides:
        draw_guides(c, L, cfg)


def draw_guides(c, L, cfg):
    """검토용 안내선·치수. 인쇄 파일에는 넣지 않는다."""
    c.saveState()
    c.setStrokeColorRGB(0.95, 0.44, 0.26)
    c.setLineWidth(0.6)
    for x in (L.back_x0, L.spine_x0, L.front_x0, L.front_x0 + L.pw):
        c.line(x, 0, x, L.H)
    for y in (L.y0, L.y1):
        c.line(0, y, L.W, y)
    c.setFillColorRGB(0.95, 0.44, 0.26)
    c.setFont(FONT_REG, 8)
    c.drawCentredString(L.back_x0 + L.pw / 2, L.y0 + mm(3), f"뒷표지 {cfg['panel_w_mm']}×{cfg['panel_h_mm']}mm")
    c.drawCentredString(L.front_x0 + L.pw / 2, L.y0 + mm(3), f"앞표지 {cfg['panel_w_mm']}×{cfg['panel_h_mm']}mm")
    c.saveState()
    c.translate(L.spine_x0 + L.sp / 2 + 3, L.y0 + L.ph * 0.40)
    c.rotate(90)
    c.drawString(0, 0, f"책등 {cfg['spine_mm']}mm (가정값)")
    c.restoreState()
    c.setFont(FONT_SEMI, 9)
    c.drawString(mm(3), L.H - mm(6), "치수 미확정 시안 — 인쇄소 A5(148×210) 표지 템플릿 확정 후 수정 · 주황선 안쪽 = 보드 면, 바깥 = 싸개(편집영역)")
    c.setFont(FONT_REG, 7)
    c.drawString(mm(3), mm(3), f"전체 {L.W / MM:g} × {L.H / MM:g}mm (편집영역 기준)")
    c.restoreState()


def save_boxes(path, L):
    with pikepdf.open(path, allow_overwriting_input=True) as pdf:
        pg = pdf.pages[0]
        pg.TrimBox = [L.wr, L.wr, L.W - L.wr, L.H - L.wr]
        pg.BleedBox = [0, 0, L.W, L.H]
        pdf.save(path)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--theme", choices=list(THEMES), default="light")
    a = ap.parse_args()
    for name, fn in ((FONT_REG, "NotoSerifKR_400Regular.ttf"), (FONT_SEMI, "NotoSerifKR_600SemiBold.ttf")):
        p = ROOT / "fonts" / fn
        if not p.exists():
            sys.exit("폰트가 없습니다. scripts/fetch_fonts.sh 를 먼저 실행하세요.")
        pdfmetrics.registerFont(TTFont(name, str(p)))
    cfg = json.load(open(ROOT / "data/cover.json", encoding="utf-8"))
    cfg.update({k: v for k, v in json.load(open(ROOT / "data/book.json", encoding="utf-8")).items() if k in ("title_ko", "title_en")})
    L = Layout(cfg)
    th = THEMES[a.theme]
    out = ROOT / "output/cover"
    out.mkdir(parents=True, exist_ok=True)
    for guides, name in ((False, f"ACT-OF-LOVE_cover_DRAFT_{a.theme}.pdf"), (True, f"ACT-OF-LOVE_cover_review_{a.theme}.pdf")):
        c = canvas.Canvas(str(out / name), pagesize=(L.W, L.H), invariant=1, initialFontName=FONT_REG)
        c.setTitle("사랑 행동 표지 전개도 (치수 미확정 시안)")
        draw_cover(c, L, cfg, th, guides)
        c.showPage()
        c.save()
        if not guides:
            save_boxes(out / name, L)
    print(f"표지 생성 완료: {L.W / MM:g}×{L.H / MM:g}mm → {out}")


if __name__ == "__main__":
    main()
