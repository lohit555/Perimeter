export type TokenStatus = 'Active' | 'Paused' | 'Revoked'
export type RiskLevel = 'Low' | 'Medium' | 'High'

export interface Card {
  id: string
  label: string
  network: 'Visa' | 'Mastercard' | 'Amex'
  last4: string
  /* muted brand tone — used for the card chip, never as a glow */
  tone: string
}

export interface Merchant {
  id: string
  /* funding card this token is issued against */
  cardId: string
  name: string
  domain: string
  logoColor: string
  initials: string
  maskedToken: string
  status: TokenStatus
  risk: RiskLevel
  recurring: boolean
  monthlyLimit: number
  spent: number
  lastUsed: string
}

export interface ActivityEvent {
  id: string
  type: 'rotation' | 'blocked' | 'revoked' | 'issued' | 'limit'
  merchant: string
  detail: string
  time: string
}

export const cards: Card[] = [
  { id: 'c1', label: 'TD Cash-Back', network: 'Visa', last4: '1234', tone: '#1F6F52' },
  { id: 'c2', label: 'Chase Sapphire', network: 'Visa', last4: '8842', tone: '#1E3A5F' },
  { id: 'c3', label: 'Amex Gold', network: 'Amex', last4: '3007', tone: '#7A5C1E' },
]

export const fundingSource = {
  label: 'Chase •••• 8842',
  balance: 4820.55,
}

export function cardById(id: string): Card | undefined {
  return cards.find((c) => c.id === id)
}

export const merchants: Merchant[] = [
  {
    id: 'm1',
    cardId: 'c1',
    name: 'StreamFlix',
    domain: 'streamflix.com',
    logoColor: '#E11D48',
    initials: 'SF',
    maskedToken: '•••• •••• •••• 1234',
    status: 'Active',
    risk: 'Low',
    recurring: true,
    monthlyLimit: 25,
    spent: 15.99,
    lastUsed: '2 min ago',
  },
  {
    id: 'm2',
    cardId: 'c2',
    name: 'Amazon',
    domain: 'amazon.com',
    logoColor: '#FF9900',
    initials: 'AZ',
    maskedToken: '•••• •••• •••• 4821',
    status: 'Active',
    risk: 'Medium',
    recurring: false,
    monthlyLimit: 500,
    spent: 312.4,
    lastUsed: '1 hr ago',
  },
  {
    id: 'm3',
    cardId: 'c1',
    name: 'Uber',
    domain: 'uber.com',
    logoColor: '#0F172A',
    initials: 'UB',
    maskedToken: '•••• •••• •••• 7766',
    status: 'Active',
    risk: 'High',
    recurring: false,
    monthlyLimit: 200,
    spent: 184.2,
    lastUsed: '4 hr ago',
  },
  {
    id: 'm4',
    cardId: 'c1',
    name: 'Spotify',
    domain: 'spotify.com',
    logoColor: '#1DB954',
    initials: 'SP',
    maskedToken: '•••• •••• •••• 3301',
    status: 'Active',
    risk: 'Low',
    recurring: true,
    monthlyLimit: 12,
    spent: 9.99,
    lastUsed: 'Today',
  },
  {
    id: 'm5',
    cardId: 'c3',
    name: 'CloudStore',
    domain: 'cloudstore.io',
    logoColor: '#2563EB',
    initials: 'CS',
    maskedToken: '•••• •••• •••• 9055',
    status: 'Paused',
    risk: 'Medium',
    recurring: true,
    monthlyLimit: 100,
    spent: 0,
    lastUsed: '3 days ago',
  },
  {
    id: 'm6',
    cardId: 'c2',
    name: 'ShadyDeals',
    domain: 'shadydeals.tv',
    logoColor: '#7C3AED',
    initials: 'SD',
    maskedToken: '•••• •••• •••• 1100',
    status: 'Revoked',
    risk: 'High',
    recurring: false,
    monthlyLimit: 50,
    spent: 50,
    lastUsed: '6 days ago',
  },
]

export const activity: ActivityEvent[] = [
  {
    id: 'a1',
    type: 'blocked',
    merchant: 'ShadyDeals',
    detail: 'Blocked unauthorized charge attempt — $89.99',
    time: '6 min ago',
  },
  {
    id: 'a2',
    type: 'revoked',
    merchant: 'ShadyDeals',
    detail: 'Token revoked after breach match',
    time: '12 min ago',
  },
  {
    id: 'a3',
    type: 'issued',
    merchant: 'StreamFlix',
    detail: 'Replacement token issued',
    time: '18 min ago',
  },
  {
    id: 'a4',
    type: 'rotation',
    merchant: 'Uber',
    detail: 'Scheduled card rotation completed',
    time: '1 hr ago',
  },
  {
    id: 'a5',
    type: 'limit',
    merchant: 'Amazon',
    detail: 'Monthly spend limit reached — 62% of $500',
    time: '3 hr ago',
  },
  {
    id: 'a6',
    type: 'blocked',
    merchant: 'CloudStore',
    detail: 'Blocked charge from unknown merchant domain',
    time: '5 hr ago',
  },
]

export const containmentSteps = [
  { id: 1, label: 'Breach Detected', detail: 'Merchant reported a data exposure on Aug 22.', done: true },
  { id: 2, label: 'Token Matched', detail: 'Linked token •••• 1100 to the exposed merchant.', done: true },
  { id: 3, label: 'Token Revoked', detail: 'Token permanently revoked — no further charges possible.', done: true },
  { id: 4, label: 'Replacement Issued', detail: 'New isolated token •••• 7790 generated.', done: true },
  { id: 5, label: 'User Notified', detail: 'Email + push notification sent to account owner.', done: false },
]

export const protectedMerchants = ['Uber', 'Spotify', 'StreamFlix', 'Amazon', 'CloudStore']

export interface Transaction {
  id: string
  merchant: string
  domain: string
  initials: string
  logoColor: string
  maskedToken: string
  amount: number
  state: 'Clear' | 'Auto-rotated' | 'Flagged'
  time: string
}

export const transactions: Transaction[] = [
  {
    id: 't1',
    merchant: 'StreamFlix',
    domain: 'streamflix.com',
    initials: 'SF',
    logoColor: '#E11D48',
    maskedToken: '•••• 1234',
    amount: 15.99,
    state: 'Clear',
    time: '2h ago',
  },
  {
    id: 't2',
    merchant: 'CloudStore',
    domain: 'cloudstore.io',
    initials: 'CS',
    logoColor: '#2563EB',
    maskedToken: '•••• 9055',
    amount: 58.2,
    state: 'Auto-rotated',
    time: '5h ago',
  },
  {
    id: 't3',
    merchant: 'Unknown source',
    domain: 'quick-pay-checkout.net',
    initials: '?',
    logoColor: '#94A3B8',
    maskedToken: '•••• 1100',
    amount: 212.0,
    state: 'Flagged',
    time: '1d ago',
  },
  {
    id: 't4',
    merchant: 'Uber',
    domain: 'uber.com',
    initials: 'UB',
    logoColor: '#0F172A',
    maskedToken: '•••• 7766',
    amount: 42.0,
    state: 'Clear',
    time: '2d ago',
  },
  {
    id: 't5',
    merchant: 'Spotify',
    domain: 'spotify.com',
    initials: 'SP',
    logoColor: '#1DB954',
    maskedToken: '•••• 3301',
    amount: 9.99,
    state: 'Clear',
    time: '3d ago',
  },
]
