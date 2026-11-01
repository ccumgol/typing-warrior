// 프로그램 소개 페이지 내용 (화면 표시 언어별). 출처와 저작권 근거는 실제 데이터 파일과 같이 유지합니다.
// {count:<work id>} 같은 자리표시는 화면에서 실제 편 수로 바뀝니다.

import { REPO_URL } from '../version.js';

const link = (label, url) => Object.freeze({ label, url });
const HOMEPAGE = 'https://jesusiswith.us';


export const ABOUT = Object.freeze({
  ko: {
    title: '⌨️ Typing Warrior 소개',
    intro: [
      '맥과 윈도우에서 쓰는 한글·영문 타자 연습 프로그램입니다. 연습 화면을 넓게 쓰고 통계는 아래 상태바에 작게 보여 줍니다.',
      '운영체제의 한/영 입력 상태와 상관없이 키의 실제 위치를 읽어 앱이 직접 두벌식 한글을 조합합니다.',
      '화면 표시 언어(🌐)와 연습 언어(한/EN)를 따로 고를 수 있어 영어 화면으로 한글을 연습할 수도 있습니다.',
    ],
    features: [
      ['자리 연습', '손가락을 올려 두는 자리부터 익힙니다. 한글 7단계, 영문 6단계와 모든 글자를 섞은 혼합 모드가 있고, 화면 키보드가 다음에 칠 키와 손가락을 알려 줍니다.'],
      ['단어', '일상, 자연, 음식, 신앙 등 주제별 낱말을 하나씩 칩니다.'],
      ['문장', '오늘의 말씀, 명언 100개, 성경 암송 365구절, 영어 문장을 한 문장씩 칩니다.'],
      ['주제별 말씀', '암송 365구절을 15개 주제로 정리한 표입니다. 주제를 고르면 그 구절들로 바로 연습할 수 있습니다.'],
      ['긴 글', '성경 전권과 김소월·윤동주·한용운의 시집, 셰익스피어 소네트, 디킨슨 시, 옛 찬송가를 한 줄씩 이어서 칩니다. 어디까지 쳤는지 저장되고, 내 텍스트 파일·성경 파일이나 API.Bible에서 받은 역본으로도 연습할 수 있습니다.'],
      ['단어블록게임', '떨어지는 단어 블록을 땅에 닿기 전에 쳐서 없애는 게임입니다. 점점 빨라지는 연속 모드와 레벨을 하나씩 깨는 단계 모드(레벨 10 = 분당 200타)가 있습니다.'],
      ['전선작전게임', '다가오는 적 위의 단어를 쳐서 막아 내는 1인칭 타자 게임입니다. 효과음 세트 4가지 중에서 고를 수 있습니다.'],
      ['단축키', 'macOS와 Windows의 기본 단축키를 3단계로 익힙니다. 화면 키보드를 감추면 외워서 누르는 연습이 됩니다.'],
      ['기록', '내 연습 기록, 이 컴퓨터를 함께 쓰는 사용자들의 순위, 긴 글을 끝내고 받은 배지를 봅니다. 배지는 카드 이미지로 저장해 나눌 수 있습니다.'],
      ['사용자', '오른쪽 위 👤 버튼에서 사용자를 추가하면 기록과 진행 위치를 사람마다 따로 저장합니다.'],
    ],
    shortcutsTitle: '꼭 알아 두면 좋은 키',
    shortcuts: [
      ['F2', '화면 키보드 보이기 / 감추기'],
      ['F3', '손가락 색상 켜기 / 끄기'],
      ['Shift + Space', '연습 언어 한글 ↔ 영문 (한/영 키도 됨)'],
      ['F11', '전체화면 / 창 모드'],
      ['Esc', '게임 일시정지'],
      ['Enter', '다음 문장·다음 줄로 넘어가기, 게임 시작'],
    ],
    sourcesTitle: '연습 글의 출처와 저작권',
    sourcesIntro:
      '이 프로그램에 실린 글은 저작권이 끝났거나(퍼블릭 도메인), 저작권자가 정한 조건 안에서 쓰는 글입니다. ' +
      '우리나라 저작권법에서는 1962년 이전에 세상을 떠난 저작자의 저작물은 보호 기간이 끝난 것으로 봅니다(2013년 보호 기간 연장은 이미 끝난 저작물에 적용되지 않음). ' +
      '모든 본문은 아래 출처에서 그대로 가져왔고, 키보드로 칠 수 없는 문자만 정해진 규칙으로 바꿨습니다.',
    sources: [
      {
        name: '성경 · 개역한글 (성경 전권, 암송 365구절)',
        lines: [
          '번역·저작권: 대한성서공회. 『성경전서 개역한글판』(1961)은 저작재산권 보호 기간이 지나 저작권료 없이 쓸 수 있다고 대한성서공회가 안내합니다.',
          '조건: 성명표시권(번역자 표시)과 동일성유지권(본문을 바꾸지 않기)을 지켜야 합니다. 이 프로그램은 본문을 바꾸지 않고, 키보드로 칠 수 없는 따옴표·가운뎃점만 바꾸고 문단 표시(○)는 뺐습니다.',
          '개역개정판은 저작권이 있어(대한성서공회) 기본 데이터에 넣지 않았습니다.',
        ],
        links: [link('대한성서공회 저작권 FAQ', 'https://www.bskorea.or.kr/bbs/board.php?bo_table=copyright_faq&wr_id=5')],
      },
      {
        name: '성경 · KJV (성경 전권, 영어 암송 365구절, 응원 구절)',
        lines: [
          'King James Version(1769년 옥스퍼드 Blayney판 기준). CrossWire Bible Society가 1769년판 영인본과 대조해 만든 전자 본문을 eBible.org에서 받아 썼습니다.',
          '영국 밖에서는 퍼블릭 도메인입니다. 영국에서는 왕실 특허(Letters Patent)로 인쇄가 제한됩니다.',
          '이탤릭(번역자가 덧붙인 말) 표시는 빼고 단어만 남겼고, 둥근 아포스트로피(’)는 키보드의 \'로, 합자 æ(Cæsar)는 ae로 바꿨습니다.',
        ],
        links: [link('eBible.org KJV', 'https://ebible.org/find/details.php?id=eng-kjv'), link('CrossWire KJV', 'https://wiki.crosswire.org/CrossWire_KJV')],
      },
      {
        name: '김소월 『진달래꽃』 (1925, 매문사) · {count:jindallae}편',
        lines: [
          '김소월(1902~1934). 저작자 사망 후 보호 기간이 끝난 퍼블릭 도메인입니다.',
          '본문 출처: 위키문헌. 위키문헌에 현대어 표기가 있는 시({modern:jindallae}편)는 현대어 표기를, 나머지는 원문을 썼습니다.',
          '현대어 표기는 위키문헌 기여자들의 작업이며 CC BY-SA 4.0으로 공개되어 있습니다. 이 프로그램도 그 본문을 같은 조건(CC BY-SA 4.0)으로 다시 배포합니다.',
          '한자 병기(예: 영변(寧邊))는 빼고 한글만 남겼습니다.',
        ],
        links: [link('위키문헌 『진달래꽃』', 'https://ko.wikisource.org/wiki/%EC%A7%84%EB%8B%AC%EB%9E%98%EA%BD%83_(%EC%8B%9C%EC%A7%91)'), link('CC BY-SA 4.0', 'https://creativecommons.org/licenses/by-sa/4.0/deed.ko')],
      },
      {
        name: '윤동주 『하늘과 바람과 별과 시』 (1948 초판, 정음사) · {count:yundongju}편',
        lines: [
          '윤동주(1917~1945). 퍼블릭 도메인입니다.',
          '본문 출처: 위키문헌의 1948년 초판 원문(스캔본 교정본). 정지용의 서문과 강처중의 발문은 넣지 않고 시만 넣었습니다.',
          '초판의 한자 낱말은 한글 독음으로 바꿨습니다(예: 病院 → 병원, 女子 → 여자). 바꾼 목록은 tools/hanja-readings.json에 있습니다. 맞춤법은 초판 그대로입니다.',
        ],
        links: [link('위키문헌 1948년 초판', 'https://ko.wikisource.org/wiki/%ED%95%98%EB%8A%98%EA%B3%BC_%EB%B0%94%EB%9E%8C%EA%B3%BC_%EB%B3%84%EA%B3%BC_%EC%8B%9C_(1948%EB%85%84)')],
      },
      {
        name: '한용운 『님의 침묵』 (1926, 회동서관) · {count:nimui}편',
        lines: [
          '한용운(1879~1944). 퍼블릭 도메인입니다.',
          '본문 출처: 위키문헌. 각 시의 현대어 표기({modern:nimui}편)를 썼습니다. 현대어 표기는 위키문헌 기여자들의 작업으로 CC BY-SA 4.0이며, 이 프로그램도 같은 조건으로 다시 배포합니다.',
        ],
        links: [link('위키문헌 『님의 침묵』', 'https://ko.wikisource.org/wiki/%EB%8B%98%EC%9D%98_%EC%B9%A8%EB%AC%B5')],
      },
      {
        name: '한국 근대시 모음 · {count:ko-anthology}편',
        lines: [
          '이육사(1904~1944) 「광야」·「청포도」·「절정」, 이상화(1901~1943) 「빼앗긴 들에도 봄은 오는가」, 정지용(1902~1950) 「향수」·「유리창 1」, 김영랑(1903~1950) 「모란이 피기까지는」, 심훈(1901~1936) 「그날이 오면」.',
          '모두 1962년 이전에 세상을 떠난 시인의 작품으로 퍼블릭 도메인입니다. 본문 출처: 위키문헌(현대어 표기가 있는 시는 현대어 표기, CC BY-SA 4.0).',
          '「모란이 피기까지는」은 1935년 『영랑시집』 원문 표기 그대로이며, 한자 두 낱말(三百, 五月)만 한글 독음으로 바꿨습니다.',
          '옛 표기 「해ㅅ살」처럼 두벌식으로 칠 수 없는 사이시옷은 「햇살」로 바꿨습니다.',
        ],
        links: [link('위키문헌', 'https://ko.wikisource.org/')],
      },
      {
        name: "William Shakespeare, Shakespeare's Sonnets (1609) · {count:sonnets}편",
        lines: [
          '셰익스피어(1564~1616). 퍼블릭 도메인입니다.',
          '본문 출처: 구텐베르크 프로젝트 eBook #1041. 구텐베르크의 머리말과 라이선스 문구는 빼고 시만 넣었습니다. 이 프로그램은 구텐베르크 프로젝트와 관계가 없습니다.',
        ],
        links: [link('Project Gutenberg #1041', 'https://www.gutenberg.org/ebooks/1041'), link('Gutenberg 허락 안내', 'https://www.gutenberg.org/policy/permission')],
      },
      {
        name: '에밀리 디킨슨 시집 (Poems, Three Series, 1890~1896) · {count:dickinson}편',
        lines: [
          '에밀리 디킨슨(1830~1886). 메이블 루미스 토드(1856~1932)와 토머스 웬트워스 히긴슨(1823~1911)이 엮은 1890년대 판으로 퍼블릭 도메인입니다.',
          '1955년 이후의 원문 복원판(Johnson 판 등)은 저작권이 있어 쓰지 않았습니다.',
          '본문 출처: 구텐베르크 프로젝트 eBook #12242. 엮은이 서문과 주석, 구텐베르크 머리말은 빼고 시만 넣었습니다. 악센트가 붙은 글자(è, ë)는 키보드로 칠 수 있게 기본 글자로 바꿨습니다.',
        ],
        links: [link('Project Gutenberg #12242', 'https://www.gutenberg.org/ebooks/12242')],
      },
      {
        name: '옛 찬송가 (영어) · {count:hymns}곡',
        lines: [
          'Rock of Ages, Amazing Grace, Joy to the World, When I Survey the Wondrous Cross, Abide with Me 등 지금도 널리 부르는 찬송가를 골랐습니다. 작사가는 아이작 와츠(1674~1748), 찰스 웨슬리(1707~1788), 존 뉴턴(1725~1807) 등으로 모두 퍼블릭 도메인입니다.',
          '본문 출처: 『The Christian Hymn Book』(1865년, 1870년 개정판) — 구텐베르크 프로젝트 eBook #46041. 이 판의 가사를 그대로 실어 요즘 찬송가집과 단어나 절 구성이 조금 다를 수 있습니다.',
        ],
        links: [link('Project Gutenberg #46041', 'https://www.gutenberg.org/ebooks/46041')],
      },
      {
        name: '단어 · 명언 · 영어 문장',
        lines: [
          '단어와 영어 연습 문장은 이 프로그램을 위해 고른 일반 낱말과 짧은 문장입니다.',
          '명언은 널리 알려진 짧은 격언을 한국어로 옮기거나 요지를 정리한 것이며, 각 문장에 말한 사람을 표시합니다.',
        ],
        links: [],
      },
    ],
    creatorTitle: '만든 사람',
    creator: [
      { label: '제작', text: '박기현' },
      { label: '홈페이지', link: link('jesusiswith.us', HOMEPAGE) },
      { label: '버그·오타 신고, 개선 제안', text: 'GitHub 이슈에 남겨 주세요.', link: link('Issues', `${REPO_URL}/issues`) },
      { label: '소스 코드', text: 'MIT 라이선스로 공개합니다.', link: link('GitHub', REPO_URL) },
      { label: '후원', text: '후원 방법은 홈페이지에서 안내합니다.', link: link('jesusiswith.us', HOMEPAGE) },
    ],
    otherTitle: '그 밖의 정보',
    other: [
      '긴 글 화면의 \'내 글 불러오기\'와 \'성경 파일 올리기\'로 불러온 파일은 이 컴퓨터 안에만 저장되고 다른 곳으로 보내지 않습니다. 불러온 글의 저작권은 각 저작권자에게 있으므로, 저작권이 있는 글은 정식으로 구한 본문을 개인 연습용으로만 쓰세요. 파일 형식과 예시 파일은 긴 글 화면의 \'파일 형식\' 버튼을 누르면 볼 수 있습니다.',
      '효과음은 녹음 파일 없이 프로그램이 직접 합성합니다.',
      '설정, 사용자, 연습 기록과 배지는 이 컴퓨터 안(앱 저장소)에만 저장되며 외부로 보내지 않습니다. 인터넷을 쓰는 기능은 사용자가 직접 실행하는 \'API.Bible에서 받기\' 하나뿐이며, 이때는 API.Bible 서버와만 통신합니다(역본 목록과 본문 받기, 약관에 따른 사용 기록 전송). 배지 카드는 사용자가 직접 저장하거나 복사해서 나눌 때만 밖으로 나갑니다.',
      '데스크톱 앱은 Electron(MIT 라이선스)으로 만들었습니다.',
      '이 페이지의 저작권 설명은 각 출처가 공개한 안내를 정리한 것이며 법률 자문이 아닙니다. 프로그램을 판매하거나 널리 배포하려면 각 저작권자의 최신 조건을 다시 확인하세요.',
    ],
  },
  en: {
    title: '⌨️ About Typing Warrior',
    intro: [
      'A Korean and English typing tutor for macOS and Windows. The practice area fills the screen; statistics stay small in the status bar.',
      'It reads physical key positions and composes 두벌식 Hangul itself, so it works regardless of the system input method.',
      'The display language (🌐) and the practice language (한/EN) are separate, so you can learn Korean typing with an English interface.',
    ],
    features: [
      ['Key Drills', 'Learn where your fingers rest. There are 7 Korean and 6 English steps plus a mixed mode, and the on-screen keyboard shows the next key and finger.'],
      ['Words', 'Type themed words one at a time: daily life, nature, food, faith and more.'],
      ['Sentences', 'Type the verse of the day, 100 Korean quotes, 365 memory verses or English sentences, one sentence at a time.'],
      ['Verses by topic', 'The 365 memory verses arranged by 15 topics. Pick a topic to practise its verses right away.'],
      ['Long texts', 'Type the whole Bible, the poetry of Kim Sowol, Yun Dong-ju and Han Yong-un, Shakespeare’s sonnets, Dickinson’s poems and old hymns line by line. Your place is saved, and you can also use your own text files, a Bible file or a Bible from API.Bible.'],
      ['Word Blocks', 'Type the falling word blocks before they hit the ground: an endless mode that keeps speeding up and a stage mode with 20 levels (level 10 = 200 strokes per minute).'],
      ['Frontline Game', 'A first-person typing game: type the word above each approaching enemy. Choose from four sound sets.'],
      ['Shortcuts', 'Learn the basic macOS and Windows shortcuts in three steps. Hide the keyboard to press them from memory.'],
      ['Records', 'Your own records, a ranking of the users on this computer, and the badges earned in Long texts. Badges can be saved as a card image to share.'],
      ['Users', 'Add users with the 👤 button at the top right; each person keeps their own records and reading position.'],
    ],
    shortcutsTitle: 'Keys worth knowing',
    shortcuts: [
      ['F2', 'Show / hide the on-screen keyboard'],
      ['F3', 'Finger colours on / off'],
      ['Shift + Space', 'Practice language Korean ↔ English (the 한/영 key works too)'],
      ['F11', 'Fullscreen / window'],
      ['Esc', 'Pause a game'],
      ['Enter', 'Next sentence or line, start a game'],
    ],
    sourcesTitle: 'Text sources and copyright',
    sourcesIntro:
      'Every text in this program is either in the public domain or quoted within the terms set by its copyright holder. ' +
      'Under Korean copyright law, works by authors who died in 1962 or earlier are out of copyright (the 2013 term extension did not revive expired works). ' +
      'All texts are taken unchanged from the sources below; only characters that cannot be typed on a keyboard were replaced by fixed rules.',
    sources: [
      {
        name: 'Bible · Korean Revised Version 개역한글 (whole Bible, 365 memory verses)',
        lines: [
          'Translation and copyright: Korean Bible Society. The Society states that the economic rights in 『성경전서 개역한글판』 (1961) have expired and it may be used without royalties.',
          "Conditions: the translator's moral rights (attribution and integrity) must be respected. The text is not altered; only untypable quotation marks and middle dots were replaced and paragraph marks (○) removed.",
          'The Korean Revised New Version (개역개정) is still under copyright and is not included.',
        ],
        links: [link('Korean Bible Society copyright FAQ', 'https://www.bskorea.or.kr/bbs/board.php?bo_table=copyright_faq&wr_id=5')],
      },
      {
        name: 'Bible · KJV (whole Bible, 365 memory verses, encouragement verses)',
        lines: [
          'King James Version, 1769 Oxford (Blayney) text, from the CrossWire Bible Society e-text checked against a 1769 facsimile, downloaded from eBible.org.',
          'Public domain outside the United Kingdom; in the UK printing is restricted by the Crown Letters Patent.',
          "Italic (supplied-word) markers were removed, keeping the words; curly apostrophes (’) were replaced with the keyboard's ' and the ligature æ (Cæsar) with ae.",
        ],
        links: [link('eBible.org KJV', 'https://ebible.org/find/details.php?id=eng-kjv'), link('CrossWire KJV', 'https://wiki.crosswire.org/CrossWire_KJV')],
      },
      {
        name: 'Kim Sowol, 『진달래꽃』 Azaleas (1925) · {count:jindallae} poems',
        lines: [
          'Kim Sowol (1902-1934). Public domain.',
          'Source: Korean Wikisource. Where Wikisource offers a modern-spelling version ({modern:jindallae} poems) it is used; otherwise the original text.',
          'The modern-spelling versions are the work of Wikisource contributors under CC BY-SA 4.0, and this program redistributes them under the same licence.',
          'Hanja glosses such as 영변(寧邊) were removed, keeping the Hangul.',
        ],
        links: [link('Wikisource: 진달래꽃', 'https://ko.wikisource.org/wiki/%EC%A7%84%EB%8B%AC%EB%9E%98%EA%BD%83_(%EC%8B%9C%EC%A7%91)'), link('CC BY-SA 4.0', 'https://creativecommons.org/licenses/by-sa/4.0/')],
      },
      {
        name: 'Yun Dong-ju, 『하늘과 바람과 별과 시』 Sky, Wind, Stars and Poetry (1948 first edition) · {count:yundongju} poems',
        lines: [
          'Yun Dong-ju (1917-1945). Public domain.',
          "Source: the 1948 first-edition text proofread on Wikisource. Only the poems are included (not Jeong Ji-yong's preface or Kang Cheo-jung's afterword).",
          'Hanja words were converted to their Hangul readings (e.g. 病院 → 병원); the full list is in tools/hanja-readings.json. Spelling is kept as in the first edition.',
        ],
        links: [link('Wikisource: 1948 edition', 'https://ko.wikisource.org/wiki/%ED%95%98%EB%8A%98%EA%B3%BC_%EB%B0%94%EB%9E%8C%EA%B3%BC_%EB%B3%84%EA%B3%BC_%EC%8B%9C_(1948%EB%85%84)')],
      },
      {
        name: 'Han Yong-un, 『님의 침묵』 The Silence of Love (1926) · {count:nimui} poems',
        lines: [
          'Han Yong-un (1879-1944). Public domain.',
          'Source: Korean Wikisource, using its modern-spelling versions ({modern:nimui} poems), by Wikisource contributors under CC BY-SA 4.0 and redistributed here under the same licence.',
        ],
        links: [link('Wikisource: 님의 침묵', 'https://ko.wikisource.org/wiki/%EB%8B%98%EC%9D%98_%EC%B9%A8%EB%AC%B5')],
      },
      {
        name: 'Modern Korean Poems · {count:ko-anthology} poems',
        lines: [
          'Yi Yuksa (1904-1944), Yi Sang-hwa (1901-1943), Jeong Ji-yong (1902-1950), Kim Yeong-rang (1903-1950), Sim Hun (1901-1936).',
          'All died in 1962 or earlier, so the poems are public domain. Source: Korean Wikisource (modern-spelling versions where available, CC BY-SA 4.0).',
          '「모란이 피기까지는」 keeps the original 1935 spelling of 『영랑시집』, with two hanja words (三百, 五月) given in Hangul.',
          'Old spellings like 해ㅅ살, which cannot be typed on 두벌식, were written as 햇살.',
        ],
        links: [link('Korean Wikisource', 'https://ko.wikisource.org/')],
      },
      {
        name: "William Shakespeare, Shakespeare's Sonnets (1609) · {count:sonnets} sonnets",
        lines: [
          'William Shakespeare (1564-1616). Public domain.',
          'Source: Project Gutenberg eBook #1041, without the Project Gutenberg header and licence. This program is not affiliated with Project Gutenberg.',
        ],
        links: [link('Project Gutenberg #1041', 'https://www.gutenberg.org/ebooks/1041'), link('Gutenberg permissions', 'https://www.gutenberg.org/policy/permission')],
      },
      {
        name: 'Poems by Emily Dickinson, Three Series (1890-1896) · {count:dickinson} poems',
        lines: [
          'Emily Dickinson (1830-1886), as edited by Mabel Loomis Todd (1856-1932) and Thomas Wentworth Higginson (1823-1911). Public domain.',
          'Later restored editions (Johnson, 1955 onwards) are under copyright and were not used.',
          "Source: Project Gutenberg eBook #12242, without the editors' prefaces and notes or the Project Gutenberg header. Accented letters (è, ë) were replaced with their base letters so they can be typed.",
        ],
        links: [link('Project Gutenberg #12242', 'https://www.gutenberg.org/ebooks/12242')],
      },
      {
        name: 'Old Hymns · {count:hymns} hymns',
        lines: [
          'Hymns still widely sung, such as Rock of Ages, Amazing Grace, Joy to the World, When I Survey the Wondrous Cross and Abide with Me, by Isaac Watts (1674-1748), Charles Wesley (1707-1788), John Newton (1725-1807) and others. Public domain.',
          'Source: The Christian Hymn Book (1865, revised 1870), Project Gutenberg eBook #46041. Words follow that edition, so a word or stanza may differ from modern hymnals.',
        ],
        links: [link('Project Gutenberg #46041', 'https://www.gutenberg.org/ebooks/46041')],
      },
      {
        name: 'Words · quotes · English sentences',
        lines: [
          'The word lists and English practice sentences are common words and short sentences chosen for this program.',
          'The Korean quotes are well-known short sayings translated or summarised, each credited to its speaker.',
        ],
        links: [],
      },
    ],
    creatorTitle: 'Made by',
    creator: [
      { label: 'Author', text: 'Gihyun Park (박기현)' },
      { label: 'Homepage', link: link('jesusiswith.us', HOMEPAGE) },
      { label: 'Bugs, typos and ideas', text: 'Please open a GitHub issue.', link: link('Issues', `${REPO_URL}/issues`) },
      { label: 'Source code', text: 'Open source under the MIT licence.', link: link('GitHub', REPO_URL) },
      { label: 'Support', text: 'Ways to support the project are on the homepage.', link: link('jesusiswith.us', HOMEPAGE) },
    ],
    otherTitle: 'Other information',
    other: [
      "Files opened with 'Open my text' or 'Open a Bible file' on the Long texts screen are stored only on this computer and never sent anywhere. Their copyright belongs to their owners, so use legitimately obtained copies of copyrighted texts for personal practice only. The file formats and sample files are shown with the 'File format' button on the Long texts screen.",
      'Sound effects are synthesized by the program; no audio files are used.',
      "Settings, users, records and badges are stored only on this computer and never sent anywhere. The only feature that uses the internet is 'Get from API.Bible', which you start yourself; it talks only to API.Bible (listing and downloading Bibles, and the usage reports its licence requires). Badge cards leave the computer only when you save or copy them to share.",
      'The desktop app is built with Electron (MIT licence).',
      "These copyright notes summarise each source's published terms and are not legal advice. Check the current terms of each rights holder before selling or widely distributing the program.",
    ],
  },
});
