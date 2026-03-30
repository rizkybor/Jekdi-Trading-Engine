import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Lightbulb, TrendingUp, AlertTriangle, ShieldCheck, Ban } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { DecisionResult } from "@/lib/engine/types";

export function RecommendationCard({ data }: { data: DecisionResult }) {
  const { t } = useLanguage();
  const { signal } = data;

  const getIcon = () => {
    switch (signal) {
      case "BUY":
        return <TrendingUp className="w-5 h-5 text-emerald-500" />;
      case "SELL":
        return <AlertTriangle className="w-5 h-5 text-rose-500" />;
      case "HOLD":
        return <ShieldCheck className="w-5 h-5 text-amber-500" />;
      case "NO TRADE":
      default:
        return <Ban className="w-5 h-5 text-neutral-500" />;
    }
  };

  const getMessage = () => {
    switch (signal) {
      case "BUY":
        return t("recBuy");
      case "SELL":
        return t("recSell");
      case "HOLD":
        return t("recHold");
      case "NO TRADE":
      default:
        return t("recNoTrade");
    }
  };

  const getBgColor = () => {
    switch (signal) {
      case "BUY":
        return "bg-emerald-500/10 border-emerald-500/20";
      case "SELL":
        return "bg-rose-500/10 border-rose-500/20";
      case "HOLD":
        return "bg-amber-500/10 border-amber-500/20";
      case "NO TRADE":
      default:
        return "bg-neutral-800/50 border-neutral-700/50";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="w-4 h-4 text-neutral-400" />
          {t("recommendationTitle")}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className={`flex gap-3 md:gap-4 p-3 md:p-4 rounded-md border ${getBgColor()} transition-colors`}>
          <div className="shrink-0 mt-0.5">
            {getIcon()}
          </div>
          <p className="text-xs md:text-sm text-neutral-300 leading-relaxed">
            {getMessage()}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}