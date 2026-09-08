import { useState, useCallback } from "react";

import poster01 from "@/imports/KakaoTalk_20260825_013403723.png";
import teaser1 from "@/imports/Teaser-1.png";
import posterTeaser from "@/imports/KakaoTalk_20260825_012754611_01.png";
import illust0 from "@/imports/KakaoTalk_20260825_012754611_-______2_.png";
import illust1 from "@/imports/KakaoTalk_20260825_012754611_-______3_.png";
import illust2 from "@/imports/KakaoTalk_20260825_012754611_-______4_.png";
import illust3 from "@/imports/KakaoTalk_20260825_012754611_-______5_.png";
import illust4 from "@/imports/KakaoTalk_20260825_012754611_-______6_.png";
import illust5 from "@/imports/KakaoTalk_20260825_012754611_-____.png";
import illust6 from "@/imports/KakaoTalk_20260825_012754611-1.png";
import posterPerformance from "@/imports/KakaoTalk_20260825_013403723_06.png";
import posterWho from "@/imports/KakaoTalk_20260825_013403723_07.png";

type Page = "landing" | "home" | "project" | "program" | "application" | "complete" | "archive";

// Set to true to reopen applications.
const APPLICATIONS_OPEN = false;

// ─── Shared ───────────────────────────────────────────────────────────────────

function Label({ text, invert = false }: { text: string; invert?: boolean }) {
  return (
    <p className={`font-sans text-[9px] tracking-[0.3em] uppercase ${invert ? "text-white/40" : "text-black/35"}`}>
      {text}
    </p>
  );
}

function Header({ onNavigate, currentPage }: { onNavigate: (p: Page) => void; currentPage: Page }) {
  const [menuOpen, setMenuOpen] = useState(false);
  if (currentPage === "landing") return null;

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-40 max-w-[440px] mx-auto" style={{ paddingTop: "env(safe-area-inset-top)" }}>
        <div className="flex items-center justify-between px-5 py-[14px] bg-black border-b border-white/10">
          <button
            onClick={() => onNavigate("home")}
            className="font-sans text-[10px] tracking-[0.08em] text-white/70 hover:text-white transition-colors"
          >
            Field research on love
          </button>
          <button
            onClick={() => setMenuOpen(true)}
            className="font-sans text-[9px] tracking-[0.3em] text-white/50 hover:text-white transition-colors uppercase"
          >
            Menu
          </button>
        </div>
      </header>
      {menuOpen && (
        <FullscreenMenu
          onNavigate={(p) => { setMenuOpen(false); onNavigate(p); }}
          onClose={() => setMenuOpen(false)}
        />
      )}
    </>
  );
}

function FullscreenMenu({ onNavigate, onClose }: { onNavigate: (p: Page) => void; onClose: () => void }) {
  const items: { label: string; page: Page }[] = [
    { label: "HOME", page: "home" },
    { label: "PROJECT", page: "project" },
    { label: "PROGRAM", page: "program" },
    { label: "ARCHIVE", page: "archive" },
    ...(APPLICATIONS_OPEN ? [{ label: "APPLY", page: "application" as const }] : []),
  ];
  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col page-transition max-w-[440px] mx-auto">
      <div className="flex items-center justify-between px-5 py-[14px] border-b border-white/10">
        <span className="font-sans text-[10px] tracking-[0.08em] text-white/70">Field research on love</span>
        <button
          onClick={onClose}
          className="font-sans text-[9px] tracking-[0.3em] text-white/40 hover:text-white transition-colors uppercase"
        >
          Close
        </button>
      </div>
      <nav className="flex-1 flex flex-col justify-center px-5">
        {items.map((item) => (
          <button
            key={item.page}
            onClick={() => onNavigate(item.page)}
            className="text-left font-sans text-[2.5rem] font-black tracking-[0.06em] text-white/80 hover:text-white transition-colors py-3 border-b border-white/10"
          >
            {item.label}
          </button>
        ))}
      </nav>
      <div className="px-5 py-8">
        <p className="font-sans text-[9px] tracking-[0.3em] text-white/20 uppercase">2026 / Seoul</p>
      </div>
    </div>
  );
}

function ArrowLink({ children, onClick, invert = false }: { children: React.ReactNode; onClick: () => void; invert?: boolean }) {
  return (
    <button
      onClick={onClick}
      className={`font-sans text-[11px] tracking-[0.08em] ${invert ? "text-white/60 hover:text-white" : "text-black/50 hover:text-black"} transition-colors text-left`}
    >
      {children}
    </button>
  );
}

function BlackCTA({ children, onClick, disabled = false }: { children: React.ReactNode; onClick: () => void; disabled?: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="w-full py-5 bg-black text-white font-sans text-[11px] tracking-[0.2em] uppercase hover:bg-black/80 disabled:opacity-25 transition-colors"
    >
      {children}
    </button>
  );
}

function WhiteCTA({ children, onClick, disabled = false }: { children: React.ReactNode; onClick: () => void; disabled?: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="w-full py-5 bg-white text-black font-sans text-[11px] tracking-[0.2em] uppercase hover:bg-[#F2F2F2] disabled:opacity-25 transition-colors border border-black"
    >
      {children}
    </button>
  );
}

// ─── Landing ──────────────────────────────────────────────────────────────────

function LandingPage({ onEnter }: { onEnter: () => void }) {
  return (
    <div
      className="fixed inset-0 bg-black flex items-center justify-center cursor-pointer page-transition"
      onClick={onEnter}
    >
      <div className="relative w-full h-full max-w-[440px] mx-auto">
        {/* Teaser base */}
        <img
          src={posterTeaser}
          alt=""
          aria-hidden
          className="absolute inset-0 w-full h-full object-cover opacity-60"
        />
        {/* Central illustration */}
        <div className="absolute inset-0 flex items-center justify-center">
          <img
            src={teaser1}
            alt="Field research on love — 티저"
            className="w-full object-contain"
          />
        </div>
      </div>
    </div>
  );
}

// ─── Home ─────────────────────────────────────────────────────────────────────

