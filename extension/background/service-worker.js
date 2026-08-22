import { getVaultApi } from "../api/vault-api.js";

/**
 * Issued tokens live in chrome.storage.local under this key.
 *
 * The MVP kept them in a module-scope array, which meant they vanished
 * every time the MV3 service worker was torn down (which Chrome does
 * aggressively, after ~30s idle). Persisting here is also what makes the
 * dashboard bridge possible — content/dashboard-bridge.js mirrors this
 * exact list into the web app.
 */
const LEDGER_KEY = "perimeter.ledger";
const MAX_LEDGER = 200;

async function readLedger() {
  const stored = await chrome.storage.local.get(LEDGER_KEY);
  return Array.isArray(stored[LEDGER_KEY]) ? stored[LEDGER_KEY] : [];
}

async function appendToLedger(entry) {
  const ledger = await readLedger();
  ledger.unshift(entry);
  await chrome.storage.local.set({ [LEDGER_KEY]: ledger.slice(0, MAX_LEDGER) });
  return entry;
}

/** Only ever the masked form — the raw token is never persisted. */
function toLedgerEntry(result) {
  return {
    tokenId: result.tokenId,
    vendor: result.vendor?.name || result.domain,
    domain: result.domain,
    maskedToken: `perim_••••${result.last4}`,
    last4: result.last4,
    status: result.status || "active",
    issuedAt: result.issuedAt || new Date().toISOString(),
    source: "extension"
  };
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message?.type === "GENERATE_TOKEN") {
    const api = getVaultApi();
    api
      .generateToken(message.domain)
      .then(async (result) => {
        await appendToLedger(toLedgerEntry(result));
        sendResponse({ ok: true, result });
      })
      .catch((err) => {
        console.error("[Perimeter] token generation failed:", err?.message || err);
        sendResponse({ ok: false, error: err?.message || "TOKEN_GENERATION_FAILED" });
      });
    return true;
  }

  if (message?.type === "GET_LEDGER") {
    readLedger()
      .then((ledger) => sendResponse({ ok: true, ledger }))
      .catch(() => sendResponse({ ok: true, ledger: [] }));
    return true;
  }

  if (message?.type === "REVOKE_TOKEN") {
    readLedger()
      .then(async (ledger) => {
        const next = ledger.map((t) =>
          t.tokenId === message.tokenId ? { ...t, status: "revoked" } : t
        );
        await chrome.storage.local.set({ [LEDGER_KEY]: next });
        sendResponse({ ok: true, ledger: next });
      })
      .catch(() => sendResponse({ ok: false }));
    return true;
  }

  if (message?.type === "CLEAR_LEDGER") {
    chrome.storage.local
      .set({ [LEDGER_KEY]: [] })
      .then(() => sendResponse({ ok: true }))
      .catch(() => sendResponse({ ok: false }));
    return true;
  }

  return false;
});
