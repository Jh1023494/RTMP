/**
 * 배포용 폴더(결과물/)를 만든다.
 *  - 결과물/risu-theme-preset-v3.js     : RisuAI에 올리는 플러그인 파일
 *  - 결과물/프리셋/*.json               : 플러그인 ⋯ 메뉴의 "파일 불러오기"로 가져오는 프리셋 파일
 *  - 결과물/프리셋/전체-프리셋-묶음.json : 위 프리셋을 한 번에 가져오는 묶음
 *
 * 프리셋 내용은 src/builtin-presets.js에서 만든다. 플러그인에도 같은 프리셋이 기본으로 들어 있다.
 *
 * 버전 올리기: npm run release -- patch | minor | major
 *  src/meta.js의 //@version과 package.json의 version을 함께 올린 뒤 빌드한다.
 *  RisuAI는 //@update-url의 파일에서 //@version을 읽어 설치된 버전보다 높을 때만 업데이트한다.
 *  인자 없이 실행하면 버전을 그대로 두고 다시 빌드만 한다.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import { BUILTIN_PRESETS } from '../src/builtin-presets.js';
import { validateTheme } from '../src/preview-engine.js';
import { exportSinglePresetJson, normalizePresetItem } from '../src/storage.js';
import { buildPluginBundle } from './build.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const META_PATH = path.resolve(__dirname, '..', 'src', 'meta.js');
const PACKAGE_PATH = path.resolve(__dirname, '..', 'package.json');

/** 버전 문자열을 patch / minor / major 단위로 올린다. */
export function nextVersion(current, kind) {
    const match = /^(\d+)\.(\d+)\.(\d+)$/.exec(String(current).trim());
    if (!match) {
        throw new Error(`버전 형식이 MAJOR.MINOR.PATCH가 아닙니다: ${current}`);
    }
    let [major, minor, patch] = match.slice(1).map(Number);
    if (kind === 'major') {
        major += 1;
        minor = 0;
        patch = 0;
    } else if (kind === 'minor') {
        minor += 1;
        patch = 0;
    } else if (kind === 'patch') {
        patch += 1;
    } else {
        throw new Error(`버전 단위는 patch, minor, major 중 하나여야 합니다: ${kind}`);
    }
    return `${major}.${minor}.${patch}`;
}

/** src/meta.js와 package.json의 버전을 함께 올리고 새 버전을 돌려준다. */
export async function bumpVersion(kind) {
    const meta = await fs.readFile(META_PATH, 'utf8');
    const versionMatch = /^\/\/@version\s+(\S+)\s*$/m.exec(meta);
    if (!versionMatch) {
        throw new Error('src/meta.js에서 //@version 줄을 찾지 못했습니다.');
    }
    const next = nextVersion(versionMatch[1], kind);
    await fs.writeFile(META_PATH, meta.replace(versionMatch[0], `//@version ${next}`), 'utf8');

    const pkg = JSON.parse(await fs.readFile(PACKAGE_PATH, 'utf8'));
    pkg.version = next;
    await fs.writeFile(PACKAGE_PATH, `${JSON.stringify(pkg, null, 2)}\n`, 'utf8');
    return { from: versionMatch[1], to: next };
}
const ROOT_DIR = path.resolve(__dirname, '..');
const RELEASE_DIR = path.join(ROOT_DIR, '결과물');
const PRESET_DIR = path.join(RELEASE_DIR, '프리셋');

/** 내장 프리셋과 같은 내용을 파일로도 내보낸다 (다른 사람에게 건네거나 지운 프리셋을 되살릴 때 쓴다). */
export function buildReleasePresets() {
    return BUILTIN_PRESETS.map((raw) => {
        const preset = normalizePresetItem(raw);
        const validation = validateTheme(preset.guiHTML, preset.customCSS);
        if (!validation.valid) {
            throw new Error(`${preset.name}: ${validation.errors.join(' / ')}`);
        }
        return { file: raw.file, preset, groupName: raw.groupName || null };
    });
}

