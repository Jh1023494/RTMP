/**
 * 대상별 테마 분류(패밀리)와 변주.
 *
 * 분류마다 구조(HTML과 배치 CSS)는 하나이고, 변주는 CSS 맨 아래 "배색과 소재" 블록만 다르다.
 * 같은 분류의 변주끼리는 그 블록만 바꿔 끼우면 서로 오갈 수 있다.
 * HTML·CSS 안의 {p}는 분류 접두사로 바뀐다.
 */

const FONT = {
    pretendard:
        '@import url("https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css");',
    serif: '@import url("https://fonts.googleapis.com/css2?family=Noto+Serif+KR:wght@400;600;700&display=swap");',
    letter:
        '@import url("https://fonts.googleapis.com/css2?family=Gowun+Batang:wght@400;700&family=Nanum+Pen+Script&display=swap");',
    sf: '@import url("https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;600&display=swap");',
    noir: '@import url("https://fonts.googleapis.com/css2?family=Special+Elite&family=Nanum+Myeongjo:wght@400;700&display=swap");',
    oriental: '@import url("https://fonts.googleapis.com/css2?family=Song+Myung&family=Noto+Serif+KR:wght@400;600&display=swap");',
};

const SANS = '"Pretendard Variable", "Pretendard", "Noto Sans KR", -apple-system, "Malgun Gothic", sans-serif';
const SERIF = '"Noto Serif KR", "Nanum Myeongjo", "Batang", serif';
const MONO = '"IBM Plex Mono", "JetBrains Mono", ui-monospace, Consolas, monospace';

/** 메시지 바깥 래퍼 보정. pad가 0이면 메시지 사이 틈 없이 이어 붙는다. */
function wrapperCss(pad) {
    return `/* 바깥 래퍼: 메시지 폭을 확보하고 가운데 정렬합니다. */
.risu-chat > div {
  padding: ${pad};
  margin: auto;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  width: 100%;
  min-width: 0;
}
.risu-chat > div > div {
  width: 100%;
  min-width: 0;
  margin: auto;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
}`;
}

/** 본문 글꼴·색을 RisuAI 기본 규칙과 연결하고 본문 요소를 다듬는 공통 CSS. */
const CONTENT_CSS = `
/* 본문: RisuAI 기본 색·글꼴 변수에 테마 값을 연결합니다. */
.{p} {
  --risu-font-family: var(--{p}-font-body);
  --FontColorStandard: var(--{p}-ink);
  --FontColorBold: var(--{p}-strong, var(--{p}-ink));
  --FontColorItalic: var(--{p}-muted);
  --FontColorItalicBold: var(--{p}-muted);
  --FontColorQuote1: var(--{p}-muted);
  --FontColorQuote2: var(--{p}-dialog);
  position: relative;
  isolation: isolate;
  width: 100%;
  min-width: 0;
  color: var(--{p}-ink);
  font-family: var(--{p}-font-body);
  font-size: var(--{p}-font-size);
  line-height: var(--{p}-line-height);
  letter-spacing: var(--{p}-tracking, -.005em);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
.{p}, .{p} *, .{p} *::before, .{p} *::after { box-sizing: border-box; }
/* 바깥 래퍼 보정(.risu-chat > div > div)이 테마 루트를 flex로 바꾸지 않게 루트 배치를 고정합니다. */
.{p}.{p} { display: block; }
.{p} ::selection { background: color-mix(in srgb, var(--{p}-accent) 26%, transparent); color: inherit; }
.{p}__content {
  min-width: 0;
  color: var(--{p}-ink);
  word-break: keep-all;
  overflow-wrap: break-word;
  text-wrap: pretty;
}
.{p}__content .chattext {
  --tw-prose-code: var(--{p}-strong, var(--{p}-ink));
  --tw-prose-pre-code: var(--{p}-ink);
  --tw-prose-pre-bg: var(--{p}-tint);
  max-width: none;
  color: var(--{p}-ink);
  font-size: var(--{p}-font-size) !important;
  line-height: var(--{p}-line-height) !important;
}
/* :where()로 우선순위를 낮춰 캐릭터 카드 자체 HTML 스타일이 이기게 합니다. */
.{p}__content :where(p, li, td, th, blockquote) {
  font-size: var(--{p}-font-size);
  line-height: var(--{p}-line-height);
}
.{p}__content :where(p) { margin: 0 0 var(--{p}-para-gap); }
.{p}__content :where(p:last-child) { margin-bottom: 0; }
.{p}__content :where(h1, h2, h3, h4, h5, h6) {
  --risu-font-family: var(--{p}-font-display);
  margin: 1.35em 0 .55em;
  color: var(--{p}-strong, var(--{p}-ink));
  font-family: var(--{p}-font-display);
  line-height: 1.35;
  letter-spacing: -.015em;
  font-weight: 700;
}
.{p}__content :where(h1, h2, h3, h4, h5, h6):where(:first-child) { margin-top: .15em; }
.{p}__content :where(h1) { font-size: calc(var(--{p}-font-size) * 1.55); }
.{p}__content :where(h2) { font-size: calc(var(--{p}-font-size) * 1.32); }
.{p}__content :where(h3) { font-size: calc(var(--{p}-font-size) * 1.15); }
.{p}__content :where(h4, h5, h6) { font-size: var(--{p}-font-size); color: var(--{p}-muted); }
.{p}__content :where(strong) { font-weight: 700; color: var(--{p}-strong, var(--{p}-ink)); }
/* 한글은 기울임 글꼴이 없어 가짜 기울임 대신 색으로만 구분합니다. */
.{p}__content :where(em) { font-style: normal; color: var(--{p}-muted); }
.{p}__content mark[risu-mark="quote1"],
.{p}__content mark[risu-mark="blockquote1"] { color: var(--{p}-muted); background: transparent; }
.{p}__content mark[risu-mark="quote2"],
.{p}__content mark[risu-mark="blockquote2"] {
  color: var(--{p}-dialog);
  font-weight: var(--{p}-dialog-weight);
  background: transparent;
}
.{p}__content :where(blockquote) {
  margin: 1em 0;
  padding: .55em 1.05em;
  border-left: 2.5px solid var(--{p}-accent);
  border-radius: 0 .5rem .5rem 0;
  background: var(--{p}-tint);
  color: var(--{p}-muted);
}
.{p}__content :where(ul, ol) { margin: .85em 0; padding-left: 1.45em; }
.{p}__content :where(li) { margin: .28em 0; padding-left: .12em; color: var(--{p}-ink); }
.{p}__content :where(li)::marker { color: var(--{p}-accent); }
.{p}__content :where(a) {
  color: var(--{p}-accent);
  text-decoration: underline;
  text-decoration-color: color-mix(in srgb, var(--{p}-accent) 45%, transparent);
  text-underline-offset: 3px;
}
.{p}__content :where(a:hover) { text-decoration-color: currentColor; }
.{p}__content :where(hr) {
  height: 1px;
  border: 0;
  margin: 1.55em 0;
  background: linear-gradient(90deg, transparent, var(--{p}-line) 15%, var(--{p}-line) 85%, transparent);
}
.{p}__content :where(code) {
  --risu-font-family: ${MONO};
  padding: .12em .38em;
  border-radius: .3em;
  color: var(--{p}-strong, var(--{p}-ink));
  background: var(--{p}-tint);
  font-family: ${MONO};
  font-size: calc(var(--{p}-font-size) * .88);
  line-height: 1.5;
}
.{p}__content :where(pre) {
  max-width: 100%;
  overflow-x: auto;
  margin: 1em 0;
  padding: .9em 1.05em;
  color: var(--{p}-ink);
  background: var(--{p}-tint);
  border: 1px solid var(--{p}-line);
  border-radius: .5rem;
  font-size: calc(var(--{p}-font-size) * .88);
  line-height: 1.55;
}
.{p}__content :where(pre code) { padding: 0; background: transparent; color: inherit; white-space: pre; overflow-wrap: normal; }
.{p}__content :where(table) {
  display: block;
  width: 100%;
  max-width: 100%;
  overflow-x: auto;
  border-collapse: collapse;
  margin: 1em 0;
}
.{p}__content :where(th, td) {
  padding: .52em .78em;
  color: var(--{p}-ink);
  border-bottom: 1px solid var(--{p}-line);
  text-align: left;
  vertical-align: top;
}
.{p}__content :where(th) {
  background: var(--{p}-tint);
  color: var(--{p}-strong, var(--{p}-ink));
  font-weight: 600;
}
.{p}__content :where(img) { display: block; max-width: 100%; height: auto; margin: .75em auto; border-radius: .55rem; }
.{p}__content textarea.message-edit-area {
  width: 100%;
  max-width: 100%;
  min-width: 0;
  min-height: 6rem;
  padding: .75rem .9rem;
  resize: vertical;
  color: var(--{p}-ink) !important;
  background: var(--{p}-edit-bg) !important;
  border: 1px solid var(--{p}-line);
  border-radius: .55rem;
  font: inherit;
  font-size: var(--{p}-font-size) !important;
  line-height: var(--{p}-line-height) !important;
  transition: border-color .15s ease, box-shadow .15s ease;
}
.{p}__content textarea.message-edit-area:focus {
  outline: none;
  border-color: var(--{p}-accent);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--{p}-accent) 18%, transparent);
}

/* 조작부: 생성 정보와 Risu 기본 버튼만 다듬고, 서드파티 플러그인 버튼 모양은 유지합니다. */
.{p}__footer {
  /* RisuAI(Tailwind v4)는 버튼 색을 --color-textcolor2로 칠하고, 이 변수는 페이지 맨 위에서 이미 앱 설정 색으로 정해져 있습니다.
     --risu-theme-textcolor2만 바꾸면 버튼은 앱 색으로 남아 종이·어두운 바탕에서 보이지 않으므로, 버튼이 실제로 쓰는 변수를 여기서 다시 정합니다. */
  --risu-theme-textcolor2: var(--{p}-muted);
  --color-textcolor2: var(--{p}-muted);
  --color-textcolor: var(--{p}-ink);
  --color-darkborderc: var(--{p}-line);
  --color-darkbutton: var(--{p}-line);
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: .4rem .75rem;
  min-width: 0;
  color: var(--{p}-muted);
}
.{p}__info, .{p}__actions { min-width: 0; max-width: 100%; }
.{p}__info > div, .{p}__actions > div { display: flex; flex-wrap: wrap; align-items: center; min-width: 0; gap: .25rem; color: var(--{p}-muted); }
.{p}__actions > div > div { display: flex; flex-wrap: wrap; align-items: center; min-width: 0; gap: .05rem; }
.{p}__info button.transition-all,
.{p}__actions button[class*="button-icon-"] {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 auto;
  min-width: 1.9rem;
  min-height: 1.9rem;
  padding: .28rem;
  border-radius: 999px;
  background: transparent;
  transition: background-color .15s ease, color .15s ease;
}
.{p}__info button.transition-all:hover,
.{p}__actions button[class*="button-icon-"]:hover { background: var(--{p}-tint); color: var(--{p}-ink); }
.{p}__info button:not(.transition-all) {
  background: transparent;
  color: inherit;
  border: 1px solid var(--{p}-line);
  padding: .18rem .5rem;
  border-radius: .35rem;
  font-size: .92em;
  transition: background-color .15s ease, color .15s ease;
}
.{p}__info button:not(.transition-all):hover { background: var(--{p}-tint); color: var(--{p}-ink); }
.{p} :where(a, button, textarea):focus-visible { outline: 2px solid var(--{p}-accent); outline-offset: 2px; }

/* 아바타 틀: RisuAI가 넣는 배경 이미지 칸을 틀에 맞춥니다. */
.{p}__portrait { overflow: hidden; background: var(--{p}-tint); }
.{p}__portrait > * {
  width: 100% !important;
  height: 100% !important;
  min-width: 0 !important;
  min-height: 0 !important;
  background-size: cover !important;
  background-position: center 22% !important;
  border: 0 !important;
  border-radius: inherit !important;
}

@media (prefers-reduced-motion: reduce) {
  .{p}, .{p} * { transition: none !important; animation: none !important; }
}
@media (prefers-reduced-transparency: reduce) {
  .{p} .{p}__bg {
    background: var(--{p}-bg-fallback, var(--{p}-bg-fill));
    -webkit-backdrop-filter: none;
    backdrop-filter: none;
  }
}
@supports not ((backdrop-filter: blur(1px)) or (-webkit-backdrop-filter: blur(1px))) {
  .{p} .{p}__bg { background: var(--{p}-bg-fallback, var(--{p}-bg-fill)); }
}`;

