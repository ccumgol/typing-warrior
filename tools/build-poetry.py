"""Download and build the poetry texts for 긴 글 연습.

Usage:
    python3 tools/build-poetry.py fetch DIR   # download sources into DIR (Project Gutenberg + 위키문헌)
    python3 tools/build-poetry.py build DIR   # write src/renderer/data/poetry-ko.js and poetry-en.js

Sources (all public domain; see the 프로그램 소개 page for details):
  - Shakespeare, Sonnets — Project Gutenberg eBook #1041
  - Emily Dickinson, Poems (Three Series, 1890-1896) — Project Gutenberg eBook #12242
  - Old hymns: well-known hymns from The Christian Hymn Book (1865, rev. 1870) — Project Gutenberg eBook #46041
  - 김소월 『진달래꽃』(1925), 윤동주 『하늘과 바람과 별과 시』(1948 초판), 한용운 『님의 침묵』(1926)
    and selected modern Korean poems — ko.wikisource.org
Project Gutenberg headers, licence text and editors' prefaces are dropped; only the poems are kept.
"""
import json
import re
import sys
import time
import unicodedata
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / "src" / "renderer" / "data"
HANJA_TABLE = Path(__file__).resolve().parent / "hanja-readings.json"
UA = {"User-Agent": "typing-warrior-builder/1.0 (personal typing practice app)"}

GUTENBERG = {"sonnets": 1041, "dickinson": 12242, "hymns": 46041}
# Well-known hymns picked from the 1,324 in The Christian Hymn Book, by first line (in this order).
HYMN_FIRST_LINES = [
    "Rock of ages, cleft for me", "Jesus, lover of my soul", "Amazing grace", "Joy to the world", "When I survey the wondrous cross",
    "All hail the power of Jesus", "Just as I am", "Sweet hour of prayer", "Nearer, my God, to thee", "How firm a foundation",
    "Love divine, all love", "Abide with me", "Our God, our help in ages past", "Jesus shall reign", "Am I a soldier of the cross",
    "There is a fountain filled with blood", "My faith looks up to thee", "Guide me, O thou great", "Alas! and did my Saviour bleed",
    "Blest be the tie that binds", "From Greenland's icy mountains", "I love thy kingdom, Lord", "O happy day", "Hark! the herald angels sing",
    "Jesus, I my cross have taken", "Come, ye disconsolate", "Glorious things of thee are spoken", "Majestic sweetness sits enthroned",
    "A charge to keep I have", "On Jordan's stormy banks", "O could I speak the matchless worth", "Children of the heavenly King",
    "Jerusalem, my happy home", "There is a land of pure delight", "Before Jehovah's awful throne",
]
KO_BOOKS = {"jindallae": "진달래꽃 (시집)", "yundongju": "하늘과 바람과 별과 시 (1948년)", "nimui": "님의 침묵"}
ANTHOLOGY = [  # (Wikisource page, title, author)
    ("광야 (이육사)", "광야", "이육사"), ("청포도", "청포도", "이육사"), ("절정", "절정", "이육사"),
    ("빼앗긴 들에도 봄은 오는가", "빼앗긴 들에도 봄은 오는가", "이상화"),
    ("향수/향수", "향수", "정지용"), ("향수/유리창1", "유리창 1", "정지용"),
    ("영랑시집/모란이 피기까지는", "모란이 피기까지는", "김영랑"), ("그날이 오면/그날이 오면", "그날이 오면", "심훈"),
]
WIKISOURCE = "https://ko.wikisource.org"
# Poems whose sentence runs across a scanned page break (윤동주 「병원」: "速" / "히"). Elsewhere a page break is a line break.
JOIN_ACROSS_PAGES = {"병원"}
HANJA = r"[㐀-䶿一-鿿豈-﫿]"
MISSING_HANJA: set[str] = set()  # hanja runs with no entry in tools/hanja-readings.json
PUNCT = {"―": "-", "—": "-", "–": "-", "`": "'", "“": '"', "”": '"', "‘": "'", "’": "'", "…": "...",
         "···": "...", "·": ",", "「": "'", "」": "'", "｢": "'", "｣": "'", "　": " ", " • ": " ", "•": " "}


