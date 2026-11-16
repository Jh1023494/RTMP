import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const SRC_DIR = path.join(ROOT_DIR, 'src');
const DIST_DIR = path.join(ROOT_DIR, 'dist');

const MODULE_ORDER = [
    'defaults.js',
    'legacy-builtin-fingerprints.js',
    'storage.js',
    'regex-engine.js',
    'preset-echo.js',
    'theme-families.js',
    'builtin-presets.js',
    'preview-engine.js',
    'risu-bridge.js',
    'help-copy.js',
    'ui.js',
    'index.js',
];

export function stripEsmModuleSyntax(source) {
    const lines = source.split(/\r?\n/);
    const out = [];
    let skippingImport = false;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        if (skippingImport) {
            if (/;\s*$/.test(line) || /\bfrom\s+['"][^'"]+['"]\s*;?\s*$/.test(line)) {
                skippingImport = false;
            }
            continue;
        }

        if (/^import\s+/.test(line)) {
            if (/^import\s+['"][^'"]+['"]\s*;?\s*$/.test(line) || /\bfrom\s+['"][^'"]+['"]\s*;?\s*$/.test(line)) {
                continue;
            }
            skippingImport = true;
            continue;
        }

        if (/^export\s*\{[^}]*\}\s*;?\s*$/.test(line)) {
            continue;
        }

        if (/^export\s+default\s+/.test(line)) {
            out.push(line.replace(/^export\s+default\s+/, ''));
            continue;
        }

        if (/^export\s+(async\s+function|function|const|let|var|class)\s+/.test(line)) {
            out.push(line.replace(/^export\s+/, ''));
            continue;
        }

        out.push(line);
    }

    return out.join('\n').trim();
}

export function validateRisuV3PluginOutput(code) {
    const errors = [];
    const lines = code.split('\n');
    const encoder = new TextEncoder();

    let foundName = '';
    let foundApi = '';
    let foundVersion = '';
    let foundUpdateUrl = '';
    let versionEndByteOffset = Infinity;
    let runningChars = 0;

    for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.startsWith('//@name ')) {
            foundName = trimmed.slice('//@name '.length).trim();
        } else if (trimmed.startsWith('//@api ')) {
            foundApi = trimmed.slice('//@api '.length).trim();
        } else if (trimmed.startsWith('//@version ')) {
            foundVersion = trimmed.slice('//@version '.length).trim();
            versionEndByteOffset = encoder.encode(code.slice(0, runningChars) + line).length;
        } else if (trimmed.startsWith('//@update-url ')) {
            foundUpdateUrl = trimmed.slice('//@update-url '.length).trim();
            if (!foundUpdateUrl.startsWith('https://')) {
                errors.push(`Invalid //@update-url "${foundUpdateUrl}" (must start with https://).`);
            }
        } else if (trimmed.startsWith('//@arg ')) {
            const rest = trimmed.slice('//@arg '.length).trim();
            const parts = rest.split(/\s+/);
            const argType = parts[1];
            if (argType !== 'int' && argType !== 'string') {
                errors.push(`Invalid //@arg type "${argType}" (expected "int" or "string").`);
            }
        } else if (trimmed.startsWith('//@link ')) {
            const url = trimmed.slice('//@link '.length).trim().split(/\s+/)[0] || '';
            if (!url.startsWith('https://')) {
                errors.push(`Invalid //@link URL "${url}" (must start with https://).`);
            }
        }
        runningChars += line.length + 1;
    }

    if (!foundName) {
        errors.push('Missing //@name header.');
    }
    if (foundApi !== '3.0') {
        errors.push(`//@api must be "3.0", got "${foundApi}".`);
    }
    if (!foundVersion) {
        errors.push('Missing //@version header.');
    } else if (!/^\d+\.\d+\.\d+$/.test(foundVersion)) {
        errors.push(`//@version must be MAJOR.MINOR.PATCH, got "${foundVersion}".`);
    } else if (versionEndByteOffset > 500) {
        errors.push(`//@version exceeds 500-byte limit (${versionEndByteOffset} bytes).`);
    }

    // RisuAI는 플러그인 코드를 iframe srcdoc의 script 요소 안에 이스케이프 없이 넣는다.
    // 아래 문자열이 코드에 있으면 HTML 파서가 스크립트를 일찍 끝내거나 끝내지 못해 플러그인이 실행되지 않는다.
    const htmlBreakers = [
        [/<!--/, '<!--'],
        [/<script/i, '<script'],
        [/<\/script/i, '</script'],
    ];
    for (const [pattern, label] of htmlBreakers) {
        const hit = pattern.exec(code);
        if (hit) {
            const lineNo = code.slice(0, hit.index).split('\n').length;
            errors.push(
                'Bundle contains "' + label + '" (line ' + lineNo + '); it breaks the host script element. Write it with \\x3C / \\x21 escapes.',
            );
        }
    }

    try {
        // Validate JavaScript syntax & ensure no duplicate lexical declarations inside top IIFE
        new Function(code);
    } catch (err) {
        errors.push(`Syntax check failed: ${err instanceof Error ? err.message : String(err)}`);
    }

    return {
        valid: errors.length === 0,
        errors,
        meta: {
            name: foundName,
            api: foundApi,
            version: foundVersion,
            versionEndByteOffset,
        },
    };
}

