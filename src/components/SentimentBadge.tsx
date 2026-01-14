interface SentimentBadgeProps {
  sentiment: "positive" | "negative" | "neutral";
}

const sentimentConfig = {
  positive: {
    label: "Positive",
    className: "bg-primary/20 text-primary border-primary/30",
  },
  negative: {
    label: "Negative",
    className: "bg-destructive/20 text-destructive border-destructive/30",
  },
  neutral: {
    label: "Neutral",
    className: "bg-muted text-muted-foreground border-border",
  },
};

export function SentimentBadge({ sentiment }: SentimentBadgeProps) {
  const config = sentimentConfig[sentiment];

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${config.className}`}
    >
      {config.label}
    </span>
  );
}

