// Sound pack picker for the games: 🔈 잔잔 / 🔉 아케이드 / 🔊 도파민 (plays a short preview).
import { SOUND_PACKS, previewPack } from '../core/sound.js';
import { el } from './dom.js';

export function createSoundPackControl(ctx) {
  const box = el('div', { class: 'sound-pack', title: '효과음 세트' });

  function choose(id) {
    ctx.updateSettings({ soundPack: id, sound: true });
    previewPack(id);
    render();
  }

  function render() {
    const { soundPack, sound } = ctx.settings();
    box.replaceChildren(
      ...SOUND_PACKS.map((pack) =>
        el('button', {
          type: 'button',
          tabindex: '-1',
          class: pack.id === soundPack && sound ? 'active' : '',
          title: pack.desc,
          onclick: () => choose(pack.id),
        }, pack.label),
      ),
    );
  }

  render();
  return box;
}
