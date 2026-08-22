// Central configuration for the Perimeter extension.
//
// There is no bundler/build step in this MVP (see README for why), so this
// file plays the role that a .env / VITE_API_BASE_URL would play in the
// Vite version of this project. When the Render Vault API is ready, flip
// MOCK_MODE to false and set API_BASE_URL — nothing else needs to change.

export const CONFIG = {
  // Use the real Render Vault API.
  MOCK_MODE: false,

  // Live Perimeter Vault API.
  API_BASE_URL: "https://perimeter-vault-api.onrender.com",

  // The StreamFlix vendor used for the live integration test.
  VENDOR_ID: "907cc000-dd4a-463e-a456-457975e87ab1",

  // Token settings for the hackathon demo.
  MONTHLY_LIMIT: 25,
  RECURRING: true,

  // Leave empty unless the backend team confirms authentication is required.
  API_KEY: ""
};
