import { DraftType, HistoryType, SettingsType } from "./AppContext";
import { setSyncItem, getSyncItem } from "./chrome/utils/storage";
import { Storage, Action, DEFAULT_CONTEXT } from "./constants"

type ActionMap<M extends { [index: string]: any }> = {
    [Key in keyof M]: M[Key] extends undefined
        ? {
            type: Key;
        }
        : {
            type: Key;
            payload: M[Key];
        }
};

type HistoryPayload = {
    [Action.ADD_TO_HISTORY] : {
        id: number,
        pastebinlink: string,
        enc_mode: string,
        key_length: number,
        key: string,
        enc_text: string,
        date: Date,
    };
    [Action.CLEAR_HISTORY] : undefined,
    [Action.REMOVE_ITEM_FROM_HISTORY]: {
        id: number;
    }
}

type DraftPayload = {
    [Action.ENCRYPT] : {
        action: Action.ENCRYPT,
        plaintext: string,
        enc_text: string,
        key: string,
    };
    [Action.ENCRYPT_PASTEBIN] : {
        action: Action.ENCRYPT_PASTEBIN,
        plaintext: string,
        enc_text: string,
        key: string,
        pastebinlink: string,
    };
    [Action.UPDATE_PLAINTEXT]: {
        plaintext: string,
        buttonEnabled: boolean,
        action: Action.DECRYPT | Action.DECRYPT_PASTEBIN | Action.ENCRYPT | Action.ENCRYPT_PASTEBIN,
    },
    [Action.UPDATE_ENC_MENU]: {
        buttonEnabled: boolean,
        action: Action.DECRYPT | Action.DECRYPT_PASTEBIN | Action.ENCRYPT | Action.ENCRYPT_PASTEBIN,
    }
}

type SettingsPayload = {
    [Action.UPDATE_SETTINGS] : {
        api_key: string,
        enc_mode: string,
        key_length: number,
        theme: boolean,
    };
    [Action.RESET_SETTINGS]: undefined,

}

export type DraftActions = ActionMap<DraftPayload>[keyof ActionMap<DraftPayload>];
export type SettingsActions = ActionMap<SettingsPayload>[keyof ActionMap<SettingsPayload>];
export type HistoryActions = ActionMap<HistoryPayload>[keyof ActionMap<HistoryPayload>];

export const historyReducer = (state: HistoryType[], action: SettingsActions | DraftActions | HistoryActions ) => {
    switch (action.type) {
        case Action.ADD_TO_HISTORY:
            return [
                ...state,
                {
                    id: action.payload.id,
                    pastebinlink: action.payload.pastebinlink,
                    enc_text: action.payload.enc_text,
                    key: action.payload.key,
                    enc_mode: action.payload.enc_mode,
                    key_length: action.payload.key_length,
                    date: action.payload.date,
                }
            ]
        case Action.REMOVE_ITEM_FROM_HISTORY:
            return [
                ...state.filter(product => product.id !== action.payload.id),
            ]
        case Action.CLEAR_HISTORY:
            return []
        default:
            return state;
    }
}

export const draftReducer = (state: DraftType, action: SettingsActions | DraftActions | HistoryActions ) => {
    switch (action.type) {
        case Action.ENCRYPT:
            return {
                    ...state,
                    action: action.payload.action,
                    plaintext: action.payload.plaintext,
                enc_text: action.payload.enc_text,
                    key: action.payload.key,
            }
        case Action.ENCRYPT_PASTEBIN:
            return {
                ...state,
                action: action.payload.action,
                plaintext: action.payload.plaintext,
                enc_text: action.payload.enc_text,
                key: action.payload.key,
                pastebinlink: action.payload.pastebinlink,
            }
        case Action.UPDATE_PLAINTEXT:
            return {
                ...state,
                plaintext: action.payload.plaintext,
                action: action.payload.action,
                buttonEnabled: action.payload.buttonEnabled,
            }
        case Action.UPDATE_ENC_MENU:
            return {
                ...state,
                action: action.payload.action,
                buttonEnabled: action.payload.buttonEnabled,
            }
        default:
            return state;
    }
}

export const settingsReducer = (state: SettingsType, action: SettingsActions | DraftActions | HistoryActions ) => {
    switch (action.type) {
        case Action.UPDATE_SETTINGS:
            return {
                ...state,
                api_key: action.payload.api_key,
                enc_mode: action.payload.enc_mode,
                key_length: action.payload.key_length,
                theme: action.payload.theme,
            }
        case Action.RESET_SETTINGS:
            return {
                ...state,
                api_key: DEFAULT_CONTEXT.api_key,
                enc_mode: DEFAULT_CONTEXT.enc_mode,
                key_length: DEFAULT_CONTEXT.key_length,
                theme: DEFAULT_CONTEXT.theme,
            }
        default:
            return state;
    }
}