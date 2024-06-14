import React, { createContext, Dispatch, useReducer } from 'react'
import { Action } from '../constants'
import { getSyncItem, getLocalItem } from "../chrome/utils/storage";
import { Storage } from "../constants"
import {
    HistoryActions,
    historyReducer,
    appReducer,
    draftReducer,
    settingsReducer,
    DraftActions,
    SettingsActions,
    AppActions, GlobalActions
} from '../reducers/reducers';

export type SettingsType = {
    api_key: string,
    enc_mode: string,
    key_length: number,
    theme: boolean,
    encryption: boolean,
    sync_theme: boolean,
}

export type DraftType = {
    action: Action.DECRYPT | Action.DECRYPT_PASTEBIN | Action.ENCRYPT | Action.ENCRYPT_PASTEBIN | Action.UNENCRYPT_PASTEBIN | Action.OPEN_PASTEBIN | Action.SAVE_DRAFT,
    plaintext: string,
    buttonEnabled: boolean,
    enc_text: string,
    pastebinlink: string,
    key: string,
    success: any,
}

export type HistoryType = {
    id: number,
    pastebinlink: string,
    enc_mode: string | null,
    key_length: number | null,
    key: string | null,
    enc_text: string | null,
    date:  Date,
}

export type SubHeaderType = {
    primary?: string | null,
    secondary?: string | null,
    back_button?: boolean | null,
    custom_button?: string | null,
}

export type AppType = {
    location: string | null,
    dialog_id: string | null,
    subheader: SubHeaderType | null
}

function getSettingsValuesFromStorage() {
    getSyncItem(null, (data) => {
        return {
        api_key: data[Storage.API_KEY],
        enc_mode: data[Storage.ENC_MODE],
        key_length: data[Storage.KEY_LENGTH],
        theme: data[Storage.THEME],
        } as SettingsType
    })
    return {
        api_key: "",
        enc_mode: "",
        key_length: -1,
        theme: false,
    } as SettingsType
}

type InitialStateType = {
    app: AppType;
    history: HistoryType[];
    draft: DraftType;
    settings: SettingsType;
}

const initialState = {
    app: {
        location: null,
        dialog_id: null,
        subheader: null,
    },
    history: [],
    draft: {
        action: Action.SEND_TO_PASTEBIN,
        plaintext: "",
        buttonEnabled: false,
        enc_text: "",
        pastebinlink: "",
        key: "",
        success: "",
    } as DraftType,
    settings: {
        api_key: "",
        enc_mode: "",
        key_length: -1,
        theme: false,
        sync_theme: true,
        encryption: false,
    },
}

type Actions = AppActions | HistoryActions | DraftActions | SettingsActions | GlobalActions;
const AppContext = createContext<{
    state: InitialStateType;
    dispatch: Dispatch<Actions>;
}>({
    state: initialState,
    dispatch: () => null
});

const mainReducer = (state: InitialStateType, action: Actions) => {
    const { app, history, draft, settings } = state;
    // Directly handle specific actions
    switch (action.type) {
        case Action.CREATE_POST:
            // Process the action and modify the state as needed




            return {
                ...state, // Spread the existing state
                // Update specific parts of the state based on the action
            };
        // Add more cases as needed
    }

    // If the action isn't handled above, delegate to sub-reducers
    return {
        app: appReducer(app, action),
        history: historyReducer(history, action),
        draft: draftReducer(draft, action),
        settings: settingsReducer(settings, action),
    };
};


const AppProvider: React.FC = ({ children }) => {
    const [state, dispatch] = useReducer(mainReducer, initialState);

    return (
        <AppContext.Provider value={{state, dispatch}}>
            {children}
        </AppContext.Provider>
    )
}

export { AppProvider, AppContext };