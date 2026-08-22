import { useEffect, useState } from 'react'

/**
 * Tokens issued by the Chrome extension.
 *
 * The extension can't write into this app's memory, so its content script
 * (extension/content/dashboard-bridge.js) mirrors the ledger into
 * localStorage and fires `perimeter:tokens-updated`. We read that key on
 * mount and stay subscribed for live updates.
 */

const STORAGE_KEY = 'perimeter.extensionTokens'
const UPDATE_EVENT = 'perimeter:tokens-updated'
const REQUEST_SYNC_EVENT = 'perimeter:request-sync'

export interface ExtensionToken {
  tokenId: string
  vendor: string
  domain: string
  maskedToken: string
  last4: string
  status: 'active' | 'revoked'
  issuedAt: string
  source: 'extension'
}

function read(): ExtensionToken[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

/** True once the bridge has stamped the document — i.e. extension installed. */
export function useExtensionInstalled(): boolean {
  const [installed, setInstalled] = useState(false)
  useEffect(() => {
    const check = () =>
      setInstalled(document.documentElement.hasAttribute('data-perimeter-extension'))
    check()
    // The content script runs at document_idle, which can land after us.
    const observer = new MutationObserver(check)
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-perimeter-extension'],
    })
    return () => observer.disconnect()
  }, [])
  return installed
}

export function useExtensionTokens(): ExtensionToken[] {
  const [tokens, setTokens] = useState<ExtensionToken[]>(read)

  useEffect(() => {
    const onUpdate = () => setTokens(read())

    // Fired by the bridge in this tab.
    window.addEventListener(UPDATE_EVENT, onUpdate)
    // Fired by the browser when another tab writes the same key.
    window.addEventListener('storage', onUpdate)

    // Ask the bridge to push current state, in case it loaded before us.
    window.dispatchEvent(new CustomEvent(REQUEST_SYNC_EVENT))

    return () => {
      window.removeEventListener(UPDATE_EVENT, onUpdate)
      window.removeEventListener('storage', onUpdate)
    }
  }, [])

  return tokens
}
