// Single entry point for the rest of the extension. Nobody outside this
// file should import MockVaultApi / RealVaultApi directly.

import { CONFIG } from "./config.js";
import { MockVaultApi } from "./mock-vault-api.js";
import { RealVaultApi } from "./real-vault-api.js";

let instance = null;

export function getVaultApi() {
  if (!instance) {
    instance = CONFIG.MOCK_MODE ? new MockVaultApi() : new RealVaultApi();
  }
  return instance;
}
