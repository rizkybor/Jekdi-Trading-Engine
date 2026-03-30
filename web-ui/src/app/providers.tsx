"use client";

import { LanguageProvider } from "@/contexts/LanguageContext";
import { CurrencyProvider } from "@/contexts/CurrencyContext";
import { FavoriteProvider } from "@/contexts/FavoriteContext";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <LanguageProvider>
      <CurrencyProvider>
        <FavoriteProvider>
          {children}
        </FavoriteProvider>
      </CurrencyProvider>
    </LanguageProvider>
  );
}