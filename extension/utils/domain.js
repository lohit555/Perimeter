// getCanonicalDomain("https://www.example.com/checkout/payment?x=1#y")
//   -> "example.com"

export function getCanonicalDomain(url) {
  if (!url) return null;
  try {
    const { hostname } = new URL(url);
    return hostname.startsWith("www.") ? hostname.slice(4) : hostname;
  } catch (err) {
    return null;
  }
}

// Returns true for pages the extension cannot / should not run on
// (chrome://, the Chrome Web Store, other extension pages, etc).
export function isRestrictedUrl(url) {
  if (!url) return true;
  return (
    url.startsWith("chrome://") ||
    url.startsWith("chrome-extension://") ||
    url.startsWith("edge://") ||
    url.startsWith("about:") ||
    url.startsWith("https://chrome.google.com/webstore") ||
    url.startsWith("https://chromewebstore.google.com")
  );
}