/**
 * PC에서는 조작부를 평소에 조금 흐리게 두고, 마우스·포커스·편집 중일 때 또렷하게 한다. 휴대폰에서는 늘 또렷하다.
 * 완전히 숨기면 수정·재생성·번역 버튼이 있는지 알 수 없으므로 흐리게만 둔다.
 */
const QUIET_FOOTER_CSS = `
.{p}__footer { opacity: .7; transition: opacity .2s ease; }
.{p}:hover .{p}__footer, .{p}:focus-within .{p}__footer, .{p}:has(textarea.message-edit-area) .{p}__footer { opacity: 1; }
/* 휴대폰처럼 마우스를 올릴 수 없는 화면에서는 늘 또렷하게 둡니다. */
@media (hover: none) { .{p}__footer { opacity: 1; } }`;

/**
 * 바탕 층: 카드 뒤에 깔리는 별도 요소. 글래스 변주의 흐림(backdrop-filter)과 표면 질감을 여기에만 둔다.
 * 본문을 감싸는 요소에 흐림을 걸면 RisuAI의 팝업 메뉴 위치가 어긋날 수 있다.
 */
const BG_CSS = `
.{p}__bg {
  position: absolute;
  inset: 0;
  z-index: -1;
  pointer-events: none;
  border-radius: inherit;
  background: var(--{p}-bg-fill);
  border: var(--{p}-bg-border, 0);
  -webkit-backdrop-filter: var(--{p}-blur);
  backdrop-filter: var(--{p}-blur);
  box-shadow: var(--{p}-bg-edge);
}`;

/**
 * 화면 폭을 다 칠하는 분류(서재·연재란·메신저 한쪽)용.
 * RisuAI 채팅 화면은 메시지를 아래부터 쌓으므로, 대화가 짧으면 메시지 위쪽이 앱 기본 배경으로 남는다.
 * 맨 위 메시지(첫인사, 또는 불러온 메시지 중 가장 오래된 것)의 그림자를 위로만 길게 늘려 그 빈 곳을 같은 바탕으로 칠한다.
 * 그림자는 스크롤 길이를 늘리지 않고 아래쪽 입력창 자리도 덮지 않는다. 바탕이 투명한 글래스 변주에서는 아무것도 칠하지 않는다.
 */
function fillAboveCss(color) {
    return `
/* 짧은 대화: 맨 위 메시지 위쪽 빈 곳도 같은 바탕으로 칠합니다. */
.default-chat-screen > .risu-chat .{p},
.chat-message-container:last-child .{p} { box-shadow: 0 -100vh 0 100vh ${color}; }
/* 첫인사 위에 RisuAI가 붙이는 안내문(AI 생성 안내, 제작자 메모)이 칠한 바탕 아래로 숨지 않게 합니다. */
:where(.default-chat-screen > .risu-chat:has(.{p}) ~ *) { position: relative; }`;
}

/** 모든 분류에 공통으로 들어가는 기본값. 변주가 덮어쓴다. */
const COMMON_TOKENS = {
    'bg-fill': 'transparent',
    'bg-border': '0',
    blur: 'none',
    'bg-edge': 'none',
    'bg-sheen': 'linear-gradient(transparent, transparent)',
    'bg-fallback': 'transparent',
};

/** 글래스 변주의 공통 값: 반투명 유리 질감, 뒤 흐림, 입체 하이라이트 테두리 */
const GLASS = {
    blur: 'blur(16px) saturate(1.3)',
    'bg-sheen':
        'radial-gradient(120% 80% at 0% 0%, rgba(255, 255, 255, .13), transparent 54%), linear-gradient(165deg, rgba(255, 255, 255, .07), rgba(255, 255, 255, .015) 68%)',
    'bg-edge':
        '0 14px 36px -14px rgba(0, 0, 0, .52), inset 0 1px 0 rgba(255, 255, 255, .24), inset 0 0 0 1px rgba(255, 255, 255, .13)',
    'bg-fallback': 'rgba(16, 18, 26, .88)',
};

/**
 * 양쪽 배치: 반대편 이미지를 본문 맨 앞에 끼워 넣는 디스플레이 정규식. RisuAI가 {{source::…}}를 실제 이미지 주소로 바꾼다.
 * RisuAI는 본문이 바뀔 때만 메시지를 다시 그리므로, 다른 테마로 바꿔도 끼워 넣은 조각이 남는다.
 * 그래서 조각은 스스로 숨어 있고(style="display:none"), 이 분류의 CSS가 있을 때만 드러난다.
 * 투명 단추의 글자는 CSS로 그린다. 본문에 넣으면 복사·번역할 때 섞여 나간다.
 */
function pairRegexRule(prefix) {
    return {
        id: `rule_${prefix}_pair`,
        comment: '양쪽 배치: 반대편 이미지 넣기 (지우면 반대편 칸은 빈 액자로 보입니다)',
        in: '^',
        out: `<div class="${prefix}-pair" style="display:none"><div class="${prefix}-pair-char" style="background-image:url('{{source::char}}')"></div><div class="${prefix}-pair-user" style="background-image:url('{{source::user}}')"></div><details class="${prefix}-fade"><summary title="초상 투명하게"></summary></details></div>\n\n`,
        type: 'editdisplay',
        flag: '',
        ableFlag: true,
        enabled: true,
    };
}

const ROLE_CLASS = '{{#when::{{role}}::is::char}}{p}--char{{:else}}{p}--user{{/when}}';
const ROLE_NAME = '{{#when::{{role}}::is::char}}{{char}}{{:else}}{{user}}{{/when}}';
const FOOTER = `<div class="{p}__footer"><div class="{p}__info"><risugeninfo></risugeninfo></div><div class="{p}__actions"><risubuttons></risubuttons></div></div>`;
const BG = '<div class="{p}__bg"></div>';

/**
 * 양쪽(3분할) 공통 HTML. 왼쪽은 언제나 캐릭터, 오른쪽은 언제나 사용자.
 * 바탕 층은 가운데 메시지 카드(__main) 안쪽에만 두어 글래스 변주에서도 카드만 유리가 된다.
 */
function pairHtml(frameClass) {
    return `<div class="{p} ${ROLE_CLASS}">
  <div class="{p}__side {p}__side--char">
    <div class="{p}__frame ${frameClass}">{{#when::{{role}}::is::char}}<div class="{p}__portrait"><risuicon></risuicon></div>{{/when}}</div>
    <div class="{p}__side-name">{{char}}</div>
  </div>
  <div class="{p}__main">
    ${BG}
    <div class="{p}__speaker">${ROLE_NAME}</div>
    <div class="{p}__content"><risutextbox></risutextbox></div>
    ${FOOTER}
  </div>
  <div class="{p}__side {p}__side--user">
    <div class="{p}__frame ${frameClass}">{{#when::{{role}}::isnot::char}}<div class="{p}__portrait"><risuicon></risuicon></div>{{/when}}</div>
    <div class="{p}__side-name">{{user}}</div>
  </div>
</div>`;
}

/**
 * PC에서 양옆 고정 초상과 ◐ 단추를 꺼내 올 메시지.
 * 가장 최근 메시지가 기본이고, 그 메시지에 초상 조각이 없으면(편집 중, 생성 중) 바로 앞 메시지를 쓴다.
 * 앞의 두 메시지에 모두 없거나 메시지가 하나도 없으면 첫인사를 쓴다. 세 경우는 서로 겹치지 않는다.
 */
const LIVE_SCOPES = [
    '.chat-message-container:first-child',
    '.chat-message-container:first-child:not(:has(.x-risu-{p}-pair)) + .chat-message-container',
    '.flex-col-reverse:not(:has(> .chat-message-container:nth-child(-n+2) .x-risu-{p}-pair)) + .risu-chat',
];

/** 대상 선택자마다 LIVE_SCOPES 세 범위를 붙여 쉼표로 잇는다. */
function live(...targets) {
    return targets.flatMap((target) => LIVE_SCOPES.map((scope) => `${scope} ${target}`)).join(',\n  ');
}

/**
 * 양쪽 공통 배치 CSS.
 * - PC(1040px 이상): 가장 최근 메시지 하나에서만 두 초상을 꺼내 채팅 영역 양옆에 고정하고, 가운데 열 폭을 여백에 맞춰 줄여 겹침을 막는다.
 * - 휴대폰·좁은 창(1039px 이하): 메시지마다 위에 두 초상이 마주 본다.
 */