function HomePage({ onNavigate }: { onNavigate: (p: Page) => void }) {
  return (
    <div className="page-transition">

      {/* HERO */}
      <section className="bg-black min-h-screen flex flex-col justify-between px-5 pt-24 pb-12">
        <Label text="유쾌한반란 챠챠챠 6기" invert />
        <div className="flex flex-col gap-8">
          <h1 style={{ fontFamily: "'Codystar', sans-serif", fontWeight: 400 }} className="text-[3.8rem] leading-[1.0] tracking-[0.04em] text-white">
            Field research<br />on love
          </h1>
          <div className="flex flex-col gap-3">
            <p className="font-serif text-[1.1rem] leading-relaxed text-white/80 font-medium">
              매주 화요일의 사랑연구회
            </p>
            <p className="font-sans text-[9px] tracking-[0.25em] text-white/25 uppercase">2026 / Seoul</p>
          </div>
        </div>
      </section>

      {/* PROJECT SUMMARY */}
      <section className="bg-white px-5 py-16 flex flex-col gap-8">
        <Label text="About the Research" />
        <div className="flex flex-col gap-5">
          <h2 className="font-sans font-black text-[1.5rem] leading-tight tracking-[0.03em] text-black">
            우리는 왜 사랑이 어려울까요?
          </h2>
          <div className="font-serif text-[0.88rem] leading-[2] text-black/65 flex flex-col gap-4">
            <p>사랑을 이야기하다 보면 나의 역사, 결핍, 무의식 ... <span className="whitespace-nowrap">'나 자신'을</span> 만나게 됩니다.</p>
            <p>사랑이 어려운 이유는 우리도 자기 자신을 잘 모르기 때문이에요.</p>
          </div>
        </div>
        <ArrowLink onClick={() => onNavigate("project")}>프로젝트 이야기 읽기 →</ArrowLink>
      </section>

      {/* PROGRAM MENU */}
      <section className="bg-black px-5 py-16 flex flex-col gap-10">
        <div className="flex flex-col gap-4">
          <Label text="Four Tuesdays for Love" invert />
          <h2 className="font-sans font-black text-[2.2rem] leading-[1.05] tracking-[0.04em] text-white">
            매주 화요일의<br />사랑연구회
          </h2>
          <p className="font-sans text-[9px] tracking-[0.25em] text-white/30 uppercase">09.15 — 10.06</p>
        </div>

        <div className="border-t border-white/15">
          {[
            { idx: "01", date: "09.15", title: "관찰 연습" },
            { idx: "02", date: "09.22", title: "〈사랑의 기술〉" },
            { idx: "03", date: "09.29", title: "〈왜 나는 너를 사랑하는가〉" },
            { idx: "04", date: "10.06", title: "각자의 사랑" },
          ].map((item) => (
            <button
              key={item.idx}
              onClick={() => onNavigate("program")}
              className="group w-full flex items-baseline gap-4 py-[14px] border-b border-white/10 text-left px-0 hover:px-1 transition-all"
            >
              <span className="font-sans text-[9px] text-white/20 w-4 shrink-0">{item.idx}</span>
              <span className="font-sans text-[9px] tracking-[0.12em] text-white/25 w-11 shrink-0">{item.date}</span>
              <span className="font-serif text-[0.95rem] text-white/75 group-hover:text-white transition-colors">{item.title}</span>
            </button>
          ))}
          <button
            onClick={() => onNavigate("program")}
            className="group w-full flex items-baseline gap-4 py-[14px] border-b border-white/10 text-left px-0 hover:px-1 transition-all"
          >
            <span className="font-sans text-[9px] text-white/20 w-4 shrink-0">05</span>
            <span className="font-sans text-[9px] tracking-[0.12em] text-white/25 w-11 shrink-0">10.09</span>
            <span className="font-serif text-[0.9rem] text-white/40 group-hover:text-white/60 transition-colors italic">Interactive Performance 〈몸〉</span>
          </button>
        </div>

        <ArrowLink onClick={() => onNavigate("program")} invert>회차별 내용 보기 →</ArrowLink>
      </section>

      {/* WHO WE'RE LOOKING FOR — poster image */}
      <section className="bg-black">
        <img
          src={posterWho}
          alt="이런 사람과 함께하고 싶어요 — 사랑과 자신에 대해 함께 집요하게 연구할 사람을 찾습니다"
          className="w-full"
        />
      </section>

      {/* APPLICATION CTA */}
      <section className="bg-white px-5 py-16 flex flex-col gap-8">
        <div className="flex flex-col gap-4">
          <div className="font-sans text-[0.78rem] leading-[2.2] text-black/40">
            <p>09.15 — 10.06</p>
            <p>매주 화요일 19:00–21:00</p>
            <p>시청역 북창공간 · 10명 내외</p>
            <p>참가비 10,000원</p>
          </div>
        </div>
        {APPLICATIONS_OPEN ? (
          <BlackCTA onClick={() => onNavigate("application")}>참여 신청하기</BlackCTA>
        ) : (
          <BlackCTA onClick={() => {}} disabled>모집이 마감되었습니다</BlackCTA>
        )}
      </section>

      {/* ARCHIVE PREVIEW */}
      <section className="bg-[#F2F2F2] px-5 py-16 flex flex-col gap-8">
        <div className="flex flex-col gap-3">
          <Label text="Field Archive" />
          <h2 className="font-sans font-black text-[2rem] leading-[1.05] tracking-[0.04em] text-black">
            거리에서<br />수집한 사랑들
          </h2>
        </div>
        <div>
          <p className="font-sans text-[9px] tracking-[0.25em] text-black/25 uppercase mb-3">Street Interview / Coming Soon</p>
          <div className="grid grid-cols-3 gap-1.5">
            {[0,1,2].map((i) => (
              <div key={i} className="aspect-square bg-black/5 border border-black/8 flex items-end p-2">
                <span className="font-sans text-[7px] tracking-[0.2em] text-black/15 uppercase">—</span>
              </div>
            ))}
          </div>
        </div>
        <ArrowLink onClick={() => (() => {})()}>Archive →</ArrowLink>
      </section>

      <Footer />
    </div>
  );
}

// ─── Illust ───────────────────────────────────────────────────────────────────
const ILLUST_SRCS = [illust0, illust1, illust2, illust3, illust4, illust5, illust6] as const;

// invert=true → dark bg: filter:invert(1) + mix-blend-mode:screen → white art, transparent bg
// invert=false → light bg: mix-blend-mode:multiply → black art, white areas disappear
function Illust({ idx, className, invert = false }: { idx: number; className?: string; invert?: boolean }) {
  return (
    <img
      src={ILLUST_SRCS[idx]}
      alt=""
      style={{
        mixBlendMode: invert ? "screen" : "multiply",
        filter: invert ? "invert(1)" : undefined,
      }}
      className={`object-contain ${className ?? "w-full"}`}
    />
  );
}

// ─── Project ──────────────────────────────────────────────────────────────────

