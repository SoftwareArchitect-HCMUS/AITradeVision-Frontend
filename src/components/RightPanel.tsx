import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { NewsFeed } from "./NewsFeed";
import { AIAnalysisCard } from "./AIAnalysisCard";
import { type TradingPair } from "@/types/trading";
import { Sparkles, Newspaper } from "lucide-react";

interface RightPanelProps {
  pair: TradingPair;
  isVIP: boolean;
  isOpen: boolean;
}

export function RightPanel({ pair, isVIP, isOpen }: RightPanelProps) {
  if (!isOpen) return null;

  return (
    <div className="w-[340px] border-l border-border bg-card flex flex-col h-full">
      <Tabs defaultValue="ai" className="flex flex-col h-full">
        <TabsList className="w-full rounded-none border-b border-border bg-transparent h-12 p-0">
          <TabsTrigger
            value="ai"
            className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent h-full"
          >
            <Sparkles className="h-4 w-4 mr-2" />
            AI Insights
          </TabsTrigger>
          <TabsTrigger
            value="news"
            className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent h-full"
          >
            <Newspaper className="h-4 w-4 mr-2" />
            News
          </TabsTrigger>
        </TabsList>
        <TabsContent value="ai" className="flex-1 m-0 min-h-0">
          <AIAnalysisCard pair={pair} isVIP={isVIP} />
        </TabsContent>
        <TabsContent value="news" className="flex-1 m-0 min-h-0">
          <NewsFeed />
        </TabsContent>
      </Tabs>
    </div>
  );
}