export async function buildRelease() {
    const bundle = await buildPluginBundle();
    const presets = buildReleasePresets();

    await fs.rm(RELEASE_DIR, { recursive: true, force: true });
    await fs.mkdir(PRESET_DIR, { recursive: true });

    const pluginPath = path.join(RELEASE_DIR, 'risu-theme-preset-v3.js');
    await fs.copyFile(bundle.bundlePath, pluginPath);

    for (const { file, preset, groupName } of presets) {
        await fs.writeFile(path.join(PRESET_DIR, `${file}.json`), exportSinglePresetJson(preset, groupName), 'utf8');
    }
    await fs.writeFile(
        path.join(PRESET_DIR, '전체-프리셋-묶음.json'),
        // 기본 제공 프리셋 전부를 한 파일로 (그룹 이름 포함). 같은 내용은 플러그인에 이미 들어 있다.
        JSON.stringify(
            {
                format: 'risu-theme-preset-bundle',
                version: 1,
                exportedAt: new Date().toISOString(),
                presets: presets.map(({ preset, groupName }) => {
                    const { groupId, ...rest } = preset;
                    return groupName ? { ...rest, groupName } : rest;
                }),
            },
            null,
            2,
        ),
        'utf8',
    );

    const guide = [
        '# Risu Theme Preset & Preview Manager',
        '',
        '## 설치',
        '1. RisuAI 설정 → 플러그인에서 `risu-theme-preset-v3.js`를 불러옵니다.',
        '2. 플러그인 설정의 **테마 프리셋 & 미리보기 관리자**를 눌러 관리자 창을 엽니다.',
        '3. 프리셋을 처음 적용할 때 RisuAI가 데이터베이스 읽기·쓰기 권한을 묻습니다. 허용해야 적용됩니다.',
        '',
        '## 관리자 창',
        '- **? 버튼(도움말 모드)**: 켜고 항목을 누르면 실제 동작 대신 설명이 뜹니다. ?나 Esc로 끕니다. PC에서는 항목에 마우스를 올려도 한 줄 설명이 뜹니다.',
        '- **목록**: 프리셋을 누르면 편집 화면에 열립니다. RisuAI에 적용 중인 프리셋에는 `적용 중`이 붙습니다.',
        '- **새 프리셋**: 이름, 메모, 빈 HTML·CSS 칸이 열립니다. `저장`을 눌러야 목록에 저장됩니다.',
        '- **저장**: 바뀐 내용이 있을 때만 눌립니다. Ctrl+S(맥은 Cmd+S)로도 저장됩니다.',
        '- **RisuAI에 적용**: 저장한 뒤 이 프리셋을 RisuAI의 Custom HTML·CSS로 씁니다.',
        '- **HTML·CSS 편집창**: Tab은 공백 2칸 들여쓰기, Shift+Tab은 내어쓰기입니다. 이름표 옆 `복사`로 코드만 복사합니다.',
        '- **⋯ 메뉴**: 복제, JSON 내보내기(클립보드 복사), JSON 붙여넣기, 파일 불러오기, 전체 백업 복사, RisuAI 현재 설정 가져오기, 원래 테마로 복원.',
        '- **휴대폰**: 위쪽 `목록 · 편집 · 미리보기` 탭으로 화면을 바꿉니다.',
        '',
        '## 프리셋',
        '아래 프리셋은 플러그인에 기본으로 들어 있어 따로 가져올 필요가 없습니다.',
        '`프리셋` 폴더의 json은 같은 내용의 파일입니다. 목록에서 지운 프리셋을 되살리거나 다른 사람에게 건넬 때 ⋯ 메뉴의 **파일 불러오기**나 **JSON 붙여넣기**로 가져옵니다.',
        '',
        '| 파일 | 설명 |',
        '| --- | --- |',
        ...presets.map(({ file, preset }) => `| \`${file}.json\` | ${preset.description.split(/\n/).join(' — ')} |`),
        '| `전체-프리셋-묶음.json` | 위 프리셋을 한 번에 가져옵니다. |',
        '',
        '색과 분위기를 바꾸려면 Custom CSS 맨 아래 "배색과 소재" 블록의 값만 고치면 됩니다. 같은 분류의 다른 프리셋에서 이 블록을 복사해 붙이면 그 변주가 됩니다. 글자 크기는 "글꼴과 크기" 블록의 font-size 값으로 바꿉니다.',
        '',
    ].join('\n');
    await fs.writeFile(path.join(RELEASE_DIR, '사용법.md'), guide, 'utf8');

    return { releaseDir: RELEASE_DIR, pluginPath, presets, byteSize: bundle.byteSize };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
    const bumpKind = process.argv[2];
    (bumpKind ? bumpVersion(bumpKind) : Promise.resolve(null))
        .then((bumped) => {
            if (bumped) {
                console.log(`Version: ${bumped.from} -> ${bumped.to}`);
            }
            return buildRelease();
        })
        .then((res) => {
            console.log(`Release folder: ${res.releaseDir}`);
            console.log(`Plugin: ${res.pluginPath} (${res.byteSize} bytes)`);
            for (const { file, preset } of res.presets) {
                console.log(`Preset: ${file}.json (${preset.name})`);
            }
        })
        .catch((err) => {
            console.error(err);
            process.exit(1);
        });
}
