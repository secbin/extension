/////////////////////////  SYNC STORAGE //////////////////////////////
// Chrome sync storage limit of 8,192 bytes per item, 102,400 Bytes total storage
export const setSyncItem = (
  key: string,
  value: unknown,
  callback?: () => void
) => {
  if (callback) {
    chrome.storage.sync.set({ [key]: value }, callback);
  } else {
    chrome.storage.sync.set({ [key]: value });
  }
};

export const getSyncItem = (
  key: string | string[] | null,
  callback: (items: { [key: string]: unknown }) => void
) => {
  return chrome.storage.sync.get(key, callback);
};

export const deleteSyncItem = (
  key: string | string[],
  callback?: () => void
) => {
  return callback
    ? chrome.storage.sync.remove(key, callback)
    : chrome.storage.sync.remove(key);
};

export const getSyncItemAsync = async (key: string): Promise<unknown> => {
  return new Promise(resolve => {
    chrome.storage.sync.get([key], function (result) {
      resolve(result[key]);
    });
  });
};

/////////////////////////  LOCAL STORAGE //////////////////////////////
// Chrome limit 5,242,880  Bytes total storage, can be set to unlimited
export const setLocalItem = (
  key: string,
  value: unknown,
  callback?: () => void
) => {
  if (callback) {
    chrome.storage.local.set({ [key]: value }, callback);
  } else {
    chrome.storage.local.set({ [key]: value });
  }
};

export const getLocalItem = (
  key: string | string[] | null,
  callback: (items: { [key: string]: unknown }) => void
) => {
  return chrome.storage.local.get(key, callback);
};

export const deleteLocalItem = (key: string | string[]) => {
  return chrome.storage.local.remove(key);
};

export const addLocalItem = (key: string, value: unknown) => {
  getLocalItem(key, data => {
    let result = data[key] as unknown[];
    if (!result) {
      result = [];
    }
    result.push(value);
    setLocalItem(key, result);
  });
};