function buildDemoHarnessHtml(pluginBundleCode) {
    const safeSerializedCode = JSON.stringify(pluginBundleCode).replace(/<\/script/gi, '<\\/script');
    return `<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Risu Theme Preset V3 - Standalone Demo Harness</title>
<style>
  * { box-sizing: border-box; }
  body {
    margin: 0;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Malgun Gothic", sans-serif;
    background: #0b0e14;
    color: #e6edf3;
    height: 100vh;
    display: flex;
    flex-direction: column;
  }
  .host-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    padding: 10px 14px;
    background: #161b22;
    border-bottom: 1px solid #30363d;
    flex-wrap: wrap;
  }
  .host-bar button {
    background: #21262d;
    color: #e6edf3;
    border: 1px solid #30363d;
    border-radius: 6px;
    padding: 6px 10px;
    cursor: pointer;
    font-size: 12px;
  }
  .host-bar button.primary {
    background: #238636;
    border-color: #2ea043;
    color: #fff;
    font-weight: 600;
  }
  .host-main {
    flex: 1 1 auto;
    min-height: 0;
    display: grid;
    grid-template-columns: 360px 1fr;
  }
  .host-sidebar {
    border-right: 1px solid #30363d;
    padding: 12px;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 12px;
    background: #0d1117;
  }
  .card {
    background: #161b22;
    border: 1px solid #30363d;
    border-radius: 8px;
    padding: 10px;
    font-size: 12px;
  }
  .card h3 {
    margin: 0 0 8px;
    font-size: 13px;
  }
  pre {
    margin: 0;
    white-space: pre-wrap;
    word-break: break-word;
    background: #0b0e14;
    padding: 8px;
    border-radius: 6px;
    border: 1px solid #30363d;
    max-height: 180px;
    overflow: auto;
    font-size: 11px;
  }
  .host-chat-stage {
    position: relative;
    display: flex;
    flex-direction: column;
    min-height: 0;
  }
  #host-chat-frame {
    width: 100%;
    height: 100%;
    border: 0;
    background: #16181c;
  }
  #plugin-overlay {
    position: fixed;
    inset: 0;
    z-index: 50;
    display: none;
    background: rgba(0,0,0,0.6);
  }
  #plugin-overlay.open {
    display: block;
  }
  #plugin-frame {
    width: 100%;
    height: 100%;
    border: 0;
  }
</style>
</head>
<body>
  <header class="host-bar">
    <div>
      <strong>Mock RisuAI Host (Plugin API v3.0 테스트 하네스)</strong>
      <span id="host-theme-pill" style="margin-left:8px;font-size:12px;color:#7ee787;"></span>
    </div>
    <div id="host-plugin-buttons" style="display:flex;gap:8px;align-items:center;">
      <button id="btn-test-regex">디스플레이 정규식 테스트</button>
    </div>
  </header>

  <main class="host-main">
    <aside class="host-sidebar">
      <div class="card">
        <h3>가상 DB 상태 (setDatabaseLite / customCSS Sync)</h3>
        <div id="db-meta" style="margin-bottom:6px;color:#8b949e;"></div>
        <strong style="display:block;margin:6px 0 4px;">guiHTML:</strong>
        <pre id="db-html"></pre>
        <strong style="display:block;margin:6px 0 4px;">customCSS (#customcss):</strong>
        <pre id="db-css"></pre>
      </div>
      <div class="card">
        <h3>등록된 UI 파츠 & 디스플레이 정규식 결과</h3>
        <div id="ui-parts-info" style="color:#8b949e;margin-bottom:6px;"></div>
        <pre id="regex-test-output">상단 "디스플레이 정규식 테스트" 버튼을 눌러 확인하세요.</pre>
      </div>
    </aside>
    <section class="host-chat-stage">
      <iframe id="host-chat-frame" title="Mock Vanilla/CustomHTML Chat View"></iframe>
    </section>
  </main>

  <div id="plugin-overlay">
    <iframe id="plugin-frame" title="Risu Theme Preset Plugin Container"></iframe>
  </div>

  <script>
    const PLUGIN_CODE = ${safeSerializedCode};
    const STORAGE_PREFIX = 'mock_risu_demo_';

    const mockDb = {
      theme: '',
      guiHTML: '',
      customCSS: '/* 초기 바닐라 Custom CSS */',
      textTheme: 'standard',
      colorSchemeName: 'dark',
    };

    const pluginArgs = {
      disable_display_regex: 0,
      default_preview_palette: 'dark',
    };

    const registeredParts = [];
    const displayHandlers = [];
    const unloadHandlers = [];
    const overlayEl = document.getElementById('plugin-overlay');
    const pluginFrame = document.getElementById('plugin-frame');
    const chatFrame = document.getElementById('host-chat-frame');

    function renderMockHostView() {
      document.getElementById('host-theme-pill').textContent = '현재 db.theme: ' + (mockDb.theme || 'vanilla (classic)');
      document.getElementById('db-meta').textContent =
        'theme=' + JSON.stringify(mockDb.theme) + ', textTheme=' + JSON.stringify(mockDb.textTheme);
      document.getElementById('db-html').textContent = mockDb.guiHTML || '(비어 있음 - 바닐라 렌더링)';
      document.getElementById('db-css').textContent = mockDb.customCSS || '(비어 있음)';
      document.getElementById('ui-parts-info').textContent =
        '등록된 UI: ' + registeredParts.map((p) => p.name + ' [' + p.kind + ']').join(', ');

      const sampleHtml = mockDb.theme === 'customHTML' && mockDb.guiHTML
        ? mockDb.guiHTML
            .replace(/\\{\\{#when::\\{\\{role\\}\\}::is::char\\}\\}([\\s\\S]*?)\\{\\{:else\\}\\}[\\s\\S]*?\\{\\{\\/when\\}\\}/g, '$1')
            .replace(/\\{\\{#when::\\{\\{role\\}\\}::is::user\\}\\}[\\s\\S]*?\\{\\{:else\\}\\}([\\s\\S]*?)\\{\\{\\/when\\}\\}/g, '$1')
            .replace(/\\{\\{#when::\\{\\{role\\}\\}::is::char\\}\\}([\\s\\S]*?)\\{\\{\\/when\\}\\}/g, '$1')
            .replace(/\\{\\{#when::\\{\\{role\\}\\}::is::user\\}\\}[\\s\\S]*?\\{\\{\\/when\\}\\}/g, '')
            .replace(/\\{\\{#when::\\{\\{equal::\\{\\{role\\}\\}::char\\}\\}\\}\\}([\\s\\S]*?)\\{\\{\\/when\\}\\}/g, '$1')
            .replace(/\\{\\{#when::\\{\\{equal::\\{\\{role\\}\\}::user\\}\\}\\}\\}[\\s\\S]*?\\{\\{\\/when\\}\\}/g, '')
            .replace(/\\{\\{char\\}\\}/g, '세라')
            .replace(/\\{\\{user\\}\\}/g, '사용자')
            .replace(/<risuicon>(?:<\\/risuicon>)?/g, '<div style="width:42px;height:42px;border-radius:10px;background:#3a4a6a;display:flex;align-items:center;justify-content:center;font-weight:700;">S</div>')
            .replace(/<risutextbox>(?:<\\/risutextbox>)?/g, '<div class="prose"><p>바닐라 호스트 채팅창에서 Custom HTML + #customcss가 적용된 모습입니다.</p><p><em>*플러그인 삭제 후에도 이 HTML/CSS는 DB에 유지됩니다.*</em></p></div>')
            .replace(/<risubuttons>(?:<\\/risubuttons>)?/g, '<button type="button">복사</button><button type="button">수정</button>')
            .replace(/<risugeninfo>(?:<\\/risugeninfo>)?/g, '<span>2.4s · 340t</span>')
        : '<div style="padding:16px;border:1px solid #30363d;border-radius:10px;background:#1d2129;"><strong>Vanilla Classic 메시지</strong><p>바닐라 RisuAI 기본 채팅 UI 상태입니다.</p></div>';

      chatFrame.srcdoc = '<!DOCTYPE html><html><head><meta charset="utf-8"><style>body{margin:0;padding:18px;background:#16181c;color:#e6edf3;font-family:sans-serif;}:root{--FontColorStandard:#e6edf3;--FontColorBold:#fff;--FontColorItalic:#cbd5e1;--FontColorQuote1:#93c5fd;--FontColorQuote2:#7dd3fc;--risu-theme-bg:#16181c;--risu-theme-bg2:#1e222a;}</style><style id="customcss">' + mockDb.customCSS + '</style></head><body><div class="risu-chat"><div>' + sampleHtml + '</div></div></body></html>';
    }

    function addHostPartButton(entry) {
      registeredParts.push(entry);
      const wrap = document.getElementById('host-plugin-buttons');
      const btn = document.createElement('button');
      btn.className = entry.kind === 'button' ? 'primary' : '';
      btn.textContent = (entry.kind === 'setting' ? '[설정] ' : '[버튼] ') + entry.name;
      btn.dataset.partId = entry.id;
      btn.addEventListener('click', () => entry.callback());
      wrap.appendChild(btn);
      renderMockHostView();
    }

    const mockRisuApi = {
      pluginStorage: {
        async getItem(k) { return localStorage.getItem(STORAGE_PREFIX + k); },
        async setItem(k, v) { localStorage.setItem(STORAGE_PREFIX + k, typeof v === 'string' ? v : JSON.stringify(v)); },
        async removeItem(k) { localStorage.removeItem(STORAGE_PREFIX + k); },
        async clear() {
          Object.keys(localStorage).filter((k) => k.startsWith(STORAGE_PREFIX)).forEach((k) => localStorage.removeItem(k));
        },
        async keys() { return Object.keys(localStorage).filter((k) => k.startsWith(STORAGE_PREFIX)); },
        async length() { return (await this.keys()).length; },
      },
      safeLocalStorage: {
        async getItem(k) { return localStorage.getItem(STORAGE_PREFIX + 'safe_' + k); },
        async setItem(k, v) { localStorage.setItem(STORAGE_PREFIX + 'safe_' + k, String(v)); },
        async removeItem(k) { localStorage.removeItem(STORAGE_PREFIX + 'safe_' + k); },
      },
      async getDatabase() {
        return { ...mockDb };
      },
      async setDatabaseLite(patch) {
        if (patch && typeof patch === 'object') {
          if (typeof patch.theme === 'string') mockDb.theme = patch.theme;
          if (typeof patch.guiHTML === 'string') mockDb.guiHTML = patch.guiHTML;
          if (typeof patch.customCSS === 'string') mockDb.customCSS = patch.customCSS;
        }
        renderMockHostView();
      },
      async getTextTheme() {
        return {
          name: mockDb.textTheme,
          customTheme: {
            FontColorStandard: '#e6edf3',
            FontColorBold: '#ffffff',
            FontColorItalic: '#cbd5e1',
            FontColorItalicBold: '#f1f5f9',
            FontColorQuote1: '#93c5fd',
            FontColorQuote2: '#7dd3fc',
          },
        };
      },
      async changeTextTheme(name) {
        mockDb.textTheme = name;
        renderMockHostView();
      },
      async setCustomTextTheme() {
        mockDb.textTheme = 'custom';
        renderMockHostView();
      },
      async getArgument(key) {
        return pluginArgs[key];
      },
      async setArgument(key, val) {
        pluginArgs[key] = val;
      },
      async registerSetting(name, callback, icon, iconType, id) {
        const finalId = id || 'setting_' + Date.now();
        addHostPartButton({ id: finalId, name, kind: 'setting', callback });
        return { id: finalId };
      },
      async registerButton(arg, callback) {
        const finalId = arg.id || 'btn_' + Date.now();
        addHostPartButton({ id: finalId, name: arg.name, kind: 'button', callback });
        return { id: finalId };
      },
      async unregisterUIPart(id) {
        const el = document.querySelector('[data-part-id="' + id + '"]');
        if (el) el.remove();
      },
      async showContainer() {
        overlayEl.classList.add('open');
      },
      async hideContainer() {
        overlayEl.classList.remove('open');
      },
      async addRisuScriptHandler(mode, fn) {
        if (mode === 'display') displayHandlers.push(fn);
      },
      async removeRisuScriptHandler(mode, fn) {
        const idx = displayHandlers.indexOf(fn);
        if (idx >= 0) displayHandlers.splice(idx, 1);
      },
      async onUnload(fn) {
        unloadHandlers.push(fn);
      },
      async alert(msg) { console.log('[risuai.alert]', msg); },
      async alertConfirm(msg) { console.log('[risuai.confirm]', msg); return true; },
      async alertError(msg) { console.error('[risuai.error]', msg); },
    };

    document.getElementById('btn-test-regex').addEventListener('click', async () => {
      let text = '[System: 테스트 상태창]\\n"안녕하세요, 반갑습니다."';
      for (const h of displayHandlers) {
        text = await h(text);
      }
      document.getElementById('regex-test-output').textContent = text;
    });

    renderMockHostView();

    // Boot compiled V3 plugin inside sandboxed iframe context
    pluginFrame.srcdoc = '<!DOCTYPE html><html><head><meta charset="utf-8"></head><body></body></html>';
    pluginFrame.addEventListener('load', () => {
      const win = pluginFrame.contentWindow;
      win.risuai = mockRisuApi;
      win.Risuai = mockRisuApi;
      const script = win.document.createElement('script');
      script.textContent = PLUGIN_CODE;
      win.document.body.appendChild(script);
    }, { once: true });
  </script>
</body>
</html>`;
}

