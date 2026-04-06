# SecureBin Extension

A Chrome MV3 extension for encrypting plaintext and posting it to Pastebin. Supports two modes: a **standalone popup** (click the toolbar icon on restricted pages) and an **injected floating panel** (shadow DOM overlay injected on normal web pages).

---

## Build

```bash
npm install
npm run build
```

Load `build/` as an unpacked extension in Chrome (`chrome://extensions` → Developer mode → Load unpacked).

---

## Architecture

### Two render modes

The extension renders the same React app in two different contexts:

| Mode | Entry point | Mount target | When used |
|---|---|---|---|
| Standalone popup | `src/index.tsx` | `<div id="root">` in `index.html` | chrome://, extension pages, and any restricted URL where content scripts can't inject |
| Injected panel | `src/content/index.tsx` | `<div>` inside a shadow DOM | All normal web pages |

`background.ts` detects restricted URLs via `isRestrictedUrl()` and dynamically calls `chrome.action.setPopup('')` (normal pages) or `chrome.action.setPopup('index.html')` (restricted pages). On normal pages, `chrome.action.onClicked` fires and sends `SB_TOGGLE` to the content script to show/hide the panel.

### Shadow DOM isolation (`src/content/index.tsx`)

The injected panel lives inside a shadow root attached to a `position:fixed` host element. Key elements inside the shadow root:

- **`styleContainer`** — emotion injects all MUI `<style>` tags here (not `document.head`) via `createCache({ container: styleContainer })`
- **`panel`** — the visible 420×600 floating panel, `display:none` by default
- **`portalTarget`** — a zero-size `position:fixed` sibling used as the MUI portal container for Menus and Dialogs; keeps portals inside the shadow DOM so host-page CSS can't interfere
- **`appRoot`** — React mount point inside `panel`

Event isolation is on the `host` element (covers both `panel` and `portalTarget`):
- Keyboard/mouse: `stopPropagation()`
- Wheel/touchmove: `composedPath()` walk to allow scroll on scrollable ancestors, then `preventDefault()` with `{ passive: false }` to block host-page scroll

### MUI + Emotion in shadow DOM

**Do not** use `StyledEngineProvider` in the injected mode — it injects styles into `document.head` which shadow DOM ignores. Use `CacheProvider` only with a custom cache pointing at `styleContainer` inside the shadow root.

For MUI portals (Menu, Dialog), pass `container: portalTarget` either directly via the component's `container` prop or via theme `defaultProps`:

```tsx
// In createTheme components:
...(portalContainer && {
  MuiModal: { defaultProps: { container: portalContainer } },
  MuiPopover: { defaultProps: { container: portalContainer } },
}),
```

`portalContainer` must be read **inside the component function** at render time — not at module level. Webpack evaluates module-level imports before `content/index.tsx` sets `window.__SECUREBIN_PORTAL__`.

### Standalone popup portal fix

In standalone mode, emotion style injection is synchronous (styles go to `document.head` normally). However, MUI's Menu positioning runs in a `useLayoutEffect` and measures the Paper's `offsetWidth` before the CSS class min-width has been flushed. This makes MUI calculate `left = button.right - 1px`, placing the menu off-screen to the right.

Fix in `DropDown.tsx`: pass `PaperProps={{ style: { minWidth: 210 } }}` as an inline style directly on `StyledMenu` — inline styles are applied synchronously by React so the measurement is correct.

---

## Key files

```
src/
  index.tsx               — Standalone popup entry (StyledEngineProvider, MemoryRouter)
  App.tsx                 — Shared app shell; reads __SECUREBIN_PORTAL__ for portal target
  content/
    index.tsx             — Shadow DOM setup, event isolation, content script entry
  chrome/
    background.ts         — Dynamic popup switching, SB_TOGGLE, SB_SHOW_RESULT messages
    utils/
      pastebin.ts         — Pastebin API; detects errors from HTTP 200 + "Bad API Request" body
      storage.ts          — Chrome storage helpers
  components/
    common/
      SecurebinLogo.tsx   — Inline SVG logo (avoids CSP blocking chrome-extension:// URLs)
      SubHeader.tsx       — Back-nav header; width: 100% (not 100vw — causes overflow in panel)
    editor/
      TextEditor.tsx      — Textarea; Box handles scroll, TextareaAutosize grows freely
      SmartButton.tsx     — Split button: ListItemButton (action) + IconButton (chevron/dropdown)
      DropDown.tsx        — MUI Menu; portal container injected mode vs default for standalone
  routes/
    Editor.tsx            — Main editor route; flex column, height 100%
```

