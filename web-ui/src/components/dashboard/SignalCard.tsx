import { DecisionResult } from "@/types";
import { getSignalColor, getConfidenceColor } from "@/lib/utils";
import { Zap } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export function SignalCard({ data }: { data: DecisionResult }) {
  const { t } = useLanguage();

  return (
    <div className="bg-[#141414] border border-neutral-800 rounded-lg overflow-hidden flex flex-col md:flex-row">
      {/* Left side: Symbol & Main Signal */}
      <div className="p-6 md:p-8 flex-1 border-b md:border-b-0 md:border-r border-neutral-800 flex flex-col justify-center">
        <div className="flex items-baseline gap-3 mb-2">
          <h1 className="text-5xl font-bold tracking-tight text-white m-0 leading-none">
            {data.symbol.includes(':') ? data.symbol.split(':')[1] : data.symbol}
          </h1>
          <span className="text-neutral-500 font-medium tracking-widest text-sm">
            {data.symbol.includes(':') ? data.symbol.split(':')[0] : 'IDX'}
          </span>
        </div>
        
        <div className="flex items-center gap-3 mt-4 flex-wrap">
          <div className={`px-4 py-1 text-sm font-bold uppercase tracking-wider rounded-sm border ${getSignalColor(data.signal)}`}>
            {data.signal}
          </div>
          
          <div className="text-xs text-neutral-400 bg-neutral-900 border border-neutral-800 px-3 py-1 rounded-sm uppercase tracking-widest">
            {data.context.trend}
          </div>

          {data.strategyUsed && (
            <div className="flex items-center gap-1.5 text-xs text-blue-400 bg-blue-500/10 border border-blue-500/20 px-3 py-1 rounded-sm uppercase tracking-widest">
              <Zap className="w-3 h-3" />
              {data.strategyUsed}
            </div>
          )}
        </div>
      </div>

      {/* Right side: Score & Metrics */}
      <div className="flex flex-row md:flex-col md:w-64 divide-x md:divide-x-0 md:divide-y divide-neutral-800 bg-[#0f0f0f]">
        
        <div className="flex-1 p-6 flex flex-col justify-center">
          <span className="text-xs text-neutral-500 font-medium uppercase tracking-widest mb-1">{t('algorithmScore')}</span>
          <div className="flex items-baseline gap-1">
            <span className="text-4xl font-bold text-white leading-none">{data.score}</span>
            <span className="text-neutral-600 text-sm">/100</span>
          </div>
        </div>
        
        <div className="flex-1 p-6 flex flex-col justify-center">
          <span className="text-xs text-neutral-500 font-medium uppercase tracking-widest mb-2">{t('confidenceLevel')}</span>
          <div>
            <span className={`text-xs px-2 py-1 uppercase tracking-widest font-bold rounded-sm ${getConfidenceColor(data.confidence)}`}>
              {data.confidence}
            </span>
          </div>
        </div>

      </div>
    </div>
  );
}