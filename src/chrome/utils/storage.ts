/////////////////////////  SYNC STORAGE //////////////////////////////
// Chrome sync storage limit of 8,192 bytes per item, 102,400 Bytes total storage 
export const setSyncItem = (key: string, value: any, callback?: () => void) => {
    chrome.storage.sync.set({ [key]: value }, callback)
}

export const getSyncItem = (key: string | string[] | null, callback: (items: { [key: string]: any; }) => void) => {
    return chrome.storage.sync.get(key, callback)
}

export const deleteSyncItem = (key: string | string[], callback?: () => void) => {
    return chrome.storage.sync.remove(key, callback)
}

export const getSyncItemAsync = async (key: string) => {
    return new Promise((resolve, reject) => {
        chrome.storage.sync.get([key], function (result) {
            if (result[key] === undefined) {
                console.log(`${key} not found in storage`)
                resolve(undefined)
            } else {
                resolve(result[key]);
            }
        });
    });
};


/////////////////////////  LOCAL STORAGE //////////////////////////////
// Chrome limit 5,242,880  Bytes total storage, can be set to unlimited
export const setLocalItem = (key: string, value: any, callback?: () => void) => {
    chrome.storage.local.set({ [key]: value }, callback)
}

export const setLocalItemAsync = async (key: string, value: any) => {
    return new Promise((resolve, reject) => {
      try {
        chrome.storage.local.set({[key]: value}, function() {
          resolve(true);
        });
      } catch (ex) {
        reject(ex);
      }
    });
  };

export const getLocalItem = (key: string | string[] | null, callback: (items: { [key: string]: any; }) => void) => {
    return chrome.storage.local.get(key, callback)
}

export const deleteLocalItem = (key: string | string[], callback?: () => void) => {
    return chrome.storage.local.remove(key, callback)
}

export const addLocalItem = (key: string, value: any, callback?: () => void) => {
    getLocalItem(key, (data) => {
        //console.log("DATA FROM ADD", data);
        let result = data[key];
        if (!result) {
            result = [];
        }
        result.push(value);
        //console.log("ADDING ITEM", value)
        //console.log("RESULTING VALUE", result)
        setLocalItem(key, result)
    })
}

export const getItemAtIndex = (key: string, index: number, callback: (items: { [key: string]: any; }) => void) => {
    getLocalItem(key, (data) => {
        const result = data[key];
        if (result && result.length > index) {
            return result[index]
        }
    })
}

export const removeItem = (key: string, value: any, index: number, callback?: () => void) => {
    getLocalItem(key, (data) => {
        let result = data[key];
        if (result && result.length > index) {
            result.splice(index, 1);
        }
        return chrome.storage.local.set({ [key]: result }, callback)
    })
}

export const clearItems = (key: string, value: any, callback?: () => void) => {
    return chrome.storage.local.set({ [key]: [] }, callback)
}