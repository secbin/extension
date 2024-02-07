export const DEFAULT_SETTINGS = {
    theme: false,
    enc_mode: "AES-GCM",
    key_length: 16,
}

export const DEFAULT_CONTEXT = {
    theme: false,
    api_key: "",
    enc_mode: "AES-GCM",
    encryption: false,
    key_length: 16,
    sync_theme: true,
    settings: DEFAULT_SETTINGS,
    history: []
}

export enum Storage {
    API_KEY = "api_key",
    ENC_MODE = "enc_mode",
    KEY_LENGTH = "key_length",
    THEME = "theme",
    HISTORY = "history",
    SETTINGS = "settings",
    DRAFT = 'draft',
    APP = 'app'
}

export enum ENCRYPTION_TYPES {
    AES_CBC = "AES-CBC",
    AES_CTR = "AES-CTR",
    AES_GCM = "AES-GCM"
}

export enum Action {
    DECRYPT =                   "Decrypt Plaintext",
    DECRYPT_PASTEBIN =          "Decrypt Pastebin",
    OPEN_PASTEBIN =             "Open Paste from Link",
    ENCRYPT =                   "Encrypt Plaintext",
    SAVE_DRAFT =                "Save Draft",
    ENCRYPT_PASTEBIN =          "Encrypt to Pastebin",
    SEND_TO_PASTEBIN =          "Post to Pastebin",
    UNENCRYPT_PASTEBIN =        "Post to Pastebin",
    UPDATE_ENC_MENU =           "update_enc_options",
    SET_DRAFT =                 "set_draft",
    RESET_DRAFT =               "reset_draft",
    SET_KEY =                   "set_key",
    SET_ACTION =                "set_action",
    CLEAR_DRAFT =               "clear_draft",
    ADD_TO_HISTORY =            "add_to_history",
    SET_HISTORY =               "set_history",
    PREVIEW_HISTORY_ITEM =      "preview_history",
    CLEAR_HISTORY =             "clear_history",
    REMOVE_ITEM_FROM_HISTORY =  "remove_item_from_history",
    RESET_SETTINGS =            "clear_settings",
    UPDATE_SETTINGS =           "update_settings",
    SET_SETTINGS =              "set_settings",
    TOGGLE_DARK_MODE =          "toggle_dark_mode",
    UPDATE_THEME =              "update_theme",
    SET_THEME =                 "set_theme",
    UPDATE_PLAINTEXT =          "update_plaintext",
    SET_PREVIEW =               "set_preview",
    CLEAR_PREVIEW =             "clear_preview",
    SET_NAVIGATION =            "set_navigation",
    UPDATE_NAVIGATION =         "update_navigation",
    SET_SUBHEADER =             "set_subheader",
    OPEN_DIALOG =               "open_dialog",
    CLOSE_DIALOG =              "close_dialog",
    CREATE_POST =               "create_post",
}

export const ENCRYPTION_METHODS = [
    {
        name: ENCRYPTION_TYPES.AES_CBC,
        value: ENCRYPTION_TYPES.AES_CBC,
    },
    {
        name: ENCRYPTION_TYPES.AES_CTR,
        value: ENCRYPTION_TYPES.AES_CTR,
    },
    {
        name: ENCRYPTION_TYPES.AES_GCM,
        value: ENCRYPTION_TYPES.AES_GCM,
    }
];

export const KEY_LENGTHS = [
    {
        name: "128",
        value: 16,
    },
    {
        name: "192",
        value: 24,
    },
    {
        name: "256",
        value: 32,
    }
];

// Limiting factors:
// Pastebin 10MB but auto removes text pastes greater than 1000 characters/bytes
// cipher text is ~1.5 times larger than plaintext so limit is half of max
export const MAX_PASTEBIN_TEXT_LENGTH = 512
export const MAX_ENC_TEXT_LENGTH = 4096

export const PASTEBIN_API_KEY_LENGTH = 32

export const API_ERROR = "PasteBin Error"
export const PASTEBIN_BASEURL = "pastebin.com"
export const CIPHER_PREFIX = "C_TXT"