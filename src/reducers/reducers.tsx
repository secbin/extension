import {AppType, DraftType, HistoryType, SettingsType, SubHeaderType} from "../contexts/AppContext";
import {setSyncItem, deleteSyncItem} from "../chrome/utils/storage";
import { Storage, Action, DEFAULT_CONTEXT } from "../constants"

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
    [Action.SET_HISTORY] : [{
        id: number,
        pastebinlink: string,
        enc_mode: string | null,
        key_length: number | null,
        key: string | null,
        enc_text: string | null,
        date: Date,
    }];
    [Action.ADD_TO_HISTORY] : {
        id: number,
        pastebinlink: string,
        enc_mode: string | null,
        key_length: number | null,
        key: string | null,
        enc_text: string | null,
        date: Date,
    };
    [Action.CLEAR_HISTORY] : undefined,
    [Action.REMOVE_ITEM_FROM_HISTORY]: {
        id: number;
    }
}

type AppPayload = {
    [Action.SET_NAVIGATION] : {
        location: Action.ENCRYPT,
    };
    [Action.UPDATE_NAVIGATION] : {
        location: Action.ENCRYPT,
    };
    [Action.OPEN_DIALOG] : {
        dialog_id: string,
    };
    [Action.CLOSE_DIALOG] : undefined;
    [Action.SET_SUBHEADER]: {
        subheader: SubHeaderType | null,
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
        action: Action.DECRYPT | Action.DECRYPT_PASTEBIN | Action.ENCRYPT | Action.ENCRYPT_PASTEBIN | Action.UNENCRYPT_PASTEBIN | Action.OPEN_PASTEBIN | Action.SAVE_DRAFT,
    };
    [Action.UPDATE_ENC_MENU]: {
        buttonEnabled: boolean,
        action: Action.DECRYPT | Action.DECRYPT_PASTEBIN | Action.ENCRYPT | Action.ENCRYPT_PASTEBIN | Action.UNENCRYPT_PASTEBIN | Action.OPEN_PASTEBIN | Action.SAVE_DRAFT,
    };
    [Action.SET_DRAFT]: {
        plaintext: string;
        buttonEnabled: boolean,
        action: Action.DECRYPT | Action.DECRYPT_PASTEBIN | Action.ENCRYPT | Action.ENCRYPT_PASTEBIN | Action.UNENCRYPT_PASTEBIN | Action.OPEN_PASTEBIN | Action.SAVE_DRAFT,
    };
    [Action.SET_KEY]: {
        key: string;
    };
    [Action.SET_ACTION]: {
        action: Action.DECRYPT | Action.DECRYPT_PASTEBIN | Action.ENCRYPT | Action.ENCRYPT_PASTEBIN | Action.UNENCRYPT_PASTEBIN | Action.OPEN_PASTEBIN | Action.SAVE_DRAFT;
    };
    [Action.RESET_DRAFT]: null | undefined,
}

type SettingsPayload = {
    [Action.UPDATE_SETTINGS] : {
        api_key?: string,
        enc_mode?: string,
        encryption?: boolean,
        key_length?: number,
        theme?: boolean,
        sync_theme?: boolean,

    };
    [Action.SET_SETTINGS] : {
        api_key?: string,
        enc_mode?: string,
        encryption?: boolean,
        key_length?: number,
        theme?: boolean,
        sync_theme?: boolean,

    };
    [Action.UPDATE_THEME] : {
        theme: boolean,
    };
    [Action.SET_THEME] : {
        theme: boolean,
    };
    [Action.RESET_SETTINGS]: undefined | null,

}

type GlobalPayload = {
    [Action.CREATE_POST] : {
        id: number,
        pastebinlink: string,
        enc_mode: string | null,
        key_length: number | null,
        key: string | null,
        enc_text: string | null,
        date: Date,
    };
}

export type DraftActions = ActionMap<DraftPayload>[keyof ActionMap<DraftPayload>];
export type AppActions = ActionMap<AppPayload>[keyof ActionMap<AppPayload>];
export type SettingsActions = ActionMap<SettingsPayload>[keyof ActionMap<SettingsPayload>];
export type HistoryActions = ActionMap<HistoryPayload>[keyof ActionMap<HistoryPayload>];
export type GlobalActions = ActionMap<GlobalPayload>[keyof ActionMap<GlobalPayload>];