# ---------------------------------------------------------------- fetch

def get(url: str, tries: int = 6) -> str:
    for attempt in range(tries):
        try:
            with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=30) as resp:
                return resp.read().decode("utf-8")
        except urllib.error.HTTPError as error:
            if error.code != 429 or attempt == tries - 1:
                raise
            time.sleep(5 * (attempt + 1))  # Wikisource rate limit: back off and retry
    raise RuntimeError(url)


def raw(title: str) -> str:
    time.sleep(1.0)
    return get(f"{WIKISOURCE}/w/index.php?action=raw&title=" + urllib.parse.quote(title.replace(" ", "_")))


def subpages(prefix: str) -> list[str]:
    url = f"{WIKISOURCE}/w/api.php?action=query&list=allpages&aplimit=500&format=json&apprefix=" + urllib.parse.quote(prefix)
    return [p["title"] for p in json.loads(get(url))["query"]["allpages"]]


def page_with_scans(title: str) -> dict:
    """A Wikisource page plus the scanned pages it transcludes (<pages index=.. from=.. to=..>)."""
    text = raw(title)
    scan = []
    if m := re.search(r'<pages index="([^"]+)" from=(\d+) to=(\d+)', text):
        scan = [raw(f"Page:{m.group(1)}/{n}") for n in range(int(m.group(2)), int(m.group(3)) + 1)]
    return {"title": title, "wikitext": text, "scan": scan}


def fetch_anthology(folder: Path) -> None:
    pages = [page_with_scans(title) for title, _, _ in ANTHOLOGY]
    (folder / "anthology.json").write_text(json.dumps({"pages": pages}, ensure_ascii=False), encoding="utf-8")


def fetch(folder: Path) -> None:
    folder.mkdir(parents=True, exist_ok=True)
    for name, number in GUTENBERG.items():
        (folder / f"pg{number}.txt").write_text(get(f"https://www.gutenberg.org/cache/epub/{number}/pg{number}.txt"), encoding="utf-8")
    for key, book in KO_BOOKS.items():
        pages = [page_with_scans(title) for title in subpages(book + "/")]
        (folder / f"{key}.json").write_text(json.dumps({"book": book, "index": raw(book), "pages": pages}, ensure_ascii=False), encoding="utf-8")
    fetch_anthology(folder)
    print(f"Downloaded sources into {folder}")


# ---------------------------------------------------------------- Korean

def strip_templates(text: str) -> str:
    previous = None
    while previous != text:
        previous, text = text, re.sub(r"\{\{[^{}]*\}\}", "", text)
    return text


def join_scans(scans: list[str], continues: bool) -> str:
    """Join transcluded scan pages. With `continues`, the text runs on across the page break."""
    out = ""
    for page in scans:
        page = re.sub(r"<noinclude>.*?</noinclude>", "", page, flags=re.S)
        page = re.sub(r"^\{\{c\|.*$", "", page, flags=re.M)  # centred title / epigraph
        if out and continues:
            out = re.sub(r"\s*</poem>\s*$", "", out) + re.sub(r"^\s*<poem>\s*", "", page)
        else:
            out += "\n" + page
    return out.replace("<poem>", "").replace("</poem>", "")


def poem_body(wikitext: str, scans: list[str], title: str = "") -> tuple[str, str]:
    """Return (text, kind). kind is 'modern' for 위키문헌's 현대어 표기, otherwise 'original'."""
    text = re.sub(r"<noinclude>.*?</noinclude>|<!--.*?-->", "", wikitext, flags=re.S)
    if "현대어" in text and (m := re.search(r"<poem>(.*?)</poem>", text[text.index("현대어"):], re.S)):
        return m.group(1), "modern"
    if scans:
        return join_scans(scans, title in JOIN_ACROSS_PAGES), "original"
    if m := re.search(r"<poem>(.*?)</poem>", text, re.S):
        return m.group(1), "original"
    body = re.split(r"==\s*(?:라이선스|저작권)", text)[0]
    return (body.split("}}", 1)[1] if body.lstrip().startswith("{{머리말") else body), "original"


