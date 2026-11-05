// 배지 카드: 배지를 1200×630 이미지로 그려 저장하거나 클립보드에 복사합니다 (SNS·메신저 공유용).
import { t } from '../core/i18n.js';
import { REPO_URL } from '../version.js';

const WIDTH = 1200;
const HEIGHT = 630;
const FONT = '"Pretendard", "Apple SD Gothic Neo", "Malgun Gothic", "Noto Sans KR", system-ui, sans-serif';

/** @returns {HTMLCanvasElement} */
export function drawBadgeCard({ badge, name, date = new Date() }) {
  const canvas = document.createElement('canvas');
  canvas.width = WIDTH;
  canvas.height = HEIGHT;
  const g = canvas.getContext('2d');
  const sky = g.createLinearGradient(0, 0, WIDTH, HEIGHT);
  sky.addColorStop(0, '#1e1b4b');
  sky.addColorStop(1, '#0f766e');
  g.fillStyle = sky;
  g.fillRect(0, 0, WIDTH, HEIGHT);
  g.strokeStyle = 'rgba(255, 255, 255, 0.35)';
  g.lineWidth = 6;
  g.strokeRect(28, 28, WIDTH - 56, HEIGHT - 56);

  g.textAlign = 'center';
  g.fillStyle = '#fde68a';
  g.font = `150px ${FONT}`;
  g.fillText(badge.icon, WIDTH / 2, 230);
  g.fillStyle = '#ffffff';
  g.font = `700 64px ${FONT}`;
  g.fillText(badge.title, WIDTH / 2, 340, WIDTH - 120);
  g.font = `400 34px ${FONT}`;
  g.fillStyle = 'rgba(255, 255, 255, 0.85)';
  g.fillText(badge.detail, WIDTH / 2, 395, WIDTH - 120);
  g.font = `600 40px ${FONT}`;
  g.fillStyle = '#ffffff';
  g.fillText(t('badge.cardBy', { name, date: date.toLocaleDateString() }), WIDTH / 2, 480, WIDTH - 120);
  g.font = `400 26px ${FONT}`;
  g.fillStyle = 'rgba(255, 255, 255, 0.7)';
  g.fillText(`⌨️ Typing Warrior · ${REPO_URL.replace('https://', '')}`, WIDTH / 2, 560);
  return canvas;
}

/** Save the card as a PNG file (the desktop app asks where to save it; the iPad app opens the share sheet). */
export function saveBadgeCard(card, fileName) {
  if (window.desktop?.shareImage) {
    window.desktop.shareImage(card.toDataURL('image/png'), `${fileName}.png`).catch((error) => console.warn('Could not share the badge card.', error));
    return;
  }
  const a = document.createElement('a');
  a.href = card.toDataURL('image/png');
  a.download = `${fileName}.png`;
  a.click();
}

/** Copy the card to the clipboard. Returns true when it worked. */
export async function copyBadgeCard(card) {
  try {
    const blob = await new Promise((resolve) => card.toBlob(resolve, 'image/png'));
    await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
    return true;
  } catch (error) {
    console.warn('Could not copy the badge card.', error);
    return false;
  }
}
