
import React from 'react';
import { SendCurrency, ReceiveCurrency } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

interface ControlsProps {
  source: SendCurrency;
  setSource: (val: SendCurrency) => void;
  target: ReceiveCurrency;
  setTarget: (val: ReceiveCurrency) => void;
  onRefresh: () => void;
  isLoading: boolean;
}

const FLAG_URLS: Record<string, string> = {
  CAD: 'https://flagcdn.com/w160/ca.png',
  USD: 'https://flagcdn.com/w160/us.png',
  EUR: 'https://flagcdn.com/w160/eu.png',
  TND: 'https://flagcdn.com/w160/tn.png',
  MAD: 'https://flagcdn.com/w160/ma.png',
  MXN: 'https://flagcdn.com/w160/mx.png',
  INR: 'https://flagcdn.com/w160/in.png',
  TRY: 'https://flagcdn.com/w160/tr.png',
  COP: 'https://flagcdn.com/w160/co.png',
};

const Controls: React.FC<ControlsProps> = ({
  source,
  setSource,
  target,
  setTarget,
  onRefresh,
  isLoading
}) => {
  const { t } = useLanguage();

  return (
    // MODIFICATION: Changed to sticky top-0 to stick within the scrollable main container
    <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-200">
      <div className="max-w-2xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          
          {/* Sending Currency */}
          <div className="flex flex-col items-center">
            <span className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold mb-1">
              {t('sending')}
            </span>
            <div className="relative group cursor-pointer transition-transform active:scale-95">
              <div className="w-14 h-14 rounded-full border-2 border-white shadow-md ring-1 ring-gray-200 overflow-hidden relative z-0">
                 <img 
                   src={FLAG_URLS[source]} 
                   alt={source} 
                   className="w-full h-full object-cover"
                 />
              </div>
              <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow-sm border border-gray-100 z-10 pointer-events-none">
                 <svg className="w-3 h-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" />
                 </svg>
              </div>
              
              <select
                value={source}
                onChange={(e) => setSource(e.target.value as SendCurrency)}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20 appearance-none"
                aria-label="Select Sending Currency"
              >
                {Object.values(SendCurrency).map((curr) => (
                  <option key={curr} value={curr}>
                     {curr} - {t(curr)}
                  </option>
                ))}
              </select>
            </div>
            <span className="text-xs font-bold text-gray-700 mt-1">{source}</span>
          </div>

          {/* Arrow */}
          <div className="flex-1 flex justify-center pb-4 text-gray-500">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </div>

          {/* Receiving Currency */}
          <div className="flex flex-col items-center">
            <span className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold mb-1">
              {t('receiving')}
            </span>
            <div className="relative group cursor-pointer transition-transform active:scale-95">
              <div className="w-14 h-14 rounded-full border-2 border-white shadow-md ring-1 ring-gray-200 overflow-hidden relative z-0">
                 <img 
                   src={FLAG_URLS[target]} 
                   alt={target} 
                   className="w-full h-full object-cover"
                 />
              </div>
              <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow-sm border border-gray-100 z-10 pointer-events-none">
                 <svg className="w-3 h-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" />
                 </svg>
              </div>

              <select
                value={target}
                onChange={(e) => setTarget(e.target.value as ReceiveCurrency)}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20 appearance-none"
                 aria-label="Select Receiving Currency"
              >
                {Object.values(ReceiveCurrency).map((curr) => (
                  <option key={curr} value={curr}>
                     {curr} - {t(curr)}
                  </option>
                ))}
              </select>
            </div>
            <span className="text-xs font-bold text-gray-700 mt-1">{target}</span>
          </div>

          {/* Divider */}
          <div className="h-10 w-px bg-gray-200 mx-2"></div>

          {/* Refresh Button */}
          <div className="flex flex-col items-center justify-center pt-4">
             <button
              onClick={onRefresh}
              disabled={isLoading}
              className="bg-brand-500 hover:bg-brand-600 active:bg-brand-800 text-white p-3 rounded-xl shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-95"
              aria-label="Refresh Rates"
            >
              {isLoading ? (
                <svg className="animate-spin h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              )}
            </button>
            <span className="text-[10px] font-medium text-gray-400 mt-2">{t('update')}</span>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Controls;