const PAIR_LAYOUT_CSS = `
.{p} {
  --{p}-col: 44rem;
  --{p}-gap: clamp(1rem, 2.2vw, 1.8rem);
  --{p}-edge: 1rem;
  --{p}-fixed-bottom: 5rem;
  --{p}-fixed-w: max(8rem, min(calc((100% - var(--{p}-col)) / 2 - var(--{p}-gap) - var(--{p}-edge)), calc((100vh - var(--{p}-edge) - var(--{p}-fixed-bottom)) * 3 / 4)));
  --{p}-pad: .65rem;
  max-width: var(--{p}-col);
  margin: 0 auto;
  padding: .55rem 0;
}
.{p}__side { display: none; }
.{p}__main { position: relative; min-width: 0; }
.{p}__speaker {
  display: flex;
  align-items: center;
  gap: .45rem;
  margin-bottom: .55rem;
  color: var(--{p}-muted);
  font-size: .82em;
  font-weight: 700;
  letter-spacing: .02em;
}
.{p}--char .{p}__speaker { color: var(--{p}-strong, var(--{p}-ink)); }
.{p} .x-risu-{p}-pair { display: block !important; height: 0; margin: 0; padding: 0; }
.{p} .x-risu-{p}-pair-char, .{p} .x-risu-{p}-pair-user {
  display: none;
  background-size: cover;
  background-position: center 22%;
}
.{p} .x-risu-{p}-fade { display: none; }

/* 고정 초상이 채팅 영역을 기준으로 놓이게 합니다 (이 테마가 채팅에 있을 때만 걸립니다). */
:has(> .default-chat-screen .{p}) { transform: translateZ(0); }

/* PC: 1040px 이상에서만 양옆 고정 초상을 띄우고 가운데 열과 겹치지 않게 폭을 확보합니다. */
@media (min-width: 1040px) {
  .{p} { --{p}-col: min(44rem, calc(100% - 22rem)); }
  ${live('.{p} :is(.x-risu-{p}-pair-char, .x-risu-{p}-pair-user)')} {
    display: block;
    position: fixed;
    z-index: 1;
    top: var(--{p}-edge);
    bottom: var(--{p}-fixed-bottom);
    margin-block: auto;
    width: var(--{p}-fixed-w);
    aspect-ratio: 3 / 4;
    transition: opacity .3s ease, filter .3s ease, translate .3s ease, scale .3s ease;
  }
  ${live('.{p} .x-risu-{p}-pair-char')} {
    left: var(--{p}-edge);
    transform: rotate(var(--{p}-tilt-char));
  }
  ${live('.{p} .x-risu-{p}-pair-user')} {
    right: var(--{p}-edge);
    transform: rotate(var(--{p}-tilt-user));
  }
  ${live('.{p}--char .x-risu-{p}-pair-char', '.{p}--user .x-risu-{p}-pair-user')} {
    translate: 0 -4px;
    scale: 1.018;
    filter: drop-shadow(0 16px 14px rgba(0, 0, 0, .24));
  }
  ${live('.{p} .x-risu-{p}-fade')} {
    /* 왼쪽 초상과 똑같은 칸을 투명하게 겹쳐 두고 그 왼쪽 위 모서리에 단추를 놓습니다.
       앵커 위치 지정이 없는 브라우저(Firefox, 이전 Safari)에서도 단추가 초상에서 떨어지지 않습니다. */
    display: block;
    position: fixed;
    z-index: 2;
    top: var(--{p}-edge);
    bottom: var(--{p}-fixed-bottom);
    left: var(--{p}-edge);
    width: var(--{p}-fixed-w);
    aspect-ratio: 3 / 4;
    margin: auto 0;
    padding: .6rem;
    pointer-events: none;
  }
  .{p} .x-risu-{p}-fade > summary {
    pointer-events: auto;
    display: grid;
    place-items: center;
    width: 1.9rem;
    height: 1.9rem;
    border-radius: 50%;
    list-style: none;
    cursor: pointer;
    color: #fff;
    font-size: .95rem;
    line-height: 1;
    background: rgba(0, 0, 0, .34);
    -webkit-backdrop-filter: blur(6px);
    backdrop-filter: blur(6px);
    box-shadow: inset 0 0 0 1px rgba(255, 255, 255, .28);
    opacity: .72;
    transition: opacity .2s ease, background .2s ease;
    user-select: none;
  }
  .{p} .x-risu-{p}-fade > summary::-webkit-details-marker { display: none; }
  .{p} .x-risu-{p}-fade > summary::before { content: "◐"; }
  .{p} .x-risu-{p}-fade > summary:hover,
  .{p} .x-risu-{p}-fade[open] > summary { opacity: 1; background: rgba(0, 0, 0, .54); }
  .{p}.{p} .x-risu-{p}-pair.x-risu-{p}-pair:has(> .x-risu-{p}-fade[open]) :is(.x-risu-{p}-pair-char, .x-risu-{p}-pair-user) {
    opacity: .08;
    translate: none;
    scale: none;
    filter: none;
  }
}

/* 휴대폰·좁은 창: 메시지마다 위에 두 초상이 마주 보고, 반대편 초상이 빈 액자 위에 정확히 겹칩니다. */
@media (max-width: 1039px) {
  .{p}.{p} { display: grid; }
  .{p} {
    --{p}-side-w: clamp(4.6rem, 16vw, 6rem);
    --{p}-row-gap: .85rem;
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
    row-gap: var(--{p}-row-gap);
    column-gap: .6rem;
    max-width: none;
    padding: var(--{p}-pad) 0;
  }
  .{p}__side { display: flex; flex-direction: row; align-items: center; gap: .55rem; min-width: 0; }
  .{p}__side--char { grid-column: 1; grid-row: 1; justify-content: flex-start; }
  .{p}__side--user { grid-column: 2; grid-row: 1; flex-direction: row-reverse; justify-content: flex-start; }
  .{p}__frame { position: relative; width: var(--{p}-side-w); flex: 0 0 auto; aspect-ratio: 3 / 4; }
  .{p}__portrait { width: 100%; height: 100%; border-radius: inherit; }
  .{p}__side-name { min-width: 0; color: var(--{p}-muted); font-size: .78em; font-weight: 600; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .{p}__main { grid-column: 1 / -1; grid-row: 2; min-width: 0; max-width: 100%; }
  .{p}__speaker { display: none; }
  .{p}--char .{p}__side--char .{p}__side-name, .{p}--user .{p}__side--user .{p}__side-name { color: var(--{p}-strong, var(--{p}-ink)); }
  .{p}--char .{p}__side--char .{p}__frame, .{p}--user .{p}__side--user .{p}__frame {
    translate: 0 -3px;
    scale: 1.04;
    filter: drop-shadow(0 8px 8px rgba(0, 0, 0, .22));
  }
  .{p} .x-risu-{p}-pair-char, .{p} .x-risu-{p}-pair-user {
    position: absolute;
    z-index: 2;
    bottom: calc(100% + var(--{p}-row-gap) + 1px);
    width: var(--{p}-side-w);
    aspect-ratio: 3 / 4;
  }
  .{p}--user .x-risu-{p}-pair-char { display: block; left: 0; }
  .{p}--char .x-risu-{p}-pair-user { display: block; right: 0; }
}`;

// ───────────────────────── 변주 배색 ─────────────────────────
// 배경에는 높은 채도를 쓰지 않는다. 바탕은 낮은 채도의 종이·나무·밤색 계열, 강조색은 하나만 절제해서 쓴다.

const BOOK_VARIANTS = [
    {
        key: 'cream',
        label: '크림',
        tokens: {
            outer: '#efe8da',
            paper: '#f7f2e7',
            ink: '#2d2924',
            strong: '#191612',
            muted: '#776d60',
            accent: '#8c6645',
            dialog: '#241e18',
            line: '#dcd1be',
            tint: '#ebe2d1',
            'edit-bg': '#fcf8ef',
            gutter: 'rgba(72, 52, 24, .11)',
            'wrap-y': '0px',
            'page-r': '0px',
            'page-px': 'clamp(1.25rem, 3vw, 2.5rem)',
        },
    },
    {
        key: 'sepia',
        label: '세피아',
        tokens: {
            outer: '#dfd0b0',
            paper: '#ebdcc0',
            ink: '#382a1b',
            strong: '#24180c',
            muted: '#756043',
            accent: '#7e4f31',
            dialog: '#2b1d10',
            line: '#ceba94',
            tint: '#e0cfa9',
            'edit-bg': '#f5e9cf',
            gutter: 'rgba(72, 44, 16, .15)',
            'wrap-y': '0px',
            'page-r': '0px',
            'page-px': 'clamp(1.25rem, 3vw, 2.5rem)',
        },
    },
    {
        key: 'night',
        label: '밤',
        tokens: {
            outer: '#141311',
            paper: '#1b1916',
            ink: '#d7d0c2',
            strong: '#efe8d9',
            muted: '#938b7c',
            accent: '#b99c72',
            dialog: '#f3ead7',
            line: '#322f2a',
            tint: '#25221e',
            'edit-bg': '#211f1b',
            gutter: 'rgba(0, 0, 0, .42)',
            'wrap-y': '0px',
            'page-r': '0px',
            'page-px': 'clamp(1.25rem, 3vw, 2.5rem)',
        },
    },
    {
        key: 'glass',
        label: '글래스',
        tokens: {
            ...GLASS,
            outer: 'transparent',
            paper: 'rgba(15, 16, 22, .42)',
            ink: '#ebe6dc',
            strong: '#ffffff',
            muted: 'rgba(228, 224, 214, .68)',
            accent: '#dbc49f',
            dialog: '#ffffff',
            line: 'rgba(255, 255, 255, .15)',
            tint: 'rgba(255, 255, 255, .07)',
            'edit-bg': 'rgba(10, 11, 15, .52)',
            gutter: 'rgba(0, 0, 0, .25)',
            'wrap-y': '.45rem',
            'page-r': '1rem',
            'page-px': 'clamp(1.25rem, 3.5vw, 2.4rem)',
        },
    },
];

const WEBNOVEL_VARIANTS = [
    {
        key: 'dark',
        label: '검정',
        tokens: {
            outer: '#151517',
            paper: '#151517',
            ink: '#e0deda',
            strong: '#f7f5f1',
            muted: '#97948e',
            accent: '#c7b597',
            dialog: '#ffffff',
            line: '#2a2a2d',
            tint: '#1e1e21',
            'edit-bg': '#1b1b1e',
            shadow: 'rgba(0, 0, 0, .3)',
            'wrap-y': '0px',
            'page-r': '0px',
            'page-px': '0px',
        },
    },
    {
        key: 'white',
        label: '흰색',
        tokens: {
            outer: '#faf9f6',
            paper: '#faf9f6',
            ink: '#252321',
            strong: '#11100f',
            muted: '#77726c',
            accent: '#73614e',
            dialog: '#111111',
            line: '#e4dfd7',
            tint: '#f0ece4',
            'edit-bg': '#ffffff',
            shadow: 'rgba(40, 30, 20, .06)',
            'wrap-y': '0px',
            'page-r': '0px',
            'page-px': '0px',
        },
    },
    {
        key: 'bluegray',
        label: '회청',
        tokens: {
            outer: '#20262e',
            paper: '#20262e',
            ink: '#d4dae1',
            strong: '#eef2f6',
            muted: '#8c96a2',
            accent: '#9fb0c0',
            dialog: '#f2f5f8',
            line: '#313945',
            tint: '#28303a',
            'edit-bg': '#242b34',
            shadow: 'rgba(0, 0, 0, .28)',
            'wrap-y': '0px',
            'page-r': '0px',
            'page-px': '0px',
        },
    },
    {
        key: 'glass',
        label: '글래스',
        tokens: {
            ...GLASS,
            outer: 'transparent',
            paper: 'rgba(14, 15, 20, .42)',
            ink: '#ebeae6',
            strong: '#ffffff',
            muted: 'rgba(228, 227, 222, .68)',
            accent: '#d8cbb4',
            dialog: '#ffffff',
            line: 'rgba(255, 255, 255, .15)',
            tint: 'rgba(255, 255, 255, .07)',
            'edit-bg': 'rgba(10, 11, 15, .52)',
            shadow: 'rgba(0, 0, 0, .26)',
            'wrap-y': '.45rem',
            'page-r': '1rem',
            'page-px': 'clamp(1.15rem, 3.2vw, 2.1rem)',
        },
    },
];

