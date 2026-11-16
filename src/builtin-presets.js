/**
 * 플러그인에 기본으로 들어 있는 프리셋 목록.
 *
 * 대상별 분류와 변주는 theme-families.js에서 만든다. 에코는 따로 설계한 프리셋이라 그대로 둔다.
 * 각 프리셋의 groupName으로, 설치할 때 분류별 그룹에 들어간다.
 * file은 결과물/프리셋 폴더에 내보낼 때의 파일 이름이다.
 */
import { ECHO_PRESET } from './preset-echo.js';
import { FAMILY_PRESETS } from './theme-families.js';

/** 플러그인이 기본으로 제공하는 프리셋 전부. */
export const BUILTIN_PRESETS = [{ ...ECHO_PRESET, file: '00-에코-글래스-메신저' }, ...FAMILY_PRESETS];
