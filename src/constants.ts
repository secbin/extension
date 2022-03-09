export const defaultContext = {
    pastebinApiKey: "",
    darkMode: false,
}

export enum Storage {
        API_KEY = "api_key",
        ENC_MODE = "enc_mode",
        KEY_LENGTH = "key_length",
        THEME = "theme",
        HISTORY = "history",
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