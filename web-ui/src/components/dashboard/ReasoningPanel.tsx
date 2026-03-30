"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { BrainCircuit, ChevronDown, ChevronUp, CheckCircle2, XCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import { translations } from "@/lib/translations";

export function ReasoningPanel({ reasons }: { reasons: string[] }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { t } = useLanguage();
  
  if (!reasons || reasons.length === 0) return null;

  const displayReasons = isExpanded ? reasons : reasons.slice(0, 2);

  const getTranslatedReason = (rawReason: string) => {
    // This function parses the structured reason string like "validPullback|BUY"
    // and translates it using the dictionary
    const [key, ...params] = rawReason.split('|');
    
    // If it's not a translation key (e.g., from old format or direct string), return as is
    if (!(key in translations.en)) {
      return rawReason;
    }

    let translated = t(key as keyof typeof translations.en);
    
    // Replace parameters if any
    if (params.length > 0) {
      if (translated.includes("{dir}")) {
        translated = translated.replace("{dir}", params[0]);
      } else if (translated.includes("{req}")) {
        translated = translated.replace("{req}", params[0]);
      } else if (key.startsWith("confirmed")) {
        // Special case for confirmed arrays
        const translatedParams = params[0].split(',').map(p => {
          const trimmedP = p.trim();
          return t(trimmedP as keyof typeof translations.en) || p;
        });
        translated = translated + translatedParams.join(", ");
      } else if (key === "tradeFiltered") {
         translated = translated + params[0];
      }
    }
    
    return translated;
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BrainCircuit className="w-4 h-4 text-neutral-400" />
            {t('decisionLogic')}
          </div>
          {reasons.length > 2 && (
            <button 
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-xs text-neutral-500 hover:text-white flex items-center gap-1 transition-colors uppercase tracking-widest font-bold"
            >
              {isExpanded ? (
                <>{t('less')} <ChevronUp className="w-3 h-3" /></>
              ) : (
                <>{t('all')} ({reasons.length}) <ChevronDown className="w-3 h-3" /></>
              )}
            </button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-px bg-neutral-800 rounded-md overflow-hidden border border-neutral-800">
          <AnimatePresence initial={false}>
            {displayReasons.map((reason, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="flex items-start gap-3 bg-[#0f0f0f] p-3 md:p-4"
              >
                {reason.toLowerCase().includes("filtered out") || reason.toLowerCase().includes("not confirmed") || reason.toLowerCase().includes("invalidating") || reason.toLowerCase().includes("tidak terkonfirmasi") || reason.toLowerCase().includes("membatalkan") || reason.toLowerCase().includes("disaring") || reason.startsWith("unconfirmed") || reason.startsWith("tradeFiltered") || reason.startsWith("trendFilter") ? (
                  <XCircle className="w-4 h-4 md:w-5 md:h-5 text-rose-500 shrink-0 mt-0.5 md:mt-0" />
                ) : (
                  <CheckCircle2 className="w-4 h-4 md:w-5 md:h-5 text-emerald-500 shrink-0 mt-0.5 md:mt-0" />
                )}
                <span className="text-neutral-300 text-xs md:text-sm leading-relaxed">{getTranslatedReason(reason)}</span>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </CardContent>
    </Card>
  );
}