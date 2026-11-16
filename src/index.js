import { loadPluginState } from './storage.js';
import {
    activatePreset,
    restoreVanilla,
    captureCurrentVanillaAsPreset,
    getVanillaState,
    registerDisplayRegexHook,
} from './risu-bridge.js';
import { createPluginUI } from './ui.js';

const SETTING_ICON_HTML = '<span>🎨</span>';

export async function initRisuThemePresetPlugin(api = globalThis.risuai) {
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
