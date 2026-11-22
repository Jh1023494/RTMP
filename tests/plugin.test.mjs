import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';

import { DEFAULT_PRESETS } from '../src/defaults.js';
import { BUILTIN_PRESETS } from '../src/builtin-presets.js';
import {
    parseRisuRegexFlags,
    applyRegexRulesDetailed,
    applyRegexRules,
    convertRegexOutToCustomHtml,
    transformThemeMarkup,
    importRisuRegexJson,
    exportRisuRegexJson,
} from '../src/regex-engine.js';
import {
    evaluatePreviewCBS,
    sanitizeAndRenderGuiHtml,
    validateTheme,
    buildPreviewSrcdoc,
} from '../src/preview-engine.js';
import {
    STORAGE_KEY_STATE,
    loadPluginState,
    savePluginState,
    exportAllPresetsJson,
    exportSinglePresetJson,
    importPresetsJson,
    applyPresetDrop,
    movePresetToGroup,
    renameGroup,
    nextGroupName,
    normalizePluginState,
    getAllPresets,
    hideBuiltin,
    unhideBuiltins,
    presetFingerprint,
} from '../src/storage.js';
import {
    getActiveDisplayRules,
    activatePreset,
    restoreVanilla,
    captureCurrentVanillaAsPreset,
    registerDisplayRegexHook,
} from '../src/risu-bridge.js';
import { initRisuThemePresetPlugin } from '../src/index.js';
import { buildPluginBundle, validateRisuV3PluginOutput } from '../scripts/build.mjs';
import { buildReleasePresets } from '../scripts/release.mjs';

function createMockRisuApi(initialDb = {}) {
    const pluginStorageMap = new Map();
    const safeStorageMap = new Map();
    const db = {
        theme: '',
        guiHTML: '<div class="vanilla">default</div>',
        customCSS: '/* vanilla css */',
        textTheme: 'standard',
        colorSchemeName: 'dark',
        ...initialDb,
    };
    const customTextTheme = {
        FontColorStandard: '#eeeeee',
        FontColorBold: '#ffffff',
        FontColorItalic: '#cccccc',
        FontColorItalicBold: '#dddddd',
        FontColorQuote1: '#88ccff',
        FontColorQuote2: '#66aaff',
    };
    const args = {
        disable_display_regex: 0,
        default_preview_palette: 'dark',
    };
    const calls = {
        setDatabaseLite: [],
        changeTextTheme: [],
        setCustomTextTheme: [],
        registerSetting: [],
        registerButton: [],
        unregisterUIPart: [],
        addRisuScriptHandler: [],
        removeRisuScriptHandler: [],
        onUnload: [],
        showContainer: [],
        hideContainer: [],
    };
    const scriptHandlers = { display: [] };
    const unloadCallbacks = [];

    return {
        db,
        args,
        calls,
        scriptHandlers,
        unloadCallbacks,
        api: {
            pluginStorage: {
                async getItem(k) {
                    return pluginStorageMap.has(k) ? pluginStorageMap.get(k) : null;
                },
                async setItem(k, v) {
                    pluginStorageMap.set(k, v);
                },
                async removeItem(k) {
                    pluginStorageMap.delete(k);
                },
                async clear() {
                    pluginStorageMap.clear();
                },
                async keys() {
                    return [...pluginStorageMap.keys()];
                },
                async length() {
                    return pluginStorageMap.size;
                },
            },
            safeLocalStorage: {
                async getItem(k) {
                    return safeStorageMap.has(k) ? safeStorageMap.get(k) : null;
                },
                async setItem(k, v) {
                    safeStorageMap.set(k, v);
                },
                async removeItem(k) {
                    safeStorageMap.delete(k);
                },
            },
            async getDatabase(keys) {
                if (Array.isArray(keys)) {
                    const subset = {};
                    for (const key of keys) {
                        subset[key] = db[key];
                    }
                    return subset;
                }
                return { ...db };
            },
            async setDatabaseLite(patch) {
                calls.setDatabaseLite.push({ ...patch });
                Object.assign(db, patch);
            },
            async getTextTheme() {
                return {
                    name: db.textTheme,
                    customTheme: { ...customTextTheme },
                };
            },
            async changeTextTheme(name) {
                calls.changeTextTheme.push(name);
                db.textTheme = name;
            },
            async setCustomTextTheme(theme) {
                calls.setCustomTextTheme.push({ ...theme });
                db.textTheme = 'custom';
            },
            async getArgument(key) {
                return args[key];
            },
            async setArgument(key, val) {
                args[key] = val;
            },
            async registerSetting(name, cb, icon, iconType, id) {
                const finalId = id || `setting_${calls.registerSetting.length + 1}`;
                calls.registerSetting.push({ name, id: finalId, cb });
                return { id: finalId };
            },
            async registerButton(arg, cb) {
                const finalId = arg.id || `btn_${calls.registerButton.length + 1}`;
                calls.registerButton.push({ ...arg, id: finalId, cb });
                return { id: finalId };
            },
            async unregisterUIPart(id) {
                calls.unregisterUIPart.push(id);
            },
            async addRisuScriptHandler(mode, fn) {
                calls.addRisuScriptHandler.push({ mode, fn });
                if (!scriptHandlers[mode]) {
                    scriptHandlers[mode] = [];
                }
                scriptHandlers[mode].push(fn);
            },
            async removeRisuScriptHandler(mode, fn) {
                calls.removeRisuScriptHandler.push({ mode, fn });
                if (scriptHandlers[mode]) {
                    const idx = scriptHandlers[mode].indexOf(fn);
                    if (idx >= 0) {
                        scriptHandlers[mode].splice(idx, 1);
                    }
                }
            },
            async onUnload(fn) {
                calls.onUnload.push(fn);
                unloadCallbacks.push(fn);
            },
            async showContainer(mode) {
                calls.showContainer.push(mode);
            },
            async hideContainer() {
                calls.hideContainer.push(true);
            },
        },
    };
}

