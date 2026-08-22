// MockVaultApi
//
// Simulates the Render Vault API so the extension can be developed and
// demoed with zero backend dependency. Shape matches RealVaultApi so the
// popup never needs to know which one it's talking to.

function randomDigits(n) {
  let out = "";
  for (let i = 0; i < n; i++) out += Math.floor(Math.random() * 10);
  return out;
}

function vendorNameFromDomain(domain) {
  const base = domain.split(".")[0] || domain;
  return base.charAt(0).toUpperCase() + base.slice(1);
}

// In-memory exposure ledger. This is NOT persisted (no chrome.storage, no
// disk) — it only exists to stand in for the real Vault/Base44 ledger
// during a mock-mode demo, e.g. via getLedger() in the console. Never
// holds the full raw token, only the same masked shape the popup shows.
const ledger = [];

export class MockVaultApi {
  async generateToken(domain) {
    // Small artificial delay so the "Generating..." state is visible in the demo.
    await new Promise((resolve) => setTimeout(resolve, 650));

    const suffix = randomDigits(4);
    const tokenId = `tok_${randomDigits(4)}`;

    const result = {
      success: true,
      token: `perim_demo_${randomDigits(12)}`,
      tokenId,
      last4: suffix,
      domain,
      vendor: {
        id: `vendor_${randomDigits(3)}`,
        name: vendorNameFromDomain(domain),
        domain
      },
      status: "active",
      issuedAt: new Date().toISOString()
    };

    ledger.push({
      tokenId: result.tokenId,
      vendor: result.vendor.name,
      domain: result.domain,
      maskedToken: `perim_••••${result.last4}`,
      status: result.status,
      issuedAt: result.issuedAt
    });
    // Masked only — see note above on why the full token never lands here.
    console.log(`[Perimeter mock ledger] issued ${tokenId} for ${domain}`);

    return result;
  }

  // Demo/debug helper — inspect via the service worker console
  // (chrome://extensions → Perimeter → "service worker" → console:
  //  import('./api/mock-vault-api.js').then(m => console.table(...))
  // or simpler, just call this from any code that already imports MockVaultApi).
  getLedger() {
    return [...ledger];
  }
}