def hangul_readings(line: str, table: dict) -> str:
    line = re.sub(HANJA + r"+\(([가-힣]+)\)", r"\1", line)          # 前(전)날 → 전날
    line = re.sub(r"\s*[\(\[]" + HANJA + r"+[\)\]]", "", line)        # 영변(寧邊), 바탕[質] → 영변, 바탕
    for run, reading in table["contextual"].items():
        if not run.startswith("_"):
            line = line.replace(run, reading)
    def reading(m: re.Match) -> str:
        if m.group(0) not in table["readings"]:
            MISSING_HANJA.add(m.group(0))
            return m.group(0)
        return table["readings"][m.group(0)]
    return re.sub(HANJA + "+", reading, line)


def sai_siot(line: str) -> str:
    """Old spelling 해ㅅ살 → 햇살 (a lone ㅅ cannot be typed after a syllable on 두벌식)."""
    def merge(m: re.Match) -> str:
        code = ord(m.group(1)) - 0xAC00
        return chr(0xAC00 + code + 19) + m.group(2) if code % 28 == 0 else m.group(1) + m.group(2)
    return re.sub(r"([가-힣])ㅅ([가-힣])", merge, line)


def korean_lines(text: str, table: dict, title: str = "") -> list[str]:
    text = strip_templates(text)
    text = re.sub(r"<br\s*/?>", "\n", text)
    lines = []
    for line in text.split("\n"):
        if "<big>" in line:
            continue  # the poem's own title inside the block
        line = re.sub(r"<[^>]+>", "", line).replace("'''", "").replace("''", "").lstrip(":")
        line = hangul_readings(line, table)
        for src, dst in PUNCT.items():
            line = line.replace(src, dst)
        line = re.sub(r"\s+", " ", sai_siot(line)).strip()
        if line and not line.isdigit():  # skip scanned page numbers
            lines.append(line)
    return lines


def chain(pages: dict, start: str) -> list[str]:
    """Book order from each page's 이전/다음 links, starting at `start`."""
    links = {}
    for name, page in pages.items():
        if m := re.search(r"\|\s*다음\s*=\s*\[\[(?:\.\./|[^|\]]*/)?([^|\]]+)", page["wikitext"]):
            links.setdefault(name, m.group(1).strip())
        if m := re.search(r"\|\s*이전\s*=\s*\[\[(?:\.\./|[^|\]]*/)?([^|\]]+)", page["wikitext"]):
            links.setdefault(m.group(1).strip(), name)
    order, current = [], start
    while current in pages and current not in order:
        order.append(current)
        current = links.get(current)
    return order + sorted(set(pages) - set(order))


def book_pieces(folder: Path, key: str, start: str, skip: set, table: dict) -> list[dict]:
    data = json.loads((folder / f"{key}.json").read_text(encoding="utf-8"))
    pages = {p["title"].split("/", 1)[1]: p for p in data["pages"]}
    if key == "jindallae":  # the index page lists the poems in book order
        order = [m.group(1) for m in re.finditer(r"\[\[/([^|\]]+)", data["index"])]
        order = list(dict.fromkeys(name for name in order if name in pages))
    else:
        order = chain(pages, start)
    pieces = []
    for name in order:
        if name in skip or re.match(r"\s*#(넘겨주기|REDIRECT)", pages[name]["wikitext"], re.I):
            continue  # skipped pages and redirects to another title
        text, kind = poem_body(pages[name]["wikitext"], pages[name].get("scan", []), name)
        pieces.append({"title": name, "kind": kind, "lines": korean_lines(text, table, name)})
    return pieces