test('Build bundle, RisuAI V3 metadata header, 500-byte version limit, and demo harness', async () => {
    const result = await buildPluginBundle();
    const bundledCode = await fs.readFile(result.bundlePath, 'utf8');
    const harnessHtml = await fs.readFile(result.harnessPath, 'utf8');

    assert.equal(result.validation.valid, true);
    assert.equal(result.validation.meta.api, '3.0');
    assert.ok(result.validation.meta.versionEndByteOffset <= 500);
    assert.doesNotThrow(() => new Function(bundledCode));
    assert.ok(harnessHtml.includes('Mock RisuAI Host'));
    assert.ok(harnessHtml.includes('PLUGIN_CODE'));

    // Ensure validator rejects //@version past 500 bytes
    const paddedHeader = `//@name too_long\n// ${'x'.repeat(510)}\n//@api 3.0\n//@version 1.0.0\n`;
    const badCheck = validateRisuV3PluginOutput(paddedHeader);
    assert.equal(badCheck.valid, false);
    assert.ok(badCheck.errors.some((e) => e.includes('500-byte')));
});

test('Bundle must not contain strings that break the host script element', async () => {
    const bundle = await fs.readFile(path.resolve('dist/risu-theme-preset-v3.js'), 'utf8');
    assert.ok(!/<!--/.test(bundle));
    assert.ok(!/<\/?script/i.test(bundle));

    const header = '//@name x\n//@api 3.0\n//@version 1.0.0\n';
    assert.equal(validateRisuV3PluginOutput(header + "const a = '<' + 'x';").valid, true);
    assert.equal(validateRisuV3PluginOutput(header + "const a = '<!--';").valid, false);
    assert.equal(validateRisuV3PluginOutput(header + "const a = '<script>';").valid, false);
    assert.equal(validateRisuV3PluginOutput(header + "const a = '</SCRIPT>';").valid, false);
});

test('Release preset files are valid, uniquely prefixed, and importable', () => {
    const presets = buildReleasePresets();
    assert.ok(presets.length >= 3);
    assert.equal(new Set(presets.map((p) => p.preset.id)).size, presets.length);
    let state = { presets: [] };
    let skipped = 0;
    for (const { preset } of presets) {
        const v = validateTheme(preset.guiHTML, preset.customCSS);
        assert.equal(v.valid, true, `${preset.name}: ${v.errors.join(', ')}`);
        assert.ok(!preset.guiHTML.includes('rtbase') && !preset.customCSS.includes('rtbase'));
        const res = importPresetsJson(exportSinglePresetJson(preset), state, 'merge');
        skipped += res.skippedBuiltinCount;
        state = res.state;
    }
    // 결과물 파일은 기본 제공 프리셋과 같으므로 가져와도 내 프리셋에 쌓이지 않는다.
    assert.equal(skipped, presets.length);
    assert.equal(state.presets.length, 0);

    // 내용을 고친 기본 제공 프리셋은 새 id의 내 프리셋으로 들어온다.
    const edited = { ...presets[1].preset, customCSS: presets[1].preset.customCSS + '\n/* edited */' };
    const res = importPresetsJson(exportSinglePresetJson(edited), state, 'merge');
    assert.equal(res.state.presets.length, 1);
    assert.notEqual(res.state.presets[0].id, edited.id);
    assert.ok(res.state.presets[0].name.endsWith('(수정)'));
});

