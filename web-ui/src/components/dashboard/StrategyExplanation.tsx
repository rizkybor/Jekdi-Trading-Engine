import { StrategyType } from "@/types";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { BookOpen, ArrowUpRight, GitPullRequest, ArrowRight } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export function StrategyExplanation({ strategy }: { strategy: StrategyType }) {
  const { t } = useLanguage();

  if (!strategy) return null;

  const content = {
    pullback: {
      title: t('pullbackTitle'),
      desc: t('pullbackDesc'),
      icon: GitPullRequest,
      color: "text-blue-400"
    },
    breakout: {
      title: t('breakoutTitle'),
      desc: t('breakoutDesc'),
      icon: ArrowUpRight,
      color: "text-purple-400"
    },
    continuation: {
      title: t('continuationTitle'),
      desc: t('continuationDesc'),
      icon: ArrowRight,
      color: "text-emerald-400"
    }
  };

  const activeStrategy = content[strategy];

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-neutral-400" />
          {t('strategyInsight')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-3 bg-[#0f0f0f] p-4 rounded-md border border-neutral-800">
          <div className="flex items-center gap-2">
            <div className={`p-1.5 rounded-sm bg-neutral-900 border border-neutral-800 ${activeStrategy.color}`}>
              <activeStrategy.icon className="w-4 h-4" />
            </div>
            <h4 className="font-bold text-white uppercase tracking-wider text-sm">{activeStrategy.title}</h4>
          </div>
          <p className="text-sm text-neutral-400 leading-relaxed">
            {activeStrategy.desc}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}