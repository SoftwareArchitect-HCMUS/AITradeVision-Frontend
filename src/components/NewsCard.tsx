import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";

interface NewsItem {
  id: string;
  title: string;
  source: string;
  timestamp: Date;
  summary?: string;
  fullText: string;
  url: string;
}

interface NewsCardProps {
  news: NewsItem;
  onClick?: (news: NewsItem) => void;
}

export function NewsCard({ news, onClick }: NewsCardProps) {
  const timeAgo = formatDistanceToNow(news.timestamp, { addSuffix: true });

  return (
    <div
      className="p-3 border-b border-border hover:bg-secondary/50 transition-colors cursor-pointer"
      onClick={() => onClick?.(news)}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <Badge variant="secondary" className="text-xs shrink-0">
          {news.source}
        </Badge>
      </div>
      <h4 className="text-sm font-medium leading-snug line-clamp-2 mb-2">
        {news.title}
      </h4>
      <p className="text-xs text-muted-foreground">{timeAgo}</p>
    </div>
  );
}

