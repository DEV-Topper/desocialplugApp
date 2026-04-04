import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Currency = 'NGN' | 'USD';

interface CurrencyContextType {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  usdRate: number;
  formatAmount: (nairaAmount: number) => string;
  convertAmount: (nairaAmount: number) => number;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export const CurrencyProvider = ({ children }: { children: ReactNode }) => {
  const [currency, setCurrencyState] = useState<Currency>('NGN');
  const [usdRate, setUsdRate] = useState(1300); // Fixed rate: $1 = ₦1300

  // Load currency from AsyncStorage on mount
  useEffect(() => {
    const loadCurrency = async () => {
      try {
        const savedCurrency = await AsyncStorage.getItem('app_currency');
        if (savedCurrency === 'NGN' || savedCurrency === 'USD') {
          setCurrencyState(savedCurrency as Currency);
        }
      } catch (error) {
        console.error('Failed to load currency', error);
      }
    };
    loadCurrency();

    // Rate is fixed at $1 = ₦1300 — no live fetch needed
  }, []);

  const setCurrency = async (newCurrency: Currency) => {
    setCurrencyState(newCurrency);
    try {
      await AsyncStorage.setItem('app_currency', newCurrency);
    } catch (error) {
      console.error('Failed to save currency', error);
    }
  };

  const convertAmount = (nairaAmount: number): number => {
    if (currency === 'NGN') return nairaAmount;
    return nairaAmount / usdRate;
  };

  const formatAmount = (nairaAmount: number): string => {
    const amount = convertAmount(nairaAmount);
    if (currency === 'NGN') {
      return `₦${amount.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
    }
    return `$${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, usdRate, formatAmount, convertAmount }}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};
