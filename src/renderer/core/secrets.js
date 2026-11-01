// 사용자가 입력한 비밀 값(API.Bible 키 등): 데스크톱 앱은 운영체제 암호화 저장소에, 브라우저 미리보기는 이 컴퓨터의 localStorage에 둡니다.
const desktop = window.desktop;
const localKey = (name) => `tw.secret.${name}`;

export async function getSecret(name) {
  if (desktop?.getSecret) return desktop.getSecret(name);
  try {
    return localStorage.getItem(localKey(name));
  } catch (error) {
    console.warn('Could not read a saved key.', error);
    return null;
  }
}

/** Returns true when saved; an empty value removes it. */
export async function setSecret(name, value) {
  if (desktop?.setSecret) return desktop.setSecret(name, value);
  try {
    if (value) localStorage.setItem(localKey(name), value);
    else localStorage.removeItem(localKey(name));
    return true;
  } catch (error) {
    console.warn('Could not save the key.', error);
    return false;
  }
}
