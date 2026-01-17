import { type TradingPair } from "@/types/trading";
import { TrendingUp, TrendingDown, Lock, Sparkles, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useSymbolStore } from "@/store/useSymbolStore";
import { useAIInsights } from "@/hooks/useAIInsights";
import type { AIInsightData } from "@/services/market.service";


interface AIAnalysisCardProps {
  pair: TradingPair;
  isVIP: boolean;
}

function mapAIInsightsToAnalysis(insights: AIInsightData[]): { prediction: "UP" | "DOWN"; confidence: number; reason: string; signals: { type: "bullish" | "bearish"; description: string }[] } | null {
  if (!insights || insights.length === 0) return null;

  const latestInsight = insights[0];
  const bullishSignals = insights.filter(i => i.sentiment === 'positive').slice(0, 2);
  const bearishSignals = insights.filter(i => i.sentiment === 'negative').slice(0, 2);

  const signals = [
    ...bullishSignals.map(i => ({ type: 'bullish' as const, description: i.summary })),
    ...bearishSignals.map(i => ({ type: 'bearish' as const, description: i.summary }))
  ];

  return {
    prediction: latestInsight.prediction === 'NEUTRAL' ? 'UP' : latestInsight.prediction,
    confidence: Math.round(latestInsight.confidence),
    reason: latestInsight.reasoning,
    signals: signals.length > 0 ? signals : [
      { type: 'bullish', description: 'Analysis in progress...' },
      { type: 'bearish', description: 'Analysis in progress...' }
    ]
  };
}

export function AIAnalysisCard({ pair, isVIP }: AIAnalysisCardProps) {
  const { selectedSymbol } = useSymbolStore();
  const symbolToCheck = (selectedSymbol || pair) as TradingPair;
  const { data: insights, isLoading } = useAIInsights(symbolToCheck);

  const analysis = insights ? mapAIInsightsToAnalysis(insights) : null;

  const hasAnalysis = !!analysis;
  const isUp = analysis?.prediction === "UP";

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 p-4 border-b border-border flex-shrink-0">
        <Sparkles className="h-4 w-4 text-primary" />
        <h3 className="font-semibold">AI Analysis</h3>
        {isVIP && (
          <Crown className="h-4 w-4 text-yellow-500 ml-auto" />
        )}
      </div>

      <div className="flex-1 min-h-0 relative overflow-hidden">
        {isVIP ? (
          <div className="h-full overflow-y-auto p-4 space-y-4">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  <span className="text-sm text-muted-foreground">Loading AI analysis...</span>
                </div>
              </div>
            ) : hasAnalysis ? (
              <>
                <div
                  className={`p-4 rounded-lg border ${
                    isUp
                      ? "bg-bullish/5 border-bullish/20"
                      : "bg-bearish/5 border-bearish/20"
                  }`}
                >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-muted-foreground">Prediction</span>
                  <div
                    className={`flex items-center gap-2 font-bold text-lg px-3 py-1 rounded-md ${
                      isUp ? "text-bullish bg-bullish/10" : "text-bearish bg-bearish/10"
                    }`}
                  >
                    {isUp ? (
                      <TrendingUp className="h-5 w-5" />
                    ) : (
                      <TrendingDown className="h-5 w-5" />
                    )}
                    {analysis.prediction}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Confidence</span>
                    <span className="font-medium">{analysis.confidence}%</span>
                  </div>
                  <Progress
                    value={analysis.confidence}
                    className={`h-2 ${isUp ? "[&>div]:bg-bullish" : "[&>div]:bg-bearish"}`}
                  />
                </div>
              </div>

              <div>
                <h4 className="text-sm font-semibold mb-2">Analysis</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {analysis.reason}
                </p>
              </div>

              <div>
                <h4 className="text-sm font-semibold mb-2">Key Signals</h4>
                <div className="space-y-2">
                  {analysis.signals.map((signal, index: number) => (
                    <div
                      key={index}
                      className={`flex items-start gap-2 p-2 rounded text-sm ${
                        signal.type === "bullish"
                          ? "bg-bullish/10 text-bullish"
                          : "bg-bearish/10 text-bearish"
                      }`}
                    >
                      {signal.type === "bullish" ? (
                        <TrendingUp className="h-4 w-4 shrink-0 mt-0.5" />
                      ) : (
                        <TrendingDown className="h-4 w-4 shrink-0 mt-0.5" />
                      )}
                      <span>{signal.description}</span>
                    </div>
                  ))}
                </div>
              </div>
              </>
            ) : (
              <div className="p-4 rounded-lg border border-muted bg-muted/20">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium text-muted-foreground">No Analysis Available</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  AI analysis data is currently being processed. Please check back later.
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-6 h-full">
            <div className="p-4 rounded-full bg-secondary mb-4">
              <Lock className="h-8 w-8 text-muted-foreground" />
            </div>
            <h4 className="text-lg font-semibold mb-2 text-center">VIP Access Required</h4>
            <p className="text-sm text-muted-foreground text-center mb-4">
              Unlock AI-powered market insights and predictions
            </p>
            <Button className="bg-yellow-500 hover:bg-yellow-600 text-black font-medium">
              <Crown className="h-4 w-4 mr-2" />
              Upgrade to VIP
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
