# ⌨️ Typing Warrior

**말씀과 문학을 손끝으로 새기는 한글·영문 타자 연습** — macOS · Windows

성경 전권과 김소월·윤동주·한용운의 시, 셰익스피어와 디킨슨, 옛 찬송가를 한 줄씩 따라 치며 타자를 익힙니다. 지칠 때는 두 가지 게임(단어블록게임, 전선 작전)으로 즐겁게 손을 풀 수 있습니다.

- 버전 **1.0.1** · [바뀐 내용](CHANGELOG.md) · [버그·오타 신고와 개선 제안](https://github.com/ccumgol/typing-warrior/issues)
- 만든 사람: 박기현 · 홈페이지 <https://jesusiswith.us> (후원 안내도 홈페이지에 있습니다)
- 프로그램 코드는 [MIT 라이선스](LICENSE)로 공개합니다. 연습 글의 저작권은 아래 [연습 글과 저작권](#연습-글과-저작권)을 보세요.

> English summary: [see below](#english).

---

## 목차
1. [설치하기](#설치하기)
2. [처음 시작하기](#처음-시작하기)
3. [메뉴별 사용법](#메뉴별-사용법)
4. [내 글·내 성경으로 연습하기](#내-글내-성경으로-연습하기)
5. [사용자·기록·배지](#사용자기록배지)
6. [꼭 알아 둘 키](#꼭-알아-둘-키)
7. [개인정보](#개인정보)
8. [연습 글과 저작권](#연습-글과-저작권)
9. [개발자 안내](#개발자-안내)
10. [English](#english)

---

## 설치하기

[Releases](https://github.com/ccumgol/typing-warrior/releases) 페이지에서 내 컴퓨터에 맞는 파일을 받습니다.

| 운영체제 | 파일 | 설치 |
|---|---|---|
| macOS (Apple Silicon: M1 이후) | `Typing Warrior-1.0.1-arm64.dmg` | 열어서 앱을 '응용 프로그램' 폴더로 끌어 놓습니다 |
| macOS (인텔) | `Typing Warrior-1.0.1.dmg` | 위와 같습니다 |
| Windows 10/11 (64비트) | `Typing Warrior-1.0.1-win.zip` | 압축을 풀고 폴더 안의 `Typing Warrior.exe`를 실행합니다 |

**처음 열 때 경고가 나오면** (아직 개발자 인증서로 서명하지 않은 앱이라 그렇습니다)
- macOS: 앱을 **오른쪽 클릭 → 열기 → 열기**. 또는 '시스템 설정 → 개인정보 보호 및 보안'에서 '그래도 열기'.
- Windows: "Windows의 PC 보호" 창에서 **추가 정보 → 실행**.

## 처음 시작하기

1. 오른쪽 위 **🌐 KO/EN**으로 화면 언어를, **한/EN**으로 연습 언어를 고릅니다. 둘은 따로라서 영어 화면으로 한글을 연습할 수도 있습니다.
2. 위쪽 메뉴에서 연습할 것을 고릅니다. 처음이라면 **자리 연습 → 1단계**부터 시작하세요.
3. 아래 화면 키보드가 다음에 칠 키를 밝혀 줍니다. **F2**로 키보드를 감추고, **F3**로 손가락 색상을 켜고 끌 수 있습니다.
4. 맨 아래 상태바에 타수(분당 타수), 정확도, 시간, 진행이 작게 나옵니다.

> 이 앱은 키의 실제 위치를 읽어 직접 두벌식 한글을 조합합니다. 컴퓨터의 한/영 입력 상태를 바꿀 필요가 없습니다.

## 메뉴별 사용법

| 메뉴 | 하는 일 | 사용법 |
|---|---|---|
| **자리 연습** | 손가락 자리 익히기 | 한글 7단계(기본자리 → 윗줄 → 아랫줄 → 쌍자음 → 쌍모음 → 복모음 → 숫자·기호), 영문 6단계, 혼합. 큰 글자를 차례로 칩니다. 끝낸 단계에는 ✓ |
| **단어** | 낱말 치기 | 주제(일상·자연·음식·신앙 등)를 고르고, 단어를 친 뒤 Space나 Enter |
| **문장** | 한 문장씩 치기 | 📅 오늘의 말씀, 명언 100, 성경 암송 365(개역한글 / KJV), 영어 문장. 다 치면 Enter. 틀린 글자는 ⌫로 고칩니다 |
| **말씀** | 주제별 암송 구절 표 | 365구절이 15개 주제(사랑, 믿음, 기도, 위로·평안…)로 정리되어 있습니다. **이 주제로 연습**을 누르면 문장 연습으로 이어집니다 |
| **긴 글** | 성경·시집을 이어서 치기 | 위쪽에서 작품을, 그 옆에서 책·장(편)을 고릅니다. 한 줄(절)을 치고 Enter. 어디까지 쳤는지 저장되어 다음에 이어집니다 |
| **단어블록게임** | 떨어지는 단어 막기 | Enter로 시작, 단어를 치고 Enter/Space. 💣 금색 블록은 화면 정리, ❄️ 파란 블록은 5초 감속. **연속 모드**(점점 빨라짐)와 **단계 모드**(LEVEL 1~20, 단어 20개를 막으면 통과, 레벨 10 = 분당 200타) |
| **전선 작전** | 1인칭 타자 게임 | 다가오는 적 위의 단어를 치고 Enter로 사격. 탄약이 떨어지면 "장전"(영문: reload), 연속 명중으로 "공습". 효과음 세트 4가지 |
| **단축키** | 기본 단축키 익히기 | macOS/Windows와 1~3단계를 고릅니다. 키보드를 보이면 정답 키가 밝혀지고, **F2**로 감추면 외워서 누르기. 윈도우에서 맥 단축키를 연습할 때는 맥 왼쪽 키 순서대로 Ctrl=control, Win=option, Alt=command |
| **기록** | 내 기록·순위·배지 | 내 기록, 이 컴퓨터 사용자 전체 순위, 긴 글 배지. **기록 초기화**로 내 기록을 지웁니다 |
| **소개** | 프로그램 정보 | 기능, 꼭 알아 둘 키, 모든 연습 글의 출처와 저작권, 만든 사람 |

**게임 옵션**(입력칸 옆): 효과음 세트, 글자 크기 100~200%.

## 내 글·내 성경으로 연습하기

긴 글 화면의 버튼으로 내 파일을 불러올 수 있습니다. **파일 형식** 버튼을 누르면 화면에서도 형식과 [예시 파일](docs/samples) 링크를 볼 수 있습니다.

### 📂 내 글 불러오기 (UTF-8 텍스트 파일 `.txt`)
```
# 글 제목          ← 첫 줄(선택). 없으면 파일 이름
## 소제목          ← 새 편 시작(선택). 없으면 20줄씩 나눔
본문 한 줄이 한 번에 칠 단위입니다. 빈 줄은 건너뜁니다.
```
예시: [my-text-example.txt](docs/samples/my-text-example.txt)

### 📖 성경 파일 올리기 (성경 전권 한 파일)
| 형식 | 예 | 예시 파일 |
|---|---|---|
| CSV | `book,chapter,verse,text` (책은 1~66 또는 창·창세기·Gen) | [bible-example.csv](docs/samples/bible-example.csv) |
| XML | Zefania, OSIS, OpenSong, Beblia | [bible-example-zefania.xml](docs/samples/bible-example-zefania.xml) |
| TXT | `창 1:1 태초에 …` (첫 줄 `#번역 이름` 선택) | [bible-example.txt](docs/samples/bible-example.txt) |

한글 성경은 개역한글을, 영어 성경은 KJV를 대신해 **성경 전권, 암송 365구절, 오늘의 말씀**에 쓰입니다. 파일에 없는 책·절은 기본 본문을 씁니다. **↩ 기본 성경으로**로 되돌립니다.

### 🌐 API.Bible에서 받기
1. <https://scripture.api.bible/>에서 무료 계정을 만들고 API 키를 받습니다.
2. 긴 글 → **API.Bible에서 받기** → 키를 넣고 **역본 목록 불러오기**. 영어·한국어 역본만 나옵니다.
3. 역본의 **받기**를 누르면 전권을 장 단위로 받습니다(몇 분 걸립니다).

API.Bible 약관에 따라 받은 본문은 **30일마다 다시 받아야** 하고, 연습 화면에 저작권 문구가 표시되며, 본문을 볼 때 API.Bible에 사용 기록(FUMS)이 전송됩니다. 키는 운영체제의 암호화 저장소에 보관합니다.

> 불러온 글과 역본은 이 컴퓨터에만 저장됩니다. 저작권이 있는 글은 정식으로 구한 본문을 개인 연습용으로만 쓰세요.

## 사용자·기록·배지

- **사용자**: 오른쪽 위 **👤 이름** 버튼 → 사용자 추가, 바꾸기, 이름 바꾸기, 기록 초기화, 지우기. 기록·진행 위치·배지가 사람마다 따로 저장됩니다(화면 설정은 함께 씁니다).
- **순위**: 기록 → **전체 사용자 순위**에서 이 컴퓨터 사용자들의 총 연습 시간과 모드별 최고 기록을 비교합니다.
- **배지**: 긴 글에서 성경 한 권, 시집·찬송가 한 작품을 끝내거나 성경 10·50·100·300장, 전권을 치면 받습니다. 기록 → **배지**에서 **이미지 저장**이나 **복사**로 배지 카드를 메신저·SNS에 나눌 수 있습니다.

## 꼭 알아 둘 키

| 키 | 하는 일 |
|---|---|
| `F2` | 화면 키보드 보이기/감추기 |
| `F3` | 손가락 색상 켜기/끄기 |
| `Shift` + `Space` (또는 한/영 키) | 연습 언어 한글 ↔ 영문 |
| `F11` | 전체화면 / 창 모드 |
| `Esc` | 게임 일시정지 |
| `Enter` | 다음 문장·다음 줄, 게임 시작 |

## 개인정보

설정, 사용자, 연습 기록과 배지는 **이 컴퓨터 안에만** 저장되고 밖으로 보내지 않습니다. 인터넷을 쓰는 기능은 사용자가 직접 실행하는 **API.Bible에서 받기** 하나뿐이며, 이때는 API.Bible 서버와만 통신합니다. 배지 카드는 사용자가 직접 저장하거나 복사할 때만 밖으로 나갑니다.

## 연습 글과 저작권

모든 연습 글은 저작권이 끝났거나(퍼블릭 도메인) 저작권자가 정한 조건 안에서 씁니다. 자세한 출처와 근거는 앱의 **소개** 화면에 있습니다.

| 글 | 출처 | 상태 |
|---|---|---|
| 성경 개역한글 (전권, 암송 365) | 대한성서공회 | 저작재산권 만료 (번역자 표시·본문 동일성 유지) |
| 성경 KJV (전권, 암송 365) | CrossWire KJV (eBible.org, 1769년판 기준) | 영국 밖 퍼블릭 도메인 |
| 김소월, 윤동주, 한용운, 이육사, 이상화, 정지용, 김영랑, 심훈 | 위키문헌 | 퍼블릭 도메인. 위키문헌 현대어 표기는 **CC BY-SA 4.0**으로 다시 배포 |
| 셰익스피어 소네트, 디킨슨 시집, 옛 찬송가 | 구텐베르크 프로젝트 #1041, #12242, #46041 | 퍼블릭 도메인 (구텐베르크 머리말 제외, 구텐베르크와 무관) |

**라이선스 정리**: 프로그램 코드는 MIT, 위키문헌 현대어 표기 본문은 CC BY-SA 4.0, 나머지 연습 글은 퍼블릭 도메인입니다. 불러온 사용자 파일과 API.Bible 본문은 각 저작권자의 조건을 따릅니다.

---

## 개발자 안내

```bash
npm install        # 처음 한 번
npm start          # 데스크톱 앱 실행 (Electron)
npm run serve      # 브라우저 미리보기: http://127.0.0.1:5173
npm test           # 단위 테스트
npm run dist:mac      # macOS .dmg (Apple Silicon, 인텔) → dist/
npm run dist:win      # Windows 설치본·포터블·zip (윈도우 또는 인텔 맥에서)
npm run dist:win-zip  # Apple Silicon 맥에서 Windows zip만 만들 때
```

### 설계 메모
- **입력기와 무관한 한글 조합**: `KeyboardEvent.code`로 키 위치를 읽어 두벌식을 직접 조합합니다(`src/renderer/core/hangul.js`).
- **타수**: 글자를 치는 데 필요한 키 입력 수 기준의 분당 타수(예: `과` = 3타). 받침이 다음 글자로 넘어가는 경우도 틀린 것으로 보지 않도록 키 입력 단위로 비교합니다.
- **화면 언어와 연습 언어 분리**: 화면 문구는 `src/renderer/i18n/ko.js`, `en.js`.
- **저장**: 설정·사용자·기록은 localStorage, 올린 성경은 IndexedDB(`core/bible-store.js`), API 키는 Electron safeStorage.
- **버전 관리**: `package.json`과 `src/renderer/version.js`를 함께 바꾸고 [CHANGELOG.md](CHANGELOG.md)에 적습니다.

### 데이터 만들기
- 성경: `python3 tools/build-bible.py`(암송 365, 개역한글), `english`(KJV), `full`, `full KJV`(전권). 암송 목록은 `tools/memory-verses.txt`, 주제 분류는 `src/renderer/data/verse-topics.js`.
- 시집·찬송가: `python3 tools/build-poetry.py fetch <폴더>` → `build <폴더>`. 한자 독음표는 `tools/hanja-readings.json`.
- 출처와 저작권 설명: `src/renderer/data/about.js`.

### 폴더 구조
```
src/main/        Electron 메인 프로세스 (창, 메뉴, 키 암호화 저장)
src/renderer/
  core/          한글 조합, 키보드 배열, 통계, 저장, 사용자, 배지, 성경 파일·API.Bible
  ui/            화면 키보드, 결과 창, 사용자 창, API.Bible 창, 배지 카드
  modes/         연습 메뉴와 게임
  data/          단어, 명언, 성경, 시집, 단축키, 소개 페이지
  i18n/          화면 문구 (한국어, English)
tests/           node:test 단위 테스트
tools/           데이터 생성, 미리보기 서버
docs/samples/    파일 형식 예시
```

GitHub Pages로 이 설명서를 웹 페이지로 보이려면: 리포지토리 **Settings → Pages → Source: Deploy from a branch → main / (root)**를 고르면 README가 첫 화면이 됩니다.

---

## English

**Typing Warrior** is a Korean and English typing tutor for macOS and Windows, built around Scripture and literature: the whole Bible (Korean 개역한글 and KJV), the poetry of Kim Sowol, Yun Dong-ju and Han Yong-un, Shakespeare's sonnets, Emily Dickinson and old hymns — typed line by line, with your place saved. Two games, **Word Blocks** and **Frontline**, make practice fun.

- Menus: Key Drills, Words, Sentences (verse of the day, 365 memory verses), Verses (by topic), Long texts, Word Blocks, Frontline, Shortcuts, Records, About.
- Display language and practice language are separate, so you can learn Korean typing with an English interface.
- Open your own text files or a whole-Bible file (CSV, XML: Zefania/OSIS/OpenSong/Beblia, TXT), or download English and Korean Bibles from API.Bible with your own key.
- Several users per computer, a local ranking, and shareable badge cards. Everything stays on your computer; only "Get from API.Bible" uses the internet.
- Code: MIT. Texts: public domain, except Korean Wikisource modern-spelling texts (CC BY-SA 4.0). Report bugs and ideas in [Issues](https://github.com/ccumgol/typing-warrior/issues). Made by Gihyun Park — <https://jesusiswith.us>.
