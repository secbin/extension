import React from 'react';
import ReactDOM from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';
import App from '../App';
import styles from '../index.css?inline';

(window as any).__SECUREBIN_INJECTED__ = true;

const host = document.createElement('div');
host.id = 'securebin-root';
host.style.cssText =
  'all:initial;position:fixed;top:0;right:0;z-index:2147483647;';
document.documentElement.appendChild(host);
const shadow = host.attachShadow({ mode: 'open' });
// Expose shadow root so CodeMirror 6 can inject adopted stylesheets into the
// correct scope rather than document (which doesn't pierce shadow DOM).
(window as any).__SECUREBIN_SHADOW_ROOT__ = shadow;

// Inject Tailwind CSS into shadow DOM.
// Note: all:initial on the host (inline style) takes precedence over any :host
// rule, so we cannot set font-family via :host selector. Instead we inject a
// base reset rule that targets all elements inside the shadow root, then set
// font-family directly on the panel element so children inherit it.
const styleEl = document.createElement('style');
styleEl.textContent =
  // Reset that survives all:initial on the host — targets shadow DOM internals
  `*, *::before, *::after { box-sizing: border-box; }` +
  // Dividers and borders need border-style: solid since all:initial can reset
  // inherited display properties that affect border rendering
  `.border-b, .border-t, .border-l, .border-r, [class*="border-"] { border-style: solid; }` +
  `.divide-y > * + * { border-top-width: 1px; border-style: solid; }` +
  styles;
shadow.appendChild(styleEl);

const SYSTEM_FONT = '-apple-system,BlinkMacSystemFont,"SF Pro Text","Segoe UI",system-ui,sans-serif';

// CSS custom properties for light and dark themes.
// all:initial on the shadow host blocks CSS variable inheritance from :root,
// so we set them directly on the panel element and update them on theme change.
const LIGHT_VARS: Record<string, string> = {
  '--color-primary': '#1D6BC6',
  '--color-primary-hover': '#1558a8',
  '--color-primary-light': '#e3eefc',
  '--color-danger': '#ef4444',
  '--color-success': '#34c759',
  '--color-warning': '#ff9500',
  '--color-surface': '#ffffff',
  '--color-surface-secondary': '#f2f2f7',
  '--color-surface-hover': '#e5e5ea',
  '--color-border': '#d1d1d6',
  '--color-border-hover': '#aeaeb2',
  '--color-text-primary': '#1c1c1e',
  '--color-text-secondary': '#3a3a3c',
  '--color-text-muted': '#6c6c70',
}

const DARK_VARS: Record<string, string> = {
  '--color-primary': '#4795fd',
  '--color-primary-hover': '#3b82f6',
  '--color-primary-light': '#1e3a5f',
  '--color-danger': '#ff453a',
  '--color-success': '#30d158',
  '--color-warning': '#ffd60a',
  '--color-surface': '#1c1c1e',
  '--color-surface-secondary': '#2c2c2e',
  '--color-surface-hover': '#3a3a3c',
  '--color-border': '#38383a',
  '--color-border-hover': '#545458',
  '--color-text-primary': '#f2f2f7',
  '--color-text-secondary': 'rgba(235,235,245,0.8)',
  '--color-text-muted': '#8e8e93',
}

function applyThemeVars(dark: boolean) {
  const vars = dark ? DARK_VARS : LIGHT_VARS
  for (const [k, v] of Object.entries(vars)) {
    panel.style.setProperty(k, v)
    portalTarget.style.setProperty(k, v)
  }
  panel.style.color = dark ? '#f2f2f7' : '#1c1c1e'
  panel.style.backgroundColor = dark ? '#1c1c1e' : '#ffffff'
}

const panel = document.createElement('div');
panel.style.cssText = [
  'position:fixed',
  'top:20px',
  'right:20px',
  'width:420px',
  'height:600px',
  'border-radius:16px',
  'border:1px solid rgba(0,0,0,0.18)',
  'box-shadow:0 16px 64px rgba(0,0,0,0.10),0 4px 16px rgba(0,0,0,0.06)',
  'overflow:hidden',
  'display:none',
  'z-index:2147483647',
  `font-family:${SYSTEM_FONT}`,
  '-webkit-font-smoothing:antialiased',
  'color:#1c1c1e',
  'background-color:#ffffff',
].join(';');
// Apply light theme CSS vars immediately
for (const [k, v] of Object.entries(LIGHT_VARS)) {
  panel.style.setProperty(k, v)
}
shadow.appendChild(panel);

const portalTarget = document.createElement('div');
portalTarget.style.cssText = [
  'position:fixed',
  'top:0',
  'left:0',
  'width:0',
  'height:0',
  'overflow:visible',
  'z-index:2147483647',
  `font-family:${SYSTEM_FONT}`,
].join(';');
// Mirror CSS vars onto portal target so dropdown children can resolve them
for (const [k, v] of Object.entries(LIGHT_VARS)) {
  portalTarget.style.setProperty(k, v)
}
shadow.appendChild(portalTarget);
(window as any).__SECUREBIN_PORTAL__ = portalTarget;

// Event isolation
['keydown', 'keyup', 'keypress', 'mousedown', 'mouseup', 'click'].forEach(
  type => host.addEventListener(type, e => e.stopPropagation())
);
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
      )
        return;
    }
  }
  e.preventDefault();
}
host.addEventListener('wheel', blockScrollIfNotScrollable, { passive: false });
host.addEventListener('touchmove', blockScrollIfNotScrollable, {
  passive: false,
});

const appRoot = document.createElement('div');
appRoot.style.cssText = `width:100%;height:100%;font-family:${SYSTEM_FONT};`;
panel.appendChild(appRoot);

// Tailwind's dark variant (&:where(.dark, .dark *)) uses class selectors that
// don't pierce shadow DOM boundaries, so .dark on <html> has no effect inside
// the shadow tree. Mirror the class onto panel so dark utilities apply.
function syncDark() {
  const isDark = document.documentElement.classList.contains('dark')
  panel.classList.toggle('dark', isDark)
  applyThemeVars(isDark)
}
syncDark();
new MutationObserver(syncDark).observe(document.documentElement, {
  attributes: true,
  attributeFilter: ['class'],
});

ReactDOM.createRoot(appRoot).render(
  <MemoryRouter initialEntries={['/home']}>
    <App />
  </MemoryRouter>
);

// Panel show/hide + context menu pending text
chrome.runtime.onMessage.addListener(message => {
  if (message.type === 'SB_TOGGLE') {
    // Toolbar icon — toggle open/closed
    const isOpening = panel.style.display === 'none';
    panel.style.display = isOpening ? 'block' : 'none';
  } else if (message.type === 'SB_OPEN') {
    panel.style.display = 'block';
    if (message.quickPostLoading) {
      window.dispatchEvent(new CustomEvent('securebin:quick-post-loading'));
    } else if (message.pendingText) {
      window.dispatchEvent(new CustomEvent('securebin:set-text', { detail: message.pendingText }));
    }
  } else if (message.type === 'SB_QUICK_POST_RESULT') {
    window.dispatchEvent(new CustomEvent('securebin:quick-post-result', { detail: message.payload }));
  }
});

window.addEventListener('securebin:close', () => {
  panel.style.display = 'none';
});
