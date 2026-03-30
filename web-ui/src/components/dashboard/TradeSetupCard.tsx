import { DecisionResult } from "@/types";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Target, ShieldAlert, Coins, Clock, CalendarDays, Activity } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useCurrency, Currency } from "@/contexts/CurrencyContext";

export function TradeSetupCard({ data }: { data: DecisionResult }) {
  const { t, language } = useLanguage();
  const { formatPrice } = useCurrency();

  if (data.signal === "NO TRADE" || data.entry === 0) {
    return null;
  }

  const risk = Math.abs(data.entry - data.stopLoss);
  const reward = Math.abs(data.takeProfit - data.entry);
  const rrRatio = (reward / risk).toFixed(1);
  const isCrypto = data.symbol.includes(':');
  const baseCurrency: Currency = isCrypto ? 'USD' : 'IDR';

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Coins className="w-4 h-4 text-neutral-400" />
          {t('tradeSetup')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-neutral-800 rounded-md overflow-hidden border border-neutral-800 mb-6">
          <div className="bg-[#0f0f0f] p-4 flex flex-col justify-between">
            <span className="text-neutral-500 text-xs font-medium uppercase tracking-wider flex items-center gap-1.5 mb-2">
              {t('entryPrice')}
            </span>
            <span className="text-lg md:text-xl font-bold text-white">{formatPrice(data.entry, baseCurrency, language)}</span>
          </div>
          
          <div className="bg-[#0f0f0f] p-4 flex flex-col justify-between relative overflow-hidden group">
            <div className="absolute inset-0 bg-rose-500/5 transition-colors group-hover:bg-rose-500/10"></div>
            <span className="text-rose-500/80 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 mb-2 relative z-10">
              <ShieldAlert className="w-3 h-3" /> {t('stopLoss')}
            </span>
            <span className="text-lg md:text-xl font-bold text-rose-500 relative z-10">{formatPrice(data.stopLoss, baseCurrency, language)}</span>
          </div>

          <div className="bg-[#0f0f0f] p-4 flex flex-col justify-between relative overflow-hidden group">
            <div className="absolute inset-0 bg-emerald-500/5 transition-colors group-hover:bg-emerald-500/10"></div>
            <span className="text-emerald-500/80 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 mb-2 relative z-10">
              <Target className="w-3 h-3" /> {t('takeProfit')}
            </span>
            <span className="text-lg md:text-xl font-bold text-emerald-500 relative z-10">{formatPrice(data.takeProfit, baseCurrency, language)}</span>
          </div>
        </div>

        <div className="space-y-3 bg-[#0f0f0f] p-4 rounded-md border border-neutral-800/50 mb-6">
          <div className="flex justify-between text-xs font-medium uppercase tracking-widest">
            <span className="text-neutral-500">{t('riskRewardRatio')}</span>
            <span className="font-bold text-white">1 : {rrRatio}</span>
          </div>
          
          <div className="h-1.5 w-full bg-neutral-800 rounded-full overflow-hidden flex">
            <div className="bg-rose-500 h-full" style={{ width: '33.33%' }}></div>
            <div className="bg-emerald-500 h-full" style={{ width: '66.66%' }}></div>
          </div>
          <div className="flex justify-between text-[10px] uppercase tracking-widest text-neutral-500 font-bold">
            <span>{t('risk')} (1)</span>
            <span>{t('reward')} ({rrRatio})</span>
          </div>
        </div>

        {data.tradingPlans && (
          <div className={`grid grid-cols-1 gap-4 mt-6 ${data.tradingPlans.length === 2 ? 'md:grid-cols-2' : 'md:grid-cols-3'}`}>
            {data.tradingPlans.map((plan, idx) => {
              // Icon & Color mapping based on horizon type
              let Icon = Clock;
              let iconColor = "text-neutral-400";
              const title = plan.horizon;

              if (plan.type === "short" || plan.type === "swing") {
                Icon = Clock;
                iconColor = "text-emerald-400";
              } else if (plan.type === "mid") {
                Icon = Activity;
                iconColor = "text-blue-400";
              } else if (plan.type === "long" || plan.type === "position") {
                Icon = CalendarDays;
                iconColor = "text-purple-400";
              }

              return (
                <div key={idx} className="bg-[#0f0f0f] p-4 rounded-md border border-neutral-800 flex flex-col h-full">
                  <div className="flex items-center gap-2 mb-4">
                    <Icon className={`w-4 h-4 ${iconColor}`} />
                    <span className="text-xs font-bold uppercase tracking-widest text-neutral-400">{title}</span>
                  </div>

                  <div className="space-y-3 mb-4 flex-1">
                    {/* Entry Section */}
                    <div>
                      <span className="text-[10px] text-neutral-500 uppercase tracking-widest mb-1 block">Target Entry</span>
                      {plan.mode === "precise" && plan.entry !== undefined ? (
                        <span className="text-sm font-bold text-white">{plan.entry === 0 ? "-" : formatPrice(plan.entry, baseCurrency, language)}</span>
                      ) : plan.mode === "range" && Array.isArray(plan.entryZone) ? (
                        <span className="text-sm font-bold text-white">
                          {plan.entryZone[0] === 0 ? "-" : `${formatPrice(plan.entryZone[0], baseCurrency, language)} - ${formatPrice(plan.entryZone[1], baseCurrency, language)}`}
                        </span>
                      ) : (
                        <span className="text-xs text-neutral-300 leading-relaxed block">{plan.entryZone}</span>
                      )}
                    </div>

                    {/* Stop Loss & Take Profit Section (Only for precise & range) */}
                    {(plan.mode === "precise" || plan.mode === "range") && (
                      <div className="flex justify-between items-center gap-4">
                        <div>
                          <span className="text-[10px] text-rose-500/80 uppercase tracking-widest mb-1 block">Stop Loss</span>
                          <span className="text-sm font-bold text-rose-500">{plan.stopLoss === 0 ? "-" : formatPrice(plan.stopLoss as number, baseCurrency, language)}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] text-emerald-500/80 uppercase tracking-widest mb-1 block">Take Profit</span>
                          <span className="text-sm font-bold text-emerald-500">{plan.takeProfit === 0 ? "-" : formatPrice(plan.takeProfit as number, baseCurrency, language)}</span>
                        </div>
                      </div>
                    )}

                    {/* Narrative SL/TP */}
                    {plan.mode === "narrative" && (
                      <div className="space-y-2">
                        <div>
                          <span className="text-[10px] text-rose-500/80 uppercase tracking-widest mb-0.5 block">Risk Control</span>
                          <span className="text-xs text-neutral-300 leading-relaxed block">{plan.stopLoss}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-emerald-500/80 uppercase tracking-widest mb-0.5 block">Profit Target</span>
                          <span className="text-xs text-neutral-300 leading-relaxed block">{plan.takeProfit}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Description Footer */}
                  <div className="pt-3 border-t border-neutral-800/50 mt-auto">
                    <p className="text-[11px] text-neutral-500 leading-relaxed">{plan.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}