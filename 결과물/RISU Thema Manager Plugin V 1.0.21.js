//@name risu_theme_preset_v3
//@display-name Risu Theme Preset & Preview Manager
//@api 3.0
//@version 1.0.21
//@update-url https://raw.githubusercontent.com/Jh1023494/RTMP/main/dist/risu-theme-preset-v3.js
//@arg disable_display_regex int {{name::프리셋 디스플레이 정규식 끄기}} {{checkbox::활성 프리셋의 정규식을 채팅에 적용하지 않음}}
//@arg default_preview_palette string {{name::미리보기 기본 앱 배색}} {{radio::다크|dark,라이트|light}}
//@link https://github.com/kwaroran/Risuai Documentation

(async () => {
    'use strict';

// === defaults.js ===
/**
 * 기본 RisuAI 호스트 모사 CSS, 내장 테마 프리셋, 미리보기 샘플 데이터
 */

const RISU_HOST_CSS = `/* RisuAI Preview Host Simulation */
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
.risu-vanilla-fallback {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  width: 100%;
  min-width: 0;
}
.risu-vanilla-fallback-avatar {
  flex: 0 0 auto;
  border-radius: 6px;
  overflow: hidden;
}
.risu-vanilla-fallback-body {
  flex: 1 1 auto;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.risu-vanilla-fallback-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  flex-wrap: wrap;
}
.risu-vanilla-fallback-name {
  font-size: 1.05rem;
  font-weight: 700;
}
.risu-vanilla-fallback-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-left: auto;
}
@media (max-width: 639px) {
  .risu-test-action-row .risu-test-desktop-action { display: none; }
}`;

const SAMPLE_MESSAGES = {
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

const DEFAULT_PRESETS = [
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

// === legacy-builtin-fingerprints.js ===
/**
 * 예전 버전(1.1.1까지)이 사용자 저장소에 복사해 둔 기본 프리셋의 지문.
 * 저장된 복사본이 이 지문과 같으면 손대지 않은 복사본이므로, 1회 이전 때 저장소에서 뺀다.
 * 다르면 사용자가 고친 것이므로 "내 프리셋"으로 남긴다. 이 파일은 다시 만들지 않는다.
 */
const LEGACY_BUILTIN_FINGERPRINTS = {
    'preset_book_cream': ['6he-df526af7'],
    'preset_book_night': ['6hd-2951998a'],
    'preset_book_sepia': ['6hf-197bb6db'],
    'preset_compact_dark': ['5tw-295c9836'],
    'preset_compact_light': ['5tw-bb27b0b3'],
    'preset_echo_glass': ['dpn-9c8a0703'],
    'preset_fantasy_ancient': ['6xl-c3e8bdb5'],
    'preset_fantasy_demon': ['6xg-4ffb0156'],
    'preset_fantasy_elven': ['6xj-c1a990ed'],
    'preset_glassmorphism_dark': ['3hr-a865d15a'],
    'preset_letter-pair_cream': ['7uw-7d9e1033'],
    'preset_letter-pair_lavender': ['7uy-bb4af74b'],
    'preset_letter-pair_sky': ['7ux-82242a61'],
    'preset_letter-solo_cream': ['71k-79668718'],
    'preset_letter-solo_lavender': ['71m-6d7d04b8'],
    'preset_letter-solo_sky': ['71l-6a77a1ac'],
    'preset_messenger-pair_midnight': ['7jc-eb2c6c3c'],
    'preset_messenger-pair_mint': ['7jd-ec258183'],
    'preset_messenger-pair_pink': ['7je-54348770'],
    'preset_messenger-solo_midnight': ['7af-2c98eafe'],
    'preset_messenger-solo_mint': ['7ag-b17dcba5'],
    'preset_messenger-solo_pink': ['7ah-cb76686e'],
    'preset_midnight': ['5ex-d9e46c25'],
    'preset_noir_mono': ['7gx-1b509953'],
    'preset_noir_neon': ['7hl-16027909'],
    'preset_noir_newspaper': ['7hp-ca66ff21'],
    'preset_oriental_celadon': ['72m-15244c40'],
    'preset_oriental_ink': ['72m-e17cbe47'],
    'preset_oriental_palace': ['758-d7f142b8'],
    'preset_sepia_note': ['5id-2b470630'],
    'preset_sf_alert': ['7l7-27e5ab3e'],
    'preset_sf_lab': ['7ld-ab2e537e'],
    'preset_sf_observatory': ['7ld-54939f58'],
    'preset_starter_card': ['5hn-b2450378'],
    'preset_webnovel_bluegray': ['6gw-872aff1d'],
    'preset_webnovel_dark': ['6gw-214e2102'],
    'preset_webnovel_white': ['6gw-bfaeef84'],
};

// === storage.js ===
const STORAGE_KEY_STATE = 'risu_theme_preset_v3_state_v1';

function createPresetId() {
    const rand = Math.random().toString(36).slice(2, 8);
    return `preset_${Date.now().toString(36)}_${rand}`;
}

/**
 * 프리셋 내용(HTML·CSS)의 지문. 저장된 복사본이 어느 버전의 기본 프리셋과 똑같은지 가릴 때 쓴다.
 * FNV-1a 32비트와 글자 수를 함께 쓴다.
 */
function presetFingerprint(preset) {
    const text = `${preset?.guiHTML ?? ''}\n\u0000\n${preset?.customCSS ?? ''}`;
    let hash = 0x811c9dc5;
    for (let i = 0; i < text.length; i += 1) {
        hash ^= text.charCodeAt(i);
        hash = Math.imul(hash, 0x01000193) >>> 0;
    }
    return `${text.length.toString(36)}-${hash.toString(16).padStart(8, '0')}`;
}

function createGroupId() {
    const rand = Math.random().toString(36).slice(2, 8);
    return `group_${Date.now().toString(36)}_${rand}`;
}

const NEW_GROUP_BASE_NAME = '새 그룹';

/** "새 그룹 n"에서 비어 있는 가장 작은 n을 골라 이름을 만든다. */
function nextGroupName(groups = []) {
    const used = new Set(groups.map((g) => g.name));
    let n = 1;
    while (used.has(`${NEW_GROUP_BASE_NAME} ${n}`)) {
        n += 1;
    }
    return `${NEW_GROUP_BASE_NAME} ${n}`;
}

function normalizeRegexRuleItem(raw, index = 0) {
    const item = raw && typeof raw === 'object' ? raw : {};
    return {
        id: typeof item.id === 'string' && item.id.trim() ? item.id.trim() : createRegexRuleId(),
        comment: typeof item.comment === 'string' ? item.comment : `규칙 ${index + 1}`,
        in: typeof item.in === 'string' ? item.in : '',
        out: typeof item.out === 'string' ? item.out : '',
        type: typeof item.type === 'string' && item.type.trim() ? item.type.trim() : 'editdisplay',
        flag: typeof item.flag === 'string' ? item.flag : 'g',
        ableFlag: item.ableFlag !== false,
        enabled: item.enabled !== false,
    };
}

function normalizePresetItem(raw, index = 0) {
    const item = raw && typeof raw === 'object' ? raw : {};
    const regexRules = Array.isArray(item.regexRules)
        ? item.regexRules.map((rule, ruleIdx) => normalizeRegexRuleItem(rule, ruleIdx))
        : [];
    return {
        id: typeof item.id === 'string' && item.id.trim() ? item.id.trim() : createPresetId(),
        name: typeof item.name === 'string' && item.name.trim() ? item.name.trim() : `이름 없는 프리셋 ${index + 1}`,
        description: typeof item.description === 'string' ? item.description : '',
        guiHTML: typeof item.guiHTML === 'string' ? item.guiHTML : '',
        customCSS: typeof item.customCSS === 'string' ? item.customCSS : '',
        regexRules,
        groupId: typeof item.groupId === 'string' && item.groupId.trim() ? item.groupId.trim() : null,
        updatedAt: typeof item.updatedAt === 'string' && item.updatedAt ? item.updatedAt : new Date().toISOString(),
    };
}

function presetHasHtml(preset) {
    return typeof preset?.guiHTML === 'string' && preset.guiHTML.trim().length > 0;
}

function presetHasCss(preset) {
    return typeof preset?.customCSS === 'string' && preset.customCSS.trim().length > 0;
}

function presetHasRegex(preset) {
    return Array.isArray(preset?.regexRules) && preset.regexRules.some((rule) => rule && typeof rule.in === 'string' && rule.in.trim().length > 0);
}

/** HTML·CSS·정규식(찾을 패턴이 있는 규칙) 중 하나라도 채워져 있는지 확인한다. */
function hasPresetContent(preset) {
    return presetHasHtml(preset) || presetHasCss(preset) || presetHasRegex(preset);
}

function normalizeGroupList(rawGroups) {
    const seen = new Set();
    const groups = [];
    for (const raw of Array.isArray(rawGroups) ? rawGroups : []) {
        if (!raw || typeof raw !== 'object') {
            continue;
        }
        const id = typeof raw.id === 'string' && raw.id.trim() ? raw.id.trim() : createGroupId();
        if (seen.has(id)) {
            continue;
        }
        seen.add(id);
        groups.push({
            id,
            name: typeof raw.name === 'string' && raw.name.trim() ? raw.name.trim() : nextGroupName(groups),
            collapsed: raw.collapsed === true,
        });
    }
    return groups;
}

/**
 * 그룹 규칙을 맞춘다.
 * - 없는 그룹을 가리키는 프리셋은 그룹에서 뺀다.
 * - 프리셋이 하나 이하인 그룹은 푼다.
 */
function reconcileGroups(presets, rawGroups) {
    let groups = normalizeGroupList(rawGroups);
    const groupIds = new Set(groups.map((g) => g.id));
    let nextPresets = presets.map((p) => (p.groupId && !groupIds.has(p.groupId) ? { ...p, groupId: null } : p));

    const counts = new Map();
    for (const p of nextPresets) {
        if (p.groupId) {
            counts.set(p.groupId, (counts.get(p.groupId) || 0) + 1);
        }
    }
    const alive = new Set(groups.filter((g) => (counts.get(g.id) || 0) >= 2).map((g) => g.id));
    nextPresets = nextPresets.map((p) => (p.groupId && !alive.has(p.groupId) ? { ...p, groupId: null } : p));
    groups = groups.filter((g) => alive.has(g.id));
    return { presets: nextPresets, groups };
}

/**
 * 이름으로 그룹을 찾아 프리셋들을 넣는다. 같은 이름의 그룹이 없으면 만든다.
 * 프리셋이 하나뿐이면 다음 정리 때 그룹이 풀린다.
 */
function assignPresetsToGroupByName(state, presetIds, groupName) {
    const name = typeof groupName === 'string' ? groupName.trim() : '';
    if (!name || !presetIds.length) {
        return state;
    }
    const groups = [...(state.groups || [])];
    let group = groups.find((g) => g.name === name);
    if (!group) {
        group = { id: createGroupId(), name, collapsed: false };
        groups.push(group);
    }
    const ids = new Set(presetIds);
    return normalizePluginState({
        ...state,
        groups,
        presets: state.presets.map((p) => (ids.has(p.id) ? { ...p, groupId: group.id } : p)),
    });
}

/** 프리셋이 속한 그룹 이름 (없으면 null) */
function getPresetGroupName(state, preset) {
    if (!preset || !preset.groupId) {
        return null;
    }
    const group = (state.groups || []).find((g) => g.id === preset.groupId);
    return group ? group.name : null;
}

/**
 * 드래그로 놓은 결과를 상태에 반영한다.
 * drop.type:
 *  - 'into-preset' : 대상 프리셋과 묶는다. 대상이 그룹 안이면 그 그룹에, 아니면 "새 그룹 n"을 만든다.
 *  - 'before' / 'after' : 대상 프리셋 앞/뒤로 옮기고 대상과 같은 그룹(또는 그룹 밖)이 된다.
 *  - 'into-group' : 그 그룹의 맨 뒤로 넣는다.
 *  - 'before-group' : 그룹 밖, 그 그룹 바로 앞으로 옮긴다.
 *  - 'end' : 그룹 밖, 목록 맨 뒤로 옮긴다.
 */
function applyPresetDrop(rawState, dragId, drop) {
    const state = normalizePluginState(rawState);
    const dragged = state.presets.find((p) => p.id === dragId);
    if (!dragged || !drop || (drop.targetId && drop.targetId === dragId)) {
        return state;
    }
    let groups = [...state.groups];
    const rest = state.presets.filter((p) => p.id !== dragId);
    let moved = { ...dragged };
    let insertAt = rest.length;

    const indexOf = (id) => rest.findIndex((p) => p.id === id);
    const lastIndexInGroup = (groupId) => {
        let last = -1;
        rest.forEach((p, i) => {
            if (p.groupId === groupId) {
                last = i;
            }
        });
        return last;
    };
    const firstIndexInGroup = (groupId) => rest.findIndex((p) => p.groupId === groupId);

    if (drop.type === 'into-preset' || drop.type === 'before' || drop.type === 'after') {
        const targetIdx = indexOf(drop.targetId);
        if (targetIdx < 0) {
            return state;
        }
        const target = rest[targetIdx];
        if (drop.type === 'into-preset') {
            let groupId = target.groupId;
            if (!groupId) {
                const group = { id: createGroupId(), name: nextGroupName(groups), collapsed: false };
                groups = [...groups, group];
                groupId = group.id;
                rest[targetIdx] = { ...target, groupId };
            }
            moved.groupId = groupId;
            insertAt = targetIdx + 1;
        } else {
            moved.groupId = target.groupId || null;
            insertAt = drop.type === 'before' ? targetIdx : targetIdx + 1;
        }
    } else if (drop.type === 'into-group') {
        const last = lastIndexInGroup(drop.groupId);
        if (last < 0) {
            return state;
        }
        moved.groupId = drop.groupId;
        insertAt = last + 1;
    } else if (drop.type === 'before-group') {
        const first = firstIndexInGroup(drop.groupId);
        if (first < 0) {
            return state;
        }
        moved.groupId = null;
        insertAt = first;
    } else if (drop.type === 'end') {
        moved.groupId = null;
        insertAt = rest.length;
    } else {
        return state;
    }

    const presets = [...rest.slice(0, insertAt), moved, ...rest.slice(insertAt)];
    return normalizePluginState({ ...state, presets, groups });
}

function renameGroup(rawState, groupId, name) {
    const state = normalizePluginState(rawState);
    const trimmed = typeof name === 'string' ? name.trim() : '';
    if (!trimmed) {
        return state;
    }
    return normalizePluginState({
        ...state,
        groups: state.groups.map((g) => (g.id === groupId ? { ...g, name: trimmed } : g)),
    });
}

function setGroupCollapsed(rawState, groupId, collapsed) {
    const state = normalizePluginState(rawState);
    return normalizePluginState({
        ...state,
        groups: state.groups.map((g) => (g.id === groupId ? { ...g, collapsed: Boolean(collapsed) } : g)),
    });
}

/** 프리셋을 기존 그룹으로 옮기거나(groupId), 새 그룹을 만들어 넣거나(newGroupName), 그룹에서 뺀다(null). */
function movePresetToGroup(rawState, presetId, { groupId = null, newGroupName = null } = {}) {
    const state = normalizePluginState(rawState);
    if (newGroupName) {
        const group = { id: createGroupId(), name: newGroupName, collapsed: false };
        return normalizePluginState({
            ...state,
            groups: [...state.groups, group],
            presets: state.presets.map((p) => (p.id === presetId ? { ...p, groupId: group.id } : p)),
        });
    }
    if (groupId) {
        return applyPresetDrop(state, presetId, { type: 'into-group', groupId });
    }
    const target = state.presets.find((p) => p.id === presetId);
    if (!target || !target.groupId) {
        return state;
    }
    // 그룹에서 빼면 그룹 바로 뒤에 둔다.
    const rest = state.presets.filter((p) => p.id !== presetId);
    let last = -1;
    rest.forEach((p, i) => {
        if (p.groupId === target.groupId) {
            last = i;
        }
    });
    const insertAt = last + 1;
    const presets = [...rest.slice(0, insertAt), { ...target, groupId: null }, ...rest.slice(insertAt)];
    return normalizePluginState({ ...state, presets });
}

function normalizeVanillaBackup(raw) {
    if (!raw || typeof raw !== 'object') {
        return null;
    }
    return {
        theme: typeof raw.theme === 'string' ? raw.theme : '',
        guiHTML: typeof raw.guiHTML === 'string' ? raw.guiHTML : '',
        customCSS: typeof raw.customCSS === 'string' ? raw.customCSS : '',
        capturedAt: typeof raw.capturedAt === 'string' && raw.capturedAt ? raw.capturedAt : new Date().toISOString(),
    };
}

const STATE_SCHEMA_VERSION = 3;

// ───────────────────────── 기본 제공 프리셋 ─────────────────────────
// 기본 제공 프리셋은 저장하지 않고 매번 코드(BUILTIN_PRESETS)에서 읽는다.
// 저장소에는 사용자 프리셋과, 기본 제공 프리셋에 대한 사용자의 선택(숨김, 그룹 펼침)만 남긴다.

let builtinCache = null;

/** 기본 제공 프리셋 목록 (코드 순서). 각 항목에 builtin: true와 groupName이 붙는다. */
function getBuiltinPresets() {
    if (!builtinCache) {
        builtinCache = BUILTIN_PRESETS.map((raw, idx) => ({
            ...normalizePresetItem(raw, idx),
            groupId: null,
            builtin: true,
            groupName: typeof raw.groupName === 'string' && raw.groupName.trim() ? raw.groupName.trim() : null,
        }));
    }
    return builtinCache;
}

function isBuiltinId(id) {
    return getBuiltinPresets().some((p) => p.id === id);
}

function getBuiltinPreset(id) {
    return getBuiltinPresets().find((p) => p.id === id) || null;
}

/** 숨기지 않은 기본 제공 프리셋 */
function getVisibleBuiltins(state) {
    const hidden = new Set(state?.hiddenBuiltinIds || []);
    return getBuiltinPresets().filter((p) => !hidden.has(p.id));
}

/** 목록에 보이는 프리셋 전부: 숨기지 않은 기본 제공 + 사용자 프리셋 */
function getAllPresets(state) {
    return [...getVisibleBuiltins(state), ...(state?.presets || [])];
}

/** id로 프리셋을 찾는다. 사용자 프리셋을 먼저 보고, 없으면 기본 제공(숨긴 것 포함)에서 찾는다. */
function findPreset(state, id) {
    if (!id) {
        return null;
    }
    return (state?.presets || []).find((p) => p.id === id) || getBuiltinPreset(id);
}

/** 기본 제공 프리셋을 숨긴다 (삭제 대신). */
function hideBuiltin(rawState, id) {
    const state = normalizePluginState(rawState);
    if (!isBuiltinId(id)) {
        return state;
    }
    return normalizePluginState({ ...state, hiddenBuiltinIds: [...state.hiddenBuiltinIds, id] });
}

/** 숨긴 기본 제공 프리셋을 다시 보이게 한다. ids를 비우면 모두 되살린다. */
function unhideBuiltins(rawState, ids = null) {
    const state = normalizePluginState(rawState);
    const target = ids ? new Set(ids) : null;
    return normalizePluginState({
        ...state,
        hiddenBuiltinIds: target ? state.hiddenBuiltinIds.filter((id) => !target.has(id)) : [],
    });
}

/** 기본 제공 그룹의 펼침 상태. 기본값은 접힘이다. */
function setBuiltinGroupExpanded(rawState, groupName, expanded) {
    const state = normalizePluginState(rawState);
    const set = new Set(state.expandedBuiltinGroups);
    if (expanded) {
        set.add(groupName);
    } else {
        set.delete(groupName);
    }
    return normalizePluginState({ ...state, expandedBuiltinGroups: [...set] });
}

/** 기본 제공 프리셋의 사용자 복사본을 만든다 (고쳐서 저장하거나 복제할 때). */
function makeUserCopyOfBuiltin(preset, suffix = '(수정)') {
    const builtin = getBuiltinPreset(preset.id);
    const sameName = builtin && preset.name === builtin.name;
    return normalizePresetItem({
        ...preset,
        id: createPresetId(),
        name: sameName ? `${preset.name} ${suffix}` : preset.name,
        groupId: null,
        updatedAt: new Date().toISOString(),
    });
}

// ───────────────────────── 상태 ─────────────────────────

function getDefaultPluginState() {
    return {
        schemaVersion: STATE_SCHEMA_VERSION,
        appliedPresetIds: [],
        stackPresets: false,
        vanillaBackup: null,
        groups: [],
        presets: [],
        hiddenBuiltinIds: [],
        expandedBuiltinGroups: [],
    };
}

/**
 * 1.1.1까지의 저장 형식(기본 제공 프리셋을 목록에 복사해 둔 형식)을 한 번 옮긴다.
 * - 어느 버전의 기본 제공 프리셋과 내용이 똑같은 복사본은 뺀다 (코드에서 읽으므로).
 * - 내용이 다르면 사용자가 고친 것이므로 사용자 프리셋으로 남긴다.
 *   지금 기본 제공 프리셋과 id가 같으면 새 id를 주고 이름에 "(수정)"을 붙인다.
 * - 사용자가 예전에 지운 기본 제공 프리셋(knownBuiltinIds에는 있는데 목록에 없는 것)은 숨김으로 옮긴다.
 */
function migrateLegacyState(raw) {
    const legacyIds = new Set(Object.keys(LEGACY_BUILTIN_FINGERPRINTS));
    const currentBuiltinIds = new Set(getBuiltinPresets().map((p) => p.id));
    const rawPresets = Array.isArray(raw.presets) ? raw.presets : [];

    const kept = [];
    for (const [idx, item] of rawPresets.entries()) {
        const preset = normalizePresetItem(item, idx);
        const wasBuiltin = legacyIds.has(preset.id) || currentBuiltinIds.has(preset.id);
        if (wasBuiltin) {
            const fp = presetFingerprint(preset);
            const knownPrints = new Set([
                ...(LEGACY_BUILTIN_FINGERPRINTS[preset.id] || []),
                ...(currentBuiltinIds.has(preset.id) ? [presetFingerprint(getBuiltinPreset(preset.id))] : []),
            ]);
            if (knownPrints.has(fp)) {
                continue; // 손대지 않은 복사본
            }
            if (currentBuiltinIds.has(preset.id)) {
                kept.push({ ...preset, id: createPresetId(), name: `${preset.name} (수정)` });
                continue;
            }
        }
        kept.push(preset);
    }

    // 예전에 지운 기본 제공 프리셋은 숨김으로
    const storedIds = new Set(rawPresets.map((p) => p && p.id));
    const known = Array.isArray(raw.knownBuiltinIds) ? raw.knownBuiltinIds : [];
    const hiddenBuiltinIds = known.filter((id) => currentBuiltinIds.has(id) && !storedIds.has(id));

    // 적용 중이던 프리셋이 빠진 복사본이면, 지금 코드에 같은 id가 있을 때만 그대로 둔다.
    const keptIds = new Set(kept.map((p) => p.id));
    const activePresetId =
        typeof raw.activePresetId === 'string' && (keptIds.has(raw.activePresetId) || currentBuiltinIds.has(raw.activePresetId))
            ? raw.activePresetId
            : null;

    return {
        schemaVersion: 2,
        activePresetId,
        vanillaBackup: raw.vanillaBackup,
        groups: raw.groups,
        presets: kept,
        hiddenBuiltinIds,
        expandedBuiltinGroups: [],
    };
}

function migrateV2ToV3(raw) {
    const appliedPresetIds = Array.isArray(raw.appliedPresetIds)
        ? raw.appliedPresetIds
        : typeof raw.activePresetId === 'string' && raw.activePresetId
          ? [raw.activePresetId]
          : [];
    return {
        ...raw,
        schemaVersion: STATE_SCHEMA_VERSION,
        appliedPresetIds,
        stackPresets: raw.stackPresets === true,
    };
}

function normalizePluginState(raw) {
    if (!raw || typeof raw !== 'object') {
        return getDefaultPluginState();
    }
    const hasV3Shape = Array.isArray(raw.appliedPresetIds) || typeof raw.stackPresets === 'boolean';
    const rawVersion = Number(raw.schemaVersion) || (hasV3Shape ? STATE_SCHEMA_VERSION : 1);
    let source = raw;
    if (rawVersion < 2) {
        source = migrateLegacyState(source);
    }
    if (rawVersion < 3) {
        source = migrateV2ToV3(source);
    }
    const currentBuiltinIds = new Set(getBuiltinPresets().map((p) => p.id));

    const seenIds = new Set();
    const presets = (Array.isArray(source.presets) ? source.presets : [])
        .map((preset, idx) => normalizePresetItem(preset, idx))
        .map((preset) => {
            // 같은 id가 둘 이상이거나 기본 제공 프리셋과 겹치면 새 id를 준다.
            if (seenIds.has(preset.id) || currentBuiltinIds.has(preset.id)) {
                preset = { ...preset, id: createPresetId() };
            }
            seenIds.add(preset.id);
            return preset;
        });

    const reconciled = reconcileGroups(presets, source.groups);
    const strings = (list) => [...new Set((Array.isArray(list) ? list : []).filter((v) => typeof v === 'string' && v))];
    const presetIds = new Set(reconciled.presets.map((p) => p.id));
    const stackPresets = source.stackPresets === true;

    let appliedPresetIds = strings(source.appliedPresetIds).filter(
        (id) => presetIds.has(id) || currentBuiltinIds.has(id),
    );
    if (!stackPresets && appliedPresetIds.length > 1) {
        appliedPresetIds = [appliedPresetIds[0]];
    }

    return {
        schemaVersion: STATE_SCHEMA_VERSION,
        appliedPresetIds,
        stackPresets,
        vanillaBackup: normalizeVanillaBackup(source.vanillaBackup),
        groups: reconciled.groups,
        presets: reconciled.presets,
        hiddenBuiltinIds: strings(source.hiddenBuiltinIds).filter((id) => currentBuiltinIds.has(id)),
        expandedBuiltinGroups: strings(source.expandedBuiltinGroups),
    };
}

/**
 * RisuAI v3 플러그인은 allow-same-origin 없는 샌드박스 iframe에서 돌아서
 * window.localStorage를 읽기만 해도 SecurityError가 난다. 접근 자체를 try로 감싼다.
 */
function getBrowserLocalStorage() {
    try {
        const ls = globalThis.localStorage;
        if (ls && typeof ls.getItem === 'function' && typeof ls.setItem === 'function') {
            return ls;
        }
    } catch {
        // sandboxed / opaque origin
    }
    return null;
}

function parseStoredValue(raw) {
    if (raw == null || raw === '') {
        return null;
    }
    if (typeof raw === 'string') {
        return JSON.parse(raw);
    }
    if (typeof raw === 'object') {
        return raw;
    }
    return null;
}

async function loadPluginState(api = globalThis.risuai) {
    const readers = [];

    if (api?.pluginStorage && typeof api.pluginStorage.getItem === 'function') {
        readers.push(async () => api.pluginStorage.getItem(STORAGE_KEY_STATE));
    }
    if (api?.safeLocalStorage && typeof api.safeLocalStorage.getItem === 'function') {
        readers.push(async () => api.safeLocalStorage.getItem(STORAGE_KEY_STATE));
    }
    const browserStorage = getBrowserLocalStorage();
    if (browserStorage) {
        readers.push(async () => browserStorage.getItem(STORAGE_KEY_STATE));
    }

    const failures = [];
    for (const readFn of readers) {
        try {
            const raw = await readFn();
            const parsed = parseStoredValue(raw);
            if (parsed && typeof parsed === 'object') {
                return normalizePluginState(parsed);
            }
        } catch (err) {
            failures.push(err instanceof Error ? err.message : String(err));
        }
    }

    // 저장된 값이 없으면 기본 상태로 시작한다. 읽다가 실패한 경우에는 기본 상태를 돌려주지 않는다.
    // 기본 상태로 시작하면 다음 저장 때 사용자의 프리셋과 바닐라 백업을 덮어쓰게 된다.
    if (failures.length > 0) {
        throw new Error(`저장된 프리셋을 읽지 못했습니다: ${failures.join(' / ')}`);
    }

    return getDefaultPluginState();
}

async function savePluginState(state, api = globalThis.risuai) {
    const normalized = normalizePluginState(state);
    const serialized = JSON.stringify(normalized);
    let saved = false;

    if (api?.pluginStorage && typeof api.pluginStorage.setItem === 'function') {
        try {
            await api.pluginStorage.setItem(STORAGE_KEY_STATE, serialized);
            saved = true;
        } catch {
            // Fall back to safeLocalStorage
        }
    }

    if (!saved && api?.safeLocalStorage && typeof api.safeLocalStorage.setItem === 'function') {
        try {
            await api.safeLocalStorage.setItem(STORAGE_KEY_STATE, serialized);
            saved = true;
        } catch {
            // Fall back to browser localStorage
        }
    }

    const browserStorage = saved ? null : getBrowserLocalStorage();
    if (browserStorage) {
        try {
            browserStorage.setItem(STORAGE_KEY_STATE, serialized);
            saved = true;
        } catch {
            // Ignore write errors in restricted frames
        }
    }

    if (!saved) {
        throw new Error('프리셋 저장소에 기록하지 못했습니다. 변경 내용이 저장되지 않았습니다.');
    }

    return { saved, state: normalized };
}

/** 내보낼 때는 이 기기에서만 뜻이 있는 groupId 대신 그룹 이름을 담는다. */
function presetForExport(preset, groupName) {
    const { groupId, ...rest } = normalizePresetItem(preset);
    return groupName ? { ...rest, groupName } : rest;
}

function exportAllPresetsJson(state) {
    const normalized = normalizePluginState(state);
    return JSON.stringify(
        {
            format: 'risu-theme-preset-bundle',
            version: 1,
            exportedAt: new Date().toISOString(),
            stackPresets: normalized.stackPresets,
            hiddenBuiltinIds: normalized.hiddenBuiltinIds,
            presets: normalized.presets.map((p) => presetForExport(p, getPresetGroupName(normalized, p))),
        },
        null,
        2,
    );
}

function exportSinglePresetJson(preset, groupName = null) {
    return JSON.stringify(
        {
            format: 'risu-theme-preset-single',
            version: 1,
            exportedAt: new Date().toISOString(),
            preset: presetForExport(preset, groupName),
        },
        null,
        2,
    );
}

function importPresetsJson(jsonString, state, mode = 'merge') {
    if (typeof jsonString !== 'string' || !jsonString.trim()) {
        throw new Error('가져올 JSON 문자열이 비어 있습니다.');
    }

    let parsed;
    try {
        parsed = JSON.parse(jsonString);
    } catch (err) {
        throw new Error(`프리셋 JSON 파싱 실패: ${err instanceof Error ? err.message : String(err)}`);
    }

    let rawCandidates = [];
    if (Array.isArray(parsed)) {
        rawCandidates = parsed;
    } else if (parsed && typeof parsed === 'object') {
        if (Array.isArray(parsed.presets)) {
            rawCandidates = parsed.presets;
        } else if (parsed.preset && typeof parsed.preset === 'object') {
            rawCandidates = [parsed.preset];
        } else if (
            typeof parsed.guiHTML === 'string' ||
            typeof parsed.customCSS === 'string' ||
            Array.isArray(parsed.regexRules) ||
            typeof parsed.name === 'string'
        ) {
            rawCandidates = [parsed];
        }
    }

    if (rawCandidates.length === 0) {
        throw new Error('유효한 프리셋 데이터를 찾을 수 없습니다.');
    }

    const baseState = normalizePluginState(state);
    // 다른 기기의 groupId는 버리고 groupName으로 다시 묶는다.
    // 기본 제공 프리셋과 id가 같으면: 내용도 같으면 이미 있는 것이므로 건너뛰고, 다르면 사용자 복사본으로 들인다.
    const incomingGroupNames = [];
    const skippedBuiltins = [];
    const skippedEmpty = [];
    const normalizedIncoming = [];
    rawCandidates.forEach((item, idx) => {
        let preset = normalizePresetItem(
            {
                ...item,
                groupId: null,
                updatedAt: new Date().toISOString(),
            },
            idx,
        );
        if (!hasPresetContent(preset)) {
            skippedEmpty.push(preset);
            return;
        }
        const builtin = getBuiltinPreset(preset.id);
        if (builtin) {
            if (presetFingerprint(preset) === presetFingerprint(builtin)) {
                skippedBuiltins.push(builtin);
                return;
            }
            preset = {
                ...preset,
                id: createPresetId(),
                name: preset.name === builtin.name ? `${preset.name} (수정)` : preset.name,
            };
        }
        normalizedIncoming.push(preset);
        incomingGroupNames.push(item && typeof item.groupName === 'string' ? item.groupName : null);
    });
    if (normalizedIncoming.length === 0 && skippedBuiltins.length === 0) {
        throw new Error('HTML·CSS·정규식 중 하나 이상 채워진 프리셋이 없습니다.');
    }
    const incomingHidden = parsed && Array.isArray(parsed.hiddenBuiltinIds) ? parsed.hiddenBuiltinIds : [];
    const applyIncomingGroups = (nextState) => {
        let result = nextState;
        const byName = new Map();
        normalizedIncoming.forEach((preset, idx) => {
            const name = incomingGroupNames[idx];
            if (name && name.trim()) {
                const list = byName.get(name.trim()) || [];
                list.push(preset.id);
                byName.set(name.trim(), list);
            }
        });
        for (const [name, ids] of byName) {
            result = assignPresetsToGroupByName(result, ids, name);
        }
        return result;
    };

    if (mode === 'replace') {
        const incomingIds = new Set(normalizedIncoming.map((p) => p.id));
        const nextAppliedIds = baseState.appliedPresetIds.filter(
            (id) => incomingIds.has(id) || isBuiltinId(id),
        );
        const nextState = applyIncomingGroups(
            normalizePluginState({
                ...baseState,
                appliedPresetIds: nextAppliedIds,
                groups: [],
                presets: normalizedIncoming,
                hiddenBuiltinIds: incomingHidden,
            }),
        );
        return {
            state: nextState,
            importedCount: normalizedIncoming.length,
            addedCount: normalizedIncoming.length,
            updatedCount: 0,
            skippedBuiltinCount: skippedBuiltins.length,
            skippedEmptyCount: skippedEmpty.length,
            importedPresets: nextState.presets,
            skippedBuiltins,
        };
    }

    const nextPresets = baseState.presets.map((p) => ({ ...p, regexRules: [...p.regexRules] }));
    let addedCount = 0;
    let updatedCount = 0;

    for (const incoming of normalizedIncoming) {
        const existingIndex = nextPresets.findIndex((p) => p.id === incoming.id);
        if (existingIndex >= 0) {
            // 이미 있는 프리셋은 내용만 바꾸고 이 기기에서 넣어 둔 그룹은 유지한다.
            nextPresets[existingIndex] = { ...incoming, groupId: nextPresets[existingIndex].groupId };
            updatedCount += 1;
        } else {
            nextPresets.push(incoming);
            addedCount += 1;
        }
    }

    const nextState = applyIncomingGroups(
        normalizePluginState({
            ...baseState,
            presets: nextPresets,
            hiddenBuiltinIds: [...baseState.hiddenBuiltinIds, ...incomingHidden],
        }),
    );

    return {
        state: nextState,
        importedCount: normalizedIncoming.length,
        addedCount,
        updatedCount,
        skippedBuiltinCount: skippedBuiltins.length,
        skippedEmptyCount: skippedEmpty.length,
        importedPresets: normalizedIncoming,
        skippedBuiltins,
    };
}

// === regex-engine.js ===
/**
 * RisuAI 호환 디스플레이 정규식 엔진 및 Custom HTML/CSS 정규식 변환기
 */

const RISU_SLOT_NAMES = ['risutextbox', 'risuicon', 'risubuttons', 'risugeninfo'];

function createRegexRuleId() {
  return 'rx_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 7);
}

/**
 * RisuAI scripts.ts 규칙에 따라 flag 문자열과 <order N, cbs, move_top, no_end_nl> 메타를 파싱한다.
 */
function parseRisuRegexFlags(rawFlag, ableFlag = true) {
  if (!ableFlag) {
    return {
      cleanFlags: 'g',
      actions: [],
      order: 0
    };
  }

  let flagStr = typeof rawFlag === 'string' && rawFlag.length > 0 ? rawFlag : 'g';
  let order = 0;
  const actions = [];

  if (flagStr.includes('<')) {
    flagStr = flagStr.replace(/<(.+?)>/g, (_m, inner) => {
      const meta = inner.split(',').map((s) => s.trim()).filter(Boolean);
      for (const item of meta) {
        if (item.startsWith('order ')) {
          const parsedOrder = parseInt(item.slice(6).trim(), 10);
          if (!Number.isNaN(parsedOrder)) {
            order = parsedOrder;
          }
        } else {
          actions.push(item);
        }
      }
      return '';
    });
  }

  let cleanFlags = flagStr.trim().replace(/[^dgimsuvy]/g, '');
  cleanFlags = cleanFlags
    .split('')
    .filter((ch, idx, arr) => arr.indexOf(ch) === idx)
    .join('');

  if (cleanFlags.length === 0) {
    cleanFlags = 'u';
  }

  return { cleanFlags, actions, order };
}

/**
 * 디스플레이 정규식 규칙을 순서대로 적용하고 상세 결과를 반환한다.
 */
function applyRegexRulesDetailed(text, rules = []) {
  let result = typeof text === 'string' ? text : String(text ?? '');
  const errors = [];
  let appliedCount = 0;

  if (!Array.isArray(rules) || rules.length === 0) {
    return { text: result, appliedCount: 0, errors };
  }

  const normalized = rules
    .map((rule, index) => {
      if (!rule || rule.enabled === false) return null;
      if (rule.type && rule.type !== 'editdisplay') return null;
      if (typeof rule.in !== 'string' || rule.in === '') return null;
      const parsed = parseRisuRegexFlags(rule.flag, rule.ableFlag !== false);
      return { rule, index, ...parsed };
    })
    .filter(Boolean);

  normalized.sort((a, b) => {
    if (b.order !== a.order) return b.order - a.order;
    return a.index - b.index;
  });

  for (const item of normalized) {
    const { rule, actions } = item;
    let flags = item.cleanFlags;
    let outScript = String(rule.out ?? '')
      .replaceAll('$n', '\n')
      .replace(/\{\{data\}\}/g, '$&');

    const isMoveTop = outScript.startsWith('@@move_top') || actions.includes('move_top');
    const isMoveBottom = outScript.startsWith('@@move_bottom') || actions.includes('move_bottom');

    if (isMoveTop || isMoveBottom) {
      flags = flags.replace('g', '');
      if (flags.length === 0) flags = 'u';
    }
    if (outScript.endsWith('>') && !actions.includes('no_end_nl')) {
      outScript += '\n';
    }

    try {
      const reg = new RegExp(rule.in, flags);
      if (isMoveTop || isMoveBottom) {
        const matched = result.match(reg);
        if (matched) {
          result = result.replace(reg, '');
          let moved = outScript
            .replace(/^@@move_top\s*/, '')
            .replace(/^@@move_bottom\s*/, '')
            .replace(/\$(\d+)/g, (full, idxStr) => {
              const groupIdx = parseInt(idxStr, 10);
              return groupIdx < matched.length && matched[groupIdx] !== undefined ? matched[groupIdx] : full;
            })
            .replace(/\$&/g, matched[0] ?? '')
            .replace(/\$<([^>]+)>/g, (full, groupName) => {
              return matched.groups && matched.groups[groupName] !== undefined ? matched.groups[groupName] : full;
            });
          result = isMoveTop ? moved + '\n' + result : result + '\n' + moved;
          appliedCount += 1;
        }
      } else {
        const nextText = result.replace(reg, outScript);
        if (nextText !== result) {
          appliedCount += 1;
        }
        result = nextText;
      }
    } catch (err) {
      errors.push({
        ruleId: rule.id || '',
        comment: rule.comment || rule.in,
        message: err instanceof Error ? err.message : String(err)
      });
    }
  }

  return { text: result, appliedCount, errors };
}

/**
 * 디스플레이 정규식 규칙을 적용해 변환된 문자열만 반환한다.
 */
function applyRegexRules(text, rules = []) {
  return applyRegexRulesDetailed(text, rules).text;
}

/**
 * 자기 닫기 형태의 특수 슬롯 태그를 표준 여닫는 태그로 교정한다.
 */
function fixSelfClosingSlotTags(html) {
  let out = String(html ?? '');
  for (const tag of RISU_SLOT_NAMES) {
    const selfCloseRe = new RegExp(`<${tag}(\\s+[^>]*)?\\/>`, 'gi');
    out = out.replace(selfCloseRe, `<${tag}></${tag}>`);
  }
  return out;
}

/**
 * 구형 {{#if {{equal::{{role}}::...}}}} 구문을 {{#when::{{role}}::is::...}} 형태로 변환한다.
 */
function convertLegacyCbsToWhen(html) {
  let out = String(html ?? '');
  out = out.replace(
    /\{\{#if\s+\{\{equal::\{\{role\}\}::(char|user)\}\}\}\}([\s\S]*?)\{\{\/if\}\}/g,
    '{{#when::{{role}}::is::$1}}$2{{/when}}'
  );
  out = out.replace(
    /\{\{#if\s+\{\{not_equal::\{\{role\}\}::(char|user)\}\}\}\}([\s\S]*?)\{\{\/if\}\}/g,
    '{{#when::{{role}}::isnot::$1}}$2{{/when}}'
  );
  return out;
}

/**
 * 정규식 기반 테마의 OUT 템플릿($&, {{data}}, $1 등)을 바닐라 Custom HTML(guiHTML) 구조로 변환한다.
 */
function convertRegexOutToCustomHtml(regexOutTemplate, options = {}) {
  const {
    bodyToken = '$1',
    includeIcon = false,
    includeButtons = false,
    includeGenInfo = false,
    convertLegacyCbs = true
  } = options;

  const warnings = [];
  let raw = String(regexOutTemplate ?? '').replaceAll('$n', '\n');

  const extractedCssParts = [];
  raw = raw.replace(/<style\b[^>]*>([\s\S]*?)<\/style>/gi, (_m, cssBody) => {
    if (cssBody && cssBody.trim()) {
      extractedCssParts.push(cssBody.trim());
    }
    return '';
  });

  if (raw.includes('{{data}}')) {
    raw = raw.replaceAll('{{data}}', '<risutextbox></risutextbox>');
  } else if (raw.includes('$&')) {
    raw = raw.replaceAll('$&', '<risutextbox></risutextbox>');
  } else if (bodyToken && raw.includes(bodyToken)) {
    raw = raw.replaceAll(bodyToken, '<risutextbox></risutextbox>');
  } else if (!/<risutextbox\b/i.test(raw)) {
    raw = raw.trim()
      ? `${raw.trim()}\n<risutextbox></risutextbox>`
      : `<div class="converted-card"><risutextbox></risutextbox></div>`;
    warnings.push('템플릿에서 $&, {{data}}, $1 본문 치환자를 찾지 못해 <risutextbox></risutextbox>를 끝에 추가했습니다.');
  }

  const leftoverTokens = [...new Set(raw.match(/\$(?:\d+|<[^>]+>)/g) || [])];
  if (leftoverTokens.length > 0) {
    warnings.push(`Custom HTML에서는 쓸 수 없는 캡처 치환자가 남아 있습니다: ${leftoverTokens.join(', ')}`);
  }

  raw = fixSelfClosingSlotTags(raw);
  if (convertLegacyCbs) {
    raw = convertLegacyCbsToWhen(raw);
  }

  const additions = [];
  if (includeIcon && !/<risuicon\b/i.test(raw)) {
    additions.push('  <div class="converted-card__icon"><risuicon></risuicon></div>');
  }
  if (includeGenInfo && !/<risugeninfo\b/i.test(raw)) {
    additions.push('  <div class="converted-card__info"><risugeninfo></risugeninfo></div>');
  }
  if (includeButtons && !/<risubuttons\b/i.test(raw)) {
    additions.push('  <div class="converted-card__buttons"><risubuttons></risubuttons></div>');
  }

  if (additions.length > 0) {
    const trimmed = raw.trim();
    const lastCloseIdx = trimmed.lastIndexOf('</div>');
    if (lastCloseIdx !== -1 && lastCloseIdx === trimmed.length - 6) {
      raw = trimmed.slice(0, lastCloseIdx) + '\n' + additions.join('\n') + '\n</div>';
    } else {
      raw = trimmed + '\n' + additions.join('\n');
    }
  }

  return {
    guiHTML: raw.trim(),
    extractedCSS: extractedCssParts.join('\n\n'),
    warnings
  };
}

function escapeRegExpLiteral(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function renamePrefixInMarkup(guiHTML, customCSS, fromPrefix, toPrefix) {
  const from = String(fromPrefix ?? '').trim();
  const to = String(toPrefix ?? '').trim();
  if (!from || !to || from === to) {
    return { guiHTML, customCSS, matchCount: 0, error: '유효한 원본 접두사와 새 접두사를 입력하세요.' };
  }

  const escapedFrom = escapeRegExpLiteral(from);
  let matchCount = 0;

  // CSS: .prefix..., --prefix..., @keyframes prefix...
  const cssTokenRe = new RegExp(`(\\.|--|@keyframes\\s+)${escapedFrom}(?=[a-zA-Z0-9_-])`, 'g');
  const nextCSS = String(customCSS ?? '').replace(cssTokenRe, (_m, lead) => {
    matchCount += 1;
    return lead + to;
  });

  // CSS bare prefix class selector ending right after prefix e.g. `.rtbase {` or `.rtbase:` or `.rtbase,`
  const cssExactRe = new RegExp(`(\\.|--|@keyframes\\s+)${escapedFrom}(?=[\\s:{.,\\[>+~)])`, 'g');
  let finalCSS = nextCSS.replace(cssExactRe, (_m, lead) => {
    matchCount += 1;
    return lead + to;
  });

  // @keyframes 이름을 바꿨으면 animation / animation-name 선언에서 그 이름을 쓰는 곳도 같이 바꾼다.
  const keyframeNames = new Set();
  const keyframeDeclRe = new RegExp(`@keyframes\\s+(${escapedFrom}[a-zA-Z0-9_-]*)`, 'g');
  for (const m of String(customCSS ?? '').matchAll(keyframeDeclRe)) {
    keyframeNames.add(m[1]);
  }
  if (keyframeNames.size > 0) {
    finalCSS = finalCSS.replace(/(animation(?:-name)?\s*:)([^;}]*)/gi, (_full, prop, value) => {
      let nextValue = value;
      for (const name of keyframeNames) {
        const nameRe = new RegExp(`(^|[\\s,])${escapeRegExpLiteral(name)}(?=[\\s,;!]|$)`, 'g');
        nextValue = nextValue.replace(nameRe, (_m, lead) => {
          matchCount += 1;
          return lead + to + name.slice(from.length);
        });
      }
      return prop + nextValue;
    });
  }

  // HTML: class attributes and inline CSS variable references
  const htmlClassRe = /class\s*=\s*(["'])([\s\S]*?)\1/gi;
  let nextHTML = String(guiHTML ?? '').replace(htmlClassRe, (_full, quote, clsValue) => {
    // CBS 블록({{#when::{{role}}::is::char}}클래스{{/when}}) 바로 뒤에 붙은 클래스도 잡도록 "}}"를 경계로 본다.
    const classTokenRe = new RegExp(`(^|\\s|\\}\\})${escapedFrom}(?=[a-zA-Z0-9_-]|\\s|$|\\{\\{)`, 'g');
    const replacedCls = clsValue.replace(classTokenRe, (_m, lead) => {
      matchCount += 1;
      return lead + to;
    });
    return `class=${quote}${replacedCls}${quote}`;
  });

  const htmlVarRe = new RegExp(`--${escapedFrom}(?=[a-zA-Z0-9_-])`, 'g');
  nextHTML = nextHTML.replace(htmlVarRe, () => {
    matchCount += 1;
    return `--${to}`;
  });

  return { guiHTML: nextHTML, customCSS: finalCSS, matchCount, error: null };
}

/**
 * Custom HTML / Custom CSS에 대한 정적 정규식 변환을 수행한다.
 */
function transformThemeMarkup({ guiHTML = '', customCSS = '' }, transformType, params = {}) {
  const htmlStr = String(guiHTML ?? '');
  const cssStr = String(customCSS ?? '');

  if (transformType === 'legacy-cbs-to-when') {
    const nextHTML = convertLegacyCbsToWhen(htmlStr);
    return {
      guiHTML: nextHTML,
      customCSS: cssStr,
      changed: nextHTML !== htmlStr,
      matchCount: nextHTML !== htmlStr ? 1 : 0,
      error: null
    };
  }

  if (transformType === 'fix-self-closing-slots') {
    const nextHTML = fixSelfClosingSlotTags(htmlStr);
    return {
      guiHTML: nextHTML,
      customCSS: cssStr,
      changed: nextHTML !== htmlStr,
      matchCount: nextHTML !== htmlStr ? 1 : 0,
      error: null
    };
  }

  if (transformType === 'rename-prefix') {
    const res = renamePrefixInMarkup(
      htmlStr,
      cssStr,
      params.fromPrefix ?? params.oldPrefix,
      params.toPrefix ?? params.newPrefix
    );
    return {
      guiHTML: res.guiHTML,
      customCSS: res.customCSS,
      changed: res.guiHTML !== htmlStr || res.customCSS !== cssStr,
      matchCount: res.matchCount,
      error: res.error
    };
  }

  if (transformType === 'custom-regex') {
    const pattern = String(params.pattern ?? '');
    if (!pattern) {
      return { guiHTML: htmlStr, customCSS: cssStr, changed: false, matchCount: 0, error: '정규식 패턴이 비어 있습니다.' };
    }
    const rawFlags = typeof params.flags === 'string' && params.flags.length > 0 ? params.flags : 'g';
    const cleanFlags = rawFlags.replace(/[^dgimsuvy]/g, '') || 'g';
    const replacement = String(params.replacement ?? '').replaceAll('$n', '\n');
    const target = params.target || 'both';

    let regex;
    try {
      regex = new RegExp(pattern, cleanFlags);
    } catch (err) {
      return {
        guiHTML: htmlStr,
        customCSS: cssStr,
        changed: false,
        matchCount: 0,
        error: err instanceof Error ? err.message : String(err)
      };
    }

    let count = 0;
    const countAndReplace = (input) => {
      const counterRe = new RegExp(regex.source, regex.flags.includes('g') ? regex.flags : regex.flags + 'g');
      const matches = input.match(counterRe);
      if (matches) {
        count += matches.length;
      }
      return input.replace(regex, replacement);
    };

    const nextHTML = target === 'html' || target === 'guiHTML' || target === 'both' ? countAndReplace(htmlStr) : htmlStr;
    const nextCSS = target === 'css' || target === 'customCSS' || target === 'both' ? countAndReplace(cssStr) : cssStr;

    return {
      guiHTML: nextHTML,
      customCSS: nextCSS,
      changed: nextHTML !== htmlStr || nextCSS !== cssStr,
      matchCount: count,
      error: null
    };
  }

  return {
    guiHTML: htmlStr,
    customCSS: cssStr,
    changed: false,
    matchCount: 0,
    error: `지원하지 않는 변환 유형입니다: ${transformType}`
  };
}

/**
 * 바닐라 RisuAI regexscript_export.json 포맷 또는 배열을 플러그인 regexRules 배열로 가져온다.
 */
function importRisuRegexJson(jsonString) {
  const parsed = JSON.parse(jsonString);
  let rawList = [];

  if (Array.isArray(parsed)) {
    rawList = parsed;
  } else if (parsed && parsed.type === 'regex' && Array.isArray(parsed.data)) {
    rawList = parsed.data;
  } else if (parsed && Array.isArray(parsed.regexRules)) {
    rawList = parsed.regexRules;
  } else {
    throw new Error('올바른 RisuAI 정규식 JSON 형식({ type: "regex", data: [...] })이 아닙니다.');
  }

  return rawList
    .filter((item) => item && typeof item.in === 'string')
    .map((item, idx) => ({
      id: item.id || `${createRegexRuleId()}_${idx}`,
      comment: String(item.comment || `규칙 ${idx + 1}`),
      in: String(item.in),
      out: String(item.out ?? ''),
      flag: String(item.flag ?? 'g'),
      ableFlag: item.ableFlag !== false,
      type: item.type || 'editdisplay',
      enabled: item.enabled !== false
    }));
}

/**
 * 플러그인 regexRules 배열을 바닐라 RisuAI regexscript_export.json 포맷 문자열로 내보낸다.
 */
function exportRisuRegexJson(regexRules = []) {
  const data = (Array.isArray(regexRules) ? regexRules : []).map((rule) => ({
    comment: String(rule.comment || ''),
    in: String(rule.in || ''),
    out: String(rule.out ?? ''),
    type: rule.type || 'editdisplay',
    flag: String(rule.flag ?? 'g'),
    ableFlag: rule.ableFlag !== false
  }));

  return JSON.stringify({
    type: 'regex',
    data
  }, null, 2);
}

// === preset-echo.js ===
/**
 * 내장 프리셋 "에코": 유리 질감의 메신저형 테마 (접두사 rgl).
 * 사용자가 RisuAI에서 쓰던 Custom HTML / Custom CSS를 그대로 옮긴 것이다. 내용을 고치지 않는다.
 */
const ECHO_PRESET = {
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

// === theme-families.js ===
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

const THEME_FAMILIES = [
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
function buildFamilyPreset(family, variant) {
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

const FAMILY_PRESETS = FAMILY_ORDER.map((key) => THEME_FAMILIES.find((f) => f.key === key))
    .flatMap((family) => family.variants.map((variant) => buildFamilyPreset(family, variant)))
    .map((preset, idx) => ({
        ...preset,
        // 결과물/프리셋 폴더의 파일 이름 (예: 01-서재-크림)
        file: `${String(idx + 1).padStart(2, '0')}-${preset.name.replace(/[:\s]+/g, '-')}`,
    }));

// === builtin-presets.js ===
/**
 * 플러그인에 기본으로 들어 있는 프리셋 목록.
 *
 * 대상별 분류와 변주는 theme-families.js에서 만든다. 에코는 따로 설계한 프리셋이라 그대로 둔다.
 * 각 프리셋의 groupName으로, 설치할 때 분류별 그룹에 들어간다.
 * file은 결과물/프리셋 폴더에 내보낼 때의 파일 이름이다.
 */

/** 플러그인이 기본으로 제공하는 프리셋 전부. */
const BUILTIN_PRESETS = [{ ...ECHO_PRESET, file: '00-에코-글래스-메신저' }, ...FAMILY_PRESETS];

// === preview-engine.js ===
/**
 * RisuAI Custom HTML / Custom CSS 정적 검증기 및 실시간 미리보기 빌더
 */


const RISU_SUPPORTED_TAGS = new Set([
  'img', 'a', 'span', 'div', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'ul', 'ol', 'li', 'table', 'tr', 'td', 'th', 'hr', 'br', 'code', 'pre',
  'blockquote', 'em', 'strong', 'u', 'del', 'button', 'style'
]);

const RISU_VOID_TAGS = new Set(['img', 'hr', 'br', 'meta', 'link', 'input']);

const RISU_SLOT_TAGS = new Set(['risutextbox', 'risuicon', 'risubuttons', 'risugeninfo']);

/** HTML이 없는 프리셋을 미리볼 때 사용하는 RisuAI 기본 화면 근사 틀 */
const FALLBACK_VANILLA_GUI_HTML = [
  '<div class="risu-vanilla-fallback">',
  '  <div class="risu-vanilla-fallback-avatar"><risuicon></risuicon></div>',
  '  <div class="risu-vanilla-fallback-body">',
  '    <div class="risu-vanilla-fallback-head">',
  '      <strong class="risu-vanilla-fallback-name">{{#when::{{role}}::is::char}}{{char}}{{:else}}{{user}}{{/when}}</strong>',
  '      <div class="risu-vanilla-fallback-meta"><risugeninfo></risugeninfo><risubuttons></risubuttons></div>',
  '    </div>',
  '    <risutextbox></risutextbox>',
  '  </div>',
  '</div>',
].join('\n');

/** CSS 주석 안에 프리셋 이름을 안전하게 넣는다 (주석 닫기·줄바꿈·태그 열기 차단). */
function sanitizeCssCommentText(text) {
  return String(text ?? '')
    .replace(/\*\//g, '* /')
    .replace(/</g, '\u2039')
    .replace(/[\r\n]+/g, ' ')
    .trim();
}

/**
 * 합친 CSS에서 최상위 @charset / @import 규칙을 맨 위로 끌어올린다.
 * 따옴표("...", '...') 안의 세미콜론(Google Fonts wght@400;700 등), 괄호 안, 주석, @media 블록 안은 건드리지 않는다.
 */
function hoistImports(css) {
  const text = String(css ?? '');
  if (!text || !/@(?:charset|import)\b/i.test(text)) {
    return text;
  }

  const charsets = [];
  const imports = [];
  const bodyChunks = [];
  const n = text.length;
  let i = 0;
  let bodyStart = 0;
  let braceDepth = 0;

  const skipComment = (pos) => {
    const closeIdx = text.indexOf('*/', pos + 2);
    return closeIdx === -1 ? n : closeIdx + 2;
  };

  const skipString = (pos) => {
    const quote = text[pos];
    let p = pos + 1;
    while (p < n) {
      if (text[p] === '\\') {
        p += 2;
        continue;
      }
      if (text[p] === quote) {
        return p + 1;
      }
      p += 1;
    }
    return n;
  };

  const matchTopAtRule = (pos) => {
    if (braceDepth !== 0 || text[pos] !== '@') return '';
    const slice = text.slice(pos + 1, pos + 9).toLowerCase();
    for (const kw of ['charset', 'import']) {
      if (slice.startsWith(kw)) {
        const after = text[pos + 1 + kw.length] || '';
        if (!/[a-zA-Z0-9_-]/.test(after)) {
          return kw;
        }
      }
    }
    return '';
  };

  while (i < n) {
    const ch = text[i];

    if (ch === '/' && text[i + 1] === '*') {
      i = skipComment(i);
      continue;
    }
    if (ch === '"' || ch === "'") {
      i = skipString(i);
      continue;
    }
    if (ch === '{') {
      braceDepth += 1;
      i += 1;
      continue;
    }
    if (ch === '}') {
      braceDepth = Math.max(0, braceDepth - 1);
      i += 1;
      continue;
    }

    const kind = matchTopAtRule(i);
    if (kind) {
      let p = i + 1 + kind.length;
      let parenDepth = 0;
      let foundSemi = -1;
      let aborted = false;

      while (p < n) {
        const c = text[p];
        if (c === '/' && text[p + 1] === '*') {
          p = skipComment(p);
          continue;
        }
        if (c === '"' || c === "'") {
          p = skipString(p);
          continue;
        }
        if (c === '(') {
          parenDepth += 1;
          p += 1;
          continue;
        }
        if (c === ')') {
          parenDepth = Math.max(0, parenDepth - 1);
          p += 1;
          continue;
        }
        if (c === '{' && parenDepth === 0) {
          aborted = true;
          break;
        }
        if (c === ';' && parenDepth === 0) {
          foundSemi = p;
          break;
        }
        p += 1;
      }

      if (!aborted && foundSemi !== -1) {
        if (i > bodyStart) {
          bodyChunks.push(text.slice(bodyStart, i));
        }
        const stmt = text.slice(i, foundSemi + 1).trim();
        if (kind === 'charset') {
          if (!charsets.includes(stmt)) charsets.push(stmt);
        } else {
          imports.push(stmt);
        }
        let nextPos = foundSemi + 1;
        while (nextPos < n && (text[nextPos] === ' ' || text[nextPos] === '\t' || text[nextPos] === '\r' || text[nextPos] === '\n')) {
          if (text[nextPos] === '\n') {
            nextPos += 1;
            break;
          }
          nextPos += 1;
        }
        i = nextPos;
        bodyStart = nextPos;
        continue;
      }
    }

    i += 1;
  }

  if (charsets.length === 0 && imports.length === 0) {
    return text;
  }

  if (bodyStart < n) {
    bodyChunks.push(text.slice(bodyStart));
  }

  const body = bodyChunks.join('').replace(/^\s*\n/, '').trimEnd();
  return [...charsets, ...imports, ...(body ? [body] : [])].join('\n');
}

const CONVERTED_TO_DIV_WARN_TAGS = new Set([
  'section', 'header', 'footer', 'article', 'aside', 'nav', 'main',
  'i', 'b', 'svg', 'tbody', 'thead', 'tfoot'
]);

function escapeHtmlText(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/**
 * 텍스트 노드용. 원문에 이미 있는 엔티티(&amp;, &#39; 등)는 그대로 두어 이중으로 이스케이프하지 않는다.
 * 실제 RisuAI는 DOMParser로 엔티티를 풀어서 보여 준다.
 */
function escapeHtmlTextNode(str) {
  return String(str ?? '')
    .replace(/&(?!(?:[a-zA-Z][a-zA-Z0-9]*|#\d+|#x[0-9a-fA-F]+);)/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function escapeHtmlAttr(str) {
  return escapeHtmlText(str)
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function parseTagAttributes(attrString) {
  const attrs = {};
  const attrRe = /([^\s=/>]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'>]+)))?/g;
  let match;
  while ((match = attrRe.exec(attrString)) !== null) {
    const key = match[1].toLowerCase();
    const val = match[2] ?? match[3] ?? match[4] ?? '';
    attrs[key] = val;
  }
  return attrs;
}

/**
 * HTML 문자열을 경량 AST 트리로 파싱한다 (브라우저/Node 양쪽 호환).
 */
function parseHtmlToTree(html) {
  const root = { tag: 'root', attrs: {}, children: [] };
  const stack = [root];
  // 주의: RisuAI는 플러그인 코드를 script 요소 안에 그대로 넣는다. 코드에 HTML 주석을 여는 표시나
  // script 여는 태그 문자열이 그대로 있으면 HTML 파서가 스크립트를 끝내지 못해 플러그인이 실행되지 않는다.
  // 그래서 이 파일에서는 '!'와 '<'를 \x21, \x3C로 적는다 (빌드 검사에서도 확인한다).
  const tokenRe = /<\x21--[\s\S]*?-->|<\/([a-zA-Z0-9_-]+)\s*>|<([a-zA-Z0-9_-]+)((?:\s+[^<>]*?)?)(\/?)\s*>/g;

  let lastIndex = 0;
  let match;

  while ((match = tokenRe.exec(html)) !== null) {
    if (match.index > lastIndex) {
      stack[stack.length - 1].children.push(html.slice(lastIndex, match.index));
    }
    lastIndex = tokenRe.lastIndex;

    if (match[0].startsWith('<\x21--')) {
      continue;
    }

    if (match[1]) {
      // 닫는 태그
      const closeTag = match[1].toLowerCase();
      for (let i = stack.length - 1; i > 0; i--) {
        if (stack[i].tag === closeTag) {
          stack.length = i;
          break;
        }
      }
      continue;
    }

    const tagName = match[2].toLowerCase();
    const rawAttrs = match[3] || '';
    const selfClosing = match[4] === '/';
    const node = {
      tag: tagName,
      attrs: parseTagAttributes(rawAttrs),
      children: []
    };
    stack[stack.length - 1].children.push(node);

    // 특수 슬롯 태그는 HTML 파서에서 자기 닫기로 처리되지 않으므로
    // 실제 RisuAI처럼 <tag/> 형태여도 스택에 열어 후속 요소 삼킴 여부를 확인/모사한다.
    if (RISU_VOID_TAGS.has(tagName)) {
      continue;
    }
    if (!selfClosing || RISU_SLOT_TAGS.has(tagName)) {
      stack.push(node);
    }
  }

  if (lastIndex < html.length) {
    stack[stack.length - 1].children.push(html.slice(lastIndex));
  }

  return root;
}

/**
 * 미리보기용 CBS 매크로(#when, #if, {{char}}, {{user}}, {{role}}, {{lower::...}}, {{replace::...}})를 평가한다.
 */
function evaluatePreviewCBS(html, role, sampleContext = {}) {
  const charName = String(sampleContext.charName ?? '세라 (Sera)');
  const userName = String(sampleContext.userName ?? '사용자 (User)');
  const dateStr = String(sampleContext.date ?? '2026-11-16');
  const timeStr = String(sampleContext.time ?? '09:00');
  const vars = sampleContext.vars && typeof sampleContext.vars === 'object' ? sampleContext.vars : {};

  let out = String(html ?? '');

  // 기본 식별자 우선 치환
  out = out
    .replaceAll('{{role}}', role)
    .replaceAll('{{char}}', charName)
    .replaceAll('{{user}}', userName)
    .replaceAll('{{date}}', dateStr)
    .replaceAll('{{time}}', timeStr);

  // {{#when::...}} 안쪽부터 반복 평가
  const whenInnerRe = /\{\{#when::([^{}]*?)::(is|isnot)::([^{}]*?)\}\}((?:(?!\{\{#when\b)[\s\S])*?)\{\{\/when\}\}/g;
  for (let guard = 0; guard < 10; guard++) {
    const next = out.replace(whenInnerRe, (_m, lhs, op, rhs, body) => {
      const parts = body.split('{{:else}}');
      const eq = String(lhs).trim() === String(rhs).trim();
      const take = op === 'is' ? eq : !eq;
      if (take) return parts[0] ?? '';
      return parts.length > 1 ? parts.slice(1).join('{{:else}}') : '';
    });
    if (next === out) break;
    out = next;
  }

  // 레거시 {{#if {{equal::...}}}} 평가
  const legacyIfRe = /\{\{#if\s+\{\{(equal|not_equal)::([^{}]*?)::([^{}]*?)\}\}\}\}([\s\S]*?)\{\{\/if\}\}/g;
  for (let guard = 0; guard < 10; guard++) {
    const next = out.replace(legacyIfRe, (_m, op, lhs, rhs, body) => {
      const eq = String(lhs).trim() === String(rhs).trim();
      const take = op === 'equal' ? eq : !eq;
      return take ? body : '';
    });
    if (next === out) break;
    out = next;
  }

  // 인라인 함수 매크로 (안쪽부터)
  for (let guard = 0; guard < 8; guard++) {
    let changed = false;
    out = out.replace(/\{\{getvar::([^{}]+)\}\}/g, (_m, key) => {
      changed = true;
      const k = key.trim();
      return Object.prototype.hasOwnProperty.call(vars, k) ? String(vars[k]) : 'null';
    });
    out = out.replace(/\{\{lower::([^{}]*)\}\}/g, (_m, val) => {
      changed = true;
      return String(val).toLowerCase();
    });
    out = out.replace(/\{\{upper::([^{}]*)\}\}/g, (_m, val) => {
      changed = true;
      return String(val).toUpperCase();
    });
    out = out.replace(/\{\{trim::([^{}]*)\}\}/g, (_m, val) => {
      changed = true;
      return String(val).trim();
    });
    out = out.replace(/\{\{replace::([^{}]*?)::([^{}]*?)::([^{}]*?)\}\}/g, (_m, src, from, to) => {
      changed = true;
      return String(src).replaceAll(from, to);
    });
    if (!changed) break;
  }

  return out;
}

/**
 * Chat.svelte의 renderGuiHtmlPart 동작을 모사해 특수 슬롯과 허용 태그만 렌더링한다.
 */
function sanitizeAndRenderGuiHtml(evaluatedHtml, slotRenderer = {}) {
  const tree = parseHtmlToTree(evaluatedHtml);
  let textboxCount = 0;
  let iconCount = 0;
  let buttonsCount = 0;
  let genInfoCount = 0;

  const renderNode = (node) => {
    if (typeof node === 'string') {
      return escapeHtmlTextNode(node);
    }

    const { tag, attrs, children } = node;

    if (tag === 'root') {
      return children.map(renderNode).join('');
    }

    if (tag === 'risutextbox') {
      textboxCount += 1;
      return typeof slotRenderer.renderTextbox === 'function'
        ? slotRenderer.renderTextbox()
        : '<span class="text chat-width chattext prose minw-0"></span>';
    }

    if (tag === 'risuicon') {
      iconCount += 1;
      return typeof slotRenderer.renderIcon === 'function'
        ? slotRenderer.renderIcon()
        : '<div style="width:56px;height:56px;min-width:56px;background:linear-gradient(135deg,#58a,#db9)"></div>';
    }

    if (tag === 'risubuttons') {
      buttonsCount += 1;
      return typeof slotRenderer.renderButtons === 'function'
        ? slotRenderer.renderButtons()
        : '<div class="risu-test-actions text-textcolor2"></div>';
    }

    if (tag === 'risugeninfo') {
      genInfoCount += 1;
      return typeof slotRenderer.renderGenInfo === 'function'
        ? slotRenderer.renderGenInfo()
        : '<div class="risu-test-info"></div>';
    }

    if (tag === 'script') {
      return '';
    }

    if (tag === 'style') {
      const cssInner = children
        .map((c) => (typeof c === 'string' ? c : ''))
        .join('')
        .replace(/<\/style/gi, '');
      return `<style>${cssInner}</style>`;
    }

    const safeTag = RISU_SUPPORTED_TAGS.has(tag) ? tag : 'div';
    const keptAttrs = [];

    if (typeof attrs.class === 'string') {
      keptAttrs.push(`class="${escapeHtmlAttr(attrs.class)}"`);
    }
    if (typeof attrs.style === 'string') {
      keptAttrs.push(`style="${escapeHtmlAttr(attrs.style)}"`);
    }
    if (safeTag === 'a') {
      const rawHref = typeof attrs.href === 'string' ? attrs.href.trim() : '';
      const safeHref = rawHref.startsWith('https') ? rawHref : '';
      keptAttrs.push(`target="_blank" rel="noreferrer" href="${escapeHtmlAttr(safeHref)}"`);
    }
    if (safeTag === 'img') {
      keptAttrs.push('alt=""');
    }

    const attrText = keptAttrs.length > 0 ? ' ' + keptAttrs.join(' ') : '';
    if (RISU_VOID_TAGS.has(safeTag)) {
      return `<${safeTag}${attrText}>`;
    }
    return `<${safeTag}${attrText}>${children.map(renderNode).join('')}</${safeTag}>`;
  };

  const html = renderNode(tree);
  return {
    html,
    counts: {
      textbox: textboxCount,
      icon: iconCount,
      buttons: buttonsCount,
      genInfo: genInfoCount
    }
  };
}

/**
 * RisuAI Custom HTML / Custom CSS의 정적 호환성과 오류·경고를 점검한다.
 */
function validateTheme(guiHTML, customCSS = '') {
  const html = String(guiHTML ?? '');
  const css = String(customCSS ?? '');
  const errors = [];
  const warnings = [];

  // CSS </style 차단 검사 (HTML이 없어도 항상 검사)
  if (/<\/style/i.test(css)) {
    errors.push('Custom CSS에 닫는 </style> 문자열이 포함되어 있습니다.');
  }

  if (!html.trim()) {
    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }

  // 자기 닫기 특수 슬롯 태그 검사
  const selfClosingRe = /<(risutextbox|risuicon|risubuttons|risugeninfo)(\s[^>]*)?\/>/gi;
  const selfClosingMatches = [...html.matchAll(selfClosingRe)];
  if (selfClosingMatches.length > 0) {
    const names = [...new Set(selfClosingMatches.map((m) => `<${m[1].toLowerCase()}/>`))].join(', ');
    errors.push(`특수 슬롯 태그는 자기 닫기(${names})를 사용할 수 없습니다. <tag></tag> 형태로 작성하세요.`);
  }

  // CBS 블록 짝 맞춤 검사
  const cbsStack = [];
  const cbsBlockRe = /\{\{(#when\b|#if\b|\/when\b|\/if\b)/g;
  let cbsMatch;
  while ((cbsMatch = cbsBlockRe.exec(html)) !== null) {
    const tok = cbsMatch[1];
    if (tok.startsWith('#')) {
      cbsStack.push(tok.slice(1));
    } else {
      const expected = tok.slice(1);
      if (cbsStack.length === 0 || cbsStack[cbsStack.length - 1] !== expected) {
        errors.push(`CBS 블록 여닫기가 일치하지 않습니다: {{${tok}}}`);
        break;
      }
      cbsStack.pop();
    }
  }
  if (cbsStack.length > 0) {
    errors.push(`닫히지 않은 CBS 블록이 있습니다: {{#${cbsStack[cbsStack.length - 1]}}}`);
  }

  // char / user 양쪽 역할에서 <risutextbox> 보존 여부 검사
  for (const role of ['char', 'user']) {
    const evaluated = evaluatePreviewCBS(html, role);
    const rendered = sanitizeAndRenderGuiHtml(evaluated);
    if (rendered.counts.textbox === 0) {
      errors.push(`${role} 역할 렌더링 결과에 <risutextbox></risutextbox>가 누락되었습니다.`);
    }
  }

  // 비지원 태그(div로 변환됨) 경고
  const tree = parseHtmlToTree(html);
  const convertedFound = new Set();
  let hasImgSrc = false;
  let hasInlineStyleTag = false;
  let hasScriptTag = false;
  let hasLegacyIf = /\{\{#if\s+\{\{/.test(html);

  const walkWarn = (node) => {
    if (typeof node === 'string') return;
    if (node.tag !== 'root') {
      if (CONVERTED_TO_DIV_WARN_TAGS.has(node.tag)) {
        convertedFound.add(`<${node.tag}>`);
      }
      if (node.tag === 'img' && typeof node.attrs.src === 'string' && node.attrs.src.trim() !== '') {
        hasImgSrc = true;
      }
      if (node.tag === 'style') {
        hasInlineStyleTag = true;
      }
      if (node.tag === 'script') {
        hasScriptTag = true;
      }
    }
    node.children.forEach(walkWarn);
  };
  walkWarn(tree);

  if (convertedFound.size > 0) {
    warnings.push(
      `RisuAI Chat.svelte에서 <div>로 변환되는 태그가 포함되어 있습니다: ${[...convertedFound].join(', ')}`
    );
  }
  if (hasImgSrc) {
    warnings.push('<img src="..."> 속성은 RisuAI Custom HTML 렌더러에서 전달되지 않습니다. 아바타는 <risuicon></risuicon>, 장식은 CSS 배경을 사용하세요.');
  }
  if (hasInlineStyleTag) {
    warnings.push('HTML 내부의 <style> 태그는 Custom CSS 입력란으로 분리하는 것이 권장됩니다.');
  }
  if (hasScriptTag) {
    warnings.push('Custom HTML 내 \x3Cscript> 태그는 RisuAI에서 실행되지 않고 제거됩니다.');
  }
  if (hasLegacyIf) {
    warnings.push('구형 {{#if {{...}}}} 문법이 감지되었습니다. 신형 {{#when::{{role}}::is::char}} 문법으로 변환할 수 있습니다.');
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}

function formatPlainTextToSampleHtml(rawText) {
  const text = String(rawText ?? '').trim();
  if (!text) return '';
  // 이미 HTML 태그를 포함하면 그대로 사용
  if (/<[a-z][\s\S]*>/i.test(text)) {
    return text;
  }
  const paragraphs = text.split(/\n{2,}/).map((para) => {
    let escaped = escapeHtmlText(para).replace(/\n/g, '<br>');
    escaped = escaped.replace(/"([^"\n]+)"/g, '<mark risu-mark="quote2">"$1"</mark>');
    escaped = escaped.replace(/'([^'\n]+)'/g, '<mark risu-mark="quote1">\'$1\'</mark>');
    return `<p>${escaped}</p>`;
  });
  return paragraphs.join('\n');
}

/** 미리보기용 샘플 초상 (스튜디오 조명 느낌의 실루엣 SVG) */
function previewAvatarUri(role) {
  const isChar = role === 'char';
  const bgTop = isChar ? '#23263d' : '#1b2b34';
  const bgBot = isChar ? '#4b345c' : '#2e4d54';
  const glow = isChar ? 'rgba(218,165,205,.46)' : 'rgba(232,196,138,.44)';
  const rim = isChar ? 'rgba(255,255,255,.72)' : 'rgba(255,248,236,.74)';
  const svg =
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 150" preserveAspectRatio="xMidYMid slice">' +
    '<defs>' +
    `<linearGradient id="bg" x1="0" y1="0" x2=".9" y2="1"><stop offset="0" stop-color="${bgTop}"/><stop offset="1" stop-color="${bgBot}"/></linearGradient>` +
    `<radialGradient id="gl" cx=".5" cy=".34" r=".55"><stop offset="0" stop-color="${glow}"/><stop offset="1" stop-color="transparent"/></radialGradient>` +
    `<linearGradient id="sil" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${rim}" stop-opacity=".86"/><stop offset="1" stop-color="${rim}" stop-opacity=".56"/></linearGradient>` +
    '</defs>' +
    '<rect width="120" height="150" fill="url(#bg)"/>' +
    '<rect width="120" height="150" fill="url(#gl)"/>' +
    '<circle cx="60" cy="54" r="22" fill="url(#sil)"/>' +
    '<path d="M16 150c4-35 23-51 44-51s40 16 44 51z" fill="url(#sil)"/>' +
    '</svg>';
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

/**
 * 미리보기 배경: 노을 진 하늘.
 * 그림 파일을 넣으면 플러그인 파일이 커지고 미리보기를 고칠 때마다 큰 문자열을 다시 처리하므로, CSS 그라데이션으로 그린다.
 * 맨 위 층은 넓은 그라데이션의 줄무늬를 풀어 주는 옅은 SVG 노이즈다.
 */
const SKY_NOISE = 'url("data:image/svg+xml,' + encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="160" height="160">' +
  '<filter id="n"><feTurbulence type="fractalNoise" baseFrequency=".85" numOctaves="2" stitchTiles="stitch"/>' +
  '<feColorMatrix values="0 0 0 0 .5  0 0 0 0 .5  0 0 0 0 .5  0 0 0 .07 0"/></filter>' +
  '<rect width="100%" height="100%" filter="url(#n)"/></svg>'
) + '")';

const SKY_LAYERS = {
  // 해 진 직후: 남색 → 보라 → 장밋빛 → 주황(지평선)
  dark: [
    'radial-gradient(120% 55% at 50% 100%, rgba(255, 170, 110, .55), rgba(233, 135, 90, 0) 70%)',
    'linear-gradient(to bottom, #1b1f3a 0%, #2c2a52 28%, #4a3566 50%, #b0566a 78%, #e9875a 100%)',
  ],
  // 해 질 녘: 하늘색 → 복숭아색 → 금빛(지평선)
  light: [
    'radial-gradient(120% 55% at 50% 100%, rgba(255, 228, 160, .7), rgba(246, 211, 138, 0) 70%)',
    'linear-gradient(to bottom, #7fa6d6 0%, #a9b9dc 30%, #f2b8a0 70%, #f6d38a 100%)',
  ],
};

function previewSkyBackground(palette) {
  const layers = SKY_LAYERS[palette === 'light' ? 'light' : 'dark'];
  return `${SKY_NOISE} repeat, ${layers.join(', ')}`;
}

/**
 * 메시지 본문에서 RisuAI가 하는 처리 중 테마에 영향을 주는 두 가지를 흉내 낸다.
 * - {{source::char}} / {{source::user}}를 프로필 이미지 주소로 바꾼다.
 * - 본문 HTML의 클래스에 x-risu- 접두사를 붙인다 (코드 강조 클래스는 그대로 둔다).
 */
function simulateBodyProcessing(html) {
  return String(html ?? '')
    .replace(/\{\{source::(char|user)\}\}/g, (_m, who) => previewAvatarUri(who))
    .replace(/class="([^"]*)"/g, (_m, cls) => {
      const next = cls
        .split(/\s+/)
        .filter(Boolean)
        .map((c) => (c.startsWith('x-risu-') || c.startsWith('hljs') ? c : `x-risu-${c}`))
        .join(' ');
      return `class="${next}"`;
    });
}

function createSlotRenderer(bodyHtml, editing, palette, role) {
  const proseClass = palette === 'dark' ? ' prose-invert' : '';
  const avatarUri = previewAvatarUri(role);

  return {
    renderTextbox() {
      if (editing) {
        return `<textarea class="message-edit-area" style="font-size:1.15rem;line-height:1.85rem">${escapeHtmlText(SAMPLE_MESSAGES.editingText)}</textarea>`;
      }
      return `<span class="text chat-width chattext prose minw-0${proseClass}" style="font-size:1.15rem;line-height:1.85rem">${bodyHtml}</span>`;
    },
    renderIcon() {
      return `<div style="width:56px;height:56px;min-width:56px;background-image:url('${avatarUri}');background-size:cover;background-position:center"></div>`;
    },
    renderButtons() {
      const actions = [
        ['translate', '번역', 18, ''],
        ['edit', '편집', 16, ''],
        ['copy', '복사', 16, ' risu-test-desktop-action'],
        ['tts', '음성', 16, ' risu-test-desktop-action'],
        ['menu', '메뉴', 18, ''],
        ['reroll', '재생성', 16, '']
      ];
      const btns = actions
        .map(([name, label, size, extra]) =>
          `<button type="button" class="button-icon-${name}${extra}" aria-label="${label}" title="${label}">` +
          `<svg aria-hidden="true" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="4" width="16" height="16" rx="3"></rect></svg>` +
          `</button>`
        )
        .join('');
      return `<div class="risu-test-actions text-textcolor2"><div class="risu-test-action-row">${btns}</div></div>`;
    },
    renderGenInfo() {
      return `<div class="risu-test-info"><span>Gemini · 1.2s</span><button type="button">번역 편집</button></div>`;
    }
  };
}

/**
 * 실시간 미리보기 iframe.srcdoc에 사용할 완성 HTML 문서를 생성한다.
 */
function buildPreviewSrcdoc(preset, options = {}) {
  const {
    palette = 'dark',
    backdrop = 'sky',
    roleFilter = 'all',
    customSampleText = '',
    charName = '세라 (Sera)',
    userName = '사용자 (User)',
    rootFontSize = 16,
    applyRegex = true
  } = options;

  const rawGuiHTML = String(preset?.guiHTML ?? '');
  const guiHTML = rawGuiHTML.trim() ? rawGuiHTML : FALLBACK_VANILLA_GUI_HTML;
  const safeCSS = String(preset?.customCSS ?? '').replace(/<\/style/gi, '');
  const rules = applyRegex && Array.isArray(preset?.regexRules) ? preset.regexRules : [];

  const sampleVars = { status: 'READY', turn: '12' };
  const customFormatted = customSampleText.trim()
    ? simulateBodyProcessing(formatPlainTextToSampleHtml(applyRegexRules(customSampleText, rules)))
    : '';

  const shortBody = customFormatted || simulateBodyProcessing(applyRegexRules(SAMPLE_MESSAGES.shortText, rules));
  const longBody = customFormatted || simulateBodyProcessing(applyRegexRules(SAMPLE_MESSAGES.longMarkdown, rules));

  let scenarios = [];
  if (roleFilter === 'char') {
    scenarios = [
      { role: 'char', body: shortBody, editing: false },
      { role: 'char', body: longBody, editing: false }
    ];
  } else if (roleFilter === 'user') {
    scenarios = [
      { role: 'user', body: shortBody, editing: false },
      { role: 'user', body: longBody, editing: false }
    ];
  } else if (roleFilter === 'edit') {
    scenarios = [
      { role: 'char', body: '', editing: true },
      { role: 'user', body: '', editing: true }
    ];
  } else {
    scenarios = [
      { role: 'char', body: '', editing: true },
      { role: 'char', body: shortBody, editing: false },
      { role: 'user', body: shortBody, editing: false },
      { role: 'char', body: longBody, editing: false }
    ];
  }

  const cardsHtml = scenarios
    .map((sc) => {
      const cbsHtml = evaluatePreviewCBS(guiHTML, sc.role, {
        charName,
        userName,
        vars: sampleVars
      });
      const slotRenderer = createSlotRenderer(sc.body, sc.editing, palette, sc.role);
      const { html } = sanitizeAndRenderGuiHtml(cbsHtml, slotRenderer);
      return `<div class="chat-message-container"><div class="risu-chat"><div class="risu-test-host">${html}</div></div></div>`;
    })
    // RisuAI처럼: 새 메시지가 목록 맨 앞에 오고(flex-col-reverse), 화면에는 맨 아래에 보인다.
    .reverse()
    .join('\n');
  const chatScreenHtml =
    '<div class="default-chat-screen" style="height:calc(100vh - 16px);overflow-y:auto;display:flex;flex-direction:column-reverse;position:relative">' +
    `<div class="flex flex-col-reverse" style="display:flex;flex-direction:column-reverse">${cardsHtml}</div>` +
    '</div>';

  const bodyBg = backdrop === 'solid'
    ? (palette === 'light' ? '#f3f4f6' : '#181a20')
    : previewSkyBackground(palette);
  const hostColorOverride = palette === 'light'
    ? `:root { --FontColorStandard: #0f172a; --FontColorBold: #0f172a; --FontColorItalic: #64748b; } .risu-test-host { color: #0f172a; }`
    : '';

  return [
    '<!doctype html>',
    '<html lang="ko">',
    '<head>',
    '<meta charset="utf-8">',
    '<meta name="viewport" content="width=device-width, initial-scale=1">',
    `<style>${RISU_HOST_CSS}\nhtml { font-size: ${Number(rootFontSize) || 16}px; }\n${hostColorOverride}</style>`,
    `<style>body { background: ${bodyBg}; }</style>`,
    `<style id="customcss">${safeCSS}</style>`,
    '</head>',
    '<body style="margin:0;padding:8px;min-height:100vh;">',
    chatScreenHtml,
    '</body>',
    '</html>'
  ].join('\n');
}

// === risu-bridge.js ===
const CUSTOM_TEXT_THEME_KEYS = [
    'FontColorStandard',
    'FontColorBold',
    'FontColorItalic',
    'FontColorItalicBold',
    'FontColorQuote1',
    'FontColorQuote2',
];

const VANILLA_DB_KEYS = ['theme', 'guiHTML', 'customCSS', 'textTheme', 'colorSchemeName'];

/** 플러그인 인자 이름. 체크하면 디스플레이 정규식을 끈다 (미설정 기본값 0 = 켜짐). */
const ARG_DISABLE_DISPLAY_REGEX = 'disable_display_regex';

const DISPLAY_REGEX_ARG_TTL_MS = 3000;

function hasValidCustomTextTheme(customTheme) {
    if (!customTheme || typeof customTheme !== 'object') {
        return false;
    }
    return CUSTOM_TEXT_THEME_KEYS.every((key) => typeof customTheme[key] === 'string');
}

/**
 * RisuAI DB에서 테마 관련 값을 읽는다.
 * 사용자가 DB 읽기 권한을 거절하면 getDatabase()가 null을 돌려준다.
 * 이때 빈 값을 돌려주면 "빈 바닐라 설정"이 백업으로 저장되어 복원 때 실제 설정을 지우게 되므로 오류로 처리한다.
 */
async function getVanillaState(api = globalThis.risuai) {
    if (!api || typeof api.getDatabase !== 'function') {
        throw new Error('RisuAI getDatabase API를 사용할 수 없습니다.');
    }

    const db = await api.getDatabase(VANILLA_DB_KEYS);
    if (!db || typeof db !== 'object') {
        throw new Error('RisuAI 설정을 읽지 못했습니다. 플러그인의 데이터베이스 읽기 권한을 허용해 주세요.');
    }

    return {
        theme: typeof db.theme === 'string' ? db.theme : '',
        guiHTML: typeof db.guiHTML === 'string' ? db.guiHTML : '',
        customCSS: typeof db.customCSS === 'string' ? db.customCSS : '',
        textTheme: typeof db.textTheme === 'string' ? db.textTheme : 'standard',
        colorSchemeName: typeof db.colorSchemeName === 'string' ? db.colorSchemeName : '',
    };
}

/**
 * setDatabaseLite는 <style id="customcss">를 갱신하지 않는다.
 * 텍스트 테마 API가 내부에서 updateTextThemeAndCSS()를 부르므로, 현재 텍스트 테마를 같은 값으로 다시 지정해 CSS를 반영시킨다.
 * 현재 텍스트 테마를 확인하지 못하면 사용자의 설정을 바꿀 수 있으므로 건드리지 않는다.
 */
async function refreshHostCSS(api = globalThis.risuai, preloadedTextInfo = null) {
    if (!api) {
        return { refreshed: false, reason: 'no-api' };
    }

    try {
        let textInfo = preloadedTextInfo;
        if (!textInfo && typeof api.getTextTheme === 'function') {
            textInfo = await api.getTextTheme();
        }

        const name = textInfo?.name;

        if (name === 'custom') {
            if (hasValidCustomTextTheme(textInfo.customTheme) && typeof api.setCustomTextTheme === 'function') {
                const payload = {};
                for (const key of CUSTOM_TEXT_THEME_KEYS) {
                    payload[key] = textInfo.customTheme[key];
                }
                await api.setCustomTextTheme(payload);
                return { refreshed: true, method: 'setCustomTextTheme' };
            }
            return { refreshed: false, reason: 'custom-text-theme-incomplete' };
        }

        if ((name === 'standard' || name === 'highcontrast') && typeof api.changeTextTheme === 'function') {
            await api.changeTextTheme(name);
            return { refreshed: true, method: 'changeTextTheme', name };
        }

        return { refreshed: false, reason: 'unknown-text-theme' };
    } catch (err) {
        return {
            refreshed: false,
            reason: 'error',
            error: err instanceof Error ? err.message : String(err),
        };
    }
}

async function readTextThemeSafely(api) {
    if (typeof api.getTextTheme !== 'function') {
        return null;
    }
    try {
        return await api.getTextTheme();
    } catch {
        return null;
    }
}

/**
 * DB에 쓰고, 다시 읽어 실제로 반영됐는지 확인한다.
 * 사용자가 DB 쓰기 권한을 거절하면 setDatabaseLite는 오류 없이 아무 일도 하지 않기 때문에 확인이 필요하다.
 */
async function writeThemeToDatabase(api, patch) {
    await api.setDatabaseLite(patch);

    const after = await getVanillaState(api);
    const mismatched = Object.keys(patch).filter((key) => after[key] !== patch[key]);
    if (mismatched.length > 0) {
        throw new Error(
            'RisuAI 설정에 기록되지 않았습니다. 플러그인의 데이터베이스 쓰기 권한을 허용했는지 확인해 주세요.',
        );
    }
}

function computeNextAppliedIds(state, preset, overrides = null) {
    const normalized = normalizePluginState(state);
    const id = preset?.id;
    if (!id) {
        return [...normalized.appliedPresetIds];
    }
    if (!normalized.stackPresets) {
        return [id];
    }
    const resolve = (pid) => {
        if (pid === id) return preset;
        return overrides instanceof Map && overrides.has(pid) ? overrides.get(pid) : findPreset(normalized, pid);
    };
    if (presetHasHtml(preset)) {
        const kept = normalized.appliedPresetIds.filter((existingId) => {
            if (existingId === id) return false;
            const existing = resolve(existingId);
            return existing ? !presetHasHtml(existing) : false;
        });
        return [id, ...kept];
    }
    if (normalized.appliedPresetIds.includes(id)) {
        return [...normalized.appliedPresetIds];
    }
    return [...normalized.appliedPresetIds, id];
}

function composeApplied(state, overrides = null) {
    const normalized = normalizePluginState(state);
    const presetsById = overrides?.presetsById instanceof Map ? overrides.presetsById : null;
    const appliedIds = Array.isArray(overrides?.appliedPresetIds)
        ? overrides.appliedPresetIds
        : normalized.appliedPresetIds;
    const resolve = (id) => (presetsById && presetsById.has(id) ? presetsById.get(id) : findPreset(normalized, id));
    const resolved = appliedIds.map(resolve).filter(Boolean);

    const slot0 = resolved[0] || null;
    const hasHtml = Boolean(slot0 && presetHasHtml(slot0));
    const backup = normalized.vanillaBackup;

    const theme = hasHtml ? 'customHTML' : (backup?.theme ?? '');
    const guiHTML = hasHtml ? slot0.guiHTML : (backup?.guiHTML ?? '');

    const cssParts = resolved.filter((preset) => presetHasCss(preset));
    let customCSS = '';
    if (cssParts.length === 1) {
        customCSS = cssParts[0].customCSS;
    } else if (cssParts.length >= 2) {
        const combined = cssParts
            .map((preset) => `/* ── 프리셋: ${sanitizeCssCommentText(preset.name || '이름 없는 프리셋')} ── */\n${preset.customCSS}`)
            .join('\n\n');
        customCSS = hoistImports(combined);
    }

    const regexRules = [];
    for (const preset of resolved) {
        if (!Array.isArray(preset.regexRules)) {
            continue;
        }
        for (const rule of preset.regexRules) {
            if (
                rule &&
                rule.enabled !== false &&
                (!rule.type || rule.type === 'editdisplay') &&
                typeof rule.in === 'string' &&
                rule.in !== ''
            ) {
                regexRules.push(rule);
            }
        }
    }

    return {
        theme,
        guiHTML,
        customCSS,
        regexRules,
        hasHtml,
        appliedPresets: resolved,
        cssPartCount: cssParts.length,
    };
}

async function activatePreset(preset, state, options = {}, api = globalThis.risuai) {
    if (!preset || typeof preset !== 'object') {
        throw new Error('활성화할 프리셋이 올바르지 않습니다.');
    }
    if (!api || typeof api.setDatabaseLite !== 'function') {
        throw new Error('RisuAI setDatabaseLite API를 사용할 수 없습니다.');
    }

    const normalizedPreset = normalizePresetItem(preset);
    if (!hasPresetContent(normalizedPreset)) {
        throw new Error('HTML·CSS·정규식 중 하나는 채워야 적용할 수 있습니다.');
    }
    const validation = validateTheme(normalizedPreset.guiHTML, normalizedPreset.customCSS);
    if (options.validate !== false && !options.force && !validation.valid) {
        throw new Error(`테마 검증 오류로 적용할 수 없습니다: ${validation.errors.join(' / ')}`);
    }

    const baseState = normalizePluginState(state);
    // 기본 제공 프리셋은 코드에서 읽으므로 사용자 목록에 넣지 않는다.
    const nextPresets = isBuiltinId(normalizedPreset.id)
        ? baseState.presets
        : baseState.presets.some((p) => p.id === normalizedPreset.id)
          ? baseState.presets.map((p) => (p.id === normalizedPreset.id ? { ...normalizedPreset, groupId: p.groupId } : p))
          : [...baseState.presets, normalizedPreset];

    const previousIds = baseState.appliedPresetIds;
    const oldSlot0 = previousIds[0] ? findPreset(baseState, previousIds[0]) : null;
    const stateWithNextPresets = { ...baseState, presets: nextPresets };
    const nextAppliedIds = computeNextAppliedIds(stateWithNextPresets, normalizedPreset);
    const wasAlreadyApplied = previousIds.includes(normalizedPreset.id);
    const replacedHtmlPreset =
        baseState.stackPresets &&
        presetHasHtml(normalizedPreset) &&
        oldSlot0 &&
        oldSlot0.id !== normalizedPreset.id &&
        presetHasHtml(oldSlot0)
            ? oldSlot0
            : null;
    const keptStackedCount = nextAppliedIds.length > 1 ? nextAppliedIds.length - 1 : 0;

    // 1) 바닐라 백업을 먼저 확보해 저장한다. DB를 덮어쓴 뒤에 저장이 실패하면 원본을 되찾을 수 없다.
    let vanillaBackup = baseState.vanillaBackup;
    if (!vanillaBackup) {
        const currentDb = await getVanillaState(api);
        vanillaBackup = {
            theme: currentDb.theme,
            guiHTML: currentDb.guiHTML,
            customCSS: currentDb.customCSS,
            capturedAt: new Date().toISOString(),
        };
        await savePluginState({ ...baseState, vanillaBackup, presets: nextPresets }, api);
    }

    const composed = composeApplied({
        ...baseState,
        vanillaBackup,
        presets: nextPresets,
        appliedPresetIds: nextAppliedIds,
    });
    if (options.validate !== false && !options.force && /<\/style/i.test(composed.customCSS)) {
        throw new Error('합친 Custom CSS에 닫는 </style> 문자열이 포함되어 있습니다.');
    }

    const textInfo = await readTextThemeSafely(api);

    // 2) 덮어쓰고 반영 여부를 확인한다.
    await writeThemeToDatabase(api, {
        theme: composed.theme,
        guiHTML: composed.guiHTML,
        customCSS: composed.customCSS,
    });

    const cssResult = await refreshHostCSS(api, textInfo);

    // 3) 적용 목록을 기록한다.
    const saveResult = await savePluginState(
        {
            ...baseState,
            vanillaBackup,
            appliedPresetIds: nextAppliedIds,
            presets: nextPresets,
        },
        api,
    );

    return {
        applied: true,
        state: saveResult.state,
        preset: normalizedPreset,
        validation,
        composed,
        wasAlreadyApplied,
        replacedHtmlPreset,
        keptStackedCount,
        addedStacked: baseState.stackPresets && !presetHasHtml(normalizedPreset) && !wasAlreadyApplied && nextAppliedIds.length > 1,
        cssRefreshed: cssResult.refreshed,
        cssRefreshInfo: cssResult,
    };
}

async function restoreVanilla(state, api = globalThis.risuai) {
    if (!api || typeof api.setDatabaseLite !== 'function') {
        throw new Error('RisuAI setDatabaseLite API를 사용할 수 없습니다.');
    }

    const baseState = normalizePluginState(state);
    const backup = baseState.vanillaBackup;

    // 백업이 없으면 플러그인이 덮어쓴 적이 없다는 뜻이다. 사용자의 현재 설정을 비우지 않는다.
    if (!backup) {
        if (baseState.appliedPresetIds.length === 0) {
            return { restored: false, hadBackup: false, state: baseState, cssRefreshed: false };
        }
        const cleared = await savePluginState({ ...baseState, appliedPresetIds: [] }, api);
        return { restored: false, hadBackup: false, state: cleared.state, cssRefreshed: false };
    }

    const textInfo = await readTextThemeSafely(api);

    await writeThemeToDatabase(api, {
        theme: backup.theme,
        guiHTML: backup.guiHTML,
        customCSS: backup.customCSS,
    });

    const cssResult = await refreshHostCSS(api, textInfo);

    const saveResult = await savePluginState(
        {
            ...baseState,
            appliedPresetIds: [],
            vanillaBackup: null,
        },
        api,
    );

    return {
        restored: true,
        hadBackup: true,
        state: saveResult.state,
        cssRefreshed: cssResult.refreshed,
    };
}

async function deactivatePreset(presetId, state, api = globalThis.risuai) {
    if (!api || typeof api.setDatabaseLite !== 'function') {
        throw new Error('RisuAI setDatabaseLite API를 사용할 수 없습니다.');
    }

    const baseState = normalizePluginState(state);
    if (!baseState.appliedPresetIds.includes(presetId)) {
        return { deactivated: false, restoredVanilla: false, state: baseState, cssRefreshed: false };
    }

    const nextAppliedIds = baseState.appliedPresetIds.filter((id) => id !== presetId);
    if (nextAppliedIds.length === 0) {
        const restoreRes = await restoreVanilla(baseState, api);
        return {
            deactivated: true,
            restoredVanilla: true,
            hadBackup: restoreRes.hadBackup,
            state: restoreRes.state,
            cssRefreshed: restoreRes.cssRefreshed,
        };
    }

    const nextState = { ...baseState, appliedPresetIds: nextAppliedIds };
    const composed = composeApplied(nextState);
    if (/<\/style/i.test(composed.customCSS)) {
        throw new Error('합친 Custom CSS에 닫는 </style> 문자열이 포함되어 있습니다.');
    }

    const textInfo = await readTextThemeSafely(api);
    await writeThemeToDatabase(api, {
        theme: composed.theme,
        guiHTML: composed.guiHTML,
        customCSS: composed.customCSS,
    });
    const cssResult = await refreshHostCSS(api, textInfo);
    const saveResult = await savePluginState(nextState, api);

    return {
        deactivated: true,
        restoredVanilla: false,
        state: saveResult.state,
        composed,
        cssRefreshed: cssResult.refreshed,
    };
}

async function setStackPresets(enabled, state, api = globalThis.risuai) {
    const baseState = normalizePluginState(state);
    const nextEnabled = Boolean(enabled);
    if (nextEnabled === baseState.stackPresets) {
        return {
            changed: false,
            droppedCount: 0,
            keptPreset: baseState.appliedPresetIds[0] ? findPreset(baseState, baseState.appliedPresetIds[0]) : null,
            state: baseState,
            cssRefreshed: false,
        };
    }

    if (nextEnabled || baseState.appliedPresetIds.length <= 1) {
        const saveResult = await savePluginState({ ...baseState, stackPresets: nextEnabled }, api);
        const keptId = saveResult.state.appliedPresetIds[0];
        return {
            changed: true,
            droppedCount: 0,
            keptPreset: keptId ? findPreset(saveResult.state, keptId) : null,
            state: saveResult.state,
            cssRefreshed: false,
        };
    }

    if (!api || typeof api.setDatabaseLite !== 'function') {
        throw new Error('RisuAI setDatabaseLite API를 사용할 수 없습니다.');
    }

    const keptId = baseState.appliedPresetIds[0];
    const droppedCount = baseState.appliedPresetIds.length - 1;
    const nextState = normalizePluginState({
        ...baseState,
        stackPresets: false,
        appliedPresetIds: [keptId],
    });
    const composed = composeApplied(nextState);
    if (/<\/style/i.test(composed.customCSS)) {
        throw new Error('합친 Custom CSS에 닫는 </style> 문자열이 포함되어 있습니다.');
    }

    const textInfo = await readTextThemeSafely(api);
    await writeThemeToDatabase(api, {
        theme: composed.theme,
        guiHTML: composed.guiHTML,
        customCSS: composed.customCSS,
    });
    const cssResult = await refreshHostCSS(api, textInfo);
    const saveResult = await savePluginState(nextState, api);

    return {
        changed: true,
        droppedCount,
        keptPreset: findPreset(saveResult.state, keptId),
        state: saveResult.state,
        cssRefreshed: cssResult.refreshed,
    };
}

/**
 * 삭제나 덮어쓰기 가져오기 뒤 적용 중이던 목록이 바뀌었으면 RisuAI DB까지 함께 맞춘다.
 * 마지막 적용 프리셋까지 빠지면 바닐라로 복원한다. DB 쓰기에 실패하면 상태를 저장하지 않고 오류를 던진다.
 */
async function syncAppliedStateToRisu(prevState, nextState, api = globalThis.risuai) {
    const prevNormalized = normalizePluginState(prevState);
    const nextNormalized = normalizePluginState(nextState);

    if (prevNormalized.appliedPresetIds.length === 0) {
        const saved = await savePluginState(nextNormalized, api);
        return { dbUpdated: false, restoredVanilla: false, state: saved.state, cssRefreshed: false };
    }

    const prevComposed = composeApplied(prevNormalized);
    const nextComposed = composeApplied(nextNormalized);
    const sameIds =
        prevNormalized.appliedPresetIds.length === nextNormalized.appliedPresetIds.length &&
        prevNormalized.appliedPresetIds.every((id, idx) => id === nextNormalized.appliedPresetIds[idx]);
    const sameOutput =
        sameIds &&
        prevComposed.theme === nextComposed.theme &&
        prevComposed.guiHTML === nextComposed.guiHTML &&
        prevComposed.customCSS === nextComposed.customCSS;

    if (sameOutput) {
        const saved = await savePluginState(nextNormalized, api);
        return { dbUpdated: false, restoredVanilla: false, state: saved.state, cssRefreshed: false };
    }

    if (nextNormalized.appliedPresetIds.length === 0) {
        const backup = prevNormalized.vanillaBackup;
        if (!backup) {
            const saved = await savePluginState({ ...nextNormalized, appliedPresetIds: [] }, api);
            return { dbUpdated: false, restoredVanilla: false, state: saved.state, cssRefreshed: false };
        }
        if (!api || typeof api.setDatabaseLite !== 'function') {
            throw new Error('RisuAI setDatabaseLite API를 사용할 수 없습니다.');
        }
        const textInfo = await readTextThemeSafely(api);
        await writeThemeToDatabase(api, {
            theme: backup.theme,
            guiHTML: backup.guiHTML,
            customCSS: backup.customCSS,
        });
        const cssResult = await refreshHostCSS(api, textInfo);
        const saved = await savePluginState(
            { ...nextNormalized, appliedPresetIds: [], vanillaBackup: null },
            api,
        );
        return {
            dbUpdated: true,
            restoredVanilla: true,
            state: saved.state,
            cssRefreshed: cssResult.refreshed,
        };
    }

    if (!api || typeof api.setDatabaseLite !== 'function') {
        throw new Error('RisuAI setDatabaseLite API를 사용할 수 없습니다.');
    }
    if (/<\/style/i.test(nextComposed.customCSS)) {
        throw new Error('합친 Custom CSS에 닫는 </style> 문자열이 포함되어 있습니다.');
    }

    const textInfo = await readTextThemeSafely(api);
    await writeThemeToDatabase(api, {
        theme: nextComposed.theme,
        guiHTML: nextComposed.guiHTML,
        customCSS: nextComposed.customCSS,
    });
    const cssResult = await refreshHostCSS(api, textInfo);
    const saved = await savePluginState(nextNormalized, api);

    return {
        dbUpdated: true,
        restoredVanilla: false,
        state: saved.state,
        cssRefreshed: cssResult.refreshed,
    };
}

async function captureCurrentVanillaAsPreset(name, state, api = globalThis.risuai) {
    const currentDb = await getVanillaState(api);
    const baseState = normalizePluginState(state);
    const trimmedName = typeof name === 'string' && name.trim() ? name.trim() : `바닐라 스냅샷 (${new Date().toLocaleTimeString()})`;

    const capturedPreset = normalizePresetItem({
        id: createPresetId(),
        name: trimmedName,
        description: `현재 RisuAI DB에서 가져옴 (원본 theme: ${currentDb.theme || 'classic'})`,
        guiHTML: currentDb.guiHTML,
        customCSS: currentDb.customCSS,
        regexRules: [],
        updatedAt: new Date().toISOString(),
    });

    const nextState = normalizePluginState({
        ...baseState,
        presets: [...baseState.presets, capturedPreset],
    });

    const saveResult = await savePluginState(nextState, api);
    return {
        preset: capturedPreset,
        state: saveResult.state,
    };
}

/**
 * 플러그인 인자 값이 "켜짐"인지 판정한다.
 * RisuAI 설정 화면의 체크박스는 문자열 '1' / '0'을 저장하고, 한 번도 건드리지 않은 int 인자는 숫자 0이다.
 */
function isArgChecked(value) {
    return value === 1 || value === '1' || value === true || value === 'true';
}

async function readDisplayRegexEnabled(api = globalThis.risuai) {
    if (!api || typeof api.getArgument !== 'function') {
        return true;
    }
    try {
        return !isArgChecked(await api.getArgument(ARG_DISABLE_DISPLAY_REGEX));
    } catch {
        return true;
    }
}

/** 적용된 프리셋들에서 실제로 적용될 디스플레이 정규식 규칙만 순서대로 고른다. */
function getActiveDisplayRules(state) {
    if (!state) {
        return [];
    }
    const appliedIds = Array.isArray(state.appliedPresetIds)
        ? state.appliedPresetIds
        : typeof state.activePresetId === 'string' && state.activePresetId
          ? [state.activePresetId]
          : [];
    if (appliedIds.length === 0) {
        return [];
    }
    const rules = [];
    for (const id of appliedIds) {
        const activePreset = findPreset(state, id);
        if (!activePreset || !Array.isArray(activePreset.regexRules)) {
            continue;
        }
        for (const rule of activePreset.regexRules) {
            if (
                rule &&
                rule.enabled !== false &&
                (!rule.type || rule.type === 'editdisplay') &&
                typeof rule.in === 'string' &&
                rule.in !== ''
            ) {
                rules.push(rule);
            }
        }
    }
    return rules;
}

/**
 * 활성 프리셋의 디스플레이 정규식을 RisuAI 'display' 훅에 연결한다.
 *
 * 훅은 메시지를 그릴 때마다 호스트↔플러그인 iframe 사이를 왕복한다.
 * 그래서 적용할 규칙이 있을 때만 등록하고, 없으면 해제해 둔다. 상태가 바뀔 때마다 sync()를 부른다.
 * 끄기 인자는 훅 안에서 몇 초 단위로만 다시 읽는다.
 */
async function registerDisplayRegexHook(getStateFn, api = globalThis.risuai) {
    const canRegister = Boolean(api) && typeof api.addRisuScriptHandler === 'function';
    const readState = () => (typeof getStateFn === 'function' ? getStateFn() : null);

    let registered = false;
    let enabledCache = true;
    let enabledCheckedAt = 0;
    let pending = Promise.resolve();

    const refreshEnabled = async (force = false) => {
        const now = Date.now();
        if (force || now - enabledCheckedAt > DISPLAY_REGEX_ARG_TTL_MS) {
            enabledCheckedAt = now;
            enabledCache = await readDisplayRegexEnabled(api);
        }
        return enabledCache;
    };

    const handler = async (content) => {
        if (typeof content !== 'string' || !content) {
            return content;
        }
        const displayRules = getActiveDisplayRules(readState());
        if (displayRules.length === 0) {
            return content;
        }
        if (!(await refreshEnabled())) {
            return content;
        }
        return applyRegexRules(content, displayRules);
    };

    const syncNow = async () => {
        if (!canRegister) {
            return;
        }
        const shouldRegister = getActiveDisplayRules(readState()).length > 0;
        if (shouldRegister && !registered) {
            await api.addRisuScriptHandler('display', handler);
            registered = true;
        } else if (!shouldRegister && registered) {
            if (typeof api.removeRisuScriptHandler === 'function') {
                await api.removeRisuScriptHandler('display', handler);
            }
            registered = false;
        }
        await refreshEnabled(true);
    };

    // 연달아 호출돼도 등록/해제가 순서대로 처리되게 한 줄로 세운다.
    const sync = () => {
        pending = pending.then(syncNow, syncNow);
        return pending;
    };

    await sync();

    return {
        get registered() {
            return registered;
        },
        handler,
        sync,
        dispose: async () => {
            await pending.catch(() => {});
            if (registered && typeof api.removeRisuScriptHandler === 'function') {
                await api.removeRisuScriptHandler('display', handler);
            }
            registered = false;
        },
    };
}

// === help-copy.js ===
// 관리자 UI 도움말 문구. 원본: docs/help-copy.json (short: 마우스를 올리면 뜨는 한 줄, long: 도움말 모드 설명)
const HELP_COPY = {
    "help.toggle": {
        "short": "도움말 모드를 켜고 끕니다.",
        "long": "도움말 모드를 켜고 끕니다. 켜져 있는 동안 화면 항목을 누르면 실행되지 않고 설명이 뜹니다. Esc 키로도 끌 수 있습니다."
    },
    "help.banner": {
        "short": "항목을 누르면 설명이 뜨며 ?나 Esc로 끕니다.",
        "long": ""
    },
    "header.status": {
        "short": "지금 RisuAI에 적용된 프리셋 목록을 보고 해제합니다.",
        "long": "지금 RisuAI에 적용된 프리셋 이름을 보여 줍니다. 누르면 적용 순서 목록이 열리며, 프리셋을 선택해 바로 이동하거나 개별 해제할 수 있습니다. 적용한 프리셋이 없으면 RisuAI 자체 설정을 쓰는 중이라고 표시합니다."
    },
    "header.close": {
        "short": "테마 프리셋 관리자 창을 닫습니다.",
        "long": "관리자 창을 닫습니다. 저장하지 않은 변경이 있으면 계속 편집·버리고 닫기·저장하고 닫기 중 고를 수 있습니다."
    },
    "mnav.list": {
        "short": "프리셋 목록 화면으로 바꿉니다.",
        "long": "저장된 프리셋을 고르는 목록 화면으로 바꿉니다."
    },
    "mnav.editor": {
        "short": "선택한 프리셋 편집 화면으로 바꿉니다.",
        "long": "선택한 프리셋의 편집 화면으로 바꿉니다."
    },
    "mnav.preview": {
        "short": "채팅 미리보기 화면으로 바꿉니다.",
        "long": "편집 중인 프리셋이 채팅에서 어떻게 보일지 확인하는 미리보기 화면으로 바꿉니다."
    },
    "list.search": {
        "short": "이름과 메모로 프리셋 목록을 찾습니다.",
        "long": "입력한 글자가 이름이나 메모에 들어 있는 프리셋만 목록에 남깁니다."
    },
    "list.section-builtin": {
        "short": "플러그인에 들어 있는 기본 프리셋입니다.",
        "long": "플러그인을 업데이트하면 함께 바뀝니다. 고쳐서 저장하면 원본은 그대로 두고 내 프리셋에 복사본이 생기고, 지우면 숨김으로 처리됩니다."
    },
    "list.section-user": {
        "short": "직접 만들거나 저장한 프리셋입니다.",
        "long": "이 기기의 RisuAI에 저장됩니다. 끌어서 그룹으로 묶거나 순서를 바꿀 수 있고, 지우면 되살릴 수 없습니다."
    },
    "list.builtin-group": {
        "short": "기본 제공 프리셋 묶음입니다.",
        "long": "누르면 펼치거나 접습니다. 기본 제공 그룹은 플러그인이 정한 것이라 프리셋을 끌어 넣거나 뺄 수 없습니다."
    },
    "list.card": {
        "short": "누르면 이 프리셋을 편집 화면에 엽니다.",
        "long": "누르면 편집 화면에 엽니다. 끌어서 다른 프리셋 가운데에 놓으면 그룹으로 묶이고, 위아래 가장자리에 놓으면 순서가 바뀝니다. 휴대폰에서는 길게 누른 뒤 끕니다."
    },
    "list.badge-active": {
        "short": "지금 RisuAI에 적용된 프리셋입니다.",
        "long": "이 프리셋이 지금 RisuAI 채팅 화면에 적용되어 있음을 뜻합니다. 중복 적용을 켜면 적용 순서 번호(적용 1, 적용 2…)가 표시됩니다."
    },
    "list.badge-unsaved": {
        "short": "아직 한 번도 저장하지 않은 새 프리셋입니다.",
        "long": "새로 만든 뒤 아직 한 번도 저장하지 않은 프리셋입니다. 저장하지 않고 다른 프리셋을 열면 사라집니다."
    },
    "list.dirty-dot": {
        "short": "편집했지만 저장하지 않은 변경이 있습니다.",
        "long": "이 프리셋을 고쳤지만 아직 저장하지 않았음을 뜻합니다. 저장을 눌러야 프리셋 목록에 기록됩니다."
    },
    "list.group": {
        "short": "같은 그룹으로 묶인 프리셋입니다.",
        "long": "머리글을 누르면 펼치거나 접습니다. 프리셋을 머리글에 끌어다 놓으면 그룹에 들어가고, 그룹 밖에 놓으면 빠집니다. 프리셋이 하나만 남으면 그룹이 풀립니다."
    },
    "list.group-rename": {
        "short": "그룹 이름을 바꿉니다.",
        "long": "그룹 이름을 바꿉니다. 그룹 이름을 두 번 눌러도 바꿀 수 있습니다. JSON으로 내보내면 그룹 이름도 함께 옮겨집니다."
    },
    "tb.new": {
        "short": "빈 새 프리셋을 만들어 엽니다.",
        "long": "이름, 메모, 빈 HTML·CSS 칸을 가진 새 프리셋을 엽니다. 저장을 누르기 전에는 프리셋 목록에 기록되지 않습니다."
    },
    "tb.save": {
        "short": "편집한 내용을 프리셋 목록에 저장합니다.",
        "long": "편집한 내용을 프리셋 목록에 기록합니다. 기본 제공 프리셋은 원본을 두고 내 프리셋에 복사본을 만듭니다. Ctrl+S(맥은 Cmd+S)로도 저장되며, 저장만 해서는 RisuAI 화면이 바뀌지 않습니다."
    },
    "tb.delete": {
        "short": "지금 연 프리셋을 목록에서 지웁니다.",
        "long": "지금 연 프리셋을 확인 후 목록에서 지우며, 지운 프리셋은 되살릴 수 없습니다. 적용 중이던 프리셋을 지우면 RisuAI 설정에서도 빠지고(마지막 하나였으면 원래 테마로 복원), 적용 중이 아니면 RisuAI 설정은 그대로 둡니다."
    },
    "tb.hide": {
        "short": "이 기본 제공 프리셋을 숨깁니다.",
        "long": "기본 제공 프리셋은 지우지 않고 목록에서 숨깁니다. 적용 중인 상태는 그대로 유지되며 상단 적용 목록에서 해제하거나 ⋯ 메뉴의 숨긴 기본 프리셋 다시 보기로 되살릴 수 있습니다."
    },
    "tb.deactivate": {
        "short": "지금 프리셋만 적용 해제합니다.",
        "long": "이 프리셋을 적용 목록에서 빼고 남은 프리셋들로 다시 합쳐 씁니다. 마지막 프리셋까지 해제하면 RisuAI를 원래 테마로 되돌립니다."
    },
    "tb.apply": {
        "short": "프리셋을 저장하고 RisuAI 화면에 입힙니다.",
        "long": "지금 프리셋을 저장한 뒤 RisuAI 설정에 적용합니다. 중복 적용을 켜면 CSS·정규식만 있는 프리셋은 기존 테마 위에 겹쳐지고, HTML이 있는 프리셋은 기존 HTML 자리만 교체하며 겹쳐 둔 조각을 유지합니다. CSS만 겹쳐 쓸 때 원래 RisuAI CSS는 포함되지 않으며, 겹친 CSS는 선택자 우선순위가 같을 때만 뒤쪽이 이깁니다."
    },
    "tb.more": {
        "short": "자주 쓰지 않는 기능을 모은 메뉴를 엽니다.",
        "long": "자주 쓰지 않는 기능을 모은 메뉴를 엽니다."
    },
    "menu.duplicate": {
        "short": "지금 프리셋을 복사해 새 프리셋으로 만듭니다.",
        "long": "지금 프리셋 이름 뒤에 (복사본)을 붙여 새 프리셋으로 저장하고 엽니다. 저장하지 않은 변경이 있으면 원본을 먼저 저장합니다."
    },
    "menu.move-group": {
        "short": "이 프리셋을 그룹에 넣습니다.",
        "long": "그룹이나 다른 프리셋을 골라 지금 프리셋을 넣습니다. 그룹이 없는 프리셋을 고르면 둘을 묶은 새 그룹을 만듭니다. 저장하지 않은 새 프리셋은 옮길 수 없습니다."
    },
    "menu.ungroup": {
        "short": "이 프리셋을 그룹에서 뺍니다.",
        "long": "지금 프리셋을 그룹에서 빼서 그룹 바로 뒤에 둡니다. 그룹에 프리셋이 하나만 남으면 그룹이 풀립니다."
    },
    "menu.export-json": {
        "short": "지금 프리셋을 JSON 글로 클립보드에 복사합니다.",
        "long": "이름, 메모, HTML, CSS, 디스플레이 정규식 규칙까지 프리셋 전체를 JSON 형식 글로 클립보드에 복사합니다. 다른 기기나 사람에게 옮길 때 쓰며, 복사가 막히면 창을 띄워 직접 복사하게 합니다."
    },
    "menu.paste-json": {
        "short": "JSON 글을 붙여넣어 프리셋이나 규칙을 가져옵니다.",
        "long": "붙여넣은 JSON 글이 프리셋이면 새로 추가하고, 같은 프리셋이 이미 있으면 덮어씁니다. Risu 정규식이면 지금 프리셋의 규칙 뒤에 붙입니다. ‘기존 목록을 지우고 바꾸기’를 체크하면 지금 목록이 모두 지워지며 되돌릴 수 없습니다."
    },
    "menu.file-import": {
        "short": ".json 파일에서 프리셋이나 규칙을 불러옵니다.",
        "long": "하나 이상의 .json 파일을 골라 JSON 붙여넣기와 같은 방식으로 가져옵니다. 기존 목록은 지우지 않고, 같은 프리셋이 있으면 덮어씁니다."
    },
    "menu.backup-all": {
        "short": "모든 프리셋을 한꺼번에 클립보드에 복사합니다.",
        "long": "내 프리셋과 숨긴 기본 프리셋 목록을 한 JSON 글로 클립보드에 복사합니다. 기본 제공 프리셋은 플러그인에 들어 있어 넣지 않습니다."
    },
    "menu.stack-toggle": {
        "short": "CSS·정규식 프리셋을 테마 위에 겹쳐 적용합니다.",
        "long": "켜면 HTML이 없는(CSS·정규식만 있는) 프리셋을 기존 테마 위에 겹쳐 쓰고, HTML이 있는 프리셋은 기존 HTML 자리(1번)만 교체합니다. 끄면 1번 프리셋만 남기고 겹쳐 둔 프리셋을 해제합니다. HTML 없이 CSS만 적용하면 RisuAI 원래 Custom CSS는 빠지며, 겹친 CSS는 선택자 우선순위가 같거나 더 높아야(!important 포함 규칙 등) 기존 스타일을 덮어씁니다."
    },
    "menu.unhide": {
        "short": "숨긴 기본 제공 프리셋을 되살립니다.",
        "long": "숨긴 기본 제공 프리셋 목록을 열어 하나씩 또는 모두 다시 보이게 합니다. 숨긴 것이 없으면 눌리지 않습니다."
    },
    "menu.capture": {
        "short": "현재 RisuAI 테마를 새 프리셋으로 저장합니다.",
        "long": "지금 RisuAI에 들어 있는 Custom HTML과 CSS 설정을 새 프리셋으로 저장합니다. 플러그인을 쓰기 전에 만들어 둔 테마를 목록에 넣을 때 씁니다."
    },
    "menu.restore": {
        "short": "RisuAI를 처음 적용 전 원래 테마로 돌립니다.",
        "long": "확인을 받은 뒤 RisuAI 테마 설정을 처음 적용하기 직전의 원래 테마로 되돌립니다. 복원 직전 설정은 따로 보관하지 않지만, 적용했던 프리셋은 목록에 남아 다시 적용할 수 있습니다. 보관한 원래 테마가 없으면 아무것도 바꾸지 않습니다."
    },
    "tab.editor": {
        "short": "이름, 메모, HTML·CSS 편집 탭으로 바꿉니다.",
        "long": "프리셋의 이름, 메모와 채팅 메시지 모양을 정하는 Custom HTML, Custom CSS를 편집하는 탭으로 바꿉니다."
    },
    "tab.regex": {
        "short": "디스플레이 정규식과 일괄 변환 탭으로 바꿉니다.",
        "long": "채팅에 보이는 글자만 바꾸는 디스플레이 정규식 규칙과 HTML·CSS 일괄 변환 도구가 있는 탭으로 바꿉니다. 괄호 안 숫자는 규칙 개수입니다."
    },
    "ed.name": {
        "short": "목록과 배지에 표시될 프리셋 이름입니다.",
        "long": "프리셋 목록과 ‘적용 중’ 배지에 보이는 이름입니다. 비워 두고 저장하면 ‘이름 없는 프리셋’으로 기록됩니다."
    },
    "ed.memo": {
        "short": "프리셋에 적어 두는 자유 메모입니다.",
        "long": "프리셋에 자유롭게 남기는 메모입니다. 여러 줄을 쓸 수 있지만 목록 카드에는 첫 줄만 보이며, JSON으로 내보내면 함께 옮겨집니다."
    },
    "ed.builtin-note": {
        "short": "기본 제공 프리셋을 편집하고 있습니다.",
        "long": "여기서 고친 내용은 저장할 때 내 프리셋에 복사본으로 저장됩니다. 기본 제공 원본은 바뀌지 않습니다."
    },
    "ed.validation": {
        "short": "HTML·CSS가 잘 동작할지 자동 점검합니다.",
        "long": "편집할 때마다 HTML·CSS를 자동으로 점검합니다. HTML을 비우면 CSS·정규식 전용 프리셋으로 검사하며, CSS에 닫는 style 태그가 있는지 봅니다. HTML·CSS·정규식(찾을 패턴) 중 하나 이상 채워야 저장·적용할 수 있습니다."
    },
    "ed.html": {
        "short": "채팅 메시지 틀을 짜는 HTML 편집창입니다.",
        "long": "채팅 메시지 틀을 정하는 HTML입니다. 비워 두면 CSS·정규식만 있는 프리셋이 됩니다. HTML을 쓸 때는 본문 자리에 <risutextbox></risutextbox>를 넣고, 이런 특수 태그는 닫는 태그까지 씁니다."
    },
    "ed.css": {
        "short": "색·크기·간격을 정하는 CSS 편집창입니다.",
        "long": "메시지의 색, 크기, 간격 같은 모양을 정하는 CSS를 씁니다. RisuAI 전체에 적용되므로 이름 앞에 고유한 글자(접두사)를 붙이는 편이 안전합니다. Tab은 2칸 들여쓰기입니다."
    },
    "ed.copy": {
        "short": "이 편집창의 코드만 클립보드에 복사합니다.",
        "long": "이 편집창에 적힌 코드만 클립보드에 복사합니다. RisuAI 설정에 직접 붙여넣거나 남에게 코드만 줄 때 씁니다."
    },
    "rx.rules": {
        "short": "채팅 화면의 글자만 바꾸는 규칙 목록입니다.",
        "long": "이 프리셋에 딸린 디스플레이 정규식(글자 바꾸기) 규칙입니다. 채팅에는 적용 중인 프리셋의 켜진 규칙만 쓰이고, 저장된 대화는 바뀌지 않습니다. 플러그인을 지우면 규칙도 꺼집니다."
    },
    "rx.paste": {
        "short": "RisuAI 정규식 JSON을 붙여넣습니다.",
        "long": "붙여넣기 칸을 엽니다. RisuAI에서 내보낸 정규식 스크립트(JSON)를 붙여넣으면 지금 프리셋의 규칙 뒤에 이어 붙습니다."
    },
    "rx.copy": {
        "short": "규칙을 RisuAI 정규식 JSON으로 복사합니다.",
        "long": "이 프리셋의 규칙을 RisuAI 정규식 설정에서 가져올 수 있는 JSON 글로 클립보드에 복사합니다. 규칙이 없으면 눌리지 않습니다."
    },
    "rx.add": {
        "short": "빈 글자 바꾸기 규칙을 하나 추가합니다.",
        "long": "빈 디스플레이 정규식 규칙 하나를 목록 맨 뒤에 추가합니다."
    },
    "rx.host-toggle": {
        "short": "프리셋 규칙을 RisuAI 채팅에 쓸지 정합니다.",
        "long": "끄면 적용 중인 프리셋의 디스플레이 정규식 규칙을 채팅에 쓰지 않습니다. 프리셋과 무관한 플러그인 전체 설정으로 바로 반영되며 RisuAI 플러그인 설정과 연결됩니다."
    },
    "rx.rule-enable": {
        "short": "이 규칙 하나를 켜거나 끕니다.",
        "long": "이 규칙만 따로 켜고 끕니다. 끄면 카드가 흐리게 보이고 채팅 화면과 미리보기에 적용되지 않습니다."
    },
    "rx.rule-name": {
        "short": "규칙을 알아보기 위한 이름입니다.",
        "long": "규칙을 구분해 알아보기 위한 이름입니다. 실제 글자 바꾸기 동작에는 영향을 주지 않습니다."
    },
    "rx.rule-flag": {
        "short": "정규식 검색 방식을 정하는 옵션 글자입니다.",
        "long": "정규식(글자 찾기 패턴) 검색 방식을 정합니다. g는 모두 찾기, i는 대소문자 무시, m은 줄마다 처음·끝 맞추기, s는 .이 줄바꿈까지 포함하게 합니다."
    },
    "rx.rule-move": {
        "short": "규칙의 적용 순서를 위아래로 바꿉니다.",
        "long": "규칙 순서를 위아래로 옮깁니다. 규칙은 목록 위에서부터 아래로 차례대로 적용됩니다."
    },
    "rx.rule-delete": {
        "short": "이 규칙을 바로 지웁니다.",
        "long": "확인을 묻지 않고 이 규칙을 지웁니다. 저장 전이라면 다른 프리셋을 열 때 변경을 버려 되돌릴 수 있지만, 저장하면 되살릴 수 없습니다."
    },
    "rx.rule-in": {
        "short": "바꿀 대상을 찾는 글자 패턴입니다.",
        "long": "채팅 글자에서 찾아낼 패턴(정규식)을 적는 칸입니다."
    },
    "rx.rule-out": {
        "short": "찾은 글자를 대신 넣을 내용입니다.",
        "long": "찾은 부분을 바꿀 내용을 적습니다. $&는 찾은 글자 전체, $1은 패턴의 첫 번째 괄호에 걸린 글자를 뜻합니다."
    },
    "rx.bulk": {
        "short": "편집 중인 HTML·CSS를 한꺼번에 고칩니다.",
        "long": "편집 중인 HTML·CSS 코드를 규칙에 따라 한꺼번에 고치는 도구입니다. 저장을 누르기 전까지는 확정되지 않습니다."
    },
    "rx.legacy-when": {
        "short": "구형 조건문 {{#if}}를 신형으로 바꿉니다.",
        "long": "캐릭터·사용자 메시지를 나누는 구형 {{#if}} 조건문(equal, not_equal)을 신형 {{#when}} 문법(is, isnot)으로 바꿉니다. HTML에만 적용됩니다."
    },
    "rx.fix-selfclose": {
        "short": "한 태그로 닫힌 특수 태그를 고칩니다.",
        "long": "<risuicon/>처럼 한 태그로 닫은 특수 태그를 <risuicon></risuicon> 꼴로 고칩니다. RisuAI는 한 태그로 닫은 특수 태그를 제대로 읽지 못합니다. HTML에만 적용됩니다."
    },
    "rx.prefix": {
        "short": "클래스·변수 앞머리의 접두사를 바꿉니다.",
        "long": "HTML 클래스와 CSS 선택자·변수(--)·애니메이션 이름의 앞 글자(접두사)를 한꺼번에 바꿉니다. 다른 테마와 이름이 겹치지 않게 할 때 쓰며, 두 칸이 비거나 같으면 안 바뀝니다."
    },
    "rx.custom": {
        "short": "직접 쓴 정규식으로 코드를 찾아 바꿉니다.",
        "long": "고른 대상(HTML·CSS)에서 직접 쓴 정규식(패턴)으로 한꺼번에 찾아 바꿉니다. 검색 옵션(플래그)을 비우면 모두 찾기(g)로 실행되며, 바꿀 내용에 $1 등을 쓸 수 있고 바꾼 곳 수를 알려 줍니다."
    },
    "rx.outconv": {
        "short": "정규식 OUT 테마를 HTML·CSS로 옮깁니다.",
        "long": "RisuAI 정규식의 OUT 칸으로 만든 테마를 Custom HTML로 옮깁니다. 본문 자리({{data}}, $&, $1), 특수 태그, 구형 {{#if}}를 고쳐 HTML 편집창에 덮어쓰고, <style> 안 CSS는 기존 CSS 뒤에 붙입니다."
    },
    "pv.width": {
        "short": "미리보기 화면의 가로 폭을 바꿉니다.",
        "long": "미리보기 화면의 가로 폭을 고릅니다. 전체는 지금 창과 같은 크기의 화면을 그립니다. 창은 520px, 모바일은 390px 폭입니다. 화면이 미리보기 칸보다 크면 칸에 맞게 줄여서 보여 줍니다."
    },
    "pv.wide": {
        "short": "편집 칸을 접고 미리보기를 넓힙니다.",
        "long": "편집 칸을 접어 미리보기를 넓게 보여 줍니다. 줄여서 보이던 화면이 커져 글자를 읽기 쉽습니다. 다시 누르면 편집 칸이 돌아옵니다."
    },
    "pv.palette": {
        "short": "미리보기의 어두운·밝은 배색을 바꿉니다.",
        "long": "RisuAI가 어두운 배색일 때와 밝은 배색일 때를 미리보기에서 흉내 냅니다. RisuAI의 실제 설정은 바꾸지 않습니다."
    },
    "pv.backdrop": {
        "short": "미리보기 배경을 노을·단색 중에서 고릅니다.",
        "long": "글래스 테마의 비침을 보기 좋은 노을 배경과, 불투명 테마의 실사용 느낌을 보기 좋은 기본 단색 배경 사이를 전환합니다."
    },
    "pv.apply": {
        "short": "지금 보고 있는 프리셋을 RisuAI에 적용합니다.",
        "long": "미리보기를 크게 보거나 휴대폰에서 볼 때도 편집 탭으로 돌아가지 않고 바로 RisuAI에 적용할 수 있습니다."
    },
    "pv.approx": {
        "short": "HTML 없는 프리셋을 기본 화면 근사 틀에 겹쳐 보여 줍니다.",
        "long": "HTML이 없는 프리셋을 적용하면 실제로는 사용자의 원래 RisuAI 테마 위에 CSS만 올라갑니다. 미리보기에서는 이를 대신해 RisuAI 기본 화면과 비슷한 근사 틀 위에 보여 줍니다."
    },
    "pv.role": {
        "short": "미리보기에 띄울 메시지 종류를 고릅니다.",
        "long": "미리보기에 표시할 메시지를 모두, 캐릭터, 사용자, 편집 중 가운데에서 고릅니다. 편집 중은 메시지를 고치는 상태의 모습입니다."
    },
    "pv.sample": {
        "short": "미리보기용 샘플 설정을 펼치고 접습니다.",
        "long": "누르면 펼쳐지며 미리보기에 쓰는 이름, 글자 크기, 샘플 메시지, 정규식 반영 여부를 바꿉니다. 이 값들은 미리보기에만 쓰이고 프리셋에 저장되지 않습니다."
    },
    "pv.names": {
        "short": "미리보기 캐릭터·사용자 이름을 적습니다.",
        "long": "미리보기의 {{char}}, {{user}} 자리에 들어갈 이름을 적습니다. 비워 두면 기본 이름을 씁니다."
    },
    "pv.fontsize": {
        "short": "미리보기 기본 글자 크기를 정합니다.",
        "long": "미리보기 화면의 기본 글자 크기를 px 단위로 정합니다. 10에서 28 사이의 값을 넣을 수 있습니다."
    },
    "pv.sample-text": {
        "short": "미리보기 본문에 띄울 글을 적습니다.",
        "long": "미리보기 메시지 본문에 띄울 글을 적습니다. 비워 두면 강조, 대사, 목록, 코드가 섞인 기본 샘플 글을 보여 줍니다."
    },
    "pv.apply-regex": {
        "short": "미리보기에 디스플레이 정규식을 반영합니다.",
        "long": "체크하면 지금 적용될 프리셋 조합(중복 적용 켜짐 시 겹친 프리셋 포함)의 켜진 디스플레이 정규식 규칙을 미리보기 메시지에 반영합니다."
    },
    "pv.frame": {
        "short": "편집 중인 테마가 보일 모습을 보여 줍니다.",
        "long": "편집 중인 HTML·CSS를 RisuAI 채팅과 비슷한 환경으로 보여 주며, 저장 전 내용도 바로 반영됩니다. 실제 화면과 조금 다를 수 있으니 마지막 확인은 적용한 뒤 채팅에서 하는 편이 좋습니다."
    }
};

// === ui.js ===
const UI_STYLE_ID = 'rtpv3-styles';
const UI_ROOT_ID = 'rtpv3-app';

const UI_CSS = `
#${UI_ROOT_ID} {
    --rtpv3-bg: #0c0e14;
    --rtpv3-bg-sunken: #080a0f;
    --rtpv3-surface: #131620;
    --rtpv3-surface-2: #1a1e2b;
    --rtpv3-hover: #222738;
    --rtpv3-border: rgba(255, 255, 255, 0.095);
    --rtpv3-border-soft: rgba(255, 255, 255, 0.055);
    --rtpv3-text: #eef1f7;
    --rtpv3-text-2: #c8d0de;
    --rtpv3-muted: #8892a4;
    --rtpv3-accent: #6c8cff;
    --rtpv3-accent-bg: #4f6ef7;
    --rtpv3-accent-soft: rgba(108, 140, 255, 0.14);
    --rtpv3-ok: #22a055;
    --rtpv3-ok-bg: #1d8a49;
    --rtpv3-ok-text: #74e8a1;
    --rtpv3-warn: #d89e2a;
    --rtpv3-warn-text: #f5d167;
    --rtpv3-danger: #ef5b5b;
    --rtpv3-danger-bg: #3b1d24;
    --rtpv3-danger-text: #ffb3b3;
    --rtpv3-radius: 10px;
    --rtpv3-radius-sm: 7px;
    --rtpv3-mono: "Cascadia Code", "JetBrains Mono", "D2Coding", Consolas, monospace;
    position: fixed;
    inset: 0;
    z-index: 9999;
    display: flex;
    flex-direction: column;
    max-width: 100%;
    overflow: hidden;
    background: var(--rtpv3-bg);
    color: var(--rtpv3-text);
    font-family: "Pretendard Variable", "Pretendard", "Noto Sans KR", -apple-system, BlinkMacSystemFont, "Segoe UI", "Malgun Gothic", "Apple SD Gothic Neo", sans-serif;
    font-size: 13px;
    line-height: 1.45;
    box-sizing: border-box;
    -webkit-font-smoothing: antialiased;
}
#${UI_ROOT_ID} *, #${UI_ROOT_ID} *::before, #${UI_ROOT_ID} *::after {
    box-sizing: border-box;
}
#${UI_ROOT_ID} ::-webkit-scrollbar { width: 9px; height: 9px; }
#${UI_ROOT_ID} ::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.13); border-radius: 999px; border: 2px solid transparent; background-clip: padding-box; }
#${UI_ROOT_ID} ::-webkit-scrollbar-thumb:hover { background: rgba(255, 255, 255, 0.22); border: 2px solid transparent; background-clip: padding-box; }
#${UI_ROOT_ID} ::-webkit-scrollbar-track { background: transparent; }
#${UI_ROOT_ID} button, #${UI_ROOT_ID} input, #${UI_ROOT_ID} select, #${UI_ROOT_ID} textarea {
    font-family: inherit;
    font-size: 12px;
    color: var(--rtpv3-text);
    background: var(--rtpv3-surface);
    border: 1px solid var(--rtpv3-border);
    border-radius: var(--rtpv3-radius-sm);
}
#${UI_ROOT_ID} button {
    cursor: pointer;
    padding: 6px 11px;
    min-height: 30px;
    white-space: nowrap;
    transition: background 0.15s, border-color 0.15s, color 0.15s, opacity 0.15s;
}
#${UI_ROOT_ID} button:hover:not(:disabled) {
    background: var(--rtpv3-hover);
    border-color: #4a5260;
}
#${UI_ROOT_ID} button:disabled {
    cursor: default;
    opacity: 0.45;
}
#${UI_ROOT_ID} :focus { outline: none; }
#${UI_ROOT_ID} :focus-visible {
    outline: 2px solid var(--rtpv3-accent);
    outline-offset: 1px;
}
#${UI_ROOT_ID} input:focus, #${UI_ROOT_ID} select:focus, #${UI_ROOT_ID} textarea:focus {
    border-color: var(--rtpv3-accent);
    box-shadow: 0 0 0 3px var(--rtpv3-accent-soft);
}
#${UI_ROOT_ID} button.primary {
    background: var(--rtpv3-ok-bg);
    border-color: var(--rtpv3-ok);
    color: #ffffff;
    font-weight: 600;
}
#${UI_ROOT_ID} button.primary:hover:not(:disabled) { background: var(--rtpv3-ok); border-color: var(--rtpv3-ok); }
#${UI_ROOT_ID} button.accent {
    background: var(--rtpv3-accent-bg);
    border-color: var(--rtpv3-accent);
    color: #ffffff;
    font-weight: 600;
}
#${UI_ROOT_ID} button.accent:hover:not(:disabled) { background: var(--rtpv3-accent); border-color: var(--rtpv3-accent); }
#${UI_ROOT_ID} button.danger {
    background: var(--rtpv3-danger-bg);
    border-color: var(--rtpv3-danger);
    color: var(--rtpv3-danger-text);
}
#${UI_ROOT_ID} button.danger:hover:not(:disabled) { background: #da3633; border-color: #da3633; color: #ffffff; }
#${UI_ROOT_ID} button.ghost {
    background: transparent;
    border-color: transparent;
    color: var(--rtpv3-text-2);
}
#${UI_ROOT_ID} button.ghost:hover:not(:disabled) { background: var(--rtpv3-hover); border-color: var(--rtpv3-border); }
#${UI_ROOT_ID} button.danger-text { color: var(--rtpv3-danger-text); }
#${UI_ROOT_ID} button.small {
    padding: 3px 8px;
    min-height: 24px;
    font-size: 11px;
}
#${UI_ROOT_ID} input[type="text"], #${UI_ROOT_ID} input[type="number"], #${UI_ROOT_ID} select, #${UI_ROOT_ID} textarea {
    padding: 6px 8px;
    width: 100%;
}
#${UI_ROOT_ID} input[type="checkbox"] {
    width: 15px;
    height: 15px;
    margin: 0;
    accent-color: var(--rtpv3-accent);
    flex-shrink: 0;
}
#${UI_ROOT_ID} textarea { resize: vertical; }
#${UI_ROOT_ID} textarea.code-editor {
    font-family: var(--rtpv3-mono);
    font-size: 12px;
    line-height: 1.55;
    tab-size: 2;
    white-space: pre;
    background: var(--rtpv3-bg-sunken);
}
#${UI_ROOT_ID} textarea::placeholder, #${UI_ROOT_ID} input::placeholder {
    color: #5c6570;
}

/* 헤더 */
.rtpv3-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 9px 14px;
    background: var(--rtpv3-surface);
    border-bottom: 1px solid var(--rtpv3-border);
    flex-shrink: 0;
}
.rtpv3-title-wrap {
    display: flex;
    align-items: center;
    gap: 10px;
    min-width: 0;
}
.rtpv3-title {
    font-size: 15px;
    font-weight: 700;
    margin: 0;
    white-space: nowrap;
}
.rtpv3-badge {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 2px 8px;
    border-radius: 999px;
    font-size: 11px;
    font-weight: 600;
    background: var(--rtpv3-hover);
    border: 1px solid var(--rtpv3-border);
    color: var(--rtpv3-text-2);
    white-space: nowrap;
    max-width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
}
.rtpv3-badge.active { background: rgba(46, 160, 67, 0.16); border-color: var(--rtpv3-ok); color: var(--rtpv3-ok-text); }
.rtpv3-badge.warn { background: rgba(210, 153, 34, 0.16); border-color: var(--rtpv3-warn); color: var(--rtpv3-warn-text); }
.rtpv3-badge.err { background: rgba(248, 81, 73, 0.16); border-color: var(--rtpv3-danger); color: #ff9c94; }

.rtpv3-applied-wrap {
    position: relative;
    display: flex;
    align-items: center;
    min-width: 0;
    max-width: 100%;
}
#${UI_ROOT_ID} button.rtpv3-header-badge {
    cursor: pointer;
    min-height: 24px;
    padding: 2px 10px;
}
#${UI_ROOT_ID} button.rtpv3-header-badge:hover {
    background: rgba(46, 160, 67, 0.25);
    border-color: var(--rtpv3-ok);
}
.rtpv3-applied-popover {
    display: none;
    position: absolute;
    left: 0;
    top: calc(100% + 6px);
    z-index: 65;
    width: min(360px, calc(100vw - 28px));
    padding: 8px;
    background: var(--rtpv3-surface-2);
    border: 1px solid var(--rtpv3-border);
    border-radius: var(--rtpv3-radius);
    box-shadow: 0 12px 32px rgba(0, 0, 0, 0.55);
    flex-direction: column;
    gap: 6px;
}
.rtpv3-applied-popover.open { display: flex; }
.rtpv3-applied-pop-head {
    font-size: 11px;
    font-weight: 700;
    color: var(--rtpv3-muted);
    padding: 2px 4px;
    display: flex;
    align-items: center;
    justify-content: space-between;
}
.rtpv3-applied-item {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 5px 6px;
    border-radius: var(--rtpv3-radius-sm);
    background: var(--rtpv3-surface);
    border: 1px solid var(--rtpv3-border-soft);
    min-width: 0;
}
.rtpv3-applied-order {
    font-size: 10px;
    font-weight: 700;
    color: var(--rtpv3-ok-text);
    background: rgba(46, 160, 67, 0.16);
    border: 1px solid rgba(46, 160, 67, 0.45);
    border-radius: 999px;
    padding: 1px 6px;
    flex-shrink: 0;
}
#${UI_ROOT_ID} button.rtpv3-applied-name {
    flex: 1 1 auto;
    min-width: 0;
    text-align: left;
    background: transparent;
    border-color: transparent;
    padding: 2px 4px;
    min-height: 24px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-weight: 600;
}
#${UI_ROOT_ID} button.rtpv3-applied-name:hover:not(:disabled) {
    background: var(--rtpv3-hover);
    border-color: transparent;
}
.rtpv3-applied-pop-foot {
    padding-top: 4px;
    border-top: 1px solid var(--rtpv3-border-soft);
    display: flex;
    justify-content: flex-end;
}
.rtpv3-mobile-applied {
    display: none;
    flex-direction: column;
    gap: 6px;
    margin-bottom: 4px;
    padding: 7px 9px;
    background: var(--rtpv3-surface);
    border: 1px solid rgba(46, 160, 67, 0.45);
    border-radius: var(--rtpv3-radius);
}
#${UI_ROOT_ID} button.rtpv3-mobile-applied-toggle {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    background: transparent;
    border-color: transparent;
    padding: 2px;
    min-height: 24px;
    text-align: left;
    color: var(--rtpv3-ok-text);
    font-weight: 600;
}
.rtpv3-mobile-applied-summary {
    flex: 1 1 auto;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}
@media (max-width: 760px) {
    .rtpv3-mobile-applied { display: flex; }
}

/* 모바일 화면 전환 탭 */
.rtpv3-mobile-nav {
    display: none;
    gap: 4px;
    padding: 6px 10px;
    background: var(--rtpv3-surface);
    border-bottom: 1px solid var(--rtpv3-border);
    flex-shrink: 0;
}
.rtpv3-mobile-nav button { flex: 1 1 0; }

/* 알림 */
.rtpv3-toast {
    position: absolute;
    right: 16px;
    bottom: 16px;
    z-index: 10001;
    max-width: min(420px, calc(100% - 32px));
    padding: 10px 14px;
    border-radius: var(--rtpv3-radius);
    font-size: 12px;
    line-height: 1.5;
    background: #1f2937;
    border: 1px solid var(--rtpv3-accent);
    color: #cfe6ff;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.45);
    white-space: pre-wrap;
    word-break: break-word;
    pointer-events: none;
}
.rtpv3-toast.error { background: var(--rtpv3-danger-bg); border-color: var(--rtpv3-danger); color: var(--rtpv3-danger-text); }

/* 작업 영역 */
.rtpv3-workspace {
    display: grid;
    grid-template-columns: 260px minmax(380px, 1fr) minmax(360px, 1fr);
    flex: 1 1 auto;
    min-height: 0;
    overflow: hidden;
}
.rtpv3-panel {
    display: flex;
    flex-direction: column;
    min-height: 0;
    min-width: 0;
    border-right: 1px solid var(--rtpv3-border);
    background: var(--rtpv3-bg);
}
.rtpv3-panel:last-child { border-right: none; }
.rtpv3-panel-head {
    position: relative;
    padding: 8px 12px;
    background: var(--rtpv3-surface);
    border-bottom: 1px solid var(--rtpv3-border);
    display: flex;
    flex-direction: column;
    gap: 8px;
    flex-shrink: 0;
}
.rtpv3-panel-title {
    font-weight: 600;
    font-size: 12px;
    color: var(--rtpv3-text-2);
    min-height: 30px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
}
.rtpv3-panel-body {
    flex: 1 1 auto;
    overflow-y: auto;
    overflow-x: hidden;
    padding: 12px;
    display: flex;
    flex-direction: column;
    gap: 12px;
    min-height: 0;
    min-width: 0;
}
.rtpv3-row { display: flex; gap: 6px; align-items: center; min-width: 0; }
.rtpv3-wrap { flex-wrap: wrap; }
.rtpv3-spacer { flex: 1 1 auto; }
.rtpv3-muted { color: var(--rtpv3-muted); font-size: 11px; }

/* 미리보기 크게 보기: 편집 칸을 접고 미리보기가 그 자리까지 넓어진다 (좁은 화면에서는 탭으로 오가므로 쓰지 않는다). */
.rtpv3-pv-apply-btn { display: none; }
#${UI_ROOT_ID}[data-pvwide="on"] .rtpv3-pv-apply-btn { display: inline-flex; align-items: center; }
@media (min-width: 761px) {
    #${UI_ROOT_ID}[data-pvwide="on"] .rtpv3-workspace {
        grid-template-columns: 260px minmax(0, 1fr);
        grid-template-rows: minmax(0, 1fr);
    }
    #${UI_ROOT_ID}[data-pvwide="on"] .rtpv3-panel-editor { display: none; }
    #${UI_ROOT_ID}[data-pvwide="on"] .rtpv3-panel-preview { border-top: none; }
}
@media (min-width: 761px) and (max-width: 1180px) {
    #${UI_ROOT_ID}[data-pvwide="on"] .rtpv3-workspace { grid-template-columns: 230px minmax(0, 1fr); }
}
@media (max-width: 760px) {
    .rtpv3-pvwide-btn { display: none; }
    .rtpv3-pv-apply-btn { display: inline-flex; align-items: center; }
}

@media (max-width: 1180px) {
    .rtpv3-workspace {
        grid-template-columns: 230px minmax(0, 1fr);
        grid-template-rows: minmax(0, 1.15fr) minmax(0, 1fr);
    }
    .rtpv3-panel-list { grid-row: 1 / -1; }
    .rtpv3-panel-preview { border-top: 1px solid var(--rtpv3-border); }
}
@media (max-width: 760px) {
    .rtpv3-mobile-nav { display: flex; }
    .rtpv3-workspace {
        grid-template-columns: minmax(0, 1fr);
        grid-template-rows: minmax(0, 1fr);
    }
    .rtpv3-panel { display: none; border-right: none; border-top: none; }
    .rtpv3-panel-list { grid-row: auto; }
    #${UI_ROOT_ID}[data-mview="list"] .rtpv3-panel-list,
    #${UI_ROOT_ID}[data-mview="editor"] .rtpv3-panel-editor,
    #${UI_ROOT_ID}[data-mview="preview"] .rtpv3-panel-preview { display: flex; }
    .rtpv3-header-badge { display: none; }
}

/* 검색 입력 & 지우기 */
.rtpv3-search-wrap {
    position: relative;
    display: flex;
    align-items: center;
}
#${UI_ROOT_ID} .rtpv3-search-wrap input {
    padding-right: 26px;
}
#${UI_ROOT_ID} .rtpv3-search-clear {
    position: absolute;
    right: 4px;
    width: 20px;
    min-height: 20px;
    padding: 0;
    border: 0;
    border-radius: 999px;
    background: transparent;
    color: var(--rtpv3-muted);
    font-size: 14px;
    line-height: 1;
    display: inline-flex;
    align-items: center;
    justify-content: center;
}
#${UI_ROOT_ID} .rtpv3-search-clear:hover:not(:disabled) {
    color: var(--rtpv3-text);
    background: var(--rtpv3-hover);
    border-color: transparent;
}

/* 프리셋 목록 */
.rtpv3-preset-list { display: flex; flex-direction: column; gap: 6px; min-width: 0; max-width: 100%; }
.rtpv3-preset-card {
    padding: 9px 10px;
    border: 1px solid var(--rtpv3-border-soft);
    border-radius: var(--rtpv3-radius);
    background: var(--rtpv3-surface);
    cursor: pointer;
    display: flex;
    flex-direction: column;
    gap: 4px;
    text-align: left;
    width: 100%;
    max-width: 100%;
    min-width: 0;
    overflow: hidden;
    transition: border-color 0.15s, background 0.15s, box-shadow 0.15s;
}
.rtpv3-preset-card:hover { border-color: rgba(255, 255, 255, 0.2); background: var(--rtpv3-surface-2); }
.rtpv3-preset-card.selected {
    border-color: var(--rtpv3-accent);
    background: rgba(108, 140, 255, 0.11);
    box-shadow: inset 0 0 0 1px rgba(108, 140, 255, 0.22);
}
.rtpv3-preset-card.unsaved { border-style: dashed; }
.rtpv3-preset-card-title {
    display: flex;
    align-items: center;
    gap: 6px;
    font-weight: 600;
    min-width: 0;
    max-width: 100%;
}
.rtpv3-swatch {
    position: relative;
    width: 16px;
    height: 16px;
    border-radius: 5px;
    flex: 0 0 auto;
    border: 1px solid rgba(255, 255, 255, 0.24);
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.4);
    overflow: hidden;
}
.rtpv3-swatch.is-glass {
    border-color: rgba(255, 255, 255, 0.48);
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.42), 0 1px 4px rgba(0, 0, 0, 0.45);
}
.rtpv3-swatch-dot {
    position: absolute;
    right: 2px;
    bottom: 2px;
    width: 6px;
    height: 6px;
    border-radius: 999px;
    border: 1px solid rgba(0, 0, 0, 0.28);
}
.rtpv3-preset-name { flex: 1 1 auto; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.rtpv3-kind-row { display: flex; flex-wrap: wrap; gap: 4px; }
.rtpv3-kind-pill {
    font-size: 10px;
    line-height: 1.3;
    padding: 1px 6px;
    border-radius: 999px;
    border: 1px solid var(--rtpv3-border-soft);
    background: var(--rtpv3-bg-sunken);
    color: var(--rtpv3-muted);
    font-weight: 600;
}
.rtpv3-dirty-dot { width: 7px; height: 7px; border-radius: 50%; background: var(--rtpv3-warn); flex-shrink: 0; }
.rtpv3-preset-desc {
    font-size: 11px;
    color: var(--rtpv3-muted);
    max-width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}
.rtpv3-empty {
    color: var(--rtpv3-muted);
    font-size: 12px;
    padding: 16px 4px;
    text-align: center;
}

/* 그룹과 끌기 */
.rtpv3-group {
    display: flex;
    flex-direction: column;
    gap: 6px;
    min-width: 0;
    max-width: 100%;
    border: 1px solid var(--rtpv3-border-soft);
    border-radius: var(--rtpv3-radius);
    background: rgba(255, 255, 255, 0.015);
    padding: 4px;
}
.rtpv3-group-head {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 5px 6px;
    border-radius: var(--rtpv3-radius-sm);
    cursor: pointer;
    font-size: 12px;
    font-weight: 600;
    color: var(--rtpv3-text-2);
    user-select: none;
    -webkit-user-select: none;
}
.rtpv3-group-head:hover { background: var(--rtpv3-hover); }
.rtpv3-group-head.has-selected .rtpv3-group-name { color: var(--rtpv3-accent); }
.rtpv3-group-chevron { width: 12px; color: var(--rtpv3-muted); flex-shrink: 0; }
.rtpv3-group-name { flex: 1 1 auto; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
#${UI_ROOT_ID} input.rtpv3-group-name-input { flex: 1 1 auto; min-width: 0; padding: 3px 6px; font-size: 12px; }
.rtpv3-group-count {
    font-size: 10px;
    color: var(--rtpv3-muted);
    background: var(--rtpv3-bg-sunken);
    border: 1px solid var(--rtpv3-border-soft);
    border-radius: 999px;
    padding: 0 6px;
    flex-shrink: 0;
}
#${UI_ROOT_ID} .rtpv3-group-rename { min-height: 22px; padding: 0 6px; opacity: 0.6; }
#${UI_ROOT_ID} .rtpv3-group-rename:hover { opacity: 1; }
.rtpv3-group-body { display: flex; flex-direction: column; gap: 6px; padding-left: 6px; min-width: 0; max-width: 100%; }
.rtpv3-list-end { min-height: 36px; border-radius: var(--rtpv3-radius); }
.rtpv3-preset-card, .rtpv3-group-head {
    -webkit-touch-callout: none;
    touch-action: pan-y;
}
#${UI_ROOT_ID}.rtpv3-is-dragging, #${UI_ROOT_ID}.rtpv3-is-dragging * {
    cursor: grabbing !important;
    user-select: none !important;
    -webkit-user-select: none !important;
}
.rtpv3-preset-card.rtpv3-dragging { opacity: 0.35; }
.rtpv3-drag-ghost {
    position: fixed;
    z-index: 70;
    pointer-events: none;
    opacity: 0.92;
    transform: rotate(-1.5deg);
    box-shadow: 0 12px 28px rgba(0, 0, 0, 0.55);
    border-color: var(--rtpv3-accent) !important;
}
.rtpv3-drop-into {
    outline: 2px solid var(--rtpv3-accent) !important;
    outline-offset: 1px;
    background: #152132 !important;
}
.rtpv3-drop-before { box-shadow: 0 -3px 0 0 var(--rtpv3-accent); }
.rtpv3-drop-after { box-shadow: 0 3px 0 0 var(--rtpv3-accent); }

/* 목록 구역 */
.rtpv3-list-section {
    display: flex;
    align-items: center;
    gap: 8px;
    margin: 6px 2px 2px;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: .04em;
    color: var(--rtpv3-muted);
}
.rtpv3-list-section::after { content: ""; flex: 1 1 auto; height: 1px; background: var(--rtpv3-border-soft); }
.rtpv3-list-section:first-child { margin-top: 0; }
.rtpv3-user-section { display: flex; flex-direction: column; gap: 6px; min-width: 0; max-width: 100%; }
.rtpv3-builtin-note {
    font-size: 12px;
    color: var(--rtpv3-text-2);
    background: var(--rtpv3-accent-soft);
    border: 1px solid rgba(56, 139, 253, 0.35);
    border-radius: var(--rtpv3-radius-sm);
    padding: 7px 10px;
}

/* 그룹 고르기 */
.rtpv3-pick-list { display: flex; flex-direction: column; gap: 4px; max-height: 40vh; overflow-y: auto; }
#${UI_ROOT_ID} .rtpv3-pick-list button { text-align: left; white-space: normal; }

/* 도구 막대와 메뉴 */
.rtpv3-toolbar { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
.rtpv3-toolbar-end { display: flex; align-items: center; gap: 4px; margin-left: auto; }
@media (max-width: 760px) {
    #${UI_ROOT_ID} .rtpv3-toolbar button { padding-left: 8px; padding-right: 8px; }
    .rtpv3-toolbar .rtpv3-spacer { display: none; }
}
.rtpv3-save-btn.dirty { border-color: var(--rtpv3-warn); color: var(--rtpv3-warn-text); }
.rtpv3-menu-wrap { position: relative; }
.rtpv3-menu {
    display: none;
    position: absolute;
    right: 0;
    top: calc(100% + 4px);
    z-index: 50;
    min-width: 220px;
    padding: 6px;
    background: var(--rtpv3-surface-2);
    border: 1px solid var(--rtpv3-border);
    border-radius: var(--rtpv3-radius);
    box-shadow: 0 12px 32px rgba(0, 0, 0, 0.5);
    flex-direction: column;
}
.rtpv3-menu.open { display: flex; }
.rtpv3-menu-group {
    padding: 6px 8px 3px;
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.04em;
    color: var(--rtpv3-muted);
}
.rtpv3-menu-group:not(:first-child) { margin-top: 4px; border-top: 1px solid var(--rtpv3-border-soft); padding-top: 8px; }
#${UI_ROOT_ID} .rtpv3-menu-item {
    display: block;
    width: 100%;
    text-align: left;
    background: transparent;
    border-color: transparent;
    padding: 7px 8px;
    min-height: 0;
}
#${UI_ROOT_ID} .rtpv3-menu-item:hover:not(:disabled) { background: var(--rtpv3-hover); border-color: transparent; }
#${UI_ROOT_ID} .rtpv3-menu-item.danger-text { color: var(--rtpv3-danger-text); }
#${UI_ROOT_ID} .rtpv3-menu-check { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
.rtpv3-menu-state {
    font-size: 10px;
    font-weight: 700;
    padding: 1px 6px;
    border-radius: 999px;
    border: 1px solid var(--rtpv3-border);
    color: var(--rtpv3-muted);
    flex-shrink: 0;
}
.rtpv3-menu-state.on {
    background: rgba(108, 140, 255, 0.18);
    border-color: var(--rtpv3-accent);
    color: #cfe0ff;
}
.rtpv3-menu-sub {
    font-size: 10px;
    color: var(--rtpv3-muted);
    font-weight: 400;
    padding: 0 8px 4px;
    line-height: 1.45;
    white-space: normal;
}

/* 탭과 세그먼트 */
.rtpv3-tabs, .rtpv3-segment {
    display: inline-flex;
    gap: 2px;
    padding: 2px;
    background: var(--rtpv3-bg-sunken);
    border: 1px solid var(--rtpv3-border);
    border-radius: var(--rtpv3-radius);
    align-self: flex-start;
    flex-wrap: wrap;
}
#${UI_ROOT_ID} .rtpv3-tabs button, #${UI_ROOT_ID} .rtpv3-segment button {
    background: transparent;
    border-color: transparent;
    color: var(--rtpv3-muted);
    min-height: 26px;
    padding: 4px 10px;
}
#${UI_ROOT_ID} .rtpv3-tabs button:hover:not(:disabled), #${UI_ROOT_ID} .rtpv3-segment button:hover:not(:disabled) {
    color: var(--rtpv3-text);
    background: var(--rtpv3-hover);
    border-color: transparent;
}
#${UI_ROOT_ID} .rtpv3-tabs button.active, #${UI_ROOT_ID} .rtpv3-segment button.active {
    background: var(--rtpv3-surface-2);
    border-color: var(--rtpv3-border);
    color: var(--rtpv3-text);
    font-weight: 600;
}

/* 편집 */
.rtpv3-field { display: flex; flex-direction: column; gap: 4px; min-width: 0; }
.rtpv3-field-label {
    font-size: 11px;
    font-weight: 600;
    color: var(--rtpv3-muted);
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 6px;
}
.rtpv3-field-hint { font-weight: 400; color: #6e7781; }
@media (max-width: 760px) { .rtpv3-field-hint { display: none; } }
.rtpv3-meta-grid {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(0, 1.4fr);
    gap: 10px;
}
@media (max-width: 900px) { .rtpv3-meta-grid { grid-template-columns: minmax(0, 1fr); } }
.rtpv3-memo { min-height: 34px; line-height: 1.45; }
.rtpv3-editor-body .rtpv3-code-field {
    flex: 1 1 0;
    min-height: 190px;
}
.rtpv3-editor-body .rtpv3-code-field textarea {
    flex: 1 1 auto;
    min-height: 160px;
    resize: none;
}
.rtpv3-validation-box {
    display: flex;
    flex-direction: column;
    gap: 6px;
    font-size: 12px;
}
.rtpv3-validation-list {
    margin: 0;
    padding: 8px 10px 8px 26px;
    border: 1px solid var(--rtpv3-border);
    border-radius: var(--rtpv3-radius-sm);
    background: var(--rtpv3-surface);
    display: flex;
    flex-direction: column;
    gap: 3px;
}
.rtpv3-validation-err { color: #ff9c94; }
.rtpv3-validation-warn { color: var(--rtpv3-warn-text); }

/* 상자 */
.rtpv3-section-box {
    border: 1px solid var(--rtpv3-border);
    border-radius: var(--rtpv3-radius);
    padding: 12px;
    background: var(--rtpv3-surface);
    display: flex;
    flex-direction: column;
    gap: 8px;
}
.rtpv3-section-title { font-weight: 600; font-size: 12px; color: var(--rtpv3-text-2); }
.rtpv3-section-desc { font-size: 11px; color: var(--rtpv3-muted); margin-top: -4px; }
.rtpv3-rule-card {
    border: 1px solid var(--rtpv3-border-soft);
    border-radius: var(--rtpv3-radius-sm);
    padding: 8px;
    background: var(--rtpv3-bg);
    display: flex;
    flex-direction: column;
    gap: 6px;
}
.rtpv3-rule-card.disabled { opacity: 0.6; }
.rtpv3-check-row {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 12px;
    cursor: pointer;
}

/* 미리보기 */
.rtpv3-preview-controls { display: flex; flex-wrap: wrap; gap: 6px; align-items: center; }
.rtpv3-details {
    border: 1px solid var(--rtpv3-border);
    border-radius: var(--rtpv3-radius);
    background: var(--rtpv3-surface);
}
.rtpv3-details > summary {
    cursor: pointer;
    padding: 7px 10px;
    font-size: 12px;
    font-weight: 600;
    color: var(--rtpv3-text-2);
    list-style: none;
    display: flex;
    align-items: center;
    gap: 6px;
    user-select: none;
}
.rtpv3-details > summary::-webkit-details-marker { display: none; }
.rtpv3-details > summary::before { content: "▸"; color: var(--rtpv3-muted); transition: transform 0.15s; }
.rtpv3-details[open] > summary::before { transform: rotate(90deg); }
.rtpv3-details-body {
    padding: 4px 10px 10px;
    display: flex;
    flex-direction: column;
    gap: 8px;
}
.rtpv3-sample-grid {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr) 84px;
    gap: 8px;
}
.rtpv3-preview-stage {
    flex: 1 1 auto;
    min-height: 320px;
    display: flex;
    justify-content: center;
    align-items: stretch;
    background: var(--rtpv3-bg-sunken);
    border: 1px solid var(--rtpv3-border);
    border-radius: var(--rtpv3-radius);
    padding: 8px;
    position: relative;
    overflow: hidden;
}
/* 미리보기는 정한 화면 폭으로 그린 뒤 칸에 맞게 줄여서 보여 준다 (layoutPreviewFrame). */
.rtpv3-preview-iframe {
    position: absolute;
    top: 8px;
    left: 8px;
    transform-origin: 0 0;
    border: 1px solid var(--rtpv3-border);
    border-radius: var(--rtpv3-radius-sm);
    background: #16181c;
}

/* 도움말 모드 */
#${UI_ROOT_ID} button.rtpv3-help-btn {
    width: 30px;
    padding: 0;
    font-weight: 700;
    border-radius: 50%;
}
#${UI_ROOT_ID} button.rtpv3-help-btn.on {
    background: var(--rtpv3-accent-bg);
    border-color: var(--rtpv3-accent);
    color: #ffffff;
}
.rtpv3-help-banner {
    display: none;
    align-items: center;
    gap: 8px;
    padding: 7px 14px;
    background: #10233d;
    border-bottom: 1px solid var(--rtpv3-accent);
    color: #cfe6ff;
    font-size: 12px;
    flex-shrink: 0;
}
#${UI_ROOT_ID}[data-help-mode="on"] .rtpv3-help-banner { display: flex; }
#${UI_ROOT_ID}[data-help-mode="on"] [data-help] {
    outline: 1px dashed rgba(56, 139, 253, 0.6);
    outline-offset: 1px;
    cursor: help;
}
#${UI_ROOT_ID}[data-help-mode="on"] [data-help]:hover {
    outline: 2px solid var(--rtpv3-accent);
}
.rtpv3-help-pop {
    position: absolute;
    z-index: 60;
    width: min(320px, calc(100% - 16px));
    padding: 10px 12px;
    background: #10233d;
    border: 1px solid var(--rtpv3-accent);
    border-radius: var(--rtpv3-radius);
    color: #e6f1ff;
    font-size: 12px;
    line-height: 1.6;
    box-shadow: 0 12px 32px rgba(0, 0, 0, 0.55);
    word-break: keep-all;
    overflow-wrap: anywhere;
}
.rtpv3-help-pop-title {
    font-weight: 700;
    margin-bottom: 4px;
    color: #a5d6ff;
}

/* 대화상자 */
.rtpv3-modal-backdrop {
    position: fixed;
    inset: 0;
    z-index: 10000;
    background: rgba(0, 0, 0, 0.66);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 16px;
}
.rtpv3-modal {
    width: min(620px, 100%);
    max-height: 86vh;
    overflow-y: auto;
    background: var(--rtpv3-surface);
    border: 1px solid var(--rtpv3-border);
    border-radius: 12px;
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 12px;
    box-shadow: 0 20px 48px rgba(0, 0, 0, 0.55);
}
.rtpv3-modal-title { font-size: 14px; font-weight: 700; margin: 0; }
.rtpv3-modal-desc { font-size: 12px; color: var(--rtpv3-muted); white-space: pre-wrap; word-break: break-word; }
.rtpv3-modal-desc.error { color: var(--rtpv3-danger-text); }
.rtpv3-modal-actions { display: flex; justify-content: flex-end; gap: 6px; flex-wrap: wrap; }
`;

async function copyTextToClipboard(text) {
    try {
        if (navigator?.clipboard && typeof navigator.clipboard.writeText === 'function') {
            await navigator.clipboard.writeText(text);
            return true;
        }
    } catch {
        // 아래 방식으로 다시 시도한다.
    }
    try {
        const area = document.createElement('textarea');
        area.value = text;
        area.setAttribute('readonly', '');
        area.style.position = 'fixed';
        area.style.left = '-9999px';
        document.body.appendChild(area);
        area.select();
        const ok = document.execCommand('copy');
        area.remove();
        return ok;
    } catch {
        return false;
    }
}

function injectPluginStyles() {
    if (typeof document === 'undefined' || !document.head) {
        return;
    }
    if (document.getElementById(UI_STYLE_ID)) {
        return;
    }
    const styleEl = document.createElement('style');
    styleEl.id = UI_STYLE_ID;
    styleEl.textContent = UI_CSS;
    document.head.appendChild(styleEl);
}

function clonePresetDraft(preset) {
    const normalized = normalizePresetItem(preset);
    return {
        ...normalized,
        regexRules: normalized.regexRules.map((rule) => ({ ...rule })),
    };
}

function errorText(err) {
    return err instanceof Error ? err.message : String(err);
}

function el(tag, props = {}, children = []) {
    const node = document.createElement(tag);
    for (const [key, value] of Object.entries(props)) {
        if (value === undefined || value === null) {
            continue;
        }
        if (key === 'className') {
            node.className = value;
        } else if (key === 'text') {
            node.textContent = value;
        } else if (key === 'style' && typeof value === 'object') {
            Object.assign(node.style, value);
        } else if (key === 'dataset' && typeof value === 'object') {
            Object.assign(node.dataset, value);
        } else if (key === 'help') {
            // 도움말 모드 설명과, 마우스를 올리면 뜨는 한 줄
            node.dataset.help = value;
            if (HELP_COPY[value]?.short) {
                node.title = HELP_COPY[value].short;
            }
        } else if (key === 'helpArea') {
            // 도움말 모드 설명만 붙인다 (마우스 툴팁이 거슬리는 넓은 영역)
            node.dataset.help = value;
        } else if (key.startsWith('on') && typeof value === 'function') {
            node.addEventListener(key.slice(2).toLowerCase(), value);
        } else if (key in node && typeof value !== 'string') {
            node[key] = value;
        } else if (key in node && (key === 'value' || key === 'type' || key === 'placeholder' || key === 'title')) {
            node[key] = value;
        } else {
            node.setAttribute(key, value);
        }
    }
    for (const child of [].concat(children)) {
        if (child === null || child === undefined || child === false) {
            continue;
        }
        node.appendChild(typeof child === 'string' ? document.createTextNode(child) : child);
    }
    return node;
}

/** 코드 편집창에서 Tab은 공백 2칸 들여쓰기, Shift+Tab은 내어쓰기로 동작하게 한다. */
function attachCodeEditorKeys(textarea) {
    const INDENT = '  ';
    textarea.addEventListener('keydown', (e) => {
        if (e.key !== 'Tab' || e.ctrlKey || e.metaKey || e.altKey) {
            return;
        }
        e.preventDefault();
        const value = textarea.value;
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const lineStart = value.lastIndexOf('\n', start - 1) + 1;
        const multiLine = value.slice(start, end).includes('\n');

        if (!e.shiftKey && !multiLine) {
            textarea.setRangeText(INDENT, start, end, 'end');
        } else {
            const block = value.slice(lineStart, end);
            const lines = block.split('\n');
            let firstDelta = 0;
            const changed = lines.map((line, idx) => {
                if (!e.shiftKey) {
                    if (idx === 0) {
                        firstDelta = INDENT.length;
                    }
                    return INDENT + line;
                }
                const removable = line.startsWith(INDENT) ? INDENT.length : line.startsWith(' ') || line.startsWith('\t') ? 1 : 0;
                if (idx === 0) {
                    firstDelta = -removable;
                }
                return line.slice(removable);
            });
            const replaced = changed.join('\n');
            textarea.setRangeText(replaced, lineStart, end, 'preserve');
            const newStart = Math.max(lineStart, start + firstDelta);
            const newEnd = lineStart + replaced.length;
            textarea.setSelectionRange(multiLine ? newStart : Math.max(lineStart, start + firstDelta), multiLine ? newEnd : Math.max(lineStart, end + firstDelta));
        }
        textarea.dispatchEvent(new Event('input', { bubbles: true }));
    });
}

/** 프리셋 CSS에서 대표 배경색·강조색·글래스 여부를 추출해 카드 스와치에 쓴다. */
function extractPresetSwatch(preset) {
    const css = String(preset?.customCSS ?? '');
    const vars = {};
    const varRe = /(--[a-z0-9-]+)\s*:\s*([^;]+);/gi;
    let m;
    while ((m = varRe.exec(css)) !== null) {
        vars[m[1].toLowerCase()] = m[2].trim();
    }

    const pickColor = (raw) => {
        if (!raw) return '';
        const colorMatch = /(#[0-9a-f]{3,8}|rgba?\([^)]+\))/i.exec(raw);
        if (colorMatch) return colorMatch[1];
        const rgbTriplet = /^\s*(\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3})\s*$/.exec(raw);
        return rgbTriplet ? `rgb(${rgbTriplet[1]})` : '';
    };

    const findBySuffix = (suffixes, exclude = []) => {
        for (const sfx of suffixes) {
            for (const [k, v] of Object.entries(vars)) {
                if (k.endsWith(sfx) && !exclude.some((ex) => k.endsWith(ex))) {
                    const c = pickColor(v);
                    if (c && c !== 'transparent') return c;
                }
            }
        }
        return '';
    };

    const surface = findBySuffix(['-paper', '-panel', '-bezel', '-bubble-bg', '-bg'], ['-edit-bg', '-code-bg', '-chip-bg']) || '#242a3a';
    const accent = findBySuffix(['-accent', '-seal', '-tint', '-quote', '-dialog']) || '#6c8cff';

    const blurVars = Object.entries(vars).filter(([k]) => k.endsWith('-blur'));
    const lastBlur = blurVars.length ? blurVars[blurVars.length - 1][1] : '';
    const isGlass = /blur\(/i.test(lastBlur) || (/backdrop-filter\s*:\s*(?:var\(|blur\()/i.test(css) && lastBlur !== 'none');

    return { surface, accent, isGlass };
}

function createPluginUI({
    getState,
    setState,
    bridge = {},
    initialPalette = 'dark',
    api = globalThis.risuai,
    onDisplayRegexArgChanged = null,
}) {
    if (typeof document === 'undefined' || !document.body) {
        return {
            mount() {},
            unmount() {},
            refresh() {},
        };
    }

    const bridgeOps = {
        activatePreset: bridge.activatePreset || activatePreset,
        deactivatePreset: bridge.deactivatePreset || deactivatePreset,
        setStackPresets: bridge.setStackPresets || setStackPresets,
        syncAppliedStateToRisu: bridge.syncAppliedStateToRisu || syncAppliedStateToRisu,
        restoreVanilla: bridge.restoreVanilla || restoreVanilla,
        captureCurrentVanillaAsPreset: bridge.captureCurrentVanillaAsPreset || captureCurrentVanillaAsPreset,
        getVanillaState: bridge.getVanillaState || getVanillaState,
    };

    const uiState = {
        selectedPresetId: null,
        draftPreset: null,
        hasUnsavedDraft: false,
        // 아직 한 번도 저장하지 않은 새 프리셋을 편집 중인지
        draftIsNew: false,
        searchQuery: '',
        activeTab: 'editor',
        mobileView: typeof window !== 'undefined' && window.innerWidth <= 760 ? 'list' : 'editor',
        menuOpen: false,
        appliedPopoverOpen: false,
        mobileAppliedOpen: false,
        helpMode: false,
        previewWidth: '100%',
        previewWide: false,
        previewPalette: initialPalette === 'light' ? 'light' : 'dark',
        previewBackdrop: 'sky',
        previewRoleFilter: 'all',
        previewApplyRegex: true,
        previewCharName: '세라',
        previewUserName: '사용자',
        previewFontSize: 15,
        previewCustomText: '',
        previewSettingsOpen: false,
        regexOutInput: '',
        renameOldPrefix: 'rtbase-',
        renameNewPrefix: 'mytheme-',
        customPattern: '',
        customFlags: 'g',
        customReplacement: '',
        customTarget: 'guiHTML',
        hostDisplayRegexEnabled: true,
        toastMessage: '',
        toastIsError: false,
        modal: null,
    };

    let rootEl = null;
    let previewTimer = null;
    let toastTimer = null;
    let lastPreviewSrcdoc = null;
    let previewResizeObserver = null;
    let fileInputEl = null;
    // 탭을 오가도 편집창과 패널의 스크롤 위치를 기억한다.
    const scrollMemory = {};
    let lastRenderedPresetId = null;

    function blankPreset(name = '새 프리셋') {
        return normalizePresetItem({
            id: createPresetId(),
            name,
            description: '',
            guiHTML: '',
            customCSS: '',
            regexRules: [],
        });
    }

    function syncSelectedPreset() {
        if (uiState.draftIsNew && uiState.draftPreset) {
            return;
        }
        const state = normalizePluginState(getState());
        const all = getAllPresets(state);
        if (!all.length) {
            uiState.selectedPresetId = null;
            uiState.draftPreset = blankPreset();
            uiState.selectedPresetId = uiState.draftPreset.id;
            uiState.draftIsNew = true;
            uiState.hasUnsavedDraft = false;
            return;
        }
        const preferredId = uiState.selectedPresetId || state.appliedPresetIds[0] || all[0].id;
        const found = all.find((p) => p.id === preferredId) || all[0];
        if (!uiState.draftPreset || uiState.selectedPresetId !== found.id) {
            uiState.selectedPresetId = found.id;
            uiState.draftPreset = clonePresetDraft(found);
            uiState.hasUnsavedDraft = false;
        }
    }

    // 손대지 않은 새 프리셋은 묻지 않고 버린다.
    function needsDiscardConfirm() {
        return uiState.hasUnsavedDraft;
    }

    /** 지금 편집 중인 것이 기본 제공 프리셋인가 */
    function isDraftBuiltin() {
        return Boolean(uiState.draftPreset) && !uiState.draftIsNew && isBuiltinId(uiState.draftPreset.id);
    }

    function selectPreset(presetId, { force = false } = {}) {
        const state = normalizePluginState(getState());
        const found = getAllPresets(state).find((p) => p.id === presetId);
        if (!found) {
            return;
        }
        if (!force && needsDiscardConfirm() && uiState.selectedPresetId !== found.id) {
            openModal({ type: 'confirm-discard', presetId: found.id, name: found.name });
            return;
        }
        uiState.selectedPresetId = found.id;
        uiState.draftPreset = clonePresetDraft(found);
        uiState.hasUnsavedDraft = false;
        uiState.draftIsNew = false;
        uiState.mobileView = isBuiltinId(found.id) ? 'preview' : 'editor';
        render();
    }

    function markDirty() {
        uiState.hasUnsavedDraft = true;
        updateDirtyDom();
    }

    function showToast(message, isError = false) {
        uiState.toastMessage = message;
        uiState.toastIsError = isError;
        if (toastTimer) {
            clearTimeout(toastTimer);
        }
        toastTimer = setTimeout(
            () => {
                uiState.toastMessage = '';
                uiState.toastIsError = false;
                updateToastDom();
            },
            isError ? 7000 : 3500,
        );
        updateToastDom();
    }

    function updateToastDom() {
        if (!rootEl) {
            return;
        }
        const toastEl = rootEl.querySelector('[data-role="toast"]');
        if (!toastEl) {
            return;
        }
        toastEl.textContent = uiState.toastMessage || '';
        toastEl.style.display = uiState.toastMessage ? 'block' : 'none';
        toastEl.classList.toggle('error', Boolean(uiState.toastIsError));
    }

    /** 저장 버튼과 목록의 변경 표시만 갱신한다 (전체를 다시 그리지 않음). */
    function updateDirtyDom() {
        if (!rootEl) {
            return;
        }
        const saveBtn = rootEl.querySelector('[data-role="save-btn"]');
        if (saveBtn) {
            const canSave = uiState.hasUnsavedDraft || uiState.draftIsNew;
            saveBtn.disabled = !canSave;
            saveBtn.classList.toggle('dirty', canSave);
            saveBtn.textContent = saveButtonLabel(canSave);
        }
        const selectedCard = rootEl.querySelector('.rtpv3-preset-card.selected');
        if (selectedCard) {
            const dot = selectedCard.querySelector('.rtpv3-dirty-dot');
            if (dot) {
                dot.style.display = uiState.hasUnsavedDraft ? 'block' : 'none';
            }
        }
    }

    function saveButtonLabel(canSave) {
        if (isDraftBuiltin()) {
            return canSave ? '복사본으로 저장 •' : '기본 제공';
        }
        return canSave ? '저장 •' : '저장됨';
    }

    function updateValidationDom() {
        if (!rootEl || !uiState.draftPreset) {
            return;
        }
        const box = rootEl.querySelector('[data-role="validation-box"]');
        if (!box) {
            return;
        }
        const draft = uiState.draftPreset;
        const validation = validateTheme(draft.guiHTML, draft.customCSS);
        box.innerHTML = '';

        const header = el('div', { className: 'rtpv3-row rtpv3-wrap' });
        if (!hasPresetContent(draft)) {
            header.appendChild(el('span', { className: 'rtpv3-badge', text: 'HTML·CSS·정규식 중 하나는 채워야 합니다.' }));
        } else if (!validation.valid) {
            header.appendChild(el('span', { className: 'rtpv3-badge err', text: `오류 ${validation.errors.length}건` }));
        } else if (!presetHasHtml(draft)) {
            const hasCss = presetHasCss(draft);
            const hasRx = presetHasRegex(draft);
            const kindText = hasCss && hasRx ? 'CSS · 정규식 프리셋' : hasCss ? 'CSS 전용 프리셋' : '정규식 전용 프리셋';
            header.appendChild(el('span', { className: 'rtpv3-badge active', text: kindText }));
        } else {
            header.appendChild(el('span', { className: 'rtpv3-badge active', text: '검증 통과' }));
        }
        if (validation.warnings.length > 0) {
            header.appendChild(el('span', { className: 'rtpv3-badge warn', text: `경고 ${validation.warnings.length}건` }));
        }
        box.appendChild(header);

        if (validation.errors.length || validation.warnings.length) {
            const list = el('ul', { className: 'rtpv3-validation-list' });
            for (const err of validation.errors) {
                list.appendChild(el('li', { className: 'rtpv3-validation-err', text: err }));
            }
            for (const warn of validation.warnings) {
                list.appendChild(el('li', { className: 'rtpv3-validation-warn', text: warn }));
            }
            box.appendChild(list);
        }
    }

    /**
     * 미리보기 iframe의 폭은 그 안에서 보이는 화면 폭이다. 미리보기 칸의 폭을 그대로 쓰면
     * PC에서도 프리셋의 휴대폰용 규칙이 걸리므로, 정한 화면 폭으로 그린 뒤 칸에 맞게 줄인다.
     * "전체"는 지금 창의 가로 폭을 쓴다. PC에서는 PC 배치가, 휴대폰에서는 휴대폰 배치가 보인다.
     */
    function layoutPreviewFrame() {
        const iframe = rootEl?.querySelector('[data-role="preview-iframe"]');
        const stage = iframe?.parentElement;
        if (!iframe || !stage) {
            return;
        }
        const pad = 8;
        const availW = stage.clientWidth - pad * 2;
        const availH = stage.clientHeight - pad * 2;
        if (availW <= 0 || availH <= 0) {
            return; // 칸이 숨겨져 있다. 보일 때 다시 계산한다.
        }
        const fixed = parseInt(uiState.previewWidth, 10);
        const hasWindow = typeof window !== 'undefined' && window.innerWidth > 0 && window.innerHeight > 0;
        const windowW = hasWindow ? window.innerWidth : availW;
        const full = uiState.previewWidth === '100%' || !(fixed > 0);
        const viewW = full ? Math.max(availW, windowW) : fixed;
        // "전체"는 창과 같은 비율로 그린다 (화면 높이로 크기를 정하는 테마가 실제와 같게 보인다).
        // 좁은 창에서는 미리보기 칸이 곧 화면이므로 세로를 칸에 맞춘다.
        const keepWindowRatio = full && hasWindow && windowW > 760;
        const viewH = keepWindowRatio ? window.innerHeight : null;
        const scale = Math.min(1, availW / viewW, viewH ? availH / viewH : 1);
        const frameH = viewH || Math.round(availH / scale);
        iframe.style.width = `${viewW}px`;
        iframe.style.height = `${frameH}px`;
        iframe.style.transform = scale < 1 ? `scale(${scale})` : 'none';
        iframe.style.left = `${pad + Math.max(0, (availW - viewW * scale) / 2)}px`;
        iframe.style.top = `${pad + Math.max(0, (availH - frameH * scale) / 2)}px`;
    }

    function setPreviewWide(on) {
        uiState.previewWide = on;
        if (!rootEl) {
            return;
        }
        rootEl.setAttribute('data-pvwide', on ? 'on' : 'off');
        const btn = rootEl.querySelector('[data-role="pvwide-toggle"]');
        if (btn) {
            btn.textContent = on ? '원래대로' : '크게 보기';
            btn.setAttribute('aria-pressed', on ? 'true' : 'false');
        }
        layoutPreviewFrame();
    }

    function observePreviewStage() {
        if (typeof ResizeObserver === 'undefined') {
            return;
        }
        if (!previewResizeObserver) {
            previewResizeObserver = new ResizeObserver(() => layoutPreviewFrame());
        }
        previewResizeObserver.disconnect();
        const stage = rootEl?.querySelector('.rtpv3-preview-stage');
        if (stage) {
            previewResizeObserver.observe(stage);
        }
    }

    function updatePreviewFrame() {
        if (!rootEl || !uiState.draftPreset) {
            return;
        }
        const iframe = rootEl.querySelector('[data-role="preview-iframe"]');
        if (!iframe) {
            return;
        }
        layoutPreviewFrame();

        const state = normalizePluginState(getState());
        const draft = uiState.draftPreset;
        let previewPreset = { guiHTML: FALLBACK_VANILLA_GUI_HTML, customCSS: '', regexRules: [] };
        let isApprox = true;

        if (hasPresetContent(draft)) {
            const presetsById = new Map([[draft.id, draft]]);
            const virtualAppliedIds = computeNextAppliedIds(state, draft, presetsById);
            const composed = composeApplied(state, { appliedPresetIds: virtualAppliedIds, presetsById });
            const hasSavedCustomVanilla =
                state.vanillaBackup?.theme === 'customHTML' && Boolean(state.vanillaBackup.guiHTML.trim());
            if (composed.hasHtml) {
                previewPreset = {
                    guiHTML: composed.guiHTML,
                    customCSS: composed.customCSS,
                    regexRules: composed.regexRules,
                };
                isApprox = false;
            } else if (hasSavedCustomVanilla) {
                previewPreset = {
                    guiHTML: state.vanillaBackup.guiHTML,
                    customCSS: composed.customCSS,
                    regexRules: composed.regexRules,
                };
                isApprox = false;
            } else {
                previewPreset = {
                    guiHTML: FALLBACK_VANILLA_GUI_HTML,
                    customCSS: composed.customCSS,
                    regexRules: composed.regexRules,
                };
                isApprox = true;
            }
        }

        const approxBadge = rootEl.querySelector('[data-role="preview-approx-badge"]');
        if (approxBadge) {
            approxBadge.style.display = isApprox ? 'inline-flex' : 'none';
        }

        const srcdoc = buildPreviewSrcdoc(previewPreset, {
            palette: uiState.previewPalette,
            backdrop: uiState.previewBackdrop,
            roleFilter: uiState.previewRoleFilter,
            applyRegex: uiState.previewApplyRegex,
            charName: uiState.previewCharName,
            userName: uiState.previewUserName,
            rootFontSize: uiState.previewFontSize,
            customSampleText: uiState.previewCustomText,
        });
        // 내용이 같으면 iframe을 다시 싣지 않는다 (깜빡임과 스크롤 초기화 방지).
        if (iframe.dataset.rtpv3Loaded === '1' && srcdoc === lastPreviewSrcdoc) {
            return;
        }
        lastPreviewSrcdoc = srcdoc;
        iframe.dataset.rtpv3Loaded = '1';
        iframe.srcdoc = srcdoc;
    }

    function schedulePreviewRefresh() {
        if (previewTimer) {
            clearTimeout(previewTimer);
        }
        previewTimer = setTimeout(() => {
            updateValidationDom();
            updatePreviewFrame();
        }, 200);
    }

    async function saveDraftToState() {
        const currentState = normalizePluginState(getState());
        const named = { ...uiState.draftPreset, name: (uiState.draftPreset.name || '').trim() || '이름 없는 프리셋' };
        if (!hasPresetContent(named)) {
            throw new Error('HTML·CSS·정규식 중 하나는 채워야 합니다.');
        }
        // 기본 제공 프리셋은 원본을 두고 사용자 프리셋으로 복사본을 만든다.
        const draft = isDraftBuiltin()
            ? makeUserCopyOfBuiltin(named)
            : normalizePresetItem({ ...named, updatedAt: new Date().toISOString() });
        const exists = currentState.presets.some((p) => p.id === draft.id);
        // 그룹은 목록에서 끌어다 바꾸므로, 저장된 쪽의 그룹을 그대로 쓴다.
        const nextPresets = exists
            ? currentState.presets.map((p) => (p.id === draft.id ? { ...draft, groupId: p.groupId } : p))
            : [...currentState.presets, draft];
        const nextState = normalizePluginState({
            ...currentState,
            presets: nextPresets,
        });
        const { state: savedState } = await savePluginState(nextState, api);
        setState(savedState);
        uiState.selectedPresetId = draft.id;
        uiState.draftPreset = clonePresetDraft(draft);
        uiState.hasUnsavedDraft = false;
        uiState.draftIsNew = false;
        return { savedState, savedPreset: draft };
    }

    async function handleSaveDraftClick() {
        if (!uiState.hasUnsavedDraft && !uiState.draftIsNew) {
            return;
        }
        try {
            const fromBuiltin = isDraftBuiltin();
            const { savedPreset } = await saveDraftToState();
            showToast(
                fromBuiltin
                    ? `"${savedPreset.name}"(으)로 내 프리셋에 저장했습니다. 기본 제공 원본은 그대로입니다.`
                    : `"${savedPreset.name}" 저장했습니다.`,
            );
            render();
        } catch (err) {
            showToast(`저장 실패: ${errorText(err)}`, true);
        }
    }

    async function handleActivatePreset(targetPreset, options = {}) {
        try {
            let workingState = normalizePluginState(getState());
            let presetToApply = targetPreset;

            if (!presetToApply || presetToApply.id === uiState.selectedPresetId) {
                if (isDraftBuiltin() && !uiState.hasUnsavedDraft) {
                    presetToApply = getBuiltinPreset(uiState.draftPreset.id);
                } else {
                    const { savedState, savedPreset } = await saveDraftToState();
                    workingState = savedState;
                    presetToApply = savedPreset;
                }
            }

            const result = await bridgeOps.activatePreset(presetToApply, workingState, options, api);
            setState(result.state);
            // 편집 중인 다른 프리셋의 미저장 초안은 버리지 않는다.
            if (!uiState.hasUnsavedDraft || uiState.selectedPresetId === result.preset.id) {
                uiState.selectedPresetId = result.preset.id;
                uiState.draftPreset = clonePresetDraft(result.preset);
                uiState.hasUnsavedDraft = false;
                uiState.draftIsNew = false;
            }
            let message;
            if (result.replacedHtmlPreset) {
                const keptNote =
                    result.keptStackedCount > 0 ? ` 겹쳐 둔 프리셋 ${result.keptStackedCount}개는 그대로입니다.` : '';
                message = `"${result.replacedHtmlPreset.name}" 대신 "${result.preset.name}"을(를) 적용했습니다.${keptNote}`;
            } else if (result.addedStacked) {
                message = `"${result.preset.name}"을(를) 겹쳐 적용했습니다.`;
            } else if (result.wasAlreadyApplied) {
                message = `"${result.preset.name}"을(를) RisuAI에 다시 적용했습니다.`;
            } else {
                message = `"${result.preset.name}"을(를) RisuAI에 적용했습니다.`;
            }
            showToast(`${message}${result.cssRefreshed ? '' : '\n화면에 바로 보이지 않으면 채팅을 다시 열어 주세요.'}`);
            render();
        } catch (err) {
            const msg = errorText(err);
            if (!options.force && msg.includes('테마 검증 오류')) {
                openModal({
                    type: 'confirm-force-activate',
                    preset: targetPreset || uiState.draftPreset,
                    message: msg,
                });
                return;
            }
            showToast(`적용 실패: ${msg}`, true);
        }
    }

    async function handleDeactivatePreset(presetId) {
        try {
            const currentState = normalizePluginState(getState());
            const target = findPreset(currentState, presetId);
            const result = await bridgeOps.deactivatePreset(presetId, currentState, api);
            if (!result.deactivated) {
                return;
            }
            setState(result.state);
            if (result.restoredVanilla) {
                showToast(
                    result.hadBackup
                        ? '마지막 프리셋을 해제해 원래 RisuAI 테마로 복원했습니다.'
                        : `"${target?.name || '프리셋'}" 적용을 해제했습니다.`,
                );
            } else {
                showToast(
                    `"${target?.name || '프리셋'}" 적용을 해제했습니다.${result.cssRefreshed ? '' : '\n화면에 바로 보이지 않으면 채팅을 다시 열어 주세요.'}`,
                );
            }
            render();
        } catch (err) {
            showToast(`해제 실패: ${errorText(err)}`, true);
        }
    }

    async function handleToggleStackPresets(nextEnabled) {
        try {
            const currentState = normalizePluginState(getState());
            const result = await bridgeOps.setStackPresets(nextEnabled, currentState, api);
            setState(result.state);
            if (nextEnabled) {
                showToast('프리셋 중복 적용을 켰습니다. CSS·정규식 프리셋을 테마 위에 겹쳐 적용할 수 있습니다.');
            } else if (result.droppedCount > 0) {
                showToast(
                    `겹쳐 둔 프리셋 ${result.droppedCount}개를 해제하고 "${result.keptPreset?.name || '기존 프리셋'}"만 남겼습니다.`,
                );
            } else {
                showToast('프리셋 중복 적용을 껐습니다.');
            }
            render();
        } catch (err) {
            showToast(`설정 변경 실패: ${errorText(err)}`, true);
        }
    }

    async function handleRestoreVanillaClick() {
        try {
            const currentState = normalizePluginState(getState());
            const result = await bridgeOps.restoreVanilla(currentState, api);
            setState(result.state);
            showToast(
                result.hadBackup
                    ? '처음 적용하기 전의 RisuAI 테마로 되돌렸습니다.'
                    : '보관 중인 원래 테마가 없어 RisuAI 설정은 바꾸지 않았습니다.',
            );
            render();
        } catch (err) {
            showToast(`복원 실패: ${errorText(err)}`, true);
        }
    }

    async function handleCaptureVanillaClick() {
        if (needsDiscardConfirm()) {
            openModal({ type: 'confirm-discard', action: 'capture', name: 'RisuAI 현재 설정' });
            return;
        }
        try {
            const currentState = normalizePluginState(getState());
            const result = await bridgeOps.captureCurrentVanillaAsPreset('RisuAI 현재 테마', currentState, api);
            setState(result.state);
            uiState.selectedPresetId = result.preset.id;
            uiState.draftPreset = clonePresetDraft(result.preset);
            uiState.hasUnsavedDraft = false;
            uiState.draftIsNew = false;
            uiState.mobileView = 'editor';
            showToast(`지금 RisuAI에 적용된 HTML·CSS를 "${result.preset.name}" 프리셋으로 저장했습니다.`);
            render();
        } catch (err) {
            showToast(`가져오기 실패: ${errorText(err)}`, true);
        }
    }

    function handleCreateNewPreset({ force = false } = {}) {
        if (!force && needsDiscardConfirm()) {
            openModal({ type: 'confirm-discard', action: 'new', name: '새 프리셋' });
            return;
        }
        const state = normalizePluginState(getState());
        uiState.draftPreset = blankPreset(`새 프리셋 ${state.presets.length + 1}`);
        uiState.selectedPresetId = uiState.draftPreset.id;
        uiState.draftIsNew = true;
        uiState.hasUnsavedDraft = false;
        uiState.activeTab = 'editor';
        uiState.mobileView = 'editor';
        render();
        const nameInput = rootEl?.querySelector('[data-focus-key="name"]');
        if (nameInput) {
            nameInput.focus();
            nameInput.select();
        }
    }

    async function handleDuplicatePreset() {
        try {
            if ((uiState.hasUnsavedDraft || uiState.draftIsNew) && !isDraftBuiltin()) {
                await saveDraftToState();
            }
            const source = { ...uiState.draftPreset, groupId: isDraftBuiltin() ? null : uiState.draftPreset.groupId };
            const currentState = normalizePluginState(getState());
            const copy = normalizePresetItem({
                ...source,
                id: createPresetId(),
                name: `${source.name} (복사본)`,
                updatedAt: new Date().toISOString(),
            });
            const nextState = normalizePluginState({
                ...currentState,
                presets: [...currentState.presets, copy],
            });
            const { state: savedState } = await savePluginState(nextState, api);
            setState(savedState);
            selectPreset(copy.id, { force: true });
            showToast(`"${copy.name}"을(를) 만들었습니다.`);
        } catch (err) {
            showToast(`복제 실패: ${errorText(err)}`, true);
        }
    }

    function selectFallbackAfterRemoval(savedState) {
        const next = getAllPresets(savedState)[0];
        uiState.draftIsNew = false;
        uiState.hasUnsavedDraft = false;
        if (next) {
            uiState.selectedPresetId = next.id;
            uiState.draftPreset = clonePresetDraft(next);
        } else {
            uiState.selectedPresetId = null;
            uiState.draftPreset = null;
        }
    }

    async function handleDeleteCurrent() {
        const target = uiState.draftPreset;
        if (!target) {
            return;
        }
        if (uiState.draftIsNew) {
            selectFallbackAfterRemoval(normalizePluginState(getState()));
            showToast('저장하지 않은 새 프리셋을 버렸습니다.');
            render();
            return;
        }
        if (isDraftBuiltin()) {
            try {
                const { state: savedState } = await savePluginState(hideBuiltin(getState(), target.id), api);
                setState(savedState);
                selectFallbackAfterRemoval(savedState);
                showToast(`"${target.name}"을(를) 숨겼습니다. ⋯ 메뉴의 "숨긴 기본 프리셋 다시 보기"로 되살릴 수 있습니다.`);
                render();
            } catch (err) {
                showToast(`숨기기 실패: ${errorText(err)}`, true);
            }
            return;
        }
        try {
            const currentState = normalizePluginState(getState());
            const remaining = currentState.presets.filter((p) => p.id !== target.id);
            const nextState = normalizePluginState({
                ...currentState,
                appliedPresetIds: currentState.appliedPresetIds.filter((id) => id !== target.id),
                presets: remaining,
            });
            const syncRes = await bridgeOps.syncAppliedStateToRisu(currentState, nextState, api);
            setState(syncRes.state);
            selectFallbackAfterRemoval(syncRes.state);
            if (syncRes.restoredVanilla) {
                showToast(`"${target.name}"을(를) 삭제하고 원래 RisuAI 테마로 복원했습니다.`);
            } else if (syncRes.dbUpdated) {
                showToast(`"${target.name}"을(를) 삭제하고 적용 중인 구성을 다시 맞췄습니다.`);
            } else {
                showToast(`"${target.name}"을(를) 삭제했습니다.`);
            }
            render();
        } catch (err) {
            showToast(`삭제 실패: ${errorText(err)}`, true);
        }
    }

    async function copyWithFallback(label, content) {
        const ok = await copyTextToClipboard(content);
        if (ok) {
            showToast(`${label}을(를) 클립보드에 복사했습니다.`);
            return;
        }
        openModal({ type: 'copy-text', title: label, content });
    }

    /** 붙여넣거나 불러온 JSON을 종류에 따라 처리한다. 프리셋 JSON은 새 프리셋으로, Risu 정규식 JSON은 지금 프리셋의 규칙으로 들인다. */
    async function importJsonText(rawText, { replace = false } = {}) {
        const text = String(rawText || '').trim();
        if (!text) {
            throw new Error('가져올 내용이 비어 있습니다.');
        }
        let parsed = null;
        try {
            parsed = JSON.parse(text);
        } catch (err) {
            throw new Error(`JSON 형식이 아닙니다: ${errorText(err)}`);
        }

        if (parsed && parsed.type === 'regex' && Array.isArray(parsed.data)) {
            const rules = importRisuRegexJson(text);
            uiState.draftPreset.regexRules = [...uiState.draftPreset.regexRules, ...rules];
            uiState.hasUnsavedDraft = true;
            uiState.activeTab = 'regex';
            showToast(`Risu 정규식 ${rules.length}건을 지금 프리셋에 붙였습니다. 저장해야 확정됩니다.`);
            render();
            return;
        }

        const mode = replace ? 'replace' : 'merge';
        const currentState = normalizePluginState(getState());
        const result = importPresetsJson(text, currentState, mode);
        let savedState;
        let syncNote = '';
        if (mode === 'replace') {
            const syncRes = await bridgeOps.syncAppliedStateToRisu(currentState, result.state, api);
            savedState = syncRes.state;
            if (syncRes.restoredVanilla) {
                syncNote = '\n적용 중이던 프리셋이 목록에서 빠져 원래 테마로 복원했습니다.';
            } else if (syncRes.dbUpdated) {
                syncNote = '\n적용 중이던 프리셋 구성을 RisuAI에도 다시 맞췄습니다.';
            }
        } else {
            const saveRes = await savePluginState(result.state, api);
            savedState = saveRes.state;
        }
        setState(savedState);
        const firstImported = result.importedPresets[0] || (result.skippedBuiltins || [])[0];
        const keepDraft =
            mode !== 'replace' &&
            uiState.hasUnsavedDraft &&
            (uiState.draftIsNew || Boolean(findPreset(savedState, uiState.selectedPresetId)));
        if (firstImported && !keepDraft) {
            uiState.selectedPresetId = firstImported.id;
            uiState.draftPreset = clonePresetDraft(firstImported);
            uiState.hasUnsavedDraft = false;
            uiState.draftIsNew = false;
        }
        const notes = [];
        if (result.skippedBuiltinCount) {
            notes.push(`기본 제공과 같은 ${result.skippedBuiltinCount}건은 이미 있어서 건너뛰었습니다.`);
        }
        if (result.skippedEmptyCount) {
            notes.push(`내용이 비어 있는 ${result.skippedEmptyCount}건은 건너뛰었습니다.`);
        }
        if (syncNote) {
            notes.push(syncNote.trim());
        }
        const suffix = notes.length ? `\n${notes.join('\n')}` : '';
        showToast(`프리셋 ${result.importedCount}건을 가져왔습니다. (새로 추가 ${result.addedCount}, 갱신 ${result.updatedCount})${suffix}`);
        render();
    }

    async function handleImportFiles(fileList) {
        const files = Array.from(fileList || []);
        for (const file of files) {
            if (!file.name.toLowerCase().endsWith('.json')) {
                showToast(`JSON 파일만 불러올 수 있습니다: ${file.name}`, true);
                continue;
            }
            try {
                await importJsonText(await file.text());
            } catch (err) {
                showToast(`${file.name} 불러오기 실패: ${errorText(err)}`, true);
            }
        }
    }

    async function syncDisplayRegexArgFromHost() {
        if (!api || typeof api.getArgument !== 'function') {
            return;
        }
        uiState.hostDisplayRegexEnabled = await readDisplayRegexEnabled(api);
    }

    async function toggleHostDisplayRegexArg(nextEnabled) {
        uiState.hostDisplayRegexEnabled = nextEnabled;
        if (api && typeof api.setArgument === 'function') {
            try {
                // RisuAI 설정 화면의 체크박스와 같은 형식('1' / '0' 문자열)으로 기록한다.
                await api.setArgument(ARG_DISABLE_DISPLAY_REGEX, nextEnabled ? '0' : '1');
                if (typeof onDisplayRegexArgChanged === 'function') {
                    onDisplayRegexArgChanged();
                }
                showToast(nextEnabled ? '채팅에 디스플레이 정규식을 적용합니다.' : '채팅에 디스플레이 정규식을 적용하지 않습니다.');
            } catch (err) {
                showToast(`설정 변경 실패: ${errorText(err)}`, true);
            }
        }
        render();
    }

    function applyOneClickTransform(type, params = {}) {
        const result = transformThemeMarkup(
            {
                guiHTML: uiState.draftPreset.guiHTML,
                customCSS: uiState.draftPreset.customCSS,
            },
            type,
            params,
        );
        if (result.error) {
            showToast(`변환 오류: ${result.error}`, true);
            return;
        }
        if (!result.changed) {
            showToast('바꿀 곳이 없습니다.');
            return;
        }
        uiState.draftPreset.guiHTML = result.guiHTML;
        uiState.draftPreset.customCSS = result.customCSS;
        uiState.hasUnsavedDraft = true;
        showToast(`${result.matchCount}곳을 바꿨습니다. 저장해야 확정됩니다.`);
        render();
    }

    function handleUngroupCurrent() {
        const st = normalizePluginState(getState());
        const saved = st.presets.find((p) => p.id === uiState.draftPreset?.id);
        if (!saved || !saved.groupId) {
            return;
        }
        const groupName = getPresetGroupName(st, saved);
        const next = movePresetToGroup(st, saved.id, { groupId: null });
        const dissolved = !next.groups.some((g) => g.id === saved.groupId);
        updateStateAndSave(
            next,
            dissolved ? `"${groupName}" 그룹에 하나만 남아 그룹을 풀었습니다.` : `"${groupName}" 그룹에서 뺐습니다.`,
        );
    }

    // ───────────────────────── 메뉴 ─────────────────────────

    function refreshMenuItemStates() {
        if (!rootEl) {
            return;
        }
        const savedPreset = normalizePluginState(getState()).presets.find((p) => p.id === uiState.draftPreset?.id);
        const moveItem = rootEl.querySelector('[data-help="menu.move-group"]');
        const ungroupItem = rootEl.querySelector('[data-help="menu.ungroup"]');
        if (moveItem) {
            moveItem.disabled = !savedPreset;
        }
        if (ungroupItem) {
            ungroupItem.disabled = !savedPreset || !savedPreset.groupId;
        }
        const unhideItem = rootEl.querySelector('[data-help="menu.unhide"]');
        if (unhideItem) {
            unhideItem.disabled = normalizePluginState(getState()).hiddenBuiltinIds.length === 0;
        }
    }

    function getApplyButtonLabel(state, preset) {
        if (!preset) {
            return 'RisuAI에 적용';
        }
        if (!uiState.draftIsNew && state.appliedPresetIds.includes(preset.id)) {
            return '다시 적용';
        }
        if (state.stackPresets) {
            if (!presetHasHtml(preset) && state.appliedPresetIds.length > 0) {
                return '겹쳐 적용';
            }
            if (
                presetHasHtml(preset) &&
                state.appliedPresetIds.some((id) => {
                    const p = findPreset(state, id);
                    return p && !presetHasHtml(p);
                })
            ) {
                return '테마 교체';
            }
        }
        return 'RisuAI에 적용';
    }

    function setAppliedPopoverOpen(open) {
        uiState.appliedPopoverOpen = open;
        if (!rootEl) {
            return;
        }
        if (open && uiState.menuOpen) {
            setMenuOpen(false);
        }
        const pop = rootEl.querySelector('[data-role="applied-popover"]');
        const badge = rootEl.querySelector('[data-role="applied-badge-btn"]');
        if (pop) {
            pop.classList.toggle('open', open);
        }
        if (badge) {
            badge.setAttribute('aria-expanded', open ? 'true' : 'false');
        }
    }

    function setMenuOpen(open) {
        uiState.menuOpen = open;
        if (!rootEl) {
            return;
        }
        if (open) {
            if (uiState.appliedPopoverOpen) {
                setAppliedPopoverOpen(false);
            }
            refreshMenuItemStates();
        }
        const menu = rootEl.querySelector('[data-role="more-menu"]');
        const btn = rootEl.querySelector('[data-role="more-btn"]');
        if (menu) {
            menu.classList.toggle('open', open);
        }
        if (btn) {
            btn.setAttribute('aria-expanded', open ? 'true' : 'false');
        }
    }

    function createMoreMenu() {
        const state = normalizePluginState(getState());
        const wrap = el('div', { className: 'rtpv3-menu-wrap' });
        const btn = el('button', {
            className: 'ghost',
            text: '⋯',
            help: 'tb.more',
            'aria-haspopup': 'menu',
            'aria-expanded': 'false',
            dataset: { role: 'more-btn' },
            style: { fontSize: '16px', lineHeight: '1', padding: '4px 10px' },
            onClick: (e) => {
                e.stopPropagation();
                setMenuOpen(!uiState.menuOpen);
            },
        });
        const menu = el('div', { className: 'rtpv3-menu', role: 'menu', dataset: { role: 'more-menu' } });

        const item = (label, handler, extraClass = '', helpKey = null) =>
            el('button', {
                className: `rtpv3-menu-item ${extraClass}`.trim(),
                role: 'menuitem',
                text: label,
                help: helpKey,
                onClick: (e) => {
                    e.stopPropagation();
                    setMenuOpen(false);
                    handler();
                },
            });

        const stackItem = el(
            'button',
            {
                className: 'rtpv3-menu-item rtpv3-menu-check',
                role: 'menuitemcheckbox',
                'aria-checked': state.stackPresets ? 'true' : 'false',
                help: 'menu.stack-toggle',
                onClick: (e) => {
                    e.stopPropagation();
                    setMenuOpen(false);
                    handleToggleStackPresets(!normalizePluginState(getState()).stackPresets);
                },
            },
            [
                el('span', { text: '프리셋 중복 적용' }),
                el('span', {
                    className: `rtpv3-menu-state${state.stackPresets ? ' on' : ''}`,
                    text: state.stackPresets ? '켜짐' : '꺼짐',
                }),
            ],
        );

        menu.append(
            el('div', { className: 'rtpv3-menu-group', text: '이 프리셋' }),
            item('복제', () => handleDuplicatePreset(), '', 'menu.duplicate'),
            item('그룹으로 옮기기…', () => openModal({ type: 'move-group' }), '', 'menu.move-group'),
            item('그룹에서 빼기', () => handleUngroupCurrent(), '', 'menu.ungroup'),
            item('JSON 내보내기 (복사)', () => {
                if (!hasPresetContent(uiState.draftPreset)) {
                    showToast('HTML·CSS·정규식 중 하나는 채워야 내보낼 수 있습니다.', true);
                    return;
                }
                const st = normalizePluginState(getState());
                const saved = st.presets.find((p) => p.id === uiState.draftPreset.id);
                const groupName = isDraftBuiltin() ? getBuiltinPreset(uiState.draftPreset.id)?.groupName : getPresetGroupName(st, saved);
                copyWithFallback('프리셋 JSON', exportSinglePresetJson(normalizePresetItem(uiState.draftPreset), groupName));
            }, '', 'menu.export-json'),
            el('div', { className: 'rtpv3-menu-group', text: '가져오기' }),
            item('JSON 붙여넣기', () => openModal({ type: 'paste-import', text: '', replace: false }), '', 'menu.paste-json'),
            item('파일 불러오기 (.json)', () => fileInputEl?.click(), '', 'menu.file-import'),
            el('div', { className: 'rtpv3-menu-group', text: '전체' }),
            stackItem,
            el('div', { className: 'rtpv3-menu-sub', text: '켜면 CSS·정규식 프리셋을 테마 위에 겹칩니다' }),
            item('전체 백업 복사', () => copyWithFallback('전체 프리셋 백업 JSON', exportAllPresetsJson(getState())), '', 'menu.backup-all'),
            item('숨긴 기본 프리셋 다시 보기', () => openModal({ type: 'unhide' }), '', 'menu.unhide'),
            el('div', { className: 'rtpv3-menu-group', text: 'RisuAI' }),
            item('현재 설정 가져오기', () => handleCaptureVanillaClick(), '', 'menu.capture'),
            item('원래 테마로 복원', () => openModal({ type: 'confirm-restore' }), 'danger-text', 'menu.restore'),
        );
        menu.addEventListener('click', (e) => e.stopPropagation());
        menu.classList.toggle('open', uiState.menuOpen);
        // 저장하지 않은 새 프리셋이거나 그룹이 없으면 그룹 항목을 흐리게 한다.
        const savedPreset = state.presets.find((p) => p.id === uiState.draftPreset?.id);
        const moveItem = menu.querySelector('[data-help="menu.move-group"]');
        const ungroupItem = menu.querySelector('[data-help="menu.ungroup"]');
        if (moveItem) {
            moveItem.disabled = !savedPreset;
        }
        if (ungroupItem) {
            ungroupItem.disabled = !savedPreset || !savedPreset.groupId;
        }
        wrap.append(btn, menu);
        return wrap;
    }

    // ───────────────────────── 목록 패널 ─────────────────────────

    function formatAppliedSummary(state) {
        const ids = state.appliedPresetIds || [];
        if (ids.length === 0) {
            return 'RisuAI 기본 설정 사용 중';
        }
        const nameAt = (i) => findPreset(state, ids[i])?.name || ids[i];
        if (ids.length === 1) {
            return `적용 중: ${nameAt(0)}`;
        }
        if (ids.length === 2) {
            return `적용 중: ${nameAt(0)} + ${nameAt(1)}`;
        }
        return `적용 중: ${nameAt(0)} + ${nameAt(1)} 외 ${ids.length - 2}개`;
    }

    function buildAppliedRows(state) {
        const ids = state.appliedPresetIds || [];
        const hiddenSet = new Set(state.hiddenBuiltinIds || []);
        return ids.map((id, idx) => {
            const preset = findPreset(state, id);
            const isHidden = isBuiltinId(id) && hiddenSet.has(id);
            const name = preset ? `${preset.name}${isHidden ? ' (숨김)' : ''}` : `${id} (없음)`;
            const orderEl = state.stackPresets
                ? el('span', { className: 'rtpv3-applied-order', text: String(idx + 1) })
                : null;
            const nameBtn = el('button', {
                className: 'rtpv3-applied-name',
                text: name,
                title: isHidden ? '숨긴 기본 프리셋입니다. ⋯ 메뉴에서 다시 보이게 할 수 있습니다.' : name,
                disabled: !preset || isHidden,
                onClick: (e) => {
                    e.stopPropagation();
                    setAppliedPopoverOpen(false);
                    selectPreset(id);
                },
            });
            const deactBtn = el('button', {
                className: 'small ghost danger-text',
                text: '해제',
                onClick: (e) => {
                    e.stopPropagation();
                    handleDeactivatePreset(id);
                },
            });
            return el('div', { className: 'rtpv3-applied-item' }, [orderEl, nameBtn, deactBtn].filter(Boolean));
        });
    }

    function createListPanel(state) {
        const panel = el('section', { className: 'rtpv3-panel rtpv3-panel-list' });

        const head = el('div', { className: 'rtpv3-panel-head' }, [
            el('div', { className: 'rtpv3-panel-title' }, [el('span', { text: `프리셋 ${getAllPresets(state).length}개` })]),
        ]);

        const searchInput = el('input', {
            type: 'text',
            placeholder: '이름이나 메모로 찾기',
            value: uiState.searchQuery,
            help: 'list.search',
            dataset: { focusKey: 'search' },
        });
        const clearBtn = el('button', {
            type: 'button',
            className: 'rtpv3-search-clear',
            text: '×',
            'aria-label': '검색어 지우기',
            style: { display: uiState.searchQuery ? 'inline-flex' : 'none' },
            onClick: () => {
                uiState.searchQuery = '';
                searchInput.value = '';
                clearBtn.style.display = 'none';
                renderPresetListItems(listContainer, normalizePluginState(getState()));
                searchInput.focus();
            },
        });
        head.appendChild(el('div', { className: 'rtpv3-search-wrap' }, [searchInput, clearBtn]));
        panel.appendChild(head);

        const body = el('div', { className: 'rtpv3-panel-body', dataset: { scrollKey: 'list' } });
        if (state.appliedPresetIds.length > 0) {
            const mobileBar = el('div', { className: 'rtpv3-mobile-applied' });
            mobileBar.appendChild(
                el(
                    'button',
                    {
                        className: 'rtpv3-mobile-applied-toggle',
                        'aria-expanded': uiState.mobileAppliedOpen ? 'true' : 'false',
                        help: 'header.status',
                        onClick: () => {
                            uiState.mobileAppliedOpen = !uiState.mobileAppliedOpen;
                            render();
                        },
                    },
                    [
                        el('span', { className: 'rtpv3-mobile-applied-summary', text: formatAppliedSummary(state) }),
                        el('span', { text: uiState.mobileAppliedOpen ? '▴' : '▾', 'aria-hidden': 'true' }),
                    ],
                ),
            );
            if (uiState.mobileAppliedOpen) {
                mobileBar.append(...buildAppliedRows(state));
                if (state.appliedPresetIds.length >= 2) {
                    mobileBar.appendChild(
                        el('div', { className: 'rtpv3-applied-pop-foot' }, [
                            el('button', {
                                className: 'small ghost danger-text',
                                text: '모두 해제',
                                onClick: () => openModal({ type: 'confirm-restore' }),
                            }),
                        ]),
                    );
                }
            }
            body.appendChild(mobileBar);
        }
        const listContainer = el('div', { className: 'rtpv3-preset-list', role: 'list' });
        searchInput.addEventListener('input', (e) => {
            uiState.searchQuery = e.target.value;
            clearBtn.style.display = uiState.searchQuery ? 'inline-flex' : 'none';
            renderPresetListItems(listContainer, normalizePluginState(getState()));
        });
        renderPresetListItems(listContainer, state);
        attachListDrag(listContainer);
        body.appendChild(listContainer);
        panel.appendChild(body);
        return panel;
    }

    function renderPresetListItems(container, state) {
        container.innerHTML = '';
        const query = uiState.searchQuery.trim().toLowerCase();
        const matches = (p) =>
            !query || p.name.toLowerCase().includes(query) || (p.description || '').toLowerCase().includes(query);

        // ── 기본 제공: 코드에서 읽고, 코드에서 정한 그룹 그대로 보여 준다 (끌 수 없음) ──
        const builtins = getVisibleBuiltins(state);
        const builtinBlocks = [];
        const drawnBuiltinGroups = new Set();
        for (const preset of builtins) {
            if (!preset.groupName) {
                if (matches(preset)) {
                    builtinBlocks.push(createPresetCard(preset, state, { builtin: true }));
                }
                continue;
            }
            if (drawnBuiltinGroups.has(preset.groupName)) {
                continue;
            }
            drawnBuiltinGroups.add(preset.groupName);
            const members = builtins.filter((b) => b.groupName === preset.groupName);
            const visibleMembers = members.filter(matches);
            if (query && visibleMembers.length === 0) {
                continue;
            }
            builtinBlocks.push(createBuiltinGroupBlock(preset.groupName, members, visibleMembers, state, Boolean(query)));
        }
        if (builtinBlocks.length) {
            container.appendChild(el('div', { className: 'rtpv3-list-section', help: 'list.section-builtin', text: '기본 제공' }));
            builtinBlocks.forEach((block) => container.appendChild(block));
        }

        // ── 내 프리셋: 저장소에서 읽고, 그룹·순서를 끌어서 바꾼다 ──
        const userSection = el('div', { className: 'rtpv3-user-section', dataset: { userSection: '1' } });
        let shown = 0;
        if (uiState.draftIsNew && uiState.draftPreset) {
            userSection.appendChild(createPresetCard(uiState.draftPreset, state, { isNew: true }));
            shown += 1;
        }

        // 그룹은 첫 프리셋이 있던 자리에 한 번만 그린다.
        const groupsById = new Map(state.groups.map((g) => [g.id, g]));
        const drawnGroups = new Set();
        for (const preset of state.presets) {
            if (!preset.groupId) {
                if (matches(preset)) {
                    userSection.appendChild(createPresetCard(preset, state));
                    shown += 1;
                }
                continue;
            }
            if (drawnGroups.has(preset.groupId)) {
                continue;
            }
            drawnGroups.add(preset.groupId);
            const group = groupsById.get(preset.groupId);
            const members = state.presets.filter((p) => p.groupId === preset.groupId);
            const visibleMembers = members.filter(matches);
            if (query && visibleMembers.length === 0) {
                continue;
            }
            userSection.appendChild(createGroupBlock(group, members, visibleMembers, state, Boolean(query)));
            shown += 1;
        }

        if (shown === 0) {
            userSection.appendChild(
                el('div', {
                    className: 'rtpv3-empty',
                    text: query
                        ? '찾는 내 프리셋이 없습니다.'
                        : '새로 만들거나 기본 제공 프리셋을 고쳐 저장하면 여기에 모입니다.',
                }),
            );
        }
        // 목록 맨 아래 빈 자리: 여기에 놓으면 그룹 밖 맨 뒤로 옮긴다.
        userSection.appendChild(el('div', { className: 'rtpv3-list-end', dataset: { dropEnd: '1' } }));
        container.appendChild(el('div', { className: 'rtpv3-list-section', help: 'list.section-user', text: '내 프리셋' }));
        container.appendChild(userSection);
    }

    function createBuiltinGroupBlock(groupName, members, visibleMembers, state, searching) {
        const expanded = searching || state.expandedBuiltinGroups.includes(groupName);
        const hasActive = members.some((p) => state.appliedPresetIds.includes(p.id));
        const hasSelected = members.some((p) => p.id === uiState.selectedPresetId);
        const head = el(
            'div',
            {
                className: `rtpv3-group-head${hasSelected && !expanded ? ' has-selected' : ''}`,
                role: 'button',
                tabindex: '0',
                'aria-expanded': expanded ? 'true' : 'false',
                help: 'list.builtin-group',
            },
            [
                el('span', { className: 'rtpv3-group-chevron', text: expanded ? '▾' : '▸', 'aria-hidden': 'true' }),
                el('span', { className: 'rtpv3-group-name', text: groupName }),
                el('span', { className: 'rtpv3-group-count', text: String(members.length) }),
                hasActive ? el('span', { className: 'rtpv3-badge active', text: '적용 중', help: 'list.badge-active' }) : null,
            ],
        );
        const toggle = () => {
            if (!searching) {
                updateStateAndSave(setBuiltinGroupExpanded(getState(), groupName, !expanded));
            }
        };
        head.addEventListener('click', toggle);
        head.addEventListener('keydown', (e) => {
            if ((e.key === 'Enter' || e.key === ' ') && e.target === head) {
                e.preventDefault();
                toggle();
            }
        });
        const block = el('div', { className: `rtpv3-group${expanded ? '' : ' collapsed'}`, role: 'group', 'aria-label': groupName }, [head]);
        if (expanded) {
            const body = el('div', { className: 'rtpv3-group-body' });
            for (const preset of visibleMembers) {
                body.appendChild(createPresetCard(preset, state, { builtin: true }));
            }
            block.appendChild(body);
        }
        return block;
    }

    function createPresetCard(preset, state, { isNew = false, builtin = false } = {}) {
        const isSelected = preset.id === uiState.selectedPresetId;
        const appliedIdx = isNew ? -1 : state.appliedPresetIds.indexOf(preset.id);
        const isActive = appliedIdx >= 0;
        const card = el('button', {
            className: `rtpv3-preset-card${isSelected ? ' selected' : ''}${isNew ? ' unsaved' : ''}`,
            role: 'listitem',
            'aria-current': isSelected ? 'true' : null,
            help: 'list.card',
            // 기본 제공 프리셋과 저장 전 새 프리셋은 끌 수 없다.
            dataset: isNew || builtin ? {} : { dragId: preset.id, dropPreset: preset.id },
            onClick: () => {
                if (isNew || isSelected) {
                    uiState.mobileView = !isNew && isBuiltinId(preset.id) ? 'preview' : 'editor';
                    render();
                    return;
                }
                selectPreset(preset.id);
            },
        });

        const swatch = extractPresetSwatch(preset);
        const swatchEl = el(
            'span',
            {
                className: `rtpv3-swatch${swatch.isGlass ? ' is-glass' : ''}`,
                'aria-hidden': 'true',
                style: {
                    background: swatch.isGlass
                        ? `linear-gradient(135deg, rgba(255,255,255,0.28), rgba(255,255,255,0.04)), ${swatch.surface}`
                        : swatch.surface,
                },
            },
            [el('span', { className: 'rtpv3-swatch-dot', style: { background: swatch.accent } })],
        );

        const titleRow = el('div', { className: 'rtpv3-preset-card-title' }, [
            swatchEl,
            el('span', { className: 'rtpv3-preset-name', text: preset.name || '이름 없는 프리셋' }),
        ]);
        if (isSelected && !isNew) {
            titleRow.appendChild(
                el('span', {
                    className: 'rtpv3-dirty-dot',
                    help: 'list.dirty-dot',
                    style: { display: uiState.hasUnsavedDraft ? 'block' : 'none' },
                }),
            );
        }
        if (isNew) {
            titleRow.appendChild(el('span', { className: 'rtpv3-badge warn', text: '저장 안 됨', help: 'list.badge-unsaved' }));
        }
        if (isActive) {
            titleRow.appendChild(
                el('span', {
                    className: 'rtpv3-badge active',
                    text: state.stackPresets ? `적용 ${appliedIdx + 1}` : '적용 중',
                    help: 'list.badge-active',
                }),
            );
        }
        card.appendChild(titleRow);

        const kindPills = [
            presetHasHtml(preset) ? el('span', { className: 'rtpv3-kind-pill', text: 'HTML' }) : null,
            presetHasCss(preset) ? el('span', { className: 'rtpv3-kind-pill', text: 'CSS' }) : null,
            presetHasRegex(preset) ? el('span', { className: 'rtpv3-kind-pill', text: '정규식' }) : null,
        ].filter(Boolean);
        if (kindPills.length > 0) {
            card.appendChild(el('div', { className: 'rtpv3-kind-row' }, kindPills));
        }

        const memoLine = String(preset.description || '').split('\n').find((line) => line.trim()) || '';
        if (memoLine) {
            card.appendChild(el('div', { className: 'rtpv3-preset-desc', text: memoLine }));
        }
        return card;
    }

    function createGroupBlock(group, members, visibleMembers, state, searching) {
        const expanded = searching || !group.collapsed;
        const hasActive = members.some((p) => state.appliedPresetIds.includes(p.id));
        const hasSelected = members.some((p) => p.id === uiState.selectedPresetId);

        const nameSpan = el('span', { className: 'rtpv3-group-name', text: group.name });
        const head = el(
            'div',
            {
                className: `rtpv3-group-head${hasSelected && !expanded ? ' has-selected' : ''}`,
                role: 'button',
                tabindex: '0',
                'aria-expanded': expanded ? 'true' : 'false',
                help: 'list.group',
                dataset: { dropGroup: group.id },
            },
            [
                el('span', { className: 'rtpv3-group-chevron', text: expanded ? '▾' : '▸', 'aria-hidden': 'true' }),
                nameSpan,
                el('span', { className: 'rtpv3-group-count', text: String(members.length) }),
                hasActive ? el('span', { className: 'rtpv3-badge active', text: '적용 중', help: 'list.badge-active' }) : null,
                el('button', {
                    className: 'small ghost rtpv3-group-rename',
                    text: '✎',
                    'aria-label': '그룹 이름 바꾸기',
                    help: 'list.group-rename',
                    onClick: (e) => {
                        e.stopPropagation();
                        startGroupRename(nameSpan, group);
                    },
                }),
            ],
        );
        const toggle = () => {
            if (searching) {
                return;
            }
            updateStateAndSave(setGroupCollapsed(getState(), group.id, !group.collapsed));
        };
        head.addEventListener('click', (e) => {
            if (e.target.closest('input, .rtpv3-group-rename')) {
                return;
            }
            toggle();
        });
        head.addEventListener('keydown', (e) => {
            if ((e.key === 'Enter' || e.key === ' ') && e.target === head) {
                e.preventDefault();
                toggle();
            }
        });
        nameSpan.addEventListener('dblclick', (e) => {
            e.stopPropagation();
            startGroupRename(nameSpan, group);
        });

        const block = el('div', { className: `rtpv3-group${expanded ? '' : ' collapsed'}`, role: 'group', 'aria-label': group.name }, [head]);
        if (expanded) {
            const body = el('div', { className: 'rtpv3-group-body' });
            for (const preset of visibleMembers) {
                body.appendChild(createPresetCard(preset, state));
            }
            block.appendChild(body);
        }
        return block;
    }

    function startGroupRename(nameSpan, group) {
        const input = el('input', {
            type: 'text',
            className: 'rtpv3-group-name-input',
            value: group.name,
            'aria-label': '그룹 이름',
        });
        let done = false;
        const finish = (commit) => {
            if (done) {
                return;
            }
            done = true;
            const value = input.value.trim();
            if (commit && value && value !== group.name) {
                updateStateAndSave(renameGroup(getState(), group.id, value), `그룹 이름을 "${value}"(으)로 바꿨습니다.`);
            } else {
                rerenderList();
            }
        };
        input.addEventListener('keydown', (e) => {
            e.stopPropagation();
            if (e.key === 'Enter') {
                e.preventDefault();
                finish(true);
            } else if (e.key === 'Escape') {
                e.preventDefault();
                finish(false);
            }
        });
        input.addEventListener('click', (e) => e.stopPropagation());
        input.addEventListener('blur', () => finish(true));
        nameSpan.replaceWith(input);
        input.focus();
        input.select();
    }

    /** 목록 구조(그룹, 순서, 접기)를 바꾼 상태를 저장하고 다시 그린다. */
    /**
     * 목록 구조(그룹, 순서, 접기, 그룹 이름)만 바꾼 상태를 반영한다.
     * 화면은 목록만 바로 다시 그리고, 저장은 그 뒤에 한다. 저장에 실패하면 이전 상태로 되돌린다.
     * (전체를 다시 그리면 미리보기 iframe까지 새로 만들어져 버벅인다.)
     */
    async function updateStateAndSave(nextState, message = '') {
        const previous = getState();
        const normalized = normalizePluginState(nextState);
        setState(normalized);
        rerenderList();
        if (message) {
            showToast(message);
        }
        try {
            const { state: savedState } = await savePluginState(normalized, api);
            setState(savedState);
        } catch (err) {
            setState(previous);
            rerenderList();
            showToast(`저장 실패: ${errorText(err)}`, true);
        }
    }

    /** 프리셋 목록 패널만 다시 그린다. 스크롤 위치는 그대로 둔다. */
    function rerenderList() {
        if (!rootEl) {
            return;
        }
        const list = rootEl.querySelector('.rtpv3-panel-list .rtpv3-preset-list');
        if (!list) {
            render();
            return;
        }
        const state = normalizePluginState(getState());
        const scroller = list.closest('[data-scroll-key]');
        const top = scroller ? scroller.scrollTop : 0;
        renderPresetListItems(list, state);
        const count = rootEl.querySelector('.rtpv3-panel-list .rtpv3-panel-title span');
        if (count) {
            count.textContent = `프리셋 ${getAllPresets(state).length}개`;
        }
        if (scroller) {
            scroller.scrollTop = top;
        }
    }

    // ───────────────────────── 목록 드래그 ─────────────────────────
    // 마우스: 누른 채 6px 이상 움직이면 끌기 시작.
    // 터치: 길게 누르면(약 0.4초) 끌기 시작. 그 전에 움직이면 스크롤로 본다.

    let drag = null;
    let suppressNextClick = false;

    function attachListDrag(listEl) {
        listEl.addEventListener('pointerdown', onDragPointerDown);
        listEl.addEventListener('contextmenu', (e) => {
            if (drag) {
                e.preventDefault();
            }
        });
    }

    function onDragPointerDown(e) {
        if (uiState.helpMode || drag || (e.pointerType === 'mouse' && e.button !== 0)) {
            return;
        }
        const card = e.target.closest('[data-drag-id]');
        if (!card || e.target.closest('input')) {
            return;
        }
        drag = {
            id: card.dataset.dragId,
            card,
            pointerId: e.pointerId,
            touch: e.pointerType !== 'mouse',
            startX: e.clientX,
            startY: e.clientY,
            x: e.clientX,
            y: e.clientY,
            active: false,
            timer: null,
            ghost: null,
            drop: null,
            dropEl: null,
            raf: null,
        };
        if (drag.touch) {
            drag.timer = setTimeout(() => {
                if (drag && !drag.active) {
                    startDrag();
                }
            }, 400);
        }
        document.addEventListener('pointermove', onDragPointerMove, true);
        document.addEventListener('pointerup', onDragPointerUp, true);
        document.addEventListener('pointercancel', onDragPointerCancel, true);
        document.addEventListener('touchmove', onDragTouchMove, { capture: true, passive: false });
    }

    function onDragTouchMove(e) {
        // 끌기 중에는 화면이 스크롤되지 않게 막는다.
        if (drag && drag.active && e.cancelable) {
            e.preventDefault();
        }
    }

    function onDragPointerMove(e) {
        if (!drag || e.pointerId !== drag.pointerId) {
            return;
        }
        drag.x = e.clientX;
        drag.y = e.clientY;
        const dist = Math.hypot(e.clientX - drag.startX, e.clientY - drag.startY);
        if (!drag.active) {
            if (drag.touch) {
                if (dist > 8) {
                    endDrag(false);
                }
            } else if (dist > 6) {
                startDrag();
            }
            return;
        }
        e.preventDefault();
        moveGhost();
        updateDropTarget();
    }

    function onDragPointerUp(e) {
        if (!drag || e.pointerId !== drag.pointerId) {
            return;
        }
        endDrag(drag.active);
    }

    function onDragPointerCancel(e) {
        if (!drag || e.pointerId !== drag.pointerId) {
            return;
        }
        endDrag(false);
    }

    function startDrag() {
        if (!drag || !rootEl) {
            return;
        }
        drag.active = true;
        if (drag.timer) {
            clearTimeout(drag.timer);
            drag.timer = null;
        }
        const rect = drag.card.getBoundingClientRect();
        drag.offsetX = drag.startX - rect.left;
        drag.offsetY = drag.startY - rect.top;
        const ghost = drag.card.cloneNode(true);
        ghost.classList.add('rtpv3-drag-ghost');
        ghost.removeAttribute('data-help');
        ghost.style.width = `${rect.width}px`;
        rootEl.appendChild(ghost);
        drag.ghost = ghost;
        drag.card.classList.add('rtpv3-dragging');
        rootEl.classList.add('rtpv3-is-dragging');
        if (drag.touch && typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
            try {
                navigator.vibrate(12);
            } catch {
                // 진동을 지원하지 않는 기기
            }
        }
        moveGhost();
        updateDropTarget();
        const step = () => {
            if (!drag || !drag.active) {
                return;
            }
            autoScrollList();
            drag.raf = requestAnimationFrame(step);
        };
        drag.raf = requestAnimationFrame(step);
    }

    function moveGhost() {
        if (!drag || !drag.ghost) {
            return;
        }
        drag.ghost.style.left = `${drag.x - drag.offsetX}px`;
        drag.ghost.style.top = `${drag.y - drag.offsetY}px`;
    }

    function autoScrollList() {
        const scroller = rootEl?.querySelector('[data-scroll-key="list"]');
        if (!scroller) {
            return;
        }
        const rect = scroller.getBoundingClientRect();
        const edge = 44;
        if (drag.y < rect.top + edge) {
            scroller.scrollTop -= Math.ceil((rect.top + edge - drag.y) / 4);
            updateDropTarget();
        } else if (drag.y > rect.bottom - edge) {
            scroller.scrollTop += Math.ceil((drag.y - (rect.bottom - edge)) / 4);
            updateDropTarget();
        }
    }

    function clearDropMarks() {
        if (drag && drag.dropEl) {
            drag.dropEl.classList.remove('rtpv3-drop-before', 'rtpv3-drop-after', 'rtpv3-drop-into');
            drag.dropEl = null;
        }
    }

    function updateDropTarget() {
        if (!drag) {
            return;
        }
        clearDropMarks();
        drag.drop = null;
        const hit = document.elementFromPoint(drag.x, drag.y);
        const list = hit && hit.closest('[data-user-section]');
        if (!list) {
            return;
        }
        const cardEl = hit.closest('[data-drop-preset]');
        if (cardEl) {
            const targetId = cardEl.dataset.dropPreset;
            if (targetId === drag.id) {
                return;
            }
            const rect = cardEl.getBoundingClientRect();
            const rel = (drag.y - rect.top) / Math.max(rect.height, 1);
            const type = rel < 0.28 ? 'before' : rel > 0.72 ? 'after' : 'into-preset';
            drag.drop = { type, targetId };
            drag.dropEl = cardEl;
            cardEl.classList.add(type === 'before' ? 'rtpv3-drop-before' : type === 'after' ? 'rtpv3-drop-after' : 'rtpv3-drop-into');
            return;
        }
        const groupHead = hit.closest('[data-drop-group]');
        if (groupHead) {
            const rect = groupHead.getBoundingClientRect();
            const rel = (drag.y - rect.top) / Math.max(rect.height, 1);
            const groupId = groupHead.dataset.dropGroup;
            const type = rel < 0.3 ? 'before-group' : 'into-group';
            drag.drop = { type, groupId };
            drag.dropEl = groupHead;
            groupHead.classList.add(type === 'before-group' ? 'rtpv3-drop-before' : 'rtpv3-drop-into');
            return;
        }
        const endEl = list.querySelector('[data-drop-end]');
        if (endEl) {
            drag.drop = { type: 'end' };
            drag.dropEl = endEl;
            endEl.classList.add('rtpv3-drop-before');
        }
    }

    function endDrag(commit) {
        if (!drag) {
            return;
        }
        const finished = drag;
        drag = null;
        if (finished.timer) {
            clearTimeout(finished.timer);
        }
        if (finished.raf) {
            cancelAnimationFrame(finished.raf);
        }
        if (finished.dropEl) {
            finished.dropEl.classList.remove('rtpv3-drop-before', 'rtpv3-drop-after', 'rtpv3-drop-into');
        }
        finished.ghost?.remove();
        finished.card.classList.remove('rtpv3-dragging');
        rootEl?.classList.remove('rtpv3-is-dragging');
        document.removeEventListener('pointermove', onDragPointerMove, true);
        document.removeEventListener('pointerup', onDragPointerUp, true);
        document.removeEventListener('pointercancel', onDragPointerCancel, true);
        document.removeEventListener('touchmove', onDragTouchMove, { capture: true });

        if (!finished.active) {
            return;
        }
        // 끌기를 끝낸 손을 떼면서 생기는 클릭이 카드를 여는 일을 막는다.
        suppressNextClick = true;
        setTimeout(() => {
            suppressNextClick = false;
        }, 0);
        if (!commit || !finished.drop) {
            return;
        }
        const before = normalizePluginState(getState());
        const next = applyPresetDrop(before, finished.id, finished.drop);
        if (JSON.stringify(next.presets.map((p) => [p.id, p.groupId])) === JSON.stringify(before.presets.map((p) => [p.id, p.groupId]))
            && next.groups.length === before.groups.length) {
            return;
        }
        let message = '';
        const created = next.groups.find((g) => !before.groups.some((b) => b.id === g.id));
        const removed = before.groups.find((b) => !next.groups.some((g) => g.id === b.id));
        if (created) {
            message = `"${created.name}" 그룹을 만들었습니다.`;
        } else if (removed) {
            message = `"${removed.name}" 그룹에 하나만 남아 그룹을 풀었습니다.`;
        }
        updateStateAndSave(next, message);
    }

    function cancelDrag() {
        if (drag) {
            endDrag(false);
            return true;
        }
        return false;
    }

    // ───────────────────────── 편집 패널 ─────────────────────────

    function createEditorPanel(state) {
        const panel = el('section', { className: 'rtpv3-panel rtpv3-panel-editor' });
        const head = el('div', { className: 'rtpv3-panel-head' });

        const canSave = uiState.hasUnsavedDraft || uiState.draftIsNew;
        const isActive = !uiState.draftIsNew && state.appliedPresetIds.includes(uiState.draftPreset.id);

        const toolbar = el('div', { className: 'rtpv3-toolbar' }, [
            el('button', {
                className: 'accent',
                text: '+ 새 프리셋',
                help: 'tb.new',
                onClick: () => handleCreateNewPreset(),
            }),
            el('button', {
                className: `rtpv3-save-btn${canSave ? ' dirty' : ''}`,
                text: saveButtonLabel(canSave),
                help: 'tb.save',
                disabled: !canSave,
                dataset: { role: 'save-btn' },
                onClick: () => handleSaveDraftClick(),
            }),
            el('button', {
                className: 'ghost danger-text',
                text: isDraftBuiltin() ? '숨기기' : '삭제',
                help: isDraftBuiltin() ? 'tb.hide' : 'tb.delete',
                onClick: () =>
                    openModal({ type: 'confirm-delete', preset: uiState.draftPreset, isNew: uiState.draftIsNew, isBuiltin: isDraftBuiltin() }),
            }),
            el('div', { className: 'rtpv3-spacer' }),
            el('div', { className: 'rtpv3-toolbar-end' }, [
                isActive
                    ? el('button', {
                          className: 'ghost',
                          text: '적용 해제',
                          help: 'tb.deactivate',
                          onClick: () => handleDeactivatePreset(uiState.draftPreset.id),
                      })
                    : null,
                el('button', {
                    className: 'primary',
                    text: getApplyButtonLabel(state, uiState.draftPreset),
                    help: 'tb.apply',
                    onClick: () => handleActivatePreset(uiState.draftPreset),
                }),
                createMoreMenu(),
            ].filter(Boolean)),
        ]);
        head.appendChild(toolbar);

        const tabs = el('div', { className: 'rtpv3-tabs', role: 'tablist' });
        const tabBtn = (key, label) =>
            el('button', {
                className: uiState.activeTab === key ? 'active' : '',
                help: key === 'editor' ? 'tab.editor' : 'tab.regex',
                role: 'tab',
                'aria-selected': uiState.activeTab === key ? 'true' : 'false',
                text: label,
                onClick: () => {
                    if (uiState.activeTab !== key) {
                        uiState.activeTab = key;
                        render();
                    }
                },
            });
        const ruleCount = uiState.draftPreset.regexRules.length;
        tabs.append(tabBtn('editor', 'HTML · CSS'), tabBtn('regex', ruleCount ? `정규식 (${ruleCount})` : '정규식'));
        head.appendChild(tabs);
        panel.appendChild(head);

        const body = el('div', {
            className: `rtpv3-panel-body${uiState.activeTab === 'editor' ? ' rtpv3-editor-body' : ''}`,
            dataset: { scrollKey: `center-${uiState.activeTab}` },
        });
        if (uiState.activeTab === 'editor') {
            renderEditorTab(body);
        } else {
            renderRegexTab(body);
        }
        panel.appendChild(body);

        fileInputEl = el('input', {
            type: 'file',
            accept: '.json,application/json',
            multiple: true,
            style: { display: 'none' },
        });
        fileInputEl.addEventListener('change', async (e) => {
            await handleImportFiles(e.target.files);
            e.target.value = '';
        });
        panel.appendChild(fileInputEl);
        return panel;
    }

    function codeField({ key, label, hint, value, placeholder, onInput, helpKey }) {
        const textarea = el('textarea', {
            className: 'code-editor',
            spellcheck: false,
            value,
            placeholder,
            dataset: { focusKey: key, scrollKey: `ta-${key}` },
        });
        textarea.setAttribute('autocapitalize', 'off');
        textarea.setAttribute('autocomplete', 'off');
        attachCodeEditorKeys(textarea);
        textarea.addEventListener('input', (e) => onInput(e.target.value));

        const labelRow = el('label', { className: 'rtpv3-field-label' }, [
            el('span', { help: helpKey }, [label, hint ? el('span', { className: 'rtpv3-field-hint', text: ` — ${hint}` }) : null]),
            el('button', {
                className: 'small',
                text: '복사',
                type: 'button',
                help: 'ed.copy',
                onClick: (e) => {
                    e.preventDefault();
                    copyWithFallback(label, textarea.value);
                },
            }),
        ]);
        return el('div', { className: 'rtpv3-field rtpv3-code-field', helpArea: helpKey }, [labelRow, textarea]);
    }

    function renderEditorTab(body) {
        if (isDraftBuiltin()) {
            body.appendChild(
                el('div', {
                    className: 'rtpv3-builtin-note',
                    help: 'ed.builtin-note',
                    text: '기본 제공 프리셋입니다. 고쳐서 저장하면 원본은 그대로 두고 "내 프리셋"에 복사본이 생깁니다.',
                }),
            );
        }
        const nameInput = el('input', {
            type: 'text',
            value: uiState.draftPreset.name,
            placeholder: '프리셋 이름',
            dataset: { focusKey: 'name' },
            onInput: (e) => {
                uiState.draftPreset.name = e.target.value;
                markDirty();
                const cardName = rootEl?.querySelector('.rtpv3-preset-card.selected .rtpv3-preset-name');
                if (cardName) {
                    cardName.textContent = e.target.value || '이름 없는 프리셋';
                }
            },
        });
        const memoInput = el('textarea', {
            className: 'rtpv3-memo',
            rows: 2,
            value: uiState.draftPreset.description,
            placeholder: '메모 (나만 보는 설명. 목록에는 첫 줄만 보입니다)',
            dataset: { focusKey: 'memo' },
            onInput: (e) => {
                uiState.draftPreset.description = e.target.value;
                markDirty();
            },
        });
        body.appendChild(
            el('div', { className: 'rtpv3-meta-grid' }, [
                el('div', { className: 'rtpv3-field', helpArea: 'ed.name' }, [
                    el('label', { className: 'rtpv3-field-label', text: '이름', help: 'ed.name' }),
                    nameInput,
                ]),
                el('div', { className: 'rtpv3-field', helpArea: 'ed.memo' }, [
                    el('label', { className: 'rtpv3-field-label', text: '메모', help: 'ed.memo' }),
                    memoInput,
                ]),
            ]),
        );

        body.appendChild(el('div', { className: 'rtpv3-validation-box', help: 'ed.validation', dataset: { role: 'validation-box' } }));

        body.appendChild(
            codeField({
                key: 'html',
                helpKey: 'ed.html',
                label: 'Custom HTML',
                hint: '비워 두면 CSS·정규식만 있는 프리셋이 됩니다 (<risutextbox> 등 슬롯은 닫는 태그까지)',
                value: uiState.draftPreset.guiHTML,
                placeholder: [
                    'Custom HTML을 붙여넣거나 작성합니다.',
                    '',
                    '예)',
                    '<div class="mytheme-card">',
                    '  <div class="mytheme-head"><risuicon></risuicon><strong>{{char}}</strong></div>',
                    '  <risutextbox></risutextbox>',
                    '  <risubuttons></risubuttons>',
                    '</div>',
                ].join('\n'),
                onInput: (value) => {
                    uiState.draftPreset.guiHTML = value;
                    markDirty();
                    schedulePreviewRefresh();
                },
            }),
        );
        body.appendChild(
            codeField({
                key: 'css',
                helpKey: 'ed.css',
                label: 'Custom CSS',
                value: uiState.draftPreset.customCSS,
                placeholder: [
                    'Custom CSS를 붙여넣거나 작성합니다.',
                    '',
                    '예)',
                    '.mytheme-card { padding: 14px; border-radius: 12px; }',
                ].join('\n'),
                onInput: (value) => {
                    uiState.draftPreset.customCSS = value;
                    markDirty();
                    schedulePreviewRefresh();
                },
            }),
        );
    }

    function renderRegexTab(body) {
        // 1. 런타임 디스플레이 정규식 규칙
        const rulesBox = el('div', { className: 'rtpv3-section-box', helpArea: 'rx.rules' });
        const ruleCount = uiState.draftPreset.regexRules.length;
        rulesBox.appendChild(
            el('div', { className: 'rtpv3-row rtpv3-wrap' }, [
                el('div', { className: 'rtpv3-section-title', text: `디스플레이 정규식 규칙 (${ruleCount})`, help: 'rx.rules' }),
                el('div', { className: 'rtpv3-spacer' }),
                el('button', {
                    className: 'small',
                    text: 'Risu 정규식 붙여넣기',
                    help: 'rx.paste',
                    onClick: () => openModal({ type: 'paste-import', text: '', replace: false }),
                }),
                el('button', {
                    className: 'small',
                    text: 'Risu 정규식 복사',
                    help: 'rx.copy',
                    disabled: ruleCount === 0,
                    onClick: () => copyWithFallback('Risu 정규식 JSON', exportRisuRegexJson(uiState.draftPreset.regexRules)),
                }),
                el('button', {
                    className: 'accent small',
                    text: '+ 규칙 추가',
                    help: 'rx.add',
                    onClick: () => {
                        uiState.draftPreset.regexRules.push({
                            id: createRegexRuleId(),
                            comment: `새 규칙 ${uiState.draftPreset.regexRules.length + 1}`,
                            in: '',
                            out: '$&',
                            type: 'editdisplay',
                            flag: 'g',
                            ableFlag: true,
                            enabled: true,
                        });
                        uiState.hasUnsavedDraft = true;
                        render();
                    },
                }),
            ]),
        );
        rulesBox.appendChild(
            el('div', {
                className: 'rtpv3-section-desc',
                text: 'RisuAI에 적용된 프리셋의 규칙이 채팅 표시에 쓰입니다. 플러그인을 지우면 함께 꺼집니다.',
            }),
        );

        const hostCheck = el('input', {
            type: 'checkbox',
            checked: uiState.hostDisplayRegexEnabled,
            onChange: (e) => toggleHostDisplayRegexArg(e.target.checked),
        });
        rulesBox.appendChild(
            el('label', { className: 'rtpv3-check-row', help: 'rx.host-toggle' }, [hostCheck, el('span', { text: '적용 중인 프리셋의 규칙을 RisuAI 채팅에 씁니다' })]),
        );

        if (ruleCount === 0) {
            rulesBox.appendChild(el('div', { className: 'rtpv3-empty', text: '규칙이 없습니다.' }));
        }

        uiState.draftPreset.regexRules.forEach((rule, idx) => {
            const rules = uiState.draftPreset.regexRules;
            const card = el('div', { className: `rtpv3-rule-card${rule.enabled === false ? ' disabled' : ''}` });

            const enabledChk = el('input', {
                type: 'checkbox',
                checked: rule.enabled !== false,
                help: 'rx.rule-enable',
                onChange: (e) => {
                    rule.enabled = e.target.checked;
                    card.classList.toggle('disabled', !e.target.checked);
                    markDirty();
                    schedulePreviewRefresh();
                },
            });
            const commentIn = el('input', {
                type: 'text',
                placeholder: '규칙 이름',
                value: rule.comment,
                help: 'rx.rule-name',
                onInput: (e) => {
                    rule.comment = e.target.value;
                    markDirty();
                },
            });
            const flagIn = el('input', {
                type: 'text',
                placeholder: '플래그',
                help: 'rx.rule-flag',
                value: rule.flag,
                style: { width: '64px', flexShrink: '0' },
                onInput: (e) => {
                    rule.flag = e.target.value;
                    markDirty();
                    schedulePreviewRefresh();
                },
            });
            const move = (delta) => {
                const target = idx + delta;
                if (target < 0 || target >= rules.length) {
                    return;
                }
                [rules[idx], rules[target]] = [rules[target], rules[idx]];
                uiState.hasUnsavedDraft = true;
                render();
            };
            const upBtn = el('button', { className: 'small ghost', text: '↑', help: 'rx.rule-move', disabled: idx === 0, onClick: () => move(-1) });
            const downBtn = el('button', {
                className: 'small ghost',
                text: '↓',
                help: 'rx.rule-move',
                disabled: idx === rules.length - 1,
                onClick: () => move(1),
            });
            const removeBtn = el('button', {
                className: 'small ghost danger-text',
                text: '삭제',
                help: 'rx.rule-delete',
                onClick: () => {
                    rules.splice(idx, 1);
                    uiState.hasUnsavedDraft = true;
                    render();
                },
            });

            const inArea = el('textarea', {
                className: 'code-editor',
                rows: 2,
                placeholder: 'IN (찾을 정규식)',
                value: rule.in,
                helpArea: 'rx.rule-in',
                onInput: (e) => {
                    rule.in = e.target.value;
                    markDirty();
                    schedulePreviewRefresh();
                },
            });
            const outArea = el('textarea', {
                className: 'code-editor',
                rows: 2,
                placeholder: 'OUT (바꿀 내용. {{data}}, $1, $& 사용 가능)',
                value: rule.out,
                helpArea: 'rx.rule-out',
                onInput: (e) => {
                    rule.out = e.target.value;
                    markDirty();
                    schedulePreviewRefresh();
                },
            });
            attachCodeEditorKeys(outArea);

            card.append(el('div', { className: 'rtpv3-row' }, [enabledChk, commentIn, flagIn, upBtn, downBtn, removeBtn]), inArea, outArea);
            rulesBox.appendChild(card);
        });
        body.appendChild(rulesBox);

        // 2. 일괄 변환
        const txBox = el('div', { className: 'rtpv3-section-box', helpArea: 'rx.bulk' }, [
            el('div', { className: 'rtpv3-section-title', text: 'HTML·CSS 일괄 변환', help: 'rx.bulk' }),
            el('div', { className: 'rtpv3-section-desc', text: '편집 중인 HTML·CSS를 바꿉니다. 저장해야 확정됩니다.' }),
            el('div', { className: 'rtpv3-row rtpv3-wrap' }, [
                el('button', {
                    text: '{{#if}} → {{#when}}',
                    help: 'rx.legacy-when',
                    onClick: () => applyOneClickTransform('legacy-cbs-to-when'),
                }),
                el('button', {
                    text: '자기닫힘 슬롯 고치기',
                    help: 'rx.fix-selfclose',
                    onClick: () => applyOneClickTransform('fix-self-closing-slots'),
                }),
            ]),
        ]);

        const oldPrefixIn = el('input', {
            type: 'text',
            placeholder: '기존 접두사 (예: rtbase-)',
            value: uiState.renameOldPrefix,
            onInput: (e) => {
                uiState.renameOldPrefix = e.target.value;
            },
        });
        const newPrefixIn = el('input', {
            type: 'text',
            placeholder: '새 접두사 (예: mytheme-)',
            value: uiState.renameNewPrefix,
            onInput: (e) => {
                uiState.renameNewPrefix = e.target.value;
            },
        });
        txBox.appendChild(
            el('div', { className: 'rtpv3-row', helpArea: 'rx.prefix' }, [
                oldPrefixIn,
                el('span', { className: 'rtpv3-muted', text: '→' }),
                newPrefixIn,
                el('button', {
                    text: '접두사 바꾸기',
                    help: 'rx.prefix',
                    onClick: () =>
                        applyOneClickTransform('rename-prefix', {
                            fromPrefix: uiState.renameOldPrefix,
                            toPrefix: uiState.renameNewPrefix,
                        }),
                }),
            ]),
        );

        const targetSelect = el('select', { style: { width: '110px', flexShrink: '0' } });
        targetSelect.innerHTML =
            '<option value="guiHTML">HTML만</option><option value="customCSS">CSS만</option><option value="both">HTML+CSS</option>';
        targetSelect.value = uiState.customTarget;
        targetSelect.addEventListener('change', (e) => {
            uiState.customTarget = e.target.value;
        });
        const patInput = el('input', {
            type: 'text',
            placeholder: '찾을 정규식',
            value: uiState.customPattern,
            onInput: (e) => {
                uiState.customPattern = e.target.value;
            },
        });
        const flagInput = el('input', {
            type: 'text',
            placeholder: '플래그',
            value: uiState.customFlags,
            style: { width: '64px', flexShrink: '0' },
            onInput: (e) => {
                uiState.customFlags = e.target.value;
            },
        });
        const repInput = el('input', {
            type: 'text',
            placeholder: '바꿀 내용 ($1 등 사용 가능)',
            value: uiState.customReplacement,
            onInput: (e) => {
                uiState.customReplacement = e.target.value;
            },
        });
        txBox.append(
            el('div', { className: 'rtpv3-row', helpArea: 'rx.custom' }, [targetSelect, patInput, flagInput]),
            el('div', { className: 'rtpv3-row', helpArea: 'rx.custom' }, [
                repInput,
                el('button', {
                    className: 'accent',
                    text: '실행',
                    help: 'rx.custom',
                    onClick: () =>
                        applyOneClickTransform('custom-regex', {
                            target: uiState.customTarget,
                            pattern: uiState.customPattern,
                            flags: uiState.customFlags,
                            replacement: uiState.customReplacement,
                        }),
                }),
            ]),
        );
        body.appendChild(txBox);

        // 3. OUT 템플릿 변환
        const outArea = el('textarea', {
            className: 'code-editor',
            rows: 5,
            placeholder: '예: <style>.box{...}</style><div class="box">{{data}}</div>\n$& 또는 $1이 들어간 OUT 템플릿도 됩니다.',
            value: uiState.regexOutInput,
            onInput: (e) => {
                uiState.regexOutInput = e.target.value;
            },
        });
        attachCodeEditorKeys(outArea);
        body.appendChild(
            el('div', { className: 'rtpv3-section-box', helpArea: 'rx.outconv' }, [
                el('div', { className: 'rtpv3-section-title', text: 'Risu Regex OUT 템플릿을 HTML·CSS로', help: 'rx.outconv' }),
                el('div', {
                    className: 'rtpv3-section-desc',
                    text: '정규식 OUT으로 만든 테마를 Custom HTML로 옮깁니다. HTML은 덮어쓰고, <style> 안의 CSS는 기존 CSS 뒤에 붙입니다.',
                }),
                outArea,
                el('div', { className: 'rtpv3-row' }, [
                    el('button', {
                        className: 'accent',
                        text: '변환해서 넣기',
                        help: 'rx.outconv',
                        onClick: () => {
                            const converted = convertRegexOutToCustomHtml(uiState.regexOutInput);
                            if (!converted.guiHTML && !converted.extractedCSS) {
                                showToast('변환할 OUT 템플릿을 먼저 넣어 주세요.', true);
                                return;
                            }
                            uiState.draftPreset.guiHTML = converted.guiHTML;
                            if (converted.extractedCSS) {
                                uiState.draftPreset.customCSS = uiState.draftPreset.customCSS
                                    ? `${uiState.draftPreset.customCSS}\n\n${converted.extractedCSS}`
                                    : converted.extractedCSS;
                            }
                            uiState.hasUnsavedDraft = true;
                            const warnNote = converted.warnings.length ? `\n참고: ${converted.warnings.join(', ')}` : '';
                            showToast(`HTML·CSS에 넣었습니다. 저장해야 확정됩니다.${warnNote}`);
                            render();
                        },
                    }),
                ]),
            ]),
        );
    }

    // ───────────────────────── 미리보기 패널 ─────────────────────────

    function segment(options, current, onPick, label, helpKey) {
        const wrap = el('div', { className: 'rtpv3-segment', role: 'group', 'aria-label': label, help: helpKey });
        for (const [value, text] of options) {
            wrap.appendChild(
                el('button', {
                    className: value === current ? 'active' : '',
                    text,
                    'aria-pressed': value === current ? 'true' : 'false',
                    onClick: () => {
                        for (const b of wrap.children) {
                            b.classList.remove('active');
                            b.setAttribute('aria-pressed', 'false');
                        }
                        const picked = wrap.children[options.findIndex(([v]) => v === value)];
                        picked.classList.add('active');
                        picked.setAttribute('aria-pressed', 'true');
                        onPick(value);
                    },
                }),
            );
        }
        return wrap;
    }

    function createPreviewPanel(state = normalizePluginState(getState())) {
        const panel = el('section', { className: 'rtpv3-panel rtpv3-panel-preview' });
        const isActive = !uiState.draftIsNew && Boolean(uiState.draftPreset) && state.appliedPresetIds.includes(uiState.draftPreset.id);

        const head = el('div', { className: 'rtpv3-panel-head' });
        head.appendChild(
            el('div', { className: 'rtpv3-panel-title' }, [
                el('div', { className: 'rtpv3-row' }, [
                    el('span', { text: '미리보기' }),
                    el('span', {
                        className: 'rtpv3-badge',
                        text: '기본 화면 근사치',
                        help: 'pv.approx',
                        dataset: { role: 'preview-approx-badge' },
                        style: { display: 'none' },
                    }),
                ]),
                el('div', { className: 'rtpv3-row' }, [
                    el('span', { className: 'rtpv3-muted', text: '실시간 반영' }),
                    isActive
                        ? el('button', {
                              className: 'ghost small rtpv3-pv-apply-btn',
                              text: '해제',
                              help: 'tb.deactivate',
                              onClick: () => handleDeactivatePreset(uiState.draftPreset.id),
                          })
                        : null,
                    el('button', {
                        className: 'primary small rtpv3-pv-apply-btn',
                        text: getApplyButtonLabel(state, uiState.draftPreset),
                        help: 'pv.apply',
                        onClick: () => handleActivatePreset(uiState.draftPreset),
                    }),
                ].filter(Boolean)),
            ]),
        );
        head.appendChild(
            el('div', { className: 'rtpv3-preview-controls' }, [
                segment(
                    [
                        ['100%', '전체'],
                        ['520px', '창'],
                        ['390px', '모바일'],
                    ],
                    uiState.previewWidth,
                    (v) => {
                        uiState.previewWidth = v;
                        updatePreviewFrame();
                    },
                    '미리보기 너비',
                    'pv.width',
                ),
                el('button', {
                    className: 'ghost rtpv3-pvwide-btn',
                    text: uiState.previewWide ? '원래대로' : '크게 보기',
                    'aria-pressed': uiState.previewWide ? 'true' : 'false',
                    help: 'pv.wide',
                    dataset: { role: 'pvwide-toggle' },
                    onClick: () => setPreviewWide(!uiState.previewWide),
                }),
                segment(
                    [
                        ['dark', '다크'],
                        ['light', '라이트'],
                    ],
                    uiState.previewPalette,
                    (v) => {
                        uiState.previewPalette = v;
                        updatePreviewFrame();
                    },
                    '앱 배색',
                    'pv.palette',
                ),
                segment(
                    [
                        ['sky', '노을'],
                        ['solid', '단색'],
                    ],
                    uiState.previewBackdrop,
                    (v) => {
                        uiState.previewBackdrop = v;
                        updatePreviewFrame();
                    },
                    '배경 화면',
                    'pv.backdrop',
                ),
                segment(
                    [
                        ['all', '모두'],
                        ['char', '캐릭터'],
                        ['user', '사용자'],
                        ['edit', '편집 중'],
                    ],
                    uiState.previewRoleFilter,
                    (v) => {
                        uiState.previewRoleFilter = v;
                        updatePreviewFrame();
                    },
                    '보일 메시지',
                    'pv.role',
                ),
            ]),
        );
        panel.appendChild(head);

        const body = el('div', { className: 'rtpv3-panel-body', dataset: { scrollKey: 'preview' } });

        const details = el('details', { className: 'rtpv3-details' });
        details.open = uiState.previewSettingsOpen;
        details.addEventListener('toggle', () => {
            uiState.previewSettingsOpen = details.open;
        });
        details.appendChild(el('summary', { text: '샘플 설정', help: 'pv.sample' }));

        const charIn = el('input', {
            type: 'text',
            value: uiState.previewCharName,
            onInput: (e) => {
                uiState.previewCharName = e.target.value || '세라';
                schedulePreviewRefresh();
            },
        });
        const userIn = el('input', {
            type: 'text',
            value: uiState.previewUserName,
            onInput: (e) => {
                uiState.previewUserName = e.target.value || '사용자';
                schedulePreviewRefresh();
            },
        });
        const fontIn = el('input', {
            type: 'number',
            min: '10',
            max: '28',
            value: String(uiState.previewFontSize),
            onInput: (e) => {
                const num = Number(e.target.value);
                if (Number.isFinite(num) && num >= 10 && num <= 28) {
                    uiState.previewFontSize = num;
                    schedulePreviewRefresh();
                }
            },
        });
        const regexChk = el('input', {
            type: 'checkbox',
            checked: uiState.previewApplyRegex,
            onChange: (e) => {
                uiState.previewApplyRegex = e.target.checked;
                updatePreviewFrame();
            },
        });
        const sampleInput = el('textarea', {
            rows: 3,
            placeholder: '미리보기에 쓸 메시지 (비워 두면 기본 마크다운 샘플)',
            value: uiState.previewCustomText,
            onInput: (e) => {
                uiState.previewCustomText = e.target.value;
                schedulePreviewRefresh();
            },
        });
        details.appendChild(
            el('div', { className: 'rtpv3-details-body' }, [
                el('div', { className: 'rtpv3-sample-grid' }, [
                    el('label', { className: 'rtpv3-field', help: 'pv.names' }, [el('span', { className: 'rtpv3-field-label', text: '캐릭터 이름' }), charIn]),
                    el('label', { className: 'rtpv3-field', help: 'pv.names' }, [el('span', { className: 'rtpv3-field-label', text: '사용자 이름' }), userIn]),
                    el('label', { className: 'rtpv3-field', help: 'pv.fontsize' }, [el('span', { className: 'rtpv3-field-label', text: '글자 px' }), fontIn]),
                ]),
                el('label', { className: 'rtpv3-field', helpArea: 'pv.sample-text' }, [
                    el('span', { className: 'rtpv3-field-label', text: '샘플 메시지', help: 'pv.sample-text' }),
                    sampleInput,
                ]),
                el('label', { className: 'rtpv3-check-row', help: 'pv.apply-regex' }, [regexChk, el('span', { text: '적용될 디스플레이 정규식도 미리보기에 반영' })]),
            ]),
        );
        body.appendChild(details);

        const stage = el('div', { className: 'rtpv3-preview-stage', help: 'pv.frame' });
        const iframe = el('iframe', {
            className: 'rtpv3-preview-iframe',
            sandbox: 'allow-same-origin',
            title: '테마 미리보기',
            dataset: { role: 'preview-iframe' },
        });
        iframe.setAttribute('sandbox', 'allow-same-origin');
        stage.appendChild(iframe);
        body.appendChild(stage);

        panel.appendChild(body);
        return panel;
    }

    // ───────────────────────── 대화상자 ─────────────────────────

    function openModal(modal) {
        setMenuOpen(false);
        uiState.modal = modal;
        renderModalDom();
    }

    function closeModal() {
        uiState.modal = null;
        renderModalDom();
    }

    function modalShell(titleText, children, actions) {
        const modal = el('div', { className: 'rtpv3-modal', role: 'dialog', 'aria-modal': 'true' });
        modal.appendChild(el('h2', { className: 'rtpv3-modal-title', text: titleText }));
        for (const child of children) {
            if (child) {
                modal.appendChild(child);
            }
        }
        modal.appendChild(el('div', { className: 'rtpv3-modal-actions' }, actions));
        return modal;
    }

    function renderModalDom() {
        if (!rootEl) {
            return;
        }
        const existing = rootEl.querySelector('.rtpv3-modal-backdrop');
        if (existing) {
            existing.remove();
        }
        const m = uiState.modal;
        if (!m) {
            return;
        }

        let modal = null;
        let focusTarget = null;
        const cancelBtn = (label = '취소') => el('button', { text: label, onClick: closeModal });

        if (m.type === 'paste-import') {
            const area = el('textarea', {
                className: 'code-editor',
                rows: 12,
                placeholder: '프리셋 JSON, 전체 백업 JSON, Risu 정규식 JSON({"type":"regex",...}) 중 하나를 붙여넣습니다.',
                value: m.text || '',
            });
            const replaceChk = el('input', { type: 'checkbox', checked: Boolean(m.replace) });
            focusTarget = area;
            modal = modalShell(
                'JSON 붙여넣기',
                [
                    el('div', {
                        className: 'rtpv3-modal-desc',
                        text: '프리셋 JSON은 새 프리셋으로 추가하고, Risu 정규식 JSON은 지금 프리셋의 규칙 뒤에 붙입니다.',
                    }),
                    area,
                    el('label', { className: 'rtpv3-check-row' }, [
                        replaceChk,
                        el('span', { text: '기존 목록을 지우고 이 내용으로 바꾸기 (전체 백업을 되살릴 때)' }),
                    ]),
                ],
                [
                    cancelBtn(),
                    el('button', {
                        className: 'primary',
                        text: '가져오기',
                        onClick: async () => {
                            if (replaceChk.checked && needsDiscardConfirm()) {
                                openModal({
                                    type: 'confirm-discard',
                                    action: 'import-replace',
                                    rawText: area.value,
                                });
                                return;
                            }
                            try {
                                await importJsonText(area.value, { replace: replaceChk.checked });
                                closeModal();
                            } catch (err) {
                                showToast(errorText(err), true);
                            }
                        },
                    }),
                ],
            );
        } else if (m.type === 'unhide') {
            const st = normalizePluginState(getState());
            const hidden = getBuiltinPresets().filter((p) => st.hiddenBuiltinIds.includes(p.id));
            const rows = hidden.map((p) =>
                el('button', {
                    onClick: () => {
                        closeModal();
                        updateStateAndSave(unhideBuiltins(getState(), [p.id]), `"${p.name}"을(를) 다시 보이게 했습니다.`);
                    },
                }, [el('div', { text: p.name }), p.groupName ? el('div', { className: 'rtpv3-muted', text: p.groupName }) : null]),
            );
            modal = modalShell(
                '숨긴 기본 프리셋',
                [
                    el('div', { className: 'rtpv3-modal-desc', text: '다시 보이게 할 프리셋을 고릅니다.' }),
                    rows.length ? el('div', { className: 'rtpv3-pick-list' }, rows) : el('div', { className: 'rtpv3-empty', text: '숨긴 기본 프리셋이 없습니다.' }),
                ],
                [
                    cancelBtn('닫기'),
                    rows.length
                        ? el('button', {
                              className: 'primary',
                              text: '모두 다시 보기',
                              onClick: () => {
                                  closeModal();
                                  updateStateAndSave(unhideBuiltins(getState()), `숨긴 기본 프리셋 ${rows.length}개를 다시 보이게 했습니다.`);
                              },
                          })
                        : null,
                ].filter(Boolean),
            );
        } else if (m.type === 'move-group') {
            const st = normalizePluginState(getState());
            const current = st.presets.find((p) => p.id === uiState.draftPreset?.id);
            const pick = (label, sub, onPick) =>
                el('button', { onClick: () => { closeModal(); onPick(); } }, [
                    el('div', { text: label }),
                    sub ? el('div', { className: 'rtpv3-muted', text: sub }) : null,
                ]);
            const groupButtons = st.groups
                .filter((g) => !current || g.id !== current.groupId)
                .map((g) =>
                    pick(g.name, `프리셋 ${st.presets.filter((p) => p.groupId === g.id).length}개`, () =>
                        updateStateAndSave(
                            applyPresetDrop(st, current.id, { type: 'into-group', groupId: g.id }),
                            `"${g.name}" 그룹에 넣었습니다.`,
                        ),
                    ),
                );
            const presetButtons = st.presets
                .filter((p) => current && p.id !== current.id && !p.groupId)
                .map((p) =>
                    pick(p.name, '이 프리셋과 묶어 새 그룹을 만듭니다', () => {
                        const next = applyPresetDrop(st, current.id, { type: 'into-preset', targetId: p.id });
                        const created = next.groups.find((g) => !st.groups.some((b) => b.id === g.id));
                        updateStateAndSave(next, created ? `"${created.name}" 그룹을 만들었습니다.` : '');
                    }),
                );
            modal = modalShell(
                '그룹으로 옮기기',
                [
                    el('div', {
                        className: 'rtpv3-modal-desc',
                        text: '목록에서 프리셋을 끌어 다른 프리셋 가운데에 놓아도 묶을 수 있습니다. 휴대폰에서는 길게 누른 뒤 끕니다.',
                    }),
                    groupButtons.length ? el('div', { className: 'rtpv3-section-title', text: '그룹' }) : null,
                    groupButtons.length ? el('div', { className: 'rtpv3-pick-list' }, groupButtons) : null,
                    presetButtons.length ? el('div', { className: 'rtpv3-section-title', text: '그룹 없는 프리셋과 묶기' }) : null,
                    presetButtons.length ? el('div', { className: 'rtpv3-pick-list' }, presetButtons) : null,
                    !groupButtons.length && !presetButtons.length
                        ? el('div', { className: 'rtpv3-empty', text: '옮길 그룹이나 묶을 프리셋이 없습니다.' })
                        : null,
                ],
                [cancelBtn('닫기')],
            );
        } else if (m.type === 'copy-text') {
            const area = el('textarea', { className: 'code-editor', rows: 12, readOnly: true, value: m.content });
            focusTarget = area;
            modal = modalShell(
                m.title,
                [
                    el('div', {
                        className: 'rtpv3-modal-desc',
                        text: '클립보드에 바로 복사하지 못했습니다. 아래 내용을 전체 선택해서 복사해 주세요.',
                    }),
                    area,
                ],
                [
                    el('button', {
                        className: 'accent',
                        text: '다시 복사',
                        onClick: async () => {
                            area.focus();
                            area.select();
                            const ok = await copyTextToClipboard(m.content);
                            showToast(ok ? '클립보드에 복사했습니다.' : '복사하지 못했습니다. 선택된 내용을 직접 복사해 주세요.', !ok);
                        },
                    }),
                    cancelBtn('닫기'),
                ],
            );
            setTimeout(() => area.select(), 0);
        } else if (m.type === 'confirm-delete') {
            const name = m.preset?.name || '이름 없는 프리셋';
            const st = normalizePluginState(getState());
            const isApplied = !m.isNew && m.preset?.id && st.appliedPresetIds.includes(m.preset.id);
            const isLastApplied = isApplied && st.appliedPresetIds.length === 1;
            const deleteDesc = isApplied
                ? isLastApplied
                    ? '적용 중인 마지막 프리셋입니다. 삭제하면 RisuAI에서도 빠지고 원래 테마로 복원됩니다. 삭제한 프리셋은 되살릴 수 없습니다.'
                    : '적용 중인 프리셋입니다. 삭제하면 RisuAI에서도 빠지고 남은 프리셋으로 다시 적용됩니다. 삭제한 프리셋은 되살릴 수 없습니다.'
                : '삭제한 프리셋은 되살릴 수 없습니다. 필요하면 먼저 ⋯ 메뉴의 JSON 내보내기로 복사해 두세요.\nRisuAI에 이미 적용된 HTML·CSS는 그대로 남습니다.';
            const hideDesc = isApplied
                ? '기본 제공 프리셋은 지우지 않고 목록에서 숨깁니다. 지금 적용 중인 상태는 그대로 유지되며, 상단 적용 목록이나 ⋯ 메뉴의 "숨긴 기본 프리셋 다시 보기"에서 관리할 수 있습니다.'
                : '기본 제공 프리셋은 지우지 않고 목록에서 숨깁니다. ⋯ 메뉴의 "숨긴 기본 프리셋 다시 보기"로 되살릴 수 있습니다.';
            const confirmBtn = el('button', {
                className: 'danger',
                text: m.isNew ? '버리기' : m.isBuiltin ? '숨기기' : '삭제',
                onClick: async () => {
                    closeModal();
                    await handleDeleteCurrent();
                },
            });
            focusTarget = confirmBtn;
            modal = modalShell(
                m.isNew ? '저장하지 않은 새 프리셋을 버릴까요?' : m.isBuiltin ? `"${name}"을(를) 숨길까요?` : `"${name}"을(를) 삭제할까요?`,
                [
                    el('div', {
                        className: 'rtpv3-modal-desc',
                        text: m.isNew
                            ? '아직 목록에 저장되지 않은 프리셋입니다.'
                            : m.isBuiltin
                            ? hideDesc
                            : deleteDesc,
                    }),
                ],
                [cancelBtn(), confirmBtn],
            );
        } else if (m.type === 'confirm-discard') {
            const proceed = async () => {
                if (m.action === 'new') {
                    handleCreateNewPreset({ force: true });
                } else if (m.action === 'capture') {
                    uiState.hasUnsavedDraft = false;
                    uiState.draftIsNew = false;
                    handleCaptureVanillaClick();
                } else if (m.action === 'close') {
                    uiState.draftPreset = null;
                    syncSelectedPreset();
                    render();
                    if (api && typeof api.hideContainer === 'function') {
                        await api.hideContainer();
                    }
                } else if (m.action === 'import-replace') {
                    try {
                        await importJsonText(m.rawText, { replace: true });
                    } catch (err) {
                        showToast(errorText(err), true);
                    }
                } else if (m.presetId) {
                    selectPreset(m.presetId, { force: true });
                }
            };
            const isClose = m.action === 'close';
            const isReplaceImport = m.action === 'import-replace';
            const saveBtn = isReplaceImport
                ? null
                : el('button', {
                      className: 'primary',
                      text: isClose ? '저장하고 닫기' : '저장하고 계속',
                      onClick: async () => {
                          closeModal();
                          try {
                              await saveDraftToState();
                              await proceed();
                          } catch (err) {
                              showToast(`저장 실패: ${errorText(err)}`, true);
                          }
                      },
                  });
            const discardBtn = el('button', {
                className: 'danger',
                text: isClose ? '버리고 닫기' : isReplaceImport ? '버리고 덮어쓰기' : '버리고 계속',
                onClick: async () => {
                    closeModal();
                    uiState.hasUnsavedDraft = false;
                    uiState.draftIsNew = false;
                    await proceed();
                },
            });
            focusTarget = saveBtn || discardBtn;
            modal = modalShell(
                '저장하지 않은 변경이 있습니다',
                [
                    el('div', {
                        className: 'rtpv3-modal-desc',
                        text: isReplaceImport
                            ? `"${uiState.draftPreset?.name || '이름 없는 프리셋'}"에 저장하지 않은 변경이 있습니다. 기존 목록을 덮어쓰며 가져오면 사라집니다.`
                            : isClose
                            ? `"${uiState.draftPreset?.name || '이름 없는 프리셋'}"에 저장하지 않은 변경이 있습니다. 저장하지 않고 닫으면 편집 내용이 초기화됩니다.`
                            : `"${uiState.draftPreset?.name || '이름 없는 프리셋'}"의 변경을 저장하지 않고 넘어가면 사라집니다.`,
                    }),
                ],
                [cancelBtn('계속 편집'), discardBtn, saveBtn].filter(Boolean),
            );
        } else if (m.type === 'confirm-restore') {
            const okBtn = el('button', {
                className: 'danger',
                text: '복원',
                onClick: async () => {
                    closeModal();
                    await handleRestoreVanillaClick();
                },
            });
            focusTarget = okBtn;
            modal = modalShell(
                '원래 테마로 복원할까요?',
                [
                    el('div', {
                        className: 'rtpv3-modal-desc',
                        text: '이 플러그인으로 처음 적용하기 직전의 RisuAI 테마(theme, Custom HTML, Custom CSS)로 되돌립니다. 프리셋 목록은 그대로 남습니다.',
                    }),
                ],
                [cancelBtn(), okBtn],
            );
        } else if (m.type === 'confirm-force-activate') {
            modal = modalShell(
                '검증 오류가 있습니다. 그래도 적용할까요?',
                [el('div', { className: 'rtpv3-modal-desc error', text: m.message })],
                [
                    (focusTarget = cancelBtn('돌아가서 고치기')),
                    el('button', {
                        className: 'danger',
                        text: '그래도 적용',
                        onClick: async () => {
                            closeModal();
                            await handleActivatePreset(m.preset, { force: true });
                        },
                    }),
                ],
            );
        }

        if (!modal) {
            return;
        }
        const backdrop = el('div', { className: 'rtpv3-modal-backdrop' }, [modal]);
        backdrop.addEventListener('mousedown', (e) => {
            if (e.target === backdrop) {
                closeModal();
            }
        });
        rootEl.appendChild(backdrop);
        if (focusTarget) {
            setTimeout(() => focusTarget.focus(), 0);
        }
    }

    // ───────────────────────── 전체 그리기 ─────────────────────────

    function captureViewState() {
        rootEl.querySelectorAll('[data-scroll-key]').forEach((node) => {
            scrollMemory[node.dataset.scrollKey] = node.scrollTop;
        });
        let focus = null;
        const active = document.activeElement;
        if (active && rootEl.contains(active) && active.dataset && active.dataset.focusKey) {
            focus = {
                key: active.dataset.focusKey,
                start: typeof active.selectionStart === 'number' ? active.selectionStart : null,
                end: typeof active.selectionEnd === 'number' ? active.selectionEnd : null,
            };
        }
        return { focus };
    }

    function restoreViewState({ focus }) {
        rootEl.querySelectorAll('[data-scroll-key]').forEach((node) => {
            const top = scrollMemory[node.dataset.scrollKey];
            if (typeof top === 'number') {
                node.scrollTop = top;
            }
        });
        if (focus) {
            const target = rootEl.querySelector(`[data-focus-key="${focus.key}"]`);
            if (target) {
                target.focus({ preventScroll: true });
                if (focus.start !== null && typeof target.setSelectionRange === 'function') {
                    try {
                        target.setSelectionRange(focus.start, focus.end);
                    } catch {
                        // number 입력칸 등은 선택 범위를 지원하지 않는다.
                    }
                }
            }
        }
    }

    async function handleCloseRequest() {
        if (needsDiscardConfirm()) {
            openModal({
                type: 'confirm-discard',
                action: 'close',
                name: uiState.draftPreset?.name || '편집 중인 프리셋',
            });
            return;
        }
        if (api && typeof api.hideContainer === 'function') {
            await api.hideContainer();
        }
    }

    function createHeader(state) {
        const appliedCount = state.appliedPresetIds.length;
        const summary = formatAppliedSummary(state);
        let statusNode;
        if (appliedCount === 0) {
            statusNode = el('span', {
                className: 'rtpv3-badge rtpv3-header-badge',
                text: summary,
                help: 'header.status',
            });
        } else {
            const pop = el('div', {
                className: `rtpv3-applied-popover${uiState.appliedPopoverOpen ? ' open' : ''}`,
                dataset: { role: 'applied-popover' },
                onClick: (e) => e.stopPropagation(),
            });
            pop.append(
                el('div', { className: 'rtpv3-applied-pop-head' }, [
                    el('span', { text: state.stackPresets ? `적용 순서 (${appliedCount}개)` : '적용 중' }),
                ]),
                ...buildAppliedRows(state),
                appliedCount >= 2
                    ? el('div', { className: 'rtpv3-applied-pop-foot' }, [
                          el('button', {
                              className: 'small ghost danger-text',
                              text: '모두 해제 (원래 테마)',
                              onClick: () => {
                                  setAppliedPopoverOpen(false);
                                  openModal({ type: 'confirm-restore' });
                              },
                          }),
                      ])
                    : null,
            );
            const badgeBtn = el('button', {
                className: 'rtpv3-badge active rtpv3-header-badge',
                text: `${summary} ▾`,
                help: 'header.status',
                'aria-haspopup': 'true',
                'aria-expanded': uiState.appliedPopoverOpen ? 'true' : 'false',
                dataset: { role: 'applied-badge-btn' },
                onClick: (e) => {
                    e.stopPropagation();
                    setAppliedPopoverOpen(!uiState.appliedPopoverOpen);
                },
            });
            statusNode = el('div', { className: 'rtpv3-applied-wrap' }, [badgeBtn, pop]);
        }

        const header = el('header', { className: 'rtpv3-header' });
        header.appendChild(
            el('div', { className: 'rtpv3-title-wrap' }, [
                el('h1', { className: 'rtpv3-title', text: '테마 프리셋 관리자' }),
                statusNode,
            ]),
        );
        header.appendChild(
            el('div', { className: 'rtpv3-row' }, [
                el('button', {
                    className: `rtpv3-help-btn${uiState.helpMode ? ' on' : ''}`,
                    text: '?',
                    'aria-pressed': uiState.helpMode ? 'true' : 'false',
                    'aria-label': '도움말 모드',
                    title: HELP_COPY['help.toggle']?.short || '도움말 모드',
                    dataset: { role: 'help-toggle' },
                    onClick: () => setHelpMode(!uiState.helpMode),
                }),
                el('button', {
                    text: '닫기',
                    help: 'header.close',
                    onClick: () => handleCloseRequest(),
                }),
            ]),
        );
        return header;
    }

    function createMobileNav() {
        const nav = el('nav', { className: 'rtpv3-mobile-nav' });
        const views = [
            ['list', '목록'],
            ['editor', '편집'],
            ['preview', '미리보기'],
        ];
        for (const [key, label] of views) {
            nav.appendChild(
                el('button', {
                    className: uiState.mobileView === key ? 'accent' : 'ghost',
                    text: label,
                    help: `mnav.${key}`,
                    onClick: () => {
                        if (uiState.mobileView !== key) {
                            uiState.mobileView = key;
                            render();
                        }
                    },
                }),
            );
        }
        return nav;
    }

    function render() {
        if (!rootEl) {
            return;
        }
        const viewState = rootEl.childElementCount ? captureViewState() : { focus: null };
        syncSelectedPreset();
        const state = normalizePluginState(getState());
        if (!uiState.draftPreset) {
            syncSelectedPreset();
        }

        // 다른 프리셋을 열면 편집 영역의 스크롤은 맨 위에서 시작한다.
        const currentId = uiState.draftPreset ? uiState.draftPreset.id : null;
        if (currentId !== lastRenderedPresetId) {
            for (const key of Object.keys(scrollMemory)) {
                if (key.startsWith('ta-') || key.startsWith('center-')) {
                    delete scrollMemory[key];
                }
            }
            lastRenderedPresetId = currentId;
        }

        rootEl.innerHTML = '';
        rootEl.setAttribute('data-mview', uiState.mobileView);
        rootEl.setAttribute('data-pvwide', uiState.previewWide ? 'on' : 'off');
        rootEl.setAttribute('data-help-mode', uiState.helpMode ? 'on' : 'off');
        rootEl.appendChild(createHeader(state));
        rootEl.appendChild(
            el('div', { className: 'rtpv3-help-banner', role: 'note' }, [
                el('span', { text: HELP_COPY['help.banner']?.short || '' }),
            ]),
        );
        rootEl.appendChild(createMobileNav());

        const workspace = el('main', { className: 'rtpv3-workspace' }, [
            createListPanel(state),
            createEditorPanel(state),
            createPreviewPanel(state),
        ]);
        rootEl.appendChild(workspace);

        rootEl.appendChild(el('div', { className: 'rtpv3-toast', role: 'status', 'aria-live': 'polite', dataset: { role: 'toast' } }));

        updateToastDom();
        updateValidationDom();
        updatePreviewFrame();
        observePreviewStage();
        renderModalDom();
        restoreViewState(viewState);
    }

    function handleRootKeydown(e) {
        const mod = e.ctrlKey || e.metaKey;
        if (mod && !e.shiftKey && !e.altKey && (e.key === 's' || e.key === 'S')) {
            e.preventDefault();
            if (!uiState.modal) {
                handleSaveDraftClick();
            }
            return;
        }
        if (e.key === 'Escape') {
            if (cancelDrag()) {
                e.preventDefault();
            } else if (uiState.modal) {
                e.preventDefault();
                closeModal();
            } else if (hideHelpPopover()) {
                e.preventDefault();
            } else if (uiState.appliedPopoverOpen) {
                e.preventDefault();
                setAppliedPopoverOpen(false);
                rootEl?.querySelector('[data-role="applied-badge-btn"]')?.focus();
            } else if (uiState.menuOpen) {
                e.preventDefault();
                setMenuOpen(false);
                rootEl?.querySelector('[data-role="more-btn"]')?.focus();
            } else if (uiState.helpMode) {
                e.preventDefault();
                setHelpMode(false);
            }
        }
    }

    // ───────────────────────── 도움말 모드 ─────────────────────────

    // 화면 이동용 항목: 도움말 모드에서도 원래 동작을 한 뒤 설명을 띄운다.
    const HELP_NAV_KEYS = new Set(['mnav.list', 'mnav.editor', 'mnav.preview', 'tab.editor', 'tab.regex', 'tb.more', 'pv.sample']);

    function setHelpMode(on) {
        uiState.helpMode = on;
        hideHelpPopover();
        if (!rootEl) {
            return;
        }
        rootEl.setAttribute('data-help-mode', on ? 'on' : 'off');
        const btn = rootEl.querySelector('[data-role="help-toggle"]');
        if (btn) {
            btn.classList.toggle('on', on);
            btn.setAttribute('aria-pressed', on ? 'true' : 'false');
        }
    }

    function hideHelpPopover() {
        const pop = rootEl?.querySelector('.rtpv3-help-pop');
        if (pop) {
            pop.remove();
            return true;
        }
        return false;
    }

    function showHelpPopover(target, key) {
        hideHelpPopover();
        const copy = HELP_COPY[key];
        if (!copy || !rootEl) {
            return;
        }
        const pop = el('div', { className: 'rtpv3-help-pop', role: 'tooltip' }, [
            el('div', { className: 'rtpv3-help-pop-title', text: copy.short }),
            copy.long ? el('div', { text: copy.long }) : null,
        ]);
        pop.style.visibility = 'hidden';
        rootEl.appendChild(pop);

        const rootRect = rootEl.getBoundingClientRect();
        const rect = target.getBoundingClientRect();
        const popRect = pop.getBoundingClientRect();
        const margin = 8;
        let left = rect.left - rootRect.left;
        left = Math.max(margin, Math.min(left, rootRect.width - popRect.width - margin));
        let top = rect.bottom - rootRect.top + 6;
        if (top + popRect.height > rootRect.height - margin) {
            const above = rect.top - rootRect.top - popRect.height - 6;
            top = above >= margin ? above : Math.max(margin, rootRect.height - popRect.height - margin);
        }
        pop.style.left = `${left}px`;
        pop.style.top = `${top}px`;
        pop.style.visibility = 'visible';
    }

    function handleHelpCapture(e) {
        if (!uiState.helpMode || !rootEl) {
            return;
        }
        const target = e.target instanceof Element ? e.target : null;
        if (!target || target.closest('[data-role="help-toggle"]') || target.closest('.rtpv3-modal-backdrop')) {
            return;
        }
        if (target.closest('.rtpv3-help-pop')) {
            hideHelpPopover();
            return;
        }
        const helpEl = target.closest('[data-help]');
        if (!helpEl || !rootEl.contains(helpEl)) {
            hideHelpPopover();
            return;
        }
        const key = helpEl.dataset.help;
        if (HELP_NAV_KEYS.has(key)) {
            // 화면이 다시 그려질 수 있으므로, 이동한 뒤 같은 항목을 다시 찾아 그 옆에 띄운다.
            setTimeout(() => {
                const again = rootEl?.querySelector(`[data-help="${key}"]`);
                showHelpPopover(again && again.isConnected ? again : helpEl, key);
            }, 0);
            return;
        }
        e.preventDefault();
        e.stopPropagation();
        showHelpPopover(helpEl, key);
    }

    function handleDragClickGuard(e) {
        if (suppressNextClick) {
            suppressNextClick = false;
            e.preventDefault();
            e.stopPropagation();
        }
    }

    function handleRootClick() {
        if (uiState.menuOpen) {
            setMenuOpen(false);
        }
        if (uiState.appliedPopoverOpen) {
            setAppliedPopoverOpen(false);
        }
    }

    async function mount() {
        injectPluginStyles();
        await syncDisplayRegexArgFromHost();

        let container = document.getElementById(UI_ROOT_ID);
        if (!container) {
            container = document.createElement('div');
            container.id = UI_ROOT_ID;
            document.body.appendChild(container);
        }
        rootEl = container;
        rootEl.addEventListener('keydown', handleRootKeydown);
        rootEl.addEventListener('click', handleRootClick);
        rootEl.addEventListener('click', handleHelpCapture, true);
        rootEl.addEventListener('click', handleDragClickGuard, true);
        render();
    }

    function unmount() {
        cancelDrag();
        if (previewTimer) {
            clearTimeout(previewTimer);
            previewTimer = null;
        }
        if (toastTimer) {
            clearTimeout(toastTimer);
            toastTimer = null;
        }
        if (rootEl) {
            rootEl.removeEventListener('keydown', handleRootKeydown);
            rootEl.removeEventListener('click', handleRootClick);
            rootEl.removeEventListener('click', handleHelpCapture, true);
            rootEl.removeEventListener('click', handleDragClickGuard, true);
            rootEl.remove();
            rootEl = null;
        }
        if (previewResizeObserver) {
            previewResizeObserver.disconnect();
            previewResizeObserver = null;
        }
        fileInputEl = null;
        lastPreviewSrcdoc = null;
        const styleEl = document.getElementById(UI_STYLE_ID);
        if (styleEl) {
            styleEl.remove();
        }
    }

    return {
        mount,
        unmount,
        refresh: render,
        // 창이 숨겨진 채로 그려졌으면 미리보기 크기를 잡지 못한다. 창을 띄운 뒤에 다시 부른다.
        relayout: layoutPreviewFrame,
        getUiState: () => uiState,
    };
}

// === index.js ===
const SETTING_ICON_HTML = '<span>🎨</span>';

async function initRisuThemePresetPlugin(api = globalThis.risuai) {
    if (!api) {
        return null;
    }

    let pluginState = await loadPluginState(api);
    let regexHook = null;
    const getState = () => pluginState;
    const syncRegexHook = () => {
        if (regexHook) {
            regexHook.sync().catch((err) => {
                console.error('[risu_theme_preset_v3] 디스플레이 정규식 훅 동기화 실패:', err);
            });
        }
    };
    const setState = (nextState) => {
        pluginState = nextState;
        syncRegexHook();
    };

    let initialPalette = 'dark';
    if (typeof api.getArgument === 'function') {
        try {
            const pal = await api.getArgument('default_preview_palette');
            if (pal === 'light' || pal === 'dark') {
                initialPalette = pal;
            }
        } catch {
            initialPalette = 'dark';
        }
    }

    const ui = createPluginUI({
        getState,
        setState,
        bridge: {
            activatePreset,
            deactivatePreset,
            setStackPresets,
            syncAppliedStateToRisu,
            restoreVanilla,
            captureCurrentVanillaAsPreset,
            getVanillaState,
        },
        initialPalette,
        api,
        onDisplayRegexArgChanged: syncRegexHook,
    });

    let mounted = false;
    const openManager = async () => {
        try {
            // 다른 기기·탭에서 바뀐 내용을 반영한다. 읽기에 실패하면 메모리의 상태를 그대로 쓴다.
            setState(await loadPluginState(api));
        } catch (err) {
            console.error('[risu_theme_preset_v3] 상태 다시 읽기 실패:', err);
        }
        if (!mounted) {
            await ui.mount();
            mounted = true;
        } else {
            ui.refresh();
        }
        if (typeof api.showContainer === 'function') {
            await api.showContainer('fullscreen');
        }
        ui.relayout();
    };

    regexHook = await registerDisplayRegexHook(getState, api);
    const registeredPartIds = [];

    if (typeof api.registerSetting === 'function') {
        try {
            const settingHandle = await api.registerSetting(
                '테마 프리셋 & 미리보기 관리자',
                openManager,
                SETTING_ICON_HTML,
                'html',
                'risu_theme_preset_v3_setting',
            );
            if (settingHandle?.id) {
                registeredPartIds.push(settingHandle.id);
            }
        } catch {
            // Ignore registration errors if host omits UI permissions
        }
    }

    if (typeof api.registerButton === 'function') {
        try {
            const actionHandle = await api.registerButton(
                {
                    name: '테마 프리셋 & 미리보기',
                    icon: SETTING_ICON_HTML,
                    iconType: 'html',
                    location: 'action',
                    id: 'risu_theme_preset_v3_btn_action',
                },
                openManager,
            );
            if (actionHandle?.id) {
                registeredPartIds.push(actionHandle.id);
            }
        } catch {
            // Ignore registration errors if host omits button registration
        }
    }

    const dispose = async () => {
        await regexHook.dispose();
        if (typeof api.unregisterUIPart === 'function') {
            for (const partId of registeredPartIds) {
                try {
                    await api.unregisterUIPart(partId);
                } catch {
                    // Ignore already-unregistered parts
                }
            }
        }
        ui.unmount();
        mounted = false;
    };

    if (typeof api.onUnload === 'function') {
        await api.onUnload(dispose);
    }

    return {
        getState,
        setState,
        ui,
        openManager,
        regexHook,
        registeredPartIds,
        dispose,
    };
}

if (typeof risuai !== 'undefined' && globalThis.__RISU_THEME_PRESET_AUTO_INIT__ !== false) {
    initRisuThemePresetPlugin(risuai).catch((err) => {
        console.error('[risu_theme_preset_v3] 초기화 실패:', err);
    });
}
})();
