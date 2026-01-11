
import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Controls from './components/Controls';
import RateCard from './components/RateCard';
import ScanningScreen from './components/ScanningScreen';
import { SendCurrency, ReceiveCurrency, ExchangeRate } from './types';
import { fetchExchangeRates } from './services/geminiService';
import { useLanguage } from './contexts/LanguageContext';

const App: React.FC = () => {
  const [sourceCurrency, setSourceCurrency] = useState<SendCurrency>(SendCurrency.CAD);
  const [targetCurrency, setTargetCurrency] = useState<ReceiveCurrency>(ReceiveCurrency.TND);
  const amount = 1; 
  
  const [rates, setRates] = useState<ExchangeRate[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState<boolean>(false);
  
  const [showInfoModal, setShowInfoModal] = useState<boolean>(true);
  const { t } = useLanguage();

  const handleRefresh = async () => {
    setIsLoading(true);
    setError(null);
    setRates([]); 
    
    try {
      const result = await fetchExchangeRates(sourceCurrency, targetCurrency, amount);
      
      const sortedRates = result.rates.sort((a, b) => {
        const rateA = a.rate;
        const rateB = b.rate;
        if (rateA !== null && rateB !== null) return rateB - rateA;
        if (rateA !== null) return -1;
        if (rateB !== null) return 1;
        return 0;
      });

      setRates(sortedRates);
      setHasSearched(true);
    } catch (err) {
      setError(t('error_fetch'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    handleRefresh();
  }, [sourceCurrency, targetCurrency]);

  const renderDisclaimerText = () => {
    const text = t('disclaimer_text');
    const highlight = t('bank_deposits_highlight');
    const parts = text.split('{{highlight}}');
    
    return (
      <>
        {parts.map((part, index) => (
          <React.Fragment key={index}>
            {part}
            {index < parts.length - 1 && (
              <span className="font-bold text-brand-500">{highlight}</span>
            )}
          </React.Fragment>
        ))}
      </>
    );
  };

  return (
    <div className="h-[100dvh] flex flex-col bg-brand-50 pt-8 overflow-hidden">
      <Header />
      
      <main className="flex-1 w-full overflow-y-auto relative overscroll-contain">
        <Controls
          source={sourceCurrency}
          setSource={setSourceCurrency}
          target={targetCurrency}
          setTarget={setTargetCurrency}
          onRefresh={handleRefresh}
          isLoading={isLoading}
        />

        <div className="max-w-2xl mx-auto px-4 py-6 space-y-6 pb-24 safe-area-bottom">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm text-center">
              {error}
            </div>
          )}

          {isLoading ? (
            <ScanningScreen source={sourceCurrency} target={targetCurrency} />
          ) : (
            <div className="space-y-3">
              {hasSearched && rates.length > 0 && (
                 <div className="flex items-center justify-between gap-2 px-1 pb-2 animate-in fade-in slide-in-from-bottom-2 duration-500">
                    <span className="text-[10px] sm:text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('providers')}</span>
                    <div className="flex items-center justify-center gap-2">
                      <span className="text-xs sm:text-sm font-medium text-gray-400 whitespace-nowrap">{t('todays_rates')}</span>
                      <button 
                        onClick={() => setShowInfoModal(true)}
                        className="text-brand-500 hover:text-brand-600 transition-colors p-0.5"
                        aria-label="Information"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 sm:w-6 sm:h-6">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                 </div>
              )}

              {rates.map((rate, index) => (
                <div key={rate.providerName} className="animate-in fade-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: `${index * 50}ms` }}>
                  <RateCard
                    rateData={rate}
                    sendCurrency={sourceCurrency}
                    receiveCurrency={targetCurrency}
                    isBest={index === 0 && rate.rate !== null}
                  />
                </div>
              ))}
            </div>
          )}
          
          <footer className="w-full text-center py-6 text-gray-400 text-xs">
            <p>&copy; {new Date().getFullYear()} {t('copyright')}</p>
          </footer>
        </div>
      </main>

      {/* Info Modal */}
      {showInfoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden transform scale-100 transition-all">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4 text-brand-600">
                <div className="bg-brand-50 p-2 rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-gray-900">{t('disclaimer_title')}</h3>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">
                {renderDisclaimerText()}
              </p>
            </div>
            <div className="bg-gray-50 px-6 py-4 flex justify-end">
              <button 
                onClick={() => setShowInfoModal(false)}
                className="bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
              >
                {t('got_it')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
