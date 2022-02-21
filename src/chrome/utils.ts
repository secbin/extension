export const getCurrentTabUrl = (callback: (url: string | undefined) => void): void => {
    const queryInfo = {active: true, lastFocusedWindow: true};

    chrome.tabs && chrome.tabs.query(queryInfo, tabs => {
        callback(tabs[0].url);
    });
}

export const getCurrentTabUId = (callback: (url: number | undefined) => void): void => {
    const queryInfo = {active: true, lastFocusedWindow: true};

    chrome.tabs && chrome.tabs.query(queryInfo, tabs => {
        callback(tabs[0].id);
    });
}

export function storeData(key: string, value: any): void {
    chrome.storage.sync.set({ [key]: value }, () => {
        console.log('Value is set to ' + value);
    });
}

export function getData(key: string, callback: (value: any) => void): void {
    chrome.storage.sync.get(key, (result) => {
        console.log('Value currently is ' + result.key);
        callback(result[key]);
    });
}