export const historyReducer = (state: HistoryType[], action: AppActions | SettingsActions | DraftActions | HistoryActions | GlobalActions ) => {
    switch (action.type) {
        case Action.SET_HISTORY:
            return action.payload
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

export const postReducer = (state: HistoryType[], action: AppActions | SettingsActions | DraftActions | HistoryActions | GlobalActions ) => {
    switch (action.type) {
        case Action.CREATE_POST:




            return state;
        default:
            return state;
    }
}

export const appReducer = (state: AppType, action: AppActions | SettingsActions | DraftActions | HistoryActions | GlobalActions ) => {
    switch (action.type) {
        case Action.UPDATE_NAVIGATION:
            const location = action.payload.location;
            const updatedNavigation = {
                ...state,
                location: location,
                subheader: null,
            }
            // setSyncItem(Storage.APP, JSON.stringify({location, date: new Date().getTime()}));
        return updatedNavigation;
        case Action.SET_NAVIGATION:
            const setNavigation = {
                ...state,
                location: action.payload.location,
                subheader: null,
            }
            return setNavigation;
        case Action.OPEN_DIALOG:
            const updatedId = {
                ...state,
                dialog_id: action.payload.dialog_id,
            }
            return updatedId;
        case Action.CLOSE_DIALOG:
            const updatedClosedId = {
                ...state,
                dialog_id: null,
            }
            return updatedClosedId;
        case Action.SET_SUBHEADER:
            console.log("RECEIEVED SUBHEADER", action.payload.subheader);
            const updatedSubheader = {
                ...state,
                subheader: action.payload.subheader,
            }
            return updatedSubheader;
        default:
            return state;
    }
}

export const draftReducer = (state: DraftType, action: AppActions | SettingsActions | DraftActions | HistoryActions | GlobalActions) => {
    switch (action.type) {
        case Action.ENCRYPT:
            return {
                    ...state,
                    action: action.payload.action,
                    plaintext: action.payload.plaintext,
                    enc_text: action.payload.enc_text,
                    // key: action.payload.key,
            }
        case Action.ENCRYPT_PASTEBIN:
            return {
                ...state,
                action: action.payload.action,
                plaintext: action.payload.plaintext,
                enc_text: action.payload.enc_text,
                // key: action.payload.key,
                pastebinlink: action.payload.pastebinlink,
            }
        case Action.UPDATE_PLAINTEXT:
            const updatedPlaintext = {
                ...state,
                plaintext: action.payload.plaintext,
                action: action.payload.action,
                buttonEnabled: action.payload.buttonEnabled,
            };
            setSyncItem(Storage.DRAFT, JSON.stringify(updatedPlaintext));
            return updatedPlaintext;
        case Action.UPDATE_ENC_MENU:
            return {
                ...state,
                action: action.payload.action,
                buttonEnabled: action.payload.buttonEnabled,
            };
        case Action.SET_DRAFT:
            const setPlaintext = {
                ...state,
                plaintext: action.payload.plaintext,
                action: action.payload.action,
                buttonEnabled: action.payload.buttonEnabled,
            };
            return setPlaintext;
        case Action.SET_KEY:
            const setKey = {
                ...state,
                key: action.payload.key,
            };
            return setKey;
        case Action.SET_ACTION:
            const setAction = {
                ...state,
                action: action.payload.action,
            };
            return setAction;
        case Action.RESET_DRAFT:
            const resetDraft = {
                ...state,
                key: '',
                plaintext: '',
                action: Action.ENCRYPT,
                buttonEnabled: false,
            } as DraftType;
            deleteSyncItem(Storage.DRAFT);
            return resetDraft;
        default:
            return state;
    }
}

export const settingsReducer = (state: SettingsType, action: AppActions | SettingsActions | DraftActions | HistoryActions | GlobalActions) => {

    switch (action.type) {
        case Action.SET_SETTINGS:
            // @ts-ignore
            const { encryption, sync_theme } = action.payload || {};
            const setEncryption = encryption !== undefined ? encryption : state.encryption;
            const setSyncTheme = sync_theme !== undefined ? sync_theme : state.sync_theme;

            return {
                ...state,
                api_key: action.payload?.api_key || state.api_key,
                enc_mode: action.payload?.enc_mode || state.enc_mode,
                encryption: setEncryption,
                key_length: action.payload?.key_length || state.key_length,
                sync_theme:  setSyncTheme,
            };
        case Action.SET_THEME:
            return {
                ...state,
                theme: action.payload.theme || state.theme,
            };
        case Action.UPDATE_THEME:
            setSyncItem(Storage.THEME, action.payload.theme);
            const newTheme = {
                ...state,
                theme: action.payload.theme
            };
            return newTheme;
        case Action.UPDATE_SETTINGS:
            // @ts-ignore
            const { encryption: enc, sync_theme: sync } = action.payload || {};
            const testedEncryption = enc !== undefined ? enc : state.encryption;
            const testedSyncTheme = sync !== undefined ? sync : state.sync_theme;

            const newState = {
                ...state,
                api_key: action.payload?.api_key || state.api_key,
                enc_mode: action.payload?.enc_mode || state.enc_mode,
                encryption:  testedEncryption,
                key_length: action.payload?.key_length || state.key_length,
                sync_theme:  testedSyncTheme,

            };
            setSyncItem(Storage.SETTINGS, JSON.stringify(newState));
            return newState;
        case Action.RESET_SETTINGS:
            setSyncItem(Storage.SETTINGS, JSON.stringify(DEFAULT_CONTEXT));
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