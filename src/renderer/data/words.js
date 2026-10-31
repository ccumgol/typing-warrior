// 단어 연습 데이터: 주제별 한국어 단어와 영어 단어.

const split = (s) => Object.freeze(s.trim().split(/\s+/));

export const KO_WORD_SETS = Object.freeze({
  일상: split(`
    사랑 행복 친구 가족 학교 선생님 학생 공부 숙제 시험 아침 점심 저녁 주말 휴일 생일 선물 약속 산책 운동
    여행 기차 버스 지하철 자전거 비행기 공항 정류장 우체국 도서관 병원 약국 시장 마트 식당 카페 공원 놀이터 교회 은행
    전화 문자 편지 사진 노래 음악 영화 드라마 소설 만화 게임 취미 요리 청소 빨래 설거지 이불 베개 창문 거울
    `),
  자연: split(`
    하늘 구름 바람 햇살 무지개 소나기 눈사람 바다 파도 모래 강물 시냇물 호수 폭포 산봉우리 언덕 들판 숲속 나무 꽃잎
    봄비 여름 가을 겨울 단풍 낙엽 새싹 열매 씨앗 뿌리 나비 잠자리 메뚜기 다람쥐 토끼 호랑이 사자 코끼리 기린 펭귄
    고래 돌고래 거북이 독수리 참새 까치 비둘기 반딧불 별빛 달빛 노을 새벽 안개 이슬 서리 우박 천둥 번개 태풍 지진
    `),
  음식: split(`
    김치 된장찌개 김치찌개 불고기 비빔밥 떡볶이 순대 김밥 라면 냉면 칼국수 수제비 만두 잡채 갈비 삼겹살 닭갈비 족발 보쌈 삼계탕
    미역국 떡국 호떡 붕어빵 식혜 수정과 팥빙수 사과 배 딸기 포도 수박 참외 복숭아 귤 감 바나나 토마토 감자 고구마
    옥수수 당근 양파 마늘 고추 오이 호박 버섯 두부 계란 우유 치즈 빵 과자 초콜릿 아이스크림 케이크 쿠키 주스 커피
    `),
  쌍자음_겹받침: split(`
    꽃다발 까치 꼬리 깨끗한 떡볶이 뚜껑 딸기 똑똑한 빨래 뿌리 빵집 쪽지 짜장면 찌개 싸움 쓰레기 씨앗 아빠 오빠 어깨
    닭고기 흙탕물 읽기 맑음 밟다 넓다 짧다 앉다 많다 않다 끓다 잃다 값어치 없다 삶다 젊음 굶다 핥다 읊다 옳다
    괜찮아 왜냐하면 외계인 원숭이 웨딩 위로 의자 회사 화요일 훨씬 쉬는날 뒤집기 귀여운 쥐구멍 취미생활 희망 무늬 띄어쓰기 줬다 했다
    `),
  신앙: split(`
    하나님 예수님 성령님 은혜 감사 찬양 예배 기도 말씀 성경 믿음 소망 사랑 평안 기쁨 구원 영생 십자가 부활 복음
    교회 목사님 성도 집사님 권사님 장로님 주일학교 성가대 수련회 선교사 축복 회개 용서 겸손 온유 인내 충성 절제 화평 자비
    `),
});

export const EN_WORD_SETS = Object.freeze({
  basic: split(`
    the and you that was for are with his they one have this from had not but what all were when your can said
    there use each which she how their will other about out many then them these some her would make like him into time
    has look two more write see number way could people than first water been call who oil its now find long down day
    `),
  everyday: split(`
    apple banana orange bread butter coffee window garden school friend family morning evening weekend holiday music movie
    pencil paper letter phone camera travel train ticket beach mountain river forest flower summer winter spring autumn rain
    cloud sunny happy smile laugh dream sleep wake dance sing read story book chair table kitchen doctor teacher student
    `),
  advanced: split(`
    keyboard practice accuracy patience knowledge strength courage journey adventure language computer science history
    mathematics beautiful wonderful important different together tomorrow yesterday question answer remember believe
    discover imagine possible probably especially experience government environment development technology information
    `),
  faith: split(`
    grace faith hope love peace joy prayer worship praise blessing gospel church spirit truth light mercy kindness
    gentleness patience goodness salvation forgiveness eternal heaven glory holy shepherd righteous wisdom humble
    `),
});