def build_korean(folder: Path) -> list[dict]:
    table = json.loads(HANJA_TABLE.read_text(encoding="utf-8"))
    anthology = json.loads((folder / "anthology.json").read_text(encoding="utf-8"))["pages"]
    anthology_pieces = []
    for page, (_, title, author) in zip(anthology, ANTHOLOGY):
        text, kind = poem_body(page["wikitext"], page.get("scan", []), title)
        anthology_pieces.append({"title": f"{title} ({author})", "kind": kind, "lines": korean_lines(text, table, title)})
    return [
        work("jindallae", "ko", {"ko": "진달래꽃", "en": "Azaleas"}, {"ko": "김소월", "en": "Kim Sowol"}, 1925,
             book_pieces(folder, "jindallae", "", set(), table), KO_BOOKS["jindallae"]),
        work("yundongju", "ko", {"ko": "하늘과 바람과 별과 시", "en": "Sky, Wind, Stars and Poetry"}, {"ko": "윤동주", "en": "Yun Dong-ju"}, 1948,
             book_pieces(folder, "yundongju", "서시", {"서", "발문"}, table), KO_BOOKS["yundongju"]),
        work("nimui", "ko", {"ko": "님의 침묵", "en": "The Silence of Love"}, {"ko": "한용운", "en": "Han Yong-un"}, 1926,
             book_pieces(folder, "nimui", "군말", set(), table), KO_BOOKS["nimui"]),
        work("ko-anthology", "ko", {"ko": "한국 근대시 모음", "en": "Modern Korean Poems"}, {"ko": "이육사 외", "en": "Yi Yuksa and others"}, None,
             anthology_pieces, None),
    ]


# ---------------------------------------------------------------- English

def gutenberg_body(folder: Path, number: int) -> list[str]:
    text = (folder / f"pg{number}.txt").read_text(encoding="utf-8").replace("\r", "")
    start = text.index("\n", text.index("*** START OF")) + 1
    return text[start:text.index("*** END OF")].split("\n")


def english_line(line: str) -> str:
    line = line.replace("_", "")  # Gutenberg marks italics with underscores
    # Accented letters (è, ë) cannot be typed on a US layout: keep the base letter.
    line = "".join(c for c in unicodedata.normalize("NFD", line) if not unicodedata.combining(c))
    for src, dst in PUNCT.items():
        line = line.replace(src, dst)
    return re.sub(r"\s+", " ", line).strip()


def sonnets(folder: Path) -> list[dict]:
    pieces, current = [], None
    for line in gutenberg_body(folder, GUTENBERG["sonnets"]):
        if re.fullmatch(r"\s*[IVXLC]+\s*", line):
            current = {"title": None, "kind": "original", "lines": []}
            pieces.append(current)
        elif current is not None and line.strip():
            current["lines"].append(english_line(line))
    if len(pieces) != 154:
        raise SystemExit(f"Expected 154 sonnets, found {len(pieces)}")
    return pieces


def dickinson(folder: Path) -> list[dict]:
    pieces, current, series, section, note = [], None, 1, "", False
    for line in gutenberg_body(folder, GUTENBERG["dickinson"]):
        stripped = line.strip()
        if stripped in ("Second Series", "Third Series"):
            series, section, current = series + 1, "", None   # an editor's preface follows
        elif m := re.fullmatch(r"[IVX]+\. ([A-Z][A-Z ,]+)\.", stripped):
            section, current = m.group(1).title(), None
        elif section and re.fullmatch(r"[IVXLC]+\.", stripped):
            current = {"title": None, "kind": "original", "lines": [], "series": series, "section": section}
            pieces.append(current)
        elif current is None or not stripped:
            continue
        elif stripped.startswith("[") or note:
            note = not stripped.endswith("]")             # skip editors' bracketed notes
        elif not current["lines"] and current["title"] is None and stripped == stripped.upper() and re.search(r"[A-Z]", stripped):
            current["title"] = english_line(stripped).rstrip(".").title()
        else:
            current["lines"].append(english_line(line))
    for piece in pieces:
        piece["title"] = f"{piece['series']}-{piece['section']}: {piece['title'] or piece['lines'][0]}"
        del piece["series"], piece["section"]
    return [p for p in pieces if p["lines"]]


