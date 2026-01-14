import { ScrollArea } from "@/components/ui/scroll-area";
import { NewsCard } from "./NewsCard";
import { Newspaper } from "lucide-react";

interface NewsItem {
  id: string;
  title: string;
  source: string;
  sentiment: "positive" | "negative" | "neutral";
  timestamp: Date;
}

const newsData: NewsItem[] = [
  {
    id: "1",
    title: "Bitcoin ETF Inflows Surge to Record $1.2B as Institutional Interest Grows",
    source: "CoinDesk",
    sentiment: "positive",
    timestamp: new Date(Date.now() - 1000 * 60 * 30),
  },
  {
    id: "2",
    title: "Ethereum Foundation Announces Major Protocol Upgrade for Q2 2025",
    source: "Binance",
    sentiment: "positive",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
  },
  {
    id: "3",
    title: "SEC Delays Decision on Altcoin ETF Applications",
    source: "CryptoSlate",
    sentiment: "neutral",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4),
  },
  {
    id: "4",
    title: "Whale Alert: Large BTC Transfer to Unknown Wallet Raises Concerns",
    source: "Whale Alert",
    sentiment: "negative",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6),
  },
  {
    id: "5",
    title: "Major Bank Announces Crypto Custody Services for Institutional Clients",
    source: "Bloomberg",
    sentiment: "positive",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 8),
  },
  {
    id: "6",
    title: "Market Analysis: Trading Volume Remains Steady Amid Price Consolidation",
    source: "TradingView",
    sentiment: "neutral",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 12),
  },
  {
    id: "7",
    title: "Regulatory Uncertainty in Asia Pacific Region Impacts Altcoin Prices",
    source: "Reuters",
    sentiment: "negative",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 18),
  },
  {
    id: "8",
    title: "DeFi Protocol TVL Reaches New All-Time High of $150B",
    source: "DeFi Llama",
    sentiment: "positive",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
  },
];

export function NewsFeed() {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 p-4 border-b border-border">
        <Newspaper className="h-4 w-4 text-muted-foreground" />
        <h3 className="font-semibold">Latest News</h3>
      </div>
      <ScrollArea className="flex-1">
        {newsData.map((news) => (
          <NewsCard key={news.id} news={news} />
        ))}
      </ScrollArea>
    </div>
  );
}

