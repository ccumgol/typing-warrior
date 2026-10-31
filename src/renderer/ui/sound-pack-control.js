// Sound pack picker for the games (plays a short preview). Each game remembers its own pack.
import { SOUND_PACKS, previewPack, setSoundPack } from '../core/sound.js';
import { el } from './dom.js';

/**
 * @param {object} ctx
 * @param {{settingKey?:string, shooter?:boolean, onChange?:Function}} [options]
 */
export function createSoundPackControl(ctx, { settingKey = 'soundPack', shooter = false, onChange = () => {} } = {}) {
  const box = el('div', { class: 'sound-pack', title: '효과음 세트' });
  const packs = SOUND_PACKS.filter((pack) => shooter || !pack.shooterOnly);

  function choose(id) {
    ctx.updateSettings({ [settingKey]: id, sound: true });
    setSoundPack(id);
    previewPack(id);
    render();
    onChange(id);
  }

  function render() {
    const { sound } = ctx.settings();
    const soundPack = ctx.settings()[settingKey];
    box.replaceChildren(
      ...packs.map((pack) =>
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

  setSoundPack(ctx.settings()[settingKey]);
  render();
  return box;
}
