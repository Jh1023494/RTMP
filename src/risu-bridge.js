import { applyRegexRules } from './regex-engine.js';
import { validateTheme, hoistImports, sanitizeCssCommentText } from './preview-engine.js';
import {
    createPresetId,
    normalizePresetItem,
    normalizePluginState,
    savePluginState,
    isBuiltinId,
    findPreset,
    presetHasHtml,
    presetHasCss,
    hasPresetContent,
} from './storage.js';

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
export const ARG_DISABLE_DISPLAY_REGEX = 'disable_display_regex';

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
export async function getVanillaState(api = globalThis.risuai) {
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
export async function refreshHostCSS(api = globalThis.risuai, preloadedTextInfo = null) {
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

export function computeNextAppliedIds(state, preset, overrides = null) {
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

export function composeApplied(state, overrides = null) {
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

export async function activatePreset(preset, state, options = {}, api = globalThis.risuai) {
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

export async function restoreVanilla(state, api = globalThis.risuai) {
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

export async function deactivatePreset(presetId, state, api = globalThis.risuai) {
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

export async function setStackPresets(enabled, state, api = globalThis.risuai) {
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
export async function syncAppliedStateToRisu(prevState, nextState, api = globalThis.risuai) {
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

export async function captureCurrentVanillaAsPreset(name, state, api = globalThis.risuai) {
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
export function isArgChecked(value) {
    return value === 1 || value === '1' || value === true || value === 'true';
}

export async function readDisplayRegexEnabled(api = globalThis.risuai) {
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
export function getActiveDisplayRules(state) {
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
export async function registerDisplayRegexHook(getStateFn, api = globalThis.risuai) {
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
