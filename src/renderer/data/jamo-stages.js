// 자소(자리) 연습 단계. chars: 연습할 글자, 복모음은 두 번의 키 입력으로 완성됩니다.

const stage = (id, title, desc, chars) => Object.freeze({ id, title, desc, chars: Object.freeze([...chars]) });

export const KO_STAGES = Object.freeze([
  stage('ko-home', '1단계 · 기본자리', '손가락을 ㄹ(F)과 ㅓ(J) 돌기에 올려두세요.', 'ㅁㄴㅇㄹㅎㅗㅓㅏㅣ'),
  stage('ko-top', '2단계 · 윗줄', '검지부터 위로 뻗어 보세요.', 'ㅂㅈㄷㄱㅅㅛㅕㅑㅐㅔ'),
  stage('ko-bottom', '3단계 · 아랫줄', '손목은 고정하고 손가락만 내립니다.', 'ㅋㅌㅊㅍㅠㅜㅡ'),
  stage('ko-double', '4단계 · 쌍자음', '반대편 손 새끼손가락으로 Shift를 누르세요.', 'ㅃㅉㄸㄲㅆ'),
  stage('ko-shift-vowel', '5단계 · 쌍모음', 'Shift + ㅐ/ㅔ 로 ㅒ/ㅖ를 입력합니다.', 'ㅒㅖ'),
  stage('ko-compound', '6단계 · 복모음', '두 모음을 차례로 눌러 하나로 만듭니다. (ㅗ+ㅏ=ㅘ)', 'ㅘㅙㅚㅝㅞㅟㅢ'),
  stage('ko-number', '7단계 · 숫자와 기호', '숫자 줄은 손가락을 위로 크게 뻗어요.', '1234567890.,?!'),
]);

export const EN_STAGES = Object.freeze([
  stage('en-home', 'Step 1 · Home row', 'Rest your fingers on F and J bumps.', 'asdfghjkl;'),
  stage('en-top', 'Step 2 · Top row', 'Reach up from the home row.', 'qwertyuiop'),
  stage('en-bottom', 'Step 3 · Bottom row', 'Curl your fingers down.', 'zxcvbnm,./'),
  stage('en-shift', 'Step 4 · Capitals', 'Hold Shift with the opposite pinky.', 'ASDFGHJKLQWERTYUIOPZXCVBNM'),
  stage('en-number', 'Step 5 · Numbers', 'Stretch to the number row.', '1234567890'),
  stage('en-symbol', 'Step 6 · Symbols', 'Shift + numbers and punctuation.', '!@#$%^&*()-=[]\'"?'),
]);

export const ITEMS_PER_STAGE = 30;
