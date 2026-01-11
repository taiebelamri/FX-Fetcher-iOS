
import React from 'react';
import { ExchangeRate, SendCurrency, ReceiveCurrency } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

interface RateCardProps {
  rateData: ExchangeRate;
  sendCurrency: SendCurrency;
  receiveCurrency: ReceiveCurrency;
  isBest?: boolean;
}

const PROVIDER_APP_IDS: Record<string, { android: string, ios: string }> = {
  "Remitly": { android: "com.remitly.androidapp", ios: "id674258465" },
  "SendWave": { android: "com.mychime.waveremit.app", ios: "id846717081" },
  "TapTap Send": { android: "com.taptapsend", ios: "id1435198428" },
  "Xe": { android: "com.xe.currency", ios: "id315241195" },
  "Ria Money Transfer": { android: "com.ria.moneytransfer", ios: "id704301633" },
  "Paysend": { android: "com.paysend.app", ios: "id1140130413" },
  "MoneyGram": { android: "com.mgi.moneygram", ios: "id1085720801" },
  "Western Union": { android: "com.westernunion.moneytransferr3app.ca", ios: "id1110191056" },
  "Wise": { android: "com.transferwise.android", ios: "id612261027" },
  "World Remit": { android: "com.worldremit.android", ios: "id875855935" },
  "Lemfi": { android: "com.lemonadeFinance.android", ios: "id1533066809" },
  "TransferGo": { android: "com.transfergo.android", ios: "id1110641576" },
  "Profee": { android: "com.profee.wallet", ios: "id1521832875" },
  "MyEasyTransfer": { android: "com.myeasytransfert", ios: "id1572782943" }
};

const RateCard: React.FC<RateCardProps> = ({ 
  rateData, 
  sendCurrency, 
  receiveCurrency, 
  isBest = false 
}) => {
  const { t } = useLanguage();
  const rateVal = rateData.rate;
  const hasRate = rateVal !== null && rateVal > 0;
  
  const showBest = isBest && hasRate;

  const handleAppClick = () => {
    const appIds = PROVIDER_APP_IDS[rateData.providerName];
    if (!appIds) {
      console.warn(`No app store IDs found for ${rateData.providerName}`);
      return;
    }

    const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
    const isIOS = /iPad|iPhone|iPod/.test(userAgent) && !(window as any).MSStream;

    const url = isIOS 
      ? `https://apps.apple.com/app/${appIds.ios}`
      : `https://play.google.com/store/apps/details?id=${appIds.android}`;
      
    window.open(url, '_blank');
  };

  return (
    <div className={`relative bg-white rounded-xl shadow-sm border transition-all duration-200 overflow-hidden ${showBest ? 'border-brand-500 ring-1 ring-brand-500 shadow-md' : 'border-gray-200 hover:border-gray-300'}`}>
      {showBest && (
        <div className="absolute top-0 right-0 bg-brand-500 text-white text-[10px] uppercase font-bold px-2 py-0.5 rounded-bl-lg z-10">
          {t('best_rate')}
        </div>
      )}
      
      <div className="p-4 flex items-center gap-3">
        {/* Logo */}
        <div className={`w-12 h-12 flex-shrink-0 bg-white rounded-full border p-1 flex items-center justify-center overflow-hidden shadow-sm ${showBest ? 'border-brand-100' : 'border-gray-100'}`}>
          <img 
            src={rateData.logo} 
            alt={rateData.providerName} 
            className={`w-full h-full object-contain ${!hasRate ? 'opacity-50 grayscale' : ''}`}
            onError={(e) => {
              (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(rateData.providerName)}&background=f3f4f6&color=4b5563`;
            }}
          />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h3 className={`text-sm font-semibold truncate ${hasRate ? 'text-gray-900' : 'text-gray-500'}`}>
            {rateData.providerName}
          </h3>
          <p className="text-xs text-gray-400">{t('bank_deposit')}</p>
        </div>

        {/* Rate & Button Section */}
        {hasRate ? (
            <div className="flex items-center gap-3 pl-2">
                <div className="text-right mr-2">
                    <div className="text-2xl font-bold text-gray-900 tracking-tight leading-none">
                        {rateVal?.toFixed(4)}
                    </div>
                    <div className="text-[10px] text-gray-400 font-medium mt-1 whitespace-nowrap mr-1">
                        1 {sendCurrency} = {rateVal?.toFixed(4)} {receiveCurrency}
                    </div>
                </div>
                <button 
                    className="flex-shrink-0 w-10 h-10 flex items-center justify-center bg-brand-500 text-white rounded-full hover:bg-brand-600 active:scale-95 transition-all shadow-sm" 
                    onClick={handleAppClick}
                    aria-label={`Get ${rateData.providerName} App`}
                    title={`Get ${rateData.providerName} App`}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M12 3v13.5M8.25 12.75 12 16.5l3.75-3.75" />
                    </svg>
                </button>
            </div>
        ) : (
            <div className="text-lg font-medium text-gray-400 italic">
              {t('unavailable')}
            </div>
        )}
      </div>
    </div>
  );
};

export default RateCard;