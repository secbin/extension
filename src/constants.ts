export const DEFAULT_CONTEXT = {
    theme: false,
    api_key: "",
    enc_mode: "AES-CBC",
    key_length: 16,
    history: []
}

export enum Storage {
    API_KEY = "api_key",
    ENC_MODE = "enc_mode",
    KEY_LENGTH = "key_length",
    THEME = "theme",
    HISTORY = "history",
}

export enum Action {
    DECRYPT =                   "decrypt",
    DECRYPT_PASTEBIN =          "decrypt_pastebin",
    ENCRYPT =                   "encrypt",
    ENCRYPT_PASTEBIN =          "encrypt_pastebin",
    CLEAR_DRAFT =               "clear_draft",
    ADD_TO_HISTORY =            "add_to_history",
    CLEAR_HISTORY =             "clear_history",
    REMOVE_ITEM_FROM_HISTORY =  "remove_item_from_history",
    RESET_SETTINGS =            "clear_settings",
    UPDATE_SETTINGS =           "update_settings",
    TOGGLE_DARK_MODE =          "toggle_dark_mode",
    UPDATE_PLAINTEXT =          "update_plaintext"
}

export const ENCRYPTION_METHODS = [
    {
        prettyName: "AES-CBC",
        value: "AES-CBC",
    },
    {
        prettyName: "AES-CTR",
        value: "AES-CTR",
    },
    {
        prettyName: "AES-GCM",
        value: "AES-GCM",
    }
];

export const KEY_LENGTHS = [
    {
        prettyName: "128",
        value: 16,
    },
    {
        prettyName: "192",
        value: 24,
    },
    {
        prettyName: "256",
        value: 32,
    }
];

export const MAX_TEXT_LENGTH = 512