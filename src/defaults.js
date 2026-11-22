/**
 * 기본 RisuAI 호스트 모사 CSS, 내장 테마 프리셋, 미리보기 샘플 데이터
 */

export const RISU_HOST_CSS = `/* RisuAI Preview Host Simulation */
:root {
  --risu-font-family: "Pretendard", "Noto Sans KR", Arial, sans-serif;
  --FontColorStandard: #fafafa;
  --FontColorBold: #fafafa;
  --FontColorItalic: #8c8d93;
  --FontColorItalicBold: #8c8d93;
  --FontColorQuote1: #8be9fd;
  --FontColorQuote2: #ffb86c;
  --risu-theme-textcolor2: #8be9fd;
}
* { box-sizing: border-box; font-family: var(--risu-font-family); }
button { color: inherit; }
.text-textcolor2 { color: var(--risu-theme-textcolor2); }
.risu-chat { display: flex; max-width: 100%; justify-content: center; }
.risu-test-host {
  margin: 4px 16px;
  padding: 8px;
  flex-grow: 1;
  min-width: 0;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: flex-start;
  max-width: 100%;
  color: #fafafa;
}
@media (max-width: 639px) {
  .risu-test-host { margin: 4px 4px; padding: 4px; }
}
.chattext p { color: var(--FontColorStandard); }
.chattext strong { color: var(--FontColorBold); }
.chattext em { color: var(--FontColorItalic); }
.chattext strong em, .chattext em strong { color: var(--FontColorItalicBold); }
.chattext mark[risu-mark="quote1"] { background: transparent; color: var(--FontColorQuote1); }
.chattext mark[risu-mark="quote2"] { background: transparent; color: var(--FontColorQuote2); }
.chattext mark[risu-mark="blockquote1"] { color: var(--FontColorQuote1); }
.chattext mark[risu-mark="blockquote2"] { color: var(--FontColorQuote2); }

.prose {
  --tw-prose-body: #374151;
  --tw-prose-code: #111827;
  --tw-prose-pre-code: #e5e7eb;
  --tw-prose-pre-bg: #1f2937;
  color: var(--tw-prose-body);
}
.prose-invert {
  --tw-prose-body: #d1d5db;
  --tw-prose-code: #fff;
  --tw-prose-pre-code: #d1d5db;
  --tw-prose-pre-bg: #111827;
}
.prose :where(code) { color: var(--tw-prose-code); }
.prose pre {
  background-color: var(--tw-prose-pre-bg);
  color: var(--tw-prose-pre-code);
}
.prose :where(pre code) * { font-family: inherit; }
.prose :where(code):not(:where([class~="not-prose"], [class~="not-prose"] *)):not(pre code) {
  background-color: var(--tw-prose-pre-bg);
  border-radius: .25rem;
  color: var(--tw-prose-pre-code);
  padding: .125rem .25rem;
}
.hljs-keyword { color: #c678dd; }
.hljs-string { color: #98c379; }

.risu-test-actions { display: flex; justify-content: flex-end; width: 100%; }
.risu-test-action-row { display: flex; align-items: center; margin-left: .5rem; gap: .5rem; }
.risu-test-action-row button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  min-width: 1.5rem;
  min-height: 1.5rem;
  padding: .25rem;
  border: 0;
  background: transparent;
  font-size: 1rem;
  line-height: 1;
}
.risu-test-action-row button > svg { display: block; flex-shrink: 0; }
.risu-test-info { display: flex; align-items: center; gap: .25rem; font-size: .75rem; }
@media (max-width: 639px) {
  .risu-test-action-row .risu-test-desktop-action { display: none; }
}`;

export const SAMPLE_MESSAGES = {
  shortText: '안녕, 오늘 하루는 어땠어?',
  longMarkdown: `<h1>관측 기록</h1>
<p>한글 본문과 English dialogue. <strong>강조 텍스트</strong>와 <em>기울임</em>, <mark risu-mark="quote1">'작은따옴표 생각'</mark> 그리고 <mark risu-mark="quote2">"큰따옴표 대사"</mark>가 함께 표시됩니다.</p>
<h2>목록과 코드 테스트</h2>
<ul>
  <li>직접 텍스트 항목 <strong>강조</strong></li>
  <li>문단 포함 항목 <a href="https://example.com">링크 예시</a> <code>inlineCode()</code></li>
</ul>
<blockquote>인용 블록 영역입니다. 가독성과 대비를 확인하세요.</blockquote>
<pre><code class="hljs"><span class="hljs-keyword">const</span> status = <span class="hljs-string">"OK"</span>;</code></pre>
<table>
  <tr><th>항목</th><th>상태</th><th>비고</th></tr>
  <tr><td>Custom HTML</td><td>활성</td><td>CBS 분기 지원</td></tr>
  <tr><td>Custom CSS</td><td>적용</td><td>호스트 격리</td></tr>
</table>`,
  editingText: '편집 중인 메시지 본문 미리보기입니다. textarea.message-edit-area 스타일이 올바르게 적용되는지 확인합니다.'
};