// 메신저 양쪽·한쪽이 함께 쓴다.
const MESSENGER_VARIANTS = [
    {
        key: 'white',
        label: '백색',
        tokens: {
            wall: '#f2efe9',
            panel: '#fffdfa',
            'panel-user': '#f6f0e6',
            ink: '#2a2622',
            strong: '#171411',
            muted: '#82796e',
            accent: '#86694f',
            dialog: '#5c432d',
            frame: '#e0d8cc',
            shadow: 'rgba(55, 40, 24, .08)',
            line: '#e4ddd2',
            tint: '#efe9df',
            'edit-bg': '#ffffff',
        },
    },
    {
        key: 'brown',
        label: '갈색',
        tokens: {
            wall: '#27201c',
            panel: '#332a24',
            'panel-user': '#3b312a',
            ink: '#ebe2d7',
            strong: '#fbf6ee',
            muted: '#b2a392',
            accent: '#caa77b',
            dialog: '#ebd0a6',
            frame: '#4a3d34',
            shadow: 'rgba(0, 0, 0, .3)',
            line: '#483b32',
            tint: '#3e332c',
            'edit-bg': '#2d2520',
        },
    },
    {
        key: 'navy',
        label: '남색',
        tokens: {
            wall: '#151b28',
            panel: '#1d2536',
            'panel-user': '#242e42',
            ink: '#e2e6ed',
            strong: '#f6f8fc',
            muted: '#99a3b5',
            accent: '#c4aa6f',
            dialog: '#e7d39f',
            frame: '#2e3852',
            shadow: 'rgba(0, 0, 0, .36)',
            line: '#2c364f',
            tint: '#273149',
            'edit-bg': '#19202f',
        },
    },
    {
        key: 'glass',
        label: '글래스',
        tokens: {
            ...GLASS,
            wall: 'transparent',
            panel: 'rgba(15, 18, 26, .42)',
            'panel-user': 'rgba(28, 31, 42, .44)',
            ink: '#eef1f6',
            strong: '#ffffff',
            muted: 'rgba(228, 231, 238, .68)',
            accent: '#e2cea9',
            dialog: '#ffffff',
            frame: 'rgba(255, 255, 255, .2)',
            shadow: 'rgba(0, 0, 0, .28)',
            line: 'rgba(255, 255, 255, .14)',
            tint: 'rgba(255, 255, 255, .08)',
            'edit-bg': 'rgba(10, 12, 18, .52)',
        },
    },
];

// 편지 양쪽·한쪽이 함께 쓴다.
const LETTER_VARIANTS = [
    {
        key: 'cream',
        label: '미색',
        tokens: {
            paper: '#faf6ed',
            'paper-user': '#f3ece0',
            rule: 'rgba(175, 152, 122, .24)',
            ink: '#3a3128',
            strong: '#221b14',
            muted: '#847664',
            accent: '#946444',
            dialog: '#724226',
            stamp: '#fffdf7',
            shadow: 'rgba(72, 50, 22, .13)',
            line: '#dfd3bf',
            tint: '#efe6d6',
            'edit-bg': '#fffdf7',
        },
    },
    {
        key: 'kraft',
        label: '크라프트지',
        tokens: {
            paper: '#d8c19e',
            'paper-user': '#ceb58f',
            rule: 'rgba(110, 82, 48, .2)',
            ink: '#312418',
            strong: '#1d140c',
            muted: '#69533b',
            accent: '#6b4022',
            dialog: '#522e14',
            stamp: '#f5ebd8',
            shadow: 'rgba(55, 36, 14, .22)',
            line: '#bba077',
            tint: '#cbb48c',
            'edit-bg': '#e7d6b9',
        },
    },
    {
        key: 'navy',
        label: '남색 편지지',
        tokens: {
            paper: '#1e263f',
            'paper-user': '#242d48',
            rule: 'rgba(180, 192, 224, .1)',
            ink: '#e5e0d4',
            strong: '#f6f2e8',
            muted: '#a3a8ba',
            accent: '#cbb17a',
            dialog: '#ebd49c',
            stamp: '#ece7d8',
            shadow: 'rgba(0, 0, 0, .36)',
            line: '#343f5f',
            tint: '#2a3350',
            'edit-bg': '#1a2137',
        },
    },
    {
        key: 'glass',
        label: '글래스',
        tokens: {
            ...GLASS,
            paper: 'rgba(16, 17, 23, .42)',
            'paper-user': 'rgba(28, 30, 38, .44)',
            rule: 'rgba(255, 255, 255, .07)',
            ink: '#eeece5',
            strong: '#ffffff',
            muted: 'rgba(230, 228, 222, .68)',
            accent: '#e2cca4',
            dialog: '#ffffff',
            stamp: 'rgba(250, 246, 238, .9)',
            shadow: 'rgba(0, 0, 0, .28)',
            line: 'rgba(255, 255, 255, .15)',
            tint: 'rgba(255, 255, 255, .08)',
            'edit-bg': 'rgba(10, 11, 16, .52)',
        },
    },
];

const FANTASY_VARIANTS = [
    {
        key: 'ancient',
        label: '황토',
        tokens: {
            paper: '#ebd9b2',
            stain: 'rgba(140, 92, 42, .18)',
            vignette: 'rgba(110, 72, 28, .16)',
            ink: '#382716',
            strong: '#22150a',
            muted: '#7a6242',
            accent: '#823a25',
            dialog: '#5c2614',
            seal: '#8c3024',
            'seal-dark': '#5a1e16',
            shadow: 'rgba(56, 32, 10, .28)',
            line: '#c2a67b',
            tint: '#e0cca1',
            'edit-bg': '#f4e7ca',
        },
    },
    {
        key: 'elven',
        label: '숲',
        tokens: {
            paper: '#dddac1',
            stain: 'rgba(76, 94, 48, .15)',
            vignette: 'rgba(54, 68, 36, .14)',
            ink: '#242e1d',
            strong: '#141c0f',
            muted: '#5c684f',
            accent: '#786b32',
            dialog: '#394c2c',
            seal: '#4b5e35',
            'seal-dark': '#8a7a3c',
            shadow: 'rgba(26, 38, 18, .25)',
            line: '#b0af8b',
            tint: '#d1ceb1',
            'edit-bg': '#ebe9d5',
        },
    },
    {
        key: 'demon',
        label: '진홍',
        tokens: {
            paper: '#211619',
            stain: 'rgba(145, 38, 48, .16)',
            vignette: 'rgba(0, 0, 0, .28)',
            ink: '#e4d5c7',
            strong: '#f7ece1',
            muted: '#a28e81',
            accent: '#bf9e5c',
            dialog: '#df8b8b',
            seal: '#82252f',
            'seal-dark': '#bf9e5c',
            shadow: 'rgba(0, 0, 0, .5)',
            line: '#492a2f',
            tint: '#2d1e22',
            'edit-bg': '#1d1316',
        },
    },
    {
        key: 'glass',
        label: '글래스',
        tokens: {
            ...GLASS,
            paper: 'rgba(22, 18, 14, .44)',
            stain: 'rgba(255, 220, 160, .06)',
            vignette: 'rgba(0, 0, 0, .18)',
            ink: '#efe8db',
            strong: '#ffffff',
            muted: 'rgba(235, 226, 210, .68)',
            accent: '#dfc698',
            dialog: '#ffffff',
            seal: 'rgba(170, 74, 56, .88)',
            'seal-dark': 'rgba(223, 198, 152, .85)',
            shadow: 'rgba(0, 0, 0, .28)',
            line: 'rgba(255, 255, 255, .16)',
            tint: 'rgba(255, 255, 255, .08)',
            'edit-bg': 'rgba(12, 10, 8, .54)',
        },
    },
];

const SF_VARIANTS = [
    {
        key: 'observatory',
        label: '청록',
        tokens: {
            bezel: '#0a1114',
            panel: '#0e181d',
            frame: '#22383e',
            scan: 'rgba(130, 200, 200, .032)',
            'scan-strong': 'rgba(8, 24, 26, .34)',
            'inner-glow': 'rgba(95, 183, 180, .11)',
            ink: '#d6e9e8',
            strong: '#eef9f8',
            muted: '#809c9d',
            accent: '#6fb6b1',
            dialog: '#a9deda',
            line: '#22383e',
            tint: '#13262b',
            'edit-bg': '#0b1518',
        },
    },
    {
        key: 'alert',
        label: '적색',
        tokens: {
            bezel: '#130a0a',
            panel: '#1a0f10',
            frame: '#472420',
            scan: 'rgba(230, 110, 100, .032)',
            'scan-strong': 'rgba(30, 6, 6, .34)',
            'inner-glow': 'rgba(208, 100, 92, .12)',
            ink: '#efdcd9',
            strong: '#fff1ef',
            muted: '#aa8884',
            accent: '#d17066',
            dialog: '#eda8a0',
            line: '#472420',
            tint: '#281515',
            'edit-bg': '#160c0c',
        },
    },
    {
        key: 'lab',
        label: '백색',
        tokens: {
            bezel: '#d8dfe3',
            panel: '#f2f4f5',
            frame: '#c4cdd3',
            scan: 'rgba(40, 60, 80, .025)',
            'scan-strong': 'rgba(255, 255, 255, .16)',
            'inner-glow': 'rgba(74, 106, 128, .06)',
            ink: '#1e2930',
            strong: '#0f171c',
            muted: '#5d6b75',
            accent: '#4a677d',
            dialog: '#2b465a',
            line: '#c4cdd3',
            tint: '#e2e7ea',
            'edit-bg': '#ffffff',
        },
    },
    {
        key: 'glass',
        label: '글래스',
        tokens: {
            ...GLASS,
            bezel: 'rgba(10, 15, 20, .38)',
            panel: 'rgba(255, 255, 255, .025)',
            frame: 'rgba(255, 255, 255, .16)',
            scan: 'rgba(255, 255, 255, .022)',
            'scan-strong': 'rgba(0, 0, 0, .14)',
            'inner-glow': 'rgba(180, 224, 224, .08)',
            ink: '#eaf0f2',
            strong: '#ffffff',
            muted: 'rgba(225, 232, 236, .68)',
            accent: '#bed9d6',
            dialog: '#ffffff',
            line: 'rgba(255, 255, 255, .14)',
            tint: 'rgba(255, 255, 255, .08)',
            'edit-bg': 'rgba(10, 13, 18, .52)',
        },
    },
];

const NOIR_VARIANTS = [
    {
        key: 'mono',
        label: '흑백',
        tokens: {
            paper: '#ebe8e1',
            folder: '#bfae88',
            'folder-ink': '#372e22',
            photo: '#fbfaf7',
            'photo-ink': '#333333',
            'photo-filter': 'grayscale(1) contrast(1.05)',
            clip: '#8b8f96',
            ink: '#1e1e1e',
            strong: '#0d0d0d',
            muted: '#5d5d5d',
            accent: '#9f2d24',
            dialog: '#1a1a1a',
            shadow: 'rgba(0, 0, 0, .28)',
            line: '#ceC9bd',
            tint: '#dedad0',
            'edit-bg': '#f6f4ee',
        },
    },
    {
        key: 'newspaper',
        label: '신문지',
        tokens: {
            paper: '#e6d9be',
            folder: '#8a7350',
            'folder-ink': '#f2e8d2',
            photo: '#f4eddc',
            'photo-ink': '#3a2e20',
            'photo-filter': 'sepia(.8) contrast(1.05)',
            clip: '#7d7466',
            ink: '#2a2117',
            strong: '#17110b',
            muted: '#695841',
            accent: '#78321e',
            dialog: '#261d14',
            shadow: 'rgba(60, 40, 15, .3)',
            line: '#cbb995',
            tint: '#dacaa8',
            'edit-bg': '#f0e6d0',
            stamp: '"EXTRA"',
        },
    },
    {
        key: 'night',
        label: '야간',
        tokens: {
            paper: '#1b1d22',
            folder: '#2a2d35',
            'folder-ink': '#d6a44e',
            photo: '#24272e',
            'photo-ink': '#cfc8bb',
            'photo-filter': 'grayscale(.7) sepia(.25) contrast(1.05)',
            clip: '#6e7178',
            ink: '#ded8cc',
            strong: '#f4efe5',
            muted: '#9d978c',
            accent: '#d6a44e',
            dialog: '#f2dcb0',
            shadow: 'rgba(0, 0, 0, .45)',
            line: '#34373f',
            tint: '#25282f',
            'edit-bg': '#17191e',
            stamp: '"NIGHT SHIFT"',
        },
    },
    {
        key: 'glass',
        label: '글래스',
        tokens: {
            ...GLASS,
            paper: 'rgba(16, 17, 21, .44)',
            folder: 'rgba(255, 255, 255, .14)',
            'folder-ink': '#ece2ce',
            photo: 'rgba(250, 248, 244, .9)',
            'photo-ink': '#2a2a2a',
            'photo-filter': 'grayscale(.45)',
            clip: 'rgba(255, 255, 255, .7)',
            ink: '#ecebe7',
            strong: '#ffffff',
            muted: 'rgba(230, 229, 225, .68)',
            accent: '#e4baa9',
            dialog: '#ffffff',
            shadow: 'rgba(0, 0, 0, .28)',
            line: 'rgba(255, 255, 255, .15)',
            tint: 'rgba(255, 255, 255, .08)',
            'edit-bg': 'rgba(10, 11, 15, .52)',
        },
    },
];

