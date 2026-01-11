
import React, { useEffect, useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

interface ScanningScreenProps {
  source: string;
  target: string;
}

const PROVIDERS = [
  "Remitly", "Western Union", "TapTap Send", "Ria", "Xe", "Paysend"
];

const ScanningScreen: React.FC<ScanningScreenProps> = ({ source, target }) => {
  const [currentProvider, setCurrentProvider] = useState(0);
  const { t } = useLanguage();

  // Cycle through providers to simulate scanning
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentProvider(prev => (prev + 1) % PROVIDERS.length);
    }, 400);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] w-full p-8 animate-in fade-in duration-300">
      <div className="relative mb-8">
        <div className="w-24 h-24 rounded-full border-4 border-gray-100 flex items-center justify-center">
          <div className="w-20 h-20 rounded-full border-4 border-brand-500 border-t-transparent animate-spin"></div>
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
           <svg className="w-8 h-8 text-brand-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
           </svg>
        </div>
      </div>
      
      <h2 className="text-xl font-bold text-gray-800 mb-2">{t('scanning')}</h2>
      <p className="text-sm text-gray-500 mb-6 text-center">
        {t('connecting')} <br/>
        <span className="font-semibold text-gray-700">{source}</span> 💸​ <span className="font-semibold text-gray-700">{target}</span>
      </p>

      <div className="bg-white rounded-lg shadow-sm border border-gray-100 px-6 py-3 flex items-center space-x-3 w-full max-w-xs">
        <div className="w-2 h-2 rounded-full bg-brand-500 animate-pulse"></div>
        <span className="text-sm font-medium text-gray-600 truncate">
          {t('checking')} {PROVIDERS[currentProvider]}...
        </span>
      </div>
    </div>
  );
};

export default ScanningScreen;
