import { DecisionResult } from "@/types";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ActivitySquare, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export function IndicatorGrid({ data }: { data: DecisionResult }) {
  const { t } = useLanguage();
  
  // Helper to determine status and color based on value
  const getRsiStatus = (val: number) => {
    if (val > 70) return { label: t('overbought'), color: "text-rose-400", icon: TrendingDown };
    if (val < 30) return { label: t('oversold'), color: "text-emerald-400", icon: TrendingUp };
    return { label: t('neutral'), color: "text-amber-400", icon: Minus };
  };

  const getMacdStatus = (val: number) => {
    if (val > 0) return { label: t('bullish'), color: "text-emerald-400", icon: TrendingUp };
    if (val < 0) return { label: t('bearish'), color: "text-rose-400", icon: TrendingDown };
    return { label: t('neutral'), color: "text-amber-400", icon: Minus };
  };

  const getMaStatus = (ma20: number, ma50: number) => {
    if (ma20 > ma50) return { label: t('bullishCross'), color: "text-emerald-400", icon: TrendingUp };
    if (ma20 < ma50) return { label: t('bearishCross'), color: "text-rose-400", icon: TrendingDown };
    return { label: t('neutral'), color: "text-amber-400", icon: Minus };
  };

  const rsi = getRsiStatus(data.indicators.rsi);
  const macd = getMacdStatus(data.indicators.macd);
  const ma = getMaStatus(data.indicators.ma20, data.indicators.ma50);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ActivitySquare className="w-4 h-4 text-neutral-400" />
          {t('technicalIndicators')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-neutral-800 rounded-md overflow-hidden border border-neutral-800">
          
          {/* RSI */}
          <div className="bg-[#0f0f0f] p-4 flex flex-col justify-between h-full">
            <span className="text-neutral-500 text-xs font-medium uppercase tracking-wider mb-2">RSI (14)</span>
            <div>
              <span className="text-2xl font-bold text-white block mb-1">{data.indicators.rsi.toFixed(2)}</span>
              <div className={`flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest ${rsi.color}`}>
                <rsi.icon className="w-3 h-3" />
                {rsi.label}
              </div>
            </div>
          </div>

          {/* MACD */}
          <div className="bg-[#0f0f0f] p-4 flex flex-col justify-between h-full">
            <span className="text-neutral-500 text-xs font-medium uppercase tracking-wider mb-2">MACD</span>
            <div>
              <span className="text-2xl font-bold text-white block mb-1">{data.indicators.macd.toFixed(2)}</span>
              <div className={`flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest ${macd.color}`}>
                <macd.icon className="w-3 h-3" />
                {macd.label}
              </div>
            </div>
          </div>

          {/* MA Cross */}
          <div className="bg-[#0f0f0f] p-4 flex flex-col justify-between h-full">
            <span className="text-neutral-500 text-xs font-medium uppercase tracking-wider mb-2">MA20 vs MA50</span>
            <div>
              <div className="flex items-baseline gap-1 mb-1">
                <span className="text-xl font-bold text-white">{data.indicators.ma20.toFixed(0)}</span>
                <span className="text-neutral-600 text-xs">/ {data.indicators.ma50.toFixed(0)}</span>
              </div>
              <div className={`flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest ${ma.color}`}>
                <ma.icon className="w-3 h-3" />
                {ma.label}
              </div>
            </div>
          </div>

          {/* Volume */}
          <div className="bg-[#0f0f0f] p-4 flex flex-col justify-between h-full">
            <span className="text-neutral-500 text-xs font-medium uppercase tracking-wider mb-2">Volume</span>
            <div>
              <span className="text-xl font-bold text-white capitalize block mb-1">{data.context.volume.replace('_', ' ')}</span>
              <div className={`flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest ${
                data.context.volume.includes('spike') ? 'text-emerald-400' : 'text-neutral-400'
              }`}>
                {data.context.volume.includes('spike') ? <TrendingUp className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
                {t('liquidity')}
              </div>
            </div>
          </div>

        </div>
      </CardContent>
    </Card>
  );
}