---

## Known issues / TODO for rewrite

### 1. DropDown — standalone mode positioning (PARTIALLY FIXED)
**File:** `src/components/editor/DropDown.tsx`

The `PaperProps={{ style: { minWidth: 210 } }}` inline style ensures MUI measures the correct width and positions the menu on-screen. However the root cause is an emotion style-flush timing race: in standalone mode, emotion's CSS class `min-width: 180px` isn't in the DOM when MUI's `useLayoutEffect` measures `offsetWidth`. In the rewrite, consider either:
- Pre-rendering with a fixed-width `Popper` + `Paper` instead of `Menu`
- Using a CSS-in-JS solution that flushes synchronously

### 2. DropDown — ClickAwayListener closing menu on open
**File:** `src/components/editor/SmartButton.tsx` → `handleClick`

MUI's `Menu` uses a `Modal` with `ClickAwayListener`. The click event that opens the menu bubbles up to `document` where the ClickAwayListener catches it and immediately closes the menu. `e.stopPropagation()` is already in `handleClick` — verify this is sufficient or that the event is not reaching the listener through the composed path (shadow DOM boundary). If the issue recurs, the fix is to check whether `anchorEl` changed in the same event tick and skip the close.

### 3. Injected panel — dropdown anchor measurement with shadow DOM
**File:** `src/components/editor/DropDown.tsx`

MUI's Popover measures `anchorEl.getBoundingClientRect()` which works across shadow boundaries. However, the `portalTarget` is a sibling of `panel` inside the shadow root, at `top:0; left:0`. If the menu ever appears misaligned in injected mode, the fix is to ensure `portalTarget` is positioned relative to the viewport, not the panel, and that `anchorEl` is the chevron button element.

### 4. Injected panel — scroll isolation edge cases
**File:** `src/content/index.tsx` → `blockScrollIfNotScrollable`

The composedPath walk stops at `host` and allows scroll on elements with `overflowY: auto/scroll` where `scrollHeight > clientHeight`. This works for the textarea. Edge case: nested scrollable elements (e.g. a scrollable list inside a dialog) — the walk finds the first scrollable ancestor and returns, which may allow page scroll if the inner element is fully scrolled. In the rewrite, consider tracking scroll position to detect if the scrollable element can scroll further in the wheel direction.

### 5. Dynamic popup fallback — tab detection timing
**File:** `src/chrome/background.ts`

`chrome.tabs.onUpdated` only fires `syncActionPopup` on `status === 'complete'`. If a user navigates quickly between tabs, there's a brief window where the popup state may be wrong. This is unlikely to affect UX but worth a cleaner solution in the rewrite (e.g. `chrome.tabs.get` on every `onActivated`).

### 6. Draft sync race
**File:** `src/reducers/reducers.tsx` → `UPDATE_PLAINTEXT`

Every keystroke (after 250ms debounce) calls `setSyncItem(Storage.DRAFT, ...)`. In standalone popup mode, the popup closes on focus loss, which may race with the final debounced write. On reopen, the draft may be missing the last few keystrokes typed before the popup was closed. The fix in the rewrite is to flush the draft synchronously `onBlur` / `beforeunload`.

---

## Content Security Policy notes

The host page's CSP applies to resources loaded inside the shadow DOM. Specifically:
- `chrome-extension://` image URLs are blocked by `img-src` policies on most pages → use inline SVG (`SecurebinLogo.tsx`)
- External fonts loaded via `@font-face` in shadow DOM styles may be blocked similarly

The extension's own CSP (`manifest.json`) governs `index.html` (standalone popup) and the background service worker, not the content script shadow DOM.

---

## Manifest highlights

```json
{
  "manifest_version": 3,
  "permissions": ["storage", "scripting", "activeTab", "tabs"],
  "host_permissions": ["<all_urls>"],
  "action": {},
  "content_scripts": [{ "matches": ["<all_urls>"], "js": ["content.js"] }],
  "background": { "service_worker": "background.js" }
}
```

`default_popup` is intentionally absent — popup is set dynamically per-tab by `background.ts`.
