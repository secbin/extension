# SecureBin v2

SecureBin is a Google Chrome extension for interfacing securely with PasteBin. 
Users can encrypt plaintext and have it stored onto PasteBin, where they can copy the link and key to send it to another user for decryption.

## What's New in v2

Version 2 is a complete rewrite of the extension using modern web technologies:
- **Framework:** React 19 with TypeScript
- **Styling:** Tailwind CSS v4 and Radix UI primitives for a modern, beautiful, and accessible UI
- **State Management:** Zustand
- **Routing:** React Router v7
- **Bundler:** Vite with `@crxjs/vite-plugin` for optimized extension builds and HMR (Hot Module Replacement)

## Prerequisites

To use this extension, you will need a PasteBin Developer API Key to post your payloads securely.
1. Sign up or Log in to [PasteBin](https://pastebin.com/).
2. Navigate to the [API Documentation](https://pastebin.com/doc_api#1) to copy your developer API key.
3. Open the extension's Settings page to input and save your API key.

## Development

### Setup

Ensure you have Node.js (and `npm`) installed, then install the dependencies:

```bash
cd v2
npm install
```

### Scripts

- `npm run dev`: Start the Vite development server with Hot Module Replacement (HMR). You should load the generated `v2/dist` folder in Chrome.
- `npm run build`: Build the extension for production.
- `npm run lint`: Run ESLint to analyze the code and automatically fix format issues.
- `npm run test`: Run unit tests using Vitest.
- `npm run test:watch`: Run tests in watch mode.
- `npm run preview`: Preview the production build.

## Installation

1. First, build the extension using `npm run build` or start the dev server via `npm run dev`.
2. Open Chrome and navigate to your extensions page: `chrome://extensions/`.
3. Enable **Developer mode** in the top-right corner.
4. Click **Load unpacked** and select the `v2/dist` directory.
