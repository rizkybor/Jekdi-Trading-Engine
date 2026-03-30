import { DecisionResult } from "@/types";
import { getSignalColor, getConfidenceColor } from "@/lib/utils";
import { Zap } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export function SignalCard({ data }: { data: DecisionResult }) {
  const { t } = useLanguage();

  return (
    <div className="bg-[#141414] border border-neutral-800 rounded-lg overflow-hidden flex flex-col md:flex-row">
      {/* Left side: Symbol & Main Signal */}
      <div className="p-5 md:p-8 flex-1 border-b md:border-b-0 md:border-r border-neutral-800 flex flex-col justify-center">
        <div className="flex items-baseline gap-2 md:gap-3 mb-2">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white m-0 leading-none truncate max-w-full">
            {data.symbol.includes(':') ? data.symbol.split(':')[1] : data.symbol}
          </h1>
          <span className="text-neutral-500 font-medium tracking-widest text-xs md:text-sm shrink-0">
            {data.symbol.includes(':') ? data.symbol.split(':')[0] : 'IDX'}
          </span>
        </div>
        
        <div className="flex items-center gap-2 md:gap-3 mt-3 md:mt-4 flex-wrap">
          <div className={`px-3 py-1 md:px-4 text-xs md:text-sm font-bold uppercase tracking-wider rounded-sm border ${getSignalColor(data.signal)}`}>
            {data.signal}
          </div>
          
          <div className="text-[10px] md:text-xs text-neutral-400 bg-neutral-900 border border-neutral-800 px-2 py-1 md:px-3 rounded-sm uppercase tracking-widest">
            {data.context.trend}
          </div>

          {data.strategyUsed && (
            <div className="flex items-center gap-1.5 text-[10px] md:text-xs text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2 py-1 md:px-3 rounded-sm uppercase tracking-widest">
              <Zap className="w-3 h-3 shrink-0" />
              <span className="truncate">{data.strategyUsed}</span>
            </div>
          )}
        </div>
      </div>

      {/* Right side: Score & Metrics */}
      <div className="flex flex-row md:flex-col md:w-64 divide-x md:divide-x-0 md:divide-y divide-neutral-800 bg-[#0f0f0f]">
        
        <div className="flex-1 p-4 md:p-6 flex flex-col justify-center items-center md:items-start">
          <span className="text-[10px] md:text-xs text-neutral-500 font-medium uppercase tracking-widest mb-1 text-center md:text-left">{t('algorithmScore')}</span>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl md:text-4xl font-bold text-white leading-none">{data.score}</span>
            <span className="text-neutral-600 text-xs md:text-sm">/100</span>
          </div>
        </div>
        
        <div className="flex-1 p-4 md:p-6 flex flex-col justify-center items-center md:items-start">
          <span className="text-[10px] md:text-xs text-neutral-500 font-medium uppercase tracking-widest mb-2 text-center md:text-left">{t('confidenceLevel')}</span>
          <div>
            <span className={`text-[10px] md:text-xs px-2 py-1 uppercase tracking-widest font-bold rounded-sm ${getConfidenceColor(data.confidence)}`}>
              {data.confidence}
            </span>
          </div>
        </div>

      </div>
    </div>
  );
}