import { applyRegexRules } from './regex-engine.js';
import { validateTheme } from './preview-engine.js';
import { createPresetId, normalizePresetItem, normalizePluginState, savePluginState, isBuiltinId, findPreset } from './storage.js';

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

export async function activatePreset(preset, state, options = {}, api = globalThis.risuai) {
    if (!preset || typeof preset !== 'object') {
        throw new Error('활성화할 프리셋이 올바르지 않습니다.');
    }
    if (!api || typeof api.setDatabaseLite !== 'function') {
        throw new Error('RisuAI setDatabaseLite API를 사용할 수 없습니다.');
    }

    const normalizedPreset = normalizePresetItem(preset);
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

    const textInfo = await readTextThemeSafely(api);

    // 2) 덮어쓰고 반영 여부를 확인한다.
    await writeThemeToDatabase(api, {
        theme: 'customHTML',
        guiHTML: normalizedPreset.guiHTML,
        customCSS: normalizedPreset.customCSS,
    });

    const cssResult = await refreshHostCSS(api, textInfo);

    // 3) 활성 프리셋을 기록한다.
    const saveResult = await savePluginState(
        {
            ...baseState,
            vanillaBackup,
            activePresetId: normalizedPreset.id,
            presets: nextPresets,
        },
        api,
    );

    return {
        applied: true,
        state: saveResult.state,
        preset: normalizedPreset,
        validation,
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
        if (!baseState.activePresetId) {
            return { restored: false, hadBackup: false, state: baseState, cssRefreshed: false };
        }
        const cleared = await savePluginState({ ...baseState, activePresetId: null }, api);
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
            activePresetId: null,
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

/** 활성 프리셋에서 실제로 적용될 디스플레이 정규식 규칙만 고른다. */
export function getActiveDisplayRules(state) {
    if (!state || !state.activePresetId) {
        return [];
    }
    // 기본 제공 프리셋(코드)도 찾는다. 양쪽 프리셋은 디스플레이 정규식으로 반대편 이미지를 넣는다.
    const activePreset = findPreset(state, state.activePresetId);
    if (!activePreset || !Array.isArray(activePreset.regexRules)) {
        return [];
    }
    return activePreset.regexRules.filter(
        (rule) =>
            rule &&
            rule.enabled !== false &&
            (!rule.type || rule.type === 'editdisplay') &&
            typeof rule.in === 'string' &&
            rule.in !== '',
    );
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