const HELP_COPY_JSON = path.join(ROOT_DIR, 'docs', 'help-copy.json');

/** docs/help-copy.json(도움말 문구 원본)으로 src/help-copy.js를 다시 만든다. */
export async function syncHelpCopyModule() {
    const raw = await fs.readFile(HELP_COPY_JSON, 'utf8');
    const data = JSON.parse(raw);
    const body = JSON.stringify(data, null, 4);
    const js = `// 관리자 UI 도움말 문구. 원본: docs/help-copy.json (short: 마우스를 올리면 뜨는 한 줄, long: 도움말 모드 설명)
export const HELP_COPY = ${body};
`;
    await fs.writeFile(path.join(SRC_DIR, 'help-copy.js'), js, 'utf8');
}

export async function buildPluginBundle() {
    await syncHelpCopyModule();
    const metaRaw = (await fs.readFile(path.join(SRC_DIR, 'meta.js'), 'utf8')).trim();
    const parts = [];

    for (const file of MODULE_ORDER) {
        const fullPath = path.join(SRC_DIR, file);
        const raw = await fs.readFile(fullPath, 'utf8');
        parts.push(`// === ${file} ===\n${stripEsmModuleSyntax(raw)}`);
    }

    const wrappedBody = [
        metaRaw,
        '',
        '(async () => {',
        "    'use strict';",
        '',
        parts.join('\n\n'),
        '})();',
        '',
    ].join('\n');

    const validation = validateRisuV3PluginOutput(wrappedBody);
    if (!validation.valid) {
        throw new Error(`Bundle validation failed:\n- ${validation.errors.join('\n- ')}`);
    }

    await fs.mkdir(DIST_DIR, { recursive: true });
    const bundlePath = path.join(DIST_DIR, 'risu-theme-preset-v3.js');
    const harnessPath = path.join(DIST_DIR, 'demo-harness.html');

    await fs.writeFile(bundlePath, wrappedBody, 'utf8');
    await fs.writeFile(harnessPath, buildDemoHarnessHtml(wrappedBody), 'utf8');

    return {
        bundlePath,
        harnessPath,
        validation,
        byteSize: Buffer.byteLength(wrappedBody, 'utf8'),
    };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
    buildPluginBundle()
        .then((res) => {
            console.log(`Built ${res.bundlePath} (${res.byteSize} bytes)`);
            console.log(
                `Meta verified: name=${res.validation.meta.name}, api=${res.validation.meta.api}, version=${res.validation.meta.version} (offset=${res.validation.meta.versionEndByteOffset}B <= 500B)`,
            );
            console.log(`Built ${res.harnessPath}`);
        })
        .catch((err) => {
            console.error(err);
            process.exit(1);
        });
}