function ProjectPage({ onNavigate }: { onNavigate: (p: Page) => void }) {
  return (
    <div className="page-transition">

      {/* INTRO */}
      <section className="bg-black px-5 pt-24 pb-14 flex flex-col gap-10">
        <Label text="유쾌한 반란 챠챠챠 6기_윤현지" invert />
        <h1 className="font-sans font-black text-[3rem] leading-[1.05] tracking-[0.04em] text-white">
          Field<br />Research<br />on Love
        </h1>
        <div className="font-serif text-[0.85rem] leading-[2] text-white/55 flex flex-col gap-4 border-t border-white/10 pt-8">
          <p>
            〈Field research on love〉는 사단법인 유쾌한반란 챠챠챠 6기의 지원을 받아 사랑을 연구하는 윤현지의 개인 프로젝트입니다.
          </p>
          <p>
            사랑하고 사랑 받는 일은 무엇일까요?<br />
            사람들의 사랑을 수집하고, 나의 사랑을 관찰하고,<br />
            책과 대화, 몸과 움직임을 통해<br />
            사랑을 행동하는 법을 연구합니다.
          </p>
        </div>
      </section>

      {/* Illust 1 — flower face, right-aligned on black */}
      <div className="bg-black flex justify-end pb-2" style={{ paddingRight: "90px" }}>
        <Illust idx={1} className="w-1/2" invert />
      </div>

      {/* SECTION 01 */}
      <section className="bg-white px-5 py-14 flex flex-col gap-7">
        <Label text="01 / Question" />
        <h2 className="font-sans font-black text-[1.7rem] leading-[1.15] tracking-[0.03em] text-black">
          사랑받는 데는<br />조건이 있다고 믿었어요.
        </h2>
        <div className="font-serif text-[0.88rem] leading-[2] text-black/65 flex flex-col gap-4">
          <p>
            저는 사랑받고 싶었어요.<br />
            누군가 나를 필요로 해주길, 욕망하길 기다렸어요.<br />
            동시에 이는 들켜선 안되는 부끄러운 마음이라 생각했어요.<br />
            어떻게 하면 사랑받을 수 있는가?<br />
            사랑스러워지는가?<br />
            사랑할 만한 대상이 되는 것에는 조건이 있다고, 제게는 그것이 없다고 믿었어요.<br />
            연약하고 고운 사람들이 부러워서<br />
            반대로 단단하고, 진취적이고, 강인한, 유쾌한, 쓸모있는 사람이 되려고 했어요.<br />
            더 화려하게 치장하고, 가진 것을 과장했어요.<br />
            하지만 내가 쓸모있고 특별한 사람이 되는 것과<br />
            사랑받는 일은 좀처럼 가까워지지 않았어요.
          </p>
          <p>그래서 거리로 나가 사람들에게<br />각자가 생각하는 사랑의 조건을 물었습니다.</p>
          <div className="border-l-[1.5px] border-black/15 pl-4 flex flex-col gap-1 text-black/40 italic text-[0.82rem]">
            <p>여유, 존중, 책임,&nbsp;&nbsp;&nbsp;&nbsp;이해, 충성,</p>
            <p>있는 그대로 바라보는 것. 먼저 사랑하는 것.</p>
          </div>
          <p>
            제가 의도했던 '조건' 다운 대답 보다<br />
            이상적인 사랑의 단어들을 말해주셨어요.<br />
            우리는 사랑에 대해 이렇게 잘 아는데,<br />
            왜 행동하지 못하는 걸까요?
          </p>
        </div>
        <div className="border-t border-b border-black/10 py-8">
          <p className="font-serif text-[1.15rem] leading-[1.65] font-medium text-black">
            우리는 종종 '사랑하는 것'은 쉬운 일이고,<br />
            사랑할 대상 또는 사랑받을 올바른 대상을<br />
            발견하기가 어려울 뿐이라고 생각합니다.
          </p>
        </div>
      </section>

      {/* Illust 5 — heart flower, left-aligned on white */}
      <div className="bg-white flex justify-start pt-4 pb-2" style={{ paddingLeft: "64px" }}>
        <Illust idx={5} className="w-1/2" />
      </div>

      {/* SECTION 02 */}
      <section className="bg-[#F2F2F2] px-5 py-14 flex flex-col gap-7">
        <Label text="02 / History" />
        <h2 className="font-sans font-black text-[1.7rem] leading-[1.15] tracking-[0.03em] text-black">
          사랑이 어려운 이유는<br />나의 역사에 있어요.
        </h2>
        <div className="font-serif text-[0.88rem] leading-[2] text-black/65 flex flex-col gap-4">
          <p>사랑을 알고자 하다보면 먼저 나를 만나게 됩니다.</p>
          <p>
            나는 남의 시선을 욕망하는<br />
            평범하고 취약한 인간이라는 사실이 드러나는 것에 대한<br />
            불안, 긴장, 수치심 ...<br />
            이 감정은 나의 가장 깊은 욕망이 억눌리며<br />
            반대로 터져나오는 에너지라는 것을 발견하고<br />
            연구의 방향이 정해졌어요.
          </p>
        </div>
        <div className="flex flex-col gap-4 py-2">
          {["나의 표면 반향 행동 찾기", "나의 욕구와 방어를 만든 핵심 사건 찾기", "수치심을 넘어 행동하기"].map((s) => (
            <p key={s} className="font-sans font-black text-[1.1rem] leading-tight tracking-[0.03em] text-black border-b border-black/10 pb-4">
              {s}
            </p>
          ))}
        </div>
        <div className="border-t border-black/10 pt-5">
          <p className="font-serif text-[1.05rem] leading-[1.7] font-medium text-black">
            사랑이 어려운 이유는<br />
            우리도 자기 자신을 잘 모르기 때문입니다.<br />
            사랑을 연구하는 일은<br />
            나의 역사,<br />
            나의 무의식,<br />
            나의 욕망과 반향,<br />
            나의 수치심을 알아가는 과정입니다.
          </p>
        </div>
      </section>

      {/* Illust 3 — swirl figure, right-aligned on gray */}
      <div className="bg-[#F2F2F2] flex justify-end pr-5 pt-4 pb-2">
        <Illust idx={3} className="w-2/5" />
      </div>

      {/* SECTION 03 — Research Process */}
      <section className="bg-white px-5 py-14 flex flex-col gap-8">
        <Label text="03 / Research Process" />
        <div className="flex flex-col">
          {[
            { label: "STREET INTERVIEW", desc: "거리에서 다양한 사람들의 사랑을 수집합니다." },
            { label: "SELF RESEARCH", desc: "나의 관계 방식, 역사, 결핍과 무의식을 관찰합니다." },
            { label: "FOUR TUESDAYS", desc: "4주 동안 다른 사람들과 사랑을 읽고, 이야기하고, 실험합니다." },
            { label: "INTERACTIVE PERFORMANCE 〈몸〉", desc: "몸에 새겨진 수치심과 대상화, 취약성과 주체성을\n몸으로 연구합니다." },
            { label: "LOVE ACTION ARCHIVE", desc: "우리가 실제로 할 수 있는 '사랑 행동'을 수집하고 기록합니다." },
          ].map((step, i, arr) => (
            <div key={step.label}>
              <div className="py-5 border-t border-black/8 flex flex-col gap-1.5">
                <p className="font-sans text-[8px] tracking-[0.3em] text-black/30 uppercase">{step.label}</p>
                <p className="font-serif text-[0.85rem] leading-[1.85] text-black/60 whitespace-pre-line">{step.desc}</p>
              </div>
              {i < arr.length - 1 && <p className="font-sans text-black/20 text-sm pb-1">↓</p>}
            </div>
          ))}
        </div>
        <div className="border-t border-black/10 pt-6 flex flex-col gap-3">
          <p className="font-serif text-[0.9rem] leading-[1.9] text-black/70">
            <span className="font-medium text-black">4주 동안 발견한 문장들을 모아</span><br />
            <span className="font-medium text-black">〈사랑 행동〉이라는 책으로 엮습니다.</span>
          </p>
          <p className="font-serif text-[0.82rem] leading-[1.9] text-black/45">
            마음속 고민 하나를 떠올리고 아무 페이지나 펼치면,<br />그 순간 내가 해볼 수 있는 하나의 사랑 행동을 만날 수 있는 책.
          </p>
        </div>
      </section>


      {/* ENDING */}
      <section className="bg-black px-5 py-20 flex flex-col gap-10 min-h-[70vh] justify-between">
        <div className="flex flex-col gap-8">
          <p className="font-serif text-[1.2rem] font-light text-white/50">사랑은 무엇일까요?</p>
          <p className="font-serif text-[0.82rem] text-white/30">우리는 매주 화요일에 만나 이야기합니다.</p>
          <h2 className="font-serif font-medium text-[3rem] leading-[1.05] text-white">
            사랑은<br />어떻게<br />행동하나요?
          </h2>
        </div>
        <div className="border-t border-white/10 pt-8">
          {APPLICATIONS_OPEN ? (
            <button
              onClick={() => onNavigate("application")}
              className="font-sans text-[11px] tracking-[0.08em] text-white/60 hover:text-white transition-colors text-left font-bold"
            >
              참여 신청하기 →
            </button>
          ) : (
            <p className="font-sans text-[11px] tracking-[0.08em] text-white/30 text-left font-bold">
              모집이 마감되었습니다
            </p>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}

function ProgramCard({ num, date, title, children, minHeight }: {
  num: string; date: string; title: string; children: React.ReactNode; minHeight?: number;
}) {
  return (
    <div className="relative">
      <div className="absolute top-0 left-0 z-10 flex items-start">
        <span className="font-serif font-medium text-[1.1rem] text-white leading-none pr-0.5">{num}</span>
        <span className="font-serif text-white/30 text-[0.9rem] leading-none mt-0.5">/</span>
      </div>
      <div className="border border-white/30 pt-8 pb-6 px-3 flex flex-col items-center gap-3 font-serif text-[0.72rem] text-white/60" style={minHeight ? { minHeight } : undefined}>
        <p className="font-serif font-medium text-[1.1rem] text-white tracking-[0.04em]">{date}</p>
        <p className="font-serif text-[0.75rem] font-medium text-white text-center leading-[1.55] whitespace-pre-line">
          {title}
        </p>
        <div className="w-6 border-t border-white/20" />
        {children}
      </div>
    </div>
  );
}

// ─── Program ──────────────────────────────────────────────────────────────────

function ProgramPage({ onNavigate }: { onNavigate: (p: Page) => void }) {
  return (
    <div className="page-transition">

      <section className="bg-black px-5 pt-24 pb-14 flex flex-col gap-6">
        <Label text="Four Tuesdays for Love" invert />
        <h1 className="font-sans font-black text-[2.8rem] leading-[1.05] tracking-[0.04em] text-white">
          매주 화요일,<br />우리가 하는 것
        </h1>
        <p className="font-sans text-[9px] tracking-[0.2em] text-white/35 uppercase">
          19:00 – 21:00 · 북창공간
        </p>
        <p className="font-serif text-[0.85rem] leading-[1.9] text-white/50">
          사랑을 어렵게 했던 나의 역사와 무의식을 만나고,
          사랑의 정의와 구체적인 행동을 함께 찾아가는 4주간의 화요 사랑 연구회.
        </p>
      </section>

      {/* Session cards — 2열 그리드 */}
      <section className="bg-black px-4 pb-4">
        <div className="grid grid-cols-2 gap-3 mb-3">
          <ProgramCard num="1" date="9/15" title={"첫 번째 모임,\n관찰 연습"}>
            <p className="text-center leading-[1.8]">
              저는 상대의 몇 단서만으로도 순식간에 라벨을 붙이고 멋대로 대상화하는 나쁜 버릇이 있어요.
            </p>
            <p className="font-medium text-white text-center leading-[1.5] text-[0.7rem]">
              나는 상대를 보고 있을까, 자신의 상상을 보고 있을까?
            </p>
            <p className="text-white/35 text-[0.62rem] leading-[1.8] text-center">
              첫인상 → 관찰 → 해석 → 규정 → 검증
            </p>
          </ProgramCard>

          <ProgramCard num="2" date="9/22" title={"두 번째 모임,\n〈사랑의 기술〉 북토크"}>
            <p className="font-medium text-white text-center leading-[1.5] text-[0.7rem]">
              사랑은 받는 것일까, 하는 것일까?
            </p>
            <p className="text-center leading-[1.8]">
              에리히 프롬의 책을 읽고 관심, 책임, 존중, 이해가 구체적으로 어떤 행동인지 이야기합니다.
            </p>
            <div className="border border-white/30 px-2 py-1.5 text-center text-[0.62rem] leading-[1.6]">
              1인 1권,<br />《사랑의 기술》 도서 제공
            </div>
          </ProgramCard>

          <ProgramCard num="3" date="9/29" title={"세 번째 모임,\n〈왜 나는 너를 사랑하는가〉 북토크"}>
            <p className="text-center leading-[1.8]">
              우리는 왜 특정한 사람을 사랑할까요? 사랑 속의 이상화, 기대, 투사와 오해에 대해 이야기합니다.
            </p>
            <div className="border border-white/30 px-2 py-1.5 text-center text-[0.62rem] leading-[1.6]">
              1인 1권, 도서 제공<br />《왜 나는 너를 사랑하는가》
            </div>
          </ProgramCard>

          <ProgramCard num="4" date="10/6" title={"네 번째 모임,\n각자의 사랑"} minHeight={332}>
            <p className="text-center leading-[1.8]">
              각자의 사랑을 적확하게 설명하는 작품을 가져옵니다. 서로의 경험을 이야기하고, '사랑 행동' 문장을 수집합니다.
            </p>
            <p className="text-center leading-[1.8]">
              이 문장을 모아 <strong className="text-white">'사랑행동'</strong> 책을 만들어요.
            </p>
          </ProgramCard>
        </div>

        <p className="font-sans text-[7px] tracking-[0.28em] text-white/15 uppercase text-center pt-2 pb-4">
          Four Tuesdays for Love &amp; Interactive Performance
        </p>
      </section>

      {/* Interactive Performance — poster */}
      <section className="bg-black px-4 pb-8">
        <img
          src={posterPerformance}
          alt="10/9 인터랙티브 퍼포먼스 〈몸〉"
          className="w-full border border-white/8"
        />
      </section>

      {/* Additional note + CTA */}
      <section className="bg-black px-5 pt-4 pb-16 flex flex-col gap-8">
        <div className="flex flex-col gap-2 text-[0.72rem] leading-[1.9] text-white/30 border-t border-white/10 pt-6">
          <p>· 1~4회차 진행 과정에 따라 세부 내용은 변경될 수 있습니다.</p>
          <p>· 기존 연구회 참가자 외 별도의 참여자를 추가 모집할 예정입니다.</p>
        </div>
        <p className="font-sans text-[8px] tracking-[0.25em] text-white/20 uppercase">
          Four Tuesdays for Love &amp; Interactive Performance
        </p>
        {APPLICATIONS_OPEN ? (
          <WhiteCTA onClick={() => onNavigate("application")}>참여 신청하기</WhiteCTA>
        ) : (
          <WhiteCTA onClick={() => {}} disabled>모집이 마감되었습니다</WhiteCTA>
        )}
      </section>

      <Footer />
    </div>
  );
}

// ─── Application ──────────────────────────────────────────────────────────────

type FormData = {
  displayName: string;
  birthDate: string;
  phone: string;
  instagram: string;
  availableSessions: string[];
  attendanceAgreement: boolean;
  bodyPerformanceAcknowledgement: boolean;
  applicationReason: string;
  definitionOfLove: string;
  loveQuestion: string;
  repeatedPattern: string;
  researchInterest: string;
  communityAgreement: string;
  feeAgreement: boolean;
  privacyAgreement: boolean;
  mediaConsent: string;
  additionalNote: string;
};

const initialForm: FormData = {
  displayName: "", birthDate: "", phone: "", instagram: "",
  availableSessions: [], attendanceAgreement: false, bodyPerformanceAcknowledgement: false,
  applicationReason: "", definitionOfLove: "", loveQuestion: "", repeatedPattern: "",
  researchInterest: "", communityAgreement: "", feeAgreement: false, privacyAgreement: false,
  mediaConsent: "", additionalNote: "",
};

function ApplicationPage({ onComplete }: { onComplete: () => void }) {
  const [form, setForm] = useState<FormData>(initialForm);
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [section, setSection] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  function setField<K extends keyof FormData>(key: K, value: FormData[K]) {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  }

  function toggleSession(val: string) {
    setForm((f) => ({
      ...f,
      availableSessions: f.availableSessions.includes(val)
        ? f.availableSessions.filter((s) => s !== val)
        : [...f.availableSessions, val],
    }));
  }

  function validateSection(s: number): boolean {
    const errs: typeof errors = {};
    if (s === 1) {
      if (!form.displayName.trim()) errs.displayName = "필수 항목입니다.";
      if (!form.birthDate) errs.birthDate = "필수 항목입니다.";
      if (!form.phone.trim()) errs.phone = "필수 항목입니다.";
    }
    if (s === 2) {
      if (form.availableSessions.length === 0) errs.availableSessions = "필수 항목입니다.";
      if (!form.attendanceAgreement) errs.attendanceAgreement = "필수 항목입니다.";
      if (!form.bodyPerformanceAcknowledgement) errs.bodyPerformanceAcknowledgement = "필수 항목입니다.";
    }
    if (s === 3) {
      if (!form.applicationReason.trim()) errs.applicationReason = "필수 항목입니다.";
      if (!form.definitionOfLove.trim()) errs.definitionOfLove = "필수 항목입니다.";
      if (!form.loveQuestion.trim()) errs.loveQuestion = "필수 항목입니다.";
      if (!form.researchInterest.trim()) errs.researchInterest = "필수 항목입니다.";
    }
    if (s === 4) {
      if (!form.communityAgreement) errs.communityAgreement = "필수 항목입니다.";
    }
    if (s === 5) {
      if (!form.feeAgreement) errs.feeAgreement = "필수 항목입니다." as any;
      if (!form.privacyAgreement) errs.privacyAgreement = "필수 항목입니다." as any;
      if (!form.mediaConsent) errs.mediaConsent = "필수 항목입니다.";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function submitApplication() {
    setSubmitting(true);
    setSubmitError(null);
    async function attempt() {
      const res = await fetch("/api/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error || `요청 실패 (${res.status})`);
      }
    }

    try {
      try {
        await attempt();
      } catch (firstError) {
        console.warn("신청서 제출 1차 시도 실패, 재시도합니다:", firstError);
        await new Promise((r) => setTimeout(r, 1000));
        await attempt();
      }
      onComplete();
    } catch (err) {
      console.error("신청서 제출 실패:", err);
      const detail = err instanceof Error ? err.message : "";
      setSubmitError(
        `신청서 제출에 실패했습니다. 잠시 후 다시 시도해주세요.${detail ? ` (${detail})` : ""}`
      );
    } finally {
      setSubmitting(false);
    }
  }

  function next() {
    if (section === 0) { setSection(1); return; }
    if (validateSection(section)) {
      if (section < 5) setSection(section + 1);
      else if (form.communityAgreement !== "disagree") submitApplication();
    }
  }

  function prev() {
    if (section > 0) setSection(section - 1);
  }

  return (
    <div className="page-transition bg-white min-h-screen">
      {/* Progress bar */}
      <div className="fixed top-11 left-0 right-0 z-30 max-w-[440px] mx-auto bg-white border-b border-black/8 px-5 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {section > 0 && (
            <button
              onClick={prev}
              className="font-sans text-[9px] tracking-[0.2em] text-black/40 hover:text-black transition-colors uppercase"
            >
              ← Back
            </button>
          )}
          <p className="font-sans text-[9px] tracking-[0.25em] text-black/30 uppercase">
            Application / {String(section).padStart(2, "0")} — 06
          </p>
        </div>
        <div className="flex gap-0.5">
          {[1,2,3,4,5].map((i) => (
            <div key={i} className={`w-5 h-[1.5px] transition-colors ${i <= section ? "bg-black" : "bg-black/12"}`} />
          ))}
        </div>
      </div>

      <div className="px-5 pt-[115px] pb-28">
        {section === 0 && (
          <div className="flex flex-col gap-8">
            <h1 className="font-sans font-black text-[1.8rem] leading-[1.2] tracking-[0.03em] text-black">
              매주 화요일의<br />사랑연구회 참여 신청
            </h1>
            <p className="font-serif text-[0.85rem] leading-[2] text-black/60">
              사랑을 어렵게 했던 나의 역사와 무의식을 만나고, 사랑의 정의와 구체적인 행동을 함께 찾아가는 4주간의 화요 사랑 연구회입니다.
            </p>
            <div className="border-t border-black/8 pt-5 font-sans text-[0.75rem] leading-[2.2] text-black/35">
              <p>09.15 — 10.06</p>
              <p>매주 화요일 19:00–21:00</p>
              <p>시청역 북창공간 · 10명 내외</p>
              <p>참가비 10,000원</p>
            </div>
            <p className="font-sans text-[0.78rem] text-black/45">
              더 많은 회차에 참여할 수 있는 분을 우선 선발합니다.
            </p>
          </div>
        )}

        {section === 1 && (
          <div className="flex flex-col gap-10">
            <SectionHead label="Section 1" title="기본 정보" />
            <Field label="1. 이름 / 활동명" desc="연구회에서 불리고 싶은 이름을 적어주세요." error={errors.displayName}>
              <AppInput value={form.displayName} onChange={(v) => setField("displayName", v)} placeholder="이름 또는 활동명" />
            </Field>
            <Field label="2. 생년월일" error={errors.birthDate}>
              <AppInput type="date" value={form.birthDate} onChange={(v) => setField("birthDate", v)} />
            </Field>
            <Field label="3. 연락처" error={errors.phone}>
              <AppInput type="tel" value={form.phone} onChange={(v) => setField("phone", v)} placeholder="010-0000-0000" />
            </Field>
            <Field label="4. 인스타그램 ID" optional>
              <AppInput value={form.instagram} onChange={(v) => setField("instagram", v)} placeholder="@________" />
            </Field>
          </div>
        )}

        {section === 2 && (
          <div className="flex flex-col gap-10">
            <SectionHead label="Section 2" title="참여 일정" />
            <Field label="5. 참여 가능한 일정을 모두 선택해주세요." error={errors.availableSessions as string}>
              <div className="border-t border-black/8">
                {[
                  { val: "0915", label: "09.15 (화) / 관찰 연습" },
                  { val: "0922", label: "09.22 (화) / 〈사랑의 기술〉 북토크" },
                  { val: "0929", label: "09.29 (화) / 〈왜 나는 너를 사랑하는가〉 북토크" },
                  { val: "1006", label: "10.06 (화) / 각자의 사랑" },
                  { val: "1009", label: "10.09 / 인터랙티브 퍼포먼스 〈몸〉" },
                ].map((opt) => (
                  <CheckItem
                    key={opt.val}
                    checked={form.availableSessions.includes(opt.val)}
                    onChange={() => toggleSession(opt.val)}
                    label={opt.label}
                  />
                ))}
              </div>
            </Field>

            <div className="border-t border-b border-black/8 py-4">
              <p className="font-sans text-[0.78rem] leading-[1.8] font-medium text-black">
                * 10.09 〈몸〉은 대화 기반의 화요 사랑연구회 1~4회차와 다른<br />인터랙티브 퍼포먼스입니다.
              </p>
            </div>

            <Field label="참여 일정 안내" error={errors.attendanceAgreement as string}>
              <p className="font-serif text-[0.78rem] leading-[1.9] text-black/55 mb-4">
                신청한 회차에 대해서는 당일 노쇼 및 지각을 삼가주세요.<br />
                일부 프로그램에는 사전에 매칭된 파트너와 함께하는 활동이 있어<br />
                한 명의 갑작스러운 불참이나 지각이<br />
                다른 참여자의 활동에 영향을 줄 수 있습니다.
              </p>
              <div className="border-t border-black/8">
                <CheckItem
                  checked={form.attendanceAgreement}
                  onChange={(v) => setField("attendanceAgreement", v)}
                  label="신청한 일정에 성실히 참여하겠습니다."
                />
              </div>
            </Field>

            <div className="border border-black/10 p-5 flex flex-col gap-4">
              <Label text="Interactive Performance" />
              <p className="font-sans font-black text-[1.2rem] tracking-[0.03em] text-black">10.09 〈몸〉</p>
              <p className="font-serif text-[0.78rem] leading-[1.9] text-black/55">
                〈몸〉은 앞선 4회차처럼 대화를 중심으로 진행되는<br />
                프로그램이 아닙니다. 참여자는 신체를 관찰하고, 그리고,<br />
                움직이는 몸과 관계하며 작품에 직접 참여하게 됩니다.
              </p>
              <div className="border-t border-black/8">
                <CheckItem
                  checked={form.bodyPerformanceAcknowledgement}
                  onChange={(v) => setField("bodyPerformanceAcknowledgement", v)}
                  label="확인했습니다."
                  error={errors.bodyPerformanceAcknowledgement as string}
                />
              </div>
            </div>
          </div>
        )}

        {section === 3 && (
          <div className="flex flex-col gap-10">
            <SectionHead label="Section 3" title="당신의 사랑에 관하여" />
            <div className="border-t border-b border-black/8 py-5 flex flex-col gap-3">
              <p className="font-sans font-black text-[0.9rem] tracking-[0.02em] text-black">
                아래 질문의 답변은 참여자를 평가하기 위한 것이 아닙니다.
              </p>
              <p className="font-serif text-[0.78rem] leading-[1.9] text-black/55">
                글을 잘 쓰거나, 특별하고 깊은 이야기를 적어야<br />선정되는 프로그램이 아닙니다.
              </p>
              <p className="font-serif text-[0.78rem] leading-[1.9] text-black/40">
                정답을 찾으려고 하지 않아도 괜찮습니다.<br />아직 잘 모르겠다면 잘 모르겠다고 적어주세요.
              </p>
            </div>
            <Field label="7. 이번 사랑연구회에 신청하게 된 이유를 들려주세요." desc="포스터를 보면서 어떤 문장이나 내용에서 멈춰 읽게 되었나요?" error={errors.applicationReason}>
              <AppTextarea value={form.applicationReason} onChange={(v) => setField("applicationReason", v)} />
            </Field>
            <Field label="8. 지금 당신에게 '사랑'은 무엇인가요?" desc="사전적인 정의보다 지금 내가 생각하고 있는 사랑에 대해 적어주세요." error={errors.definitionOfLove}>
              <AppTextarea value={form.definitionOfLove} onChange={(v) => setField("definitionOfLove", v)} />
            </Field>
            <Field label="9. 요즘 사랑에 관해 가지고 있는 질문이나 고민이 있나요?" desc={"연애에 한정하지 않아도 됩니다. 자기 자신, 친구, 가족과의 관계 등\n자유롭게 이야기해주세요."} error={errors.loveQuestion}>
              <AppTextarea value={form.loveQuestion} onChange={(v) => setField("loveQuestion", v)} />
            </Field>
            <Field label="10. 사랑을 하면서 반복한다고 느끼는 자신의 모습이 있나요?" desc="아직 잘 모르겠다면 '잘 모르겠다'고 적어도 괜찮습니다." optional>
              <AppTextarea value={form.repeatedPattern} onChange={(v) => setField("repeatedPattern", v)} />
            </Field>
            <Field label="11. 이번 사랑연구회에서 가장 궁금하거나 만나보고 싶은 것은 무엇인가요?" error={errors.researchInterest}>
              <AppTextarea value={form.researchInterest} onChange={(v) => setField("researchInterest", v)} />
            </Field>
          </div>
        )}

        {section === 4 && (
          <div className="flex flex-col gap-8">
            <SectionHead label="Section 4" title="함께 연구하기 위한 약속" />
            <Field label="12. 다른 참여자의 이야기를 존중해주세요." error={errors.communityAgreement}>
              <p className="font-serif text-[0.78rem] leading-[1.9] text-black/55 mb-4">
                이 연구회에서는 사랑, 관계, 가족, 결핍, 욕망, 두려움 등<br />
                개인적인 경험과 생각을 이야기하게 될 수 있습니다.<br />
                다른 사람의 경험을 함부로 평가하거나 조롱하지 않고,<br />
                들은 이야기를 당사자의 동의 없이 외부에 전달하지 않습니다.
              </p>
              <p className="font-sans font-black text-[0.78rem] tracking-[0.02em] text-black mb-5">
                이에 동의하지 않는 경우 프로젝트 참여가 어렵습니다.
              </p>
              <div className="border-t border-black/8">
                <RadioItem name="community" value="agree" checked={form.communityAgreement === "agree"} onChange={() => setField("communityAgreement", "agree")} label="위 내용을 확인했으며 동의합니다." />
              </div>
            </Field>
          </div>
        )}

        {section === 5 && (
          <div className="flex flex-col gap-10">
            <SectionHead label="Section 5" title="참가비" />
            <div className="flex flex-col gap-4">
              <p className="font-sans font-black text-[1.5rem] tracking-[0.03em] text-black">참가비 10,000원</p>
              <p className="font-serif text-[0.8rem] leading-[1.85] text-black/50">노쇼 방지를 위한 참가비입니다.</p>
              <div className="border-t border-black/8">
                <CheckItem checked={form.feeAgreement} onChange={(v) => setField("feeAgreement", v)} label="참가비 발생에 동의합니다." error={errors.feeAgreement as string} />
              </div>
            </div>

            <div className="border-t border-black/8 pt-8 flex flex-col gap-4">
              <SectionHead label="Section 6" title="개인정보 및 촬영" />
              <p className="font-serif text-[0.78rem] leading-[1.9] text-black/50">
                프로그램 참여자 선정 및 운영을 위해 이름, 생년월일, 연락처, SNS 계정, 신청서 응답 내용을 수집·이용합니다.
                보관 기간은 프로그램 종료 후 3개월 이내이며, 동의하지 않을 경우 프로그램 신청이 어렵습니다.
              </p>
              <div className="border-t border-black/8">
                <CheckItem checked={form.privacyAgreement} onChange={(v) => setField("privacyAgreement", v)} label="개인정보 수집 및 이용에 동의합니다." error={errors.privacyAgreement as string} />
              </div>
            </div>

            <div className="flex flex-col gap-4 border-t border-black/8 pt-8">
              <p className="font-serif text-[0.78rem] leading-[1.9] text-black/50">
                프로그램 당일 활동 기록을 위해 사진과 영상 촬영이 진행될 수 있으며,
                일부는 <span className="text-black/75">인스타그램 등 SNS 채널에 게시될 수 있습니다.</span>
              </p>
              <div className="border-t border-black/8">
                <RadioItem name="media" value="all" checked={form.mediaConsent === "all"} onChange={() => setField("mediaConsent", "all")} label="촬영 및 SNS 활용 안내를 확인했으며 동의합니다." />
              </div>
              {errors.mediaConsent && <p className="font-sans text-[10px] text-black/40">{errors.mediaConsent}</p>}
            </div>

            <div className="border-t border-black/8 pt-8">
              <Field label="13. 운영진에게 미리 전하고 싶은 이야기" desc="필요한 요청사항이나 운영진이 미리 알아두었으면 하는 내용이 있다면 적어주세요." optional>
                <AppTextarea value={form.additionalNote} onChange={(v) => setField("additionalNote", v)} />
              </Field>
            </div>
          </div>
        )}
      </div>

      {/* Fixed bottom bar */}
      <div className="fixed bottom-0 left-0 right-0 z-30 max-w-[440px] mx-auto bg-white border-t border-black/8 px-5 py-4">
        {submitError && (
          <p className="font-sans text-[10px] text-black/50 pb-2 text-center">{submitError}</p>
        )}
        <BlackCTA
          onClick={next}
          disabled={submitting || (section === 5 && form.communityAgreement === "disagree")}
        >
          {submitting ? "제출 중..." : section === 0 ? "신청 시작하기" : section < 5 ? "다음으로" : "신청 제출하기"}
        </BlackCTA>
      </div>
    </div>
  );
}

// Form sub-components
function SectionHead({ label, title }: { label: string; title: string }) {
  return (
    <div className="flex flex-col gap-2 pb-4 border-b border-black/8">
      <Label text={label} />
      <h2 className="font-sans font-black text-[1.4rem] tracking-[0.03em] text-black">{title}</h2>
    </div>
  );
}

function Field({ label, desc, error, optional, children }: {
  label: string; desc?: string; error?: string; optional?: boolean; children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-baseline gap-2">
        <p className="font-sans text-[0.82rem] font-medium text-black">{label}</p>
        {optional && <span className="font-sans text-[9px] text-black/25">선택</span>}
      </div>
      {desc && <p className="font-serif text-[0.72rem] leading-[1.8] text-black/40 whitespace-pre-line">{desc}</p>}
      {children}
      {error && <p className="font-sans text-[10px] text-black/50">{error}</p>}
    </div>
  );
}

function AppInput({ value, onChange, placeholder, type = "text" }: {
  value: string; onChange: (v: string) => void; placeholder?: string; type?: string;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full border-b border-black/15 py-3 font-sans text-[0.88rem] text-black placeholder:text-black/18 focus:border-black transition-colors bg-transparent"
    />
  );
}

function AppTextarea({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      rows={5}
      className="w-full border-b border-black/15 py-3 font-sans text-[0.88rem] text-black placeholder:text-black/18 focus:border-black transition-colors bg-transparent resize-none leading-[1.85]"
    />
  );
}

function CheckItem({ checked, onChange, label, error }: {
  checked: boolean; onChange: (v: boolean) => void; label: string; error?: string;
}) {
  return (
    <div>
      <label
        onClick={() => onChange(!checked)}
        className="flex items-start gap-3 py-[14px] border-b border-black/8 cursor-pointer"
      >
        <div
          className={`w-[14px] h-[14px] shrink-0 mt-0.5 border transition-colors ${checked ? "border-black bg-black" : "border-black/25 bg-transparent"}`}
        />
        <span className="font-serif text-[0.8rem] leading-[1.75] text-black/70">{label}</span>
      </label>
      {error && <p className="font-sans text-[10px] text-black/40 pt-1">{error}</p>}
    </div>
  );
}

function RadioItem({ name, value, checked, onChange, label }: {
  name: string; value: string; checked: boolean; onChange: () => void; label: string;
}) {
  return (
    <label onClick={onChange} className="flex items-start gap-3 py-[14px] border-b border-black/8 cursor-pointer">
      <div
        className={`w-[14px] h-[14px] shrink-0 mt-0.5 rounded-full border transition-colors flex items-center justify-center ${checked ? "border-black" : "border-black/25"}`}
      >
        {checked && <div className="w-[6px] h-[6px] rounded-full bg-black" />}
      </div>
      <span className="font-serif text-[0.8rem] leading-[1.75] text-black/70">{label}</span>
    </label>
  );
}

// ─── Application Closed ─────────────────────────────────────────────────────────

function ApplicationClosedPage({ onNavigate }: { onNavigate: (p: Page) => void }) {
  return (
    <div className="page-transition bg-black min-h-screen px-5 pt-24 pb-20 flex flex-col justify-between">
      <div className="flex flex-col gap-10 pt-8">
        <Label text="Application Closed" invert />
        <h1 className="font-sans font-black text-[2.4rem] leading-[1.1] tracking-[0.04em] text-white">
          모집이<br />마감되었습니다.
        </h1>
        <p className="font-serif text-[0.88rem] leading-[2] text-white/50 border-t border-white/10 pt-8">
          매주 화요일의 사랑연구회에 관심 가져주셔서 감사합니다.
        </p>
      </div>
      <div className="border-t border-white/10 pt-8">
        <ArrowLink onClick={() => onNavigate("home")} invert>HOME으로 돌아가기 →</ArrowLink>
      </div>
    </div>
  );
}

// ─── Complete ─────────────────────────────────────────────────────────────────

function CompletePage({ onNavigate }: { onNavigate: (p: Page) => void }) {
  return (
    <div className="page-transition bg-black min-h-screen px-5 pt-24 pb-20 flex flex-col justify-between">
      <div className="flex flex-col gap-10 pt-8">
        <Label text="Application Complete" invert />
        <h1 className="font-sans font-black text-[2.8rem] leading-[1.05] tracking-[0.04em] text-white">
          신청이<br />완료되었습니다.
        </h1>
        <div className="font-serif text-[0.88rem] leading-[2] text-white/50 flex flex-col gap-4 border-t border-white/10 pt-8">
          <p>사랑에 대해 함께 질문해주셔서 감사합니다.</p>
          <p>
            신청 내용을 확인한 후<br />
            <span className="text-white/85 font-medium">9월 8일 참가자에게 개별 연락드립니다.</span>
          </p>
        </div>
      </div>
      <div className="border-t border-white/10 pt-8">
        <ArrowLink onClick={() => onNavigate("home")} invert>HOME으로 돌아가기 →</ArrowLink>
      </div>
    </div>
  );
}

// ─── Archive ──────────────────────────────────────────────────────────────────

function ArchivePage() {
  return (
    <div className="page-transition">
      <section className="bg-black px-5 pt-24 pb-14 flex flex-col gap-6">
        <Label text="Field Archive" invert />
        <h1 className="font-sans font-black text-[2.8rem] leading-[1.05] tracking-[0.04em] text-white">
          거리에서<br />수집한 사랑들
        </h1>
        <p className="font-serif text-[0.85rem] leading-[1.9] text-white/45">
          야외 인터뷰를 통해 다양한 사람들이 말하는 사랑을 수집해왔습니다. 사진, 영상, 목소리와 문장으로 남은 각자의 사랑을 이곳에서 만나보세요.
        </p>
      </section>

      <section className="bg-white px-5 py-10 flex flex-col gap-8">
        <div className="flex gap-3 flex-wrap">
          {["PHOTO", "VIDEO", "QUOTE", "FIELD NOTE"].map((t) => (
            <span key={t} className="font-sans text-[8px] tracking-[0.25em] text-black/25 border border-black/12 px-3 py-1.5">
              {t}
            </span>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-1.5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className={`border border-black/8 bg-[#F2F2F2] flex flex-col items-start justify-end p-3 ${i === 0 ? "col-span-2 aspect-[2/1]" : "aspect-square"}`}
            >
              <span className="font-sans text-[7px] tracking-[0.2em] text-black/15 uppercase">
                {["PHOTO", "VIDEO", "QUOTE", "FIELD NOTE", "PHOTO", "FIELD NOTE"][i]}
              </span>
            </div>
          ))}
        </div>
        <div className="border-t border-black/8 pt-6 text-center">
          <p className="font-sans text-[9px] tracking-[0.3em] text-black/20 uppercase">
            Archive in Progress
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────────

function Footer() {
  return (
    <footer className="bg-black px-5 py-10 flex flex-col gap-3 border-t border-white/8">
      <p className="font-sans text-[10px] tracking-[0.08em] text-white/35">Field research on love</p>
      <p className="font-sans text-[9px] leading-[2] text-white/15">
        Field Research on Love · 2026 · Seoul<br />
        사단법인 유쾌한반란 챠챠챠 6기 지원
      </p>
    </footer>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────

export default function App() {
  const [page, setPage] = useState<Page>("landing");

  const navigate = useCallback((p: Page) => {
    setPage(p);
    window.scrollTo({ top: 0, behavior: "instant" });
  }, []);

  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-[440px] mx-auto relative bg-black min-h-screen">
        <Header onNavigate={navigate} currentPage={page} />
        <main>
          {page === "landing" && <LandingPage onEnter={() => navigate("home")} />}
          {page === "home" && <HomePage onNavigate={navigate} />}
          {page === "project" && <ProjectPage onNavigate={navigate} />}
          {page === "program" && <ProgramPage onNavigate={navigate} />}
          {page === "application" && (
            APPLICATIONS_OPEN ? (
              <ApplicationPage onComplete={() => navigate("complete")} />
            ) : (
              <ApplicationClosedPage onNavigate={navigate} />
            )
          )}
          {page === "complete" && <CompletePage onNavigate={navigate} />}
          {page === "archive" && <ArchivePage />}
        </main>
      </div>
    </div>
  );
}