const ORIENTAL_VARIANTS = [
    {
        key: 'ink',
        label: '먹',
        tokens: {
            paper: '#f2ede1',
            fiber: 'rgba(120, 100, 70, .055)',
            rod: 'linear-gradient(#3e3127, #1c1510)',
            band: '#1d1b18',
            'band-user': '#4c473f',
            'band-ink': '#f2ede1',
            ink: '#1d1b18',
            strong: '#0f0e0c',
            muted: '#696258',
            accent: '#9a342c',
            dialog: '#1d1b18',
            shadow: 'rgba(40, 30, 20, .19)',
            line: '#d6ccb9',
            tint: '#e7e0d0',
            'edit-bg': '#faf7f0',
        },
    },
    {
        key: 'celadon',
        label: '청자',
        tokens: {
            paper: '#e3ece6',
            fiber: 'rgba(60, 110, 95, .055)',
            rod: 'linear-gradient(#5f6e65, #3a453f)',
            band: '#4a776a',
            'band-user': '#7a998f',
            'band-ink': '#f2f7f4',
            ink: '#1e322f',
            strong: '#10201e',
            muted: '#5a746e',
            accent: '#4a776a',
            dialog: '#1e322f',
            shadow: 'rgba(30, 60, 55, .19)',
            line: '#bfd3ca',
            tint: '#d5e4dd',
            'edit-bg': '#f2f7f4',
        },
    },
    {
        key: 'palace',
        label: '단청',
        tokens: {
            paper: '#f4e9d4',
            fiber: 'rgba(140, 90, 40, .055)',
            rod: 'repeating-linear-gradient(90deg, #8f2a24 0 18px, #3f6b56 18px 30px, #b8954a 30px 36px, #2f4f7a 36px 48px)',
            band: '#7f2420',
            'band-user': '#3f6b56',
            'band-ink': '#f6e7c6',
            ink: '#291913',
            strong: '#170d09',
            muted: '#785c48',
            accent: '#8f2a24',
            dialog: '#291913',
            shadow: 'rgba(80, 30, 10, .23)',
            line: '#dcc49e',
            tint: '#ebdbbe',
            'edit-bg': '#fbf4e6',
        },
    },
    {
        key: 'glass',
        label: '글래스',
        tokens: {
            ...GLASS,
            paper: 'rgba(16, 16, 20, .44)',
            fiber: 'rgba(255, 255, 255, .025)',
            rod: 'linear-gradient(rgba(255, 255, 255, .38), rgba(255, 255, 255, .14))',
            band: 'rgba(255, 255, 255, .12)',
            'band-user': 'rgba(255, 255, 255, .07)',
            'band-ink': '#f2eee5',
            ink: '#efebe3',
            strong: '#ffffff',
            muted: 'rgba(232, 228, 220, .68)',
            accent: '#e2bfae',
            dialog: '#ffffff',
            shadow: 'rgba(0, 0, 0, .28)',
            line: 'rgba(255, 255, 255, .15)',
            tint: 'rgba(255, 255, 255, .08)',
            'edit-bg': 'rgba(10, 11, 15, .52)',
        },
    },
];

// ───────────────────────── 분류 ─────────────────────────

