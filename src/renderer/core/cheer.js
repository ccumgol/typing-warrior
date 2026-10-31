// Encouragement messages shown after finishing a stage or game.

const GREAT = [
  '와, 손가락이 날아다니네요! 🚀',
  '완벽에 가까운 실력이에요. 정말 멋져요! 🌟',
  '이 속도라면 타자왕도 금방이에요! 👑',
  '집중력이 대단해요. 오늘의 MVP! 🏆',
];
const GOOD = [
  '아주 잘했어요! 꾸준함이 실력을 만들어요. 💪',
  '한 단계 성장했어요. 계속 가 봐요! 🌱',
  '좋은 리듬이에요. 다음 단계도 할 수 있어요! 🎵',
  '훌륭해요! 어제의 나보다 빨라졌어요. ⚡',
];
const KEEP_GOING = [
  '천천히, 정확하게! 속도는 저절로 따라와요. 🐢➡️🐇',
  '포기하지 않는 것이 진짜 실력이에요. 한 번 더! 🔥',
  '실수는 배움의 일부예요. 다시 도전해 봐요! 🌈',
  '손가락이 길을 익히는 중이에요. 잘하고 있어요! 🙌',
];
const VERSES = [
  '"내게 능력 주시는 자 안에서 내가 모든 것을 할 수 있느니라" (빌 4:13)',
  '"선을 행하되 낙심하지 말지니 피곤하지 아니하면 때가 이르매 거두리라" (갈 6:9)',
  '"강하고 담대하라" (수 1:9)',
];

const pickFrom = (list) => list[Math.floor(Math.random() * list.length)];

/** Choose a message by accuracy (percent). */
export function cheerMessage(accuracyPercent) {
  if (accuracyPercent >= 97) return pickFrom(GREAT);
  if (accuracyPercent >= 90) return pickFrom(GOOD);
  return pickFrom(KEEP_GOING);
}

export const bonusVerse = () => pickFrom(VERSES);
