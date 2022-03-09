import React, {createContext } from 'react'
import { Action } from './constants'
import { setItem, getItem } from "./chrome/utils/storage";
import { Storage } from "./constants"


export interface IHistoryItem {
    id: string,
    link: string,
    enc_mode: string,
    key_length: number,
    date: Date,
}

export interface ISettings {
    api_key: string,
    enc_mode: string,
    key_length: number,
    theme: boolean,
}

export interface ICurrentDraft {
    action: Action.DECRYPT | Action.DECRYPT_PASTEBIN | Action.ENCRYPT | Action.ENCRYPT_PASTEBIN,
    plaintext: string,
    ciphertext: string,
    pastebinlink?: string,
    success?: any
}

export interface IAppContext {
    history?: IHistoryItem[],
    settings: ISettings,
    draft?: ICurrentDraft,
}

function getApiKey() {
    getItem(Storage.API_KEY, (data) => {
        return data[Storage.API_KEY] as string
    })
    return ""
}


const initialState = {
    draft: {
        action: Action.ENCRYPT,
        plaintext: "",
        ciphertext: "",
        pastebinlink: undefined,
        success: undefined,
    },
    history: undefined,
    settings: {
        api_key: getApiKey(),
        enc_mode: "",
        key_length: 16,
        theme: false,
    }
}

export const ConfigContext = createContext<IAppContext>(initialState);