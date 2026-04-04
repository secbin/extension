# SecureBin Extension – Cleanup & Bug Fix Plan

## Status: Complete ✓

---

## Step 0: Resolve Merge Conflicts (main → 1.2.0)

Merge main branch into 1.2.0. Conflicts in 8 files with the following resolutions:

| File                                  | Resolution                                                                      |
| ------------------------------------- | ------------------------------------------------------------------------------- |
| `public/manifest.json`                | Take main's updated name/version; keep `manifest_version: 3` (v4 doesn't exist) |
| `src/chrome/utils/crypto.ts`          | Take HEAD (identical logic, better 2-space indentation)                         |
| `src/components/dialog/EncDialog.tsx` | Take main (adds random passkey generation UX improvement)                       |
| `src/constants.ts`                    | Take HEAD — do NOT include embedded `DEFAULT_HASH` API key from main            |
| `src/reducers/reducers.tsx`           | Take HEAD — avoid `btoa`/`atob` API key obfuscation machinery                   |
| `src/routes/ApiKeyConfig.tsx`         | Take HEAD — no hardcoded default API key check                                  |
| `src/routes/Result.tsx`               | Merge: add `StatusIcon` success variant from main, keep HEAD code style         |
| `src/routes/Settings.tsx`             | Take HEAD (cleaner imports, no embedded key check)                              |

---

## Step 1: Fix Issue #45 – Unencrypted Pastebin when encryption is enabled

**Root cause**: `Action.SEND_TO_PASTEBIN` and `Action.UNENCRYPT_PASTEBIN` both resolve to the
string `'Post to Pastebin'`. In `SmartButton.tsx`, `encryptionMap` keys on this string, so when
a user explicitly selects "Post to Pastebin (unencrypted)" from the menu with encryption enabled,
`getButtonText()` mistakenly returns `Action.ENCRYPT_PASTEBIN` and triggers the encryption dialog.

**Files**: `src/constants.ts`, `src/components/editor/SmartButton.tsx`

**Fix**:

1. Change `Action.UNENCRYPT_PASTEBIN = 'Post Unencrypted'` (distinct value).
2. Remove `Action.SEND_TO_PASTEBIN` from `encryptionMap` in SmartButton — it was colliding with `UNENCRYPT_PASTEBIN` and is only needed for the `plainMap` direction.
3. Update `actionWrapper` comparison to handle the new string.
4. Update display label in `DropDown.tsx` EncryptionMenu if needed.

---

## Step 2: Fix Issue #47 – Dark mode based on system setting

**Root cause**: Theme is only set manually via the Settings toggle. No system preference detection.

**Files**: `src/App.tsx`, `src/reducers/reducers.tsx`

**Fix**:

1. In `App.tsx` `useEffect` on mount: after loading stored theme, if no stored theme exists
   (fresh install), detect `window.matchMedia('(prefers-color-scheme: dark)').matches` and apply it.
2. Add a `prefers-color-scheme` media query listener so the UI reacts to OS-level changes while
   the extension is open (respects the stored manual override if set).
3. The existing `sync_theme` field in settings can gate whether to follow the system preference.

---

## Step 3: Fix Issue #48 – Rendering jerkiness on Pastebin post completion

**Root cause**: React Router v5 `<Switch>` does instant route transitions with no animation.

**Files**: `src/App.tsx`, `src/styles/App.css`

**Fix**:

1. Wrap the route content area in a keyed container that reacts to `location.pathname` changes.
2. Add CSS fade-in/fade-out transition (`opacity` + `transform: translateY`) in `App.css`.
3. Use `useLocation` hook and a `useState` flag to drive the transition class, triggering the
   enter animation on each route change.
4. No new dependencies needed — use plain CSS transitions.

---

## Step 4: Fix Issue #50 – Right-click highlight posting malfunction

**Root causes**:

1. **Context menu creation at service-worker top-level**: `chrome.contextMenus.create()` is
   called outside any lifecycle listener. In MV3 service workers, the worker is regularly
   terminated and restarted. On every restart (not just the first install), these calls throw
   `"Unchecked runtime.lastError: Cannot create item with duplicate id"`. This silently breaks
   the service worker.

2. **Incorrect length check in decrypt handler**: The decrypt branch checks
   `text.length > MAX_PASTEBIN_TEXT_LENGTH (512)` and blocks with a wrong message.
   Encrypted ciphertext is typically larger than plaintext and will nearly always exceed 512
   chars — making in-place decryption of highlighted encrypted text impossible.

3. **`background.ts` alert text bug**: Line 103 says `MAX_ENC_TEXT_LENGTH` but the check
   is against `MAX_PASTEBIN_TEXT_LENGTH`.

**Files**: `src/chrome/background.ts`

**Fix**:

1. Move all `chrome.contextMenus.create()` calls inside `chrome.runtime.onInstalled.addListener`.
   Before creating, call `chrome.contextMenus.removeAll()` to ensure idempotency.
2. Remove the erroneous `MAX_PASTEBIN_TEXT_LENGTH` check from the decrypt handler
   (ciphertext legitimately exceeds 512 chars).
3. Fix the alert text on line 103 to reference `MAX_PASTEBIN_TEXT_LENGTH` correctly.

---

## Step 5: Add Unit Tests

**Framework**: Jest + `@testing-library/react` (already installed)

**Files to create**:

- `src/chrome/utils/crypto.test.ts` — encrypt/decrypt round-trips for AES-CBC, AES-CTR, AES-GCM;
  password-based PBKDF2 path; error handling for malformed ciphertext
- `src/reducers/reducers.test.ts` — each reducer (history, app, draft, settings) with all action
  types
- `src/chrome/utils/utils.test.ts` — `printDateInCorrectFormat`, `copyTextClipboard`
- `src/chrome/utils/pastebin.test.ts` — `isValidDevKey` with mocked fetch

**Chrome API mocks**: Add a `src/setupTests.ts` (or extend existing) that provides `chrome`
global stubs for storage, runtime, contextMenus, and tabs APIs.

---

## Step 6: Code Quality & Dependency Fixes

### 6a. Fix MUI v5 API deprecation

- `App.tsx`: Replace `createMuiTheme` → `createTheme` (import from `@mui/material/styles`)
- This is a deprecation warning in MUI v5 that was renamed in 5.x

### 6b. Remove hardcoded API key

- `background.ts` line 113: Remove hardcoded `'LxmOdiaiwoCXmuwWvUqkhliMcp0LjHP-'` and use
  the user's stored `api_key` from settings.

### 6c. Dependency updates (conservative — avoid major breaking changes)

Update patch/minor versions in `package.json`:

- `node-forge`: `1.2.1` → `1.3.x`
- `moment`: Keep (not worth migrating to dayjs in this pass)
- `@types/chrome`: Update to latest minor
- Keep React 17 (18 requires render API migration)
- Keep react-router-dom 5 (v6 requires full rewrite)
- Keep @craco/craco 5 (compatible with current react-scripts setup)

### 6d. TypeScript strict fixes

- `Result.tsx`: `id >= 0` comparison with `string` from `useParams` — fix type
- `background.ts`: Remove debug `console.log` with hardcoded TODO comment

---

## Execution Order

1. Resolve merge conflicts → commit merge
2. Step 6a: Fix `createMuiTheme` (unblocks build)
3. Step 4: Fix #50 (background.ts service worker)
4. Step 1: Fix #45 (unencrypted pastebin action)
5. Step 2: Fix #47 (system dark mode)
6. Step 3: Fix #48 (route transitions)
7. Step 5: Add unit tests
8. Step 6b–6d: Remaining cleanup
