// RealVaultApi
//
// Talks to the actual Render Vault API. This is the ONE place that should
// need edits once the backend team finalizes their response schema —
// adjust the fetch call and the mapping in generateToken(), everything
// else in the extension is unaffected.

import { CONFIG } from "./config.js";

export class RealVaultApi {
  async generateToken(domain) {
    const headers = { "Content-Type": "application/json" };
    if (CONFIG.API_KEY) {
      headers["Authorization"] = `Bearer ${CONFIG.API_KEY}`;
    }

    let response;
    try {
      response = await fetch(`${CONFIG.API_BASE_URL}/tokens`, {
        method: "POST",
        headers,
        body: JSON.stringify({ domain })
      });
    } catch (err) {
      throw new Error("VAULT_UNAVAILABLE");
    }

    if (!response.ok) {
      throw new Error("TOKEN_GENERATION_FAILED");
    }

    const data = await response.json();

    // Adjust this mapping if the backend's final response shape differs.
    return {
      success: data.success !== false,
      token: data.token,
      tokenId: data.tokenId,
      last4: data.token ? data.token.slice(-4) : undefined,
      domain: data.domain || domain,
      vendor: data.vendor,
      status: data.status || "active",
      issuedAt: data.issuedAt || new Date().toISOString()
    };
  }
}
