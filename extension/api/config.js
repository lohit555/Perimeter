// Central configuration for the Perimeter extension.
//
// There is no bundler/build step in this MVP (see README for why), so this
// file plays the role that a .env / VITE_API_BASE_URL would play in the
// Vite version of this project. When the Render Vault API is ready, flip
// MOCK_MODE to false and set API_BASE_URL — nothing else needs to change.

export const CONFIG = {
  // true  -> use MockVaultApi (fully offline, no backend needed)
  // false -> use RealVaultApi (calls API_BASE_URL)
  MOCK_MODE: true,

  // Replace with the deployed Render Vault API, e.g.
  // "https://perimeter-vault.onrender.com"
  API_BASE_URL: "http://localhost:3000",

  // If the backend requires a bearer token for the hackathon demo, put it
  // here. Never commit a real production secret — this is a demo-only
  // convenience, documented as such in the README.
  API_KEY: ""
};
