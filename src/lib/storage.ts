// Chrome storage wrappers with Promise API

export async function getSyncItem<T>(key: string): Promise<T | undefined> {
  const data = await chrome.storage.sync.get(key)
  return data[key]
}

export async function setSyncItem(key: string, value: unknown): Promise<void> {
  await chrome.storage.sync.set({ [key]: value })
}

export async function deleteSyncItem(key: string): Promise<void> {
  await chrome.storage.sync.remove(key)
}

export async function getLocalItem<T>(key: string): Promise<T | undefined> {
  const data = await chrome.storage.local.get(key)
  return data[key]
}

export async function setLocalItem(key: string, value: unknown): Promise<void> {
  await chrome.storage.local.set({ [key]: value })
}

export async function deleteLocalItem(key: string): Promise<void> {
  await chrome.storage.local.remove(key)
}

export async function appendToLocalArray<T>(key: string, item: T): Promise<void> {
  const existing = (await getLocalItem<T[]>(key)) ?? []
  existing.push(item)
  await setLocalItem(key, existing)
}

export async function removeFromLocalArray<T extends { id: string }>(
  key: string,
  id: string,
): Promise<void> {
  const existing = (await getLocalItem<T[]>(key)) ?? []
  const filtered = existing.filter((item) => item.id !== id)
  await setLocalItem(key, filtered)
}