def hymns(folder: Path) -> list[dict]:
    """Each hymn starts with its number and meter ("261        7s, 6 lines."); stanza lines are indented, numbered "2 ", "3 "…"""
    parsed, current = [], None
    for line in gutenberg_body(folder, GUTENBERG["hymns"]):
        if re.match(r"^\d{1,4}\s{5,}\S", line):
            current = []
            parsed.append(current)
        elif current is not None and re.match(r"^ {2,4}\S", line):
            text = re.sub(r"^\s*\d+\s+", "", line).strip()  # drop stanza numbers
            if text:
                current.append(english_line(text))
    key = lambda s: re.sub(r"[^a-z ]", "", s.lower())
    pieces = []
    for first in HYMN_FIRST_LINES:
        lines = next((h for h in parsed if h and key(h[0]).startswith(key(first))), None)
        if lines is None:
            raise SystemExit(f"Hymn not found: {first}")
        pieces.append({"title": lines[0].rstrip(",;:.!"), "kind": "original", "lines": lines})
    return pieces


def build_english(folder: Path) -> list[dict]:
    return [
        work("sonnets", "en", {"ko": "셰익스피어 소네트", "en": "Shakespeare's Sonnets"}, {"ko": "윌리엄 셰익스피어", "en": "William Shakespeare"}, 1609,
             sonnets(folder), None, gutenberg=GUTENBERG["sonnets"]),
        work("dickinson", "en", {"ko": "에밀리 디킨슨 시집", "en": "Poems by Emily Dickinson"}, {"ko": "에밀리 디킨슨", "en": "Emily Dickinson"}, 1890,
             dickinson(folder), None, gutenberg=GUTENBERG["dickinson"]),
        work("hymns", "en", {"ko": "옛 찬송가 (영어)", "en": "Old Hymns"}, {"ko": "아이작 와츠, 찰스 웨슬리 외", "en": "Isaac Watts, Charles Wesley and others"}, 1870,
             hymns(folder), None, gutenberg=GUTENBERG["hymns"]),
    ]


# ---------------------------------------------------------------- output

def work(id_, lang, title, author, year, pieces, wikisource_book, gutenberg=None) -> dict:
    source = ({"site": "Project Gutenberg", "url": f"https://www.gutenberg.org/ebooks/{gutenberg}", "ebook": gutenberg}
              if gutenberg else {"site": "위키문헌", "url": f"{WIKISOURCE}/wiki/" + urllib.parse.quote(wikisource_book) if wikisource_book else f"{WIKISOURCE}/"})
    return {"id": id_, "lang": lang, "title": title, "author": author, "year": year, "source": source, "pieces": pieces}


def write(path: Path, name: str, works: list[dict]) -> None:
    body = json.dumps(works, ensure_ascii=False, indent=1)
    path.write_text(f"// {name} - generated by tools/build-poetry.py (public-domain texts; sources on the 프로그램 소개 page)\n"
                    f"export const WORKS = Object.freeze({body});\n", encoding="utf-8")
    print(f"Wrote {path.name}: " + ", ".join(f"{w['id']} {len(w['pieces'])}" for w in works))


def main() -> None:
    if len(sys.argv) != 3 or sys.argv[1] not in ("fetch", "build"):
        raise SystemExit(__doc__)
    folder = Path(sys.argv[2])
    if sys.argv[1] == "fetch":
        fetch(folder)
        return
    korean = build_korean(folder)
    if MISSING_HANJA:
        raise SystemExit("Add Hangul readings to tools/hanja-readings.json for: " + " ".join(sorted(MISSING_HANJA)))
    write(DATA / "poetry-ko.js", "한국 시집", korean)
    write(DATA / "poetry-en.js", "English poetry", build_english(folder))


if __name__ == "__main__":
    main()
