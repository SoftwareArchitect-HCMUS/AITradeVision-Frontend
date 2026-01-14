import { type TradingPair } from "@/types/trading";
import { TrendingUp, TrendingDown, Lock, Sparkles, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";

interface AIAnalysis {
  prediction: "UP" | "DOWN";
  confidence: number;
  reason: string;
  signals: {
    type: "bullish" | "bearish";
    description: string;
  }[];
}

const aiAnalysis: Record<TradingPair, AIAnalysis> = {
  "BTC/USDT": {
    prediction: "UP",
    confidence: 85,
    reason:
      "Strong institutional accumulation detected over the past 72 hours. On-chain metrics show decreasing exchange reserves indicating holding behavior. Combined with positive ETF inflow data and favorable macroeconomic conditions, the short-term outlook appears bullish.",
    signals: [
      { type: "bullish", description: "Whale accumulation: +2,400 BTC moved to cold storage" },
      { type: "bullish", description: "Exchange reserves at 6-month low" },
      { type: "bullish", description: "Positive funding rates indicate bullish sentiment" },
      { type: "bearish", description: "RSI approaching overbought territory (68)" },
    ],
  },
  "ETH/USDT": {
    prediction: "UP",
    confidence: 72,
    reason:
      "Ethereum showing strength relative to Bitcoin with improving ETH/BTC ratio. Layer 2 activity continues to grow, and upcoming protocol upgrades are generating positive sentiment. However, some caution warranted due to high gas fees impacting retail participation.",
    signals: [
      { type: "bullish", description: "ETH/BTC ratio recovering from key support" },
      { type: "bullish", description: "L2 TVL growth accelerating (+15% weekly)" },
      { type: "bearish", description: "Gas fees remain elevated above 50 gwei" },
      { type: "bullish", description: "Staking rate continues upward trend" },
    ],
  },
  "SOL/USDT": {
    prediction: "DOWN",
    confidence: 61,
    reason:
      "Solana facing near-term headwinds despite strong ecosystem growth. Recent network congestion issues and profit-taking after significant gains suggest a potential pullback. Key support levels should be monitored closely.",
    signals: [
      { type: "bearish", description: "Network congestion reported in past 48 hours" },
      { type: "bearish", description: "Large unlock event scheduled this month" },
      { type: "bullish", description: "DEX volume remains strong" },
      { type: "bearish", description: "Profit-taking observed at resistance level" },
    ],
  },
};

interface AIAnalysisCardProps {
  pair: TradingPair;
  isVIP: boolean;
}

export function AIAnalysisCard({ pair, isVIP }: AIAnalysisCardProps) {
  const analysis = aiAnalysis[pair];
  const isUp = analysis.prediction === "UP";

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 p-4 border-b border-border">
        <Sparkles className="h-4 w-4 text-primary" />
        <h3 className="font-semibold">AI Analysis</h3>
        {isVIP && (
          <Crown className="h-4 w-4 text-yellow-500 ml-auto" />
        )}
      </div>

      <div className="flex-1 relative">
        {!isVIP && (
          <div className="absolute inset-0 z-10 backdrop-blur-md bg-background/50 flex flex-col items-center justify-center p-6">
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

        <ScrollArea className="h-full">
          <div className="p-4 space-y-4">
            <div
              className={`p-4 rounded-lg border ${
                isUp
                  ? "bg-primary/10 border-primary/30"
                  : "bg-destructive/10 border-destructive/30"
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-muted-foreground">Prediction</span>
                <div
                  className={`flex items-center gap-2 font-bold text-lg ${
                    isUp ? "text-primary" : "text-destructive"
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
                  className={`h-2 ${isUp ? "[&>div]:bg-primary" : "[&>div]:bg-destructive"}`}
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
                {analysis.signals.map((signal, index) => (
                  <div
                    key={index}
                    className={`flex items-start gap-2 p-2 rounded text-sm ${
                      signal.type === "bullish"
                        ? "bg-primary/10 text-primary"
                        : "bg-destructive/10 text-destructive"
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
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
