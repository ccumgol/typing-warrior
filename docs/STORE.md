# 앱 스토어 등록 정보

- **Microsoft Store**: 게시됨(2026-11-03) — https://apps.microsoft.com/detail/9N1907XRG6SQ
- **Mac App Store**: 심사 중(2026-11-01 제출)
- **iPad(iOS)**: 1.1.0 빌드 1 제출(2026-11-04) → 심사 거절(2026-11-05, Guideline 2.1) → 메모 보강·녹화 링크 추가 후 재제출(2026-11-06) → **게시됨**(2026-11-06) — https://apps.apple.com/app/id6829546475 (iPadOS 16.4 이상, 교육, 9+, 무료). 경위는 아래 [iPad(iOS) 심사 거절 대응](#ipadios-심사-거절-대응-2026-11-05)

- **공식 홈페이지**: https://ccumgol.net/typing-warrior (English: https://ccumgol.net/en/typing-warrior/)

Mac App Store(App Store Connect)와 Microsoft Store(Partner Center)에 등록할 때 쓰는 값입니다. 가격은 **무료**, 앱 안 결제는 없습니다.

## 공식 홈페이지 (2026-11-06)

스토어의 마케팅 URL·지원 URL·개인정보 처리방침 URL을 모두 자체 홈페이지로 모았습니다. GitHub Issues나 저장소 링크 대신 사람이 읽을 수 있는 페이지를 보여 주기 위해서입니다.

| 쓰임 | 주소 |
|---|---|
| 마케팅 URL (앱 소개) | https://ccumgol.net/typing-warrior |
| 지원 URL | https://ccumgol.net/typing-warrior/support/ |
| 개인정보 처리방침 URL | https://ccumgol.net/typing-warrior/privacy/ |
| 영문 소개 | https://ccumgol.net/en/typing-warrior/ |

