import { getCanonicalDomain, isRestrictedUrl } from "../utils/domain.js";

const app = document.getElementById("app");

/** @type {{ tabId: number|null, domain: string|null, tokenResult: object|null, tokenVisible: boolean }} */
const state = {
  tabId: null,
  domain: null,
  tokenResult: null,
  tokenVisible: false
};

init();

async function init() {
  let tab;
  try {
    [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  } catch (err) {
    renderFatalError("Unable to identify the current site.");
    return;
  }

  if (!tab) {
    renderFatalError("Unable to identify the current site.");
    return;
  }

  if (isRestrictedUrl(tab.url)) {
    renderFatalError("Perimeter can't run on this page.");
    return;
  }

  const domain = getCanonicalDomain(tab.url);
  if (!domain) {
    renderFatalError("Unable to identify the current site.");
    return;
  }

  state.tabId = tab.id;
  state.domain = domain;
  renderUnprotected();
}

// ---------- Renderers ----------

function renderFatalError(message) {
  app.innerHTML = "";
  app.appendChild(
    el("div", { class: "card" }, [
      row(),
      el("p", { class: "error-banner" }, [text(message)])
    ])
  );
}

function renderUnprotected() {
  app.innerHTML = "";
  app.appendChild(
    frag([
      el("div", { class: "domain-row" }, [
        el("span", { class: "status-dot unprotected" }),
        el("span", { class: "domain" }, [text(state.domain)])
      ]),
      el("p", { class: "copy" }, [
        text("No Perimeter token is currently active for this site. Focus the payment field, then generate a vendor-scoped token.")
      ]),
      el(
        "button",
        { class: "btn btn-primary", onclick: onGenerateClick },
        [text("Generate Perimeter Token")]
      )
    ])
  );
}

function renderGenerating() {
  app.innerHTML = "";
  app.appendChild(
    frag([
      el("div", { class: "domain-row" }, [
        el("span", { class: "status-dot unprotected" }),
        el("span", { class: "domain" }, [text(state.domain)])
      ]),
      el("div", { class: "loading-row" }, [
        el("span", { class: "spinner" }),
        text("Generating secure token...")
      ])
    ])
  );
}

function renderProtected(fillStatusMessage) {
  const result = state.tokenResult;
  const maskedValue = state.tokenVisible
    ? result.token
    : `perim_${"•".repeat(8)}${result.last4 || ""}`;

  app.innerHTML = "";
  app.appendChild(
    frag([
      el("div", { class: "domain-row" }, [
        el("span", { class: "status-dot protected" }),
        el("span", { class: "domain" }, [text(state.domain)])
      ]),
      el("div", { class: "success-row" }, [text("✓ Site Protected")]),
      el("div", { class: "card" }, [
        el("span", { class: "card-label" }, [text("Vendor Token")]),
        el("div", { class: "token-display" }, [
          el("span", { class: "token-value" }, [text(maskedValue)]),
          el(
            "button",
            { class: "link-btn", onclick: onToggleVisibility },
            [text(state.tokenVisible ? "Hide" : "Show token")]
          )
        ])
      ]),
      el(
        "button",
        { class: "btn btn-primary", onclick: onFillClick },
        [text("Fill Payment Field")]
      ),
      el("p", { class: "fill-status" }, [text(fillStatusMessage || "")])
    ])
  );
}

function renderError(message) {
  app.innerHTML = "";
  app.appendChild(
    frag([
      el("div", { class: "domain-row" }, [
        el("span", { class: "status-dot error" }),
        el("span", { class: "domain" }, [text(state.domain || "")])
      ]),
      el("p", { class: "error-banner" }, [text(message)]),
      el(
        "button",
        { class: "btn btn-secondary", onclick: onGenerateClick },
        [text("Try Again")]
      )
    ])
  );
}

// ---------- Handlers ----------

async function onGenerateClick() {
  renderGenerating();

  let response;
  try {
    response = await chrome.runtime.sendMessage({
      type: "GENERATE_TOKEN",
      domain: state.domain
    });
  } catch (err) {
    console.error("[Perimeter] sendMessage failed:", err);
    renderError("Perimeter Vault is temporarily unavailable.");
    return;
  }

  if (!response || !response.ok) {
    const reason = response?.error;
    if (reason === "VAULT_UNAVAILABLE") {
      renderError("Perimeter Vault is temporarily unavailable.");
    } else {
      renderError("We couldn't generate a token. Try again.");
    }
    return;
  }

  state.tokenResult = response.result;
  state.tokenVisible = false;
  renderProtected("");
}

function onToggleVisibility() {
  state.tokenVisible = !state.tokenVisible;
  renderProtected("");
}

async function onFillClick() {
  if (!state.tabId || !state.tokenResult?.token) return;

  let injectionResults;
  try {
    injectionResults = await chrome.scripting.executeScript({
      target: { tabId: state.tabId },
      func: fillFocusedInput,
      args: [state.tokenResult.token]
    });
  } catch (err) {
    console.error("[Perimeter] fill injection failed:", err?.message || err);
    renderProtected("Open a normal webpage and focus the payment field first.");
    return;
  }

  const result = injectionResults?.[0]?.result;
  if (!result || !result.ok) {
    if (result?.reason === "UNSUPPORTED_INPUT_TYPE") {
      renderProtected("That field type isn't supported. Focus the card number field.");
    } else {
      renderProtected("Focus the payment field first, then click Fill.");
    }
    return;
  }

  renderProtected("Payment field filled.");
}

// This function is serialized and injected into the page — it cannot
// close over any variables from popup.js, only the args passed to it.
function fillFocusedInput(token) {
  const el = document.activeElement;
  const supportedTags = ["INPUT", "TEXTAREA"];
  const supportedInputTypes = ["text", "tel", "number", "password"];

  if (!el || !supportedTags.includes(el.tagName)) {
    return { ok: false, reason: "NO_FOCUSED_INPUT" };
  }
  if (el.tagName === "INPUT" && el.type && !supportedInputTypes.includes(el.type)) {
    return { ok: false, reason: "UNSUPPORTED_INPUT_TYPE" };
  }

  const proto = el.tagName === "TEXTAREA" ? window.HTMLTextAreaElement.prototype : window.HTMLInputElement.prototype;
  const nativeSetter = Object.getOwnPropertyDescriptor(proto, "value").set;
  nativeSetter.call(el, token);

  el.dispatchEvent(new Event("input", { bubbles: true }));
  el.dispatchEvent(new Event("change", { bubbles: true }));

  return { ok: true };
}

// ---------- Tiny DOM helpers (no framework, no build step) ----------

function el(tag, attrs = {}, children = []) {
  const node = document.createElement(tag);
  for (const [key, value] of Object.entries(attrs)) {
    if (key.startsWith("on") && typeof value === "function") {
      node.addEventListener(key.slice(2), value);
    } else {
      node.setAttribute(key, value);
    }
  }
  for (const child of children) {
    node.appendChild(child);
  }
  return node;
}

function text(value) {
  return document.createTextNode(value);
}

function frag(children) {
  const f = document.createDocumentFragment();
  children.forEach((c) => f.appendChild(c));
  return f;
}

function row() {
  return el("div", { class: "domain-row" }, [
    el("span", { class: "status-dot error" }),
    el("span", { class: "domain" }, [text("")])
  ]);
}
