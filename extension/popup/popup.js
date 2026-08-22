import { getCanonicalDomain, isFileUrl, isRestrictedUrl } from "../utils/domain.js";

const app = document.getElementById("app");
const ledgerCountEl = document.getElementById("ledger-count");
const openDashboardEl = document.getElementById("open-dashboard");

/** Where the web dashboard runs. First one that responds wins. */
const DASHBOARD_URLS = ["http://localhost:5173/tokens", "http://127.0.0.1:5173/tokens"];

const state = {
  tabId: null,
  domain: null,
  tokenResult: null,
  tokenVisible: false,
  busy: false
};

init();
refreshLedgerCount();

openDashboardEl.addEventListener("click", (e) => {
  e.preventDefault();
  chrome.tabs.create({ url: DASHBOARD_URLS[0] });
});

async function init() {
  let tab;
  try {
    [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  } catch {
    return renderFatalError("Unable to identify the current site.");
  }

  if (!tab) return renderFatalError("Unable to identify the current site.");

  if (isFileUrl(tab.url)) {
    return renderFatalError(
      "This page is opened from disk (file://). Chrome blocks extensions here unless you enable “Allow access to file URLs” on the Perimeter details page — or run “npm run demo” and use the http://localhost version."
    );
  }

  if (isRestrictedUrl(tab.url)) {
    return renderFatalError("Perimeter can't run on this page. Open a normal website and try again.");
  }

  const domain = getCanonicalDomain(tab.url);
  if (!domain) return renderFatalError("Unable to identify the current site.");

  state.tabId = tab.id;
  state.domain = domain;

  // A token may already exist for this site from an earlier popup session —
  // the MVP forgot everything on close, which read as "it isn't working".
  const existing = await findExistingToken(domain);
  if (existing) {
    state.tokenResult = existing;
    renderProtected("Token already issued for this site.");
  } else {
    renderUnprotected();
  }
}

async function findExistingToken(domain) {
  try {
    const res = await chrome.runtime.sendMessage({ type: "GET_LEDGER" });
    const hit = (res?.ledger || []).find(
      (t) => t.domain === domain && t.status === "active"
    );
    // Only the masked form is persisted, so a restored session can show the
    // token but can't re-fill it — the raw value never leaves the session.
    return hit ? { ...hit, token: null, restored: true } : null;
  } catch {
    return null;
  }
}

async function refreshLedgerCount() {
  try {
    const res = await chrome.runtime.sendMessage({ type: "GET_LEDGER" });
    const n = res?.ledger?.length || 0;
    ledgerCountEl.textContent = n === 1 ? "1 token issued" : `${n} tokens issued`;
  } catch {
    ledgerCountEl.textContent = "";
  }
}

// ---------- Renderers ----------

function siteRow(status) {
  return el("div", { class: "domain-row" }, [
    el("span", { class: `status-dot ${status}` }),
    el("span", { class: "domain" }, [text(state.domain || "unknown site")]),
    el("span", { class: "domain-tag" }, [
      text(status === "protected" ? "Protected" : status === "error" ? "Error" : "Exposed")
    ])
  ]);
}

function renderFatalError(message) {
  app.innerHTML = "";
  app.appendChild(frag([el("p", { class: "error-banner" }, [text(message)])]));
}

function renderUnprotected() {
  app.innerHTML = "";
  app.appendChild(
    frag([
      siteRow("unprotected"),
      el("h1", { class: "headline" }, [
        text("This site sees "),
        el("span", { class: "accent" }, [text("your real card")])
      ]),
      el("p", { class: "copy" }, [
        text("Issue a token scoped to this vendor only. If they're breached, nothing else is reachable.")
      ]),
      el("button", { class: "btn btn-primary", onclick: onGenerateClick }, [
        text("Generate Perimeter token")
      ])
    ])
  );
}

function renderGenerating() {
  app.innerHTML = "";
  app.appendChild(
    frag([
      siteRow("unprotected"),
      el("div", { class: "loading-row" }, [
        el("span", { class: "spinner" }),
        text("Issuing a vendor-scoped token…")
      ])
    ])
  );
}

function renderProtected(fillStatusMessage, statusTone) {
  const result = state.tokenResult;
  const masked = `perim_••••${result.last4 || ""}`;
  const shown = state.tokenVisible && result.token ? result.token : masked;
  const canFill = Boolean(result.token);

  app.innerHTML = "";
  app.appendChild(
    frag([
      siteRow("protected"),
      el("div", { class: "success-row" }, [text("✓ Site protected")]),

      el("div", { class: "card" }, [
        el("span", { class: "card-label" }, [text("Vendor token")]),
        el("div", { class: "token-display" }, [
          el("span", { class: "token-value" }, [text(shown)]),
          result.token
            ? el("button", { class: "link-btn", onclick: onToggleVisibility }, [
                text(state.tokenVisible ? "Hide" : "Show")
              ])
            : el("span", { class: "meta-key" }, [text("masked")])
        ]),
        el("div", { class: "token-meta" }, [
          el("div", { class: "meta-item" }, [
            el("span", { class: "meta-key" }, [text("Vendor")]),
            el("span", { class: "meta-val" }, [text(result.vendor?.name || result.vendor || state.domain)])
          ]),
          el("div", { class: "meta-item" }, [
            el("span", { class: "meta-key" }, [text("Scope")]),
            el("span", { class: "meta-val" }, [text("This site only")])
          ])
        ])
      ]),

      canFill
        ? el("div", { class: "btn-row" }, [
            el("button", { class: "btn btn-primary", onclick: onFillClick }, [
              text("Fill payment field")
            ]),
            el("button", { class: "btn btn-secondary", onclick: onCopyClick }, [text("Copy")])
          ])
        : el("button", { class: "btn btn-secondary", onclick: onGenerateClick }, [
            text("Issue a new token")
          ]),

      el(
        "p",
        { class: `fill-status${statusTone ? " " + statusTone : ""}` },
        [text(fillStatusMessage || "")]
      )
    ])
  );
}

function renderError(message) {
  app.innerHTML = "";
  app.appendChild(
    frag([
      siteRow("error"),
      el("p", { class: "error-banner" }, [text(message)]),
      el("button", { class: "btn btn-secondary", onclick: onGenerateClick }, [text("Try again")])
    ])
  );
}

// ---------- Handlers ----------

async function onGenerateClick() {
  if (state.busy) return;
  state.busy = true;
  renderGenerating();

  let response;
  try {
    response = await chrome.runtime.sendMessage({
      type: "GENERATE_TOKEN",
      domain: state.domain
    });
  } catch (err) {
    state.busy = false;
    console.error("[Perimeter] sendMessage failed:", err);
    return renderError("Perimeter Vault is temporarily unavailable.");
  }

  state.busy = false;

  if (!response?.ok) {
    return renderError(
      response?.error === "VAULT_UNAVAILABLE"
        ? "Perimeter Vault is temporarily unavailable."
        : "We couldn't generate a token. Try again."
    );
  }

  state.tokenResult = response.result;
  state.tokenVisible = false;
  refreshLedgerCount();
  renderProtected("Ready to fill. This token is saved to your dashboard.", "ok");
}

function onToggleVisibility() {
  state.tokenVisible = !state.tokenVisible;
  renderProtected("");
}

async function onCopyClick() {
  try {
    await navigator.clipboard.writeText(state.tokenResult.token);
    renderProtected("Token copied to clipboard.", "ok");
  } catch {
    renderProtected("Couldn't copy — use Show and copy manually.", "warn");
  }
}

/**
 * Two-pass fill.
 *
 * Pass 1 probes every frame in the tab and scores its inputs; pass 2 fills
 * only the frame that scored highest. This replaces the MVP's
 * document.activeElement approach, which could never work: opening the
 * popup moves focus away from the page, so by the time the injected code
 * ran, activeElement was <body> and the fill always reported
 * "focus the payment field first".
 */
async function onFillClick() {
  if (!state.tabId || !state.tokenResult?.token) return;

  let probes;
  try {
    probes = await chrome.scripting.executeScript({
      target: { tabId: state.tabId, allFrames: true },
      func: cardFieldAgent,
      args: [null]
    });
  } catch (err) {
    console.error("[Perimeter] probe failed:", err?.message || err);
    return renderProtected(
      "Can't reach this page. Reload it, then try again.",
      "warn"
    );
  }

  const best = (probes || [])
    .filter((p) => p?.result?.ok)
    .sort((a, b) => b.result.score - a.result.score)[0];

  if (!best) {
    return renderProtected(
      "No card field found. Click into the card number box, then Fill.",
      "warn"
    );
  }

  let filled;
  try {
    filled = await chrome.scripting.executeScript({
      target: { tabId: state.tabId, frameIds: [best.frameId] },
      func: cardFieldAgent,
      args: [state.tokenResult.token]
    });
  } catch (err) {
    console.error("[Perimeter] fill failed:", err?.message || err);
    return renderProtected("Couldn't fill that field. Try copying instead.", "warn");
  }

  const outcome = filled?.[0]?.result;
  if (outcome?.filled) {
    renderProtected(`Filled "${outcome.label}".`, "ok");
  } else {
    renderProtected("Couldn't fill that field. Try copying instead.", "warn");
  }
}

/**
 * Runs inside the page (serialized — no closures over popup scope).
 *
 * token === null  -> probe only, return the best candidate's score
 * token === string -> fill the best candidate
 */
function cardFieldAgent(token) {
  const NEGATIVE =
    /(cvv|cvc|csc|security.?code|expir|exp[-_ ]?(date|month|year|mm|yy)|^mm$|^yy$|name|holder|email|phone|zip|postal|address|city|state|country|coupon|promo|discount|search|quantity|qty|password|username)/i;
  const POSITIVE = /(card|cc|pan|credit|debit)[-_ ]?(number|num|no)?/i;
  const EXACT = /^(cc-?number|card-?number|card_number|creditcardnumber|cardnum)$/i;

  function isVisible(node) {
    const style = window.getComputedStyle(node);
    if (style.visibility === "hidden" || style.display === "none" || style.opacity === "0") {
      return false;
    }
    const rect = node.getBoundingClientRect();
    return rect.width > 40 && rect.height > 8;
  }

  function describe(node) {
    const parts = [
      node.name,
      node.id,
      node.placeholder,
      node.getAttribute("aria-label"),
      node.getAttribute("autocomplete"),
      node.getAttribute("data-testid"),
      node.className
    ].filter(Boolean);
    if (node.labels) {
      for (const label of node.labels) parts.push(label.textContent || "");
    }
    const wrapping = node.closest("label");
    if (wrapping) parts.push(wrapping.textContent || "");
    return parts.join(" ");
  }

  function scoreOf(node) {
    if (node.disabled || node.readOnly) return -1;
    const type = (node.getAttribute("type") || "text").toLowerCase();
    if (!["text", "tel", "number", "password", ""].includes(type)) return -1;
    if (!isVisible(node)) return -1;

    const autocomplete = (node.getAttribute("autocomplete") || "").toLowerCase();
    const haystack = describe(node);

    // Reject sibling fields (cvv, expiry, name) unless autocomplete is explicit.
    if (NEGATIVE.test(haystack) && !autocomplete.includes("cc-number")) return -1;

    let score = 0;
    if (autocomplete.includes("cc-number")) score += 100;
    if (EXACT.test(node.name || "") || EXACT.test(node.id || "")) score += 60;
    if (POSITIVE.test(haystack)) score += 40;
    if ((node.getAttribute("inputmode") || "").toLowerCase() === "numeric") score += 15;
    if (type === "tel" || type === "text") score += 8;

    const maxLength = parseInt(node.getAttribute("maxlength") || "0", 10);
    if (maxLength >= 12 && maxLength <= 25) score += 12;

    // An explicitly focused field is the user telling us where to put it.
    if (node === document.activeElement) score += 200;

    return score;
  }

  const candidates = Array.from(document.querySelectorAll("input, textarea"));
  let best = null;
  let bestScore = 0;

  for (const node of candidates) {
    const score = scoreOf(node);
    if (score > bestScore) {
      bestScore = score;
      best = node;
    }
  }

  if (!best) return { ok: false, score: 0, reason: "NO_FIELD" };

  const label = best.name || best.id || best.placeholder || "card field";
  if (token === null) return { ok: true, score: bestScore, label };

  // React and other frameworks track the value via the native setter, so
  // assigning .value directly is silently reverted on the next render.
  const proto =
    best.tagName === "TEXTAREA"
      ? window.HTMLTextAreaElement.prototype
      : window.HTMLInputElement.prototype;
  const nativeSetter = Object.getOwnPropertyDescriptor(proto, "value").set;

  best.focus();
  nativeSetter.call(best, token);
  best.dispatchEvent(new Event("input", { bubbles: true }));
  best.dispatchEvent(new Event("change", { bubbles: true }));
  best.dispatchEvent(new KeyboardEvent("keyup", { bubbles: true }));

  // Stamp the field so the page can tell this value came from Perimeter.
  // Real (live-mode) tokens are plain 16-digit numbers, so a perim_ prefix
  // check can't work — the marker is the ground truth.
  best.dataset.perimeterFilled = "1";

  return { ok: true, score: bestScore, filled: true, label };
}

// ---------- Tiny DOM helpers ----------

function el(tag, attrs = {}, children = []) {
  const node = document.createElement(tag);
  for (const [key, value] of Object.entries(attrs)) {
    if (key.startsWith("on") && typeof value === "function") {
      node.addEventListener(key.slice(2), value);
    } else {
      node.setAttribute(key, value);
    }
  }
  for (const child of children) node.appendChild(child);
  return node;
}

function text(value) {
  return document.createTextNode(String(value));
}

function frag(children) {
  const f = document.createDocumentFragment();
  children.forEach((c) => f.appendChild(c));
  return f;
}
