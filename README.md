# Risu Theme Preset & Preview Manager (`//@api 3.0`)

RisuAI 바닐라의 Custom HTML (`guiHTML`) 및 Custom CSS (`customCSS`)를 프리셋 단위로 안전하게 관리하고, 실시간 미리보기와 정규식 변환(`editdisplay` 훅 및 마크업/CSS 일괄 변환)을 지원하는 **RisuAI Plugin API v3.0** 플러그인입니다.

## 핵심 특징

- **바닐라 호환 및 비침습적 덮어쓰기**
  - 프리셋 적용 시 `risuai.setDatabaseLite({ theme: 'customHTML', guiHTML, customCSS })`를 통해 RisuAI 데이터베이스에 직접 기록하며, 첫 적용 직전의 바닐라 `theme / guiHTML / customCSS`를 플러그인 내부 저장소에 백업합니다.
  - `getTextTheme()` 확인 후 `changeTextTheme()` / `setCustomTextTheme()`를 재호출하여 `mainDom` 권한 없이도 호스트의 `<style id="customcss">`를 즉시 갱신합니다.
  - **플러그인 삭제 후에도 별도 후처리가 필요 없습니다.** 적용된 HTML/CSS는 RisuAI 자체 설정으로 남아 바닐라와 동일하게 동작하며, 삭제 전에 원하면 관리자 창 ⋯ 메뉴의 `원래 테마로 복원`으로 되돌릴 수 있습니다. 단, 프리셋의 디스플레이 정규식은 플러그인이 실행 중일 때만 적용되므로 삭제하면 함께 꺼집니다.
- **프리셋 중복 적용 (선택 옵션)**
  - `⋯` 메뉴의 **프리셋 중복 적용**을 켜면(기본값 꺼짐) HTML이 없는 CSS·정규식 전용 프리셋을 기존 테마 위에 순서대로 겹쳐 적용할 수 있습니다.
  - HTML이 있는 프리셋은 항상 맨 앞(1번) 자리만 교체하며, 겹쳐 둔 CSS·정규식 프리셋은 그대로 남습니다.
  - 2개 이상의 CSS 조각을 합칠 때는 각 조각에 구분 주석을 붙이고 `@charset`·`@import`를 맨 위로 모읍니다(CSS 조각이 1개뿐이면 원본 그대로 기록).
  - HTML 없이 CSS만 적용하면 원래 RisuAI 테마·HTML 위에 쓰되 바닐라 `customCSS`는 포함하지 않으며, 겹친 CSS는 선택자 우선순위가 같거나 더 높아야(`!important` 포함 규칙 등) 기존 스타일을 덮어씁니다.
  - 상단 `적용 중` 배지(모바일은 목록 상단 표시줄)나 편집 상단의 `적용 해제` 버튼으로 개별 해제할 수 있으며, 마지막 프리셋을 해제하면 바닐라 설정으로 복원합니다.
- **실시간 샌드박스 미리보기**
  - RisuAI `Chat.svelte` 허용 태그/슬롯(`<risutextbox>`, `<risuicon>`, `<risubuttons>`, `<risugeninfo>`) 화이트리스트와 CBS 분기(`{{#when}}`)를 시뮬레이션하여 `<iframe sandbox="allow-same-origin">`에 실시간 렌더링합니다.
  - 다크/라이트 배색, 뷰포트 너비(`100%` / `520px` / `390px`), 역할 필터(`all` / `char` / `user` / `edit`), 커스텀 샘플 메시지 및 프리셋 정규식 반영 여부를 조절할 수 있습니다.
- **정규식 변환 지원**
  - **Risu Regex OUT 템플릿 변환기**: `$&`, `$1`, `{{data}}`, `<style>` 블록이 포함된 Regex OUT 템플릿을 Custom HTML / CSS 초안으로 변환합니다.
  - **원클릭 마크업/CSS 변환**: 레거시 `{{#if ...}}` → `{{#when::...}}` 변환, 자기닫힘 슬롯(`<risuicon/>` 등) 수정, 클래스 접두사 일괄 변경, 사용자 지정 정규식 치환(`guiHTML` / `customCSS` / `both`)을 지원합니다.
  - **런타임 디스플레이 정규식 (`display` 훅)**: 프리셋별 `editdisplay` 규칙을 관리하고 Risu 정규식 JSON(`{"type":"regex","data":[...]}`) 가져오기/내보내기를 지원합니다.
- **프리셋 가져오기 / 내보내기**
  - 관리자 창 ⋯ 메뉴에서 프리셋 JSON·전체 백업 JSON(병합/교체)·Risu 정규식 JSON을 붙여넣거나 `.json` 파일로 불러옵니다. 내보내기는 클립보드 복사로 하며, 복사가 막히면 내용을 띄워 직접 복사하게 합니다.

## 동작 조건과 안전장치

