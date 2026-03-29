"use client";

import { useState, useEffect } from "react";
import { DecisionResult } from "@/types";
import { SignalCard } from "@/components/dashboard/SignalCard";
import { TradeSetupCard } from "@/components/dashboard/TradeSetupCard";
import { ReasoningPanel } from "@/components/dashboard/ReasoningPanel";
import { IndicatorGrid } from "@/components/dashboard/IndicatorGrid";
import { StrategyExplanation } from "@/components/dashboard/StrategyExplanation";
import { PriceChart } from "@/components/dashboard/PriceChart";
import { Search, Loader2, Globe, Clock, AlertTriangle } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export default function Dashboard() {
  const [data, setData] = useState<DecisionResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [symbol, setSymbol] = useState("BBCA"); 
  const { t, language, setLanguage } = useLanguage();

  const fetchAnalysis = async (ticker: string) => {
    if (!ticker.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/analyze?symbol=${ticker}`);
      const result = await res.json();
      
      if (!res.ok) {
        if (res.status === 429) {
          throw new Error("Limit API Harian Habis");
        }
        throw new Error(result.error || "Gagal mengambil data");
      }
      
      setData(result);
    } catch (err: any) {
      console.error(err);
      
      // Handle specifically 429 errors from our backend
      if (err.message === "Limit API Harian Habis") {
        setData({
          symbol: ticker,
          signal: "LIMIT_REACHED" as any, // We will handle this state
          score: 0,
          confidence: "low",
          entry: 0,
          stopLoss: 0,
          takeProfit: 0,
          reasons: [],
          strategyUsed: null,
          context: { trend: "sideways", volume: "rendah" },
          indicators: { rsi: 0, macd: 0, ma20: 0, ma50: 0 }
        });
      } else {
        alert(t('fetchError') + ticker);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalysis(symbol);
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-neutral-200 selection:bg-neutral-800">
      {/* Top Navigation Bar */}
      <header className="border-b border-neutral-800 bg-[#0f0f0f] sticky top-0 z-50">
        <div className="max-w-[1400px] mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 bg-white rounded-sm flex items-center justify-center">
              <span className="text-black font-black text-sm">J</span>
            </div>
            <span className="font-bold text-white tracking-tight">Jekdi Trading Engine</span>
          </div>

          <div className="flex items-center gap-3 w-full max-w-sm justify-end">
            <div className="relative w-full max-w-xs">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
              <input 
                type="text" 
                value={symbol}
                onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                onKeyDown={(e) => e.key === 'Enter' && fetchAnalysis(symbol)}
                placeholder={t('searchPlaceholder')} 
                className="w-full bg-[#141414] border border-neutral-800 text-white text-sm px-9 py-1.5 rounded-md outline-none focus:border-neutral-600 transition-colors uppercase placeholder:normal-case placeholder:text-neutral-600"
              />
              {loading && (
                <Loader2 className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 animate-spin" />
              )}
            </div>
            
            <button 
              onClick={() => setLanguage(language === 'en' ? 'id' : 'en')}
              className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-[#141414] border border-neutral-800 text-neutral-400 hover:text-white hover:border-neutral-600 transition-colors shrink-0"
            >
              <Globe className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-widest">{language}</span>
            </button>
          </div>
        </div>
      </header>

      <main className="p-4 md:p-6 lg:p-8 max-w-[1400px] mx-auto space-y-6">
        {loading && !data ? (
          <div className="flex flex-col items-center justify-center py-32 space-y-4">
            <Loader2 className="w-8 h-8 text-neutral-600 animate-spin" />
            <p className="text-neutral-500 text-sm font-medium uppercase tracking-widest">{t('compilingData')}</p>
          </div>
        ) : data?.signal === ("LIMIT_REACHED" as any) ? (
          <div className="flex flex-col items-center justify-center py-32 space-y-6 max-w-md mx-auto text-center">
            <div className="w-16 h-16 bg-rose-500/10 rounded-full flex items-center justify-center border border-rose-500/20">
              <AlertTriangle className="w-8 h-8 text-rose-500" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-white tracking-tight">Today's Usage Limit Reached</h2>
              <p className="text-neutral-400">
                You have reached your DataSectors API daily limit (100 of 100 requests). 
                Please try again tomorrow when the limit resets, or upgrade your API plan.
              </p>
            </div>
            <div className="bg-[#141414] border border-neutral-800 rounded-md p-4 w-full flex items-center justify-between">
               <span className="text-neutral-500 text-sm font-medium">Daily Limit</span>
               <span className="text-rose-500 font-bold">100 / 100</span>
            </div>
          </div>
        ) : data ? (
          <>
            <div className="flex items-center gap-2 text-neutral-500 text-xs font-medium uppercase tracking-widest bg-[#141414] border border-neutral-800 w-fit px-3 py-1.5 rounded-sm">
              <Clock className="w-3.5 h-3.5" />
              <span>{t('marketDataAsOf')} {new Date().toLocaleDateString(language === 'id' ? 'id-ID' : 'en-US', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
            </div>
            
            <SignalCard data={data} />

            {data.chartData && (
              <div className="w-full">
                <PriceChart data={data.chartData} symbol={data.symbol} />
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-8 space-y-6">
                <TradeSetupCard data={data} />
                <IndicatorGrid data={data} />
              </div>

              <div className="lg:col-span-4 space-y-6">
                <ReasoningPanel reasons={data.reasons} signal={data.signal} />
                {data.strategyUsed && (
                  <StrategyExplanation strategy={data.strategyUsed} />
                )}
              </div>
            </div>
          </>
        ) : null}
      </main>
    </div>
  );
}