test('Built-in presets: all valid, unique prefixes, and new ones reach existing users once', async () => {
    assert.ok(BUILTIN_PRESETS.length >= 11);
    assert.equal(new Set(BUILTIN_PRESETS.map((p) => p.id)).size, BUILTIN_PRESETS.length);
    for (const preset of BUILTIN_PRESETS) {
        const v = validateTheme(preset.guiHTML, preset.customCSS);
        assert.equal(v.valid, true, preset.name + ': ' + v.errors.join(', '));
        assert.equal(v.warnings.length, 0, preset.name + ' warnings: ' + v.warnings.join(', '));
    }

    // 기본 제공 프리셋은 저장하지 않고 코드에서 읽는다.
    const fresh = normalizePluginState(null);
    assert.equal(fresh.presets.length, 0);
    assert.equal(getAllPresets(fresh).length, BUILTIN_PRESETS.length);

    // 예전 형식(기본 프리셋을 목록에 복사해 둔 상태)을 한 번 옮긴다.
    const cream = BUILTIN_PRESETS.find((p) => p.id === 'preset_book_cream');
    const mock = createMockRisuApi();
    await mock.api.pluginStorage.setItem(
        STORAGE_KEY_STATE,
        JSON.stringify({
            schemaVersion: 1,
            activePresetId: 'preset_starter_card',
            vanillaBackup: null,
            presets: [
                ...DEFAULT_PRESETS, // 손대지 않은 옛 기본 프리셋 → 빠진다
                { ...cream }, // 손대지 않은 지금 기본 프리셋 → 빠진다
                { ...cream, id: 'preset_book_sepia', customCSS: cream.customCSS + '/* mine */' }, // 고친 것 → 내 프리셋
                { id: 'mine_1', name: '내 것', guiHTML: '<risutextbox></risutextbox>', customCSS: '' }, // 사용자 프리셋 → 그대로
            ],
            knownBuiltinIds: ['preset_book_night', 'preset_book_cream', 'preset_book_sepia'], // night는 사용자가 지웠던 것 → 숨김
        }),
    );
    const upgraded = await loadPluginState(mock.api);
    assert.equal(upgraded.schemaVersion, 2);
    assert.deepEqual(
        upgraded.presets.map((p) => p.name),
        [`${cream.name} (수정)`, '내 것'],
    );
    assert.ok(upgraded.presets.every((p) => !BUILTIN_PRESETS.some((b) => b.id === p.id)));
    assert.deepEqual(upgraded.hiddenBuiltinIds, ['preset_book_night']);
    assert.equal(upgraded.activePresetId, null); // 옛 기본 프리셋은 코드에 없으므로 적용 표시만 풀린다
    assert.equal(getAllPresets(upgraded).length, BUILTIN_PRESETS.length - 1 + 2);

    // 숨김은 저장되고, 되살릴 수 있다.
    let hidden = hideBuiltin(upgraded, 'preset_echo_glass');
    await savePluginState(hidden, mock.api);
    const reloaded = await loadPluginState(mock.api);
    assert.ok(reloaded.hiddenBuiltinIds.includes('preset_echo_glass'));
    assert.equal(getAllPresets(reloaded).some((p) => p.id === 'preset_echo_glass'), false);
    hidden = unhideBuiltins(reloaded);
    assert.equal(hidden.hiddenBuiltinIds.length, 0);

    // 코드에 있는 기본 제공 프리셋을 적용하면 그 정규식(양쪽 프리셋의 반대편 이미지)이 훅에 잡힌다.
    const pairState = normalizePluginState({ schemaVersion: 2, activePresetId: 'preset_messenger-pair_white', presets: [] });
    assert.equal(getActiveDisplayRules(pairState).length, 1);
    assert.equal(presetFingerprint(cream), presetFingerprint({ ...cream }));
});

test('Default built-in presets pass validateTheme', () => {
    assert.ok(DEFAULT_PRESETS.length >= 2);
    for (const preset of DEFAULT_PRESETS) {
        const res = validateTheme(preset.guiHTML, preset.customCSS);
        assert.equal(res.valid, true, `Preset "${preset.name}" failed validation: ${res.errors.join(', ')}`);
        assert.equal(res.errors.length, 0);
    }
});

test('validateTheme detects missing slots, branch omissions, self-closing slots, </style, and warnings', () => {
    const missingSlot = validateTheme('<div class="card">No textbox here</div>', '.card {}');
    assert.equal(missingSlot.valid, false);
    assert.ok(missingSlot.errors.some((e) => e.includes('risutextbox')));

    const branchMissingSlot = validateTheme(
        '{{#when::{{role}}::is::char}}<div class="char"><risutextbox></risutextbox></div>{{/when}}{{#when::{{role}}::is::user}}<div class="user">No textbox in user branch</div>{{/when}}',
        '',
    );
    assert.equal(branchMissingSlot.valid, false);

    const selfClosingSlot = validateTheme('<div><risuicon/><risutextbox></risutextbox></div>', '');
    assert.equal(selfClosingSlot.valid, false);
    assert.ok(selfClosingSlot.errors.some((e) => e.includes('자기 닫기') || e.includes('자기 닫힘') || e.includes('self-closing') || e.includes('risuicon')));

    const badCss = validateTheme('<div><risutextbox></risutextbox></div>', '.x { color: red; } </style><script>');
    assert.equal(badCss.valid, false);
    assert.ok(badCss.errors.some((e) => e.toLowerCase().includes('style')));

    const warnCase = validateTheme(
        '<section><img src="https://example.com/a.png"><risutextbox></risutextbox></section>',
        '.x { color: red; }',
    );
    assert.ok(warnCase.warnings.length >= 1);
});

