"use client";

import React, { createContext, useCallback, useContext, useSyncExternalStore } from 'react';

export type Currency = 'IDR' | 'USD';

type CurrencyContextType = {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  formatPrice: (value: number, baseCurrency: Currency, lang?: string) => string;
  convertPrice: (value: number, baseCurrency: Currency) => number;
};

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

const DEFAULT_CURRENCY: Currency = "IDR";
const EXCHANGE_RATE = 17017; // 1 USD = 17,017 IDR

function readStoredCurrency(): Currency {
  if (typeof window === "undefined") return DEFAULT_CURRENCY;
  const savedCurrency = localStorage.getItem("app-currency");
  return savedCurrency === "USD" || savedCurrency === "IDR" ? savedCurrency : DEFAULT_CURRENCY;
}

function subscribeCurrency(callback: () => void) {
  if (typeof window === "undefined") return () => {};
  const handler = () => callback();
  window.addEventListener("storage", handler);
  window.addEventListener("app-currency", handler);
  return () => {
    window.removeEventListener("storage", handler);
    window.removeEventListener("app-currency", handler);
  };
}

const getServerSnapshot = () => DEFAULT_CURRENCY;

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const currency = useSyncExternalStore(subscribeCurrency, readStoredCurrency, getServerSnapshot);

  const handleSetCurrency = useCallback((curr: Currency) => {
    if (typeof window === "undefined") return;
    localStorage.setItem('app-currency', curr);
    window.dispatchEvent(new Event("app-currency"));
  }, []);

  const convertPrice = useCallback((value: number, baseCurrency: Currency): number => {
    if (baseCurrency === currency) return value;
    if (baseCurrency === 'IDR' && currency === 'USD') return value / EXCHANGE_RATE;
    if (baseCurrency === 'USD' && currency === 'IDR') return value * EXCHANGE_RATE;
    return value;
  }, [currency]);

  const formatPrice = useCallback((value: number, baseCurrency: Currency, lang: string = 'id'): string => {
    const convertedValue = convertPrice(value, baseCurrency);
    
    return new Intl.NumberFormat(lang === 'id' ? 'id-ID' : 'en-US', {
      style: "currency",
      currency: currency,
      minimumFractionDigits: currency === 'IDR' ? 0 : 2,
      maximumFractionDigits: currency === 'IDR' ? 0 : 6,
    }).format(convertedValue);
  }, [convertPrice, currency]);

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency: handleSetCurrency, formatPrice, convertPrice }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    console.warn('useCurrency must be used within a CurrencyProvider. Falling back to default IDR.');
    return {
      currency: 'IDR' as Currency,
      setCurrency: () => {},
      convertPrice: (value: number, baseCurrency: Currency) => {
        if (baseCurrency === 'IDR') return value;
        return value * 16000;
      },
      formatPrice: (value: number, baseCurrency: Currency, lang: string = 'id') => {
        const convertedValue = baseCurrency === 'IDR' ? value : value * 16000;
        return new Intl.NumberFormat(lang === 'id' ? 'id-ID' : 'en-US', {
          style: "currency",
          currency: 'IDR',
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        }).format(convertedValue);
      }
    };
  }
  return context;
}
