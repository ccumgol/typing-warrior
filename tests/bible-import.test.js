import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseBibleContent, versesToBooks, csvRows } from '../src/renderer/core/bible-import.js';

const get = (result, ref) => result.verses.get(ref);

test('CSV with a header (book names or numbers, quoted text with commas)', () => {
  const csv = 'book,chapter,verse,text\n창,1,1,태초에 하나님이 천지를 창조하시니라\n19,23,1,"여호와는 나의 목자시니, 내가 부족함이 없으리로다"\n';
  const result = parseBibleContent(csv, '개역개정.csv');
  assert.equal(result.format, 'csv');
  assert.equal(result.name, '개역개정');
  assert.equal(result.lang, 'ko');
  assert.equal(get(result, '1|1|1'), '태초에 하나님이 천지를 창조하시니라');
  assert.equal(get(result, '19|23|1'), '여호와는 나의 목자시니, 내가 부족함이 없으리로다');
});

test('CSV without a header, including the id,b,c,v,t layout', () => {
  assert.equal(get(parseBibleContent('Gen,1,1,In the beginning\n', 'x.csv'), '1|1|1'), 'In the beginning');
  const withId = parseBibleContent('01001001,1,1,1,In the beginning God created\n43003016,43,3,16,For God so loved\n', 'kjv.csv');
  assert.equal(get(withId, '43|3|16'), 'For God so loved');
  assert.deepEqual(csvRows('a,"b ""c"", d",e'), [['a', 'b "c", d', 'e']]);
});

test('Zefania XML', () => {
  const xml = `<?xml version="1.0"?><XMLBIBLE biblename="ESV"><BIBLEBOOK bnumber="43" bname="John"><CHAPTER cnumber="3">
    <VERS vnumber="16">For God so loved the world, <NOTE>a note</NOTE>that he gave</VERS><VERS vnumber="17">For God did not send</VERS>
    </CHAPTER></BIBLEBOOK></XMLBIBLE>`;
  const result = parseBibleContent(xml, 'bible.xml');
  assert.equal(result.format, 'xml');
  assert.equal(result.name, 'ESV');
  assert.equal(get(result, '43|3|16'), 'For God so loved the world, that he gave');
  assert.equal(get(result, '43|3|17'), 'For God did not send');
});

test('OSIS XML with contained verses and milestones', () => {
  const contained = '<osis><osisText><div type="book" osisID="Ps"><chapter osisID="Ps.23"><verse osisID="Ps.23.1">The LORD is my shepherd</verse></chapter></div></osisText></osis>';
  assert.equal(get(parseBibleContent(contained, 'a.xml'), '19|23|1'), 'The LORD is my shepherd');
  const milestones = '<osis><verse sID="Gen.1.1" osisID="Gen.1.1"/>In the beginning<verse eID="Gen.1.1"/><verse sID="Gen.1.2" osisID="Gen.1.2"/>And the earth<verse eID="Gen.1.2"/></osis>';
  const result = parseBibleContent(milestones, 'b.xml');
  assert.equal(get(result, '1|1|1'), 'In the beginning');
  assert.equal(get(result, '1|1|2'), 'And the earth');
});

test('OpenSong and Beblia XML', () => {
  const openSong = '<bible><b n="Genesis"><c n="1"><v n="1">In the beginning</v></c></b></bible>';
  assert.equal(get(parseBibleContent(openSong, 'o.xml'), '1|1|1'), 'In the beginning');
  const beblia = '<bible translation="KJV"><testament name="New"><book number="43"><chapter number="11"><verse number="35">Jesus wept.</verse></chapter></book></testament></bible>';
  const result = parseBibleContent(beblia, 'k.xml');
  assert.equal(result.name, 'KJV');
  assert.equal(get(result, '43|11|35'), 'Jesus wept.');
});

test('TXT lines and errors', () => {
  const result = parseBibleContent('#번역 내번역\n창 1:1 태초에, 하나님이, 천지를, 창조하시니라\n', 'my.txt');
  assert.equal(result.format, 'txt');
  assert.equal(result.name, '내번역');
  assert.equal(get(result, '1|1|1'), '태초에, 하나님이, 천지를, 창조하시니라');
  assert.throws(() => parseBibleContent('hello world', 'x.txt'), /no-verses/);
});

test('versesToBooks fills books, chapters and verses in place', () => {
  const books = versesToBooks(new Map([['1|1|2', 'b'], ['1|1|1', 'a'], ['66|22|21', 'z']]));
  assert.deepEqual(books[0][0], ['a', 'b']);
  assert.equal(books[65][21][20], 'z');
  assert.equal(books[65][0].length, 0);
});
