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
const MONO = '"IBM Plex Mono", ui-monospace, Consolas, monospace';

/** 메시지 바깥 래퍼 보정. pad가 0이면 메시지 사이 틈 없이 이어 붙는다. */
function wrapperCss(pad) {
    return `/* 바깥 래퍼: 메시지 폭을 확보하고 가운데 정렬합니다. */
.risu-chat > div {
  padding: ${pad};
  margin: auto;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
}
.risu-chat > div > div {
  width: 100%;
  margin: auto;
  display: flex;
  justify-content: center;
}`;
}

/** 본문 글꼴·색을 RisuAI 기본 규칙과 연결하고 본문 요소를 다듬는 공통 CSS. */
const CONTENT_CSS = `
/* 본문: RisuAI 기본 색·글꼴 변수에 테마 값을 연결합니다. */
.{p} {
  --risu-font-family: var(--{p}-font-body);
  --FontColorStandard: var(--{p}-ink);
  --FontColorBold: var(--{p}-ink);
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
}
.{p}, .{p} *, .{p} *::before, .{p} *::after { box-sizing: border-box; }
/* 바깥 래퍼 보정(.risu-chat > div > div)이 테마 루트를 flex로 바꾸지 않게 루트 배치를 고정합니다. */
.{p}.{p} { display: block; }
.{p}__content {
  min-width: 0;
  color: var(--{p}-ink);
  word-break: keep-all;
  overflow-wrap: anywhere;
}
.{p}__content .chattext {
  --tw-prose-code: var(--{p}-ink);
  --tw-prose-pre-code: var(--{p}-ink);
  --tw-prose-pre-bg: var(--{p}-tint);
  max-width: none;
  color: var(--{p}-ink);
  font-size: var(--{p}-font-size) !important;
  line-height: var(--{p}-line-height) !important;
}
.{p}__content :is(p, li, td, th, blockquote) {
  font-size: var(--{p}-font-size);
  line-height: var(--{p}-line-height);
}
.{p}__content p { margin: 0 0 var(--{p}-para-gap); }
.{p}__content p:last-child { margin-bottom: 0; }
.{p}__content :is(h1, h2, h3, h4, h5, h6) {
  --risu-font-family: var(--{p}-font-display);
  margin: 1.3em 0 .55em;
  color: var(--{p}-ink);
  font-family: var(--{p}-font-display);
  line-height: 1.4;
  font-weight: 700;
}
.{p}__content h1 { font-size: calc(var(--{p}-font-size) * 1.6); }
.{p}__content h2 { font-size: calc(var(--{p}-font-size) * 1.35); }
.{p}__content h3 { font-size: calc(var(--{p}-font-size) * 1.15); }
.{p}__content :is(h4, h5, h6) { font-size: var(--{p}-font-size); }
.{p}__content strong { font-weight: 700; }
.{p}__content em { color: var(--{p}-muted); }
.{p}__content mark[risu-mark="quote1"],
.{p}__content mark[risu-mark="blockquote1"] { color: var(--{p}-muted); background: transparent; }
.{p}__content mark[risu-mark="quote2"],
.{p}__content mark[risu-mark="blockquote2"] {
  color: var(--{p}-dialog);
  font-weight: var(--{p}-dialog-weight);
  background: transparent;
}
.{p}__content blockquote {
  margin: 1em 0;
  padding: .3em 1em;
  border-left: 3px solid var(--{p}-line);
  color: var(--{p}-muted);
}
.{p}__content :is(ul, ol) { margin: 1em 0; padding-left: 1.5em; }
.{p}__content li { margin: .25em 0; color: var(--{p}-ink); }
.{p}__content li::marker { color: var(--{p}-muted); }
.{p}__content a { color: var(--{p}-accent); text-decoration: underline; }
.{p}__content hr { border: 0; border-top: 1px solid var(--{p}-line); margin: 1.5em 0; }
.{p}__content code {
  --risu-font-family: ${MONO};
  padding: .1em .3em;
  border-radius: .2em;
  color: var(--{p}-ink);
  background: var(--{p}-tint);
  font-family: ${MONO};
  font-size: calc(var(--{p}-font-size) * .88);
}
.{p}__content pre {
  max-width: 100%;
  overflow-x: auto;
  padding: .9em 1em;
  color: var(--{p}-ink);
  background: var(--{p}-tint);
  border-radius: .35rem;
  font-size: calc(var(--{p}-font-size) * .88);
  line-height: 1.5;
}
.{p}__content pre code { padding: 0; background: transparent; color: inherit; white-space: pre; overflow-wrap: normal; }
.{p}__content table {
  display: block;
  width: 100%;
  max-width: 100%;
  overflow-x: auto;
  border-collapse: collapse;
  margin: 1em 0;
}
.{p}__content :is(th, td) {
  padding: .5em .7em;
  color: var(--{p}-ink);
  border-bottom: 1px solid var(--{p}-line);
  text-align: left;
  vertical-align: top;
}
.{p}__content th { font-weight: 700; }
.{p}__content img { display: block; max-width: 100%; height: auto; margin: .75em auto; }
.{p}__content textarea.message-edit-area {
  width: 100%;
  max-width: 100%;
  min-width: 0;
  color: var(--{p}-ink) !important;
  background: var(--{p}-edit-bg) !important;
  border: 1px solid var(--{p}-line);
  border-radius: .4rem;
  font: inherit;
  font-size: var(--{p}-font-size) !important;
  line-height: var(--{p}-line-height) !important;
}

/* 조작부: 생성 정보와 버튼 */
.{p}__footer {
  --risu-theme-textcolor2: var(--{p}-muted);
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: .4rem .75rem;
  min-width: 0;
}
.{p}__info, .{p}__actions { min-width: 0; max-width: 100%; }
.{p}__info > div, .{p}__actions > div { flex-wrap: wrap; min-width: 0; gap: .3rem; }
.{p}__actions > div > div { flex-wrap: wrap; min-width: 0; }
.{p}__footer button {
  background: transparent;
  min-height: 1.9rem;
  padding: .25rem .4rem;
  border-radius: .3rem;
  white-space: normal;
}
.{p}__footer button:hover { background: var(--{p}-tint); }
.{p} :is(a, button, textarea):focus-visible { outline: 2px solid var(--{p}-accent); outline-offset: 2px; }

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
}`;

/** 조작부를 평소에는 숨기고, 마우스를 올리거나 휴대폰에서는 흐리게 보이게 한다. */
const QUIET_FOOTER_CSS = `
.{p}__footer { opacity: 0; transition: opacity .2s ease; }
.{p}:hover .{p}__footer, .{p}:focus-within .{p}__footer { opacity: 1; }
@media (hover: none) { .{p}__footer { opacity: .55; } }`;

/**
 * 바탕 층: 카드 뒤에 깔리는 별도 요소. 글래스 변주의 흐림(backdrop-filter)과 모양 있는 바탕(양피지 가장자리 등)을 여기에만 둔다.
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
  -webkit-backdrop-filter: var(--{p}-blur);
  backdrop-filter: var(--{p}-blur);
  box-shadow: var(--{p}-bg-edge);
}`;

/** 모든 분류에 공통으로 들어가는 기본값. 변주가 덮어쓴다. */
const COMMON_TOKENS = {
    'bg-fill': 'transparent',
    blur: 'none',
    'bg-edge': 'none',
};

