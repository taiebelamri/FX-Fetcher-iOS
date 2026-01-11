
import { SendCurrency, ReceiveCurrency, SearchResult, ExchangeRate } from '../types';
//import { ApolloClient, InMemoryCache, gql } from "@apollo/client";


// --- Helper Maps & Config ---

const PROXY_BASE = "https://corsproxy.io/?";

// 2. Define the mutation using gql
const CREATE_CALCULATION_MUTATION = `
  mutation createCalculation($amount: BigDecimal!, $type: CalculationType!, $sendCountryCode: CountryCode!, $sendCurrencyCode: CurrencyCode!, $receiveCountryCode: CountryCode!, $receiveCurrencyCode: CurrencyCode!, $payOutMethodCode: String, $correspondentId: String) {\n  createCalculation(\n    calculationInput: {amount: $amount, send: {country: $sendCountryCode, currency: $sendCurrencyCode}, type: $type, receive: {country: $receiveCountryCode, currency: $receiveCurrencyCode}, payOutMethodCode: $payOutMethodCode, correspondentId: $correspondentId}\n  ) {\n    calculation {\n      id\n      isFree\n      informativeSummary {\n        fee {\n          value {\n            amount\n            currency\n            __typename\n          }\n          type\n          __typename\n        }\n        discount {\n          value {\n            amount\n            currency\n            __typename\n          }\n          type\n          __typename\n        }\n        appliedPromotions\n        totalToPay {\n          amount\n          __typename\n        }\n        __typename\n      }\n      payInMethodsCalculations {\n        totalToPay {\n          amount\n          currency\n          __typename\n        }\n        payInMethod {\n          name\n          transferRedirectionType\n          id\n          icon {\n            resolutions\n            __typename\n          }\n          transferRedirectionType\n          __typename\n        }\n        __typename\n      }\n      send {\n        currency\n        amount\n        __typename\n      }\n      receive {\n        amount\n        currency\n        __typename\n      }\n      rounding {\n        sendRoundingSeed\n        receiveRoundingSeed\n        __typename\n      }\n      exchangeRate {\n        value\n        crossedOutValue\n        __typename\n      }\n      __typename\n    }\n    errors {\n      ...GenericCalculationError\n      ...ValidationCalculationError\n      __typename\n    }\n    __typename\n  }\n}\n\nfragment GenericCalculationError on GenericCalculationError {\n  __typename\n  message\n  genericType: type\n}\n\nfragment ValidationCalculationError on ValidationCalculationError {\n  __typename\n  message\n  type\n  code\n  description\n}
`;


const COUNTRY_MAP: Record<string, string> = {
  CAD: 'CA', USD: 'US', EUR: 'FR',
  TND: 'TN', MAD: 'MA', INR: 'IN',
  MXN: 'MX', TRY: 'TR', COP: 'CO'
};

const COUNTRY_ISO3_MAP: Record<string, string> = {
  CAD: 'CAN', USD: 'USA', EUR: 'FRA',
  TND: 'TUN', MAD: 'MAR', INR: 'IND',
  MXN: 'MEX', TRY: 'TUR', COP: 'COL'
};

const COUNTRY_ISO2_MAP: Record<string, string> = {
  CAD: 'CA', USD: 'US', EUR: 'FR',
  TND: 'TN', MAD: 'MA', INR: 'IN',
  MXN: 'MX', TRY: 'TR', COP: 'CO'
};

const COUNTRY_SLUG_MAP: Record<string, string> = {
  CAD: 'canada', USD: 'usa', EUR: 'france',
  TND: 'tunisia', MAD: 'morocco', INR: 'india',
  MXN: 'mexico', TRY: 'turkey', COP: 'colombia'
};

const COUNTRY_NUMERIC_MAP: Record<string, number> = {
  CAD: 124, // Canada
  USD: 840, // USA
  EUR: 250, // France
  TND: 788, // Tunisia
  MAD: 504, // Morocco
  INR: 356,  // India
  MXN: 484, // Mexico
  TRY: 792, // Turkey
  COP: 170 // Colombia
};

const PROVIDER_DOMAINS: Record<string, string> = {
  "Remitly": "remitly.com",
  "SendWave": "sendwave.com",
  "TapTap Send": "taptapsend.com",
  "Xe": "xe.com",
  "Ria Money Transfer": "riamoneytransfer.com",
  "Paysend": "paysend.com",
  "MoneyGram": "moneygram.com",
  "Western Union": "westernunion.com",
  "Wise": "wise.com",
  "World Remit": "worldremit.com",
  "Lemfi": "lemfi.com",
  "TransferGo": "transfergo.com",
  "Profee": "profee.com",
  "MyEasyTransfer": "myeasytransfer.com"
};

