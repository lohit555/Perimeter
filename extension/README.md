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

### How the fill works

Clicking "Fill payment field" runs a **two-pass injection**:

1. **Probe** — `cardFieldAgent(null)` is injected into *every frame* of the
   tab. Each frame scores its own inputs (autocomplete `cc-number`,
   name/id/placeholder/label matching, `inputmode=numeric`, maxlength,
   with cvv/expiry/name fields actively rejected) and returns the best
   score. Nothing is written.
2. **Fill** — the highest-scoring frame is re-injected, re-runs the same
   scorer, and writes the token into the winning field via the native
   `value` setter, then dispatches `input`/`change`/`keyup` so React and
   other frameworks actually register the value.

**Why not `document.activeElement`?** The MVP asked the user to focus the
card field first, then read `document.activeElement` at fill time. That
can't work: opening the extension popup moves focus off the page, so by
the time the injected code ran, `activeElement` was `<body>` and the fill
always failed with "focus the payment field first". Focus is still used —
a genuinely focused input gets a large scoring bonus — but detection no
longer depends on it.

## Permissions

- `activeTab` — read the current tab's URL when you interact with the
  extension
- `scripting` — inject the field detector/filler into the active tab when
  you click "Fill payment field"
- `storage` — persists the issued-token ledger (masked values only) so it
  survives service-worker restarts and reaches the dashboard
- `tabs` — open the dashboard from the popup footer
- `host_permissions: http://*/*, https://*/*` — **required** to inject
  into cross-origin payment iframes. Most real checkouts (Stripe, Adyen,
  Braintree) render the card field inside an iframe on a different origin;
  `activeTab` alone only covers the top frame, which is why the MVP could
  never fill on a real store.

One content script, scoped to `localhost` / `127.0.0.1` only
(`content/dashboard-bridge.js`) — it mirrors the token ledger into the web
dashboard. It does not run on any other site.

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

From the repo root:

```bash
npm run demo
```

Then open <http://localhost:5500/checkout.html>.

**Don't open `checkout.html` off disk.** Chrome refuses to inject into
`file://` URLs unless you explicitly enable "Allow access to file URLs" on
the extension's details page, and a `file://` URL has no real hostname so
the vendor scope reads as garbage. Serving it over `http://localhost` is
one command and avoids both problems. The popup detects `file://` and
tells you this.

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
- Only the masked token is persisted, so reopening the popup on a site you
  already tokenized shows the token but can't re-fill it — issue a new one
- Payment fields are detected heuristically. It handles standard checkouts
  and same-origin iframes well; a site that renders its card input inside
  a canvas or a shadow root with closed mode won't be reachable
- `file://` pages are blocked by Chrome unless you tick "Allow access to
  file URLs" on the extension's details page — use `npm run demo` instead

## Security disclaimer

This is a hackathon prototype using simulated payment tokens. It does not
issue real payment cards, does not integrate with any bank or card
network, and does not provide production-grade payment security. The
mock token values (`perim_demo_...`) are not usable for real payments.

## Dashboard integration

Every issued token is written to `chrome.storage.local` under
`perimeter.ledger` (masked values only — the raw token is never
persisted).

A web page can't read `chrome.storage`, and the extension can't reach the
React app's memory, so the two are bridged:

```
popup  →  service worker  →  chrome.storage.local["perimeter.ledger"]
                                      │
                     content/dashboard-bridge.js  (localhost only)
                                      │
                    localStorage["perimeter.extensionTokens"]
                          + window event "perimeter:tokens-updated"
                                      │
                   src/state/extensionTokens.ts  →  Tokens page
```

The bridge re-syncs on `chrome.storage.onChanged`, so issuing a token with
the dashboard already open updates it live — no refresh. It also stamps
`data-perimeter-extension="1"` on `<html>` so the dashboard can show a
"connected" state rather than guessing.

To see it: run `npm run dev` (dashboard) and `npm run demo` (store), issue
a token on the demo checkout, then open the dashboard's **Tokens** page.
