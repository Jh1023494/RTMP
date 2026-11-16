/**
 * RisuAI 호환 디스플레이 정규식 엔진 및 Custom HTML/CSS 정규식 변환기
 */

const RISU_SLOT_NAMES = ['risutextbox', 'risuicon', 'risubuttons', 'risugeninfo'];

export function createRegexRuleId() {
  return 'rx_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 7);
}

/**
 * RisuAI scripts.ts 규칙에 따라 flag 문자열과 <order N, cbs, move_top, no_end_nl> 메타를 파싱한다.
 */
export function parseRisuRegexFlags(rawFlag, ableFlag = true) {
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
export function applyRegexRulesDetailed(text, rules = []) {
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
export function applyRegexRules(text, rules = []) {
  return applyRegexRulesDetailed(text, rules).text;
}

/**
 * 자기 닫기 형태의 특수 슬롯 태그를 표준 여닫는 태그로 교정한다.
 */
export function fixSelfClosingSlotTags(html) {
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
export function convertLegacyCbsToWhen(html) {
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
export function convertRegexOutToCustomHtml(regexOutTemplate, options = {}) {
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
export function transformThemeMarkup({ guiHTML = '', customCSS = '' }, transformType, params = {}) {
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
export function importRisuRegexJson(jsonString) {
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
export function exportRisuRegexJson(regexRules = []) {
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
