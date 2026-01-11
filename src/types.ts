
export enum SendCurrency {
  CAD = 'CAD',
  USD = 'USD',
  EUR = 'EUR'
}

export enum ReceiveCurrency {
  TND = 'TND',
  MAD = 'MAD',
  MXN = 'MXN',
  INR = 'INR',
  TRY = 'TRY',
  COP = 'COP'
}

export interface ExchangeRate {
  providerName: string;
  rate: number | null;
  logo: string;
  sourceUrl?: string;
  error?: string;
}

export interface SearchResult {
  rates: ExchangeRate[];
  sources: string[];
}