const LOGO_OVERRIDES: Record<string, string> = {
  "MyEasyTransfer": "https://www.myeasytransfer.com/favicon.ico"
};

const getLogoUrl = (providerName: string): string => {
  if (LOGO_OVERRIDES[providerName]) {
    return LOGO_OVERRIDES[providerName];
  }
  const domain = PROVIDER_DOMAINS[providerName];
  if (domain) {
    // Use unavatar.io which aggregates multiple sources (Clearbit, Google, DuckDuckGo)
    // It's more reliable than calling clearbit directly.
    return `https://unavatar.io/${domain}`;
  }
  // Fallback to initials if no domain mapping exists
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(providerName)}&background=random`;
};

const fetchWithProxy = async (url: string, options: RequestInit = {}): Promise<Response> => {
  const proxyUrl = `${PROXY_BASE}${encodeURIComponent(url)}`;
  return fetch(proxyUrl, options);
};

// Ensure value is a valid number and return NUMBER
const parseRate = (val: any): number | null => {
  if (val === null || val === undefined) return null;
  const strVal = String(val).replace(/,/g, '').trim();
  const num = parseFloat(strVal);
  return isNaN(num) || num <= 0 ? null : num;
};


// --- Direct API Implementations (Matching Python Script Logic) ---

const fetchRemitly = async (source: SendCurrency, target: ReceiveCurrency): Promise<number | null> => {
  // Python: params: {"conduit": "CAN:CAD-TUN:TND", "anchor": "SEND", "amount": "1"}
  try {
    const anchorCountry = COUNTRY_ISO3_MAP[source] || 'CAN';
    const destCountry = COUNTRY_ISO3_MAP[target] || 'TUN';
    const conduit = `${anchorCountry}:${source}-${destCountry}:${target}`;
    
    const url = `https://api.remitly.io/v3/calculator/estimate?conduit=${conduit}&anchor=SEND&amount=1`;
    
    const response = await fetchWithProxy(url, { method: 'GET' });
    if (!response.ok) return null;
    const data = await response.json();
    // jsonpath: $.estimate.exchange_rate.base_rate
    return parseRate(data?.estimate?.exchange_rate?.base_rate);
  } catch (e) {
    return null;
  }
};

const fetchSendWave = async (source: SendCurrency, target: ReceiveCurrency): Promise<number | null> => {
  // Python: params: {"amountType": "SEND", "receiveCurrency": "TND", "amount": "1", ...}
  try {
    const sendCountry = (COUNTRY_MAP[source] || 'CA').toLowerCase();
    const receiveCountry = (COUNTRY_MAP[target] || 'TN').toLowerCase();
    
    const params = new URLSearchParams({
      amountType: "SEND",
      receiveCurrency: target,
      amount: "1",
      sendCurrency: source,
      sendCountryIso2: sendCountry,
      receiveCountryIso2: receiveCountry
    });

    const url = `https://app.sendwave.com/v2/pricing-public?${params.toString()}`;
    
    const response = await fetchWithProxy(url, { method: 'GET' });
    if (!response.ok) return null;
    const data = await response.json();
    // jsonpath: $.effectiveExchangeRate
    return parseRate(data?.effectiveExchangeRate);
  } catch (e) {
    return null;
  }
};

const fetchTapTap = async (source: SendCurrency, target: ReceiveCurrency): Promise<number | null> => {
  // Python: headers: appian-version, x-device-id...
  try {
    const response = await fetchWithProxy("https://api.taptapsend.com/api/fxRates", {
      method: 'GET',
      headers: {
        "appian-version": "web/2022-05-03.0",
        "x-device-id": "web",
        "x-device-model": "web"
      }
    });
    if (!response.ok) return null;
    const data = await response.json();
    
    // jsonpath logic: find country == source, then corridor == target
    const sourceCountry = data.availableCountries?.find((c: any) => c.currency === source);
    if (sourceCountry && sourceCountry.corridors) {
      const corridor = sourceCountry.corridors.find((c: any) => c.currency === target);
      if (corridor) {
        return parseRate(corridor.fxRate);
      }
    }
    return null;
  } catch (e) {
    return null;
  }
};