- **권한**: 프리셋을 적용하거나 바닐라 설정을 가져올 때 RisuAI가 데이터베이스 읽기·쓰기 권한을 묻습니다. 거절하면 아무것도 덮어쓰지 않고 오류를 알립니다. 쓰기 뒤에는 값을 다시 읽어 실제로 반영됐는지 확인합니다.
- **바닐라 백업**: 처음 덮어쓰기 전에 백업을 먼저 저장하고, 그다음에 덮어씁니다. 백업이 없는 상태에서 `원래 테마로 복원`을 눌러도 현재 설정을 비우지 않습니다.
- **저장 실패**: 프리셋 저장소를 읽거나 쓰지 못하면 기본 프리셋으로 덮어쓰지 않고 오류를 냅니다.
- **디스플레이 정규식 훅**: 활성 프리셋에 켜진 규칙이 있을 때만 `display` 훅을 등록합니다. 규칙이 없으면 훅을 걸지 않으므로 채팅 렌더링에 부담을 주지 않습니다.
- **플러그인 인자**
  - `disable_display_regex` (체크박스): 체크하면 활성 프리셋의 정규식을 채팅에 적용하지 않습니다. 기본값은 적용입니다.
  - `default_preview_palette` (다크/라이트): 관리자 창을 열 때 미리보기의 기본 배색입니다.

## 개발할 때 지켜야 할 것

RisuAI는 v3 플러그인을 `allow-same-origin` 없는 샌드박스 iframe에서, 코드를 `<script>` 요소 안에 그대로 넣어 실행합니다.

- 번들에 `<!--`, `<script`, `</script` 문자열이 있으면 HTML 파서가 스크립트를 끝내지 못해 플러그인이 실행되지 않습니다. 소스에서는 `\x3C`, `\x21`로 적습니다. `npm run build`가 이 문자열을 검사해 있으면 빌드를 실패시킵니다.
- `window.localStorage`는 읽기만 해도 예외가 납니다. 저장은 `risuai.pluginStorage`를 씁니다.
- `dist/demo-harness.html`은 샌드박스 없이 띄우는 데모입니다. 위 두 조건은 여기서 드러나지 않으므로, 배포 전에는 RisuAI에 직접 올려 확인합니다.

## 프로젝트 구조

```text
risu-theme-preset-v3/
├─ package.json
├─ types/risuai.d.ts           # RisuAI Plugin API v3.0 타입 정의 참조
├─ src/
│  ├─ meta.js                  # //@api 3.0 메타데이터 헤더
│  ├─ defaults.js              # 기본 내장 프리셋 2종 및 호스트 CSS 시뮬레이션 상수
│  ├─ storage.js               # pluginStorage / safeLocalStorage 백업 및 JSON I/O
│  ├─ regex-engine.js          # 플래그 파싱, OUT→HTML, 일괄 변환, Risu 정규식 I/O
│  ├─ preview-engine.js        # CBS 평가, 태그/슬롯 검증(validateTheme), srcdoc 생성
│  ├─ risu-bridge.js           # setDatabaseLite 덮어쓰기, #customcss 동기화, display 훅
│  ├─ help-copy.js             # 도움말 문구 (빌드할 때 docs/help-copy.json에서 다시 만듦)
│  ├─ ui.js                    # 관리자 UI (3열, 좁은 화면은 목록·편집·미리보기 탭)
│  └─ index.js                 # 플러그인 진입점 (setting/button 등록 및 onUnload 정리)
├─ scripts/build.mjs           # RisuAI v3 단일 번들 및 브라우저 데모 하네스 생성
├─ tests/plugin.test.mjs       # Node 내장 테스트 (단위 + Mock RisuAI v3 통합 검증)
└─ dist/
   ├─ risu-theme-preset-v3.js  # RisuAI에 직접 업로드 가능한 단일 번들 플러그인
   └─ demo-harness.html        # 독립 실행형 브라우저 테스트 하네스
```

## 빌드 및 테스트

외부 npm 패키지 의존성 없이 Node.js v20+ 환경에서 바로 실행됩니다.

```bash
npm run build
npm test
```

## 업데이트 배포

`src/meta.js`의 `//@update-url`은 이 저장소의 `dist/risu-theme-preset-v3.js`를 가리킵니다. RisuAI는 이 파일의 `//@version`을 읽어, 설치된 버전보다 높으면 업데이트합니다.

1. 버전을 올려 빌드합니다. `npm run release -- patch` (고침), `minor` (기능 추가), `major` (호환이 깨지는 변경) 중 하나를 씁니다.
2. `npm test`로 확인한 뒤 커밋하고 `main` 브랜치에 푸시합니다.

버전을 올리지 않고 파일만 바꿔 푸시하면 RisuAI는 업데이트로 보지 않습니다. `//@name`은 RisuAI가 같은 플러그인인지 알아보는 값이므로 바꾸지 않습니다.

## RisuAI 설치 방법

1. `npm run build` 실행 후 생성된 `dist/risu-theme-preset-v3.js` 파일을 RisuAI 플러그인 설정에서 불러옵니다.
2. 채팅 상단/액션 메뉴의 **테마 프리셋 & 미리보기** 버튼 또는 플러그인 설정의 **테마 프리셋 & 미리보기 관리자**를 클릭해 관리자 창을 엽니다.
3. 브라우저 단독으로 동작을 미리 체험하려면 `dist/demo-harness.html` 파일을 웹 브라우저로 열 수 있습니다.