test('regex-engine parses flags, executes ordered rules, converts OUT templates, transforms markup, and roundtrips Risu JSON', () => {
    const parsedFlags = parseRisuRegexFlags('gm<order -5><cbs>', true);
    assert.equal(parsedFlags.order, -5);
    assert.ok(parsedFlags.cleanFlags.includes('g'));
    assert.ok(parsedFlags.cleanFlags.includes('m'));

    const orderedRules = [
        {
            id: 'r2',
            comment: 'Wrap bracketed badge (runs second, lower order)',
            in: '\\[BADGE:(.*?)\\]',
            out: '<span class="badge">$1</span>',
            flag: 'g<order 1>',
            ableFlag: true,
            enabled: true,
        },
        {
            id: 'r1',
            comment: 'Convert @tag to BADGE (runs first, higher order)',
            in: '@([a-z]+)',
            out: '[BADGE:$1]',
            flag: 'g<order 2>',
            ableFlag: true,
            enabled: true,
        },
        {
            id: 'r3',
            comment: 'Invalid regex should not throw',
            in: '([unclosed',
            out: '$&',
            flag: 'g',
            ableFlag: true,
            enabled: true,
        },
    ];

    const detailed = applyRegexRulesDetailed('Hello @admin', orderedRules);
    assert.equal(detailed.text, 'Hello <span class="badge">admin</span>\n');
    assert.equal(detailed.errors.length, 1);

    const noNewlineRule = [
        { ...orderedRules[1] },
        { ...orderedRules[0], flag: 'g<order 1, no_end_nl>' },
    ];
    assert.equal(applyRegexRules('Hello @admin', noNewlineRule), 'Hello <span class="badge">admin</span>');

    const outConverted = convertRegexOutToCustomHtml(
        '<style>.card{padding:8px;}</style><div class="card">{{data}}</div>',
    );
    assert.ok(outConverted.extractedCSS.includes('.card{padding:8px;}'));
    assert.ok(outConverted.guiHTML.includes('<risutextbox>'));

    const legacyTransformed = transformThemeMarkup(
        {
            guiHTML: '{{#if {{equal::{{role}}::char}}}}<div class="rtbase-box"><risuicon/><risutextbox></div>{{/if}}',
            customCSS: '.rtbase-box { color: #fff; }',
        },
        'legacy-cbs-to-when',
    );
    assert.equal(legacyTransformed.changed, true);
    assert.ok(legacyTransformed.guiHTML.includes('{{#when::'));

    const selfCloseFixed = transformThemeMarkup(
        { guiHTML: '<div class="rtbase-box"><risuicon/><risutextbox></div>', customCSS: '' },
        'fix-self-closing-slots',
    );
    assert.equal(selfCloseFixed.changed, true);
    assert.ok(selfCloseFixed.guiHTML.includes('<risuicon>') && !selfCloseFixed.guiHTML.includes('<risuicon/>'));

    const prefixed = transformThemeMarkup(
        { guiHTML: '<div class="rtbase-box"><risutextbox></div>', customCSS: '.rtbase-box { padding: 4px; }' },
        'rename-prefix',
        { oldPrefix: 'rtbase-', newPrefix: 'aurora-' },
    );
    assert.equal(prefixed.changed, true);
    assert.ok(prefixed.guiHTML.includes('aurora-box'));
    assert.ok(prefixed.customCSS.includes('.aurora-box'));

    const customTx = transformThemeMarkup(
        { guiHTML: '<div class="old"><risutextbox></div>', customCSS: '' },
        'custom-regex',
        { target: 'guiHTML', pattern: 'old', flags: 'g', replacement: 'new' },
    );
    assert.equal(customTx.changed, true);
    assert.equal(customTx.guiHTML, '<div class="new"><risutextbox></div>');

    const exportedJson = exportRisuRegexJson([orderedRules[0]]);
    const parsedExport = JSON.parse(exportedJson);
    assert.equal(parsedExport.type, 'regex');
    assert.equal(parsedExport.data.length, 1);

    const importedRules = importRisuRegexJson(exportedJson);
    assert.equal(importedRules.length, 1);
    assert.equal(importedRules[0].in, orderedRules[0].in);
    assert.equal(importedRules[0].type, 'editdisplay');
});

