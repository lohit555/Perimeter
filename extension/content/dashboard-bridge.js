/**
 * Dashboard bridge.
 *
 * A web page can't read chrome.storage, and the extension can't reach the
 * React app's memory. This content script runs on the dashboard origin and
 * mirrors the extension's token ledger into the page's localStorage, then
 * fires an event so the app can re-render live.
 *
 * Runs only on localhost/127.0.0.1 (see manifest content_scripts.matches).
 */

const STORAGE_KEY = "perimeter.extensionTokens";
const LEDGER_KEY = "perimeter.ledger";
const EVENT_NAME = "perimeter:tokens-updated";

function publish(ledger) {
  const payload = JSON.stringify(ledger || []);
  try {
    if (window.localStorage.getItem(STORAGE_KEY) === payload) return;
    window.localStorage.setItem(STORAGE_KEY, payload);
  } catch {
    // Private mode / storage disabled — the event below still works for a
    // page that is already listening.
  }
  window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: ledger || [] }));
}

async function syncNow() {
  try {
    const stored = await chrome.storage.local.get(LEDGER_KEY);
    publish(stored[LEDGER_KEY] || []);
  } catch {
    /* extension context torn down — nothing to do */
  }
}

// Initial sync, plus a live one whenever the extension issues a token.
syncNow();

chrome.storage.onChanged.addListener((changes, area) => {
  if (area === "local" && changes[LEDGER_KEY]) {
    publish(changes[LEDGER_KEY].newValue || []);
  }
});

// Let the page ask for a resync (e.g. on mount, or after a manual refresh).
window.addEventListener("perimeter:request-sync", syncNow);

// Announce that the extension is installed, so the dashboard can show a
// connected state instead of guessing.
document.documentElement.setAttribute("data-perimeter-extension", "1");