export const THEME_FAMILIES = [
    // ── 1. 소설 읽기 ──
    {
        key: 'book',
        prefix: 'rtbook',
        target: '소설 읽기',
        group: '서재',
        label: '종이책',
        summary: '카드와 아바타 없이 문단이 이어지는 책 페이지. 사용자 입력은 흐린 메모로 줄입니다.',
        fonts: [FONT.serif],
        wrapperPad: '0',
        html: `<div class="{p} ${ROLE_CLASS}">
  <div class="{p}__page">
    ${BG}
    <div class="{p}__ornament"><span></span></div>
    <div class="{p}__name">${ROLE_NAME}</div>
    <div class="{p}__content"><risutextbox></risutextbox></div>
    ${FOOTER}
  </div>
</div>`,
        css: `
.{p} {
  background: var(--{p}-outer);
  padding: var(--{p}-wrap-y, 0px) clamp(.75rem, 4vw, 2.5rem);
}
.{p}__page {
  position: relative;
  max-width: var(--{p}-measure);
  margin: 0 auto;
  padding: 1.55rem var(--{p}-page-px, 1.5rem) 1.1rem;
  border-radius: var(--{p}-page-r, 0px);
}
.{p} .{p}__bg { background: var(--{p}-bg-sheen), var(--{p}-paper); }
@media (min-width: 900px) {
  .{p}__page {
    box-shadow: -16px 0 22px -18px var(--{p}-gutter), 16px 0 22px -18px var(--{p}-gutter);
  }
}
.{p}__ornament {
  display: flex;
  align-items: center;
  gap: .9rem;
  margin-bottom: 1.05rem;
  color: var(--{p}-accent);
  font-size: clamp(.9em, 1.4vw, 1.12em);
  opacity: .88;
}
.{p}__ornament::before, .{p}__ornament::after {
  content: "";
  flex: 1 1 auto;
  height: 1px;
  background: linear-gradient(90deg, transparent, var(--{p}-line));
}
.{p}__ornament::after { background: linear-gradient(90deg, var(--{p}-line), transparent); }
.{p}__ornament > span::before { content: var(--{p}-ornament); }
.{p}--user .{p}__ornament { display: none; }
.{p}__name {
  margin-bottom: .75rem;
  color: var(--{p}-muted);
  font-size: .75em;
  letter-spacing: .16em;
  text-transform: uppercase;
}
.{p}--user .{p}__page { padding-top: .5rem; padding-bottom: .65rem; }
.{p}--user .{p}__name { display: none; }
.{p}--user .{p}__content {
  margin-left: 1.1em;
  padding-left: 1em;
  border-left: 2px solid var(--{p}-accent);
  opacity: .92;
}
.{p}--user .{p}__content .chattext,
.{p}--user .{p}__content :where(p, li) {
  color: var(--{p}-muted) !important;
  font-size: calc(var(--{p}-font-size) * .9) !important;
}
.{p}__content :where(p) { text-indent: var(--{p}-indent); }
.{p}__content :where(p:first-child, h1 + p, h2 + p, h3 + p, h4 + p, h5 + p, h6 + p, blockquote + p, ul + p, ol + p, pre + p, table + p, hr + p) { text-indent: 0; }
.{p}--user .{p}__content :where(p) { text-indent: 0; }
.{p}__footer { margin-top: .55rem; }
${QUIET_FOOTER_CSS}
${fillAboveCss('var(--{p}-outer)')}`,
        variants: BOOK_VARIANTS,
        baseTokens: {
            'font-body': SERIF,
            'font-display': SERIF,
            'font-size': '17px',
            'line-height': '1.9',
            'para-gap': '.9em',
            measure: '36em',
            indent: '1em',
            'dialog-weight': '600',
            ornament: '"⁂"',
        },
    },
    {
        key: 'webnovel',
        prefix: 'rtweb',
        target: '소설 읽기',
        group: '연재란',
        label: '웹소설',
        summary: 'PC 화면을 넓게 쓰는 웹소설 뷰어. 넓은 문단 간격과 오른쪽 선택지형 사용자 입력을 씁니다.',
        fonts: [FONT.pretendard],
        wrapperPad: '0',
        html: `<div class="{p} ${ROLE_CLASS}">
  <div class="{p}__page">
    ${BG}
    <div class="{p}__head"><span class="{p}__name">${ROLE_NAME}</span></div>
    <div class="{p}__content"><risutextbox></risutextbox></div>
    ${FOOTER}
  </div>
</div>`,
        css: `
.{p} {
  background: var(--{p}-outer);
  padding: var(--{p}-wrap-y, 0px) clamp(1rem, 4vw, 3rem);
}
.{p}__page {
  position: relative;
  max-width: var(--{p}-measure);
  margin: 0 auto;
  padding: 1.65rem var(--{p}-page-px, 0px) 1.15rem;
  border-radius: var(--{p}-page-r, 0px);
}
.{p} .{p}__bg { background: var(--{p}-bg-sheen), var(--{p}-paper); }
.{p}__head {
  display: flex;
  align-items: center;
  gap: .65rem;
  margin-bottom: 1.15rem;
  color: var(--{p}-accent);
  font-size: .8em;
  font-weight: 700;
  letter-spacing: .04em;
}
.{p}__head::before {
  content: "";
  width: .42rem;
  height: .42rem;
  border-radius: 50%;
  background: var(--{p}-accent);
  flex: none;
}
.{p}__head::after {
  content: "";
  flex: 1 1 auto;
  height: 1px;
  background: linear-gradient(90deg, var(--{p}-line), transparent);
}
.{p}--user .{p}__page {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  padding: .55rem var(--{p}-page-px, 0px) .95rem;
}
.{p}--user .{p}__head { display: none; }
.{p}--user .{p}__content {
  max-width: min(82%, 38em);
  padding: .68em 1.05em;
  border: 1px solid var(--{p}-line);
  border-left: 3px solid var(--{p}-accent);
  border-radius: .55em;
  background: var(--{p}-tint);
  box-shadow: 0 3px 12px var(--{p}-shadow, rgba(0, 0, 0, .06));
}
.{p}--user .{p}__content .chattext,
.{p}--user .{p}__content :where(p, li) { font-size: calc(var(--{p}-font-size) * .92) !important; line-height: 1.65 !important; }
.{p}--user .{p}__content :where(p) { margin-bottom: .4em; }
.{p}__footer { margin-top: .6rem; }
${QUIET_FOOTER_CSS}
${fillAboveCss('var(--{p}-outer)')}`,
        variants: WEBNOVEL_VARIANTS,
        baseTokens: {
            'font-body': SANS,
            'font-display': SANS,
            'font-size': '16.5px',
            'line-height': '1.95',
            'para-gap': '1.5em',
            measure: '64rem',
            'dialog-weight': '600',
        },
    },

    // ── 2. 애정 ──
    {
        key: 'messenger-pair',
        prefix: 'rtmsy',
        target: '애정',
        group: '메신저',
        layout: '양쪽',
        label: '메신저 양쪽',
        summary: '화면을 셋으로 나눠 왼쪽에 캐릭터, 오른쪽에 사용자 초상을 크게 두고 가운데에 본문을 둡니다. 말하는 쪽 초상이 살짝 떠오릅니다.',
        fonts: [FONT.pretendard],
        wrapperPad: '0 .75rem',
        pair: true,
        html: pairHtml('{p}__frame--plain'),
        css: `
${PAIR_LAYOUT_CSS}
.{p} { --{p}-tilt-char: 0deg; --{p}-tilt-user: 0deg; }
.{p}__frame {
  border-radius: .95rem;
  background: var(--{p}-tint);
  box-shadow: 0 0 0 1px var(--{p}-frame), 0 6px 16px var(--{p}-shadow);
}
.{p} .x-risu-{p}-pair-char, .{p} .x-risu-{p}-pair-user {
  border-radius: 1rem;
  box-shadow: 0 0 0 1px var(--{p}-frame), 0 12px 28px var(--{p}-shadow);
}
@media (min-width: 1040px) {
  ${live('.{p}--char .x-risu-{p}-pair-char', '.{p}--user .x-risu-{p}-pair-user')} {
    box-shadow: 0 0 0 1.5px var(--{p}-accent), 0 16px 34px var(--{p}-shadow);
  }
}
.{p}__main {
  padding: 1.05rem 1.25rem .85rem;
  border: 1px solid var(--{p}-line);
  border-radius: 1rem;
  box-shadow: 0 8px 22px var(--{p}-shadow);
}
.{p} .{p}__bg { background: var(--{p}-bg-sheen), var(--{p}-panel); }
.{p}--user .{p}__bg { background: var(--{p}-bg-sheen), var(--{p}-panel-user); }
.{p}__speaker {
  padding-bottom: .45rem;
  border-bottom: 1px solid var(--{p}-line);
}
.{p}__speaker::before {
  content: "";
  width: .42rem;
  height: .42rem;
  border-radius: 50%;
  background: var(--{p}-accent);
  flex: none;
}
.{p}__footer { margin-top: .75rem; padding-top: .5rem; border-top: 1px solid var(--{p}-line); font-size: .85em; }`,
        variants: MESSENGER_VARIANTS,
        baseTokens: {
            'font-body': SANS,
            'font-display': SANS,
            'font-size': '15.5px',
            'line-height': '1.75',
            'para-gap': '.75em',
            'dialog-weight': '600',
        },
    },
    {
        key: 'messenger-solo',
        prefix: 'rtmsa',
        target: '애정',
        group: '메신저',
        layout: '한쪽',
        label: '메신저 한쪽',
        summary: '메신저처럼 캐릭터는 왼쪽, 사용자는 오른쪽에 같은 크기의 작은 원형 초상과 말풍선이 번갈아 놓입니다.',
        fonts: [FONT.pretendard],
        wrapperPad: '0',
        html: `<div class="{p} ${ROLE_CLASS}">
  <div class="{p}__row">
    <div class="{p}__avatar"><div class="{p}__portrait"><risuicon></risuicon></div></div>
    <div class="{p}__main">
      <div class="{p}__name">${ROLE_NAME}</div>
      <div class="{p}__bubble">${BG}<div class="{p}__content"><risutextbox></risutextbox></div></div>
      ${FOOTER}
    </div>
  </div>
</div>`,
        css: `
.{p} { background: var(--{p}-wall); padding: .5rem clamp(.75rem, 3vw, 1.5rem); }
.{p}__row { display: flex; align-items: flex-start; gap: .65rem; max-width: 52rem; margin: 0 auto; }
.{p}__avatar { flex: 0 0 auto; width: var(--{p}-avatar); aspect-ratio: 1; }
.{p}__portrait {
  width: 100%;
  height: 100%;
  padding: 2px;
  border-radius: 50%;
  background: linear-gradient(145deg, var(--{p}-accent), var(--{p}-frame));
  box-shadow: 0 3px 10px var(--{p}-shadow);
}
.{p}__main { flex: 1 1 auto; min-width: 0; display: flex; flex-direction: column; align-items: flex-start; }
.{p}__name { margin: .1rem .25rem .32rem; color: var(--{p}-muted); font-size: .8em; font-weight: 600; }
.{p}__bubble {
  position: relative;
  max-width: min(100%, 36em);
  padding: .8em 1.15em;
  border: 1px solid var(--{p}-line);
  border-radius: 1.15rem;
  border-top-left-radius: .3rem;
  box-shadow: 0 4px 14px var(--{p}-shadow);
}
.{p} .{p}__bg { background: var(--{p}-bg-sheen), var(--{p}-panel); }
.{p}--user .{p}__bg { background: var(--{p}-bg-sheen), var(--{p}-panel-user); }
.{p}__footer { margin: .28rem .2rem 0; font-size: .82em; }
.{p}--user .{p}__row { flex-direction: row-reverse; }
.{p}--user .{p}__main { align-items: flex-end; }
.{p}--user .{p}__bubble { border-radius: 1.15rem; border-top-right-radius: .3rem; }
.{p}--user .{p}__footer { justify-content: flex-end; }
@media (max-width: 560px) { .{p}__bubble { max-width: 100%; } }
${fillAboveCss('var(--{p}-wall)')}`,
        variants: MESSENGER_VARIANTS,
        baseTokens: {
            'font-body': SANS,
            'font-display': SANS,
            'font-size': '15.5px',
            'line-height': '1.7',
            'para-gap': '.7em',
            'dialog-weight': '600',
            avatar: 'clamp(2.65rem, 6vw, 3.25rem)',
        },
    },
    {
        key: 'letter-pair',
        prefix: 'rtlty',
        target: '애정',
        group: '편지',
        layout: '양쪽',
        label: '편지 양쪽',
        summary: '화면을 셋으로 나눠 양옆에 두 사람의 우표 초상을 크게 두고, 가운데에 편지지를 둡니다. 보낸 쪽 초상이 살짝 떠오릅니다.',
        fonts: [FONT.letter],
        wrapperPad: '0 .75rem',
        pair: true,
        html: pairHtml('{p}__frame--stamp'),
        css: `
${PAIR_LAYOUT_CSS}
/* 우표 액자: 어떤 배경 위에서도 깔끔한 톱니 우표 테두리 */
.{p}__frame {
  padding: 6px;
  background: var(--{p}-stamp);
  border: 1px solid var(--{p}-line);
  border-radius: 3px;
  outline: 1px dashed color-mix(in srgb, var(--{p}-muted) 42%, transparent);
  outline-offset: -3px;
  box-shadow: 0 5px 14px var(--{p}-shadow);
  transform: rotate(var(--{p}-tilt-char));
}
.{p}__side--user .{p}__frame { transform: rotate(var(--{p}-tilt-user)); }
.{p} { --{p}-tilt-char: -1.6deg; --{p}-tilt-user: 1.6deg; }
.{p} .x-risu-{p}-pair-char, .{p} .x-risu-{p}-pair-user {
  border: 6px solid var(--{p}-stamp);
  border-radius: 3px;
  background-clip: padding-box;
  outline: 1px dashed color-mix(in srgb, var(--{p}-muted) 42%, transparent);
  outline-offset: -3px;
  box-shadow: 0 10px 24px var(--{p}-shadow);
}
@media (max-width: 1039px) {
  .{p} .x-risu-{p}-pair-char { transform: rotate(var(--{p}-tilt-char)); }
  .{p} .x-risu-{p}-pair-user { transform: rotate(var(--{p}-tilt-user)); }
}
.{p}__side-name {
  font-family: var(--{p}-font-display);
  font-size: 1.2em;
  font-weight: 400;
  padding: 0 .6em;
  border-radius: .2rem;
  border: 1px solid var(--{p}-line);
  background: var(--{p}-paper);
  color: var(--{p}-strong, var(--{p}-ink));
  box-shadow: 0 2px 6px var(--{p}-shadow);
}
.{p}__main {
  padding: 1.3rem clamp(1.05rem, 3.2vw, 1.9rem) .95rem;
  border: 1px solid var(--{p}-line);
  border-radius: .35rem;
  box-shadow: 0 2px 6px var(--{p}-shadow), 0 12px 28px var(--{p}-shadow);
}
.{p} .{p}__bg {
  background-image:
    var(--{p}-bg-sheen),
    repeating-linear-gradient(to bottom, transparent 0, transparent calc(var(--{p}-font-size) * var(--{p}-line-height) - 1px), var(--{p}-rule) calc(var(--{p}-font-size) * var(--{p}-line-height) - 1px), var(--{p}-rule) calc(var(--{p}-font-size) * var(--{p}-line-height)));
  background-color: var(--{p}-paper);
  background-position: 0 0, 0 1.3rem;
}
.{p}--user .{p}__bg { background-color: var(--{p}-paper-user); }
.{p}__speaker {
  padding-bottom: .4rem;
  border-bottom: 1px solid var(--{p}-line);
  font-family: var(--{p}-font-display);
  font-size: 1.15em;
  font-weight: 400;
}
.{p}__footer { margin-top: .75rem; font-family: ${SANS}; font-size: .8em; }
.{p}__content :where(h1, h2, h3, h4, h5, h6) { --risu-font-family: var(--{p}-font-body); font-family: var(--{p}-font-body); }
@media (max-width: 1039px) {
  .{p}__frame { padding: 4px; }
  .{p} .x-risu-{p}-pair-char, .{p} .x-risu-{p}-pair-user { border-width: 4px; }
}`,
        variants: LETTER_VARIANTS,
        baseTokens: {
            'font-body': '"Gowun Batang", "Noto Serif KR", serif',
            'font-display': '"Nanum Pen Script", "Gowun Batang", cursive',
            'font-size': '16px',
            'line-height': '1.9',
            'para-gap': '0',
            'dialog-weight': '700',
        },
    },
    {
        key: 'letter-solo',
        prefix: 'rtlta',
        target: '애정',
        group: '편지',
        layout: '한쪽',
        label: '편지 한쪽',
        summary: '메시지가 한 장의 편지가 됩니다. 머리에 보낸 쪽의 우표 초상이 붙고, 사용자의 답장은 작은 쪽지로 보입니다.',
        fonts: [FONT.letter],
        wrapperPad: '.9rem .75rem',
        html: `<div class="{p} ${ROLE_CLASS}">
  ${BG}
  <div class="{p}__head">
    <div class="{p}__from"><span class="{p}__from-label">From.</span> <span class="{p}__name">${ROLE_NAME}</span></div>
    <div class="{p}__frame"><div class="{p}__portrait"><risuicon></risuicon></div></div>
  </div>
  <div class="{p}__content"><risutextbox></risutextbox></div>
  ${FOOTER}
</div>`,
        css: `
.{p} {
  max-width: 46rem;
  margin: 0 auto;
  padding: 1.35rem clamp(1.15rem, 4vw, 2.25rem) 1.05rem;
  border: 1px solid var(--{p}-line);
  border-radius: .35rem;
  box-shadow: 0 2px 6px var(--{p}-shadow), 0 12px 28px var(--{p}-shadow);
}
.{p} .{p}__bg {
  background-image:
    var(--{p}-bg-sheen),
    repeating-linear-gradient(to bottom, transparent 0, transparent calc(var(--{p}-font-size) * var(--{p}-line-height) - 1px), var(--{p}-rule) calc(var(--{p}-font-size) * var(--{p}-line-height) - 1px), var(--{p}-rule) calc(var(--{p}-font-size) * var(--{p}-line-height)));
  background-color: var(--{p}-paper);
  background-position: 0 0, 0 calc(1.35rem + var(--{p}-stamp-h) + .85rem);
}
.{p}--user .{p}__bg { background-color: var(--{p}-paper-user); }
.{p}__head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  min-height: var(--{p}-stamp-h);
  margin-bottom: .9rem;
  padding-bottom: .55rem;
  border-bottom: 1px solid var(--{p}-line);
}
.{p}__from {
  align-self: flex-end;
  font-family: var(--{p}-font-display);
  font-size: 1.75em;
  line-height: 1.1;
  color: var(--{p}-strong, var(--{p}-ink));
}
.{p}__from-label { font-size: .68em; color: var(--{p}-muted); }
.{p}__frame {
  flex: 0 0 auto;
  width: var(--{p}-stamp-w);
  aspect-ratio: 3 / 4;
  padding: 5px;
  background: var(--{p}-stamp);
  border: 1px solid var(--{p}-line);
  border-radius: 3px;
  outline: 1px dashed color-mix(in srgb, var(--{p}-muted) 42%, transparent);
  outline-offset: -3px;
  box-shadow: 0 4px 12px var(--{p}-shadow);
  transform: rotate(2deg);
}
.{p}__portrait { width: 100%; height: 100%; }
.{p}__footer { margin-top: .75rem; font-family: ${SANS}; font-size: .8em; }
.{p}__content :where(h1, h2, h3, h4, h5, h6) { --risu-font-family: var(--{p}-font-body); font-family: var(--{p}-font-body); }
.{p} { --{p}-stamp-w: clamp(3.8rem, 9vw, 5.2rem); --{p}-stamp-h: calc(var(--{p}-stamp-w) * 4 / 3); }
.{p}--user { max-width: 32rem; }
.{p}.{p}--user { margin: 0 max(0px, calc((100% - 46rem) / 2)) 0 auto; }
@media (max-width: 520px) { .{p} { --{p}-stamp-w: 3.6rem; } }`,
        variants: LETTER_VARIANTS,
        baseTokens: {
            'font-body': '"Gowun Batang", "Noto Serif KR", serif',
            'font-display': '"Nanum Pen Script", "Gowun Batang", cursive',
            'font-size': '16px',
            'line-height': '1.9',
            'para-gap': '0',
            'dialog-weight': '700',
        },
    },

    // ── 3. 세계관 ──
    {
        key: 'fantasy',
        prefix: 'rtfan',
        target: '세계관',
        group: '양피지',
        label: '판타지',
        summary: '이중 테두리와 모서리 장식을 갖춘 양피지 연대기. 밀랍 인장 초상과 장식 첫 글자를 씁니다.',
        fonts: [FONT.serif],
        wrapperPad: '1rem .75rem',
        html: `<div class="{p} ${ROLE_CLASS}">
  ${BG}
  <div class="{p}__head">
    <div class="{p}__portrait"><risuicon></risuicon></div>
    <div class="{p}__title"><span class="{p}__name">${ROLE_NAME}</span><span class="{p}__suffix">의 기록</span></div>
  </div>
  <div class="{p}__content"><risutextbox></risutextbox></div>
  ${FOOTER}
</div>`,
        css: `
.{p} {
  max-width: 50rem;
  margin: 0 auto;
  padding: clamp(1.5rem, 4%, 2.4rem) clamp(1.4rem, 5%, 2.9rem) 1.3rem;
  border-radius: .45rem;
  border: 1px solid var(--{p}-line);
  box-shadow: 0 12px 32px var(--{p}-shadow);
}
/* 양피지 연대기 바탕: 얼룩, 모서리 음영, 이중 세선 테두리 */
.{p} .{p}__bg {
  background:
    var(--{p}-bg-sheen),
    radial-gradient(ellipse at 10% 6%, var(--{p}-stain) 0, transparent 44%),
    radial-gradient(ellipse at 92% 94%, var(--{p}-stain) 0, transparent 42%),
    radial-gradient(ellipse at 50% 50%, transparent 56%, var(--{p}-vignette, transparent) 100%),
    var(--{p}-paper);
  box-shadow:
    var(--{p}-bg-edge),
    inset 0 0 0 1px var(--{p}-line),
    inset 0 0 0 5px transparent,
    inset 0 0 0 6px color-mix(in srgb, var(--{p}-accent) 32%, transparent);
}
.{p}::before, .{p}::after {
  content: "✦";
  position: absolute;
  top: .62rem;
  color: var(--{p}-accent);
  font-size: clamp(.72rem, 1.4vw, 1rem);
  line-height: 1;
  opacity: .78;
  pointer-events: none;
}
.{p}::before { left: .72rem; }
.{p}::after { right: .72rem; }
.{p}__head {
  display: flex;
  align-items: center;
  gap: .95rem;
  margin-bottom: 1.05rem;
  padding-bottom: .75rem;
  border-bottom: 1px solid var(--{p}-line);
}
/* 입체 밀랍 인장 */
.{p}__portrait {
  flex: 0 0 auto;
  width: var(--{p}-seal-w);
  aspect-ratio: 1;
  border-radius: 50%;
  border: clamp(2px, .5vw, 4px) solid var(--{p}-seal);
  box-shadow:
    inset 0 2px 4px rgba(255, 255, 255, .25),
    0 0 0 clamp(2px, .45vw, 3.5px) var(--{p}-seal-dark),
    0 5px 14px var(--{p}-shadow);
}
.{p} { --{p}-seal-w: clamp(3.2rem, 9%, 4.8rem); }
.{p}--user { --{p}-seal-w: clamp(2.6rem, 7%, 3.7rem); }
.{p}__title {
  font-family: var(--{p}-font-display);
  font-size: 1.22em;
  font-weight: 700;
  color: var(--{p}-strong, var(--{p}-ink));
}
.{p}__suffix { color: var(--{p}-muted); font-weight: 400; font-size: .84em; }
.{p}--char .{p}__content .chattext > p:first-child::first-letter {
  float: left;
  margin: .05em .08em 0 0;
  padding: .04em .12em 0 0;
  color: var(--{p}-accent);
  font-family: var(--{p}-font-display);
  font-size: 2.55em;
  line-height: .88;
  font-weight: 700;
}
.{p}__footer { margin-top: .95rem; padding-top: .55rem; border-top: 1px dashed var(--{p}-line); font-size: .85em; }`,
        variants: FANTASY_VARIANTS,
        baseTokens: {
            'font-body': SERIF,
            'font-display': SERIF,
            'font-size': '16px',
            'line-height': '1.85',
            'para-gap': '.9em',
            'dialog-weight': '600',
        },
    },
    {
        key: 'sf',
        prefix: 'rtsf',
        target: '세계관',
        group: '디스플레이',
        label: 'SF',
        summary: '우주선 화면에 뜬 통신 기록. 화면 테두리와 모서리 표식, 정적 주사선, 고정폭 머리글을 씁니다.',
        fonts: [FONT.pretendard, FONT.sf],
        wrapperPad: '.8rem .75rem',
        html: `<div class="{p} ${ROLE_CLASS}">
  ${BG}
  <div class="{p}__screen">
    <div class="{p}__bar">
      <span class="{p}__channel">{{#when::{{role}}::is::char}}TRANSMISSION{{:else}}OUTGOING{{/when}}</span>
      <span class="{p}__sep">//</span>
      <span class="{p}__name">${ROLE_NAME}</span>
      <span class="{p}__signal"></span>
    </div>
    <div class="{p}__body">
      <div class="{p}__portrait"><risuicon></risuicon></div>
      <div class="{p}__content"><risutextbox></risutextbox></div>
    </div>
    ${FOOTER}
  </div>
</div>`,
        css: `
/* 화면 테두리(베젤): 바탕 층(__bg)에 베젤 색과 유리 흐림을 두어 글래스에서도 한 겹만 반투명해집니다. */
.{p} {
  max-width: 54rem;
  margin: 0 auto;
  padding: clamp(5px, 1.2%, 10px);
  border-radius: clamp(.5rem, 1.6%, 1rem);
  box-shadow: 0 0 0 1px var(--{p}-frame), 0 10px 26px rgba(0, 0, 0, .32);
}
.{p} .{p}__bg { background: var(--{p}-bg-sheen), var(--{p}-bezel); }
.{p}__screen {
  position: relative;
  padding: 1rem clamp(1rem, 3vw, 1.65rem) .85rem;
  background:
    repeating-linear-gradient(to bottom, var(--{p}-scan) 0, var(--{p}-scan) 1px, transparent 1px, transparent 3px),
    var(--{p}-panel);
  border-radius: clamp(.35rem, 1%, .65rem);
  box-shadow: inset 0 0 34px var(--{p}-inner-glow), inset 0 0 0 1px var(--{p}-frame);
}
.{p}__screen::before, .{p}__screen::after {
  content: "";
  position: absolute;
  width: clamp(10px, 2.8%, 20px);
  aspect-ratio: 1;
  border: 2px solid var(--{p}-accent);
  opacity: .85;
  pointer-events: none;
}
.{p}__screen::before { top: 6px; left: 6px; border-right: 0; border-bottom: 0; }
.{p}__screen::after { bottom: 6px; right: 6px; border-left: 0; border-top: 0; }
.{p}__bar {
  display: flex;
  align-items: center;
  gap: .55rem;
  margin-bottom: .85rem;
  padding-bottom: .55rem;
  border-bottom: 1px solid var(--{p}-frame);
  font-family: ${MONO};
  font-size: .72em;
  letter-spacing: .12em;
  color: var(--{p}-muted);
}
.{p}__channel {
  display: inline-flex;
  align-items: center;
  gap: .38em;
  padding: .14em .52em;
  border-radius: .22rem;
  background: color-mix(in srgb, var(--{p}-accent) 14%, transparent);
  border: 1px solid color-mix(in srgb, var(--{p}-accent) 36%, transparent);
  color: var(--{p}-accent);
  font-weight: 600;
}
.{p}__channel::before {
  content: "";
  width: .42em;
  height: .42em;
  border-radius: 50%;
  background: var(--{p}-accent);
  box-shadow: 0 0 6px var(--{p}-accent);
}
.{p}__name { color: var(--{p}-strong, var(--{p}-ink)); letter-spacing: .06em; font-weight: 600; }
.{p}__signal {
  margin-left: auto;
  width: 2.2em;
  height: .55em;
  background: repeating-linear-gradient(to right, var(--{p}-accent) 0 3px, transparent 3px 5px);
  opacity: .8;
}
.{p}__body { display: flex; align-items: flex-start; gap: 1rem; }
.{p}__portrait {
  position: relative;
  flex: 0 0 auto;
  width: var(--{p}-portrait-w);
  aspect-ratio: 4 / 5;
  border-radius: .25rem;
  border: 1px solid var(--{p}-accent);
  box-shadow: 0 0 14px var(--{p}-inner-glow);
}
.{p}__portrait::after {
  content: "";
  position: absolute;
  inset: 0;
  background: repeating-linear-gradient(to bottom, transparent 0 2px, var(--{p}-scan-strong) 2px 3px);
  pointer-events: none;
}
.{p} { --{p}-portrait-w: clamp(3.6rem, 11%, 6rem); }
.{p}--user { --{p}-portrait-w: clamp(2.6rem, 7%, 3.6rem); }
.{p}--user .{p}__body { flex-direction: row-reverse; }
.{p}__content { flex: 1 1 auto; }
.{p}__content :where(h1, h2, h3) { color: var(--{p}-accent); }
.{p}__footer { margin-top: .85rem; padding-top: .5rem; border-top: 1px solid var(--{p}-frame); font-family: ${MONO}; font-size: .78em; }`,
        variants: SF_VARIANTS,
        baseTokens: {
            'font-body': SANS,
            'font-display': SANS,
            'font-size': '15px',
            'line-height': '1.75',
            'para-gap': '.8em',
            'dialog-weight': '500',
        },
    },
    {
        key: 'noir',
        prefix: 'rtnoir',
        target: '세계관',
        group: '파일철',
        label: '현대 느와르',
        summary: '수사 파일 한 장. 사다리꼴 파일 탭, 클립으로 고정한 증명사진, 도장을 씁니다.',
        fonts: [FONT.noir],
        wrapperPad: '1.2rem .75rem .6rem',
        html: `<div class="{p} ${ROLE_CLASS}">
  <div class="{p}__tab">{{#when::{{role}}::is::char}}CASE FILE{{:else}}STATEMENT{{/when}} · ${ROLE_NAME}</div>
  <div class="{p}__sheet">
    ${BG}
    <div class="{p}__photo"><div class="{p}__portrait"><risuicon></risuicon></div><div class="{p}__caption">${ROLE_NAME}</div></div>
    <div class="{p}__content"><risutextbox></risutextbox></div>
    ${FOOTER}
  </div>
</div>`,
        css: `
.{p} { max-width: 52rem; margin: 0 auto; padding-top: 1.75rem; }
.{p}__tab {
  position: absolute;
  top: 0;
  left: clamp(.8rem, 3%, 1.6rem);
  max-width: calc(100% - 9rem);
  padding: .34rem 1.65rem .28rem;
  background: var(--{p}-folder);
  clip-path: polygon(7% 0, 93% 0, 100% 100%, 0 100%);
  color: var(--{p}-folder-ink);
  font-family: var(--{p}-font-display);
  font-size: .78em;
  letter-spacing: .12em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.{p}__sheet {
  position: relative;
  padding: 1.45rem clamp(1.05rem, 4vw, 2.1rem) 1.05rem;
  border: 1px solid var(--{p}-line);
  border-top: 6px solid var(--{p}-folder);
  border-radius: 0 .35rem .35rem .35rem;
  box-shadow: 0 8px 22px var(--{p}-shadow);
}
.{p} .{p}__bg { background: var(--{p}-bg-sheen), var(--{p}-paper); }
.{p}__sheet::after {
  content: var(--{p}-stamp);
  position: absolute;
  top: -1.6rem;
  right: clamp(.65rem, 3%, 1.25rem);
  padding: .08rem .52rem;
  border: 2px solid var(--{p}-accent);
  outline: 1px solid color-mix(in srgb, var(--{p}-accent) 55%, transparent);
  outline-offset: 2px;
  border-radius: .2rem;
  color: var(--{p}-accent);
  font-family: var(--{p}-font-display);
  font-size: clamp(.56rem, 1.3vw, .76rem);
  letter-spacing: .2em;
  opacity: .72;
  transform: rotate(-4deg);
  pointer-events: none;
}
/* 이중 금속 클립으로 고정한 증명사진 */
.{p}__photo {
  position: relative;
  float: right;
  width: calc(var(--{p}-portrait-w) + .85rem);
  margin: .3rem 0 .85rem 1.25rem;
  padding: .42rem .42rem .34rem;
  background: var(--{p}-photo);
  border-radius: 2px;
  box-shadow: 0 4px 12px var(--{p}-shadow);
  transform: rotate(2deg);
}
.{p}__photo::before, .{p}__photo::after {
  content: "";
  position: absolute;
  top: -.65rem;
  left: 22%;
  width: clamp(.72rem, 22%, 1.1rem);
  height: clamp(1.55rem, 48%, 2.3rem);
  border: 2px solid var(--{p}-clip);
  border-radius: 999px;
  transform: rotate(-6deg);
  pointer-events: none;
}
.{p}__photo::after {
  top: -.45rem;
  left: calc(22% + 3px);
  width: clamp(.42rem, 13%, .66rem);
  height: clamp(1.1rem, 34%, 1.65rem);
  opacity: .75;
}
.{p}__portrait { width: 100%; aspect-ratio: 3 / 4; filter: var(--{p}-photo-filter); }
.{p}__caption {
  margin-top: .28rem;
  color: var(--{p}-photo-ink);
  font-family: var(--{p}-font-display);
  font-size: .7em;
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.{p}__content::after { content: ""; display: block; clear: both; }
.{p}__footer { clear: both; margin-top: .95rem; padding-top: .55rem; border-top: 1px solid var(--{p}-line); font-size: .82em; }
.{p} { --{p}-portrait-w: clamp(3.4rem, 11%, 5.6rem); }
.{p}--user { --{p}-portrait-w: clamp(2.6rem, 7%, 3.6rem); }
@media (max-width: 520px) { .{p}__sheet::after { display: none; } .{p}__tab { max-width: calc(100% - 1.6rem); } }`,
        variants: NOIR_VARIANTS,
        baseTokens: {
            'font-body': '"Nanum Myeongjo", "Noto Serif KR", serif',
            'font-display': '"Special Elite", "Courier New", ui-monospace, monospace',
            'font-size': '16px',
            'line-height': '1.85',
            'para-gap': '.85em',
            'dialog-weight': '700',
            stamp: '"CONFIDENTIAL"',
        },
    },
    {
        key: 'oriental',
        prefix: 'rtori',
        target: '세계관',
        group: '한지',
        label: '동양풍',
        summary: '족자에 먹으로 쓴 글. 위아래 가로대와 축두, 세로 띠 이름표, 낙관 모양의 초상을 씁니다.',
        fonts: [FONT.oriental],
        wrapperPad: '1.1rem .75rem',
        html: `<div class="{p} ${ROLE_CLASS}">
  ${BG}
  <div class="{p}__band"><span class="{p}__name">${ROLE_NAME}</span></div>
  <div class="{p}__main">
    <div class="{p}__portrait"><risuicon></risuicon></div>
    <div class="{p}__content"><risutextbox></risutextbox></div>
    ${FOOTER}
  </div>
</div>`,
        css: `
.{p}.{p} { display: grid; }
.{p} {
  grid-template-columns: auto minmax(0, 1fr);
  max-width: 52rem;
  margin: 0 auto;
  border-left: 1px solid var(--{p}-line);
  border-right: 1px solid var(--{p}-line);
  box-shadow: 0 6px 20px var(--{p}-shadow);
}
/* 한지 결과 흐림을 바탕 층(__bg)에만 두어 글래스에서도 종이 결이 깨끗하게 비칩니다. */
.{p} .{p}__bg {
  background:
    var(--{p}-bg-sheen),
    repeating-linear-gradient(115deg, var(--{p}-fiber) 0 1px, transparent 1px 9px),
    repeating-linear-gradient(25deg, var(--{p}-fiber) 0 1px, transparent 1px 13px),
    var(--{p}-paper);
  box-shadow:
    var(--{p}-bg-edge),
    inset 0 0 18px color-mix(in srgb, var(--{p}-line) 24%, transparent);
}
/* 족자의 위아래 가로대와 양 끝 축두 */
.{p}::before, .{p}::after {
  content: "";
  position: absolute;
  left: -.55rem;
  right: -.55rem;
  height: clamp(7px, 1.15vw, 11px);
  background:
    linear-gradient(90deg, var(--{p}-accent) 0 .85rem, transparent .85rem, transparent calc(100% - .85rem), var(--{p}-accent) calc(100% - .85rem)),
    var(--{p}-rod);
  border-radius: 999px;
  box-shadow: 0 2px 6px var(--{p}-shadow);
  pointer-events: none;
}
.{p}::before { top: calc(clamp(7px, 1.15vw, 11px) / -2); }
.{p}::after { bottom: calc(clamp(7px, 1.15vw, 11px) / -2); }
.{p}__band {
  display: flex;
  justify-content: center;
  padding: 1.35rem .5rem;
  background: var(--{p}-band);
  color: var(--{p}-band-ink);
  border-right: 1px solid var(--{p}-line);
}
.{p}__name {
  writing-mode: vertical-rl;
  font-family: var(--{p}-font-display);
  font-size: 1.15em;
  letter-spacing: .3em;
  white-space: nowrap;
}
.{p}--user .{p}__band { background: var(--{p}-band-user); }
.{p}__main { min-width: 0; padding: 1.35rem clamp(1.05rem, 4vw, 2.1rem) 1.1rem; }
.{p}__portrait {
  float: right;
  width: var(--{p}-seal-w);
  aspect-ratio: 1;
  margin: 0 0 .75rem 1.05rem;
  padding: clamp(2px, .4vw, 4px);
  border: clamp(2px, .45vw, 4px) double var(--{p}-accent);
  border-radius: .3rem;
  background: var(--{p}-paper);
  box-shadow: 0 3px 10px var(--{p}-shadow);
}
.{p}__portrait > * { border-radius: .15rem !important; }
.{p} { --{p}-seal-w: clamp(3.2rem, 10%, 5.2rem); }
.{p}--user { --{p}-seal-w: clamp(2.6rem, 7%, 3.6rem); }
.{p}__content::after { content: ""; display: block; clear: both; }
.{p}__footer { clear: both; margin-top: .85rem; padding-top: .55rem; border-top: 1px solid var(--{p}-line); font-size: .85em; }
@media (max-width: 520px) {
  .{p} { grid-template-columns: minmax(0, 1fr); }
  .{p}__band { justify-content: flex-start; padding: .48rem 1rem; border-right: 0; border-bottom: 1px solid var(--{p}-line); }
  .{p}__name { writing-mode: horizontal-tb; letter-spacing: .15em; }
}`,
        variants: ORIENTAL_VARIANTS,
        baseTokens: {
            'font-body': SERIF,
            'font-display': '"Song Myung", "Noto Serif KR", serif',
            'font-size': '16px',
            'line-height': '1.9',
            'para-gap': '.9em',
            'dialog-weight': '700',
        },
    },
];

