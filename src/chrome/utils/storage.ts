export const setItem = (key: string, value: any, callback?: () => void) => {
    chrome.storage.sync.set({ [key]: value }, callback)
}

export const getItem = (key: string | string[], callback: (items: { [key: string]: any; }) => void) => {
    return chrome.storage.sync.get(key, callback)
}

export const deleteItem = (key: string | string[], callback?: () => void) => {
    return chrome.storage.sync.remove(key, callback)
}