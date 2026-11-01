// 사용자가 올린 성경 전권을 이 컴퓨터의 IndexedDB에 저장합니다 (localStorage는 수백만 자를 담기에 작습니다).
const DB_NAME = 'typing-warrior';
const STORE = 'bibles';
const OLD_LOCAL_KEY = 'tw.userBible.v1'; // earlier versions stored partial Bible texts here

function openDb() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => request.result.createObjectStore(STORE);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function run(mode, action) {
  const db = await openDb();
  try {
    return await new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE, mode);
      const request = action(transaction.objectStore(STORE));
      transaction.oncomplete = () => resolve(request?.result);
      transaction.onerror = () => reject(transaction.error);
      transaction.onabort = () => reject(transaction.error);
    });
  } finally {
    db.close();
  }
}

/** The user's Bible for 'ko' or 'en' ({ name, books }), or null. */
export async function loadUserBible(lang) {
  try {
    localStorage.removeItem(OLD_LOCAL_KEY);
    const value = await run('readonly', (store) => store.get(lang));
    return value && typeof value.name === 'string' && Array.isArray(value.books) ? value : null;
  } catch (error) {
    console.warn('Could not read the saved Bible text.', error);
    return null;
  }
}

/** Returns true when saved. */
export async function saveUserBible(lang, bible) {
  try {
    await run('readwrite', (store) => store.put(bible, lang));
    return true;
  } catch (error) {
    console.warn('Could not save the Bible text.', error);
    return false;
  }
}

export async function clearUserBible(lang) {
  try {
    await run('readwrite', (store) => store.delete(lang));
  } catch (error) {
    console.warn('Could not remove the Bible text.', error);
  }
}
