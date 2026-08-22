export interface VendorRead {
  id: string
  name: string
  domain: string
  descriptor: string
  logo_color: string | null
  initials: string | null
  created_at: string
}

export interface VendorCreate {
  name: string
  domain: string
  descriptor: string
  logo_color?: string
  initials?: string
}

export interface TokenCreate {
  vendor_id: string
  monthly_limit: number
  recurring?: boolean
  one_time_use?: boolean
  auto_expiry?: boolean
}

export interface TokenRead {
  id: string
  vendor_id: string
  masked_value: string
  status: string
  recurring: boolean
  monthly_limit: number
  spent: number
  issued_at: string
  last_used_at: string | null
  one_time_use: boolean
  expires_at: string | null
}

export interface TokenListItem {
  id: string
  vendor_id: string
  vendor_name: string
  vendor_domain: string
  masked_value: string
  status: string
  recurring: boolean
  monthly_limit: number
  spent: number
  issued_at: string
  last_used_at: string | null
  one_time_use: boolean
  expires_at: string | null
}

export interface TransactionCreate {
  token_id: string
  amount: number
  source_domain: string
}

export interface TransactionRead {
  id: string
  token_id: string
  amount: number
  source_domain: string
  status: string
  reason: string | null
  created_at: string
}

export interface BreachEventCreate {
  vendor_id: string
  description: string
  auto_rotate?: boolean
}

export interface BreachEventRead {
  id: string
  vendor_id: string
  description: string
  detected_at: string
  resolved: boolean
  resolved_at: string | null
}

export interface Rotation {
  old_token_id: string
  new_token_id: string
}

export interface BreachEventResponse {
  breach_event: BreachEventRead
  rotations: Rotation[]
}

export interface LedgerMerchant {
  id: string
  name: string
  domain: string
  logo_color: string | null
  initials: string | null
  masked_token: string
  status: string
  risk: string
  recurring: boolean
  monthly_limit: number
  spent: number
  last_used_at: string | null
}

export interface LedgerActivityEvent {
  id: string
  type: string
  merchant: string
  detail: string
  time: string
}

export interface LedgerResponse {
  merchants: LedgerMerchant[]
  activity: LedgerActivityEvent[]
}

export interface AuditEventCreate {
  breach_event_id?: string
  label: string
  detail: string
  done?: boolean
}

export interface AuditEventRead {
  id: string
  breach_event_id: string | null
  label: string
  detail: string
  done: boolean
  created_at: string
}

export interface EmergencyLockResponse {
  locked_count: number
  token_ids: string[]
}

export interface EmergencyResumeResponse {
  resumed_count: number
  token_ids: string[]
}

const API_BASE_URL =
  import.meta.env.VITE_VAULT_API_URL || 'https://perimeter-vault-api.onrender.com'
const API_KEY = import.meta.env.VITE_VAULT_API_KEY || ''

async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL.replace(/\/$/, '')}${path}`
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  }

  if (API_KEY) {
    headers['X-API-Key'] = API_KEY
  }

  const res = await fetch(url, {
    ...options,
    headers,
  })

  if (!res.ok) {
    const errorText = await res.text().catch(() => res.statusText)
    throw new Error(`API Error ${res.status}: ${errorText}`)
  }

  return res.json()
}

export const vaultApi = {
  getLedger: (vendorId?: string, status?: string): Promise<LedgerResponse> => {
    const params = new URLSearchParams()
    if (vendorId) params.append('vendor_id', vendorId)
    if (status) params.append('status', status)
    const query = params.toString() ? `?${params.toString()}` : ''
    return apiFetch<LedgerResponse>(`/ledger${query}`)
  },

  getTokens: (domain?: string, status?: string): Promise<TokenListItem[]> => {
    const params = new URLSearchParams()
    if (domain) params.append('domain', domain)
    if (status) params.append('status', status)
    const query = params.toString() ? `?${params.toString()}` : ''
    return apiFetch<TokenListItem[]>(`/tokens${query}`)
  },

  createToken: (payload: TokenCreate): Promise<TokenRead> => {
    return apiFetch<TokenRead>('/tokens', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },

  revokeToken: (tokenId: string): Promise<TokenRead> => {
    return apiFetch<TokenRead>(`/tokens/${tokenId}/revoke`, {
      method: 'POST',
      body: JSON.stringify({}),
    })
  },

  createTransaction: (payload: TransactionCreate): Promise<TransactionRead> => {
    return apiFetch<TransactionRead>('/transactions', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },

  createBreachEvent: (payload: BreachEventCreate): Promise<BreachEventResponse> => {
    return apiFetch<BreachEventResponse>('/breach-events', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },

  getAuditEvents: (breachEventId?: string): Promise<AuditEventRead[]> => {
    const query = breachEventId ? `?breach_event_id=${breachEventId}` : ''
    return apiFetch<AuditEventRead[]>(`/audit-events${query}`)
  },

  createVendor: (payload: VendorCreate): Promise<VendorRead> => {
    return apiFetch<VendorRead>('/vendors', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },

  async createVendorAndToken(params: {
    merchant: string
    domain: string
    monthlyLimit: number
    recurring?: boolean
    oneTimeUse?: boolean
    autoExpiry?: boolean
  }): Promise<TokenRead> {
    const cleanDomain = params.domain.toLowerCase().trim().replace(/^https?:\/\//, '')
    let vendorId: string | null = null

    // Try creating vendor first
    try {
      const vendor = await this.createVendor({
        name: params.merchant || cleanDomain,
        domain: cleanDomain,
        descriptor: cleanDomain,
        logo_color: '#0D9488',
        initials: (params.merchant.slice(0, 2) || cleanDomain.slice(0, 2)).toUpperCase(),
      })
      vendorId = vendor.id
    } catch {
      // If vendor domain already exists or creation failed, look up existing ledger/tokens
      try {
        const ledger = await this.getLedger()
        const existing = ledger.merchants.find(
          (m) => m.domain.toLowerCase() === cleanDomain || m.name.toLowerCase() === params.merchant.toLowerCase()
        )
        if (existing) {
          // Note: ledger merchant id is token id, but let's check tokens list for vendor_id
          const tokens = await this.getTokens()
          const matchedToken = tokens.find((t) => t.vendor_domain.toLowerCase() === cleanDomain)
          if (matchedToken) {
            vendorId = matchedToken.vendor_id
          }
        }
      } catch (err) {
        console.error('Failed to resolve vendor ID:', err)
      }
    }

    if (!vendorId) {
      // Fallback default vendor ID if server has pre-seeded vendor or fallback
      vendorId = '907cc000-dd4a-463e-a456-457975e87ab1'
    }

    return this.createToken({
      vendor_id: vendorId,
      monthly_limit: params.monthlyLimit,
      recurring: params.recurring ?? true,
      one_time_use: params.oneTimeUse ?? false,
      auto_expiry: params.autoExpiry ?? false,
    })
  },

  emergencyLock: (): Promise<EmergencyLockResponse> => {
    return apiFetch<EmergencyLockResponse>('/emergency-lock', {
      method: 'POST',
      body: JSON.stringify({}),
    })
  },

  emergencyLockResume: (): Promise<EmergencyResumeResponse> => {
    return apiFetch<EmergencyResumeResponse>('/emergency-lock/resume', {
      method: 'POST',
      body: JSON.stringify({}),
    })
  },
}
