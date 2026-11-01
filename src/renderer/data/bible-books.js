// 성경 66권 이름표: 사용자가 불러온 성경 본문 파일의 책 이름(창, 창세기, Gen, Genesis …)을 알아보는 데 씁니다.
// [한글 약어, 한글 이름, 영어 약어, 영어 이름, 그 밖의 별칭...]

const BOOKS = [
  ['창', '창세기', 'Gen', 'Genesis'], ['출', '출애굽기', 'Exod', 'Exodus', 'Ex'], ['레', '레위기', 'Lev', 'Leviticus'],
  ['민', '민수기', 'Num', 'Numbers'], ['신', '신명기', 'Deut', 'Deuteronomy', 'Dt'], ['수', '여호수아', 'Josh', 'Joshua'],
  ['삿', '사사기', 'Judg', 'Judges'], ['룻', '룻기', 'Ruth', 'Ruth'], ['삼상', '사무엘상', '1Sam', '1 Samuel'],
  ['삼하', '사무엘하', '2Sam', '2 Samuel'], ['왕상', '열왕기상', '1Kgs', '1 Kings', '1Ki'], ['왕하', '열왕기하', '2Kgs', '2 Kings', '2Ki'],
  ['대상', '역대상', '1Chr', '1 Chronicles'], ['대하', '역대하', '2Chr', '2 Chronicles'], ['스', '에스라', 'Ezra', 'Ezra'],
  ['느', '느헤미야', 'Neh', 'Nehemiah'], ['에', '에스더', 'Esth', 'Esther'], ['욥', '욥기', 'Job', 'Job'],
  ['시', '시편', 'Ps', 'Psalms', 'Psalm', 'Psa', 'Pss'], ['잠', '잠언', 'Prov', 'Proverbs'], ['전', '전도서', 'Eccl', 'Ecclesiastes', 'Ecc'],
  ['아', '아가', 'Song', 'Song of Solomon', 'Song of Songs'], ['사', '이사야', 'Isa', 'Isaiah'], ['렘', '예레미야', 'Jer', 'Jeremiah'],
  ['애', '예레미야애가', 'Lam', 'Lamentations'], ['겔', '에스겔', 'Ezek', 'Ezekiel'], ['단', '다니엘', 'Dan', 'Daniel'],
  ['호', '호세아', 'Hos', 'Hosea'], ['욜', '요엘', 'Joel', 'Joel'], ['암', '아모스', 'Amos', 'Amos'],
  ['옵', '오바댜', 'Obad', 'Obadiah'], ['욘', '요나', 'Jonah', 'Jonah'], ['미', '미가', 'Mic', 'Micah'],
  ['나', '나훔', 'Nah', 'Nahum'], ['합', '하박국', 'Hab', 'Habakkuk'], ['습', '스바냐', 'Zeph', 'Zephaniah'],
  ['학', '학개', 'Hag', 'Haggai'], ['슥', '스가랴', 'Zech', 'Zechariah'], ['말', '말라기', 'Mal', 'Malachi'],
  ['마', '마태복음', 'Matt', 'Matthew', 'Mt'], ['막', '마가복음', 'Mark', 'Mark', 'Mk'], ['눅', '누가복음', 'Luke', 'Luke', 'Lk'],
  ['요', '요한복음', 'John', 'John', 'Jn'], ['행', '사도행전', 'Acts', 'Acts'], ['롬', '로마서', 'Rom', 'Romans'],
  ['고전', '고린도전서', '1Cor', '1 Corinthians'], ['고후', '고린도후서', '2Cor', '2 Corinthians'], ['갈', '갈라디아서', 'Gal', 'Galatians'],
  ['엡', '에베소서', 'Eph', 'Ephesians'], ['빌', '빌립보서', 'Phil', 'Philippians'], ['골', '골로새서', 'Col', 'Colossians'],
  ['살전', '데살로니가전서', '1Thess', '1 Thessalonians'], ['살후', '데살로니가후서', '2Thess', '2 Thessalonians'],
  ['딤전', '디모데전서', '1Tim', '1 Timothy'], ['딤후', '디모데후서', '2Tim', '2 Timothy'], ['딛', '디도서', 'Titus', 'Titus'],
  ['몬', '빌레몬서', 'Phlm', 'Philemon'], ['히', '히브리서', 'Heb', 'Hebrews'], ['약', '야고보서', 'Jas', 'James'],
  ['벧전', '베드로전서', '1Pet', '1 Peter'], ['벧후', '베드로후서', '2Pet', '2 Peter'], ['요일', '요한일서', '1John', '1 John', '1Jn'],
  ['요이', '요한이서', '2John', '2 John', '2Jn'], ['요삼', '요한삼서', '3John', '3 John', '3Jn'], ['유', '유다서', 'Jude', 'Jude'],
  ['계', '요한계시록', 'Rev', 'Revelation', 'Revelations'],
];

export const PSALMS_BOOK = 19;

const key = (name) => name.toLowerCase().replace(/[\s.]/g, '');
const BY_NAME = new Map(BOOKS.flatMap((names, i) => names.map((name) => [key(name), i + 1])));

/** Book number (1-66) for a book name in Korean or English, or null when unknown. */
export const bookNumber = (name) => BY_NAME.get(key(name)) ?? null;


/** Full book name for display: 19 → '시편' (ko) or 'Psalms' (en). */
export const bookName = (number, lang) => BOOKS[number - 1]?.[lang === 'ko' ? 1 : 3] ?? String(number);

/** Chapters in each book (Genesis 50 … Revelation 22), 1,189 in all. */
export const CHAPTER_COUNTS = Object.freeze([50, 40, 27, 36, 34, 24, 21, 4, 31, 24, 22, 25, 29, 36, 10, 13, 10, 42, 150, 31, 12, 8, 66, 52, 5, 48, 12, 14, 3, 9, 1, 4, 7, 3, 3, 3, 2, 14, 4, 28, 16, 24, 21, 28, 16, 16, 13, 6, 6, 4, 4, 5, 3, 6, 4, 3, 1, 13, 5, 5, 3, 5, 1, 1, 1, 22]);
