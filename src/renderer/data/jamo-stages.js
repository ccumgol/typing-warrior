// 자소(자리) 연습 단계. chars: 연습할 글자, 복모음은 두 번의 키 입력으로 완성됩니다.

// Titles and tips are in the UI dictionaries (stage.<id>, stage.<id>.desc).
const stage = (id, chars) => Object.freeze({ id, chars: Object.freeze([...chars]) });

export const KO_STAGES = Object.freeze([
  stage('ko-home', 'ㅁㄴㅇㄹㅎㅗㅓㅏㅣ'),
  stage('ko-top', 'ㅂㅈㄷㄱㅅㅛㅕㅑㅐㅔ'),
  stage('ko-bottom', 'ㅋㅌㅊㅍㅠㅜㅡ'),
  stage('ko-double', 'ㅃㅉㄸㄲㅆ'),
  stage('ko-shift-vowel', 'ㅒㅖ'),
  stage('ko-compound', 'ㅘㅙㅚㅝㅞㅟㅢ'),
  stage('ko-number', '1234567890.,?!'),
]);

export const EN_STAGES = Object.freeze([
  stage('en-home', 'asdfghjkl;'),
  stage('en-top', 'qwertyuiop'),
  stage('en-bottom', 'zxcvbnm,./'),
  stage('en-shift', 'ASDFGHJKLQWERTYUIOPZXCVBNM'),
  stage('en-number', '1234567890'),
  stage('en-symbol', '!@#$%^&*()-=[]\'"?'),
]);

export const ITEMS_PER_STAGE = 30;
