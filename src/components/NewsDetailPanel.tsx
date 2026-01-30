import { X, ExternalLink, TrendingUp, TrendingDown, Brain, Sparkles, Lock, Crown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import { useEffect } from "react";
import { ScrollArea } from "./ui/scroll-area";
import { useAIInsightsByNews } from "@/hooks/useLatestAIInsights";
import { Progress } from "@/components/ui/progress";
import { useAuthStore } from "@/store/useAuthStore";
import { useVIPModalStore } from "@/store/useVIPModalStore";

interface NewsItem {
  id: string;
  title: string;
  source: string;
  timestamp: Date;
  summary?: string;
  fullText: string;
  url: string;
}

interface NewsDetailPanelProps {
  news: NewsItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export function NewsDetailPanel({ news, isOpen, onClose }: NewsDetailPanelProps) {
  const { user } = useAuthStore();
  const { openModal } = useVIPModalStore();
  const isVIP = user?.isVip ?? false;
  
  // Fetch AI insights for this news article
  const newsId = news ? parseInt(news.id, 10) : null;
  const { data: aiInsights, isLoading: insightsLoading } = useAIInsightsByNews(newsId);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  if (!isOpen || !news) return null;

  const timeAgo = formatDistanceToNow(news.timestamp, { addSuffix: true });

  const openSource = () => {
    window.open(news.url, '_blank', 'noopener,noreferrer');
  };

  const hasInsights = aiInsights && aiInsights.length > 0;
  const latestInsight = hasInsights ? aiInsights[0] : null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div
        className="absolute inset-0 bg-black/20 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative w-full sm:w-[520px] h-full bg-card border-l border-border shadow-2xl transform transition-transform duration-300 ease-in-out translate-x-0">
        <div className="flex flex-col h-full">
          <div className="flex items-start justify-between p-6 border-b border-border">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="secondary" className="text-xs shrink-0">
                  {news.source}
                </Badge>
                <span className="text-xs text-muted-foreground">{timeAgo}</span>
              </div>
              <h2 className="text-lg font-semibold leading-tight text-foreground pr-8">
                {news.title}
              </h2>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="shrink-0 h-8 w-8 p-0 hover:bg-secondary"
              onClick={onClose}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <ScrollArea className="flex-1 p-6">
            {/* AI Insights Section */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-4">
                <Brain className="h-4 w-4 text-primary" />
                <h3 className="font-semibold text-sm">AI Analysis</h3>
                {!isVIP && <Lock className="h-3 w-3 text-muted-foreground ml-auto" />}
              </div>

              {isVIP ? (
                insightsLoading ? (
                  <div className="p-4 border border-border rounded-lg bg-secondary/20">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                      <span className="text-sm text-muted-foreground">Analyzing with AI...</span>
                    </div>
                  </div>
                ) : hasInsights && latestInsight ? (
                  <div className="p-4 border border-border rounded-lg bg-secondary/10">
                    {/* Prediction */}
                    <div className={`flex items-center justify-between p-3 rounded-lg mb-3 ${
                      latestInsight.prediction === 'UP' 
                        ? 'bg-bullish/10 border border-bullish/20' 
                        : latestInsight.prediction === 'DOWN'
                        ? 'bg-bearish/10 border border-bearish/20'
                        : 'bg-secondary/20 border border-border'
                    }`}>
                      <div className="flex items-center gap-2">
                        {latestInsight.prediction === 'UP' ? (
                          <TrendingUp className="h-5 w-5 text-bullish" />
                        ) : latestInsight.prediction === 'DOWN' ? (
                          <TrendingDown className="h-5 w-5 text-bearish" />
                        ) : (
                          <Sparkles className="h-5 w-5 text-muted-foreground" />
                        )}
                        <span className={`font-bold ${
                          latestInsight.prediction === 'UP' ? 'text-bullish' :
                          latestInsight.prediction === 'DOWN' ? 'text-bearish' :
                          'text-muted-foreground'
                        }`}>
                          {latestInsight.prediction}
                        </span>
                      </div>
                      <Badge variant={
                        latestInsight.sentiment === 'positive' ? 'default' :
                        latestInsight.sentiment === 'negative' ? 'destructive' :
                        'secondary'
                      }>
                        {latestInsight.sentiment}
                      </Badge>
                    </div>

                    {/* Confidence */}
                    <div className="mb-3">
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-muted-foreground">Confidence</span>
                        <span className="font-medium">{Math.round(latestInsight.confidence)}%</span>
                      </div>
                      <Progress 
                        value={latestInsight.confidence} 
                        className={`h-2 ${
                          latestInsight.prediction === 'UP' ? '[&>div]:bg-bullish' :
                          latestInsight.prediction === 'DOWN' ? '[&>div]:bg-bearish' :
                          ''
                        }`}
                      />
                    </div>

                    {/* Summary & Reasoning */}
                    <div className="space-y-2">
                      <p className="text-sm text-foreground">{latestInsight.summary}</p>
                      <p className="text-xs text-muted-foreground italic">{latestInsight.reasoning}</p>
                    </div>

                    {/* Symbol */}
                    <div className="mt-3 pt-3 border-t border-border">
                      <Badge variant="outline" className="text-xs">
                        {latestInsight.symbol}
                      </Badge>
                    </div>
                  </div>
                ) : (
                    <div className="p-4 border border-border rounded-lg bg-secondary/5 text-sm text-muted-foreground italic">
                        No AI analysis currently available for this news item.
                    </div>
                )
              ) : (
                <div className="p-6 border border-dashed border-border rounded-lg bg-secondary/10 flex flex-col items-center text-center">
                  <div className="p-3 rounded-full bg-secondary mb-3">
                    <Lock className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <h4 className="text-sm font-bold mb-1">VIP Feature</h4>
                  <p className="text-xs text-muted-foreground mb-4">
                    Upgrade to VIP to see AI-driven sentiment and market impact analysis.
                  </p>
                  <Button 
                    size="sm" 
                    onClick={openModal}
                    className="bg-gradient-to-r from-yellow-500 to-amber-500 text-black font-bold h-8 px-4"
                  >
                    <Crown className="h-3 w-3 mr-1.5" />
                    Unlock Now
                  </Button>
                </div>
              )}
            </div>

            {/* News Summary */}
            {news.summary && (
              <div className="mb-6">
                <h3 className="font-semibold text-sm mb-2">Summary</h3>
                <p className="text-sm text-muted-foreground leading-relaxed font-medium">
                    {news.summary}
                </p>
              </div>
            )}

            {/* Full Text */}
            <div className="prose prose-sm max-w-none text-foreground border-t border-border pt-6">
              {news.fullText.split('\n\n').map((paragraph, index) => (
                <p key={index} className="mb-4 leading-relaxed last:mb-0">
                  {paragraph.trim()}
                </p>
              ))}
            </div>
          </ScrollArea>

          <div className="p-6 border-t border-border bg-card">
            <Button
              onClick={openSource}
              className="w-full gap-2 font-medium"
              variant="default"
            >
              <ExternalLink className="h-4 w-4" />
              Open Full Article
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
