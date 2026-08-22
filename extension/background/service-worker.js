import { getVaultApi } from "../api/vault-api.js";

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message?.type === "GENERATE_TOKEN") {
    const api = getVaultApi();
    api
      .generateToken(message.domain)
      .then((result) => sendResponse({ ok: true, result }))
      .catch((err) => {
        console.error("[Perimeter] token generation failed:", err?.message || err);
        sendResponse({ ok: false, error: err?.message || "TOKEN_GENERATION_FAILED" });
      });
    // Keep the message channel open for the async sendResponse above.
    return true;
  }

  // Debug helper: open chrome://extensions -> Perimeter -> "service worker"
  // to get a console, or call chrome.runtime.sendMessage({type:"GET_LEDGER"})
  // from any extension page. Only present in mock mode.
  if (message?.type === "GET_LEDGER") {
    const api = getVaultApi();
    sendResponse({ ok: true, ledger: typeof api.getLedger === "function" ? api.getLedger() : [] });
    return false;
  }

  return false;
});
