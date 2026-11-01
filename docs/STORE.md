# 앱 스토어 등록 정보

Mac App Store(App Store Connect)와 Microsoft Store(Partner Center)에 등록할 때 쓰는 값입니다. 가격은 **무료**, 앱 안 결제는 없습니다.

## 공통

| 항목 | 값 |
|---|---|
| 앱 이름 | Typing Warrior |
| 부제 (30자) | 말씀과 문학으로 배우는 한글·영문 타자 / Type Scripture & poetry |
| 분류 | 교육(Education) · 보조 분류: 참고(Reference) |
| 가격 | 무료 |
| 개발자 | Gihyun Park (박기현) |
| 홈페이지(마케팅 URL) | https://jesusiswith.us |
| 지원 URL | https://github.com/ccumgol/typing-warrior/issues |
| 후원 | https://buymeacoffee.com/ccumgol |
| 소스 코드 | https://github.com/ccumgol/typing-warrior (MIT) |
| 개인정보 | 수집하지 않음. 기록은 이 컴퓨터에만 저장. 인터넷은 사용자가 직접 실행하는 "API.Bible에서 받기"만 사용 |
| 연령 등급 | 전체 이용가 (게임은 만화풍 전투 표현 — 등급 설문에서 "가벼운 만화 폭력" 여부 확인) |

## 설명 (한국어)

성경 전권(개역한글·KJV)과 김소월·윤동주·한용운의 시, 셰익스피어 소네트, 에밀리 디킨슨, 옛 찬송가를 한 줄씩 따라 치며 한글·영문 타자를 익힙니다.

- 자리 연습, 단어, 문장(오늘의 말씀, 암송 365구절), 주제별 말씀, 긴 글
- 단어블록게임, 전선작전게임
- 맥·윈도우 기본 단축키 1~3단계
- 사용자별 기록·순위·배지, 화면 언어와 연습 언어를 따로 선택
- 무료이며 광고가 없습니다. 도움이 되셨다면 Buy Me a Coffee로 응원해 주세요.

## Description (English)

Learn Korean and English typing by copying Scripture and poetry line by line: the whole Bible (Korean 개역한글 and KJV), Kim Sowol, Yun Dong-ju, Han Yong-un, Shakespeare's sonnets, Emily Dickinson and old hymns.

- Key drills, words, sentences (verse of the day, 365 memory verses), verses by topic, long texts
- Two games: Word Blocks and Frontline Game
- macOS and Windows shortcut drills in three levels
- Per-user records, ranking and badges; display and practice languages chosen separately
- Free, no ads. If it helps you, you can buy me a coffee.

## 맥: 서명과 공증 (GitHub에서 받는 dmg)

- 인증서: 키체인의 **Developer ID Application: Gihyun Park (QYB6DPBR6X)**
- 공증 암호: `xcrun notarytool store-credentials "typing-warrior" …`로 키체인에 저장한 프로필 `typing-warrior`
- 빌드: `npm run dist:mac-notarized` → `dist/`에 서명·공증된 dmg (Hardened Runtime, `build/entitlements.mac.plist`)
- 확인: `spctl -a -vvv -t exec "dist/mac-arm64/Typing Warrior.app"` → `source=Notarized Developer ID`

## Mac App Store 등록 순서

1. **Bundle ID 등록**: developer.apple.com → Certificates, IDs & Profiles → Identifiers → **+** → App IDs → App → Bundle ID `com.typingwarrior.app` (Explicit). App Groups 기능을 켜고 `QYB6DPBR6X.com.typingwarrior.app`를 씁니다.
2. **인증서 두 개**: Xcode → Settings → Accounts → Manage Certificates → **+** → **Apple Distribution**, **Mac Installer Distribution**
3. **프로비저닝 프로파일**: Profiles → **+** → Distribution → **Mac App Store Connect** → 위 App ID → Apple Distribution 인증서 → 내려받아 `build/embedded.provisionprofile`로 저장 (Git에는 올리지 않음)
4. **App Store Connect**: appstoreconnect.apple.com → 앱 → **+** 새로운 앱 → macOS, 이름 Typing Warrior, 기본 언어 한국어, Bundle ID 선택, SKU `typing-warrior`
5. **빌드와 업로드**: `npm run dist:mas` → `dist/mas-universal/Typing Warrior-<버전>-universal.pkg` → **Transporter** 앱으로 업로드
6. **스토어 정보**: 위 설명·URL·분류, 스크린샷(1280×800 이상, 16:10), 개인정보 "수집하지 않음", 수출 규정은 "HTTPS만 사용"(Info.plist의 `ITSAppUsesNonExemptEncryption = false`) → 심사 제출

스토어 빌드(`process.mas`)는 소개 페이지의 후원 줄을 자동으로 뺍니다(심사 지침 3.1.1). 샌드박스 권한은 `build/entitlements.mas.plist`: 네트워크(API.Bible), 사용자가 고른 파일 읽기·쓰기(글 불러오기, 배지 카드 저장).

## Microsoft Store 등록 순서

1. **개발자 계정**: partner.microsoft.com → Microsoft Store 개발자 계정(개인) 가입
2. **앱 이름 예약**: Partner Center → 앱 및 게임 → **새 제품** → MSIX 또는 PWA 앱 → 이름 `Typing Warrior`
3. **패키지 ID 확인**: 제품 → 제품 관리 → **제품 ID**에서 `Package/Identity/Name`, `Package/Identity/Publisher`(CN=…), `Package/Properties/PublisherDisplayName` 세 값을 복사 → `package.json`의 `build.appx`에 넣음
4. **빌드**: MSIX(.appx)는 윈도우에서만 만들 수 있어 GitHub Actions에서 만듦. 스토어가 서명하므로 코드 서명 인증서는 필요 없음
5. **제출**: 패키지 업로드, 스토어 설명·스크린샷(1366×768 이상), 연령 등급 설문, 개인정보 URL → 제출

스토어 타일 이미지는 `build/appx/`(앱 아이콘에서 만듦)에 있습니다.

## 후원 링크 주의

- **Microsoft Store**: 설명과 앱 안 소개 페이지에 후원 링크를 넣어도 됩니다.
- **Mac App Store**: 앱 심사 지침 3.1.1은 앱 안의 "팁·후원"을 앱 내 결제로 하도록 정합니다. 앱 안의 외부 후원 링크는 심사에서 거절될 수 있습니다(미국 스토어는 2025년 판결 이후 외부 링크가 허용되지만 다른 나라는 아직입니다). 거절되면 스토어 빌드에서는 소개 페이지의 후원 줄을 빼고, 스토어 설명과 홈페이지에만 후원 안내를 남기는 방법을 씁니다.
