"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { BrainCircuit, ChevronDown, ChevronUp, CheckCircle2, XCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";

export function ReasoningPanel({ reasons }: { reasons: string[] }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { t } = useLanguage();
  
  if (!reasons || reasons.length === 0) return null;

  const displayReasons = isExpanded ? reasons : reasons.slice(0, 2);

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
                className="flex items-start gap-3 bg-[#0f0f0f] p-3"
              >
                {reason.toLowerCase().includes("filtered out") || reason.toLowerCase().includes("not confirmed") || reason.toLowerCase().includes("invalidating") ? (
                  <XCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                ) : (
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                )}
                <span className="text-neutral-300 text-sm leading-relaxed">{reason}</span>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </CardContent>
    </Card>
  );
}