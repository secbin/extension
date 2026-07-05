# securebin

<a href="https://chrome.google.com/webstore/detail/securebin/ehjclckbpmkgjgfnebopjlilpdbjjpjj" target="_blank" rel="noreferrer noopener"><img width="50" src="https://upload.wikimedia.org/wikipedia/commons/0/0b/Chrome_Web_Store_logo_2012-2015.svg"></a>


securebin is a Google Chrome extension for interfacing securely with PasteBin.

Users can encrypt plaintext and have it stored onto PasteBin, where they can copy the link and key to send it to another user for decryption. Encryption happens locally in your browser with the Web Crypto API (AES-GCM by default) — the plaintext never leaves your machine.

securebin works out of the box; add your own [PasteBin API key](https://pastebin.com/doc_api#1) in Settings to post under your account.

To learn more about our project and the design decisions check out the [Wiki page.](https://github.com/secbin/extension/wiki)

| Pastebin client | Secure mode |
| --- | --- |
| <img width="400" src="assets/video/demo_pastebin.gif" alt="Demo: paste code and post it straight to Pastebin"> | <img width="400" src="assets/video/demo_encrypt.gif" alt="Demo in dark mode: encrypt with a passkey, post, and copy the share link"> |
| Post code or notes straight to Pastebin — formats, expiry, and visibility included. | Encrypt locally with AES-GCM first; only ciphertext ever reaches Pastebin. |

## What's new in v2

Version 2 is a complete rewrite of the extension using modern web technologies:

- **Framework:** React 19 with TypeScript
- **Styling:** Tailwind CSS v4 and Radix UI primitives for a modern, beautiful, and accessible UI
- **State Management:** Zustand
- **Routing:** React Router v7
- **Bundler:** Vite with `@crxjs/vite-plugin` for optimized extension builds and HMR (Hot Module Replacement)

## How to install

You can grab a prebuilt version of this extension under the [releases tab](https://github.com/secbin/extension/releases) or build it yourself:

```
$ npm install
$ npm run build
```

Then load the generated `dist` folder via `chrome://extensions` → Developer mode → Load unpacked.

## Development

`npm run dev` starts the Vite development server with Hot Module Replacement; load the generated `dist` folder in Chrome the same way.

Optionally bundle a default Pastebin API key into the build (used when the person installing the extension hasn't configured their own key). The key is injected at build time from a gitignored env file and never committed:

```bash
cp .env.example .env.local
# then set VITE_DEFAULT_PASTEBIN_API_KEY in .env.local
```

Builds without `.env.local` work normally — posting to Pastebin is simply disabled until a key is entered under Settings → API Key.

### Scripts

- `npm run dev`: Start the Vite development server with HMR.
- `npm run build`: Build the extension for production into `dist/`.
- `npm run test`: Run unit tests using Vitest.
- `npm run test:watch`: Run tests in watch mode.
- `npm run preview`: Preview the production build.
