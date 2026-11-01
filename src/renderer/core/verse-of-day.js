// 오늘의 말씀 번호(0~364): 월·일로 정하므로 해마다 같은 날 같은 구절이 나옵니다.
// 윤년의 2월 29일은 2월 28일 구절을 한 번 더 보여 주고, 3월 1일부터는 평년과 같습니다.
const DAYS_BEFORE_MONTH = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];

export function verseOfDayIndex(date = new Date()) {
  const month = date.getMonth();
  const day = month === 1 ? Math.min(date.getDate(), 28) : date.getDate();
  return DAYS_BEFORE_MONTH[month] + day - 1;
}
