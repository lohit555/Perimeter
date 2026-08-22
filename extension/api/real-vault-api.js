// RealVaultApi
//
// Talks to the live Perimeter Vault API.
//
// Flow:
//   POST /tokens
//       ↓
//   receive token ID
//       ↓
//   GET /tokens/{id}/reveal
//       ↓
//   receive raw token
//       ↓
//   return it to the extension so it can fill the payment field.
//
// The API key is read from chrome.storage.local and is never stored
// in the source code.

import { CONFIG } from "./config.js";

async function getApiKey() {
  const result = await chrome.storage.local.get("perimeterApiKey");
  return result.perimeterApiKey || "";
}

export class RealVaultApi {
  async generateToken(domain) {
    const apiKey = await getApiKey();

    if (!apiKey) {
      throw new Error("API_KEY_MISSING");
    }

    const headers = {
      "Content-Type": "application/json",
      "x-api-key": apiKey
    };

    // Step 1: Issue a vendor-scoped token.
    let response;

    try {
      response = await fetch(`${CONFIG.API_BASE_URL}/tokens`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          vendor_id: CONFIG.VENDOR_ID,
          monthly_limit: CONFIG.MONTHLY_LIMIT,
          recurring: CONFIG.RECURRING
        })
      });
    } catch (err) {
      throw new Error("VAULT_UNAVAILABLE");
    }

    if (!response.ok) {
      throw new Error("TOKEN_GENERATION_FAILED");
    }

    const data = await response.json();

    const tokenId =
      data.id ??
      data.token_id ??
      data.tokenId;

    if (!tokenId) {
      throw new Error("TOKEN_GENERATION_FAILED");
    }

    // Step 2: Reveal the raw token immediately before filling the field.
    let revealResponse;

    try {
      revealResponse = await fetch(
        `${CONFIG.API_BASE_URL}/tokens/${encodeURIComponent(tokenId)}/reveal`,
        {
          method: "GET",
          headers: {
            "x-api-key": apiKey
          }
        }
      );
    } catch (err) {
      throw new Error("VAULT_UNAVAILABLE");
    }

    if (!revealResponse.ok) {
      throw new Error("TOKEN_REVEAL_FAILED");
    }

    const revealData = await revealResponse.json();

    const token =
      revealData.value ??
      revealData.token ??
      revealData.raw_value;

    if (!token) {
      throw new Error("TOKEN_REVEAL_FAILED");
    }

    return {
      success: true,
      token,
      tokenId,
      last4: token.slice(-4),
      domain,
      vendor: "StreamFlix",
      status: "active",
      issuedAt: new Date().toISOString()
    };
  }
}