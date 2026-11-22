import { BUILTIN_PRESETS } from './builtin-presets.js';
import { LEGACY_BUILTIN_FINGERPRINTS } from './legacy-builtin-fingerprints.js';
import { createRegexRuleId } from './regex-engine.js';

export const STORAGE_KEY_STATE = 'risu_theme_preset_v3_state_v1';

export function createPresetId() {
    const rand = Math.random().toString(36).slice(2, 8);
    return `preset_${Date.now().toString(36)}_${rand}`;
}

/**
 * 프리셋 내용(HTML·CSS)의 지문. 저장된 복사본이 어느 버전의 기본 프리셋과 똑같은지 가릴 때 쓴다.
 * FNV-1a 32비트와 글자 수를 함께 쓴다.
 */
export function presetFingerprint(preset) {
    const text = `${preset?.guiHTML ?? ''}\n\u0000\n${preset?.customCSS ?? ''}`;
    let hash = 0x811c9dc5;
    for (let i = 0; i < text.length; i += 1) {
        hash ^= text.charCodeAt(i);
        hash = Math.imul(hash, 0x01000193) >>> 0;
    }
    return `${text.length.toString(36)}-${hash.toString(16).padStart(8, '0')}`;
}

export function createGroupId() {
    const rand = Math.random().toString(36).slice(2, 8);
    return `group_${Date.now().toString(36)}_${rand}`;
}

export const NEW_GROUP_BASE_NAME = '새 그룹';

/** "새 그룹 n"에서 비어 있는 가장 작은 n을 골라 이름을 만든다. */
export function nextGroupName(groups = []) {
    const used = new Set(groups.map((g) => g.name));
    let n = 1;
    while (used.has(`${NEW_GROUP_BASE_NAME} ${n}`)) {
        n += 1;
    }
    return `${NEW_GROUP_BASE_NAME} ${n}`;
}

export function normalizeRegexRuleItem(raw, index = 0) {
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

export function normalizePresetItem(raw, index = 0) {
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

export function presetHasHtml(preset) {
    return typeof preset?.guiHTML === 'string' && preset.guiHTML.trim().length > 0;
}

export function presetHasCss(preset) {
    return typeof preset?.customCSS === 'string' && preset.customCSS.trim().length > 0;
}

export function presetHasRegex(preset) {
    return Array.isArray(preset?.regexRules) && preset.regexRules.some((rule) => rule && typeof rule.in === 'string' && rule.in.trim().length > 0);
}

/** HTML·CSS·정규식(찾을 패턴이 있는 규칙) 중 하나라도 채워져 있는지 확인한다. */
export function hasPresetContent(preset) {
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
export function assignPresetsToGroupByName(state, presetIds, groupName) {
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
export function getPresetGroupName(state, preset) {
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
export function applyPresetDrop(rawState, dragId, drop) {
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

export function renameGroup(rawState, groupId, name) {
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

export function setGroupCollapsed(rawState, groupId, collapsed) {
    const state = normalizePluginState(rawState);
    return normalizePluginState({
        ...state,
        groups: state.groups.map((g) => (g.id === groupId ? { ...g, collapsed: Boolean(collapsed) } : g)),
    });
}

/** 프리셋을 기존 그룹으로 옮기거나(groupId), 새 그룹을 만들어 넣거나(newGroupName), 그룹에서 뺀다(null). */
export function movePresetToGroup(rawState, presetId, { groupId = null, newGroupName = null } = {}) {
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

export function normalizeVanillaBackup(raw) {
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

export const STATE_SCHEMA_VERSION = 3;

// ───────────────────────── 기본 제공 프리셋 ─────────────────────────
// 기본 제공 프리셋은 저장하지 않고 매번 코드(BUILTIN_PRESETS)에서 읽는다.
// 저장소에는 사용자 프리셋과, 기본 제공 프리셋에 대한 사용자의 선택(숨김, 그룹 펼침)만 남긴다.

let builtinCache = null;

/** 기본 제공 프리셋 목록 (코드 순서). 각 항목에 builtin: true와 groupName이 붙는다. */
export function getBuiltinPresets() {
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

export function isBuiltinId(id) {
    return getBuiltinPresets().some((p) => p.id === id);
}

export function getBuiltinPreset(id) {
    return getBuiltinPresets().find((p) => p.id === id) || null;
}

/** 숨기지 않은 기본 제공 프리셋 */
export function getVisibleBuiltins(state) {
    const hidden = new Set(state?.hiddenBuiltinIds || []);
    return getBuiltinPresets().filter((p) => !hidden.has(p.id));
}

/** 목록에 보이는 프리셋 전부: 숨기지 않은 기본 제공 + 사용자 프리셋 */
export function getAllPresets(state) {
    return [...getVisibleBuiltins(state), ...(state?.presets || [])];
}

/** id로 프리셋을 찾는다. 사용자 프리셋을 먼저 보고, 없으면 기본 제공(숨긴 것 포함)에서 찾는다. */
export function findPreset(state, id) {
    if (!id) {
        return null;
    }
    return (state?.presets || []).find((p) => p.id === id) || getBuiltinPreset(id);
}

/** 기본 제공 프리셋을 숨긴다 (삭제 대신). */
export function hideBuiltin(rawState, id) {
    const state = normalizePluginState(rawState);
    if (!isBuiltinId(id)) {
        return state;
    }
    return normalizePluginState({ ...state, hiddenBuiltinIds: [...state.hiddenBuiltinIds, id] });
}

/** 숨긴 기본 제공 프리셋을 다시 보이게 한다. ids를 비우면 모두 되살린다. */
export function unhideBuiltins(rawState, ids = null) {
    const state = normalizePluginState(rawState);
    const target = ids ? new Set(ids) : null;
    return normalizePluginState({
        ...state,
        hiddenBuiltinIds: target ? state.hiddenBuiltinIds.filter((id) => !target.has(id)) : [],
    });
}

/** 기본 제공 그룹의 펼침 상태. 기본값은 접힘이다. */
export function setBuiltinGroupExpanded(rawState, groupName, expanded) {
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
export function makeUserCopyOfBuiltin(preset, suffix = '(수정)') {
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

export function getDefaultPluginState() {
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
export function migrateLegacyState(raw) {
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

export function normalizePluginState(raw) {
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

export async function loadPluginState(api = globalThis.risuai) {
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

export async function savePluginState(state, api = globalThis.risuai) {
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

export function exportAllPresetsJson(state) {
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

export function exportSinglePresetJson(preset, groupName = null) {
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

export function importPresetsJson(jsonString, state, mode = 'merge') {
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
