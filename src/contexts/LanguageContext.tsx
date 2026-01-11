
import React, { createContext, useContext, useState, ReactNode } from 'react';

export type Language = 'en' | 'fr' | 'es';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  en: {
    sending: 'Sending',
    receiving: 'Receiving',
    update: 'Update',
    providers: 'Providers',
    todays_rates: "Today's rates",
    transfer_method: 'Transfer Method',
    unavailable: 'Unavailable',
    best_rate: 'Best Rate',
    scanning: 'Scanning Providers',
    connecting: 'Connecting to provider networks for',
    checking: 'Checking',
    disclaimer_title: 'Disclaimer',
    disclaimer_text: 'Rates shown are regular rates applicable to {{highlight}}. They could be different for cash withdrawals or other payment methods. Providers may offer promotional exchange rates or apply additional transfer fees.',
    bank_deposits_highlight: 'bank deposits',
    got_it: 'Got it',
    copyright: 'Taieb El Amri. All rights reserved.',
    error_fetch: 'Unable to retrieve live rates at the moment. Please try again.',
    CAD: 'Canadian Dollar',
    USD: 'US Dollar',
    EUR: 'Euro',
    TND: 'Tunisian Dinar',
    MAD: 'Moroccan Dirham',
    INR: 'Indian Rupee',
    MXN: 'Mexican Peso',
    TRY: 'Turkish Lira',
    COP: 'Colombian Peso',
    cash_withdrawal: 'Cash withdrawal',
    bank_deposit: 'Bank deposit',
    settings: 'Settings',
    payment_method: 'Payment Method',
    language: 'Language',
    done: 'Done'
  },
  fr: {
    sending: 'Envoi',
    receiving: 'Réception',
    update: 'Actualiser',
    providers: 'Fournisseurs',
    todays_rates: "Taux d'aujourd'hui",
    transfer_method: 'Méthode de transfert',
    unavailable: 'Indisponible',
    best_rate: 'Meilleur Taux',
    scanning: 'Analyse en cours',
    connecting: 'Connexion aux réseaux pour',
    checking: 'Vérification',
    disclaimer_title: 'Avertissement',
    disclaimer_text: 'Les taux affichés sont les taux réguliers applicables aux {{highlight}}. Ils pourraient être différents pour les retraits d\'espèces ou d\'autres modes de paiement. Les fournisseurs peuvent proposer des taux de change promotionnels ou appliquer des frais de transfert supplémentaires.',
    bank_deposits_highlight: 'dépôts bancaires',
    got_it: 'Compris',
    copyright: 'Taieb El Amri. Tous droits réservés.',
    error_fetch: 'Impossible de récupérer les taux en direct pour le moment. Veuillez réessayer.',
    CAD: 'Dollar Canadien',
    USD: 'Dollar Américain',
    EUR: 'Euro',
    TND: 'Dinar Tunisien',
    MAD: 'Dirham Marocain',
    INR: 'Roupie Indienne',
    MXN: 'Peso Mexicain',
    TRY: 'Livre Turque',
    COP: 'Peso Colombien',
    cash_withdrawal: 'Retrait d\'espèces',
    bank_deposit: 'Dépôt bancaire',
    settings: 'Paramètres',
    payment_method: 'Mode de paiement',
    language: 'Langue',
    done: 'Terminé'
  },
  es: {
    sending: 'Envío',
    receiving: 'Recepción',
    update: 'Actualizar',
    providers: 'Proveedores',
    todays_rates: "Tasas de hoy",
    transfer_method: 'Método de transferencia',
    unavailable: 'No disponible',
    best_rate: 'Mejor Tasa',
    scanning: 'Escaneando proveedores',
    connecting: 'Conectando a redes para',
    checking: 'Verificando',
    disclaimer_title: 'Aviso legal',
    disclaimer_text: 'Las tasas mostradas son tasas regulares aplicables a {{highlight}}. Podrían ser diferentes para retiros de efectivo u otros métodos de pago. Los proveedores pueden ofrecer tipos de cambio promocionales o aplicar tarifas de transferencia adicionales.',
    bank_deposits_highlight: 'depósitos bancarios',
    got_it: 'Entendido',
    copyright: 'Taieb El Amri. Todos los derechos reservados.',
    error_fetch: 'No se pueden recuperar las tasas en vivo en este momento. Inténtelo de nuevo.',
    CAD: 'Dólar Canadiense',
    USD: 'Dólar Estadounidense',
    EUR: 'Euro',
    TND: 'Dinar Tunecino',
    MAD: 'Dírham Marroquí',
    INR: 'Rupia India',
    MXN: 'Peso Mexicano',
    TRY: 'Lira Turca',
    COP: 'Peso Colombiano',
    cash_withdrawal: 'Retiro de efectivo',
    bank_deposit: 'Depósito bancario',
    settings: 'Ajustes',
    payment_method: 'Método de pago',
    language: 'Idioma',
    done: 'Hecho'
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en');

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};