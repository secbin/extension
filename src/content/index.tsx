import React from 'react';
import ReactDOM from 'react-dom';
import createCache from '@emotion/cache';
import { CacheProvider } from '@emotion/react';
import { MemoryRouter } from 'react-router-dom';
import { AppProvider } from '../contexts/AppContext';
import { App } from '../App';
import { Action } from '../constants';
import { HistoryType } from '../contexts/AppContext';

// Mark this window as the injected panel context
(
  window as Window & { __SECUREBIN_INJECTED__?: boolean }
).__SECUREBIN_INJECTED__ = true;

// Shadow host — sits outside document flow
const host = document.createElement('div');
host.id = 'securebin-root';
host.style.cssText =
  'all:initial;position:fixed;top:0;right:0;z-index:2147483647;';
document.documentElement.appendChild(host);
const shadow = host.attachShadow({ mode: 'open' });

// Base styles scoped to shadow root — resets and fonts.
// Emotion injects MUI styles into this same element.
const styleContainer = document.createElement('div');
const baseStyle = document.createElement('style');
baseStyle.textContent = `
  *, *::before, *::after { box-sizing: border-box; }
  * {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
      "Helvetica Neue", Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
  }
`;
styleContainer.appendChild(baseStyle);
shadow.appendChild(styleContainer);

// The visible floating panel
const panel = document.createElement('div');
panel.style.cssText = [
  'position:fixed',
  'top:20px',
  'right:20px',
  'width:420px',
  'height:600px',
  'border-radius:16px',
  'border:1px solid rgba(0,0,0,0.12)',
  'box-shadow:0 16px 64px rgba(0,0,0,0.10),0 4px 16px rgba(0,0,0,0.06)',
  'overflow:hidden',
  'display:none',
  'z-index:2147483647',
].join(';');
shadow.appendChild(panel);

// Dedicated portal target for MUI Menus, Dialogs, etc. — sits inside the
// shadow root so portals stay isolated from the host page.
// Zero-size, high-z-index container — children (Menu, Dialog) extend via
// overflow:visible and render above the panel without blocking any page events.
const portalTarget = document.createElement('div');
portalTarget.style.cssText = [
  'position:fixed',
  'top:0',
  'left:0',
  'width:0',
  'height:0',
  'overflow:visible',
  'z-index:2147483647',
].join(';');
shadow.appendChild(portalTarget);
(
  window as Window & { __SECUREBIN_PORTAL__?: HTMLElement }
).__SECUREBIN_PORTAL__ = portalTarget;

// Prevent events from leaking out of the shadow DOM to the host page.
// Listening on `host` (the shadow boundary) covers both the panel and any
// portals (Menus, Dialogs) that render into sibling elements inside the root.
['keydown', 'keyup', 'keypress', 'mousedown', 'mouseup', 'click'].forEach(
  type => host.addEventListener(type, e => e.stopPropagation())
);

// Wheel/touch: stopPropagation alone doesn't block browser-default scroll —
// we need preventDefault. But only when there's no scrollable element under
// the cursor (e.g. the textarea), so we walk the composed path first.
// TODO(rewrite): edge case — if a nested scrollable element (e.g. list inside dialog) is
// fully scrolled, this walk finds it and returns early, potentially allowing page scroll.
// Fix: check scroll direction vs remaining scroll distance before returning.
function blockScrollIfNotScrollable(e: Event) {
  e.stopPropagation();
  const path = e.composedPath();
  for (const el of path) {
    if (el === host) break;
    if (el instanceof HTMLElement) {
      const { overflowY } = getComputedStyle(el);
      if (
        (overflowY === 'auto' || overflowY === 'scroll') &&
        el.scrollHeight > el.clientHeight
      ) {
        return; // scrollable ancestor found — let the browser handle it
      }
    }
  }
  e.preventDefault();
}
host.addEventListener('wheel', blockScrollIfNotScrollable, { passive: false });
host.addEventListener('touchmove', blockScrollIfNotScrollable, {
  passive: false,
});

// React mount point fills the panel
const appRoot = document.createElement('div');
appRoot.style.cssText = 'width:100%;height:100%;';
panel.appendChild(appRoot);

// Emotion injects all MUI <style> tags into styleContainer (inside shadow root)
// instead of document.head. Do NOT use StyledEngineProvider injectFirst —
// that would put styles in document.head which shadow DOM ignores.
const cache = createCache({
  key: 'securebin',
  prepend: true,
  container: styleContainer,
});

// Internal dispatch ref — set by App via custom event so we can push history items
let dispatchRef: React.Dispatch<{ type: string; payload: unknown }> | null =
  null;

window.addEventListener('securebin:register-dispatch', (e: Event) => {
  dispatchRef = (e as CustomEvent).detail;
});

ReactDOM.render(
  <CacheProvider value={cache}>
    <MemoryRouter>
      <AppProvider>
        <App />
      </AppProvider>
    </MemoryRouter>
  </CacheProvider>,
  appRoot
);

function showPanel(path?: string, item?: HistoryType) {
  panel.style.display = 'block';
  if (item && dispatchRef) {
    dispatchRef({ type: Action.ADD_TO_HISTORY, payload: item });
  }
  if (path) {
    // small delay so state update lands before the route renders
    setTimeout(() => {
      window.dispatchEvent(
        new CustomEvent('securebin:navigate', { detail: path })
      );
    }, 30);
  }
}

chrome.runtime.onMessage.addListener(message => {
  if (message.type === 'SB_TOGGLE') {
    panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
  } else if (message.type === 'SB_SHOW_RESULT') {
    showPanel('/result', message.item as HistoryType);
  }
});

// Close event dispatched by the App's close button
window.addEventListener('securebin:close', () => {
  panel.style.display = 'none';
});