function tokenBlock(prefix, tokens) {
    return Object.entries(tokens)
        .map(([key, value]) => `  --${prefix}-${key}: ${value};`)
        .join('\n');
}

/** 분류와 변주로 프리셋 하나를 만든다. */
export function buildFamilyPreset(family, variant) {
    const p = family.prefix;
    const fill = (text) => text.replaceAll('{p}', p);
    const css = [
        ...family.fonts,
        '',
        wrapperCss(family.wrapperPad),
        '',
        `/* 글꼴과 크기: 본문 글자 크기는 --${p}-font-size로 바꿉니다. */\n.${p} {\n${tokenBlock(p, { ...COMMON_TOKENS, ...family.baseTokens })}\n}`,
        fill(CONTENT_CSS),
        fill(BG_CSS),
        `\n/* 구조: ${family.label} */`,
        fill(family.css),
        '',
        `/* ── 배색과 소재: 이 블록만 바꾸면 같은 분류의 다른 변주가 됩니다. (${variant.label}) ── */\n.${p} {\n${tokenBlock(p, variant.tokens)}\n}`,
        '',
    ].join('\n');

    return {
        id: `preset_${family.key}_${variant.key}`,
        name: `${family.group}:${family.layout ? `${family.layout} ` : ''}${variant.label}`,
        description: `${family.target} · ${family.label} · ${variant.label}\n${family.summary}`,
        groupName: family.group,
        guiHTML: fill(family.html),
        customCSS: css,
        regexRules: family.pair ? [pairRegexRule(p)] : [],
    };
}

/** 목록에 놓이는 순서. 같은 그룹 안에서는 양쪽이 한쪽보다 앞에 온다. */
const FAMILY_ORDER = ['book', 'webnovel', 'messenger-pair', 'messenger-solo', 'letter-pair', 'letter-solo', 'fantasy', 'sf', 'noir', 'oriental'];

export const FAMILY_PRESETS = FAMILY_ORDER.map((key) => THEME_FAMILIES.find((f) => f.key === key))
    .flatMap((family) => family.variants.map((variant) => buildFamilyPreset(family, variant)))
    .map((preset, idx) => ({
        ...preset,
        // 결과물/프리셋 폴더의 파일 이름 (예: 01-서재-크림)
        file: `${String(idx + 1).padStart(2, '0')}-${preset.name.replace(/[:\s]+/g, '-')}`,
    }));
