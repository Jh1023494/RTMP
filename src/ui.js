import {
    createPresetId,
    normalizePresetItem,
    normalizePluginState,
    savePluginState,
    exportAllPresetsJson,
    exportSinglePresetJson,
    importPresetsJson,
    applyPresetDrop,
    movePresetToGroup,
    renameGroup,
    setGroupCollapsed,
    getPresetGroupName,
    getAllPresets,
    getVisibleBuiltins,
    getBuiltinPresets,
    getBuiltinPreset,
    findPreset,
    isBuiltinId,
    hideBuiltin,
    unhideBuiltins,
    setBuiltinGroupExpanded,
    makeUserCopyOfBuiltin,
} from './storage.js';
import {
    createRegexRuleId,
    convertRegexOutToCustomHtml,
    transformThemeMarkup,
    importRisuRegexJson,
    exportRisuRegexJson,
} from './regex-engine.js';
import { validateTheme, buildPreviewSrcdoc } from './preview-engine.js';
import { HELP_COPY } from './help-copy.js';
import {
    activatePreset,
    restoreVanilla,
    captureCurrentVanillaAsPreset,
    getVanillaState,
    readDisplayRegexEnabled,
    ARG_DISABLE_DISPLAY_REGEX,
} from './risu-bridge.js';

const UI_STYLE_ID = 'rtpv3-styles';
const UI_ROOT_ID = 'rtpv3-app';