test('preview-engine evaluates CBS, sanitizes tags, and builds srcdoc with palette and regex options', () => {
    const preset = {
        id: 'p_test',
        name: 'Test Theme',
        guiHTML: [
            '{{#when::{{role}}::is::char}}<div class="char-box"><span class="cname">{{char}}</span><risutextbox></risutextbox></div>{{/when}}',
            '{{#when::{{role}}::is::user}}<section class="user-box"><img src="https://x/y.png"><risutextbox></risutextbox></section>{{/when}}',
        ].join('\n'),
        customCSS: '.char-box { border: 1px solid #444; }',
        regexRules: [
            {
                id: 'rx1',
                comment: 'Emphasize keyword',
                in: 'MAGIC',
                out: '<strong>MAGIC</strong>',
                type: 'editdisplay',
                flag: 'g',
                ableFlag: true,
                enabled: true,
            },
        ],
    };

    const charEvaluated = evaluatePreviewCBS(preset.guiHTML, 'char', { charName: 'Aria', userName: 'Alex' });
    assert.ok(charEvaluated.includes('Aria'));
    assert.ok(!charEvaluated.includes('user-box'));

    const userSanitized = sanitizeAndRenderGuiHtml(
        evaluatePreviewCBS(preset.guiHTML, 'user', { charName: 'Aria', userName: 'Alex' }),
        { renderTextbox: () => '<div class="prose">Hello</div>' },
    );
    assert.ok(!userSanitized.html.includes('<section'));
    assert.ok(!userSanitized.html.includes('https://x/y.png'));

    const srcdocDark = buildPreviewSrcdoc(preset, {
        palette: 'dark',
        roleFilter: 'char',
        applyRegex: true,
        customSampleText: 'Use MAGIC now',
        charName: 'Aria',
    });
    assert.ok(srcdocDark.includes('<!doctype html>'));
    assert.ok(srcdocDark.includes('Aria'));
    assert.ok(srcdocDark.includes('<strong>MAGIC</strong>'));
    assert.ok(srcdocDark.includes('.char-box { border: 1px solid #444; }'));

    const srcdocLightNoRegex = buildPreviewSrcdoc(preset, {
        palette: 'light',
        roleFilter: 'all',
        applyRegex: false,
        customSampleText: 'MAGIC unchanged',
    });
    assert.ok(srcdocLightNoRegex.includes('MAGIC unchanged'));
    assert.ok(!srcdocLightNoRegex.includes('<strong>MAGIC</strong>'));
    assert.ok(srcdocLightNoRegex.includes('message-edit-area'));

    const srcdocEditOnly = buildPreviewSrcdoc(preset, {
        palette: 'light',
        roleFilter: 'edit',
    });
    assert.ok(srcdocEditOnly.includes('<textarea class="message-edit-area"'));

    const srcdocSolidDark = buildPreviewSrcdoc(preset, {
        palette: 'dark',
        backdrop: 'solid',
    });
    assert.ok(srcdocSolidDark.includes('body { background: #181a20; }'));

    const srcdocSolidLight = buildPreviewSrcdoc(preset, {
        palette: 'light',
        backdrop: 'solid',
    });
    assert.ok(srcdocSolidLight.includes('body { background: #f3f4f6; }'));
});

test('storage & risu-bridge: load/save, JSON import/export, activatePreset, #customcss refresh, restoreVanilla, and regex hook', async () => {
    const mock = createMockRisuApi({
        theme: '',
        guiHTML: '<div>orig-vanilla-html</div>',
        customCSS: '/* orig vanilla css */',
        textTheme: 'standard',
    });

    const initialState = await loadPluginState(mock.api);
    assert.equal(initialState.activePresetId, null);
    assert.equal(getAllPresets(initialState).length, BUILTIN_PRESETS.length);

    const starter = getAllPresets(initialState)[0];
    const actRes = await activatePreset(starter, initialState, {}, mock.api);
    assert.equal(actRes.state.presets.length, 0); // 기본 제공을 적용해도 내 프리셋에 복사하지 않는다
    assert.equal(actRes.applied, true);
    assert.equal(actRes.cssRefreshed, true);
    assert.equal(mock.db.theme, 'customHTML');
    assert.equal(mock.db.guiHTML, starter.guiHTML);
    assert.equal(mock.db.customCSS, starter.customCSS);
    assert.equal(mock.calls.changeTextTheme.length, 1);
    assert.equal(actRes.state.activePresetId, starter.id);
    assert.equal(actRes.state.vanillaBackup.guiHTML, '<div>orig-vanilla-html</div>');
    assert.equal(actRes.state.vanillaBackup.customCSS, '/* orig vanilla css */');

    // Re-load from pluginStorage and verify persistence
    const reloaded = await loadPluginState(mock.api);
    assert.equal(reloaded.activePresetId, starter.id);
    assert.ok(await mock.api.pluginStorage.getItem(STORAGE_KEY_STATE));

    // Also test setCustomTextTheme refresh branch when host uses textTheme === 'custom'
    mock.db.textTheme = 'custom';
    const secondPreset = getAllPresets(reloaded)[1];
    const actCustomTextRes = await activatePreset(secondPreset, reloaded, {}, mock.api);
    assert.equal(mock.calls.setCustomTextTheme.length, 1);
    assert.equal(actCustomTextRes.state.vanillaBackup.guiHTML, '<div>orig-vanilla-html</div>');

    // Display regex hook test
    const customRegexPreset = {
        id: 'preset_rx_test',
        name: 'Regex Active Preset',
        description: 'test',
        guiHTML: '<div><risutextbox></risutextbox></div>',
        customCSS: '.box { color: #fff; }',
        regexRules: [
            {
                id: 'rx_rule_1',
                comment: 'Replace ping',
                in: 'PING',
                out: 'PONG',
                type: 'editdisplay',
                flag: 'g',
                ableFlag: true,
                enabled: true,
            },
        ],
    };
    const mergedImport = importPresetsJson(exportSinglePresetJson(customRegexPreset), actCustomTextRes.state, 'merge');
    const actRx = await activatePreset(customRegexPreset, mergedImport.state, {}, mock.api);
    let currentState = actRx.state;

    const hook = await registerDisplayRegexHook(() => currentState, mock.api);
    assert.equal(hook.registered, true);
    assert.equal(mock.calls.addRisuScriptHandler.length, 1);
    assert.equal(await hook.handler('Say PING!'), 'Say PONG!');

    // RisuAI 설정 화면의 체크박스는 '1' / '0' 문자열을 저장한다. 끄기 인자가 켜지면 원문 그대로 돌려준다.
    mock.args.disable_display_regex = '1';
    await hook.sync();
    assert.equal(await hook.handler('Say PING!'), 'Say PING!');
    mock.args.disable_display_regex = '0';
    await hook.sync();
    assert.equal(await hook.handler('Say PING!'), 'Say PONG!');

    // 활성 프리셋에 적용할 규칙이 없어지면 훅을 해제하고, 다시 생기면 재등록한다.
    const stateWithRules = currentState;
    currentState = { ...currentState, activePresetId: null };
    await hook.sync();
    assert.equal(hook.registered, false);
    assert.equal(mock.calls.removeRisuScriptHandler.length, 1);
    assert.equal(mock.scriptHandlers.display.length, 0);
    currentState = stateWithRules;
    await hook.sync();
    assert.equal(hook.registered, true);
    assert.equal(mock.scriptHandlers.display.length, 1);

    await hook.dispose();
    assert.equal(mock.calls.removeRisuScriptHandler.length, 2);
    assert.equal(mock.scriptHandlers.display.length, 0);

    // Export all & import replace
    const allBackupJson = exportAllPresetsJson(currentState);
    const replaced = importPresetsJson(allBackupJson, currentState, 'replace');
    assert.equal(replaced.importedCount, currentState.presets.length);

    // Restore vanilla
    const restored = await restoreVanilla(currentState, mock.api);
    assert.equal(restored.restored, true);
    assert.equal(restored.hadBackup, true);
    assert.equal(mock.db.theme, '');
    assert.equal(mock.db.guiHTML, '<div>orig-vanilla-html</div>');
    assert.equal(mock.db.customCSS, '/* orig vanilla css */');
    assert.equal(restored.state.activePresetId, null);
    assert.equal(restored.state.vanillaBackup, null);

    // Capture current vanilla as preset
    mock.db.theme = 'waifu';
    mock.db.guiHTML = '<div>captured-html</div>';
    mock.db.customCSS = '.captured { color: gold; }';
    const captured = await captureCurrentVanillaAsPreset('내 바닐라 백업', restored.state, mock.api);
    assert.equal(captured.preset.name, '내 바닐라 백업');
    assert.equal(captured.preset.guiHTML, '<div>captured-html</div>');
    assert.equal(captured.preset.customCSS, '.captured { color: gold; }');
});

