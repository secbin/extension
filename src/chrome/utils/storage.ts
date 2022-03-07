// constant keys for accessing storage
export enum Storage {
    API_KEY = "api_key",
    ENC_MODE = "enc_mode",
    KEY_LENGTH = "key_length",
    THEME = "theme"
  }

export const setItem = (key: string, value: any, callback?: () => void) => {
    chrome.storage.sync.set({ [key]: value }, callback)
}

export const getItem = (key: string | string[], callback: (items: { [key: string]: any; }) => void) => {
    return chrome.storage.sync.get(key, callback)
}

export const getItemAsync = async (key: string) => {
    return new Promise((resolve, reject) => {
      chrome.storage.sync.get([key], function (result) {
        if (result[key] === undefined) {
          console.log(`${key} not found`)
          reject();
        } else {
          resolve(result[key]);
        }
      });
    });
  };

export const deleteItem = (key: string | string[], callback?: () => void) => {
    return chrome.storage.sync.remove(key, callback)
}