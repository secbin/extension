export const DEFAULT_SETTINGS = {
    theme: false,
    enc_mode: "AES-CBC",
    key_length: 16,
}

export const DEFAULT_CONTEXT = {
    theme: false,
    api_key: "",
    enc_mode: "AES-CBC",
    key_length: 16,
    settings: DEFAULT_SETTINGS,
    history: []
}

export const API_ERROR = "PasteBin Error"

export enum Storage {
    API_KEY = "api_key",
    ENC_MODE = "enc_mode",
    KEY_LENGTH = "key_length",
    THEME = "theme",
    HISTORY = "history",
    SETTINGS = "settings"
}

export enum Action {
    DECRYPT =                   "Decrypt Plaintext",
    DECRYPT_PASTEBIN =          "Decrypt Pastebin",
    ENCRYPT =                   "Encrypt Plaintext",
    ENCRYPT_PASTEBIN =          "Encrypt to Pastebin",
    UPDATE_ENC_MENU =           "update_enc_options",
    CLEAR_DRAFT =               "clear_draft",
    ADD_TO_HISTORY =            "add_to_history",
    PREVIEW_HISTORY_ITEM =      "preview_history",
    CLEAR_HISTORY =             "clear_history",
    REMOVE_ITEM_FROM_HISTORY =  "remove_item_from_history",
    RESET_SETTINGS =            "clear_settings",
    UPDATE_SETTINGS =           "update_settings",
    TOGGLE_DARK_MODE =          "toggle_dark_mode",
    UPDATE_PLAINTEXT =          "update_plaintext",
    SET_PREVIEW =               "set_preview",
    CLEAR_PREVIEW =             "clear_preview",
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

// Limiting factors:
// Pastebine 10MB but auto removes text pastes greater then 1000 characters/bytes
// cipher text is ~1.5 times larger than plaintext so limit is half of max
export const MAX_PASTEBIN_TEXT_LENGTH = 512
export const MAX_ENC_TEXT_LENGTH = 4096