test('initRisuThemePresetPlugin registers setting, action button, script handler, and cleans up on unload', async () => {
    globalThis.__RISU_THEME_PRESET_AUTO_INIT__ = false;
    const mock = createMockRisuApi();

    const instance = await initRisuThemePresetPlugin(mock.api);
    assert.equal(mock.calls.registerSetting.length, 1);
    assert.equal(mock.calls.registerButton.length, 1);
    assert.equal(mock.calls.registerButton[0].location, 'action');
    // 활성 프리셋이 없으면 display 훅을 걸지 않는다 (메시지마다 생기는 왕복 비용 방지).
    assert.equal(mock.calls.addRisuScriptHandler.length, 0);
    assert.equal(mock.calls.onUnload.length, 1);

    // 정규식 규칙이 있는 프리셋을 활성화하면 훅이 등록된다.
    const rxPreset = {
        id: 'preset_rx_init',
        name: 'Rx',
        guiHTML: '<div><risutextbox></risutextbox></div>',
        customCSS: '',
        regexRules: [{ id: 'r1', comment: 'c', in: 'A', out: 'B', type: 'editdisplay', flag: 'g', ableFlag: true, enabled: true }],
    };
    const act = await activatePreset(rxPreset, instance.getState(), {}, mock.api);
    instance.setState(act.state);
    await instance.regexHook.sync();
    assert.equal(mock.calls.addRisuScriptHandler.length, 1);
    assert.equal(await mock.scriptHandlers.display[0]('AAA'), 'BBB');

    await instance.dispose();
    assert.equal(mock.calls.removeRisuScriptHandler.length, 1);
    assert.equal(mock.calls.unregisterUIPart.length, 2);
});

test('sandboxed iframe: localStorage getter that throws must not break load/save', async () => {
    const original = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');
    Object.defineProperty(globalThis, 'localStorage', {
        configurable: true,
        get() {
            throw new Error("SecurityError: The document is sandboxed and lacks the 'allow-same-origin' flag.");
        },
    });
    try {
        const mock = createMockRisuApi();
        const state = await loadPluginState(mock.api);
        assert.equal(getAllPresets(state).length, BUILTIN_PRESETS.length);
        const saved = await savePluginState(state, mock.api);
        assert.equal(saved.saved, true);

        globalThis.__RISU_THEME_PRESET_AUTO_INIT__ = false;
        const instance = await initRisuThemePresetPlugin(mock.api);
        assert.ok(instance);
        await instance.dispose();
    } finally {
        if (original) {
            Object.defineProperty(globalThis, 'localStorage', original);
        } else {
            delete globalThis.localStorage;
        }
    }
});