const UI_CSS = `
#${UI_ROOT_ID} {
    --rtpv3-bg: #0d1117;
    --rtpv3-bg-sunken: #090c10;
    --rtpv3-surface: #161b22;
    --rtpv3-surface-2: #1c2129;
    --rtpv3-hover: #21262d;
    --rtpv3-border: #30363d;
    --rtpv3-border-soft: #262c34;
    --rtpv3-text: #e6edf3;
    --rtpv3-text-2: #c9d1d9;
    --rtpv3-muted: #8b949e;
    --rtpv3-accent: #388bfd;
    --rtpv3-accent-bg: #1f6feb;
    --rtpv3-accent-soft: rgba(56, 139, 253, 0.14);
    --rtpv3-ok: #2ea043;
    --rtpv3-ok-bg: #238636;
    --rtpv3-ok-text: #7ee787;
    --rtpv3-warn: #d29922;
    --rtpv3-warn-text: #f2cc60;
    --rtpv3-danger: #f85149;
    --rtpv3-danger-bg: #3c1e22;
    --rtpv3-danger-text: #ffb4ae;
    --rtpv3-radius: 8px;
    --rtpv3-radius-sm: 6px;
    --rtpv3-mono: "Cascadia Code", "JetBrains Mono", "D2Coding", Consolas, monospace;
    position: fixed;
    inset: 0;
    z-index: 9999;
    display: flex;
    flex-direction: column;
    background: var(--rtpv3-bg);
    color: var(--rtpv3-text);
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Malgun Gothic", "Apple SD Gothic Neo", sans-serif;
    font-size: 13px;
    line-height: 1.45;
    box-sizing: border-box;
}
#${UI_ROOT_ID} *, #${UI_ROOT_ID} *::before, #${UI_ROOT_ID} *::after {
    box-sizing: border-box;
}
#${UI_ROOT_ID} ::-webkit-scrollbar { width: 10px; height: 10px; }
#${UI_ROOT_ID} ::-webkit-scrollbar-thumb { background: #2b313a; border-radius: 999px; border: 2px solid transparent; background-clip: padding-box; }
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
    padding: 12px;
    display: flex;
    flex-direction: column;
    gap: 12px;
    min-height: 0;
}
.rtpv3-row { display: flex; gap: 6px; align-items: center; min-width: 0; }
.rtpv3-wrap { flex-wrap: wrap; }
.rtpv3-spacer { flex: 1 1 auto; }
.rtpv3-muted { color: var(--rtpv3-muted); font-size: 11px; }

/* 미리보기 크게 보기: 편집 칸을 접고 미리보기가 그 자리까지 넓어진다 (좁은 화면에서는 탭으로 오가므로 쓰지 않는다). */
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
@media (max-width: 760px) { .rtpv3-pvwide-btn { display: none; } }

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

/* 프리셋 목록 */
.rtpv3-preset-list { display: flex; flex-direction: column; gap: 6px; }
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
    transition: border-color 0.15s, background 0.15s;
}
.rtpv3-preset-card:hover { border-color: #4a5260; background: var(--rtpv3-surface-2); }
.rtpv3-preset-card.selected { border-color: var(--rtpv3-accent); background: #152132; }
.rtpv3-preset-card.unsaved { border-style: dashed; }
.rtpv3-preset-card-title {
    display: flex;
    align-items: center;
    gap: 6px;
    font-weight: 600;
    min-width: 0;
}
.rtpv3-preset-name { flex: 1 1 auto; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.rtpv3-dirty-dot { width: 7px; height: 7px; border-radius: 50%; background: var(--rtpv3-warn); flex-shrink: 0; }
.rtpv3-preset-desc {
    font-size: 11px;
    color: var(--rtpv3-muted);
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
.rtpv3-group-body { display: flex; flex-direction: column; gap: 6px; padding-left: 6px; }
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
.rtpv3-user-section { display: flex; flex-direction: column; gap: 6px; }
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

export function createPluginUI({
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
        mobileView: 'editor',
        menuOpen: false,
        helpMode: false,
        previewWidth: '100%',
        previewWide: false,
        previewPalette: initialPalette === 'light' ? 'light' : 'dark',
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
        const preferredId = uiState.selectedPresetId || state.activePresetId || all[0].id;
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
        uiState.mobileView = 'editor';
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
        const validation = validateTheme(uiState.draftPreset.guiHTML, uiState.draftPreset.customCSS);
        box.innerHTML = '';

        const header = el('div', { className: 'rtpv3-row rtpv3-wrap' });
        if (!uiState.draftPreset.guiHTML.trim() && !uiState.draftPreset.customCSS.trim()) {
            header.appendChild(el('span', { className: 'rtpv3-badge', text: 'HTML·CSS가 비어 있음' }));
        } else {
            header.appendChild(
                el('span', {
                    className: `rtpv3-badge ${validation.valid ? 'active' : 'err'}`,
                    text: validation.valid ? '검증 통과' : `오류 ${validation.errors.length}건`,
                }),
            );
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
        const srcdoc = buildPreviewSrcdoc(uiState.draftPreset, {
            palette: uiState.previewPalette,
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
            showToast(`"${result.preset.name}"을(를) RisuAI에 적용했습니다.${result.cssRefreshed ? '' : '\n화면에 바로 보이지 않으면 채팅을 다시 열어 주세요.'}`);
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
                activePresetId: currentState.activePresetId === target.id ? null : currentState.activePresetId,
                presets: remaining,
            });
            const { state: savedState } = await savePluginState(nextState, api);
            setState(savedState);
            selectFallbackAfterRemoval(savedState);
            showToast(`"${target.name}"을(를) 삭제했습니다.`);
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
        const { state: savedState } = await savePluginState(result.state, api);
        setState(savedState);
        const firstImported = result.importedPresets[0] || (result.skippedBuiltins || [])[0];
        const keepDraft = uiState.hasUnsavedDraft && !uiState.draftIsNew && mode !== 'replace'
            && Boolean(findPreset(savedState, uiState.selectedPresetId));
        if (firstImported && !keepDraft) {
            uiState.selectedPresetId = firstImported.id;
            uiState.draftPreset = clonePresetDraft(firstImported);
            uiState.hasUnsavedDraft = false;
            uiState.draftIsNew = false;
        }
        const skippedNote = result.skippedBuiltinCount ? `\n기본 제공과 같은 ${result.skippedBuiltinCount}건은 이미 있어서 건너뛰었습니다.` : '';
        showToast(`프리셋 ${result.importedCount}건을 가져왔습니다. (새로 추가 ${result.addedCount}, 갱신 ${result.updatedCount})${skippedNote}`);
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

    function setMenuOpen(open) {
        uiState.menuOpen = open;
        if (!rootEl) {
            return;
        }
        if (open) {
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

        menu.append(
            el('div', { className: 'rtpv3-menu-group', text: '이 프리셋' }),
            item('복제', () => handleDuplicatePreset(), '', 'menu.duplicate'),
            item('그룹으로 옮기기…', () => openModal({ type: 'move-group' }), '', 'menu.move-group'),
            item('그룹에서 빼기', () => handleUngroupCurrent(), '', 'menu.ungroup'),
            item('JSON 내보내기 (복사)', () => {
                const st = normalizePluginState(getState());
                const saved = st.presets.find((p) => p.id === uiState.draftPreset.id);
                const groupName = isDraftBuiltin() ? getBuiltinPreset(uiState.draftPreset.id)?.groupName : getPresetGroupName(st, saved);
                copyWithFallback('프리셋 JSON', exportSinglePresetJson(normalizePresetItem(uiState.draftPreset), groupName));
            }, '', 'menu.export-json'),
            el('div', { className: 'rtpv3-menu-group', text: '가져오기' }),
            item('JSON 붙여넣기', () => openModal({ type: 'paste-import', text: '', replace: false }), '', 'menu.paste-json'),
            item('파일 불러오기 (.json)', () => fileInputEl?.click(), '', 'menu.file-import'),
            el('div', { className: 'rtpv3-menu-group', text: '전체' }),
            item('전체 백업 복사', () => copyWithFallback('전체 프리셋 백업 JSON', exportAllPresetsJson(getState())), '', 'menu.backup-all'),
            item('숨긴 기본 프리셋 다시 보기', () => openModal({ type: 'unhide' }), '', 'menu.unhide'),
            el('div', { className: 'rtpv3-menu-group', text: 'RisuAI' }),
            item('현재 설정 가져오기', () => handleCaptureVanillaClick(), '', 'menu.capture'),
            item('원래 테마로 복원', () => openModal({ type: 'confirm-restore' }), 'danger-text', 'menu.restore'),
        );
        menu.addEventListener('click', (e) => e.stopPropagation());
        menu.classList.toggle('open', uiState.menuOpen);
        // 저장하지 않은 새 프리셋이거나 그룹이 없으면 그룹 항목을 흐리게 한다.
        const savedPreset = normalizePluginState(getState()).presets.find((p) => p.id === uiState.draftPreset?.id);
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
        head.appendChild(searchInput);
        panel.appendChild(head);

        const body = el('div', { className: 'rtpv3-panel-body', dataset: { scrollKey: 'list' } });
        const listContainer = el('div', { className: 'rtpv3-preset-list', role: 'list' });
        searchInput.addEventListener('input', (e) => {
            uiState.searchQuery = e.target.value;
            renderPresetListItems(listContainer, state);
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
        const hasActive = members.some((p) => p.id === state.activePresetId);
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
        const isActive = !isNew && preset.id === state.activePresetId;
        const card = el('button', {
            className: `rtpv3-preset-card${isSelected ? ' selected' : ''}${isNew ? ' unsaved' : ''}`,
            role: 'listitem',
            'aria-current': isSelected ? 'true' : null,
            help: 'list.card',
            // 기본 제공 프리셋과 저장 전 새 프리셋은 끌 수 없다.
            dataset: isNew || builtin ? {} : { dragId: preset.id, dropPreset: preset.id },
            onClick: () => {
                if (isNew || isSelected) {
                    uiState.mobileView = 'editor';
                    render();
                    return;
                }
                selectPreset(preset.id);
            },
        });

        const titleRow = el('div', { className: 'rtpv3-preset-card-title' }, [
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
            titleRow.appendChild(el('span', { className: 'rtpv3-badge active', text: '적용 중', help: 'list.badge-active' }));
        }
        card.appendChild(titleRow);

        const memoLine = String(preset.description || '').split('\n').find((line) => line.trim()) || '';
        if (memoLine) {
            card.appendChild(el('div', { className: 'rtpv3-preset-desc', text: memoLine }));
        }
        return card;
    }

    function createGroupBlock(group, members, visibleMembers, state, searching) {
        const expanded = searching || !group.collapsed;
        const hasActive = members.some((p) => p.id === state.activePresetId);
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
        const isActive = !uiState.draftIsNew && state.activePresetId === uiState.draftPreset.id;

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
                el('button', {
                    className: 'primary',
                    text: isActive ? 'RisuAI에 다시 적용' : 'RisuAI에 적용',
                    help: 'tb.apply',
                    onClick: () => handleActivatePreset(uiState.draftPreset),
                }),
                createMoreMenu(),
            ]),
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
                hint: '<risutextbox> 같은 슬롯은 닫는 태그까지 씁니다',
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

    function createPreviewPanel() {
        const panel = el('section', { className: 'rtpv3-panel rtpv3-panel-preview' });

        const head = el('div', { className: 'rtpv3-panel-head' });
        head.appendChild(
            el('div', { className: 'rtpv3-panel-title' }, [
                el('span', { text: '미리보기' }),
                el('span', { className: 'rtpv3-muted', text: '편집 중인 내용이 바로 보입니다' }),
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
                el('label', { className: 'rtpv3-check-row', help: 'pv.apply-regex' }, [regexChk, el('span', { text: '이 프리셋의 디스플레이 정규식도 적용' })]),
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
                            ? '기본 제공 프리셋은 지우지 않고 목록에서 숨깁니다. ⋯ 메뉴의 "숨긴 기본 프리셋 다시 보기"로 되살릴 수 있습니다.'
                            : '삭제한 프리셋은 되살릴 수 없습니다. 필요하면 먼저 ⋯ 메뉴의 JSON 내보내기로 복사해 두세요.\nRisuAI에 이미 적용된 HTML·CSS는 그대로 남습니다.',
                    }),
                ],
                [cancelBtn(), confirmBtn],
            );
        } else if (m.type === 'confirm-discard') {
            const proceed = () => {
                if (m.action === 'new') {
                    handleCreateNewPreset({ force: true });
                } else if (m.action === 'capture') {
                    uiState.hasUnsavedDraft = false;
                    uiState.draftIsNew = false;
                    handleCaptureVanillaClick();
                } else if (m.presetId) {
                    selectPreset(m.presetId, { force: true });
                }
            };
            const saveBtn = el('button', {
                className: 'primary',
                text: '저장하고 계속',
                onClick: async () => {
                    closeModal();
                    try {
                        await saveDraftToState();
                        proceed();
                    } catch (err) {
                        showToast(`저장 실패: ${errorText(err)}`, true);
                    }
                },
            });
            focusTarget = saveBtn;
            modal = modalShell(
                '저장하지 않은 변경이 있습니다',
                [
                    el('div', {
                        className: 'rtpv3-modal-desc',
                        text: `"${uiState.draftPreset?.name || '이름 없는 프리셋'}"의 변경을 저장하지 않고 넘어가면 사라집니다.`,
                    }),
                ],
                [
                    cancelBtn('계속 편집'),
                    el('button', {
                        className: 'danger',
                        text: '버리고 계속',
                        onClick: () => {
                            closeModal();
                            uiState.hasUnsavedDraft = false;
                            uiState.draftIsNew = false;
                            proceed();
                        },
                    }),
                    saveBtn,
                ],
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

    function createHeader(state) {
        const activePreset = state.activePresetId ? findPreset(state, state.activePresetId) : null;
        const header = el('header', { className: 'rtpv3-header' });
        header.appendChild(
            el('div', { className: 'rtpv3-title-wrap' }, [
                el('h1', { className: 'rtpv3-title', text: '테마 프리셋 관리자' }),
                el('span', {
                    className: `rtpv3-badge rtpv3-header-badge${activePreset ? ' active' : ''}`,
                    text: activePreset ? `적용 중: ${activePreset.name}` : 'RisuAI 기본 설정 사용 중',
                    help: 'header.status',
                }),
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
                    onClick: async () => {
                        if (api && typeof api.hideContainer === 'function') {
                            await api.hideContainer();
                        }
                    },
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
            createPreviewPanel(),
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
