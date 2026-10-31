import { test } from 'node:test';
import assert from 'node:assert/strict';
import { compose, decompose, strokeCount } from '../src/renderer/core/hangul.js';

const keys = (s) => [...s];

test('composes simple syllables', () => {
  assert.equal(compose(keys('ㅎㅏㄴㄱㅡㄹ')), '한글');
  assert.equal(compose(keys('ㄱㅏㅇㅇㅏㅈㅣ')), '강아지');
});

test('moves final consonant to next syllable when a vowel follows', () => {
  assert.equal(compose(keys('ㄱㅏㅂㅏ')), '가바');
  assert.equal(compose(keys('ㅇㅣㄹㄱㅓ')), '일거');
});

test('handles compound finals and splits them before a vowel', () => {
  assert.equal(compose(keys('ㅇㅣㄹㄱ')), '읽');
  assert.equal(compose(keys('ㅇㅣㄹㄱㅇㅓ')), '읽어');
  assert.equal(compose(keys('ㄷㅏㄹㄱㅏ')), '달가');
  assert.equal(compose(keys('ㅇㅓㅂㅅㄷㅏ')), '없다');
});

test('combines compound vowels', () => {
  assert.equal(compose(keys('ㄱㅗㅏ')), '과');
  assert.equal(compose(keys('ㅇㅡㅣㅅㅏ')), '의사');
  assert.equal(compose(keys('ㄱㅜㅔ')), '궤');
});

test('double consonants cannot be finals except ㄲ ㅆ', () => {
  assert.equal(compose(keys('ㅇㅣㅆㅇㅓ')), '있어');
  assert.equal(compose(keys('ㄱㅏㄸㅏ')), '가따');
});

test('keeps standalone jamo and other characters', () => {
  assert.equal(compose(keys('ㄱㄴ')), 'ㄱㄴ');
  assert.equal(compose(keys('ㅏ')), 'ㅏ');
  assert.equal(compose(keys('ㄴㅏ, ㄴㅓ!')), '나, 너!');
  assert.equal(compose([]), '');
});

test('decompose is the inverse of compose', () => {
  const samples = ['하나님이 세상을 이처럼 사랑하사', '읽었습니다', '괜찮아요?', '값없이 Hello 123', '의외로 뒤죽박죽'];
  for (const s of samples) assert.equal(compose(decompose(s)), s);
});

test('decompose splits compound jamo into key strokes', () => {
  assert.deepEqual(decompose('과'), ['ㄱ', 'ㅗ', 'ㅏ']);
  assert.deepEqual(decompose('없'), ['ㅇ', 'ㅓ', 'ㅂ', 'ㅅ']);
  assert.deepEqual(decompose('ㅘ'), ['ㅗ', 'ㅏ']);
  assert.equal(strokeCount('한글'), 6);
});