test('storage failures never fall back to defaults silently', async () => {
    const mock = createMockRisuApi();
    const custom = await loadPluginState(mock.api);
    custom.presets = [{ id: 'mine', name: '내 프리셋', guiHTML: '<risutextbox></risutextbox>', customCSS: '' }];
    await savePluginState(custom, mock.api);

    // 읽기 실패 → 기본 상태를 돌려주지 않고 오류를 낸다 (다음 저장이 사용자 프리셋을 덮어쓰지 않게).
    const brokenRead = {
        ...mock.api,
        pluginStorage: { ...mock.api.pluginStorage, getItem: async () => { throw new Error('boom'); } },
    };
    await assert.rejects(() => loadPluginState(brokenRead), /읽지 못했습니다/);

    // 저장된 값이 없을 뿐이면 기본 상태로 시작한다.
    const empty = createMockRisuApi();
    assert.equal(getAllPresets(await loadPluginState(empty.api)).length, BUILTIN_PRESETS.length);

    // 쓰기 실패 → 성공한 척하지 않는다.
    const brokenWrite = {
        pluginStorage: { getItem: async () => null, setItem: async () => { throw new Error('quota'); } },
    };
    await assert.rejects(() => savePluginState(custom, brokenWrite), /저장되지 않았습니다/);

    // 같은 id가 겹치면 뒤쪽 항목에 새 id를 준다.
    const deduped = (await savePluginState(
        { presets: [{ id: 'x', name: 'a', guiHTML: '', customCSS: '' }, { id: 'x', name: 'b', guiHTML: '', customCSS: '' }] },
        mock.api,
    )).state;
    assert.equal(new Set(deduped.presets.map((p) => p.id)).size, 2);
});

test('risu-bridge: permission denial and missing backup never destroy vanilla settings', async () => {
    const preset = { id: 'p1', name: 'P1', guiHTML: '<div><risutextbox></risutextbox></div>', customCSS: '.a{}' };

    // DB 읽기 권한 거절: getDatabase()가 null → 빈 백업을 만들지 않고, 덮어쓰지도 않는다.
    const denyRead = createMockRisuApi({ guiHTML: '<b>mine</b>', customCSS: '.mine{}' });
    denyRead.api.getDatabase = async () => null;
    const s1 = await loadPluginState(denyRead.api);
    await assert.rejects(() => activatePreset(preset, s1, {}, denyRead.api), /읽기 권한/);
    assert.equal(denyRead.calls.setDatabaseLite.length, 0);
    assert.equal((await loadPluginState(denyRead.api)).vanillaBackup, null);

    // DB 쓰기 권한 거절: setDatabaseLite가 조용히 무시됨 → 성공으로 보고하지 않고 활성 표시도 남기지 않는다.
    const denyWrite = createMockRisuApi({ guiHTML: '<b>mine</b>', customCSS: '.mine{}' });
    denyWrite.api.setDatabaseLite = async () => {};
    const s2 = await loadPluginState(denyWrite.api);
    await assert.rejects(() => activatePreset(preset, s2, {}, denyWrite.api), /쓰기 권한/);
    assert.equal((await loadPluginState(denyWrite.api)).activePresetId, null);
    assert.equal(denyWrite.db.guiHTML, '<b>mine</b>');

    // 백업 없이 복원: 사용자의 현재 설정을 비우지 않는다.
    const noBackup = createMockRisuApi({ theme: 'customHTML', guiHTML: '<b>mine</b>', customCSS: '.mine{}' });
    const s3 = await loadPluginState(noBackup.api);
    const res = await restoreVanilla(s3, noBackup.api);
    assert.equal(res.restored, false);
    assert.equal(res.hadBackup, false);
    assert.equal(noBackup.calls.setDatabaseLite.length, 0);
    assert.equal(noBackup.db.customCSS, '.mine{}');

    // 텍스트 테마를 확인하지 못하면 사용자의 텍스트 테마를 'standard'로 바꾸지 않는다.
    const noTheme = createMockRisuApi({ textTheme: 'highcontrast' });
    noTheme.api.getTextTheme = async () => { throw new Error('x'); };
    const s4 = await loadPluginState(noTheme.api);
    const act = await activatePreset(preset, s4, {}, noTheme.api);
    assert.equal(act.cssRefreshed, false);
    assert.equal(noTheme.db.textTheme, 'highcontrast');
    assert.equal(noTheme.calls.changeTextTheme.length, 0);

    // highcontrast는 같은 값으로 다시 지정해 CSS만 갱신한다.
    const hc = createMockRisuApi({ textTheme: 'highcontrast' });
    await activatePreset(preset, await loadPluginState(hc.api), {}, hc.api);
    assert.deepEqual(hc.calls.changeTextTheme, ['highcontrast']);
});

