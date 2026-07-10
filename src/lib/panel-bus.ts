// In-process event bus for panel ↔ app signaling.
//
// Deliberately NOT window CustomEvents: the injected panel shares window and
// DOM with the host page, so page scripts could forge our signals (e.g. a
// fake "app-ready" that defeats the message buffer) or eavesdrop on payloads
// (e.g. the paste URL in a quick-post result). This module instance lives in
// the extension's own JS context — the popup page, or the content script's
// isolated world, where App is part of the same bundle — which page scripts
// cannot reach.
export const panelBus = new EventTarget()

export function emitPanelEvent(name: string, detail?: unknown): void {
  panelBus.dispatchEvent(new CustomEvent(name, detail === undefined ? undefined : { detail }))
}