const fetchXe = async (source: SendCurrency, target: ReceiveCurrency): Promise<number | null> => {
  try {
    const url = `https://launchpad-api.xe.com/v2/quotes`;

    const payload = {
      sellCcy: source,
      buyCcy: target,
      userCountry: COUNTRY_MAP[source],
      amount: 10000,
      fixedCcy: source,
      countryTo: COUNTRY_MAP[target],
    };

    const response = await fetchWithProxy(url, {
      method: "POST",
      headers: {
        "Authorization": "Basic bG9kZXN0YXI6cHVnc25heA==",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) return null;

    const data = await response.json();

    return parseRate(data?.quote?.individualQuotes?.[0]?.rate);
  } catch (e) {
    console.error("fetchXe error:", e);
    return null;
  }
};

const fetchRia = async (source: SendCurrency, target: ReceiveCurrency, amount: number): Promise<number | null> => {
  try {
    const url = "https://public.riamoneytransfer.com/MoneyTransferCalculator/Calculate";
    const calcAmount = amount === 1 ? 100 : amount;
    
    let selections: any = {
        countryTo: COUNTRY_MAP[target] || 'TN',
        amountFrom: calcAmount,
        currencyFrom: source,
        currencyTo: target,
        paymentMethod: "DebitCard",
        deliveryMethod: "BankDeposit",
        shouldCalcAmountFrom: false,
        shouldCalcVariableRates: true,
        promoId: 0,
        countryFrom: COUNTRY_MAP[source] || 'CA'
    };

    if (source === SendCurrency.USD) {
      selections.countryFrom = "US";
      selections.stateFrom = "NY"; 
      selections.zipCodeFrom = "10001";
      selections.paymentMethod = "DebitCard";
    }

    const body = { selections };

    const response = await fetchWithProxy(url, {
      method: 'POST',
      headers: {
        "Accept": "*/*",
        "Accept-Encoding": "gzip, deflate, br, zstd",
        "AppType": "2",
        "AppVersion": "4.0",
        "Client-Type": "PublicSite",
        "Connection": "keep-alive",
        "Content-Type": "application/json",
        "Host": "public.riamoneytransfer.com", 
        "Origin": "https://www.riamoneytransfer.com",
        "Referer": "https://www.riamoneytransfer.com/",
        "Sec-Fetch-Dest": "empty",
        "Sec-Fetch-Mode": "cors",
        "Sec-Fetch-Site": "same-site",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36",
        "sec-ch-ua": '"Chromium";v="142", "Google Chrome";v="142", "Not_A Brand";v="99"',
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": '"Windows"'
      },
      body: JSON.stringify(body)
    });
    
    if (!response.ok) return null;
    const data = await response.json();
    return parseRate(data?.model?.transferDetails?.calculations?.exchangeRate);
  } catch (e) {
    return null;
  }
};

const fetchPaysend = async (source: SendCurrency, target: ReceiveCurrency): Promise<number | null> => {
  // Python: url: .../send-money/from-canada-to-tunisia
  try {
    // Paysend does not support USD -> TND, and USD -> EGP seems unavailable via this endpoint
    if (source === SendCurrency.USD && (target === ReceiveCurrency.TND)) {
      return null;
    }

    let fromSlug = COUNTRY_SLUG_MAP[source] || 'canada';
    if (source === SendCurrency.USD) {
       fromSlug = 'the-united-states-of-america';
    }

    const toSlug = COUNTRY_SLUG_MAP[target] || 'tunisia';
    const urlPart = `from-${fromSlug}-to-${toSlug}`;
    
    const url = `https://paysend.com/api/en-ca/send-money/${urlPart}`;
    const params = new URLSearchParams({
      isFrom: "true",
      fromCurrency: source === SendCurrency.USD ? "840" : source, // Use 840 for USD
      toCurrency: target
    });
    
    const response = await fetchWithProxy(`${url}?${params.toString()}`, { method: 'POST' });
    if (!response.ok) return null;
    const data = await response.json();
    // jsonpath: $.commission.convertRate
    return parseRate(data?.commission?.convertRate);
  } catch (e) {
    return null;
  }
};

// --- New Providers ---

const fetchWise = async (source: SendCurrency, target: ReceiveCurrency): Promise<number | null> => {
  try {
    const sourceCountry = COUNTRY_ISO2_MAP[source] || 'CA';
    const params = new URLSearchParams({
      sendAmount: "100",
      sourceCurrency: source,
      targetCurrency: target,
      sourceCountry: sourceCountry,
      payInMethod: "BANK_TRANSFER"
    });

    const url = `https://wise.com/gateway/v4/comparisons?${params.toString()}`;
    const response = await fetchWithProxy(url);
    if (!response.ok) return null;
    const data = await response.json();
    
    // Dynamic search for Wise provider
    const providers = Array.isArray(data?.providers) ? data.providers : [];
    const wiseProvider = providers.find((p: any) => p.name === "Wise");
    
    if (wiseProvider && Array.isArray(wiseProvider.quotes) && wiseProvider.quotes.length > 0) {
        const receivedAmount = wiseProvider.quotes[0].receivedAmount;
        const val = parseRate(receivedAmount);
        return val ? val / 100 : null;
    }

    return null;
  } catch (e) {
    return null;
  }
};

const fetchWorldRemit = async (source: SendCurrency, target: ReceiveCurrency): Promise<number | null> => {
    try {

  const url = "https://api.worldremit.com/graphql";

  // WorldRemit seems to mix ISO2 for send and ISO3 for receive based on requirements
  const srcCountry = COUNTRY_ISO2_MAP[source] || 'CA';
  const dstCountry = COUNTRY_ISO2_MAP[target] || 'TN';
  const sendAmount = 100;

  let payOutMethodCode = "CSH";
  if (target === ReceiveCurrency.INR) {
    payOutMethodCode = "BNK";
  }		
  const payload = {
    operationName: "createCalculation",
    variables: {
      amount: sendAmount,
      type: "SEND",
	    sendCountryCode: srcCountry,
      sendCurrencyCode: source,
      receiveCountryCode: dstCountry,
      receiveCurrencyCode: target,
      payOutMethodCode: payOutMethodCode,
      correspondentId: ""
    },
    query: CREATE_CALCULATION_MUTATION
  };
  
  const response = await fetchWithProxy(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-WR-PLATFORM": "Web"
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) return null;
  const result = await response.json();

  // Extract the receive amount safely
  const receiveAmount = result?.data?.createCalculation?.calculation?.receive?.amount;
  const val = parseRate(receiveAmount);
  return val ? val / 100 : null;  

    } catch(e) {
        return null;
    }
}

const fetchLemfi = async (source: SendCurrency, target: ReceiveCurrency): Promise<number | null> => {
  try {
    const url = `https://fx-fetcher.onrender.com/lemfi?from_currency=${source}&to_currency=${target}`;
    console.debug(`[LEMFI] Attempting Direct Fetch: ${url}`);
    
    const response = await fetch(url, { method: 'GET' });
    if (!response.ok) {
        console.error(`[LEMFI] Direct fetch failed with status: ${response.status}`);
        return null;
    }
    
    const data = await response.json();
    return parseRate(data["Lemfi"]);
    
  } catch (e) {
    console.error('[LEMFI] Direct fetch failed', e);
    return null;
  }
}

const fetchTransferGo = async (source: SendCurrency, target: ReceiveCurrency): Promise<number | null> => {
    try {
        const fromC = COUNTRY_ISO2_MAP[source] || 'CA';
        const toC = COUNTRY_ISO2_MAP[target] || 'TN';
        
        const params = new URLSearchParams({
            fromCountryCode: fromC,
            toCountryCode: toC,
            fromCurrencyCode: source,
            toCurrencyCode: target,
            amount: "100",
            calculationBase: "sendAmount",
            business: "0"
        });

        const url = `https://my.transfergo.com/api/booking/quotes?${params.toString()}`;
        
        const response = await fetchWithProxy(url);
        if(!response.ok) return null;
        const data = await response.json();
        // Json Path: "$.options[0].rate.value"
        return parseRate(data?.options?.[0]?.rate?.value);
    } catch(e) {
        return null;
    }
}

const fetchProfee = async (source: SendCurrency, target: ReceiveCurrency): Promise<number | null> => {
    try {
        const url = `https://terminal.profee.com/api/v2/transfer/terminal/calculation`;
        
        const sourceCountry = COUNTRY_NUMERIC_MAP[source];
        const targetCountry = COUNTRY_NUMERIC_MAP[target];
        
        if (!sourceCountry || !targetCountry) return null;

        const body = {
            from: {
                currency: source,
                amount: 100,
                country: sourceCountry
            },
            to: {
                currency: target,
                amount: null,
                country: targetCountry
            },
            skipLimitValidation: true
        };
        
        const response = await fetchWithProxy(url, {
             method: 'POST',
             headers: { 'Content-Type': 'application/json' },
             body: JSON.stringify(body)
        });
        
        if(!response.ok) return null;
        const data = await response.json();
        // Check multiple common paths since API structure can vary
        return parseRate(data?.payload?.rate) || parseRate(data?.data?.rate) || parseRate(data?.body?.currencyRate?.rate);
    } catch(e) {
        return null;
    }
}

// --- In-App WebView Simulation (Scraping via Proxy + DOMParser) ---

const fetchMoneyGramExtraction = async (source: SendCurrency, target: ReceiveCurrency): Promise<number | null> => {

  try {
    const url = `https://fx-fetcher.onrender.com/moneygram?from_currency=${source}&to_currency=${target}`;
    console.debug(`[MG] Attempting Direct Fetch: ${url}`);
    
    const response = await fetch(url, { method: 'GET' });
    if (!response.ok) {
        console.error(`[MG] Direct fetch failed with status: ${response.status}`);
        return null;
    }
    
    const data = await response.json();
    return parseRate(data["MoneyGram"]);
    
  } catch (e) {
    console.error('[MG] Direct fetch failed', e);
    return null;
  }
};

const fetchWesternUnionExtraction = async (source: SendCurrency, target: ReceiveCurrency): Promise<number | null> => {
  try {
    const url = `https://fx-fetcher.onrender.com/wu?from_currency=${source}&to_currency=${target}`;
    console.debug(`[WU] Attempting Direct Fetch: ${url}`);
    
    const response = await fetch(url, { method: 'GET' });
    if (!response.ok) {
        console.error(`[WU] Direct fetch failed with status: ${response.status}`);
        return null;
    }
    
    const data = await response.json();
    return parseRate(data["Western_Union"]);
    
  } catch (e) {
    console.error('[WU] Direct fetch failed', e);
    return null;
  }
};

const fetchMyEasyTransfer = async (source: SendCurrency, target: ReceiveCurrency): Promise<number | null> => {
  try {
    const url = `https://fx-fetcher.onrender.com/myeasytransfer?from_currency=${source}&to_currency=${target}`;
    console.debug(`[MET] Attempting Direct Fetch: ${url}`);
    
    const response = await fetch(url, { method: 'GET' });
    if (!response.ok) {
        console.error(`[MET] Direct fetch failed with status: ${response.status}`);
        return null;
    }
    
    const data = await response.json();
    return parseRate(data["MyEasyTransfer"]);
    
  } catch (e) {
    console.error('[MET] Direct fetch failed', e);
    return null;
  }
};

// --- Main Service Function ---

export const fetchExchangeRates = async (
  source: SendCurrency, 
  target: ReceiveCurrency,
  amount: number
): Promise<SearchResult> => {
  
  // Fetch all in parallel
  const [
    remitly,
    sendWave,
    tapTap,
    xe,
    ria,
    paysend,
    moneyGram,
    westernUnion,
    wise,
    worldRemit,
    lemfi,
    transferGo,
    profee,
    myEasyTransfer
  ] = await Promise.all([
    fetchRemitly(source, target),
    fetchSendWave(source, target),
    fetchTapTap(source, target),
    fetchXe(source, target),
    fetchRia(source, target, amount),
    fetchPaysend(source, target),
    fetchMoneyGramExtraction(source, target),
    fetchWesternUnionExtraction(source, target),
    fetchWise(source, target),
    fetchWorldRemit(source, target),
    fetchLemfi(source, target),
    fetchTransferGo(source, target),
    fetchProfee(source, target),
    fetchMyEasyTransfer(source, target)
  ]);

  const providerMap: Record<string, number | null> = {
    "Remitly": remitly,
    "SendWave": sendWave,
    "TapTap Send": tapTap,
    "Xe": xe,
    "Ria Money Transfer": ria,
    "Paysend": paysend,
    "MoneyGram": moneyGram,
    "Western Union": westernUnion,
    "Wise": wise,
    "World Remit": worldRemit,
    "Lemfi": lemfi,
    "TransferGo": transferGo,
    "Profee": profee,
    "MyEasyTransfer": myEasyTransfer
  };

  const results: ExchangeRate[] = Object.keys(providerMap).map(name => ({
    providerName: name,
    rate: providerMap[name],
    logo: getLogoUrl(name)
  }));

  const sources = [
    "Direct API feeds", 
    "In-App WebView Extraction (MG)",
    "External Microservice (WU)",
    "External Microservice (MET)"
  ];

  return { rates: results, sources };
};