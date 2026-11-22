/**
 * RisuAI Custom HTML / Custom CSS 정적 검증기 및 실시간 미리보기 빌더
 */

import { RISU_HOST_CSS, SAMPLE_MESSAGES } from './defaults.js';
import { applyRegexRules } from './regex-engine.js';

export const RISU_SUPPORTED_TAGS = new Set([
  'img', 'a', 'span', 'div', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'ul', 'ol', 'li', 'table', 'tr', 'td', 'th', 'hr', 'br', 'code', 'pre',
  'blockquote', 'em', 'strong', 'u', 'del', 'button', 'style'
]);

export const RISU_VOID_TAGS = new Set(['img', 'hr', 'br', 'meta', 'link', 'input']);

export const RISU_SLOT_TAGS = new Set(['risutextbox', 'risuicon', 'risubuttons', 'risugeninfo']);

const CONVERTED_TO_DIV_WARN_TAGS = new Set([
  'section', 'header', 'footer', 'article', 'aside', 'nav', 'main',
  'i', 'b', 'svg', 'tbody', 'thead', 'tfoot'
]);

export function escapeHtmlText(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/**
 * 텍스트 노드용. 원문에 이미 있는 엔티티(&amp;, &#39; 등)는 그대로 두어 이중으로 이스케이프하지 않는다.
 * 실제 RisuAI는 DOMParser로 엔티티를 풀어서 보여 준다.
 */
export function escapeHtmlTextNode(str) {
  return String(str ?? '')
    .replace(/&(?!(?:[a-zA-Z][a-zA-Z0-9]*|#\d+|#x[0-9a-fA-F]+);)/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

export function escapeHtmlAttr(str) {
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
export function parseHtmlToTree(html) {
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
export function evaluatePreviewCBS(html, role, sampleContext = {}) {
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
export function sanitizeAndRenderGuiHtml(evaluatedHtml, slotRenderer = {}) {
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
export function validateTheme(guiHTML, customCSS = '') {
  const html = String(guiHTML ?? '');
  const css = String(customCSS ?? '');
  const errors = [];
  const warnings = [];

  if (!html.trim()) {
    errors.push('Custom HTML이 비어 있습니다. 최소한 <risutextbox></risutextbox>가 포함되어야 합니다.');
  }

  // 자기 닫기 특수 슬롯 태그 검사
  const selfClosingRe = /<(risutextbox|risuicon|risubuttons|risugeninfo)(\s[^>]*)?\/>/gi;
  const selfClosingMatches = [...html.matchAll(selfClosingRe)];
  if (selfClosingMatches.length > 0) {
    const names = [...new Set(selfClosingMatches.map((m) => `<${m[1].toLowerCase()}/>`))].join(', ');
    errors.push(`특수 슬롯 태그는 자기 닫기(${names})를 사용할 수 없습니다. <tag></tag> 형태로 작성하세요.`);
  }

  // CSS </style 차단 검사
  if (/<\/style/i.test(css)) {
    errors.push('Custom CSS에 닫는 </style> 문자열이 포함되어 있습니다.');
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
export function previewAvatarUri(role) {
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

export function previewSkyBackground(palette) {
  const layers = SKY_LAYERS[palette === 'light' ? 'light' : 'dark'];
  return `${SKY_NOISE} repeat, ${layers.join(', ')}`;
}

/**
 * 메시지 본문에서 RisuAI가 하는 처리 중 테마에 영향을 주는 두 가지를 흉내 낸다.
 * - {{source::char}} / {{source::user}}를 프로필 이미지 주소로 바꾼다.
 * - 본문 HTML의 클래스에 x-risu- 접두사를 붙인다 (코드 강조 클래스는 그대로 둔다).
 */
export function simulateBodyProcessing(html) {
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
export function buildPreviewSrcdoc(preset, options = {}) {
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

  const guiHTML = String(preset?.guiHTML ?? '');
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
