/**
 * 내장 프리셋 "에코": 유리 질감의 메신저형 테마 (접두사 rgl).
 * 사용자가 RisuAI에서 쓰던 Custom HTML / Custom CSS를 그대로 옮긴 것이다. 내용을 고치지 않는다.
 */
export const ECHO_PRESET = {
  id: 'preset_echo_glass',
  name: '에코 (글래스 메신저)',
  description: '프로필 사이를 가득 채우는 유리 말풍선. 캐릭터는 차가운 유리, 나는 호박빛 유리. PC에서는 마우스를 올린 말풍선만 선명해지는 감상 모드.',
  guiHTML: `<div class="rgl {{#when::{{role}}::is::char}}rgl--char{{:else}}rgl--user{{/when}}">
  <div class="rgl__row">
    <div class="rgl__avatar">
      <div class="rgl__portrait"><risuicon></risuicon></div>
    </div>
    <div class="rgl__bubble">
      <div class="rgl__glass"></div>
      <div class="rgl__head">
        <div class="rgl__name">{{#when::{{role}}::is::char}}{{char}}{{:else}}{{user}}{{/when}}</div>
        <div class="rgl__tools">
          <div class="rgl__info"><risugeninfo></risugeninfo></div>
          <div class="rgl__actions"><risubuttons></risubuttons></div>
        </div>
      </div>
      <div class="rgl__scroll">
        <div class="rgl__content"><risutextbox></risutextbox></div>
      </div>
    </div>
  </div>
</div>`,
  customCSS: `@import url("https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css");

/* Common chat-theme wrapper baseline. */
.risu-chat > div {
    padding: .5rem 1.25rem;
    margin: auto;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-wrap: wrap; /* 플러그인이 끼워 넣은 요소는 말풍선 옆에 끼이지 않고 아랫줄로 */
    width: 100%;
}

.risu-chat > div > div {
    width: 100%;
    margin: auto;
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
}

/* ===== Glass messenger theme (rgl) =====
   본문 조상에는 backdrop-filter·filter·transform·mask·contain·container-type·z-index를 두지 않는다.
   (카드 HTML의 position:fixed 패널·버튼이 말풍선에 갇히지 않게) */
.rgl {
  /* ─── 조절값 ─── */
  --rgl-room-width: 92rem;          /* 대화방 전체 최대 폭 */
  --rgl-font-size: 16px;            /* 본문 글자 크기 */
  --rgl-line-height: 1.8;
  /* 말풍선 스크롤 최대 높이: 화면 높이에서 이름·버튼·입력창 몫을 뺀 만큼 → 말풍선 하나가 한 화면에 다 들어옴 */
  --rgl-scroll-height: clamp(16rem, calc(100vh - 18rem), 44rem);
  --rgl-scroll-height-narrow: clamp(14rem, calc(100vh - 15rem), 34rem); /* 좁은 화면일 때 */
  --rgl-avatar-size: 3.6rem;
  --rgl-gap: .8rem;                 /* 프로필과 말풍선 사이 */
  --rgl-zoom-width: 15rem;          /* 프로필 확대 시 폭 (세로 3:4) */
  --rgl-avatar-position: center 18%;
  --rgl-user-name: none;            /* 내 이름 표시: none → block */
  --rgl-blur: 10px;                 /* 클수록 뒤가 뿌옇게 */

  /* 감상 모드: 마우스가 말풍선 밖에 있을 때 (PC만). 1이면 끔 */
  --rgl-idle-content: .3;           /* 내용물 전체(글자·카드 UI·이미지) 진하기 0~1 */

  /* ─── 캐릭터: 차가운 연기 유리 ─── */
  --rgl-tint: 158, 205, 255;        /* 테두리·강조 계열 RGB */
  --rgl-bubble-bg:
    radial-gradient(120% 80% at 0% 0%, rgba(255, 255, 255, .13), transparent 55%),
    linear-gradient(160deg, rgba(255, 255, 255, .07), rgba(255, 255, 255, .02) 70%),
    rgba(12, 15, 28, .26);
  --rgl-ink: #eceff6;
  --rgl-strong: #ffffff;
  --rgl-muted: #b3bacb;
  --rgl-quote: #ffd8ad;
  --rgl-quote-soft: #d5dbe8;
  --rgl-code-ink: #e6eaf4;
  --rgl-code-bg: rgba(6, 8, 18, .38);
  --rgl-line: rgba(255, 255, 255, .12);

  /* ─── 공통 ─── */
  --rgl-edge: rgba(255, 255, 255, .17);
  --rgl-highlight: rgba(255, 255, 255, .3);
  --rgl-chip-bg: rgba(14, 17, 30, .22);
  --rgl-chip-edge: rgba(255, 255, 255, .14);
  --rgl-label: #eef1f8;
  --rgl-label-dim: rgba(226, 231, 242, .66);
  --rgl-shadow: 0 14px 34px -14px rgba(0, 0, 0, .55), 0 2px 8px rgba(0, 0, 0, .14);
  --rgl-name-size: 13px;
  --rgl-code-size: calc(var(--rgl-font-size) * .88);

  --rgl-font-body: "Pretendard Variable", "Pretendard", "Noto Sans KR", -apple-system, "Segoe UI", sans-serif;
  --rgl-font-code: "JetBrains Mono", "D2Coding", ui-monospace, Consolas, monospace;

  /* Risu 기본 글자색·폰트 연결 */
  --risu-font-family: var(--rgl-font-body);
  --FontColorStandard: var(--rgl-ink);
  --FontColorBold: var(--rgl-strong);
  --FontColorItalic: var(--rgl-muted);
  --FontColorItalicBold: var(--rgl-quote-soft);
  --FontColorQuote1: var(--rgl-quote-soft);
  --FontColorQuote2: var(--rgl-quote);

  position: relative;
  width: 100%;
  max-width: var(--rgl-room-width);
  min-width: 0;
  margin: .55rem auto;
  color: var(--rgl-ink);
  font-family: var(--rgl-font-body);
  font-size: var(--rgl-font-size);
  line-height: var(--rgl-line-height);
  letter-spacing: -.005em;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* ─── 나: 따뜻한 호박빛 유리 ─── */
.rgl--user {
  --rgl-tint: 255, 214, 120;
  --rgl-bubble-bg:
    radial-gradient(120% 80% at 100% 0%, rgba(255, 236, 170, .2), transparent 55%),
    linear-gradient(200deg, rgba(255, 222, 120, .12), rgba(255, 200, 80, .03) 70%),
    rgba(26, 20, 6, .24);
  --rgl-ink: #fbf6ea;
  --rgl-strong: #fffdf6;
  --rgl-muted: #d9cfb6;
  --rgl-quote: #ffe7a6;
  --rgl-quote-soft: #ece2c8;
  --rgl-code-ink: #fbf3de;
  --rgl-code-bg: rgba(22, 16, 0, .34);
  --rgl-line: rgba(255, 236, 180, .16);
  --rgl-edge: rgba(255, 232, 160, .24);
  --rgl-highlight: rgba(255, 240, 200, .34);
}

.rgl, .rgl *, .rgl *::before, .rgl *::after { box-sizing: border-box; }
.rgl ::selection { background: rgba(var(--rgl-tint), .32); color: inherit; }

.rgl__row {
  display: flex;
  align-items: flex-start;
  gap: var(--rgl-gap);
  width: 100%;
  min-width: 0;
}
.rgl--user .rgl__row { flex-direction: row-reverse; }

/* ─── 프로필 사진: 자리만 차지하는 틀 + 그 위에 떠서 커지는 초상 ─── */
.rgl__avatar {
  position: relative;
  flex: 0 0 var(--rgl-avatar-size);
  width: var(--rgl-avatar-size);
  height: var(--rgl-avatar-size);
  cursor: zoom-in;
}
.rgl__portrait {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  padding: 2px;
  border-radius: 1.3rem;
  background:
    linear-gradient(150deg, rgba(var(--rgl-tint), .75), rgba(255, 255, 255, .12) 55%, rgba(var(--rgl-tint), .35));
  box-shadow: var(--rgl-shadow);
  transition:
    width .28s cubic-bezier(.2, .8, .2, 1),
    height .28s cubic-bezier(.2, .8, .2, 1),
    border-radius .28s ease,
    box-shadow .28s ease;
}
.rgl--user .rgl__portrait { left: auto; right: 0; }
.rgl__portrait > * {
  width: 100% !important;
  height: 100% !important;
  min-width: 0 !important;
  min-height: 0 !important;
  background-color: rgba(12, 15, 28, .5) !important;
  background-size: cover !important;
  background-position: var(--rgl-avatar-position) !important;
  border: 0 !important;
  border-radius: calc(1.3rem - 2px) !important;
  overflow: hidden;
}
/* 마우스를 올리거나(휴대폰은 탭) 확대: 세로 초상 카드로 펼쳐짐 */
.rgl__avatar:hover .rgl__portrait,
.rgl__avatar:active .rgl__portrait {
  z-index: 40;
  width: var(--rgl-zoom-width);
  height: calc(var(--rgl-zoom-width) * 4 / 3);
  border-radius: 1.4rem;
  box-shadow: 0 24px 60px -12px rgba(0, 0, 0, .7), 0 0 0 1px rgba(var(--rgl-tint), .35);
  transition-delay: .12s; /* 스쳐 지나갈 때는 열리지 않게 */
}
.rgl__avatar:hover .rgl__portrait > *,
.rgl__avatar:active .rgl__portrait > * {
  border-radius: calc(1.4rem - 2px) !important;
}

/* ─── 말풍선: 양쪽 프로필 사이 전체 폭. 유리는 본문과 형제인 레이어에만 ─── */
.rgl__bubble {
  position: relative;
  flex: 1 1 0;
  min-width: 0;
  padding: .55rem .55rem .85rem 1.15rem;
  border-radius: .35rem 1.35rem 1.35rem 1.35rem;
}
/* 반대편 프로필 자리만큼 비워 위아래 말풍선의 양 끝을 맞춘다 */
.rgl--char .rgl__bubble { margin-right: calc(var(--rgl-avatar-size) + var(--rgl-gap)); }
.rgl--user .rgl__bubble {
  margin-left: calc(var(--rgl-avatar-size) + var(--rgl-gap));
  border-radius: 1.35rem .35rem 1.35rem 1.35rem;
}

.rgl__glass {
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: var(--rgl-bubble-bg);
  border: 1px solid var(--rgl-edge);
  box-shadow:
    var(--rgl-shadow),
    inset 0 1px 0 var(--rgl-highlight),
    inset 0 0 0 1px rgba(255, 255, 255, .03);
  -webkit-backdrop-filter: blur(var(--rgl-blur));
  backdrop-filter: blur(var(--rgl-blur));
  pointer-events: none;
}
/* 역할 색이 살짝 스미는 테두리 빛 (본문과 무관한 장식 레이어) */
.rgl__glass::after {
  content: "";
  position: absolute;
  inset: -1px;
  border-radius: inherit;
  padding: 1px;
  background: linear-gradient(140deg, rgba(var(--rgl-tint), .55), transparent 35%, transparent 70%, rgba(var(--rgl-tint), .25));
  -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
  -webkit-mask-composite: xor;
  mask: linear-gradient(#000 0 0) content-box exclude, linear-gradient(#000 0 0);
  pointer-events: none;
}

/* ─── 말풍선 머리: 이름 · 생성 정보 · 버튼 (말풍선과 한 몸) ─── */
.rgl__head {
  --risu-theme-textcolor2: var(--rgl-label-dim);
  position: relative;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: .25rem 1rem;
  min-height: 2.3rem;
  margin: 0 .6rem .6rem 0;
  padding-bottom: .45rem;
  border-bottom: 1px solid var(--rgl-line);
  font-size: 12px;
  line-height: 1.3;
  color: var(--rgl-label-dim);
}
.rgl--user .rgl__head { flex-direction: row-reverse; }

.rgl__name {
  display: inline-flex;
  align-items: center;
  gap: .45rem;
  min-width: 0;
  max-width: 100%;
  color: var(--rgl-label);
  font-size: var(--rgl-name-size);
  font-weight: 600;
  letter-spacing: .01em;
  overflow-wrap: anywhere;
}
.rgl__name::before {
  content: "";
  flex: none;
  width: .38rem;
  height: .38rem;
  border-radius: 50%;
  background: rgb(var(--rgl-tint));
  box-shadow: 0 0 8px rgba(var(--rgl-tint), .8);
}
.rgl--user .rgl__name { display: var(--rgl-user-name); }

.rgl__tools {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: flex-end;
  gap: .2rem .6rem;
  min-width: 0;
  margin-left: auto;
  transition: opacity .2s ease;
}
.rgl--user .rgl__tools { flex-direction: row-reverse; margin-left: 0; margin-right: auto; }
.rgl__info { flex: 0 1 auto; min-width: 0; max-width: 100%; letter-spacing: .01em; }
.rgl__info:empty { display: none; }
.rgl__info > div { flex-wrap: wrap; min-width: 0; gap: .2rem; }
.rgl__actions { flex: 0 0 auto; max-width: 100%; }
.rgl__actions > div,
.rgl__actions > div > div {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: flex-end;
  gap: .05rem;
}
/* 둥근 아이콘 모양은 Risu 기본 버튼에만. 플러그인이 넣은 버튼은 자기 모양 그대로 둔다 */
.rgl__info button.transition-all,
.rgl__actions button[class*="button-icon-"] {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 auto;
  min-width: 1.95rem;
  min-height: 1.95rem;
  padding: .3rem;
  border-radius: 999px;
  transition: background-color .15s ease, color .15s ease;
}
.rgl__info button.transition-all:hover,
.rgl__actions button[class*="button-icon-"]:hover {
  background: rgba(var(--rgl-tint), .16);
  color: var(--rgl-label);
}
@media (hover: hover) {
  .rgl__tools { opacity: .5; }
  .rgl__bubble:hover .rgl__tools, .rgl__tools:focus-within { opacity: 1; }
}

/* ─── 말풍선 안 스크롤 (z-index 없이 위치 지정만) ─── */
.rgl__scroll {
  position: relative;
  max-height: var(--rgl-scroll-height);
  overflow-y: auto;
  overflow-x: hidden;
  padding-right: .6rem;
  scrollbar-width: thin;
  scrollbar-color: rgba(var(--rgl-tint), .35) transparent;
}
.rgl__scroll::-webkit-scrollbar { width: 6px; }
.rgl__scroll::-webkit-scrollbar-track { background: transparent; margin: .4rem 0; }
.rgl__scroll::-webkit-scrollbar-thumb {
  background: rgba(var(--rgl-tint), .3);
  border-radius: 6px;
}
.rgl__scroll:hover::-webkit-scrollbar-thumb { background: rgba(var(--rgl-tint), .55); }

@supports (height: 100dvh) {
  .rgl {
    --rgl-scroll-height: clamp(16rem, calc(100dvh - 18rem), 44rem);
    --rgl-scroll-height-narrow: clamp(14rem, calc(100dvh - 15rem), 34rem);
  }
}

/* ─── 본문 ─── */
.rgl__content {
  min-width: 0;
  color: var(--rgl-ink);
  word-break: keep-all;
  overflow-wrap: break-word; /* anywhere는 카드 UI 버튼의 최소 폭을 무너뜨림 */
  text-wrap: pretty;
}
.rgl__content .chattext {
  --tw-prose-code: var(--rgl-code-ink);
  --tw-prose-pre-code: var(--rgl-code-ink);
  --tw-prose-pre-bg: var(--rgl-code-bg);
  color: var(--rgl-ink);
  font-size: var(--rgl-font-size) !important;
  line-height: var(--rgl-line-height) !important;
}

/* 본문 Markdown 기본값: :where()로 우선순위를 낮춰 카드 자체 HTML 스타일이 이기게 한다 */
.rgl__content :where(p, li, td, th, blockquote) {
  font-size: var(--rgl-font-size);
  line-height: var(--rgl-line-height);
}
.rgl__content :where(p) { margin: 0 0 .95em; }
.rgl__content :where(p:last-child) { margin-bottom: 0; }
.rgl__content :where(h1, h2, h3, h4, h5, h6) {
  margin: 1.4em 0 .5em;
  color: var(--rgl-strong);
  font-weight: 700;
  letter-spacing: -.015em;
  line-height: 1.35;
}
.rgl__content :where(h1, h2, h3, h4, h5, h6):where(:first-child) { margin-top: .15em; }
.rgl__content :where(h1) { font-size: calc(var(--rgl-font-size) * 1.5); }
.rgl__content :where(h2) { font-size: calc(var(--rgl-font-size) * 1.3); }
.rgl__content :where(h3) { font-size: calc(var(--rgl-font-size) * 1.14); }
.rgl__content :where(h4, h5, h6) { font-size: var(--rgl-font-size); color: var(--rgl-muted); }
.rgl__content :where(strong) { font-weight: 700; color: var(--rgl-strong); }
/* 한글은 기울임 글꼴이 없어 가짜 기울임이 생기므로 색으로만 구분 */
.rgl__content :where(em) { font-style: normal; color: var(--rgl-muted); }

/* 대사(큰따옴표)는 따뜻하고 살짝 굵게, 작은따옴표는 은은하게 */
.rgl__content mark[risu-mark="quote2"],
.rgl__content mark[risu-mark="blockquote2"] {
  color: var(--rgl-quote);
  background: transparent;
  font-weight: 500;
}
.rgl__content mark[risu-mark="quote1"],
.rgl__content mark[risu-mark="blockquote1"] {
  color: var(--rgl-quote-soft);
  background: transparent;
}
.rgl__content :where(blockquote) {
  margin: 1em 0;
  padding: .55em 1em;
  border-left: 2px solid rgba(var(--rgl-tint), .7);
  border-radius: 0 .7rem .7rem 0;
  background: rgba(var(--rgl-tint), .07);
  color: var(--rgl-quote-soft);
}
.rgl__content :where(ul, ol) { margin: .8em 0; padding-left: 1.35em; }
.rgl__content :where(li) { margin: .25em 0; padding-left: .15em; color: var(--rgl-ink); }
.rgl__content :where(li)::marker { color: rgba(var(--rgl-tint), .85); }
.rgl__content :where(a) {
  color: rgb(var(--rgl-tint));
  text-decoration: underline;
  text-decoration-color: rgba(var(--rgl-tint), .45);
  text-underline-offset: 3px;
}
.rgl__content :where(a:hover) { text-decoration-color: currentColor; }
.rgl__content :where(hr) {
  height: 1px;
  margin: 1.6em 0;
  border: 0;
  background: linear-gradient(90deg, transparent, rgba(var(--rgl-tint), .45), transparent);
}
.rgl__content :where(code) {
  --risu-font-family: var(--rgl-font-code);
  padding: .12em .4em;
  border-radius: .35em;
  color: var(--rgl-code-ink);
  background: var(--rgl-code-bg);
  font-family: var(--rgl-font-code);
  font-size: var(--rgl-code-size);
  line-height: 1.55;
  text-shadow: none;
}
.rgl__content :where(pre) {
  max-width: 100%;
  overflow-x: auto;
  margin: 1em 0;
  padding: .9em 1.05em;
  border-radius: .8rem;
  border: 1px solid var(--rgl-line);
  color: var(--rgl-code-ink);
  background: var(--rgl-code-bg);
  font-size: var(--rgl-code-size);
  line-height: 1.55;
}
.rgl__content :where(pre code) {
  padding: 0;
  color: inherit;
  background: transparent;
  white-space: pre;
  overflow-wrap: normal;
}
.rgl__content :where(table) {
  display: block;
  max-width: 100%;
  overflow-x: auto;
  border-collapse: collapse;
  margin: 1em 0;
}
.rgl__content :where(th, td) {
  color: var(--rgl-ink);
  padding: .5em .8em;
  border-bottom: 1px solid var(--rgl-line);
  text-align: left;
  vertical-align: top;
}
.rgl__content :where(th) {
  color: var(--rgl-strong);
  font-weight: 600;
  background: rgba(var(--rgl-tint), .07);
}
.rgl__content :where(img) { max-width: 100%; border-radius: .7rem; }
.rgl__content textarea.message-edit-area {
  width: 100%;
  max-width: 100%;
  min-width: 0;
  padding: .7rem .8rem;
  border-radius: .8rem;
  border: 1px solid var(--rgl-line);
  color: var(--rgl-ink) !important;
  background: var(--rgl-code-bg) !important;
  font: inherit;
  font-size: var(--rgl-font-size) !important;
  line-height: var(--rgl-line-height) !important;
  text-shadow: none;
  transition: border-color .15s ease, box-shadow .15s ease;
}
.rgl__content textarea.message-edit-area:focus {
  outline: none;
  border-color: rgba(var(--rgl-tint), .6);
  box-shadow: 0 0 0 3px rgba(var(--rgl-tint), .16);
}

.rgl a:focus-visible, .rgl button:focus-visible, .rgl textarea:focus-visible {
  outline: 2px solid rgb(var(--rgl-tint));
  outline-offset: 2px;
}

/* ─── 감상 모드: 마우스가 말풍선 밖이면 유리를 걷고 내용물 전체를 흐리게 ───
   애니메이션 없이 즉시 전환 (서서히 바뀌면 큰 본문에서 매 프레임 다시 그려 렉이 생김).
   카드가 화면 가장자리에 띄운 버튼·패널도 말풍선의 후손이라, 거기에 마우스를 올려도 선명해진다. */
@media (hover: hover) and (pointer: fine) {
  /* 숨은 유리는 아예 그리지 않아 흐림 계산 비용도 없앤다 */
  .rgl__glass { visibility: hidden; }
  /* 항상 별도 레이어로 두어 진하기 전환을 다시 그리기 없이 처리 */
  .rgl__head, .rgl__scroll { opacity: var(--rgl-idle-content); will-change: opacity; }

  .rgl__bubble:hover > .rgl__glass,
  .rgl__bubble:focus-within > .rgl__glass { visibility: visible; }
  .rgl__bubble:hover > .rgl__head,
  .rgl__bubble:hover > .rgl__scroll,
  .rgl__bubble:focus-within > .rgl__head,
  .rgl__bubble:focus-within > .rgl__scroll { opacity: 1; }
}

/* ─── 좁은 화면 ─── */
@media (max-width: 640px) {
  .risu-chat > div { padding: .35rem .6rem; }
  .rgl {
    margin: .4rem auto;
    --rgl-line-height: 1.75;
    --rgl-avatar-size: 2.75rem;
    --rgl-gap: .5rem;
    --rgl-zoom-width: min(13rem, 62vw);
  }
  /* 좁은 화면에서는 반대편 여백을 없애 본문 폭 확보 */
  .rgl--char .rgl__bubble { margin-right: 0; }
  .rgl--user .rgl__bubble { margin-left: 0; }
  .rgl__bubble { padding: .5rem .4rem .75rem .9rem; }
  .rgl__head { margin-right: .45rem; }
  .rgl__scroll { max-height: var(--rgl-scroll-height-narrow); padding-right: .45rem; }
}

/* 투명도 줄이기 설정을 켠 사용자 */
@media (prefers-reduced-transparency: reduce) {
  .rgl { --rgl-bubble-bg: rgba(18, 21, 36, .9); --rgl-idle-content: 1; }
  .rgl__glass { visibility: visible !important; }
  .rgl--user { --rgl-bubble-bg: rgba(44, 36, 14, .9); }
}

@media (prefers-reduced-motion: reduce) {
  .rgl__tools, .rgl__portrait, .rgl__info button.transition-all, .rgl__actions button[class*="button-icon-"],
  .rgl__content textarea.message-edit-area { transition: none; }
}

@supports not ((backdrop-filter: blur(1px)) or (-webkit-backdrop-filter: blur(1px))) {
  .rgl { --rgl-bubble-bg: rgba(18, 21, 36, .86); }
  .rgl--user { --rgl-bubble-bg: rgba(44, 36, 14, .86); }
}
`,
  regexRules: [],
};
