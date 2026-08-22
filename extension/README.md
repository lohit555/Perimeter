# Perimeter Chrome Extension

Issues a disposable, vendor-scoped payment token instead of handing a
merchant your real card number, and fills it into the checkout field you
have focused.

This directory (`extension/`) is one piece of the larger
[Perimeter](https://github.com/lohit555/Perimeter) monorepo. The repo root
also contains the Base44 web dashboard (Vite + React) — that app is owned
by a different part of the team and is **not touched by anything in this
folder**. This README only covers the Chrome extension.

## Features

- Vendor-scoped token generation (mock or real Render Vault API)
- Domain detection from the active tab
- Focused payment-field insertion (no site-specific integration required)
- Mock API mode — fully demoable with zero backend
- Manifest V3, minimal permissions (`activeTab`, `scripting`, `storage`)

## Why there's no build step

The PRD suggested Vite + TypeScript. This version is deliberately **plain
JS with native ES modules**, loaded straight from this `extension/`
folder — no `npm install`, no build, nothing that can fail between now and
the demo, and no dependency on (or interference with) the Vite/React
toolchain the Base44 app at the repo root already uses. MV3 service
workers and popups both support ES modules natively, so `import`/`export`
still works cleanly across files.

If you want to layer TypeScript + Vite back in after the hackathon, the
folder structure (`popup/`, `background/`, `api/`, `utils/`, `demo/`)
already matches what the PRD asked for — it's a straight port, not a
rewrite.

## Architecture

```
Chrome Extension (popup + service worker)
        │  chrome.runtime.sendMessage("GENERATE_TOKEN")
        ▼
Service worker → api/vault-api.js → Mock or Real Vault API
        │
        ▼  (on "Fill Payment Field")
chrome.scripting.executeScript → fills the focused input on the active tab
```

The extension has **no static content script** — it injects a small
fill function into the page on demand via `chrome.scripting.executeScript`
when you click "Fill Payment Field". This keeps permissions minimal (no
`<all_urls>`, no host permissions) and avoids a persistent content script
running on every page.

## Permissions

- `activeTab` — read the current tab's URL only when you interact with
  the extension, no background tab access
- `scripting` — inject the field-fill function into the active tab only
  when you click "Fill Payment Field," not on every page load
- `storage` — reserved for future use (session-scoped token state);
  nothing is written to it yet in the MVP

No `<all_urls>`, no host permissions, no persistent content script.

## Setup — loading into Chrome

1. Clone/pull this repo
2. Open `chrome://extensions`
3. Enable **Developer mode** (top right)
4. Click **Load unpacked**
5. Select the `extension/` folder (this folder — not the repo root, and
   not a `dist/`, there isn't one)
6. Pin the Perimeter icon to the toolbar for convenience

That's it. No install, no build.

## Running the demo checkout page

Open `demo/checkout.html` directly in Chrome (`File → Open File`, or drag
it into a tab). It's a static page — no server required.

## Switching from mock to the real Render Vault API

Everything routes through `api/config.js`:

```js
export const CONFIG = {
  MOCK_MODE: true,              // set to false when Render is ready
  API_BASE_URL: "http://localhost:3000",
  API_KEY: ""                   // only if the backend requires one
};
```

Set `MOCK_MODE: false` and point `API_BASE_URL` at the deployed Render
service. If the backend's actual JSON response shape differs from the
`POST /tokens` contract in the PRD, the only file that needs edits is
`api/real-vault-api.js` — the mapping happens in one place
(`generateToken()`), and the popup UI never touches raw fetch responses.

Render integration itself is out of scope for this MVP — this extension
ships in mock mode only for now.

## Mock mode

`MockVaultApi` (`api/mock-vault-api.js`) generates a fake but
realistically-shaped token entirely in the browser, with no network call.
Each call also appends a masked record — token id, vendor, domain, masked
token, status, timestamp — to an in-memory `ledger` array, standing in for
the real exposure ledger Base44/Render will eventually own. It resets
every time the service worker restarts (nothing is persisted to disk),
and it never stores the raw token, only the same masked form the popup
displays.

To inspect it during a demo: `chrome://extensions` → Perimeter → click
"service worker" to open its console → run
`chrome.runtime.sendMessage({type: "GET_LEDGER"}, console.log)`.

## The 60-second demo

1. Open `demo/checkout.html`
2. Click into the **Card Number** field
3. Click the Perimeter extension icon → popup shows
   `demo-store... [Generate Perimeter Token]` (domain will read as
   `checkout.html`'s origin — for a real domain, serve the page instead
   of opening it as a local file, or just narrate over it)
4. Click **Generate Perimeter Token** → spinner → `✓ Site Protected`
   with a masked token
5. Click **Fill Payment Field** → the card number field fills with the
   token
6. (Optional) Click **Complete Purchase** on the demo page to show the
   simulated transaction result
7. Say the line: *"The merchant never received the user's real payment
   credential. It received a token scoped specifically to this vendor,
   and that exposure is now recorded."*

## Notes on the domain / local file caveat

`file://` URLs don't have a normal hostname, so if you open
`checkout.html` directly from disk, the popup will show something like
`checkout.html` rather than a clean domain. For a polished demo, serve
the demo folder instead, e.g.:

```bash
npx serve demo
# or
python3 -m http.server 5500 --directory demo
```

then open `http://localhost:5500/checkout.html` — the popup will show
`localhost` as the domain, which reads much better on stage than a file
path.

## Error states covered

- No active tab / can't identify the site
- Restricted pages (`chrome://`, extension pages, Web Store)
- Vault API unavailable
- Token generation failed
- No focused input when clicking "Fill Payment Field"
- Unsupported input type

## Limitations

- Mock mode only — no live connection to the Render Vault API yet
- Ledger is in-memory and per-session; it resets when the service worker
  restarts and isn't visible to the Base44 dashboard
- No automatic payment-field detection on arbitrary sites — the user must
  focus the field first, by design (see PRD §5)
- `file://` checkout pages show an odd "domain" (no real hostname) — serve
  the demo page over `http://localhost` for a cleaner demo, see below
- Popup state (protected/unprotected) resets each time you close and
  reopen the popup — there's no per-tab session persistence in this MVP

## Security disclaimer

This is a hackathon prototype using simulated payment tokens. It does not
issue real payment cards, does not integrate with any bank or card
network, and does not provide production-grade payment security. The
mock token values (`perim_demo_...`) are not usable for real payments.
