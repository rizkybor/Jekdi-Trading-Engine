import { DecisionResult } from "@/types";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { Target, ShieldAlert, Coins } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export function TradeSetupCard({ data }: { data: DecisionResult }) {
  const { t, language } = useLanguage();

  if (data.signal === "NO TRADE" || data.entry === 0) {
    return null;
  }

  const risk = Math.abs(data.entry - data.stopLoss);
  const reward = Math.abs(data.takeProfit - data.entry);
  const rrRatio = (reward / risk).toFixed(1);
  const isCrypto = data.symbol.includes(':');
  const currency = isCrypto ? 'USD' : 'IDR';

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
            <span className="text-xl font-bold text-white">{formatCurrency(data.entry, language, currency)}</span>
          </div>
          
          <div className="bg-[#0f0f0f] p-4 flex flex-col justify-between relative overflow-hidden group">
            <div className="absolute inset-0 bg-rose-500/5 transition-colors group-hover:bg-rose-500/10"></div>
            <span className="text-rose-500/80 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 mb-2 relative z-10">
              <ShieldAlert className="w-3 h-3" /> {t('stopLoss')}
            </span>
            <span className="text-xl font-bold text-rose-500 relative z-10">{formatCurrency(data.stopLoss, language, currency)}</span>
          </div>

          <div className="bg-[#0f0f0f] p-4 flex flex-col justify-between relative overflow-hidden group">
            <div className="absolute inset-0 bg-emerald-500/5 transition-colors group-hover:bg-emerald-500/10"></div>
            <span className="text-emerald-500/80 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 mb-2 relative z-10">
              <Target className="w-3 h-3" /> {t('takeProfit')}
            </span>
            <span className="text-xl font-bold text-emerald-500 relative z-10">{formatCurrency(data.takeProfit, language, currency)}</span>
          </div>
        </div>

        <div className="space-y-3 bg-[#0f0f0f] p-4 rounded-md border border-neutral-800/50">
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
      </CardContent>
    </Card>
  );
}