import { X, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import { useEffect } from "react";

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
  if (!isOpen || !news) return null;

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  const timeAgo = formatDistanceToNow(news.timestamp, { addSuffix: true });

  const openSource = () => {
    window.open(news.url, '_blank', 'noopener,noreferrer');
  };

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

          <div className="flex-1 overflow-y-auto p-6">
            {news.summary && (
              <p className="text-sm text-muted-foreground leading-relaxed mb-4 font-medium">
                {news.summary}
              </p>
            )}

            <div className="prose prose-sm max-w-none text-foreground">
              {news.fullText.split('\n\n').map((paragraph, index) => (
                <p key={index} className="mb-4 leading-relaxed last:mb-0">
                  {paragraph.trim()}
                </p>
              ))}
            </div>
          </div>

          <div className="p-6 border-t border-border bg-secondary/20">
            <Button
              onClick={openSource}
              className="w-full gap-2"
              variant="default"
            >
              <ExternalLink className="h-4 w-4" />
              Open Source
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
