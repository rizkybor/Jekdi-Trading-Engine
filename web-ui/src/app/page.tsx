"use client";

import { useState, useEffect, useRef } from "react";
import { DecisionResult } from "@/types";
import { SignalCard } from "@/components/dashboard/SignalCard";
import { TradeSetupCard } from "@/components/dashboard/TradeSetupCard";
import { ReasoningPanel } from "@/components/dashboard/ReasoningPanel";
import { IndicatorGrid } from "@/components/dashboard/IndicatorGrid";
import { StrategyExplanation } from "@/components/dashboard/StrategyExplanation";
import { PriceChart } from "@/components/dashboard/PriceChart";
import { RecommendationCard } from "@/components/dashboard/RecommendationCard";
import { Search, Loader2, Globe, Clock, AlertTriangle, CircleDollarSign, Star, ChevronDown } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useCurrency } from "@/contexts/CurrencyContext";
import { useFavorite } from "@/contexts/FavoriteContext";

export default function Dashboard() {
  const [isMounted, setIsMounted] = useState(false);
  const [data, setData] = useState<DecisionResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [limitReached, setLimitReached] = useState(false);
  const [symbol, setSymbol] = useState("BBCA");
  const [market, setMarket] = useState<"idx" | "crypto">("idx");
  const [showFavorites, setShowFavorites] = useState(false);
  const favDropdownRef = useRef<HTMLDivElement>(null);
  
  const { t, language, setLanguage } = useLanguage();
  const { currency, setCurrency } = useCurrency();
  const { favorites } = useFavorite();

  // Handle hydration
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!favDropdownRef.current?.contains(event.target as Node)) {
        setShowFavorites(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchAnalysis = async (
    ticker: string,
    targetMarket: "idx" | "crypto" = market,
  ) => {
    if (!ticker.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(
        `/api/analyze?symbol=${ticker}&market=${targetMarket}`,
      );
      const result = await res.json();

      if (!res.ok) {
        if (res.status === 429) {
          throw new Error("Limit API Harian Habis");
        }
        if (typeof result?.errorKey === "string") {
          throw new Error(result.errorKey);
        }
        throw new Error(result?.error || "Gagal mengambil data");
      }

      setLimitReached(false);
      setData(result);
    } catch (err: unknown) {
      console.error(err);

      // Handle specifically 429 errors from our backend
      const message = err instanceof Error ? err.message : "";
      if (message === "Limit API Harian Habis") {
        setLimitReached(true);
        setData(null);
      } else {
        if (message) {
          const translated = t(message as never);
          if (translated !== message) {
            alert(translated);
          } else {
            alert(t("fetchError") + ticker);
          }
        } else {
          alert(t("fetchError") + ticker);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // We only want to fetch on initial mount for the default symbol
    const initialSymbol = "BBCA";
    fetchAnalysis(initialSymbol, "idx");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-neutral-200 selection:bg-neutral-800">
      {/* Top Navigation Bar */}
      <header className="border-b border-neutral-800 bg-[#0f0f0f] sticky top-0 z-50">
        <div className="max-w-[1400px] mx-auto px-4 md:px-6 py-3 md:h-16 flex flex-col md:flex-row md:items-center justify-between gap-3 md:gap-0">
          <div className="flex items-center justify-between w-full md:w-auto">
            <div className="flex items-center gap-2 md:gap-3">
              <div className="w-6 h-6 md:w-7 md:h-7 bg-white rounded-sm flex items-center justify-center shrink-0">
                <span className="text-black font-black text-sm md:text-base">J</span>
              </div>
              <span className="font-bold text-white tracking-tight text-sm md:text-base truncate">
                Jekdi Trading Engine
              </span>
            </div>
            {/* Toggles on mobile */}
            <div className="md:hidden flex items-center gap-2">
              <button
                onClick={() => setCurrency(currency === "IDR" ? "USD" : "IDR")}
                className="cursor-pointer flex items-center gap-1.5 px-2 py-1 rounded-md bg-[#141414] border border-neutral-800 text-neutral-400 hover:text-white hover:border-neutral-600 transition-colors shrink-0"
              >
                <CircleDollarSign className="w-3.5 h-3.5" />
                <span className="text-[10px] font-bold uppercase tracking-widest">
                  {currency}
                </span>
              </button>
              <button
                onClick={() => setLanguage(language === "en" ? "id" : "en")}
                className="cursor-pointer flex items-center gap-1.5 px-2 py-1 rounded-md bg-[#141414] border border-neutral-800 text-neutral-400 hover:text-white hover:border-neutral-600 transition-colors shrink-0"
              >
                <Globe className="w-3.5 h-3.5" />
                <span className="text-[10px] font-bold uppercase tracking-widest">
                  {language}
                </span>
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-3 w-full md:max-w-xl md:justify-end">
            {/* Favorites Dropdown - Only render after mount to prevent hydration error */}
            {isMounted && (
              <div className="relative" ref={favDropdownRef}>
                <button
                  onClick={() => setShowFavorites(!showFavorites)}
                  className={`cursor-pointer flex items-center gap-1.5 px-2 md:px-3 py-1.5 rounded-md border transition-colors shrink-0 ${
                    showFavorites || favorites.length > 0 
                      ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-500' 
                      : 'bg-[#141414] border-neutral-800 text-neutral-400 hover:text-white hover:border-neutral-600'
                  }`}
                >
                  <Star className={`w-3.5 h-3.5 md:w-4 md:h-4 ${favorites.length > 0 ? 'fill-yellow-500' : ''}`} />
                  <span className="text-[10px] md:text-xs font-bold uppercase tracking-widest hidden sm:inline-block">Favs</span>
                  {favorites.length > 0 && (
                    <span className="bg-yellow-500 text-black text-[9px] font-bold px-1.5 py-0.5 rounded-sm leading-none ml-1">
                      {favorites.length}
                    </span>
                  )}
                  <ChevronDown className="w-3 h-3 opacity-50" />
                </button>

                {/* Dropdown Menu */}
                {showFavorites && (
                  <div className="absolute right-0 top-full mt-2 w-56 bg-[#141414] border border-neutral-800 rounded-md shadow-xl overflow-hidden z-50">
                    <div className="px-3 py-2 border-b border-neutral-800 bg-[#0f0f0f]">
                      <span className="text-xs font-bold text-neutral-400 uppercase tracking-widest">Saved Assets</span>
                    </div>
                    <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
                      {favorites.length === 0 ? (
                        <div className="px-4 py-6 text-center text-neutral-500 text-xs">
                          No favorites yet. Click the star icon next to a symbol to add it here.
                        </div>
                      ) : (
                        <div className="flex flex-col">
                          {favorites.map((fav, i) => (
                            <button
                              key={`${fav.market}-${fav.symbol}-${i}`}
                              onClick={() => {
                                setMarket(fav.market);
                                setSymbol(fav.symbol);
                                fetchAnalysis(fav.symbol, fav.market);
                                setShowFavorites(false);
                              }}
                              className="flex items-center justify-between px-3 py-2.5 hover:bg-neutral-800 transition-colors border-b border-neutral-800/50 last:border-0 text-left cursor-pointer group"
                            >
                              <span className="font-bold text-sm text-white group-hover:text-yellow-500 transition-colors">{fav.symbol}</span>
                              <span className="text-[10px] font-medium text-neutral-500 uppercase tracking-widest bg-[#0f0f0f] px-1.5 py-0.5 rounded border border-neutral-800">
                                {fav.market}
                              </span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="flex bg-[#141414] border border-neutral-800 rounded-md p-1 shrink-0">
              <button
                onClick={() => {
                  setMarket("idx");
                  if (symbol !== "BBCA") setSymbol("BBCA");
                  fetchAnalysis("BBCA", "idx");
                }}
                className={`cursor-pointer px-2.5 py-1.5 md:px-3 md:py-1 text-[10px] md:text-xs font-bold uppercase tracking-widest rounded-sm transition-colors ${
                  market === "idx"
                    ? "bg-neutral-800 text-white"
                    : "text-neutral-500 hover:text-neutral-300"
                }`}
              >
                IDX
              </button>
              <button
                onClick={() => {
                  setMarket("crypto");
                  if (symbol !== "BTCUSDT") setSymbol("BTCUSDT");
                  fetchAnalysis("BTCUSDT", "crypto");
                }}
                className={`cursor-pointer px-2.5 py-1.5 md:px-3 md:py-1 text-[10px] md:text-xs font-bold uppercase tracking-widest rounded-sm transition-colors ${
                  market === "crypto"
                    ? "bg-neutral-800 text-white"
                    : "text-neutral-500 hover:text-neutral-300"
                }`}
              >
                Crypto
              </button>
            </div>

            <div className="relative w-full md:max-w-xs flex-1">
              <Search className="w-3.5 h-3.5 md:w-4 md:h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
              <input
                type="text"
                value={symbol}
                onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                onKeyDown={(e) => e.key === "Enter" && fetchAnalysis(symbol)}
                placeholder={
                  market === "crypto"
                    ? "Ex: BTCUSDT..."
                    : t("searchPlaceholder")
                }
                className="w-full bg-[#141414] border border-neutral-800 text-white text-xs md:text-sm px-8 md:px-9 py-2 md:py-1.5 rounded-md outline-none focus:border-neutral-600 transition-colors uppercase placeholder:normal-case placeholder:text-neutral-600"
              />
              {loading && (
                <Loader2 className="w-3.5 h-3.5 md:w-4 md:h-4 absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 animate-spin" />
              )}
            </div>

            {/* Toggles on desktop */}
            <div className="hidden md:flex items-center gap-2 shrink-0">
              <button
                onClick={() => setCurrency(currency === "IDR" ? "USD" : "IDR")}
                className="cursor-pointer flex items-center gap-2 px-3 py-1.5 rounded-md bg-[#141414] border border-neutral-800 text-neutral-400 hover:text-white hover:border-neutral-600 transition-colors"
              >
                <CircleDollarSign className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-widest">
                  {currency}
                </span>
              </button>
              <button
                onClick={() => setLanguage(language === "en" ? "id" : "en")}
                className="cursor-pointer flex items-center gap-2 px-3 py-1.5 rounded-md bg-[#141414] border border-neutral-800 text-neutral-400 hover:text-white hover:border-neutral-600 transition-colors"
              >
                <Globe className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-widest">
                  {language}
                </span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="p-4 md:p-6 lg:p-8 max-w-[1400px] mx-auto space-y-6">
        {loading && !data ? (
          <div className="flex flex-col items-center justify-center py-32 space-y-4">
            <Loader2 className="w-8 h-8 text-neutral-600 animate-spin" />
            <p className="text-neutral-500 text-sm font-medium uppercase tracking-widest">
              {t("compilingData")}
            </p>
          </div>
        ) : limitReached ? (
          <div className="flex flex-col items-center justify-center py-32 space-y-6 max-w-md mx-auto text-center">
            <div className="w-16 h-16 bg-rose-500/10 rounded-full flex items-center justify-center border border-rose-500/20">
              <AlertTriangle className="w-8 h-8 text-rose-500" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-white tracking-tight">
                Daily Usage Limit Reached
              </h2>
              <p className="text-neutral-400">
                You have reached your DataSectors API daily limit (100 of 100
                requests). Please try again tomorrow when the limit resets, or
                upgrade your API plan.
              </p>
            </div>
            <div className="bg-[#141414] border border-neutral-800 rounded-md p-4 w-full flex items-center justify-between">
              <span className="text-neutral-500 text-sm font-medium">
                Daily Limit
              </span>
              <span className="text-rose-500 font-bold">100 / 100</span>
            </div>
          </div>
        ) : data ? (
          <>
            <div className="flex items-center gap-2 text-neutral-500 text-xs font-medium uppercase tracking-widest bg-[#141414] border border-neutral-800 w-fit px-3 py-1.5 rounded-sm">
              <Clock className="w-3.5 h-3.5" />
              <span>
                {t("marketDataAsOf")}{" "}
                {new Date().toLocaleDateString(
                  language === "id" ? "id-ID" : "en-US",
                  { day: "numeric", month: "short", year: "numeric" },
                )}
              </span>
            </div>

            <SignalCard data={data} />

            {/* {data.chartData && (
              <div className="w-full">
                <PriceChart data={data.chartData} symbol={data.symbol} />
              </div>
            )} */}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
              <div className="lg:col-span-8 space-y-6 md:space-y-8">
                {data.chartData && (
                  <div className="w-full overflow-hidden rounded-md border border-neutral-800 bg-[#0f0f0f]">
                    <PriceChart data={data.chartData} symbol={data.symbol} />
                  </div>
                )}
                <TradeSetupCard data={data} />
                <IndicatorGrid data={data} />
              </div>

              <div className="lg:col-span-4 space-y-6 md:space-y-8">
                <RecommendationCard data={data} />
                <ReasoningPanel reasons={data.reasons} />
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