test('rename-prefix follows renamed @keyframes into animation declarations; preview keeps entities', () => {
    const renamed = transformThemeMarkup(
        {
            guiHTML: '<div class="rt-card"><risutextbox></risutextbox></div>',
            customCSS: '@keyframes rt-spin { to { transform: rotate(1turn); } }\n.rt-card { animation: rt-spin 1s linear infinite; animation-name: rt-spin; }',
        },
        'rename-prefix',
        { fromPrefix: 'rt-', toPrefix: 'my-' },
    );
    assert.ok(renamed.customCSS.includes('@keyframes my-spin'));
    assert.ok(renamed.customCSS.includes('animation: my-spin 1s'));
    assert.ok(renamed.customCSS.includes('animation-name: my-spin'));
    assert.ok(!renamed.customCSS.includes('rt-'));

    // CBS 조건문 바로 뒤에 붙은 클래스도 바뀐다.
    const cbsRenamed = transformThemeMarkup(
        { guiHTML: '<div class="rt {{#when::{{role}}::is::char}}rt--char{{/when}}"><risutextbox></risutextbox></div>', customCSS: '.rt--char { color: red; }' },
        'rename-prefix',
        { fromPrefix: 'rt', toPrefix: 'my' },
    );
    assert.ok(cbsRenamed.guiHTML.includes('class="my {{#when::{{role}}::is::char}}my--char{{/when}}"'));

    const rendered = sanitizeAndRenderGuiHtml('<div>A &amp; B &lt;3 & C</div><risutextbox></risutextbox>');
    assert.ok(rendered.html.includes('A &amp; B &lt;3 &amp; C'));

    const converted = convertRegexOutToCustomHtml('<div class="x">{{data}} / $2</div>');
    assert.ok(converted.warnings.some((w) => w.includes('$2')));

    // 커스텀 샘플을 비우면 짧은 샘플과 긴 샘플이 각각 쓰인다.
    const doc = buildPreviewSrcdoc(
        { guiHTML: '<div><risutextbox></risutextbox></div>', customCSS: '', regexRules: [] },
        { roleFilter: 'char', customSampleText: '' },
    );
    assert.ok(doc.includes('오늘 하루는 어땠어'));
    assert.ok(doc.includes('관측 기록'));
});

test('프리셋 그룹: 묶기, 순서, 빼기, 하나 남으면 해제, 이름 번호', () => {
    const mk = (id) => ({ id, name: id, guiHTML: '<risutextbox></risutextbox>', customCSS: '' });
    let state = normalizePluginState({ presets: [mk('a'), mk('b'), mk('c'), mk('d')], knownBuiltinIds: [] });

    // a를 b 가운데에 놓으면 "새 그룹 1"이 생기고 b 뒤에 a가 온다
    state = applyPresetDrop(state, 'a', { type: 'into-preset', targetId: 'b' });
    assert.equal(state.groups.length, 1);
    assert.equal(state.groups[0].name, '새 그룹 1');
    assert.deepEqual(state.presets.map((p) => p.id), ['b', 'a', 'c', 'd']);
    const g1 = state.groups[0].id;
    assert.equal(state.presets.find((p) => p.id === 'a').groupId, g1);
    assert.equal(state.presets.find((p) => p.id === 'b').groupId, g1);

    // c를 d 가운데에 놓으면 "새 그룹 2"
    state = applyPresetDrop(state, 'c', { type: 'into-preset', targetId: 'd' });
    assert.deepEqual(state.groups.map((g) => g.name), ['새 그룹 1', '새 그룹 2']);
    assert.equal(nextGroupName(state.groups), '새 그룹 3');

    // d를 a 앞 가장자리에 놓으면 그룹 1로 옮겨 가고, 그룹 2는 c 하나만 남아 풀린다
    state = applyPresetDrop(state, 'd', { type: 'before', targetId: 'a' });
    assert.deepEqual(state.presets.map((p) => p.id), ['b', 'd', 'a', 'c']);
    assert.equal(state.groups.length, 1);
    assert.equal(state.presets.find((p) => p.id === 'c').groupId, null);
    assert.equal(state.presets.find((p) => p.id === 'd').groupId, g1);

    // 이름 바꾸기, 그룹 밖 맨 뒤로 빼기
    state = renameGroup(state, g1, '내 테마');
    assert.equal(state.groups[0].name, '내 테마');
    state = applyPresetDrop(state, 'b', { type: 'end' });
    assert.deepEqual(state.presets.map((p) => p.id), ['d', 'a', 'c', 'b']);
    assert.equal(state.presets.find((p) => p.id === 'b').groupId, null);

    // 그룹에서 빼서 하나만 남으면 그룹이 풀린다
    state = movePresetToGroup(state, 'a', { groupId: null });
    assert.equal(state.groups.length, 0);
    assert.ok(state.presets.every((p) => p.groupId === null));

    // 내보내기/가져오기는 그룹 이름으로 옮긴다
    state = applyPresetDrop(state, 'a', { type: 'into-preset', targetId: 'b' });
    const bundle = exportAllPresetsJson(state);
    assert.ok(!bundle.includes('"groupId"'));
    assert.ok(bundle.includes('"groupName": "새 그룹 1"'));
    const fresh = normalizePluginState({ presets: [mk('x')], knownBuiltinIds: [] });
    const imported = importPresetsJson(bundle, fresh, 'merge').state;
    assert.equal(imported.groups.length, 1);
    assert.equal(imported.presets.filter((p) => p.groupId === imported.groups[0].id).length, 2);
});
