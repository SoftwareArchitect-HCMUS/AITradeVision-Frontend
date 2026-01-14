import { SentimentBadge } from "./SentimentBadge";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";

interface NewsItem {
  id: string;
  title: string;
  source: string;
  sentiment: "positive" | "negative" | "neutral";
  timestamp: Date;
}

interface NewsCardProps {
  news: NewsItem;
}

export function NewsCard({ news }: NewsCardProps) {
  const timeAgo = formatDistanceToNow(news.timestamp, { addSuffix: true });

  return (
    <div className="p-3 border-b border-border hover:bg-secondary/50 transition-colors cursor-pointer">
      <div className="flex items-start justify-between gap-2 mb-2">
        <Badge variant="secondary" className="text-xs shrink-0">
          {news.source}
        </Badge>
        <SentimentBadge sentiment={news.sentiment} />
      </div>
      <h4 className="text-sm font-medium leading-snug line-clamp-2 mb-2">
        {news.title}
      </h4>
      <p className="text-xs text-muted-foreground">{timeAgo}</p>
    </div>
  );
}

