// Encouragement messages shown after finishing a stage or game, in the display language.
import { getUiLang } from './i18n.js';

const MESSAGES = Object.freeze({
  ko: {
    great: [
      '와, 손가락이 날아다니네요! 🚀',
      '완벽에 가까운 실력이에요. 정말 멋져요! 🌟',
      '이 속도라면 타자왕도 금방이에요! 👑',
      '집중력이 대단해요. 오늘의 MVP! 🏆',
    ],
    good: [
      '아주 잘했어요! 꾸준함이 실력을 만들어요. 💪',
      '한 단계 성장했어요. 계속 가 봐요! 🌱',
      '좋은 리듬이에요. 다음 단계도 할 수 있어요! 🎵',
      '훌륭해요! 어제의 나보다 빨라졌어요. ⚡',
    ],
    keepGoing: [
      '천천히, 정확하게! 속도는 저절로 따라와요. 🐢➡️🐇',
      '포기하지 않는 것이 진짜 실력이에요. 한 번 더! 🔥',
      '실수는 배움의 일부예요. 다시 도전해 봐요! 🌈',
      '손가락이 길을 익히는 중이에요. 잘하고 있어요! 🙌',
    ],
    verses: [
      '"내게 능력 주시는 자 안에서 내가 모든 것을 할 수 있느니라" (빌 4:13)',
      '"선을 행하되 낙심하지 말지니 피곤하지 아니하면 때가 이르매 거두리라" (갈 6:9)',
      '"강하고 담대하라" (수 1:9)',
    ],
  },
  en: {
    great: [
      'Wow, your fingers are flying! 🚀',
      'Nearly flawless. Amazing work! 🌟',
      'At this pace you will be a typing champion in no time! 👑',
      'Incredible focus. You are today\'s MVP! 🏆',
    ],
    good: [
      'Great job! Consistency builds skill. 💪',
      'You levelled up. Keep going! 🌱',
      'Nice rhythm. You are ready for the next step! 🎵',
      'Excellent! Faster than yesterday\'s you. ⚡',
    ],
    keepGoing: [
      'Slow and accurate! Speed follows on its own. 🐢➡️🐇',
      'Not giving up is the real skill. One more time! 🔥',
      'Mistakes are part of learning. Try again! 🌈',
      'Your fingers are learning the way. You are doing well! 🙌',
    ],
    // KJV (public domain)
    verses: [
      '"I can do all things through Christ which strengtheneth me." (Phil 4:13)',
      '"And let us not be weary in well doing: for in due season we shall reap, if we faint not." (Gal 6:9)',
      '"Be strong and of a good courage." (Josh 1:9)',
    ],
  },
});

const pickFrom = (list) => list[Math.floor(Math.random() * list.length)];
const messages = () => MESSAGES[getUiLang()] || MESSAGES.ko;

/** Choose a message by accuracy (percent). */
export function cheerMessage(accuracyPercent) {
  if (accuracyPercent >= 97) return pickFrom(messages().great);
  if (accuracyPercent >= 90) return pickFrom(messages().good);
  return pickFrom(messages().keepGoing);
}

export const bonusVerse = () => pickFrom(messages().verses);