페이지는 별도 저장소 **[ccumgol/myweb](https://github.com/ccumgol/myweb)**(Hugo → Cloudflare Pages)에 있습니다.

| 파일 | 하는 일 |
|---|---|
| `content/typing-warrior/index.md`, `index.en.md` | 한국어·영문 소개 내용(전부 front matter) |
| `content/typing-warrior/*.webp` | 아이콘과 화면 사진(이 저장소 `docs/screenshots/`에서 변환) |
| `layouts/typing-warrior/single.html` | 페이지 구조 |
| `layouts/partials/typing-warrior-styles.html` | 페이지 전용 CSS(다크 모드 포함) |
| `assets/js/typing-warrior-demo.js` | **웹에서 직접 쳐 보는 연습 칸.** 이 저장소의 `src/renderer/core/hangul.js`·`keyboard-layout.js`·`typing-input.js`를 옮겨 와, 앱과 똑같이 키의 물리 위치로 두벌식 한글을 조합합니다 |
| `content/typing-warrior/video-thumb.webp` | 소개 영상 포스터. 누르기 전에는 유튜브에 아무 요청도 가지 않고, 누를 때만 youtube-nocookie 임베드가 붙습니다(영상: https://youtu.be/W8xmAB2OsRI, 4분 41초) |
| `content/blog/typing-warrior-support/index.md` | 지원·FAQ (한·영 병기) |
| `content/blog/typing-warrior-privacy/index.md` | 개인정보 처리방침 (한·영 병기, `docs/PRIVACY.md`와 같은 내용 + iPadOS 추가) |

> 한글 조합 코드를 고치면 **두 곳(앱과 홈페이지)** 을 함께 맞춰야 합니다.
>
> 상단 메뉴(APP → Typing Warrior)는 myweb 저장소의 `config/_default/menus.ko.toml`·`menus.en.toml`에 `pageRef = "typing-warrior"`를 더해 연결해 두었습니다.

### 스토어에 실제로 바꾼 것 (2026-11-06)

| 항목 | 어디에서 | 상태 |
|---|---|---|
| 개인정보 처리방침 URL | App Store Connect → **앱이 수집하는 개인정보** → 개인정보 처리방침 **편집** | ✅ 홈페이지 주소로 저장함 |
| 지원 URL · 마케팅 URL (iOS) | 버전 정보 (1.1.0) | 🔒 승인된 버전이라 잠김 → **1.2.0 제출 때** |
| 지원 URL · 마케팅 URL (macOS) | 버전 정보 (1.1.0) | 🔒 심사 중이라 건드리지 않음 → **1.2.0 제출 때** |
| 지원·홈페이지 주소 | Microsoft Store (Partner Center) | ⬜ 아직 옛 주소, 제약 없으니 아무 때나 |

> **1.2.0을 제출할 때 잊지 말 것** — 지원 URL을 `https://ccumgol.net/typing-warrior/support/`,
> 마케팅 URL을 `https://ccumgol.net/typing-warrior` 로 바꿉니다. iOS와 macOS가 **각각 따로** 있습니다.
> 지금 들어 있는 값은 `github.com/ccumgol/typing-warrior/issues` 와 `https://jesusiswith.us` 입니다.
>
> **지원 URL과 마케팅 URL은 버전 정보에 있어 버전이 승인되면 잠깁니다.** 반면 개인정보 처리방침 URL은
> 버전이 아니라 앱 단위라서 언제든 고칠 수 있고, 고친 값은 다음 버전이 출시될 때 적용됩니다.

## 공통

| 항목 | 값 |
|---|---|
| 앱 이름 | Typing Warrior |
| 부제 (30자) | 말씀과 문학으로 배우는 한글·영문 타자 / Type Scripture & poetry |
| 분류 | 교육(Education) · 보조 분류: 참고(Reference) |
| 가격 | 무료 |
| 개발자 | Gihyun Park (박기현) |
| 홈페이지(마케팅 URL) | https://ccumgol.net/typing-warrior |
| 지원 URL | https://ccumgol.net/typing-warrior/support/ |
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

## App Store Connect 입력 내용 (그대로 붙여 넣기)

### 앱 정보
| 항목 | 한국어 | English (U.S.) |
|---|---|---|
| 이름 (30자) | Typing Warrior | Typing Warrior |
| 부제 (30자) | 말씀과 시로 배우는 한글·영문 타자 | Learn typing with Scripture |
| 기본 카테고리 / 보조 | 교육 / 참고 | Education / Reference |
| 콘텐츠 권한 | "제3자 콘텐츠를 포함하며 사용 권한이 있음"(퍼블릭 도메인·CC BY-SA, 소개 페이지에 출처) | |
| 연령 등급 | 설문: 만화 또는 판타지 폭력 "드물게/약하게", 나머지 "없음" → 4+ 또는 9+ | |

### 가격 및 사용 가능 여부
무료(0원), 모든 국가·지역

### 앱 개인정보 보호
- 개인정보 처리방침 URL: https://ccumgol.net/typing-warrior/privacy/
- 데이터 수집: **"아니요, 이 앱에서 데이터를 수집하지 않습니다"** (API 키는 사용자가 API.Bible에 직접 보내는 것이고 개발자가 받지 않음)

### 버전 정보 (1.1.0)
| 항목 | 한국어 | English |
|---|---|---|
| 프로모션 텍스트 (170자) | 성경 전권과 윤동주·김소월의 시, 셰익스피어와 옛 찬송가를 한 줄씩 따라 치며 한글·영문 타자를 익히세요. 무료, 광고 없음, 기록은 내 Mac에만. | Learn Korean and English typing by copying the Bible, Korean poetry, Shakespeare and old hymns line by line. Free, no ads, records stay on your Mac. |
| 키워드 (100자) | 타자연습,타자,한글타자,영타,타이핑,성경,필사,말씀,암송,시편,윤동주,김소월,찬송가,키보드,단축키,교육 | typing,tutor,keyboard,Korean,Hangul,Bible,KJV,scripture,verse,poetry,Shakespeare,hymns,speed |
| 지원 URL | https://ccumgol.net/typing-warrior/support/ | https://ccumgol.net/en/typing-warrior/ 안내는 같은 페이지(한·영 병기) |
| 마케팅 URL | https://ccumgol.net/typing-warrior | https://ccumgol.net/en/typing-warrior/ |
| 저작권 | 2026 Gihyun Park | 같음 |

**설명 (한국어)**

```
손끝으로 새기는 말씀과 시 — Typing Warrior는 성경과 문학을 따라 치며 한글·영문 타자를 익히는 프로그램입니다.

■ 성경 전권을 한 줄씩
개역한글과 KJV 성경 66권 1,189장을 책과 장을 골라 이어서 칩니다. 어디까지 쳤는지 기억해 두니 날마다 한 장씩 필사하듯 이어 가세요. 날마다 바뀌는 오늘의 말씀과 15개 주제로 정리한 암송 말씀 365구절도 있습니다.

■ 시와 찬송
김소월 『진달래꽃』, 윤동주 『하늘과 바람과 별과 시』, 한용운 『님의 침묵』, 셰익스피어 소네트, 에밀리 디킨슨, Amazing Grace 같은 옛 찬송가를 원문 그대로 따라 칩니다. 내 텍스트 파일이나 성경 파일을 불러와 연습할 수도 있습니다.

■ 차근차근 배우는 타자
자리 연습(한글 7단계, 영문 6단계), 단어, 문장, 긴 글. 화면 키보드가 다음 키와 손가락을 알려 줍니다. 컴퓨터의 한/영 상태와 상관없이 두벌식 한글을 바로 칠 수 있습니다.

■ 지칠 때는 게임으로
떨어지는 단어를 막는 단어블록게임(레벨 1~20), 다가오는 적을 막는 전선작전게임.

■ 단축키 연습
맥 기본 단축키를 1~3단계로 익힙니다.

■ 가족이 함께
사용자마다 기록·진행 위치·화면 언어가 따로 저장되고, 순위와 배지(성경 한 권, 시집 한 권을 다 치면)를 볼 수 있습니다.

■ 화면 언어와 연습 언어를 따로
영어 화면으로 한글 타자를 배울 수도 있습니다.

무료이며 광고가 없습니다. 기록은 이 Mac에만 저장되고 밖으로 보내지 않습니다.
연습 글은 퍼블릭 도메인과 CC BY-SA 본문이며, 출처는 앱의 소개 페이지에 있습니다.
```

**Description (English)**

```
Type the Word, line by line. Typing Warrior teaches Korean and English typing through Scripture and literature.

THE WHOLE BIBLE
Type all 66 books and 1,189 chapters of the King James Version or the Korean 개역한글, chapter by chapter, with your place remembered. Practise the verse of the day and 365 memory verses arranged in 15 topics.

POETRY AND HYMNS
Shakespeare's sonnets, Emily Dickinson, beloved old hymns like Amazing Grace and Rock of Ages, and the Korean poets Kim Sowol, Yun Dong-ju and Han Yong-un. You can also open your own text files or a Bible file.

STEP BY STEP
Key drills, words, sentences and long texts, with an on-screen keyboard that shows the next key and finger. Korean Hangul works without switching your input source.

GAMES
Word Blocks (levels 1–20) and Frontline Game, a first-person typing battle.

SHORTCUTS
Learn the basic Mac shortcuts in three levels.

FOR THE FAMILY
Each user keeps their own records, reading positions and languages, with a local ranking and badges for finishing a book of the Bible.

Free, no ads. Your records stay on your Mac. Texts are public domain or CC BY-SA; sources are listed on the About page.
```

### 심사 정보
- 로그인 필요: **없음** (로그인 정보 칸 체크 해제)
- 연락처: 박기현 / 이메일 / 전화번호
- 메모(영어):

```
No account or login is needed. All features work offline except "Get from API.Bible" (Typing > Long texts), which needs the user's own free API key from scripture.api.bible; it is optional. Practice texts are public domain (KJV, 개역한글 1961, poems by authors who died in 1962 or earlier, public domain under Korean law) or CC BY-SA 4.0 (Korean Wikisource), with sources on the About page. The app is free with no in-app purchases.
```

### 스크린샷
- 크기: 2560×1600 (16:10). 1~10장. `npm run screenshots`로 `docs/screenshots/ko`, `docs/screenshots/en`에 만듭니다. MS Store용(윈도우 키보드 표시)은 `npm run screenshots -- --windows` → `docs/screenshots/windows/{ko,en}`.

## 맥: 서명과 공증 (GitHub에서 받는 dmg)

- 인증서: 키체인의 **Developer ID Application: Gihyun Park (QYB6DPBR6X)**
- 공증 암호: `xcrun notarytool store-credentials "typing-warrior" …`로 키체인에 저장한 프로필 `typing-warrior`
- 빌드: `npm run dist:mac-notarized` → `dist/`에 서명·공증된 dmg (Hardened Runtime, `build/entitlements.mac.plist`)
- 확인: `spctl -a -vvv -t exec "dist/mac-arm64/Typing Warrior.app"` → `source=Notarized Developer ID`

## Mac App Store 등록 순서

1. **Bundle ID 등록**: developer.apple.com → Certificates, IDs & Profiles → Identifiers → **+** → App IDs → App → Description `Typing Warrior`, Bundle ID `com.typingwarrior.app` (Explicit) → Continue → Register. 앱 그룹 `QYB6DPBR6X.com.typingwarrior.app`는 맥 방식(팀 ID로 시작)이라 포털에 등록하지 않고 권한 파일에만 적습니다(App Groups의 Configure는 쓰지 않음).
2. **인증서 두 개**: Xcode → Settings → Accounts → Manage Certificates → **+** → **Apple Distribution**, **Mac Installer Distribution**
3. **프로비저닝 프로파일**: Profiles → **+** → Distribution → **Mac App Store Connect** → 위 App ID → Apple Distribution 인증서 → 내려받아 `build/embedded.provisionprofile`로 저장 (Git에는 올리지 않음)
4. **App Store Connect**: appstoreconnect.apple.com → 앱 → **+** 새로운 앱 → macOS, 이름 Typing Warrior, 기본 언어 한국어, Bundle ID 선택, SKU `typing-warrior`
5. **빌드와 업로드**: `npm run dist:mas` → `dist/mas-universal/Typing Warrior-<버전>-universal.pkg` → **Transporter** 앱으로 업로드
6. **스토어 정보**: 위 설명·URL·분류, 스크린샷(1280×800 이상, 16:10), 개인정보 "수집하지 않음", 수출 규정은 "HTTPS만 사용"(Info.plist의 `ITSAppUsesNonExemptEncryption = false`) → 심사 제출

스토어 빌드(`process.mas`)는 소개 페이지의 후원 줄을 자동으로 뺍니다(심사 지침 3.1.1). 샌드박스 권한은 `build/entitlements.mas.plist`: 네트워크(API.Bible), 사용자가 고른 파일 읽기·쓰기(글 불러오기, 배지 카드 저장).

## Microsoft Store 등록 순서

1. **개발자 계정**: partner.microsoft.com → Microsoft Store 개발자 계정(개인) 가입
2. **앱 이름 예약**: Partner Center → 앱 및 게임 → **새 제품** → MSIX 또는 PWA 앱. `Typing Warrior`는 다른 사람이 예약해 둬서 **`Typing Warrior: Bible & Poetry`**로 예약함 (Store ID `9N1907XRG6SQ`, https://apps.microsoft.com/detail/9N1907XRG6SQ)
3. **패키지 ID 확인**: 제품 → 제품 관리 → **제품 ID**에서 `Package/Identity/Name`, `Package/Identity/Publisher`(CN=…), `Package/Properties/PublisherDisplayName` 세 값을 복사 → `package.json`의 `build.appx`에 넣음
4. **빌드**: MSIX(.appx)는 윈도우에서만 만들 수 있어 GitHub Actions → **MS Store package** → Run workflow로 만들고, 결과의 `msstore-package` 파일을 받음(`npm run dist:msstore`, `.github/workflows/msstore-package.yml`). 스토어가 서명하므로 코드 서명 인증서는 필요 없음. 패키지 ID: `ccumgol.TypingWarriorBiblePoetry`, 게시자 `CN=F056DC6C-2FA7-4C7F-B3A6-150A3E1399A7`, 표시 이름 `ccumgol`(Partner Center 계정 설정에서 게시자 표시 이름을 바꾸면 package.json도 함께 바꿀 것)
5. **제출**: 패키지 업로드, 스토어 설명·스크린샷(1366×768 이상), 연령 등급 설문, 개인정보 URL → 제출

스토어 타일 이미지는 `build/appx/`(앱 아이콘에서 만듦)에 있습니다.

## 후원 링크 주의

- **Microsoft Store**: 설명과 앱 안 소개 페이지에 후원 링크를 넣어도 됩니다.
- **Mac App Store**: 앱 심사 지침 3.1.1은 앱 안의 "팁·후원"을 앱 내 결제로 하도록 정합니다. 앱 안의 외부 후원 링크는 심사에서 거절될 수 있습니다(미국 스토어는 2025년 판결 이후 외부 링크가 허용되지만 다른 나라는 아직입니다). 거절되면 스토어 빌드에서는 소개 페이지의 후원 줄을 빼고, 스토어 설명과 홈페이지에만 후원 안내를 남기는 방법을 씁니다.

---

## iPad(iOS) 심사 거절 대응 (2026-11-05)

iOS 1.1.0 (빌드 1)이 **Guideline 2.1 – Information Needed / 2.1.0 Performance: App Completeness**로 거절됐습니다. Apple이 요구한 것은 (1) 실기기 화면 녹화와 (2) App Review Information의 **Notes** 칸에 넣을 설명 6가지입니다.

### 가장 큰 원인 (추정)

이 앱은 **하드웨어 키보드가 없으면 아무것도 칠 수 없습니다.** 타이핑을 `document`의 `keydown`에서 `event.code`로 읽고(입력기와 무관한 두벌식 조합) 화면에 포커스를 받는 입력칸이 없어서, 키보드를 붙이지 않은 iPad에서는 iPadOS 소프트 키보드가 아예 올라오지 않습니다. 심사자가 키보드 없는 iPad로 열면 "키보드를 연결해 주세요" 안내만 보고 끝나므로 '앱이 완성되지 않았다'로 판단하기 쉽습니다.

→ Notes 맨 앞에 키보드가 필요하다는 점을 먼저 적고, 화면 녹화에도 키보드를 연결해 실제로 치는 장면을 담습니다. App Store 설명 첫 줄에도 하드웨어 키보드가 필요하다는 문장을 넣어 두면 다음 심사에서 다시 걸릴 가능성이 줄어듭니다.

### App Review Information → Notes (그대로 붙여 넣기)

```
IMPORTANT: THIS APP REQUIRES A HARDWARE KEYBOARD

Typing Warrior is a touch-typing tutor for iPad with an external keyboard. It reads
physical key positions (KeyboardEvent.code) so that Korean Hangul can be composed
directly, without switching the iPad's input source. Please connect a Magic Keyboard,
a Smart Keyboard Folio, or any Bluetooth keyboard before reviewing. Without a hardware
keyboard the app shows a notice asking for one and no typing is possible, because the
app has no text field that would raise the on-screen keyboard. (In the iPad Simulator:
I/O > Input > "Send Keyboard Input to Device".)

Recorded on a physical iPad with a Magic Keyboard, starting from the Home
Screen. Unlisted YouTube link, no sign-in needed:
https://youtu.be/W8xmAB2OsRI

2. PURPOSE AND TARGET AUDIENCE
Typing Warrior teaches Korean (Hangul) and English touch typing by copying public
domain texts line by line: the whole Bible (Korean 개역한글 and the King James Version),
poems by Kim Sowol, Yun Dong-ju and Han Yong-un, Shakespeare's sonnets, Emily Dickinson,
and old hymns. It is for students, adults learning Hangul typing, and families who want
to practise typing with meaningful texts instead of random words. The app remembers where
each user stopped, so a chapter a day can be typed like handwriting practice. There are
no accounts, no ads, no in-app purchases and no user-generated content shared with others.

3. HOW TO SET UP AND REACH THE MAIN FEATURES
No login, no account and no sample file are required. Everything below works offline.
- On first launch a welcome sheet asks for a name, a display language (Korean/English)
  and a practice language (Hangul/English). Tap "시작하기 / Start".
- Top menu: Typing (Key Drills, Words, Sentences, Verses by topic, Long texts),
  Games (Word Blocks, Frontline), Shortcuts, Records, About.
- Typing > Key Drills > Stage 1: type the large characters shown; the on-screen keyboard
  highlights the next key.
- Typing > Long texts: choose a work (Bible, a poetry collection) and a book/chapter,
  type a line and press Return. Progress is saved per user.
- Games > Word Blocks: press Return to start, type a falling word and press Return/Space.
- Records: personal records, a local ranking of the users on this iPad, and badges.
  A badge card can be saved or shared through the iOS share sheet.
- OPTIONAL: Typing > Long texts > "Get from API.Bible" asks for the user's own free
  API key. This is the only feature that uses the internet and it can be skipped entirely.

4. EXTERNAL SERVICES
Only one, and it is optional: API.Bible (https://scripture.api.bible), used solely if the
user enters their own free API key to download an additional Bible translation. The key is
stored in the iOS Keychain and is never sent to us. There are no analytics, advertising,
authentication, payment or AI services. No data leaves the device otherwise; all records
are kept in local storage on the iPad.

5. REGIONAL DIFFERENCES
None. The app behaves identically in every region. The interface is available in Korean
and English, chosen by the user, independently of the device region.

6. THIRD-PARTY MATERIAL
All built-in practice texts are public domain or openly licensed, and every source is
listed on the app's About page:
- Korean Bible 개역한글 (Korean Bible Society): economic copyright expired under Korean law.
- King James Version: CrossWire KJV (eBible.org, 1769 edition), public domain outside the UK.
- Kim Sowol, Yun Dong-ju, Han Yong-un, Yi Yuksa, Yi Sanghwa, Jeong Jiyong, Kim Yeongnang,
  Shim Hun: all died in 1962 or earlier, public domain under Korean law. Modern-spelling
  texts come from Korean Wikisource and are redistributed under CC BY-SA 4.0, as stated
  on the About page.
- Shakespeare's sonnets, Emily Dickinson, The Christian Hymn Book: Project Gutenberg
  #1041, #12242, #46041, public domain.
The app's own source code is published under the MIT licence at
https://github.com/ccumgol/typing-warrior
```

### 화면 녹화 체크리스트

실기기(iPad)에서 **Magic Keyboard나 블루투스 키보드를 연결한 채로**, 최신 iPadOS에서 찍습니다. 설정 → 제어 센터에 '화면 기록'을 넣고 녹화합니다. 2~4분이면 충분합니다.

1. **홈 화면에서 앱 아이콘을 눌러 실행**하는 장면부터 시작 (필수 요건)
2. 환영 창에서 이름·화면 언어·연습 언어를 고르고 시작
3. 타자연습 → 자리 연습 1단계를 **실제로 몇 글자 타이핑** (키보드로 치는 손이나 화면 키보드 하이라이트가 보이게)
4. 타자연습 → 긴 글 → 성경 한 장을 골라 한두 줄 치고 Enter, 진행 저장되는 모습
5. 게임 → 단어블록게임 몇 초
6. 기록 → 내 기록·배지 화면
7. 소개 화면에서 출처·저작권 목록을 잠깐 보여 주기 (6번 항목 뒷받침)

계정·로그인·결제·사용자 생성 콘텐츠 흐름은 이 앱에 없으므로 녹화할 것이 없습니다.

녹화본은 **App Store Connect의 '앱 심사 정보 → 첨부 파일'에 그대로 올릴 수 있습니다**(메모 칸 바로 아래). 파일이 너무 크면 유튜브 일부 공개(Unlisted)나 Dropbox 링크를 메모에 적어도 됩니다.

### 재제출 (2026-11-06)

- [x] Notes 전문을 iOS 1.1.0 → **앱 심사 정보 → 메모**에 넣고 저장(3,977자 / 한도 4,000자)
- [x] App Store 설명·프로모션 텍스트는 한국어·영어 모두 이미 하드웨어 키보드가 필요하다고 첫 줄에 밝히고 있음(고칠 것 없음)
- [x] 실기기 화면 녹화(4분) — 유튜브 일부 공개 <https://youtu.be/W8xmAB2OsRI>, 로그인 없는 브라우저에서 재생 확인. 링크를 Notes 1번에 넣음
- [x] 버전 페이지 **심사 업데이트** → 앱 심사 페이지 **앱 심사에 다시 제출** → 상태 **심사 대기 중**. 빌드는 1 그대로

남은 일: 심사 결과 대응. 새 빌드를 올릴 때만 `CURRENT_PROJECT_VERSION`(빌드 번호)을 2로 올릴 것.
영상 설명글 초안은 [PROMO.md](PROMO.md)의 '유튜브 영상 설명글' 절에 있습니다(아직 유튜브에 반영 전).