/** 글래스 변주의 공통 값: 어두운 반투명 면, 뒤 흐림, 얇은 밝은 테두리 */
const GLASS = {
    blur: 'blur(16px) saturate(1.25)',
    'bg-edge': 'inset 0 0 0 1px rgba(255, 255, 255, .13), inset 0 1px 0 rgba(255, 255, 255, .18)',
    'bg-fill': 'linear-gradient(160deg, rgba(255, 255, 255, .07), rgba(255, 255, 255, .015) 65%)',
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
 * 보낸 쪽 칸에는 <risuicon>이, 반대편 칸에는 빈 액자가 들어가고, 정규식이 넣은 반대편 이미지가 그 액자 위에 놓인다.
 */
function pairHtml(frameClass) {
    return `<div class="{p} ${ROLE_CLASS}">
  ${BG}
  <div class="{p}__side {p}__side--char">
    <div class="{p}__frame ${frameClass}">{{#when::{{role}}::is::char}}<div class="{p}__portrait"><risuicon></risuicon></div>{{/when}}</div>
    <div class="{p}__side-name">{{char}}</div>
  </div>
  <div class="{p}__main">
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
 * 양쪽 공통 배치 CSS.
 * - PC: 가장 최근 메시지 하나에서만 두 초상을 꺼내 채팅 영역 양옆에 고정한다. 나머지 메시지는 가운데 열만 차지한다.
 *   RisuAI는 메시지마다 .chat-message-container 상자를 만들고, 새 메시지를 목록 맨 앞에 넣는다(화면에는 맨 아래).
 *   그래서 목록의 첫 상자가 가장 최근 메시지다. 대화가 첫인사뿐이면 목록이 비고 첫인사가 목록 바로 뒤에 온다.
 * - 휴대폰: 메시지마다 위에 두 초상이 마주 본다(고정하지 않음).
 */
const PAIR_LAYOUT_CSS = `
.{p} {
  --{p}-col: 44rem;
  --{p}-gap: clamp(1rem, 2.5vw, 2rem);
  /* PC 고정 초상: 바깥 가장자리에 붙고, 3:4 비율로 칸 폭과 높이 중 먼저 닿는 쪽까지 커집니다.
     남는 폭은 초상과 본문 사이로, 남는 높이는 위아래로 나뉩니다. */
  --{p}-edge: 1rem;
  --{p}-fixed-bottom: 5rem; /* 입력창을 피하는 아래 여백 */
  --{p}-fixed-w: max(8rem, min(calc((100% - var(--{p}-col)) / 2 - var(--{p}-gap) - var(--{p}-edge)), calc((100vh - var(--{p}-edge) - var(--{p}-fixed-bottom)) * 3 / 4)));
  --{p}-pad: 1rem;
  max-width: var(--{p}-col);
  margin: 0 auto;
  padding: .55rem 0;
}
.{p}__side { display: none; }
.{p}__main { min-width: 0; }
.{p}__speaker { margin-bottom: .45rem; color: var(--{p}-muted); font-size: .8em; font-weight: 700; letter-spacing: .02em; }
.{p}--char .{p}__speaker { color: var(--{p}-ink); }
/* 정규식이 넣은 조각은 스스로 숨어 있습니다. 이 테마 안에서만 드러냅니다. */
.{p} .x-risu-{p}-pair { display: block !important; height: 0; margin: 0; padding: 0; }
.{p} .x-risu-{p}-pair-char, .{p} .x-risu-{p}-pair-user {
  display: none;
  background-size: cover;
  background-position: center 22%;
}
/* 투명 토글은 PC의 가장 최근 메시지에서만 보입니다. */
.{p} .x-risu-{p}-fade { display: none; }

/* 고정 초상이 채팅 영역을 기준으로 놓이게 합니다 (이 테마가 채팅에 있을 때만 걸립니다). */
:has(> .default-chat-screen .{p}) { transform: translateZ(0); }

/* PC: 가장 최근 메시지 하나에서만 두 초상을 꺼내 채팅 영역 양옆에 고정합니다.
   가장 최근 메시지가 편집 중이라 이미지가 없으면 그 바로 앞 메시지가, 대화가 첫인사뿐이면 첫인사가 맡습니다. */
@media (min-width: 901px) {
  .chat-message-container:first-child .{p} :is(.x-risu-{p}-pair-char, .x-risu-{p}-pair-user),
  .chat-message-container:first-child:not(:has(.x-risu-{p}-pair)) + .chat-message-container .{p} :is(.x-risu-{p}-pair-char, .x-risu-{p}-pair-user),
  .flex-col-reverse:empty + .risu-chat .{p} :is(.x-risu-{p}-pair-char, .x-risu-{p}-pair-user) {
    display: block;
    position: fixed;
    z-index: 1;
    /* 입력창을 뺀 영역의 세로 가운데: 위아래를 정하고 margin auto로 가운데에 둡니다 (transform을 쓰지 않아야 토글 앵커가 맞습니다) */
    top: var(--{p}-edge);
    bottom: var(--{p}-fixed-bottom);
    margin-block: auto;
    width: var(--{p}-fixed-w);
    aspect-ratio: 3 / 4;
    transition: opacity .3s ease, filter .3s ease, translate .3s ease, scale .3s ease;
  }
  .chat-message-container:first-child .{p} .x-risu-{p}-pair-char,
  .chat-message-container:first-child:not(:has(.x-risu-{p}-pair)) + .chat-message-container .{p} .x-risu-{p}-pair-char,
  .flex-col-reverse:empty + .risu-chat .{p} .x-risu-{p}-pair-char {
    left: var(--{p}-edge);
    transform: rotate(var(--{p}-tilt-char));
    anchor-name: --{p}-portrait-char;
  }
  .chat-message-container:first-child .{p} .x-risu-{p}-pair-user,
  .chat-message-container:first-child:not(:has(.x-risu-{p}-pair)) + .chat-message-container .{p} .x-risu-{p}-pair-user,
  .flex-col-reverse:empty + .risu-chat .{p} .x-risu-{p}-pair-user {
    right: var(--{p}-edge);
    transform: rotate(var(--{p}-tilt-user));
  }
  /* 말하는 쪽: 살짝 떠오르고 아래에 옅은 그림자가 집니다.
     변주마다 쓰는 transform·box-shadow를 덮지 않도록 translate·scale·filter만 씁니다. */
  .chat-message-container:first-child .{p}--char .x-risu-{p}-pair-char,
  .chat-message-container:first-child:not(:has(.x-risu-{p}-pair)) + .chat-message-container .{p}--char .x-risu-{p}-pair-char,
  .flex-col-reverse:empty + .risu-chat .{p}--char .x-risu-{p}-pair-char,
  .chat-message-container:first-child .{p}--user .x-risu-{p}-pair-user,
  .chat-message-container:first-child:not(:has(.x-risu-{p}-pair)) + .chat-message-container .{p}--user .x-risu-{p}-pair-user,
  .flex-col-reverse:empty + .risu-chat .{p}--user .x-risu-{p}-pair-user {
    translate: 0 -4px;
    scale: 1.015;
    filter: drop-shadow(0 14px 12px rgba(0, 0, 0, .22));
  }
  /* 투명 토글: 왼쪽 초상 안쪽 왼쪽 위 귀퉁이의 작은 단추. 누르면 두 초상이 거의 투명해져 배경이 보입니다.
     초상 높이는 채팅 영역 폭에 따라 달라 CSS 계산으로는 세로 위치를 맞출 수 없으므로, 앵커 위치 지정으로 초상에 붙입니다.
     앵커를 지원하지 않는 브라우저에서는 채팅 영역 위쪽, 초상과 같은 세로선에 놓입니다. */
  .chat-message-container:first-child .{p} .x-risu-{p}-fade,
  .chat-message-container:first-child:not(:has(.x-risu-{p}-pair)) + .chat-message-container .{p} .x-risu-{p}-fade,
  .flex-col-reverse:empty + .risu-chat .{p} .x-risu-{p}-fade {
    display: block;
    position: fixed;
    z-index: 2;
    top: calc(var(--{p}-edge) + .6rem);
    left: calc(var(--{p}-edge) + .6rem);
    margin: 0;
  }
  @supports (anchor-name: --a) {
    .chat-message-container:first-child .{p} .x-risu-{p}-fade,
    .chat-message-container:first-child:not(:has(.x-risu-{p}-pair)) + .chat-message-container .{p} .x-risu-{p}-fade,
    .flex-col-reverse:empty + .risu-chat .{p} .x-risu-{p}-fade {
      position-anchor: --{p}-portrait-char;
      top: calc(anchor(top) + .6rem);
      left: calc(anchor(left) + .6rem);
    }
  }
  .{p} .x-risu-{p}-fade > summary {
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
    background: rgba(0, 0, 0, .32);
    -webkit-backdrop-filter: blur(6px);
    backdrop-filter: blur(6px);
    box-shadow: inset 0 0 0 1px rgba(255, 255, 255, .25);
    opacity: .7;
    transition: opacity .2s ease, background .2s ease;
    user-select: none;
  }
  .{p} .x-risu-{p}-fade > summary::-webkit-details-marker { display: none; }
  .{p} .x-risu-{p}-fade > summary::before { content: "◐"; }
  .{p} .x-risu-{p}-fade > summary:hover,
  .{p} .x-risu-{p}-fade[open] > summary { opacity: 1; background: rgba(0, 0, 0, .5); }
  .{p}.{p} .x-risu-{p}-pair.x-risu-{p}-pair:has(> .x-risu-{p}-fade[open]) :is(.x-risu-{p}-pair-char, .x-risu-{p}-pair-user) {
    opacity: .08;
    translate: none;
    scale: none;
    filter: none;
  }
}

/* 휴대폰: 메시지마다 위에 두 초상이 마주 봅니다 */
@media (max-width: 900px) {
  .{p}.{p} { display: grid; }
  .{p} {
    --{p}-side-w: 6rem;
    grid-template-columns: 1fr 1fr;
    row-gap: .8rem;
    column-gap: .6rem;
    max-width: none;
    padding: var(--{p}-pad) 0;
  }
  .{p}__side { display: flex; flex-direction: row; align-items: center; gap: .6rem; min-width: 0; }
  .{p}__side--char { grid-column: 1; grid-row: 1; justify-content: flex-start; }
  .{p}__side--user { grid-column: 2; grid-row: 1; flex-direction: row-reverse; justify-content: flex-start; }
  .{p}__frame { position: relative; width: var(--{p}-side-w); flex: 0 0 auto; aspect-ratio: 3 / 4; }
  .{p}__portrait { width: 100%; height: 100%; border-radius: inherit; }
  .{p}__side-name { min-width: 0; color: var(--{p}-muted); font-size: .78em; font-weight: 600; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .{p}__main { grid-column: 1 / -1; grid-row: 2; }
  .{p}__speaker { display: none; }
  .{p}--char .{p}__side--char .{p}__side-name, .{p}--user .{p}__side--user .{p}__side-name { color: var(--{p}-ink); }
  /* 말하는 쪽 초상: 살짝 떠오르고 아래에 옅은 그림자 */
  .{p}--char .{p}__side--char .{p}__frame, .{p}--user .{p}__side--user .{p}__frame {
    translate: 0 -3px;
    scale: 1.04;
    filter: drop-shadow(0 8px 7px rgba(0, 0, 0, .2));
  }
  .{p} .x-risu-{p}-pair-char, .{p} .x-risu-{p}-pair-user {
    position: absolute;
    top: var(--{p}-pad);
    width: var(--{p}-side-w);
    aspect-ratio: 3 / 4;
  }
  .{p}--user .x-risu-{p}-pair-char { display: block; left: 0; }
  .{p}--char .x-risu-{p}-pair-user { display: block; right: 0; }
}`;

// ───────────────────────── 변주 배색 ─────────────────────────
// 배경에는 높은 채도를 쓰지 않는다. 바탕은 낮은 채도의 백색·갈색·남색·먹색 계열, 강조색은 하나만 낮은 채도로.

const BOOK_VARIANTS = [
    {
        key: 'cream',
        label: '크림',
        tokens: { paper: '#f6f0e3', ink: '#2e2a25', muted: '#7b7266', accent: '#9a7452', dialog: '#2e2a25', line: '#ddd2bf', tint: '#ece3d1', 'edit-bg': '#fbf7ee', gutter: 'rgba(80, 60, 30, .10)' },
    },
    {
        key: 'sepia',
        label: '세피아',
        tokens: { paper: '#e9dabb', ink: '#3b2c1c', muted: '#7d6748', accent: '#86583a', dialog: '#3b2c1c', line: '#d2bb92', tint: '#dfca9f', 'edit-bg': '#f3e6cb', gutter: 'rgba(80, 50, 20, .14)' },
    },
    {
        key: 'night',
        label: '밤',
        tokens: { paper: '#1b1a18', ink: '#d9d2c3', muted: '#8f887a', accent: '#b49a72', dialog: '#efe6d3', line: '#34312c', tint: '#26241f', 'edit-bg': '#22201c', gutter: 'rgba(0, 0, 0, .35)' },
    },
    {
        key: 'glass',
        label: '글래스',
        tokens: { ...GLASS, paper: 'rgba(16, 17, 22, .38)', ink: '#ece8e0', muted: 'rgba(230, 226, 218, .66)', accent: '#d9c3a0', dialog: '#ffffff', line: 'rgba(255, 255, 255, .14)', tint: 'rgba(255, 255, 255, .07)', 'edit-bg': 'rgba(10, 11, 15, .5)', gutter: 'rgba(0, 0, 0, .2)' },
    },
];

const WEBNOVEL_VARIANTS = [
    {
        key: 'dark',
        label: '검정',
        tokens: { paper: '#141414', ink: '#e4e2de', muted: '#9a9792', accent: '#c8b89a', dialog: '#ffffff', line: '#2c2c2c', tint: '#1f1e1c', 'edit-bg': '#1b1b1b' },
    },
    {
        key: 'white',
        label: '흰색',
        tokens: { paper: '#fbfaf8', ink: '#262422', muted: '#7a7570', accent: '#7a6a58', dialog: '#111111', line: '#e6e2dc', tint: '#f1ede7', 'edit-bg': '#ffffff' },
    },
    {
        key: 'bluegray',
        label: '회청',
        tokens: { paper: '#20252c', ink: '#d3d8de', muted: '#8a939e', accent: '#a9b4be', dialog: '#eef1f4', line: '#323a44', tint: '#29303a', 'edit-bg': '#242a32' },
    },
    {
        key: 'glass',
        label: '글래스',
        tokens: { ...GLASS, paper: 'rgba(14, 15, 19, .4)', ink: '#ecebe8', muted: 'rgba(230, 229, 225, .66)', accent: '#d8ccb6', dialog: '#ffffff', line: 'rgba(255, 255, 255, .14)', tint: 'rgba(255, 255, 255, .07)', 'edit-bg': 'rgba(10, 11, 15, .5)' },
    },
];

// 메신저 양쪽·한쪽이 함께 쓴다.
const MESSENGER_VARIANTS = [
    {
        key: 'white',
        label: '백색',
        tokens: { wall: '#f3f0eb', panel: '#fffdf9', 'panel-user': '#f7f2ea', ink: '#2b2724', muted: '#857c72', accent: '#8a6f55', dialog: '#5e4630', frame: '#e4ddd2', shadow: 'rgba(60, 45, 30, .08)', line: '#e5ded3', tint: '#f1ebe2', 'edit-bg': '#ffffff' },
    },
    {
        key: 'brown',
        label: '갈색',
        tokens: { wall: '#2a231f', panel: '#352c26', 'panel-user': '#3d332c', ink: '#ece3d8', muted: '#b0a190', accent: '#c9a77c', dialog: '#e6c9a0', frame: '#4b3f36', shadow: 'rgba(0, 0, 0, .3)', line: '#4a3d34', tint: '#40352e', 'edit-bg': '#2f2722' },
    },
    {
        key: 'navy',
        label: '남색',
        tokens: { wall: '#161c29', panel: '#1e2636', 'panel-user': '#242d40', ink: '#e3e6ec', muted: '#98a1b2', accent: '#c2a86e', dialog: '#e2cf9e', frame: '#2d3750', shadow: 'rgba(0, 0, 0, .35)', line: '#2c3650', tint: '#283149', 'edit-bg': '#1a2130' },
    },
    {
        key: 'glass',
        label: '글래스',
        tokens: { ...GLASS, wall: 'transparent', panel: 'rgba(16, 18, 24, .42)', 'panel-user': 'rgba(30, 32, 40, .42)', ink: '#eef0f4', muted: 'rgba(228, 230, 236, .66)', accent: '#e3cfae', dialog: '#ffffff', frame: 'rgba(255, 255, 255, .16)', shadow: 'rgba(0, 0, 0, .25)', line: 'rgba(255, 255, 255, .13)', tint: 'rgba(255, 255, 255, .07)', 'edit-bg': 'rgba(10, 11, 15, .5)' },
    },
];

// 편지 양쪽·한쪽이 함께 쓴다.
const LETTER_VARIANTS = [
    {
        key: 'cream',
        label: '미색',
        tokens: { paper: '#faf6ee', 'paper-user': '#f3ede1', rule: '#ebe2d2', ink: '#3d342b', muted: '#8a7d6c', accent: '#9a6b4b', dialog: '#7a4a2e', stamp: '#fffdf8', shadow: 'rgba(80, 55, 25, .12)', line: '#e2d7c4', tint: '#f0e8da', 'edit-bg': '#fffdf8' },
    },
    {
        key: 'kraft',
        label: '크라프트지',
        tokens: { paper: '#d8c29f', 'paper-user': '#cfb791', rule: '#c4ab84', ink: '#33261a', muted: '#6e5940', accent: '#6f4426', dialog: '#5a3418', stamp: '#f4ead8', shadow: 'rgba(60, 40, 15, .2)', line: '#bea47c', tint: '#cdb68f', 'edit-bg': '#e6d5b8' },
    },
    {
        key: 'navy',
        label: '남색 편지지',
        tokens: { paper: '#1f2740', 'paper-user': '#242d48', rule: '#2c3552', ink: '#e6e2d6', muted: '#a3a7b8', accent: '#c9b07a', dialog: '#e5cf9a', stamp: '#e9e4d6', shadow: 'rgba(0, 0, 0, .35)', line: '#333d5c', tint: '#2a3350', 'edit-bg': '#1b2238' },
    },
    {
        key: 'glass',
        label: '글래스',
        tokens: { ...GLASS, paper: 'rgba(16, 17, 22, .4)', 'paper-user': 'rgba(28, 29, 36, .42)', rule: 'rgba(255, 255, 255, .07)', ink: '#eeece6', muted: 'rgba(230, 228, 222, .66)', accent: '#e0cba6', dialog: '#ffffff', stamp: 'rgba(255, 255, 255, .85)', shadow: 'rgba(0, 0, 0, .25)', line: 'rgba(255, 255, 255, .13)', tint: 'rgba(255, 255, 255, .07)', 'edit-bg': 'rgba(10, 11, 15, .5)' },
    },
];

const FANTASY_VARIANTS = [
    {
        key: 'ancient',
        label: '황토',
        tokens: { paper: '#ecdcb6', stain: 'rgba(140, 95, 45, .16)', ink: '#3b2a18', muted: '#7d6646', accent: '#7c3a26', dialog: '#5e2a18', seal: '#8b3226', 'seal-dark': '#5e2018', shadow: 'rgba(60, 35, 10, .28)', line: '#c4aa82', tint: '#e2cfa6', 'edit-bg': '#f4e7cb' },
    },
    {
        key: 'elven',
        label: '숲',
        tokens: { paper: '#dfdcc4', stain: 'rgba(80, 95, 50, .14)', ink: '#26301f', muted: '#5f6a52', accent: '#7f7238', dialog: '#3f5132', seal: '#4f6038', 'seal-dark': '#8f7f40', shadow: 'rgba(30, 40, 20, .25)', line: '#b3b28f', tint: '#d3d0b4', 'edit-bg': '#ebe9d6' },
    },
    {
        key: 'demon',
        label: '진홍',
        tokens: { paper: '#22171a', stain: 'rgba(140, 40, 50, .14)', ink: '#e5d6c9', muted: '#a08d80', accent: '#b8995a', dialog: '#d98a8a', seal: '#7e2630', 'seal-dark': '#b8995a', shadow: 'rgba(0, 0, 0, .5)', line: '#45292d', tint: '#2d1f22', 'edit-bg': '#1e1416' },
    },
    {
        key: 'glass',
        label: '글래스',
        tokens: { ...GLASS, paper: 'rgba(22, 18, 14, .42)', stain: 'rgba(255, 220, 160, .05)', ink: '#efe8dc', muted: 'rgba(235, 226, 210, .66)', accent: '#dcc497', dialog: '#ffffff', seal: 'rgba(170, 80, 60, .85)', 'seal-dark': 'rgba(220, 196, 151, .8)', shadow: 'rgba(0, 0, 0, .25)', line: 'rgba(255, 255, 255, .14)', tint: 'rgba(255, 255, 255, .07)', 'edit-bg': 'rgba(10, 11, 15, .5)' },
    },
];

const SF_VARIANTS = [
    {
        key: 'observatory',
        label: '청록',
        tokens: { bezel: '#0a1114', panel: '#0e181c', frame: '#21363b', scan: 'rgba(130, 200, 200, .035)', 'scan-strong': 'rgba(8, 24, 26, .35)', 'inner-glow': 'rgba(95, 183, 180, .10)', ink: '#d5e8e7', muted: '#7f9a9b', accent: '#6fb3ae', dialog: '#a9dcd8', line: '#21363b', tint: '#13252a', 'edit-bg': '#0b1518' },
    },
    {
        key: 'alert',
        label: '적색',
        tokens: { bezel: '#130a0a', panel: '#1a0f0f', frame: '#45231f', scan: 'rgba(230, 110, 100, .035)', 'scan-strong': 'rgba(30, 6, 6, .35)', 'inner-glow': 'rgba(208, 100, 92, .11)', ink: '#efdcd9', muted: '#a88783', accent: '#cf6e64', dialog: '#eba79f', line: '#45231f', tint: '#271514', 'edit-bg': '#160c0c' },
    },
    {
        key: 'lab',
        label: '백색',
        tokens: { bezel: '#d9dfe3', panel: '#f1f3f4', frame: '#c6ced4', scan: 'rgba(40, 60, 80, .028)', 'scan-strong': 'rgba(255, 255, 255, .16)', 'inner-glow': 'rgba(74, 106, 128, .06)', ink: '#1f2a31', muted: '#5f6d77', accent: '#4f6b80', dialog: '#2f4a5e', line: '#c6ced4', tint: '#e2e7ea', 'edit-bg': '#ffffff' },
    },
    {
        key: 'glass',
        label: '글래스',
        tokens: { ...GLASS, bezel: 'rgba(10, 14, 18, .35)', panel: 'rgba(12, 16, 20, .4)', frame: 'rgba(255, 255, 255, .14)', scan: 'rgba(255, 255, 255, .025)', 'scan-strong': 'rgba(0, 0, 0, .15)', 'inner-glow': 'rgba(180, 220, 220, .06)', ink: '#e9eef0', muted: 'rgba(225, 232, 235, .66)', accent: '#bcd6d3', dialog: '#ffffff', line: 'rgba(255, 255, 255, .13)', tint: 'rgba(255, 255, 255, .07)', 'edit-bg': 'rgba(10, 11, 15, .5)' },
    },
];

const NOIR_VARIANTS = [
    {
        key: 'mono',
        label: '흑백',
        tokens: { paper: '#ebe8e1', folder: '#bfae88', 'folder-ink': '#3a3125', photo: '#fbfaf7', 'photo-ink': '#333333', 'photo-filter': 'grayscale(1) contrast(1.05)', clip: '#8d9096', ink: '#1f1f1f', muted: '#5f5f5f', accent: '#a32f26', dialog: '#1f1f1f', shadow: 'rgba(0, 0, 0, .28)', line: '#cfcabf', tint: '#dedad1', 'edit-bg': '#f5f3ee' },
    },
    {
        key: 'newspaper',
        label: '신문지',
        tokens: { paper: '#e6d9be', folder: '#8a7350', 'folder-ink': '#f1e7d0', photo: '#f3ecda', 'photo-ink': '#3a2e20', 'photo-filter': 'sepia(.8) contrast(1.05)', clip: '#7d7466', ink: '#2b2218', muted: '#6b5a43', accent: '#76321f', dialog: '#2b2218', shadow: 'rgba(60, 40, 15, .3)', line: '#cbb995', tint: '#dacaa8', 'edit-bg': '#efe5cf', stamp: '"EXTRA"' },
    },
    {
        key: 'night',
        label: '야간',
        tokens: { paper: '#1c1e23', folder: '#2b2e35', 'folder-ink': '#d4a24c', photo: '#25282e', 'photo-ink': '#cfc8bb', 'photo-filter': 'grayscale(.7) sepia(.25) contrast(1.05)', clip: '#6c6e74', ink: '#ddd7cb', muted: '#9b958a', accent: '#d4a24c', dialog: '#f0d9a8', shadow: 'rgba(0, 0, 0, .45)', line: '#34373e', tint: '#26292f', 'edit-bg': '#181a1e', stamp: '"NIGHT SHIFT"' },
    },
    {
        key: 'glass',
        label: '글래스',
        tokens: { ...GLASS, paper: 'rgba(16, 17, 20, .42)', folder: 'rgba(255, 255, 255, .12)', 'folder-ink': '#e6dcc8', photo: 'rgba(255, 255, 255, .85)', 'photo-ink': '#333333', 'photo-filter': 'grayscale(.5)', clip: 'rgba(255, 255, 255, .6)', ink: '#ecebe7', muted: 'rgba(230, 229, 225, .66)', accent: '#e3b8a8', dialog: '#ffffff', shadow: 'rgba(0, 0, 0, .25)', line: 'rgba(255, 255, 255, .13)', tint: 'rgba(255, 255, 255, .07)', 'edit-bg': 'rgba(10, 11, 15, .5)' },
    },
];

const ORIENTAL_VARIANTS = [
    {
        key: 'ink',
        label: '먹',
        tokens: { paper: '#f2ede1', fiber: 'rgba(120, 100, 70, .05)', rod: 'linear-gradient(#3a2e25, #1f1812)', band: '#1d1b18', 'band-user': '#4f4a42', 'band-ink': '#f2ede1', ink: '#1d1b18', muted: '#6b645a', accent: '#9a342c', dialog: '#1d1b18', shadow: 'rgba(40, 30, 20, .18)', line: '#d9d0bf', tint: '#e8e1d2', 'edit-bg': '#faf7f0' },
    },
    {
        key: 'celadon',
        label: '청자',
        tokens: { paper: '#e3ece6', fiber: 'rgba(60, 110, 95, .05)', rod: 'linear-gradient(#5c6b62, #3c4741)', band: '#4d7a6d', 'band-user': '#7e9c93', 'band-ink': '#f2f7f4', ink: '#1f3330', muted: '#5d7671', accent: '#4d7a6d', dialog: '#1f3330', shadow: 'rgba(30, 60, 55, .18)', line: '#c3d6cd', tint: '#d6e5de', 'edit-bg': '#f2f7f4' },
    },
    {
        key: 'palace',
        label: '단청',
        tokens: { paper: '#f4e9d4', fiber: 'rgba(140, 90, 40, .05)', rod: 'repeating-linear-gradient(90deg, #8f2a24 0 18px, #3f6b56 18px 30px, #b8954a 30px 36px, #2f4f7a 36px 48px)', band: '#7f2420', 'band-user': '#3f6b56', 'band-ink': '#f5e6c4', ink: '#2a1a14', muted: '#7a5e4a', accent: '#8f2a24', dialog: '#2a1a14', shadow: 'rgba(80, 30, 10, .22)', line: '#dfc8a4', tint: '#ebdbbe', 'edit-bg': '#fbf4e6' },
    },
    {
        key: 'glass',
        label: '글래스',
        tokens: { ...GLASS, paper: 'rgba(16, 16, 18, .42)', fiber: 'rgba(255, 255, 255, .02)', rod: 'linear-gradient(rgba(255,255,255,.35), rgba(255,255,255,.12))', band: 'rgba(255, 255, 255, .12)', 'band-user': 'rgba(255, 255, 255, .07)', 'band-ink': '#f1ede4', ink: '#efebe3', muted: 'rgba(232, 228, 220, .66)', accent: '#e2bfae', dialog: '#ffffff', shadow: 'rgba(0, 0, 0, .25)', line: 'rgba(255, 255, 255, .13)', tint: 'rgba(255, 255, 255, .07)', 'edit-bg': 'rgba(10, 11, 15, .5)' },
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
  ${BG}
  <div class="{p}__page">
    <div class="{p}__name">${ROLE_NAME}</div>
    <div class="{p}__content"><risutextbox></risutextbox></div>
    ${FOOTER}
  </div>
</div>`,
        css: `
.{p} {
  background: var(--{p}-paper);
  padding: 0 clamp(1rem, 5vw, 3rem);
}
.{p}__page {
  max-width: var(--{p}-measure);
  margin: 0 auto;
  padding: 1.4rem 0 1rem;
}
/* 넓은 화면: 페이지 양옆에 책장의 그림자 */
@media (min-width: 900px) {
  .{p}__page {
    padding-left: clamp(1.5rem, 3vw, 2.5rem);
    padding-right: clamp(1.5rem, 3vw, 2.5rem);
    box-shadow: -14px 0 18px -16px var(--{p}-gutter), 14px 0 18px -16px var(--{p}-gutter);
  }
}
.{p}__name { margin-bottom: .6rem; color: var(--{p}-muted); font-size: .78em; letter-spacing: .12em; }
/* 캐릭터의 서술은 장이 바뀌듯 구분 기호로 시작합니다. 크기는 화면 폭에 맞춥니다. */
.{p}--char .{p}__page::before {
  content: var(--{p}-ornament);
  display: block;
  margin-bottom: 1.1rem;
  text-align: center;
  color: var(--{p}-accent);
  font-size: clamp(.95em, 1.6vw, 1.3em);
  letter-spacing: .6em;
}
.{p}--user .{p}__page { padding-top: .4rem; padding-bottom: .6rem; }
.{p}--user .{p}__name { display: none; }
.{p}--user .{p}__content { margin-left: 1.2em; padding-left: .9em; border-left: 2px solid var(--{p}-line); }
.{p}--user .{p}__content .chattext,
.{p}--user .{p}__content :is(p, li) { color: var(--{p}-muted) !important; font-size: calc(var(--{p}-font-size) * .9) !important; }
.{p}__content p { text-indent: var(--{p}-indent); }
.{p}__footer { margin-top: .5rem; }
${QUIET_FOOTER_CSS}`,
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
        summary: '휴대폰 읽기에 맞춘 넓은 문단 간격. 사용자 입력은 고른 선택지처럼 오른쪽에 붙습니다.',
        fonts: [FONT.pretendard],
        wrapperPad: '0',
        html: `<div class="{p} ${ROLE_CLASS}">
  ${BG}
  <div class="{p}__page">
    <div class="{p}__head"><span class="{p}__name">${ROLE_NAME}</span></div>
    <div class="{p}__content"><risutextbox></risutextbox></div>
    ${FOOTER}
  </div>
</div>`,
        css: `
.{p} { background: var(--{p}-paper); padding: 0 clamp(1.1rem, 4vw, 2.5rem); }
.{p}__page { max-width: var(--{p}-measure); margin: 0 auto; padding: 1.6rem 0 1.1rem; }
.{p}__head { display: flex; align-items: center; gap: .7rem; margin-bottom: 1.1rem; color: var(--{p}-accent); font-size: .82em; font-weight: 700; }
.{p}__head::after { content: ""; flex: 1 1 auto; height: 1px; background: var(--{p}-line); }
.{p}--user .{p}__page { display: flex; flex-direction: column; align-items: flex-end; padding: .5rem 0 .9rem; }
.{p}--user .{p}__head { display: none; }
.{p}--user .{p}__content {
  max-width: min(85%, 30em);
  padding: .55em 1em;
  border: 1px solid var(--{p}-line);
  border-left: 3px solid var(--{p}-accent);
  border-radius: .4em;
  background: var(--{p}-tint);
}
.{p}--user .{p}__content .chattext,
.{p}--user .{p}__content :is(p, li) { font-size: calc(var(--{p}-font-size) * .92) !important; line-height: 1.6 !important; }
.{p}--user .{p}__content p { margin-bottom: .4em; }
.{p}__footer { margin-top: .6rem; }
${QUIET_FOOTER_CSS}`,
        variants: WEBNOVEL_VARIANTS,
        baseTokens: {
            'font-body': SANS,
            'font-display': SANS,
            'font-size': '16.5px',
            'line-height': '1.95',
            'para-gap': '1.5em',
            measure: '38em',
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
.{p}__frame { border-radius: .7rem; background: var(--{p}-tint); box-shadow: 0 0 0 1px var(--{p}-frame), 0 6px 16px var(--{p}-shadow); }
.{p} .x-risu-{p}-pair-char, .{p} .x-risu-{p}-pair-user { border-radius: .8rem; box-shadow: 0 0 0 1px var(--{p}-frame), 0 10px 28px var(--{p}-shadow); }
.{p}__main {
  padding: 1rem 1.15rem .8rem;
  background: var(--{p}-panel);
  border: 1px solid var(--{p}-line);
  border-radius: .7rem;
  box-shadow: 0 6px 16px var(--{p}-shadow);
}
.{p}--user .{p}__main { background: var(--{p}-panel-user); }
.{p}__footer { margin-top: .7rem; padding-top: .5rem; border-top: 1px solid var(--{p}-line); font-size: .85em; }`,
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
  ${BG}
  <div class="{p}__row">
    <div class="{p}__avatar"><div class="{p}__portrait"><risuicon></risuicon></div></div>
    <div class="{p}__main">
      <div class="{p}__name">${ROLE_NAME}</div>
      <div class="{p}__bubble"><div class="{p}__content"><risutextbox></risutextbox></div></div>
      ${FOOTER}
    </div>
  </div>
</div>`,
        css: `
.{p} { background: var(--{p}-wall); padding: .45rem clamp(.75rem, 3vw, 1.5rem); }
.{p}__row { display: flex; align-items: flex-start; gap: .6rem; max-width: 52rem; margin: 0 auto; }
/* 두 사람 모두 같은 크기의 원형 초상 */
.{p}__avatar { flex: 0 0 auto; width: var(--{p}-avatar); aspect-ratio: 1; }
.{p}__portrait { width: 100%; height: 100%; border-radius: 50%; background: var(--{p}-tint); box-shadow: 0 0 0 1px var(--{p}-frame); }
.{p}__main { flex: 1 1 auto; min-width: 0; display: flex; flex-direction: column; align-items: flex-start; }
.{p}__name { margin: .1rem .2rem .3rem; color: var(--{p}-muted); font-size: .8em; font-weight: 600; }
.{p}__bubble {
  max-width: min(100%, 34em);
  padding: .65em .95em;
  background: var(--{p}-panel);
  border: 1px solid var(--{p}-line);
  border-radius: 1.05rem;
  border-top-left-radius: .3rem;
  box-shadow: 0 2px 6px var(--{p}-shadow);
}
.{p}__footer { margin: .25rem .2rem 0; font-size: .82em; }
/* 사용자: 오른쪽 */
.{p}--user .{p}__row { flex-direction: row-reverse; }
.{p}--user .{p}__main { align-items: flex-end; }
.{p}--user .{p}__bubble { background: var(--{p}-panel-user); border-radius: 1.05rem; border-top-right-radius: .3rem; }
.{p}--user .{p}__footer { justify-content: flex-end; }
@media (max-width: 560px) { .{p}__bubble { max-width: 100%; } }`,
        variants: MESSENGER_VARIANTS,
        baseTokens: {
            'font-body': SANS,
            'font-display': SANS,
            'font-size': '15.5px',
            'line-height': '1.7',
            'para-gap': '.7em',
            'dialog-weight': '600',
            avatar: 'clamp(2.6rem, 6vw, 3.2rem)',
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
/* 우표: 흰 테두리와 톱니 가장자리 */
.{p}__frame {
  padding: 6px;
  background: var(--{p}-stamp);
  outline: 4px dotted var(--{p}-hole);
  outline-offset: -2px;
  box-shadow: 0 4px 12px var(--{p}-shadow);
  transform: rotate(var(--{p}-tilt-char));
}
.{p}__side--user .{p}__frame { transform: rotate(var(--{p}-tilt-user)); }
.{p} { --{p}-tilt-char: -1.5deg; --{p}-tilt-user: 1.5deg; }
.{p} .x-risu-{p}-pair-char, .{p} .x-risu-{p}-pair-user {
  border: 6px solid var(--{p}-stamp);
  background-clip: padding-box;
  outline: 4px dotted var(--{p}-hole);
  outline-offset: -2px;
  box-shadow: 0 8px 22px var(--{p}-shadow);
}
@media (max-width: 900px) {
  .{p} .x-risu-{p}-pair-char { transform: rotate(var(--{p}-tilt-char)); }
  .{p} .x-risu-{p}-pair-user { transform: rotate(var(--{p}-tilt-user)); }
}
.{p}__side-name { font-family: var(--{p}-font-display); font-size: 1.2em; font-weight: 400; padding: 0 .6em; border-radius: .2rem; background: var(--{p}-paper); color: var(--{p}-ink); box-shadow: 0 2px 6px var(--{p}-shadow); }
.{p}__main {
  padding: 1.2rem clamp(1rem, 3vw, 1.8rem) .9rem;
  background-color: var(--{p}-paper);
  background-image: repeating-linear-gradient(to bottom, transparent 0, transparent calc(var(--{p}-font-size) * var(--{p}-line-height) - 1px), var(--{p}-rule) calc(var(--{p}-font-size) * var(--{p}-line-height) - 1px), var(--{p}-rule) calc(var(--{p}-font-size) * var(--{p}-line-height)));
  background-position: 0 1.2rem;
  border-radius: .25rem;
  box-shadow: 0 1px 3px var(--{p}-shadow), 0 10px 26px var(--{p}-shadow);
}
.{p}--user .{p}__main { background-color: var(--{p}-paper-user); }
.{p}__footer { margin-top: .7rem; font-family: ${SANS}; font-size: .8em; }
.{p}__content :is(h1, h2, h3, h4, h5, h6) { --risu-font-family: var(--{p}-font-body); font-family: var(--{p}-font-body); }
@media (max-width: 900px) { .{p}__frame { padding: 4px; } }`,
        variants: LETTER_VARIANTS,
        baseTokens: {
            'font-body': '"Gowun Batang", "Noto Serif KR", serif',
            'font-display': '"Nanum Pen Script", "Gowun Batang", cursive',
            'font-size': '16px',
            'line-height': '1.9',
            'para-gap': '0',
            'dialog-weight': '700',
            hole: 'var(--risu-theme-bgcolor, #1e1f24)',
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
  padding: 1.3rem clamp(1.1rem, 4vw, 2.2rem) 1rem;
  background-color: var(--{p}-paper);
  background-image: repeating-linear-gradient(to bottom, transparent 0, transparent calc(var(--{p}-font-size) * var(--{p}-line-height) - 1px), var(--{p}-rule) calc(var(--{p}-font-size) * var(--{p}-line-height) - 1px), var(--{p}-rule) calc(var(--{p}-font-size) * var(--{p}-line-height)));
  background-position: 0 calc(1.3rem + var(--{p}-stamp-h) + .8rem);
  border-radius: .25rem;
  box-shadow: 0 1px 3px var(--{p}-shadow), 0 10px 26px var(--{p}-shadow);
}
.{p}__head { display: flex; align-items: flex-start; justify-content: space-between; gap: 1rem; min-height: var(--{p}-stamp-h); margin-bottom: .8rem; }
.{p}__from { align-self: flex-end; font-family: var(--{p}-font-display); font-size: 1.7em; line-height: 1.1; color: var(--{p}-ink); }
.{p}__from-label { font-size: .7em; color: var(--{p}-muted); }
/* 우표 초상: 오른쪽 위 */
.{p}__frame {
  flex: 0 0 auto;
  width: var(--{p}-stamp-w);
  aspect-ratio: 3 / 4;
  padding: 5px;
  background: var(--{p}-stamp);
  outline: 4px dotted var(--{p}-paper);
  outline-offset: -2px;
  box-shadow: 0 3px 10px var(--{p}-shadow);
  transform: rotate(2deg);
}
.{p}__portrait { width: 100%; height: 100%; }
.{p}__footer { margin-top: .7rem; font-family: ${SANS}; font-size: .8em; }
.{p}__content :is(h1, h2, h3, h4, h5, h6) { --risu-font-family: var(--{p}-font-body); font-family: var(--{p}-font-body); }
.{p} { --{p}-stamp-w: clamp(3.8rem, 9vw, 5.2rem); --{p}-stamp-h: calc(var(--{p}-stamp-w) * 4 / 3); }
/* 사용자의 답장: 오른쪽에 붙는 작은 쪽지 */
.{p}--user { max-width: 32rem; background-color: var(--{p}-paper-user); }
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
        summary: '가장자리가 고르지 않은 양피지에 적은 기록. 밀랍 인장 모양의 초상과 장식 첫 글자를 씁니다.',
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
  padding: clamp(1.4rem, 4%, 2.2rem) clamp(1.3rem, 5%, 2.8rem) 1.2rem;
}
/* 양피지: 바탕 층에 얼룩과 고르지 않은 가장자리 */
.{p} .{p}__bg {
  background:
    radial-gradient(ellipse at 12% 8%, var(--{p}-stain) 0, transparent 45%),
    radial-gradient(ellipse at 92% 96%, var(--{p}-stain) 0, transparent 42%),
    radial-gradient(ellipse at 60% 40%, rgba(255, 255, 255, .06) 0, transparent 60%),
    var(--{p}-paper);
  clip-path: polygon(0.6% 1.4%, 8% 0.3%, 19% 1.1%, 33% 0%, 47% 0.9%, 61% 0.2%, 74% 1.2%, 88% 0.1%, 99.4% 1%, 100% 9%, 99.2% 24%, 100% 41%, 99.3% 58%, 100% 74%, 99.1% 90%, 99.6% 98.8%, 90% 99.6%, 76% 98.9%, 62% 100%, 47% 99.1%, 33% 99.9%, 18% 98.8%, 6% 99.7%, 0.4% 98.6%, 0.9% 86%, 0% 70%, 0.8% 53%, 0% 37%, 0.7% 21%);
}
/* 모서리 장식: 카드 폭에 맞춰 크기가 바뀝니다 */
.{p}::before, .{p}::after {
  content: "✦";
  position: absolute;
  top: clamp(.4rem, 1.4%, .9rem);
  color: var(--{p}-accent);
  font-size: clamp(.7rem, 1.6vw, 1.15rem);
  line-height: 1;
  pointer-events: none;
}
.{p}::before { left: clamp(.5rem, 1.8%, 1.1rem); }
.{p}::after { right: clamp(.5rem, 1.8%, 1.1rem); }
.{p}__head { display: flex; align-items: center; gap: .9rem; margin-bottom: 1rem; padding-bottom: .7rem; border-bottom: 1px solid var(--{p}-line); }
/* 밀랍 인장 */
.{p}__portrait {
  flex: 0 0 auto;
  width: var(--{p}-seal-w);
  aspect-ratio: 1;
  border-radius: 50%;
  border: clamp(2px, .5vw, 4px) solid var(--{p}-seal);
  box-shadow: 0 0 0 clamp(2px, .45vw, 4px) var(--{p}-seal-dark), 0 3px 8px var(--{p}-shadow);
}
.{p} { --{p}-seal-w: clamp(3.2rem, 9%, 5rem); }
.{p}--user { --{p}-seal-w: clamp(2.6rem, 7%, 3.8rem); }
.{p}__title { font-family: var(--{p}-font-display); font-size: 1.25em; font-weight: 700; color: var(--{p}-ink); }
.{p}__suffix { color: var(--{p}-muted); font-weight: 400; font-size: .85em; }
.{p}--char .{p}__content .chattext > p:first-child::first-letter {
  float: left;
  margin: .08em .12em 0 0;
  color: var(--{p}-accent);
  font-family: var(--{p}-font-display);
  font-size: 2.9em;
  line-height: .9;
  font-weight: 700;
}
.{p}__footer { margin-top: .9rem; padding-top: .5rem; border-top: 1px dashed var(--{p}-line); font-size: .85em; }`,
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
/* 화면 테두리(베젤) */
.{p} {
  max-width: 54rem;
  margin: 0 auto;
  padding: clamp(5px, 1.2%, 10px);
  background: var(--{p}-bezel);
  border-radius: clamp(.5rem, 1.6%, 1rem);
  box-shadow: 0 0 0 1px var(--{p}-frame), 0 8px 22px rgba(0, 0, 0, .3);
}
.{p}__screen {
  position: relative;
  padding: .9rem clamp(.9rem, 3vw, 1.6rem) .8rem;
  background:
    repeating-linear-gradient(to bottom, var(--{p}-scan) 0, var(--{p}-scan) 1px, transparent 1px, transparent 3px),
    var(--{p}-panel);
  border-radius: clamp(.3rem, 1%, .6rem);
  box-shadow: inset 0 0 30px var(--{p}-inner-glow), inset 0 0 0 1px var(--{p}-frame);
}
/* 모서리 표식: 카드 폭에 맞춰 크기가 바뀝니다 */
.{p}__screen::before, .{p}__screen::after {
  content: "";
  position: absolute;
  width: clamp(10px, 3%, 22px);
  aspect-ratio: 1;
  border: 2px solid var(--{p}-accent);
  pointer-events: none;
}
.{p}__screen::before { top: 5px; left: 5px; border-right: 0; border-bottom: 0; }
.{p}__screen::after { bottom: 5px; right: 5px; border-left: 0; border-top: 0; }
.{p}__bar {
  display: flex;
  align-items: center;
  gap: .5rem;
  margin-bottom: .8rem;
  padding-bottom: .5rem;
  border-bottom: 1px solid var(--{p}-frame);
  font-family: ${MONO};
  font-size: .72em;
  letter-spacing: .14em;
  color: var(--{p}-muted);
}
.{p}__channel { color: var(--{p}-accent); font-weight: 600; }
.{p}__name { color: var(--{p}-ink); letter-spacing: .06em; }
.{p}__signal { margin-left: auto; width: 2.2em; height: .55em; background: repeating-linear-gradient(to right, var(--{p}-accent) 0 3px, transparent 3px 5px); opacity: .8; }
.{p}__body { display: flex; align-items: flex-start; gap: 1rem; }
.{p}__portrait {
  position: relative;
  flex: 0 0 auto;
  width: var(--{p}-portrait-w);
  aspect-ratio: 4 / 5;
  border: 1px solid var(--{p}-accent);
  box-shadow: 0 0 12px var(--{p}-inner-glow);
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
.{p}__content :is(h1, h2, h3) { color: var(--{p}-accent); }
.{p}__footer { margin-top: .8rem; padding-top: .5rem; border-top: 1px solid var(--{p}-frame); font-family: ${MONO}; font-size: .78em; }`,
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
  ${BG}
  <div class="{p}__tab">{{#when::{{role}}::is::char}}CASE FILE{{:else}}STATEMENT{{/when}} · ${ROLE_NAME}</div>
  <div class="{p}__sheet">
    <div class="{p}__photo"><div class="{p}__portrait"><risuicon></risuicon></div><div class="{p}__caption">${ROLE_NAME}</div></div>
    <div class="{p}__content"><risutextbox></risutextbox></div>
    ${FOOTER}
  </div>
</div>`,
        css: `
.{p} { max-width: 52rem; margin: 0 auto; padding-top: 1.7rem; }
/* 사다리꼴 파일 탭 */
.{p}__tab {
  position: absolute;
  top: 0;
  left: clamp(.8rem, 3%, 1.6rem);
  max-width: calc(100% - 9rem);
  padding: .32rem 1.6rem .26rem;
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
  padding: 1.4rem clamp(1rem, 4vw, 2rem) 1rem;
  background: var(--{p}-paper);
  border-top: 6px solid var(--{p}-folder);
  box-shadow: 0 6px 18px var(--{p}-shadow);
}
/* 도장: 파일 탭 오른쪽, 크기는 화면 폭에 맞춥니다 */
.{p}::after {
  content: var(--{p}-stamp);
  position: absolute;
  top: .1rem;
  right: clamp(.8rem, 3%, 1.4rem);
  padding: 0 .45rem;
  border: 2px solid var(--{p}-accent);
  border-radius: .2rem;
  color: var(--{p}-accent);
  font-family: var(--{p}-font-display);
  font-size: clamp(.55rem, 1.3vw, .78rem);
  letter-spacing: .2em;
  opacity: .6;
  transform: rotate(-4deg);
  pointer-events: none;
}
/* 클립으로 고정한 증명사진 */
.{p}__photo {
  position: relative;
  float: right;
  width: calc(var(--{p}-portrait-w) + .8rem);
  margin: .3rem 0 .8rem 1.2rem;
  padding: .4rem .4rem .3rem;
  background: var(--{p}-photo);
  box-shadow: 0 2px 6px var(--{p}-shadow);
  transform: rotate(2deg);
}
.{p}__photo::before {
  content: "";
  position: absolute;
  top: -.6rem;
  left: 22%;
  width: clamp(.7rem, 22%, 1.1rem);
  height: clamp(1.6rem, 50%, 2.4rem);
  border: 2px solid var(--{p}-clip);
  border-radius: 999px;
  transform: rotate(-6deg);
  pointer-events: none;
}
.{p}__portrait { width: 100%; aspect-ratio: 3 / 4; filter: var(--{p}-photo-filter); }
.{p}__caption { margin-top: .25rem; color: var(--{p}-photo-ink); font-family: var(--{p}-font-display); font-size: .7em; text-align: center; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.{p}__content::after { content: ""; display: block; clear: both; }
.{p}__footer { clear: both; margin-top: .9rem; padding-top: .5rem; border-top: 1px solid var(--{p}-line); font-size: .82em; }
.{p} { --{p}-portrait-w: clamp(3.4rem, 11%, 5.6rem); }
.{p}--user { --{p}-portrait-w: clamp(2.6rem, 7%, 3.6rem); }
@media (max-width: 520px) { .{p}::after { display: none; } .{p}__tab { max-width: calc(100% - 1.6rem); } }`,
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
        summary: '족자에 먹으로 쓴 글. 위아래 가로대, 세로 띠 이름표, 낙관 모양의 초상을 씁니다.',
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
  background:
    repeating-linear-gradient(115deg, var(--{p}-fiber) 0 1px, transparent 1px 9px),
    repeating-linear-gradient(25deg, var(--{p}-fiber) 0 1px, transparent 1px 13px),
    var(--{p}-paper);
  border-left: 1px solid var(--{p}-line);
  border-right: 1px solid var(--{p}-line);
  box-shadow: 0 4px 16px var(--{p}-shadow);
}
/* 족자의 위아래 가로대: 카드보다 조금 넓고, 굵기는 카드 폭에 맞춥니다 */
.{p}::before, .{p}::after {
  content: "";
  position: absolute;
  left: -.5rem;
  right: -.5rem;
  height: clamp(6px, 1.1vw, 11px);
  background: var(--{p}-rod);
  border-radius: 999px;
  box-shadow: 0 2px 4px var(--{p}-shadow);
  pointer-events: none;
}
.{p}::before { top: calc(clamp(6px, 1.1vw, 11px) / -2); }
.{p}::after { bottom: calc(clamp(6px, 1.1vw, 11px) / -2); }
/* 세로 띠 이름표 */
.{p}__band { display: flex; justify-content: center; padding: 1.3rem .45rem; background: var(--{p}-band); color: var(--{p}-band-ink); }
.{p}__name { writing-mode: vertical-rl; font-family: var(--{p}-font-display); font-size: 1.15em; letter-spacing: .3em; white-space: nowrap; }
.{p}--user .{p}__band { background: var(--{p}-band-user); }
.{p}__main { min-width: 0; padding: 1.3rem clamp(1rem, 4vw, 2rem) 1.1rem; }
/* 낙관 모양 초상 */
.{p}__portrait {
  float: right;
  width: var(--{p}-seal-w);
  aspect-ratio: 1;
  margin: 0 0 .7rem 1rem;
  padding: clamp(2px, .4vw, 4px);
  border: clamp(2px, .45vw, 4px) double var(--{p}-accent);
  border-radius: .3rem;
  background: var(--{p}-paper);
}
.{p}__portrait > * { border-radius: .15rem !important; }
.{p} { --{p}-seal-w: clamp(3.2rem, 10%, 5.2rem); }
.{p}--user { --{p}-seal-w: clamp(2.6rem, 7%, 3.6rem); }
.{p}__content::after { content: ""; display: block; clear: both; }
.{p}__footer { clear: both; margin-top: .8rem; padding-top: .5rem; border-top: 1px solid var(--{p}-line); font-size: .85em; }
@media (max-width: 520px) {
  .{p} { grid-template-columns: minmax(0, 1fr); }
  .{p}__band { justify-content: flex-start; padding: .45rem 1rem; }
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