export const DEFAULT_PRESETS = [
  {
    id: 'preset_starter_card',
    name: '기본 스타터 카드 (Starter Card)',
    description: 'RisuAI 표준 4종 슬롯과 양방향 CBS 분기를 갖춘 깔끔한 라이트 페이퍼 테마',
    guiHTML: `<div class="rtbase {{#when::{{role}}::is::char}}rtbase--char{{/when}}">
  <div class="rtbase__layout">
    <div class="rtbase__profile">
      <div class="rtbase__portrait"><risuicon></risuicon></div>
      <div class="rtbase__name">{{#when::{{role}}::is::char}}{{char}}{{:else}}{{user}}{{/when}}</div>
    </div>
    <div class="rtbase__message">
      <div class="rtbase__content"><risutextbox></risutextbox></div>
      <div class="rtbase__footer">
        <div class="rtbase__info"><risugeninfo></risugeninfo></div>
        <div class="rtbase__actions"><risubuttons></risubuttons></div>
      </div>
    </div>
  </div>
</div>`,
    customCSS: `.risu-chat > div {
  padding: 1rem;
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
}
.rtbase {
  --rtbase-card-width: 68rem;
  --rtbase-text-width: 40rem;
  --rtbase-font-size: 15px;
  --rtbase-line-height: 1.65;
  --rtbase-name-size: var(--rtbase-font-size);
  --rtbase-avatar-width: 11rem;
  --rtbase-avatar-ratio: 4 / 5;
  --rtbase-avatar-position: center 25%;
  --rtbase-code-size: calc(var(--rtbase-font-size) * .9);
  --rtbase-code-leading: 1.5;
  --rtbase-code-ink: var(--rtbase-ink);
  --rtbase-code-bg: var(--rtbase-tint);
  --rtbase-font-body: "Pretendard", "Noto Sans KR", -apple-system, sans-serif;
  --rtbase-font-display: var(--rtbase-font-body);
  --rtbase-font-code: ui-monospace, Consolas, monospace;
  --rtbase-paper: #f8f5ef;
  --rtbase-ink: #302f32;
  --rtbase-muted: #62616a;
  --rtbase-accent: #665082;
  --rtbase-tint: #ebe5f1;
  --rtbase-line: #d9d1df;
  --risu-font-family: var(--rtbase-font-body);
  --FontColorStandard: var(--rtbase-ink);
  --FontColorBold: var(--rtbase-ink);
  --FontColorItalic: var(--rtbase-muted);
  --FontColorItalicBold: var(--rtbase-muted);
  --FontColorQuote1: var(--rtbase-muted);
  --FontColorQuote2: var(--rtbase-accent);
  position: relative;
  isolation: isolate;
  width: 100%;
  max-width: var(--rtbase-card-width);
  min-width: 0;
  margin: 1rem auto;
  padding: clamp(.75rem, 2%, 1.5rem);
  color: var(--rtbase-ink);
  background: var(--rtbase-paper);
  border: 1px solid var(--rtbase-line);
  border-radius: .75rem;
  font-family: var(--rtbase-font-body);
  font-size: var(--rtbase-font-size);
  line-height: var(--rtbase-line-height);
}
.rtbase, .rtbase *, .rtbase *::before, .rtbase *::after {
  box-sizing: border-box;
}
.rtbase__layout {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  gap: 1.25rem;
  width: 100%;
  min-width: 0;
}
.rtbase--char .rtbase__layout { flex-direction: row-reverse; }
.rtbase__profile {
  flex: 1 1 9.5rem;
  min-width: 0;
  max-width: 100%;
}
.rtbase__portrait {
  width: 100%;
  max-width: var(--rtbase-avatar-width);
  aspect-ratio: var(--rtbase-avatar-ratio);
  margin: 0 auto;
  overflow: hidden;
  border-radius: .5rem;
  background: var(--rtbase-tint);
}
.rtbase__portrait > * {
  width: 100% !important;
  height: 100% !important;
  min-width: 0 !important;
  min-height: 0 !important;
  background-size: cover !important;
  background-position: var(--rtbase-avatar-position) !important;
  border: 0 !important;
  border-radius: inherit !important;
}
.rtbase__name {
  --risu-font-family: var(--rtbase-font-display);
  font-family: var(--rtbase-font-display);
  font-size: var(--rtbase-name-size);
  margin-top: .65rem;
  text-align: center;
  font-weight: 700;
  overflow-wrap: anywhere;
}
.rtbase__message {
  flex: 4 1 24rem;
  width: 100%;
  max-width: 100%;
  min-width: 0;
}
.rtbase__content {
  width: 100%;
  max-width: var(--rtbase-text-width);
  min-width: 0;
  margin: 0 auto;
  overflow-wrap: anywhere;
  color: var(--rtbase-ink);
  line-height: var(--rtbase-line-height);
}
.rtbase__content p { margin: 0 0 1em; }
.rtbase__content .chattext {
  --tw-prose-code: var(--rtbase-code-ink);
  --tw-prose-pre-code: var(--rtbase-code-ink);
  --tw-prose-pre-bg: var(--rtbase-code-bg);
  color: var(--rtbase-ink);
  font-size: var(--rtbase-font-size) !important;
  line-height: var(--rtbase-line-height) !important;
}
.rtbase__content :is(p, li, td, th, blockquote) {
  font-size: var(--rtbase-font-size);
  line-height: var(--rtbase-line-height);
}
.rtbase__content h1, .rtbase__content h2, .rtbase__content h3 {
  margin: 1.1em 0 .5em;
  color: var(--rtbase-ink);
  line-height: 1.4;
  font-weight: 700;
}
.rtbase__content h1 { font-size: calc(var(--rtbase-font-size) * 1.5); }
.rtbase__content h2 { font-size: calc(var(--rtbase-font-size) * 1.3); }
.rtbase__content h3 { font-size: calc(var(--rtbase-font-size) * 1.15); }
.rtbase__content em { color: var(--rtbase-muted); }
.rtbase__content mark[risu-mark="quote1"],
.rtbase__content mark[risu-mark="blockquote1"] {
  color: var(--rtbase-muted);
  background: transparent;
}
.rtbase__content mark[risu-mark="quote2"],
.rtbase__content mark[risu-mark="blockquote2"] {
  color: var(--rtbase-accent);
  background: transparent;
}
.rtbase__content blockquote {
  margin: 1em 0;
  padding: .4em 1em;
  border-left: 3px solid var(--rtbase-line);
  color: var(--rtbase-muted);
}
.rtbase__content ul, .rtbase__content ol { padding-left: 1.6em; margin: 1em 0; }
.rtbase__content li { margin: .25em 0; color: var(--rtbase-ink); }
.rtbase__content a { color: var(--rtbase-accent); text-decoration: underline; }
.rtbase__content code {
  --risu-font-family: var(--rtbase-font-code);
  padding: .1em .3em;
  border-radius: .2em;
  color: var(--rtbase-code-ink);
  background: var(--rtbase-code-bg);
  font-family: var(--rtbase-font-code);
  font-size: var(--rtbase-code-size);
}
.rtbase__content pre {
  font-size: var(--rtbase-code-size);
  line-height: var(--rtbase-code-leading);
  max-width: 100%;
  overflow-x: auto;
  padding: 1em;
  color: var(--rtbase-code-ink);
  background: var(--rtbase-code-bg);
  border-radius: .35rem;
}
.rtbase__content pre code { padding: 0; background: transparent; color: inherit; }
.rtbase__content table {
  display: block;
  width: 100%;
  overflow-x: auto;
  border-collapse: collapse;
  margin: 1em 0;
}
.rtbase__content th, .rtbase__content td {
  color: var(--rtbase-ink);
  padding: .55em .75em;
  border-bottom: 1px solid var(--rtbase-line);
  text-align: left;
}
.rtbase__content textarea.message-edit-area {
  width: 100%;
  max-width: 100%;
  color: var(--rtbase-ink) !important;
  background: var(--rtbase-paper) !important;
  border: 1px solid var(--rtbase-line);
  font: inherit;
  font-size: var(--rtbase-font-size) !important;
  line-height: var(--rtbase-line-height) !important;
}
.rtbase__footer {
  display: flex;
  flex-wrap: wrap;
  gap: .75rem;
  align-items: center;
  width: 100%;
  margin-top: 1.25rem;
  padding-top: .75rem;
  border-top: 1px solid var(--rtbase-line);
}
.rtbase__info, .rtbase__actions {
  flex: 1 1 12rem;
  min-width: 0;
  --risu-theme-textcolor2: var(--rtbase-muted);
}
.rtbase__info button, .rtbase__actions button {
  min-height: 2rem;
  padding: .3rem .45rem;
  border-radius: .3rem;
}
.rtbase__info button:hover, .rtbase__actions button:hover {
  background: var(--rtbase-tint);
}`,
    regexRules: [],
    updatedAt: 1730000000000
  },
  {
    id: 'preset_glassmorphism_dark',
    name: '글래스모피즘 다크 카드 (Glassmorphism)',
    description: '반투명 블러 배경과 초상화 패널을 갖춘 모던 다크 카드 테마',
    guiHTML: `<div class="glass-card {{#when::{{role}}::is::char}}glass-card--char{{:else}}glass-card--user{{/when}}">
  <div class="glass-card__main">
    <div class="glass-card__left">
      <div class="glass-card__image-container">
        <div class="glass-card__portrait"><risuicon></risuicon></div>
        <div class="glass-card__photo-label">{{#when::{{role}}::is::char}}{{char}}{{:else}}{{user}}{{/when}}</div>
      </div>
    </div>
    <div class="glass-card__right">
      <div class="glass-card__content"><risutextbox></risutextbox></div>
      <div class="glass-card__footer">
        <div class="glass-card__plugin"><risugeninfo></risugeninfo></div>
        <div class="glass-card__buttons"><risubuttons></risubuttons></div>
      </div>
    </div>
  </div>
</div>`,
    customCSS: `.risu-chat > div {
  padding: 0.75rem;
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
}
.glass-card {
  --glass-bg: rgba(18, 22, 34, 0.76);
  --glass-border: rgba(255, 255, 255, 0.18);
  --glass-ink: #eaf6ff;
  --glass-muted: #9eb3cc;
  --glass-accent: #8be9fd;
  --risu-font-family: "Pretendard", "Noto Sans KR", sans-serif;
  --FontColorStandard: var(--glass-ink);
  --FontColorBold: #ffffff;
  --FontColorItalic: #fbc6e1;
  --FontColorItalicBold: #fbc6e1;
  --FontColorQuote1: #ffcadf;
  --FontColorQuote2: #c2d6ff;
  display: block;
  width: 100%;
  max-width: 68rem;
  min-width: 0;
  margin: 0.75rem auto;
  position: relative;
  box-sizing: border-box;
  background: var(--glass-bg);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid var(--glass-border);
  border-radius: 16px;
  overflow: hidden;
  color: var(--glass-ink);
}
.glass-card, .glass-card * { box-sizing: border-box; }
.glass-card--user {
  border-color: rgba(139, 233, 253, 0.35);
}
.glass-card__main {
  display: flex;
  flex-wrap: wrap;
  min-height: 220px;
}
.glass-card__left {
  flex: 0 0 220px;
  max-width: 100%;
  border-right: 1px solid var(--glass-border);
  display: flex;
  flex-direction: column;
}
.glass-card__image-container {
  flex: 1;
  position: relative;
  min-height: 220px;
  overflow: hidden;
}
.glass-card__portrait {
  width: 100%;
  height: 100%;
}
.glass-card__portrait > * {
  width: 100% !important;
  height: 100% !important;
  min-width: 0 !important;
  min-height: 0 !important;
  background-size: cover !important;
  background-position: center 25% !important;
  border-radius: 0 !important;
}
.glass-card__photo-label {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 12px;
  font-size: 14px;
  font-weight: 600;
  color: #ffffff;
  text-align: center;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.85), transparent);
}
.glass-card__right {
  flex: 1 1 20rem;
  min-width: 0;
  display: flex;
  flex-direction: column;
}
.glass-card__content {
  flex: 1;
  padding: 1.5rem;
  color: var(--glass-ink);
  font-size: 15px;
  line-height: 1.75;
  overflow-wrap: anywhere;
}
.glass-card__content .chattext {
  --tw-prose-code: #c2d6ff;
  --tw-prose-pre-code: #eaf6ff;
  --tw-prose-pre-bg: rgba(0, 0, 0, 0.4);
  font-size: 15px !important;
  line-height: 1.75 !important;
  color: var(--glass-ink);
}
.glass-card__content p { margin: 0 0 0.9em; color: var(--glass-ink); }
.glass-card__content mark[risu-mark="quote1"] {
  color: #ffcadf;
  background: rgba(255, 202, 223, 0.08);
  padding: 1px 4px;
  border-left: 2px solid #ffcadf;
}
.glass-card__content mark[risu-mark="quote2"] {
  color: #c2d6ff;
  background: rgba(194, 214, 255, 0.08);
  padding: 1px 4px;
  border-left: 2px solid #c2d6ff;
}
.glass-card__content textarea.message-edit-area {
  width: 100%;
  color: var(--glass-ink) !important;
  background: rgba(0, 0, 0, 0.35) !important;
  border: 1px solid var(--glass-border);
  font-size: 15px !important;
  line-height: 1.75 !important;
}
.glass-card__footer {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 8px 16px;
  background: rgba(0, 0, 0, 0.25);
  border-top: 1px solid var(--glass-border);
}
.glass-card__plugin, .glass-card__buttons {
  --risu-theme-textcolor2: var(--glass-muted);
  color: var(--glass-muted);
}
@media (max-width: 640px) {
  .glass-card__left {
    flex: 1 1 100%;
    border-right: none;
    border-bottom: 1px solid var(--glass-border);
  }
  .glass-card__image-container {
    min-height: 160px;
    max-height: 200px;
  }
}`,
    regexRules: [],
    updatedAt: 1730000000001
  }
];
